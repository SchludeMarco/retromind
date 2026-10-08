import { useSyncExternalStore } from 'react';

// The music volume the visitor picked with the slider in the music player
// (MusicDock) or the gaming settings (Marco, 2026-10-08: "Der Sound ist
// wirklich sehr laut … Bau in den Player ein, dass man lauter und leiser
// machen kann"). It scales everything RetroMind can turn down itself: the
// gaming edition's metal intro and chiptune tracks, and Spotify's Premium
// browser player. The embedded Spotify player has no volume control at all;
// there only the device's own volume helps.

const KEY = 'retromind.music.volume';
// Starts at half: full volume was too loud on entering the hall.
const DEFAULT = 0.5;

const listeners = new Set<(v: number) => void>();
let volume = read();

function read(): number {
  try {
    const raw = localStorage.getItem(KEY);
    const v = Number(raw);
    return raw !== null && v >= 0 && v <= 1 ? v : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function getMusicVolume(): number {
  return volume;
}

export function setMusicVolume(v: number) {
  const next = Math.min(1, Math.max(0, v));
  if (next === volume) return;
  volume = next;
  try {
    localStorage.setItem(KEY, String(volume));
  } catch {
    /* not kept, still applies for this visit */
  }
  listeners.forEach((l) => l(volume));
}

/** Calls `listener` with every new volume; returns the unsubscribe function. */
export function onMusicVolume(listener: (v: number) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMusicVolume(): number {
  return useSyncExternalStore(onMusicVolume, getMusicVolume, getMusicVolume);
}
