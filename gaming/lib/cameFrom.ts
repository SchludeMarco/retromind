import { withMuteParam } from '../../lib/mute';
import { withGoogleParam } from '../../lib/googleLogin';

// Way back to the Zeitreise (Marco, 2026-10-13): whoever came over from the
// main RetroMind (signpost or settings) gets a visible "Back to RetroMind"
// button. The main app marks those links with ?from=zeitreise; the gaming
// edition notes that for the rest of the tab's visit (sessionStorage), so the
// button survives reloads and leaving/entering the club. The referrer serves
// as a fallback for links that lost the parameter.

const KEY = 'retromind.gaming.fromZeitreise';
const PARAM = 'from';
const VALUE = 'zeitreise';
const ZEITREISE_ORIGIN = 'https://retromind.vercel.app';

function referrerIsZeitreise(): boolean {
  try {
    if (!document.referrer) return false;
    const ref = new URL(document.referrer);
    if (ref.origin === ZEITREISE_ORIGIN) return !ref.pathname.startsWith('/gaming');
    // The main project also serves the edition at /gaming/ on its own origin.
    return ref.origin === window.location.origin && !ref.pathname.startsWith('/gaming') && !ref.pathname.startsWith('/admin');
  } catch {
    return false;
  }
}

function readInitial(): boolean {
  let came = false;
  try {
    came = sessionStorage.getItem(KEY) === '1';
  } catch {
    /* storage unavailable — fall back to this page load only */
  }
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get(PARAM) === VALUE) {
      came = true;
      url.searchParams.delete(PARAM);
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
  } catch {
    /* no URL support */
  }
  if (!came) came = referrerIsZeitreise();
  if (came) {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* still applies for this page load */
    }
  }
  return came;
}

const came = typeof window !== 'undefined' && readInitial();

/** Whether this visit started in the Zeitreise. */
export function cameFromZeitreise(): boolean {
  return came;
}

/**
 * Link back to the Zeitreise: the start page of this origin when the edition
 * runs at /gaming/ inside the main project, otherwise retromind.vercel.app
 * with the mute and Google choice carried along.
 */
export function zeitreiseHref(): string {
  try {
    if (window.location.pathname.startsWith('/gaming')) return '/';
  } catch {
    /* fall through */
  }
  return withGoogleParam(withMuteParam(`${ZEITREISE_ORIGIN}/`));
}
