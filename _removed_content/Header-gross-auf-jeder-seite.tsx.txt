import React from 'react';

// The header sits under the app-wide CrtOverlay like everything else, so
// the logo and tagline get the same scanlines, blur and wash as the rest
// of the app. The logo's dark background is keyed out and its neon colours
// are warmed slightly towards the paper palette, so it sits on the paper
// background like a printed part of the page. (The former text headline
// is kept in _removed_content/Header.tsx.)
export const Header: React.FC = () => (
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
    <p className="text-lg italic text-retro-brown mt-3">… willkommen zurück in der Vergangenheit</p>
    <div className="w-32 h-1 bg-retro-ink mx-auto mt-4" />
  </header>
);
