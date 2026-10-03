import { useCallback, useEffect, useRef, useState } from 'react';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { loadDriveJson, saveDriveJson } from '../../services/googleDriveService';
import { ArcadeState } from './useArcadeState';

// Optional cloud backup of the Gaming profile, the same way the journey does
// it: the profile always lives in localStorage, and after a Google sign-in a
// copy goes to the person's own Google Drive (the private appDataFolder only
// RetroMind can see). On sign-in both sides are merged, so a second device
// adds to the collection instead of replacing it.

const FILE_NAME = 'retromind-gaming.json';

export type CloudSync = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

interface CloudFile {
  version: 1;
  state: Partial<ArcadeState>;
}

export function useCloudSync(state: ArcadeState, mergeIn: (remote: Partial<ArcadeState>) => void) {
  // Signs in silently only if the visitor chose Google before, here or in
  // another module (lib/googleLogin.ts).
  const auth = useGoogleAuth();
  const [sync, setSync] = useState<CloudSync>('idle');
  // Bumped once the cloud copy is merged in, so the first save always runs.
  const [ready, setReady] = useState(0);
  const loaded = useRef(false);

  useEffect(() => {
    if (auth.status !== 'signed_in' || loaded.current) return;
    loaded.current = true;
    (async () => {
      setSync('loading');
      const token = await auth.getFreshAccessToken();
      if (!token) return setSync('error');
      try {
        const remote = await loadDriveJson<CloudFile>(token, FILE_NAME);
        if (remote?.version === 1 && remote.state) mergeIn(remote.state);
        setReady((n) => n + 1);
      } catch {
        setSync('error');
      }
    })();
  }, [auth.status, auth, mergeIn]);

  // Debounced push of every change while signed in.
  useEffect(() => {
    if (auth.status !== 'signed_in' || !ready) return;
    const timer = setTimeout(async () => {
      const token = await auth.getFreshAccessToken();
      if (!token) return setSync('error');
      setSync('saving');
      try {
        await saveDriveJson(token, FILE_NAME, { version: 1, state } satisfies CloudFile);
        setSync('saved');
      } catch {
        setSync('error');
      }
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, ready, auth.status]);

  const signOut = useCallback(() => {
    auth.signOut();
    loaded.current = false;
    setReady(0);
    setSync('idle');
  }, [auth]);

  return { status: auth.status, user: auth.user, sync, signIn: auth.signIn, signOut };
}

export type Cloud = ReturnType<typeof useCloudSync>;
