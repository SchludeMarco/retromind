import { useCallback, useEffect, useRef, useState } from 'react';
import { createSpotifyEmbedController, playlistUri, SpotifyEmbedController } from '../../lib/spotifyEmbed';
import { isMuted, useMuted } from '../../lib/mute';
import { useConsent } from '../../lib/privacy';

// 80s heavy metal from Spotify as the hall's background music (Marco,
// 2026-10-05), through the same Spotify player as the Zeitreise
// (lib/spotifyEmbed). Nothing from Spotify loads before the visitor allowed
// it on this domain (lib/privacy, asked in the hall). Once allowed, the
// player is created right away on the entrance, so it is ready when the
// door opens; it plays while `enabled` (in the hall, music on, no video
// running) and follows the app-wide speaker switch (lib/mute), which also
// counts as off while the page is in the background.
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
  const shouldPlay = useRef(false);
  shouldPlay.current = enabled && !muted;

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

  useEffect(() => {
    if (!allowed || !wanted || !containerRef.current) return;
    let cancelled = false;
    createSpotifyEmbedController(containerRef.current, playlistUri(HALL_PLAYLIST_ID)).then((controller) => {
      if (cancelled) {
        controller.destroy();
        return;
      }
      controllerRef.current = controller;
      // play() before the player was ready gets lost: try again now.
      controller.addListener('ready', () => {
        setReady(true);
        startedRef.current = false;
        sync();
      });
      sync();
    });
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
      startedRef.current = false;
      setReady(false);
    };
  }, [allowed, wanted, sync]);

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

  useEffect(sync, [enabled, muted, sync]);

  /** true while Spotify stands in for the chiptune music. */
  const active = wanted && allowed;
  return { containerRef, ready, allowed, active };
}
