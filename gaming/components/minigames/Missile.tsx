import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, themeColors } from './shared';

// Missile defense in the spirit of the 1980 arcade game: rockets rain down
// on six cities; tap the sky and a counter rocket explodes there, taking
// out everything that flies into the blast. Each wave comes faster, later
// ones with rockets that split. Surviving cities and unused rockets pay a
// bonus, and every 10,000 points rebuilds a lost city.

const W = 300;
const H = 400;
const GROUND = H - 26;
const BASE = { x: W / 2, y: GROUND - 8 };
const CITIES = [30, 70, 110, 190, 230, 270];
const AMMO = 30;
const BLAST = 28;

interface Rocket {
  sx: number;
  sy: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  speed: number;
  /** Splits into more rockets above this height (0 = never). */
  splitAt: number;
}
interface Blast {
  x: number;
  y: number;
  r: number;
  grow: boolean;
  mine: boolean;
}
interface State {
  cities: boolean[];
  enemies: Rocket[];
  mine: Rocket[];
  blasts: Blast[];
  ammo: number;
  wave: number;
  /** Rockets still to come this wave, and frames until the next one. */
  left: number;
  next: number;
  score: number;
  /** Frames of the between-waves pause (shows the bonus). */
  pause: number;
  bonus: number;
  over: boolean;
}

const fresh = (): State => ({
  cities: CITIES.map(() => true),
  enemies: [],
  mine: [],
  blasts: [],
  ammo: AMMO,
  wave: 1,
  left: 10,
  next: 60,
  score: 0,
  pause: 0,
  bonus: 0,
  over: false,
});

function enemy(s: State, sx = Math.random() * W, sy = 0): Rocket {
  const standing = CITIES.flatMap((x, i) => (s.cities[i] ? [x] : []));
  const targets = standing.length ? [...standing, BASE.x] : [BASE.x];
  const tx = targets[Math.floor(Math.random() * targets.length)];
  return { sx, sy, x: sx, y: sy, tx, ty: GROUND, speed: 0.35 + s.wave * 0.09 + Math.random() * 0.15, splitAt: s.wave >= 3 && Math.random() < 0.25 ? 120 + Math.random() * 100 : 0 };
}

/** Moves a rocket along its line; true once it has arrived. */
function fly(r: Rocket): boolean {
  const dx = r.tx - r.x;
  const dy = r.ty - r.y;
  const d = Math.hypot(dx, dy);
  if (d <= r.speed) {
    r.x = r.tx;
    r.y = r.ty;
    return true;
  }
  r.x += (dx / d) * r.speed;
  r.y += (dy / d) * r.speed;
  return false;
}

