import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../lib/chiptune';
import { Done, loadBests, MiniGameId, saveBest, shuffle } from './minigames/shared';
import { Sudoku, sudokuBest } from './minigames/Sudoku';
import { Blocks, blocksBest } from './minigames/Blocks';
import { Pinball, pinballBest } from './minigames/Pinball';
import { PacMan, pacmanBest } from './minigames/PacMan';
import { Breakout, breakoutBest } from './minigames/Breakout';
import { Snake, snakeBest } from './minigames/Snake';
import { Invaders, invadersBest } from './minigames/Invaders';
import { Quiz, quizBest } from './minigames/Quiz';
import { VideoPoker, pokerBest } from './minigames/VideoPoker';
import { Blackjack, blackjackBest } from './minigames/Blackjack';
import { Solitaire, solitaireBest } from './minigames/Solitaire';
import { Asteroids, asteroidsBest } from './minigames/Asteroids';
import { Frogger, froggerBest } from './minigames/Frogger';
import { Copter, copterBest } from './minigames/Copter';
import { Merge2048, mergeBest } from './minigames/Merge2048';
import { Missile, missileBest } from './minigames/Missile';
import { tr } from '../../lib/i18n';

// The "Chill-Ecke": small, calm games to unwind between the history
// lessons. Memory, slide puzzle and Senso live here; Sudoku, the falling
// blocks, pinball, Pac-Mampf and the card games (video poker, blackjack,
// solitaire, sharing the deck in ./minigames/cards) and the high score chasers (asteroids,
// frog hop, cave copter, 2048, missile defense) have their own files in ./minigames. Everything works by
// touch, mouse and keyboard, and sounds go through the chip (which follows
// lib/mute).

export type { MiniGameId };

