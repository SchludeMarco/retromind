import { GoogleUser } from '../types';

// Google Identity Services (loaded on demand, not bundled) — gets us both an
// identity (name/email/picture) and a Drive access token in one consent
// screen. Keeping the sign-in beyond the token's hour needs the server
// (api/_googleKeep.js, signInWithGoogle below).
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
// Only basic and non-sensitive scopes, so the OAuth app can run "In
// production" without Google's verification and without a test-user list
// (the guest list in api/_guests.js stays the only door). Birthday and gender
// therefore come from the person's own entry on the ticket, not from Google.
const SCOPES = `openid email profile ${DRIVE_APPDATA_SCOPE}`;

export interface GoogleToken {
  accessToken: string;
  expiresAt: number;
}

export function getGoogleClientId(): string | undefined {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;
}

let gisLoadPromise: Promise<void> | null = null;

// Fetching the GIS script takes a moment on mobile connections. Loading it
// lazily inside signIn() meant that first tap's requestAccessToken() call —
// which opens a popup — landed after an `await`, outside the click's user-
// gesture window; mobile Chrome then silently drops the popup with no
// blocked-icon or error. Preloading on mount keeps the script ready before
// the user ever taps the button, so the popup opens synchronously in the
// gesture handler.
export function preloadGoogleIdentityServices(): Promise<void> {
  void checkKeep();
  return loadGis();
}

/** For sign-in buttons (hover/focus/press): fetch the script just before the tap. */
export function warmUpGoogle() {
  if (getGoogleClientId()) {
    void checkKeep();
    loadGis().catch(() => {});
  }
}

// Whether the server can keep the sign-in (api/_googleKeep.js, needs the
// client secret in Vercel). Asked together with the script, before the tap,
// because the popup has to open synchronously in the tap; unknown → the plain
// one-hour sign-in as before.
let keep: boolean | null = null;
let keepPromise: Promise<boolean> | null = null;

export function checkKeep(): Promise<boolean> {
  keepPromise ??= fetch('/api/admin?view=google', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : { keep: false }))
    .then((d) => (keep = !!d?.keep))
    .catch(() => (keep = false));
  return keepPromise;
}

async function keepCall(action: string, extra: Record<string, string> = {}): Promise<GoogleToken | null> {
  try {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return d?.accessToken ? { accessToken: d.accessToken, expiresAt: Date.now() + (Number(d.expiresIn) || 3600) * 1000 } : null;
  } catch {
    return null;
  }
}

/** A fresh token from the kept sign-in of this device, without any popup; null when there is none. */
export function refreshKeptGoogleToken(): Promise<GoogleToken | null> {
  return keepCall('googleRefresh');
}

/** Ends the kept sign-in on this domain (the other app's copy goes with the next link, ?google=0). */
export function forgetKeptGoogleSignIn() {
  void fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'googleSignOut' }),
    keepalive: true,
  }).catch(() => {});
}

function loadGis(): Promise<void> {
  if (gisLoadPromise) return gisLoadPromise;
  gisLoadPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) return resolve();
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('gis_load_failed'));
    document.head.appendChild(script);
  });
  return gisLoadPromise;
}

let tokenClient: any = null;

/**
 * The sign-in tap. With a kept sign-in available it uses Google's code flow
 * (always shows the consent screen, once per device) and the server keeps
 * the refresh token; otherwise the one-hour token flow below.
 */
export async function signInWithGoogle(prompt: '' | 'consent'): Promise<GoogleToken> {
  if (keep !== true) return requestGoogleAccessToken(prompt);
  const clientId = getGoogleClientId();
  if (!clientId) throw new Error('not_configured');
  await loadGis();
  const google = (window as any).google;
  const code = await new Promise<string>((resolve, reject) => {
    google.accounts.oauth2
      .initCodeClient({
        client_id: clientId,
        scope: SCOPES,
        ux_mode: 'popup',
        select_account: true,
        callback: (resp: any) => (resp?.code ? resolve(resp.code) : reject(new Error(resp?.error || 'code_failed'))),
        error_callback: (err: any) => reject(new Error(err?.type || 'code_failed')),
      })
      .requestCode();
  });
  const token = await keepCall('googleCode', { code });
  if (!token) throw new Error('code_exchange_failed');
  return token;
}

// Opens Google's consent popup (or renews silently when `prompt` is empty
// and the user already granted access) and resolves with a short-lived
// Drive-scoped access token (kept for its hour in lib/googleLogin.ts).
export async function requestGoogleAccessToken(prompt: '' | 'consent'): Promise<GoogleToken> {
  const clientId = getGoogleClientId();
  if (!clientId) throw new Error('not_configured');
  await loadGis();
  const google = (window as any).google;
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: () => {},
      });
    }
    tokenClient.callback = (resp: any) => {
      if (!resp || resp.error) {
        reject(new Error(resp?.error || 'token_failed'));
        return;
      }
      resolve({
        accessToken: resp.access_token,
        expiresAt: Date.now() + (Number(resp.expires_in) || 3600) * 1000,
      });
    };
    tokenClient.error_callback = (err: any) => reject(new Error(err?.type || 'token_failed'));
    tokenClient.requestAccessToken({ prompt });
  });
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleUser> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('profile_failed');
  const data = await res.json();
  return { id: data.sub, name: data.name || data.email, email: data.email, picture: data.picture || '' };
}

/**
 * Sign-out. A kept sign-in is only forgotten on this device: revoking at
 * Google would end it on the person's other devices too.
 */
export function revokeGoogleToken(accessToken: string) {
  forgetKeptGoogleSignIn();
  if (keep !== false) return;
  (window as any).google?.accounts?.oauth2?.revoke(accessToken, () => {});
}
