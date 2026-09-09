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

export function createSpotifyEmbedController(
  element: HTMLElement,
  playlistId: string
): Promise<SpotifyEmbedController> {
  return loadSpotifyIframeApi().then(
    (IFrameAPI) =>
      new Promise((resolve) => {
        IFrameAPI.createController(element, { uri: playlistUri(playlistId) }, resolve);
      })
  );
}
