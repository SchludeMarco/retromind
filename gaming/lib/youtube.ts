// Client for /api/youtube: videos for a game, best rated first.

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  thumb: string;
  views: number;
  likes: number;
  duration: string;
}

const cache = new Map<string, Promise<YouTubeVideo[]>>();

export function fetchVideos(game: { title: string; platform: string }): Promise<YouTubeVideo[]> {
  const platform = game.platform === 'Fundstück' || game.platform === 'Multiplattform' ? '' : game.platform;
  const q = `${game.title} ${platform} gameplay`.replace(/\s+/g, ' ').trim();
  if (!cache.has(q)) {
    cache.set(
      q,
      fetch(`/api/youtube?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : { videos: [] }))
        .then((d) => (Array.isArray(d.videos) ? d.videos : []))
        .catch(() => {
          cache.delete(q);
          return [];
        })
    );
  }
  return cache.get(q)!;
}

export const formatViews = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mio. Aufrufe`
    : n >= 1000
      ? `${Math.round(n / 1000).toLocaleString('de-DE')}k Aufrufe`
      : n
        ? `${n} Aufrufe`
        : '';
