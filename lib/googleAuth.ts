import { GoogleUser } from '../types';

// Google Identity Services (loaded on demand, not bundled) — gets us both an
// identity (name/email/picture) and a Drive access token in one consent
// screen, so RetroMind stays a static SPA with no auth backend of its own.
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const SCOPES = `openid email profile ${DRIVE_APPDATA_SCOPE}`;

export interface GoogleToken {
  accessToken: string;
  expiresAt: number;
}

export function getGoogleClientId(): string | undefined {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;
}

let gisLoadPromise: Promise<void> | null = null;

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

// Opens Google's consent popup (or renews silently when `prompt` is empty
// and the user already granted access) and resolves with a short-lived
// Drive-scoped access token. Never persisted — re-requested each session.
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

export function revokeGoogleToken(accessToken: string) {
  (window as any).google?.accounts?.oauth2?.revoke(accessToken, () => {});
}
