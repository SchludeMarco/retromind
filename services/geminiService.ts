import { ChatMessage } from "../types";
import { LANG, tr } from "../lib/i18n";
import { loadSession } from "../lib/session";

// Thin client for the /api/gemini serverless proxy. The API key lives on the
// server only; this module never sees it.

export type AiAvailability = "available" | "not_configured" | "unknown";

interface ApiError extends Error {
  code?: string;
}

/** Age in years from the birthday the visitor gave (null when unknown). */
function ageOf(birthDate: string | undefined): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate || "");
  if (!m) return null;
  const now = new Date();
  let age = now.getFullYear() - Number(m[1]);
  const month = now.getMonth() + 1;
  if (month < Number(m[2]) || (month === Number(m[2]) && now.getDate() < Number(m[3]))) age--;
  return age;
}

// Google's Gemini API terms only allow people aged 18 and over. The Zeitreise
// knows the birthday, so for younger visitors the AI simply stays off.
export function aiTooYoung(): boolean {
  const age = ageOf(loadSession().user?.birthDate);
  return age !== null && age < 18;
}

async function callApi(action: string, payload?: unknown): Promise<any> {
  if (aiTooYoung()) {
    const err = new Error(
      tr(
        "The AI features (Google Gemini) are only for people aged 18 and over.",
        "Die KI-Funktionen (Google Gemini) gibt es erst ab 18 Jahren."
      )
    ) as ApiError;
    err.code = "under_18";
    throw err;
  }
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload, lang: LANG }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || tr(`API error ${res.status}`, `API-Fehler ${res.status}`)) as ApiError;
    err.code = data?.error;
    throw err;
  }
  return data;
}

export async function getAiAvailability(): Promise<AiAvailability> {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ping" }),
    });
    if (res.status === 503) return "not_configured";
    if (res.ok) return "available";
    return "unknown";
  } catch {
    return "unknown";
  }
}

export async function generateDeepQuestion(
  term: string,
  name: string,
  interests: string,
  decade: string,
  fallback: string
): Promise<string> {
  try {
    const { text } = await callApi("deepQuestion", { term, name, interests, decade });
    return (text as string)?.trim() || fallback;
  } catch (e) {
    console.warn("deepQuestion failed:", e);
    return fallback;
  }
}

export async function generatePerspectiveQuestion(
  term: string,
  name: string,
  decade: string,
  originalAnswer: string,
  fallback: string
): Promise<string> {
  try {
    const { text } = await callApi("perspectiveQuestion", { term, name, decade, originalAnswer });
    return (text as string)?.trim() || fallback;
  } catch (e) {
    console.warn("perspectiveQuestion failed:", e);
    return fallback;
  }
}

export async function analyzeMemoryImage(
  imageBase64: string,
  mimeType: string
): Promise<string> {
  try {
    const { text } = await callApi("analyzeImage", { imageBase64, mimeType });
    return (text as string) || tr("Sorry, I couldn't describe this picture.", "Ich konnte dieses Bild leider nicht beschreiben.");
  } catch (e) {
    if ((e as ApiError).code === "under_18") return (e as Error).message;
    if ((e as ApiError).code === "not_configured") {
      return tr(
        "Photo analysis isn't active in this demo (no server key).",
        "Die Bildanalyse ist in diesem Demo nicht aktiv (kein Server-Schlüssel)."
      );
    }
    return tr(
      "Photo analysis just failed. Please try again later.",
      "Die Bildanalyse ist gerade fehlgeschlagen. Versuch es später noch einmal."
    );
  }
}

export async function sendChatMessage(history: ChatMessage[]): Promise<string> {
  const { text } = await callApi("chat", { history });
  return (text as string) || "";
}

export interface VeoResult {
  url?: string;
  error?: "not_configured" | "timeout" | "failed" | "under_18";
}

// Starts a Veo generation and polls until it is done (or ~10 min pass).
export async function generateVeoVideo(
  prompt: string,
  imageBase64?: string,
  mimeType?: string
): Promise<VeoResult> {
  let started: any;
  try {
    started = await callApi("veoStart", { prompt, imageBase64, mimeType });
  } catch (e) {
    const code = (e as ApiError).code;
    return { error: code === "not_configured" || code === "under_18" ? code : "failed" };
  }

  let operation = started.operation;
  const MAX_POLLS = 60;
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, 10000));
    let poll: any;
    try {
      poll = await callApi("veoPoll", { operation });
    } catch {
      return { error: "failed" };
    }
    if (poll.done) {
      if (poll.videoUri) return { url: `/api/video?uri=${encodeURIComponent(poll.videoUri)}` };
      return { error: "failed" };
    }
    operation = poll.operation;
  }
  return { error: "timeout" };
}

export interface HeroCandidate {
  name: string;
  wikiTitle: string;
  why: string;
}

/** "Heroes of your youth": turns a name or a fuzzy description into
 *  English Wikipedia titles (checked against Wikipedia by lib/heroes.ts). */
export async function searchHeroesAi(query: string, decade: string): Promise<HeroCandidate[]> {
  const { candidates } = await callApi("heroSearch", { query, decade });
  return Array.isArray(candidates) ? candidates : [];
}

/** Fresh entries for the start-page ticker once all the hand-written ones ran (lib/tickerFeed.ts). */
export async function fetchTickerMore(decade: string, recent: string[]): Promise<{ decade?: string; kind?: string; text?: string; info?: string }[]> {
  const { items } = await callApi("tickerMore", { app: "zeitreise", decade, recent });
  return Array.isArray(items) ? items : [];
}
