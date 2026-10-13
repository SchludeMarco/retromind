import { viaProxy } from './privacy';
import { isGerman, LANG, LOCALE, tr } from './i18n';
import { parseExtract } from '../gaming/lib/facts';
import type { ArticleSection } from '../gaming/lib/facts';

// "Heroes of your youth" (Zeitreise → Erkunden): pick a hero of your decade
// or search for one, then read everything about them. Only freely licensed
// material, all fetched through our own server (/api/proxy), so the visitor's
// browser never contacts Wikipedia, Wikidata or Commons itself:
//
//  - Fact sheet from Wikidata (CC0, public domain).
//  - The whole Wikipedia article, cut into its chapters (CC BY-SA 4.0).
//  - A portrait only from Wikimedia Commons and only under a free license
//    (CC0, public domain, CC BY, CC BY-SA), always with author and license.
//    Wikipedia's own uploads (/wikipedia/en/…) are fair use and never shown.
//
// The search understands a name or a fuzzy description: Wikipedia's own
// full-text search answers at once, and Gemini (api/gemini.js, "heroSearch")
// turns descriptions like "the guy with the talking car" into article
// titles, which are checked against Wikipedia before they are shown.

export type WikiLang = 'de' | 'en';

export interface HeroPick {
  /** English Wikipedia title, or "de:Title" for heroes only the German
   *  Wikipedia covers on their own. */
  wiki: string;
  name: string;
  hint: string;
  icon: string;
}

// [English Wikipedia title (or "de:Title"), icon, English name, German name, English hint,
//  German hint, region]. Region 'de' shows only in German, 'us' only in
// American English, everything else in both.
type Row = [string, string, string, string, string, string, ('de' | 'us')?];

