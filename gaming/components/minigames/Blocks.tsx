import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys, themeColors } from './shared';

// Falling blocks in the style of the Game Boy classic. Starts slow and only
// speeds up a little every ten lines, so it stays a calm game. On the phone:
// tap the board to turn, swipe sideways to move, swipe down to drop; the
// buttons below do the same. On a keyboard: arrows, space to drop.

const COLS = 10;
const ROWS = 20;
const CELL = 24;

type Shape = number[][];

const PIECES: { shape: Shape; color: string }[] = [
  { shape: [[1, 1, 1, 1]], color: '#22d3ee' }, // I
  { shape: [[1, 1], [1, 1]], color: '#facc15' }, // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' }, // T
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' }, // S
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' }, // Z
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' }, // J
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' }, // L
];

interface Piece {
  shape: Shape;
  color: string;
  x: number;
  y: number;
}

const rotate = (s: Shape): Shape => s[0].map((_, c) => s.map((row) => row[c]).reverse());

const randomPiece = (): Piece => {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { shape: p.shape, color: p.color, x: Math.floor((COLS - p.shape[0].length) / 2), y: 0 };
};

const POINTS = [0, 100, 300, 500, 800];

interface State {
  board: (string | null)[][];
  piece: Piece;
  next: Piece;
  score: number;
  lines: number;
  over: boolean;
}

const fresh = (): State => ({
  board: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
  piece: randomPiece(),
  next: randomPiece(),
  score: 0,
  lines: 0,
  over: false,
});

function fits(board: State['board'], p: Piece, dx = 0, dy = 0, shape = p.shape): boolean {
  return shape.every((row, r) =>
    row.every((v, c) => {
      if (!v) return true;
      const x = p.x + c + dx;
      const y = p.y + r + dy;
      return x >= 0 && x < COLS && y < ROWS && (y < 0 || !board[y][x]);
    })
  );
}

