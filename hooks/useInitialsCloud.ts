import { useCallback, useEffect, useRef, useState } from 'react';
import { loadDriveJson, saveDriveJson } from '../services/googleDriveService';
import { cleanInitials, getInitials, INITIALS_LENGTH, onInitialsChange, setInitials } from '../lib/initials';
import { GoogleAuthStatus } from './useGoogleAuth';

// Keeps the three-letter tag (lib/initials.ts) in the person's own Google
// Drive while they are signed in. Both editions use the same Google client,
// so they read and write the same private file. What is in the cloud wins,
// but it only replaces a different tag on this device after the person says
// yes (Marco, 2026-10-17); a "no" keeps the local tag and isn't asked again
// for that same cloud tag. A tag the person picks while signed in goes to
// the cloud right away.

const FILE_NAME = 'retromind-initials.json';
// The cloud tag someone chose not to take over on this device.
const KEPT_LOCAL_KEY = 'retromind.initials.keptLocal';

interface CloudFile {
  version: 1;
  initials: string;
  updatedAt: string;
}

export interface InitialsConflict {
  cloud: string;
  local: string;
}

function keptLocalFor(): string {
  try {
    return localStorage.getItem(KEPT_LOCAL_KEY) || '';
  } catch {
    return '';
  }
}

export function useInitialsCloud(auth: { status: GoogleAuthStatus; getFreshAccessToken: () => Promise<string | null> }) {
  const [conflict, setConflict] = useState<InitialsConflict | null>(null);
  // The tag the cloud holds, once read; null until then (nothing is written
  // before reading, so a new device can't overwrite the cloud tag).
  const cloudTag = useRef<string | null>(null);
  const authRef = useRef(auth);
  authRef.current = auth;

  const push = useCallback(async (tag: string) => {
    const token = await authRef.current.getFreshAccessToken();
    if (!token) return;
    try {
      await saveDriveJson(token, FILE_NAME, { version: 1, initials: tag, updatedAt: new Date().toISOString() } satisfies CloudFile);
      cloudTag.current = tag;
    } catch {
      /* stays on this device; the next change tries again */
    }
  }, []);

  // Read the cloud tag once per sign-in.
  useEffect(() => {
    if (auth.status !== 'signed_in') {
      cloudTag.current = null;
      setConflict(null);
      return;
    }
    let alive = true;
    (async () => {
      const token = await authRef.current.getFreshAccessToken();
      if (!token || !alive) return;
      let remote = '';
      try {
        const file = await loadDriveJson<CloudFile>(token, FILE_NAME);
        remote = file?.version === 1 ? cleanInitials(file.initials) : '';
      } catch {
        return;
      }
      if (!alive) return;
      const local = getInitials();
      if (remote.length !== INITIALS_LENGTH) {
        cloudTag.current = '';
        if (local) push(local);
        return;
      }
      cloudTag.current = remote;
      // Nothing set here yet, so there is nothing to overwrite.
      if (!local) return setInitials(remote, false);
      if (local !== remote && keptLocalFor() !== remote) setConflict({ cloud: remote, local });
    })();
    return () => {
      alive = false;
    };
  }, [auth.status, push]);

  // A tag picked by the person while signed in goes up to the cloud.
  useEffect(
    () =>
      onInitialsChange((fromUser) => {
        if (!fromUser || cloudTag.current === null) return;
        // Picking a tag answers the open question too.
        setConflict(null);
        const tag = getInitials();
        if (tag !== cloudTag.current) push(tag);
      }),
    [push]
  );

  const takeCloud = useCallback(() => {
    if (conflict) setInitials(conflict.cloud, false);
    setConflict(null);
  }, [conflict]);

  const keepLocal = useCallback(() => {
    if (conflict) {
      try {
        localStorage.setItem(KEPT_LOCAL_KEY, conflict.cloud);
      } catch {
        /* asked again next time */
      }
    }
    setConflict(null);
  }, [conflict]);

  return { conflict, takeCloud, keepLocal };
}
