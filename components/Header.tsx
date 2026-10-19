import React from 'react';
import { tr } from '../lib/i18n';

// The logo is the most colourful thing on the page and shines like polished
// metal (Marco, 2026-10-19: "viel farbiger als der Rest … ohne Effekte die
// es ausbleichen … metallic glänzen und schimmern"). Its neon colours are
// boosted instead of warmed towards the paper, two layers cut to the logo's
// own shape lay brushed-metal bands and a light glint over it (see
// .rm-logo-metal in index.css), and the big start logo sits above the
// CrtOverlay, so no scanlines, blur or wash fade it. The small mark during
// the journey stays under the overlay (the journey pill scrolls over it)
// and is boosted a little more to make up for it. (The former text headline
// is kept in _removed_content/Header.tsx.)
// On the start page the logo is big; once the journey is under way it
// shrinks to a small mark, so the memories get the room (Marco, 2026-10-06).
const MetalLogo: React.FC<{ className: string; small?: boolean }> = ({ className, small = false }) => (
  <span className={`rm-logo-metal ${small ? 'rm-logo-metal-small' : ''} ${className}`}>
    <img src="/retromind-logo-header.webp" alt="RetroMind" width={640} height={756} className="block w-full h-auto" />
    <span aria-hidden="true" className="rm-logo-bands" />
    <span aria-hidden="true" className="rm-logo-glint" />
  </span>
);

export const Header: React.FC<{ compact?: boolean }> = ({ compact = false }) =>
  compact ? (
    <header className="pt-5 pb-1 text-center">
      <MetalLogo small className="mx-auto w-12" />
    </header>
  ) : (
  <header className="pt-8 pb-6 text-center">
    <h1 className="m-0">
      <MetalLogo className="mx-auto w-44 md:w-56" />
    </h1>
    <p className="text-lg italic text-retro-brown mt-3">{tr('… welcome back to the past', '… willkommen zurück in der Vergangenheit')}</p>
    <div className="rm-header-rule w-32 h-1 bg-retro-ink mx-auto mt-4" />
  </header>
);
