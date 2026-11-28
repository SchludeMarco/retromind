import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../lib/chiptune';
import { tr } from '../../lib/i18n';
import type { GuideArea } from './AreaGuide';

// The picture guides of the hall (Marco, 2026-11-28: "a large, comprehensive
// image that explains the app … Each individual section should have its own
// large, detailed image … appear only once when the user first accesses the
// corresponding section. After that, the image should be accessible at any
// time through the sidebar"). The pictures were made with ChatGPT from the
// prompts in the chat and live in public/gaming/guide/ (1024×1536 WebP plus a
// small thumbnail each). The overview comes the first time in the hall, an
// area's picture the first time that area opens, the boss picture before the
// first boss fight. All of them stay in the gallery behind the handle
// (📖 GUIDES). The written ℹ️ guides (AreaGuide.tsx) stay too: the "Details"
// button opens them. Which pictures were seen is kept in
// retromind.gaming.posters (synced like the savegame, lib/sync.ts).

export type PosterId = 'overview' | GuideArea | 'boss';

const KEY = 'retromind.gaming.posters';

interface Poster {
  id: PosterId;
  title: () => string;
  /** What the picture says, for screen readers and as a fallback. */
  alt: () => string;
}

export const POSTERS: Poster[] = [
  {
    id: 'overview',
    title: () => tr('HOW IT WORKS', 'SO GEHT’S'),
    alt: () =>
      tr(
        'RetroMind Gaming – how it works: 1 Catalog, 2 Search, 3 Play, 4 Boss of the Day, 5 Quests & Coins, 6 Prize Counter, 7 Stash, 8 Trophies, 9 Legends, 10 Hall of Fame. Controller top right = play, ticket coin = prize counter, menu = all sections.',
        'RetroMind Gaming – so geht’s: 1 Katalog, 2 Suche, 3 Zocken, 4 Endgegner des Tages, 5 Quests & Coins, 6 Preis-Tresen, 7 Stash, 8 Trophäen, 9 Legenden, 10 Bestenliste. Controller oben rechts = Zocken, Ticket-Münze = Preis-Tresen, Menü = alle Bereiche.'
      ),
  },
  {
    id: 'catalog',
    title: () => tr('CATALOG', 'KATALOG'),
    alt: () =>
      tr(
        'The catalog: decades from the 1970s to the 2000s, Which System? to browse by console, tap a cartridge to open the game page with story, facts, videos, music, images and secrets, ask the Guru, Insert Coin for a random game, on this day X years ago.',
        'Der Katalog: Jahrzehnte von den 70ern bis zu den 2000ern, „Welche Kiste?“ nach Konsole, Modul antippen öffnet die Spieleseite mit Story, Fakten, Videos, Musik, Bildern und Geheimnissen, frag den Guru, Insert Coin für ein Zufallsspiel, heute vor X Jahren.'
      ),
  },
  {
    id: 'search',
    title: () => tr('SEARCH', 'SUCHE'),
    alt: () =>
      tr(
        'The search: find every game with an encyclopedia article, results with cover and year, similar games, add to your stash, the full game page, ask the Guru, Insert Coin, load more results below.',
        'Die Suche: jedes Spiel mit Lexikonartikel finden, Treffer mit Cover und Jahr, ähnliche Spiele, in den Stash packen, die ganze Spieleseite, frag den Guru, Insert Coin, weitere Treffer darunter laden.'
      ),
  },
  {
    id: 'chill',
    title: () => tr('PLAY', 'ZOCKEN'),
    alt: () =>
      tr(
        'Play games yourself: daily challenge with +25 coins, the bell sets a reminder, boss of the day, Lightning Challenges with six 30-second games, retro console, load your own ROM, quick games like Snake, pinball, poker and solitaire, random game.',
        'Selbst zocken: Tages-Challenge mit +25 Coins, die Glocke stellt eine Erinnerung ein, Endgegner des Tages, Blitz-Challenges mit sechs 30-Sekunden-Spielen, Retro-Konsole, eigene ROM laden, Schnellspiele wie Snake, Flipper, Poker und Solitär, Zufallsspiel.'
      ),
  },
  {
    id: 'boss',
    title: () => tr('BOSS OF THE DAY', 'ENDGEGNER'),
    alt: () =>
      tr(
        'Boss of the day: a new boss every day, three rounds of 30 seconds, reach the goal to take a third of his life, miss it and you lose a heart, all hearts lost: continue for 10 coins, on Sundays the Overlord with double coins. Rewards: round +5, boss defeated +50, no heart lost +25, first today +15.',
        'Endgegner des Tages: jeden Tag ein neuer Boss, drei Runden à 30 Sekunden, Ziel geschafft nimmt ihm ein Drittel Leben, daneben kostet ein Herz, alle Herzen weg: Continue für 10 Coins, sonntags der Overlord mit doppelten Coins. Belohnung: Runde +5, Sieg +50, kein Herz verloren +25, Erste:r heute +15.'
      ),
  },
  {
    id: 'quests',
    title: () => tr('QUESTS & PRIZES', 'QUESTS & TRESEN'),
    alt: () =>
      tr(
        'Quests and prize counter. Earn coins: 3 daily quests, a weekly quest, your streak, Easter eggs, challenges, the boss of the day. Spend coins: 14 prizes – designs, music, effects like the CRT look and the pixel cursor, and the VIP crown for 200 coins.',
        'Quests und Preis-Tresen. Coins verdienen: 3 Tages-Quests, eine Wochen-Quest, deine Serie, Easter Eggs, Challenges, der Endgegner. Coins ausgeben: 14 Preise – Designs, Musik, Effekte wie Röhrenbild und Pixel-Zeiger, und die VIP-Krone für 200 Coins.'
      ),
  },
  {
    id: 'collection',
    title: () => 'STASH',
    alt: () =>
      tr(
        'Your stash: collect your favorite games, mark the ones you had back then and the ones you beat, add your retro consoles; everything in your stash raises your score.',
        'Dein Stash: Lieblingsspiele sammeln, markieren, was du damals hattest und was du durchgezockt hast, deine Retro-Konsolen eintragen; alles im Stash erhöht deinen Score.'
      ),
  },
  {
    id: 'trophies',
    title: () => tr('TROPHIES', 'TROPHÄEN'),
    alt: () =>
      tr(
        'Trophies unlock by themselves: just play and explore, locked ones show what is still missing, +1000 score for every trophy, boss trophies Slayer, Flawless and Overthrown, secret ones – try the famous cheat code.',
        'Trophäen schalten sich von selbst frei: einfach spielen und entdecken, gesperrte zeigen, was noch fehlt, +1000 Punkte je Trophäe, Boss-Trophäen Bezwinger, Makellos und Gestürzt, geheime – probier den berühmten Cheat.'
      ),
  },
  {
    id: 'legends',
    title: () => tr('LEGENDS', 'LEGENDEN'),
    alt: () =>
      tr(
        'Legends, schoolyard myths from gaming history: the rumor, true or myth – make your guess, the truth, jump to the game page, 8 solved earns a trophy.',
        'Legenden, Schulhof-Mythen der Spielegeschichte: das Gerücht, wahr oder Mythos – tipp ab, die Wahrheit, direkt zur Spieleseite, 8 aufgedeckt bringen eine Trophäe.'
      ),
  },
  {
    id: 'hof',
    title: () => tr('HALL OF FAME', 'BESTENLISTE'),
    alt: () =>
      tr(
        'Hall of Fame, the best players: sign your score with three initials like 1985, every game has its own high score table, tables for today and this week, the boss slayers, a message when someone beats you, and a rematch to win your place back.',
        'Bestenliste, die besten Spieler: unterschreib mit drei Initialen wie 1985, jedes Spiel hat seine eigene Highscore-Tafel, Tafeln für heute und diese Woche, die Boss-Bezwinger, eine Nachricht, wenn dich jemand überholt, und Revanche, um deinen Platz zurückzuholen.'
      ),
  },
];