const PICKS: Record<string, Row[]> = {
  '1960': [
    ['Neil Armstrong', '🚀', 'Neil Armstrong', 'Neil Armstrong', 'First man on the Moon', 'Der erste Mensch auf dem Mond'],
    ['The Beatles', '🎸', 'The Beatles', 'The Beatles', 'Four lads from Liverpool', 'Vier Pilzköpfe aus Liverpool'],
    ['James T. Kirk', '🖖', 'Captain Kirk', 'Captain Kirk', 'Captain of the Enterprise', 'Captain der Enterprise'],
    ['Winnetou', '🪶', 'Winnetou', 'Winnetou', 'Karl May’s Apache chief', 'Der edle Apache von Karl May', 'de'],
    ['Pierre Brice', '🎬', 'Pierre Brice', 'Pierre Brice', 'Winnetou on screen', 'Der Winnetou im Kino', 'de'],
    ['Uwe Seeler', '⚽', 'Uwe Seeler', 'Uwe Seeler', 'Hamburg’s football legend', '„Uns Uwe“ vom HSV', 'de'],
    ['Lassie', '🐕', 'Lassie', 'Lassie', 'The smartest collie on TV', 'Die klügste Collie-Dame im Fernsehen'],
    ['Muhammad Ali', '🥊', 'Muhammad Ali', 'Muhammad Ali', 'Float like a butterfly', 'Schwebt wie ein Schmetterling', 'us'],
    ['Batman (TV series)', '🦇', 'Batman (TV, 1966)', 'Batman (Serie, 1966)', 'Biff! Pow! Zap!', 'Biff! Pow! Zap!', 'us'],
  ],
  '1970': [
    ['Luke Skywalker', '⭐', 'Luke Skywalker', 'Luke Skywalker', 'A farm boy saves the galaxy', 'Ein Farmjunge rettet die Galaxis'],
    ['Bruce Lee', '🥋', 'Bruce Lee', 'Bruce Lee', 'Kung-fu legend', 'Kung-Fu-Legende'],
    ['Pippi Longstocking', '👧', 'Pippi Longstocking', 'Pippi Langstrumpf', 'The strongest girl in the world', 'Das stärkste Mädchen der Welt'],
    ['ABBA', '🕺', 'ABBA', 'ABBA', 'Waterloo and beyond', 'Waterloo und mehr'],
    ['Franz Beckenbauer', '⚽', 'Franz Beckenbauer', 'Franz Beckenbauer', '“Der Kaiser”', '„Der Kaiser“', 'de'],
    ['de:Biene Maja', '🐝', 'Maya the Bee', 'Biene Maja', 'The cheeky little bee', 'Die kleine freche Biene', 'de'],
    ['de:Pumuckl', '🔨', 'Pumuckl', 'Pumuckl', 'The red-haired goblin in the workshop', 'Der Kobold in Meister Eders Werkstatt', 'de'],
    ['Evel Knievel', '🏍️', 'Evel Knievel', 'Evel Knievel', 'Daredevil on a motorcycle', 'Waghalsiger Motorrad-Stuntman', 'us'],
    ['Fonzie', '👍', 'The Fonz', 'Fonzie', 'Ayyy! from Happy Days', 'Ayyy! aus Happy Days', 'us'],
    ['Wonder Woman', '🦸‍♀️', 'Wonder Woman', 'Wonder Woman', 'Amazon princess with a golden lasso', 'Amazonenprinzessin mit goldenem Lasso'],
  ],
  '1980': [
    ['Michael Knight (Knight Rider)', '🚗', 'Michael Knight', 'Michael Knight', 'Knight Rider and his talking car KITT', 'Knight Rider und sein sprechendes Auto K.I.T.T.'],
    ['MacGyver (character)', '🔧', 'MacGyver', 'MacGyver', 'A paper clip and a pocketknife', 'Büroklammer und Taschenmesser'],
    ['He-Man', '⚔️', 'He-Man', 'He-Man', '“I have the power!”', '„Ich habe die Zauberkraft!“'],
    ['Indiana Jones (character)', '🤠', 'Indiana Jones', 'Indiana Jones', 'Archaeologist with hat and whip', 'Archäologe mit Hut und Peitsche'],
    ['Marty McFly', '🛹', 'Marty McFly', 'Marty McFly', 'Back to the Future', 'Zurück in die Zukunft'],
    ['ALF (TV series)', '👽', 'ALF', 'ALF', 'Alien from Melmac who loves cats', 'Außerirdischer von Melmac, mag Katzen'],
    ['Michael Jackson', '🕺', 'Michael Jackson', 'Michael Jackson', 'King of Pop', 'King of Pop'],
    ['Boris Becker', '🎾', 'Boris Becker', 'Boris Becker', 'Wimbledon winner at 17', 'Mit 17 Wimbledon-Sieger', 'de'],
    ['Steffi Graf', '🎾', 'Steffi Graf', 'Steffi Graf', 'The Golden Slam', 'Der Golden Slam', 'de'],
    ['Nena (band)', '🎈', 'Nena', 'Nena', '99 Luftballons', '99 Luftballons', 'de'],
    ['Captain Future', '🪐', 'Captain Future', 'Captain Future', 'Sci-fi hero of the cartoon', 'Der Weltraumheld im Zeichentrick', 'de'],
    ['Mr. T', '💪', 'Mr. T', 'Mr. T', 'B.A. from The A-Team', 'B.A. aus dem A-Team', 'us'],
    ['Hulk Hogan', '🤼', 'Hulk Hogan', 'Hulk Hogan', 'Hulkamania, brother!', 'Hulkamania!', 'us'],
    ['Teenage Mutant Ninja Turtles', '🐢', 'Ninja Turtles', 'Teenage Mutant Hero Turtles', 'Cowabunga!', 'Cowabunga!', 'us'],
  ],
  '1990': [
    ['Michael Jordan', '🏀', 'Michael Jordan', 'Michael Jordan', 'Air Jordan', 'Air Jordan'],
    ['Lara Croft', '🗺️', 'Lara Croft', 'Lara Croft', 'Tomb Raider', 'Tomb Raider'],
    ['Sailor Moon (character)', '🌙', 'Sailor Moon', 'Sailor Moon', 'In the name of the Moon', 'Im Namen des Mondes'],
    ['Pikachu', '⚡', 'Pikachu', 'Pikachu', 'Pika pika!', 'Pika pika!'],
    ['Buffy Summers', '🧛', 'Buffy', 'Buffy', 'The vampire slayer', 'Im Bann der Dämonen'],
    ['Fox Mulder', '🛸', 'Fox Mulder', 'Fox Mulder', 'The truth is out there', 'Die Wahrheit ist irgendwo da draußen'],
    ['Backstreet Boys', '🎤', 'Backstreet Boys', 'Backstreet Boys', 'Boy band poster on the wall', 'Das Poster über dem Bett'],
    ['Michael Schumacher', '🏎️', 'Michael Schumacher', 'Michael Schumacher', 'Seven world titles in Formula One', 'Siebenmal Formel-1-Weltmeister', 'de'],
    ['Benjamin the Elephant', '🐘', 'Benjamin Blümchen', 'Benjamin Blümchen', 'Törööö!', 'Törööö!', 'de'],
    ['de:Bibi Blocksberg', '🧹', 'Bibi Blocksberg', 'Bibi Blocksberg', 'Hex-hex!', 'Hex-hex!', 'de'],
    ['Mighty Morphin Power Rangers', '🦖', 'Power Rangers', 'Power Rangers', 'It’s morphin’ time!', 'Zeit zum Verwandeln!', 'us'],
    ['Steve Urkel', '🤓', 'Steve Urkel', 'Steve Urkel', '“Did I do that?”', '„Hab ich das getan?“', 'us'],
    ['Shaquille O\'Neal', '🏀', 'Shaq', 'Shaq', 'The big man of the ’90s', 'Der Riese der 90er', 'us'],
  ],
  '2000': [
    ['Harry Potter (character)', '⚡', 'Harry Potter', 'Harry Potter', 'The boy who lived', 'Der Junge, der überlebte'],
    ['Jack Sparrow', '🏴‍☠️', 'Jack Sparrow', 'Jack Sparrow', 'Captain of the Black Pearl', 'Captain der Black Pearl'],
    ['SpongeBob SquarePants (character)', '🧽', 'SpongeBob', 'SpongeBob', 'Lives in a pineapple under the sea', 'Wohnt in einer Ananas unterm Meer'],
    ['Spider-Man', '🕷️', 'Spider-Man', 'Spider-Man', 'Your friendly neighborhood hero', 'Die freundliche Spinne aus der Nachbarschaft'],
    ['Britney Spears', '🎤', 'Britney Spears', 'Britney Spears', 'Oops!… I Did It Again', 'Oops!… I Did It Again'],
    ['Dirk Nowitzki', '🏀', 'Dirk Nowitzki', 'Dirk Nowitzki', 'From Würzburg to the NBA title', 'Von Würzburg zum NBA-Titel', 'de'],
    ['Tokio Hotel', '🎸', 'Tokio Hotel', 'Tokio Hotel', 'Durch den Monsun', 'Durch den Monsun', 'de'],
    ['Bernd das Brot', '🍞', 'Bernd the Bread', 'Bernd das Brot', 'The grumpiest loaf on TV', 'Das schlechtgelaunteste Brot im Fernsehen', 'de'],
    ['Aang', '🌀', 'Aang', 'Aang', 'The last airbender', 'Der Herr der Elemente', 'us'],
    ['Hannah Montana', '🎤', 'Hannah Montana', 'Hannah Montana', 'The best of both worlds', 'Das Beste aus beiden Welten', 'us'],
  ],
  '2010': [
    ['Elsa (Frozen)', '❄️', 'Elsa', 'Elsa', 'Let it go!', 'Lass jetzt los!'],
    ['Iron Man', '🤖', 'Iron Man', 'Iron Man', 'Tony Stark in his armor', 'Tony Stark in seiner Rüstung'],
    ['Katniss Everdeen', '🏹', 'Katniss Everdeen', 'Katniss Everdeen', 'The girl on fire', 'Das Mädchen, das in Flammen steht'],
    ['Taylor Swift', '🎤', 'Taylor Swift', 'Taylor Swift', 'From country to pop', 'Von Country zu Pop'],
    ['Usain Bolt', '⚡', 'Usain Bolt', 'Usain Bolt', 'The fastest man in the world', 'Der schnellste Mensch der Welt'],
    ['Steve (Minecraft)', '⛏️', 'Steve', 'Steve', 'The blocky hero of Minecraft', 'Der eckige Held aus Minecraft'],
    ['Manuel Neuer', '🧤', 'Manuel Neuer', 'Manuel Neuer', 'World champion goalkeeper 2014', 'Weltmeister-Torwart 2014', 'de'],
    ['Simone Biles', '🤸', 'Simone Biles', 'Simone Biles', 'Gymnastics’ greatest', 'Die beste Turnerin aller Zeiten', 'us'],
    ['Stephen Curry', '🏀', 'Stephen Curry', 'Stephen Curry', 'Three-point magician', 'Dreier-Zauberer', 'us'],
  ],
};

