import React from 'react';
import { tr } from '../lib/i18n';

// The header sits under the app-wide CrtOverlay like everything else, so
// the logo and tagline get the same scanlines, blur and wash as the rest
// of the app. The logo's dark background is keyed out and its neon colours
// are warmed slightly towards the paper palette, so it sits on the paper
// background like a printed part of the page. (The former text headline
// is kept in _removed_content/Header.tsx.)
// On the start page the logo is big; once the journey is under way it
// shrinks to a small mark, so the memories get the room (Marco, 2026-10-06).
export const Header: React.FC<{ compact?: boolean }> = ({ compact = false }) =>
  compact ? (
    <header className="pt-5 pb-1 text-center">
      <img
        src="/retromind-logo-header.webp"
        alt="RetroMind"
        width={640}
        height={756}
        className="mx-auto w-12 h-auto opacity-90"
        style={{ filter: 'sepia(0.25) saturate(0.85)' }}
      />
    </header>
  ) : (
  <header className="pt-8 pb-6 text-center">
    <h1 className="m-0">
      <img
        src="/retromind-logo-header.webp"
        alt="RetroMind"
        width={640}
        height={756}
        className="mx-auto w-44 md:w-56 h-auto"
        style={{ filter: 'sepia(0.25) saturate(0.85)' }}
      />
    </h1>
    <p className="text-lg italic text-retro-brown mt-3">{tr('… welcome back to the past', '… willkommen zurück in der Vergangenheit')}</p>
    <div className="w-32 h-1 bg-retro-ink mx-auto mt-4" />
  </header>
);
