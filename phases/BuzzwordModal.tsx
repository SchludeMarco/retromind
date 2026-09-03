import React from 'react';
import { Modal, MemoryAnswer } from '../components';

export const BuzzwordModal: React.FC<{
  word: { id: string; term: string; knowledge: string; question: string; decade: string };
  isGenerating: boolean;
  answerDraft: string;
  onAnswerChange: (v: string) => void;
  isExistingMemory: boolean;
  onSave: () => void;
  onDismiss: () => void;
  onCloseClick: () => void;
}> = ({ word, isGenerating, answerDraft, onAnswerChange, isExistingMemory, onSave, onDismiss, onCloseClick }) => (
  <Modal onClose={onDismiss} label={`Erinnerung: ${word.term}`}>
    <button onClick={onCloseClick} aria-label="Schließen" className="absolute top-3 right-3 text-2xl leading-none">
      ✕
    </button>
    <span className="text-xs uppercase font-bold text-retro-amber-dark block">Wissen von damals</span>
    <h3 className="text-3xl font-bold mb-2">{word.term}</h3>
    <p className="text-base leading-relaxed mb-5 italic">"{word.knowledge}"</p>

    <div className="bg-gray-100 p-4 border-l-4 border-retro-amber mb-4">
      <h4 className="text-xs uppercase font-bold text-retro-brown mb-2">Deine persönliche Frage</h4>
      {isGenerating ? (
        <p className="italic text-sm animate-pulse">Die KI überlegt sich eine Frage für dich…</p>
      ) : (
        <p className="text-lg retro-serif leading-snug">{word.question}</p>
      )}
    </div>

    <MemoryAnswer
      value={answerDraft}
      onChange={onAnswerChange}
      placeholder="Was fällt dir dazu ein? Ein Detail, ein Geruch, ein Moment…"
    />

    <div className="flex flex-wrap gap-3 mt-5">
      <button onClick={onSave} className="retro-button bg-retro-ink text-white px-6 py-3 font-bold flex-grow">
        {isExistingMemory ? 'Erinnerung aktualisieren' : 'Erinnerung speichern'}
      </button>
      <button onClick={onCloseClick} className="px-6 py-3 border-2 border-retro-ink font-bold bg-white">
        Später
      </button>
    </div>
  </Modal>
);
