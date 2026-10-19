import React, { useState } from 'react';
import { GLOSSARY, GlossaryEntry, GlossaryTopic, glossaryDecades, searchGlossary } from '../lib/glossary';
import { tr } from '../lib/i18n';

// "Damals & heute" in Erkunden (Marco, 2026-10-19): a dictionary of words and
// things from back then next to what they are today, each with a sentence as
// you said it then and as you say it now (lib/glossary.ts). Ribbons for the
// decades (your own first) like Omas Kochbuch, topics to narrow it down, a
// search over everything, and a guessing mode that covers up "today" until
// you tap it.

const TOPIC: Record<GlossaryTopic, { icon: string; label: string }> = {
  tech: { icon: '📞', label: tr('Gadgets', 'Technik') },
  talk: { icon: '💬', label: tr('Slang', 'Jugendsprache') },
  everyday: { icon: '🏠', label: tr('Everyday life', 'Alltag') },
  money: { icon: '💰', label: tr('Money', 'Geld') },
  media: { icon: '📺', label: tr('TV & music', 'Fernsehen & Musik') },
  games: { icon: '🕹️', label: tr('Games', 'Spiele') },
};

const decadeLabel = (d: string) => tr(`${d}s`, `${d}er`);
const quote = (s: string) => tr(`“${s}”`, `„${s}“`);

const EntryCard: React.FC<{
  entry: GlossaryEntry;
  showDecade: boolean;
  covered: boolean;
  onReveal: () => void;
  remembered: boolean;
  onRemember: () => void;
}> = ({ entry, showDecade, covered, onReveal, remembered, onRemember }) => (
  <article className="glossary-card">
    <p className="rm-eyebrow">
      <span aria-hidden="true">{TOPIC[entry.topic].icon}</span> {TOPIC[entry.topic].label}
      {showDecade && ` · ${decadeLabel(entry.decade)}`}
    </p>
    <div className="glossary-pair">
      <div>
        <span className="glossary-label">{tr('Then', 'Damals')}</span>
        <span className="glossary-word">{entry.then}</span>
      </div>
      <span aria-hidden="true" className="glossary-arrow">→</span>
      <div>
        <span className="glossary-label">{tr('Today', 'Heute')}</span>
        {covered ? (
          <button onClick={onReveal} className="glossary-reveal">
            {tr('Guess, then tap', 'Raten, dann tippen')}
          </button>
        ) : (
          <span className="glossary-word is-now">{entry.now}</span>
        )}
      </div>
    </div>
    <p className="glossary-note">{entry.note}</p>
    <dl className="glossary-say">
      <div>
        <dt>{tr('How you said it then', 'So sagte man damals')}</dt>
        <dd>{quote(entry.sayThen)}</dd>
      </div>
      {!covered && (
        <div>
          <dt>{tr('How you say it today', 'So sagt man heute')}</dt>
          <dd>{quote(entry.sayNow)}</dd>
        </div>
      )}
    </dl>
    <button onClick={onRemember} className={`glossary-remember ${remembered ? 'is-done' : ''}`}>
      {remembered ? tr('✓ In your memory book', '✓ Im Erinnerungsbuch') : tr('+ Remember: did you say it too?', '+ Erinnern: Hast du das auch gesagt?')}
    </button>
  </article>
);

