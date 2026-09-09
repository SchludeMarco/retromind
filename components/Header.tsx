import React from 'react';

// The headline sits above the app-wide CrtOverlay (z-index 500) so its
// permanent backdrop blur/wash — intentional everywhere else — never
// touches it, keeping "RetroMind" crisp and readable while the rest of
// the app stays as softened as before.
export const Header: React.FC = () => (
  <header className="relative z-[600] py-8 text-center">
    <h1 className="text-5xl md:text-7xl font-bold text-retro-ink mb-2 tracking-tighter">
      <span className="text-red-600">R</span>etro<span className="text-red-600">M</span>ind
    </h1>
    <p className="text-lg italic text-retro-brown">Deine Reise zurück in die Zeit</p>
    <div className="w-32 h-1 bg-retro-ink mx-auto mt-4" />
  </header>
);
