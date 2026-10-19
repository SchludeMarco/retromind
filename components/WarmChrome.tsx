import React from 'react';
import { AppPhase } from '../types';
import { STATION_NAME } from '../lib/stations';

// The top strip of the "Retro Warm" design (lib/theme.ts), after the Google
// Stitch mock-ups: logo, RETROMIND and the stop you are at. Since
// 2026-10-18 it holds no buttons any more: sound, settings, accounts, music
// and the bottom navigation moved behind the handle at the right edge
// (components/ControlHandle; the old bars are in _removed_content/).
export const WarmTopBar: React.FC<{ phase: AppPhase }> = ({ phase }) => (
  <header className="rm-fixed fixed top-0 inset-x-0 z-[60] bg-retro-paper/95 backdrop-blur">
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-8 h-16 flex items-center gap-3">
      <img src="/retromind-logo-header.webp" alt="" width={640} height={756} className="rm-logo-pop w-8 sm:w-9 h-auto flex-shrink-0" />
      <div className="leading-tight min-w-0 flex-grow overflow-hidden">
        <span className="block font-serif font-bold text-base sm:text-lg md:text-xl tracking-tight text-retro-amber-dark truncate">RETROMIND</span>
        <span className="block text-xs text-retro-brown truncate">{STATION_NAME[phase]}</span>
      </div>
    </div>
    <div aria-hidden="true" className="rm-wood-rail" />
  </header>
);
