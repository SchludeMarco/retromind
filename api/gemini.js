import { GoogleGenAI } from "@google/genai";

// Server-side proxy for all Gemini / Veo calls. The API key lives only here
// (Vercel env var GEMINI_API_KEY) and never reaches the browser.

const MODELS = {
  question: "gemini-flash-lite-latest",
  vision: "gemini-2.5-flash",
  chat: "gemini-2.5-flash",
  veo: "veo-3.1-fast-generate-preview",
};

// Every prompt exists in American English (the default) and German; the
// client sends the visitor's language as `lang` ("en" | "de", see
// lib/i18n.ts) so generated content comes back in the same language.

const CHAT_SYSTEM_EN =
  "You are a warm, nostalgic companion on a journey through memories. " +
  "Reply briefly (2-4 sentences), with empathy, speaking to the user as \"you\". Feel free to ask a gentle follow-up question.";

const CHAT_SYSTEM =
  "Du bist ein warmherziger, nostalgischer Begleiter auf einer Erinnerungsreise. " +
  "Antworte kurz (2-4 Sätze), einfühlsam und im Du. Stelle gern eine sanfte Rückfrage.";

// Persona for "RetroMind – Gaming": a game-shop clerk who has seen it all, from
// 80s cartridges to today's overlooked gems.
const GAMING_CHAT_SYSTEM =
  "Du bist der Retro-Guru, ein begeisterter Videospiel-Experte aus der Zeit von " +
  "Modulen, Disketten und Spielezeitschriften, der aber auch die Gegenwart kennt. Du hilfst, " +
  "vergessene und unterschätzte Spiele von den 1980ern bis heute wiederzuentdecken: Empfehlungen, Tipps, Cheats, Geschichte und wie man sie heute legal " +
  "spielen kann (Neuauflagen, Sammlungen, offizielle Stores). Antworte im Du, kurz (2-5 Sätze), " +
  "mit nostalgischem Augenzwinkern. Sprich wie ein Zocker, der seit den 80ern dabei ist, und streu " +
  "dosiert Gamer-Slang aus allen Epochen ein (80er: geil, ätzend, tote Hose; 90er: krass, fett, Digga; " +
  "2000er: Noob, epic fail, GG, imba; heute: no cap, lowkey, goated, cringe), höchstens zwei Slangwörter " +
  "pro Antwort, damit alles verständlich bleibt. Erfinde keine Fakten; sag ehrlich, wenn du dir unsicher bist. " +
  "Verlinke oder empfiehl keine illegalen ROM-Downloads.";

const GAMING_CHAT_SYSTEM_EN =
  "You are the Retro Guru, an enthusiastic video game expert from the days of " +
  "cartridges, floppy disks and gaming magazines, who also knows today's scene. You help people " +
  "rediscover forgotten and underrated games from the 1980s to today: recommendations, tips, cheats, history and how to play them " +
  "legally today (re-releases, collections, official stores). Reply in American English, briefly (2-5 sentences), " +
  "with a nostalgic wink. Talk like a gamer who has been around since the 80s and sprinkle in " +
  "a little gamer slang from every era (80s: rad, gnarly, bogus; 90s: da bomb, phat, booyah; " +
  "2000s: noob, epic fail, GG, OP; today: no cap, lowkey, goated, cringe), at most two slang words " +
  "per answer so everything stays easy to understand. Don't make up facts; say honestly when you're unsure. " +
  "Never link to or recommend illegal ROM downloads.";

