import { useSyncExternalStore } from 'react';

// What the Spotify player reports every second (position, length, the song
// really playing, volume). It lives in a tiny store of its own so only the
// open player panel (components/MusicDock) re-renders with it, not the
// whole app.

export interface NowPlaying {
  name: string;
  artists: string;
  image: string | null;
}

export interface MusicStatusState {
  position: number;
  duration: number;
  /** Only the Premium player says what plays inside an album or playlist. */
  track: NowPlaying | null;
  /** null: this player has no volume control (the embed). */
  volume: number | null;
}

export interface MusicStatus {
  get: () => MusicStatusState;
  set: (patch: Partial<MusicStatusState>) => void;
  subscribe: (cb: () => void) => () => void;
}

export function createMusicStatus(): MusicStatus {
  let state: MusicStatusState = { position: 0, duration: 0, track: null, volume: null };
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (patch) => {
      const next = { ...state, ...patch };
      if (
        next.position === state.position &&
        next.duration === state.duration &&
        next.track?.name === state.track?.name &&
        next.track?.image === state.track?.image &&
        next.volume === state.volume
      )
        return;
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe: (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}

const EMPTY: MusicStatusState = { position: 0, duration: 0, track: null, volume: null };

export function useMusicStatus(status: MusicStatus | undefined): MusicStatusState {
  return useSyncExternalStore(
    (cb) => status?.subscribe(cb) ?? (() => {}),
    () => status?.get() ?? EMPTY
  );
}

/** Feeds one playback_update (embed or Premium player) into the store. */
export function reportPlayback(status: MusicStatus, data: any) {
  status.set({
    position: Number(data?.position) || 0,
    duration: Number(data?.duration) || 0,
    ...(data && 'track' in data ? { track: data.track ?? null } : {}),
  });
}
