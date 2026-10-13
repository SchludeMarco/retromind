import React, { useEffect, useMemo, useState } from 'react';
import { Game } from '../data/games';
import {
  Article,
  articleKey,
  articleLanguages,
  ArticleSection,
  fetchArticle,
  fetchFacts,
  fetchTcrf,
  GameFacts as Facts,
  TcrfPage,
} from '../lib/facts';
import { isGerman, tr } from '../../lib/i18n';

// The "FACTS & SECRETS" tab of the game page: fact sheet (Wikidata), the
// stories behind the game (Wikipedia), cut and hidden content (The Cutting
// Room Floor) and direct database links. See lib/facts.ts for the sources.

const Paragraphs: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, i) => (
        <p key={i}>{p}</p>
      ))}
  </>
);

const Credit: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="dim facts-credit">{children}</p>
);

/** Level-2 chapters with their sub-sections, so each opens as one block. */
function chapters(sections: ArticleSection[]) {
  const out: { head: ArticleSection; kids: ArticleSection[] }[] = [];
  for (const s of sections) {
    if (s.level <= 2 || !out.length) out.push({ head: s, kids: [] });
    else out[out.length - 1].kids.push(s);
  }
  return out;
}

const Chapter: React.FC<{ head: ArticleSection; kids: ArticleSection[]; open: boolean }> = ({ head, kids, open }) => (
  <details className="facts-chapter" open={open}>
    <summary data-nav>
      {head.behindTheScenes && <span aria-hidden="true">★ </span>}
      {head.title}
    </summary>
    {head.text && <Paragraphs text={head.text} />}
    {kids.map((k) => (
      <div key={k.title}>
        <h4>{k.title}</h4>
        {k.text && <Paragraphs text={k.text} />}
      </div>
    ))}
  </details>
);

