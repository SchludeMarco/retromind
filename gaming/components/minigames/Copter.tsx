import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys, themeColors } from './shared';

// The cave flight of the early browser game days: hold to climb, let go to
// sink, and don't touch the walls or the blocks. One button, one more go.
// The cave gets narrower and faster the further you fly; the distance is
// the score. Hold anywhere on the playfield, space or the arrow up key.

const W = 300;
const H = 300;
const COL = 5;
const COPTER_X = 70;
const COPTER_R = 6;

interface Column {
  top: number;
  bottom: number;
}
interface Block {
  x: number;
  y: number;
  h: number;
}
interface State {
  y: number;
  vy: number;
  cols: Column[];
  blocks: Block[];
  smoke: { x: number; y: number; life: number }[];
  /** Pixels flown. */
  dist: number;
  /** Centre and width of the cave where it is being dug. */
  mid: number;
  gap: number;
  drift: number;
  /** Pixels scrolled since the last cave column. */
  carry: number;
  nextBlock: number;
  started: boolean;
  over: boolean;
}

const score = (dist: number) => Math.floor(dist / 10);

function dig(s: State): Column {
  // The cave narrows from 200 to 105 pixels over the first 15,000 pixels.
  s.gap = Math.max(105, 200 - s.dist / 160);
  s.drift += (Math.random() - 0.5) * 1.6;
  s.drift = Math.max(-3, Math.min(3, s.drift));
  s.mid += s.drift;
  const lo = s.gap / 2 + 10;
  if (s.mid < lo || s.mid > H - lo) {
    s.mid = Math.max(lo, Math.min(H - lo, s.mid));
    s.drift = -s.drift * 0.5;
  }
  return { top: s.mid - s.gap / 2, bottom: s.mid + s.gap / 2 };
}

const fresh = (): State => {
  const s: State = { y: H / 2, vy: 0, cols: [], blocks: [], smoke: [], dist: 0, mid: H / 2, gap: 200, drift: 0, carry: 0, nextBlock: 360, started: false, over: false };
  for (let x = 0; x <= W + COL; x += COL) s.cols.push(dig(s));
  return s;
};