/** Suggestions for one decade, in the visitor's language. */
export function heroesFor(decade: string): HeroPick[] {
  const skip = isGerman ? 'us' : 'de';
  return (PICKS[decade] ?? []).filter((r) => r[6] !== skip).map(([wiki, icon, en, de, hintEn, hintDe]) => ({
    wiki,
    icon,
    name: tr(en, de),
    hint: tr(hintEn, hintDe),
  }));
}

export const HERO_DECADES = Object.keys(PICKS);

/** Which Wikipedia and title a pick lives under. */
export const pickSource = (wiki: string): [WikiLang, string] => (wiki.startsWith('de:') ? ['de', wiki.slice(3)] : ['en', wiki]);

// --- fetching ----------------------------------------------------------------

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
const other = (lang: WikiLang): WikiLang => (lang === 'de' ? 'en' : 'de');
const stripTags = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, '’')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** A hero found on Wikipedia: Wikidata id and article titles in both languages. */
export interface HeroRef {
  qid: string;
  titles: Partial<Record<WikiLang, string>>;
  /** Shown before the fact sheet has loaded. */
  name: string;
}

/** Looks up up to 20 titles of one Wikipedia at once. Missing pages and
 *  disambiguation pages drop out; the order of `titles` is kept. */
export async function resolveTitles(lang: WikiLang, titles: string[]): Promise<HeroRef[]> {
  const unique = [...new Set(titles.map((t) => t.trim()).filter(Boolean))].slice(0, 20);
  if (!unique.length) return [];
  const q = new URLSearchParams({
    action: 'query',
    titles: unique.join('|'),
    prop: 'pageprops|langlinks',
    ppprop: 'wikibase_item|disambiguation',
    lllang: other(lang),
    lllimit: '50',
    redirects: '1',
    format: 'json',
    formatversion: '2',
    origin: '*',
  });
  const data = await getJson(`${wikiApi(lang)}?${q}`);
  const query = data?.query;
  if (!query?.pages) return [];
  const follow = new Map<string, string>();
  for (const n of query.normalized ?? []) follow.set(n.from, n.to);
  for (const r of query.redirects ?? []) follow.set(r.from, r.to);
  const byTitle = new Map<string, any>((query.pages as any[]).map((p) => [p.title, p]));
  const out: HeroRef[] = [];
  const seen = new Set<string>();
  for (const t of unique) {
    let title = t;
    for (let i = 0; i < 3 && follow.has(title); i++) title = follow.get(title)!;
    const page = byTitle.get(title);
    const qid = page?.pageprops?.wikibase_item;
    if (!page || page.missing || page.pageprops?.disambiguation !== undefined || !qid || seen.has(qid)) continue;
    seen.add(qid);
    const link = page.langlinks?.[0]?.title;
    out.push({ qid, name: page.title.replace(/\s*\([^)]*\)$/, ''), titles: { [lang]: page.title, ...(link ? { [other(lang)]: link } : {}) } });
  }
  return out;
}

