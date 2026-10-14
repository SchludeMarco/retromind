import { useSyncExternalStore } from 'react';
import { SpotifyEmbedController } from './spotifyEmbed';

// Spotify Premium on phones through the visitor's own Spotify app (Spotify
// Connect). Marco, 2026-10-14: "wichtig wäre mir einfach das Spotify Premium
// aktiviert wird weil ich das ja habe und mein eingebauter Spotify Player im
// Handy weiß das ja eigentlich". Spotify's browser player (lib/spotifyPremium)
// doesn't run on iPhone or Android, and the embed only plays 30-second
// previews there. So on phones the Zeitreise asks Spotify's Web API to play
// the songs on one of the visitor's own Spotify devices, normally the
// Spotify app on the same phone: full songs, the app's own sound.
//
// It offers the same controller interface as the embed. Spotify only lists
// an app as a device while it is open or was open a short while ago; with no
// device (or a login from before the "user-read-playback-state" permission)
// the embed plays as before and the music panel says what helps
// (components/MusicDock: ConnectNote).

const API = 'https://api.spotify.com/v1';
const POLL_MS = 2000;
const NEEDED_SCOPE = 'user-read-playback-state';

type TokenSource = () => Promise<string | null>;

// --- What the music panel shows -------------------------------------------

/** off: not in use. app: plays in the Spotify app. no-device: no Spotify app found. login: sign in again once. */
export type ConnectState = 'off' | 'app' | 'no-device' | 'login';

let state: ConnectState = 'off';
let deviceName: string | null = null;
// Bumped by "Try again" and when the app went away: the music hook then
// builds its player anew (with Connect when an app is there, else the embed).
let attempt = 0;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

function setState(next: ConnectState, name: string | null = deviceName) {
  if (next === state && name === deviceName) return;
  state = next;
  deviceName = name;
  notify();
}

export function useConnectState(): { state: ConnectState; device: string | null } {
  const s = useSyncExternalStore(subscribe, () => state);
  const d = useSyncExternalStore(subscribe, () => deviceName);
  return { state: s, device: d };
}

/** Changes whenever the music hook should build its player again. */
export function useConnectAttempt(): number {
  return useSyncExternalStore(subscribe, () => attempt);
}

/** "Try again" in the music panel, after opening the Spotify app. */
export function retryConnect() {
  attempt++;
  notify();
}

/** The player went back to the embed (no Premium login any more). */
export function connectOff() {
  setState('off', null);
}

// --- The Web API -----------------------------------------------------------

