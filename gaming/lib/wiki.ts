// Live web content from Wikipedia/Wikimedia. Both the REST and the action API
// allow anonymous cross-origin reads (`origin=*`), so this runs in the browser
// with no server or key. German text is preferred, English is the fallback.

export interface WikiSummary {
  title: string;
  extract: string;
  url: string;
  thumbnail?: string;
  lang: 'de' | 'en';
}

export interface WikiImage {
  src: string;
  caption: string;
  filePage: string;
}

export interface WikiSearchHit {
  title: string;
  snippet: string;
}

const rest = (lang: string) => `https://${lang}.wikipedia.org/api/rest_v1`;
const action = (lang: string) => `https://${lang}.wikipedia.org/w/api.php`;
const enc = (t: string) => encodeURIComponent(t.replace(/ /g, '_'));

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Finds the German counterpart of an English article via interlanguage links. */
async function germanTitle(enTitle: string): Promise<string | null> {
  const q = new URLSearchParams({
    action: 'query',
    titles: enTitle,
    prop: 'langlinks',
    lllang: 'de',
    redirects: '1',
    format: 'json',
    origin: '*',
  });
  const data = await getJson(`${action('en')}?${q}`);
  const pages = data?.query?.pages;
  if (!pages) return null;
  const page: any = Object.values(pages)[0];
  return page?.langlinks?.[0]?.['*'] ?? null;
}

async function summaryIn(lang: 'de' | 'en', title: string): Promise<WikiSummary | null> {
  const s = await getJson(`${rest(lang)}/page/summary/${enc(title)}`);
  if (!s || s.type === 'disambiguation' || !s.extract) return null;
  return {
    title: s.title,
    extract: s.extract,
    url: s.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${enc(title)}`,
    thumbnail: s.originalimage?.source ?? s.thumbnail?.source,
    lang,
  };
}

const summaryCache = new Map<string, Promise<WikiSummary | null>>();

export function fetchSummary(enTitle: string): Promise<WikiSummary | null> {
  if (!summaryCache.has(enTitle)) {
    summaryCache.set(
      enTitle,
      (async () => {
        const de = await germanTitle(enTitle);
        return (de && (await summaryIn('de', de))) || (await summaryIn('en', enTitle));
      })()
    );
  }
  return summaryCache.get(enTitle)!;
}

/**
 * Screenshots, box art and photos from the English article's media list.
 * Logos and icons are SVGs on Wikipedia, so skipping SVG drops most clutter.
 */
export async function fetchImages(enTitle: string, max = 8): Promise<WikiImage[]> {
  const data = await getJson(`${rest('en')}/page/media-list/${enc(enTitle)}`);
  const items: any[] = data?.items ?? [];
  return items
    .filter((it) => it.type === 'image' && it.showInGallery !== false && !/\.svg$/i.test(it.title ?? ''))
    .map((it) => {
      const best = (it.srcset ?? []).slice(-1)[0]?.src ?? '';
      return {
        src: best.startsWith('//') ? `https:${best}` : best,
        caption: (it.caption?.text ?? '').trim(),
        filePage: `https://en.wikipedia.org/wiki/${enc(it.title ?? '')}`,
      };
    })
    .filter((img) => img.src)
    .slice(0, max);
}

/** Free-text search for any video game on English Wikipedia. */
export async function searchGames(query: string): Promise<WikiSearchHit[]> {
  const q = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: `${query} video game`,
    srlimit: '8',
    format: 'json',
    origin: '*',
  });
  const data = await getJson(`${action('en')}?${q}`);
  const hits: any[] = data?.query?.search ?? [];
  return hits.map((h) => ({ title: h.title, snippet: String(h.snippet ?? '').replace(/<[^>]+>/g, '') }));
}
