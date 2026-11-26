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
export async function removeGuest(email) {
  await redis(["SREM", GUESTS_KEY, normalizeEmail(email)]);
  await redis(["HDEL", ACCESS_KEY, normalizeEmail(email)]);
}

// ---- Welche Apps ein Gast benutzen darf (Omni Admin, Marco 2026-11-26)
// Ohne Eintrag darf ein Gast alle Apps benutzen (so wie bisher). Mit Eintrag
// (Hash rm:guest-apps, Feld = Adresse, Wert = JSON-Liste von App-IDs) nur die
// genannten. Marco (ADMIN_EMAIL) darf immer alles.

const ACCESS_KEY = "rm:guest-apps";
export const APP_IDS = ["retromind", "toolpulse", "smartcraft", "rumble", "ai-investment", "abocheck", "ms-akku"];

const parseApps = (raw) => {
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((id) => APP_IDS.includes(id)) : null;
  } catch {
    return null;
  }
};

/** The apps a guest may use, or null for all of them. */
export async function guestApps(email) {
  const raw = await redis(["HGET", ACCESS_KEY, normalizeEmail(email)]);
  return raw ? parseApps(raw) : null;
}

/** { email: [appIds] } for every guest limited to some apps. */
export async function listAccess() {
  const flat = (await redis(["HGETALL", ACCESS_KEY])) || [];
  const out = {};
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const apps = parseApps(flat[i + 1]);
    if (apps) out[flat[i]] = apps;
  }
  return out;
}

/** apps = list of app ids, or null for "all apps". */
export async function setGuestApps(email, apps) {
  const e = normalizeEmail(email);
  if (apps === null) return redis(["HDEL", ACCESS_KEY, e]);
  const list = [...new Set(apps.filter((id) => APP_IDS.includes(id)))];
  if (list.length === APP_IDS.length) return redis(["HDEL", ACCESS_KEY, e]);
  return redis(["HSET", ACCESS_KEY, e, JSON.stringify(list)]);
}

/** Whether an address on the guest list may use one app. */
export async function mayUseApp(email, appId) {
  const e = normalizeEmail(email);
  if (e === ADMIN_EMAIL) return true;
  const apps = await guestApps(e);
  return !apps || apps.includes(appId);
}

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

// ---- Marcos andere Apps (Marco, 2026-11-26: "alle Apps so wie RetroMind")
// ToolPulse, Sm@rtCraft 3.0, Rumble, AI Investment Manager, MS Akku und
// AboCheck teilen sich diese Gästeliste. Ihre Gästetür schickt Besucher zu
// /api/admin?view=pass&to=URL: wer hier als Gast angemeldet ist, kommt mit
// einem Einmal-Code (2 Minuten) zurück; die App löst ihn serverseitig mit
// APPS_GUEST_SECRET ein (action "appRedeem") und prüft später einmal am Tag
// nach (action "appGuest").

export const APP_ORIGINS = [
  "https://toolpulse-phi.vercel.app",
  "https://smartcraft-v3.vercel.app",
  "https://rumble-party.vercel.app",
  "https://ai-investment-manager-one.vercel.app",
  "https://ms-akku.vercel.app",
  "https://abocheck-frontend.vercel.app",
];
export const APP_PASS_PATH = "/_gate/pass";

const ORIGIN_APP = {
  "https://toolpulse-phi.vercel.app": "toolpulse",
  "https://smartcraft-v3.vercel.app": "smartcraft",
  "https://rumble-party.vercel.app": "rumble",
  "https://ai-investment-manager-one.vercel.app": "ai-investment",
  "https://ms-akku.vercel.app": "ms-akku",
  "https://abocheck-frontend.vercel.app": "abocheck",
};
/** App id for one of APP_ORIGINS. */
export const appIdForOrigin = (origin) => ORIGIN_APP[origin] || null;

const APP_NAMES = {
  retromind: "RetroMind",
  toolpulse: "ToolPulse",
  smartcraft: "Sm@rtCraft 3.0",
  rumble: "Rumble",
  "ai-investment": "AI Investment Manager",
  abocheck: "AboCheck",
  "ms-akku": "MS Akku",
};

/** A small page for a guest who is invited, but not to this app. */
export function noAccessPage(appId) {
  const name = APP_NAMES[appId] || "this app";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#051424;color:#d4e4fa;font:16px/1.5 system-ui,sans-serif;padding:24px;box-sizing:border-box}div{max-width:360px;text-align:center}h1{font-size:20px;margin:0 0 8px}p{margin:0 0 6px;color:#c7c4d7}</style></head>
<body><div><h1>No access to ${name}</h1><p>You are invited to Marco's apps, but not to this one. Ask Marco if you'd like to use it.</p>
<h1 lang="de" style="margin-top:20px">Kein Zugang zu ${name}</h1><p lang="de">Du bist zu Marcos Apps eingeladen, aber nicht zu dieser. Frag Marco, wenn du sie benutzen möchtest.</p></div></body></html>`;
  return html;
}

/** Constant-time check of the shared secret the apps send along. */
export function appSecretOk(given) {
  const want = process.env.APPS_GUEST_SECRET || "";
  const got = String(given || "");
  if (!want || got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}
