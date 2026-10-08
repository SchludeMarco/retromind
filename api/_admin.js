// Shared helpers for the admin functions (files starting with "_" are not
// exposed as routes by Vercel): who counts as admin, JSON bodies and CORS for
// the admin page on the Gaming domain, which reads feedback and the live
// check from the main domain (only that project has the GitHub token).

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "marco.schlude@gmail.com").toLowerCase();
const ADMIN_ORIGINS = ["https://retromind.vercel.app", "https://retromind-gaming.vercel.app"];

// Google access tokens are opaque; Google's tokeninfo endpoint says whose
// they are and which OAuth client they were issued to.
export async function isAdmin(req) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (!token || !clientId) return false;
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`);
    if (!res.ok) return false;
    const info = await res.json();
    return (
      info.aud === clientId &&
      String(info.email_verified) === "true" &&
      String(info.email || "").toLowerCase() === ADMIN_EMAIL &&
      Number(info.expires_in) > 0
    );
  } catch (err) {
    console.error("admin auth failed", err);
    return false;
  }
}

/** Sets CORS headers for the two RetroMind origins; true when the request was a preflight. */
export function cors(req, res) {
  const origin = String(req.headers.origin || "");
  if (ADMIN_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export async function readJsonBody(req) {
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
