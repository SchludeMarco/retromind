import React from 'react';

// The header sits above the app-wide CrtOverlay (z-index 500) so its
// permanent backdrop blur/wash — intentional everywhere else — never
// touches it, keeping the logo crisp while the rest of the app stays as
// softened as before. The logo's dark background is keyed out, so it
// sits directly on the paper background. (The former text headline is
// kept in _removed_content/Header.tsx.)
export const Header: React.FC = () => (
  <header className="relative z-[600] pt-8 pb-6 text-center">
    <h1 className="m-0">
      <img
        src="/retromind-logo-header.webp"
        alt="RetroMind"
        width={640}
        height={756}
        className="mx-auto w-44 md:w-56 h-auto"
      />
    </h1>
    <p className="text-lg italic text-retro-brown mt-3">Deine Reise zurück in die Zeit</p>
    <div className="w-32 h-1 bg-retro-ink mx-auto mt-4" />
  </header>
);
