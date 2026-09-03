import { useCallback, useEffect, useRef, useState } from 'react';
import { DECADES_DB } from '../constants';
import { SFX } from '../lib/sfx';

// Owns the ambient-music <audio> element, the click/success sound effects,
// and the volume/decade controls for the fixed RetroPlayer widget.
export function useAudioPlayer(currentAudioDecade: string) {
  // Calm ambient music starts right at app boot and loops continuously; a
  // time travel (decade change) just swaps the track underneath it.
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [volume, setVolume] = useState(0.2);
  // True while music is *meant* to be playing but the browser is refusing
  // (autoplay-with-sound needs a gesture first) — lets the UI tell "silently
  // blocked" apart from "actually playing", instead of just spinning either way.
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  // Stable identity (reads volume from a ref) so effects that depend on it
  // don't re-fire when the volume slider moves.
  const playSFX = useCallback((type: keyof typeof SFX) => {
    if (!sfxRef.current) return;
    sfxRef.current.src = SFX[type];
    sfxRef.current.volume = Math.min(volumeRef.current * 5, 0.4);
    sfxRef.current.currentTime = 0;
    sfxRef.current.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    const track = DECADES_DB[currentAudioDecade]?.audioUrl;
    if (track && audioRef.current.src !== track) {
      audioRef.current.src = track;
      audioRef.current.load();
      if (isMusicPlaying) audioRef.current.play().catch(() => setIsAudioBlocked(true));
    }
  }, [currentAudioDecade]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) audioRef.current.play().catch(() => setIsAudioBlocked(true));
    else {
      audioRef.current.pause();
      setIsAudioBlocked(false);
    }
  }, [isMusicPlaying]);

  // The 'playing' event is the one reliable signal that sound is actually
  // coming out — clears the "blocked" flag whenever it fires.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlaying = () => setIsAudioBlocked(false);
    audio.addEventListener('playing', onPlaying);
    return () => audio.removeEventListener('playing', onPlaying);
  }, []);

  // Browsers refuse actual autoplay-with-sound before the page has seen a
  // user gesture, so the initial play() attempt above is silently swallowed.
  // The first tap, click or key anywhere unlocks it — same trick BootOverlay
  // uses for its own audio.
  useEffect(() => {
    if (!isMusicPlaying) return;
    const resume = () => {
      if (audioRef.current?.paused) audioRef.current.play().catch(() => setIsAudioBlocked(true));
    };
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
    events.forEach((evt) => document.addEventListener(evt, resume, { once: true, capture: true }));
    return () => events.forEach((evt) => document.removeEventListener(evt, resume, { capture: true }));
  }, [isMusicPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // For the player widget's toggle button: while blocked, a tap should retry
  // playback (it's a real gesture) rather than flip the desired state to off.
  const resumeBlockedPlayback = useCallback(() => {
    if (audioRef.current?.paused) audioRef.current.play().catch(() => setIsAudioBlocked(true));
  }, []);

  return {
    audioRef, sfxRef,
    isMusicPlaying, setIsMusicPlaying,
    isAudioBlocked, resumeBlockedPlayback,
    volume, setVolume,
    playSFX,
  };
}
