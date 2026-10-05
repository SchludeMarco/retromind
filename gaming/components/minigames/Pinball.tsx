import React, { useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { Done, saveBest, useGameKeys, themeColors } from './shared';

// A small, gentle pinball table: three bumpers, two flippers, three balls.
// Gravity is lower than on a real table so there is time to react. On the
// phone the left and right half of the table work the flippers; the buttons
// below and the arrow keys (or Z / M) do the same.

const W = 320;
const H = 520;
const R = 8; // ball radius
const GRAVITY = 620;
const MAX_SPEED = 950;
const SUBSTEPS = 8;
const BALLS = 3;

type Vec = { x: number; y: number };
type Seg = [number, number, number, number];

const WALLS: Seg[] = [
  [12, 380, 12, 70], // left
  [308, 380, 308, 70], // right
  [12, 70, 60, 22], // top corners
  [60, 22, 260, 22],
  [260, 22, 308, 70],
  [12, 380, 96, 448], // lower left slope to the flipper
  [308, 380, 224, 448],
  // little guides under the bumpers
  [60, 300, 90, 330],
  [260, 300, 230, 330],
];

const BUMPERS: { x: number; y: number; r: number; points: number }[] = [
  { x: 105, y: 150, r: 20, points: 100 },
  { x: 215, y: 150, r: 20, points: 100 },
  { x: 160, y: 230, r: 22, points: 150 },
  { x: 70, y: 230, r: 11, points: 50 },
  { x: 250, y: 230, r: 11, points: 50 },
];

const FLIP_LEN = 54;
const FLIP_R = 7;
const FLIP_SPEED = 16; // rad/s
const deg = (d: number) => (d * Math.PI) / 180;

interface Flipper {
  px: number;
  py: number;
  rest: number;
  up: number;
  angle: number;
  omega: number;
  pressed: boolean;
}

const makeFlippers = (): [Flipper, Flipper] => [
  { px: 96, py: 448, rest: deg(30), up: deg(-30), angle: deg(30), omega: 0, pressed: false },
  { px: 224, py: 448, rest: deg(150), up: deg(210), angle: deg(150), omega: 0, pressed: false },
];

function closest(p: Vec, ax: number, ay: number, bx: number, by: number): Vec {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((p.x - ax) * dx + (p.y - ay) * dy) / (dx * dx + dy * dy || 1)));
  return { x: ax + t * dx, y: ay + t * dy };
}

/** Pushes the ball out of a capsule and bounces it off; `u` is the surface's own velocity. */
function collide(pos: Vec, vel: Vec, q: Vec, radius: number, bounce: number, u: Vec = { x: 0, y: 0 }): boolean {
  const dx = pos.x - q.x;
  const dy = pos.y - q.y;
  const dist = Math.hypot(dx, dy);
  if (dist >= radius || dist === 0) return false;
  const nx = dx / dist;
  const ny = dy / dist;
  pos.x += nx * (radius - dist);
  pos.y += ny * (radius - dist);
  const rx = vel.x - u.x;
  const ry = vel.y - u.y;
  const vn = rx * nx + ry * ny;
  if (vn < 0) {
    vel.x = rx - (1 + bounce) * vn * nx + u.x;
    vel.y = ry - (1 + bounce) * vn * ny + u.y;
  }
  return true;
}

interface Game {
  ball: Vec;
  vel: Vec;
  live: boolean;
  balls: number;
  score: number;
  flippers: [Flipper, Flipper];
  flash: number[];
}

const newGame = (): Game => ({
  ball: { x: 160, y: 60 },
  vel: { x: 0, y: 0 },
  live: false,
  balls: BALLS,
  score: 0,
  flippers: makeFlippers(),
  flash: BUMPERS.map(() => 0),
});

const BUMP_NOTES = ['E5', 'G5', 'C6', 'A4', 'B4'];

