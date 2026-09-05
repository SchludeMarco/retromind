import React, { useState } from 'react';
import { AnalogClock } from './AnalogClock';

// Matches the .animate-fadeOut duration in index.css so the splash finishes
// its fade before unmounting.
const FADE_OUT_MS = 900;

// The very first thing anyone sees, on top of the whole app (and the
// BootOverlay dissolve reveals it, rather than the intro card underneath).
// Purely a local greeting gate — not part of the persisted session phase —
// so it appears again on every fresh page load.
export const SplashScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [leaving, setLeaving] = useState(false);

  const handleStart = () => {
    setLeaving(true);
    setTimeout(onStart, FADE_OUT_MS);
  };

  return (
    <div
      className={`fixed inset-0 z-[900] flex flex-col items-center justify-center text-center px-6 bg-retro-paper ${
        leaving ? 'animate-fadeOut pointer-events-none' : 'animate-fadeIn'
      }`}
    >
      <div className="grainy-bg" />
      <AnalogClock
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vmin] h-[85vmin] max-w-[640px] max-h-[640px] text-retro-ink opacity-50 pointer-events-none"
      />
      <h1 className="relative text-6xl md:text-8xl font-bold text-retro-ink tracking-tighter mb-4">
        Welcome to <span className="text-red-600">R</span>etro<span className="text-red-600">M</span>ind
      </h1>
      <p className="relative text-lg md:text-xl italic text-retro-brown mb-12">
        The ticket to your past🏳️
      </p>
      <button
        onClick={handleStart}
        className="relative retro-button bg-retro-amber text-white px-14 py-5 text-2xl font-bold hover:bg-retro-amber-dark"
      >
        Let's go!
      </button>
    </div>
  );
};
