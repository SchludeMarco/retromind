import React from 'react';
import { tr } from '../lib/i18n';
import { gamingHref } from '../lib/gamingLink';
import './gamingCorner.css';

// The way into RetroMind – Gaming at the very top right (Marco, 2026-11-25:
// "Die Verknüpfung zu RetroMind Gaming stört mich so mittendrin im Nirgendwo,
// die Verknüpfung sollte ganz oben rechts mit einem kleinen Symbol mit dem
// Titel Gaming sein"). The joystick is Marco's own icon; it replaces the big
// gaming card with the signpost under "Start the time travel"
// (_removed_content/). In Retro Warm it sits in the fixed top strip
// (WarmChrome), in the other designs at the top right of the page.
// The href is rebuilt at click time (lib/gamingLink.ts).

export const GamingCorner: React.FC<{ inBar?: boolean }> = ({ inBar = false }) => (
  <a
    href={gamingHref()}
    onClick={(e) => {
      e.currentTarget.href = gamingHref();
    }}
    className={`rm-gaming-corner no-print ${inBar ? 'is-in-bar' : 'is-on-page'}`}
    aria-label={tr('Open RetroMind – Gaming', 'RetroMind – Gaming öffnen')}
    title={tr('RetroMind – Gaming: the arcade next door', 'RetroMind – Gaming: die Spielhalle nebenan')}
  >
    <img src="/gaming-icon.webp" alt="" width={128} height={128} decoding="async" />
    <span>Gaming</span>
  </a>
);
