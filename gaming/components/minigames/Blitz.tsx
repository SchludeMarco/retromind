import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { seeded, today } from '../../lib/quests';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys } from './shared';

// The Blitz games (Marco, 2026-10-21: "games made for this purpose"): made
// for the Blitz-Challenge, each one 30 seconds on the clock, no setup, and on
// a given day everyone gets exactly the same round (seeded by the date), so
// the day's table is fair. Knopf-Blitz (tap the lit button), Konsolen-Sprint
// (which console was the game on?), Jahres-Sprint (which came out first?),
// and since Marco asked for three more: Pixel-Blitz (remember a pattern),
// Farb-Blitz (the ink, not the word) and Combo-Blitz (type the fighting game combo).

export const BLITZ_SECONDS = 30;

type BlitzId = 'blitzbuttons' | 'blitzconsole' | 'blitzyear' | 'blitzpixel' | 'blitzcolor' | 'blitzcombo';

/** The day's random numbers for a Blitz game: the same sequence for everyone today. */
const dayRandom = (id: BlitzId) => seeded(`blitz:${id}:${today()}`);

/** The 30-second clock with a 3-2-1 countdown in front. */
function useBlitzClock(onEnd: () => void) {
  const [phase, setPhase] = useState<'ready' | 'count' | 'run' | 'over'>('ready');
  const [count, setCount] = useState(3);
  const [left, setLeft] = useState(BLITZ_SECONDS);
  const end = useRef(onEnd);
  end.current = onEnd;

  useEffect(() => {
    if (phase === 'count') {
      if (count === 0) {
        chip.play('powerup');
        setPhase('run');
        return;
      }
      chip.softNote('C5', 0.12);
      const id = window.setTimeout(() => setCount((c) => c - 1), 650);
      return () => clearTimeout(id);
    }
    if (phase === 'run') {
      const until = Date.now() + BLITZ_SECONDS * 1000;
      const id = window.setInterval(() => {
        const ms = until - Date.now();
        setLeft(Math.max(0, Math.ceil(ms / 1000)));
        if (ms <= 0) {
          clearInterval(id);
          chip.play('error');
          setPhase('over');
          end.current();
        }
      }, 100);
      return () => clearInterval(id);
    }
  }, [phase, count]);

  return {
    phase,
    count,
    left,
    start: () => {
      chip.play('select');
      setCount(3);
      setLeft(BLITZ_SECONDS);
      setPhase('count');
    },
  };
}

/** Clock bar, the start button and the countdown around a Blitz game. */
const Frame: React.FC<{
  clock: ReturnType<typeof useBlitzClock>;
  score: number;
  intro: string;
  children: React.ReactNode;
}> = ({ clock, score, intro, children }) => (
  <>
    <p className="mini-score">
      {tr('Score', 'Punkte')}: {score} · {tr('Time', 'Zeit')}: {clock.left} s
    </p>
    <div className="blitz-bar" aria-hidden="true">
      <span style={{ width: `${(100 * clock.left) / BLITZ_SECONDS}%` }} />
    </div>
    {clock.phase === 'ready' && (
      <div className="blitz-ready">
        <p>{intro}</p>
        <p className="dim">{tr('Everyone gets the same round today.', 'Heute bekommen alle dieselbe Runde.')}</p>
        <button className="px-btn big" onClick={clock.start} data-nav autoFocus>
          ⚡ START
        </button>
      </div>
    )}
    {clock.phase === 'count' && <p className="blitz-count pixel-font">{clock.count}</p>}
    {clock.phase === 'run' && children}
  </>
);

const result = (id: BlitzId, score: number) => ({ score, record: score > 0 && saveBest(id, score, true) });

/* ------------------------------------------------------------ Knopf-Blitz */

const BUTTONS = 9;
const BUTTON_NOTES = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6'];

