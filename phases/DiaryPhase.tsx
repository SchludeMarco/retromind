import React from 'react';
import { tr } from '../lib/i18n';
import { PhaseNav } from '../components/PhaseNav';

export const DiaryPhase: React.FC<{
  memoriesCount: number;
  diaryEntry: string;
  onDiaryChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({ memoriesCount, diaryEntry, onDiaryChange, onBack, onNext }) => (
  <div className="py-8 animate-fadeIn max-w-3xl mx-auto">
    <div className="retro-card p-6 md:p-8 bg-retro-cream">
      <p className="rm-eyebrow mb-1">{tr('In your own words', 'In deinen eigenen Worten')}</p>
      <h2 className="rm-title mb-2">{tr('Free notes', 'Freie Notiz')}</h2>
      <p className="text-sm text-retro-brown mb-4">
        {tr(
          `Your ${memoriesCount} collected memor${memoriesCount === 1 ? 'y is' : 'ies are'} already in the book. Here’s room for anything else that came up.`,
          `Deine ${memoriesCount} gesammelte${memoriesCount === 1 ? '' : 'n'} Erinnerung${memoriesCount === 1 ? '' : 'en'} sind schon im Buch. Hier ist Platz für alles, was sonst noch hochkam.`
        )}
      </p>
      <textarea
        className="w-full h-56 p-4 border-2 border-retro-ink bg-white text-retro-ink focus:outline-none focus:ring-2 focus:ring-retro-amber"
        placeholder={tr('This music took me right back to…', 'Diese Musik hat mich sofort zurückversetzt in…')}
        value={diaryEntry}
        onChange={(e) => onDiaryChange(e.target.value)}
      />
      <p className="text-xs text-retro-tan mt-2">{tr('Saved automatically in this browser.', 'Wird automatisch in diesem Browser gespeichert.')}</p>
      <PhaseNav className="!mt-8" back={{ to: 'exploration', onClick: onBack }} next={{ to: 'book', onClick: onNext }} />
    </div>
  </div>
);
