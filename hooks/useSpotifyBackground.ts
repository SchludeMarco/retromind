import { useCallback, useEffect, useRef, useState } from 'react';
import { createSpotifyEmbedController, playlistUri, trackUri, SpotifyEmbedController } from '../lib/spotifyEmbed';
import { DECADES_DB } from '../constants';
import { isMuted, setMuted, useMuted } from '../lib/mute';
import { useConsent } from '../lib/privacy';

// Auto-plays the current decade's official Spotify playlist in the
// background, starting the moment the visitor's first tap/click/keypress
// unlocks audio (browsers block any audio before a user gesture, Spotify's
// embed included). Spotify exposes no volume control for this API, so
// playback always runs at whatever level the visitor's own Spotify session
// is set to. The app-wide speaker switch (lib/mute) pauses it instead.
// Nothing from Spotify loads until the visitor allowed it (lib/privacy).
// Nor does anything play before `enabled` (the welcome screen with its
// ticking clock and gong has to finish first, see App.tsx).
//
// Each visit opens with a piece of "Back to Back" by Pretty Maids (Marco's
// pick, it fits the app), streamed through the same Spotify player, then
// the decade's playlist takes over.
const INTRO_TRACK_ID = '5t70MlkURJ4JXbkfFtEqKr';
const INTRO_MS = 45_000;

export function useSpotifyBackground(currentDecade: string, enabled = true) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const unlockedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const muted = useMuted();
  const startedRef = useRef(false);
  // Paused with the player's own button: coming back from the background
  // (or switching sound back on) must not restart it.
  const userPausedRef = useRef(false);
  const allowed = useConsent('spotify') === true;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const decadeRef = useRef(currentDecade);
  decadeRef.current = currentDecade;
  // The opening song: 'pending' until it starts, 'playing', then 'done'.
  const introRef = useRef<'pending' | 'playing' | 'done'>('pending');
  const introHeardRef = useRef(false);
  // First playback uses play(); afterwards resume() continues the track.
  const start = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || !enabledRef.current || !unlockedRef.current || isMuted()) return;
    startedRef.current = true;
    userPausedRef.current = false;
    if (introRef.current === 'pending') introRef.current = 'playing';
    controller.play();
  }, []);

  // Opening song over (time is up, or it ended, e.g. Spotify's 30-second
  // preview without a login): switch to the decade's playlist.
  const finishIntro = useCallback(() => {
    if (introRef.current === 'done') return;
    introRef.current = 'done';
    const controller = controllerRef.current;
    const playlistId = DECADES_DB[decadeRef.current]?.spotifyPlaylistId;
    if (!controller || !playlistId) return;
    controller.loadUri(playlistUri(playlistId));
    startedRef.current = false;
    start();
  }, [start]);

  // Created once consent is there; later decade changes reuse it via
  // loadUri below. Withdrawing consent removes the player again.
  useEffect(() => {
    if (!allowed || !containerRef.current) return;
    const playlistId = DECADES_DB[currentDecade]?.spotifyPlaylistId;
    if (!playlistId) return;
    let cancelled = false;
    const firstUri = introRef.current === 'done' ? playlistUri(playlistId) : trackUri(INTRO_TRACK_ID);
    createSpotifyEmbedController(containerRef.current, firstUri).then((controller) => {
      if (cancelled) {
        controller.destroy();
        return;
      }
      controllerRef.current = controller;
      controller.addListener('ready', () => {
        setIsReady(true);
        // play() before the player was ready gets lost: try again now.
        if (startedRef.current && !userPausedRef.current) start();
      });
      controller.addListener('playback_update', (e: any) => {
        const data = e?.data ?? {};
        setIsPlaying(!data.isPaused);
        if (introRef.current !== 'playing') return;
        const position = Number(data.position) || 0;
        const duration = Number(data.duration) || 0;
        if (position > 1000) introHeardRef.current = true;
        const ended =
          introHeardRef.current &&
          ((duration > 0 && position >= duration - 500) || (data.isPaused && position === 0));
        if (position >= INTRO_MS || ended) finishIntro();
      });
      start();
    });
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
      setIsReady(false);
      setIsPlaying(false);
    };
    // Only consent recreates the controller — decade switches are handled
    // by the effect below via loadUri.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  useEffect(() => {
    const playlistId = DECADES_DB[currentDecade]?.spotifyPlaylistId;
    const controller = controllerRef.current;
    if (!controller || !playlistId) return;
    introRef.current = 'done';
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
    else if (userPausedRef.current) return;
    else if (startedRef.current) controller.resume();
    else start();
  }, [muted, start]);

  // The welcome screen just finished: start now (its button press already
  // unlocked audio).
  useEffect(() => {
    if (enabled && !startedRef.current && !userPausedRef.current) start();
  }, [enabled, start]);

  const togglePlay = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (isPlaying) {
      userPausedRef.current = true;
      controller.pause();
      return;
    }
    userPausedRef.current = false;
    // Pressing play while everything is muted switches the sound back on
    // (the effect above then resumes the playlist).
    if (isMuted()) setMuted(false);
    else if (startedRef.current) controller.resume();
    else start();
  }, [isPlaying, start]);

  return { containerRef, isReady, isPlaying, togglePlay, allowed };
}