export const BlitzButtons: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const rnd = useRef(dayRandom('blitzbuttons'));
  const nextLit = (prev: number) => {
    const n = Math.floor(rnd.current() * (BUTTONS - 1));
    return n >= prev ? n + 1 : n;
  };
  const [lit, setLit] = useState(-1);
  const [miss, setMiss] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [done, setDone] = useState<{ score: number; record: boolean } | null>(null);
  const clock = useBlitzClock(() => {
    setDone(result('blitzbuttons', scoreRef.current));
    if (scoreRef.current >= 40) onWin();
  });

  useEffect(() => {
    if (clock.phase === 'run' && lit < 0) setLit(nextLit(-1));
  }, [clock.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const press = (i: number) => {
    if (clock.phase !== 'run') return;
    if (i === lit) {
      chip.softNote(BUTTON_NOTES[i], 0.06);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setLit(nextLit(i));
    } else {
      // A wrong button costs a point, so mashing doesn't pay.
      chip.play('blip');
      scoreRef.current = Math.max(0, scoreRef.current - 1);
      setScore(scoreRef.current);
      setMiss(i);
      window.setTimeout(() => setMiss((m) => (m === i ? null : m)), 250);
    }
  };

  const again = () => {
    rnd.current = dayRandom('blitzbuttons');
    scoreRef.current = 0;
    setScore(0);
    setLit(-1);
    setDone(null);
    clock.start();
  };

  return (
    <>
      <Frame
        clock={clock}
        score={score}
        intro={tr('Tap the button that lights up, as fast as you can. A wrong button costs a point.', 'Tipp so schnell du kannst auf den Knopf, der aufleuchtet. Ein falscher Knopf kostet einen Punkt.')}
      >
        <div className="blitz-buttons">
          {Array.from({ length: BUTTONS }, (_, i) => (
            <button
              key={i}
              className={`blitz-button b${i % 3}${lit === i ? ' lit' : ''}${miss === i ? ' miss' : ''}`}
              onPointerDown={(e) => {
                e.preventDefault();
                press(i);
              }}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && press(i)}
              aria-label={lit === i ? tr('Lit button', 'Leuchtender Knopf') : tr('Button', 'Knopf')}
              data-nav
            />
          ))}
        </div>
      </Frame>
      {done && (
        <Done
          title={tr('TIME’S UP', 'ZEIT UM')}
          text={tr(`${done.score} ${done.score === 1 ? 'button' : 'buttons'} in 30 seconds.`, `${done.score} ${done.score === 1 ? 'Knopf' : 'Knöpfe'} in 30 Sekunden.`)}
          record={done.record}
          onAgain={again}
          board={{ game: 'blitzbuttons', score: done.score }}
        />
      )}
    </>
  );
};

/* ------------------------------------------------ Konsolen- / Jahres-Sprint */

