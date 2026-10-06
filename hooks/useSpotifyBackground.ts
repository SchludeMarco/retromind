import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createSpotifyEmbedController,
  playlistTracksWithin,
  playlistUri,
  previousSong,
  randomTrack,
  rememberSong,
  songEnded,
  SongHistory,
  trackName,
  trackUri,
  SpotifyEmbedController,
} from '../lib/spotifyEmbed';
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
// The songs come in random order (Marco, 2026-10-05: always hearing the
// same first song got boring), right from the first one. The embed has no
// shuffle, so the hook plays one random song of the playlist after the
// other (lib/spotifyEmbed: playlistTracks, randomTrack); if the track list
// can't be loaded, the playlist runs from the top as before.
// (The fixed opening song "Back to Back" by Pretty Maids was taken out the
// same day at Marco's request, see _removed_content/.)
// Back / play / next live in the small player bar at the bottom centre
// (components/SpotifyBar, 2026-10-06): next = another random song, back =
// the song heard before.

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
  // The current single song played > 1 s (so a stop at 0 means it is over).
  const heardRef = useRef(false);
  // true while a single random song of the decade plays (not the whole
  // playlist): its end starts the next random one.
  const shuffleRef = useRef(false);
  // Track ids per decade playlist, filled as they arrive.
  const tracksRef = useRef<Record<string, string[]>>({});
  // The single song playing right now (null: whole playlist) and the ones
  // before it, for the player bar.
  const [song, setSong] = useState<string | null>(null);
  const historyRef = useRef<SongHistory>({ ids: [] });
  // First playback uses play(); afterwards resume() continues the track.
  const start = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || !enabledRef.current || !unlockedRef.current || isMuted()) return;
    startedRef.current = true;
    userPausedRef.current = false;
    controller.play();
  }, []);

  // A random song of the current decade (the next one follows when it
  // ends), or its whole playlist when there is no track list.
  const playDecade = useCallback(() => {
    const controller = controllerRef.current;
    const playlistId = DECADES_DB[decadeRef.current]?.spotifyPlaylistId;
    if (!controller || !playlistId) return;
    const id = randomTrack(tracksRef.current[playlistId] ?? []);
    if (id) rememberSong(historyRef.current, id);
    setSong(id);
    shuffleRef.current = !!id;
    heardRef.current = false;
    controller.loadUri(id ? trackUri(id) : playlistUri(playlistId));
    startedRef.current = false;
    start();
  }, [start]);

  // "Zurück" in the player bar: the song before, or this one from the start.
  const playPrevious = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    const id = previousSong(historyRef.current);
    userPausedRef.current = false;
    if (!id) {
      controller.seek(0);
      if (isMuted()) setMuted(false);
      else start();
      return;
    }
    setSong(id);
    shuffleRef.current = true;
    heardRef.current = false;
    controller.loadUri(trackUri(id));
    startedRef.current = false;
    if (isMuted()) setMuted(false);
    else start();
  }, [start]);

  // "Weiter" in the player bar: another random song of the decade.
  const playNext = useCallback(() => {
    userPausedRef.current = false;
    if (isMuted()) setMuted(false);
    playDecade();
  }, [playDecade]);

  // Created once consent is there; later decade changes reuse it via
  // loadUri below. Withdrawing consent removes the player again.
  useEffect(() => {
    if (!allowed || !containerRef.current) return;
    const playlistId = DECADES_DB[currentDecade]?.spotifyPlaylistId;
    if (!playlistId) return;
    let cancelled = false;
    const host = containerRef.current;
    // The first song is already a random one: wait (briefly) for the list.
    playlistTracksWithin(playlistId, 3000)
      .then((tracks) => {
        if (tracks.length) tracksRef.current[playlistId] = tracks;
        // The visitor may have switched decades in the meantime.
        const id = DECADES_DB[decadeRef.current]?.spotifyPlaylistId === playlistId ? randomTrack(tracks) : null;
        if (id) rememberSong(historyRef.current, id);
        setSong(id);
        shuffleRef.current = !!id;
        heardRef.current = false;
        return createSpotifyEmbedController(host, id ? trackUri(id) : playlistUri(playlistId));
      })
      .then((controller) => {
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
          const position = Number(data.position) || 0;
          if (position > 1000) heardRef.current = true;
          if (shuffleRef.current && songEnded(data, heardRef.current)) playDecade();
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
    if (!allowed || !playlistId) return;
    const switching = !!controllerRef.current;
    playlistTracksWithin(playlistId, 3000).then((tracks) => {
      if (tracks.length) tracksRef.current[playlistId] = tracks;
      if (switching && decadeRef.current === currentDecade) playDecade();
    });
  }, [currentDecade, allowed, playDecade]);

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
    else if (userPausedRef.current || !enabledRef.current) return;
    else if (startedRef.current) controller.resume();
    else start();
  }, [muted, start]);

  // The welcome screen just finished: start now (its button press already
  // unlocked audio). Going back to the welcome screen (settings) pauses the
  // music; leaving it again carries on with the same song.
  useEffect(() => {
    const controller = controllerRef.current;
    if (!enabled) {
      if (startedRef.current) controller?.pause();
      return;
    }
    if (userPausedRef.current) return;
    if (!startedRef.current) start();
    else if (!isMuted()) controller?.resume();
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

  return {
    containerRef,
    isReady,
    isPlaying,
    togglePlay,
    allowed,
    playNext,
    playPrevious,
    /** "Title · Artist" of the song playing, when known. */
    songTitle: trackName(song),
    /** A single random song plays, so next/back can switch songs. */
    canSkip: !!song,
  };
}
