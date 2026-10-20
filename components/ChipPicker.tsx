import React, { useState } from 'react';
import { tr } from '../lib/i18n';
import { IdeaGroup, norm } from '../lib/picks';

// A list you fill by typing or by tapping suggestions (favourite bands, the
// treasure chest). Every suggestion has a small ✕ for "doesn't fit me / I
// don't know it" (Marco, 2026-10-18): it disappears and is remembered in
// `notMine`, shared by all lists, until "show again" brings it back.
export const ChipPicker: React.FC<{
  label: string;
  inputId: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  groups: IdeaGroup[];
  /** Text of the button that opens the idea box. */
  ideasLabel: string;
  ideasIntro?: string;
  /** Opens the idea box right away. */
  ideasOpen?: boolean;
  notMine: string[];
  onNotMineChange: (notMine: string[]) => void;
  /** Bundles the chosen items behind one tap (Marco, 2026-10-20): collapsed,
   *  only a count and the first names show. Gets the item count, returns the
   *  noun ("12 favorites"). */
  bundle?: (count: number) => string;
}> = ({ label, inputId, placeholder, items, onChange, groups, ideasLabel, ideasIntro, ideasOpen: openAtStart = false, notMine, onNotMineChange, bundle }) => {
  const [draft, setDraft] = useState('');
  const [ideasOpen, setIdeasOpen] = useState(openAtStart);
  const [listOpen, setListOpen] = useState(false);
  const bundled = !!bundle && items.length > 1;
  const showList = !bundled || listOpen;

  const has = (name: string) => items.some((a) => norm(a) === norm(name));
  const add = (name: string) => {
    const clean = name.trim();
    if (clean && !has(clean)) onChange([...items, clean]);
  };
  const remove = (name: string) => onChange(items.filter((a) => norm(a) !== norm(name)));
  const addDraft = () => {
    add(draft);
    setDraft('');
  };

  const hidden = new Set(notMine);
  const hiddenHere = groups.flatMap((g) => g.items).filter((item) => hidden.has(norm(item)) && !has(item));
  const hide = (name: string) => onNotMineChange([...notMine, norm(name)]);
  const showAgain = () => {
    const back = new Set(hiddenHere.map(norm));
    onNotMineChange(notMine.filter((k) => !back.has(k)));
  };

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-bold uppercase mb-1">
        {label}
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
          placeholder={placeholder}
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
      {bundled && (
        <button
          type="button"
          onClick={() => setListOpen((o) => !o)}
          aria-expanded={listOpen}
          className="mt-3 w-full flex flex-wrap items-center gap-x-2 px-3 py-2 border-2 border-retro-ink text-sm text-left bg-white"
        >
          <span className="font-bold shrink-0">♪ {bundle!(items.length)}</span>
          {!listOpen && (
            <span className="order-last basis-full truncate opacity-70">
              {items.slice(0, 3).join(', ')}
              {items.length > 3 ? ' …' : ''}
            </span>
          )}
          <span className="ml-auto shrink-0 font-bold underline">
            {listOpen ? tr('Hide ▴', 'Zuklappen ▴') : tr('Show all ▾', 'Alle zeigen ▾')}
          </span>
        </button>
      )}
      {items.length > 0 && showList && (
        <div className="flex flex-wrap gap-2 mt-3">
          {items.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1 px-3 py-1 border-2 border-retro-ink text-sm font-bold bg-white"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label={tr(`Remove ${item}`, `${item} entfernen`)}
                className="text-retro-brown hover:text-retro-ink"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      {groups.length > 0 && (
        <button
          type="button"
          onClick={() => setIdeasOpen((o) => !o)}
          aria-expanded={ideasOpen}
          className="mt-3 text-sm font-bold underline text-retro-brown hover:text-retro-ink"
        >
          {ideasOpen ? tr('Hide ideas', 'Ideen ausblenden') : ideasLabel}
        </button>
      )}
      {ideasOpen && groups.length > 0 && (
        <div className="mt-2 border-2 border-dashed border-retro-ink/40 p-3 bg-white/60 max-h-80 overflow-y-auto">
          <p className="text-xs text-retro-tan mb-3">
            {ideasIntro ??
              tr(
                'Tap whatever you liked back then. ✕ means “doesn’t fit me / don’t know it” and hides it. Nothing here is required.',
                'Tipp an, was du damals mochtest. ✕ heißt „passt nicht zu mir / kenn ich nicht“ und blendet es aus. Nichts davon ist Pflicht.'
              )}
          </p>
          {groups.map((group) => {
            const visible = group.items.filter((item) => has(item) || !hidden.has(norm(item)));
            if (!visible.length) return null;
            return (
              <div key={group.key} className="mb-3 last:mb-0">
                {group.label && <span className="block text-xs uppercase font-bold text-retro-brown mb-1">{group.label}</span>}
                <div className="flex flex-wrap gap-1.5">
                  {visible.map((item) => {
                    const picked = has(item);
                    return (
                      <span
                        key={item}
                        className={`inline-flex items-stretch border-2 border-retro-ink text-xs font-bold ${
                          picked ? 'bg-retro-ink text-white' : 'bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          aria-pressed={picked}
                          onClick={() => (picked ? remove(item) : add(item))}
                          className="px-2.5 py-1 text-left"
                        >
                          {picked ? '✓ ' : '+ '}
                          {item}
                        </button>
                        {!picked && (
                          <button
                            type="button"
                            onClick={() => hide(item)}
                            aria-label={tr(`${item}: doesn’t fit me / don’t know it`, `${item}: passt nicht zu mir / kenn ich nicht`)}
                            title={tr('Doesn’t fit me / don’t know it', 'Passt nicht zu mir / kenn ich nicht')}
                            className="px-1.5 border-l border-retro-ink/30 text-retro-tan hover:text-retro-ink"
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {hiddenHere.length > 0 && (
            <button type="button" onClick={showAgain} className="mt-1 text-xs underline text-retro-brown hover:text-retro-ink">
              {tr(`Show ${hiddenHere.length} hidden again`, `${hiddenHere.length} ausgeblendete wieder zeigen`)}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
