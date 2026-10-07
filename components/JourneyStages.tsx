import React from 'react';
import { AppPhase } from '../types';

// The journey as free "Etappen" (Marco, 2026-10-06): once a journey has
// begun, every station can be opened straight from the start page, in any
// order, whenever the mood strikes. The "Weiter" buttons inside the
// stations still suggest the usual order.
export type Stage = { phase: AppPhase; icon: string; label: string; text: string };

export const STAGES: Stage[] = [
  { phase: 'onboarding', icon: '🙋', label: 'Dein Profil', text: 'Name, Interessen und Lieblingsmusik' },
  { phase: 'induction', icon: '🎞️', label: 'Eindrücke', text: 'Bilder und Klänge deiner Zeit' },
  { phase: 'exploration', icon: '🧭', label: 'Erkunden', text: 'Sparten zum Stöbern und Erinnern' },
  { phase: 'diary', icon: '✍️', label: 'Tagebuch', text: 'Deine Gedanken in eigenen Worten' },
  { phase: 'book', icon: '📖', label: 'Erinnerungsbuch', text: 'Alles gesammelt, zum Lesen und Drucken' },
  { phase: 'finish', icon: '🏁', label: 'Abschluss', text: 'Die Reise feierlich beenden' },
];

export const JourneyStages: React.FC<{
  warm: boolean;
  lastStage: AppPhase | null;
  memoriesCount: number;
  diaryWritten: boolean;
  onOpen: (phase: AppPhase) => void;
}> = ({ warm, lastStage, memoriesCount, diaryWritten, onOpen }) => {
  const status = (p: AppPhase) =>
    p === 'exploration'
      ? memoriesCount > 0
        ? `${memoriesCount} Erinnerung${memoriesCount === 1 ? '' : 'en'}`
        : null
      : p === 'diary'
      ? diaryWritten ? 'geschrieben' : null
      : null;

  return (
    <section aria-label="Etappen der Reise" className={warm ? 'rounded-2xl bg-retro-cream p-6 md:p-8' : 'mb-8 text-left'}>
      <h2 className={warm ? 'text-xl md:text-2xl mb-2' : 'text-2xl mb-2'}>Deine Etappen</h2>
      <p className="text-retro-brown mb-5 leading-relaxed">
        Tippe eine Station an, wann immer dir danach ist. Die Reihenfolge bestimmst du.
      </p>
      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STAGES.map((s, i) => {
          const last = s.phase === lastStage;
          const note = status(s.phase);
          return (
            <li key={s.phase}>
              <button
                onClick={() => onOpen(s.phase)}
                className={`w-full h-full text-left flex items-start gap-3 p-4 ${
                  warm
                    ? `rounded-xl bg-white border ${last ? 'border-retro-amber-dark ring-2 ring-[#e8a838]/50' : 'border-[#e6dac8]'}`
                    : `border-2 bg-white hover:bg-retro-cream ${last ? 'border-retro-amber' : 'border-retro-ink'}`
                }`}
              >
                <span aria-hidden="true" className="text-2xl leading-none mt-0.5">{s.icon}</span>
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-bold leading-tight text-retro-ink">
                    <span className="text-retro-tan font-semibold mr-1">{i + 1}.</span>
                    {s.label}
                  </span>
                  <span className="text-sm text-retro-brown leading-snug">{s.text}</span>
                  {(last || note) && (
                    <span className="text-xs font-semibold text-retro-amber-dark mt-1">
                      {[last && 'Hier warst du zuletzt', note].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
