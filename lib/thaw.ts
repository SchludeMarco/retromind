import { isMuted } from './mute';
import { sharedAudioContext } from './clockSounds';

// Arriving from the time machine, the Stube is frozen at first (Marco,
// 2026-11-25: "Wenn die Stube erscheint soll es aussehen, wie wenn alles
// eingefroren wäre, aber das eingefrorene taut langsam wieder auf"): a cold
// blue frost with ice crystals lies over the whole screen, everything under
// it stands still (html.rm-frozen pauses the app's animations), then the ice
// thaws from the middle outwards with a quiet crackle, a few drops run down
// the glass, and life comes back (.rm-thaw-* in index.css). Purely
// decoration: it never takes a tap. Not shown without motion.
// Built straight into the page instead of as a React component, so it runs
// exactly once per arrival whatever the app re-renders meanwhile.

const FROZEN_MS = 1500;
const THAW_MS = 5000;

// Where the drops run down, in % from the left, with their delays and length.
const DROPS = [
  { x: 7, d: 0.2, h: 38 },
  { x: 18, d: 1.1, h: 26 },
  { x: 81, d: 0.5, h: 34 },
  { x: 93, d: 1.6, h: 22 },
  { x: 64, d: 2.1, h: 18 },
  { x: 33, d: 2.5, h: 16 },
];

/** A quiet crackle of ice breaking up: short bursts of filtered noise. */
function crackle() {
  if (isMuted()) return;
  const c = sharedAudioContext();
  if (!c) return;
  c.resume().catch(() => {});
  const len = Math.floor(c.sampleRate * 0.05);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const t0 = c.currentTime;
  for (let i = 0; i < 9; i++) {
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 2500 + Math.random() * 3500;
    const g = c.createGain();
    g.gain.value = 0.05 + Math.random() * 0.07;
    src.connect(f).connect(g).connect(c.destination);
    src.start(t0 + i * 0.09 + Math.random() * 0.12);
  }
}

let running: HTMLElement | null = null;

/** Freezes the screen and lets it thaw again. */
export function startThaw() {
  if (typeof document === 'undefined' || running) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  const el = document.createElement('div');
  el.className = 'rm-thaw is-frozen';
  el.setAttribute('aria-hidden', 'true');
  el.style.setProperty('--thaw-ms', `${THAW_MS}ms`);
  for (const c of ['rm-thaw-chill', 'rm-thaw-frost', 'rm-thaw-crystals']) {
    const layer = document.createElement('div');
    layer.className = c;
    el.appendChild(layer);
  }
  document.body.appendChild(el);
  running = el;
  root.classList.add('rm-frozen');
  window.setTimeout(() => {
    root.classList.remove('rm-frozen');
    el.className = 'rm-thaw is-thaw';
    for (const p of DROPS) {
      const drop = document.createElement('span');
      drop.className = 'rm-thaw-drop';
      drop.style.left = `${p.x}%`;
      drop.style.animationDelay = `${p.d}s`;
      drop.style.setProperty('--fall', `${p.h}vh`);
      el.appendChild(drop);
    }
    crackle();
  }, FROZEN_MS);
  window.setTimeout(() => {
    el.remove();
    running = null;
  }, FROZEN_MS + THAW_MS);
}
