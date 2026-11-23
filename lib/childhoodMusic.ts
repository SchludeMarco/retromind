import { useSyncExternalStore } from 'react';

// "Music of my childhood" (Marco, 2026-11-23: "Ich würde die Musik der
// Kindheit als optionalen togglebar einbauen"). Normally the music follows
// the destination date (lib/travelDate.ts). Switched on, it plays the decade
// you were a child in (about 8 years old, computeFocusDecade) and, signed in
// with Spotify, the hits of the years you were 6 to 19, whatever date the
// time machine shows; the room still follows the date. Kept under a
// retromind key, so it syncs to the other devices (lib/sync.ts).

const KEY = 'retromind.music.childhood';
const listeners = new Set<() => void>();
let on = read();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    const next = read();
    if (next === on) return;
    on = next;
    listeners.forEach((fn) => fn());
  });
}

export function setChildhoodMusic(next: boolean) {
  if (next === on) return;
  on = next;
  try {
    if (next) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    /* not kept, still applies for this visit */
  }
  listeners.forEach((fn) => fn());
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export function useChildhoodMusic(): boolean {
  return useSyncExternalStore(subscribe, () => on, () => false);
}
