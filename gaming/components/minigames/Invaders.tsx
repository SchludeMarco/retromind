import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys, themeColors } from './shared';

// A little invasion from space in the style of the 1978 arcade hit: the
// rows march sideways and step down; shoot them before they land. Drag on
// the playfield to move, tap to fire (or arrows and space). Three lives.

const W = 300;
const H = 400;
const COLS = 8;
const ROWS = 4;
const AW = 20;
const AH = 14;
const GAP_X = 12;
const GAP_Y = 14;
const SHIP_Y = H - 28;
const SHIP_W = 26;
const ROW_COLORS = ['#f472b6', '#a78bfa', '#38bdf8', '#4ade80'];
// Two-frame pixel aliens, 8x5.
const ALIEN = [
  ['00100100', '00111100', '01011010', '11111111', '10100101'],
  ['00100100', '10111101', '11011011', '01111110', '01000010'],
];

interface Shot {
  x: number;
  y: number;
}
interface State {
  alive: boolean[];
  ox: number;
  oy: number;
  dir: number;
  frame: number;
  stepAt: number;
  ship: number;
  shot: Shot | null;
  bombs: Shot[];
  lives: number;
  score: number;
  wave: number;
  over: boolean;
  hitAt: number;
}

const fresh = (wave = 1, score = 0, lives = 3): State => ({
  alive: Array(COLS * ROWS).fill(true),
  ox: 20,
  oy: 40 + Math.min(wave - 1, 4) * 10,
  dir: 1,
  frame: 0,
  stepAt: 0,
  ship: W / 2,
  shot: null,
  bombs: [],
  lives,
  score,
  wave,
  over: false,
  hitAt: 0,
});

