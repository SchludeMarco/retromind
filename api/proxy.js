// Privacy proxy for third-party content. GET /api/proxy?u=<url> fetches an
// image, sound or Wikipedia API answer on the server and passes it on, so the
// visitor's browser never contacts Wikipedia, Wikimedia, YouTube's image
// server or the sound library itself (no IP address reaches them). Only the
// hosts below are allowed, nothing from the visitor's request is forwarded,
// and Vercel's CDN caches the answers.

const ALLOWED_HOSTS = [
  /^[a-z-]+\.wikipedia\.org$/,
  // commons, upload and thumb (Wikimedia's image servers)
  /^(commons|upload|thumb)\.wikimedia\.org$/,
  /^i\.ytimg\.com$/,
  /^assets\.mixkit\.co$/,
  /^www\.transparenttextures\.com$/,
];

const ALLOWED_TYPES = /^(image\/|audio\/|application\/json|application\/problem\+json)/;
// Vercel functions answer with at most 4.5 MB.
const MAX_BYTES = 4 * 1024 * 1024;
const USER_AGENT = "RetroMind/2.0 (https://retromind.vercel.app; privacy proxy)";

const allowed = (url) =>
  url.protocol === "https:" && ALLOWED_HOSTS.some((re) => re.test(url.hostname));

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end();
  }

  let target;
  try {
    target = new URL(String(req.query?.u ?? ""));
  } catch {
    return res.status(400).json({ error: "bad_url" });
  }
  if (!allowed(target)) return res.status(403).json({ error: "host_not_allowed" });

  let upstream;
  try {
    upstream = await fetch(target, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json, image/*, audio/*;q=0.9" },
      redirect: "follow",
    });
  } catch {
    return res.status(502).json({ error: "upstream" });
  }
  // Commons' Special:FilePath redirects; the final host must be allowed too.
  if (upstream.url && !allowed(new URL(upstream.url))) return res.status(403).json({ error: "host_not_allowed" });

  const type = upstream.headers.get("content-type") || "application/octet-stream";
  if (!ALLOWED_TYPES.test(type)) return res.status(415).json({ error: "type_not_allowed" });

  const body = Buffer.from(await upstream.arrayBuffer());
  if (body.length > MAX_BYTES) return res.status(413).json({ error: "too_large" });

  const isJson = type.startsWith("application/");
  res.setHeader("Content-Type", type);
  res.setHeader(
    "Cache-Control",
    upstream.ok
      ? isJson
        ? "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
        : "public, max-age=604800, s-maxage=2592000, immutable"
      : "public, s-maxage=300"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Never run anything from a proxied file (e.g. an SVG opened directly).
  res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  return res.status(upstream.status).send(req.method === "HEAD" ? "" : body);
}
