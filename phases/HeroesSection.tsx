import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArticleSection,
  fetchHeroArticle,
  fetchHeroFacts,
  HeroArticle,
  HeroFacts,
  HeroRef,
  heroesFor,
  HERO_DECADES,
  pickSource,
  resolveTitles,
  searchWikipedia,
  SearchHit,
  WikiLang,
} from '../lib/heroes';
import { searchHeroesAi } from '../services/geminiService';
import { useWarmChrome } from '../lib/theme';
import { isGerman, LANG, tr } from '../lib/i18n';
import { viaProxy } from '../lib/privacy';

// "Heroes of your youth" in Erkunden: posters of the heroes of your decade on
// the wall, an omni search that also understands a fuzzy description, and
// a page per hero with everything Wikipedia and Wikidata know (lib/heroes.ts).

type Open = { ref: HeroRef; decade: string; icon?: string; hint?: string };

const decadeLabel = (d: string) => tr(`${d}s`, `${d}er`);

const Paragraphs: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, i) => (
        <p key={i} className="leading-relaxed mb-3">
          {p}
        </p>
      ))}
  </>
);

function chapters(sections: ArticleSection[]) {
  const out: { head: ArticleSection; kids: ArticleSection[] }[] = [];
  for (const s of sections) {
    if (s.level <= 2 || !out.length) out.push({ head: s, kids: [] });
    else out[out.length - 1].kids.push(s);
  }
  return out;
}

const Credit: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-retro-tan mt-3 leading-relaxed">{children}</p>
);

const Loading: React.FC = () => (
  <p className="italic text-retro-brown animate-pulse" role="status">
    {tr('Leafing through the old magazines…', 'Blättere in den alten Heften…')}
  </p>
);

// --- one hero ----------------------------------------------------------------

