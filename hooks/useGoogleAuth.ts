import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleUser } from '../types';
import {
  getGoogleClientId,
  requestGoogleAccessToken,
  fetchGoogleProfile,
  fetchGoogleBirthday,
  revokeGoogleToken,
  preloadGoogleIdentityServices,
  GoogleToken,
} from '../lib/googleAuth';
import { hasGoogleOptIn, setGoogleOptIn } from '../lib/googleLogin';

export type GoogleAuthStatus = 'not_configured' | 'signed_out' | 'signing_in' | 'signed_in' | 'error';

// Wraps Google sign-in + Drive-token renewal for the app. The access token
// itself is kept only in memory (never persisted) — a fresh one is requested
// (silently, when possible) whenever the Drive sync needs it. Signing in is
// optional; the choice is shared by all modules (lib/googleLogin.ts).
export function useGoogleAuth() {
  const [status, setStatus] = useState<GoogleAuthStatus>(getGoogleClientId() ? 'signed_out' : 'not_configured');
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [birthdayHint, setBirthdayHint] = useState<string | null>(null);
  const tokenRef = useRef<GoogleToken | null>(null);

  // Load the GIS script as soon as the app mounts, not on first tap — see
  // preloadGoogleIdentityServices() for why.
  useEffect(() => {
    if (getGoogleClientId()) preloadGoogleIdentityServices().catch(() => {});
  }, []);

  // Only someone who signed in with Google before — in this or any other
  // RetroMind module — gets a silent re-login on open. Everyone else stays
  // signed out until they tap a sign-in button themselves.
  useEffect(() => {
    if (!getGoogleClientId() || !hasGoogleOptIn()) return;
    (async () => {
      try {
        const token = await requestGoogleAccessToken('');
        tokenRef.current = token;
        const profile = await fetchGoogleProfile(token.accessToken);
        setUser(profile);
        setStatus('signed_in');
        setBirthdayHint(await fetchGoogleBirthday(token.accessToken));
      } catch {
        /* consent gone — stays signed out until the person signs in again */
      }
    })();
    // Only on mount: a later opt-in goes through signIn().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFreshAccessToken = useCallback(async (): Promise<string | null> => {
    const cached = tokenRef.current;
    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.accessToken;
    if (!getGoogleClientId()) return null;
    try {
      const fresh = await requestGoogleAccessToken('');
      tokenRef.current = fresh;
      return fresh.accessToken;
    } catch {
      return null;
    }
  }, []);

  const signIn = useCallback(async () => {
    if (!getGoogleClientId()) {
      setStatus('not_configured');
      return;
    }
    setStatus('signing_in');
    try {
      const token = await requestGoogleAccessToken('consent');
      tokenRef.current = token;
      const profile = await fetchGoogleProfile(token.accessToken);
      setUser(profile);
      setStatus('signed_in');
      setGoogleOptIn(true);
      setBirthdayHint(await fetchGoogleBirthday(token.accessToken));
    } catch {
      setStatus('error');
    }
  }, []);

  const signOut = useCallback(() => {
    if (tokenRef.current) revokeGoogleToken(tokenRef.current.accessToken);
    tokenRef.current = null;
    setGoogleOptIn(false);
    setUser(null);
    setBirthdayHint(null);
    setStatus(getGoogleClientId() ? 'signed_out' : 'not_configured');
  }, []);

  return { status, user, birthdayHint, signIn, signOut, getFreshAccessToken };
}

export type GoogleAuth = ReturnType<typeof useGoogleAuth>;
