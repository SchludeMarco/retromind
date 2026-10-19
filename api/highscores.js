// Arcade high score tables for the Gaming mini games, shared by all players,
// and the rivalry around them ("Konkurrenzkampf", Marco 2026-10-19): who
// overtakes you on a table leaves you a note, and on devices where you
// switched on rival alerts a push message too.
//
// GET  /api/highscores?game=pacman      → { scores: [{name, score, me?}], ready }
// GET  /api/highscores?game=pacman&week=YYYY-MM-DD → that week's table (weekly duel)
// POST /api/highscores {game, name, score, week?} → the new table; with week
//      the score also goes on that week's table (kept 30 days)
// GET  /api/highscores?news=1           → { news: [{game, name, score, at}] }: who overtook me
// GET  /api/highscores?vapid=1          → { key } public key for push subscriptions
// POST /api/highscores {push: subscription | null, endpoint?, lang} → alerts on/off for this device
//
// Names are three letters or digits, like the initials on an arcade cabinet.
// Behind each entry the server also files a one-way hash of the guest's
// e-mail (from the guest cookie, api/_guests.js), never shown to anyone, so
// it can tell whose entry was beaten and mark your own lines. Same Upstash
// Redis as /api/stats (sorted set per game, best 50 kept). Without Redis the
// tables are empty and the app keeps its own table on the device.

import crypto from "node:crypto";
import webpush from "web-push";
import { readJsonBody } from "./_admin.js";
import { readCookie } from "./_guests.js";

// Highest believable score per game, so a typo in a hand-made request
// cannot take the table over for good. `low`: fewer is better (moves, seconds).
const GAMES = {
  blocks: { max: 999_999 },
  pinball: { max: 999_999 },
  pacman: { max: 999_999 },
  senso: { max: 200 },
  breakout: { max: 999_999 },
  snake: { max: 9_999 },
  invaders: { max: 999_999 },
  poker: { max: 99_999 },
  blackjack: { max: 9_999 },
  quiz: { max: 5 },
  memory: { max: 999, low: true, min: 8 },
  puzzle: { max: 9_999, low: true, min: 1 },
  sudoku: { max: 86_400, low: true, min: 10 },
  solitaire: { max: 86_400, low: true, min: 10 },
};
const KEEP = 50;
const SHOW = 10;
const NEWS_KEEP = 20;
const NEWS_DAYS = 30;
const PUSH_DAYS = 180;

const redisUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const configured = () => !!(redisUrl() && redisToken());