export interface SearchHit {
  title: string;
  snippet: string;
}

/** Names in the visitor's Wikipedia that start like the text ("Hassel" →
 *  David Hasselhoff). Wikipedia's full-text search turns a description into
 *  noise (an old tape recorder for "the guy with the talking car"), so it
 *  only runs when there is no AI to ask and no name matched. */
export async function searchWikipedia(text: string, fullText: boolean): Promise<SearchHit[]> {
  const prefix = new URLSearchParams({
    action: 'query',
    list: 'prefixsearch',
    pssearch: text,
    pslimit: '6',
    psnamespace: '0',
    format: 'json',
    origin: '*',
  });
  const names = await getJson(`${wikiApi(LANG)}?${prefix}`);
  const hits: SearchHit[] = ((names?.query?.prefixsearch as any[]) ?? []).map((s) => ({ title: s.title, snippet: '' }));
  if (hits.length || !fullText) return hits;
  const q = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: text,
    srlimit: '6',
    srnamespace: '0',
    srprop: 'snippet',
    format: 'json',
    origin: '*',
  });
  const data = await getJson(`${wikiApi(LANG)}?${q}`);
  return ((data?.query?.search as any[]) ?? []).map((s) => ({ title: s.title, snippet: stripTags(s.snippet ?? '') }));
}

