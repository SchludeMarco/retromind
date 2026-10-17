// Google sign-in that stays (Marco, 2026-10-17: "die Anmeldung soll auf jedem
// Gerät erhalten bleiben"). Google gives the browser only one-hour tokens and
// renewing them in the browser always opens a popup. So the sign-in tap goes
// through Google's code flow instead: the server trades the code for a
// refresh token (needs GOOGLE_CLIENT_SECRET), keeps it encrypted in an
// HttpOnly cookie of this domain (only /api/admin sees it) and hands the
// browser fresh one-hour tokens from it without any popup. Links to the other
// domain carry the cookie along with the guest's one-time code (api/admin.js
// ?view=handoff, middleware.js). Only Web Crypto and fetch here, so the
// middleware can use it too.

export const KEEP_COOKIE = "rm_gkeep";
const KEEP_PATH = "/api/admin";
const MAX_AGE = 400 * 24 * 3600; // browsers cap cookies at 400 days; renewed with every new token

const clientId = () => process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
const clientSecret = () => process.env.GOOGLE_CLIENT_SECRET || "";
export const keepConfigured = () => !!(clientId() && clientSecret());

const enc = new TextEncoder();
const toB64url = (bytes) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function key() {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(`rm-gkeep:${clientSecret()}`));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function seal(refreshToken) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const box = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(), enc.encode(refreshToken)));
  return `${toB64url(iv)}.${toB64url(box)}`;
}

async function open(value) {
  const [iv, box] = String(value || "").split(".");
  if (!iv || !box) return null;
  try {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64url(iv) }, await key(), fromB64url(box));
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

/** The raw (still encrypted) cookie value, for carrying it to the other domain. */
export function readKeepValue(cookieHeader) {
  const m = new RegExp(`(?:^|;\\s*)${KEEP_COOKIE}=([^;]+)`).exec(String(cookieHeader || ""));
  return m && /^[\w-]+\.[\w-]+$/.test(m[1]) ? m[1] : null;
}

export const keepCookie = (value) =>
  `${KEEP_COOKIE}=${value}; Path=${KEEP_PATH}; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Lax; Secure`;
export const clearKeepCookie = () => `${KEEP_COOKIE}=; Path=${KEEP_PATH}; Max-Age=0; HttpOnly; SameSite=Lax; Secure`;

async function tokenCall(params) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId(), client_secret: clientSecret(), ...params }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && !!data.access_token, data };
}

/** Code from the sign-in popup → { accessToken, expiresIn, cookie }. */
export async function exchangeCode(code) {
  const { ok, data } = await tokenCall({ code, grant_type: "authorization_code", redirect_uri: "postmessage" });
  if (!ok) return null;
  return {
    accessToken: data.access_token,
    expiresIn: Number(data.expires_in) || 3600,
    cookie: data.refresh_token ? keepCookie(await seal(data.refresh_token)) : null,
  };
}

/** A fresh access token from the cookie; gone: true when Google no longer accepts it. */
export async function refreshFromCookie(cookieHeader) {
  const refreshToken = await open(readKeepValue(cookieHeader));
  if (!refreshToken) return { gone: true };
  const { ok, data } = await tokenCall({ refresh_token: refreshToken, grant_type: "refresh_token" });
  if (!ok) return { gone: data.error === "invalid_grant" };
  return {
    accessToken: data.access_token,
    expiresIn: Number(data.expires_in) || 3600,
    cookie: keepCookie(readKeepValue(cookieHeader)),
  };
}
