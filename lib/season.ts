// The Christmas season (Marco, 2026-10-14: "Die Weihnachtszeit steht bald
// an! … gerne schon ab 1.11. Außerdem soll sich der Look der App
// entsprechend der Weihnachtszeit anpassen"). From November 1 to January 6
// the app wears its Christmas look (snow, a garland with lights) and Omas
// Kochbuch opens its Christmas bakery. In the settings it can be switched
// on early or off; the choice is one localStorage key, like the design.

import { useSyncExternalStore } from 'react';

export type XmasMode = 'auto' | 'on' | 'off';

const KEY = 'retromind.xmas';

/** November 1 to January 6 (Epiphany), in the visitor's own time zone. */
export function isChristmasTime(d = new Date()): boolean {
  const m = d.getMonth();
  return m === 10 || m === 11 || (m === 0 && d.getDate() <= 6);
}

/** Days until the next November 1 (0 while the season runs). */
export function daysUntilChristmasTime(d = new Date()): number {
  if (isChristmasTime(d)) return 0;
  const start = new Date(d.getFullYear(), 10, 1);
  const today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((start.getTime() - today.getTime()) / 86400000);
}

function readMode(): XmasMode {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'on' || v === 'off') return v;
  } catch {
    /* storage unavailable — automatic */
  }
  return 'auto';
}

let mode: XmasMode = readMode();
const listeners = new Set<() => void>();

function active(): boolean {
  return mode === 'on' || (mode === 'auto' && isChristmasTime());
}

function apply() {
  try {
    const root = document.documentElement;
    if (active()) root.dataset.season = 'xmas';
    else delete root.dataset.season;
  } catch {
    /* no DOM */
  }
}
apply();

export function getXmasMode(): XmasMode {
  return mode;
}

export function setXmasMode(next: XmasMode) {
  mode = next;
  try {
    if (next === 'auto') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
  } catch {
    /* not saved, still applies for this visit */
  }
  apply();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** The chosen mode (auto / on / off), re-rendering on change. */
export function useXmasMode(): XmasMode {
  return useSyncExternalStore(subscribe, () => mode, () => 'auto');
}

/** Whether the Christmas look and bakery are on right now. */
export function useChristmas(): boolean {
  return useSyncExternalStore(subscribe, active, () => false);
}

// Marco, 2026-10-14: "In den Einstellungen sollte außerdem ermöglicht werden
// das Weihnachts Zeug abzustellen". "Christmas look: off" turns everything
// off; this switch silences only the jingles and "Ho ho ho".
const SOUND_KEY = 'retromind.xmas.sounds';

function readSounds(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

let sounds = readSounds();

/** Whether the Christmas jingles may play (when the look is on and the sound isn't muted). */
export function xmasSoundsOn(): boolean {
  return sounds;
}

export function setXmasSounds(on: boolean) {
  sounds = on;
  try {
    if (on) localStorage.removeItem(SOUND_KEY);
    else localStorage.setItem(SOUND_KEY, 'off');
  } catch {
    /* not saved, still applies for this visit */
  }
  listeners.forEach((l) => l());
}

export function useXmasSounds(): boolean {
  return useSyncExternalStore(subscribe, () => sounds, () => true);
}
