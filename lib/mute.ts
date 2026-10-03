import { useSyncExternalStore } from 'react';

// One app-wide "sound off" switch shared by every RetroMind module (the
// journey, the Gaming edition and whatever comes next): a single
// localStorage key, so a module only has to read isMuted() / useMuted()
// before making noise. Modules served from another origin (e.g.
// retromind-gaming.vercel.app) don't share localStorage, so links between
// them carry the setting along as ?mute=1 / ?mute=0 (see withMuteParam).

const KEY = 'retromind.muted';
const PARAM = 'mute';

const listeners = new Set<() => void>();
let muted = readInitial();

function readInitial(): boolean {
  let stored = false;
  try {
    stored = localStorage.getItem(KEY) === '1';
  } catch {
    /* storage unavailable — default to sound on */
  }
  try {
    const url = new URL(window.location.href);
    const param = url.searchParams.get(PARAM);
    if (param === '1' || param === '0') {
      stored = param === '1';
      persist(stored);
      url.searchParams.delete(PARAM);
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
  } catch {
    /* no window/URL support — keep the stored value */
  }
  return stored;
}

function persist(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* storage unavailable — still applies for this visit */
  }
}

function emit() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  // Another tab of the same origin flipped the switch.
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    const next = e.newValue === '1';
    if (next === muted) return;
    muted = next;
    emit();
  });
}

/** Whether the visitor switched all sound off. */
export function isMuted(): boolean {
  return muted;
}

/** True only before this visitor ever chose; lets a module adopt its own older mute setting once. */
export function hasMuteChoice(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return true;
  }
}

export function setMuted(on: boolean) {
  if (on === muted) return;
  muted = on;
  persist(on);
  emit();
}

export function toggleMuted() {
  setMuted(!muted);
}

/** Calls fn whenever the switch changes; returns the unsubscribe function. */
export function subscribeMuted(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** React binding: re-renders when the switch changes. */
export function useMuted(): boolean {
  return useSyncExternalStore(subscribeMuted, isMuted, () => false);
}

/**
 * For links to another RetroMind module: on a different origin the current
 * mute setting is appended so it carries over; same-origin links are left
 * as they are (they already share the setting).
 */
export function withMuteParam(href: string): string {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin) return href;
    url.searchParams.set(PARAM, muted ? '1' : '0');
    return url.toString();
  } catch {
    return href;
  }
}