// --- Wikidata fact sheet -----------------------------------------------------

export interface FactRow {
  id: string;
  label: string;
  values: string[];
}

export interface Portrait {
  src: string;
  page: string;
  author: string;
  license: string;
  licenseUrl?: string;
}

export interface HeroFacts {
  qid: string;
  label: string;
  description: string;
  rows: FactRow[];
  portrait: Portrait | null;
}

/** Wikidata properties for people, characters, bands and shows, in this order. */
const PROPS: [string, string, string][] = [
  ['P31', 'Is a', 'Ist ein(e)'],
  ['P1449', 'Nickname', 'Spitzname'],
  ['P1441', 'Appears in', 'Kommt vor in'],
  ['P175', 'Played by', 'Dargestellt von'],
  ['P725', 'Voice', 'Stimme'],
  ['P170', 'Created by', 'Erfunden von'],
  ['P569', 'Born', 'Geboren'],
  ['P19', 'Place of birth', 'Geburtsort'],
  ['P570', 'Died', 'Gestorben'],
  ['P20', 'Place of death', 'Sterbeort'],
  ['P27', 'Citizenship', 'Staatsangehörigkeit'],
  ['P106', 'Occupation', 'Beruf'],
  ['P641', 'Sport', 'Sportart'],
  ['P54', 'Teams', 'Mannschaften'],
  ['P413', 'Position', 'Position'],
  ['P571', 'Founded', 'Gegründet'],
  ['P576', 'Disbanded', 'Aufgelöst'],
  ['P527', 'Members', 'Mitglieder'],
  ['P463', 'Member of', 'Mitglied von'],
  ['P1303', 'Instruments', 'Instrumente'],
  ['P136', 'Genre', 'Genre'],
  ['P264', 'Record labels', 'Plattenlabels'],
  ['P449', 'Original broadcaster', 'Erstausstrahlung bei'],
  ['P580', 'Start', 'Beginn'],
  ['P582', 'End', 'Ende'],
  ['P1113', 'Episodes', 'Folgen'],
  ['P161', 'Cast', 'Besetzung'],
  ['P800', 'Known for', 'Bekannt für'],
  ['P166', 'Awards', 'Auszeichnungen'],
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

const FREE_LICENSE = /^(cc0|cc[ -]by(-sa)?\b|public domain|pd\b|pd-)/i;

/** A Commons file, only when its license is free; with author and license. */
async function portrait(file: string): Promise<Portrait | null> {
  const q = new URLSearchParams({
    action: 'query',
    titles: `File:${file}`,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '480',
    format: 'json',
    formatversion: '2',
    origin: '*',
  });
  const data = await getJson(`https://commons.wikimedia.org/w/api.php?${q}`);
  const info = data?.query?.pages?.[0]?.imageinfo?.[0];
  const meta = info?.extmetadata ?? {};
  const license = stripTags(meta.LicenseShortName?.value ?? '');
  const src: string = info?.thumburl || info?.url || '';
  if (!src || !/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(src)) return null;
  if (!FREE_LICENSE.test(license) || meta.NonFree?.value === 'true') return null;
  return {
    src,
    page: info.descriptionurl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`,
    author: stripTags(meta.Attribution?.value ?? '') || stripTags(meta.Artist?.value ?? '') || tr('unknown', 'unbekannt'),
    license,
    licenseUrl: meta.LicenseUrl?.value,
  };
}

/** Fact sheet, short description and a free portrait (Wikidata, CC0). */
export const fetchHeroFacts = memo(async (qid: string): Promise<HeroFacts | null> => {
  if (!isQid(qid)) return null;
  const langs = isGerman ? 'de,mul,en' : 'en,mul,de';
  const values = PROPS.map(([p]) => `("${p}" p:${p} ps:${p} psv:${p})`).join(' ');
  const [main, head] = await Promise.all([
    sparql(`SELECT ?pid ?v ?vLabel ?prec WHERE {
  VALUES (?pid ?p ?ps ?psv) { ${values} }
  wd:${qid} ?p ?st . ?st ?ps ?v .
  FILTER NOT EXISTS { ?st wikibase:rank wikibase:DeprecatedRank }
  OPTIONAL { ?st ?psv ?vn . ?vn wikibase:timePrecision ?prec }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${langs}". }
} LIMIT 500`),
    sparql(`SELECT ?label ?desc ?img WHERE {
  OPTIONAL { wd:${qid} rdfs:label ?label . FILTER(LANG(?label) IN ("${LANG}", "mul", "${isGerman ? 'en' : 'de'}")) }
  OPTIONAL { wd:${qid} schema:description ?desc . FILTER(LANG(?desc) = "${LANG}") }
  OPTIONAL { wd:${qid} wdt:P18 ?img }
} LIMIT 6`),
  ]);
  if (!main && !head) return null;
  const byProp = new Map<string, Set<string>>();
  for (const b of (main?.results?.bindings as any[]) ?? []) {
    const pid = val(b, 'pid');
    const raw = val(b, 'v');
    const label = val(b, 'vLabel');
    // "human" says nothing about a hero.
    if (pid === 'P31' && raw.endsWith('/Q5')) continue;
    let text: string;
    if (b.v?.datatype?.endsWith('#dateTime')) {
      text = formatDate(raw, Number(val(b, 'prec') || 11));
    } else if (b.v?.datatype?.endsWith('#decimal') || b.v?.datatype?.endsWith('#integer')) {
      const n = Number(raw);
      text = Number.isFinite(n) ? n.toLocaleString(LOCALE) : raw;
    } else if (b.v?.type === 'uri') {
      if (!label || isQid(label)) continue;
      text = label;
    } else {
      // Monolingual text (nicknames): only the visitor's languages.
      const l = b.v?.['xml:lang'];
      if (l && l !== 'en' && l !== 'de' && l !== 'mul') continue;
      text = label || raw;
    }
    if (!byProp.has(pid)) byProp.set(pid, new Set());
    byProp.get(pid)!.add(text);
  }
  const rows = PROPS.filter(([p]) => byProp.has(p)).map(([p, en, de]) => ({ id: p, label: tr(en, de), values: [...byProp.get(p)!] }));
  const heads: any[] = head?.results?.bindings ?? [];
  const pickLabel = [LANG, 'mul', isGerman ? 'en' : 'de']
    .map((l) => heads.find((h) => h.label?.['xml:lang'] === l)?.label?.value)
    .find(Boolean);
  const file = heads.map((h) => val(h, 'img')).find(Boolean);
  const fileName = file ? decodeURIComponent(file.split('/Special:FilePath/').pop() ?? '') : '';
  return {
    qid,
    label: pickLabel ?? '',
    description: heads.map((h) => val(h, 'desc')).find(Boolean) ?? '',
    rows,
    portrait: fileName ? await portrait(fileName) : null,
  };
});

// --- Wikipedia article in chapters -------------------------------------------

export interface HeroArticle {
  title: string;
  lang: WikiLang;
  url: string;
  historyUrl: string;
  intro: string;
  sections: ArticleSection[];
  /** When the title redirects into a chapter of a bigger article (German
   *  "Michael Knight" → "Knight Rider#Michael Knight"): that chapter. */
  focus?: string;
}

/** The whole Wikipedia article, cut into its chapters (CC BY-SA 4.0). Key: "de:Title". */
export const fetchHeroArticle = memo(async (key: string): Promise<HeroArticle | null> => {
  const lang = key.slice(0, 2) as WikiLang;
  const title = key.slice(3);
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
    focus: data.query.redirects?.find((r: any) => r.tofragment)?.tofragment,
  };
});

export type { ArticleSection };
