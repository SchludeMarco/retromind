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
          config: { systemInstruction: CHAT_SYSTEM },
        });
        return res.status(200).json({ text: r.text || "" });
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
