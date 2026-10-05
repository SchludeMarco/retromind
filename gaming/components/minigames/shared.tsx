import React, { useEffect, useRef } from 'react';

// Bits every mini game in the Chill-Ecke shares: best results on this device,
// the "done" panel and keyboard handling that wins over the hub's arrow-key
// focus navigation while a game runs.

export type MiniGameId = 'memory' | 'puzzle' | 'senso' | 'sudoku' | 'blocks' | 'pinball';

const KEY = 'retromind.gaming.mini.v1';

export type Bests = Partial<Record<MiniGameId, number>>;

export function loadBests(): Bests {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') ?? {};
  } catch {
    return {};
  }
}

/** Saves a result if it beats the old one; returns true for a new record. */
export function saveBest(id: MiniGameId, value: number, higherIsBetter: boolean): boolean {
  const bests = loadBests();
  const old = bests[id];
  const better = old === undefined || (higherIsBetter ? value > old : value < old);
  if (!better) return false;
  bests[id] = value;
  try {
    localStorage.setItem(KEY, JSON.stringify(bests));
  } catch {
    /* storage unavailable — the record only lives for this visit */
  }
  return true;
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const Done: React.FC<{ text: string; record: boolean; onAgain: () => void; title?: string }> = ({
  text,
  record,
  onAgain,
  title = 'GESCHAFFT!',
}) => (
  <div className="mini-done" role="status">
    <p className="pixel-font">{record ? '★ NEUER REKORD! ★' : title}</p>
    <p>{text}</p>
    <button className="px-btn big" onClick={onAgain} data-nav autoFocus>
      NOCHMAL
    </button>
  </div>
);

/**
 * Game keys (arrows, space …). Listens in the capture phase and stops the
 * event when the handler takes it, so the hub's arrow-key focus navigation
 * (useControls) does not move the focus away while playing.
 */
export function useGameKeys(onKey: (e: KeyboardEvent, down: boolean) => boolean) {
  const ref = useRef(onKey);
  ref.current = onKey;
  useEffect(() => {
    const handle = (down: boolean) => (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      if (ref.current(e, down)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onDown = handle(true);
    const onUp = handle(false);
    window.addEventListener('keydown', onDown, true);
    window.addEventListener('keyup', onUp, true);
    return () => {
      window.removeEventListener('keydown', onDown, true);
      window.removeEventListener('keyup', onUp, true);
    };
  }, []);
}

/** The current palette's colours, for games drawn on a canvas. */
export function themeColors(el: Element | null) {
  const css = el ? getComputedStyle(el) : null;
  const v = (name: string, fallback: string) => css?.getPropertyValue(name).trim() || fallback;
  return {
    bg: v('--bg', '#07071a'),
    bg2: v('--bg2', '#10102e'),
    panel: v('--panel', '#14143a'),
    fg: v('--fg', '#e9e9ff'),
    dim: v('--dim', '#9a9ac8'),
    a1: v('--a1', '#ff3ea5'),
    a2: v('--a2', '#29d4ff'),
    a3: v('--a3', '#ffd23f'),
    ok: v('--ok', '#3dff7a'),
  };
}
