import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys, themeColors } from './shared';

// Asteroids like the 1979 vector cabinet: turn, thrust and shoot the rocks
// to pieces; big ones split into two smaller, faster ones. The screen wraps
// at every edge. Arrows and space, or hold the buttons below. Three ships,
// an extra one every 10,000 points, and every cleared field sends more rocks.

const W = 300;
const H = 400;
const SIZES = [0, 8, 16, 28];
const POINTS = [0, 100, 50, 20];
const SHIP_R = 9;
const MAX_SHOTS = 5;

interface Rock {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  /** Jagged outline, one radius factor per corner. */
  shape: number[];
}
interface Shot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}
interface State {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  rocks: Rock[];
  shots: Shot[];
  bits: Shot[];
  lives: number;
  score: number;
  wave: number;
  /** Frames left of the blinking safe time after a new ship. */
  safe: number;
  /** Frames until the next ship appears after a crash. */
  dead: number;
  cooldown: number;
  over: boolean;
  thrusting: boolean;
}

const wrap = (v: number, max: number) => (v < 0 ? v + max : v >= max ? v - max : v);

const rock = (x: number, y: number, size: number, wave: number): Rock => {
  const a = Math.random() * Math.PI * 2;
  const speed = (0.5 + Math.random() * 0.7) * (1 + (3 - size) * 0.45) * (1 + Math.min(wave - 1, 6) * 0.08);
  return { x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, size, shape: Array.from({ length: 10 }, () => 0.75 + Math.random() * 0.35) };
};

/** A new field: rocks start at the edges, away from the ship in the middle. */
const field = (wave: number): Rock[] =>
  Array.from({ length: Math.min(3 + wave, 9) }, () => (Math.random() < 0.5 ? rock(Math.random() * W, 0, 3, wave) : rock(0, Math.random() * H, 3, wave)));

const fresh = (): State => ({
  x: W / 2,
  y: H / 2,
  vx: 0,
  vy: 0,
  angle: -Math.PI / 2,
  rocks: field(1),
  shots: [],
  bits: [],
  lives: 3,
  score: 0,
  wave: 1,
  safe: 120,
  dead: 0,
  cooldown: 0,
  over: false,
  thrusting: false,
});