const src = (id: PosterId, thumb = false) => `/gaming/guide/${id}${thumb ? '-thumb' : ''}.webp`;

function readSeen(): PosterId[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function markSeen(ids: PosterId[]) {
  try {
    const seen = readSeen();
    const next = [...seen, ...ids.filter((id) => !seen.includes(id))];
    if (next.length !== seen.length) localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: the picture simply comes again next time */
  }
}

export const posterSeen = (id: PosterId) => readSeen().includes(id);

/**
 * Which picture is open, and the gallery. `inHall` is true while the hall is
 * on screen: the overview is due the first time, before anything else.
 */
export function usePosters(inHall: boolean) {
  const [open, setOpen] = useState<PosterId | null>(null);
  const [gallery, setGallery] = useState(false);
  // Re-read after closing, so "due" turns false.
  const [, setTick] = useState(0);
  const overviewDue = inHall && !posterSeen('overview');
  const shown = open ?? (overviewDue ? 'overview' : null);

  /** Opens a picture the first time only. */
  const showOnce = useCallback((id: PosterId) => {
    if (!posterSeen(id)) setOpen((o) => o ?? id);
  }, []);
  const show = useCallback((id: PosterId) => {
    chip.play('select');
    setOpen(id);
  }, []);
  const close = useCallback(() => {
    const id = shown;
    if (id) {
      // The overview already shows the catalog, where the hall opens: its own picture can wait for the gallery.
      markSeen(id === 'overview' ? ['overview', 'catalog'] : [id]);
    }
    setOpen(null);
    setTick((t) => t + 1);
  }, [shown]);

  return {
    /** The picture on screen, or null. */
    open: shown,
    /** Anything of the guide on screen (picture or gallery). */
    busy: shown !== null || gallery,
    showOnce,
    show,
    close,
    gallery,
    openGallery: useCallback(() => {
      chip.play('select');
      setGallery(true);
    }, []),
    closeGallery: useCallback(() => setGallery(false), []),
  };
}

/** One picture over the hall. Tap it to see it full size; "Details" opens the written guide where there is one. */
export const PosterView: React.FC<{ id: PosterId; onClose: () => void; onDetails?: () => void; onGallery?: () => void }> = ({ id, onClose, onDetails, onGallery }) => {
  const poster = POSTERS.find((p) => p.id === id)!;
  const [zoom, setZoom] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const okRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);
  useEffect(() => {
    setZoom(false);
    setLoaded(false);
    okRef.current?.focus();
  }, [id]);

  return (
    <div className="overlay poster-overlay" onClick={onClose}>
      <div className="poster" role="dialog" aria-modal="true" aria-label={poster.title()} onClick={(e) => e.stopPropagation()}>
        <div className={`poster-frame${zoom ? ' zoomed' : ''}`}>
          {!loaded && <p className="pixel-font poster-loading blink">{tr('LOADING…', 'LÄDT …')}</p>}
          <img
            src={src(id)}
            alt={poster.alt()}
            width={1024}
            height={1536}
            onLoad={() => setLoaded(true)}
            onClick={() => {
              chip.play('blip');
              setZoom((z) => !z);
            }}
            title={zoom ? tr('Tap to fit', 'Antippen zum Einpassen') : tr('Tap to enlarge', 'Antippen zum Vergrößern')}
          />
        </div>
        <div className="poster-bar">
          {onGallery && (
            <button className="px-btn" onClick={onGallery} data-nav>
              {tr('◄ ALL', '◄ ALLE')}
            </button>
          )}
          {onDetails && (
            <button className="px-btn" onClick={onDetails} data-nav>
              {tr('ⓘ DETAILS', 'ⓘ DETAILS')}
            </button>
          )}
          <button ref={okRef} className="px-btn big poster-ok" onClick={onClose} data-nav>
            {tr('GOT IT!', 'ALLES KLAR!')}
          </button>
        </div>
      </div>
    </div>
  );
};

/** All pictures at a glance, from the handle. */
export const PosterGallery: React.FC<{ onPick: (id: PosterId) => void; onClose: () => void }> = ({ onPick, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);
  return (
    <div className="overlay poster-overlay" onClick={onClose}>
      <div className="dialog poster-gallery" role="dialog" aria-modal="true" aria-label={tr('Guides', 'Anleitungen')} onClick={(e) => e.stopPropagation()}>
        <h2 className="pixel-font">{tr('📖 GUIDES', '📖 ANLEITUNGEN')}</h2>
        <button className="px-btn close-x" onClick={onClose} aria-label={tr('Close', 'Schließen')} data-nav>
          ✕
        </button>
        <div className="poster-grid">
          {POSTERS.map((p, i) => (
            <button key={p.id} className="poster-thumb" onClick={() => onPick(p.id)} data-nav autoFocus={i === 0}>
              <img src={src(p.id, true)} alt="" width={256} height={384} loading="lazy" />
              <span className="pixel-font">{p.title()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
