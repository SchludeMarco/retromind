import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys, themeColors } from './shared';

// A frog crossing like the 1981 arcade game: hop over the busy road, then
// ride the logs and turtles across the river into one of the five homes.
// Fill all five and the next round runs faster (and the turtles start to
// dive). Every new row forward pays, a quick frog pays a time bonus.
// Tap or swipe on the playfield, arrows, or the buttons.

const COLS = 11;
const ROWS = 13;
const CELL = 27;
const W = COLS * CELL;
const H = ROWS * CELL;
const HOMES = [1, 3, 5, 7, 9];
const TIME = 30 * 60; // frames per frog
const START = { x: 5, y: ROWS - 1 };

type Kind = 'car' | 'truck' | 'log' | 'turtle';
interface Lane {
  row: number;
  kind: Kind;
  /** Cells per frame; negative drives to the left. */
  speed: number;
  len: number;
  items: number[];
  color?: string;
}

/** Road rows 7–11 and river rows 1–5: [row, kind, speed, length, count, color]. */
const LANES: [number, Kind, number, number, number, string?][] = [
  [11, 'car', -0.022, 1, 3, '#facc15'],
  [10, 'car', 0.03, 1, 3, '#f472b6'],
  [9, 'car', -0.04, 1, 2, '#38bdf8'],
  [8, 'car', 0.026, 1, 3, '#a78bfa'],
  [7, 'truck', -0.02, 2, 2, '#f97316'],
  [5, 'turtle', -0.03, 3, 3],
  [4, 'log', 0.025, 3, 3],
  [3, 'log', 0.04, 5, 2],
  [2, 'turtle', -0.035, 2, 4],
  [1, 'log', 0.03, 4, 3],
];

const lanesFor = (level: number): Lane[] =>
  LANES.map(([row, kind, speed, len, count, color]) => {
    const period = COLS + len + 2;
    const offset = Math.random() * period;
    return {
      row,
      kind,
      speed: speed * (1 + (level - 1) * 0.18),
      len,
      color,
      items: Array.from({ length: count }, (_, i) => ((offset + (i * period) / count) % period) - len),
    };
  });

interface State {
  fx: number;
  fy: number;
  /** Furthest row reached by this frog (smaller is further). */
  best: number;
  lanes: Lane[];
  homes: boolean[];
  time: number;
  lives: number;
  score: number;
  level: number;
  frame: number;
  /** Frames left of the squash/splash before the next frog. */
  dying: number;
  over: boolean;
  won: boolean;
}

const fresh = (): State => ({
  fx: START.x,
  fy: START.y,
  best: START.y,
  lanes: lanesFor(1),
  homes: HOMES.map(() => false),
  time: TIME,
  lives: 3,
  score: 0,
  level: 1,
  frame: 0,
  dying: 0,
  over: false,
  won: false,
});

/** Turtles of the diving lanes are under water for a while, from round 2 on. */
const underwater = (s: State, lane: Lane, i: number) => lane.kind === 'turtle' && s.level > 1 && (s.frame + i * 97 + lane.row * 53) % 320 > 250;

