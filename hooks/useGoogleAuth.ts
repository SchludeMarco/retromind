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

export type GoogleAuthStatus = 'not_configured' | 'signed_out' | 'signing_in' | 'signed_in' | 'error';

// Wraps Google sign-in + Drive-token renewal for the app. The access token
// itself is kept only in memory (never persisted) — a fresh one is requested
// (silently, when possible) whenever the Drive sync needs it.
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

  // The app requires a fresh sign-in on every open (see VerifyGate). Try a
  // silent renewal first so a person who already granted consent isn't
  // stopped by a popup every single time — falls through to the mandatory
  // sign-in button when no prior consent is found.
  useEffect(() => {
    if (!getGoogleClientId()) return;
    (async () => {
      try {
        const token = await requestGoogleAccessToken('');
        tokenRef.current = token;
        const profile = await fetchGoogleProfile(token.accessToken);
        setUser(profile);
        setStatus('signed_in');
        setBirthdayHint(await fetchGoogleBirthday(token.accessToken));
      } catch {
        /* no prior consent — the person must tap the sign-in button */
      }
    })();
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
      setBirthdayHint(await fetchGoogleBirthday(token.accessToken));
    } catch {
      setStatus('error');
    }
  }, []);

  const signOut = useCallback(() => {
    if (tokenRef.current) revokeGoogleToken(tokenRef.current.accessToken);
    tokenRef.current = null;
    setUser(null);
    setBirthdayHint(null);
    setStatus(getGoogleClientId() ? 'signed_out' : 'not_configured');
  }, []);

  return { status, user, birthdayHint, signIn, signOut, getFreshAccessToken };
}

export type GoogleAuth = ReturnType<typeof useGoogleAuth>;
