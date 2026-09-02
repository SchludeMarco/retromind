import { ChatMessage } from "../types";

// Thin client for the /api/gemini serverless proxy. The API key lives on the
// server only; this module never sees it.

export type AiAvailability = "available" | "not_configured" | "unknown";

interface ApiError extends Error {
  code?: string;
}

async function callApi(action: string, payload?: unknown): Promise<any> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || `API-Fehler ${res.status}`) as ApiError;
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

export interface ImageAnalysisResult {
  text: string;
  ok: boolean;
}

export async function analyzeMemoryImage(
  imageBase64: string,
  mimeType: string
): Promise<ImageAnalysisResult> {
  try {
    const { text } = await callApi("analyzeImage", { imageBase64, mimeType });
    return (text as string)
      ? { text: text as string, ok: true }
      : { text: "Ich konnte dieses Bild leider nicht beschreiben.", ok: false };
  } catch (e) {
    const message =
      (e as ApiError).code === "not_configured"
        ? "Die Bildanalyse ist in diesem Demo nicht aktiv (kein Server-Schlüssel)."
        : "Die Bildanalyse ist gerade fehlgeschlagen. Versuch es später noch einmal.";
    return { text: message, ok: false };
  }
}

export async function sendChatMessage(history: ChatMessage[]): Promise<string> {
  const { text } = await callApi("chat", { history });
  return (text as string) || "";
}

export interface VeoResult {
  url?: string;
  error?: "not_configured" | "timeout" | "failed";
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
    return { error: (e as ApiError).code === "not_configured" ? "not_configured" : "failed" };
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
