import React from 'react';
import { Modal } from './Modal';
import { FontSizeControl } from './FontSizeControl';
import { DECADES_DB } from '../constants';
import { toggleMuted, useMuted } from '../lib/mute';
import { THEMES, setTheme, useTheme } from '../lib/theme';
import { IMPRINT_URL, PRIVACY_URL, setConsent } from '../lib/privacy';
import { useSecretAdminTaps } from '../lib/admin';
import { LANG, LANGUAGES, setLang, tr } from '../lib/i18n';

function formatBirthDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return d && m && y ? tr(`${m}/${d}/${y}`, `${d}.${m}.${y}`) : iso;
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
  onDismiss: () => void;
  onCloseClick: () => void;
}> = ({
  fontScale, onFontScaleChange,
  currentDecade, onDecadeChange,
  isSpotifyReady, isSpotifyPlaying, onToggleSpotify, spotifyAllowed,
  onOpenWhatsNew, onBackToWelcome, hasUnseenNews,
  userName, userBirthDate, onEditProfile,
  onDismiss, onCloseClick,
}) => {
  const info = DECADES_DB[currentDecade];
  const muted = useMuted();
  const theme = useTheme();
  const onHeadingTap = useSecretAdminTaps();

  return (
    <Modal onClose={onDismiss} label={tr('App settings', 'App-Einstellungen')}>
      <button onClick={onCloseClick} aria-label={tr('Close', 'Schließen')} className="absolute top-3 right-3 text-2xl leading-none">
        ✕
      </button>
      <span className="text-xs uppercase font-bold text-retro-amber-dark block">{tr('General', 'Allgemein')}</span>
      <h3 className="text-3xl font-bold mb-5" onClick={onHeadingTap}>{tr('Settings', 'Einstellungen')}</h3>

      <FontSizeControl scale={fontScale} onChange={onFontScaleChange} />

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Your details', 'Deine Angaben')}</span>
        <p className="text-sm mb-3">
          {userName || tr('No name', 'Ohne Namen')}
          {userBirthDate && <>, {tr('born', 'geboren am')} {formatBirthDate(userBirthDate)}</>}
        </p>
        <button
          onClick={onEditProfile}
          className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
        >
          ✏️ {tr('Change name and date of birth', 'Name und Geburtsdatum ändern')}
        </button>
      </div>

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Design & Atmosphere', 'Design & Atmosphäre')}</span>
        <div role="radiogroup" aria-label={tr('App design', 'Design der App')} className="grid gap-2">
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
        <p className="text-[10px] text-retro-tan mt-2">{tr('Takes effect right away and stays saved in this browser.', 'Gilt sofort und bleibt in diesem Browser gespeichert.')}</p>
      </div>

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Language', 'Sprache')}</span>
        <div role="radiogroup" aria-label={tr('App language', 'Sprache der App')} className="grid gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              role="radio"
              aria-checked={LANG === l.id}
              lang={l.id === 'de' ? 'de' : 'en-US'}
              onClick={() => setLang(l.id)}
              className={`retro-button px-3 py-2 border-2 border-retro-ink text-left font-bold text-sm ${
                LANG === l.id ? 'bg-retro-highlight' : 'bg-white'
              }`}
            >
              {LANG === l.id ? '● ' : ''}{l.name}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-retro-tan mt-2">{tr('The page reloads once and remembers your choice in this browser.', 'Die Seite lädt einmal neu und merkt sich deine Wahl in diesem Browser.')}</p>
      </div>

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Sound', 'Ton')}</span>
        <button
          onClick={toggleMuted}
          aria-pressed={muted}
          className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
        >
          {muted ? tr('🔇 Sound is off – turn on', '🔇 Ton ist aus – einschalten') : tr('🔊 Sound is on – mute', '🔊 Ton ist an – stummschalten')}
        </button>
        <p className="text-[10px] text-retro-tan mt-2">
          {tr(
            'Applies to all of RetroMind, including RetroMind – Gaming. The speaker button in the top right toggles it too.',
            'Gilt für ganz RetroMind, auch für RetroMind – Gaming. Der Lautsprecher-Knopf oben rechts schaltet ebenfalls um.'
          )}
        </p>
      </div>

      {info?.spotifyPlaylistId && (
        <div className="mt-6 pt-5 border-t border-retro-ink/20">
          <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Real hits from this decade', 'Echte Hits dieser Dekade')}</span>
          <div className="flex justify-between items-center mb-3">
            <label htmlFor="rm-era" className="text-[10px] font-bold uppercase text-retro-tan">{tr('Choose an era', 'Ära wählen')}</label>
            <select
              id="rm-era"
              value={currentDecade}
              onChange={(e) => onDecadeChange(e.target.value)}
              className="text-sm bg-transparent font-bold cursor-pointer"
            >
              {Object.keys(DECADES_DB).map((d) => (
                <option key={d} value={d}>{tr(`${d}s`, `${d}er`)}</option>
              ))}
            </select>
          </div>
          {!spotifyAllowed ? (
            <div className="mb-2">
              <button
                onClick={() => setConsent('spotify', true)}
                className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
              >
                {tr('🎵 Allow music from Spotify', '🎵 Musik von Spotify erlauben')}
              </button>
              <p className="text-[10px] text-retro-tan mt-2">
                {tr(
                  'The Spotify player only loads after you say OK. When it does, data such as your IP address goes to Spotify, and Spotify may set cookies.',
                  'Der Spotify-Player lädt erst nach deinem OK. Dabei gehen Daten wie deine IP-Adresse an Spotify, und Spotify kann Cookies setzen.'
                )}
              </p>
            </div>
          ) : (
          <>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onToggleSpotify}
              disabled={!isSpotifyReady}
              aria-label={isSpotifyPlaying ? tr('Pause Spotify', 'Spotify pausieren') : tr('Play Spotify', 'Spotify abspielen')}
              className="retro-button w-9 h-9 rounded-full border-2 border-retro-ink flex items-center justify-center bg-white flex-shrink-0 disabled:opacity-40"
            >
              {isSpotifyPlaying ? '⏸' : '▶'}
            </button>
            <p className="text-xs font-bold">
              {!isSpotifyReady
                ? tr('Loading playlist …', 'Playlist wird geladen …')
                : isSpotifyPlaying
                ? tr(`Playing: “${info.title.split(':')[0].trim()}”`, `Spielt: „${info.title.split(':')[0].trim()}“`)
                : tr('Paused', 'Pausiert')}
            </p>
          </div>
          <p className="text-[10px] text-retro-tan">
            {tr(
              'Plays automatically in the background once you’ve tapped/clicked anywhere – streams straight from Spotify (third party). Spotify offers no volume interface we could use for this. Only a 30-second preview?',
              'Läuft automatisch im Hintergrund, sobald du einmal irgendwo getippt/geklickt hast – streamt direkt von Spotify (Drittanbieter). Spotify hat dafür keine Lautstärke-Schnittstelle, die wir ansprechen könnten. Nur eine 30-Sekunden-Vorschau?'
            )}{' '}
            <a
              href={`https://open.spotify.com/playlist/${info.spotifyPlaylistId}`}
              target="_blank"
              rel="noreferrer"
              className="underline font-bold text-retro-amber-dark"
            >
              {tr('Open the playlist on Spotify', 'Playlist bei Spotify öffnen')}
            </a>{' '}
            {tr(
              'and log in there – your Google account doesn’t count for this, it’s a separate login. With Premium you’ll then get the full song.',
              'und dort einloggen – dein Google-Konto zählt dafür nicht, das ist ein eigener Login. Mit Premium läuft dann der volle Song.'
            )}
          </p>
          <button
            onClick={() => setConsent('spotify', false)}
            className="text-[10px] underline font-bold text-retro-brown mt-2"
          >
            {tr('Stop loading Spotify', 'Spotify nicht mehr laden')}
          </button>
          </>
          )}
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('More editions', 'Weitere Editionen')}</span>
        <a
          href="/gaming/"
          className="retro-button inline-block px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm no-underline"
        >
          {tr('🕹️ Open RetroMind – Gaming', '🕹️ RetroMind – Gaming öffnen')}
        </a>
      </div>

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('News', 'Neuigkeiten')}</span>
        <button
          onClick={onOpenWhatsNew}
          className="retro-button relative px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
        >
          {tr('✨ What’s new?', '✨ Was ist neu?')}
          {hasUnseenNews && (
            <span aria-label={tr('new entries', 'neue Einträge')} className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-red-600 border-2 border-white" />
          )}
        </button>
      </div>

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Welcome screen', 'Willkommensbildschirm')}</span>
        <button
          onClick={onBackToWelcome}
          className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
        >
          {tr('🕰️ Back to the welcome screen', '🕰️ Zurück zum Willkommensbildschirm')}
        </button>
      </div>

      <p className="mt-6 pt-4 border-t border-retro-ink/20 text-xs uppercase tracking-wide text-retro-brown">
        RetroMind · Version {__APP_VERSION__}
      </p>
      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Privacy', 'Datenschutz')}</span>
        <p className="text-xs leading-relaxed">
          {tr(
            'Your journey stays in this browser. RetroMind fetches pictures and sounds from other sites through its own server, and Spotify only loads with your OK.',
            'Deine Reise bleibt in diesem Browser. Bilder und Klänge von anderen Seiten holt RetroMind über den eigenen Server, Spotify lädt nur mit deinem OK.'
          )}
        </p>
        <p className="text-xs mt-2">
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="underline font-bold text-retro-amber-dark">
            {tr('Privacy Policy', 'Datenschutzerklärung')}
          </a>
          {' · '}
          <a href={IMPRINT_URL} target="_blank" rel="noreferrer" className="underline font-bold text-retro-amber-dark">
            {tr('Legal Notice', 'Impressum')}
          </a>
        </p>
      </div>
    </Modal>
  );
};
