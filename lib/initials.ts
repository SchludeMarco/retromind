import { useSyncExternalStore } from 'react';

// Your own three-character tag, like the initials on an old pinball or
// arcade high score table (Marco, 2026-10-17: "LIQ" or "MAR"). Both editions
// share it: it lives in this browser under one key, which lib/sync.ts keeps
// the same in both apps (different origins) and, with Google signed in, on
// every device.

const KEY = 'retromind.initials';
// Where the Gaming edition kept the last initials typed at a high score
// table before this existed; read once so nobody has to enter them again.
const OLD_GAMING_KEY = 'retromind.gaming.initials';

export const INITIALS_LENGTH = 3;
/** The characters a slot cycles through, as on the cabinets. */
export const INITIALS_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Upper case, letters and digits only, at most three. */
export function cleanInitials(value: string): string {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, INITIALS_LENGTH);
}

const listeners = new Set<(fromUser: boolean) => void>();
let current = readInitial();

function readInitial(): string {
  try {
    const stored = cleanInitials(localStorage.getItem(KEY) || '');
    if (stored.length === INITIALS_LENGTH) return stored;
    const old = cleanInitials(localStorage.getItem(OLD_GAMING_KEY) || '');
    if (old.length === INITIALS_LENGTH && old !== 'AAA') {
      localStorage.setItem(KEY, old);
      return old;
    }
  } catch {
    /* storage unavailable */
  }
  return '';
}

/** The tag, or '' while none is set. */
export function getInitials(): string {
  return current;
}

/**
 * Stores a new tag. `fromUser` is false for a value taken over from the
 * cloud, so it isn't sent straight back there.
 */
export function setInitials(value: string, fromUser = true) {
  const next = cleanInitials(value);
  if (next.length !== INITIALS_LENGTH || next === current) return;
  current = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* still applies for this visit */
  }
  listeners.forEach((fn) => fn(fromUser));
}

/** Called with `fromUser` whenever the tag changes. */
export function onInitialsChange(fn: (fromUser: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useInitials(): string {
  return useSyncExternalStore(onInitialsChange, getInitials, getInitials);
}
