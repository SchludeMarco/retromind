import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../lib/chiptune';

// The "Chill-Ecke": three small, calm games to unwind between the history
// lessons. No timers, no game over screens that punish; just tap and relax.
// Everything is drawn with buttons, so touch, mouse, keyboard and gamepad all
// work, and sounds go through the chip (which follows lib/mute).

export type MiniGameId = 'memory' | 'puzzle' | 'senso';

export const MINI_GAMES: { id: MiniGameId; title: string; icon: string; text: string; best: (n: number) => string }[] = [
  {
    id: 'memory',
    title: 'PIXEL-MEMORY',
    icon: '👾',
    text: 'Karten umdrehen, Pärchen finden. Ganz ohne Zeitdruck.',
    best: (n) => `Bestes Spiel: ${n} Züge`,
  },
  {
    id: 'puzzle',
    title: 'SCHIEBEPUZZLE',
    icon: '🧩',
    text: 'Plättchen 1 bis 8 wieder in die richtige Reihenfolge schieben, wie beim Taschenpuzzle von früher.',
    best: (n) => `Bestes Spiel: ${n} Züge`,
  },
  {
    id: 'senso',
    title: 'SENSO',
    icon: '🔴',
    text: 'Melodie anhören und nachtippen. Jede Runde kommt ein Ton dazu.',
    best: (n) => `Rekord: Runde ${n}`,
  },
];

const KEY = 'retromind.gaming.mini.v1';

type Bests = Partial<Record<MiniGameId, number>>;

function loadBests(): Bests {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') ?? {};
  } catch {
    return {};
  }
}

/** Saves a result if it beats the old one; returns true for a new record. */
function saveBest(id: MiniGameId, value: number, higherIsBetter: boolean): boolean {
  const bests = loadBests();
  const old = bests[id];
  const better = old === undefined || (higherIsBetter ? value > old : value < old);
  if (!better) return false;
  bests[id] = value;
  try {
    localStorage.setItem(KEY, JSON.stringify(bests));
  } catch {
    /* storage unavailable — the record only lives for this visit */
  }
  return true;
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Done: React.FC<{ text: string; record: boolean; onAgain: () => void }> = ({ text, record, onAgain }) => (
  <div className="mini-done" role="status">
    <p className="pixel-font">{record ? '★ NEUER REKORD! ★' : 'GESCHAFFT!'}</p>
    <p>{text}</p>
    <button className="px-btn big" onClick={onAgain} data-nav autoFocus>
      NOCHMAL
    </button>
  </div>
);

/* ---------------------------------------------------------------- Memory */

const MEMORY_ICONS = ['👾', '🍄', '⭐', '💎', '🔑', '🍒', '🎮', '🚀'];
const FLIP_NOTES = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6'];

const Memory: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const deal = () => shuffle([...MEMORY_ICONS, ...MEMORY_ICONS]);
  const [cards, setCards] = useState<string[]>(deal);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [result, setResult] = useState<{ record: boolean } | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || found.includes(cards[i])) return;
    chip.softNote(FLIP_NOTES[MEMORY_ICONS.indexOf(cards[i])], 0.18);
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    const m = moves + 1;
    setMoves(m);
    if (cards[next[0]] === cards[next[1]]) {
      const nowFound = [...found, cards[i]];
      setFound(nowFound);
      setOpen([]);
      if (nowFound.length === MEMORY_ICONS.length) {
        chip.play('powerup');
        setResult({ record: saveBest('memory', m, false) });
        onWin();
      } else chip.play('coin');
    } else {
      // Mismatch: both stay visible for a moment, then quietly turn back.
      timer.current = window.setTimeout(() => setOpen([]), 900);
    }
  };

  const again = () => {
    chip.play('select');
    setCards(deal());
    setOpen([]);
    setFound([]);
    setMoves(0);
    setResult(null);
  };

  return (
    <>
      <p className="mini-score">Züge: {moves} · Pärchen: {found.length}/{MEMORY_ICONS.length}</p>
      <div className="memory-grid">
        {cards.map((icon, i) => {
          const shown = open.includes(i) || found.includes(icon);
          return (
            <button
              key={i}
              className={`memory-card${shown ? ' shown' : ''}${found.includes(icon) ? ' found' : ''}`}
              onClick={() => flip(i)}
              data-nav
              aria-label={shown ? icon : 'verdeckte Karte'}
            >
              <span aria-hidden="true">{shown ? icon : '?'}</span>
            </button>
          );
        })}
      </div>
      {result && <Done text={`Alle Pärchen in ${moves} Zügen gefunden.`} record={result.record} onAgain={again} />}
    </>
  );
};

