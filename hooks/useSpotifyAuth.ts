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
  SpotifyLoginExpired,
  rememberPremiumLogin,
  hadPremiumLogin,
} from '../lib/spotifyAuth';
import { setLoginLost, setPremiumTokenSource } from '../lib/spotifyPremium';
import { setSpotifyApiToken } from '../lib/spotifyApi';

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
    if (profile.product === 'premium') rememberPremiumLogin(true);
    setLoginLost(false);
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
      if (!storedRefreshToken) {
        // A Premium login that went missing: the player says so (hint).
        if (hadPremiumLogin()) setLoginLost(true);
        return;
      }
      try {
        const fresh = await refreshSpotifyAccessToken(storedRefreshToken);
        await applyToken(fresh);
      } catch (e) {
        // The login used to be thrown away on ANY failure here, also a
        // network hiccup or a token the other app or device had just
        // renewed, and the removal then spread to every device (lib/sync):
        // signed out everywhere, previews only. Now the stored token stays
        // unless Spotify itself rejected it and no newer one arrived since.
        if (e instanceof SpotifyLoginExpired && loadPersistedSpotifyRefreshToken() === storedRefreshToken) {
          persistSpotifyRefreshToken(null);
        }
        if (hadPremiumLogin()) setLoginLost(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  const getFreshAccessToken = useCallback(async (): Promise<string | null> => {
    const cached = tokenRef.current;
    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.accessToken;
    // The stored token first: the other app or device may have renewed the
    // login meanwhile (lib/sync.ts), which can retire the one held here.
    const refreshToken = loadPersistedSpotifyRefreshToken() || cached?.refreshToken;
    if (!refreshToken) return null;
    const renew = async (rt: string) => {
      const fresh = await refreshSpotifyAccessToken(rt);
      tokenRef.current = fresh;
      // Only the newest token is kept (a parallel caller may have stored it already).
      if (loadPersistedSpotifyRefreshToken() !== fresh.refreshToken) persistSpotifyRefreshToken(fresh.refreshToken);
      return fresh.accessToken;
    };
    try {
      return await renew(refreshToken);
    } catch {
      // Renewed meanwhile by another part of the page, the other app or
      // another device: use that token instead of giving up.
      const newer = tokenRef.current;
      if (newer && newer.refreshToken !== refreshToken && newer.expiresAt - Date.now() > 60_000) return newer.accessToken;
      const stored = loadPersistedSpotifyRefreshToken();
      if (stored && stored !== refreshToken) {
        try {
          return await renew(stored);
        } catch {
          return null;
        }
      }
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
    // Signed out on purpose: no "sign in again" hint.
    rememberPremiumLogin(false);
    setLoginLost(false);
    setUser(null);
    setStatus(configured ? 'signed_out' : 'not_configured');
  }, [configured]);

  // A Premium login that granted "streaming" lets the music play through
  // Spotify's browser player, which can fade in (lib/spotifyPremium). Logins
  // from before that permission existed simply keep the normal player.
  useEffect(() => {
    const streaming = /\bstreaming\b/.test(tokenRef.current?.scope ?? '');
    setPremiumTokenSource(
      status === 'signed_in' && user?.product === 'premium' && streaming ? getFreshAccessToken : null,
      tokenRef.current?.scope ?? ''
    );
    // Search and music to the topic work with any login (lib/spotifyApi).
    setSpotifyApiToken(status === 'signed_in' ? getFreshAccessToken : null);
  }, [status, user, getFreshAccessToken]);

  return { status, user, signIn, signOut, getFreshAccessToken };
}

export type SpotifyAuth = ReturnType<typeof useSpotifyAuth>;
