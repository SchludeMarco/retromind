import React, { useEffect, useState } from 'react';
import { GoogleUser } from '../types';
import { GoogleAuthStatus } from '../hooks/useGoogleAuth';
import { warmUpGoogle } from '../lib/googleAuth';
import { tr } from '../lib/i18n';

// The very first thing anyone does once past the splash: tell RetroMind their
// name and birthday, so the right decades and questions show up. Everything
// stays on this device (localStorage). Signing in with Google is optional: it
// prefills the form and backs the journey up to the person's own Google Drive,
// so it can be picked up again on another device.
export const VerifyGate: React.FC<{
  googleStatus: GoogleAuthStatus;
  googleUser: GoogleUser | null;
  birthdayHint: string | null;
  initialName: string;
  initialBirthDate: string;
  maxBirthDate: string;
  onGoogleSignIn: () => void;
  onVerified: (name: string, birthDate: string) => void;
}> = ({
  googleStatus, googleUser, birthdayHint,
  initialName, initialBirthDate, maxBirthDate,
  onGoogleSignIn, onVerified,
}) => {
  const [name, setName] = useState(initialName);
  const [birthDate, setBirthDate] = useState(initialBirthDate);

  // Once Google comes back with a profile (or a shared birthday), prefill the
  // fields — but only if the person hasn't already got a value from a
  // previous session, and only until they start typing themselves.
  useEffect(() => {
    if (googleUser && !initialName) setName(googleUser.name);
  }, [googleUser, initialName]);
  useEffect(() => {
    if (birthdayHint && !initialBirthDate) setBirthDate(birthdayHint);
  }, [birthdayHint, initialBirthDate]);
  // A journey restored from Google Drive on a new device fills empty fields.
  useEffect(() => {
    if (initialName) setName((n) => n || initialName);
  }, [initialName]);
  useEffect(() => {
    if (initialBirthDate) setBirthDate((d) => d || initialBirthDate);
  }, [initialBirthDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) return;
    onVerified(name.trim(), birthDate);
  };

  return (
    <div className="flex flex-col items-center py-10 text-center animate-fadeIn">
      <div className="retro-card p-8 md:p-12 max-w-lg bg-retro-cream">
        <h2 className="text-3xl mb-6">{tr('Before we get started …', 'Bevor es losgeht …')}</h2>
        <p className="text-lg mb-8 leading-relaxed">
          {tr(
            'RetroMind adapts to your age so the right decades and questions show up. Your details stay on this device.',
            'RetroMind richtet sich nach deinem Alter, damit die richtigen Jahrzehnte und Fragen erscheinen. Deine Angaben bleiben auf diesem Gerät.'
          )}
        </p>

        <form onSubmit={handleSubmit} className="text-left space-y-4">
          {googleStatus === 'signed_in' && googleUser && (
            <div className="flex items-center gap-3 border-2 border-retro-ink bg-white p-3">
              {googleUser.picture && (
                <img
                  src={googleUser.picture}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-retro-ink shrink-0"
                />
              )}
              <p className="font-bold text-sm">
                {tr(
                  `☁️ Signed in as ${googleUser.name}: your journey is also backed up to your Google Drive.`,
                  `☁️ Angemeldet als ${googleUser.name}: deine Reise wird zusätzlich in deinem Google Drive gesichert.`
                )}
              </p>
            </div>
          )}
          <div>
            <label htmlFor="rm-verify-name" className="block text-sm font-bold uppercase mb-1">Name</label>
            <input
              id="rm-verify-name"
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-retro-ink p-3 bg-white"
              placeholder={tr('What should we call you?', 'Wie wirst du genannt?')}
            />
          </div>
          <div>
            <label htmlFor="rm-verify-birth" className="block text-sm font-bold uppercase mb-1">{tr('Date of birth', 'Geburtsdatum')}</label>
            <input
              id="rm-verify-birth"
              required
              type="date"
              min="1930-01-01"
              max={maxBirthDate}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full border-2 border-retro-ink p-3 bg-white"
            />
            {birthdayHint && birthDate === birthdayHint && (
              <p className="text-xs text-retro-brown mt-1">{tr('Taken from your Google account – adjust if needed.', 'Aus deinem Google-Konto übernommen – bei Bedarf anpassen.')}</p>
            )}
          </div>
          <div className="text-right pt-2">
            <button type="submit" className="retro-button bg-retro-ink text-white px-10 py-4 font-bold">
              {tr('Continue', 'Weiter')}
            </button>
          </div>
        </form>

        {googleStatus !== 'not_configured' && googleStatus !== 'signed_in' && (
          <div className="mt-8 pt-6 border-t-2 border-dashed border-retro-ink text-left">
            <p className="text-sm leading-relaxed mb-3">
              {tr(
                <>
                  <strong>☁️ Optional: back up to the cloud.</strong> Signed in with Google, your journey is also
                  saved to your own Google Drive, so you can pick up on any device. You can also do this later via
                  “Sign in with Google” at the bottom left.
                </>,
                <>
                  <strong>☁️ Optional: in der Cloud sichern.</strong> Mit Google angemeldet wird deine Reise zusätzlich
                  in deinem eigenen Google Drive gespeichert, damit du auf jedem Gerät weitermachen kannst. Das geht
                  auch später noch über „Mit Google anmelden“ unten links.
                </>
              )}
            </p>
            <button
              type="button"
              onClick={onGoogleSignIn}
              onPointerEnter={warmUpGoogle}
              onPointerDown={warmUpGoogle}
              onFocus={warmUpGoogle}
              disabled={googleStatus === 'signing_in'}
              className="retro-button bg-retro-amber text-white px-6 py-3 font-bold hover:bg-retro-amber-dark disabled:opacity-60"
            >
              {googleStatus === 'signing_in'
                ? tr('Signing in …', 'Anmelden …')
                : googleStatus === 'error'
                ? tr('Sign in with Google again', 'Erneut mit Google anmelden')
                : tr('Sign in with Google', 'Mit Google anmelden')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
