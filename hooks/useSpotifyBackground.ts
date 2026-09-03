import { useCallback, useEffect, useRef, useState } from 'react';
import { createSpotifyEmbedController, playlistUri, SpotifyEmbedController } from '../lib/spotifyEmbed';
import { DECADES_DB } from '../constants';

// Auto-plays the current decade's official Spotify playlist in the
// background, starting the moment the visitor's first tap/click/keypress
// unlocks audio — the same gesture-unlock the ambient synth needs (browsers
// block any audio before a user gesture, Spotify's embed included). Spotify
// exposes no volume control for this API, so playback always runs at
// whatever level the visitor's own Spotify session is set to; only the
// synth's own volume is ours to fade in (see useAudioPlayer).
export function useSpotifyBackground(currentDecade: string) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const unlockedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Created once; later decade changes reuse it via loadUri below.
  useEffect(() => {
    if (!containerRef.current) return;
    const playlistId = DECADES_DB[currentDecade]?.spotifyPlaylistId;
    if (!playlistId) return;
    let cancelled = false;
    createSpotifyEmbedController(containerRef.current, playlistId).then((controller) => {
      if (cancelled) {
        controller.destroy();
        return;
      }
      controllerRef.current = controller;
      controller.addListener('ready', () => setIsReady(true));
      controller.addListener('playback_update', (e: any) => setIsPlaying(!e?.data?.isPaused));
      if (unlockedRef.current) controller.play();
    });
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
    // Deliberately created once (empty deps) — decade switches are handled
    // by the effect below via loadUri, not by recreating the controller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const playlistId = DECADES_DB[currentDecade]?.spotifyPlaylistId;
    const controller = controllerRef.current;
    if (!controller || !playlistId) return;
    controller.loadUri(playlistUri(playlistId));
    if (unlockedRef.current) controller.play();
  }, [currentDecade]);

  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      controllerRef.current?.play();
    };
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
    events.forEach((evt) => document.addEventListener(evt, unlock, { once: true, capture: true }));
    return () => events.forEach((evt) => document.removeEventListener(evt, unlock, { capture: true }));
  }, []);

  const togglePlay = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (isPlaying) controller.pause();
    else controller.resume();
  }, [isPlaying]);

  return { containerRef, isReady, isPlaying, togglePlay };
}
