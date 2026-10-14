import { playTap } from './uiSounds';

// The Zeitreise answers every touch (Marco, 2026-10-14: "Es passiert
// wirklich nichts die meiste Zeit … es fehlt gänzlich an Responsivität").
// One layer for the whole app, installed once from App.tsx, so every button,
// card and link reacts the same way in all three designs without each
// component wiring it up:
//
// - Tap: a soft "tock" (lib/uiSounds), a short buzz where phones can, and a
//   ring of light spreading from the finger. On touch screens it waits for
//   the finger to lift without moving, so scrolling over a card stays quiet.
// - Reveal: cards and sections drift up into place as they scroll into view,
//   the ones already on screen one after another.
// - Idle: after a while without a touch the page's "next step" button starts
//   to breathe, so something always invites the next move.
// - Celebrate: a small burst of stars and hearts where a memory was saved.
//
// Elements (or their parents) with data-quiet make no tap sound (they have
// their own, like the time machine's start button); data-no-reveal keeps an
// area out of the reveal. Under prefers-reduced-motion only the sound and
// a calm colour flash remain.

const TAPPABLE =
  'button, a[href], [role="button"], [role="tab"], [role="radio"], [role="switch"], [role="checkbox"], [role="menuitem"], summary, label, select, input[type="checkbox"], input[type="radio"], .rm-tap';
const REVEAL =
  '.retro-card, .rm-stop-header, .rm-phase-nav, .rm-reveal, section, article, [class*="grid"] > button, [class*="grid"] > a, [class*="grid"] > div, ul > li';
const IDLE_MS = 14000;
const MOVE_TOLERANCE = 12;
const MAX_STAGGER = 8;

let installed = false;

const reducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

function tappable(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest<HTMLElement>(TAPPABLE);
  if (!el) return null;
  if ((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') return null;
  // Text fields and sliders aren't buttons; typing makes no taps.
  if (el.matches('label') && el.querySelector('input[type="text"], input[type="range"], textarea')) return null;
  return el;
}

function ripple(x: number, y: number, el: HTMLElement) {
  const ring = document.createElement('span');
  ring.className = reducedMotion() ? 'rm-ripple is-calm' : 'rm-ripple';
  const rect = el.getBoundingClientRect();
  // A ring as big as the thing tapped (within limits), so a card gets a big
  // soft wave and an icon button a small crisp one.
  const size = Math.max(36, Math.min(220, Math.max(rect.width, rect.height) * 0.9));
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.width = ring.style.height = `${size}px`;
  ring.addEventListener('animationend', () => ring.remove());
  document.body.appendChild(ring);
  window.setTimeout(() => ring.remove(), 1000);
}

function feel() {
  try {
    navigator.vibrate?.(6);
  } catch {
    /* not supported */
  }
}

function respond(el: HTMLElement, x: number, y: number, touch: boolean) {
  if (!el.closest('[data-quiet]')) playTap(true);
  if (touch) feel();
  ripple(x, y, el);
  // Spring back: a short "boing" after the press (index.css .rm-sprung).
  if (!reducedMotion() && (el.classList.contains('rm-sprung') || getComputedStyle(el).animationName === 'none')) {
    el.classList.remove('rm-sprung');
    void el.offsetWidth;
    el.classList.add('rm-sprung');
    window.setTimeout(() => el.classList.remove('rm-sprung'), 450);
  }
}

function installTaps() {
  let down: { el: HTMLElement; x: number; y: number; at: number } | null = null;
  document.addEventListener(
    'pointerdown',
    (e) => {
      const el = tappable(e.target);
      if (!el) {
        down = null;
        return;
      }
      if (e.pointerType === 'mouse') {
        // A mouse doesn't scroll by dragging: answer at once.
        if (e.button === 0) respond(el, e.clientX, e.clientY, false);
        down = null;
        return;
      }
      down = { el, x: e.clientX, y: e.clientY, at: performance.now() };
    },
    { capture: true, passive: true }
  );
  document.addEventListener(
    'pointerup',
    (e) => {
      if (!down || e.pointerType === 'mouse') return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (moved < MOVE_TOLERANCE && performance.now() - down.at < 900) respond(down.el, e.clientX, e.clientY, true);
      down = null;
    },
    { capture: true, passive: true }
  );
  document.addEventListener('pointercancel', () => (down = null), { capture: true, passive: true });
  // iPhones only show :active presses when the page listens for touches.
  document.addEventListener('touchstart', () => {}, { passive: true });
  // Keyboard: Enter / Space on a button sounds like a tap too.
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = tappable(e.target);
      if (el && !el.closest('[data-quiet]')) playTap(true);
    },
    { capture: true }
  );
}

