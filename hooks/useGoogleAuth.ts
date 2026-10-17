import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleUser } from '../types';
import {
  getGoogleClientId,
  signInWithGoogle,
  fetchGoogleProfile,
  fetchGoogleProfileHints,
  GoogleProfileHints,
  revokeGoogleToken,
  preloadGoogleIdentityServices,
  GoogleToken,
} from '../lib/googleAuth';
import {
  ensureGoogleSession,
  hasGoogleOptIn,
  loadGoogleSession,
  onGoogleSessionChange,
  saveGoogleSession,
  setGoogleOptIn,
} from '../lib/googleLogin';

export type GoogleAuthStatus = 'not_configured' | 'signed_out' | 'signing_in' | 'signed_in' | 'error';

// Wraps Google sign-in + Drive-token renewal for the app. Signing in is
// optional and the choice is shared by all modules (lib/googleLogin.ts).
// Google's token client always opens a popup, even for a "silent" renewal, so
// the browser never asks Google on its own: a stored, still-valid token
// restores the login on open, and after its hour the server renews it from
// the sign-in it keeps for this device (api/_googleKeep.js). Without a kept
// sign-in the module just shows the sign-in button again.
export function useGoogleAuth() {
  const [restored] = useState(loadGoogleSession);
  const [status, setStatus] = useState<GoogleAuthStatus>(
    !getGoogleClientId() ? 'not_configured' : restored ? 'signed_in' : 'signed_out',
  );
  const [user, setUser] = useState<GoogleUser | null>(restored?.user ?? null);
  const [hints, setHints] = useState<GoogleProfileHints>({ birthday: null, gender: null });
  const tokenRef = useRef<GoogleToken | null>(restored?.token ?? null);

  // Google's script is only fetched for people who chose Google before
  // (DSGVO: no contact with Google just for opening the page). Everyone else
  // gets it the moment they reach for a sign-in button (warmUpGoogle), still
  // before the tap itself — see preloadGoogleIdentityServices() for why.
  useEffect(() => {
    if (getGoogleClientId() && hasGoogleOptIn()) preloadGoogleIdentityServices().catch(() => {});
  }, []);

  // A login restored from the stored token knows the name already; the
  // birthday and gender are fetched again with that token (a plain API call,
  // no popup) instead of being kept in the session store.
  useEffect(() => {
    const token = restored?.token;
    if (token && token.expiresAt - Date.now() > 60_000) {
      fetchGoogleProfileHints(token.accessToken).then((h) => {
        if (tokenRef.current === token) setHints(h);
      });
    }
  }, [restored]);

  // Follows sign-ins renewed or ended elsewhere (lib/googleLogin.ts), and
  // renews an expired one right away when the server keeps it.
  useEffect(() => {
    const off = onGoogleSessionChange((session) => {
      if (session) {
        tokenRef.current = session.token;
        setUser(session.user);
        setStatus('signed_in');
      } else if (!hasGoogleOptIn()) {
        tokenRef.current = null;
        setUser(null);
        setStatus(getGoogleClientId() ? 'signed_out' : 'not_configured');
      }
    });
    if (!restored && getGoogleClientId() && hasGoogleOptIn()) {
      ensureGoogleSession().then((session) => {
        if (!session) return;
        fetchGoogleProfileHints(session.token.accessToken).then((h) => {
          if (tokenRef.current === session.token) setHints(h);
        });
      });
    }
    return off;
  }, [restored]);

  // Never opens a Google window on its own: an expired token is renewed by
  // the server when it keeps the sign-in, else it means signed out until the
  // next tap (the opt-in remains).
  const getFreshAccessToken = useCallback(async (): Promise<string | null> => {
    const cached = tokenRef.current;
    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.accessToken;
    const session = await ensureGoogleSession();
    if (session) {
      tokenRef.current = session.token;
      return session.token.accessToken;
    }
    tokenRef.current = null;
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
      const token = await signInWithGoogle(hasGoogleOptIn() ? '' : 'consent');
      tokenRef.current = token;
      const profile = await fetchGoogleProfile(token.accessToken);
      setUser(profile);
      setStatus('signed_in');
      setGoogleOptIn(true);
      saveGoogleSession({ token, user: profile });
      setHints(await fetchGoogleProfileHints(token.accessToken));
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
    setHints({ birthday: null, gender: null });
    setStatus(getGoogleClientId() ? 'signed_out' : 'not_configured');
  }, []);

  return { status, user, birthdayHint: hints.birthday, genderHint: hints.gender, signIn, signOut, getFreshAccessToken };
}

export type GoogleAuth = ReturnType<typeof useGoogleAuth>;
