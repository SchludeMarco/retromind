import React, { useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys } from './shared';

// 2048, the sliding number puzzle of 2014 that kept everyone up at night:
// swipe (or arrows), equal tiles merge into their sum, a new 2 or 4 appears
// after every move. Every merge adds its value to the score. Reaching 2048
// counts as a win, but the game goes on until the board is jammed.

const N = 4;
type Board = number[];

const NOTES: Record<number, string> = { 4: 'C5', 8: 'D5', 16: 'E5', 32: 'F5', 64: 'G5', 128: 'A5', 256: 'B5', 512: 'C6', 1024: 'D6', 2048: 'E6' };

function spawn(b: Board): Board {
  const free = b.flatMap((v, i) => (v ? [] : [i]));
  if (!free.length) return b;
  const next = [...b];
  next[free[Math.floor(Math.random() * free.length)]] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

const fresh = (): Board => spawn(spawn(Array(N * N).fill(0)));

/** Indices of each line in the direction tiles slide towards (first = the wall they slide to). */
function lines(dx: number, dy: number): number[][] {
  const out: number[][] = [];
  for (let a = 0; a < N; a++) {
    const line: number[] = [];
    for (let b = 0; b < N; b++) {
      const k = dx || dy > 0 ? N - 1 - b : b;
      line.push(dx ? a * N + (dx > 0 ? k : b) : (dy > 0 ? k : b) * N + a);
    }
    out.push(line);
  }
  return out;
}

/** Slides the board; returns the new board, the points made and the biggest merge. */
function slide(b: Board, dx: number, dy: number): { board: Board; gained: number; top: number; moved: boolean } {
  const next = [...b];
  let gained = 0;
  let top = 0;
  for (const line of lines(dx, dy)) {
    const vals = line.map((i) => b[i]).filter(Boolean);
    const merged: number[] = [];
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] === vals[i + 1]) {
        merged.push(vals[i] * 2);
        gained += vals[i] * 2;
        top = Math.max(top, vals[i] * 2);
        i++;
      } else merged.push(vals[i]);
    }
    line.forEach((idx, i) => (next[idx] = merged[i] ?? 0));
  }
  return { board: next, gained, top, moved: next.some((v, i) => v !== b[i]) };
}

const stuck = (b: Board) => [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => !slide(b, dx, dy).moved);

export const Merge2048: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [board, setBoard] = useState<Board>(fresh);
  const [score, setScore] = useState(0);
  const [reached, setReached] = useState(false);
  const [result, setResult] = useState<{ score: number; top: number; record: boolean } | null>(null);
  const ref = useRef({ board, score, reached, over: false });
  ref.current = { ...ref.current, board, score, reached };

  const move = (dx: number, dy: number) => {
    const r = ref.current;
    if (r.over) return;
    const { board: slid, gained, top, moved } = slide(r.board, dx, dy);
    if (!moved) return chip.play('blip');
    const next = spawn(slid);
    const total = r.score + gained;
    ref.current.board = next;
    ref.current.score = total;
    setBoard(next);
    setScore(total);
    if (top) chip.softNote(NOTES[Math.min(top, 2048)] ?? 'E6', 0.08);
    else chip.softNote('A4', 0.03);
    if (top >= 2048 && !r.reached) {
      ref.current.reached = true;
      setReached(true);
      chip.play('powerup');
      onWin();
    }
    if (stuck(next)) {
      ref.current.over = true;
      chip.play('error');
      setResult({ score: total, top: Math.max(...next), record: total > 0 && saveBest('merge', total, true) });
    }
  };

  useGameKeys((e, down) => {
    const map: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const d = map[e.key];
    if (!d) return false;
    if (down) move(...d);
    return true;
  });

  const start = useRef<{ x: number; y: number } | null>(null);
  const onUp = (e: React.PointerEvent) => {
    const s0 = start.current;
    start.current = null;
    if (!s0) return;
    const dx = e.clientX - s0.x;
    const dy = e.clientY - s0.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(Math.sign(dx), 0);
    else move(0, Math.sign(dy));
  };

  const again = () => {
    chip.play('select');
    const b = fresh();
    ref.current = { board: b, score: 0, reached: false, over: false };
    setBoard(b);
    setScore(0);
    setReached(false);
    setResult(null);
  };

  return (
    <>
      <p className="mini-score">
        {tr('Score', 'Punkte')}: {score.toLocaleString('en-US')} · {tr('Top tile', 'Größte Kachel')}: {Math.max(...board)}
        {reached && ' · 2048!'}
      </p>
      <div
        className="merge-board"
        onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={onUp}
        onPointerCancel={() => (start.current = null)}
        role="grid"
        aria-label={tr('Board: swipe to slide the tiles', 'Spielfeld: wischen schiebt die Kacheln')}
      >
        {board.map((v, i) => (
          <div key={i} className={`merge-tile${v ? ` v${Math.min(v, 4096)}` : ''}`} role="gridcell">
            {v || ''}
          </div>
        ))}
      </div>
      {!result && (
        <div className="game-pad pad-4">
          <button className="px-btn" onClick={() => move(-1, 0)} aria-label={tr('Left', 'Links')}>
            ◄
          </button>
          <button className="px-btn" onClick={() => move(0, -1)} aria-label={tr('Up', 'Hoch')}>
            ▲
          </button>
          <button className="px-btn" onClick={() => move(0, 1)} aria-label={tr('Down', 'Runter')}>
            ▼
          </button>
          <button className="px-btn" onClick={() => move(1, 0)} aria-label={tr('Right', 'Rechts')}>
            ►
          </button>
        </div>
      )}
      {result && (
        <Done
          title={tr('NO MOVES LEFT', 'NICHTS GEHT MEHR')}
          text={tr(`${result.score.toLocaleString('en-US')} points, top tile ${result.top}.`, `${result.score.toLocaleString('de-DE')} Punkte, größte Kachel ${result.top}.`)}
          record={result.record}
          onAgain={again}
          board={{ game: 'merge', score: result.score }}
        />
      )}
    </>
  );
};

export const mergeBest = (n: number) => tr(`High score: ${n.toLocaleString('en-US')} points`, `Rekord: ${n.toLocaleString('de-DE')} Punkte`);
