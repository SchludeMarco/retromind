import React from 'react';
import { PRIVACY_URL, setConsent, useConsent } from '../../lib/privacy';
import { tr } from '../../lib/i18n';

// Asks once in the hall whether the 80s metal may come from Spotify.
// Spotify's player sets its own cookies and learns the visitor's IP
// address, so (DSGVO) it only loads after a yes here or in the settings.
// The Gaming domain keeps its own answer, separate from the Zeitreise.
// Until then, and after a no, the chiptune tunes play.
export const SpotifyAsk: React.FC = () => {
  const choice = useConsent('spotify');
  if (choice !== undefined) return null;
  return (
    <div className="spotify-ask" role="dialog" aria-label={tr('Allow metal from Spotify?', 'Metal von Spotify erlauben?')}>
      <p className="pixel-font">{tr("🤘 '80S METAL IN THE ARCADE?", '🤘 80ER METAL IN DER HALLE?')}</p>
      <p>
        {tr(
          'The music comes from Spotify. The player only loads once you allow it. Data such as your IP address is then sent to Spotify, and Spotify may set cookies.',
          "Die Musik kommt von Spotify. Erst wenn du's erlaubst, lädt der Player. Dabei gehen Daten wie deine IP-Adresse an Spotify, und Spotify kann Cookies setzen."
        )}{' '}
        <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
          {tr('Privacy', 'Datenschutz')}
        </a>
      </p>
      <div className="settings-row">
        <button className="px-btn big" onClick={() => setConsent('spotify', true)} data-nav>
          {tr('ALLOW METAL', 'METAL ERLAUBEN')}
        </button>
        <button className="px-btn" onClick={() => setConsent('spotify', false)} data-nav>
          {tr('CHIPTUNE, PLEASE', 'LIEBER CHIPTUNE')}
        </button>
      </div>
      <p className="dim">{tr('You can change this anytime in the settings.', 'Ändern kannst du das jederzeit in den Einstellungen.')}</p>
    </div>
  );
};
