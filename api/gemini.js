import { GoogleGenAI } from "@google/genai";

// Server-side proxy for all Gemini / Veo calls. The API key lives only here
// (Vercel env var GEMINI_API_KEY) and never reaches the browser.

const MODELS = {
  question: "gemini-flash-lite-latest",
  vision: "gemini-2.5-flash",
  chat: "gemini-2.5-flash",
  veo: "veo-3.1-fast-generate-preview",
};

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
  "mit nostalgischem Augenzwinkern. Erfinde keine Fakten; sag ehrlich, wenn du dir unsicher bist. " +
  "Verlinke oder empfiehl keine illegalen ROM-Downloads.";

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
        "Dieses Demo läuft ohne Server-Schlüssel – die KI-Funktionen sind hier deaktiviert.",
    });
    return;
  }

  const { action, payload = {} } = await readJsonBody(req);

  try {
    switch (action) {
      case "ping":
        return res.status(200).json({ ok: true });

      case "deepQuestion": {
        const { term, name, interests, decade } = payload;
        const r = await ai.models.generateContent({
          model: MODELS.question,
          contents:
            `Handle als einfühlsamer Biografie-Begleiter. Erstelle EINE ` +
            `hochgradig persönliche Frage für ${name || "die Person"}, um eine ` +
            `konkrete Kindheitserinnerung zu wecken.\n` +
            `Begriff: "${term}"\nJahrzehnt: ${decade}er Jahre\n` +
            `Interessen: ${interests || "allgemein"}\n\n` +
            `Die Frage nimmt direkt auf "${term}" Bezug, regt dazu an, ein ` +
            `Detail, einen Geruch, ein Geräusch oder Gefühl zu beschreiben, ist ` +
            `im Du formuliert und nostalgisch. Antworte NUR mit der Frage.`,
        });
        return res.status(200).json({ text: (r.text || "").trim() });
      }

      case "perspectiveQuestion": {
        const { term, name, decade, originalAnswer } = payload;
        const r = await ai.models.generateContent({
          model: MODELS.question,
          contents:
            `Handle als einfühlsamer Biografie-Begleiter. ${name || "Die Person"} hat ` +
            `gerade eine Kindheitserinnerung zum Begriff "${term}" (${decade}er Jahre) ` +
            `festgehalten` +
            (originalAnswer ? `:\n"${originalAnswer}"\n\n` : ".\n\n") +
            `Erstelle EINE Frage, die dazu einlädt, denselben Moment aus der Sicht einer ` +
            `anderen Person von damals neu zu erzählen (z. B. beste Freundin/bester Freund, ` +
            `Geschwister oder Elternteil) – wie hätte diese Person die Szene wohl erlebt oder ` +
            `beschrieben? Die Frage ist im Du formuliert, konkret und nostalgisch. ` +
            `Antworte NUR mit der Frage.`,
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
                text:
                  "Analysiere dieses alte Foto einfühlsam und nostalgisch. Was ist zu " +
                  "sehen? Beschreibe Atmosphäre und Details und schätze vorsichtig die " +
                  "Zeitperiode. 4-6 Sätze, im Du.",
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
            systemInstruction: payload.persona === "gaming" ? GAMING_CHAT_SYSTEM : CHAT_SYSTEM,
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
          contents:
            `Erstelle einen kompakten deutschsprachigen Spieleguide zu "${title}" ` +
            `(${platform || "Plattform unbekannt"}, ${year || "Jahr unbekannt"}). ` +
            `Gliedere exakt in diese Abschnitte mit Markdown-Überschriften (##):\n` +
            `## Worum geht's\n## Einstiegstipps\n## Geheimnisse & Cheats\n## Heute spielen\n` +
            `Nutze kurze Stichpunkte (- ). Unter "Heute spielen" nur legale Wege nennen ` +
            `(Neuauflagen, Sammlungen, offizielle Stores, Originalhardware). ` +
            `Erfinde nichts; wenn du etwas nicht sicher weißt, lass es weg.`,
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
          prompt: prompt || "Ein nostalgisches, atmosphärisches Video mit sanften Bewegungen.",
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
      .json({ error: "upstream", message: "Die KI-Anfrage ist fehlgeschlagen." });
  }
}
