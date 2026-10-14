import React, { useState } from 'react';
import { UserProfile } from '../types';
import { INTEREST_LABELS, GENDER_LABELS } from '../constants';
import { tr } from '../lib/i18n';
import { PhaseNav, StopHeader } from '../components/PhaseNav';

// Stored values stay German (ids, see lib/session.ts INTEREST_TO_CATEGORY);
// only the labels are translated.
const INTEREST_IDS = Object.keys(INTEREST_LABELS);
const GENDER_OPTIONS = Object.keys(GENDER_LABELS);

export const OnboardingPhase: React.FC<{
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onToggleInterest: (interest: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}> = ({ user, onUserChange, onToggleInterest, onSubmit, onBack }) => {
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
      <StopHeader
        eyebrow={tr('Before we set off', 'Vor der Abfahrt')}
        title={tr(`Pack your suitcase, ${user.name || 'time traveler'}`, `Pack deinen Koffer, ${user.name || 'Zeitreisende:r'}`)}
        lead={tr(
          'What you take along makes the questions on the way more personal. Everything here is optional.',
          'Was du mitnimmst, macht die Fragen unterwegs persönlicher. Alles hier ist freiwillig.'
        )}
      />
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="rm-gender" className="block text-sm font-bold uppercase mb-1">{tr('Gender (optional)', 'Geschlecht (optional)')}</label>
            <select
              id="rm-gender"
              value={user.gender}
              onChange={(e) => onUserChange({ ...user, gender: e.target.value })}
              className="w-full border-2 border-retro-ink p-3 bg-white"
            >
              <option value="">{tr('– prefer not to say –', '– keine Angabe –')}</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>{GENDER_LABELS[g]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <span className="block text-sm font-bold uppercase mb-1">{tr('Interests (for more personal questions)', 'Interessen (für persönlichere Fragen)')}</span>
          <div className="flex flex-wrap gap-2">
            {INTEREST_IDS.map((interest) => (
              <button
                key={interest}
                type="button"
                aria-pressed={user.interests.includes(interest)}
                onClick={() => onToggleInterest(interest)}
                className={`px-4 py-2 border-2 border-retro-ink text-sm font-bold ${
                  user.interests.includes(interest) ? 'bg-retro-ink text-white' : 'bg-white'
                }`}
              >
                {INTEREST_LABELS[interest]}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="rm-artist" className="block text-sm font-bold uppercase mb-1">
              {tr('Favorite musicians (optional)', 'Lieblingsmusiker:innen (optional)')}
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
                placeholder={tr('e.g. ABBA, Queen, Madonna …', 'z. B. ABBA, Queen, Nena …')}
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
                      aria-label={tr(`Remove ${artist}`, `${artist} entfernen`)}
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
        <PhaseNav
          className="md:col-span-2 !mt-2"
          back={{ to: 'intro', onClick: onBack }}
          next={{ to: 'induction', onClick: () => {}, type: 'submit' }}
        />
      </form>
    </div>
  </div>
  );
};
