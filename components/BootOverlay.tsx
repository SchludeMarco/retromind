import React, { useState, useEffect, useMemo } from 'react';
import { buildPixelCells } from '../lib/pixelGrid';

// --- Boot overlay ---
// Shown once when the app mounts: a pixel grid that starts fully black and
// dissolves cell by cell, at random, so the app seems to slowly wake up
// rather than simply appear — like opening your eyes in a time capsule.
const BOOT_GRID_COLS = 18;
const BOOT_GRID_ROWS = 10;
const BOOT_HOLD_MS = 600; // beat of pure black before anything stirs
const BOOT_MAX_DELAY_MS = 2600;
const BOOT_MIN_DURATION_MS = 1200;
const BOOT_MAX_EXTRA_DURATION_MS = 700;
const BOOT_TOTAL_MS = BOOT_HOLD_MS + BOOT_MAX_DELAY_MS + BOOT_MIN_DURATION_MS + BOOT_MAX_EXTRA_DURATION_MS;
const BOOT_REDUCED_MOTION_MS = 900;
const BOOT_CHIME_PEAK_GAIN = 0.16;
const WELCOME_VOICE_NAME_HINTS = /male|david|daniel|mark|george|guy|fred|arthur|oliver/i;

export const BootOverlay: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [dissolve, setDissolve] = useState(false);
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const cells = useMemo(
    () => buildPixelCells(BOOT_GRID_COLS * BOOT_GRID_ROWS, BOOT_MAX_DELAY_MS, BOOT_MIN_DURATION_MS, BOOT_MAX_EXTRA_DURATION_MS),
    []
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      const end = setTimeout(() => setVisible(false), BOOT_REDUCED_MOTION_MS);
      return () => clearTimeout(end);
    }
    const start = setTimeout(() => setDissolve(true), BOOT_HOLD_MS);
    const end = setTimeout(() => setVisible(false), BOOT_TOTAL_MS);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [prefersReducedMotion]);

  // A soft, slowly swelling hum underscores the dissolve — synthesized so the
  // boot chime always matches the visual timing exactly, with no asset to load.
  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const totalSec = (prefersReducedMotion ? BOOT_REDUCED_MOTION_MS : BOOT_TOTAL_MS) / 1000;

    const buildChime = (ctx: AudioContext) => {
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(BOOT_CHIME_PEAK_GAIN, now + totalSec * 0.35);
      master.gain.setValueAtTime(BOOT_CHIME_PEAK_GAIN, now + totalSec * 0.7);
      master.gain.linearRampToValueAtTime(0, now + totalSec);
      master.connect(ctx.destination);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1500;
      filter.connect(master);

      [110, 220, 330].forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(filter);
        osc.start(now);
        osc.stop(now + totalSec);
      });
    };

    let ctx = new AudioCtx();
    buildChime(ctx);
    ctx.resume().catch(() => {});

    // Once the app is fully revealed, an old, dark voice greets the user —
    // the moment the time capsule actually opens. Speech synthesis needs a
    // user gesture just like audio does, so it waits for both: the boot
    // sequence finishing and the first tap/click/key, whichever is later.
    const synth = window.speechSynthesis;
    let spoken = false;
    let hasGesture = false;
    let hasLoaded = false;
    const trySpeak = () => {
      if (spoken || !hasGesture || !hasLoaded || !synth) return;
      spoken = true;
      const speak = () => {
        try {
          const utter = new SpeechSynthesisUtterance('Welcome');
          utter.lang = 'en-GB';
          utter.pitch = 0.55;
          utter.rate = 0.8;
          const voices = synth.getVoices();
          const voice =
            voices.find((v) => /^en/i.test(v.lang) && WELCOME_VOICE_NAME_HINTS.test(v.name)) ||
            voices.find((v) => /^en/i.test(v.lang));
          if (voice) utter.voice = voice;
          synth.speak(utter);
        } catch {
          /* speech synthesis unsupported or misbehaving — non-fatal */
        }
      };
      if (synth.getVoices().length) speak();
      else synth.addEventListener('voiceschanged', speak, { once: true });
    };
    const loadTimer = setTimeout(() => {
      hasLoaded = true;
      trySpeak();
    }, prefersReducedMotion ? BOOT_REDUCED_MOTION_MS : BOOT_TOTAL_MS);

    // Browsers refuse to actually produce sound until the page has seen a
    // user gesture. If the boot chime was born suspended, the first tap,
    // click or key anywhere on the page unlocks it — better late than never.
    // Some engines (older Safari) never unsuspend a context created outside
    // a gesture at all, so as a last resort build a fresh one right here,
    // synchronously inside the gesture handler.
    let unlocked = false;
    const unlock = () => {
      hasGesture = true;
      trySpeak();
      if (unlocked) return;
      unlocked = true;
      ctx.resume().catch(() => {
        ctx = new AudioCtx();
        buildChime(ctx);
      });
    };
    const gestureEvents: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
    gestureEvents.forEach((evt) => document.addEventListener(evt, unlock, { once: true, capture: true }));

    return () => {
      clearTimeout(loadTimer);
      gestureEvents.forEach((evt) => document.removeEventListener(evt, unlock, { capture: true }));
      ctx.close().catch(() => {});
      synth?.cancel();
    };
  }, [prefersReducedMotion]);

  if (!visible) return null;

  if (prefersReducedMotion) {
    return <div aria-hidden="true" className="fixed inset-0 z-[999] bg-black pointer-events-none animate-fadeOut" />;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[999] grid pointer-events-none"
      style={{ gridTemplateColumns: `repeat(${BOOT_GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${BOOT_GRID_ROWS}, 1fr)` }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          className="bg-black"
          style={{
            opacity: dissolve ? 0 : 1,
            transition: dissolve ? `opacity ${cell.duration}ms ease-in-out ${cell.delay}ms` : 'none',
          }}
        />
      ))}
    </div>
  );
};
