import React, { useState } from 'react';
import { MantelClock } from './MantelClock';

// How long the button's burst of sparks plays before the full-screen fade
// begins, and how long that final fade to the app takes — deliberately much
// slower than the burst itself ("quick explosion, then a slow fade").
const EXPLOSION_MS = 550;
const FADE_MS = 2200;

const PARTICLE_COUNT = 22;
const particles = Array.from({ length: PARTICLE_COUNT }, () => {
  const angle = Math.random() * Math.PI * 2;
  const distance = 70 + Math.random() * 110;
  return {
    tx: Math.cos(angle) * distance,
    ty: Math.sin(angle) * distance,
    size: 4 + Math.random() * 7,
    delay: Math.random() * 60,
  };
});

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

  const handleStart = () => {
    if (exploding) return;
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
      <h1 className="splash-title relative -rotate-2 font-display text-5xl md:text-7xl font-bold text-retro-paper tracking-wide mb-6">
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
            {particles.map((p, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="explosion-particle absolute top-1/2 left-1/2 rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  background:
                    'radial-gradient(circle, #fff6d8 0%, #ffb648 45%, #d97706 75%, transparent 100%)',
                  animationDelay: `${p.delay}ms`,
                  ['--tx' as any]: `${p.tx}px`,
                  ['--ty' as any]: `${p.ty}px`,
                }}
              />
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
