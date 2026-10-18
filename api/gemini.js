import { GoogleGenAI } from "@google/genai";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Server-side proxy for all Gemini / Veo calls. The API key lives only here
// (Vercel env var GEMINI_API_KEY) and never reaches the browser.

// Each text model has fallbacks: Google retires model names (2026-10-08:
// "gemini-2.5-flash is no longer available to new users" on the gaming
// project's newer key, so the Retro Guru only answered "Connection lost").
// The "-latest" aliases follow Google's current model; on a 404 the next
// name in the list is tried.
const MODELS = {
  question: ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-2.5-flash-lite"],
  vision: ["gemini-flash-latest", "gemini-3.8-flash", "gemini-2.5-flash"],
  chat: ["gemini-flash-latest", "gemini-3.8-flash", "gemini-2.5-flash"],
  veo: "veo-3.1-fast-generate-preview",
};

const isMissingModel = (err) => {
  const text = String(err?.message || err);
  return err?.status === 404 || /\b404\b|NOT_FOUND|no longer available/i.test(text);
};

// generateContent with the first model of `params.model` (a list) that exists.
async function generate(ai, params) {
  const models = Array.isArray(params.model) ? params.model : [params.model];
  let last;
  for (const model of models) {
    try {
      return await ai.models.generateContent({ ...params, model });
    } catch (err) {
      last = err;
      if (!isMissingModel(err)) throw err;
      console.warn("gemini model unavailable, trying next:", model);
    }
  }
  throw last;
}

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
  "vergessene und unterschätzte Spiele von den 1970ern bis heute wiederzuentdecken: Empfehlungen, Tipps, Cheats, Geschichte und wie man sie heute legal " +
  "spielen kann (Neuauflagen, Sammlungen, offizielle Stores). Antworte im Du, kurz (2-5 Sätze), " +
  "mit nostalgischem Augenzwinkern. Sprich wie ein Zocker, der seit den 80ern dabei ist, und streu " +
  "dosiert Gamer-Slang aus allen Epochen ein (80er: geil, ätzend, tote Hose; 90er: krass, fett, Digga; " +
  "2000er: Noob, epic fail, GG, imba; heute: no cap, lowkey, goated, cringe), höchstens zwei Slangwörter " +
  "pro Antwort, damit alles verständlich bleibt. Erfinde keine Fakten; sag ehrlich, wenn du dir unsicher bist. " +
  "Verlinke oder empfiehl keine illegalen ROM-Downloads.";

const GAMING_CHAT_SYSTEM_EN =
  "You are the Retro Guru, an enthusiastic video game expert from the days of " +
  "cartridges, floppy disks and gaming magazines, who also knows today's scene. You help people " +
  "rediscover forgotten and underrated games from the 1970s to today: recommendations, tips, cheats, history and how to play them " +
  "legally today (re-releases, collections, official stores). Reply in American English, briefly (2-5 sentences), " +
  "with a nostalgic wink. Talk like a gamer who has been around since the 80s and sprinkle in " +
  "a little gamer slang from every era (80s: rad, gnarly, bogus; 90s: da bomb, phat, booyah; " +
  "2000s: noob, epic fail, GG, OP; today: no cap, lowkey, goated, cringe), at most two slang words " +
  "per answer so everything stays easy to understand. Don't make up facts; say honestly when you're unsure. " +
  "Never link to or recommend illegal ROM downloads.";

