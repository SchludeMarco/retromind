import { useSyncExternalStore } from 'react';

// The Grabbelkiste (Marco, 2026-10-13): a box where sayings and things from
// the ticker on the start page end up when their floppy disk is tapped
// (components/RetroTicker.tsx). It holds ticker ids (lib/tickerItems.ts),
// newest first, in one localStorage key, so it stays on this device.

const KEY = 'retromind.grabbelkiste';

const listeners = new Set<() => void>();
let ids: string[] = read();

function read(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function write(next: string[]) {
  ids = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — still holds for this visit */
  }
  listeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  // Another tab put something in the box.
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    ids = read();
    listeners.forEach((fn) => fn());
  });
}

export function getGrabbelkiste(): string[] {
  return ids;
}

export function isInGrabbelkiste(id: string): boolean {
  return ids.includes(id);
}

export function addToGrabbelkiste(id: string) {
  if (!ids.includes(id)) write([id, ...ids]);
}

export function removeFromGrabbelkiste(id: string) {
  if (ids.includes(id)) write(ids.filter((i) => i !== id));
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** React binding: the ids in the box, re-rendering when it changes. */
export function useGrabbelkiste(): string[] {
  return useSyncExternalStore(subscribe, getGrabbelkiste, () => []);
}
