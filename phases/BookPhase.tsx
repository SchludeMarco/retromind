import React, { useRef } from 'react';
import { CapturedMemory, UserProfile } from '../types';

export const BookPhase: React.FC<{
  user: UserProfile;
  focusDecade: string;
  memories: CapturedMemory[];
  diaryEntry: string;
  onPrint: () => void;
  onExportText: () => void;
  onExportSession: () => void;
  onImportSession: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({ user, focusDecade, memories, diaryEntry, onPrint, onExportText, onExportSession, onImportSession, onBack, onNext }) => {
  const importInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="py-8 animate-fadeIn max-w-3xl mx-auto">
      <div id="memory-book" className="retro-card p-6 md:p-10 bg-white">
        <div className="text-center border-b-4 border-double border-retro-ink pb-6 mb-6">
          <p className="uppercase tracking-[0.3em] text-xs font-bold text-retro-tan">RetroMind</p>
          <h2 className="text-4xl retro-serif font-bold my-2">Erinnerungs-Buch</h2>
          {user.name && <p className="text-lg">für {user.name}</p>}
          <p className="text-sm text-retro-brown">
            Eine Zeitreise durch die {focusDecade}er · {new Date().toLocaleDateString('de-DE')}
          </p>
          {user.interests.length > 0 && (
            <p className="text-xs text-retro-tan mt-1">Interessen: {user.interests.join(', ')}</p>
          )}
        </div>

        {memories.length === 0 && !diaryEntry.trim() && (
          <p className="text-center text-retro-brown italic py-8">
            Noch keine Erinnerungen gesammelt. Geh zurück zur Wand und beantworte ein paar Fragen.
          </p>
        )}

        {memories.map((m) => (
          <div key={m.id} className="mb-6 pb-6 border-b border-retro-ink/15 last:border-0">
            <p className="text-xs uppercase font-bold text-retro-tan">{m.decade}er · {m.term}</p>
            {m.prompt && <p className="retro-serif italic text-lg mt-1 mb-2">{m.prompt}</p>}
            {m.photo && (
              <img src={m.photo} alt="" className="my-3 max-h-64 border-2 border-retro-ink retro-photo" />
            )}
            <p className="whitespace-pre-wrap leading-relaxed">{m.answer.trim() || '(keine Notiz)'}</p>
          </div>
        ))}

        {diaryEntry.trim() && (
          <div className="mt-4">
            <p className="text-xs uppercase font-bold text-retro-tan">Freie Notiz</p>
            <p className="whitespace-pre-wrap leading-relaxed mt-1">{diaryEntry.trim()}</p>
          </div>
        )}
      </div>

      <div className="no-print flex flex-wrap gap-3 justify-center mt-8">
        <button onClick={onPrint} className="retro-button bg-retro-amber text-white px-8 py-4 font-bold">
          Als PDF speichern / drucken
        </button>
        <button onClick={onExportText} className="px-6 py-4 border-2 border-retro-ink font-bold bg-white">
          Als Textdatei
        </button>
        <button onClick={onExportSession} className="px-6 py-4 border-2 border-retro-ink font-bold bg-white">
          Sitzung sichern (.json)
        </button>
        <button onClick={() => importInputRef.current?.click()} className="px-6 py-4 border-2 border-retro-ink font-bold bg-white">
          Sitzung laden
        </button>
        <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={onImportSession} />
      </div>
      <div className="no-print flex flex-wrap gap-3 justify-center mt-3">
        <button onClick={onBack} className="px-6 py-3 border-2 border-retro-ink font-bold bg-white text-sm">
          ← Zurück
        </button>
        <button onClick={onNext} className="px-6 py-3 border-2 border-retro-ink font-bold bg-white text-sm">
          Reise abschließen
        </button>
      </div>
    </div>
  );
};
