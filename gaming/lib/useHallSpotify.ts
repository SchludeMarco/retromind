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
  SpotifyEmbedController,
  trackName,
  trackUri,
} from '../../lib/spotifyEmbed';
import { isMuted, setMuted, useMuted } from '../../lib/mute';
import { useConsent } from '../../lib/privacy';

// 80s heavy metal from Spotify as the hall's background music (Marco,
// 2026-10-05), through the same Spotify player as the Zeitreise
// (lib/spotifyEmbed). Nothing from Spotify loads before the visitor allowed
// it on this domain (lib/privacy, asked in the hall). Once allowed, the
// player is created right away on the entrance, so it is ready when the
// door opens; it plays while `enabled` (in the hall, music on, no video
// running) and follows the app-wide speaker switch (lib/mute), which also
// counts as off while the page is in the background.
// The songs come in random order, one after the other (randomTrack); only
// if the track list can't be loaded does the playlist run from the top.
// The small player bar at the bottom centre (components/SpotifyBar,
// 2026-10-06) pauses it and skips back and forth: next = another random
// song, back = the song heard before.
// "The 100 Best Metal Songs of 80s" (The Eighties Guy).
export const HALL_PLAYLIST_ID = '1E2hgVebCef1A0yXos0aQP';

export function useHallSpotify(wanted: boolean, enabled: boolean) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const [ready, setReady] = useState(false);
  const allowed = useConsent('spotify') === true;
  const muted = useMuted();
  const startedRef = useRef(false);
  // Browsers block audio until the first tap or key press.
  const unlockedRef = useRef(false);
  // Paused with the player bar: stays paused until play is pressed again.
  const [userPaused, setUserPaused] = useState(false);
  const shouldPlay = useRef(false);
  shouldPlay.current = enabled && !muted && !userPaused;
  const [playing, setPlaying] = useState(false);
  const [song, setSong] = useState<string | null>(null);
  const historyRef = useRef<SongHistory>({ ids: [] });
  const tracksRef = useRef<string[]>([]);
  // The current song played > 1 s (so a stop at 0 means it is over).
  const heardRef = useRef(false);

  // First playback uses play(); afterwards resume() continues the song.
  const sync = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (!shouldPlay.current || isMuted()) {
      if (startedRef.current) controller.pause();
      return;
    }
    if (!unlockedRef.current) return;
    if (startedRef.current) controller.resume();
    else controller.play();
    startedRef.current = true;
  }, []);

  const loadSong = useCallback(
    (id: string) => {
      const controller = controllerRef.current;
      if (!controller) return;
      setSong(id);
      heardRef.current = false;
      controller.loadUri(trackUri(id));
      startedRef.current = false;
      sync();
    },
    [sync]
  );

  const nextSong = useCallback(() => {
    const id = randomTrack(tracksRef.current);
    if (!controllerRef.current || !id) return;
    rememberSong(historyRef.current, id);
    loadSong(id);
  }, [loadSong]);

  // Player bar: a button press means "I want to hear it", so it lifts a
  // pause and the app-wide mute (the music setting itself stays as it is).
  const wantSound = () => {
    if (isMuted()) setMuted(false);
    setUserPaused(false);
    shouldPlay.current = enabled && !isMuted();
  };

  const playNext = useCallback(() => {
    wantSound();
    nextSong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextSong, enabled]);

  const playPrevious = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    wantSound();
    const id = previousSong(historyRef.current);
    if (id) loadSong(id);
    else {
      controller.seek(0);
      sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSong, sync, enabled]);

  const togglePlay = useCallback(() => {
    if (playing) {
      shouldPlay.current = false;
      setUserPaused(true);
      sync();
      return;
    }
    wantSound();
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, sync, enabled]);

  useEffect(() => {
    if (!allowed || !wanted || !containerRef.current) return;
    let cancelled = false;
    const host = containerRef.current;
    playlistTracksWithin(HALL_PLAYLIST_ID, 4000)
      .then((tracks) => {
        tracksRef.current = tracks;
        const first = randomTrack(tracks);
        if (first) rememberSong(historyRef.current, first);
        setSong(first);
        return createSpotifyEmbedController(host, first ? trackUri(first) : playlistUri(HALL_PLAYLIST_ID));
      })
      .then((controller) => {
        if (cancelled) {
          controller.destroy();
          return;
        }
        controllerRef.current = controller;
        heardRef.current = false;
        // play() before the player was ready gets lost: try again now.
        controller.addListener('ready', () => {
          setReady(true);
          startedRef.current = false;
          sync();
        });
        controller.addListener('playback_update', (e: any) => {
          const data = e?.data ?? {};
          setPlaying(!data.isPaused);
          if (!tracksRef.current.length) return;
          if ((Number(data.position) || 0) > 1000) heardRef.current = true;
          if (songEnded(data, heardRef.current)) nextSong();
        });
        sync();
      });
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
      startedRef.current = false;
      setReady(false);
      setPlaying(false);
    };
  }, [allowed, wanted, sync, nextSong]);

  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      sync();
    };
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
    events.forEach((evt) => document.addEventListener(evt, unlock, { once: true, capture: true }));
    return () => events.forEach((evt) => document.removeEventListener(evt, unlock, { capture: true }));
  }, [sync]);

  useEffect(sync, [enabled, muted, userPaused, sync]);

  /** true while Spotify stands in for the chiptune music. */
  const active = wanted && allowed;
  return {
    containerRef,
    ready,
    allowed,
    active,
    playing,
    togglePlay,
    playNext,
    playPrevious,
    /** "Title · Artist" of the song playing, when known. */
    songTitle: trackName(song),
    canSkip: !!song,
  };
}
