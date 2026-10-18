import React, { useMemo, useState } from 'react';
import { tr } from '../lib/i18n';
import { birthYearOf } from '../lib/picks';
import { treasureSections } from '../lib/treasures';
import type { TreasureKind, UserProfile } from '../types';
import { ChipPicker } from './ChipPicker';

// The treasure chest (onboarding and settings): characters, games, books,
// places, events, smells, shops, card games and quotes from your youth, one
// tab each, all optional. Starts closed so nobody feels pushed.
export const TreasureChest: React.FC<{
  user: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
  idPrefix: string;
}> = ({ user, onChange, idPrefix }) => {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<TreasureKind>('figures');
  const birthYear = birthYearOf(user.birthDate);
  const sections = useMemo(() => treasureSections(birthYear), [birthYear]);
  const treasures = user.treasures ?? {};
  const total = Object.values(treasures).reduce((n, list) => n + (list?.length ?? 0), 0);
  const section = sections.find((s) => s.id === kind) ?? sections[0];

  return (
    <div className="border-2 border-retro-ink bg-white/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 p-3 text-left font-bold"
      >
        <span>
          <span className="block text-sm uppercase">
            🧰 {tr('Your treasure chest (optional)', 'Deine Schatzkiste (freiwillig)')}
            {total > 0 && <span className="ml-2 text-retro-brown normal-case">· {total}</span>}
          </span>
          {!open && (
            <span className="block text-xs font-normal text-retro-tan mt-0.5">
              {tr(
                'Characters, games, books, places, smells, shops, card games and quotes from your youth',
                'Figuren, Spiele, Bücher, Orte, Gerüche, Läden, Kartenspiele und Sprüche aus deiner Jugend'
              )}
            </span>
          )}
        </span>
        <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3">
          <p className="text-xs text-retro-tan mb-3">
            {tr(
              'Everything you put in here makes the questions on your journey and your memory book more personal.',
              'Alles, was du hier hineinlegst, macht die Fragen auf deiner Reise und dein Erinnerungs-Buch persönlicher.'
            )}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4" role="tablist">
            {sections.map((s) => {
              const n = treasures[s.id]?.length ?? 0;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={s.id === section.id}
                  onClick={() => setKind(s.id)}
                  className={`px-2.5 py-1 border-2 border-retro-ink text-xs font-bold ${
                    s.id === section.id ? 'bg-retro-ink text-white' : 'bg-white'
                  }`}
                >
                  {s.icon} {s.tab}
                  {n > 0 && ` · ${n}`}
                </button>
              );
            })}
          </div>
          <ChipPicker
            key={section.id}
            label={`${section.icon} ${section.title}`}
            inputId={`${idPrefix}-${section.id}`}
            placeholder={section.placeholder}
            items={treasures[section.id] ?? []}
            onChange={(items) => onChange({ treasures: { ...treasures, [section.id]: items } })}
            groups={section.groups}
            ideasLabel={tr('💡 Show ideas', '💡 Ideen zeigen')}
            ideasOpen
            notMine={user.notMine ?? []}
            onNotMineChange={(notMine) => onChange({ notMine })}
          />
        </div>
      )}
    </div>
  );
};
