// Whether the visitor chose to sign in with Google, shared by every RetroMind
// module (the journey, the Gaming edition and whatever comes next). Google is
// optional: only once someone signed in on purpose does a module try a silent
// re-login on the next open; nobody else ever sees a Google popup unasked.
// Like the mute switch (lib/mute.ts) it is a single localStorage key, and
// links to a module on another origin carry it along as ?google=1 / ?google=0
// (see withGoogleParam).

const KEY = 'retromind.google';
const PARAM = 'google';
/** The Gaming edition's own opt-in from before this switch existed. */
const LEGACY_GAMING_KEY = 'retromind.gaming.cloud';

let optedIn = readInitial();

function readInitial(): boolean {
  let stored = false;
  try {
    const value = localStorage.getItem(KEY);
    if (value !== null) stored = value === '1';
    else if (localStorage.getItem(LEGACY_GAMING_KEY) === '1') {
      stored = true;
      persist(true);
    }
    localStorage.removeItem(LEGACY_GAMING_KEY);
  } catch {
    /* storage unavailable — default to signed out */
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

/** True once the visitor signed in with Google in any module (until they sign out). */
export function hasGoogleOptIn(): boolean {
  return optedIn;
}

export function setGoogleOptIn(on: boolean) {
  optedIn = on;
  persist(on);
}

/**
 * For links to another RetroMind module: on a different origin the Google
 * choice is appended so the other module signs in (or stays out) as well;
 * same-origin links are left as they are (they already share it).
 */
export function withGoogleParam(href: string): string {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin) return href;
    url.searchParams.set(PARAM, optedIn ? '1' : '0');
    return url.toString();
  } catch {
    return href;
  }
}
