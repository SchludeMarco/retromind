import React from 'react';
import { AppPhase } from '../types';
import { STATION_NAME } from '../lib/stations';
import { tr } from '../lib/i18n';

// The end of every stop (design system, docs/DESIGN-SYSTEM.md): one big
// primary button "Next stop: Diary →" that carries the journey on, and a
// quiet way back. The words come from lib/stations.ts, so a stop is called
// the same here as in the journey bar.
export const PhaseNav: React.FC<{
  back?: { to: AppPhase; onClick: () => void; label?: string };
  next?: { to?: AppPhase; onClick: () => void; label?: string; eyebrow?: string; type?: 'button' | 'submit' };
  className?: string;
}> = ({ back, next, className = '' }) => (
  <div className={`rm-phase-nav no-print ${back && next ? '' : 'is-solo'} ${className}`}>
    {back && (
      <button type="button" onClick={back.onClick} className="rm-btn rm-btn-secondary">
        <span aria-hidden="true">←</span>
        {back.label ?? STATION_NAME[back.to]}
      </button>
    )}
    {next && (
      <button type={next.type ?? 'button'} onClick={next.type === 'submit' ? undefined : next.onClick} className="retro-button rm-btn rm-next bg-retro-ink text-white">
        <span className="rm-next-eyebrow">{next.eyebrow ?? tr('Next stop', 'Nächster Halt')}</span>
        <span className="rm-next-label">
          {next.label ?? (next.to ? STATION_NAME[next.to] : '')} <span aria-hidden="true">→</span>
        </span>
      </button>
    )}
  </div>
);

/** The top of a stop: small label, one title, a calm lead. */
export const StopHeader: React.FC<{
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  center?: boolean;
}> = ({ eyebrow, title, lead, center = false }) => (
  <header className={`rm-stop-header ${center ? 'is-center' : ''}`}>
    {eyebrow && <p className="rm-eyebrow">{eyebrow}</p>}
    <h2 className="rm-title">{title}</h2>
    {lead && <p className="rm-lead">{lead}</p>}
  </header>
);
