import React from 'react';
import { PRIVACY_URL, setConsent, useConsent } from '../../lib/privacy';

// Asks once in the hall whether the 80s metal may come from Spotify.
// Spotify's player sets its own cookies and learns the visitor's IP
// address, so (DSGVO) it only loads after a yes here or in the settings.
// The Gaming domain keeps its own answer, separate from the Zeitreise.
// Until then, and after a no, the chiptune tunes play.
export const SpotifyAsk: React.FC = () => {
  const choice = useConsent('spotify');
  if (choice !== undefined) return null;
  return (
    <div className="spotify-ask" role="dialog" aria-label="Metal von Spotify erlauben?">
      <p className="pixel-font">🤘 80ER METAL IN DER HALLE?</p>
      <p>
        Die Musik kommt von Spotify. Erst wenn du's erlaubst, lädt der Player. Dabei gehen Daten wie deine IP-Adresse an
        Spotify, und Spotify kann Cookies setzen.{' '}
        <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
          Datenschutz
        </a>
      </p>
      <div className="settings-row">
        <button className="px-btn big" onClick={() => setConsent('spotify', true)} data-nav>
          METAL ERLAUBEN
        </button>
        <button className="px-btn" onClick={() => setConsent('spotify', false)} data-nav>
          LIEBER CHIPTUNE
        </button>
      </div>
      <p className="dim">Ändern kannst du das jederzeit in den Einstellungen.</p>
    </div>
  );
};
