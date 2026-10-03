import { useCallback, useEffect, useRef, useState } from 'react';
import { createSpotifyEmbedController, playlistUri, SpotifyEmbedController } from '../lib/spotifyEmbed';
import { DECADES_DB } from '../constants';
import { isMuted, setMuted, useMuted } from '../lib/mute';

// Auto-plays the current decade's official Spotify playlist in the
// background, starting the moment the visitor's first tap/click/keypress
// unlocks audio (browsers block any audio before a user gesture, Spotify's
// embed included). Spotify exposes no volume control for this API, so
// playback always runs at whatever level the visitor's own Spotify session
// is set to. The app-wide speaker switch (lib/mute) pauses it instead.
export function useSpotifyBackground(currentDecade: string) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const unlockedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const muted = useMuted();
  const startedRef = useRef(false);
  // First playback uses play(); afterwards resume() continues the track.
  const start = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || !unlockedRef.current || isMuted()) return;
    startedRef.current = true;
    controller.play();
  }, []);

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
      start();
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
    startedRef.current = false;
    start();
  }, [currentDecade, start]);

  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      start();
    };
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
    events.forEach((evt) => document.addEventListener(evt, unlock, { once: true, capture: true }));
    return () => events.forEach((evt) => document.removeEventListener(evt, unlock, { capture: true }));
  }, [start]);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (muted) controller.pause();
    else if (startedRef.current) controller.resume();
    else start();
  }, [muted, start]);

  const togglePlay = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (isPlaying) controller.pause();
    // Pressing play while everything is muted switches the sound back on
    // (the effect above then resumes the playlist).
    else if (isMuted()) setMuted(false);
    else if (startedRef.current) controller.resume();
    else start();
  }, [isPlaying, start]);

  return { containerRef, isReady, isPlaying, togglePlay };
}
