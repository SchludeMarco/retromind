import React, { useMemo, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, shuffle, useGameKeys } from './shared';

// A relaxed Sudoku: every new board is generated here, has exactly one
// solution and keeps plenty of numbers as hints. Clashes in a row, column or
// box show up in red, nothing else is checked until the board is full.

type Grid = number[]; // 81 cells, 0 = empty

const box = (i: number) => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3);

function canPlace(g: Grid, i: number, n: number): boolean {
  const r = Math.floor(i / 9);
  const c = i % 9;
  const b = box(i);
  for (let j = 0; j < 81; j++) {
    if (j === i || g[j] !== n) continue;
    if (Math.floor(j / 9) === r || j % 9 === c || box(j) === b) return false;
  }
  return true;
}

/**
 * Counts solutions by backtracking, stopping at `limit`. With `keep` the grid
 * stays filled with the first solution found (used to make a full board).
 */
function solve(g: Grid, limit: number, random = false, keep = false): number {
  const i = g.indexOf(0);
  if (i < 0) return 1;
  let count = 0;
  const digits = random ? shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]) : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (const n of digits) {
    if (!canPlace(g, i, n)) continue;
    g[i] = n;
    count += solve(g, limit - count, random, keep);
    if (count >= limit && keep) return count;
    g[i] = 0;
    if (count >= limit) return count;
  }
  return count;
}

const GIVENS = 38;

function generate(): { puzzle: Grid; solution: Grid } {
  const solution: Grid = Array(81).fill(0);
  solve(solution, 1, true, true);
  const puzzle = [...solution];
  let givens = 81;
  for (const i of shuffle(Array.from({ length: 81 }, (_, k) => k))) {
    if (givens <= GIVENS) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (solve([...puzzle], 2) !== 1) puzzle[i] = keep;
    else givens--;
  }
  return { puzzle, solution };
}

const NOTES = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6'];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export const Sudoku: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [game, setGame] = useState(generate);
  const [cells, setCells] = useState<Grid>(() => [...game.puzzle]);
  const [sel, setSel] = useState<number | null>(null);
  const [result, setResult] = useState<{ secs: number; record: boolean } | null>(null);
  const started = useRef(Date.now());

  const clashes = useMemo(() => {
    const bad = new Set<number>();
    cells.forEach((n, i) => {
      if (n && !canPlace(cells, i, n)) bad.add(i);
    });
    return bad;
  }, [cells]);

  const put = (n: number) => {
    if (sel === null || game.puzzle[sel] || result) return;
    const next = [...cells];
    next[sel] = next[sel] === n ? 0 : n;
    setCells(next);
    if (n) chip.softNote(NOTES[n - 1], 0.15);
    else chip.play('back');
    if (next.every((v, i) => v === game.solution[i])) {
      const secs = Math.round((Date.now() - started.current) / 1000);
      chip.play('powerup');
      setResult({ secs, record: saveBest('sudoku', secs, false) });
      onWin();
    }
  };

  useGameKeys((e, down) => {
    if (!down || sel === null) return false;
    if (/^[1-9]$/.test(e.key)) {
      put(Number(e.key));
      return true;
    }
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      put(0);
      return true;
    }
    return false;
  });

  const again = () => {
    chip.play('select');
    const g = generate();
    setGame(g);
    setCells([...g.puzzle]);
    setSel(null);
    setResult(null);
    started.current = Date.now();
  };

  const selVal = sel !== null ? cells[sel] : 0;
  const left = cells.filter((v) => !v).length;

  return (
    <>
      <p className="mini-score">
        {tr(
          `Tap a cell, then pick a number · ${left} ${left === 1 ? 'cell' : 'cells'} left`,
          `Feld antippen, dann Zahl wählen · noch ${left} ${left === 1 ? 'Feld' : 'Felder'}`
        )}
      </p>
      <div className="sudoku-grid">
        {cells.map((n, i) => {
          const given = !!game.puzzle[i];
          const cls = [
            'sudoku-cell',
            given ? 'given' : '',
            sel === i ? 'sel' : '',
            sel !== null && sel !== i && (Math.floor(i / 9) === Math.floor(sel / 9) || i % 9 === sel % 9 || box(i) === box(sel)) ? 'peer' : '',
            selVal && n === selVal ? 'same' : '',
            clashes.has(i) && !given ? 'clash' : '',
            i % 9 === 2 || i % 9 === 5 ? 'edge-r' : '',
            Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5 ? 'edge-b' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={i}
              className={cls}
              onClick={() => setSel(i)}
              onFocus={() => setSel(i)}
              data-nav
              aria-label={tr(
                `Row ${Math.floor(i / 9) + 1}, column ${(i % 9) + 1}: ${n || 'empty'}`,
                `Zeile ${Math.floor(i / 9) + 1}, Spalte ${(i % 9) + 1}: ${n || 'leer'}`
              )}
            >
              {n || ''}
            </button>
          );
        })}
      </div>
      {!result && (
        <div className="sudoku-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} className="px-btn" data-nav onClick={() => put(n)} disabled={sel === null || !!game.puzzle[sel]}>
              {n}
            </button>
          ))}
          <button className="px-btn" data-nav onClick={() => put(0)} disabled={sel === null || !!game.puzzle[sel]} aria-label={tr('Clear number', 'Zahl löschen')}>
            ✕
          </button>
        </div>
      )}
      {result && <Done text={tr(`Solved in ${fmt(result.secs)} minutes.`, `Gelöst in ${fmt(result.secs)} Minuten.`)} record={result.record} onAgain={again} />}
    </>
  );
};

export const sudokuBest = (n: number) => tr(`Best time: ${fmt(n)}`, `Bestzeit: ${fmt(n)}`);
