import { GoogleUser } from '../types';
import { fetchGoogleProfile, forgetKeptGoogleSignIn, refreshKeptGoogleToken, type GoogleToken } from './googleAuth';
import { addHandoffPart, fromB64url, handoffFragment, takeHandoff, toB64url } from './handoff';

// Whether the visitor chose to sign in with Google, shared by every RetroMind
// module (the journey, the Gaming edition and whatever comes next). Google is
// optional and never pops up unasked: a module opens signed in while the last
// sign-in's short-lived token is still valid (stored below) or while the
// server keeps the sign-in for this device (api/_googleKeep.js, renewed
// without a popup by ensureGoogleSession); otherwise it waits for a tap.
// Like the mute switch (lib/mute.ts) it is a single localStorage key, and
// links to a module on another origin carry it along as ?google=1 / ?google=0
// plus, while signed in, the session itself in the #fragment (fragments never
// reach a server, see lib/handoff.ts) and the guest pass of the door (see
// withGoogleParam).

const KEY = 'retromind.google';
const SESSION_KEY = 'retromind.google.session';
const PARAM = 'google';
const HASH = 'rm_google';
/** Both domains of RetroMind; links between them go through the guest handoff (api/admin.js). */
const ORIGINS = ['https://retromind.vercel.app', 'https://retromind-gaming.vercel.app'];
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
      // Signed out in the other app: this domain's kept sign-in goes too.
      if (!stored) forgetKeptGoogleSignIn();
      url.searchParams.delete(PARAM);
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
    const handed = takeHandoff(HASH);
    if (handed) {
      const session = JSON.parse(fromB64url(handed)) as GoogleSession;
      if (session?.token?.accessToken && session.user && session.token.expiresAt - Date.now() > 60_000) {
        stored = true;
        persist(true);
        saveGoogleSession(session);
      }
    }
  } catch {
    /* no window/URL support or a garbled hand-over — keep the stored value */
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

addHandoffPart(HASH, () => {
  const session = loadGoogleSession();
  return session ? toB64url(JSON.stringify(session)) : null;
});

/** True once the visitor signed in with Google in any module (until they sign out). */
export function hasGoogleOptIn(): boolean {
  return optedIn;
}

/** Signed in right now, or able to renew the sign-in without a tap. */
export function googleSessionLikely(): boolean {
  return !!loadGoogleSession() || (optedIn && !nothingKept);
}

export interface GoogleSession {
  token: GoogleToken;
  user: GoogleUser;
}

/**
 * The current sign-in, so a reload or another module on this origin starts
 * signed in without asking Google again. Google tokens expire after an hour
 * and only reach RetroMind's private Drive folder; an expired one doesn't
 * count (ensureGoogleSession renews it when the sign-in is kept).
 */
export function loadGoogleSession(): GoogleSession | null {
  if (!optedIn) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as GoogleSession;
    if (session?.token?.accessToken && session.user && session.token.expiresAt - Date.now() > 60_000) return session;
  } catch {
    /* storage unavailable or garbled — start signed out */
  }
  return null;
}

/** Who signed in last on this origin, even after the token ran out (for renewing it). */
function storedGoogleUser(): GoogleUser | null {
  try {
    return (JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as GoogleSession | null)?.user ?? null;
  } catch {
    return null;
  }
}

let renewing: Promise<GoogleSession | null> | null = null;
/** Nothing kept for this device (or the server can't keep it): don't ask again until the next sign-in. */
let nothingKept = false;

/**
 * The current sign-in, renewed from the kept sign-in of this device when its
 * hour is up (no popup). null when signed out or nothing is kept here.
 */
export function ensureGoogleSession(): Promise<GoogleSession | null> {
  const session = loadGoogleSession();
  if (session || !optedIn || nothingKept) return Promise.resolve(session);
  renewing ??= (async () => {
    const token = await refreshKeptGoogleToken();
    if (!token) nothingKept = true;
    if (!token || !optedIn) return null;
    const user = storedGoogleUser() ?? (await fetchGoogleProfile(token.accessToken).catch(() => null));
    if (!user || !optedIn) return null;
    const fresh = { token, user };
    saveGoogleSession(fresh, true);
    return fresh;
  })().finally(() => (renewing = null));
  return renewing;
}

type SessionListener = (s: GoogleSession | null, renewed: boolean) => void;

// Function declaration: readInitial() calls it before the module's consts exist.
function sessionListeners(): Set<SessionListener> {
  const w = window as unknown as { __rmGoogleListeners?: Set<SessionListener> };
  return (w.__rmGoogleListeners ??= new Set());
}

/** renewed: the same sign-in with a fresh token (not a new sign-in). */
export function saveGoogleSession(session: GoogleSession | null, renewed = false) {
  if (session) nothingKept = false;
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable — this visit stays signed in, the next starts out */
  }
  sessionListeners().forEach((fn) => fn(session, renewed));
}

/** Called whenever someone signs in or out, or the sign-in is renewed (lib/sync.ts starts or stops the cloud). */
export function onGoogleSessionChange(fn: SessionListener): () => void {
  sessionListeners().add(fn);
  return () => sessionListeners().delete(fn);
}

export function setGoogleOptIn(on: boolean) {
  optedIn = on;
  persist(on);
}

/**
 * For links to another RetroMind module: on a different origin the Google
 * choice is appended so the other module signs in (or stays out) as well;
 * same-origin links are left as they are (they already share it). Between the
 * two live domains the link also takes the current Google session along (in
 * the #fragment) and goes through the guest handoff, so one sign-in at the
 * door counts for the Zeitreise and the Gaming edition alike.
 */
export function withGoogleParam(href: string): string {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin) return href;
    url.searchParams.set(PARAM, optedIn ? '1' : '0');
    if (!ORIGINS.includes(url.origin) || !ORIGINS.includes(window.location.origin)) return url.toString();
    return `/api/admin?view=handoff&to=${encodeURIComponent(url.toString())}${handoffFragment()}`;
  } catch {
    return href;
  }
}
