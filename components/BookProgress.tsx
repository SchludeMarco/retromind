import React from 'react';
import { tr } from '../lib/i18n';

// How full the memory book is: every answered question (with or without a
// photo) is a page, the diary is one more. Ten pages make a book worth
// printing; after that it simply keeps growing. Grok test, 2026-10-13.
export const BOOK_GOAL = 10;

export function bookPages(memoriesCount: number, diaryWritten: boolean): number {
  return memoriesCount + (diaryWritten ? 1 : 0);
}

export const BookProgress: React.FC<{
  memoriesCount: number;
  diaryWritten: boolean;
  warm?: boolean;
  className?: string;
}> = ({ memoriesCount, diaryWritten, warm = true, className = '' }) => {
  const pages = bookPages(memoriesCount, diaryWritten);
  const full = pages >= BOOK_GOAL;
  const percent = Math.min(100, Math.round((pages / BOOK_GOAL) * 100));
  const label = full
    ? tr(`Your memory book has ${pages} pages. Wonderful! Add more whenever you like.`, `Dein Erinnerungsbuch hat ${pages} Seiten. Wunderbar! Ergänze gern weiter.`)
    : tr(`Your memory book: ${pages} of ${BOOK_GOAL} pages filled`, `Dein Erinnerungsbuch: ${pages} von ${BOOK_GOAL} Seiten gefüllt`);
  return (
    <div className={`text-left ${className}`}>
      <p className="text-sm font-semibold mb-1.5">📖 {label}</p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={BOOK_GOAL}
        aria-valuenow={Math.min(pages, BOOK_GOAL)}
        aria-label={tr('Memory book progress', 'Fortschritt des Erinnerungsbuchs')}
        className={`h-3 overflow-hidden ${warm ? 'rounded-full bg-[#eee0d6]' : 'border-2 border-retro-ink bg-white'}`}
      >
        <div
          className={`h-full transition-all duration-700 ${full ? 'bg-retro-green' : 'bg-retro-amber-dark'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {!full && (
        <p className="text-xs text-retro-brown mt-1.5">
          {tr(
            'Each answered question is a page, your diary is one more.',
            'Jede beantwortete Frage ist eine Seite, dein Tagebuch eine weitere.'
          )}
        </p>
      )}
    </div>
  );
};
