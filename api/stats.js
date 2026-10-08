// Anonymous usage counter for both editions plus the admin view of it.
//
// POST /api/stats {app}  → counts one app start. No cookie, nothing stored on
//   the device, no IP address kept: the server hashes IP + browser + app with
//   a random salt that exists for one day only (Redis key with a 48 h expiry)
//   and drops the hash into a HyperLogLog, which can count distinct visitors
//   but cannot give any hash back. Once the salt is gone, nobody (not even
//   Marco) can link a visit to a person or to another day. Optional fields:
//   device ("phone" | "tablet" | "desktop") and installed (opened as an
//   installed app) are added to per-day tallies.
// POST /api/stats {app, event: {kind, key}} → counts what is opened (decades
//   in the Zeitreise, games and mini-games in Gaming) in plain tallies per
//   month and overall, with no link to the visitor.
// GET /api/stats?days=30 with "Authorization: Bearer <Google access token>"
//   → daily numbers for the admin page. The token is checked with Google: it
//   must belong to this app's OAuth client and to ADMIN_EMAIL.
//
// Storage: Upstash Redis (free plan) via the Vercel Marketplace. The
// integration sets KV_REST_API_URL / KV_REST_API_TOKEN (or the UPSTASH_*
// names); connect the same database to both Vercel projects so the admin page
// sees both editions. Without it, counting is a silent no-op.

import crypto from "node:crypto";
import { isAdmin, readJsonBody } from "./_admin.js";

const APPS = ["zeitreise", "gaming"];
const DEVICES = ["phone", "tablet", "desktop"];
const EVENT_KINDS = { zeitreise: ["decade"], gaming: ["game", "minigame"] };
const TOP_KEEP = 300;
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|facebookexternalhit|curl|wget/i;
const MAX_DAYS = 90;

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
  const results = await res.json();
  return results.map((r) => {
    if (r.error) throw new Error(`redis: ${r.error}`);
    return r.result;
  });
}

// Days are counted in German time, so "heute" matches Marco's calendar.
const dayKey = (date) => date.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });

// Calendar arithmetic on the Berlin date in UTC, so DST days are not skipped.
function lastDays(n) {
  const today = new Date(`${dayKey(new Date())}T12:00:00Z`);
  const days = [];
  for (let i = n - 1; i >= 0; i--) days.push(new Date(today.getTime() - i * 86_400_000).toISOString().slice(0, 10));
  return days;
}

let saltCache = { day: "", salt: "" };

async function dailySalt(day) {
  if (saltCache.day === day) return saltCache.salt;
  const fresh = crypto.randomBytes(16).toString("hex");
  const [, salt] = await redis([
    ["SET", `rm:salt:${day}`, fresh, "NX", "EX", 172_800],
    ["GET", `rm:salt:${day}`],
  ]);
  saltCache = { day, salt };
  return salt;
}

const monthKey = (day) => day.slice(0, 7);
// Keys come from the browser: plain text only, short, no control characters.
const cleanKey = (key) =>
  typeof key === "string" ? key.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 60) : "";

async function countVisit(req, res) {
  const { app, device, installed, event } = await readJsonBody(req);
  const ua = String(req.headers["user-agent"] || "");
  if (!APPS.includes(app) || !configured() || !ua || BOT_RE.test(ua)) return res.status(204).end();

  const day = dayKey(new Date());
  try {
    if (event) {
      const key = cleanKey(event.key);
      if (!EVENT_KINDS[app].includes(event.kind) || !key) return res.status(204).end();
      const base = `rm:${app}:top:${event.kind}`;
      await redis([
        ["ZINCRBY", `${base}:all`, 1, key],
        ["ZINCRBY", `${base}:${monthKey(day)}`, 1, key],
        ["ZREMRANGEBYRANK", `${base}:all`, 0, -(TOP_KEEP + 1)],
        ["ZREMRANGEBYRANK", `${base}:${monthKey(day)}`, 0, -(TOP_KEEP + 1)],
      ]);
      return res.status(204).end();
    }

    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "";
    const salt = await dailySalt(day);
    const visitor = crypto.createHash("sha256").update(`${salt}|${ip}|${ua}|${app}`).digest("hex").slice(0, 32);
    const commands = [
      ["INCR", `rm:${app}:starts:${day}`],
      ["INCR", `rm:${app}:starts:total`],
      ["PFADD", `rm:${app}:visitors:${day}`, visitor],
      ["SET", "rm:since", day, "NX"],
    ];
    if (DEVICES.includes(device)) commands.push(["HINCRBY", `rm:${app}:devices:${day}`, device, 1]);
    if (installed === true) commands.push(["HINCRBY", `rm:${app}:devices:${day}`, "installed", 1]);
    await redis(commands);
  } catch (err) {
    console.error("stats count failed", err);
  }
  return res.status(204).end();
}

const toTop = (flat) => {
  const list = [];
  for (let i = 0; i + 1 < (flat || []).length; i += 2) list.push({ key: flat[i], count: Number(flat[i + 1]) || 0 });
  return list;
};

const fromHash = (flat) => {
  const out = {};
  for (let i = 0; i + 1 < (flat || []).length; i += 2) out[flat[i]] = Number(flat[i + 1]) || 0;
  return out;
};

async function summary(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!(await isAdmin(req))) return res.status(403).json({ error: "forbidden" });
  if (!configured()) return res.status(200).json({ configured: false });

  const n = Math.min(MAX_DAYS, Math.max(1, Number(req.query?.days) || 30));
  const days = lastDays(n);
  const month = monthKey(days[days.length - 1]);
  const commands = [["GET", "rm:since"]];
  for (const app of APPS) {
    commands.push(["GET", `rm:${app}:starts:total`]);
    for (const day of days) {
      commands.push(
        ["GET", `rm:${app}:starts:${day}`],
        ["PFCOUNT", `rm:${app}:visitors:${day}`],
        ["HGETALL", `rm:${app}:devices:${day}`],
      );
    }
    for (const kind of EVENT_KINDS[app]) {
      commands.push(
        ["ZREVRANGE", `rm:${app}:top:${kind}:${month}`, 0, 9, "WITHSCORES"],
        ["ZREVRANGE", `rm:${app}:top:${kind}:all`, 0, 9, "WITHSCORES"],
      );
    }
  }
  try {
    const results = await redis(commands);
    let i = 0;
    const since = results[i++] || null;
    const apps = {};
    for (const app of APPS) {
      const totalStarts = Number(results[i++]) || 0;
      const devices = { phone: 0, tablet: 0, desktop: 0, installed: 0 };
      const daily = days.map((day) => {
        const row = { day, starts: Number(results[i++]) || 0, visitors: Number(results[i++]) || 0 };
        const d = fromHash(results[i++]);
        for (const k of Object.keys(devices)) devices[k] += d[k] || 0;
        return row;
      });
      const top = {};
      for (const kind of EVENT_KINDS[app]) {
        top[kind] = { month: toTop(results[i++]), all: toTop(results[i++]) };
      }
      apps[app] = { totalStarts, daily, devices, top };
    }
    return res.status(200).json({ configured: true, since, days, month, apps });
  } catch (err) {
    console.error("stats read failed", err);
    return res.status(502).json({ error: "upstream" });
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") return countVisit(req, res);
  if (req.method === "GET") return summary(req, res);
  res.setHeader("Allow", "GET, POST");
  return res.status(405).end();
}
