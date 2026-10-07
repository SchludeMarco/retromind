import React, { useState } from 'react';
import { AppPhase } from '../types';
import { STAGES } from './JourneyStages';

// A small, folded-away station switch right under the logo, for the
// designs without the Retro Warm stepper (Klassisch, Nachtschicht): only
// while a journey is running, and only opened when you want it
// (Marco, 2026-10-07). Picking a station folds it up again.
const STATIONS = [{ phase: 'intro' as AppPhase, icon: '🏠', label: 'Start' }, ...STAGES];

export const StationPicker: React.FC<{ phase: AppPhase; onSelect: (p: AppPhase) => void }> = ({ phase, onSelect }) => {
  const [open, setOpen] = useState(false);
  const index = STATIONS.findIndex((s) => s.phase === phase);
  const current = STATIONS[index];
  if (!current) return null;

  return (
    <nav aria-label="Stationen der Reise" className="max-w-3xl mx-auto px-4 mb-2 text-center">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="station-picker-list"
        className="inline-flex items-center gap-2 px-3 py-1 text-sm border-2 border-retro-ink bg-retro-cream text-retro-ink hover:bg-retro-highlight"
      >
        <span aria-hidden="true">{current.icon}</span>
        <span>
          Station {index + 1} von {STATIONS.length}: <strong>{current.label}</strong>
        </span>
        <span aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <ol id="station-picker-list" className="mt-2 flex flex-wrap justify-center gap-2 animate-fadeIn">
          {STATIONS.map((s, i) => {
            const active = s.phase === phase;
            return (
              <li key={s.phase}>
                <button
                  onClick={() => {
                    setOpen(false);
                    if (!active) onSelect(s.phase);
                  }}
                  aria-current={active ? 'step' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border-2 ${
                    active
                      ? 'border-retro-amber bg-retro-highlight font-bold text-retro-ink'
                      : 'border-retro-ink bg-white text-retro-ink hover:bg-retro-cream'
                  }`}
                >
                  <span aria-hidden="true">{s.icon}</span>
                  <span className="text-retro-tan font-semibold">{i + 1}.</span>
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
};