export const Frogger: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef<State>(fresh());
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1 });
  const [result, setResult] = useState<{ score: number; record: boolean } | null>(null);

  const die = useCallback((s: State) => {
    if (s.dying) return;
    s.lives--;
    s.dying = 45;
    chip.play('error');
  }, []);

  const nextFrog = (s: State) => {
    s.fx = START.x;
    s.fy = START.y;
    s.best = START.y;
    s.time = TIME;
  };

  const hop = useCallback((dx: number, dy: number) => {
    const s = st.current;
    if (s.over || s.dying) return;
    const nx = Math.round(s.fx) + dx;
    const ny = s.fy + dy;
    if (nx < 0 || nx >= COLS || ny >= ROWS) return;
    // Hops on a log keep the frog's spot on it; sideways hops snap to the grid.
    s.fx = dx ? nx : s.fx;
    s.fy = ny;
    chip.softNote(dy < 0 ? 'E5' : 'C5', 0.04);
    if (ny < s.best) {
      s.best = ny;
      s.score += 10;
    }
    if (ny === 0) {
      const col = Math.round(s.fx);
      const h = HOMES.indexOf(col);
      if (h < 0 || s.homes[h]) return die(s);
      s.homes[h] = true;
      s.score += 50 + Math.floor(s.time / 60) * 10;
      chip.play('coin');
      if (s.homes.every(Boolean)) {
        s.score += 1000;
        s.level++;
        s.homes = HOMES.map(() => false);
        s.lanes = lanesFor(s.level);
        chip.play('powerup');
        if (!s.won) {
          s.won = true;
          onWin();
        }
      }
      nextFrog(s);
    }
  }, [die, onWin]);

  const tick = useCallback(() => {
    const s = st.current;
    if (s.over) return;
    s.frame++;
    for (const lane of s.lanes) {
      const period = COLS + lane.len + 2;
      lane.items = lane.items.map((x) => {
        let n = x + lane.speed;
        if (n > COLS + 1) n -= period;
        if (n < -lane.len - 1) n += period;
        return n;
      });
    }
    if (s.dying) {
      if (--s.dying === 0) {
        if (s.lives <= 0) {
          s.over = true;
          setResult({ score: s.score, record: s.score > 0 && saveBest('frogger', s.score, true) });
        } else nextFrog(s);
      }
    } else {
      if (--s.time <= 0) die(s);
      const lane = s.lanes.find((l) => l.row === s.fy);
      if (lane && (lane.kind === 'car' || lane.kind === 'truck')) {
        const c = s.fx + 0.5;
        if (lane.items.some((x) => c > x + 0.1 && c < x + lane.len - 0.1)) die(s);
      } else if (lane) {
        const c = s.fx + 0.5;
        const ride = lane.items.findIndex((x, i) => c > x && c < x + lane.len && !underwater(s, lane, i));
        if (ride < 0) die(s);
        else {
          s.fx += lane.speed;
          if (s.fx < -0.4 || s.fx > COLS - 0.6) die(s);
        }
      }
    }
    setHud((h) => (h.score === s.score && h.lives === s.lives && h.level === s.level ? h : { score: s.score, lives: s.lives, level: s.level }));
  }, [die]);

  const draw = useCallback(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const t = themeColors(cv);
    const s = st.current;
    // Ground: homes, river, bank, road, start.
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 0, W, CELL);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, CELL, W, CELL * 5);
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(0, CELL * 6, W, CELL);
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, CELL * 7, W, CELL * 5);
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(0, CELL * 12, W, CELL);
    ctx.strokeStyle = t.dim;
    ctx.setLineDash([6, 8]);
    for (let r = 8; r < 12; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL);
      ctx.lineTo(W, r * CELL);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    HOMES.forEach((c, i) => {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(c * CELL + 2, 3, CELL - 4, CELL - 3);
      if (s.homes[i]) {
        ctx.fillStyle = t.ok;
        ctx.fillRect(c * CELL + 7, 8, CELL - 14, CELL - 14);
      }
    });
    for (const lane of s.lanes) {
      const y = lane.row * CELL;
      lane.items.forEach((x, i) => {
        const px = x * CELL;
        const w = lane.len * CELL;
        if (lane.kind === 'log') {
          ctx.fillStyle = '#92400e';
          ctx.fillRect(px + 2, y + 5, w - 4, CELL - 10);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(px + 2, y + 8, w - 4, 3);
        } else if (lane.kind === 'turtle') {
          const down = underwater(s, lane, i);
          const soon = lane.kind === 'turtle' && s.level > 1 && !down && underwater({ ...s, frame: s.frame + 30 }, lane, i);
          if (down) return;
          for (let k = 0; k < lane.len; k++) {
            ctx.fillStyle = soon && Math.floor(s.frame / 6) % 2 ? '#166534' : '#22c55e';
            ctx.beginPath();
            ctx.arc(px + k * CELL + CELL / 2, y + CELL / 2, CELL / 2 - 4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = lane.color!;
          ctx.fillRect(px + 2, y + 5, w - 4, CELL - 10);
          ctx.fillStyle = t.bg;
          const front = lane.speed > 0 ? px + w - 9 : px + 4;
          ctx.fillRect(front, y + 8, 5, CELL - 16);
        }
      });
    }
    if (!s.over) {
      const x = s.fx * CELL;
      const y = s.fy * CELL;
      if (s.dying) {
        ctx.fillStyle = Math.floor(s.dying / 5) % 2 ? t.a1 : t.fg;
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✕', x + CELL / 2, y + CELL / 2 + 7);
      } else {
        ctx.fillStyle = t.ok;
        ctx.fillRect(x + 6, y + 6, CELL - 12, CELL - 12);
        ctx.fillRect(x + 3, y + 4, 4, 6);
        ctx.fillRect(x + CELL - 7, y + 4, 4, 6);
        ctx.fillRect(x + 3, y + CELL - 10, 4, 6);
        ctx.fillRect(x + CELL - 7, y + CELL - 10, 4, 6);
        ctx.fillStyle = t.bg;
        ctx.fillRect(x + 9, y + 9, 3, 3);
        ctx.fillRect(x + CELL - 12, y + 9, 3, 3);
      }
    }
    // Time bar.
    ctx.fillStyle = s.time < TIME / 4 ? t.a1 : t.a3;
    ctx.fillRect(0, H - 3, (W * Math.max(0, s.time)) / TIME, 3);
  }, []);

  useEffect(() => {
    if (result) return;
    let raf = 0;
    const loop = () => {
      if (document.visibilityState !== 'hidden') {
        tick();
        draw();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tick, draw, result]);

  useGameKeys((e, down) => {
    const map: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const d = map[e.key];
    if (!d) return false;
    if (down && !e.repeat) hop(...d);
    return true;
  });

  const start = useRef<{ x: number; y: number } | null>(null);
  const onUp = (e: React.PointerEvent) => {
    const s0 = start.current;
    start.current = null;
    if (!s0) return;
    const dx = e.clientX - s0.x;
    const dy = e.clientY - s0.y;
    // A tap hops forward, a swipe hops that way.
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return hop(0, -1);
    if (Math.abs(dx) > Math.abs(dy)) hop(Math.sign(dx), 0);
    else hop(0, Math.sign(dy));
  };

  const again = () => {
    chip.play('select');
    st.current = fresh();
    setHud({ score: 0, lives: 3, level: 1 });
    setResult(null);
  };

  return (
    <>
      <p className="mini-score">
        {tr('Score', 'Punkte')}: {hud.score} · {tr('Frogs', 'Frösche')}: {'●'.repeat(Math.max(0, hud.lives))} · {tr('Round', 'Runde')} {hud.level}
      </p>
      <canvas
        ref={canvas}
        className="arcade-board frog-board"
        width={W}
        height={H}
        onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={onUp}
        onPointerCancel={() => (start.current = null)}
        aria-label={tr('Playfield: tap to hop forward, swipe to hop sideways or back', 'Spielfeld: tippen hüpft vorwärts, wischen hüpft zur Seite oder zurück')}
      />
      {!result && (
        <div className="game-pad pad-4">
          <button className="px-btn" onClick={() => hop(-1, 0)} aria-label={tr('Left', 'Links')}>
            ◄
          </button>
          <button className="px-btn" onClick={() => hop(0, -1)} aria-label={tr('Forward', 'Vorwärts')}>
            ▲
          </button>
          <button className="px-btn" onClick={() => hop(0, 1)} aria-label={tr('Back', 'Zurück')}>
            ▼
          </button>
          <button className="px-btn" onClick={() => hop(1, 0)} aria-label={tr('Right', 'Rechts')}>
            ►
          </button>
        </div>
      )}
      {result && (
        <Done
          title={tr('GAME OVER', 'SPIEL VORBEI')}
          text={tr(`${result.score.toLocaleString('en-US')} points, round ${hud.level}.`, `${result.score.toLocaleString('de-DE')} Punkte, Runde ${hud.level}.`)}
          record={result.record}
          onAgain={again}
          board={{ game: 'frogger', score: result.score }}
        />
      )}
    </>
  );
};

export const froggerBest = (n: number) => tr(`High score: ${n.toLocaleString('en-US')} points`, `Rekord: ${n.toLocaleString('de-DE')} Punkte`);
