import { viaProxy } from '../../lib/privacy';
import { isGerman, LOCALE, tr } from '../../lib/i18n';

// "Facts & secrets" on the game page: everything we may show and pass on,
// all fetched through our own server (/api/proxy), so the visitor's browser
// never contacts Wikipedia, Wikidata or The Cutting Room Floor directly.
//
//  - Fact sheet and old review scores from Wikidata (CC0, public domain).
//  - The full Wikipedia article split into its sections (CC BY-SA 4.0).
//  - Unused and hidden content from The Cutting Room Floor (tcrf.net,
//    CC BY 3.0), text only: its screenshots belong to the game makers.
//  - Direct links into game databases, as listed on Wikidata.
//
// Every block names its source, license and a link to the authors.

export interface FactRow {
  id: string;
  label: string;
  values: string[];
}

export interface ReviewScore {
  by: string;
  score: string;
  platform?: string;
}

export interface DbLink {
  name: string;
  url: string;
  text: string;
}

export interface GameFacts {
  qid: string;
  rows: FactRow[];
  reviews: ReviewScore[];
  links: DbLink[];
  /** Page name on tcrf.net, if Wikidata knows one. */
  tcrf?: string;
}

export interface ArticleSection {
  title: string;
  level: number;
  text: string;
  /** Development, trivia, music, censorship …: the less obvious stories. */
  behindTheScenes: boolean;
}

export interface Article {
  title: string;
  lang: 'de' | 'en';
  url: string;
  historyUrl: string;
  intro: string;
  sections: ArticleSection[];
}

