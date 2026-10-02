// The live archive: beyond the curated picks, every filter pulls games
// straight from Wikipedia's category tree ("Game Boy games", "1991 video
// games", …). CirrusSearch's `incategory:` combines a platform with a whole
// decade in one query (`A|B` means either category), and the year comes back
// from the article's own "<year> video games" category.

import { Game } from '../data/games';
import { platformInfo } from '../data/platforms';

const API = 'https://en.wikipedia.org/w/api.php';
export const ARCHIVE_PAGE = 48;

const FIRST_YEAR = 1970;
const LAST_YEAR = new Date().getFullYear();
const yearCats = (from: number, to: number) => {
  const out: string[] = [];
  for (let y = Math.max(from, FIRST_YEAR); y <= Math.min(to, LAST_YEAR); y++) out.push(`${y} video games`);
  return out;
};

const underscore = (s: string) => s.replace(/ /g, '_');

export interface ArchiveQuery {
  platform: string | null;
  decade: { from: number; to: number } | null;
}

export interface ArchivePage {
  games: Game[];
  total: number;
  nextOffset: number | null;
}

/** Whether the archive has anything for this filter (it needs at least one). */
export function archiveSupports(q: ArchiveQuery): boolean {
  if (q.platform) return Boolean(platformInfo(q.platform));
  return Boolean(q.decade);
}

function searchFor(q: ArchiveQuery): string {
  const parts: string[] = [];
  const p = q.platform ? platformInfo(q.platform) : undefined;
  if (p) parts.push(`incategory:"${underscore(p.category)}"`);
  if (q.decade) parts.push(`incategory:${yearCats(q.decade.from, q.decade.to).map(underscore).join('|')}`);
  return parts.join(' ');
}

const cache = new Map<string, Promise<ArchivePage>>();

export function fetchArchive(q: ArchiveQuery, offset = 0): Promise<ArchivePage> {
  const key = `${q.platform}|${q.decade?.from}|${offset}`;
  if (!cache.has(key)) {
    const p = load(q, offset);
    cache.set(key, p);
    // A failed page should be retried next time, not remembered.
    p.then((r) => r.total === 0 && cache.delete(key));
  }
  return cache.get(key)!;
}

async function load(q: ArchiveQuery, offset: number): Promise<ArchivePage> {
  const empty = { games: [], total: 0, nextOffset: null };
  if (!archiveSupports(q)) return empty;
  // The year categories we ask about: just the decade, or every year.
  const years = q.decade ? yearCats(q.decade.from, q.decade.to) : yearCats(1970, LAST_YEAR);
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    origin: '*',
    generator: 'search',
    gsrsearch: searchFor(q),
    gsrnamespace: '0',
    gsrlimit: String(ARCHIVE_PAGE),
    gsroffset: String(offset),
    gsrinfo: 'totalhits',
    prop: 'categories',
    cllimit: 'max',
    // clcategories takes at most 50 titles; the newest years matter least
    // when no decade is chosen, since the year is only shown on the label.
    clcategories: years
      .slice(-50)
      .map((c) => `Category:${c}`)
      .join('|'),
  });
  try {
    const res = await fetch(`${API}?${params}`);
    if (!res.ok) return empty;
    const data = await res.json();
    const pages: any[] = data?.query?.pages ?? [];
    const total: number = data?.query?.searchinfo?.totalhits ?? pages.length;
    const next: number | undefined = data?.continue?.gsroffset;
    const games = pages
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .filter((p) => !/^(List of|Lists of|Index of)\b/.test(p.title))
      .map((p): Game => {
        const years = (p.categories ?? [])
          .map((c: any) => Number(/(\d{4}) video games$/.exec(c.title)?.[1]))
          .filter((y: number) => y > 0);
        const inDecade = q.decade ? years.filter((y: number) => y >= q.decade!.from && y <= q.decade!.to) : years;
        const year = inDecade.length ? Math.min(...inDecade) : years.length ? Math.min(...years) : 0;
        return {
          id: `wiki:${p.title}`,
          title: String(p.title).replace(/ \((\d{4} )?video game\)$/i, ''),
          year,
          platform: q.platform ?? 'Archiv',
          developer: '',
          genre: 'aus dem Archiv',
          wiki: p.title,
          blurb: 'Aus dem Archiv: öffnen für Infos, Screenshots und Guide.',
          custom: true,
        };
      });
    return { games, total, nextOffset: typeof next === 'number' ? next : null };
  } catch {
    return empty;
  }
}
