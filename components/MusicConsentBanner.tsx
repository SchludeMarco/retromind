import React from 'react';
import { PRIVACY_URL, setConsent, useConsent } from '../lib/privacy';

// Asks once whether the era's music may come from Spotify. Spotify's player
// sets its own cookies and learns the visitor's IP address, so (DSGVO) it is
// only loaded after a yes here or in the settings, never on its own.
export const MusicConsentBanner: React.FC = () => {
  const choice = useConsent('spotify');
  if (choice !== undefined) return null;
  return (
    <div
      role="dialog"
      aria-label="Musik von Spotify erlauben?"
      className="rm-fixed fixed bottom-20 left-1/2 -translate-x-1/2 z-[80] w-[calc(100%-2rem)] max-w-md bg-retro-cream border-2 border-retro-ink shadow-lg p-4 text-sm animate-fadeIn"
    >
      <p className="font-bold mb-1">🎵 Echte Hits der Dekade im Hintergrund?</p>
      <p className="text-xs leading-relaxed mb-3">
        Die Musik kommt von Spotify. Erst wenn du zustimmst, wird der Spotify-Player geladen. Dabei gehen Daten wie
        deine IP-Adresse an Spotify, und Spotify kann Cookies setzen.{' '}
        <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="underline font-bold">
          Datenschutz
        </a>
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setConsent('spotify', true)}
          className="retro-button bg-retro-amber text-white px-4 py-2 font-bold border-2 border-retro-ink"
        >
          Musik erlauben
        </button>
        <button
          onClick={() => setConsent('spotify', false)}
          className="retro-button bg-white px-4 py-2 font-bold border-2 border-retro-ink"
        >
          Ohne Musik
        </button>
      </div>
      <p className="text-[10px] text-retro-tan mt-2">Ändern kannst du das jederzeit in den Einstellungen (⚙️).</p>
    </div>
  );
};