export interface TcrfPage {
  title: string;
  url: string;
  historyUrl: string;
  sections: { title: string; text: string }[];
}

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(viaProxy(url), { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const memo = <T>(fn: (key: string) => Promise<T>) => {
  const cache = new Map<string, Promise<T>>();
  return (key: string) => {
    if (!cache.has(key)) cache.set(key, fn(key));
    return cache.get(key)!;
  };
};

const wikiApi = (lang: string) => `https://${lang}.wikipedia.org/w/api.php`;
const wikiUrl = (lang: string, title: string) => `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

/** Wikidata item id and German article title of an English article, in one request. */
const pageInfo = memo(async (enTitle: string) => {
  const q = new URLSearchParams({
    action: 'query',
    titles: enTitle,
    prop: 'pageprops|langlinks',
    ppprop: 'wikibase_item',
    lllang: 'de',
    redirects: '1',
    format: 'json',
    origin: '*',
  });
  const data = await getJson(`${wikiApi('en')}?${q}`);
  const page: any = data?.query?.pages ? Object.values(data.query.pages)[0] : null;
  return {
    enTitle: (page?.title as string) ?? enTitle,
    qid: (page?.pageprops?.wikibase_item as string) ?? null,
    deTitle: (page?.langlinks?.[0]?.['*'] as string) ?? null,
  };
});

// --- Wikidata fact sheet -----------------------------------------------------

/** Wikidata properties shown in the fact sheet, in this order. */
const PROPS: [string, string, string][] = [
  ['P178', 'Developer', 'Entwickler'],
  ['P123', 'Publisher', 'Publisher'],
  ['P750', 'Distributed by', 'Vertrieb'],
  ['P57', 'Director', 'Regie'],
  ['P287', 'Designed by', 'Spieldesign'],
  ['P943', 'Programming', 'Programmierung'],
  ['P86', 'Music', 'Musik'],
  ['P162', 'Producer', 'Produktion'],
  ['P58', 'Writer', 'Drehbuch'],
  ['P725', 'Voice actors', 'Sprecher'],
  ['P408', 'Engine', 'Engine'],
  ['P577', 'Released', 'Erschienen'],
  ['P400', 'Platforms', 'Plattformen'],
  ['P136', 'Genre', 'Genre'],
  ['P404', 'Game modes', 'Spielmodi'],
  ['P479', 'Controls', 'Steuerung'],
  ['P437', 'Media', 'Datenträger'],
  ['P495', 'Country of origin', 'Herkunftsland'],
  ['P179', 'Series', 'Reihe'],
  ['P155', 'Preceded by', 'Vorgänger'],
  ['P156', 'Followed by', 'Nachfolger'],
  ['P144', 'Based on', 'Basiert auf'],
  ['P737', 'Influenced by', 'Inspiriert von'],
  ['P4969', 'Remakes & spin-offs', 'Remakes & Ableger'],
  ['P1080', 'Universe', 'Universum'],
  ['P674', 'Characters', 'Figuren'],
  ['P840', 'Setting', 'Schauplatz'],
  ['P2408', 'Set in', 'Spielt in'],
  ['P921', 'Main subject', 'Thema'],
  ['P2664', 'Units sold', 'Verkaufte Exemplare'],
  ['P166', 'Awards', 'Auszeichnungen'],
  ['P1411', 'Nominated for', 'Nominiert für'],
  ['P852', 'ESRB rating', 'ESRB-Einstufung'],
  ['P908', 'PEGI rating', 'PEGI-Einstufung'],
  ['P914', 'USK rating', 'USK-Einstufung'],
  ['P444', 'Review scores', 'Wertungen'],
];

/** Game databases worth a direct link (Wikidata external ids). */
const DB_PROPS: [string, string, string, string][] = [
  ['P8607', 'The Cutting Room Floor', 'Unused content, debug menus and hidden messages', 'Unbenutzte Inhalte, Debug-Menüs und versteckte Botschaften'],
  ['P11688', 'MobyGames', 'Credits of everyone involved, all versions', 'Credits aller Beteiligten, alle Versionen'],
  ['P4769', 'GameFAQs', 'Walkthroughs, maps and cheats', 'Komplettlösungen, Karten und Cheats'],
  ['P10850', 'Kultboy', 'German magazine reviews from back then', 'Deutsche Testberichte von damals'],
  ['P12709', 'TheLegacy', 'German game museum (archived)', 'Deutsches Spielemuseum (archiviert)'],
  ['P7564', 'OGDB', 'Online games database with German releases', 'Online-Spiele-Datenbank mit deutschen Ausgaben'],
  ['P5659', 'VGMdb', 'Soundtrack releases and composers', 'Soundtrack-Veröffentlichungen und Komponisten'],
  ['P7981', 'ExoticA', 'Amiga music and game history', 'Amiga-Musik und Spielegeschichte'],
  ['P4816', 'Lemon64', 'C64 fan database with reviews and trivia', 'C64-Fandatenbank mit Wertungen und Trivia'],
  ['P11129', 'C64-Wiki', 'German C64 wiki', 'Deutsches C64-Wiki'],
  ['P4917', 'Gamebase64', 'C64 game archive', 'C64-Spielearchiv'],
  ['P4846', 'Lemon Amiga', 'Amiga fan database with reviews and trivia', 'Amiga-Fandatenbank mit Wertungen und Trivia'],
  ['P4671', 'Hall of Light', 'The Amiga games database', 'Die Amiga-Spiele-Datenbank'],
  ['P7516', 'Software Preservation Society', 'Preserved original disks', 'Gesicherte Originaldisketten'],
  ['P4705', 'Spectrum Computing', 'ZX Spectrum database', 'ZX-Spectrum-Datenbank'],
  ['P4847', 'CPC-Power', 'Amstrad CPC database', 'Amstrad-CPC-Datenbank'],
  ['P4859', 'Atarimania', 'Atari database with scans', 'Atari-Datenbank mit Scans'],
  ['P724', 'Internet Archive', 'Preserved copy at the Internet Archive', 'Gesicherte Kopie im Internet Archive'],
  ['P1733', 'Steam', 'Buy and play it today', 'Heute kaufen und spielen'],
  ['P2725', 'GOG', 'Buy and play it today, DRM-free', 'Heute kaufen und spielen, ohne DRM'],
  ['P5794', 'IGDB', 'Internet Game Database', 'Internet Game Database'],
  ['P14470', 'Giant Bomb', 'Community wiki', 'Community-Wiki'],
];

const sparql = (query: string) => getJson(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`);

const isQid = (s: string) => /^Q\d+$/.test(s);
const val = (b: any, k: string): string => b?.[k]?.value ?? '';

function formatDate(iso: string, precision: number): string {
  const m = /^([+-]?\d{4,})-(\d\d)-(\d\d)/.exec(iso);
  if (!m) return iso;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (precision <= 9 || mo === 0) return String(y);
  const date = new Date(Date.UTC(y, mo - 1, d || 1));
  if (precision === 10 || d === 0) return date.toLocaleDateString(LOCALE, { year: 'numeric', month: 'long', timeZone: 'UTC' });
  return date.toLocaleDateString(LOCALE, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

async function factSheet(qid: string): Promise<Omit<GameFacts, 'qid' | 'links' | 'tcrf'>> {
  const values = PROPS.map(([p]) => `("${p}" p:${p} ps:${p} psv:${p})`).join(' ');
  const langs = isGerman ? "de,mul,en" : "en,mul,de";
  const data = await sparql(`SELECT ?pid ?v ?vLabel ?prec ?platLabel ?byLabel ?placeLabel WHERE {
  VALUES (?pid ?p ?ps ?psv) { ${values} }
  wd:${qid} ?p ?st . ?st ?ps ?v .
  FILTER NOT EXISTS { ?st wikibase:rank wikibase:DeprecatedRank }
  OPTIONAL { ?st ?psv ?vn . ?vn wikibase:timePrecision ?prec }
  OPTIONAL { ?st pq:P400 ?plat }
  OPTIONAL { ?st pq:P447 ?by }
  OPTIONAL { ?st pq:P291 ?place }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${langs}". }
} LIMIT 600`);
  const bindings: any[] = data?.results?.bindings ?? [];
  const byProp = new Map<string, Set<string>>();
  const reviews: ReviewScore[] = [];
  const seenReview = new Set<string>();
  for (const b of bindings) {
    const pid = val(b, 'pid');
    const raw = val(b, 'v');
    const label = val(b, 'vLabel');
    const plat = val(b, 'platLabel');
    const place = val(b, 'placeLabel');
    if (pid === 'P444') {
      const by = val(b, 'byLabel');
      const key = `${by}|${raw}|${plat}`;
      if (!raw || seenReview.has(key)) continue;
      seenReview.add(key);
      reviews.push({ by: by && !isQid(by) ? by : tr('Review', 'Test'), score: raw, platform: plat && !isQid(plat) ? plat : undefined });
      continue;
    }
    let text: string;
    if (b.v?.datatype?.endsWith('#dateTime')) {
      text = formatDate(raw, Number(val(b, 'prec') || 11));
      const extra = [plat, place].filter((x) => x && !isQid(x)).join(', ');
      if (extra) text += ` (${extra})`;
    } else if (b.v?.datatype?.endsWith('#decimal') || b.v?.datatype?.endsWith('#integer')) {
      const n = Number(raw);
      text = Number.isFinite(n) ? n.toLocaleString(LOCALE) : raw;
      if (plat && !isQid(plat)) text += ` (${plat})`;
    } else if (b.v?.type === 'uri') {
      if (!label || isQid(label)) continue;
      text = label;
    } else {
      text = label || raw;
    }
    if (!byProp.has(pid)) byProp.set(pid, new Set());
    byProp.get(pid)!.add(text);
  }
  const rows = PROPS.filter(([p]) => p !== 'P444' && byProp.has(p)).map(([p, en, de]) => ({
    id: p,
    label: tr(en, de),
    values: [...byProp.get(p)!],
  }));
  return { rows, reviews };
}

async function dbLinks(qid: string): Promise<{ links: DbLink[]; tcrf?: string }> {
  const values = DB_PROPS.map(([p]) => `wd:${p}`).join(' ');
  const data = await sparql(`SELECT ?prop ?id ?fmt WHERE {
  VALUES ?prop { ${values} }
  ?prop wikibase:directClaim ?wdt ; wdt:P1630 ?fmt .
  wd:${qid} ?wdt ?id .
} LIMIT 200`);
  const bindings: any[] = data?.results?.bindings ?? [];
  const found = new Map<string, { id: string; fmt: string }>();
  for (const b of bindings) {
    const pid = val(b, 'prop').split('/').pop()!;
    // One link per database is enough (some list every platform version).
    if (!found.has(pid)) found.set(pid, { id: val(b, 'id'), fmt: val(b, 'fmt') });
  }
  const links: DbLink[] = [];
  for (const [pid, name, en, de] of DB_PROPS) {
    const hit = found.get(pid);
    if (!hit?.fmt.includes('$1')) continue;
    const url = hit.fmt.replace('$1', hit.fmt.includes('?') ? encodeURIComponent(hit.id) : encodeURI(hit.id));
    if (!/^https?:\/\//.test(url)) continue;
    links.push({ name, url, text: tr(en, de) });
  }
  return { links, tcrf: found.get('P8607')?.id };
}

/** Fact sheet, review scores and database links for a game (Wikidata, CC0). */
export const fetchFacts = memo(async (enTitle: string): Promise<GameFacts | null> => {
  const { qid } = await pageInfo(enTitle);
  if (!qid) return null;
  const [sheet, db] = await Promise.all([factSheet(qid), dbLinks(qid)]);
  return { qid, ...sheet, ...db };
});

// --- Wikipedia article in sections -------------------------------------------

/** Sections that are only lists of references or links. */
const SKIP_SECTIONS =
  /^(references|notes|footnotes|citations|sources|bibliography|external links|see also|further reading|einzelnachweise|anmerkungen|quellen|weblinks|literatur|siehe auch|belege|fußnoten)$/i;

/** Headings for the stories behind a game rather than how it plays. */
const BEHIND =
  /develop|production|history|origin|concept|design|music|sound|audio|trivia|easter|secret|hidden|unused|cut |cancel|unreleased|controvers|censor|ban|lawsuit|legal|record|speedrun|legacy|cultural|impact|marketing|promotion|ports?\b|conversion|version|remake|re-?release|sales|commercial|entwickl|produktion|geschichte|entstehung|hintergr|musik|soundtrack|trivia|wissenswert|kurios|geheim|versteckt|zensur|indizier|beschlagnahm|kontrovers|rechtsstreit|rekord|vermächtnis|nachwirkung|bedeutung|einfluss|portierung|umsetzung|versionen|neuauflage|verkauf|vermarktung|werbung/i;

export function parseExtract(text: string): { intro: string; sections: ArticleSection[] } {
  const parts = text.split(/\n(={2,6})\s*(.+?)\s*\1\n/);
  const intro = parts[0].trim();
  const sections: ArticleSection[] = [];
  let skipBelow = 0;
  for (let i = 1; i < parts.length; i += 3) {
    const level = parts[i].length;
    const title = parts[i + 1];
    const body = (parts[i + 2] ?? '').trim();
    if (skipBelow && level > skipBelow) continue;
    skipBelow = 0;
    if (SKIP_SECTIONS.test(title)) {
      skipBelow = level;
      continue;
    }
    sections.push({ title, level, text: body, behindTheScenes: BEHIND.test(title) });
  }
  // A sub-section about development counts for its parent too, and the
  // other way round, so whole chapters stay together.
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (s.level !== 2) continue;
    let j = i + 1;
    while (j < sections.length && sections[j].level > 2) j++;
    const kids = sections.slice(i + 1, j);
    if (s.behindTheScenes) kids.forEach((k) => (k.behindTheScenes = true));
    else if (kids.some((k) => k.behindTheScenes) && !s.text) s.behindTheScenes = true;
  }
  return { intro, sections: sections.filter((s, i) => s.text || (sections[i + 1]?.level ?? 0) > s.level) };
}

async function articleIn(lang: 'de' | 'en', title: string): Promise<Article | null> {
  const q = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'extracts',
    explaintext: '1',
    exsectionformat: 'wiki',
    redirects: '1',
    format: 'json',
    origin: '*',
  });
  const data = await getJson(`${wikiApi(lang)}?${q}`);
  const page: any = data?.query?.pages ? Object.values(data.query.pages)[0] : null;
  if (!page?.extract) return null;
  const { intro, sections } = parseExtract(`\n${page.extract}\n`);
  return {
    title: page.title,
    lang,
    url: wikiUrl(lang, page.title),
    historyUrl: `https://${lang}.wikipedia.org/w/index.php?title=${encodeURIComponent(page.title.replace(/ /g, '_'))}&action=history`,
    intro,
    sections,
  };
}

/** Which article languages exist for a game (English is always tried). */
export async function articleLanguages(enTitle: string): Promise<('de' | 'en')[]> {
  const { deTitle } = await pageInfo(enTitle);
  return deTitle ? ['de', 'en'] : ['en'];
}

/** The whole Wikipedia article, cut into its sections (CC BY-SA 4.0). */
export const fetchArticle = memo(async (key: string): Promise<Article | null> => {
  const [lang, enTitle] = [key.slice(0, 2) as 'de' | 'en', key.slice(3)];
  const info = await pageInfo(enTitle);
  if (lang === 'de') return info.deTitle ? articleIn('de', info.deTitle) : null;
  return articleIn('en', info.enTitle);
});

export const articleKey = (lang: 'de' | 'en', enTitle: string) => `${lang}:${enTitle}`;

// --- The Cutting Room Floor --------------------------------------------------

/** Text of a tcrf.net page by section; images, tables and galleries are left out. */
export const fetchTcrf = memo(async (page: string): Promise<TcrfPage | null> => {
  const q = new URLSearchParams({
    action: 'parse',
    page: page.replace(/_/g, ' '),
    prop: 'text',
    redirects: '1',
    disableeditsection: '1',
    disabletoc: '1',
    format: 'json',
    formatversion: '2',
  });
  const data = await getJson(`https://tcrf.net/api.php?${q}`);
  const html: string | undefined = data?.parse?.text;
  if (!html || typeof DOMParser === 'undefined') return null;
  // DOMParser builds an inert document: no scripts run, no images load.
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('table, .gallery, .thumb, figure, img, style, script, sup.reference, .mw-references-wrap, .references, .noprint, .mw-empty-elt').forEach((el) => el.remove());
  const root = doc.querySelector('.mw-parser-output') ?? doc.body;
  const sections: { title: string; text: string }[] = [];
  let current = { title: '', text: '' };
  const flush = () => {
    const text = current.text.replace(/\n{3,}/g, '\n\n').trim();
    if (text && !/^(references|see also|external links)$/i.test(current.title)) sections.push({ title: current.title, text });
  };
  for (const el of Array.from(root.children)) {
    const tag = el.tagName.toLowerCase();
    const heading = /^h[2-4]$/.test(tag) ? el : el.classList.contains('mw-heading') ? el.querySelector('h2, h3, h4') : null;
    if (heading) {
      flush();
      current = { title: (heading.textContent ?? '').trim(), text: '' };
      continue;
    }
    if (tag === 'p' || tag === 'pre' || tag === 'blockquote') current.text += `${(el.textContent ?? '').trim()}\n\n`;
    else if (tag === 'ul' || tag === 'ol' || tag === 'dl')
      current.text += `${Array.from(el.querySelectorAll('li, dd, dt'))
        .map((li) => `• ${(li.textContent ?? '').trim()}`)
        .join('\n')}\n\n`;
  }
  flush();
  // The intro is the infobox caption and "To do" notes; real finds have headings.
  const finds = sections.filter((s) => s.title && !/^to ?do/i.test(s.title));
  if (!finds.length) return null;
  const title = (data.parse.title as string) ?? page.replace(/_/g, ' ');
  const slug = encodeURIComponent(title.replace(/ /g, '_'));
  return {
    title,
    url: `https://tcrf.net/${slug}`,
    historyUrl: `https://tcrf.net/index.php?title=${slug}&action=history`,
    sections: finds,
  };
});
