import React from 'react';
import { toggleMuted, useMuted } from '../lib/mute';
import { tr } from '../lib/i18n';

// The app-wide speaker switch (see lib/mute): silences the boot chime,
// welcome voice, click sounds, Spotify and videos. Drawn as an SVG, since
// many phone fonts lack the 🔇 glyph. Sits above the boot overlay and the
// splash screen so sound can be switched off before the first note.
export const MuteToggle: React.FC = () => {
  const muted = useMuted();
  const label = muted ? tr('Turn sound on', 'Ton einschalten') : tr('Mute', 'Stummschalten');
  return (
    <button
      onClick={toggleMuted}
      aria-pressed={muted}
      aria-label={label}
      title={label}
      className="rm-fixed fixed top-3 right-4 md:right-10 z-[1000] w-10 h-10 rounded-full bg-retro-cream border-2 border-retro-ink retro-button flex items-center justify-center text-retro-ink"
    >
      <svg viewBox="0 0 16 16" className="w-5 h-5" fill="currentColor" aria-hidden="true">
        <path d="M1 6h3l4-4h1v12H8l-4-4H1z" />
        {muted ? (
          <path d="M10 5l5 6M15 5l-5 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        ) : (
          <path d="M11 6h1v4h-1zM13 4h1v8h-1z" />
        )}
      </svg>
    </button>
  );
};
