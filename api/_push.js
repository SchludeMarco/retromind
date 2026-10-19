// Web Push for both editions (VAPID; no outside service besides the
// browser's own push server). One subscription per device, filed under the
// guest's player hash (api/highscores.js playerId) in rm:hs:push:<pid>, with
// the topics this device asked for: "rivals" (someone passed you on a high
// score table) and "chat" (a message for you in the chat corner,
// api/_chat.js). Subscriptions from before topics existed count as "rivals".
// Files starting with "_" are not routes.

import crypto from "node:crypto";
import webpush from "web-push";

const PUSH_DAYS = 180;
export const TOPICS = ["rivals", "chat"];

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

const pushKey = (pid) => `rm:hs:push:${pid}`;

/** The player behind a guest's e-mail: a short one-way hash (same as the high score tables). */
export const playerOf = (email) =>
  crypto.createHash("sha256").update(`retromind-player|${String(email).toLowerCase()}`).digest("hex").slice(0, 16);

// Without VAPID_* settings the key pair is derived from the same secret as
// the guest cookie, so alerts work without any extra setup.
export function vapidKeys() {
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

const topicsOf = (record) => (Array.isArray(record.topics) ? record.topics : ["rivals"]);

/**
 * Switches a topic on or off for this device. `body.push` is the browser's
 * subscription (on) or null (off, with `body.endpoint`); without `body.topic`
 * off removes the device altogether ("Delete my data"). Returns
 * { ok, topics } with the topics this device still gets.
 */
export async function setPush(pid, body) {
  const endpoint = String(body.push?.endpoint || body.endpoint || "");
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 1000) return { ok: false };
  const topic = TOPICS.includes(body.topic) ? body.topic : null;
  const field = crypto.createHash("sha256").update(endpoint).digest("hex").slice(0, 16);
  const [raw] = await redis([["HGET", pushKey(pid), field]]);
  let old = null;
  try {
    old = raw ? JSON.parse(raw) : null;
  } catch {
    /* broken entry: start over */
  }
  if (!body.push) {
    const left = old && topic ? topicsOf(old).filter((t) => t !== topic) : [];
    if (left.length) await redis([["HSET", pushKey(pid), field, JSON.stringify({ ...old, topics: left })]]);
    else await redis([["HDEL", pushKey(pid), field]]);
    return { ok: true, topics: left };
  }
  const { keys } = body.push;
  if (!keys || typeof keys.p256dh !== "string" || typeof keys.auth !== "string") return { ok: false };
  const topics = [...new Set([...(old ? topicsOf(old) : []), topic || "rivals"])];
  const sub = { subscription: { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } }, lang: body.lang === "de" ? "de" : "en", topics };
  await redis([
    ["HSET", pushKey(pid), field, JSON.stringify(sub)],
    ["EXPIRE", pushKey(pid), PUSH_DAYS * 86_400],
  ]);
  return { ok: true, topics };
}

/** Sends `message(lang)` → {title, body, tag, url?} to every device of the player that asked for the topic. */
export async function sendPush(pid, topic, message) {
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
      if (!topicsOf(sub).includes(topic)) return;
      try {
        await webpush.sendNotification(sub.subscription, JSON.stringify(message(sub.lang === "de" ? "de" : "en")), { TTL: 86_400 });
      } catch (e) {
        // The browser dropped the subscription (app removed, permission taken back).
        if (e?.statusCode === 404 || e?.statusCode === 410) gone.push(field);
        else console.error("push:", e?.statusCode || e?.message || e);
      }
    })
  );
  if (gone.length) await redis([["HDEL", pushKey(pid), ...gone]]);
}
