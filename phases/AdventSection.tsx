import React, { useEffect, useRef, useState } from 'react';
import { ADVENT_DOORS, AdventDoor, canOpen, daysUntilDoor, DOOR_ORDER, isPreview, readOpened, saveOpened } from '../lib/advent';
import { t, XMAS_RECIPES } from '../lib/recipes';
import { tr } from '../lib/i18n';
import type { SpotifyHit } from '../lib/spotifyApi';

// The advent calendar in Erkunden (lib/advent.ts): 24 scattered doors, one
// more opens each day from December 1. Behind each: a song for the radio, a
// recipe from Grandma's Christmas bakery, a story from Christmas back then or
// a question for the memory book.

const Surprise: React.FC<{
  door: AdventDoor;
  remembered: boolean;
  onRemember: () => void;
  onRecipe: (id: string) => void;
  onPlaySong?: (hit: SpotifyHit) => void;
}> = ({ door, remembered, onRemember, onRecipe, onPlaySong }) => (
  <article className="advent-surprise" aria-live="polite">
    <span aria-hidden="true" className="advent-surprise-icon">{door.icon}</span>
    <div className="space-y-3 min-w-0">
      <p className="rm-eyebrow">{tr(`Door ${door.day}`, `Türchen ${door.day}`)}</p>
      <h3 className="cookbook-card-title">{t(door.title)}</h3>
      <p className="text-retro-brown leading-relaxed">{t(door.text)}</p>
      {door.kind === 'song' && (
        <div className="space-y-1">
          <p className="font-semibold">„{door.song}“ · {door.artist}</p>
          {onPlaySong ? (
            <button
              className="retro-button rm-btn bg-retro-ink text-white"
              onClick={() =>
                onPlaySong({ uri: `spotify:track:${door.track}`, name: door.song, sub: door.artist, image: null, kind: 'track' })
              }
            >
              ▶ {tr('Play it on the radio', 'Im Radio spielen')}
            </button>
          ) : (
            <p className="text-sm text-retro-tan">{tr('Allow the music to hear it on the radio.', 'Erlaube die Musik, dann läuft es im Radio.')}</p>
          )}
        </div>
      )}
      {door.kind === 'recipe' && (
        <button className="retro-button rm-btn bg-retro-ink text-white" onClick={() => onRecipe(door.recipe)}>
          📖 {tr('Open the recipe', 'Rezept aufschlagen')}
          {(() => {
            const r = XMAS_RECIPES.find((x) => x.id === door.recipe);
            return r ? `: ${t(r.title)}` : '';
          })()}
        </button>
      )}
      {door.kind === 'question' && (
        <div className="space-y-2">
          <p className="cookbook-story">{t(door.question)}</p>
          <button className="retro-button rm-btn bg-retro-ink text-white" onClick={onRemember}>
            {remembered ? tr('✓ In your memory book', '✓ Im Erinnerungsbuch') : tr('+ Tell your memory', '+ Deine Erinnerung erzählen')}
          </button>
        </div>
      )}
    </div>
  </article>
);

export const AdventSection: React.FC<{
  focusDecade: string;
  isAnswered: (id: string) => boolean;
  onRemember: (wordId: string, term: string, knowledge: string, decade: string, fallbackQuestion: string) => void;
  onRecipe: (id: string) => void;
  onPlaySong?: (hit: SpotifyHit) => void;
  backButton: React.ReactNode;
}> = ({ focusDecade, isAnswered, onRemember, onRecipe, onPlaySong, backButton }) => {
  const [opened, setOpened] = useState<number[]>(readOpened);
  const [shown, setShown] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const preview = isPreview();
  const door = ADVENT_DOORS.find((d) => d.day === shown) ?? null;
  const surpriseRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (shown !== null) surpriseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [shown]);

  const tap = (day: number) => {
    if (!canOpen(day)) {
      const days = daysUntilDoor(day);
      setHint(
        tr(
          `Patience! Door ${day} opens in ${days} day${days === 1 ? '' : 's'}.`,
          `Geduld! Türchen ${day} geht in ${days} Tag${days === 1 ? '' : 'en'} auf.`
        )
      );
      return;
    }
    setHint(null);
    if (!opened.includes(day)) {
      const next = [...opened, day];
      setOpened(next);
      saveOpened(next);
    }
    setShown(day);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-5">
        {backButton}
        <div className="rm-stop-header">
          <p className="rm-eyebrow">{tr('Explore', 'Erkunden')}</p>
          <h2 className="rm-title flex items-center gap-3">
            <span aria-hidden="true">🗓️</span> {tr('Advent calendar', 'Adventskalender')}
          </h2>
          <p className="rm-lead">
            {preview
              ? tr(
                  'A sneak preview: from December 1 one more door opens each day. Today you may peek behind all of them.',
                  'Eine Vorschau: Ab dem 1. Dezember geht jeden Tag ein Türchen mehr auf. Heute darfst du schon hinter alle schauen.'
                )
              : tr(
                  'From December 1 one more door opens each day. Behind each one something special is waiting.',
                  'Ab dem 1. Dezember geht jeden Tag ein Türchen mehr auf. Hinter jedem wartet etwas Besonderes.'
                )}
          </p>
        </div>
      </header>

      {door && (
        <div ref={surpriseRef}>
        <Surprise
          door={door}
          remembered={isAnswered(`advent-${door.day}`)}
          onRemember={() =>
            door.kind === 'question' && onRemember(`advent-${door.day}`, t(door.title), t(door.text), focusDecade, t(door.question))
          }
          onRecipe={onRecipe}
          onPlaySong={onPlaySong}
        />
        </div>
      )}
      {hint && (
        <p role="status" className="advent-hint">
          {hint}
        </p>
      )}

      <div className="advent-calendar">
        {DOOR_ORDER.map((day) => {
          const isOpen = opened.includes(day);
          const ready = canOpen(day);
          const d = ADVENT_DOORS.find((x) => x.day === day)!;
          return (
            <button
              key={day}
              onClick={() => tap(day)}
              aria-label={
                isOpen
                  ? tr(`Door ${day}, open: ${t(d.title)}`, `Türchen ${day}, offen: ${t(d.title)}`)
                  : ready
                  ? tr(`Door ${day}: open it`, `Türchen ${day}: öffnen`)
                  : tr(`Door ${day}, still closed`, `Türchen ${day}, noch zu`)
              }
              className={`advent-door ${isOpen ? 'is-open' : ''} ${ready && !isOpen ? 'is-ready' : ''} ${shown === day ? 'is-shown' : ''} ${
                day === 24 ? 'is-big' : ''
              }`}
            >
              <span className="advent-door-inside" aria-hidden="true">{d.icon}</span>
              <span className="advent-door-front" aria-hidden="true">{day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
