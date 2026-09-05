import React from 'react';
import { Modal } from './Modal';
import { FontSizeControl } from './FontSizeControl';
import { DECADES_DB } from '../constants';

export const SettingsModal: React.FC<{
  fontScale: number;
  onFontScaleChange: (n: number) => void;
  currentDecade: string;
  onDecadeChange: (d: string) => void;
  isSpotifyReady: boolean;
  isSpotifyPlaying: boolean;
  onToggleSpotify: () => void;
  onDismiss: () => void;
  onCloseClick: () => void;
}> = ({
  fontScale, onFontScaleChange,
  currentDecade, onDecadeChange,
  isSpotifyReady, isSpotifyPlaying, onToggleSpotify,
  onDismiss, onCloseClick,
}) => {
  const info = DECADES_DB[currentDecade];

  return (
    <Modal onClose={onDismiss} label="App-Einstellungen">
      <button onClick={onCloseClick} aria-label="Schließen" className="absolute top-3 right-3 text-2xl leading-none">
        ✕
      </button>
      <span className="text-xs uppercase font-bold text-retro-amber-dark block">Allgemein</span>
      <h3 className="text-3xl font-bold mb-5">Einstellungen</h3>

      <FontSizeControl scale={fontScale} onChange={onFontScaleChange} />

      {info?.spotifyPlaylistId && (
        <div className="mt-6 pt-5 border-t border-retro-ink/20">
          <span className="block text-xs uppercase font-bold text-retro-brown mb-2">Echte Hits dieser Dekade</span>
          <div className="flex justify-between items-center mb-3">
            <label htmlFor="rm-era" className="text-[10px] font-bold uppercase text-retro-tan">Ära wählen</label>
            <select
              id="rm-era"
              value={currentDecade}
              onChange={(e) => onDecadeChange(e.target.value)}
              className="text-sm bg-transparent font-bold cursor-pointer"
            >
              {Object.keys(DECADES_DB).map((d) => (
                <option key={d} value={d}>{d}er</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onToggleSpotify}
              disabled={!isSpotifyReady}
              aria-label={isSpotifyPlaying ? 'Spotify pausieren' : 'Spotify abspielen'}
              className="retro-button w-9 h-9 rounded-full border-2 border-retro-ink flex items-center justify-center bg-white flex-shrink-0 disabled:opacity-40"
            >
              {isSpotifyPlaying ? '⏸' : '▶'}
            </button>
            <p className="text-xs font-bold">
              {!isSpotifyReady
                ? 'Playlist wird geladen …'
                : isSpotifyPlaying
                ? `Spielt: „${info.title.split(':')[0].trim()}“`
                : 'Pausiert'}
            </p>
          </div>
          <p className="text-[10px] text-retro-tan">
            Läuft automatisch im Hintergrund, sobald du einmal irgendwo getippt/geklickt hast –
            streamt direkt von Spotify (Drittanbieter). Spotify hat dafür keine
            Lautstärke-Schnittstelle, die wir ansprechen könnten. Nur eine
            30-Sekunden-Vorschau?{' '}
            <a
              href={`https://open.spotify.com/playlist/${info.spotifyPlaylistId}`}
              target="_blank"
              rel="noreferrer"
              className="underline font-bold text-retro-amber-dark"
            >
              Playlist bei Spotify öffnen
            </a>{' '}
            und dort einloggen – dein Google-Konto zählt dafür nicht, das ist ein eigener Login. Mit
            Premium läuft dann der volle Song.
          </p>
        </div>
      )}

      <p className="mt-6 pt-4 border-t border-retro-ink/20 text-xs uppercase tracking-wide text-retro-brown">
        RetroMind · Version {__APP_VERSION__}
      </p>
    </Modal>
  );
};