/** Well-known games, each on one console first, with the year it first came out. */
const CLASSICS: { title: string; system: string; year: number }[] = [
  { title: 'Pong', system: 'Arcade', year: 1972 },
  { title: 'Space Invaders', system: 'Arcade', year: 1978 },
  { title: 'Asteroids', system: 'Arcade', year: 1979 },
  { title: 'Pac-Man', system: 'Arcade', year: 1980 },
  { title: 'Donkey Kong', system: 'Arcade', year: 1981 },
  { title: 'Galaga', system: 'Arcade', year: 1981 },
  { title: 'Street Fighter II', system: 'Arcade', year: 1991 },
  { title: 'Combat', system: 'Atari 2600', year: 1977 },
  { title: 'Pitfall!', system: 'Atari 2600', year: 1982 },
  { title: 'E.T. the Extra-Terrestrial', system: 'Atari 2600', year: 1982 },
  { title: 'Impossible Mission', system: 'C64', year: 1984 },
  { title: 'Maniac Mansion', system: 'C64', year: 1987 },
  { title: 'Shadow of the Beast', system: 'Amiga', year: 1989 },
  { title: 'Lemmings', system: 'Amiga', year: 1991 },
  { title: 'Wolfenstein 3D', system: 'MS-DOS', year: 1992 },
  { title: 'Doom', system: 'MS-DOS', year: 1993 },
  { title: 'Day of the Tentacle', system: 'MS-DOS', year: 1993 },
  { title: 'Duck Hunt', system: 'NES', year: 1984 },
  { title: 'Super Mario Bros.', system: 'NES', year: 1985 },
  { title: 'The Legend of Zelda', system: 'NES', year: 1986 },
  { title: 'Metroid', system: 'NES', year: 1986 },
  { title: 'Mega Man', system: 'NES', year: 1987 },
  { title: 'Super Mario Bros. 3', system: 'NES', year: 1988 },
  { title: 'Alex Kidd in Miracle World', system: 'Master System', year: 1986 },
  { title: 'Super Mario Land', system: 'Game Boy', year: 1989 },
  { title: 'Kirby’s Dream Land', system: 'Game Boy', year: 1992 },
  { title: 'Link’s Awakening', system: 'Game Boy', year: 1993 },
  { title: 'Pokémon Red & Green', system: 'Game Boy', year: 1996 },
  { title: 'Sonic the Hedgehog', system: 'Mega Drive', year: 1991 },
  { title: 'Streets of Rage', system: 'Mega Drive', year: 1991 },
  { title: 'Sonic the Hedgehog 2', system: 'Mega Drive', year: 1992 },
  { title: 'Super Mario World', system: 'SNES', year: 1990 },
  { title: 'A Link to the Past', system: 'SNES', year: 1991 },
  { title: 'Super Mario Kart', system: 'SNES', year: 1992 },
  { title: 'Super Metroid', system: 'SNES', year: 1994 },
  { title: 'Donkey Kong Country', system: 'SNES', year: 1994 },
  { title: 'Chrono Trigger', system: 'SNES', year: 1995 },
  { title: 'Crash Bandicoot', system: 'PlayStation', year: 1996 },
  { title: 'Final Fantasy VII', system: 'PlayStation', year: 1997 },
  { title: 'Gran Turismo', system: 'PlayStation', year: 1997 },
  { title: 'Metal Gear Solid', system: 'PlayStation', year: 1998 },
  { title: 'Spyro the Dragon', system: 'PlayStation', year: 1998 },
  { title: 'Super Mario 64', system: 'Nintendo 64', year: 1996 },
  { title: 'GoldenEye 007', system: 'Nintendo 64', year: 1997 },
  { title: 'Ocarina of Time', system: 'Nintendo 64', year: 1998 },
  { title: 'Banjo-Kazooie', system: 'Nintendo 64', year: 1998 },
  { title: 'Sonic Adventure', system: 'Dreamcast', year: 1998 },
  { title: 'Shenmue', system: 'Dreamcast', year: 1999 },
  { title: 'Jet Set Radio', system: 'Dreamcast', year: 2000 },
  { title: 'Pokémon Gold & Silver', system: 'Game Boy Color', year: 1999 },
  { title: 'Advance Wars', system: 'Game Boy Advance', year: 2001 },
  { title: 'Ico', system: 'PlayStation 2', year: 2001 },
  { title: 'Kingdom Hearts', system: 'PlayStation 2', year: 2002 },
  { title: 'GTA: San Andreas', system: 'PlayStation 2', year: 2004 },
  { title: 'Shadow of the Colossus', system: 'PlayStation 2', year: 2005 },
  { title: 'Halo: Combat Evolved', system: 'Xbox', year: 2001 },
  { title: 'Pikmin', system: 'GameCube', year: 2001 },
  { title: 'Super Smash Bros. Melee', system: 'GameCube', year: 2001 },
  { title: 'Metroid Prime', system: 'GameCube', year: 2002 },
  { title: 'The Wind Waker', system: 'GameCube', year: 2002 },
  { title: 'Nintendogs', system: 'Nintendo DS', year: 2005 },
  { title: 'Mario Kart DS', system: 'Nintendo DS', year: 2005 },
  { title: 'Gears of War', system: 'Xbox 360', year: 2006 },
  { title: 'Halo 3', system: 'Xbox 360', year: 2007 },
  { title: 'Wii Sports', system: 'Wii', year: 2006 },
  { title: 'Super Mario Galaxy', system: 'Wii', year: 2007 },
  { title: 'Uncharted: Drake’s Fortune', system: 'PlayStation 3', year: 2007 },
  { title: 'The Last of Us', system: 'PlayStation 3', year: 2013 },
  { title: 'Splatoon', system: 'Wii U', year: 2015 },
  { title: 'Bloodborne', system: 'PlayStation 4', year: 2015 },
  { title: 'Super Mario Odyssey', system: 'Nintendo Switch', year: 2017 },
  { title: 'Animal Crossing: New Horizons', system: 'Nintendo Switch', year: 2020 },
];
const SYSTEMS = [...new Set(CLASSICS.map((c) => c.system))];

