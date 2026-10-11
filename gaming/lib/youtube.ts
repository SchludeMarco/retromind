// Client for /api/youtube: videos for a game, best rated first.

import { LOCALE, tr } from '../../lib/i18n';

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

/** What kind of clips: playthroughs, the music, or the TV ads from back then. */
export type VideoKind = 'gameplay' | 'soundtrack' | 'commercial';
const SUFFIX: Record<VideoKind, string> = {
  gameplay: 'gameplay',
  soundtrack: 'soundtrack OST',
  commercial: 'commercial TV ad',
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const SEQUEL = /^(\d{1,3}|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)$/;

/**
 * How well a video title fits the game: 2 = names the game, 1 = doesn't name
 * it (kept, but further down), 0 = a sequel or spin-off ("Fallout 4" for
 * "Fallout"), which is dropped.
 */
export function videoFit(videoTitle: string, gameTitle: string): 0 | 1 | 2 {
  const game = norm(gameTitle).replace(/^the /, '');
  if (!game) return 1;
  const words = norm(videoTitle).split(' ');
  const g = game.split(' ');
  for (let i = 0; i + g.length <= words.length; i++) {
    if (g.some((w, j) => words[i + j] !== w)) continue;
    const next = words[i + g.length] ?? '';
    // "Fallout 1" is still the first one, any other number is another game.
    if (SEQUEL.test(next) && next !== '1' && next !== 'i') return 0;
    return 2;
  }
  return 1;
}

/** Drops sequels and puts the videos that name the game first. */
export const pickForGame = (videos: YouTubeVideo[], gameTitle: string) => {
  const fit = videos.map((v) => ({ v, f: videoFit(v.title, gameTitle) })).filter((x) => x.f > 0);
  return [...fit.filter((x) => x.f === 2), ...fit.filter((x) => x.f === 1)].map((x) => x.v);
};

export function fetchVideos(
  game: { title: string; platform: string; year?: number },
  kind: VideoKind = 'gameplay'
): Promise<YouTubeVideo[]> {
  const platform = game.platform === 'Fundstück' || game.platform === 'Multiplattform' ? '' : game.platform;
  // The year keeps "Fallout" (1997) from turning into Fallout 4.
  const q = `${game.title} ${game.year || ''} ${platform} ${SUFFIX[kind]}`.replace(/\s+/g, ' ').trim();
  if (!cache.has(q)) {
    cache.set(
      q,
      fetch(`/api/youtube?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : { videos: [] }))
        .then((d) => pickForGame(Array.isArray(d.videos) ? d.videos : [], game.title))
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
    ? tr(
        `${(n / 1_000_000).toLocaleString(LOCALE, { maximumFractionDigits: 1 })}M views`,
        `${(n / 1_000_000).toLocaleString(LOCALE, { maximumFractionDigits: 1 })} Mio. Aufrufe`
      )
    : n >= 1000
      ? tr(`${Math.round(n / 1000).toLocaleString(LOCALE)}K views`, `${Math.round(n / 1000).toLocaleString(LOCALE)}k Aufrufe`)
      : n
        ? tr(`${n} views`, `${n} Aufrufe`)
        : '';
