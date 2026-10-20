// The chat corner (Marco, 2026-10-19: "Ich möchte einen Chat zwischen Usern
// ermöglichen"): invited guests write to each other, in one shared room
// ("all") or person to person. Only guests who joined the chat in the app
// (agreeing that their messages are stored here) can read or write, and only
// invited guests get this far: the middleware lets nobody in without the
// guest cookie, and this function reads the guest's e-mail from that signed
// cookie. The e-mail itself is never stored or shown; a guest appears under a
// name they choose and a random-looking id (a keyed hash of the address), so
// nobody can write in someone else's name.
//
// GET    /api/chat                         → { ready, me: {id, name, admin} | null, people: [{id, name}],
//                                               last: {all?: at, <id>?: at} } newest message from others
// GET    /api/chat?with=all|<id>&after=ms  → { ready, messages: [{id, from, name, text, at, mine}] }
// POST   /api/chat {name}                  → joins the chat or changes the name
// POST   /api/chat {to: "all"|<id>, text}  → { message }
// DELETE /api/chat?with=…&id=…             → deletes one of your messages (Marco: any in the room)
// DELETE /api/chat?all=1                   → leaves the chat: profile, messages, conversations
//
// No open connections on the Hobby plan, so the app asks again every few
// seconds while a conversation is open, and about once a minute otherwise.
// Messages are kept for 30 days (and at most the newest 300 per
// conversation). A direct message also goes out as a push message to the
// recipient's devices (topic "chat"), a message in the room to everyone else
// in the chat (topic "room", off unless switched on), each as their
// notification settings allow (api/_push.js).
//
// Served through api/highscores.js (vercel.json rewrites /api/chat there),
// because the Hobby plan allows only 12 functions per deployment.
// Storage: the same Upstash Redis as /api/stats.

import crypto from "node:crypto";
import { readJsonBody } from "./_admin.js";
import { ADMIN_EMAIL, guestsConfigured, readCookie } from "./_guests.js";
import { playerOf, sendPush } from "./_push.js";

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

const DAY = 86_400_000;
const KEEP_DAYS = 30;
const KEEP = 300;
const SHOW = 100;
const MAX_TEXT = 1000;
const MAX_NAME = 24;
const PER_MINUTE = 20;
// Someone who hasn't opened the chat for half a year drops off the list of people.
const GONE_AFTER = 180 * DAY;

const PEOPLE = "rm:chat:people";
const ROOM = "rm:chat:room";
const dmKey = (a, b) => `rm:chat:dm:${[a, b].sort().join(":")}`;
const inKey = (id) => `rm:chat:in:${id}`;
const rateKey = (id) => `rm:chat:rate:${id}`;
const convKey = (me, other) => (other === "all" ? ROOM : dmKey(me, other));

const validId = (s) => typeof s === "string" && /^[0-9a-f]{16}$/.test(s);
const clean = (s, max) =>
  typeof s === "string" ? s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max) : "";

/**
 * The guest's chat id: a keyed hash of the e-mail, so nobody can work it out
 * from an address. Keyed with the database token, which both projects share
 * (one database), so a guest is the same person in both editions.
 */
const chatIdOf = (email) =>
  crypto
    .createHmac("sha256", redisToken() || "")
    .update(`retromind-chat|${String(email).toLowerCase()}`)
    .digest("hex")
    .slice(0, 16);

function parsePeople(flat) {
  const out = new Map();
  for (let i = 0; i + 1 < (flat || []).length; i += 2) {
    try {
      out.set(flat[i], JSON.parse(flat[i + 1]));
    } catch {
      /* skip a broken entry */
    }
  }
  return out;
}

function parseMessages(raw, me) {
  return (raw || []).flatMap((s) => {
    try {
      const m = JSON.parse(s);
      return [{ id: m.id, from: m.from, name: m.name, text: m.text, at: m.at, mine: m.from === me }];
    } catch {
      return [];
    }
  });
}

/** Drops messages past the 30 days and beyond the newest 300. */
const trim = (k) => [
  ["ZREMRANGEBYSCORE", k, "-inf", Date.now() - KEEP_DAYS * DAY],
  ["ZREMRANGEBYRANK", k, 0, -(KEEP + 1)],
  ["PEXPIRE", k, KEEP_DAYS * DAY],
];