interface Question {
  prompt: string;
  sub?: string;
  options: string[];
  answer: number;
  /** Shown after answering. */
  reveal: string;
}

function pick<T>(rnd: () => number, list: T[]): T {
  return list[Math.floor(rnd() * list.length)];
}

function consoleQuestion(rnd: () => number): Question {
  const game = pick(rnd, CLASSICS);
  const options = [game.system];
  while (options.length < 4) {
    const s = pick(rnd, SYSTEMS);
    if (!options.includes(s)) options.push(s);
  }
  // Shuffle with the day's numbers too, so the right answer sits in the same spot for everyone.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { prompt: game.title, options, answer: options.indexOf(game.system), reveal: `${game.system} · ${game.year}` };
}

function yearQuestion(rnd: () => number): Question {
  const a = pick(rnd, CLASSICS);
  let b = pick(rnd, CLASSICS);
  while (b.year === a.year) b = pick(rnd, CLASSICS);
  return {
    prompt: tr('Which came out first?', 'Was kam zuerst raus?'),
    options: [a.title, b.title],
    answer: a.year < b.year ? 0 : 1,
    reveal: `${a.title}: ${a.year} · ${b.title}: ${b.year}`,
  };
}

/** A 30-second quiz sprint: as many right answers as possible; a wrong one costs a point and a moment, so guessing doesn't pay. */
const Sprint: React.FC<{ id: 'blitzconsole' | 'blitzyear'; onWin: () => void; winAt: number; intro: string }> = ({ id, onWin, winAt, intro }) => {
  const make = id === 'blitzconsole' ? consoleQuestion : yearQuestion;
  const rnd = useRef(dayRandom(id));
  const [q, setQ] = useState<Question>(() => make(rnd.current));
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [done, setDone] = useState<{ score: number; record: boolean } | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  const clock = useBlitzClock(() => {
    setDone(result(id, scoreRef.current));
    if (scoreRef.current >= winAt) onWin();
  });

  const next = useCallback(() => {
    // The answer button keeps its focus glow otherwise and looks picked on the next question.
    (document.activeElement as HTMLElement | null)?.blur();
    setPicked(null);
    setQ(make(rnd.current));
  }, [make]);

  const answer = (i: number) => {
    if (clock.phase !== 'run' || picked !== null) return;
    setPicked(i);
    const right = i === q.answer;
    if (right) {
      chip.play('coin');
      scoreRef.current += 1;
      setScore(scoreRef.current);
    } else {
      chip.play('error');
      scoreRef.current = Math.max(0, scoreRef.current - 1);
      setScore(scoreRef.current);
    }
    timer.current = window.setTimeout(next, right ? 350 : 1200);
  };

  const again = () => {
    rnd.current = dayRandom(id);
    scoreRef.current = 0;
    setScore(0);
    setQ(make(rnd.current));
    setPicked(null);
    setDone(null);
    clock.start();
  };

  return (
    <>
      <Frame clock={clock} score={score} intro={intro}>
        <div className="quiz-clue panel blitz-clue">
          <p className="pixel-font quiz-meta">{picked !== null ? q.reveal : id === 'blitzconsole' ? tr('WHICH CONSOLE?', 'WELCHE KONSOLE?') : tr('WHICH CAME FIRST?', 'WAS KAM ZUERST?')}</p>
          <p className="blitz-prompt">{q.prompt}</p>
        </div>
        <div className={`quiz-options${q.options.length === 2 ? ' two' : ''}`}>
          {q.options.map((o, i) => (
            <button
              key={`${o}-${i}`}
              className={`px-btn${picked !== null && i === q.answer ? ' right' : ''}${picked === i && i !== q.answer ? ' wrong' : ''}`}
              onClick={() => answer(i)}
              data-nav
            >
              {o}
            </button>
          ))}
        </div>
      </Frame>
      {done && (
        <Done
          title={tr('TIME’S UP', 'ZEIT UM')}
          text={tr(`${done.score} ${done.score === 1 ? 'point' : 'points'} in 30 seconds.`, `${done.score} ${done.score === 1 ? 'Punkt' : 'Punkte'} in 30 Sekunden.`)}
          record={done.record}
          onAgain={again}
          board={{ game: id, score: done.score }}
        />
      )}
    </>
  );
};

