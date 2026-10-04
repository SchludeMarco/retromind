import { useSyncExternalStore } from 'react';

// The app's selectable designs ("Design" in the settings). A design is just a
// set of colour tokens: index.css redefines the --color-retro-* variables
// under html[data-theme="…"], so every component re-tints without changes.
// "klassisch" (the vintage-paper look) is the default and has no overrides.
// Like the mute switch (lib/mute.ts) the choice is one localStorage key.
//
// To add a design: add it to THEMES and give it a [data-theme] block in
// index.css.

export const THEMES = [
  {
    id: 'klassisch',
    name: 'Klassisch',
    description: 'Vergilbtes Papier, Tinte und Bernstein.',
    swatches: ['#f4e4bc', '#2c1810', '#d97706'],
    browserColor: '#f4e4bc',
  },
  {
    id: 'nachtschicht',
    name: 'Nachtschicht',
    description: 'Dunkel wie ein Wohnzimmer um Mitternacht, mit warmem Röhrenglühen.',
    swatches: ['#1a120c', '#f3e3c3', '#f59e0b'],
    browserColor: '#1a120c',
  },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

const KEY = 'retromind.theme';
const DEFAULT: ThemeId = 'klassisch';

const listeners = new Set<() => void>();
let current: ThemeId = readInitial();
apply(current);

function isThemeId(v: unknown): v is ThemeId {
  return THEMES.some((t) => t.id === v);
}

function readInitial(): ThemeId {
  try {
    const stored = localStorage.getItem(KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    /* storage unavailable — default design */
  }
  return DEFAULT;
}

function apply(id: ThemeId) {
  try {
    const root = document.documentElement;
    if (id === DEFAULT) delete root.dataset.theme;
    else root.dataset.theme = id;
    const color = THEMES.find((t) => t.id === id)?.browserColor;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && color) meta.setAttribute('content', color);
  } catch {
    /* no DOM — nothing to tint */
  }
}

function emit() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  // Another tab of the same origin picked a design.
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    const next = isThemeId(e.newValue) ? e.newValue : DEFAULT;
    if (next === current) return;
    current = next;
    apply(current);
    emit();
  });
}

export function getTheme(): ThemeId {
  return current;
}

export function setTheme(id: ThemeId) {
  if (id === current) return;
  current = id;
  apply(id);
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* storage unavailable — still applies for this visit */
  }
  emit();
}

export function subscribeTheme(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** React binding: re-renders when the design changes. */
export function useTheme(): ThemeId {
  return useSyncExternalStore(subscribeTheme, getTheme, () => DEFAULT);
}
