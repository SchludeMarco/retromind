import React from 'react';
import { tr } from '../../lib/i18n';
import { zeitreiseHref } from '../lib/cameFrom';

// Visible way back to the Zeitreise (Marco, 2026-10-13). Since 2026-11-25
// shown for everyone: at the door and right above the RetroMind Gaming logo
// in the hall. The href is built at click time so a mute or Google choice
// made in here, and the synced data (lib/sync.ts), travel back too.
export const BackToZeitreise: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <a
      className={`px-btn back-zeitreise ${className}`}
      href={zeitreiseHref()}
      onClick={(e) => {
        e.currentTarget.href = zeitreiseHref();
      }}
      data-nav
      aria-label={tr('Back to RetroMind, the time travel', 'Zurück zu RetroMind, zur Zeitreise')}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M6 3h2v2H7v1h7v4H7v1h1v2H6v-1H5v-1H4V9H3V7h1V6h1V5h1z" />
      </svg>
      <span>{tr('BACK TO RETROMIND', 'ZURÜCK ZU RETROMIND')}</span>
    </a>
  );
};