// The app help bot (components/HelpBot.tsx, Marco 2026-10-18: "einen Button
// ganz unten rechts für einen KI bot, dem man alle Fragen über die App stellen
// kann"). It answers from the feature lists of both READMEs, so it stays
// current with every PR that updates them. vercel.json `includeFiles` ships
// the two files with this function.
function featureSection(file) {
  try {
    const md = readFileSync(join(process.cwd(), file), "utf8");
    const start = md.search(/^## Was .* kann\s*$/m);
    if (start < 0) return "";
    const rest = md.slice(start);
    const end = rest.slice(3).search(/^## /m);
    return (end < 0 ? rest : rest.slice(0, end + 3))
      // Source file links mean nothing to visitors: "([`lib/x.ts`](lib/x.ts))".
      .replace(/\s*\((?:\[`[^`]*`\]\([^)]*\)[,;\s]*(?:und\s*)?)+\)/g, "")
      .replace(/\[`([^`]*)`\]\([^)]*\)/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch (e) {
    console.warn("help bot: cannot read", file, e?.message || e);
    return "";
  }
}

let appGuide = null;
function getAppGuide() {
  if (appGuide === null) {
    appGuide =
      "=== RetroMind (Zeitreise, retromind.vercel.app) ===\n" + featureSection("README.md") +
      "\n\n=== RetroMind – Gaming (retromind-gaming.vercel.app) ===\n" + featureSection("gaming/README.md");
  }
  return appGuide;
}

function helpSystem(de, app) {
  const where = app === "gaming"
    ? (de ? "Die Person ist gerade in der Gaming-Edition (Spielhalle)." : "The person is currently in the Gaming edition (the arcade).")
    : (de ? "Die Person ist gerade in der Zeitreise." : "The person is currently in the Zeitreise (time travel) app.");
  const rules = de
    ? "Du bist die freundliche Hilfe von RetroMind. Du beantwortest Fragen dazu, was die App kann, wo man etwas " +
      "findet und wie es funktioniert. " + where + " Stütze dich NUR auf die Funktionsbeschreibung unten (sie ist auf " +
      "Deutsch). Steht etwas nicht darin, sag ehrlich, dass du es nicht weißt, und schlag vor, es über den roten " +
      "Feedback-Knopf in der Steuerung zu melden. Erfinde keine Funktionen. Fast alle Knöpfe und Einstellungen " +
      "liegen hinter dem kleinen Griff am rechten Bildschirmrand in der Mitte. Antworte im Du, kurz (2-5 Sätze), " +
      "einfach und ohne Technik-Begriffe wie Dateinamen, Code oder Markdown. Bei Fragen, die nichts mit RetroMind " +
      "zu tun haben, lenk freundlich zurück zur App. Über den Adminbereich sprichst du nicht."
    : "You are RetroMind's friendly help. You answer questions about what the app can do, where to find things " +
      "and how they work. " + where + " Rely ONLY on the feature description below (it is written in German; " +
      "translate names of buttons and places sensibly). If something isn't in it, say honestly that you don't know " +
      "and suggest reporting it with the red Feedback button in the controls. Never make up features. Almost all " +
      "buttons and settings sit behind the small handle at the middle of the right screen edge. Reply in American " +
      "English, speaking to the person as \"you\", briefly (2-5 sentences), simply and without technical terms such " +
      "as file names, code or Markdown. If a question has nothing to do with RetroMind, kindly steer back to the app. Don't talk about the admin area.";
  return rules + "\n\n" + getAppGuide();
}

// Text plus the web pages Google Search grounded it in, for display.
function grounded(r) {
  const meta = r.candidates?.[0]?.groundingMetadata;
  const seen = new Set();
  const sources = (meta?.groundingChunks || [])
    .map((c) => c.web)
    .filter((w) => w?.uri && !seen.has(w.uri) && seen.add(w.uri))
    .slice(0, 8)
    .map((w) => ({ uri: w.uri, title: w.title || w.uri }));
  return { text: r.text || "", sources, searchWidget: meta?.searchEntryPoint?.renderedContent };
}

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
        const r = await generate(ai, {
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
        const r = await generate(ai, {
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
        const r = await generate(ai, {
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
        const help = payload.persona === "help";
        const r = await generate(ai, {
          model: MODELS.chat,
          contents: help ? contents.slice(-12).filter((c, i, a) => i > 0 || c.role === "user" || a.length === 1).map((c) => ({ ...c, parts: [{ text: clip(c.parts[0].text, 1500) }] })) : contents,
          config: {
            systemInstruction: help
              ? helpSystem(de, payload.app)
              : payload.persona === "gaming"
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
        const r = await generate(ai, {
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
        return res.status(200).json(grounded(r));
      }

      case "gamePress": {
        const title = clip(payload.title, 120);
        if (!title) return res.status(400).json({ error: "no_title" });
        const platform = clip(payload.platform, 40);
        const year = clip(payload.year, 4);
        // The old magazine reviews (German gamers remember the percentages),
        // where to play it today, and passwords; grounded like the guide.
        const r = await generate(ai, {
          model: MODELS.chat,
          contents: de
            ? `Recherchiere im Web zu dem Videospiel "${title}" (${platform || "Plattform unbekannt"}, ${year || "Jahr unbekannt"}). ` +
            `Gliedere exakt in diese Abschnitte mit Markdown-Überschriften (##):\n` +
            `## Testwertungen von damals\n## Wo heute spielen\n## Passwörter & Codes\n` +
            `Unter "Testwertungen von damals": Wertungen aus Spielezeitschriften der Erscheinungszeit, ` +
            `zuerst deutsche (Power Play, ASM, Amiga Joker, Video Games, Mega Fun, Man!ac, PC Player, ` +
            `PC Games, 64'er, Happy Computer), dann internationale (Zzap!64, Crash, CVG, Famitsu, EGM). ` +
            `Je ein Stichpunkt im Format "- **Zeitschrift** (Ausgabe): Wertung". Kultboy.com ist eine gute Quelle. ` +
            `Unter "Wo heute spielen" nur legale, aktuell erhältliche Wege (Neuauflagen, Sammlungen, ` +
            `Nintendo Switch Online, Steam, GOG, Mini-Konsolen, Originalhardware). ` +
            `Unter "Passwörter & Codes" Level-Passwörter, Cheats oder Codes, falls das Spiel welche hat; ` +
            `sonst den Abschnitt weglassen. Nur Angaben, die du in Quellen gefunden hast. ` +
            `Erfinde keine Wertungen; was du nicht sicher findest, lässt du weg.`
            : `Research the video game "${title}" (${platform || "platform unknown"}, ${year || "year unknown"}) on the web. ` +
            `Structure it exactly into these sections with Markdown headings (##):\n` +
            `## Reviews back then\n## Where to play it today\n## Passwords & codes\n` +
            `Under "Reviews back then": scores from gaming magazines of the time it came out ` +
            `(e.g. Electronic Gaming Monthly, GamePro, Nintendo Power, Computer and Video Games, Zzap!64, Crash, ` +
            `Amiga Power, Famitsu, and the German Power Play, ASM, Amiga Joker, Video Games, Man!ac). ` +
            `One bullet each in the format "- **Magazine** (issue): score". ` +
            `Under "Where to play it today" only legal, currently available ways (re-releases, collections, ` +
            `Nintendo Switch Online, Steam, GOG, mini consoles, original hardware). ` +
            `Under "Passwords & codes" level passwords, cheats or codes if the game has them; ` +
            `otherwise leave that section out. Only facts you found in sources. ` +
            `Never make up a score; if you can't find something for sure, leave it out.`,
          config: { tools: [{ googleSearch: {} }] },
        });
        return res.status(200).json(grounded(r));
      }

      case "heroSearch": {
        // "Heroes of your youth": a few words or a fuzzy description ("the
        // guy with the talking car") become Wikipedia article titles. The
        // client checks every title against Wikipedia before showing it, so
        // a made-up name simply drops out.
        const query = clip(payload.query, 200).trim();
        if (!query) return res.status(400).json({ error: "no_query" });
        const decade = clip(payload.decade, 4);
        const r = await generate(ai, {
          model: MODELS.chat,
          contents: de
            ? `Jemand sucht einen Helden oder eine Heldin seiner Kindheit und Jugend ` +
            `(${decade ? `aufgewachsen in den ${decade}er Jahren` : "Jahrzehnt unbekannt"}). ` +
            `Die Suche lautet: "${query}"\n\n` +
            `Das können echte Menschen sein (Sport, Musik, Film, Fernsehen), Filmfiguren, Serienfiguren, ` +
            `Comic- oder Zeichentrickfiguren, Spielzeugfiguren oder Bands. Die Suche kann ein Name sein oder eine ` +
            `ungenaue Beschreibung, auch mit Fehlern. Nenne bis zu 5 passende Kandidaten, den wahrscheinlichsten ` +
            `zuerst. Gib für jeden den exakten Titel des englischen Wikipedia-Artikels an (am besten der Artikel ` +
            `über die Person oder Figur selbst, sonst über die Serie, den Film oder die Band) und einen kurzen Satz ` +
            `auf Deutsch, warum er passt. Erfinde nichts.`
            : `Someone is looking for a hero of their childhood and youth ` +
            `(${decade ? `they grew up in the ${decade}s` : "decade unknown"}). ` +
            `Their search: "${query}"\n\n` +
            `Heroes can be real people (sports, music, film, TV), movie or TV characters, comic or cartoon ` +
            `characters, toy figures or bands. The search may be a name or a vague description, possibly misspelled. ` +
            `Name up to 5 matching candidates, the most likely first. For each, give the exact title of the English ` +
            `Wikipedia article (preferably the article about the person or character itself, otherwise about the ` +
            `show, film or band) and one short sentence in American English on why it fits. Don't make anything up.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  wikiTitle: { type: "string" },
                  why: { type: "string" },
                },
                required: ["name", "wikiTitle", "why"],
              },
            },
          },
        });
        let list = [];
        try {
          list = JSON.parse(r.text || "[]");
        } catch {
          list = [];
        }
        const candidates = (Array.isArray(list) ? list : [])
          .filter((c) => c && typeof c.wikiTitle === "string" && c.wikiTitle.trim())
          .slice(0, 5)
          .map((c) => ({ name: clip(c.name, 80), wikiTitle: clip(c.wikiTitle, 120), why: clip(c.why, 240) }));
        return res.status(200).json({ candidates });
      }

      case "tickerMore": {
        // Fresh entries for the tickers once everything written by hand has
        // run past (lib/tickerFeed.ts, Marco 2026-10-18: "immer neues
        // Material"). Zeitreise: sayings and everyday things from back then;
        // gaming: short facts about video games. `recent` are the texts just
        // shown, so nothing comes twice.
        const gaming = payload.app === "gaming";
        const decade = /^(19|20)\d0$/.test(String(payload.decade)) ? String(payload.decade) : "";
        const recent = (Array.isArray(payload.recent) ? payload.recent : [])
          .slice(-40)
          .map((t) => clip(t, 140))
          .join("\n");
        const avoid = recent
          ? de ? `\n\nDiese gab es schon, wiederhole keine davon:\n${recent}` : `\n\nThese were already shown, repeat none of them:\n${recent}`
          : "";
        const prompt = gaming
          ? de
            ? `Schreibe 8 kurze, wahre und überprüfbare Fakten über Videospiele, Konsolen, Heimcomputer und Spielhallen ` +
            `von den 1970ern bis heute, für ein Laufband in einer Retro-Spielhalle. Jeder Fakt höchstens 120 Zeichen, ` +
            `auf Deutsch, locker formuliert, bunt gemischt über Jahrzehnte und Systeme. Erfinde nichts; ` +
            `nimm nur, was gut belegt ist.${avoid}`
            : `Write 8 short, true and verifiable facts about video games, consoles, home computers and arcades ` +
            `from the 1970s to today, for a news ticker in a retro arcade. Each fact at most 120 characters, ` +
            `in American English, casual, mixed across decades and systems. Don't make anything up; ` +
            `use only what is well documented.${avoid}`
          : de
            ? `Schreibe 8 Einträge für ein nostalgisches Laufband: Sprüche, die man in Deutschland früher sagte, ` +
            `und Dinge aus dem Alltag von damals, die jeder kannte` +
            `${decade ? `, etwa die Hälfte aus den ${decade}er Jahren, der Rest aus anderen Jahrzehnten ab den 1950ern` : ", aus den 1950ern bis 2010ern"}. ` +
            `Für jeden: decade (z. B. "1980"), kind ("saying" für Sprüche, in „…“, oder "thing" für Alltag), ` +
            `text (höchstens 90 Zeichen) und info (2 Sätze, warum man das kannte und woher es kommt). ` +
            `Auf Deutsch, warm und einfach. Erfinde nichts.${avoid}`
            : `Write 8 entries for a nostalgic news ticker: sayings people in America used to say, and everyday ` +
            `things from back then that everyone knew` +
            `${decade ? `, about half from the ${decade}s, the rest from other decades since the 1950s` : ", from the 1950s to the 2010s"}. ` +
            `For each: decade (e.g. "1980"), kind ("saying" for sayings, in “…”, or "thing" for everyday life), ` +
            `text (at most 90 characters) and info (2 sentences on why people knew it and where it comes from). ` +
            `In American English, warm and simple. Don't make anything up.${avoid}`;
        const r = await generate(ai, {
          model: MODELS.question,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "array",
              items: gaming
                ? { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
                : {
                  type: "object",
                  properties: {
                    decade: { type: "string" },
                    kind: { type: "string" },
                    text: { type: "string" },
                    info: { type: "string" },
                  },
                  required: ["decade", "kind", "text", "info"],
                },
            },
          },
        });
        let list = [];
        try {
          list = JSON.parse(r.text || "[]");
        } catch {
          list = [];
        }
        const items = (Array.isArray(list) ? list : [])
          .filter((i) => i && typeof i.text === "string" && i.text.trim())
          .slice(0, 10)
          .map((i) => ({ decade: clip(i.decade, 4), kind: clip(i.kind, 10), text: clip(i.text, 140), info: clip(i.info, 500) }));
        return res.status(200).json({ items });
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
