import React, { useMemo } from 'react';
import { tr } from '../lib/i18n';
import { bandIdeas } from '../lib/favoriteBands';
import { birthYearOf } from '../lib/picks';
import { ChipPicker } from './ChipPicker';

// The favourite bands list (onboarding and settings): type a name, or open
// the optional idea box: acts like the ones already on the list, the all-time
// legends, and the big acts of every stretch of your life since your birth
// year. Tapping again takes one off, ✕ hides an idea.
export const FavoriteBands: React.FC<{
  artists: string[];
  onChange: (artists: string[]) => void;
  birthDate: string;
  inputId: string;
  notMine: string[];
  onNotMineChange: (notMine: string[]) => void;
}> = ({ artists, onChange, birthDate, inputId, notMine, onNotMineChange }) => {
  const birthYear = birthYearOf(birthDate);
  const groups = useMemo(() => bandIdeas(birthYear, artists), [birthYear, artists]);

  return (
    <ChipPicker
      label={tr('Favorite bands and musicians (optional)', 'Lieblingsbands und Musiker:innen (freiwillig)')}
      inputId={inputId}
      placeholder={tr('e.g. ABBA, Queen, Madonna …', 'z. B. ABBA, Queen, Nena …')}
      items={artists}
      onChange={onChange}
      groups={groups}
      ideasLabel={
        artists.length
          ? tr('💡 Need ideas? Bands like yours, legends and your years', '💡 Ideen gefällig? Ähnliche Bands, Legenden und deine Jahre')
          : birthYear
          ? tr(`💡 Need ideas? Legends and bands from your years since ${birthYear}`, `💡 Ideen gefällig? Legenden und Bands aus deinen Jahren seit ${birthYear}`)
          : tr('💡 Need ideas? Bands through the decades', '💡 Ideen gefällig? Bands durch die Jahrzehnte')
      }
      ideasIntro={tr(
        'Tap whoever you liked back then. The more favorites you have, the better the first row fits. ✕ means “doesn’t fit me / don’t know it”. Nothing here is required, and you can change it any time in the settings.',
        'Tipp an, wen du damals mochtest. Je mehr Favoriten du hast, desto besser passt die erste Reihe. ✕ heißt „passt nicht zu mir / kenn ich nicht“. Nichts davon ist Pflicht, und in den Einstellungen kannst du es jederzeit ändern.'
      )}
      notMine={notMine}
      onNotMineChange={onNotMineChange}
    />
  );
};
