// Arcade high score tables for the Gaming mini games, shared by all players.
//
// GET  /api/highscores?game=pacman      → { scores: [{name, score}], ready }
// GET  /api/highscores?game=pacman&week=YYYY-MM-DD → that week's table (weekly duel)
// POST /api/highscores {game, name, score, week?} → the new table; with week
//      the score also goes on that week's table (kept 30 days)
//
// Names are three letters or digits, like the initials on an arcade cabinet;
// nothing else about the player is stored. Same Upstash Redis as /api/stats
// (sorted set per game, best 50 kept). Without Redis the tables are empty
// and the app keeps its own table on the device.

import { readJsonBody } from "./_admin.js";

// Highest believable score per game, so a typo in a hand-made request
// cannot take the table over for good.
const GAMES = { blocks: 999_999, pinball: 999_999, pacman: 999_999, senso: 200, breakout: 999_999, snake: 9_999, invaders: 999_999, poker: 99_999, blackjack: 9_999 };
const KEEP = 50;
const SHOW = 10;

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

// Members are "NAME:random" so the same initials can appear more than once.
function parse(flat) {
  const out = [];
  for (let i = 0; i + 1 < flat.length; i += 2) out.push({ name: String(flat[i]).split(":")[0], score: Number(flat[i + 1]) });
  return out;
}

async function table(game, week) {
  const [flat] = await redis([["ZRANGE", week ? weekKey(game, week) : key(game), 0, SHOW - 1, "REV", "WITHSCORES"]]);
  return parse(flat || []);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const body = req.method === "POST" ? await readJsonBody(req) : {};
  const game = String((req.method === "POST" ? body.game : req.query?.game) || "");
  if (!(game in GAMES)) return res.status(400).json({ error: "unknown_game" });
  if (!configured()) return res.status(200).json({ scores: [], ready: false });

  try {
    if (req.method === "GET") {
      const week = validWeek(req.query?.week) ? req.query.week : null;
      return res.status(200).json({ scores: await table(game, week), ready: true });
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).end();
    }
    let name = String(body.name || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
    // Everyone sees the board, so rude or hateful initials become "XXX".
    if (BLOCKED.has(name)) name = "XXX";
    const score = Math.floor(Number(body.score));
    if (name.length !== 3 || !(score > 0) || score > GAMES[game]) return res.status(400).json({ error: "bad_entry" });
    const member = `${name}:${Math.random().toString(36).slice(2, 8)}`;
    const week = validWeek(body.week) ? body.week : null;
    const commands = [
      ["ZADD", key(game), score, member],
      ["ZREMRANGEBYRANK", key(game), 0, -(KEEP + 1)],
    ];
    if (week) {
      commands.push(
        ["ZADD", weekKey(game, week), score, member],
        ["ZREMRANGEBYRANK", weekKey(game, week), 0, -(KEEP + 1)],
        ["EXPIRE", weekKey(game, week), 30 * 86_400],
      );
    }
    await redis(commands);
    return res.status(200).json({ scores: await table(game), week: week ? await table(game, week) : undefined, ready: true });
  } catch (e) {
    console.error("highscores:", e?.message || e);
    return res.status(200).json({ scores: [], ready: false });
  }
}