const clip = (v, n) => String(v ?? "").slice(0, n);

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const ai = getAI();
  if (!ai) {
    res.status(503).json({
      error: "not_configured",
      message:
        "This demo runs without a server key, so the AI features are turned off here.",
    });
    return;
  }

  const { action, payload = {}, lang } = await readJsonBody(req);
  const de = lang === "de";

  try {
    switch (action) {
      case "ping":
        return res.status(200).json({ ok: true });

      case "deepQuestion": {
        const { term, name, interests, decade } = payload;
        const r = await ai.models.generateContent({
          model: MODELS.question,
          contents: de
            ? `Handle als einfühlsamer Biografie-Begleiter. Erstelle EINE ` +
            `hochgradig persönliche Frage für ${name || "die Person"}, um eine ` +
            `konkrete Kindheitserinnerung zu wecken.\n` +
            `Begriff: "${term}"\nJahrzehnt: ${decade}er Jahre\n` +
            `Interessen: ${interests || "allgemein"}\n\n` +
            `Die Frage nimmt direkt auf "${term}" Bezug, regt dazu an, ein ` +
            `Detail, einen Geruch, ein Geräusch oder Gefühl zu beschreiben, ist ` +
            `im Du formuliert und nostalgisch. Antworte NUR mit der Frage.`
            : `Act as an empathetic biography companion. Write ONE ` +
            `highly personal question for ${name || "the person"} to bring back a ` +
            `specific childhood memory.\n` +
            `Term: "${term}"\nDecade: the ${decade}s\n` +
            `Interests: ${interests || "general"}\n\n` +
            `The question refers directly to "${term}", invites them to describe a ` +
            `detail, a smell, a sound or a feeling, speaks to them as "you" ` +
            `and is nostalgic. Write it in American English. Reply ONLY with the question.`,
        });
        return res.status(200).json({ text: (r.text || "").trim() });
      }

      case "perspectiveQuestion": {
        const { term, name, decade, originalAnswer } = payload;
        const r = await ai.models.generateContent({
          model: MODELS.question,
          contents: de
            ? `Handle als einfühlsamer Biografie-Begleiter. ${name || "Die Person"} hat ` +
            `gerade eine Kindheitserinnerung zum Begriff "${term}" (${decade}er Jahre) ` +
            `festgehalten` +
            (originalAnswer ? `:\n"${originalAnswer}"\n\n` : ".\n\n") +
            `Erstelle EINE Frage, die dazu einlädt, denselben Moment aus der Sicht einer ` +
            `anderen Person von damals neu zu erzählen (z. B. beste Freundin/bester Freund, ` +
            `Geschwister oder Elternteil) – wie hätte diese Person die Szene wohl erlebt oder ` +
            `beschrieben? Die Frage ist im Du formuliert, konkret und nostalgisch. ` +
            `Antworte NUR mit der Frage.`
            : `Act as an empathetic biography companion. ${name || "The person"} has ` +
            `just written down a childhood memory about "${term}" (the ${decade}s)` +
            (originalAnswer ? `:\n"${originalAnswer}"\n\n` : ".\n\n") +
            `Write ONE question that invites them to retell the same moment from the point of view of ` +
            `another person from back then (e.g. their best friend, a sibling or a parent): how would ` +
            `that person have experienced or described the scene? The question speaks to them as "you", ` +
            `is specific and nostalgic, and is written in American English. Reply ONLY with the question.`,
        });
        return res.status(200).json({ text: (r.text || "").trim() });
      }

      case "analyzeImage": {
        const { imageBase64, mimeType } = payload;
        if (!imageBase64) return res.status(400).json({ error: "no_image" });
        const r = await ai.models.generateContent({
          model: MODELS.vision,
          contents: {
            parts: [
              { inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } },
              {
                text: de
                  ? "Analysiere dieses alte Foto einfühlsam und nostalgisch. Was ist zu " +
                    "sehen? Beschreibe Atmosphäre und Details und schätze vorsichtig die " +
                    "Zeitperiode. 4-6 Sätze, im Du."
                  : "Look at this old photo with empathy and nostalgia. What can you " +
                    "see? Describe the atmosphere and details and carefully estimate the " +
                    "time period. 4-6 sentences in American English, speaking to the viewer as \"you\".",
              },
            ],
          },
        });
        return res.status(200).json({ text: r.text || "" });
      }

      case "chat": {
        const history = Array.isArray(payload.history) ? payload.history : [];
        const contents = history
          .filter((m) => m && typeof m.text === "string")
          .map((m) => ({
            role: m.role === "model" ? "model" : "user",
            parts: [{ text: m.text }],
          }));
        if (!contents.length) return res.status(400).json({ error: "empty_history" });
        const r = await ai.models.generateContent({
          model: MODELS.chat,
          contents,
          config: {
            systemInstruction:
              payload.persona === "gaming"
                ? de ? GAMING_CHAT_SYSTEM : GAMING_CHAT_SYSTEM_EN
                : de ? CHAT_SYSTEM : CHAT_SYSTEM_EN,
          },
        });
        return res.status(200).json({ text: r.text || "" });
      }

      case "gameGuide": {
        const title = clip(payload.title, 120);
        if (!title) return res.status(400).json({ error: "no_title" });
        const platform = clip(payload.platform, 40);
        const year = clip(payload.year, 4);
        // Grounded in Google Search so tips come from real guides and fan pages
        // rather than the model's memory; sources are passed back for display.
        const r = await ai.models.generateContent({
          model: MODELS.chat,
          contents: de
            ? `Erstelle einen kompakten deutschsprachigen Spieleguide zu "${title}" ` +
            `(${platform || "Plattform unbekannt"}, ${year || "Jahr unbekannt"}). ` +
            `Gliedere exakt in diese Abschnitte mit Markdown-Überschriften (##):\n` +
            `## Worum geht's\n## Einstiegstipps\n## Geheimnisse & Cheats\n## Heute spielen\n` +
            `Nutze kurze Stichpunkte (- ). Unter "Heute spielen" nur legale Wege nennen ` +
            `(Neuauflagen, Sammlungen, offizielle Stores, Originalhardware). ` +
            `Erfinde nichts; wenn du etwas nicht sicher weißt, lass es weg.`
            : `Write a compact game guide in American English for "${title}" ` +
            `(${platform || "platform unknown"}, ${year || "year unknown"}). ` +
            `Structure it exactly into these sections with Markdown headings (##):\n` +
            `## What it's about\n## Getting started\n## Secrets & cheats\n## Playing it today\n` +
            `Use short bullet points (- ). Under "Playing it today" only name legal ways ` +
            `(re-releases, collections, official stores, original hardware). ` +
            `Don't make anything up; if you're not sure about something, leave it out.`,
          config: { tools: [{ googleSearch: {} }] },
        });
        const meta = r.candidates?.[0]?.groundingMetadata;
        const seen = new Set();
        const sources = (meta?.groundingChunks || [])
          .map((c) => c.web)
          .filter((w) => w?.uri && !seen.has(w.uri) && seen.add(w.uri))
          .slice(0, 8)
          .map((w) => ({ uri: w.uri, title: w.title || w.uri }));
        return res.status(200).json({
          text: r.text || "",
          sources,
          searchWidget: meta?.searchEntryPoint?.renderedContent,
        });
      }

      case "veoStart": {
        const { prompt, imageBase64, mimeType } = payload;
        const operation = await ai.models.generateVideos({
          model: MODELS.veo,
          prompt: prompt || "A nostalgic, atmospheric video with gentle motion.",
          image: imageBase64
            ? { imageBytes: imageBase64, mimeType: mimeType || "image/png" }
            : undefined,
          config: { numberOfVideos: 1, resolution: "720p", aspectRatio: "16:9" },
        });
        return res.status(200).json({ operation });
      }

      case "veoPoll": {
        const { operation } = payload;
        if (!operation) return res.status(400).json({ error: "no_operation" });
        const op = await ai.operations.getVideosOperation({ operation });
        if (!op.done) return res.status(200).json({ done: false, operation: op });
        const uri = op.response?.generatedVideos?.[0]?.video?.uri;
        if (!uri) return res.status(200).json({ done: true, error: "no_video" });
        return res.status(200).json({ done: true, videoUri: uri });
      }

      default:
        return res.status(400).json({ error: "unknown_action" });
    }
  } catch (e) {
    console.error("gemini api error:", action, e?.message || e);
    return res
      .status(502)
      .json({
        error: "upstream",
        message: de ? "Die KI-Anfrage ist fehlgeschlagen." : "The AI request failed.",
      });
  }
}