export const Pinball: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const g = useRef<Game>(newGame());
  const [hud, setHud] = useState({ score: 0, balls: BALLS, live: false });
  const [result, setResult] = useState<{ score: number; record: boolean } | null>(null);
  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;

  const launch = () => {
    const s = g.current;
    if (s.live || s.balls <= 0) return;
    s.ball = { x: 150 + Math.random() * 20, y: 50 };
    s.vel = { x: (Math.random() - 0.5) * 160, y: 40 };
    s.live = true;
    chip.play('start');
    setHud({ score: s.score, balls: s.balls, live: true });
  };

  const press = (side: 0 | 1, on: boolean) => {
    const f = g.current.flippers[side];
    if (on && !f.pressed) chip.softNote(side ? 'D4' : 'C4', 0.05);
    f.pressed = on;
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const s = g.current;
      const h = dt / SUBSTEPS;
      for (let k = 0; k < SUBSTEPS; k++) {
        for (const f of s.flippers) {
          const target = f.pressed ? f.up : f.rest;
          const diff = target - f.angle;
          const stepA = Math.sign(diff) * Math.min(Math.abs(diff), FLIP_SPEED * h);
          f.angle += stepA;
          f.omega = stepA / h;
        }
        if (!s.live) continue;
        s.vel.y += GRAVITY * h;
        s.ball.x += s.vel.x * h;
        s.ball.y += s.vel.y * h;
        for (const [ax, ay, bx, by] of WALLS) collide(s.ball, s.vel, closest(s.ball, ax, ay, bx, by), R, 0.45);
        BUMPERS.forEach((b, i) => {
          if (collide(s.ball, s.vel, { x: b.x, y: b.y }, R + b.r, 0.9)) {
            const nx = (s.ball.x - b.x) / (R + b.r);
            const ny = (s.ball.y - b.y) / (R + b.r);
            s.vel.x += nx * 160;
            s.vel.y += ny * 160;
            if (s.flash[i] <= 0) {
              s.score += b.points;
              chip.softNote(BUMP_NOTES[i], 0.12);
            }
            s.flash[i] = 0.15;
          }
        });
        for (const f of s.flippers) {
          const tx = f.px + Math.cos(f.angle) * FLIP_LEN;
          const ty = f.py + Math.sin(f.angle) * FLIP_LEN;
          const q = closest(s.ball, f.px, f.py, tx, ty);
          const u = { x: -f.omega * (q.y - f.py), y: f.omega * (q.x - f.px) };
          collide(s.ball, s.vel, q, R + FLIP_R, 0.35, u);
        }
        const sp = Math.hypot(s.vel.x, s.vel.y);
        if (sp > MAX_SPEED) {
          s.vel.x *= MAX_SPEED / sp;
          s.vel.y *= MAX_SPEED / sp;
        }
        if (s.ball.y > H + 20) {
          s.live = false;
          s.balls -= 1;
          chip.play('back');
          if (s.balls <= 0) {
            setResult({ score: s.score, record: s.score > 0 && saveBest('pinball', s.score, true) });
            if (s.score >= 2000) onWinRef.current();
          }
          break;
        }
      }
      s.flash = s.flash.map((f) => Math.max(0, f - dt));
      setHud((old) => (old.score === s.score && old.balls === s.balls && old.live === s.live ? old : { score: s.score, balls: s.balls, live: s.live }));
      draw();
      raf = requestAnimationFrame(loop);
    };

    const draw = () => {
      const cv = canvas.current;
      const ctx = cv?.getContext('2d');
      if (!cv || !ctx) return;
      const t = themeColors(cv);
      const s = g.current;
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.lineCap = 'round';
      ctx.strokeStyle = t.dim;
      ctx.lineWidth = 4;
      for (const [ax, ay, bx, by] of WALLS) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      BUMPERS.forEach((b, i) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = s.flash[i] > 0 ? t.a3 : i === 2 ? t.a1 : t.a2;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = t.fg;
        ctx.stroke();
      });
      ctx.strokeStyle = t.a1;
      ctx.lineWidth = FLIP_R * 2;
      for (const f of s.flippers) {
        ctx.beginPath();
        ctx.moveTo(f.px, f.py);
        ctx.lineTo(f.px + Math.cos(f.angle) * FLIP_LEN, f.py + Math.sin(f.angle) * FLIP_LEN);
        ctx.stroke();
      }
      if (s.live) {
        ctx.beginPath();
        ctx.arc(s.ball.x, s.ball.y, R, 0, Math.PI * 2);
        ctx.fillStyle = t.fg;
        ctx.fill();
      }
      ctx.fillStyle = t.dim;
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      if (!s.live && s.balls > 0) ctx.fillText('Tippe START', W / 2, 330);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [result]);

  useGameKeys((e, down) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'z') {
      press(0, down);
      return true;
    }
    if (k === 'arrowright' || k === 'm' || k === '-') {
      press(1, down);
      return true;
    }
    if (k === ' ' || k === 'enter') {
      if (down) launch();
      return k === ' ';
    }
    return false;
  });

  // Touch: each finger on the left or right half holds that flipper.
  const fingers = useRef(new Map<number, 0 | 1>());
  const sideOf = (e: React.PointerEvent): 0 | 1 => {
    const r = (e.target as Element).getBoundingClientRect();
    return e.clientX - r.left < r.width / 2 ? 0 : 1;
  };
  const refresh = () => {
    const sides = Array.from(fingers.current.values());
    press(0, sides.includes(0));
    press(1, sides.includes(1));
  };
  const onDown = (e: React.PointerEvent) => {
    if (!g.current.live) launch();
    fingers.current.set(e.pointerId, sideOf(e));
    refresh();
  };
  const onUp = (e: React.PointerEvent) => {
    fingers.current.delete(e.pointerId);
    refresh();
  };

  const hold = (side: 0 | 1) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      press(side, true);
    },
    onPointerUp: () => press(side, false),
    onPointerLeave: () => press(side, false),
    onPointerCancel: () => press(side, false),
  });

  const again = () => {
    chip.play('select');
    g.current = newGame();
    setHud({ score: 0, balls: BALLS, live: false });
    setResult(null);
  };

  return (
    <>
      <p className="mini-score">
        Punkte: {hud.score} · Kugeln: {'●'.repeat(Math.max(0, hud.balls - (hud.live ? 1 : 0)))}
        {hud.live ? ' + 1 im Spiel' : ''}
      </p>
      <canvas
        ref={canvas}
        className="pinball-table"
        width={W}
        height={H}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Flippertisch: linke oder rechte Hälfte antippen für den jeweiligen Flipper"
      />
      {!result && (
        <div className="game-pad pinball-pad">
          <button className="px-btn" {...hold(0)} aria-label="Linker Flipper">
            ◄ FLIPPER
          </button>
          <button className="px-btn" onClick={launch} disabled={hud.live} data-nav>
            START
          </button>
          <button className="px-btn" {...hold(1)} aria-label="Rechter Flipper">
            FLIPPER ►
          </button>
        </div>
      )}
      {result && <Done title="SPIEL VORBEI" text={`${result.score} Punkte erflippert.`} record={result.record} onAgain={again} />}
    </>
  );
};

export const pinballBest = (n: number) => `Rekord: ${n} Punkte`;
