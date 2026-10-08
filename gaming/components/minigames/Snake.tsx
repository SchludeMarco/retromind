import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys, themeColors } from './shared';

// Snake like on the old phones: eat the apples, don't bite your own tail.
// Swipe on the playfield, use the arrow keys or the buttons. Walls wrap
// around, so it stays a calm game; it speeds up a little with every apple.

const N = 16;
const CELL = 18;
type Dir = [number, number];
type Cell = [number, number];

interface State {
  snake: Cell[];
  dir: Dir;
  next: Dir;
  apple: Cell;
  score: number;
  over: boolean;
}

const freeCell = (snake: Cell[]): Cell => {
  for (;;) {
    const c: Cell = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
    if (!snake.some(([x, y]) => x === c[0] && y === c[1])) return c;
  }
};

const fresh = (): State => {
  const snake: Cell[] = [
    [6, 8],
    [5, 8],
    [4, 8],
  ];
  return { snake, dir: [1, 0], next: [1, 0], apple: freeCell(snake), score: 0, over: false };
};

export const Snake: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef<State>(fresh());
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<{ score: number; record: boolean } | null>(null);

  const draw = useCallback(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const t = themeColors(cv);
    const s = st.current;
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, N * CELL, N * CELL);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(s.apple[0] * CELL + CELL / 2, s.apple[1] * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    s.snake.forEach(([x, y], i) => {
      ctx.fillStyle = i === 0 ? t.a3 : t.ok;
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const turn = useCallback((d: Dir) => {
    const s = st.current;
    // No turning straight back into yourself.
    if (d[0] === -s.dir[0] && d[1] === -s.dir[1]) return;
    s.next = d;
  }, []);

  const step = useCallback(() => {
    const s = st.current;
    if (s.over) return;
    s.dir = s.next;
    const head: Cell = [(s.snake[0][0] + s.dir[0] + N) % N, (s.snake[0][1] + s.dir[1] + N) % N];
    if (s.snake.slice(0, -1).some(([x, y]) => x === head[0] && y === head[1])) {
      s.over = true;
      chip.play('error');
      setResult({ score: s.score, record: s.score > 0 && saveBest('snake', s.score, true) });
      return;
    }
    s.snake.unshift(head);
    if (head[0] === s.apple[0] && head[1] === s.apple[1]) {
      s.score += 10;
      setScore(s.score);
      chip.play('coin');
      if (s.score === 100) onWin();
      s.apple = freeCell(s.snake);
    } else s.snake.pop();
    draw();
  }, [draw, onWin]);

  useEffect(() => {
    if (result) return;
    const speed = Math.max(80, 170 - score / 2);
    const id = window.setInterval(() => document.visibilityState !== 'hidden' && step(), speed);
    return () => clearInterval(id);
  }, [step, score, result]);

  useEffect(draw, [draw]);

  useGameKeys((e, down) => {
    const map: Record<string, Dir> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const d = map[e.key];
    if (!d) return false;
    if (down) turn(d);
    return true;
  });

  const start = useRef<{ x: number; y: number } | null>(null);
  const onUp = (e: React.PointerEvent) => {
    const s0 = start.current;
    start.current = null;
    if (!s0) return;
    const dx = e.clientX - s0.x;
    const dy = e.clientY - s0.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
  };

  const again = () => {
    chip.play('select');
    st.current = fresh();
    setScore(0);
    setResult(null);
    draw();
  };

  return (
    <>
      <p className="mini-score">
        {tr('Score', 'Punkte')}: {score}
      </p>
      <canvas
        ref={canvas}
        className="arcade-board square"
        width={N * CELL}
        height={N * CELL}
        onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={onUp}
        onPointerCancel={() => (start.current = null)}
        aria-label={tr('Playfield: swipe to steer', 'Spielfeld: wischen zum Lenken')}
      />
      {!result && (
        <div className="game-pad pad-4">
          <button className="px-btn" onClick={() => turn([-1, 0])} aria-label={tr('Left', 'Links')}>
            ◄
          </button>
          <button className="px-btn" onClick={() => turn([0, -1])} aria-label={tr('Up', 'Hoch')}>
            ▲
          </button>
          <button className="px-btn" onClick={() => turn([0, 1])} aria-label={tr('Down', 'Runter')}>
            ▼
          </button>
          <button className="px-btn" onClick={() => turn([1, 0])} aria-label={tr('Right', 'Rechts')}>
            ►
          </button>
        </div>
      )}
      {result && (
        <Done
          title={tr('GAME OVER', 'SPIEL VORBEI')}
          text={tr(`${result.score / 10} apples, ${result.score} points.`, `${result.score / 10} Äpfel, ${result.score} Punkte.`)}
          record={result.record}
          onAgain={again}
          board={{ game: 'snake', score: result.score }}
        />
      )}
    </>
  );
};

export const snakeBest = (n: number) => tr(`High score: ${n} points`, `Rekord: ${n} Punkte`);
