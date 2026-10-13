import React from 'react';
import { tr } from '../../lib/i18n';
import { cameFromZeitreise, zeitreiseHref } from '../lib/cameFrom';

// Visible way back for visitors who came over from the Zeitreise (Marco,
// 2026-10-13). Shown at the door and on top of the hall; others still find
// the plain link in the footer. The href is built at click time so a mute or
// Google choice made in here travels back too.
export const BackToZeitreise: React.FC<{ className?: string }> = ({ className = '' }) => {
  if (!cameFromZeitreise()) return null;
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
