// The live archive: beyond the curated picks, every filter pulls games
// straight from Wikipedia's category tree ("Game Boy games", "1991 video
// games", …). CirrusSearch's `incategory:` combines a platform with a whole
// decade in one query (`A|B` means either category), and the year comes back
// from the article's own "<year> video games" category. Free-text search uses
// the same machinery, limited to articles with a video game infobox so
// franchise and character pages stay out.

import { Game } from '../data/games';
import { PLATFORMS, platformInfo } from '../data/platforms';

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

function cached(key: string, run: () => Promise<ArchivePage>): Promise<ArchivePage> {
  if (!cache.has(key)) {
    const p = run();
    cache.set(key, p);
    // A failed page should be retried next time, not remembered.
    p.then((r) => r.total === 0 && cache.delete(key));
  }
  return cache.get(key)!;
}

export function fetchArchive(q: ArchiveQuery, offset = 0): Promise<ArchivePage> {
  if (!archiveSupports(q)) return Promise.resolve(EMPTY);
  return cached(`${q.platform}|${q.decade?.from}|${offset}`, () => load(searchFor(q), offset, q));
}

/**
 * Games with the words in their title, e.g. every "Metroid" game. With
 * `related`, the games whose article only mentions the words instead
 * (Metroid-likes, spin-offs, games citing it as an influence).
 */
export function searchArchive(query: string, offset = 0, related = false): Promise<ArchivePage> {
  const words = query.replace(/["\\:]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return Promise.resolve(EMPTY);
  const infobox = 'hastemplate:"Infobox video game"';
  const search = related
    ? `${words.join(' ')} ${infobox} -intitle:"${words.join(' ')}"`
    : `${words.map((w) => `intitle:${w}`).join(' ')} ${infobox}`;
  return cached(`search|${related}|${words.join(' ').toLowerCase()}|${offset}`, async () => {
    const page = await load(search, offset, { platform: null, decade: null }, 'Fundstück');
    if (!related) return page;
    const note = `Erwähnt „${words.join(' ')}“, etwa als Vorbild oder Ableger.`;
    return { ...page, games: page.games.map((g) => ({ ...g, blurb: `${note} ${g.blurb?.startsWith('Auch für') ? g.blurb.split('.')[0] + '.' : ''}`.trim() })) };
  });
}

const EMPTY: ArchivePage = { games: [], total: 0, nextOffset: null };

async function getJson(params: Record<string, string>): Promise<any | null> {
  const qs = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', origin: '*', ...params });
  try {
    const res = await fetch(`${API}?${qs}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** Which systems each page belongs to, earliest system first. */
async function platformsOf(pageids: number[]): Promise<Map<number, string[]>> {
  const out = new Map<number, string[]>();
  if (!pageids.length) return out;
  const byCategory = new Map(PLATFORMS.map((p) => [`Category:${p.category}`, p]));
  const data = await getJson({
    pageids: pageids.join('|'),
    prop: 'categories',
    cllimit: 'max',
    clcategories: Array.from(byCategory.keys()).join('|'),
  });
  for (const page of data?.query?.pages ?? []) {
    const found = (page.categories ?? [])
      .map((c: any) => byCategory.get(c.title))
      .filter(Boolean)
      .sort((a: any, b: any) => a.from - b.from)
      .map((p: any) => p.id);
    out.set(page.pageid, found);
  }
  return out;
}

async function load(search: string, offset: number, q: ArchiveQuery, fallbackLabel = 'Archiv'): Promise<ArchivePage> {
  // The year categories we ask about: just the decade, or every year.
  const years = q.decade ? yearCats(q.decade.from, q.decade.to) : yearCats(FIRST_YEAR, LAST_YEAR);
  const data = await getJson({
    generator: 'search',
    gsrsearch: search,
    gsrnamespace: '0',
    gsrlimit: String(ARCHIVE_PAGE),
    gsroffset: String(offset),
    gsrinfo: 'totalhits',
    prop: 'categories',
    cllimit: 'max',
    // clcategories takes at most 50 titles; without a decade the oldest
    // years are dropped, since the year is only shown on the label.
    clcategories: years
      .slice(-50)
      .map((c) => `Category:${c}`)
      .join('|'),
  });
  if (!data) return EMPTY;
  const pages: any[] = (data.query?.pages ?? [])
    .sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0))
    .filter((p: any) => !/^(List of|Lists of|Index of)\b/.test(p.title));
  const total: number = data.query?.searchinfo?.totalhits ?? pages.length;
  const next: number | undefined = data.continue?.gsroffset;
  // Without a platform filter, look up each game's systems for its label.
  const systems = q.platform ? null : await platformsOf(pages.map((p) => p.pageid));
  const games = pages.map((p): Game => {
    const years = (p.categories ?? [])
      .map((c: any) => Number(/(\d{4}) video games$/.exec(c.title)?.[1]))
      .filter((y: number) => y > 0);
    const inDecade = q.decade ? years.filter((y: number) => y >= q.decade!.from && y <= q.decade!.to) : years;
    const year = inDecade.length ? Math.min(...inDecade) : years.length ? Math.min(...years) : 0;
    const found = systems?.get(p.pageid) ?? [];
    const platform = q.platform ?? found[0] ?? fallbackLabel;
    return {
      id: `wiki:${p.title}`,
      title: String(p.title).replace(/ \((\d{4} )?video game\)$/i, ''),
      year,
      platform,
      developer: '',
      genre: found.length > 1 ? `auch für ${found.slice(1).join(', ')}` : 'aus dem Archiv',
      wiki: p.title,
      blurb:
        found.length > 1
          ? `Auch für ${found.slice(1).join(', ')}. Öffnen für Infos, Screenshots und Guide.`
          : 'Aus dem Archiv: öffnen für Infos, Screenshots und Guide.',
      custom: true,
    };
  });
  return { games, total, nextOffset: typeof next === 'number' ? next : null };
}