async function call(source: TokenSource, method: string, path: string, body?: unknown, keepalive = false): Promise<Response | null> {
  const token = await source();
  if (!token) return null;
  return fetch(`${API}${path}`, {
    method,
    keepalive,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => null);
}

interface Device {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  is_restricted: boolean;
}

/** The device to play on: the one already playing, else a phone, else any. */
async function pickDevice(source: TokenSource): Promise<Device | null> {
  const res = await call(source, 'GET', '/me/player/devices');
  if (!res || !res.ok) return null;
  const devices: Device[] = ((await res.json().catch(() => null))?.devices ?? []).filter((d: Device) => d.id && !d.is_restricted);
  return (
    devices.find((d) => d.is_active) ??
    devices.find((d) => d.type === 'Smartphone') ??
    devices[0] ??
    null
  );
}

// Spotify may play the same song under another id in the visitor's country.
const isTrack = (item: any, u: string) => item?.uri === u || item?.linked_from?.uri === u;

/**
 * The Spotify-app player, or null when it can't be used right now (the
 * caller then takes the embed). `scope` is what the login granted.
 */
export async function createConnectController(source: TokenSource, scope: string, initialUri: string): Promise<SpotifyEmbedController | null> {
  if (!new RegExp(`\\b${NEEDED_SCOPE}\\b`).test(scope)) {
    setState('login', null);
    return null;
  }
  let device = await pickDevice(source);
  if (!device) {
    setState('no-device', null);
    return null;
  }
  setState('app', device.name);

  let uri = initialUri;
  // A new song or playlist was chosen but not yet sent to the app.
  let pending = true;
  let destroyed = false;
  let pollTimer: number | null = null;
  // After a start, the app reports the chosen song only after a moment;
  // until then it may still show the one before.
  let waitingFor: string | null = null;
  let waitingSince = 0;
  // Whether the song we started has shown up (to tell "over" from "not yet").
  let arrived = false;
  const updateListeners = new Set<(e: any) => void>();
  const emit = (data: any) => updateListeners.forEach((cb) => cb({ data }));

  const gone = () => {
    if (destroyed) return;
    setState('no-device', null);
    // The hook builds a new player: the embed, until the app is back.
    attempt++;
    notify();
  };

  const poll = async () => {
    if (destroyed) return;
    const res = await call(source, 'GET', '/me/player?additional_types=track');
    if (destroyed || !res) return;
    if (res.status === 204) {
      // Nothing plays anywhere (the single song ran out and the app stopped).
      if (arrived) emit({ isPaused: true, position: 0, duration: 0, track: null });
      return;
    }
    if (!res.ok) return;
    const p = await res.json().catch(() => null);
    if (!p || destroyed) return;
    const item = p.item;
    const single = uri.startsWith('spotify:track:');
    if (waitingFor) {
      if (isTrack(item, waitingFor) || (!single && p.context?.uri === uri)) {
        waitingFor = null;
        arrived = true;
      } else {
        // The app never took the song: try once more, then give up quietly.
        if (Date.now() - waitingSince > 8000) {
          waitingFor = null;
          emit({ isPaused: true, position: 1, duration: 0, track: null });
        }
        return;
      }
    }
    if (!arrived) return;
    // A single song that is over: the app moved on (autoplay) or stopped.
    if (single && item && !isTrack(item, uri)) {
      call(source, 'PUT', `/me/player/pause?device_id=${encodeURIComponent(device!.id)}`);
      emit({ isPaused: true, position: 0, duration: item.duration_ms, track: null });
      return;
    }
    const images: any[] = item?.album?.images ?? [];
    emit({
      isPaused: !p.is_playing,
      position: p.progress_ms ?? 0,
      duration: item?.duration_ms ?? 0,
      track: item
        ? {
            name: item.name as string,
            artists: (item.artists ?? []).map((a: any) => a.name).join(', ') as string,
            image: (images.find((i) => (i.width || 0) >= 200) ?? images[0])?.url ?? null,
          }
        : null,
    });
  };
  pollTimer = window.setInterval(poll, POLL_MS);

  const startUri = async () => {
    pending = false;
    const body = uri.startsWith('spotify:track:') ? { uris: [uri] } : { context_uri: uri };
    for (let n = 0; n < 2; n++) {
      if (destroyed || pending) return;
      const res = await call(source, 'PUT', `/me/player/play?device_id=${encodeURIComponent(device!.id)}`, body);
      if (res && res.ok) {
        waitingFor = uri.startsWith('spotify:track:') ? uri : null;
        waitingSince = Date.now();
        arrived = !waitingFor;
        // Show "playing" right away; the app's report follows.
        emit({ isPaused: false, position: 0, duration: 0, track: null });
        window.setTimeout(poll, 800);
        return;
      }
      // 404: the app went to sleep or was closed. Look for it once more.
      const next = await pickDevice(source);
      if (!next) break;
      device = next;
      setState('app', next.name);
    }
    pending = true;
    gone();
  };

  const resume = () => {
    if (pending || !arrived) {
      startUri();
      return;
    }
    call(source, 'PUT', `/me/player/play?device_id=${encodeURIComponent(device!.id)}`).then((res) => {
      if (res && !res.ok && res.status === 404) startUri();
      else poll();
    });
  };
  const pause = (keepalive = false) => {
    call(source, 'PUT', `/me/player/pause?device_id=${encodeURIComponent(device!.id)}`, undefined, keepalive).then(() => poll());
  };
  // Leaving the page: the app would otherwise keep playing on its own.
  const onLeave = () => {
    if (!pending) pause(true);
  };
  window.addEventListener('pagehide', onLeave);

  return {
    play: resume,
    resume,
    pause: () => pause(),
    loadUri: (next: string) => {
      uri = next;
      pending = true;
      arrived = false;
      waitingFor = null;
    },
    seek: (seconds: number) => {
      call(source, 'PUT', `/me/player/seek?position_ms=${Math.round(seconds * 1000)}&device_id=${encodeURIComponent(device!.id)}`).then(() => poll());
    },
    nextTrack: () => {
      call(source, 'POST', `/me/player/next?device_id=${encodeURIComponent(device!.id)}`).then(() => poll());
    },
    previousTrack: () => {
      call(source, 'POST', `/me/player/previous?device_id=${encodeURIComponent(device!.id)}`).then(() => poll());
    },
    addListener: (event: string, cb: (e: any) => void) => {
      // The device is known already, so "ready" is true right away.
      if (event === 'ready') window.setTimeout(() => cb({}), 0);
      else if (event === 'playback_update') updateListeners.add(cb);
    },
    removeListener: (event: string, cb?: (e: any) => void) => {
      if (event === 'playback_update') {
        if (cb) updateListeners.delete(cb);
        else updateListeners.clear();
      }
    },
    destroy: () => {
      if (!pending) pause(true);
      destroyed = true;
      window.removeEventListener('pagehide', onLeave);
      if (pollTimer !== null) window.clearInterval(pollTimer);
      updateListeners.clear();
    },
  };
}