export const MINI_GAMES: { id: MiniGameId; title: string; /** German title, the stable key for usage stats. */ statKey: string; icon: string; text: string; best: (n: number) => string }[] = [
  {
    id: 'memory',
    title: tr('PIXEL MEMORY', 'PIXEL-MEMORY'),
    statKey: 'PIXEL-MEMORY',
    icon: '👾',
    text: tr('Flip cards, find pairs. No time pressure at all.', 'Karten umdrehen, Pärchen finden. Ganz ohne Zeitdruck.'),
    best: (n) => tr(`Best game: ${n} moves`, `Bestes Spiel: ${n} Züge`),
  },
  {
    id: 'puzzle',
    title: tr('SLIDE PUZZLE', 'SCHIEBEPUZZLE'),
    statKey: 'SCHIEBEPUZZLE',
    icon: '🧩',
    text: tr('Slide tiles 1 to 8 back into the right order, just like the pocket puzzles of old.', 'Plättchen 1 bis 8 wieder in die richtige Reihenfolge schieben, wie beim Taschenpuzzle von früher.'),
    best: (n) => tr(`Best game: ${n} moves`, `Bestes Spiel: ${n} Züge`),
  },
  {
    id: 'senso',
    title: tr('COLOR ECHO', 'FARBECHO'),
    statKey: 'SENSO',
    icon: '🔴',
    text: tr('Listen to the tune and tap it back. Every round adds a note.', 'Melodie anhören und nachtippen. Jede Runde kommt ein Ton dazu.'),
    best: (n) => tr(`Record: round ${n}`, `Rekord: Runde ${n}`),
  },
  {
    id: 'sudoku',
    title: 'SUDOKU',
    statKey: 'SUDOKU',
    icon: '🔢',
    text: tr('The numbers 1 to 9 in every row, column and box. Every puzzle is new.', 'Die Zahlen 1 bis 9 in jede Zeile, Spalte und jedes Kästchen. Jedes Rätsel ist neu.'),
    best: sudokuBest,
  },
  {
    id: 'blocks',
    title: tr('BLOCK STACKER', 'BLOCKSTAPLER'),
    statKey: 'BLOCKSTAPLER',
    icon: '🧱',
    text: tr('Stack falling blocks into full rows, like the Game Boy classic. Starts out nice and easy.', 'Fallende Blöcke zu vollen Reihen stapeln, wie beim Game-Boy-Klassiker. Startet gemütlich.'),
    best: blocksBest,
  },
  {
    id: 'pinball',
    title: tr('PINBALL', 'FLIPPER'),
    statKey: 'FLIPPER',
    icon: '🎱',
    text: tr('A little pinball table with three balls. The left and right halves of the screen move the flippers.', 'Kleiner Flippertisch mit drei Kugeln. Linke und rechte Bildschirmhälfte bewegen die Flipper.'),
    best: pinballBest,
  },
  {
    id: 'pacman',
    title: tr('PAC-MUNCH', 'PAC-MAMPF'),
    statKey: 'PAC-MAMPF',
    icon: '🟡',
    text: tr(
      'Gobble dots, dodge ghosts, turn the tables after a power pellet. Just like Pac-Man at the arcade. Swipe or use the arrow keys.',
      'Punkte futtern, Geistern ausweichen, nach der Kraftpille den Spieß umdrehen. Wie Pac-Man am Automaten. Wischen oder Pfeiltasten.'
    ),
    best: pacmanBest,
  },
  {
    id: 'quiz',
    title: tr('NAME THAT GAME', 'ERKENNST DU DAS SPIEL?'),
    statKey: 'SPIELE-QUIZ',
    icon: '🕹️',
    text: tr('A short description, platform and year, four titles: which game is it? Every right answer pays a coin (up to 5 a day).', 'Eine kurze Beschreibung, Plattform und Jahr, vier Titel: Welches Spiel ist es? Jede richtige Antwort bringt einen Coin (bis zu 5 am Tag).'),
    best: quizBest,
  },
  {
    id: 'breakout',
    title: tr('BRICK BASH', 'MAUERBRECHER'),
    statKey: 'BREAKOUT',
    icon: '🏓',
    text: tr('Bounce the ball into the wall of bricks, like the 1976 arcade classic. Drag to move the paddle.', 'Den Ball in die Steinmauer schmettern, wie beim Automaten-Klassiker von 1976. Ziehen bewegt den Schläger.'),
    best: breakoutBest,
  },
  {
    id: 'snake',
    title: 'SNAKE',
    statKey: 'SNAKE',
    icon: '🐍',
    text: tr('Eat the apples, don’t bite your tail, just like on the old phones. Swipe to steer.', 'Äpfel futtern, nicht in den eigenen Schwanz beißen, wie auf den alten Handys. Wischen zum Lenken.'),
    best: snakeBest,
  },
  {
    id: 'invaders',
    title: tr('SPACE INVASION', 'WELTRAUM-INVASION'),
    statKey: 'WELTRAUM-INVASION',
    icon: '🛸',
    text: tr('Rows of aliens march down: shoot them before they land, like Space Invaders in 1978. Drag to move, tap to fire.', 'Reihen von Aliens marschieren herab: abschießen, bevor sie landen, wie Space Invaders 1978. Ziehen zum Bewegen, tippen zum Schießen.'),
    best: invadersBest,
  },
  {
    id: 'poker',
    title: tr('VIDEO POKER', 'VIDEO-POKER'),
    statKey: 'VIDEO-POKER',
    icon: '🃏',
    text: tr(
      'Five cards, keep the good ones, draw once: “Jacks or Better” like the poker machines of old. 20 hands, 100 play credits, no real money.',
      'Fünf Karten, die guten halten, einmal ziehen: „Jacks or Better“ wie an den Poker-Automaten von früher. 20 Hände, 100 Spiel-Credits, kein echtes Geld.'
    ),
    best: pokerBest,
  },
  {
    id: 'blackjack',
    title: 'BLACKJACK',
    statKey: 'BLACKJACK',
    icon: '♠️',
    text: tr(
      'Get closer to 21 than the dealer without going over. Hit, stand or double down. 10 hands, 100 play chips, no real money.',
      'Näher an 21 als die Bank, ohne drüber zu kommen (17 und 4). Karte, halten oder verdoppeln. 10 Hände, 100 Spiel-Chips, kein echtes Geld.'
    ),
    best: blackjackBest,
  },
  {
    id: 'solitaire',
    title: tr('SOLITAIRE', 'SOLITÄR'),
    statKey: 'SOLITÄR',
    icon: '♥️',
    text: tr(
      'The card game from every old Windows PC: build each suit from ace to king. Tap to pick up, tap to drop, undo whenever you like.',
      'Das Kartenspiel von jedem alten Windows-PC: jede Farbe vom Ass bis zum König ablegen. Antippen zum Nehmen, antippen zum Ablegen, Zurück geht immer.'
    ),
    best: solitaireBest,
  },
  {
    id: 'asteroids',
    title: tr('ASTEROIDS', 'ASTEROIDEN'),
    statKey: 'ASTEROIDEN',
    icon: '☄️',
    text: tr(
      'Turn, thrust and blast the rocks to pieces, like the 1979 vector cabinet. Big rocks split into faster small ones; an extra ship every 10,000 points.',
      'Drehen, Schub geben und die Felsbrocken zerschießen, wie am Vektor-Automaten von 1979. Große Brocken zerfallen in schnellere kleine; alle 10.000 Punkte ein Extraschiff.'
    ),
    best: asteroidsBest,
  },
  {
    id: 'frogger',
    title: tr('FROG HOP', 'FROSCHHÜPFER'),
    statKey: 'FROSCHHÜPFER',
    icon: '🐸',
    text: tr(
      'Hop across the busy road and ride the logs over the river into all five homes, like Frogger in 1981. Tap to hop, swipe to the side. Every round runs faster.',
      'Über die volle Straße hüpfen und auf den Baumstämmen über den Fluss in alle fünf Nester, wie Frogger 1981. Tippen hüpft, wischen geht zur Seite. Jede Runde wird schneller.'
    ),
    best: froggerBest,
  },
  {
    id: 'copter',
    title: tr('CAVE COPTER', 'HÖHLENFLUG'),
    statKey: 'HÖHLENFLUG',
    icon: '🚁',
    text: tr(
      'Hold to climb, let go to sink, don’t touch the walls: the one-button cave flight of the early browser games. The cave keeps getting narrower.',
      'Halten zum Steigen, loslassen zum Sinken, bloß nicht die Wand berühren: der Ein-Knopf-Höhlenflug aus den frühen Browserspiel-Zeiten. Die Höhle wird immer enger.'
    ),
    best: copterBest,
  },
  {
    id: 'merge',
    title: '2048',
    statKey: '2048',
    icon: '🔢',
    text: tr(
      'Swipe the tiles, equal numbers merge into their sum. Every merge scores. Make it to 2048, then keep going as long as the board lets you.',
      'Kacheln schieben, gleiche Zahlen verschmelzen zu ihrer Summe. Jede Verschmelzung bringt Punkte. Bis 2048 schaffen und dann weiter, solange das Brett es zulässt.'
    ),
    best: mergeBest,
  },
  {
    id: 'missile',
    title: tr('MISSILE DEFENSE', 'RAKETENABWEHR'),
    statKey: 'RAKETENABWEHR',
    icon: '🚀',
    text: tr(
      'Rockets rain down on six cities: tap the sky to set off a counter blast, like Missile Command in 1980. Every wave comes faster; cities left standing pay a bonus.',
      'Raketen regnen auf sechs Städte: in den Himmel tippen zündet eine Abwehrexplosion, wie Missile Command 1980. Jede Welle kommt schneller; stehende Städte bringen Bonus.'
    ),
    best: missileBest,
  },
];

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
      <p className="mini-score">{tr('Moves', 'Züge')}: {moves} · {tr('Pairs', 'Pärchen')}: {found.length}/{MEMORY_ICONS.length}</p>
      <div className="memory-grid">
        {cards.map((icon, i) => {
          const shown = open.includes(i) || found.includes(icon);
          return (
            <button
              key={i}
              className={`memory-card${shown ? ' shown' : ''}${found.includes(icon) ? ' found' : ''}`}
              onClick={() => flip(i)}
              data-nav
              aria-label={shown ? icon : tr('face-down card', 'verdeckte Karte')}
            >
              <span aria-hidden="true">{shown ? icon : '?'}</span>
            </button>
          );
        })}
      </div>
      {result && <Done text={tr(`Found all pairs in ${moves} moves.`, `Alle Pärchen in ${moves} Zügen gefunden.`)} record={result.record} onAgain={again} board={{ game: 'memory', score: moves }} />}
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
      <p className="mini-score">{tr('Moves', 'Züge')}: {moves} · {tr('Goal: 1 to 8 in order', 'Ziel: 1 bis 8 der Reihe nach')}</p>
      <div className="puzzle-grid">
        {tiles.map((t, i) =>
          t ? (
            <button
              key={t}
              className={`puzzle-tile${t === i + 1 ? ' right' : ''}`}
              style={{ gridRow: Math.floor(i / SIZE) + 1, gridColumn: (i % SIZE) + 1 }}
              onClick={() => slide(i)}
              data-nav
              aria-label={tr(`Tile ${t}`, `Plättchen ${t}`)}
            >
              {t}
            </button>
          ) : (
            <span key="blank" className="puzzle-blank" style={{ gridRow: Math.floor(i / SIZE) + 1, gridColumn: (i % SIZE) + 1 }} />
          )
        )}
      </div>
      {result && <Done text={tr(`Sorted in ${moves} moves.`, `In ${moves} Zügen sortiert.`)} record={result.record} onAgain={again} board={{ game: 'puzzle', score: moves }} />}
    </>
  );
};