export const BlitzConsole: React.FC<{ onWin: () => void }> = ({ onWin }) => (
  <Sprint
    id="blitzconsole"
    onWin={onWin}
    winAt={10}
    intro={tr('A famous game: which console did it come out on? As many as you can in 30 seconds; a wrong answer costs a point.', 'Ein bekanntes Spiel: Auf welcher Konsole kam es raus? So viele wie möglich in 30 Sekunden; eine falsche Antwort kostet einen Punkt.')}
  />
);

export const BlitzYear: React.FC<{ onWin: () => void }> = ({ onWin }) => (
  <Sprint
    id="blitzyear"
    onWin={onWin}
    winAt={10}
    intro={tr('Two games: which came out first? As many as you can in 30 seconds; a wrong answer costs a point.', 'Zwei Spiele: Welches kam zuerst raus? So viele wie möglich in 30 Sekunden; eine falsche Antwort kostet einen Punkt.')}
  />
);

/* ------------------------------------------------------------ Pixel-Blitz */

const GRID = 4;

/** A pattern of lit cells: 3 in the first round, one more every two rounds, at most 8. */
function pattern(rnd: () => number, round: number): number[] {
  const n = Math.min(8, 3 + Math.floor(round / 2));
  const cells: number[] = [];
  while (cells.length < n) {
    const c = Math.floor(rnd() * GRID * GRID);
    if (!cells.includes(c)) cells.push(c);
  }
  return cells;
}

export const BlitzPixel: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const rnd = useRef(dayRandom('blitzpixel'));
  const round = useRef(0);
  const [cells, setCells] = useState<number[]>([]);
  const [show, setShow] = useState(true);
  const [hit, setHit] = useState<number[]>([]);
  const [miss, setMiss] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const timer = useRef<number | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  const [done, setDone] = useState<{ score: number; record: boolean } | null>(null);
  const clock = useBlitzClock(() => {
    setDone(result('blitzpixel', scoreRef.current));
    if (scoreRef.current >= 8) onWin();
  });

  /** Shows the next pattern for a moment, then hides it. */
  const next = useCallback(() => {
    setCells(pattern(rnd.current, round.current++));
    setHit([]);
    setShow(true);
    timer.current = window.setTimeout(() => setShow(false), 900);
  }, []);

  useEffect(() => {
    if (clock.phase === 'run' && !cells.length) next();
  }, [clock.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (i: number) => {
    if (clock.phase !== 'run' || show || hit.includes(i)) return;
    if (cells.includes(i)) {
      const now = [...hit, i];
      setHit(now);
      chip.softNote(BUTTON_NOTES[now.length % BUTTON_NOTES.length], 0.06);
      if (now.length === cells.length) {
        chip.play('coin');
        scoreRef.current += 1;
        setScore(scoreRef.current);
        timer.current = window.setTimeout(next, 250);
      }
    } else {
      // A wrong cell costs a point and brings a new pattern.
      chip.play('error');
      scoreRef.current = Math.max(0, scoreRef.current - 1);
      setScore(scoreRef.current);
      setMiss(i);
      setShow(true);
      timer.current = window.setTimeout(() => {
        setMiss(null);
        next();
      }, 600);
    }
  };

  const again = () => {
    rnd.current = dayRandom('blitzpixel');
    round.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setCells([]);
    setDone(null);
    clock.start();
  };

  return (
    <>
      <Frame
        clock={clock}
        score={score}
        intro={tr('A pattern lights up for a moment: tap the same squares from memory. Every pattern you get right scores; patterns grow as you go.', 'Ein Muster leuchtet kurz auf: Tipp dieselben Felder aus dem Gedächtnis nach. Jedes richtige Muster bringt einen Punkt; die Muster werden größer.')}
      >
        <div className="blitz-pixels" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}>
          {Array.from({ length: GRID * GRID }, (_, i) => (
            <button
              key={i}
              className={`blitz-pixel${(show && cells.includes(i)) || hit.includes(i) ? ' lit' : ''}${miss === i ? ' miss' : ''}`}
              onPointerDown={(e) => {
                e.preventDefault();
                tap(i);
              }}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && tap(i)}
              aria-label={tr(`Square ${i + 1}`, `Feld ${i + 1}`)}
              data-nav
            />
          ))}
        </div>
        <p className="dim blitz-hint">{show ? tr('Remember …', 'Merken …') : tr('Your turn!', 'Jetzt du!')}</p>
      </Frame>
      {done && (
        <Done
          title={tr('TIME’S UP', 'ZEIT UM')}
          text={tr(`${done.score} ${done.score === 1 ? 'pattern' : 'patterns'} in 30 seconds.`, `${done.score} ${done.score === 1 ? 'Muster' : 'Muster'} in 30 Sekunden.`)}
          record={done.record}
          onAgain={again}
          board={{ game: 'blitzpixel', score: done.score }}
        />
      )}
    </>
  );
};

