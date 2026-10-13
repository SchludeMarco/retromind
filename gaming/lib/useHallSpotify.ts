import { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import { createSpotifyController, giveUpPremium, usePremiumPlayback } from '../../lib/spotifyPremium';
import { isMuted, setMuted, useMuted } from '../../lib/mute';
import { useConsent } from '../../lib/privacy';
import { createMusicStatus, reportPlayback } from '../../lib/musicStatus';
import { SpotifyHit } from '../../lib/spotifyApi';
import { tr } from '../../lib/i18n';

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

// Signed in with Premium, the song that plays inside is already heard in
// front of the door (Marco, 2026-10-07 and 2026-10-08), muffled and bassy as
// through the wall, and carries on inside. Spotify's own player can't be
// muffled, so at the door the song's preview clip plays through a filter
// (gaming/lib/street.ts) and Spotify starts the same song once you are in.

// The music must never stop (Marco, 2026-10-13: "die Musik muss irgendwie
// immer weiter laufen"). A watchdog checks that Spotify's clock really runs
// whenever music should play. Silent for STALL_MS (the player never loaded,
// an ad blocker swallowed it, the song hung or Spotify stopped it): first
// another song, and if that stays silent too the hall's own chiptune music
// takes over (`fallback`, played by GamingApp). Every PROBE_MS, or on next/
// play in the player, Spotify gets another try while the chiptune keeps
// going; once a song really runs, Spotify is back. A pause pressed in the
// player, the speaker switch and the music setting are always respected.
const STALL_MS = 7000;
const PROBE_MS = 120000;
const WATCH_EVERY_MS = 1500;

/**
 * `enabled`: plays in the hall (music on, no video). `outside`: the visitor
 * stands at the entrance with music on; with Premium the hook names the song
 * for the door (`doorSong`). `premiumAccount`: signed in with a Spotify Premium account, also on devices
 * where the embed plays (phones).
 */
export function useHallSpotify(wanted: boolean, enabled: boolean, outside = false, premiumAccount = false) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const [ready, setReady] = useState(false);
  const allowed = useConsent('spotify') === true;
  // Signed in with Premium: Spotify's own player, which fades in.
  const premium = usePremiumPlayback();
  const doorMusic = premium || premiumAccount;
  const atDoor = outside && doorMusic;
  const on = enabled;
  const muted = useMuted();
  const startedRef = useRef(false);
  // Browsers block audio until the first tap or key press.
  const unlockedRef = useRef(false);
  // Paused with the player bar: stays paused until play is pressed again.
  const [userPaused, setUserPaused] = useState(false);
  const userPausedRef = useRef(userPaused);
  userPausedRef.current = userPaused;
  // Spotify stays silent: the own music plays (see STALL_MS above).
  const [fallback, setFallback] = useState(false);
  const fallbackRef = useRef(false);
  fallbackRef.current = fallback;
  // In fallback: Spotify is being tried again (the chiptune keeps playing).
  const probingRef = useRef(false);
  // Watchdog: when Spotify's clock last moved (or a start/grace began),
  // the last position seen, failed recoveries in a row, the last probe.
  const aliveAtRef = useRef(Date.now());
  const lastPosRef = useRef(-1);
  const strikesRef = useRef(0);
  const probeAtRef = useRef(0);
  const kick = () => {
    aliveAtRef.current = Date.now();
  };
  const shouldPlay = useRef(false);
  shouldPlay.current = on && !muted && !userPaused && (!fallback || probingRef.current);
  const [playing, setPlaying] = useState(false);
  const [song, setSong] = useState<string | null>(null);
  const historyRef = useRef<SongHistory>({ ids: [] });
  const tracksRef = useRef<string[]>([]);
  // The current song played > 1 s (so a stop at 0 means it is over).
  const heardRef = useRef(false);
  // Position, song and volume for the open player panel.
  const statusRef = useRef(createMusicStatus());
  // Something other than the hall's metal plays (Marco, 2026-10-07): a
  // search pick from the player, or (auto) the soundtrack of the game that
  // is open. null: the hall's own music.
  const [special, setSpecial] = useState<(SpotifyHit & { auto: boolean }) | null>(null);
  const specialRef = useRef(special);
  specialRef.current = special;

  // First playback uses play(); afterwards resume() continues the song.
  const sync = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (!shouldPlay.current || isMuted()) {
      if (startedRef.current) controller.pause();
      return;
    }
    if (!unlockedRef.current) return;
    kick();
    if (startedRef.current) controller.resume();
    else controller.play();
    startedRef.current = true;
  }, []);

  const loadSong = useCallback(
    (id: string) => {
      const controller = controllerRef.current;
      if (!controller) return;
      setSpecial(null);
      setSong(id);
      heardRef.current = false;
      lastPosRef.current = -1;
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
    shouldPlay.current = on && !isMuted() && (!fallbackRef.current || probingRef.current);
  };

  // Spotify is silent and the own music plays: try Spotify again with a new
  // song while the chiptune goes on (the watchdog decides how it went).
  const probe = useCallback(() => {
    probeAtRef.current = Date.now();
    if (!controllerRef.current) return;
    probingRef.current = true;
    shouldPlay.current = on && !isMuted() && !userPausedRef.current;
    strikesRef.current = 0;
    const id = randomTrack(tracksRef.current);
    if (id) {
      rememberSong(historyRef.current, id);
      loadSong(id);
    } else {
      startedRef.current = false;
      sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSong, sync, on]);

  const playNext = useCallback(() => {
    wantSound();
    if (fallbackRef.current) return probe();
    const sp = specialRef.current;
    if (sp && sp.kind !== 'track' && controllerRef.current?.nextTrack) {
      controllerRef.current.nextTrack();
      sync();
      return;
    }
    nextSong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextSong, probe, on]);

  const playPrevious = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    wantSound();
    if (fallbackRef.current) return probe();
    if (specialRef.current) {
      if (specialRef.current.kind !== 'track' && controller.previousTrack) controller.previousTrack();
      else controller.seek(0);
      sync();
      return;
    }
    const id = previousSong(historyRef.current);
    if (id) loadSong(id);
    else {
      controller.seek(0);
      sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSong, sync, probe, on]);

  // A search pick (or, with `auto`, the soundtrack of the open game): plays
  // instead of the hall's metal. A single song goes back to the metal when
  // it ends; an album or playlist keeps running.
  const playUri = useCallback(
    (hit: SpotifyHit, auto = false) => {
      const controller = controllerRef.current;
      if (!controller) return;
      if (!auto) wantSound();
      // A search pick is a new try for Spotify, also while the own music plays.
      if (fallbackRef.current && !auto) {
        probingRef.current = true;
        probeAtRef.current = Date.now();
        shouldPlay.current = on && !isMuted();
      }
      setSpecial({ ...hit, auto });
      setSong(null);
      heardRef.current = false;
      controller.loadUri(hit.uri);
      startedRef.current = false;
      sync();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sync, on]
  );

  /** Back to the hall's own music. */
  const backToTheme = useCallback(() => {
    if (specialRef.current) nextSong();
  }, [nextSong]);

  const seek = useCallback((seconds: number) => controllerRef.current?.seek(seconds), []);
  const setVolume = useCallback((v: number) => {
    controllerRef.current?.setVolume?.(v);
    statusRef.current.set({ volume: v });
  }, []);

  const togglePlay = useCallback(() => {
    // The own music stands in: the button pauses and resumes it.
    if (fallbackRef.current && !probingRef.current) {
      if (userPausedRef.current) wantSound();
      else setUserPaused(true);
      return;
    }
    if (playing) {
      shouldPlay.current = false;
      setUserPaused(true);
      sync();
      return;
    }
    wantSound();
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, sync, on]);

  useEffect(() => {
    if (!allowed || !wanted || !containerRef.current) return;
    let cancelled = false;
    const host = containerRef.current;
    playlistTracksWithin(HALL_PLAYLIST_ID, 4000)
      .then((tracks) => {
        tracksRef.current = tracks;
        const first = randomTrack(tracks);
        if (first) rememberSong(historyRef.current, first);
        // A new player (e.g. the embed taking over) starts with the own music.
        setSpecial(null);
        setSong(first);
        return createSpotifyController(host, first ? trackUri(first) : playlistUri(HALL_PLAYLIST_ID));
      })
      .then((controller) => {
        if (cancelled) {
          controller.destroy();
          return;
        }
        controllerRef.current = controller;
        kick();
        lastPosRef.current = -1;
        statusRef.current.set({ volume: controller.getVolume?.() ?? null, track: null });
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
          reportPlayback(statusRef.current, data);
          // Spotify's clock moves: it really plays (watchdog).
          const pos = Number(data.position) || 0;
          if (!data.isPaused && pos > 0 && pos !== lastPosRef.current) {
            kick();
            strikesRef.current = 0;
            if (fallbackRef.current) {
              probingRef.current = false;
              setFallback(false);
            }
          }
          lastPosRef.current = pos;
          if (!tracksRef.current.length) return;
          if ((Number(data.position) || 0) > 1000) heardRef.current = true;
          const sp = specialRef.current;
          if ((!sp || sp.kind === 'track') && songEnded(data, heardRef.current)) nextSong();
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
  }, [allowed, wanted, premium, sync, nextSong]);

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

  useEffect(sync, [on, muted, userPaused, fallback, sync]);

  // The watchdog (see STALL_MS). Only counts while music should play: in the
  // hall, music on, sound on, not paused, page visible, audio unlocked.
  const active = wanted && allowed;
  useEffect(() => {
    if (!active) {
      setFallback(false);
      probingRef.current = false;
      return;
    }
    const timer = window.setInterval(() => {
      const listening = on && !isMuted() && !userPausedRef.current && unlockedRef.current && !document.hidden;
      if (!listening) return kick();
      const now = Date.now();
      if (fallbackRef.current && !probingRef.current) {
        if (now - probeAtRef.current >= PROBE_MS) probe();
        return kick();
      }
      if (now - aliveAtRef.current < STALL_MS) return;
      kick();
      // The track list may have failed to load: ask again for the next try.
      if (!tracksRef.current.length) {
        playlistTracksWithin(HALL_PLAYLIST_ID, 4000).then((t) => {
          if (t.length && !tracksRef.current.length) tracksRef.current = t;
        });
      }
      const controller = controllerRef.current;
      if (probingRef.current) {
        // The new try stayed silent too: the own music goes on.
        probingRef.current = false;
        controller?.pause();
        console.warn('[RetroMind] Spotify still silent, own music keeps playing');
        return;
      }
      // Spotify's browser player (Premium) stays silent: the embed takes over
      // (the hook rebuilds the player), before anything else is tried.
      if (controller?.setVolume && giveUpPremium('no sound in the hall')) return;
      strikesRef.current += 1;
      if (controller && strikesRef.current < 2) {
        console.warn('[RetroMind] Spotify silent, trying another song');
        if (specialRef.current || !tracksRef.current.length) {
          startedRef.current = false;
          sync();
        } else nextSong();
        return;
      }
      console.warn('[RetroMind] Spotify silent, own music takes over');
      strikesRef.current = 0;
      probeAtRef.current = now;
      controller?.pause();
      setFallback(true);
    }, WATCH_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [active, on, sync, nextSong, probe]);

  return {
    containerRef,
    /** Premium at the door: the song that will play inside, heard muffled outside. */
    doorSong: atDoor && active && song && !special ? { id: song, name: trackName(song) } : null,
    /** Premium's browser player drives the hall music (with volume control). */
    premium: premium && active,
    ready,
    allowed,
    active,
    /** Spotify is silent: the hall's own music plays instead (GamingApp). */
    fallback: active && fallback,
    /** Paused with the player's button. */
    paused: userPaused,
    playing: fallback ? on && !muted && !userPaused : playing,
    togglePlay,
    playNext,
    playPrevious,
    /** "Title · Artist" of the song playing, when known. */
    songTitle: fallback
      ? tr('Own arcade music · Spotify is not responding', 'Eigene Hallenmusik · Spotify antwortet nicht')
      : special
        ? `${special.name} · ${special.sub}`
        : trackName(song),
    canSkip: !!song || !!special || fallback,
    status: statusRef.current,
    playUri,
    backToTheme,
    special,
    seek,
    setVolume,
  };
}
