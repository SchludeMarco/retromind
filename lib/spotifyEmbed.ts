// Thin wrapper around Spotify's public iFrame API
// (https://developer.spotify.com/documentation/embeds/reference) — lets us
// load a decade's playlist and call play()/pause() from our own code.
//
// Important limitation: this API exposes no volume control at all (that
// only exists in the Web Playback SDK, which needs a Premium OAuth login).
// So unlike the ambient synth, we can never fade or cap how loud Spotify
// plays — it always plays at whatever level the visitor's own Spotify
// session is set to.

export interface SpotifyEmbedController {
  play: () => void;
  pause: () => void;
  resume: () => void;
  loadUri: (uri: string) => void;
  addListener: (event: string, cb: (e: any) => void) => void;
  removeListener: (event: string, cb?: (e: any) => void) => void;
  destroy: () => void;
}

interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string; height?: string },
    callback: (controller: SpotifyEmbedController) => void
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void;
  }
}

let apiPromise: Promise<SpotifyIFrameAPI> | null = null;

// Loads https://open.spotify.com/embed/iframe-api/v1 exactly once, however
// many controllers end up being created.
function loadSpotifyIframeApi(): Promise<SpotifyIFrameAPI> {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      window.onSpotifyIframeApiReady = (IFrameAPI) => resolve(IFrameAPI);
      const script = document.createElement('script');
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

export function playlistUri(playlistId: string): string {
  return `spotify:playlist:${playlistId}`;
}

export function trackUri(trackId: string): string {
  return `spotify:track:${trackId}`;
}

/** `uri` is a full Spotify URI (see playlistUri / trackUri). */
export function createSpotifyEmbedController(
  element: HTMLElement,
  uri: string
): Promise<SpotifyEmbedController> {
  return loadSpotifyIframeApi().then(
    (IFrameAPI) =>
      new Promise((resolve) => {
        IFrameAPI.createController(element, { uri }, resolve);
      })
  );
}

// --- Random order ---------------------------------------------------------
// The embed has no shuffle: a playlist always starts with its first song and
// then runs in order. So the app asks its own server for the playlist's
// track ids (api/spotify-tracks.js) and plays one random song after the
// other. An empty list (server unreachable, Spotify changed its page) means:
// play the playlist itself, as before.

const trackLists = new Map<string, Promise<string[]>>();

/** Track ids of a playlist, loaded once per visit. Never rejects. */
export function playlistTracks(playlistId: string): Promise<string[]> {
  let list = trackLists.get(playlistId);
  if (!list) {
    list = fetch(`/api/spotify-tracks?playlist=${encodeURIComponent(playlistId)}`)
      .then((r) => (r.ok ? r.json() : { tracks: [] }))
      .then((d) => (Array.isArray(d?.tracks) ? d.tracks.filter((t: unknown) => typeof t === 'string') : []))
      .catch(() => []);
    trackLists.set(playlistId, list);
  }
  return list;
}

/** Waits at most `ms` for the track list, so the music never hangs on it. */
export function playlistTracksWithin(playlistId: string, ms: number): Promise<string[]> {
  return Promise.race([playlistTracks(playlistId), new Promise<string[]>((r) => setTimeout(() => r([]), ms))]);
}

const recent: string[] = [];

/** A random track id, avoiding the songs heard most recently. */
export function randomTrack(ids: string[]): string | null {
  if (!ids.length) return null;
  const fresh = ids.filter((id) => !recent.includes(id));
  const pool = fresh.length ? fresh : ids;
  const id = pool[Math.floor(Math.random() * pool.length)];
  recent.push(id);
  if (recent.length > 40) recent.shift();
  return id;
}

/**
 * Whether a playback_update says the current single song is over: it either
 * reached its end or Spotify stopped it and jumped back to 0 (that is how a
 * 30-second preview without login ends). `heard` = it played > 1 s already.
 */
export function songEnded(data: { isPaused?: boolean; position?: number; duration?: number }, heard: boolean): boolean {
  const position = Number(data.position) || 0;
  const duration = Number(data.duration) || 0;
  return heard && ((duration > 0 && position >= duration - 500) || (!!data.isPaused && position === 0));
}
