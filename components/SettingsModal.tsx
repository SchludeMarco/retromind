import React, { useEffect, useState } from 'react';
import { InitialsPicker } from './InitialsPicker';
import { setInitials, useInitials } from '../lib/initials';
import { Modal } from './Modal';
import { FontSizeControl } from './FontSizeControl';
import { DECADES_DB } from '../constants';
import { toggleMuted, useMuted } from '../lib/mute';
import { THEMES, setTheme, useTheme } from '../lib/theme';
import { IMPRINT_URL, PRIVACY_URL, setConsent, useConsent } from '../lib/privacy';
import { deleteMyData, downloadMyData } from '../lib/myData';
import { useSecretAdminTaps } from '../lib/admin';
import { LANG, LANGUAGES, setLang, tr } from '../lib/i18n';
import { setXmasMode, setXmasSounds, useXmasMode, useXmasSounds, XmasMode } from '../lib/season';

const XMAS_OPTIONS: { id: XmasMode; label: string }[] = [
  { id: 'auto', label: tr('Automatic (Nov 1 to Jan 6)', 'Automatisch (1. Nov. bis 6. Jan.)') },
  { id: 'on', label: tr('On now', 'Jetzt an') },
  { id: 'off', label: tr('Off', 'Aus') },
];
import { GoogleUser, SpotifyUser } from '../types';
import { GoogleAuthStatus } from '../hooks/useGoogleAuth';
import { SpotifyAuthStatus } from '../hooks/useSpotifyAuth';
import { warmUpGoogle } from '../lib/googleAuth';

