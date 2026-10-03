// YouTube videos for a game in "RetroMind – Gaming". GET /api/youtube?q=…
// returns up to 12 videos, the best rated (most liked, else most viewed)
// first. With YOUTUBE_API_KEY (YouTube Data API v3) the official API is
// used; without it the public search page is read as a fallback. Answers
// are cached by Vercel's CDN for a day, which keeps the API quota low.

const MAX = 12;

const toInt = (s) => {
  const n = parseInt(String(s ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

async function viaApi(q, key) {
  const search = new URL("https://www.googleapis.com/youtube/v3/search");
  search.search = new URLSearchParams({
    part: "snippet",
    q,
    type: "video",
    videoEmbeddable: "true",
    maxResults: String(MAX),
    relevanceLanguage: "de",
    safeSearch: "moderate",
    key,
  }).toString();
  const res = await fetch(search);
  if (!res.ok) throw new Error(`youtube search ${res.status}`);
  const items = (await res.json()).items || [];
  const ids = items.map((i) => i.id?.videoId).filter(Boolean);
  if (!ids.length) return [];

  const stats = new URL("https://www.googleapis.com/youtube/v3/videos");
  stats.search = new URLSearchParams({ part: "statistics,contentDetails", id: ids.join(","), key }).toString();
  const sres = await fetch(stats);
  const byId = {};
  if (sres.ok) for (const v of (await sres.json()).items || []) byId[v.id] = v;

  return items
    .filter((i) => i.id?.videoId)
    .map((i) => {
      const v = byId[i.id.videoId];
      return {
        id: i.id.videoId,
        title: i.snippet?.title || "",
        channel: i.snippet?.channelTitle || "",
        thumb: i.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${i.id.videoId}/mqdefault.jpg`,
        views: toInt(v?.statistics?.viewCount),
        likes: toInt(v?.statistics?.likeCount),
        duration: v?.contentDetails?.duration || "",
      };
    });
}

// Walks ytInitialData from the search page and collects videoRenderer entries.
function collectVideos(node, out) {
  if (!node || typeof node !== "object" || out.length >= MAX) return;
  if (Array.isArray(node)) {
    for (const n of node) collectVideos(n, out);
    return;
  }
  const v = node.videoRenderer;
  if (v?.videoId) {
    out.push({
      id: v.videoId,
      title: v.title?.runs?.map((r) => r.text).join("") || "",
      channel: v.ownerText?.runs?.[0]?.text || "",
      thumb: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
      views: toInt(v.viewCountText?.simpleText),
      likes: 0,
      duration: v.lengthText?.simpleText || "",
    });
    return;
  }
  for (const k in node) collectVideos(node[k], out);
}

export function parseSearchPage(html) {
  const m = html.match(/ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/s);
  if (!m) return [];
  let data;
  try {
    data = JSON.parse(m[1]);
  } catch {
    return [];
  }
  const out = [];
  collectVideos(data, out);
  return out;
}

async function viaPage(q) {
  // sp=EgIQAQ== limits the results to videos
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgIQAQ%253D%253D&hl=de&gl=DE`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
      Cookie: "CONSENT=YES+1; SOCS=CAI",
    },
  });
  if (!res.ok) throw new Error(`youtube page ${res.status}`);
  return parseSearchPage(await res.text());
}

export const rank = (videos) =>
  [...videos].sort((a, b) => b.likes - a.likes || b.views - a.views);

export default async function handler(req, res) {
  const url = new URL(req.url, "https://local");
  const q = (url.searchParams.get("q") || "").trim().slice(0, 120);
  if (!q) {
    res.status(400).json({ error: "missing_query" });
    return;
  }
  try {
    const key = process.env.YOUTUBE_API_KEY;
    let videos = [];
    if (key) {
      try {
        videos = await viaApi(q, key);
      } catch (e) {
        console.error("youtube api:", e?.message || e);
      }
    }
    if (!videos.length) videos = await viaPage(q);
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json({ videos: rank(videos).slice(0, MAX), source: key ? "api" : "page" });
  } catch (e) {
    console.error("youtube error:", e?.message || e);
    res.setHeader("Cache-Control", "public, s-maxage=600");
    res.status(502).json({ error: "upstream", videos: [] });
  }
}
