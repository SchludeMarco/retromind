// Anonymous usage counter for both editions plus the admin view of it.
//
// POST /api/stats {app}  → counts one app start. No cookie, nothing stored on
//   the device, no IP address kept: the server hashes IP + browser + app with
//   a random salt that exists for one day only (Redis key with a 48 h expiry)
//   and drops the hash into a HyperLogLog, which can count distinct visitors
//   but cannot give any hash back. Once the salt is gone, nobody (not even
//   Marco) can link a visit to a person or to another day.
// GET /api/stats?days=30 with "Authorization: Bearer <Google access token>"
//   → daily numbers for the admin page. The token is checked with Google: it
//   must belong to this app's OAuth client and to ADMIN_EMAIL.
//
// Storage: Upstash Redis (free plan) via the Vercel Marketplace. The
// integration sets KV_REST_API_URL / KV_REST_API_TOKEN (or the UPSTASH_*
// names); connect the same database to both Vercel projects so the admin page
// sees both editions. Without it, counting is a silent no-op.

import crypto from "node:crypto";

const APPS = ["zeitreise", "gaming"];
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "marco.schlude@gmail.com").toLowerCase();
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

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return {};
  }
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

async function countVisit(req, res) {
  const { app } = await readJsonBody(req);
  const ua = String(req.headers["user-agent"] || "");
  if (!APPS.includes(app) || !configured() || !ua || BOT_RE.test(ua)) return res.status(204).end();

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "";
  const day = dayKey(new Date());
  try {
    const salt = await dailySalt(day);
    const visitor = crypto.createHash("sha256").update(`${salt}|${ip}|${ua}|${app}`).digest("hex").slice(0, 32);
    await redis([
      ["INCR", `rm:${app}:starts:${day}`],
      ["INCR", `rm:${app}:starts:total`],
      ["PFADD", `rm:${app}:visitors:${day}`, visitor],
      ["SET", "rm:since", day, "NX"],
    ]);
  } catch (err) {
    console.error("stats count failed", err);
  }
  return res.status(204).end();
}

// Google access tokens are opaque; Google's tokeninfo endpoint says whose
// they are and which OAuth client they were issued to.
async function isAdmin(req) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (!token || !clientId) return false;
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`);
  if (!res.ok) return false;
  const info = await res.json();
  return (
    info.aud === clientId &&
    String(info.email_verified) === "true" &&
    String(info.email || "").toLowerCase() === ADMIN_EMAIL &&
    Number(info.expires_in) > 0
  );
}

async function summary(req, res) {
  res.setHeader("Cache-Control", "no-store");
  let allowed = false;
  try {
    allowed = await isAdmin(req);
  } catch (err) {
    console.error("stats auth failed", err);
  }
  if (!allowed) return res.status(403).json({ error: "forbidden" });
  if (!configured()) return res.status(200).json({ configured: false });

  const n = Math.min(MAX_DAYS, Math.max(1, Number(req.query?.days) || 30));
  const days = lastDays(n);
  const commands = [["GET", "rm:since"]];
  for (const app of APPS) {
    commands.push(["GET", `rm:${app}:starts:total`]);
    for (const day of days) {
      commands.push(["GET", `rm:${app}:starts:${day}`], ["PFCOUNT", `rm:${app}:visitors:${day}`]);
    }
  }
  try {
    const results = await redis(commands);
    let i = 0;
    const since = results[i++] || null;
    const apps = {};
    for (const app of APPS) {
      const totalStarts = Number(results[i++]) || 0;
      const daily = days.map((day) => ({
        day,
        starts: Number(results[i++]) || 0,
        visitors: Number(results[i++]) || 0,
      }));
      apps[app] = { totalStarts, daily };
    }
    return res.status(200).json({ configured: true, since, days, apps });
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