export const Blocks: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const st = useRef<State>(fresh());
  const [hud, setHud] = useState({ score: 0, lines: 0 });
  const [result, setResult] = useState<{ score: number; lines: number; record: boolean } | null>(null);
  const [paused, setPaused] = useState(false);

  const draw = useCallback(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const t = themeColors(cv);
    const s = st.current;
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = t.bg2;
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, ROWS * CELL);
      ctx.stroke();
    }
    const cell = (x: number, y: number, color: string, alpha = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, 4);
      ctx.globalAlpha = 1;
    };
    s.board.forEach((row, y) => row.forEach((c, x) => c && cell(x, y, c)));
    if (!s.over) {
      // Ghost piece shows where it will land.
      let drop = 0;
      while (fits(s.board, s.piece, 0, drop + 1)) drop++;
      s.piece.shape.forEach((row, r) =>
        row.forEach((v, c) => v && cell(s.piece.x + c, s.piece.y + r + drop, s.piece.color, 0.2))
      );
      s.piece.shape.forEach((row, r) => row.forEach((v, c) => v && cell(s.piece.x + c, s.piece.y + r, s.piece.color)));
    }
    const pv = preview.current;
    const pctx = pv?.getContext('2d');
    if (pv && pctx) {
      pctx.fillStyle = t.bg;
      pctx.fillRect(0, 0, pv.width, pv.height);
      const sh = s.next.shape;
      const ox = (4 - sh[0].length) / 2;
      const oy = (2 - sh.length) / 2;
      sh.forEach((row, r) =>
        row.forEach((v, c) => {
          if (!v) return;
          pctx.fillStyle = s.next.color;
          pctx.fillRect((ox + c) * 16 + 1, (oy + r) * 16 + 1, 14, 14);
        })
      );
    }
  }, []);

  const finish = useCallback(() => {
    const s = st.current;
    s.over = true;
    chip.play('error');
    setResult({ score: s.score, lines: s.lines, record: s.score > 0 && saveBest('blocks', s.score, true) });
    if (s.lines >= 5) onWin();
  }, [onWin]);

  const lock = useCallback(() => {
    const s = st.current;
    s.piece.shape.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v && s.piece.y + r >= 0) s.board[s.piece.y + r][s.piece.x + c] = s.piece.color;
      })
    );
    const kept = s.board.filter((row) => row.some((c) => !c));
    const cleared = ROWS - kept.length;
    if (cleared) {
      s.board = [...Array.from({ length: cleared }, () => Array(COLS).fill(null)), ...kept];
      s.lines += cleared;
      s.score += POINTS[cleared] * (1 + Math.floor(s.lines / 10));
      chip.play(cleared >= 4 ? 'powerup' : 'coin');
    } else chip.softNote('C4', 0.06);
    s.piece = s.next;
    s.next = randomPiece();
    setHud({ score: s.score, lines: s.lines });
    if (!fits(s.board, s.piece)) finish();
  }, [finish]);

  const move = useCallback(
    (dx: number) => {
      const s = st.current;
      if (s.over || paused) return;
      if (fits(s.board, s.piece, dx, 0)) {
        s.piece.x += dx;
        chip.play('blip');
        draw();
      }
    },
    [draw, paused]
  );

  const turn = useCallback(() => {
    const s = st.current;
    if (s.over || paused) return;
    const shape = rotate(s.piece.shape);
    for (const kick of [0, -1, 1, -2, 2]) {
      if (fits(s.board, s.piece, kick, 0, shape)) {
        s.piece.shape = shape;
        s.piece.x += kick;
        chip.softNote('G5', 0.05);
        draw();
        return;
      }
    }
  }, [draw, paused]);

  const step = useCallback(() => {
    const s = st.current;
    if (s.over) return;
    if (fits(s.board, s.piece, 0, 1)) s.piece.y++;
    else lock();
    draw();
  }, [draw, lock]);

  const hardDrop = useCallback(() => {
    const s = st.current;
    if (s.over || paused) return;
    while (fits(s.board, s.piece, 0, 1)) {
      s.piece.y++;
      s.score += 1;
    }
    lock();
    draw();
  }, [draw, lock, paused]);

  // The game clock: slow at first, a bit quicker every ten lines.
  useEffect(() => {
    if (result || paused) return;
    const speed = Math.max(180, 750 - Math.floor(hud.lines / 10) * 70);
    const id = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      step();
    }, speed);
    return () => clearInterval(id);
  }, [step, hud.lines, result, paused]);

  useEffect(draw, [draw]);

  useGameKeys((e, down) => {
    if (!down) return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key);
    switch (e.key) {
      case 'ArrowLeft':
        move(-1);
        return true;
      case 'ArrowRight':
        move(1);
        return true;
      case 'ArrowUp':
        turn();
        return true;
      case 'ArrowDown':
        if (!paused) step();
        return true;
      case ' ':
        hardDrop();
        return true;
      case 'p':
        setPaused((p) => !p);
        return true;
    }
    return false;
  });

  // Touch: tap turns, a sideways swipe moves cell by cell, a quick swipe down drops.
  const touch = useRef<{ x: number; y: number; moved: number; t: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    touch.current = { x: e.clientX, y: e.clientY, moved: 0, t: Date.now() };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const t = touch.current;
    if (!t) return;
    const w = (canvas.current?.clientWidth ?? 200) / COLS;
    const steps = Math.trunc((e.clientX - t.x) / w) - t.moved;
    for (let i = 0; i < Math.abs(steps); i++) move(Math.sign(steps));
    t.moved += steps;
  };
  const onUp = (e: React.PointerEvent) => {
    const t = touch.current;
    touch.current = null;
    if (!t) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (dy > 50 && dy > Math.abs(dx) && Date.now() - t.t < 600) hardDrop();
    else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) turn();
  };

  const again = () => {
    chip.play('select');
    st.current = fresh();
    setHud({ score: 0, lines: 0 });
    setResult(null);
    setPaused(false);
    draw();
  };

  return (
    <>
      <div className="blocks-top">
        <p className="mini-score">
          {tr('Score', 'Punkte')}: {hud.score} · {tr('Lines', 'Reihen')}: {hud.lines}
        </p>
        <div className="blocks-next">
          <span className="dim">{tr('Next', 'Nächster')}</span>
          <canvas ref={preview} width={64} height={32} />
        </div>
      </div>
      <canvas
        ref={canvas}
        className="blocks-board"
        width={COLS * CELL}
        height={ROWS * CELL}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (touch.current = null)}
        aria-label={tr(
          'Playfield: tap to rotate, swipe to move, swipe down to drop',
          'Spielfeld: tippen zum Drehen, wischen zum Schieben, nach unten wischen zum Fallenlassen'
        )}
      />
      {!result && (
        <div className="game-pad">
          <button className="px-btn" onClick={() => move(-1)} aria-label={tr('Left', 'Nach links')}>
            ◄
          </button>
          <button className="px-btn" onClick={turn} aria-label={tr('Rotate', 'Drehen')}>
            ⟳
          </button>
          <button className="px-btn" onClick={() => move(1)} aria-label={tr('Right', 'Nach rechts')}>
            ►
          </button>
          <button className="px-btn" onClick={hardDrop} aria-label={tr('Drop', 'Fallen lassen')}>
            ▼
          </button>
          <button className="px-btn" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
            {paused ? '▶' : 'II'}
          </button>
        </div>
      )}
      {result && (
        <Done
          title={tr("GAME OVER", "SPIEL VORBEI")}
          text={tr(
            `${result.score} points, ${result.lines} ${result.lines === 1 ? 'line' : 'lines'} cleared.`,
            `${result.score} Punkte, ${result.lines} ${result.lines === 1 ? 'Reihe' : 'Reihen'} abgeräumt.`
          )}
          record={result.record}
          onAgain={again}
        />
      )}
    </>
  );
};

export const blocksBest = (n: number) => tr(`High score: ${n} points`, `Rekord: ${n} Punkte`);