const SPOTIFY_PRODUCT_LABEL: Record<string, string> = {
  premium: 'Spotify Premium',
  free: 'Spotify Free',
  open: 'Spotify Free',
};

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
  /** Shows the welcome screen (ticking clock, "Go back...") again; left out
   *  while the welcome screen is already showing. */
  onBackToWelcome?: () => void;
  hasUnseenNews: boolean;
  userName: string;
  userBirthDate: string;
  /** Left out on the welcome screen, where the name form isn't reached yet. */
  onEditProfile?: () => void;
  googleStatus: GoogleAuthStatus;
  googleUser: GoogleUser | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  spotifyStatus: SpotifyAuthStatus;
  spotifyUser: SpotifyUser | null;
  onSpotifySignIn: () => void;
  onSpotifySignOut: () => void;
  /** Lifts the dialog above the welcome screen. */
  aboveSplash?: boolean;
  onDismiss: () => void;
  onCloseClick: () => void;
}> = ({
  fontScale, onFontScaleChange,
  currentDecade, onDecadeChange,
  isSpotifyReady, isSpotifyPlaying, onToggleSpotify, spotifyAllowed,
  onOpenWhatsNew, onBackToWelcome, hasUnseenNews,
  userName, userBirthDate, onEditProfile,
  googleStatus, googleUser, onGoogleSignIn, onGoogleSignOut,
  spotifyStatus, spotifyUser, onSpotifySignIn, onSpotifySignOut,
  aboveSplash = false,
  onDismiss, onCloseClick,
}) => {
  const info = DECADES_DB[currentDecade];
  const muted = useMuted();
  const xmasMode = useXmasMode();
  const xmasSounds = useXmasSounds();
  const theme = useTheme();
  const onHeadingTap = useSecretAdminTaps();
  const initials = useInitials();
  const [tag, setTag] = useState(initials || 'AAA');
  // The tag can also arrive from the Google account while this is open.
  useEffect(() => {
    if (initials) setTag(initials);
  }, [initials]);

  return (
    <Modal onClose={onDismiss} label={tr('App settings', 'App-Einstellungen')} above={aboveSplash}>
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
        {onEditProfile && (
          <button
            onClick={onEditProfile}
            className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
          >
            ✏️ {tr('Change name and date of birth', 'Name und Geburtsdatum ändern')}
          </button>
        )}
        <span className="block text-xs uppercase font-bold text-retro-brown mt-5 mb-2">{tr('Your initials', 'Dein Kürzel')}</span>
        <div className="flex flex-wrap items-center gap-3">
          <InitialsPicker value={tag} onChange={setTag} onEnter={() => setInitials(tag)} />
          <button
            onClick={() => setInitials(tag)}
            disabled={tag === initials}
            className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm disabled:opacity-60"
          >
            {tag === initials ? tr('✓ Saved', '✓ Gespeichert') : tr('Save', 'Speichern')}
          </button>
        </div>
        <p className="text-[10px] text-retro-tan mt-2">
          {googleStatus === 'signed_in'
            ? tr(
                'Three characters, like on the old pinball high score tables. They are also kept in your Google account and show up on the high score tables in RetroMind – Gaming.',
                'Drei Zeichen, wie früher auf den Highscore-Tafeln am Flipper. Sie liegen auch in deinem Google-Konto und stehen bei den Highscores in RetroMind – Gaming.'
              )
            : tr(
                'Three characters, like on the old pinball high score tables. They stay on this device; with Google sign-in they also reach your other devices and the high score tables in RetroMind – Gaming.',
                'Drei Zeichen, wie früher auf den Highscore-Tafeln am Flipper. Sie bleiben auf diesem Gerät; mit Google-Anmeldung kommen sie auch auf deine anderen Geräte und zu den Highscores in RetroMind – Gaming.'
              )}
        </p>
      </div>

      {(googleStatus !== 'not_configured' || spotifyStatus !== 'not_configured') && (
        <div className="mt-6 pt-5 border-t border-retro-ink/20">
          <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Accounts (optional)', 'Konten (freiwillig)')}</span>
          {googleStatus !== 'not_configured' && (
            <div className="mb-4">
              {googleStatus === 'signed_in' && googleUser ? (
                <>
                  <p className="text-sm mb-2">
                    {tr(
                      `☁️ Signed in with Google as ${googleUser.name}. Your journey is also backed up to your own Google Drive.`,
                      `☁️ Mit Google angemeldet als ${googleUser.name}. Deine Reise wird zusätzlich in deinem eigenen Google Drive gesichert.`
                    )}
                  </p>
                  <button onClick={onGoogleSignOut} className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm">
                    {tr('Sign out of Google', 'Von Google abmelden')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onGoogleSignIn}
                    // Google's script only loads once someone reaches for this button.
                    onPointerEnter={warmUpGoogle}
                    onPointerDown={warmUpGoogle}
                    onFocus={warmUpGoogle}
                    disabled={googleStatus === 'signing_in'}
                    className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm disabled:opacity-60"
                  >
                    {googleStatus === 'signing_in'
                      ? tr('Signing in …', 'Anmelden …')
                      : googleStatus === 'error'
                      ? tr('Sign in with Google again', 'Erneut mit Google anmelden')
                      : tr('☁️ Sign in with Google', '☁️ Mit Google anmelden')}
                  </button>
                  <p className="text-[10px] text-retro-tan mt-2">
                    {tr(
                      'Backs your journey up to your own Google Drive, so you can continue on any device. Also applies to RetroMind – Gaming.',
                      'Sichert deine Reise in deinem eigenen Google Drive, damit du auf jedem Gerät weitermachen kannst. Gilt auch für RetroMind – Gaming.'
                    )}
                  </p>
                </>
              )}
            </div>
          )}
          {spotifyStatus !== 'not_configured' && (
            <div>
              {spotifyStatus === 'signed_in' && spotifyUser ? (
                <>
                  <p className="text-sm mb-2">
                    🎧 {tr('Signed in with Spotify as', 'Mit Spotify angemeldet als')} {spotifyUser.name} ({SPOTIFY_PRODUCT_LABEL[spotifyUser.product] || spotifyUser.product}).
                  </p>
                  <button onClick={onSpotifySignOut} className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm">
                    {tr('Sign out of Spotify', 'Von Spotify abmelden')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onSpotifySignIn}
                    disabled={spotifyStatus === 'signing_in'}
                    className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm disabled:opacity-60"
                  >
                    {spotifyStatus === 'signing_in'
                      ? tr('Redirecting …', 'Weiterleitung …')
                      : spotifyStatus === 'error'
                      ? tr('Sign in with Spotify again', 'Erneut mit Spotify anmelden')
                      : tr('🎧 Sign in with Spotify', '🎧 Mit Spotify anmelden')}
                  </button>
                  <p className="text-[10px] text-retro-tan mt-2">
                    {tr(
                      'With Spotify Premium the songs play in full instead of as 30-second previews.',
                      'Mit Spotify Premium laufen die Songs ganz statt als 30-Sekunden-Vorschau.'
                    )}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

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
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Christmas look', 'Weihnachtslook')}</span>
        <div role="radiogroup" aria-label={tr('Christmas look', 'Weihnachtslook')} className="grid gap-2">
          {XMAS_OPTIONS.map((o) => (
            <button
              key={o.id}
              role="radio"
              aria-checked={xmasMode === o.id}
              onClick={() => setXmasMode(o.id)}
              className={`retro-button px-3 py-2 border-2 border-retro-ink text-left font-bold text-sm ${
                xmasMode === o.id ? 'bg-retro-highlight' : 'bg-white'
              }`}
            >
              {xmasMode === o.id ? '● ' : ''}{o.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-retro-tan mt-2">
          {tr(
            'Fairy lights, snow, Christmas songs on the radio, jingles, the advent calendar and Grandma’s Christmas bakery in the cookbook. Automatic means November 1 to January 6; Off turns all of it off.',
            'Lichterkette, Schnee, Weihnachtslieder im Radio, Glöckchen, Adventskalender und Omas Weihnachtsbäckerei im Kochbuch. Automatisch heißt vom 1. November bis 6. Januar; Aus schaltet alles ab.'
          )}
        </p>
        <label className="mt-3 flex items-center gap-2 text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={xmasSounds} onChange={(e) => setXmasSounds(e.target.checked)} className="w-4 h-4 accent-retro-ink" />
          {tr('Christmas jingles and “Ho ho ho”', 'Weihnachtsglöckchen und „Ho ho ho“')}
        </label>
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

      <YouTubeChoice />

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('More editions', 'Weitere Editionen')}</span>
        <a
          href="/gaming/?from=zeitreise"
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

      {onBackToWelcome && (
      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Welcome screen', 'Willkommensbildschirm')}</span>
        <button
          onClick={onBackToWelcome}
          className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
        >
          {tr('🕰️ Back to the welcome screen', '🕰️ Zurück zum Willkommensbildschirm')}
        </button>
      </div>
      )}

      <p className="mt-6 pt-4 border-t border-retro-ink/20 text-xs uppercase tracking-wide text-retro-brown">
        RetroMind · Version {__APP_VERSION__}
      </p>
      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Privacy', 'Datenschutz')}</span>
        <p className="text-xs leading-relaxed">
          {tr(
            'Your journey stays in this browser. RetroMind fetches pictures and sounds from other sites through its own server, and Spotify and YouTube only load with your OK.',
            'Deine Reise bleibt in diesem Browser. Bilder und Klänge von anderen Seiten holt RetroMind über den eigenen Server, Spotify und YouTube laden nur mit deinem OK.'
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
        <span className="block text-xs uppercase font-bold text-retro-brown mt-4 mb-2">{tr('Your data', 'Deine Daten')}</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => downloadMyData('zeitreise')}
            className="retro-button px-3 py-1.5 border-2 border-retro-ink bg-white font-bold text-xs"
          >
            {tr('⬇ Download my data', '⬇ Meine Daten herunterladen')}
          </button>
          <button
            onClick={() => deleteMyData()}
            className="retro-button px-3 py-1.5 border-2 border-retro-ink bg-white font-bold text-xs"
          >
            {tr('✕ Delete all my data', '✕ Alle meine Daten löschen')}
          </button>
        </div>
        <p className="text-[10px] text-retro-tan mt-2">
          {tr(
            'Everything RetroMind knows about you is stored in this browser. The file contains all of it; deleting removes all of it from this device.',
            'Alles, was RetroMind über dich weiß, liegt in diesem Browser. Die Datei enthält alles davon; Löschen entfernt alles von diesem Gerät.'
          )}
        </p>
      </div>
    </Modal>
  );
};

// The videos of the year above every stop (components/YearWelcome) come from
// YouTube, which only loads once allowed; here that choice can be changed.
const YouTubeChoice: React.FC = () => {
  const allowed = useConsent('youtube') === true;
  return (
    <div className="mt-6 pt-5 border-t border-retro-ink/20">
      <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Videos', 'Videos')}</span>
      <button
        onClick={() => setConsent('youtube', !allowed)}
        aria-pressed={allowed}
        className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
      >
        {allowed ? tr('Stop loading YouTube', 'YouTube nicht mehr laden') : tr('▶ Allow videos from YouTube', '▶ Videos von YouTube erlauben')}
      </button>
      <p className="text-[10px] text-retro-tan mt-2">
        {tr(
          'After every journey a video from that year plays under “Welcome to the year …”. YouTube only loads after you say OK; data such as your IP address then goes to Google.',
          'Nach jeder Reise läuft unter „Willkommen im Jahr …“ ein Video aus diesem Jahr. YouTube lädt erst nach deinem OK; dabei gehen Daten wie deine IP-Adresse an Google.'
        )}
      </p>
    </div>
  );
};
