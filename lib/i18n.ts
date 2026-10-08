// The app's display language (both editions). American English is the
// default; German stays selectable in the settings. Like the design
// (lib/theme.ts) the choice is one localStorage key, but it is read once at
// startup: switching languages reloads the page, so every text in the app,
// including module-level data such as the theme list, can simply call tr()
// without React state or re-render plumbing.
//
// Usage: tr('Settings', 'Einstellungen'), English first, German second.
// Works for any value, not just strings: tr(['a', 'b'], ['c', 'd']).

export type Lang = 'en' | 'de';

export const LANGUAGES: { id: Lang; name: string }[] = [
  { id: 'en', name: 'English (US)' },
  { id: 'de', name: 'Deutsch' },
];

const KEY = 'retromind.lang';
const DEFAULT: Lang = 'en';

function readInitial(): Lang {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'en' || stored === 'de') return stored;
  } catch {
    /* storage unavailable — default language */
  }
  return DEFAULT;
}

/** The language for this page load. */
export const LANG: Lang = readInitial();
export const isGerman = LANG === 'de';
/** BCP 47 locale for dates and numbers (toLocaleString etc.). */
export const LOCALE = isGerman ? 'de-DE' : 'en-US';

try {
  document.documentElement.lang = isGerman ? 'de' : 'en-US';
} catch {
  /* no DOM */
}

/** Picks the English or German variant for the current language. */
export function tr<T>(en: T, de: T): T {
  return isGerman ? de : en;
}

export function getLang(): Lang {
  return LANG;
}

/** Stores the choice and reloads, so every text switches at once. */
export function setLang(lang: Lang) {
  if (lang === LANG) return;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* storage unavailable — cannot persist, so nothing changes */
    return;
  }
  window.location.reload();
}
