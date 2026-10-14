import React, { useEffect, useState } from 'react';
import { GoogleUser } from '../types';
import { GoogleAuthStatus } from '../hooks/useGoogleAuth';
import { warmUpGoogle } from '../lib/googleAuth';
import { tr } from '../lib/i18n';
import { MantelClock } from './MantelClock';
import { playRewind, REWIND_SECONDS } from '../lib/clockSounds';

// The very first thing anyone does once past the splash: tell RetroMind their
// name and birthday, so the right decades and questions show up. Since
// 2026-10-14 (Marco: "die Form soll sich wie Teil der Zeitreise anfühlen")
// this is no web form on a light page any more: you come out of the welcome
// screen's light inside the time machine, in the same dark clock room, and
// fill in a ticket to your past. "Set the clock" turns the hands back, and
// the room opens onto the app (the iris in App.tsx). Everything
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
  /** false while the welcome screen still covers the form */
  revealed?: boolean;
}> = ({
  googleStatus, googleUser, birthdayHint,
  initialName, initialBirthDate, maxBirthDate,
  onGoogleSignIn, onVerified, revealed = true,
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

  const [rewinding, setRewinding] = useState(false);
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rewinding || !name.trim() || !birthDate) return;
    if (reduceMotion) {
      onVerified(name.trim(), birthDate);
      return;
    }
    setRewinding(true);
    playRewind();
    window.setTimeout(() => onVerified(name.trim(), birthDate), REWIND_SECONDS * 1000);
  };

  const year = birthDate ? birthDate.slice(0, 4) : '';

  return (
    <div className="rm-gate rm-night-room fixed inset-0 z-[80] overflow-y-auto text-center">
      <div className="grainy-bg" />
      <div className="relative max-w-md mx-auto px-5 pt-20 pb-16 flex flex-col items-center">
        {/* The mantel clock from the welcome screen, now close up. */}
        <div className="w-52 aspect-[320/220] -mb-2">
          {revealed && <MantelClock className={`w-full h-full ${rewinding ? '' : 'verify-clock'}`} rewinding={rewinding} />}
        </div>
        <p className="rm-gate-eyebrow">{tr('Inside the time machine', 'In der Zeitmaschine')}</p>
        <h2 className="rm-gate-title">{tr('Where shall we travel?', 'Wohin geht die Reise?')}</h2>
        <p className="rm-gate-lead">
          {tr(
            'Your name and your birthday set the clock. It takes you to the decades of your childhood and youth. Your details stay with you, on this device.',
            'Dein Name und dein Geburtstag stellen die Uhr. Sie bringt dich in die Jahrzehnte deiner Kindheit und Jugend. Deine Angaben bleiben bei dir, auf diesem Gerät.'
          )}
        </p>

        <form onSubmit={handleSubmit} className={`rm-ticket w-full text-left ${rewinding ? 'is-stamped' : ''}`}>
          <div className="rm-ticket-head">
            <span>{tr('Ticket to your past', 'Fahrkarte in deine Vergangenheit')}</span>
            <span aria-hidden="true">Nº {year || '····'}</span>
          </div>
          <div className="rm-ticket-body space-y-4">
            {googleStatus === 'signed_in' && googleUser && (
              <div className="flex items-center gap-3 rm-ticket-note">
                {googleUser.picture && (
                  <img
                    src={googleUser.picture}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full shrink-0"
                  />
                )}
                <p className="text-sm font-semibold">
                  {tr(
                    `☁️ Signed in as ${googleUser.name}: your journey is also backed up to your Google Drive.`,
                    `☁️ Angemeldet als ${googleUser.name}: deine Reise wird zusätzlich in deinem Google Drive gesichert.`
                  )}
                </p>
              </div>
            )}
            <div>
              <label htmlFor="rm-verify-name" className="rm-ticket-label">{tr('Traveler', 'Reisende:r')}</label>
              <input
                id="rm-verify-name"
                required
                type="text"
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rm-ticket-input"
                placeholder={tr('What should we call you?', 'Wie wirst du genannt?')}
              />
            </div>
            <div>
              <label htmlFor="rm-verify-birth" className="rm-ticket-label">
                {tr('Departure: the day you were born', 'Abfahrt: dein Geburtstag')}
              </label>
              <input
                id="rm-verify-birth"
                required
                type="date"
                min="1930-01-01"
                max={maxBirthDate}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="rm-ticket-input"
              />
              {birthdayHint && birthDate === birthdayHint && (
                <p className="text-xs mt-1 opacity-80">{tr('Taken from your Google account – adjust if needed.', 'Aus deinem Google-Konto übernommen – bei Bedarf anpassen.')}</p>
              )}
            </div>
          </div>
          <div className="rm-ticket-stub">
            <span className="splash-start-tilt relative inline-block">
              <button type="submit" disabled={rewinding} className="splash-start rm-gate-start relative">
                {rewinding ? tr('Turning back …', 'Die Uhr dreht zurück …') : tr('Set the clock', 'Uhr zurückdrehen')}
              </button>
            </span>
          </div>
        </form>

        {googleStatus !== 'not_configured' && googleStatus !== 'signed_in' && (
          <div className="rm-gate-cloud mt-8 text-left w-full">
            <p className="text-sm leading-relaxed mb-3">
              {tr(
                <>
                  <strong>☁️ Optional: back up to the cloud.</strong> Signed in with Google, your journey is also
                  saved to your own Google Drive, so you can pick up on any device. You can also do this later in
                  the settings (⚙️).
                </>,
                <>
                  <strong>☁️ Optional: in der Cloud sichern.</strong> Mit Google angemeldet wird deine Reise zusätzlich
                  in deinem eigenen Google Drive gespeichert, damit du auf jedem Gerät weitermachen kannst. Das geht
                  auch später noch in den Einstellungen (⚙️).
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
              className="rm-gate-secondary"
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
