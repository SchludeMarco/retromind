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

// Entries the AI added to the ticker exist only on the device that loaded
// them, and fun facts from the gaming hall (gaming/components/HallTicker.tsx)
// aren't known to the Zeitreise, so the box keeps their words itself (same
// sync as the box). One box for both apps.
const ITEMS_KEY = 'retromind.grabbelkiste.items';

export interface KeptItem {
  id: string;
  decade: string;
  kind: 'saying' | 'thing' | 'year' | 'game';
  text: string;
  info: string;
}

function readItems(): Record<string, KeptItem> {
  try {
    const parsed = JSON.parse(localStorage.getItem(ITEMS_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** The stored words of an entry in the box, for ones the ticker can't look up itself. */
export function keptItem(id: string): KeptItem | undefined {
  return readItems()[id];
}

function writeItems(next: Record<string, KeptItem>) {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

/** Puts an entry in the box; `item` keeps its words when it came from the AI. */
export function addToGrabbelkiste(id: string, item?: KeptItem) {
  if (item) writeItems({ ...readItems(), [id]: item });
  if (!ids.includes(id)) write([id, ...ids]);
}

export function removeFromGrabbelkiste(id: string) {
  const items = readItems();
  if (items[id]) {
    delete items[id];
    writeItems(items);
  }
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
