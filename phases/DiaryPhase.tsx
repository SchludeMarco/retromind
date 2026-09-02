import React from 'react';

export const DiaryPhase: React.FC<{
  memoriesCount: number;
  diaryEntry: string;
  onDiaryChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({ memoriesCount, diaryEntry, onDiaryChange, onBack, onNext }) => (
  <div className="py-8 animate-fadeIn max-w-3xl mx-auto">
    <div className="retro-card p-6 md:p-8 bg-retro-cream">
      <h2 className="text-3xl mb-2">Freie Notiz</h2>
      <p className="text-sm text-retro-brown mb-4">
        Deine {memoriesCount} gesammelte{memoriesCount === 1 ? '' : 'n'} Erinnerung
        {memoriesCount === 1 ? '' : 'en'} sind schon im Buch. Hier ist Platz für alles, was sonst noch hochkam.
      </p>
      <textarea
        className="w-full h-56 p-4 border-2 border-retro-ink bg-white text-retro-ink focus:outline-none focus:ring-2 focus:ring-retro-amber"
        placeholder="Diese Musik hat mich sofort zurückversetzt in…"
        value={diaryEntry}
        onChange={(e) => onDiaryChange(e.target.value)}
      />
      <p className="text-xs text-retro-tan mt-2">Wird automatisch in diesem Browser gespeichert.</p>
      <div className="flex flex-wrap justify-between items-center gap-3 mt-6">
        <button onClick={onBack} className="px-6 py-3 border-2 border-retro-ink font-bold bg-white">
          ← Zurück zur Wand
        </button>
        <button onClick={onNext} className="retro-button bg-retro-ink text-white px-10 py-4 font-bold">
          Erinnerungs-Buch ansehen
        </button>
      </div>
    </div>
  </div>
);
