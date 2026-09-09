import React, { useState } from 'react';
import { UserProfile } from '../types';

const INTEREST_LABELS = ['Musik', 'Technik', 'Spielzeug', 'Alltag', 'Mode', 'Essen'];
const GENDER_OPTIONS = ['weiblich', 'männlich', 'divers'];

export const OnboardingPhase: React.FC<{
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onToggleInterest: (interest: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ user, onUserChange, onToggleInterest, onSubmit }) => {
  const [artistDraft, setArtistDraft] = useState('');

  const addArtist = () => {
    const name = artistDraft.trim();
    if (!name || user.favoriteArtists.includes(name)) {
      setArtistDraft('');
      return;
    }
    onUserChange({ ...user, favoriteArtists: [...user.favoriteArtists, name] });
    setArtistDraft('');
  };
  const removeArtist = (name: string) => {
    onUserChange({ ...user, favoriteArtists: user.favoriteArtists.filter((a) => a !== name) });
  };

  return (
  <div className="py-8 animate-fadeIn">
    <div className="retro-card p-6 md:p-12 bg-retro-cream">
      <h2 className="text-3xl mb-8 border-b-2 border-retro-ink pb-2">Erzähl uns mehr von dir, {user.name || 'Zeitreisende:r'}</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="rm-gender" className="block text-sm font-bold uppercase mb-1">Geschlecht (optional)</label>
            <select
              id="rm-gender"
              value={user.gender}
              onChange={(e) => onUserChange({ ...user, gender: e.target.value })}
              className="w-full border-2 border-retro-ink p-3 bg-white"
            >
              <option value="">– keine Angabe –</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <span className="block text-sm font-bold uppercase mb-1">Interessen (für persönlichere Fragen)</span>
          <div className="flex flex-wrap gap-2">
            {INTEREST_LABELS.map((interest) => (
              <button
                key={interest}
                type="button"
                aria-pressed={user.interests.includes(interest)}
                onClick={() => onToggleInterest(interest)}
                className={`px-4 py-2 border-2 border-retro-ink text-sm font-bold ${
                  user.interests.includes(interest) ? 'bg-retro-ink text-white' : 'bg-white'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="rm-artist" className="block text-sm font-bold uppercase mb-1">
              Lieblingsmusiker:innen (optional)
            </label>
            <div className="flex gap-2">
              <input
                id="rm-artist"
                type="text"
                value={artistDraft}
                onChange={(e) => setArtistDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  addArtist();
                }}
                className="w-full border-2 border-retro-ink p-3 bg-white"
                placeholder="z. B. ABBA, Queen, Nena …"
              />
              <button
                type="button"
                onClick={addArtist}
                className="retro-button border-2 border-retro-ink px-4 font-bold bg-white shrink-0"
              >
                +
              </button>
            </div>
            {user.favoriteArtists.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {user.favoriteArtists.map((artist) => (
                  <span
                    key={artist}
                    className="flex items-center gap-1 px-3 py-1 border-2 border-retro-ink text-sm font-bold bg-white"
                  >
                    {artist}
                    <button
                      type="button"
                      onClick={() => removeArtist(artist)}
                      aria-label={`${artist} entfernen`}
                      className="text-retro-brown hover:text-retro-ink"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-2 text-right pt-2">
          <button type="submit" className="retro-button bg-retro-ink text-white px-10 py-4 font-bold">
            Weiter
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};
