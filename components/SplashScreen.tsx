import React, { useEffect, useState } from 'react';
import { MantelClock } from './MantelClock';
import { startTicking, playGong } from '../lib/clockSounds';
import { useMuted } from '../lib/mute';
import { LoudSign } from './LoudSign';
import { tr } from '../lib/i18n';

// After the start button: the screen turns white with the gong's strike,
// stays white for a breath, then slowly gives way to the app underneath.
const WHITE_IN_MS = 180;
const WHITE_HOLD_MS = 900;
const FADE_MS = 3200;

// The very first thing anyone sees, on top of the whole app (and the
// BootOverlay dissolve reveals it, rather than the intro card underneath).
// Purely a local greeting gate — not part of the persisted session phase —
// so it appears again on every fresh page load. The mantel clock ticks the
// whole time (lib/clockSounds.ts); the start button takes the look of the
// chosen design (.splash-start in index.css).
// onReveal fires as the white starts giving way to the main menu (music
// begins there), onStart once the splash is gone.
export const SplashScreen: React.FC<{ onStart: () => void; onReveal?: () => void }> = ({ onStart, onReveal }) => {
  const [struck, setStruck] = useState(false);
  const [fading, setFading] = useState(false);
  const [waitingForTouch, setWaitingForTouch] = useState(false);
  const muted = useMuted();
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (struck) return;
    return startTicking(setWaitingForTouch);
  }, [struck]);

  const handleStart = () => {
    if (struck) return;
    setStruck(true);
    playGong();
    setTimeout(() => {
      setFading(true);
      onReveal?.();
      setTimeout(onStart, FADE_MS);
    }, WHITE_IN_MS + WHITE_HOLD_MS);
  };

  return (
    <div
      className={`fixed inset-0 z-[900] flex flex-col items-center justify-center text-center px-6 bg-[radial-gradient(ellipse_at_center,_#241708_0%,_#120b05_55%,_#040302_100%)] ${
        struck ? 'pointer-events-none' : 'animate-fadeIn'
      }`}
      style={fading ? { animation: `fadeOut ${FADE_MS}ms ease-in-out forwards` } : undefined}
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
      <div className="splash-start-row relative">
        <span className="splash-start-tilt relative inline-block">
          <button onClick={handleStart} disabled={struck} className="splash-start relative">
            Go back...
          </button>
        </span>
        <LoudSign show={!muted && !struck} />
      </div>
      <p
        aria-live="polite"
        className={`relative mt-6 text-sm text-[#c9ab78]/80 transition-opacity duration-500 ${
          waitingForTouch && !muted && !struck ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {tr('🔊 Tap anywhere on the screen to hear the clock tick.', '🔊 Tippe irgendwo auf den Bildschirm, um die Uhr ticken zu hören.')}
      </p>
      {struck && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none"
          style={{ background: '#fff', animation: `splashWhiteIn ${reduceMotion ? 400 : WHITE_IN_MS}ms ease-out forwards` }}
        />
      )}
    </div>
  );
};
