import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { useSyncStatus } from '../../hooks/useSyncStatus';

// The Gaming profile syncs like everything else in RetroMind (lib/sync.ts):
// with the Zeitreise on this device and, after a Google sign-in, through the
// person's own Google Drive with every other device. This hook only bundles
// the sign-in with how that sync is going, for the settings and the door.

export type CloudSync = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

export function useCloudSync() {
  // Signs in silently only if the visitor chose Google before, here or in
  // another module (lib/googleLogin.ts).
  const auth = useGoogleAuth();
  const status = useSyncStatus();
  const sync: CloudSync = auth.status === 'signed_in' && status !== 'off' ? status : 'idle';
  return { status: auth.status, user: auth.user, sync, signIn: auth.signIn, signOut: auth.signOut };
}

export type Cloud = ReturnType<typeof useCloudSync>;
