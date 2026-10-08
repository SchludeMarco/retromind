// The 30-second preview of a song, for the muffled music in front of the
// gaming hall (Marco, 2026-10-08: outside it should sound dull and bassy, but
// be exactly the song that plays inside). Spotify's own player can't be run
// through a filter in the browser, so the door plays this short clip of the
// same song through a low-pass instead, and inside Spotify plays it in full.
//
// GET /api/spotify-preview?track=<spotify id>&q=<title · artist>
// 1. Spotify's public embed page of the track names its preview clip
//    (p.scdn.co/mp3-preview/…).
// 2. If there is none, Deezer's public search finds the same song by title
//    and artist and has a preview clip too.
// The clip is fetched here on the server and passed on as audio, so the
// visitor's browser never contacts Spotify's or Deezer's preview servers.
// Nothing from the visitor's request goes upstream except the song. 404 when
// no clip is found; the app then plays its own muffled recording.

const TRACK_ID = /^[A-Za-z0-9]{22}$/;
const USER_AGENT = "Mozilla/5.0 (compatible; RetroMind/2.0; +https://retromind.vercel.app)";
const PREVIEW_HOSTS = [/^p\.scdn\.co$/, /^cdns?-preview-[a-z0-9-]+\.dzcdn\.net$/, /^cdnt-preview\.dzcdn\.net$/];
// Vercel functions answer with at most 4.5 MB; a 30 s mp3 is well below 1 MB.
const MAX_BYTES = 4 * 1024 * 1024;

async function spotifyPreview(id) {
  try {
    const res = await fetch(`https://open.spotify.com/embed/track/${id}`, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en;q=0.8" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/https:\\?\/\\?\/p\.scdn\.co\\?\/mp3-preview\\?\/[A-Za-z0-9]+/);
    return m ? m[0].replace(/\\\//g, "/") : null;
  } catch {
    return null;
  }
}

async function deezerPreview(q) {
  const [title, artist] = q.split(" · ");
  if (!title) return null;
  const query = artist ? `artist:"${artist.split(",")[0].trim()}" track:"${title.trim()}"` : title;
  try {
    const res = await fetch(`https://api.deezer.com/search?limit=1&q=${encodeURIComponent(query)}`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const url = data?.data?.[0]?.preview;
    return typeof url === "string" && url.startsWith("https://") ? url : null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  const track = String(req.query?.track ?? "");
  const q = String(req.query?.q ?? "").slice(0, 160);
  if (track && !TRACK_ID.test(track)) return res.status(400).json({ error: "bad_track" });
  if (!track && !q) return res.status(400).json({ error: "no_song" });

  const url = (track && (await spotifyPreview(track))) || (q && (await deezerPreview(q)));
  const notFound = () => {
    res.setHeader("Cache-Control", "public, s-maxage=3600");
    return res.status(404).json({ error: "no_preview" });
  };
  if (!url) return notFound();
  let target;
  try {
    target = new URL(url);
  } catch {
    return notFound();
  }
  if (!PREVIEW_HOSTS.some((re) => re.test(target.hostname))) return notFound();

  let upstream;
  try {
    upstream = await fetch(target, { headers: { "User-Agent": USER_AGENT } });
  } catch {
    return res.status(502).json({ error: "upstream" });
  }
  const type = upstream.headers.get("content-type") || "audio/mpeg";
  if (!upstream.ok || !type.startsWith("audio/")) return notFound();
  const body = Buffer.from(await upstream.arrayBuffer());
  if (body.length > MAX_BYTES) return res.status(413).json({ error: "too_large" });

  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  return res.status(200).send(body);
}
