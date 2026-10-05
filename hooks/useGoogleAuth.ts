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
import { hasGoogleOptIn, setGoogleOptIn, loadGoogleSession, saveGoogleSession } from '../lib/googleLogin';

export type GoogleAuthStatus = 'not_configured' | 'signed_out' | 'signing_in' | 'signed_in' | 'error';

// Wraps Google sign-in + Drive-token renewal for the app. Signing in is
// optional and the choice is shared by all modules (lib/googleLogin.ts).
// Google's token client always opens a popup, even for a "silent" renewal, so
// nothing here talks to Google unless the person taps a button: a stored,
// still-valid token restores the login on open, and once it expires the
// module just shows the sign-in button again (one tap, no consent screen).
export function useGoogleAuth() {
  const [restored] = useState(loadGoogleSession);
  const [status, setStatus] = useState<GoogleAuthStatus>(
    !getGoogleClientId() ? 'not_configured' : restored ? 'signed_in' : 'signed_out',
  );
  const [user, setUser] = useState<GoogleUser | null>(restored?.user ?? null);
  const [birthdayHint, setBirthdayHint] = useState<string | null>(null);
  const tokenRef = useRef<GoogleToken | null>(restored?.token ?? null);

  // Google's script is only fetched for people who chose Google before
  // (DSGVO: no contact with Google just for opening the page). Everyone else
  // gets it the moment they reach for a sign-in button (warmUpGoogle), still
  // before the tap itself — see preloadGoogleIdentityServices() for why.
  useEffect(() => {
    if (getGoogleClientId() && hasGoogleOptIn()) preloadGoogleIdentityServices().catch(() => {});
  }, []);

  // A login restored from the stored token knows the name already; the
  // birthday is fetched again with that token (a plain API call, no popup)
  // instead of being kept in the session store.
  useEffect(() => {
    const token = restored?.token;
    if (token && token.expiresAt - Date.now() > 60_000) {
      fetchGoogleBirthday(token.accessToken).then((b) => {
        if (tokenRef.current === token) setBirthdayHint(b);
      });
    }
  }, [restored]);

  // Never renews in the background (that would pop up a Google window): an
  // expired token means signed out until the next tap, the opt-in remains.
  const getFreshAccessToken = useCallback(async (): Promise<string | null> => {
    const cached = tokenRef.current;
    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.accessToken;
    tokenRef.current = null;
    saveGoogleSession(null);
    setStatus(getGoogleClientId() ? 'signed_out' : 'not_configured');
    return null;
  }, []);

  const signIn = useCallback(async () => {
    if (!getGoogleClientId()) {
      setStatus('not_configured');
      return;
    }
    setStatus('signing_in');
    try {
      // Someone who agreed before (here or in another module) only sees
      // Google's account chooser, not the consent screen again.
      const token = await requestGoogleAccessToken(hasGoogleOptIn() ? '' : 'consent');
      tokenRef.current = token;
      const profile = await fetchGoogleProfile(token.accessToken);
      setUser(profile);
      setStatus('signed_in');
      setGoogleOptIn(true);
      saveGoogleSession({ token, user: profile });
      setBirthdayHint(await fetchGoogleBirthday(token.accessToken));
    } catch {
      setStatus('error');
    }
  }, []);

  const signOut = useCallback(() => {
    if (tokenRef.current) revokeGoogleToken(tokenRef.current.accessToken);
    tokenRef.current = null;
    setGoogleOptIn(false);
    saveGoogleSession(null);
    setUser(null);
    setBirthdayHint(null);
    setStatus(getGoogleClientId() ? 'signed_out' : 'not_configured');
  }, []);

  return { status, user, birthdayHint, signIn, signOut, getFreshAccessToken };
}

export type GoogleAuth = ReturnType<typeof useGoogleAuth>;
