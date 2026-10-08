import React from 'react';
import { tr } from '../../lib/i18n';

// Pixel speaker that silences the whole app; drawn, since many phone fonts
// lack the 🔇 glyph or render it in colour.
export const MuteButton: React.FC<{ muted: boolean; onToggle: () => void; className?: string; label?: boolean }> = ({
  muted,
  onToggle,
  className = '',
  label = false,
}) => (
  <button
    className={`px-btn mute-btn ${className}`}
    onClick={onToggle}
    aria-pressed={muted}
    aria-label={muted ? tr('Turn sound on', 'Ton einschalten') : tr('Mute', 'Stummschalten')}
    title={muted ? tr('Turn sound on', 'Ton einschalten') : tr('Mute', 'Stummschalten')}
    data-nav
  >
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M1 6h3l4-4h1v12H8l-4-4H1z" />
      {muted ? (
        <path d="M10 5l5 6M15 5l-5 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      ) : (
        <path d="M11 6h1v4h-1zM13 4h1v8h-1z" />
      )}
    </svg>
    {label && <span>{muted ? tr('SOUND OFF', 'TON AUS') : tr('SOUND ON', 'TON AN')}</span>}
  </button>
);