/* ---------------------------------------------------------- Slide puzzle */

const SIZE = 3;
const SOLVED = [...Array.from({ length: SIZE * SIZE - 1 }, (_, i) => i + 1), 0];

function neighbours(blank: number): number[] {
  const r = Math.floor(blank / SIZE);
  const c = blank % SIZE;
  const out: number[] = [];
  if (r > 0) out.push(blank - SIZE);
  if (r < SIZE - 1) out.push(blank + SIZE);
  if (c > 0) out.push(blank - 1);
  if (c < SIZE - 1) out.push(blank + 1);
  return out;
}

/** Shuffles by making random legal moves from the solved board, so every board can be solved. */
function scramble(): number[] {
  const tiles = [...SOLVED];
  let blank = tiles.length - 1;
  let last = -1;
  for (let n = 0; n < 160; n++) {
    const options = neighbours(blank).filter((x) => x !== last);
    const pick = options[Math.floor(Math.random() * options.length)];
    [tiles[blank], tiles[pick]] = [tiles[pick], tiles[blank]];
    last = blank;
    blank = pick;
  }
  return tiles.join() === SOLVED.join() ? scramble() : tiles;
}

const Puzzle: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [tiles, setTiles] = useState<number[]>(scramble);
  const [moves, setMoves] = useState(0);
  const [result, setResult] = useState<{ record: boolean } | null>(null);

  const slide = (i: number) => {
    if (result) return;
    const blank = tiles.indexOf(0);
    if (!neighbours(blank).includes(i)) {
      chip.play('blip');
      return;
    }
    const next = [...tiles];
    [next[blank], next[i]] = [next[i], next[blank]];
    const m = moves + 1;
    setTiles(next);
    setMoves(m);
    if (next.join() === SOLVED.join()) {
      chip.play('powerup');
      setResult({ record: saveBest('puzzle', m, false) });
      onWin();
    } else chip.softNote(FLIP_NOTES[(next[blank] - 1) % FLIP_NOTES.length], 0.12);
  };

  const again = () => {
    chip.play('select');
    setTiles(scramble());
    setMoves(0);
    setResult(null);
  };

  return (
    <>
      <p className="mini-score">Züge: {moves} · Ziel: 1 bis 8 der Reihe nach</p>
      <div className="puzzle-grid">
        {tiles.map((t, i) =>
          t ? (
            <button
              key={t}
              className={`puzzle-tile${t === i + 1 ? ' right' : ''}`}
              style={{ gridRow: Math.floor(i / SIZE) + 1, gridColumn: (i % SIZE) + 1 }}
              onClick={() => slide(i)}
              data-nav
              aria-label={`Plättchen ${t}`}
            >
              {t}
            </button>
          ) : (
            <span key="blank" className="puzzle-blank" style={{ gridRow: Math.floor(i / SIZE) + 1, gridColumn: (i % SIZE) + 1 }} />
          )
        )}
      </div>
      {result && <Done text={`In ${moves} Zügen sortiert.`} record={result.record} onAgain={again} />}
    </>
  );
};

/* ------------------------------------------------------------------ Senso */

const PADS = [
  { name: 'Grün', note: 'E4' },
  { name: 'Rot', note: 'A4' },
  { name: 'Gelb', note: 'C#5' },
  { name: 'Blau', note: 'E5' },
];

