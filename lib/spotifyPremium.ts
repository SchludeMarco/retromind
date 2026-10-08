import { useSyncExternalStore } from 'react';
import { getMusicVolume, onMusicVolume, setMusicVolume } from './musicVolume';
import { createSpotifyEmbedController, SpotifyEmbedController } from './spotifyEmbed';

// Spotify's own browser player (Web Playback SDK) for visitors signed in with
// Spotify Premium (Marco, 2026-10-07: "Die Musik sollte langsam immer lauter
// werden zum Start"). Unlike the embed (lib/spotifyEmbed) it has a volume
// control, so every start and every resume fades in from silence over
// FADE_IN_MS. It plays full songs without the 30-second preview limit, too.
//
// It offers the same controller interface as the embed, so the music hooks
// (useSpotifyBackground, useHallSpotify) don't care which one they drive.
// Everyone else (not signed in, Spotify Free, phones and tablets where Spotify
// doesn't support the SDK, or the SDK failing to start) keeps the embed.

const FADE_IN_MS = 6000;
const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';
const API = 'https://api.spotify.com/v1';

type TokenSource = () => Promise<string | null>;

// --- Who may use it --------------------------------------------------------
// The Spotify login (hooks/useSpotifyAuth) registers a token source here once
// a Premium account with the "streaming" permission is signed in.

let tokenSource: TokenSource | null = null;
const listeners = new Set<() => void>();
// The browser player failed on this device (no sound came, Spotify refused
// to play there): the embed takes over for the rest of the visit.
let broken = false;
function markBroken(reason: string) {
  if (broken) return;
  console.warn('[RetroMind] Spotify-Browserplayer ohne Ton, nehme den eingebetteten Player:', reason);
  broken = true;
  listeners.forEach((l) => l());
}

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
    () => !!tokenSource && sdkSupported() && !broken
  );
}

// Spotify supports the Web Playback SDK only in desktop browsers: on
// iPhone/iPad it doesn't start, and on Android it connects but stays silent
// (Marco, 2026-10-07: no music on his Android in the gaming hall).
function sdkSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return !iOS && !/Android/i.test(ua);
}

/** The Premium browser player when available, otherwise the embed. */
export async function createSpotifyController(host: HTMLElement, uri: string): Promise<SpotifyEmbedController> {
  const source = tokenSource;
  if (source && sdkSupported() && !broken) {
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
  // Something really played on this player (a song with the clock running).
  let loaded = false;
  // After a start, a playing song has to show up soon, or this device can't
  // play through the browser player (Marco, 2026-10-07: "Es kommt keine
  // Musik"); the hooks then switch to the embed (markBroken).
  let confirmTimer: number | null = null;
  const stopConfirm = () => {
    if (confirmTimer !== null) window.clearTimeout(confirmTimer);
    confirmTimer = null;
  };
  const updateListeners = new Set<(e: any) => void>();

  const stopFade = () => {
    if (fadeTimer !== null) window.clearInterval(fadeTimer);
    fadeTimer = null;
  };

  // Quiet to full over FADE_IN_MS, on a curve that sounds even to the ear.
  let volume = getMusicVolume();
  // setLevel's factor and the volume last sent to Spotify.
  let level = 1;
  let applied = 0;
  const apply = (v: number) => {
    applied = Math.max(0.0001, v);
    player.setVolume(applied).catch(() => {});
  };
  // Glides from the current volume to the target (volume x level).
  const glide = (from: number, ms: number) => {
    stopFade();
    const started = Date.now();
    apply(from);
    fadeTimer = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / ms);
      const target = volume * level;
      apply(from + (target - from) * p * p);
      if (p >= 1) stopFade();
    }, 150);
  };
  const fadeIn = () => glide(0, FADE_IN_MS);

  const emit = (state: any) => {
    if (!state) return;
    const t = state.track_window?.current_track;
    if (t && !state.paused) {
      loaded = true;
      stopConfirm();
    }
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

  // Right after "ready" Spotify sometimes doesn't know the new device yet
  // (404), so a failed start is tried again a few times.
  const startUri = async () => {
    pending = false;
    stopConfirm();
    const body = uri.startsWith('spotify:track:') ? { uris: [uri] } : { context_uri: uri };
    let problem = 'kein Token';
    for (let attempt = 0; attempt < 4; attempt++) {
      if (attempt) await new Promise((r) => window.setTimeout(r, 1000 * attempt));
      if (destroyed || pending) return;
      const token = await source();
      if (!token) break;
      const res = await fetch(`${API}/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).catch(() => null);
      if (res && res.ok) {
        confirmTimer = window.setTimeout(() => {
          confirmTimer = null;
          if (!destroyed) markBroken('kein Song läuft nach dem Start');
        }, 10000);
        return;
      }
      problem = res ? `Antwort ${res.status}` : 'Netzwerkfehler';
      // Premium missing or the login lacks the permission: no retry helps.
      if (res && (res.status === 401 || res.status === 403)) break;
    }
    if (!destroyed && !pending) markBroken(problem);
  };
  let destroyed = false;
  // The slider in the gaming settings changes the shared volume too.
  const stopVolume = onMusicVolume((v) => {
    if (v === volume) return;
    volume = v;
    stopFade();
    apply(volume * level);
  });
  // Browsers only let the SDK sound after a gesture; play/resume mostly come
  // from one (the player's play button, the welcome screen's start).
  const activate = () => player.activateElement?.().catch?.(() => {});

  return {
    play: () => {
      activate();
      fadeIn();
      // Nothing came of an earlier start yet: send the song again.
      if (pending || !loaded) startUri();
      else player.resume().catch(() => {});
    },
    resume: () => {
      activate();
      fadeIn();
      if (pending || !loaded) startUri();
      else player.resume().catch(() => {});
    },
    pause: () => {
      stopConfirm();
      stopFade();
      player.pause().catch(() => {});
    },
    loadUri: (next: string) => {
      uri = next;
      pending = true;
      loaded = false;
      stopConfirm();
      stopFade();
      player.pause().catch(() => {});
    },
    seek: (seconds: number) => {
      player.seek(seconds * 1000).catch(() => {});
    },
    setVolume: (v: number) => {
      volume = Math.min(1, Math.max(0, v));
      setMusicVolume(volume);
      // A fade still running would undo the new level.
      stopFade();
      apply(volume * level);
    },
    getVolume: () => volume,
    setLevel: (factor: number, rampMs: number) => {
      if (factor === level) return;
      level = factor;
      // A fade-in still running simply ends at the new level.
      if (fadeTimer === null) glide(applied, rampMs);
    },
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
      destroyed = true;
      stopVolume();
      stopConfirm();
      stopFade();
      if (pollTimer !== null) window.clearInterval(pollTimer);
      updateListeners.clear();
      activePlayers.delete(player);
      player.disconnect();
    },
  };
}
