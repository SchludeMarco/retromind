import React, { useEffect, useRef, useState } from 'react';
import { getLang, tr } from '../../lib/i18n';
import { useTickerFeed } from '../../lib/tickerFeed';
import { TickerArrow, TickerTrack, TickerTrackHandle } from '../../components/TickerTrack';
import { Game, GAMES, TICKER_FACTS } from '../data/games';
import { fetchTickerFacts } from '../lib/ai';

// The fun-fact ticker of the hall (Marco, 2026-10-18): like the Laufband of
// the Zeitreise, pinned at the very bottom just above the dock, slow, and
// pushed along with a finger or stepped with the arrows
// (components/TickerTrack.tsx). It never runs dry: besides the facts written
// for it, every catalog game brings its fun fact and its release, and once
// all of those ran past the Guru's AI adds fresh ones (lib/tickerFeed.ts).
// Tapping a game's entry opens that game.

interface HallFact {
  id: string;
  text: string;
  gameId?: string;
}

const AI_KEY = 'retromind.ticker.gaming.ai';
const AI_MAX = 240;

function loadAi(): HallFact[] {
  try {
    const raw = JSON.parse(localStorage.getItem(AI_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((f) => f && typeof f.id === 'string' && typeof f.text === 'string') : [];
  } catch {
    return [];
  }
}

let aiFacts = loadAi();

const hash = (text: string) => {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

function builtIn(): HallFact[] {
  const facts: HallFact[] = TICKER_FACTS.map((text, i) => ({ id: `fact-${i}`, text }));
  for (const g of GAMES) {
    if (g.funFact) facts.push({ id: `fun-${g.id}`, text: `${g.title}: ${g.funFact}`, gameId: g.id });
    facts.push({
      id: `rel-${g.id}`,
      text: tr(`${g.year}: ${g.title} comes out for the ${g.platform}`, `${g.year}: ${g.title} erscheint für ${g.platform}`),
      gameId: g.id,
    });
  }
  return facts;
}

const pool = () => {
  const lang = getLang();
  return [...builtIn(), ...aiFacts.filter((f) => f.id.startsWith(`ai-${lang}-`))];
};

async function more(recent: HallFact[]): Promise<HallFact[]> {
  const lang = getLang();
  const known = new Set(pool().map((f) => f.text.toLowerCase()));
  const fresh: HallFact[] = [];
  for (const text of await fetchTickerFacts(recent.map((f) => f.text))) {
    const t = text.slice(0, 160);
    if (known.has(t.toLowerCase())) continue;
    known.add(t.toLowerCase());
    fresh.push({ id: `ai-${lang}-${hash(t)}`, text: t });
  }
  if (fresh.length) {
    aiFacts = [...aiFacts, ...fresh].slice(-AI_MAX);
    try {
      localStorage.setItem(AI_KEY, JSON.stringify(aiFacts));
    } catch {
      /* storage full: they still run this visit */
    }
  }
  return fresh;
}

const valid = (f: HallFact) => !f.gameId || GAMES.some((g) => g.id === f.gameId);

export const HallTicker: React.FC<{ onOpen: (game: Game) => void; onSound: () => void }> = ({ onOpen, onSound }) => {
  const feed = useTickerFeed<HallFact>({ key: 'gaming', pool, more, valid });
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const track = useRef<TickerTrackHandle>(null);
  const self = useRef<HTMLElement>(null);

  // Sits right on top of the dock, however tall the dock is in this design;
  // the buttons floating above the dock make room for it (gaming.css).
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.ticker = '';
    const dock = document.querySelector('.dock') as HTMLElement | null;
    const measure = () => {
      if (dock) root.style.setProperty('--dock-h', `${dock.offsetHeight}px`);
      if (self.current) root.style.setProperty('--ticker-h', `${self.current.offsetHeight}px`);
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (dock) ro?.observe(dock);
    if (self.current) ro?.observe(self.current);
    return () => {
      ro?.disconnect();
      delete root.dataset.ticker;
      root.style.removeProperty('--dock-h');
      root.style.removeProperty('--ticker-h');
    };
  }, []);

  const step = (dir: -1 | 1) => {
    onSound();
    track.current?.step(dir);
  };

  return (
    <section ref={self} className="hall-ticker" aria-label={tr('Fun facts', 'Fun Facts')}>
      <span className="hall-ticker-badge" aria-hidden="true">
        <span className="hall-ticker-badge-long">{tr('FUN FACT, DUDE', 'FUN FACT, DIGGA')}</span>
        <span className="hall-ticker-badge-short">★</span>
      </span>
      <TickerArrow dir={-1} className="hall-ticker-step" onStep={() => step(-1)} />
      <TickerTrack
        ref={track}
        slots={feed.slots}
        startSeq={feed.startSeq}
        stopped={paused || held}
        onHold={setHeld}
        onNeedMore={feed.needMore}
        onReach={feed.reached}
        className="hall-ticker-view"
        listClassName="hall-ticker-list"
        itemClassName="hall-ticker-entry"
        render={({ item }) => {
          const game = item.gameId ? GAMES.find((g) => g.id === item.gameId) : undefined;
          return (
            <>
              {game ? (
                <button
                  type="button"
                  className="hall-ticker-link"
                  onClick={() => onOpen(game)}
                  aria-label={tr(`${item.text}. Open ${game.title}`, `${item.text}. ${game.title} öffnen`)}
                >
                  {item.text}
                </button>
              ) : (
                <span className="hall-ticker-text">{item.text}</span>
              )}
              <span className="hall-ticker-star" aria-hidden="true">★</span>
            </>
          );
        }}
      />
      <TickerArrow dir={1} className="hall-ticker-step" onStep={() => step(1)} />
      <button
        type="button"
        className="hall-ticker-step hall-ticker-pause"
        onClick={() => {
          onSound();
          setPaused((p) => !p);
        }}
        aria-pressed={paused}
        aria-label={paused ? tr('Let the ticker run', 'Ticker weiterlaufen lassen') : tr('Stop the ticker', 'Ticker anhalten')}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d={paused ? 'M8 5v14l11-7z' : 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z'} fill="currentColor" />
        </svg>
      </button>
    </section>
  );
};
