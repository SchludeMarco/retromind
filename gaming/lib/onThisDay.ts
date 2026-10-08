import { viaProxy } from '../../lib/privacy';

// "Today X years ago": video games released on today's date, from Wikidata
// (only exact release days, best known first), fetched through /api/proxy.

export interface DayGame {
  /** English Wikipedia article title. */
  wiki: string;
  year: number;
}

const ENDPOINT = 'https://query.wikidata.org/sparql';

function query(month: number, day: number, before: number) {
  return `SELECT ?title ?date ?links WHERE {
  ?item wdt:P31 wd:Q7889; p:P577/psv:P577 [wikibase:timeValue ?date; wikibase:timePrecision 11]; wikibase:sitelinks ?links.
  FILTER(?links > 15)
  FILTER(MONTH(?date) = ${month} && DAY(?date) = ${day} && YEAR(?date) < ${before})
  ?article schema:about ?item; schema:isPartOf <https://en.wikipedia.org/>; schema:name ?title.
} ORDER BY DESC(?links) LIMIT 15`;
}

let cached: Promise<DayGame[]> | null = null;

export function fetchOnThisDay(now = new Date()): Promise<DayGame[]> {
  if (cached) return cached;
  const qs = new URLSearchParams({ format: 'json', query: query(now.getMonth() + 1, now.getDate(), now.getFullYear()) });
  cached = fetch(viaProxy(`${ENDPOINT}?${qs}`))
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const seen = new Set<string>();
      return ((data?.results?.bindings ?? []) as any[])
        .map((b) => ({ wiki: String(b.title?.value ?? ''), year: Number(String(b.date?.value ?? '').slice(0, 4)) }))
        .filter((g) => g.wiki && g.year > 1970 && !seen.has(g.wiki) && seen.add(g.wiki));
    })
    .catch(() => []);
  return cached;
}
