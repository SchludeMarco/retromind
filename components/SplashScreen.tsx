import React, { useEffect, useRef, useState } from 'react';
import { MantelClock } from './MantelClock';

// How long the button's burst of sparks plays before the full-screen fade
// begins, and how long that final fade to the app takes — deliberately much
// slower than the burst itself ("quick explosion, then a slow fade").
const EXPLOSION_MS = 550;
const FADE_MS = 2200;

// Each spark is a thin streak anchored at the button's center and rotated
// to point outward along its own flight angle — so animating it is just a
// translate along its own local "up" axis, no per-particle trig needed at
// animation time.
const TICK_INTERVAL_MS = 1000;
const TICK_GAIN = 0.06;

const SPARK_COUNT = 36;
const sparks = Array.from({ length: SPARK_COUNT }, () => {
  const angleDeg = Math.random() * 360;
  const distance = 90 + Math.random() * 150;
  const length = 12 + Math.random() * 22;
  return {
    angleDeg,
    distance,
    length,
    width: 1.5 + Math.random() * 1.5,
    delay: Math.random() * 50,
    duration: 420 + Math.random() * 260,
  };
});

// A soft mechanical tick/tock (filtered noise click, alternating pitch like
// a real escapement) — synthesized so there's no audio asset to load.
function playTick(ctx: AudioContext, isTock: boolean) {
  const now = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * 0.04);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = isTock ? 750 : 1400;
  filter.Q.value = 3;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(TICK_GAIN, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(now);
}

// Synthesized so the bang always matches the visual burst exactly, with no
// asset to load — a short sub-bass thump layered under a filtered noise
// crack (same approach as BootOverlay's boot chime).
function playExplosionSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx: AudioContext = new AudioCtx();
    const now = ctx.currentTime;

    const thump = ctx.createOscillator();
    thump.type = 'triangle';
    thump.frequency.setValueAtTime(170, now);
    thump.frequency.exponentialRampToValueAtTime(35, now + 0.35);
    const thumpGain = ctx.createGain();
    thumpGain.gain.setValueAtTime(0.9, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    thump.connect(thumpGain).connect(ctx.destination);
    thump.start(now);
    thump.stop(now + 0.5);

    const bufferSize = Math.floor(ctx.sampleRate * 0.6);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) ** 2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(3200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(250, now + 0.4);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start(now);

    setTimeout(() => ctx.close().catch(() => {}), 900);
  } catch {
    /* Web Audio unsupported or blocked — the visual burst still plays */
  }
}

// The very first thing anyone sees, on top of the whole app (and the
// BootOverlay dissolve reveals it, rather than the intro card underneath).
// Purely a local greeting gate — not part of the persisted session phase —
// so it appears again on every fresh page load.
export const SplashScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [exploding, setExploding] = useState(false);
  const [fading, setFading] = useState(false);
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stopTickingRef = useRef<() => void>(() => {});

  // Ticks for as long as the splash sits there, like an old clock in the
  // room — same "wait for the first tap/click/key" unlock every other
  // synthesized sound in the app uses, since browsers won't allow audio to
  // actually start before that.
  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    let stopped = false;
    let tock = false;
    let intervalId: number | undefined;

    const stop = () => {
      stopped = true;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };
    stopTickingRef.current = stop;

    const startTicking = () => {
      if (stopped || intervalId !== undefined) return;
      intervalId = window.setInterval(() => {
        playTick(ctx, tock);
        tock = !tock;
      }, TICK_INTERVAL_MS);
    };

    const tryStart = () => {
      if (ctx.state === 'running') {
        startTicking();
        return;
      }
      ctx.resume().then(() => {
        if (ctx.state === 'running') startTicking();
      }).catch(() => {});
    };
    tryStart();

    const gestureEvents: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
    gestureEvents.forEach((evt) => document.addEventListener(evt, tryStart, { once: true, capture: true }));

    return () => {
      stop();
      gestureEvents.forEach((evt) => document.removeEventListener(evt, tryStart, { capture: true }));
      ctx.close().catch(() => {});
    };
  }, []);

  const handleStart = () => {
    if (exploding) return;
    stopTickingRef.current();
    if (reduceMotion) {
      setFading(true);
      setTimeout(onStart, FADE_MS);
      return;
    }
    setExploding(true);
    playExplosionSound();
    setTimeout(() => {
      setFading(true);
      setTimeout(onStart, FADE_MS);
    }, EXPLOSION_MS);
  };

  return (
    <div
      className={`fixed inset-0 z-[900] flex flex-col items-center justify-center text-center px-6 bg-[radial-gradient(ellipse_at_center,_#241708_0%,_#120b05_55%,_#040302_100%)] ${
        fading ? 'pointer-events-none' : exploding ? 'pointer-events-none' : 'animate-fadeIn'
      }`}
      style={fading ? { animation: `fadeOut ${FADE_MS}ms ease-out forwards` } : undefined}
    >
      <div className="grainy-bg" />
      <div className="mantel-clock-wrapper absolute top-1/2 left-1/2 w-[140vmin] h-[100vmin] max-w-[1400px] max-h-[1000px] opacity-60 pointer-events-none">
        <MantelClock className="w-full h-full" />
      </div>
      <h1 className="splash-title relative font-display text-5xl md:text-7xl font-bold text-retro-paper tracking-wide mb-6">
        Welcome to <span className="text-red-600">R</span>etro<span className="text-red-600">M</span>ind
      </h1>
      <p className="relative font-elegant text-xl md:text-2xl italic tracking-wide text-[#c9ab78] mb-12">
        The ticket to your past🏳️
      </p>
      <div className="relative inline-block">
        {exploding && (
          <>
            <span
              aria-hidden="true"
              className="explosion-ring absolute top-1/2 left-1/2 w-5 h-5 rounded-full"
              style={{ border: '6px solid rgba(255,196,102,0.85)' }}
            />
            {sparks.map((s, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 w-0 h-0"
                style={{ transform: `rotate(${s.angleDeg}deg)` }}
              >
                <span
                  className="explosion-spark absolute block rounded-full"
                  style={{
                    left: -s.width / 2,
                    top: -s.length,
                    width: s.width,
                    height: s.length,
                    background: 'linear-gradient(to top, rgba(217,119,6,0) 0%, #ffb648 55%, #fff6d8 100%)',
                    boxShadow: '0 0 5px 1px rgba(255, 214, 140, 0.75)',
                    animationDelay: `${s.delay}ms`,
                    animationDuration: `${s.duration}ms`,
                    ['--dist' as any]: `${s.distance}px`,
                  }}
                />
              </span>
            ))}
          </>
        )}
        <button
          onClick={handleStart}
          disabled={exploding}
          className={`relative retro-button bg-retro-amber text-white px-14 py-5 text-2xl font-bold hover:bg-retro-amber-dark shadow-[0_0_28px_rgba(217,119,6,0.55)] transition-opacity duration-150 ${
            exploding ? 'opacity-0' : 'opacity-100'
          }`}
        >
          Let's go!
        </button>
      </div>
      {exploding && (
        <div
          aria-hidden="true"
          className="explosion-flash fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,240,200,0.9), rgba(255,150,40,0.4) 40%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
};