async function redis(commands) {
  const res = await fetch(`${redisUrl()}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return (await res.json()).map((r) => {
    if (r.error) throw new Error(`redis: ${r.error}`);
    return r.result;
  });
}

const key = (game) => `rm:hs:${game}`;
const weekKey = (game, week) => `rm:hs:w:${week}:${game}`;
const newsKey = (pid) => `rm:hs:news:${pid}`;
const pushKey = (pid) => `rm:hs:push:${pid}`;
// The weekly duel's week is the Monday it starts on; at most a day or two ahead (time zones).
const validWeek = (w) =>
  typeof w === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(w) &&
  new Date(`${w}T12:00:00Z`).getUTCDay() === 1 &&
  Math.abs(Date.parse(`${w}T12:00:00Z`) - Date.now()) < 9 * 86_400_000;

// Three-letter words nobody should see on a public board (English and
// German swear words and Nazi codes).
const BLOCKED = new Set([
  "ASS", "FUK", "FUC", "FCK", "FKU", "CUM", "DIK", "DIC", "COC", "COK", "KKK", "NIG", "NGR", "FAG", "SEX",
  "TIT", "PIS", "PUS", "WTF", "NSU", "SS1", "HH1", "AH1", "SAU", "ARS", "FIK", "FOT", "NAZ", "HJ1",
  "SH1", "SKH", "H88", "J88", "A88", "S88", "N88", "C18", "K18", "S18",
]);

/** The player behind a request: a short one-way hash of the guest's e-mail, or null (no guest cookie). */
async function playerId(req) {
  const guest = await readCookie(req.headers.cookie);
  if (!guest) return null;
  return crypto.createHash("sha256").update(`retromind-player|${guest.email.toLowerCase()}`).digest("hex").slice(0, 16);
}

// Members are "NAME:random" (older entries) or "NAME:random:player".
function parse(flat, me) {
  const out = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const [name, , pid] = String(flat[i]).split(":");
    const entry = { name, score: Number(flat[i + 1]), pid: pid || null };
    out.push(entry);
  }
  return me === undefined ? out : out.map(({ name, score, pid }) => (me && pid === me ? { name, score, me: true } : { name, score }));
}

const range = (k, low, n = SHOW) => ["ZRANGE", k, 0, n - 1, ...(low ? [] : ["REV"]), "WITHSCORES"];

async function table(game, week, me) {
  const [flat] = await redis([range(week ? weekKey(game, week) : key(game), GAMES[game].low)]);
  return parse(flat || [], me ?? null);
}

// ---- push (Web Push with VAPID; no outside service besides the browser's own push server)

// Without VAPID_* settings the key pair is derived from the same secret as
// the guest cookie, so alerts work without any extra setup.
function vapidKeys() {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
  }
  const secret = process.env.GUEST_SECRET || redisToken();
  if (!secret) return null;
  const priv = crypto.createHash("sha256").update(`retromind-vapid|${secret}`).digest();
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.setPrivateKey(priv);
  const b64 = (buf) => buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return { publicKey: b64(ecdh.getPublicKey()), privateKey: b64(priv) };
}

const GAME_NAMES = {
  blocks: ["Block Stacker", "Blockstapler"],
  pinball: ["Pinball", "Flipper"],
  pacman: ["Pac-Munch", "Pac-Mampf"],
  senso: ["Color Echo", "Farbecho"],
  breakout: ["Brick Bash", "Mauerbrecher"],
  snake: ["Snake", "Snake"],
  invaders: ["Space Invasion", "Weltraum-Invasion"],
  poker: ["Video Poker", "Video-Poker"],
  blackjack: ["Blackjack", "Blackjack"],
  quiz: ["Name That Game", "Spiele-Quiz"],
  memory: ["Pixel Memory", "Pixel-Memory"],
  puzzle: ["Slide Puzzle", "Schiebepuzzle"],
  sudoku: ["Sudoku", "Sudoku"],
  solitaire: ["Solitaire", "Solitär"],
};

async function sendAlerts(pid, game, name) {
  const keys = vapidKeys();
  if (!keys) return;
  const [subs] = await redis([["HGETALL", pushKey(pid)]]);
  if (!subs || !subs.length) return;
  webpush.setVapidDetails("https://retromind-gaming.vercel.app", keys.publicKey, keys.privateKey);
  const gone = [];
  await Promise.all(
    Array.from({ length: subs.length / 2 }, async (_, i) => {
      const field = subs[2 * i];
      let sub;
      try {
        sub = JSON.parse(subs[2 * i + 1]);
      } catch {
        return gone.push(field);
      }
      const de = sub.lang === "de";
      const title = de ? "⚔️ Überholt!" : "⚔️ You’ve been beaten!";
      const gameName = GAME_NAMES[game][de ? 1 : 0];
      const body = de ? `${name} hat dich bei ${gameName} überholt. Revanche?` : `${name} just beat you at ${gameName}. Rematch?`;
      try {
        await webpush.sendNotification(sub.subscription, JSON.stringify({ title, body, tag: `rm-rival-${game}`, game }), { TTL: 86_400 });
      } catch (e) {
        // The browser dropped the subscription (app removed, permission taken back).
        if (e?.statusCode === 404 || e?.statusCode === 410) gone.push(field);
        else console.error("highscores push:", e?.statusCode || e?.message || e);
      }
    })
  );
  if (gone.length) await redis([["HDEL", pushKey(pid), ...gone]]);
}

/** Leaves a note (and push alerts) for everyone whose best entry on the table the new score just passed. */
async function notifyBeaten(before, game, name, score, me) {
  const low = GAMES[game].low;
  const better = (a, b) => (low ? a < b : a > b);
  // Only news when it changes the order: whoever was already behind your old best hears nothing new.
  const myBest = me ? before.find((e) => e.pid === me)?.score : undefined;
  const beaten = new Set();
  const seen = new Set();
  for (const e of before) {
    if (!e.pid || seen.has(e.pid)) continue;
    seen.add(e.pid); // tables are sorted best first, so this is each player's best entry
    const wasBehind = myBest !== undefined && !better(e.score, myBest);
    if (e.pid !== me && better(score, e.score) && !wasBehind) beaten.add(e.pid);
  }
  if (!beaten.size) return;
  const note = JSON.stringify({ game, name, score, at: Date.now() });
  await redis(
    [...beaten].flatMap((pid) => [
      ["LPUSH", newsKey(pid), note],
      ["LTRIM", newsKey(pid), 0, NEWS_KEEP - 1],
      ["EXPIRE", newsKey(pid), NEWS_DAYS * 86_400],
    ])
  );
  await Promise.all([...beaten].map((pid) => sendAlerts(pid, game, name).catch((e) => console.error("highscores push:", e?.message || e))));
}

async function setPush(pid, body) {
  const endpoint = String(body.push?.endpoint || body.endpoint || "");
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 1000) return false;
  const field = crypto.createHash("sha256").update(endpoint).digest("hex").slice(0, 16);
  if (!body.push) {
    await redis([["HDEL", pushKey(pid), field]]);
    return true;
  }
  const { keys } = body.push;
  if (!keys || typeof keys.p256dh !== "string" || typeof keys.auth !== "string") return false;
  const sub = { subscription: { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } }, lang: body.lang === "de" ? "de" : "en" };
  await redis([
    ["HSET", pushKey(pid), field, JSON.stringify(sub)],
    ["EXPIRE", pushKey(pid), PUSH_DAYS * 86_400],
  ]);
  return true;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const body = req.method === "POST" ? await readJsonBody(req) : {};

  if (req.method === "GET" && req.query?.vapid) {
    const keys = vapidKeys();
    return res.status(200).json({ key: keys?.publicKey ?? null });
  }
  if (!configured()) {
    if (req.query?.news) return res.status(200).json({ news: [], ready: false });
    if (req.method === "POST" && "push" in body) return res.status(200).json({ ok: false });
  }
  const me = configured() ? await playerId(req) : null;

  try {
    if (req.method === "GET" && req.query?.news) {
      if (!me) return res.status(200).json({ news: [], ready: true });
      const [items] = await redis([["LRANGE", newsKey(me), 0, NEWS_KEEP - 1]]);
      const news = (items || []).flatMap((s) => {
        try {
          return [JSON.parse(s)];
        } catch {
          return [];
        }
      });
      return res.status(200).json({ news, ready: true });
    }
    if (req.method === "POST" && "push" in body) {
      if (!me) return res.status(200).json({ ok: false });
      return res.status(200).json({ ok: await setPush(me, body) });
    }
  } catch (e) {
    console.error("highscores:", e?.message || e);
    return res.status(200).json({ news: [], ok: false, ready: false });
  }

  const game = String((req.method === "POST" ? body.game : req.query?.game) || "");
  if (!(game in GAMES)) return res.status(400).json({ error: "unknown_game" });
  if (!configured()) return res.status(200).json({ scores: [], ready: false });
  const { low, max, min = 1 } = GAMES[game];

  try {
    if (req.method === "GET") {
      const week = validWeek(req.query?.week) ? req.query.week : null;
      return res.status(200).json({ scores: await table(game, week, me), ready: true });
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).end();
    }
    let name = String(body.name || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
    // Everyone sees the board, so rude or hateful initials become "XXX".
    if (BLOCKED.has(name)) name = "XXX";
    const score = Math.floor(Number(body.score));
    if (name.length !== 3 || !(score >= min) || score > max) return res.status(400).json({ error: "bad_entry" });
    const member = `${name}:${Math.random().toString(36).slice(2, 8)}${me ? `:${me}` : ""}`;
    const week = validWeek(body.week) ? body.week : null;
    const [beforeFlat] = await redis([range(key(game), low)]);
    // Trim from the worse end: the lowest scores, or for "fewer is better" the highest.
    const trim = (k) => (low ? ["ZREMRANGEBYRANK", k, KEEP, -1] : ["ZREMRANGEBYRANK", k, 0, -(KEEP + 1)]);
    const commands = [["ZADD", key(game), score, member], trim(key(game))];
    if (week) {
      commands.push(["ZADD", weekKey(game, week), score, member], trim(weekKey(game, week)), ["EXPIRE", weekKey(game, week), 30 * 86_400]);
    }
    await redis(commands);
    try {
      await notifyBeaten(parse(beforeFlat || []), game, name, score, me);
    } catch (e) {
      console.error("highscores notify:", e?.message || e);
    }
    return res.status(200).json({ scores: await table(game, null, me), week: week ? await table(game, week, me) : undefined, ready: true });
  } catch (e) {
    console.error("highscores:", e?.message || e);
    return res.status(200).json({ scores: [], ready: false });
  }
}
