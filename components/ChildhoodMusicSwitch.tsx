import React from 'react';
import { tr } from '../lib/i18n';
import { setChildhoodMusic, useChildhoodMusic } from '../lib/childhoodMusic';

/** On/off for "music of my childhood" (lib/childhoodMusic.ts): under the destination time and in the settings. */
export const ChildhoodMusicSwitch: React.FC<{ decade?: string; className?: string }> = ({ decade, className = '' }) => {
  const on = useChildhoodMusic();
  const era = decade ? (Number(decade) >= 2000 ? decade : decade.slice(2)) : '';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setChildhoodMusic(!on)}
      className={`rm-childhood-switch inline-flex items-center gap-3 rounded-full border border-current/30 pl-4 pr-2 py-1.5 text-sm font-semibold ${className}`}
    >
      <span className="text-left leading-tight">
        🧸 {tr('Music of my childhood', 'Musik meiner Kindheit')}
        {era && <small className="block text-[11px] font-normal opacity-80">{tr(`plays the ${era}s, whatever the date`, `spielt die ${era}er, egal welches Datum`)}</small>}
      </span>
      <span aria-hidden="true" className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${on ? 'bg-[#bf4b28]' : 'bg-[#8a7a6a]'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#f7ecd6] transition-transform ${on ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
};
