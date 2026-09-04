import { SpotifyUser } from '../types';

// Spotify OAuth via Authorization Code + PKCE — the flow meant for public
// clients (SPAs) that can't keep a secret. Unlike Google Identity Services,
// Spotify has no popup/silent-token API: signing in means a full-page
// redirect to accounts.spotify.com and back, so state has to survive that
// round trip. The verifier/state go in sessionStorage (gone once this tab's
// session ends); the refresh token goes in localStorage, because it's the
// only way to stay signed in across a reload — there's no silent renewal
// like Google's. It never leaves the browser except straight to Spotify's
// own token endpoint.
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SCOPES = 'user-read-private user-read-email';
const VERIFIER_KEY = 'retromind.spotify.verifier';
const STATE_KEY = 'retromind.spotify.state';
const REFRESH_TOKEN_KEY = 'retromind.spotify.refresh_token';

export interface SpotifyToken {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
}

export function getSpotifyClientId(): string | undefined {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID || undefined;
}

function getRedirectUri(): string {
  return `${window.location.origin}/`;
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  let str = '';
  for (const b of new Uint8Array(bytes)) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

async function codeChallengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
}

// Kicks off sign-in by navigating the whole page to Spotify's consent
// screen. Never resolves — the browser leaves this page.
export async function beginSpotifyLogin(): Promise<void> {
  const clientId = getSpotifyClientId();
  if (!clientId) throw new Error('not_configured');
  const verifier = randomString(64);
  const state = randomString(16);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: await codeChallengeFor(verifier),
    scope: SCOPES,
    state,
  });
  window.location.assign(`${AUTH_ENDPOINT}?${params.toString()}`);
}

export type SpotifyRedirectResult =
  | { kind: 'none' }
  | { kind: 'token'; token: SpotifyToken }
  | { kind: 'error' };

// Call once on app mount: picks up `?code=…&state=…` (or `?error=…`) left in
// the URL by Spotify's redirect back, exchanges the code for a token pair,
// and always scrubs those params from the address bar/history afterwards.
export async function consumeSpotifyRedirect(): Promise<SpotifyRedirectResult> {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const state = url.searchParams.get('state');
  if (!code && !error) return { kind: 'none' };

  const cleanUp = () => {
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    url.searchParams.delete('error');
    window.history.replaceState({}, '', url.toString());
  };

  const expectedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);

  if (error || !code || !verifier || !state || state !== expectedState) {
    cleanUp();
    return { kind: 'error' };
  }

  try {
    const token = await exchangeCodeForToken(code, verifier);
    cleanUp();
    return { kind: 'token', token };
  } catch {
    cleanUp();
    return { kind: 'error' };
  }
}

async function exchangeCodeForToken(code: string, verifier: string): Promise<SpotifyToken> {
  const clientId = getSpotifyClientId();
  if (!clientId) throw new Error('not_configured');
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      client_id: clientId,
      code_verifier: verifier,
    }),
  });
  if (!res.ok) throw new Error('token_exchange_failed');
  return parseTokenResponse(await res.json());
}

export async function refreshSpotifyAccessToken(refreshToken: string): Promise<SpotifyToken> {
  const clientId = getSpotifyClientId();
  if (!clientId) throw new Error('not_configured');
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  });
  if (!res.ok) throw new Error('token_refresh_failed');
  return parseTokenResponse(await res.json(), refreshToken);
}

function parseTokenResponse(data: any, fallbackRefreshToken: string | null = null): SpotifyToken {
  return {
    accessToken: data.access_token,
    // Spotify doesn't always rotate the refresh token on refresh — keep the
    // previous one when a new one isn't sent back.
    refreshToken: data.refresh_token || fallbackRefreshToken,
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
  };
}

export async function fetchSpotifyProfile(accessToken: string): Promise<SpotifyUser> {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('profile_failed');
  const data = await res.json();
  return {
    id: data.id,
    name: data.display_name || data.id,
    email: data.email || '',
    picture: data.images?.[0]?.url || '',
    product: data.product || 'unknown',
  };
}

export function persistSpotifyRefreshToken(token: string | null) {
  try {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    /* storage unavailable — non-fatal, just means no silent re-login */
  }
}

export function loadPersistedSpotifyRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}
