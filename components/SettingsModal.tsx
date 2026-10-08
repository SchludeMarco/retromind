import React from 'react';
import { Modal } from './Modal';
import { FontSizeControl } from './FontSizeControl';
import { DECADES_DB } from '../constants';
import { toggleMuted, useMuted } from '../lib/mute';
import { THEMES, setTheme, useTheme } from '../lib/theme';
import { IMPRINT_URL, PRIVACY_URL, setConsent } from '../lib/privacy';
import { ADMIN_URL } from '../lib/admin';

function formatBirthDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

export const SettingsModal: React.FC<{
  fontScale: number;
  onFontScaleChange: (n: number) => void;
  currentDecade: string;
  onDecadeChange: (d: string) => void;
  isSpotifyReady: boolean;
  isSpotifyPlaying: boolean;
  onToggleSpotify: () => void;
  spotifyAllowed: boolean;
  onOpenWhatsNew: () => void;
  /** Shows the welcome screen (ticking clock, "Go back...") again. */
  onBackToWelcome: () => void;
  hasUnseenNews: boolean;
  userName: string;
  userBirthDate: string;
  onEditProfile: () => void;
  /** Marco's Google account is signed in: show the link to the admin area. */
  isAdmin?: boolean;
  onDismiss: () => void;
  onCloseClick: () => void;
}> = ({
  fontScale, onFontScaleChange,
  currentDecade, onDecadeChange,
  isSpotifyReady, isSpotifyPlaying, onToggleSpotify, spotifyAllowed,
  onOpenWhatsNew, onBackToWelcome, hasUnseenNews,
  userName, userBirthDate, onEditProfile, isAdmin,
  onDismiss, onCloseClick,
}) => {
  const info = DECADES_DB[currentDecade];
  const muted = useMuted();
  const theme = useTheme();

  return (
    <Modal onClose={onDismiss} label="App-Einstellungen">
      <button onClick={onCloseClick} aria-label="Schließen" className="absolute top-3 right-3 text-2xl leading-none">
        ✕
      </button>
      <span className="text-xs uppercase font-bold text-retro-amber-dark block">Allgemein</span>
      <h3 className="text-3xl font-bold mb-5">Einstellungen</h3>

      <FontSizeControl scale={fontScale} onChange={onFontScaleChange} />

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">Deine Angaben</span>
        <p className="text-sm mb-3">
          {userName || 'Ohne Namen'}
          {userBirthDate && <>, geboren am {formatBirthDate(userBirthDate)}</>}
        </p>
        <button
          onClick={onEditProfile}
          className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
        >
          ✏️ Name und Geburtsdatum ändern
        </button>
      </div>

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">Design &amp; Atmosphäre</span>
        <div role="radiogroup" aria-label="Design der App" className="grid gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={theme === t.id}
              onClick={() => setTheme(t.id)}
              className={`retro-button flex items-center gap-3 px-3 py-2 border-2 border-retro-ink text-left ${
                theme === t.id ? 'bg-retro-highlight' : 'bg-white'
              }`}
            >
              <span className="flex flex-shrink-0" aria-hidden="true">
                {t.swatches.map((c) => (
                  <span key={c} className="w-4 h-8 first:rounded-l last:rounded-r" style={{ background: c }} />
                ))}
              </span>
              <span className="flex-grow">
                <span className="block font-bold text-sm">{theme === t.id ? '● ' : ''}{t.name}</span>
                <span className="block text-[10px] text-retro-tan">{t.description}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-retro-tan mt-2">Gilt sofort und bleibt in diesem Browser gespeichert.</p>
      </div>

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">Ton</span>
        <button
          onClick={toggleMuted}
          aria-pressed={muted}
          className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
        >
          {muted ? '🔇 Ton ist aus – einschalten' : '🔊 Ton ist an – stummschalten'}
        </button>
        <p className="text-[10px] text-retro-tan mt-2">
          Gilt für ganz RetroMind, auch für RetroMind – Gaming. Der Lautsprecher-Knopf oben rechts schaltet ebenfalls um.
        </p>
      </div>

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
          {!spotifyAllowed ? (
            <div className="mb-2">
              <button
                onClick={() => setConsent('spotify', true)}
                className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
              >
                🎵 Musik von Spotify erlauben
              </button>
              <p className="text-[10px] text-retro-tan mt-2">
                Der Spotify-Player lädt erst nach deinem OK. Dabei gehen Daten wie deine IP-Adresse an Spotify, und
                Spotify kann Cookies setzen.
              </p>
            </div>
          ) : (
          <>
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
          <button
            onClick={() => setConsent('spotify', false)}
            className="text-[10px] underline font-bold text-retro-brown mt-2"
          >
            Spotify nicht mehr laden
          </button>
          </>
          )}
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">Weitere Editionen</span>
        <a
          href="/gaming/"
          className="retro-button inline-block px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm no-underline"
        >
          🕹️ RetroMind – Gaming öffnen
        </a>
      </div>

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">Neuigkeiten</span>
        <button
          onClick={onOpenWhatsNew}
          className="retro-button relative px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
        >
          ✨ Was ist neu?
          {hasUnseenNews && (
            <span aria-label="neue Einträge" className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-red-600 border-2 border-white" />
          )}
        </button>
      </div>

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">Willkommensbildschirm</span>
        <button
          onClick={onBackToWelcome}
          className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
        >
          🕰️ Zurück zum Willkommensbildschirm
        </button>
      </div>

      {isAdmin && (
        <div className="mt-6 pt-5 border-t border-retro-ink/20">
          <span className="block text-xs uppercase font-bold text-retro-brown mb-2">Nur für dich</span>
          <a
            href={ADMIN_URL}
            className="retro-button inline-block px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
          >
            📊 Adminbereich: Nutzungszahlen
          </a>
        </div>
      )}

      <p className="mt-6 pt-4 border-t border-retro-ink/20 text-xs uppercase tracking-wide text-retro-brown">
        RetroMind · Version {__APP_VERSION__}
      </p>
      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">Datenschutz</span>
        <p className="text-xs leading-relaxed">
          Deine Reise bleibt in diesem Browser. Bilder und Klänge von anderen Seiten holt RetroMind über den eigenen
          Server, Spotify lädt nur mit deinem OK.
        </p>
        <p className="text-xs mt-2">
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="underline font-bold text-retro-amber-dark">
            Datenschutzerklärung
          </a>
          {' · '}
          <a href={IMPRINT_URL} target="_blank" rel="noreferrer" className="underline font-bold text-retro-amber-dark">
            Impressum
          </a>
        </p>
      </div>
    </Modal>
  );
};