/* ------------------------------------------------------------------ Senso */

const PADS = [
  { name: tr('Green', 'Grün'), note: 'E4' },
  { name: tr('Red', 'Rot'), note: 'A4' },
  { name: tr('Yellow', 'Gelb'), note: 'C#5' },
  { name: tr('Blue', 'Blau'), note: 'E5' },
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
          ? tr('Listen closely and tap the colors back in the same order.', 'Hör gut zu und tippe die Farben in derselben Reihenfolge nach.')
          : phase === 'show'
            ? tr(`Round ${seq.length}: listen …`, `Runde ${seq.length}: hör zu …`)
            : phase === 'input'
              ? tr(`Round ${seq.length}: your turn (${pos}/${seq.length})`, `Runde ${seq.length}: du bist dran (${pos}/${seq.length})`)
              : tr(`Round ${seq.length} was a near miss.`, `Runde ${seq.length} war knapp daneben.`)}
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
          text={
            result.round
              ? tr(`You made it through ${result.round} ${result.round === 1 ? 'round' : 'rounds'}.`, `Du hast ${result.round} ${result.round === 1 ? 'Runde' : 'Runden'} geschafft.`)
              : tr('Go again, you’ve got this!', 'Gleich nochmal, das wird!')
          }
          record={result.record}
          onAgain={start}
          board={{ game: 'senso', score: result.round ?? 0 }}
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
      <p className="dim archive-count">{tr('Take a quick break: mini games to unwind, no ads and no sign-up.', 'Kurz mal abschalten: Minispiele zum Entspannen, ohne Werbung und ohne Anmeldung.')}</p>
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
export const MiniGameDialog: React.FC<{ id: MiniGameId; onClose: () => void; onWin: () => void; onEarn?: (coins: number) => void }> = ({ id, onClose, onWin, onEarn }) => {
  const game = MINI_GAMES.find((g) => g.id === id)!;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className={`dialog mini-dialog${id === 'solitaire' ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={game.title} onClick={(e) => e.stopPropagation()}>
        <h2 className="pixel-font">
          {game.icon} {game.title}
        </h2>
        <button className="px-btn close-x" onClick={onClose} aria-label={tr('Close', 'Schließen')} data-nav>
          ✕
        </button>
        {id === 'memory' ? (
          <Memory onWin={onWin} />
        ) : id === 'puzzle' ? (
          <Puzzle onWin={onWin} />
        ) : id === 'senso' ? (
          <Senso onWin={onWin} />
        ) : id === 'sudoku' ? (
          <Sudoku onWin={onWin} />
        ) : id === 'blocks' ? (
          <Blocks onWin={onWin} />
        ) : id === 'pinball' ? (
          <Pinball onWin={onWin} />
        ) : id === 'breakout' ? (
          <Breakout onWin={onWin} />
        ) : id === 'snake' ? (
          <Snake onWin={onWin} />
        ) : id === 'invaders' ? (
          <Invaders onWin={onWin} />
        ) : id === 'poker' ? (
          <VideoPoker onWin={onWin} />
        ) : id === 'blackjack' ? (
          <Blackjack onWin={onWin} />
        ) : id === 'solitaire' ? (
          <Solitaire onWin={onWin} />
        ) : id === 'asteroids' ? (
          <Asteroids onWin={onWin} />
        ) : id === 'frogger' ? (
          <Frogger onWin={onWin} />
        ) : id === 'copter' ? (
          <Copter onWin={onWin} />
        ) : id === 'merge' ? (
          <Merge2048 onWin={onWin} />
        ) : id === 'missile' ? (
          <Missile onWin={onWin} />
        ) : id === 'quiz' ? (
          <Quiz onWin={onWin} onEarn={onEarn} />
        ) : (
          <PacMan onWin={onWin} />
        )}
      </div>
    </div>
  );
};