export default async function chatHandler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  // Without the guest list the site is open to anyone, and so would be the chat.
  if (!guestsConfigured()) return res.status(200).json({ ready: false, me: null, people: [], last: {}, messages: [] });
  const guest = await readCookie(req.headers.cookie);
  if (!guest) return res.status(401).json({ error: "guests_only" });
  const me = chatIdOf(guest.email);
  const admin = guest.email === ADMIN_EMAIL;
  const now = Date.now();

  try {
    const [peopleFlat] = await redis([["HGETALL", PEOPLE]]);
    const people = parsePeople(peopleFlat);
    const self = people.get(me);

    if (req.method === "GET" && !req.query?.with) {
      const [incoming, recent] = await redis([
        ["ZRANGE", inKey(me), 0, -1, "WITHSCORES"],
        ["ZRANGE", ROOM, -20, -1],
      ]);
      const gone = [...people].filter(([id, p]) => id !== me && now - (p.seen || p.at || 0) > GONE_AFTER).map(([id]) => id);
      const writes = gone.length ? [["HDEL", PEOPLE, ...gone]] : [];
      // "Seen" is kept to the day, so a poll doesn't write each time.
      if (self && now - (self.seen || 0) > DAY) writes.push(["HSET", PEOPLE, me, JSON.stringify({ ...self, seen: now })]);
      if (writes.length) await redis(writes);
      const last = {};
      if (self) {
        for (let i = 0; i + 1 < (incoming || []).length; i += 2) last[incoming[i]] = Number(incoming[i + 1]);
        const fromOthers = parseMessages(recent, me).filter((m) => !m.mine && m.at > now - KEEP_DAYS * DAY);
        if (fromOthers.length) last.all = fromOthers[fromOthers.length - 1].at;
      }
      return res.status(200).json({
        ready: true,
        me: self ? { id: me, name: self.name, admin } : null,
        // Only those who joined see who else is here.
        people: self
          ? [...people]
              .filter(([id]) => id !== me && !gone.includes(id))
              .map(([id, p]) => ({ id, name: p.name }))
              .sort((a, b) => a.name.localeCompare(b.name))
          : [],
        last,
      });
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      if ("name" in body && !("text" in body)) {
        const name = clean(body.name, MAX_NAME);
        if (name.length < 2) return res.status(400).json({ error: "bad_name" });
        await redis([["HSET", PEOPLE, me, JSON.stringify({ name, pid: playerOf(guest.email), at: self?.at || now, seen: now })]]);
        return res.status(200).json({ ok: true, me: { id: me, name, admin } });
      }
      if (!self) return res.status(403).json({ error: "not_joined" });
      const to = body.to === "all" ? "all" : validId(body.to) && body.to !== me && people.has(body.to) ? body.to : null;
      const text = clean(body.text, MAX_TEXT);
      if (!to) return res.status(400).json({ error: "unknown_person" });
      if (!text) return res.status(400).json({ error: "empty" });
      const [, count] = await redis([
        ["SET", rateKey(me), 0, "EX", 60, "NX"],
        ["INCR", rateKey(me)],
      ]);
      if (count > PER_MINUTE) return res.status(429).json({ error: "slow_down" });
      const message = { id: crypto.randomBytes(6).toString("hex"), from: me, name: self.name, text, at: now };
      const k = convKey(me, to);
      const commands = [["ZADD", k, now, JSON.stringify(message)], ...trim(k)];
      if (to !== "all") commands.push(["ZADD", inKey(to), now, me], ["PEXPIRE", inKey(to), KEEP_DAYS * DAY]);
      await redis(commands);
      if (to === "all") {
        // One push per person (several chat ids can share a player), the newest message replaces the last one.
        const pids = new Set([...people.entries()].filter(([id, p]) => id !== me && p.pid && p.pid !== self.pid).map(([, p]) => p.pid));
        await Promise.all(
          [...pids].map((pid) =>
            sendPush(pid, "room", (lang) => ({
              title: `💬 ${self.name} · ${lang === "de" ? "Alle zusammen" : "Everyone"}`,
              body: text.length > 140 ? `${text.slice(0, 139)}…` : text,
              tag: "rm-chat-room",
              chat: "all",
            })).catch((e) => console.error("room push:", e?.message || e))
          )
        );
      } else {
        const pid = people.get(to)?.pid;
        if (pid) {
          await sendPush(pid, "chat", () => ({
            title: `💬 ${self.name}`,
            body: text.length > 140 ? `${text.slice(0, 139)}…` : text,
            tag: `rm-chat-${me}`,
            chat: me,
          })).catch((e) => console.error("chat push:", e?.message || e));
        }
      }
      return res.status(200).json({ message: { ...message, mine: true } });
    }

    if (!self) return res.status(200).json({ ready: true, messages: [], error: "not_joined" });

    if (req.method === "GET") {
      const other = req.query.with === "all" ? "all" : validId(req.query.with) ? req.query.with : null;
      if (!other) return res.status(400).json({ error: "unknown_person" });
      const oldest = now - KEEP_DAYS * DAY;
      const after = Math.max(oldest, Number(req.query.after) || 0);
      const [raw] = await redis([["ZRANGE", convKey(me, other), "+inf", `(${after}`, "BYSCORE", "REV", "LIMIT", 0, SHOW]]);
      return res.status(200).json({ ready: true, messages: parseMessages(raw, me).reverse() });
    }

    if (req.method === "DELETE") {
      if (req.query?.all) {
        // Leaving: the profile, every own message in the room and every conversation with me.
        const [room] = await redis([["ZRANGE", ROOM, 0, -1]]);
        const mine = (room || []).filter((s) => {
          try {
            return JSON.parse(s).from === me;
          } catch {
            return false;
          }
        });
        const commands = [["HDEL", PEOPLE, me], ["DEL", inKey(me)]];
        if (mine.length) commands.push(["ZREM", ROOM, ...mine]);
        for (const id of people.keys()) if (id !== me) commands.push(["DEL", dmKey(me, id)], ["ZREM", inKey(id), me]);
        await redis(commands);
        return res.status(200).json({ ok: true });
      }
      const other = req.query.with === "all" ? "all" : validId(req.query.with) ? req.query.with : null;
      const id = String(req.query.id || "");
      if (!other || !/^[0-9a-f]{12}$/.test(id)) return res.status(400).json({ error: "bad_request" });
      const k = convKey(me, other);
      const [raw] = await redis([["ZRANGE", k, 0, -1]]);
      const hit = (raw || []).find((s) => {
        try {
          const m = JSON.parse(s);
          return m.id === id && (m.from === me || (admin && other === "all"));
        } catch {
          return false;
        }
      });
      if (!hit) return res.status(404).json({ error: "not_found" });
      await redis([["ZREM", k, hit]]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).end();
  } catch (e) {
    console.error("chat:", e?.message || e);
    return res.status(200).json({ ready: false, me: null, people: [], last: {}, messages: [] });
  }
}
