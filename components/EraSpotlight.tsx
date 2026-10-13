import React from 'react';
import { GalleryItem } from '../types';
import { DECADES_DB } from '../constants';
import { tr } from '../lib/i18n';

// Right after the name form, before the journey has begun: a first taste of
// the person's own decade (its title, a few things from back then and three
// "postcards" to open), so the start page doesn't feel empty until
// "Start the time travel" is pressed. Grok test, 2026-10-13.
export const EraSpotlight: React.FC<{
  warm: boolean;
  userName: string;
  focusDecade: string;
  onSelectGalleryItem: (item: GalleryItem) => void;
}> = ({ warm, userName, focusDecade, onSelectGalleryItem }) => {
  const era = DECADES_DB[focusDecade];
  if (!era) return null;
  const terms = era.buzzwords.slice(0, 6).map((b) => b.term);
  const cards = era.galleryItems.slice(0, 3);
  const name = userName.trim();
  return (
    <section
      aria-label={tr('Your era', 'Deine Zeit')}
      className={`era-spotlight text-left ${
        warm ? 'rounded-2xl bg-retro-paper-white border border-[#e6dac8] p-6 md:p-8' : 'mb-8 border-2 border-retro-ink bg-white p-5'
      }`}
    >
      <span className="block text-xs font-semibold uppercase tracking-wider text-retro-amber-dark">
        {tr(`Your era · the ${focusDecade}s`, `Deine Zeit · die ${focusDecade}er`)}
      </span>
      <h2 className={warm ? 'text-xl md:text-2xl mt-1 mb-2' : 'text-2xl mt-1 mb-2'}>{era.title}</h2>
      <p className="text-retro-brown mb-4 leading-relaxed">
        {name
          ? tr(`${name}, this is where your journey begins. Remember these?`, `${name}, hier beginnt deine Reise. Erinnerst du dich?`)
          : tr('This is where your journey begins. Remember these?', 'Hier beginnt deine Reise. Erinnerst du dich?')}
      </p>
      <ul className="flex flex-wrap gap-2 mb-5" aria-label={tr('Things from back then', 'Dinge von damals')}>
        {terms.map((t, i) => (
          <li
            key={t}
            style={{ animationDelay: `${150 + i * 120}ms` }}
            className={`era-chip px-3 py-1.5 text-sm font-semibold ${
              warm ? 'rounded-full bg-retro-highlight text-retro-ink' : 'border-2 border-retro-ink bg-retro-highlight'
            }`}
          >
            {t}
          </li>
        ))}
      </ul>
      <p className="text-xs font-semibold uppercase tracking-wider text-retro-brown mb-2">{tr('Postcards from back then', 'Postkarten von damals')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {cards.map((item, i) => (
          <button
            key={item.keyword}
            onClick={() => onSelectGalleryItem(item)}
            style={{ animationDelay: `${600 + i * 150}ms` }}
            aria-label={tr(`Open postcard: ${item.title}`, `Postkarte öffnen: ${item.title}`)}
            className={`era-chip text-left px-3 py-2.5 flex items-center gap-2 ${
              warm ? 'rounded-xl bg-retro-cream hover:bg-retro-highlight' : 'border-2 border-retro-ink bg-retro-cream hover:bg-retro-highlight'
            }`}
          >
            <span aria-hidden="true" className="text-lg">🖼️</span>
            <span className="flex-1 font-semibold leading-snug">{item.title}</span>
            <span aria-hidden="true" className="text-retro-amber-dark font-bold">›</span>
          </button>
        ))}
      </div>
    </section>
  );
};
