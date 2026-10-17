// Guest list ("Nur für Eingeladene", Marco 2026-10-15): RetroMind opens only
// for people Marco invited. The list of e-mail addresses lives in the shared
// Upstash database (set rm:guests), Marco (ADMIN_EMAIL) is always invited.
// After a Google sign-in on /gate.html the server hands out a signed cookie;
// middleware.js lets requests through only with a valid one. Files starting
// with "_" are not routes. Only Web Crypto and fetch here, so the middleware
// can use it too.

export const COOKIE = "rm_guest";
const MAX_AGE = 30 * 24 * 3600; // a guest stays signed in for 30 days after the last check
export const RECHECK_AFTER = 24 * 3600; // the list is checked again at most once a day
const GUESTS_KEY = "rm:guests";

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "marco.schlude@gmail.com").toLowerCase();

const redisUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const guestsConfigured = () => !!(redisUrl() && redisToken() && secret());
const secret = () => process.env.GUEST_SECRET || redisToken() || "";

async function redis(command) {
  const res = await fetch(redisUrl(), {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const out = await res.json();
  if (out.error) throw new Error(`redis: ${out.error}`);
  return out.result;
}

export const normalizeEmail = (s) => String(s || "").trim().toLowerCase();
export const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 200;

export async function isGuest(email) {
  const e = normalizeEmail(email);
  if (!e) return false;
  if (e === ADMIN_EMAIL) return true;
  return (await redis(["SISMEMBER", GUESTS_KEY, e])) === 1;
}
export const listGuests = async () => ((await redis(["SMEMBERS", GUESTS_KEY])) || []).sort();
export const addGuest = (email) => redis(["SADD", GUESTS_KEY, normalizeEmail(email)]);
export const removeGuest = (email) => redis(["SREM", GUESTS_KEY, normalizeEmail(email)]);

// ---- signed cookie: base64url(email).issuedAt.hmac

const enc = new TextEncoder();
const b64url = (s) => btoa(String.fromCharCode(...enc.encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = (s) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

async function hmac(text) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function makeCookie(email, secure = true) {
  const e = normalizeEmail(email);
  const iat = Math.floor(Date.now() / 1000);
  const value = `${b64url(e)}.${iat}.${await hmac(`${e}.${iat}`)}`;
  return `${COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`;

/** { email, age } from a valid, unexpired cookie header, else null. */
export async function readCookie(cookieHeader) {
  const m = new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`).exec(String(cookieHeader || ""));
  if (!m || !secret()) return null;
  const [e64, iatStr, sig] = m[1].split(".");
  if (!e64 || !iatStr || !sig) return null;
  let email;
  try {
    email = unb64url(e64);
  } catch {
    return null;
  }
  const iat = Number(iatStr);
  const age = Math.floor(Date.now() / 1000) - iat;
  if (!Number.isFinite(iat) || age < 0 || age > MAX_AGE) return null;
  if ((await hmac(`${email}.${iat}`)) !== sig) return null;
  return { email, age };
}

/** The verified e-mail of a Google access token issued to our OAuth client, else null. */
export async function googleEmail(token) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (!token || !clientId) return null;
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`);
  if (!res.ok) return null;
  const info = await res.json();
  if (info.aud !== clientId || String(info.email_verified) !== "true" || !(Number(info.expires_in) > 0)) return null;
  return normalizeEmail(info.email);
}

// ---- handoff between the two domains (Zeitreise ⇄ Gaming)
// Cookies don't cross domains, so a link to the other edition goes through
// /api/admin?view=handoff: for a signed-in guest it parks the address under a
// random one-time code in the shared database (2 minutes) and adds the code to
// the link; middleware.js on the other domain redeems it and sets that
// domain's own cookie, so the guest doesn't sign in at its door again.

export const HANDOFF_PARAM = "rm_handoff";
export const HANDOFF_ORIGINS = ["https://retromind.vercel.app", "https://retromind-gaming.vercel.app"];
const HANDOFF_TTL = 120;

export async function createHandoff(email) {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const code = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  await redis(["SET", `rm:handoff:${code}`, normalizeEmail(email), "EX", HANDOFF_TTL]);
  return code;
}

/** The address behind a one-time code (the code is used up), else null. */
export async function redeemHandoff(code) {
  if (!/^[0-9a-f]{48}$/.test(String(code || ""))) return null;
  return (await redis(["GETDEL", `rm:handoff:${code}`])) || null;
}

// The kept Google sign-in of this domain (api/_googleKeep.js) rides along with
// the same one-time code, so the other domain stays signed in as well.
export async function parkHandoffGoogle(code, value) {
  await redis(["SET", `rm:handoff:g:${code}`, value, "EX", HANDOFF_TTL]);
}

export async function takeHandoffGoogle(code) {
  if (!/^[0-9a-f]{48}$/.test(String(code || ""))) return null;
  return (await redis(["GETDEL", `rm:handoff:g:${code}`])) || null;
}