export const Asteroids: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef<State>(fresh());
  const keys = useRef({ left: false, right: false, thrust: false, fire: false });
  const [hud, setHud] = useState({ score: 0, lives: 3, wave: 1 });
  const [result, setResult] = useState<{ score: number; record: boolean } | null>(null);

  const addScore = (s: State, n: number) => {
    const before = Math.floor(s.score / 10_000);
    s.score += n;
    if (Math.floor(s.score / 10_000) > before) {
      s.lives++;
      chip.play('powerup');
    }
  };

  const burst = (s: State, x: number, y: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 0.5 + Math.random() * 2;
      s.bits.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 20 + Math.random() * 20 });
    }
  };

  const tick = useCallback(() => {
    const s = st.current;
    if (s.over) return;
    const k = keys.current;
    const alive = s.dead === 0;
    if (alive) {
      if (k.left) s.angle -= 0.085;
      if (k.right) s.angle += 0.085;
      s.thrusting = k.thrust;
      if (k.thrust) {
        s.vx += Math.cos(s.angle) * 0.12;
        s.vy += Math.sin(s.angle) * 0.12;
      }
      s.vx *= 0.99;
      s.vy *= 0.99;
      const v = Math.hypot(s.vx, s.vy);
      if (v > 5) {
        s.vx *= 5 / v;
        s.vy *= 5 / v;
      }
      s.x = wrap(s.x + s.vx, W);
      s.y = wrap(s.y + s.vy, H);
      if (s.cooldown > 0) s.cooldown--;
      if (k.fire && s.cooldown === 0 && s.shots.length < MAX_SHOTS) {
        s.shots.push({ x: s.x + Math.cos(s.angle) * SHIP_R, y: s.y + Math.sin(s.angle) * SHIP_R, vx: Math.cos(s.angle) * 6 + s.vx, vy: Math.sin(s.angle) * 6 + s.vy, life: 50 });
        s.cooldown = 9;
        chip.softNote('A6', 0.03);
      }
      if (s.safe > 0) s.safe--;
    } else if (--s.dead === 0) {
      Object.assign(s, { x: W / 2, y: H / 2, vx: 0, vy: 0, angle: -Math.PI / 2, safe: 120 });
    }

    for (const r of s.rocks) {
      r.x = wrap(r.x + r.vx, W);
      r.y = wrap(r.y + r.vy, H);
    }
    for (const b of [...s.shots, ...s.bits]) {
      b.x = wrap(b.x + b.vx, W);
      b.y = wrap(b.y + b.vy, H);
      b.life--;
    }
    s.bits = s.bits.filter((b) => b.life > 0);

    // Shots break rocks.
    const born: Rock[] = [];
    s.shots = s.shots.filter((sh) => {
      if (sh.life <= 0) return false;
      const hit = s.rocks.find((r) => Math.hypot(r.x - sh.x, r.y - sh.y) < SIZES[r.size]);
      if (!hit) return true;
      s.rocks = s.rocks.filter((r) => r !== hit);
      addScore(s, POINTS[hit.size]);
      burst(s, hit.x, hit.y, 4 + hit.size * 2);
      chip.softNote(['', 'E6', 'B5', 'E5'][hit.size], 0.07);
      if (hit.size > 1) born.push(rock(hit.x, hit.y, hit.size - 1, s.wave), rock(hit.x, hit.y, hit.size - 1, s.wave));
      return false;
    });
    s.rocks.push(...born);

    // Rocks hit the ship.
    if (alive && s.safe === 0 && s.rocks.some((r) => Math.hypot(r.x - s.x, r.y - s.y) < SIZES[r.size] + SHIP_R * 0.6)) {
      burst(s, s.x, s.y, 24);
      s.lives--;
      s.thrusting = false;
      chip.play('error');
      if (s.lives <= 0) {
        s.over = true;
        setResult({ score: s.score, record: s.score > 0 && saveBest('asteroids', s.score, true) });
      } else s.dead = 70;
    }

    if (!s.rocks.length) {
      s.wave++;
      if (s.wave === 3) onWin();
      chip.play('coin');
      s.rocks = field(s.wave);
      s.safe = Math.max(s.safe, 60);
    }
    setHud((h) => (h.score === s.score && h.lives === s.lives && h.wave === s.wave ? h : { score: s.score, lives: s.lives, wave: s.wave }));
  }, [onWin]);

  const draw = useCallback(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const t = themeColors(cv);
    const s = st.current;
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = t.fg;
    for (const r of s.rocks) {
      ctx.beginPath();
      r.shape.forEach((f, i) => {
        const a = (i / r.shape.length) * Math.PI * 2;
        const px = r.x + Math.cos(a) * SIZES[r.size] * f;
        const py = r.y + Math.sin(a) * SIZES[r.size] * f;
        if (i) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
      });
      ctx.closePath();
      ctx.stroke();
    }
    ctx.fillStyle = t.a3;
    for (const b of s.shots) ctx.fillRect(b.x - 1.5, b.y - 1.5, 3, 3);
    ctx.fillStyle = t.dim;
    for (const b of s.bits) ctx.fillRect(b.x, b.y, 2, 2);
    if (s.dead === 0 && !s.over && (s.safe === 0 || Math.floor(s.safe / 6) % 2 === 0)) {
      const p = (a: number, r: number) => [s.x + Math.cos(s.angle + a) * r, s.y + Math.sin(s.angle + a) * r] as const;
      ctx.strokeStyle = t.a2;
      ctx.beginPath();
      ctx.moveTo(...p(0, SHIP_R + 3));
      ctx.lineTo(...p(2.5, SHIP_R));
      ctx.lineTo(...p(Math.PI, SHIP_R * 0.45));
      ctx.lineTo(...p(-2.5, SHIP_R));
      ctx.closePath();
      ctx.stroke();
      if (s.thrusting && Math.random() < 0.8) {
        ctx.strokeStyle = t.a1;
        ctx.beginPath();
        ctx.moveTo(...p(2.8, SHIP_R * 0.7));
        ctx.lineTo(...p(Math.PI, SHIP_R + 5 + Math.random() * 4));
        ctx.lineTo(...p(-2.8, SHIP_R * 0.7));
        ctx.stroke();
      }
    }
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
    const k = keys.current;
    if (e.key === 'ArrowLeft') k.left = down;
    else if (e.key === 'ArrowRight') k.right = down;
    else if (e.key === 'ArrowUp') k.thrust = down;
    else if (e.key === ' ') k.fire = down;
    else return false;
    return true;
  });

  const hold = (key: keyof typeof keys.current) => ({
    onPointerDown: (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      keys.current[key] = true;
    },
    onPointerUp: () => (keys.current[key] = false),
    onPointerLeave: () => (keys.current[key] = false),
    onPointerCancel: () => (keys.current[key] = false),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const again = () => {
    chip.play('select');
    st.current = fresh();
    keys.current = { left: false, right: false, thrust: false, fire: false };
    setHud({ score: 0, lives: 3, wave: 1 });
    setResult(null);
  };

  return (
    <>
      <p className="mini-score">
        {tr('Score', 'Punkte')}: {hud.score} · {tr('Ships', 'Schiffe')}: {'▲'.repeat(Math.max(0, Math.min(hud.lives, 6)))} · {tr('Field', 'Feld')} {hud.wave}
      </p>
      <canvas
        ref={canvas}
        className="arcade-board"
        width={W}
        height={H}
        {...hold('fire')}
        aria-label={tr('Playfield: tap to fire, the buttons turn and thrust', 'Spielfeld: tippen schießt, die Knöpfe drehen und geben Schub')}
      />
      {!result && (
        <div className="game-pad pad-4">
          <button className="px-btn" {...hold('left')} aria-label={tr('Turn left', 'Links drehen')}>
            ↺
          </button>
          <button className="px-btn" {...hold('thrust')} aria-label={tr('Thrust', 'Schub')}>
            ▲
          </button>
          <button className="px-btn" {...hold('right')} aria-label={tr('Turn right', 'Rechts drehen')}>
            ↻
          </button>
          <button className="px-btn" {...hold('fire')}>
            {tr('FIRE', 'FEUER')}
          </button>
        </div>
      )}
      {result && (
        <Done
          title={tr('GAME OVER', 'SPIEL VORBEI')}
          text={tr(`${result.score.toLocaleString('en-US')} points, field ${hud.wave}.`, `${result.score.toLocaleString('de-DE')} Punkte, Feld ${hud.wave}.`)}
          record={result.record}
          onAgain={again}
          board={{ game: 'asteroids', score: result.score }}
        />
      )}
    </>
  );
};

export const asteroidsBest = (n: number) => tr(`High score: ${n.toLocaleString('en-US')} points`, `Rekord: ${n.toLocaleString('de-DE')} Punkte`);