const HeroDetail: React.FC<{
  open: Open;
  card: string;
  warm: boolean;
  remembered: boolean;
  onRemember: (name: string, knowledge: string) => void;
  onBack: () => void;
}> = ({ open, card, warm, remembered, onRemember, onBack }) => {
  const { ref } = open;
  const langs = (['de', 'en'] as WikiLang[]).filter((l) => ref.titles[l]).sort((a) => (a === LANG ? -1 : 1));
  const [facts, setFacts] = useState<HeroFacts | null | undefined>(undefined);
  const [lang, setLang] = useState<WikiLang>(langs[0] ?? 'en');
  const [article, setArticle] = useState<HeroArticle | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    setFacts(undefined);
    fetchHeroFacts(ref.qid).then((f) => alive && setFacts(f));
    return () => {
      alive = false;
    };
  }, [ref.qid]);

  useEffect(() => {
    const title = ref.titles[lang];
    if (!title) return;
    let alive = true;
    setArticle(undefined);
    fetchHeroArticle(`${lang}:${title}`).then((a) => {
      if (!alive) return;
      // A German stub without chapters: the English article tells more.
      const alt = langs.find((l) => l !== lang);
      if (!a?.sections.length && alt && lang === 'de') setLang(alt);
      else setArticle(a);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, ref.qid]);

  const name = facts?.label || ref.name;
  const description = facts?.description || open.hint || '';
  // A hero who is a chapter of a bigger article: that chapter first.
  const parts = useMemo(() => {
    if (!article) return [];
    const all = chapters(article.sections);
    const f = article.focus?.toLowerCase();
    const hit = f ? all.findIndex((c) => [c.head, ...c.kids].some((s) => s.title.toLowerCase().startsWith(f))) : -1;
    if (hit < 0) return all;
    const c = all[hit];
    const kid = c.kids.find((k) => k.title.toLowerCase().startsWith(f!));
    // Just the hero's own sub-chapter, lifted to the top.
    const lifted = kid ? { head: { ...kid, level: 2 }, kids: [] } : c;
    return [lifted, ...(kid ? all : all.filter((_, i) => i !== hit))];
  }, [article]);
  const knowledge = description || (article?.intro.split(/(?<=\.)\s/)[0] ?? '');

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`font-semibold ${warm ? 'px-5 h-11 rounded-full bg-[#eee0d6] text-retro-ink' : 'px-4 py-2 border-2 border-retro-ink/30'}`}
      >
        {tr('← All heroes', '← Alle Helden')}
      </button>

      <div className={`${card} p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start`}>
        {facts?.portrait ? (
          <figure className="hero-polaroid shrink-0 self-center sm:self-start">
            <img src={viaProxy(facts.portrait.src)} alt={name} loading="lazy" />
            <figcaption>
              <a href={facts.portrait.page} target="_blank" rel="noreferrer" className="underline">
                {tr('Photo', 'Foto')}
              </a>
              : {facts.portrait.author},{' '}
              {facts.portrait.licenseUrl ? (
                <a href={facts.portrait.licenseUrl} target="_blank" rel="noreferrer" className="underline">
                  {facts.portrait.license}
                </a>
              ) : (
                facts.portrait.license
              )}
            </figcaption>
          </figure>
        ) : (
          <div aria-hidden="true" className="hero-badge shrink-0 self-center sm:self-start">
            {open.icon ?? '★'}
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-3">
          <span className="text-xs uppercase font-bold tracking-wide text-retro-amber-dark">
            {tr('Hero of the', 'Held der')} {decadeLabel(open.decade)}
          </span>
          <h2 className="text-3xl md:text-4xl break-words">{name}</h2>
          {description && <p className="text-retro-brown italic">{description}</p>}
          <button
            onClick={() => onRemember(name, knowledge)}
            className={`retro-button px-5 py-2.5 font-bold ${remembered ? 'bg-retro-green text-white' : 'bg-retro-ink text-white'}`}
          >
            {remembered ? tr('✓ In your memory book', '✓ Im Erinnerungsbuch') : tr('+ Add my memory', '+ Meine Erinnerung dazu')}
          </button>
        </div>
      </div>

      {article?.intro && (
        <div className={`${card} p-6`}>
          <Paragraphs text={article.intro} />
        </div>
      )}

      <div className={`${card} p-6`}>
        <h3 className="text-xl font-bold mb-3">{tr('Fact sheet', 'Steckbrief')}</h3>
        {facts === undefined ? (
          <Loading />
        ) : facts && facts.rows.length ? (
          <>
            <dl className="hero-facts">
              {facts.rows.map((r) => (
                <React.Fragment key={r.id}>
                  <dt>{r.label}</dt>
                  <dd>{r.values.slice(0, 12).join(' · ')}</dd>
                </React.Fragment>
              ))}
            </dl>
            <Credit>
              {tr('Data:', 'Daten:')}{' '}
              <a href={`https://www.wikidata.org/wiki/${facts.qid}`} target="_blank" rel="noreferrer" className="underline">
                Wikidata ({facts.qid})
              </a>
              , CC0 ({tr('public domain', 'gemeinfrei')})
            </Credit>
          </>
        ) : (
          <p className="text-retro-brown">{tr('No fact sheet on Wikidata yet.', 'Auf Wikidata gibt es noch keinen Steckbrief.')}</p>
        )}
      </div>

      <div className={`${card} p-6`}>
        <h3 className="text-xl font-bold mb-3">{tr('The whole story', 'Die ganze Geschichte')}</h3>
        {langs.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label={tr('Article language', 'Sprache des Artikels')}>
            {langs.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 ${
                  lang === l ? 'bg-retro-ink text-white border-retro-ink' : 'border-retro-ink/30 text-retro-ink'
                }`}
              >
                {l === 'de' ? tr('German article', 'Deutscher Artikel') : tr('English article', 'Englischer Artikel')}
              </button>
            ))}
          </div>
        )}
        {isGerman && langs.length === 1 && langs[0] === 'en' && (
          <p className="text-sm text-retro-brown mb-3">{tr('There is only an English article.', 'Dazu gibt es nur einen englischen Wikipedia-Artikel.')}</p>
        )}
        {article === undefined ? (
          <Loading />
        ) : article && parts.length ? (
          <>
            {parts.map((c, i) => (
              <details key={`${i}-${c.head.title}`} className="hero-chapter" open={i < 2}>
                <summary>{c.head.title}</summary>
                {c.head.text && <Paragraphs text={c.head.text} />}
                {c.kids.map((k) => (
                  <div key={k.title}>
                    <h4 className="font-bold mt-3 mb-1">{k.title}</h4>
                    {k.text && <Paragraphs text={k.text} />}
                  </div>
                ))}
              </details>
            ))}
            <Credit>
              {tr('Text:', 'Text:')}{' '}
              <a href={article.url} target="_blank" rel="noreferrer" className="underline">
                Wikipedia ({article.lang.toUpperCase()}), {tr('“', '„')}
                {article.title}
                {tr('”', '“')}
              </a>
              ,{' '}
              <a href={article.historyUrl} target="_blank" rel="noreferrer" className="underline">
                {tr('authors', 'Autoren')}
              </a>
              ,{' '}
              <a
                href={isGerman ? 'https://creativecommons.org/licenses/by-sa/4.0/deed.de' : 'https://creativecommons.org/licenses/by-sa/4.0/'}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                CC BY-SA 4.0
              </a>
              . {tr('Shown as plain text, without references.', 'Als reiner Text, ohne Einzelnachweise.')}
            </Credit>
          </>
        ) : (
          <p className="text-retro-brown">{tr('No Wikipedia article with more chapters found.', 'Kein Wikipedia-Artikel mit weiteren Kapiteln gefunden.')}</p>
        )}
      </div>
    </div>
  );
};

// --- the wall with the search ------------------------------------------------

type AiHit = HeroRef & { why: string };

export const HeroesSection: React.FC<{
  aiOff: boolean;
  focusDecade: string;
  isAnswered: (id: string) => boolean;
  onRemember: (wordId: string, term: string, knowledge: string, decade: string, fallbackQuestion: string) => void;
  backButton: React.ReactNode;
}> = ({ aiOff, focusDecade, isAnswered, onRemember, backButton }) => {
  const warm = useWarmChrome();
  const card = warm ? 'retro-card hero-sheet bg-retro-paper-white' : 'border-2 border-retro-ink bg-white';
  const [decade, setDecade] = useState(HERO_DECADES.includes(focusDecade) ? focusDecade : '1980');
  const [open, setOpen] = useState<Open | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const [query, setQuery] = useState('');
  const [wikiHits, setWikiHits] = useState<SearchHit[] | null>(null);
  const [aiHits, setAiHits] = useState<AiHit[] | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const run = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  const picks = heroesFor(decade);

  const show = (next: Open | null) => {
    setOpen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTitle = async (lang: WikiLang, title: string, extra: Partial<Open> = {}) => {
    setOpening(title);
    setFailed(false);
    const [ref] = await resolveTitles(lang, [title]);
    setOpening(null);
    if (!ref) return setFailed(true);
    show({ ref, decade: extra.decade ?? focusDecade, icon: extra.icon, hint: extra.hint });
  };

  const search = (text: string) => {
    const q = text.trim();
    const id = ++run.current;
    if (q.length < 3) {
      setWikiHits(null);
      setAiHits(null);
      setAiBusy(false);
      return;
    }
    searchWikipedia(q, aiOff).then((hits) => id === run.current && setWikiHits(hits));
    if (aiOff) return;
    setAiBusy(true);
    searchHeroesAi(q, focusDecade)
      .then(async (cands) => {
        const refs = await resolveTitles('en', cands.map((c) => c.wikiTitle));
        if (id !== run.current) return;
        const why = new Map(cands.map((c) => [c.wikiTitle.toLowerCase(), c.why]));
        setAiHits(
          refs.map((r) => ({
            ...r,
            why: why.get((r.titles.en ?? '').toLowerCase()) ?? cands.find((c) => c.name && r.name.includes(c.name))?.why ?? '',
          }))
        );
      })
      .catch(() => id === run.current && setAiHits([]))
      .finally(() => id === run.current && setAiBusy(false));
  };

  // The search runs by itself a moment after typing stops.
  const onType = (text: string) => {
    setQuery(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => search(text), 900);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (open) {
    const id = `hero-${open.ref.qid}`;
    return (
      <HeroDetail
        open={open}
        card={card}
        warm={warm}
        remembered={isAnswered(id)}
        onBack={() => show(null)}
        onRemember={(name, knowledge) =>
          onRemember(
            id,
            name,
            knowledge,
            open.decade,
            tr(
              `What did ${name} mean to you back then? Where did you see or hear them for the first time?`,
              `Was hat dir ${name} damals bedeutet? Wo bist du ${name} zum ersten Mal begegnet?`
            )
          )
        }
      />
    );
  }

  const searching = query.trim().length >= 3;

  return (
    <div className="space-y-8">
      <header className="space-y-5">
        {backButton}
        <h2 className="text-3xl md:text-4xl flex items-center gap-3">
          <span aria-hidden="true">🦸</span> {tr('Heroes of your youth', 'Helden deiner Jugend')}
        </h2>
        <p className="text-retro-brown leading-relaxed max-w-prose">
          {tr(
            'Who was on the poster above your bed? Pick a hero, or just describe them in a few words.',
            'Wer hing als Poster über deinem Bett? Such dir einen Helden aus oder beschreib ihn einfach in ein paar Worten.'
          )}
        </p>
      </header>

      <div className={`${card} p-5`}>
        <label htmlFor="hero-search" className="block font-bold mb-2">
          {tr('Search for a hero', 'Helden suchen')}
        </label>
        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              window.clearTimeout(timer.current);
              search(query);
            }
          }}
          placeholder={tr('e.g. “the guy with the talking car”', 'z. B. „der Typ mit dem sprechenden Auto“')}
          className="w-full px-4 py-3 border-2 border-retro-ink/40 rounded-lg bg-white text-retro-ink text-lg"
          autoComplete="off"
        />
        <p className="text-xs text-retro-tan mt-2">
          {aiOff
            ? tr('Searches Wikipedia as you type.', 'Sucht beim Tippen in Wikipedia.')
            : tr(
                'Searches by itself as you type. A name works, and so does a description; the AI (Google Gemini) works out who you mean.',
                'Sucht beim Tippen von selbst. Ein Name geht, eine Beschreibung auch; die KI (Google Gemini) findet heraus, wen du meinst.'
              )}
        </p>

        {searching && (
          <div className="mt-4 space-y-4" aria-live="polite">
            {!aiOff && (
              <section>
                <h3 className="text-sm uppercase tracking-wide font-bold text-retro-brown mb-2">{tr('Do you mean…', 'Meinst du…')}</h3>
                {aiBusy && !aiHits ? (
                  <p className="italic text-retro-brown animate-pulse">{tr('Thinking about who you mean…', 'Überlege, wen du meinst…')}</p>
                ) : aiHits && aiHits.length ? (
                  <ul className="space-y-2">
                    {aiHits.map((h) => (
                      <li key={h.qid}>
                        <button
                          onClick={() => show({ ref: h, decade: focusDecade, hint: h.why })}
                          className="w-full text-left px-4 py-3 rounded-lg border-2 border-retro-ink/20 hover:border-retro-amber"
                        >
                          <span className="font-bold text-retro-ink">{h.name}</span>
                          {h.why && <span className="block text-sm text-retro-brown">{h.why}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : aiHits ? (
                  <p className="text-retro-brown text-sm">{tr('No idea yet. Try a few more words.', 'Noch keine Idee. Versuch es mit ein paar Worten mehr.')}</p>
                ) : null}
              </section>
            )}
            {(aiOff || !!wikiHits?.length) && (
            <section>
              <h3 className="text-sm uppercase tracking-wide font-bold text-retro-brown mb-2">{aiOff ? tr('On Wikipedia', 'In Wikipedia') : tr('Names on Wikipedia', 'Namen in Wikipedia')}</h3>
              {wikiHits === null ? (
                <Loading />
              ) : wikiHits.length ? (
                <ul className="space-y-2">
                  {wikiHits.map((h) => (
                    <li key={h.title}>
                      <button
                        onClick={() => openTitle(LANG, h.title)}
                        disabled={opening === h.title}
                        className="w-full text-left px-4 py-3 rounded-lg border-2 border-retro-ink/20 hover:border-retro-amber"
                      >
                        <span className="font-bold text-retro-ink">{h.title}</span>
                        {h.snippet && <span className="block text-sm text-retro-brown line-clamp-2">… {h.snippet} …</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-retro-brown text-sm">{tr('Nothing found.', 'Nichts gefunden.')}</p>
              )}
            </section>
            )}
          </div>
        )}
        {failed && (
          <p className="text-sm font-bold text-red-700 mt-3" role="alert">
            {tr('That one couldn’t be found right now. Try another.', 'Dazu ließ sich gerade nichts finden. Versuch einen anderen.')}
          </p>
        )}
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label={tr('Decade', 'Jahrzehnt')}>
          {HERO_DECADES.map((d) => (
            <button
              key={d}
              onClick={() => setDecade(d)}
              aria-pressed={decade === d}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 ${
                decade === d ? 'bg-retro-ink text-white border-retro-ink' : 'border-retro-ink/30 text-retro-ink'
              }`}
            >
              {decadeLabel(d)}
              {d === focusDecade && ' ★'}
            </button>
          ))}
        </div>
        <div className="hero-wall grid grid-cols-2 md:grid-cols-3 gap-5 p-4 sm:p-6">
          {picks.map((p, i) => (
            <button
              key={p.wiki}
              onClick={() => openTitle(...pickSource(p.wiki), { decade, icon: p.icon, hint: p.hint })}
              disabled={opening === pickSource(p.wiki)[1]}
              className="hero-poster text-left"
              style={{ ['--tilt' as string]: `${[-2, 1.5, -1, 2, -1.5, 1][i % 6]}deg` }}
            >
              <span aria-hidden="true" className="text-4xl block mb-2">
                {p.icon}
              </span>
              <span className="font-bold text-lg leading-tight block text-retro-ink">{p.name}</span>
              <span className="text-sm text-retro-brown block mt-1">{opening === pickSource(p.wiki)[1] ? tr('Opening…', 'Öffne…') : p.hint}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
