import { useSyncExternalStore } from 'react';
import { createSpotifyEmbedController, SpotifyEmbedController } from './spotifyEmbed';

// Spotify's own browser player (Web Playback SDK) for visitors signed in with
// Spotify Premium (Marco, 2026-10-07: "Die Musik sollte langsam immer lauter
// werden zum Start"). Unlike the embed (lib/spotifyEmbed) it has a volume
// control, so every start and every resume fades in from silence over
// FADE_IN_MS. It plays full songs without the 30-second preview limit, too.
//
// It offers the same controller interface as the embed, so the music hooks
// (useSpotifyBackground, useHallSpotify) don't care which one they drive.
// Everyone else (not signed in, Spotify Free, iPhone/iPad where Spotify
// doesn't support the SDK, or the SDK failing to start) keeps the embed.

const FADE_IN_MS = 6000;
// The volume slider in the player (MusicDock); the fade-in rises to it.
const VOLUME_KEY = 'retromind.spotify.volume';
function savedVolume(): number {
  try {
    const v = Number(localStorage.getItem(VOLUME_KEY));
    return localStorage.getItem(VOLUME_KEY) !== null && v >= 0 && v <= 1 ? v : 1;
  } catch {
    return 1;
  }
}
const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';
const API = 'https://api.spotify.com/v1';

type TokenSource = () => Promise<string | null>;

// --- Who may use it --------------------------------------------------------
// The Spotify login (hooks/useSpotifyAuth) registers a token source here once
// a Premium account with the "streaming" permission is signed in.

let tokenSource: TokenSource | null = null;
const listeners = new Set<() => void>();

export function setPremiumTokenSource(source: TokenSource | null) {
  if (source === tokenSource) return;
  tokenSource = source;
  listeners.forEach((l) => l());
}

/** true while a Premium login can drive the browser player. */
export function usePremiumPlayback(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => !!tokenSource && sdkSupported()
  );
}

// Spotify doesn't support the Web Playback SDK on iPhone/iPad browsers.
function sdkSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return !iOS;
}

/** The Premium browser player when available, otherwise the embed. */
export async function createSpotifyController(host: HTMLElement, uri: string): Promise<SpotifyEmbedController> {
  const source = tokenSource;
  if (source && sdkSupported()) {
    const premium = await createPremiumController(source, uri);
    if (premium) return premium;
  }
  return createSpotifyEmbedController(host, uri);
}

// --- The SDK ---------------------------------------------------------------

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: any;
  }
}

let sdkPromise: Promise<boolean> | null = null;

function loadSdk(): Promise<boolean> {
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve) => {
      if (window.Spotify?.Player) return resolve(true);
      window.onSpotifyWebPlaybackSDKReady = () => resolve(true);
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      script.onerror = () => {
        sdkPromise = null;
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }
  return sdkPromise;
}

// Browsers (Safari above all) only let the SDK make sound after a tap/click
// on the page, so every player is activated on the first real user gesture.
const activePlayers = new Set<any>();
let gestureHooked = false;
function hookGesture() {
  if (gestureHooked) return;
  gestureHooked = true;
  const activate = () => activePlayers.forEach((p) => p.activateElement?.().catch?.(() => {}));
  // On touch screens only touchend/pointerup/click count as a gesture.
  (['click', 'touchend', 'pointerup', 'keydown'] as const).forEach((evt) =>
    document.addEventListener(evt, activate, { capture: true, passive: true })
  );
}