/* -------------------------------------------------------------- Farb-Blitz */

const COLORS = [
  { id: 'red', css: '#ef4444', name: tr('RED', 'ROT') },
  { id: 'blue', css: '#3b82f6', name: tr('BLUE', 'BLAU') },
  { id: 'green', css: '#22c55e', name: tr('GREEN', 'GRÜN') },
  { id: 'yellow', css: '#facc15', name: tr('YELLOW', 'GELB') },
];

export const BlitzColor: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const rnd = useRef(dayRandom('blitzcolor'));
  // The word names one color, the ink is another: tap the ink.
  const make = () => {
    const word = Math.floor(rnd.current() * COLORS.length);
    const ink = (word + 1 + Math.floor(rnd.current() * (COLORS.length - 1))) % COLORS.length;
    return { word, ink };
  };
  const [card, setCard] = useState(make);
  const [flash, setFlash] = useState<'right' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const lock = useRef(false);
  const [done, setDone] = useState<{ score: number; record: boolean } | null>(null);
  const clock = useBlitzClock(() => {
    setDone(result('blitzcolor', scoreRef.current));
    if (scoreRef.current >= 20) onWin();
  });

  const answer = (i: number) => {
    if (clock.phase !== 'run' || lock.current) return;
    const right = i === card.ink;
    chip.play(right ? 'blip' : 'error');
    scoreRef.current = Math.max(0, scoreRef.current + (right ? 1 : -1));
    setScore(scoreRef.current);
    setFlash(right ? 'right' : 'wrong');
    lock.current = true;
    window.setTimeout(
      () => {
        lock.current = false;
        setFlash(null);
        setCard(make());
      },
      right ? 120 : 700
    );
  };

  const again = () => {
    rnd.current = dayRandom('blitzcolor');
    scoreRef.current = 0;
    setScore(0);
    setCard(make());
    setDone(null);
    clock.start();
  };

  return (
    <>
      <Frame
        clock={clock}
        score={score}
        intro={tr('A color word in the wrong ink: tap the color of the INK, not the word. A wrong tap costs a point.', 'Ein Farbwort in falscher Farbe: Tipp die FARBE der Schrift, nicht das Wort. Ein falscher Tipp kostet einen Punkt.')}
      >
        <p className={`blitz-word pixel-font${flash ? ` ${flash}` : ''}`} style={{ color: COLORS[card.ink].css }}>
          {COLORS[card.word].name}
        </p>
        <div className="blitz-colors">
          {COLORS.map((c, i) => (
            <button
              key={c.id}
              className="px-btn blitz-color"
              style={{ background: c.css }}
              onPointerDown={(e) => {
                e.preventDefault();
                answer(i);
              }}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && answer(i)}
              aria-label={c.name}
              data-nav
            />
          ))}
        </div>
      </Frame>
      {done && (
        <Done
          title={tr('TIME’S UP', 'ZEIT UM')}
          text={tr(`${done.score} ${done.score === 1 ? 'point' : 'points'} in 30 seconds.`, `${done.score} ${done.score === 1 ? 'Punkt' : 'Punkte'} in 30 Sekunden.`)}
          record={done.record}
          onAgain={again}
          board={{ game: 'blitzcolor', score: done.score }}
        />
      )}
    </>
  );
};

