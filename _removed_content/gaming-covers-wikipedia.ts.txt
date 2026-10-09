import { useEffect, useState } from 'react';
import { viaProxy } from '../../lib/privacy';

// Box art for the cartridge cards: the lead image of each game's English
// Wikipedia article, which for games is almost always the cover scan.
// Covers are non-free images, hence `pilicense=any`. Cards ask one at a
// time, but the requests are pooled into one API call of up to 50 titles.

const API = 'https://en.wikipedia.org/w/api.php';
const BATCH = 50;

const known = new Map<string, string | null>();
const waiting = new Map<string, ((src: string | null) => void)[]>();
let timer: number | undefined;

async function fetchBatch(titles: string[]): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>(titles.map((t) => [t, null]));
  const qs = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    origin: '*',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '320',
    pilicense: 'any',
    pilimit: String(BATCH),
    redirects: '1',
    titles: titles.join('|'),
  });
  try {
    const res = await fetch(viaProxy(`${API}?${qs}`));
    if (!res.ok) return out;
    const data = await res.json();
    // Follow the spelling fixes and redirects back to the title we were asked.
    const back = new Map<string, string>();
    for (const step of [...(data.query?.normalized ?? []), ...(data.query?.redirects ?? [])]) {
      back.set(step.to, back.get(step.from) ?? step.from);
    }
    for (const page of data.query?.pages ?? []) {
      const src: string | undefined = page.thumbnail?.source;
      const asked = back.get(page.title) ?? page.title;
      if (src && !/\.svg/i.test(src)) out.set(asked, viaProxy(src));
    }
  } catch {
    // Offline or blocked: the cards simply stay without a cover.
  }
  return out;
}

function flush() {
  timer = undefined;
  const titles = Array.from(waiting.keys());
  for (let i = 0; i < titles.length; i += BATCH) {
    const chunk = titles.slice(i, i + BATCH);
    fetchBatch(chunk).then((found) => {
      for (const t of chunk) {
        const src = found.get(t) ?? null;
        known.set(t, src);
        (waiting.get(t) ?? []).forEach((cb) => cb(src));
        waiting.delete(t);
      }
    });
  }
}

function request(title: string, cb: (src: string | null) => void) {
  const list = waiting.get(title);
  if (list) return void list.push(cb);
  waiting.set(title, [cb]);
  if (timer === undefined) timer = window.setTimeout(flush, 60);
}

/** The cover image URL for a Wikipedia article: undefined while it loads, null when there is none. */
export function useCoverLookup(wikiTitle: string): string | null | undefined {
  const [src, setSrc] = useState<string | null | undefined>(() => known.get(wikiTitle));
  useEffect(() => {
    if (known.has(wikiTitle)) return void setSrc(known.get(wikiTitle) ?? null);
    setSrc(undefined);
    let live = true;
    request(wikiTitle, (s) => live && setSrc(s));
    return () => {
      live = false;
    };
  }, [wikiTitle]);
  return src;
}

/** The cover image URL for a Wikipedia article, or null when there is none (yet). */
export function useCover(wikiTitle: string): string | null {
  return useCoverLookup(wikiTitle) ?? null;
}
