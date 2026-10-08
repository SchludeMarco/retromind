import React from 'react';
import { tr } from '../lib/i18n';

export const FinishPhase: React.FC<{
  userName: string;
  memoriesCount: number;
  onViewBook: () => void;
  onRestart: () => void;
}> = ({ userName, memoriesCount, onViewBook, onRestart }) => (
  <div className="py-16 text-center animate-fadeIn">
    <div className="inline-block p-8 md:p-12 bg-white border-8 border-double border-retro-ink shadow-2xl max-w-xl">
      <h2 className="text-4xl md:text-5xl font-bold mb-4">{tr('All the best', 'Alles Gute')}{userName ? `, ${userName}` : ''}!</h2>
      <p className="text-lg text-retro-brown mb-8">
        {tr(
          `Your time travel is over for today. ${memoriesCount} memor${memoriesCount === 1 ? 'y is' : 'ies are'} now in your book – ready whenever you want to come back.`,
          `Deine Zeitreise ist für heute vorbei. ${memoriesCount} Erinnerung${memoriesCount === 1 ? '' : 'en'} liegen jetzt in deinem Buch – jederzeit wieder abrufbar.`
        )}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={onViewBook} className="retro-button bg-retro-ink text-white px-8 py-4 font-bold">
          {tr('View the book', 'Buch ansehen')}
        </button>
        <button onClick={onRestart} className="px-8 py-4 border-2 border-retro-ink font-bold bg-white">
          {tr('Start a new journey', 'Neue Reise beginnen')}
        </button>
      </div>
    </div>
  </div>
);