export const Missile: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef<State>(fresh());
  const [hud, setHud] = useState({ score: 0, ammo: AMMO, wave: 1 });
  const [result, setResult] = useState<{ score: number; wave: number; record: boolean } | null>(null);

  const addScore = (s: State, n: number) => {
    const before = Math.floor(s.score / 10_000);
    s.score += n;
    if (Math.floor(s.score / 10_000) > before) {
      const lost = s.cities.indexOf(false);
      if (lost >= 0) {
        s.cities[lost] = true;
        chip.play('powerup');
      }
    }
  };

  const tick = useCallback(() => {
    const s = st.current;
    if (s.over) return;
    if (s.pause) {
      if (--s.pause === 0) {
        s.wave++;
        if (s.wave === 5) onWin();
        s.ammo = AMMO;
        s.left = 8 + s.wave * 3;
        s.next = 40;
      }
    } else if (s.left > 0 && --s.next <= 0) {
      s.enemies.push(enemy(s));
      s.left--;
      s.next = Math.max(14, 70 - s.wave * 6) + Math.random() * 40;
    }

    s.mine = s.mine.filter((m) => {
      if (!fly(m)) return true;
      s.blasts.push({ x: m.x, y: m.y, r: 2, grow: true, mine: true });
      chip.softNote('C4', 0.12);
      return false;
    });

    const born: Rocket[] = [];
    s.enemies = s.enemies.filter((e) => {
      if (s.blasts.some((b) => b.mine && Math.hypot(b.x - e.x, b.y - e.y) < b.r)) {
        addScore(s, 25);
        s.blasts.push({ x: e.x, y: e.y, r: 2, grow: true, mine: true });
        chip.softNote('G5', 0.06);
        return false;
      }
      if (e.splitAt && e.y >= e.splitAt) {
        for (let k = 0; k < 2; k++) born.push(enemy(s, e.x, e.y));
        e.splitAt = 0;
      }
      if (!fly(e)) return true;
      s.blasts.push({ x: e.x, y: e.y, r: 2, grow: true, mine: false });
      const hit = CITIES.findIndex((x, i) => s.cities[i] && Math.abs(x - e.x) < 14);
      if (hit >= 0) s.cities[hit] = false;
      chip.play('back');
      return false;
    });
    s.enemies.push(...born);

    for (const b of s.blasts) {
      if (b.grow) {
        b.r += 1.2;
        if (b.r >= BLAST) b.grow = false;
      } else b.r -= 0.7;
    }
    s.blasts = s.blasts.filter((b) => b.r > 0);

    if (!s.cities.some(Boolean) && !s.blasts.length) {
      s.over = true;
      chip.play('error');
      setResult({ score: s.score, wave: s.wave, record: s.score > 0 && saveBest('missile', s.score, true) });
    } else if (!s.pause && !s.left && !s.enemies.length && !s.mine.length && !s.blasts.length) {
      // Wave cleared: standing cities and unused rockets pay, more from wave to wave.
      const mult = Math.min(1 + Math.floor((s.wave - 1) / 2), 6);
      s.bonus = (s.cities.filter(Boolean).length * 100 + s.ammo * 5) * mult;
      addScore(s, s.bonus);
      s.pause = 120;
      chip.play('coin');
    }
    setHud((h) => (h.score === s.score && h.ammo === s.ammo && h.wave === s.wave ? h : { score: s.score, ammo: s.ammo, wave: s.wave }));
  }, [onWin]);

  const draw = useCallback(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const t = themeColors(cv);
    const s = st.current;
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.beginPath();
    ctx.moveTo(BASE.x - 22, GROUND);
    ctx.lineTo(BASE.x - 10, BASE.y);
    ctx.lineTo(BASE.x + 10, BASE.y);
    ctx.lineTo(BASE.x + 22, GROUND);
    ctx.fill();
    CITIES.forEach((x, i) => {
      if (!s.cities[i]) {
        ctx.fillStyle = t.dim;
        ctx.fillRect(x - 10, GROUND - 3, 20, 3);
        return;
      }
      ctx.fillStyle = t.a2;
      ctx.fillRect(x - 10, GROUND - 8, 20, 8);
      ctx.fillRect(x - 6, GROUND - 14, 5, 6);
      ctx.fillRect(x + 2, GROUND - 12, 5, 4);
    });
    ctx.lineWidth = 1.5;
    for (const e of s.enemies) {
      ctx.strokeStyle = t.a1;
      ctx.beginPath();
      ctx.moveTo(e.sx, e.sy);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
      ctx.fillStyle = t.fg;
      ctx.fillRect(e.x - 1.5, e.y - 1.5, 3, 3);
    }
    for (const m of s.mine) {
      ctx.strokeStyle = t.ok;
      ctx.beginPath();
      ctx.moveTo(m.sx, m.sy);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();
      ctx.strokeStyle = t.fg;
      ctx.strokeRect(m.tx - 3, m.ty - 3, 6, 6);
    }
    for (const b of s.blasts) {
      ctx.fillStyle = Math.floor(b.r) % 4 < 2 ? t.a3 : b.mine ? t.fg : t.a1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = t.fg;
    for (let i = 0; i < s.ammo; i++) ctx.fillRect(BASE.x - 29 + (i % 15) * 4, H - 16 + Math.floor(i / 15) * 6, 2, 4);
    if (s.pause) {
      ctx.fillStyle = t.a3;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tr(`BONUS ${s.bonus}`, `BONUS ${s.bonus}`), W / 2, H / 2 - 10);
      ctx.fillText(tr(`WAVE ${s.wave + 1}`, `WELLE ${s.wave + 1}`), W / 2, H / 2 + 14);
    } else if (!s.over && s.wave === 1 && s.score === 0 && !s.mine.length && !s.blasts.length) {
      ctx.fillStyle = t.a3;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tr('TAP THE SKY', 'TIPP IN DEN HIMMEL'), W / 2, H / 2);
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

  const fire = (x: number, y: number) => {
    const s = st.current;
    if (s.over || s.pause || s.ammo <= 0) return chip.play('blip');
    const ty = Math.min(y, GROUND - 20);
    s.ammo--;
    s.mine.push({ sx: BASE.x, sy: BASE.y, x: BASE.x, y: BASE.y, tx: x, ty, speed: 7, splitAt: 0 });
    chip.softNote('E6', 0.03);
  };

  const onDown = (e: React.PointerEvent) => {
    const rect = canvas.current!.getBoundingClientRect();
    fire(((e.clientX - rect.left) / rect.width) * W, ((e.clientY - rect.top) / rect.height) * H);
  };

  const again = () => {
    chip.play('select');
    st.current = fresh();
    setHud({ score: 0, ammo: AMMO, wave: 1 });
    setResult(null);
  };

  return (
    <>
      <p className="mini-score">
        {tr('Score', 'Punkte')}: {hud.score.toLocaleString('en-US')} · {tr('Wave', 'Welle')} {hud.wave} · {tr('Rockets', 'Raketen')}: {hud.ammo}
      </p>
      <canvas
        ref={canvas}
        className="arcade-board"
        width={W}
        height={H}
        onPointerDown={onDown}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={tr('Sky: tap where a counter rocket should explode', 'Himmel: tippen, wo eine Abwehrrakete explodieren soll')}
      />
      {result && (
        <Done
          title={tr('THE END', 'DAS ENDE')}
          text={tr(`${result.score.toLocaleString('en-US')} points, wave ${result.wave}.`, `${result.score.toLocaleString('de-DE')} Punkte, Welle ${result.wave}.`)}
          record={result.record}
          onAgain={again}
          board={{ game: 'missile', score: result.score }}
        />
      )}
    </>
  );
};

export const missileBest = (n: number) => tr(`High score: ${n.toLocaleString('en-US')} points`, `Rekord: ${n.toLocaleString('de-DE')} Punkte`);
