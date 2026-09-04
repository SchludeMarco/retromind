import { useCallback, useEffect, useRef, useState } from 'react';
import { SpotifyUser } from '../types';
import {
  getSpotifyClientId,
  beginSpotifyLogin,
  consumeSpotifyRedirect,
  refreshSpotifyAccessToken,
  fetchSpotifyProfile,
  persistSpotifyRefreshToken,
  loadPersistedSpotifyRefreshToken,
  SpotifyToken,
} from '../lib/spotifyAuth';

export type SpotifyAuthStatus = 'not_configured' | 'signed_out' | 'signing_in' | 'signed_in' | 'error';

// Wraps Spotify's redirect-based PKCE login. The access token lives only in
// memory; the refresh token is the one thing kept in localStorage (see
// lib/spotifyAuth.ts for why), so a reload can sign back in without a
// consent screen.
export function useSpotifyAuth() {
  const configured = !!getSpotifyClientId();
  const [status, setStatus] = useState<SpotifyAuthStatus>(configured ? 'signed_out' : 'not_configured');
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const tokenRef = useRef<SpotifyToken | null>(null);
  const bootAttempted = useRef(false);

  const applyToken = useCallback(async (token: SpotifyToken) => {
    tokenRef.current = token;
    persistSpotifyRefreshToken(token.refreshToken);
    const profile = await fetchSpotifyProfile(token.accessToken);
    setUser(profile);
    setStatus('signed_in');
  }, []);

  // On mount: either finish a redirect we just came back from, or try a
  // silent sign-in using a refresh token from a previous visit.
  useEffect(() => {
    if (!configured || bootAttempted.current) return;
    bootAttempted.current = true;
    (async () => {
      const redirectResult = await consumeSpotifyRedirect();
      if (redirectResult.kind === 'token') {
        try {
          await applyToken(redirectResult.token);
          return;
        } catch {
          setStatus('error');
          return;
        }
      }
      if (redirectResult.kind === 'error') {
        setStatus('error');
        return;
      }
      const storedRefreshToken = loadPersistedSpotifyRefreshToken();
      if (!storedRefreshToken) return;
      try {
        const fresh = await refreshSpotifyAccessToken(storedRefreshToken);
        await applyToken(fresh);
      } catch {
        persistSpotifyRefreshToken(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  const getFreshAccessToken = useCallback(async (): Promise<string | null> => {
    const cached = tokenRef.current;
    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.accessToken;
    const refreshToken = cached?.refreshToken || loadPersistedSpotifyRefreshToken();
    if (!refreshToken) return null;
    try {
      const fresh = await refreshSpotifyAccessToken(refreshToken);
      tokenRef.current = fresh;
      persistSpotifyRefreshToken(fresh.refreshToken);
      return fresh.accessToken;
    } catch {
      return null;
    }
  }, []);

  const signIn = useCallback(async () => {
    if (!configured) {
      setStatus('not_configured');
      return;
    }
    setStatus('signing_in');
    try {
      await beginSpotifyLogin(); // navigates away; this line is the end of the flow
    } catch {
      setStatus('error');
    }
  }, [configured]);

  const signOut = useCallback(() => {
    tokenRef.current = null;
    persistSpotifyRefreshToken(null);
    setUser(null);
    setStatus(configured ? 'signed_out' : 'not_configured');
  }, [configured]);

  return { status, user, signIn, signOut, getFreshAccessToken };
}

export type SpotifyAuth = ReturnType<typeof useSpotifyAuth>;
