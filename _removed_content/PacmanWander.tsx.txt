import React, { useEffect, useRef } from 'react';

// A small Pac-Man wanders slowly through the hall, underneath the buttons: he picks a random spot
// anywhere on screen (straight or diagonal), eats the row of dots leading
// there, and a ghost follows in his tracks. Drawn on one see-through canvas
// that taps go through (gaming.css .pac-wander). Off with reduced motion.
// A tap right on him calls `onCatch` (the "Waka Waka" easter egg).

const SIZE = 16; // Pac-Man's diameter in px
const SPEED = 38; // px per second
const DOT_GAP = 22;
const GHOST_LAG = 40; // px of path between Pac-Man and the ghost
const MARGIN = 24;
const CATCH_RADIUS = 22; // px around Pac-Man that count as a catch

type Pt = { x: number; y: number };

export const PacmanWander: React.FC<{ onCatch?: () => void }> = ({ onCatch }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const onCatchRef = useRef(onCatch);
  onCatchRef.current = onCatch;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Colours follow the chosen design (--a3 Pac-Man, --a1 ghost).
    const css = getComputedStyle(canvas);
    const pacColor = css.getPropertyValue('--a3').trim() || '#ffd23f';
    const ghostColor = css.getPropertyValue('--a1').trim() || '#ff3ea5';

    const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
    const randomSpot = (from: Pt): Pt => {
      // Somewhere else on screen, far enough away to make a proper trip.
      for (let i = 0; i < 20; i++) {
        const p = { x: rand(MARGIN, w - MARGIN), y: rand(MARGIN, h - MARGIN) };
        if (Math.hypot(p.x - from.x, p.y - from.y) > Math.min(w, h) * 0.4) return p;
      }
      return { x: rand(MARGIN, w - MARGIN), y: rand(MARGIN, h - MARGIN) };
    };

    let pos: Pt = { x: rand(MARGIN, w - MARGIN), y: rand(MARGIN, h - MARGIN) };
    let target = randomSpot(pos);
    let dots: Pt[] = [];
    const layDots = () => {
      const dist = Math.hypot(target.x - pos.x, target.y - pos.y);
      dots = [];
      for (let d = DOT_GAP; d < dist; d += DOT_GAP) {
        const t = d / dist;
        dots.push({ x: pos.x + (target.x - pos.x) * t, y: pos.y + (target.y - pos.y) * t });
      }
    };
    layDots();
    // Recent positions, newest last, so the ghost can walk the same path.
    const trail: Pt[] = [{ ...pos }];

    // The canvas lets taps through, so catches are checked on the window.
    const onTap = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - pos.x, e.clientY - pos.y) <= CATCH_RADIUS) onCatchRef.current?.();
    };
    window.addEventListener('pointerdown', onTap);

    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.hypot(dx, dy);
      const step = SPEED * dt;
      const angle = Math.atan2(dy, dx);
      if (dist <= step) {
        pos = { ...target };
        target = randomSpot(pos);
        layDots();
      } else {
        pos = { x: pos.x + (dx / dist) * step, y: pos.y + (dy / dist) * step };
      }
      dots = dots.filter((d) => Math.hypot(d.x - pos.x, d.y - pos.y) > SIZE / 2);
      trail.push({ ...pos });
      if (trail.length > 600) trail.shift();

      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = pacColor;
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ghost: the trail point GHOST_LAG px of path behind Pac-Man.
      let walked = 0;
      let ghost = trail[0];
      for (let i = trail.length - 1; i > 0; i--) {
        walked += Math.hypot(trail[i].x - trail[i - 1].x, trail[i].y - trail[i - 1].y);
        if (walked >= GHOST_LAG) {
          ghost = trail[i - 1];
          break;
        }
      }
      const r = SIZE / 2;
      ctx.fillStyle = ghostColor;
      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y - 1, r, Math.PI, 0);
      ctx.lineTo(ghost.x + r, ghost.y + r);
      // wavy hem: three little points along the bottom edge
      for (let i = 1; i <= 3; i++) {
        ctx.lineTo(ghost.x + r - (i * SIZE) / 3 + SIZE / 6, ghost.y + r - 3);
        ctx.lineTo(ghost.x + r - (i * SIZE) / 3, ghost.y + r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ghost.x - 3, ghost.y - 2, 2, 0, Math.PI * 2);
      ctx.arc(ghost.x + 3, ghost.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Pac-Man facing where he walks, mouth opening and closing.
      const mouth = (0.05 + 0.2 * Math.abs(Math.sin(now / 160))) * Math.PI;
      ctx.fillStyle = pacColor;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.arc(pos.x, pos.y, r, angle + mouth, angle - mouth + Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onTap);
    };
  }, []);

  return <canvas ref={ref} className="pac-wander" aria-hidden="true" />;
};
