import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys, themeColors } from './shared';

// A small Breakout: bounce the ball off the paddle into the wall of bricks.
// Drag on the playfield (or use the arrow keys / buttons) to move the paddle.
// Three balls; a cleared wall comes back a little faster.

const W = 300;
const H = 400;
const COLS = 8;
const ROWS = 6;
const BRICK_H = 14;
const TOP = 50;
const PADDLE_W = 56;
const PADDLE_Y = H - 30;
const R = 5;
const ROW_COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];

interface State {
  bricks: boolean[];
  px: number;
  bx: number;
  by: number;
  vx: number;
  vy: number;
  stuck: boolean;
  lives: number;
  score: number;
  wall: number;
  over: boolean;
}

const fresh = (): State => ({
  bricks: Array(COLS * ROWS).fill(true),
  px: W / 2,
  bx: W / 2,
  by: PADDLE_Y - R - 1,
  vx: 0,
  vy: 0,
  stuck: true,
  lives: 3,
  score: 0,
  wall: 1,
  over: false,
});

export const Breakout: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef<State>(fresh());
  const keys = useRef({ left: false, right: false });
  const [hud, setHud] = useState({ score: 0, lives: 3 });
  const [result, setResult] = useState<{ score: number; record: boolean } | null>(null);

  const launch = useCallback(() => {
    const s = st.current;
    if (!s.stuck || s.over) return;
    const speed = 3.6 + s.wall * 0.4;
    s.stuck = false;
    s.vx = (Math.random() < 0.5 ? -1 : 1) * speed * 0.6;
    s.vy = -speed;
    chip.play('blip');
  }, []);

  const draw = useCallback(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const t = themeColors(cv);
    const s = st.current;
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, H);
    const bw = W / COLS;
    s.bricks.forEach((on, i) => {
      if (!on) return;
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      ctx.fillStyle = ROW_COLORS[r];
      ctx.fillRect(c * bw + 1, TOP + r * BRICK_H + 1, bw - 2, BRICK_H - 2);
    });
    ctx.fillStyle = t.a2;
    ctx.fillRect(s.px - PADDLE_W / 2, PADDLE_Y, PADDLE_W, 8);
    ctx.fillStyle = t.fg;
    ctx.beginPath();
    ctx.arc(s.bx, s.by, R, 0, Math.PI * 2);
    ctx.fill();
    if (s.stuck && !s.over) {
      ctx.fillStyle = t.a3;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tr('TAP TO LAUNCH', 'TIPPEN ZUM START'), W / 2, H / 2 + 40);
    }
  }, []);

  const tick = useCallback(() => {
    const s = st.current;
    if (s.over) return;
    if (keys.current.left) s.px -= 6;
    if (keys.current.right) s.px += 6;
    s.px = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, s.px));
    if (s.stuck) {
      s.bx = s.px;
      s.by = PADDLE_Y - R - 1;
      return;
    }
    s.bx += s.vx;
    s.by += s.vy;
    if (s.bx < R || s.bx > W - R) {
      s.vx = -s.vx;
      s.bx = Math.max(R, Math.min(W - R, s.bx));
    }
    if (s.by < R) {
      s.vy = Math.abs(s.vy);
    }
    // Paddle: where it hits decides the angle.
    if (s.vy > 0 && s.by + R >= PADDLE_Y && s.by + R <= PADDLE_Y + 10 && Math.abs(s.bx - s.px) <= PADDLE_W / 2 + R) {
      const speed = Math.hypot(s.vx, s.vy);
      const hit = (s.bx - s.px) / (PADDLE_W / 2);
      const angle = hit * 1.05;
      s.vx = speed * Math.sin(angle);
      s.vy = -speed * Math.cos(angle);
      chip.softNote('C5', 0.05);
    }
    // Bricks.
    const bw = W / COLS;
    const c = Math.floor(s.bx / bw);
    const r = Math.floor((s.by - TOP) / BRICK_H);
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && s.bricks[r * COLS + c]) {
      s.bricks[r * COLS + c] = false;
      s.vy = -s.vy;
      s.score += (ROWS - r) * 10;
      chip.softNote(['C6', 'B5', 'A5', 'G5', 'F5', 'E5'][r], 0.05);
      setHud({ score: s.score, lives: s.lives });
      if (s.bricks.every((b) => !b)) {
        chip.play('powerup');
        onWin();
        s.wall++;
        s.bricks = Array(COLS * ROWS).fill(true);
        s.stuck = true;
      }
    }
    if (s.by > H + R) {
      s.lives--;
      setHud({ score: s.score, lives: s.lives });
      if (s.lives <= 0) {
        s.over = true;
        chip.play('error');
        setResult({ score: s.score, record: s.score > 0 && saveBest('breakout', s.score, true) });
      } else {
        chip.play('back');
        s.stuck = true;
      }
    }
  }, [onWin]);

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
    if (e.key === 'ArrowLeft') keys.current.left = down;
    else if (e.key === 'ArrowRight') keys.current.right = down;
    else if (e.key === ' ' || e.key === 'ArrowUp') {
      if (down) launch();
    } else return false;
    return true;
  });

  const toX = (e: React.PointerEvent) => {
    const rect = canvas.current!.getBoundingClientRect();
    st.current.px = ((e.clientX - rect.left) / rect.width) * W;
  };

  const again = () => {
    chip.play('select');
    st.current = fresh();
    setHud({ score: 0, lives: 3 });
    setResult(null);
  };

  const hold = (dir: 'left' | 'right') => ({
    onPointerDown: () => (keys.current[dir] = true),
    onPointerUp: () => (keys.current[dir] = false),
    onPointerLeave: () => (keys.current[dir] = false),
  });

  return (
    <>
      <p className="mini-score">
        {tr('Score', 'Punkte')}: {hud.score} · {tr('Balls', 'Bälle')}: {'●'.repeat(Math.max(0, hud.lives))}
      </p>
      <canvas
        ref={canvas}
        className="arcade-board"
        width={W}
        height={H}
        onPointerDown={(e) => {
          toX(e);
          launch();
        }}
        onPointerMove={(e) => (e.buttons || e.pointerType === 'mouse') && toX(e)}
        aria-label={tr('Playfield: drag to move the paddle, tap to launch', 'Spielfeld: ziehen bewegt den Schläger, tippen startet den Ball')}
      />
      {!result && (
        <div className="game-pad pad-3">
          <button className="px-btn" {...hold('left')} aria-label={tr('Left', 'Nach links')}>
            ◄
          </button>
          <button className="px-btn" onClick={launch}>
            {tr('GO', 'LOS')}
          </button>
          <button className="px-btn" {...hold('right')} aria-label={tr('Right', 'Nach rechts')}>
            ►
          </button>
        </div>
      )}
      {result && (
        <Done
          title={tr('GAME OVER', 'SPIEL VORBEI')}
          text={tr(`${result.score} points.`, `${result.score} Punkte.`)}
          record={result.record}
          onAgain={again}
          board={{ game: 'breakout', score: result.score }}
        />
      )}
    </>
  );
};

export const breakoutBest = (n: number) => tr(`High score: ${n} points`, `Rekord: ${n} Punkte`);
