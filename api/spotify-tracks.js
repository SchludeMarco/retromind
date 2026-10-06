// Track list of a Spotify playlist, so the app can play its songs in random
// order: Spotify's embed player has no shuffle and always starts a playlist
// with its first song. GET /api/spotify-tracks?playlist=<id> reads the
// playlist's public embed page on the server (no login, no key) and returns
// the track ids found in it. Vercel's CDN caches the answer for a day. If
// Spotify changes the page, the list comes back empty and the app simply
// plays the playlist from the top as before.

const PLAYLIST_ID = /^[A-Za-z0-9]{22}$/;
const USER_AGENT = "Mozilla/5.0 (compatible; RetroMind/2.0; +https://retromind.vercel.app)";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  const playlist = String(req.query?.playlist ?? "");
  if (!PLAYLIST_ID.test(playlist)) return res.status(400).json({ error: "bad_playlist" });

  let html = "";
  try {
    const upstream = await fetch(`https://open.spotify.com/embed/playlist/${playlist}`, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "de,en;q=0.8" },
    });
    if (upstream.ok) html = await upstream.text();
  } catch {
    /* answered below with an empty list */
  }

  // The page carries the list as "spotify:track:<id>" uris in its data
  // block; plain /track/<id> links are the fallback.
  const ids = new Set();
  for (const m of html.matchAll(/spotify:track:([A-Za-z0-9]{22})/g)) ids.add(m[1]);
  if (!ids.size) for (const m of html.matchAll(/\/track\/([A-Za-z0-9]{22})/g)) ids.add(m[1]);

  const tracks = [...ids];
  const names = trackNames(html);
  res.setHeader(
    "Cache-Control",
    tracks.length ? "public, s-maxage=86400, stale-while-revalidate=604800" : "public, s-maxage=300"
  );
  return res.status(200).json({ tracks, names });
}

// The page's data block (__NEXT_DATA__) lists every track as an object with
// its uri, a title and the artists as subtitle. Anything unexpected: no names.
function trackNames(html) {
  const names = {};
  const m = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return names;
  let data;
  try {
    data = JSON.parse(m[1]);
  } catch {
    return names;
  }
  const walk = (node, depth) => {
    if (!node || typeof node !== "object" || depth > 30) return;
    if (Array.isArray(node)) return node.forEach((n) => walk(n, depth + 1));
    const uri = typeof node.uri === "string" ? node.uri.match(/^spotify:track:([A-Za-z0-9]{22})$/) : null;
    if (uri && typeof node.title === "string" && node.title.trim()) {
      const artist = typeof node.subtitle === "string" ? node.subtitle.trim() : "";
      names[uri[1]] = (artist ? `${node.title.trim()} · ${artist}` : node.title.trim()).slice(0, 120);
      return;
    }
    for (const v of Object.values(node)) walk(v, depth + 1);
  };
  walk(data, 0);
  return names;
}
