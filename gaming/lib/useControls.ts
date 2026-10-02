import { useEffect, useRef } from 'react';

// Controller-style input for the whole edition:
// - Arrow keys / D-pad move focus spatially between elements marked `data-nav`
//   (like a cursor on a console menu), A/Enter activates, B/Escape goes back.
// - A connected gamepad (Gamepad API) drives the same moves.
// - The Konami code fires `onKonami`.

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

type Dir = 'up' | 'down' | 'left' | 'right';

function isTyping(el: Element | null) {
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable);
}

/** Picks the nearest `[data-nav]` element in the given direction from the focused one. */
export function moveFocus(dir: Dir): boolean {
  const scope = (document.querySelector('[role="dialog"]') as HTMLElement | null) ?? document.body;
  const items = Array.from(scope.querySelectorAll<HTMLElement>('[data-nav]')).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('disabled')
  );
  if (!items.length) return false;
  const current = document.activeElement as HTMLElement | null;
  if (!current || !items.includes(current)) {
    items[0].focus();
    return true;
  }
  const a = current.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const el of items) {
    if (el === current) continue;
    const b = el.getBoundingClientRect();
    const dx = b.left + b.width / 2 - ax;
    const dy = b.top + b.height / 2 - ay;
    const primary = dir === 'left' ? -dx : dir === 'right' ? dx : dir === 'up' ? -dy : dy;
    if (primary <= 4) continue;
    const secondary = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
    const score = primary + secondary * 2.5;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  if (best) {
    best.focus();
    best.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return true;
  }
  return false;
}

interface Options {
  onMove?: () => void;
  onBack?: () => void;
  onStart?: () => void;
  onKonami?: () => void;
}

export function useControls(opts: Options) {
  const ref = useRef(opts);
  ref.current = opts;

  useEffect(() => {
    const progress: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress.push(key);
      if (progress.length > KONAMI.length) progress.shift();
      if (progress.join() === KONAMI.join()) {
        progress.length = 0;
        ref.current.onKonami?.();
      }
      if (isTyping(document.activeElement)) return;
      const dir = ({ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' } as const)[
        e.key as 'ArrowUp'
      ];
      if (dir && moveFocus(dir)) {
        e.preventDefault();
        ref.current.onMove?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Gamepad polling only runs while a pad is connected.
  useEffect(() => {
    let raf = 0;
    let prev: boolean[] = [];
    let lastAxisMove = 0;
    const poll = () => {
      const pad = navigator.getGamepads?.().find((p) => p);
      if (!pad) {
        raf = 0;
        return;
      }
      const pressed = pad.buttons.map((b) => b.pressed);
      const edge = (i: number) => pressed[i] && !prev[i];
      const now = performance.now();
      // Standard mapping: 12-15 D-pad, 0 = A, 1 = B, 9 = Start.
      const axisDir: Dir | null =
        pad.axes[1] < -0.6 ? 'up' : pad.axes[1] > 0.6 ? 'down' : pad.axes[0] < -0.6 ? 'left' : pad.axes[0] > 0.6 ? 'right' : null;
      const dir: Dir | null = edge(12) ? 'up' : edge(13) ? 'down' : edge(14) ? 'left' : edge(15) ? 'right' : null;
      if (dir || (axisDir && now - lastAxisMove > 220)) {
        if (!dir) lastAxisMove = now;
        if (moveFocus((dir || axisDir)!)) ref.current.onMove?.();
      }
      if (edge(0)) (document.activeElement as HTMLElement | null)?.click();
      if (edge(1)) ref.current.onBack?.();
      if (edge(9)) ref.current.onStart?.();
      prev = pressed;
      raf = requestAnimationFrame(poll);
    };
    const onConnect = () => {
      if (!raf) raf = requestAnimationFrame(poll);
    };
    window.addEventListener('gamepadconnected', onConnect);
    onConnect();
    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      cancelAnimationFrame(raf);
    };
  }, []);
}