export const Invaders: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef<State>(fresh());
  const keys = useRef({ left: false, right: false });
  const [hud, setHud] = useState({ score: 0, lives: 3, wave: 1 });
  const [result, setResult] = useState<{ score: number; record: boolean } | null>(null);

  const fire = useCallback(() => {
    const s = st.current;
    if (s.over || s.shot) return;
    s.shot = { x: s.ship, y: SHIP_Y - 6 };
    chip.softNote('A6', 0.04);
  }, []);

  const draw = useCallback(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const t = themeColors(cv);
    const s = st.current;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const px = AW / 8;
    s.alive.forEach((on, i) => {
      if (!on) return;
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      const x = s.ox + c * (AW + GAP_X);
      const y = s.oy + r * (AH + GAP_Y);
      ctx.fillStyle = ROW_COLORS[r];
      ALIEN[s.frame].forEach((row, ry) =>
        [...row].forEach((v, rx) => v === '1' && ctx.fillRect(x + rx * px, y + ry * (AH / 5), px, AH / 5))
      );
    });
    const blink = Date.now() - s.hitAt < 900 && Math.floor(Date.now() / 100) % 2;
    if (!blink) {
      ctx.fillStyle = t.ok;
      ctx.fillRect(s.ship - SHIP_W / 2, SHIP_Y, SHIP_W, 8);
      ctx.fillRect(s.ship - 3, SHIP_Y - 6, 6, 6);
    }
    ctx.fillStyle = '#fff';
    if (s.shot) ctx.fillRect(s.shot.x - 1, s.shot.y, 2, 8);
    ctx.fillStyle = '#facc15';
    s.bombs.forEach((b) => ctx.fillRect(b.x - 1.5, b.y, 3, 7));
    ctx.fillStyle = t.ok;
    ctx.fillRect(0, H - 6, W, 2);
  }, []);

  const tick = useCallback(
    (now: number) => {
      const s = st.current;
      if (s.over) return;
      if (keys.current.left) s.ship -= 4;
      if (keys.current.right) s.ship += 4;
      s.ship = Math.max(SHIP_W / 2, Math.min(W - SHIP_W / 2, s.ship));
      const left = s.alive.filter(Boolean).length;
      // Fewer aliens march faster, like in the original.
      const interval = Math.max(70, 520 - (COLS * ROWS - left) * 14 - s.wave * 30);
      if (now - s.stepAt > interval) {
        s.stepAt = now;
        s.frame = 1 - s.frame;
        const cols = s.alive.map((on, i) => (on ? i % COLS : -1)).filter((c) => c >= 0);
        const minX = s.ox + Math.min(...cols) * (AW + GAP_X);
        const maxX = s.ox + Math.max(...cols) * (AW + GAP_X) + AW;
        if ((s.dir > 0 && maxX + 8 > W) || (s.dir < 0 && minX - 8 < 0)) {
          s.dir = -s.dir;
          s.oy += 12;
        } else s.ox += 8 * s.dir;
        chip.softNote(s.frame ? 'C3' : 'A2', 0.05);
        // A random alien at the bottom of its column drops a bomb.
        if (Math.random() < 0.35 + s.wave * 0.05) {
          const shooters = cols.filter((c, i, a) => a.indexOf(c) === i);
          const c = shooters[Math.floor(Math.random() * shooters.length)];
          let r = ROWS - 1;
          while (r >= 0 && !s.alive[r * COLS + c]) r--;
          if (r >= 0) s.bombs.push({ x: s.ox + c * (AW + GAP_X) + AW / 2, y: s.oy + r * (AH + GAP_Y) + AH });
        }
      }
      if (s.shot) {
        s.shot.y -= 7;
        if (s.shot.y < 0) s.shot = null;
        else {
          const c = Math.floor((s.shot.x - s.ox) / (AW + GAP_X));
          const r = Math.floor((s.shot.y - s.oy) / (AH + GAP_Y));
          const inX = (s.shot.x - s.ox) % (AW + GAP_X) < AW;
          const inY = (s.shot.y - s.oy) % (AH + GAP_Y) < AH;
          if (c >= 0 && c < COLS && r >= 0 && r < ROWS && inX && inY && s.alive[r * COLS + c]) {
            s.alive[r * COLS + c] = false;
            s.shot = null;
            s.score += (ROWS - r) * 10;
            chip.play('blip');
            setHud({ score: s.score, lives: s.lives, wave: s.wave });
            if (s.alive.every((a) => !a)) {
              chip.play('powerup');
              onWin();
              st.current = fresh(s.wave + 1, s.score, s.lives);
              setHud({ score: s.score, lives: s.lives, wave: s.wave + 1 });
              return;
            }
          }
        }
      }
      s.bombs.forEach((b) => (b.y += 3));
      const hit = s.bombs.find((b) => b.y > SHIP_Y && b.y < SHIP_Y + 10 && Math.abs(b.x - s.ship) < SHIP_W / 2);
      s.bombs = s.bombs.filter((b) => b !== hit && b.y < H);
      const landed = s.alive.some((on, i) => on && s.oy + Math.floor(i / COLS) * (AH + GAP_Y) + AH >= SHIP_Y);
      if (hit || landed) {
        s.lives = landed ? 0 : s.lives - 1;
        s.hitAt = Date.now();
        setHud({ score: s.score, lives: s.lives, wave: s.wave });
        if (s.lives <= 0) {
          s.over = true;
          chip.play('error');
          setResult({ score: s.score, record: s.score > 0 && saveBest('invaders', s.score, true) });
        } else chip.play('back');
      }
    },
    [onWin]
  );

  useEffect(() => {
    if (result) return;
    let raf = 0;
    const loop = (now: number) => {
      if (document.visibilityState !== 'hidden') {
        tick(now);
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
      if (down) fire();
    } else return false;
    return true;
  });

  const toX = (e: React.PointerEvent) => {
    const rect = canvas.current!.getBoundingClientRect();
    st.current.ship = ((e.clientX - rect.left) / rect.width) * W;
  };
  const hold = (dir: 'left' | 'right') => ({
    onPointerDown: () => (keys.current[dir] = true),
    onPointerUp: () => (keys.current[dir] = false),
    onPointerLeave: () => (keys.current[dir] = false),
  });

  const again = () => {
    chip.play('select');
    st.current = fresh();
    setHud({ score: 0, lives: 3, wave: 1 });
    setResult(null);
  };

  return (
    <>
      <p className="mini-score">
        {tr('Score', 'Punkte')}: {hud.score} · {tr('Wave', 'Welle')} {hud.wave} · {'▲'.repeat(Math.max(0, hud.lives))}
      </p>
      <canvas
        ref={canvas}
        className="arcade-board"
        width={W}
        height={H}
        onPointerDown={(e) => {
          toX(e);
          fire();
        }}
        onPointerMove={(e) => (e.buttons || e.pointerType === 'mouse') && toX(e)}
        aria-label={tr('Playfield: drag to move, tap to fire', 'Spielfeld: ziehen zum Bewegen, tippen zum Schießen')}
      />
      {!result && (
        <div className="game-pad pad-3">
          <button className="px-btn" {...hold('left')} aria-label={tr('Left', 'Nach links')}>
            ◄
          </button>
          <button className="px-btn" onClick={fire}>
            {tr('FIRE', 'FEUER')}
          </button>
          <button className="px-btn" {...hold('right')} aria-label={tr('Right', 'Nach rechts')}>
            ►
          </button>
        </div>
      )}
      {result && (
        <Done
          title={tr('GAME OVER', 'SPIEL VORBEI')}
          text={tr(`${result.score} points, made it to wave ${hud.wave}.`, `${result.score} Punkte, bis Welle ${hud.wave} gekommen.`)}
          record={result.record}
          onAgain={again}
          board={{ game: 'invaders', score: result.score }}
        />
      )}
    </>
  );
};

export const invadersBest = (n: number) => tr(`High score: ${n} points`, `Rekord: ${n} Punkte`);
