import React, { useMemo, useState } from 'react';
import { tr } from '../lib/i18n';
import { bandSpans } from '../lib/favoriteBands';

// The favourite bands list (onboarding and settings): type a name, or open
// the optional idea box with the big acts of every stretch of your life since
// your birth year and tap the ones you liked. Tapping again takes one off.
export const FavoriteBands: React.FC<{
  artists: string[];
  onChange: (artists: string[]) => void;
  birthDate: string;
  inputId: string;
}> = ({ artists, onChange, birthDate, inputId }) => {
  const [draft, setDraft] = useState('');
  const [ideasOpen, setIdeasOpen] = useState(false);
  const birthYear = /^\d{4}/.test(birthDate) ? Number(birthDate.slice(0, 4)) : null;
  const spans = useMemo(() => bandSpans(birthYear), [birthYear]);

  const has = (name: string) => artists.some((a) => a.toLowerCase() === name.toLowerCase());
  const add = (name: string) => {
    const clean = name.trim();
    if (clean && !has(clean)) onChange([...artists, clean]);
  };
  const remove = (name: string) => onChange(artists.filter((a) => a.toLowerCase() !== name.toLowerCase()));
  const addDraft = () => {
    add(draft);
    setDraft('');
  };

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-bold uppercase mb-1">
        {tr('Favorite bands and musicians (optional)', 'Lieblingsbands und Musiker:innen (freiwillig)')}
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            addDraft();
          }}
          className="w-full border-2 border-retro-ink p-3 bg-white"
          placeholder={tr('e.g. ABBA, Queen, Madonna …', 'z. B. ABBA, Queen, Nena …')}
        />
        <button
          type="button"
          onClick={addDraft}
          aria-label={tr('Add', 'Hinzufügen')}
          className="retro-button border-2 border-retro-ink px-4 font-bold bg-white shrink-0"
        >
          +
        </button>
      </div>
      {artists.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {artists.map((artist) => (
            <span
              key={artist}
              className="flex items-center gap-1 px-3 py-1 border-2 border-retro-ink text-sm font-bold bg-white"
            >
              {artist}
              <button
                type="button"
                onClick={() => remove(artist)}
                aria-label={tr(`Remove ${artist}`, `${artist} entfernen`)}
                className="text-retro-brown hover:text-retro-ink"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setIdeasOpen((o) => !o)}
        aria-expanded={ideasOpen}
        className="mt-3 text-sm font-bold underline text-retro-brown hover:text-retro-ink"
      >
        {ideasOpen
          ? tr('Hide ideas', 'Ideen ausblenden')
          : birthYear
          ? tr(`💡 Need ideas? Bands from your years since ${birthYear}`, `💡 Ideen gefällig? Bands aus deinen Jahren seit ${birthYear}`)
          : tr('💡 Need ideas? Bands through the decades', '💡 Ideen gefällig? Bands durch die Jahrzehnte')}
      </button>
      {ideasOpen && (
        <div className="mt-2 border-2 border-dashed border-retro-ink/40 p-3 bg-white/60 max-h-80 overflow-y-auto">
          <p className="text-xs text-retro-tan mb-3">
            {tr(
              'Just tap whoever you liked back then. Skip what doesn’t fit, nothing here is required, and you can change it any time in the settings.',
              'Tipp einfach an, wen du damals mochtest. Was nicht passt, lässt du weg. Nichts davon ist Pflicht, und in den Einstellungen kannst du es jederzeit ändern.'
            )}
          </p>
          {spans.map((span) => (
            <div key={span.from} className="mb-3 last:mb-0">
              <span className="block text-xs uppercase font-bold text-retro-brown mb-1">{span.label}</span>
              <div className="flex flex-wrap gap-1.5">
                {span.artists.map((artist) => {
                  const picked = has(artist);
                  return (
                    <button
                      key={artist}
                      type="button"
                      aria-pressed={picked}
                      onClick={() => (picked ? remove(artist) : add(artist))}
                      className={`px-2.5 py-1 border-2 border-retro-ink text-xs font-bold ${
                        picked ? 'bg-retro-ink text-white' : 'bg-white'
                      }`}
                    >
                      {picked ? '✓ ' : '+ '}
                      {artist}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