/** Resolves to null whenever the SDK can't be used, so the caller falls back. */
async function createPremiumController(source: TokenSource, initialUri: string): Promise<SpotifyEmbedController | null> {
  if (!(await loadSdk()) || !window.Spotify?.Player) return null;
  const player = new window.Spotify.Player({
    name: 'RetroMind',
    volume: 0,
    getOAuthToken: (cb: (token: string) => void) => {
      source().then((t) => t && cb(t));
    },
  });

  const deviceId = await new Promise<string | null>((resolve) => {
    const fail = () => resolve(null);
    const timer = window.setTimeout(fail, 10000);
    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      window.clearTimeout(timer);
      resolve(device_id);
    });
    // Spotify Free (account_error), a bad token or no DRM support.
    ['initialization_error', 'authentication_error', 'account_error'].forEach((evt) =>
      player.addListener(evt, () => {
        window.clearTimeout(timer);
        fail();
      })
    );
    player.connect().then((ok: boolean) => {
      if (!ok) fail();
    });
  });
  if (!deviceId) {
    player.disconnect();
    return null;
  }

  activePlayers.add(player);
  hookGesture();

  let uri = initialUri;
  // A new song/playlist was chosen but not yet sent to Spotify.
  let pending = true;
  let fadeTimer: number | null = null;
  let pollTimer: number | null = null;
  const updateListeners = new Set<(e: any) => void>();

  const stopFade = () => {
    if (fadeTimer !== null) window.clearInterval(fadeTimer);
    fadeTimer = null;
  };

  // Quiet to full over FADE_IN_MS, on a curve that sounds even to the ear.
  let volume = savedVolume();
  const fadeIn = () => {
    stopFade();
    const started = Date.now();
    player.setVolume(0.0001).catch(() => {});
    fadeTimer = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / FADE_IN_MS);
      player.setVolume(Math.max(0.0001, volume * p * p)).catch(() => {});
      if (p >= 1) stopFade();
    }, 150);
  };

  const emit = (state: any) => {
    if (!state) return;
    const t = state.track_window?.current_track;
    const images: any[] = t?.album?.images ?? [];
    const data = {
      isPaused: !!state.paused,
      position: state.position,
      duration: state.duration,
      // What really plays (also inside albums and playlists), for the player.
      track: t
        ? {
            name: t.name as string,
            artists: (t.artists ?? []).map((a: any) => a.name).join(', ') as string,
            image: (images.find((i) => (i.width || 0) >= 200) ?? images[0])?.url ?? null,
          }
        : null,
    };
    updateListeners.forEach((cb) => cb({ data }));
  };
  player.addListener('player_state_changed', emit);
  // The SDK only reports changes; the hooks also want the running position
  // (to know a song was heard and when it ends), like the embed sends it.
  pollTimer = window.setInterval(() => {
    player.getCurrentState().then(emit).catch(() => {});
  }, 1000);

  const startUri = async () => {
    pending = false;
    const token = await source();
    if (!token) return;
    const body = uri.startsWith('spotify:track:') ? { uris: [uri] } : { context_uri: uri };
    await fetch(`${API}/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {});
  };

  return {
    play: () => {
      fadeIn();
      if (pending) startUri();
      else player.resume().catch(() => {});
    },
    resume: () => {
      fadeIn();
      if (pending) startUri();
      else player.resume().catch(() => {});
    },
    pause: () => {
      stopFade();
      player.pause().catch(() => {});
    },
    loadUri: (next: string) => {
      uri = next;
      pending = true;
      stopFade();
      player.pause().catch(() => {});
    },
    seek: (seconds: number) => {
      player.seek(seconds * 1000).catch(() => {});
    },
    setVolume: (v: number) => {
      volume = Math.min(1, Math.max(0, v));
      try {
        localStorage.setItem(VOLUME_KEY, String(volume));
      } catch {
        /* not kept, fine */
      }
      // A fade still running would undo the new level.
      stopFade();
      player.setVolume(Math.max(0.0001, volume)).catch(() => {});
    },
    getVolume: () => volume,
    nextTrack: () => {
      player.nextTrack().catch(() => {});
    },
    previousTrack: () => {
      player.previousTrack().catch(() => {});
    },
    addListener: (event: string, cb: (e: any) => void) => {
      // Already connected, so "ready" is true right away.
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
      stopFade();
      if (pollTimer !== null) window.clearInterval(pollTimer);
      updateListeners.clear();
      activePlayers.delete(player);
      player.disconnect();
    },
  };
}