export const Copter: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef<State>(fresh());
  const holding = useRef(false);
  const won = useRef(false);
  const shown = useRef(0);
  const [hud, setHud] = useState(0);
  const [result, setResult] = useState<{ score: number; record: boolean } | null>(null);

  const crash = useCallback((s: State) => {
    s.over = true;
    holding.current = false;
    chip.play('error');
    const n = score(s.dist);
    setHud(n);
    setResult({ score: n, record: n > 0 && saveBest('copter', n, true) });
  }, []);

  const tick = useCallback(() => {
    const s = st.current;
    if (s.over || !s.started) return;
    const speed = Math.min(4.2, 2.2 + s.dist / 6000);
    s.vy += holding.current ? -0.24 : 0.19;
    s.vy = Math.max(-3.4, Math.min(3.8, s.vy));
    s.y += s.vy;
    s.dist += speed;
    s.carry += speed;
    while (s.carry >= COL) {
      s.carry -= COL;
      s.cols.shift();
      s.cols.push(dig(s));
    }
    for (const b of s.blocks) b.x -= speed;
    s.blocks = s.blocks.filter((b) => b.x > -20);
    s.nextBlock -= speed;
    if (s.nextBlock <= 0) {
      // A block somewhere in the cave's mouth, leaving room above or below.
      const c = s.cols[s.cols.length - 1];
      const h = Math.min(60, 30 + s.dist / 500);
      s.blocks.push({ x: W, y: c.top + 8 + Math.random() * Math.max(0, c.bottom - c.top - h - 16), h });
      s.nextBlock = Math.max(150, 260 - s.dist / 150);
    }
    if (Math.random() < 0.6) s.smoke.push({ x: COPTER_X - 8, y: s.y, life: 24 });
    for (const p of s.smoke) {
      p.x -= speed;
      p.life--;
    }
    s.smoke = s.smoke.filter((p) => p.life > 0);

    const at = s.cols[Math.floor((COPTER_X + s.carry) / COL)];
    if (!at || s.y - COPTER_R < at.top || s.y + COPTER_R > at.bottom) return crash(s);
    if (s.blocks.some((b) => COPTER_X + COPTER_R > b.x && COPTER_X - COPTER_R < b.x + 14 && s.y + COPTER_R > b.y && s.y - COPTER_R < b.y + b.h)) return crash(s);
    const n = score(s.dist);
    if (n >= 1000 && !won.current) {
      won.current = true;
      onWin();
    }
    if (n !== shown.current) {
      if (n % 100 === 0) chip.softNote('G5', 0.05);
      shown.current = n;
      setHud(n);
    }
  }, [crash, onWin]);

  const draw = useCallback(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const t = themeColors(cv);
    const s = st.current;
    ctx.fillStyle = t.a1;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = t.bg;
    s.cols.forEach((c, i) => ctx.fillRect(i * COL - s.carry, c.top, COL + 0.5, c.bottom - c.top));
    ctx.fillStyle = t.a1;
    for (const b of s.blocks) ctx.fillRect(b.x, b.y, 14, b.h);
    for (const p of s.smoke) {
      ctx.globalAlpha = p.life / 40;
      ctx.fillStyle = t.dim;
      ctx.fillRect(p.x, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
    if (!s.over || Math.floor(Date.now() / 120) % 2) {
      // A little pixel copter, tilted by its speed.
      ctx.save();
      ctx.translate(COPTER_X, s.y);
      ctx.rotate(Math.max(-0.3, Math.min(0.3, s.vy / 10)));
      ctx.fillStyle = t.a3;
      ctx.fillRect(-8, -4, 14, 8);
      ctx.fillRect(-14, -2, 7, 3);
      ctx.fillStyle = t.a2;
      ctx.fillRect(1, -3, 5, 4);
      ctx.fillStyle = t.fg;
      const blade = Math.floor(Date.now() / 50) % 2 ? 9 : 5;
      ctx.fillRect(-blade, -7, blade * 2, 2);
      ctx.fillRect(-1, -6, 2, 2);
      ctx.restore();
    }
    if (!s.started) {
      ctx.fillStyle = t.a3;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tr('HOLD TO FLY', 'HALTEN ZUM FLIEGEN'), W / 2, H / 2 + 40);
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

  const press = (down: boolean) => {
    holding.current = down;
    if (down && !st.current.started && !st.current.over) {
      st.current.started = true;
      chip.play('blip');
    }
  };

  useGameKeys((e, down) => {
    if (e.key !== ' ' && e.key !== 'ArrowUp') return false;
    press(down);
    return true;
  });

  const again = () => {
    chip.play('select');
    st.current = fresh();
    won.current = false;
    shown.current = 0;
    setHud(0);
    setResult(null);
  };

  return (
    <>
      <p className="mini-score">
        {tr('Distance', 'Strecke')}: {hud} m
      </p>
      <canvas
        ref={canvas}
        className="arcade-board square"
        width={W}
        height={H}
        onPointerDown={() => press(true)}
        onPointerUp={() => press(false)}
        onPointerLeave={() => press(false)}
        onPointerCancel={() => press(false)}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={tr('Playfield: hold to climb, let go to sink', 'Spielfeld: halten zum Steigen, loslassen zum Sinken')}
      />
      {!result && <p className="dim mini-hint">{tr('Hold anywhere on the cave (or space) to climb.', 'Irgendwo auf die Höhle drücken und halten (oder Leertaste) zum Steigen.')}</p>}
      {result && (
        <Done
          title={tr('CRASH!', 'BRUCHLANDUNG!')}
          text={tr(`You flew ${result.score} m.`, `Du bist ${result.score} m geflogen.`)}
          record={result.record}
          onAgain={again}
          board={{ game: 'copter', score: result.score }}
        />
      )}
    </>
  );
};

export const copterBest = (n: number) => tr(`Record: ${n} m`, `Rekord: ${n} m`);
