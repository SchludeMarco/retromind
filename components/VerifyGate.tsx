import React, { useEffect, useState } from 'react';
import { GoogleUser } from '../types';
import { GoogleAuthStatus } from '../hooks/useGoogleAuth';

// The very first thing anyone does once past the splash: verify who they are
// so RetroMind knows their age (and so the right decade's content shows up)
// before the journey starts. Google sign-in is the preferred path — it also
// hands us a name and, for accounts that share one, a birthday — but a
// deployment without a configured Google client falls back to a small manual
// form so the app still works in that case.
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

  const showForm = googleStatus === 'signed_in' || googleStatus === 'not_configured';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) return;
    onVerified(name.trim(), birthDate);
  };

  return (
    <div className="flex flex-col items-center py-10 text-center animate-fadeIn">
      <div className="retro-card p-8 md:p-12 max-w-lg bg-retro-cream">
        <h2 className="text-3xl mb-6">Bevor es losgeht …</h2>
        <p className="text-lg mb-8 leading-relaxed">
          RetroMind richtet sich nach deinem Alter, damit die richtigen Jahrzehnte und Fragen erscheinen.
          Bitte verifiziere dich kurz.
        </p>

        {googleStatus !== 'not_configured' && googleStatus !== 'signed_in' && (
          <button
            onClick={onGoogleSignIn}
            disabled={googleStatus === 'signing_in'}
            className="retro-button bg-retro-amber text-white px-10 py-5 text-xl font-bold hover:bg-retro-amber-dark disabled:opacity-60"
          >
            {googleStatus === 'signing_in'
              ? 'Anmelden …'
              : googleStatus === 'error'
              ? 'Erneut mit Google anmelden'
              : 'Mit Google verifizieren'}
          </button>
        )}

        {showForm && (
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
                <p className="font-bold text-sm">✅ Verifiziert als {googleUser.name} ({googleUser.email})</p>
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
                placeholder="Wie wirst du genannt?"
              />
            </div>
            <div>
              <label htmlFor="rm-verify-birth" className="block text-sm font-bold uppercase mb-1">Geburtsdatum</label>
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
                <p className="text-xs text-retro-brown mt-1">Aus deinem Google-Konto übernommen – bei Bedarf anpassen.</p>
              )}
            </div>
            <div className="text-right pt-2">
              <button type="submit" className="retro-button bg-retro-ink text-white px-10 py-4 font-bold">
                Weiter
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