function installReveal() {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      let i = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        el.style.setProperty('--rm-rv-delay', `${Math.min(i++, MAX_STAGGER) * 70}ms`);
        el.classList.add('rm-rv-in');
        el.classList.remove('rm-rv');
        const done = () => {
          el.classList.remove('rm-rv-in');
          el.style.removeProperty('--rm-rv-delay');
        };
        el.addEventListener('animationend', done, { once: true });
        window.setTimeout(done, 1600);
      });
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }
  );

  const seen = new WeakSet<Element>();
  const scan = (root: ParentNode) => {
    if (reducedMotion()) return;
    root.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (el.closest('[data-no-reveal], .rm-fixed, [role="dialog"], .rm-modal')) return;
      // Something nested in an element that reveals itself already moves with it.
      if (el.parentElement?.closest('.rm-rv, .rm-rv-in')) return;
      const style = getComputedStyle(el);
      if (style.position === 'fixed' || style.position === 'sticky') return;
      if (style.animationName && style.animationName !== 'none') return;
      if (style.display === 'contents' || el.offsetHeight === 0) return;
      el.classList.add('rm-rv');
      io.observe(el);
    });
  };

  let queued = false;
  const queueScan = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const root = document.getElementById('rm-stage');
      if (root) scan(root);
    });
  };
  new MutationObserver(queueScan).observe(document.body, { childList: true, subtree: true });
  queueScan();
}

function installIdle() {
  let timer = 0;
  const root = document.documentElement;
  const wake = () => {
    if (root.classList.contains('rm-idle')) root.classList.remove('rm-idle');
    window.clearTimeout(timer);
    timer = window.setTimeout(() => root.classList.add('rm-idle'), IDLE_MS);
  };
  ['pointerdown', 'keydown', 'scroll', 'wheel'].forEach((type) =>
    window.addEventListener(type, wake, { passive: true, capture: true })
  );
  wake();
}

let lastPoint: { x: number; y: number } | null = null;

/** A little burst of stars and hearts at the last tap (or the middle of the screen). */
export function celebrate(point = lastPoint) {
  if (typeof document === 'undefined' || reducedMotion()) return;
  const x = point?.x ?? window.innerWidth / 2;
  const y = point?.y ?? window.innerHeight / 2;
  const burst = document.createElement('div');
  burst.className = 'rm-burst';
  burst.setAttribute('aria-hidden', 'true');
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  const shapes = ['★', '♥', '✦', '★', '♥', '✧'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span');
    s.textContent = shapes[i % shapes.length];
    const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 50 + Math.random() * 60;
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(angle) * dist - 30}px`);
    s.style.setProperty('--rot', `${Math.round(Math.random() * 240 - 120)}deg`);
    s.style.animationDelay = `${Math.random() * 60}ms`;
    s.style.fontSize = `${12 + Math.random() * 10}px`;
    burst.appendChild(s);
  }
  document.body.appendChild(burst);
  window.setTimeout(() => burst.remove(), 1300);
}

/** Installs the tap, reveal and idle layer once for the whole page. */
export function installMicroFx() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener(
    'pointerdown',
    (e) => {
      lastPoint = { x: e.clientX, y: e.clientY };
    },
    { capture: true, passive: true }
  );
  installTaps();
  installReveal();
  installIdle();
}
