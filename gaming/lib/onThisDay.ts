import { viaProxy } from '../../lib/privacy';

// "Today X years ago": video games released on today's date, from Wikidata
// (only exact release days, best known first), fetched through /api/proxy.

export interface DayGame {
  /** English Wikipedia article title. */
  wiki: string;
  year: number;
}

const ENDPOINT = 'https://query.wikidata.org/sparql';

// The exact dates are listed up front, so Wikidata looks them up in its
// index instead of scanning every video game (that timed out).
function query(month: number, day: number, before: number) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const dates: string[] = [];
  for (let y = 1971; y < before; y++) dates.push(`"${y}-${mm}-${dd}T00:00:00Z"^^xsd:dateTime`);
  return `SELECT ?title ?date ?links WHERE {
  VALUES ?date { ${dates.join(' ')} }
  ?item wdt:P577 ?date; wdt:P31 wd:Q7889; wikibase:sitelinks ?links.
  FILTER(?links > 15)
  ?article schema:about ?item; schema:isPartOf <https://en.wikipedia.org/>; schema:name ?title.
} ORDER BY DESC(?links) LIMIT 15`;
}

let cached: Promise<DayGame[]> | null = null;

/** Best known first, but games 20 years or older go to the front (it's a retro hall). */
export function fetchOnThisDay(now = new Date()): Promise<DayGame[]> {
  if (cached) return cached;
  // Dates known only by year are stored as 1 January, so that day would mislead.
  if (now.getMonth() === 0 && now.getDate() === 1) return (cached = Promise.resolve([]));
  const qs = new URLSearchParams({ format: 'json', query: query(now.getMonth() + 1, now.getDate(), now.getFullYear()) });
  cached = fetch(viaProxy(`${ENDPOINT}?${qs}`))
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const seen = new Set<string>();
      return ((data?.results?.bindings ?? []) as any[])
        .map((b) => ({ wiki: String(b.title?.value ?? ''), year: Number(String(b.date?.value ?? '').slice(0, 4)) }))
        .filter((g) => g.wiki && g.year > 1970 && !seen.has(g.wiki) && seen.add(g.wiki))
        .sort((a, b) => Number(now.getFullYear() - b.year >= 20) - Number(now.getFullYear() - a.year >= 20));
    })
    .catch(() => []);
  return cached;
}
