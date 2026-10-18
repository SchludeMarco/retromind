// The family book (Marco, 2026-10-18): one question a week that all invited
// guests answer and read together. It is the only place where something a
// person writes leaves their own device, so it only takes answers from
// people who agreed to that in the app (lib/familyBook.ts) and only from
// invited guests: the middleware lets nobody in without the guest cookie, and
// this function reads the guest's e-mail from that signed cookie. The e-mail
// itself is never stored; answers are filed under a one-way hash of it, so a
// guest can change or delete their own answer from any device and nobody can
// write in someone else's name.
//
// GET    /api/family?week=YYYY-MM-DD → { ready, week, answers: [{name, text, question, at, mine}] }
// GET    /api/family?since=YYYY-MM-DD → { ready, count } answers written by others after that day
// POST   /api/family {week, name, text, question} → saves or replaces the guest's answer
// DELETE /api/family?week=YYYY-MM-DD → deletes the guest's answer for that week
// DELETE /api/family?all=1           → deletes all of the guest's answers ("Delete my data")
//
// Served through api/stats.js (vercel.json rewrites /api/family there),
// because the Hobby plan allows only 12 functions per deployment.
//
// Storage: the same Upstash Redis as /api/stats, one hash per week
// (rm:family:<week>, field = author hash) and a set of weeks that have answers.

import crypto from "node:crypto";
import { readJsonBody } from "./_admin.js";
import { guestsConfigured, readCookie } from "./_guests.js";

const redisUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

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

const WEEKS = "rm:family:weeks";
const weekKey = (week) => `rm:family:${week}`;
const MAX_TEXT = 2000;
const MAX_NAME = 40;
const MAX_QUESTION = 300;

const validDay = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00Z`));
// A week is the Monday it starts on; tomorrow's Monday is fine (time zones), later ones are not.
const validWeek = (s) =>
  validDay(s) && new Date(`${s}T12:00:00Z`).getUTCDay() === 1 && Date.parse(`${s}T00:00:00Z`) <= Date.now() + 2 * 86_400_000;

const clean = (s, max) =>
  typeof s === "string" ? s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max) : "";

const authorOf = (email) =>
  crypto.createHash("sha256").update(`retromind-family|${String(email).toLowerCase()}`).digest("hex").slice(0, 32);

function parseHash(flat, me) {
  const out = [];
  for (let i = 0; i + 1 < (flat || []).length; i += 2) {
    try {
      const a = JSON.parse(flat[i + 1]);
      out.push({ name: a.name, text: a.text, question: a.question || "", at: a.at, mine: flat[i] === me });
    } catch {
      /* skip a broken entry */
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

export default async function familyHandler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  // Without the guest list the site is open to anyone, and so would be the family book.
  if (!guestsConfigured()) return res.status(200).json({ ready: false, answers: [] });
  const guest = await readCookie(req.headers.cookie);
  if (!guest) return res.status(401).json({ error: "guests_only" });
  const me = authorOf(guest.email);

  try {
    if (req.method === "GET") {
      const since = req.query?.since;
      if (validDay(since)) {
        // New answers by others since a day: checks this and last week, enough for the letter in the Stube.
        const weeks = ((await redis([["SMEMBERS", WEEKS]]))[0] || []).filter((w) => w >= addDays(since, -6));
        if (!weeks.length) return res.status(200).json({ ready: true, count: 0 });
        const flats = await redis(weeks.map((w) => ["HGETALL", weekKey(w)]));
        const after = Date.parse(`${since}T23:59:59Z`);
        const count = flats.flatMap((f) => parseHash(f, me)).filter((a) => !a.mine && a.at > after).length;
        return res.status(200).json({ ready: true, count });
      }
      const week = req.query?.week;
      if (!validWeek(week)) return res.status(400).json({ error: "bad_week" });
      const [flat, weeks] = await redis([["HGETALL", weekKey(week)], ["SMEMBERS", WEEKS]]);
      return res.status(200).json({ ready: true, week, answers: parseHash(flat, me), weeks: (weeks || []).sort() });
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const week = body.week;
      const name = clean(body.name, MAX_NAME);
      const text = clean(body.text, MAX_TEXT);
      const question = clean(body.question, MAX_QUESTION);
      if (!validWeek(week) || !name || !text) return res.status(400).json({ error: "bad_entry" });
      const entry = JSON.stringify({ name, text, question, at: Date.now() });
      await redis([["HSET", weekKey(week), me, entry], ["SADD", WEEKS, week]]);
      const [flat] = await redis([["HGETALL", weekKey(week)]]);
      return res.status(200).json({ ready: true, week, answers: parseHash(flat, me) });
    }

    if (req.method === "DELETE") {
      if (req.query?.all) {
        const weeks = (await redis([["SMEMBERS", WEEKS]]))[0] || [];
        if (weeks.length) await redis(weeks.map((w) => ["HDEL", weekKey(w), me]));
        return res.status(200).json({ ready: true, deleted: true });
      }
      const week = req.query?.week;
      if (!validWeek(week)) return res.status(400).json({ error: "bad_week" });
      await redis([["HDEL", weekKey(week), me]]);
      const [flat] = await redis([["HGETALL", weekKey(week)]]);
      return res.status(200).json({ ready: true, week, answers: parseHash(flat, me) });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).end();
  } catch (err) {
    console.error("family:", err?.message || err);
    return res.status(502).json({ error: "upstream" });
  }
}

function addDays(day, n) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
