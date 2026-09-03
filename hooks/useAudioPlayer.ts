import { useCallback, useEffect, useRef, useState } from 'react';
import { startAmbientPad, AmbientVoice } from '../lib/ambientSynth';
import { SFX } from '../lib/sfx';

// Owns the generative ambient-music synth, the click/success sound effects,
// and the volume/decade controls surfaced in the settings modal. Music
// starts right at app boot and loops forever (it's a sustained synthesized
// pad, not a file); a time travel (decade change) just crossfades to a new
// chord underneath it.
export function useAudioPlayer(currentAudioDecade: string) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [volume, setVolume] = useState(0.3);
  // True while music is *meant* to be playing but the browser is refusing to
  // let audio actually start (needs a user gesture first) — lets the UI tell
  // "silently blocked" apart from "actually playing".
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);

  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const voiceRef = useRef<AmbientVoice | null>(null);
  const decadeRef = useRef(currentAudioDecade);
  decadeRef.current = currentAudioDecade;
  // Only the very first activation gets the slow 10s fade-in from silence;
  // later re-activations (e.g. toggling the radio back on) ramp quickly.
  const hasFadedInRef = useRef(false);

  // Stable identity (reads volume from a ref) so effects that depend on it
  // don't re-fire when the volume slider moves.
  const playSFX = useCallback((type: keyof typeof SFX) => {
    if (!sfxRef.current) return;
    sfxRef.current.src = SFX[type];
    sfxRef.current.volume = Math.min(volumeRef.current * 5, 0.4);
    sfxRef.current.currentTime = 0;
    sfxRef.current.play().catch(() => {});
  }, []);

  const ensureContext = useCallback((): AudioContext | null => {
    if (ctxRef.current) return ctxRef.current;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx: AudioContext = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0; // starts silent — first activation fades in, see applyGain
    const compressor = ctx.createDynamicsCompressor(); // gentle safety limiter
    master.connect(compressor);
    compressor.connect(ctx.destination);
    ctxRef.current = ctx;
    masterGainRef.current = master;
    return ctx;
  }, []);

  const startVoiceForCurrentDecade = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master || ctx.state !== 'running') return;
    voiceRef.current?.stop(1.2);
    voiceRef.current = startAmbientPad(ctx, master, decadeRef.current);
  }, []);

  // Ramps the master gain up to the current target volume — 10s from
  // silence on the very first activation (app start), a quick 0.2s nudge on
  // any later one (e.g. toggling the radio back on).
  const fadeUpToVolume = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;
    const duration = hasFadedInRef.current ? 0.2 : 10;
    hasFadedInRef.current = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(volumeRef.current, ctx.currentTime + duration);
  }, []);

  // Browsers refuse to actually run an AudioContext before the page has seen
  // a user gesture — attempt resume(), and note whether it actually worked.
  const tryStart = useCallback(() => {
    const ctx = ensureContext();
    if (!ctx) return;
    if (ctx.state === 'running') {
      setIsAudioBlocked(false);
      if (!voiceRef.current) {
        startVoiceForCurrentDecade();
        fadeUpToVolume();
      }
      return;
    }
    ctx
      .resume()
      .then(() => {
        const running = ctx.state === 'running';
        setIsAudioBlocked(!running);
        if (running) {
          startVoiceForCurrentDecade();
          fadeUpToVolume();
        }
      })
      .catch(() => setIsAudioBlocked(true));
  }, [ensureContext, startVoiceForCurrentDecade, fadeUpToVolume]);

  useEffect(() => {
    if (isMusicPlaying) {
      tryStart();
      return;
    }
    voiceRef.current?.stop(1);
    voiceRef.current = null;
    setIsAudioBlocked(false);
  }, [isMusicPlaying, tryStart]);

  // The first tap, click or key anywhere unlocks it — same trick BootOverlay
  // uses for its own audio.
  useEffect(() => {
    if (!isMusicPlaying) return;
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
    events.forEach((evt) => document.addEventListener(evt, tryStart, { once: true, capture: true }));
    return () => events.forEach((evt) => document.removeEventListener(evt, tryStart, { capture: true }));
  }, [isMusicPlaying, tryStart]);

  // Time travel: crossfade to the new decade's chord.
  useEffect(() => {
    if (isMusicPlaying && ctxRef.current?.state === 'running') startVoiceForCurrentDecade();
  }, [currentAudioDecade]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.2);
  }, [volume]);

  useEffect(
    () => () => {
      voiceRef.current?.stop(0.05);
      ctxRef.current?.close().catch(() => {});
    },
    []
  );

  return {
    sfxRef,
    isMusicPlaying, setIsMusicPlaying,
    isAudioBlocked, resumeBlockedPlayback: tryStart,
    volume, setVolume,
    playSFX,
  };
}
