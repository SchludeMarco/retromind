import React, { useState } from 'react';
import { CapturedMemory } from '../types';
import { tr, LOCALE } from '../lib/i18n';
import { dailyMemoryId, dayKey, questionOfDay } from '../lib/dailyQuestion';
import { playChime } from '../lib/uiSounds';
import { MemoryAnswer } from './MemoryAnswer';

// The question of the day, right under the Stube (lib/dailyQuestion.ts). A new
// one every day, the same for everyone; the answer becomes a page in the
// memory book, so there's always a reason to drop by again tomorrow.
export const DailyQuestion: React.FC<{
  warm: boolean;
  focusDecade: string;
  memories: CapturedMemory[];
  onSave: (memory: CapturedMemory) => void;
}> = ({ warm, focusDecade, memories, onSave }) => {
  const day = dayKey();
  const id = dailyMemoryId(day);
  const question = questionOfDay(day);
  const saved = memories.find((m) => m.id === id);
  const answered = memories.filter((m) => m.id.startsWith('dq-')).length;
  const [draft, setDraft] = useState(saved?.answer ?? '');
  const [editing, setEditing] = useState(!saved);

  const save = () => {
    if (!draft.trim()) return;
    onSave({
      id,
      kind: 'note',
      decade: focusDecade,
      term: tr(`Question of the day, ${new Date().toLocaleDateString(LOCALE)}`, `Frage des Tages, ${new Date().toLocaleDateString(LOCALE)}`),
      prompt: question,
      answer: draft.trim(),
      createdAt: saved?.createdAt ?? Date.now(),
    });
    playChime();
    setEditing(false);
  };

  return (
    <section
      aria-labelledby="rm-daily-q"
      className={
        warm
          ? 'rounded-2xl bg-retro-highlight p-5 md:p-6 text-left'
          : 'retro-card w-full max-w-2xl mx-auto mb-6 p-6 bg-retro-highlight text-left'
      }
    >
      <p className="text-xs uppercase tracking-widest font-bold text-retro-amber-dark mb-1">
        ☕ {tr('Question of the day', 'Frage des Tages')} · {new Date().toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <h2 id="rm-daily-q" className={`${warm ? 'text-xl md:text-2xl' : 'text-2xl'} retro-serif mb-3`}>
        {question}
      </h2>
      {editing ? (
        <>
          <MemoryAnswer
            value={draft}
            onChange={setDraft}
            placeholder={tr('A few words are enough …', 'Ein paar Worte genügen …')}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={save}
              disabled={!draft.trim()}
              className={`retro-button px-5 py-2 font-bold text-white bg-retro-amber-dark disabled:opacity-50 ${warm ? 'rounded-xl' : 'border-2 border-retro-ink'}`}
            >
              {saved ? tr('Save changes', 'Änderung speichern') : tr('Into my memory book', 'Ins Erinnerungsbuch')}
            </button>
            {saved && (
              <button onClick={() => { setDraft(saved.answer); setEditing(false); }} className="px-4 py-2 border-2 border-retro-ink bg-white font-semibold text-sm">
                {tr('Cancel', 'Abbrechen')}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="whitespace-pre-wrap leading-relaxed italic mb-3">“{saved?.answer}”</p>
          <p className="text-sm text-retro-brown mb-2">
            {tr(
              `✓ In your memory book. ${answered === 1 ? 'Your first question of the day' : `${answered} questions of the day so far`}. Tomorrow there’s a new one.`,
              `✓ Steht in deinem Erinnerungsbuch. ${answered === 1 ? 'Deine erste Frage des Tages' : `Schon ${answered} Fragen des Tages`}. Morgen wartet eine neue.`
            )}
          </p>
          <button onClick={() => setEditing(true)} className="text-sm underline font-semibold">
            ✏️ {tr('Change answer', 'Antwort ändern')}
          </button>
        </>
      )}
    </section>
  );
};
