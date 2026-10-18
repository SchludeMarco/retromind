import { useSyncExternalStore } from 'react';

// A color tint for the whole screen, from cool blue to warm orange (Marco,
// 2026-10-18: "Mir fehlt noch eine Farbeinstellung für die Farbe in Richtung
// Orange und Richtung Blau"). It works like the night light on a phone: one
// thin layer over everything, multiplied onto what is below, so every design
// of both apps (and the pictures and videos in them) shifts together. The
// value is -1 (blue) … 0 (as designed) … 1 (orange) under a retromind key,
// so it reaches the Gaming edition and the other devices (lib/sync.ts).

const KEY = 'retromind.color.tint';
const LAYER_ID = 'rm-color-tint';
// Full strength at the ends of the slider; in between it fades from nothing.
const WARM = [255, 172, 96];
const COOL = [168, 200, 255];

const listeners = new Set<() => void>();
let tint = read(readRaw());

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function read(raw: string | null): number {
  const v = Number(raw);
  return raw !== null && Number.isFinite(v) ? Math.min(1, Math.max(-1, v)) : 0;
}

function apply() {
  if (typeof document === 'undefined') return;
  let layer = document.getElementById(LAYER_ID);
  if (!tint) {
    layer?.remove();
    return;
  }
  if (!layer) {
    layer = document.createElement('div');
    layer.id = LAYER_ID;
    layer.setAttribute('aria-hidden', 'true');
    // Above everything, even dialogs, and never in the way of a tap.
    layer.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:2147483647;mix-blend-mode:multiply;';
    document.body.appendChild(layer);
  }
  const [r, g, b] = tint > 0 ? WARM : COOL;
  layer.style.background = `rgb(${r},${g},${b})`;
  layer.style.opacity = String(Math.abs(tint));
}

function emit() {
  apply();
  listeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  if (document.body) apply();
  else document.addEventListener('DOMContentLoaded', apply, { once: true });
  // Another tab of the same app moved the slider.
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    const next = read(e.newValue);
    if (next === tint) return;
    tint = next;
    emit();
  });
}

export function getColorTint(): number {
  return tint;
}

export function setColorTint(v: number) {
  const next = Math.round(Math.min(1, Math.max(-1, v)) * 100) / 100;
  if (next === tint) return;
  tint = next;
  try {
    localStorage.setItem(KEY, String(tint));
  } catch {
    /* not kept, still applies for this visit */
  }
  emit();
}

export function subscribeColorTint(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useColorTint(): number {
  return useSyncExternalStore(subscribeColorTint, getColorTint, () => 0);
}

/** The slider's track: blue on the left, untouched in the middle, orange on the right. */
export const TINT_TRACK = `linear-gradient(to right, rgb(${COOL}), #ffffff, rgb(${WARM}))`;
