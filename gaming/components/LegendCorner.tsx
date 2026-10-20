import React, { useEffect, useState } from 'react';
import { tr } from '../../lib/i18n';
import { Legend, LEGENDS, VERDICT_LABEL, Verdict } from '../data/legends';
import { chip } from '../lib/chiptune';

// The Legenden-Ecke (Marco, 2026-10-20): famous gaming legends, myths and
// facts as short stories. Each card first shows the claim as people tell it;
// the player guesses true, half true or myth, then the story behind it opens.
// What was uncovered and guessed right stays in `retromind.gaming.legends`
// (synced like every retromind key, lib/sync.ts).

const KEY = 'retromind.gaming.legends';

interface Progress {
  seen: string[];
  right: string[];
}

function load(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { seen: Array.isArray(raw.seen) ? raw.seen : [], right: Array.isArray(raw.right) ? raw.right : [] };
  } catch {
    return { seen: [], right: [] };
  }
}

const GUESSES: Verdict[] = ['true', 'partly', 'myth'];

export const wikiUrl = (title: string) => `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

const LegendCard: React.FC<{
  legend: Legend;
  seen: boolean;
  right: boolean;
  focused: boolean;
  onGuess: (v: Verdict | null) => void;
  onGame?: () => void;
}> = ({ legend: l, seen, right, focused, onGuess, onGame }) => (
  <article id={`legend-${l.id}`} className={`legend-card${focused ? ' focused' : ''}`} data-verdict={seen ? l.verdict : undefined}>
    <header>
      <span className="legend-icon" aria-hidden="true">
        {l.icon}
      </span>
      <div>
        <h3 className="pixel-font">{l.title}</h3>
        <span className="dim legend-year">{l.year}</span>
      </div>
      {seen && <span className="legend-verdict pixel-font">{VERDICT_LABEL[l.verdict]}</span>}
    </header>
    <p className="legend-claim">{tr(`“${l.claim}”`, `„${l.claim}“`)}</p>
    {!seen ? (
      <div className="legend-guess">
        <span className="pixel-font">{tr('TRUE OR MYTH?', 'WAHR ODER MYTHOS?')}</span>
        <div className="settings-row">
          {GUESSES.map((v) => (
            <button key={v} className="px-btn" onClick={() => onGuess(v)} data-nav>
              {VERDICT_LABEL[v]}
            </button>
          ))}
          <button className="legend-skip" onClick={() => onGuess(null)} data-nav>
            {tr('Just tell me', 'Einfach verraten')}
          </button>
        </div>
      </div>
    ) : (
      <>
        {right && <p className="legend-right pixel-font">{tr('✔ YOU GUESSED RIGHT', '✔ RICHTIG GERATEN')}</p>}
        <p className="legend-story">{l.story}</p>
        <div className="settings-row">
          {onGame && (
            <button className="px-btn" onClick={onGame} data-nav>
              {tr('► TO THE GAME', '► ZUM SPIEL')}
            </button>
          )}
          <a className="legend-more" href={wikiUrl(l.wiki)} target="_blank" rel="noreferrer">
            {tr('More on Wikipedia ↗', 'Mehr auf Wikipedia ↗')}
          </a>
        </div>
      </>
    )}
  </article>
);

export const LegendCorner: React.FC<{
  focus?: string | null;
  onGame: (l: Legend) => (() => void) | undefined;
  onProgress: (seen: number) => void;
}> = ({ focus, onGame, onProgress }) => {
  const [progress, setProgress] = useState<Progress>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable — non-fatal */
    }
    onProgress(progress.seen.length);
  }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps

  // Coming from the legend of the day: bring its card into view.
  useEffect(() => {
    if (!focus) return;
    const t = window.setTimeout(() => document.getElementById(`legend-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    return () => window.clearTimeout(t);
  }, [focus]);

  const guess = (l: Legend, v: Verdict | null) => {
    const hit = v === l.verdict;
    chip.play(v === null ? 'select' : hit ? 'powerup' : 'error');
    setProgress((p) => ({
      seen: p.seen.includes(l.id) ? p.seen : [...p.seen, l.id],
      right: hit && !p.right.includes(l.id) ? [...p.right, l.id] : p.right,
    }));
  };

  return (
    <section className="legend-corner" aria-label={tr('Legends & myths', 'Legenden & Mythen')}>
      <h3 className="pixel-font">{tr('📜 LEGENDS & MYTHS', '📜 LEGENDEN & MYTHEN')}</h3>
      <p className="legend-intro">
        {tr(
          'Stories every gamer has heard at some point. Guess first whether it’s true, half true or a myth, then read what really happened.',
          'Geschichten, die jeder Gamer schon mal gehört hat. Erst raten, ob es wahr, halb wahr oder ein Mythos ist, dann lesen, was wirklich dahintersteckt.'
        )}
      </p>
      <p className="dim pixel-font legend-count">
        {tr(
          `${progress.seen.length}/${LEGENDS.length} UNCOVERED · ${progress.right.length} GUESSED RIGHT`,
          `${progress.seen.length}/${LEGENDS.length} AUFGEDECKT · ${progress.right.length} RICHTIG GERATEN`
        )}
      </p>
      <div className="legend-list">
        {LEGENDS.map((l) => (
          <LegendCard
            key={l.id}
            legend={l}
            seen={progress.seen.includes(l.id)}
            right={progress.right.includes(l.id)}
            focused={focus === l.id}
            onGuess={(v) => guess(l, v)}
            onGame={onGame(l)}
          />
        ))}
      </div>
      <p className="dim legend-source">
        {tr(
          'Written for RetroMind from well-documented facts; the linked Wikipedia articles have the sources.',
          'Für RetroMind geschrieben, aus gut belegten Fakten; die verlinkten Wikipedia-Artikel nennen die Quellen.'
        )}
      </p>
    </section>
  );
};