/* ------------------------------------------------------------- Combo-Blitz */

const KEYS = ['↑', '↓', '←', '→', 'A', 'B'] as const;
const KEY_CODES: Record<string, number> = { ArrowUp: 0, ArrowDown: 1, ArrowLeft: 2, ArrowRight: 3, a: 4, b: 5, A: 4, B: 5 };

/** A special move like in the fighting games: 4 to 7 inputs, longer as you go. */
function combo(rnd: () => number, n: number): number[] {
  const len = Math.min(7, 4 + Math.floor(n / 2));
  return Array.from({ length: len }, () => Math.floor(rnd() * KEYS.length));
}

export const BlitzCombo: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const rnd = useRef(dayRandom('blitzcombo'));
  const count = useRef(0);
  const [moves, setMoves] = useState<number[]>(() => combo(rnd.current, count.current++));
  const [pos, setPos] = useState(0);
  const [miss, setMiss] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [done, setDone] = useState<{ score: number; record: boolean } | null>(null);
  const clock = useBlitzClock(() => {
    setDone(result('blitzcombo', scoreRef.current));
    if (scoreRef.current >= 60) onWin();
  });

  const press = (k: number) => {
    if (clock.phase !== 'run') return;
    if (k === moves[pos]) {
      chip.softNote(BUTTON_NOTES[k], 0.05);
      scoreRef.current += 1;
      if (pos + 1 === moves.length) {
        // A finished combo pays its length again as a bonus.
        scoreRef.current += moves.length;
        chip.play('coin');
        setMoves(combo(rnd.current, count.current++));
        setPos(0);
      } else setPos(pos + 1);
    } else {
      // A wrong input breaks the combo: a point off and back to its start.
      chip.play('error');
      scoreRef.current = Math.max(0, scoreRef.current - 1);
      setPos(0);
      setMiss(true);
      window.setTimeout(() => setMiss(false), 250);
    }
    setScore(scoreRef.current);
  };

  useGameKeys((e, down) => {
    const k = KEY_CODES[e.key];
    if (k === undefined || clock.phase !== 'run') return false;
    if (down) press(k);
    return true;
  });

  const again = () => {
    rnd.current = dayRandom('blitzcombo');
    count.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setMoves(combo(rnd.current, count.current++));
    setPos(0);
    setDone(null);
    clock.start();
  };

  return (
    <>
      <Frame
        clock={clock}
        score={score}
        intro={tr('Type the combo like a special move in a fighting game. Every input scores, a finished combo pays a bonus; a wrong input breaks it.', 'Gib die Kombo ein wie einen Spezialangriff im Prügelspiel. Jede Eingabe bringt einen Punkt, eine fertige Kombo einen Bonus; eine falsche Eingabe bricht sie ab.')}
      >
        <p className={`blitz-combo pixel-font${miss ? ' miss' : ''}`} aria-live="polite">
          {moves.map((m, i) => (
            <span key={i} className={i < pos ? 'done' : i === pos ? 'now' : undefined}>
              {KEYS[m]}
            </span>
          ))}
        </p>
        <div className="blitz-pad">
          {KEYS.map((k, i) => (
            <button
              key={k}
              className="px-btn"
              onPointerDown={(e) => {
                e.preventDefault();
                press(i);
              }}
              aria-label={k}
              data-nav
            >
              {k}
            </button>
          ))}
        </div>
      </Frame>
      {done && (
        <Done
          title={tr('TIME’S UP', 'ZEIT UM')}
          text={tr(`${done.score} ${done.score === 1 ? 'point' : 'points'} in 30 seconds.`, `${done.score} ${done.score === 1 ? 'Punkt' : 'Punkte'} in 30 Sekunden.`)}
          record={done.record}
          onAgain={again}
          board={{ game: 'blitzcombo', score: done.score }}
        />
      )}
    </>
  );
};

export const blitzBest = (n: number) => tr(`High score: ${n}`, `Rekord: ${n}`);