export const GameFactsTab: React.FC<{ game: Game }> = ({ game }) => {
  const [facts, setFacts] = useState<Facts | null | undefined>(undefined);
  const [langs, setLangs] = useState<('de' | 'en')[]>([]);
  const [lang, setLang] = useState<'de' | 'en'>(isGerman ? 'de' : 'en');
  const [article, setArticle] = useState<Article | null | undefined>(undefined);
  const [tcrf, setTcrf] = useState<TcrfPage | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    setFacts(undefined);
    setTcrf(undefined);
    setLangs([]);
    setLang(isGerman ? 'de' : 'en');
    fetchFacts(game.wiki).then((f) => {
      if (!alive) return;
      setFacts(f);
      if (f?.tcrf) fetchTcrf(f.tcrf).then((t) => alive && setTcrf(t));
      else setTcrf(null);
    });
    articleLanguages(game.wiki).then((l) => {
      if (!alive) return;
      setLangs(l);
      if (!l.includes(isGerman ? 'de' : 'en')) setLang('en');
    });
    return () => {
      alive = false;
    };
  }, [game.wiki]);

  useEffect(() => {
    if (!langs.length) return;
    let alive = true;
    setArticle(undefined);
    fetchArticle(articleKey(lang, game.wiki)).then((a) => {
      if (!alive) return;
      // A German stub without chapters: the English article tells more.
      const other = langs.find((l) => l !== lang);
      if (!a?.sections.length && other && lang !== 'en') setLang(other);
      else setArticle(a);
    });
    return () => {
      alive = false;
    };
  }, [lang, langs, game.wiki]);

  const parts = useMemo(() => (article ? chapters(article.sections) : []), [article]);
  const behind = parts.filter((c) => c.head.behindTheScenes);
  const rest = parts.filter((c) => !c.head.behindTheScenes);
  const loading = (
    <p className="loading pixel-font" style={{ fontSize: 11 }} role="status">
      {tr('DIGGING THROUGH THE ARCHIVES…', 'WÜHLE IM ARCHIV…')} <span className="blink">▮</span>
    </p>
  );

  return (
    <div className="facts">
      <div className="panel">
        <h3 className="pixel-font">{tr('FACT SHEET', 'STECKBRIEF')}</h3>
        {facts === undefined ? (
          loading
        ) : facts && facts.rows.length ? (
          <>
            <dl className="facts-sheet">
              {facts.rows.map((r) => (
                <React.Fragment key={r.id}>
                  <dt>{r.label}</dt>
                  <dd>{r.values.slice(0, 12).join(' · ')}</dd>
                </React.Fragment>
              ))}
            </dl>
            <Credit>
              {tr('Data:', 'Daten:')}{' '}
              <a href={`https://www.wikidata.org/wiki/${facts.qid}`} target="_blank" rel="noreferrer">
                Wikidata ({facts.qid})
              </a>
              , CC0 ({tr('public domain', 'gemeinfrei')})
            </Credit>
          </>
        ) : (
          <p className="dim">{tr('No fact sheet on Wikidata yet.', 'Auf Wikidata gibt es noch keinen Steckbrief.')}</p>
        )}
      </div>

      {!!facts?.reviews.length && (
        <div className="panel">
          <h3 className="pixel-font">{tr('REVIEW SCORES', 'WERTUNGEN')}</h3>
          <ul className="facts-reviews">
            {facts.reviews.slice(0, 30).map((r, i) => (
              <li key={i}>
                <strong>{r.score}</strong> {r.by}
                {r.platform && <span className="dim"> ({r.platform})</span>}
              </li>
            ))}
          </ul>
          <Credit>{tr('Data: Wikidata, CC0', 'Daten: Wikidata, CC0')}</Credit>
        </div>
      )}

      <div className="panel">
        <h3 className="pixel-font">{tr('BEHIND THE SCENES', 'HINTER DEN KULISSEN')}</h3>
        {langs.length > 1 && (
          <div className="toolbar facts-lang" role="group" aria-label={tr('Article language', 'Sprache des Artikels')}>
            {langs.map((l) => (
              <button key={l} className="px-btn" aria-pressed={lang === l} onClick={() => setLang(l)} data-nav>
                {l === 'de' ? tr('GERMAN ARTICLE', 'DEUTSCHER ARTIKEL') : tr('ENGLISH ARTICLE', 'ENGLISCHER ARTIKEL')}
              </button>
            ))}
          </div>
        )}
        {isGerman && langs.length === 1 && article && (
          <p className="dim">{tr('This game only has an English Wikipedia article.', 'Zu diesem Spiel gibt es nur einen englischen Wikipedia-Artikel.')}</p>
        )}
        {article === undefined ? (
          loading
        ) : article && parts.length ? (
          <>
            {behind.length > 0 && (
              <p className="dim" style={{ marginTop: 0 }}>
                {tr(
                  '★ marks the stories behind the game: development, music, cut ideas, controversies, versions.',
                  '★ markiert die Geschichten hinter dem Spiel: Entwicklung, Musik, verworfene Ideen, Kontroversen, Versionen.'
                )}
              </p>
            )}
            {behind.map((c, i) => (
              <Chapter key={c.head.title} head={c.head} kids={c.kids} open={i < 2} />
            ))}
            {rest.map((c) => (
              <Chapter key={c.head.title} head={c.head} kids={c.kids} open={false} />
            ))}
            <Credit>
              {tr('Text:', 'Text:')}{' '}
              <a href={article.url} target="_blank" rel="noreferrer">
                Wikipedia ({article.lang.toUpperCase()}), {tr('“', '„')}{article.title}{tr('”', '“')}
              </a>
              ,{' '}
              <a href={article.historyUrl} target="_blank" rel="noreferrer">
                {tr('authors', 'Autoren')}
              </a>
              ,{' '}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.de" target="_blank" rel="noreferrer">
                CC BY-SA 4.0
              </a>
              . {tr('Shown as plain text, without references.', 'Als reiner Text, ohne Einzelnachweise.')}
            </Credit>
          </>
        ) : (
          <p className="dim">{tr('No Wikipedia article with more chapters found.', 'Kein Wikipedia-Artikel mit weiteren Kapiteln gefunden.')}</p>
        )}
      </div>

      {tcrf && (
        <div className="panel">
          <h3 className="pixel-font">{tr('CUT & HIDDEN CONTENT', 'HERAUSGESCHNITTEN & VERSTECKT')}</h3>
          <p className="dim" style={{ marginTop: 0 }}>
            {tr(
              'Unused levels, debug menus, developer messages: what fans found in the game’s code.',
              'Unbenutzte Level, Debug-Menüs, Botschaften der Entwickler: was Fans im Code des Spiels gefunden haben. Der Text ist auf Englisch.'
            )}
          </p>
          {tcrf.sections.map((s, i) => (
            <details key={`${s.title}-${i}`} className="facts-chapter" open={i < 2}>
              <summary data-nav>{s.title}</summary>
              <Paragraphs text={s.text} />
            </details>
          ))}
          <Credit>
            {tr('Text:', 'Text:')}{' '}
            <a href={tcrf.url} target="_blank" rel="noreferrer">
              The Cutting Room Floor, {tr('“', '„')}{tcrf.title}{tr('”', '“')}
            </a>
            ,{' '}
            <a href={tcrf.historyUrl} target="_blank" rel="noreferrer">
              {tr('authors', 'Autoren')}
            </a>
            ,{' '}
            <a href="https://creativecommons.org/licenses/by/3.0/deed.de" target="_blank" rel="noreferrer">
              CC BY 3.0
            </a>
            . {tr('Text only, without the images.', 'Nur der Text, ohne die Bilder.')}
          </Credit>
        </div>
      )}

      {!!facts?.links.length && (
        <>
          <h3 className="pixel-font media-head">{tr('LOOK IT UP IN THE DATABASES', 'IN DEN DATENBANKEN NACHSCHLAGEN')}</h3>
          <div className="links">
            {facts.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer" data-nav>
                <span className="pixel-font" style={{ fontSize: 10, color: 'var(--a3)' }}>
                  {l.name} ↗
                </span>
                <br />
                <span className="dim">{l.text}</span>
              </a>
            ))}
          </div>
          <Credit>{tr('Direct links to this game, as listed on Wikidata.', 'Direkte Links zu diesem Spiel, wie auf Wikidata eingetragen.')}</Credit>
        </>
      )}
    </div>
  );
};
