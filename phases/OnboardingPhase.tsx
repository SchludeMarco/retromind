import React from 'react';
import { UserProfile } from '../types';

const INTEREST_LABELS = ['Musik', 'Technik', 'Spielzeug', 'Alltag', 'Mode', 'Essen'];

export const OnboardingPhase: React.FC<{
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onToggleInterest: (interest: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  maxBirthDate: string;
}> = ({ user, onUserChange, onToggleInterest, onSubmit, maxBirthDate }) => (
  <div className="py-8 animate-fadeIn">
    <div className="retro-card p-6 md:p-12 bg-retro-cream">
      <h2 className="text-3xl mb-8 border-b-2 border-retro-ink pb-2">Wer bist du?</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="rm-name" className="block text-sm font-bold uppercase mb-1">Name</label>
            <input
              id="rm-name"
              required
              type="text"
              value={user.name}
              onChange={(e) => onUserChange({ ...user, name: e.target.value })}
              className="w-full border-2 border-retro-ink p-3 bg-white"
              placeholder="Wie wirst du genannt?"
            />
          </div>
          <div>
            <label htmlFor="rm-birth" className="block text-sm font-bold uppercase mb-1">Geburtsdatum</label>
            <input
              id="rm-birth"
              required
              type="date"
              min="1930-01-01"
              max={maxBirthDate}
              value={user.birthDate}
              onChange={(e) => onUserChange({ ...user, birthDate: e.target.value })}
              className="w-full border-2 border-retro-ink p-3 bg-white"
            />
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