const Senso: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [seq, setSeq] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'show' | 'input' | 'over'>('idle');
  const [result, setResult] = useState<{ round: number; record: boolean } | null>(null);
  const timers = useRef<number[]>([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const flash = useCallback((pad: number, ms: number) => {
    setLit(pad);
    chip.softNote(PADS[pad].note, ms / 1000);
    timers.current.push(window.setTimeout(() => setLit(null), ms));
  }, []);

  // Plays the melody slowly; a little faster from round 6 on, never hectic.
  const show = useCallback(
    (melody: number[]) => {
      clear();
      setPhase('show');
      const step = melody.length > 5 ? 560 : 700;
      melody.forEach((pad, i) => timers.current.push(window.setTimeout(() => flash(pad, step * 0.65), 600 + i * step)));
      timers.current.push(
        window.setTimeout(() => {
          setPos(0);
          setPhase('input');
        }, 600 + melody.length * step)
      );
    },
    [flash]
  );

  const start = () => {
    chip.play('select');
    setResult(null);
    const first = [Math.floor(Math.random() * 4)];
    setSeq(first);
    show(first);
  };

  const press = (pad: number) => {
    if (phase !== 'input') return;
    if (pad !== seq[pos]) {
      chip.play('error');
      const round = seq.length - 1;
      setPhase('over');
      setResult({ round, record: round > 0 && saveBest('senso', round, true) });
      if (round >= 5) onWin();
      return;
    }
    flash(pad, 260);
    if (pos + 1 < seq.length) {
      setPos(pos + 1);
      return;
    }
    const next = [...seq, Math.floor(Math.random() * 4)];
    setSeq(next);
    setPhase('show');
    timers.current.push(window.setTimeout(() => show(next), 500));
  };

  return (
    <>
      <p className="mini-score" aria-live="polite">
        {phase === 'idle'
          ? 'Hör gut zu und tippe die Farben in derselben Reihenfolge nach.'
          : phase === 'show'
            ? `Runde ${seq.length}: hör zu …`
            : phase === 'input'
              ? `Runde ${seq.length}: du bist dran (${pos}/${seq.length})`
              : `Runde ${seq.length} war knapp daneben.`}
      </p>
      <div className={`senso-board${phase === 'input' ? ' ready' : ''}`}>
        {PADS.map((p, i) => (
          <button
            key={p.name}
            className={`senso-pad pad-${i}${lit === i ? ' lit' : ''}`}
            onClick={() => press(i)}
            disabled={phase !== 'input'}
            data-nav
            aria-label={p.name}
          />
        ))}
      </div>
      {phase === 'idle' && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button className="px-btn big" onClick={start} data-nav autoFocus>
            ▶ START
          </button>
        </div>
      )}
      {phase === 'over' && result && (
        <Done
          text={result.round ? `Du hast ${result.round} ${result.round === 1 ? 'Runde' : 'Runden'} geschafft.` : 'Gleich nochmal, das wird!'}
          record={result.record}
          onAgain={start}
        />
      )}
    </>
  );
};

/* --------------------------------------------------------------- Corner */

/** The list of games in the hub. */
export const MiniGameCorner: React.FC<{ onPick: (id: MiniGameId) => void }> = ({ onPick }) => {
  const bests = loadBests();
  return (
    <>
      <p className="dim archive-count">Kurz mal abschalten: drei ruhige Minispiele, ohne Zeitdruck und ohne Werbung.</p>
      <div className="grid mini-list" style={{ marginTop: 12 }}>
        {MINI_GAMES.map((g) => (
          <button key={g.id} className="panel mini-card" onClick={() => onPick(g.id)} data-nav>
            <span className="mini-icon" aria-hidden="true">
              {g.icon}
            </span>
            <span className="pixel-font mini-title">{g.title}</span>
            <span>{g.text}</span>
            {bests[g.id] !== undefined && <span className="dim mini-best">{g.best(bests[g.id]!)}</span>}
          </button>
        ))}
      </div>
    </>
  );
};

/** One mini game in a sheet over the hub. */
export const MiniGameDialog: React.FC<{ id: MiniGameId; onClose: () => void; onWin: () => void }> = ({ id, onClose, onWin }) => {
  const game = MINI_GAMES.find((g) => g.id === id)!;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog mini-dialog" role="dialog" aria-modal="true" aria-label={game.title} onClick={(e) => e.stopPropagation()}>
        <h2 className="pixel-font">
          {game.icon} {game.title}
        </h2>
        <button className="px-btn close-x" onClick={onClose} aria-label="Schließen" data-nav>
          ✕
        </button>
        {id === 'memory' ? <Memory onWin={onWin} /> : id === 'puzzle' ? <Puzzle onWin={onWin} /> : <Senso onWin={onWin} />}
      </div>
    </div>
  );
};
