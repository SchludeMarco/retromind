import React from 'react';
import { AppPhase } from '../types';

export const IntroPhase: React.FC<{
  resumeTarget: AppPhase | null;
  memoriesCount: number;
  onStart: () => void;
  onResume: () => void;
  onReset: () => void;
}> = ({ resumeTarget, memoriesCount, onStart, onResume, onReset }) => (
  <div className="flex flex-col items-center py-10 text-center animate-fadeIn">
    <div className="retro-card p-8 md:p-12 max-w-2xl bg-retro-cream">
      <h2 className="text-4xl mb-6">Willkommen, Zeitreisende:r</h2>
      <p className="text-lg mb-8 leading-relaxed">
        Öffne die Truhe deiner Kindheit. RetroMind führt dich Jahrzehnt für Jahrzehnt zurück, stellt dir
        persönliche Fragen und sammelt deine Antworten zu einem Erinnerungs-Buch.
      </p>

      {resumeTarget && (
        <div className="mb-8 border-2 border-retro-amber bg-retro-highlight p-4">
          <p className="font-bold mb-3">
            Du hast eine begonnene Reise ({memoriesCount} Erinnerung{memoriesCount === 1 ? '' : 'en'}).
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={onResume} className="retro-button bg-retro-ink text-white px-6 py-3 font-bold">
              Weitermachen
            </button>
            <button onClick={onReset} className="px-6 py-3 border-2 border-retro-ink font-bold bg-white">
              Neu beginnen
            </button>
          </div>
        </div>
      )}

      {!resumeTarget && (
        <button
          onClick={onStart}
          className="retro-button bg-retro-amber text-white px-12 py-5 text-2xl font-bold hover:bg-retro-amber-dark w-full md:w-auto"
        >
          Zeitreise starten
        </button>
      )}

      <details className="mt-10 text-left text-sm text-retro-brown">
        <summary className="cursor-pointer font-bold uppercase tracking-widest text-xs">
          Wie RetroMind mit deinen Daten umgeht
        </summary>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Profil, Antworten und Tagebuch bleiben <strong>nur in diesem Browser</strong> (localStorage). Kein Konto, kein Server-Speicher.</li>
          <li>Lädst du ein Foto hoch, wird es zur Beschreibung an die Google-Gemini-API gesendet (und für die optionale Video-Funktion an Veo). Sonst verlässt nichts dein Gerät.</li>
          <li>Über „Sitzung sichern" kannst du alles als Datei exportieren, über „Neu beginnen" alles löschen.</li>
        </ul>
      </details>
    </div>
  </div>
);