export const GlossarySection: React.FC<{
  focusDecade: string;
  isAnswered: (id: string) => boolean;
  onRemember: (wordId: string, term: string, knowledge: string, decade: string, fallbackQuestion: string) => void;
  backButton: React.ReactNode;
}> = ({ focusDecade, isAnswered, onRemember, backButton }) => {
  const decades = glossaryDecades(focusDecade);
  const [decade, setDecade] = useState(decades[0]);
  const [topic, setTopic] = useState<GlossaryTopic | null>(null);
  const [query, setQuery] = useState('');
  const [guessing, setGuessing] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const searching = query.trim().length > 0;
  const inDecade = GLOSSARY.filter((e) => e.decade === decade);
  const topics = (Object.keys(TOPIC) as GlossaryTopic[]).filter((t) => inDecade.some((e) => e.topic === t));
  const entries = searching ? searchGlossary(query) : inDecade.filter((e) => !topic || e.topic === topic);

  const pickDecade = (d: string) => {
    setDecade(d);
    setTopic(null);
  };
  const toggleGuessing = () => {
    setGuessing((g) => !g);
    setRevealed(new Set());
  };
  const remember = (e: GlossaryEntry) =>
    onRemember(
      `glossary-${e.id}`,
      `${e.then} → ${e.now}`,
      `${e.note} ${quote(e.sayThen)}`,
      e.decade,
      tr(
        `Did you say or use “${e.then}” back then? Who comes to mind when you hear it?`,
        `Hast du „${e.then}“ damals selbst gesagt oder benutzt? Wer fällt dir dabei ein?`
      )
    );

  return (
    <div className="space-y-8">
      <header className="space-y-5">
        {backButton}
        <div className="rm-stop-header">
          <p className="rm-eyebrow">{tr('Explore', 'Erkunden')}</p>
          <h2 className="rm-title flex items-center gap-3">
            <span aria-hidden="true">🗝️</span> {tr('Then & Now', 'Damals & heute')}
          </h2>
          <p className="rm-lead">
            {tr(
              'Words and things from back then, next to what they are today, each with a sentence as you said it then and as you say it now.',
              'Begriffe und Dinge von damals neben dem, was sie heute sind, jeweils mit einem Satz, wie man ihn damals sagte und wie man ihn heute sagt.'
            )}
          </p>
        </div>
      </header>

      <div className="glossary-tools">
        <label className="glossary-search">
          <span className="sr-only">{tr('Search the dictionary', 'Im Wörterbuch suchen')}</span>
          <span aria-hidden="true">🔍</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr('Search, e.g. phone or tape', 'Suchen, z. B. Telefon oder Kassette')}
          />
        </label>
        <button onClick={toggleGuessing} aria-pressed={guessing} className={`glossary-toggle ${guessing ? 'is-on' : ''}`}>
          {guessing ? tr('🙈 Guessing on', '🙈 Raten an') : tr('🙈 Cover up “today”', '🙈 „Heute“ abdecken')}
        </button>
      </div>

      <div className="cookbook">
        {!searching && (
          <div className="cookbook-ribbons" role="tablist" aria-label={tr('Decades', 'Jahrzehnte')}>
            {decades.map((d) => (
              <button
                key={d}
                role="tab"
                aria-selected={d === decade}
                onClick={() => pickDecade(d)}
                className={`cookbook-ribbon ${d === decade ? 'is-active' : ''}`}
              >
                {decadeLabel(d)}
                {d === focusDecade && <span className="sr-only">{tr(' (your era)', ' (deine Zeit)')}</span>}
                {d === focusDecade && <span aria-hidden="true"> ★</span>}
              </button>
            ))}
          </div>
        )}
        <div className="cookbook-paper" role={searching ? undefined : 'tabpanel'}>
          {searching ? (
            <p className="rm-eyebrow mb-4" aria-live="polite">
              {tr(
                `${entries.length} match${entries.length === 1 ? '' : 'es'} in all decades`,
                `${entries.length} Treffer in allen Jahrzehnten`
              )}
            </p>
          ) : (
            <div className="glossary-topics" role="group" aria-label={tr('Topics', 'Themen')}>
              <button onClick={() => setTopic(null)} aria-pressed={topic === null} className={`glossary-chip ${topic === null ? 'is-active' : ''}`}>
                {tr('All', 'Alle')}
              </button>
              {topics.map((t) => (
                <button key={t} onClick={() => setTopic(t)} aria-pressed={topic === t} className={`glossary-chip ${topic === t ? 'is-active' : ''}`}>
                  <span aria-hidden="true">{TOPIC[t].icon}</span> {TOPIC[t].label}
                </button>
              ))}
            </div>
          )}
          {entries.length === 0 ? (
            <p className="cookbook-story">
              {tr('Nothing found. Try another word, maybe the one from today.', 'Nichts gefunden. Versuch ein anderes Wort, vielleicht das von heute.')}
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {entries.map((e) => (
                <EntryCard
                  key={e.id}
                  entry={e}
                  showDecade={searching}
                  covered={guessing && !revealed.has(e.id)}
                  onReveal={() => setRevealed((s) => new Set(s).add(e.id))}
                  remembered={isAnswered(`glossary-${e.id}`)}
                  onRemember={() => remember(e)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
