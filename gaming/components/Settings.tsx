import React, { useEffect } from 'react';
import { Cloud } from '../lib/useCloudSync';
import { ArcadeState, Palette } from '../lib/useArcadeState';
import { toggleMuted, useMuted } from '../../lib/mute';
import { TRACKS, trackById } from '../lib/tracks';
import { isOwned } from '../lib/quests';
import { IMPRINT_URL, PRIVACY_URL, setConsent, useConsent } from '../../lib/privacy';
import { warmUpGoogle } from '../../lib/googleAuth';
import { useSecretAdminTaps } from '../../lib/admin';
import { SpotifyAuth } from '../../hooks/useSpotifyAuth';
import { LANG, LANGUAGES, setLang, tr } from '../../lib/i18n';

export const PALETTES: { id: Palette; label: string }[] = [
  { id: 'modul', label: 'MODUL' },
  { id: 'arcade', label: 'ARCADE' },
  { id: 'gameboy', label: 'HANDHELD' },
  { id: 'amber', label: tr('AMBER', 'BERNSTEIN') },
  // From the prize counter (quests.ts); only shown once bought.
  { id: 'vapor', label: 'VAPORWAVE' },
  { id: 'virtualboy', label: 'VIRTUAL BOY' },
];

const SYNC_TEXT: Record<Cloud['sync'], string> = {
  idle: '',
  loading: tr('Loading your save game …', 'Lade dein Savegame …'),
  saving: 'Saving …',
  saved: tr('✓ Save game, stash and preferences are safe in your Google Drive.', '✓ Savegame, Stash und Vorlieben liegen safe in deinem Google Drive.'),
  error: tr('⚠ Backup isn’t working right now. Your profile stays on this device.', '⚠ Backup gerade nicht drin. Dein Profil bleibt auf diesem Gerät.'),
};

interface Props {
  cloud: Cloud;
  spotifyAuth: SpotifyAuth;
  state: ArcadeState;
  set: <K extends keyof ArcadeState>(key: K, value: ArcadeState[K]) => void;
  onClose: () => void;
}

// Settings: the optional Google account (which brings score, collection and
// preferences to every device) plus sound and screen colour.
export const Settings: React.FC<Props> = ({ cloud, spotifyAuth, state, set, onClose }) => {
  const muted = useMuted();
  const youtube = useConsent('youtube') === true;
  const onHeadingTap = useSecretAdminTaps();
  const spotify = useConsent('spotify') === true;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const signedIn = cloud.status === 'signed_in';
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={tr('Settings', 'Einstellungen')}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pixel-font" onClick={onHeadingTap}>{tr('⚙ SETTINGS', '⚙ EINSTELLUNGEN')}</h2>
        <button className="px-btn close-x" onClick={onClose} aria-label={tr('Close', 'Schließen')} data-nav>
          ✕
        </button>

        <section>
          <h3 className="pixel-font">{tr('YOUR ACCOUNT', 'DEIN ACCOUNT')}</h3>
          {cloud.status === 'not_configured' ? (
            <p className="dim">{tr('Sign-in isn’t set up on this site yet. Your profile stays on this device.', 'Die Anmeldung ist auf dieser Seite noch nicht eingerichtet. Dein Profil bleibt auf diesem Gerät.')}</p>
          ) : signedIn ? (
            <>
              <p className="pixel-font cloud-user">
                {tr('SIGNED IN AS', 'ANGEMELDET ALS')} {(cloud.user?.name ?? '').toUpperCase()}
              </p>
              {cloud.user?.email && <p className="dim">{cloud.user.email}</p>}
              {SYNC_TEXT[cloud.sync] && <p role="status">{SYNC_TEXT[cloud.sync]}</p>}
              <button className="px-btn" onClick={cloud.signOut} data-nav>
                {tr('SIGN OUT', 'ABMELDEN')}
              </button>
              <p className="dim">{tr('When you sign out, your profile stays on this device.', 'Beim Abmelden bleibt dein Profil auf diesem Gerät erhalten.')}</p>
            </>
          ) : (
            <>
              <p>
                {tr(
                  'Sign in with Google and your high score, collection, achievements and settings are there on every device. Everything is saved in your own Google Drive, in a private folder only RetroMind can see.',
                  'Melde dich mit Google an, dann sind Highscore, Sammlung, Erfolge und deine Einstellungen auf jedem Gerät da. Gespeichert wird in deinem eigenen Google Drive, in einem privaten Ordner, den nur RetroMind sieht.'
                )}
              </p>
              <button
                className="px-btn big"
                onClick={cloud.signIn}
                // Google's script only loads once someone reaches for this button.
                onPointerEnter={warmUpGoogle}
                onPointerDown={warmUpGoogle}
                onFocus={warmUpGoogle}
                disabled={cloud.status === 'signing_in'}
                data-nav
              >
                {cloud.status === 'signing_in'
                  ? tr('SIGNING IN …', 'ANMELDEN …')
                  : cloud.status === 'error'
                    ? tr('TRY GOOGLE SIGN-IN AGAIN', 'ERNEUT MIT GOOGLE ANMELDEN')
                    : tr('SIGN IN WITH GOOGLE', 'MIT GOOGLE ANMELDEN')}
              </button>
              <p className="dim">
                {tr(
                  'Without signing in, everything works just like before. If you’ve already played on another device, both save games get merged, nothing gets lost.',
                  'Ohne Login läuft alles wie gehabt. Hast du schon auf einem anderen Gerät gezockt, werden beide Savegames zusammengeführt, nix geht verloren.'
                )}
              </p>
            </>
          )}
        </section>

        <section>
          <h3 className="pixel-font">{tr('SOUND', 'TON')}</h3>
          <div className="settings-row">
            <button className="px-btn" aria-pressed={state.music} onClick={() => set('music', !state.music)} data-nav>
              ♪ {tr('MUSIC', 'MUSIK')} {state.music ? tr('ON', 'AN') : tr('OFF', 'AUS')}
            </button>
            <button className="px-btn" aria-pressed={state.sfx} onClick={() => set('sfx', !state.sfx)} data-nav>
              SFX {state.sfx ? tr('ON', 'AN') : tr('OFF', 'AUS')}
            </button>
            <button className="px-btn" aria-pressed={muted} onClick={toggleMuted} data-nav>
              {muted ? tr('SOUND OFF', 'TON AUS') : tr('SOUND ON', 'TON AN')}
            </button>
          </div>
          <h4 className="pixel-font">{tr('ARCADE MUSIC', 'HALLENMUSIK')}</h4>
          <div className="settings-row" role="group" aria-label={tr('Arcade music', 'Hallenmusik')}>
            <button
              className="px-btn"
              aria-pressed={state.musicSource === 'spotify'}
              onClick={() => {
                set('musicSource', 'spotify');
                if (!state.music) set('music', true);
                // Picking Spotify here is the yes to loading its player.
                setConsent('spotify', true);
              }}
              data-nav
            >
              {tr("🤘 '80S METAL (SPOTIFY)", '🤘 80ER METAL (SPOTIFY)')}
            </button>
            <button
              className="px-btn"
              aria-pressed={state.musicSource === 'chip'}
              onClick={() => {
                set('musicSource', 'chip');
                if (!state.music) set('music', true);
              }}
              data-nav
            >
              CHIPTUNE
            </button>
          </div>
          <p className="dim">
            {state.musicSource === 'spotify'
              ? spotify
                ? tr('’80s heavy metal from Spotify. Without a Spotify login, Spotify only plays short previews.', 'Heavy Metal aus den 80ern von Spotify. Ohne Spotify-Login spielt Spotify nur kurze Vorschauen.')
                : tr('Spotify isn’t allowed yet, so the chiptune tracks play until then.', 'Spotify ist noch nicht erlaubt, bis dahin laufen die Chiptune-Stücke.')
              : tr('Original chiptune tracks from the sound chip. Pick your track below.', 'Selbst komponierte Chiptune-Stücke vom Soundchip, dein Stück wählst du unten.')}
          </p>
          {state.musicSource === 'spotify' && spotifyAuth.status !== 'not_configured' && (
            <>
              <div className="settings-row">
                {spotifyAuth.status === 'signed_in' ? (
                  <button className="px-btn" onClick={spotifyAuth.signOut} data-nav>
                    {tr('SIGN OUT OF SPOTIFY', 'SPOTIFY ABMELDEN')} ({spotifyAuth.user?.name ?? '?'})
                  </button>
                ) : (
                  <button
                    className="px-btn"
                    onClick={() => {
                      setConsent('spotify', true);
                      spotifyAuth.signIn();
                    }}
                    disabled={spotifyAuth.status === 'signing_in'}
                    data-nav
                  >
                    {spotifyAuth.status === 'signing_in' ? tr('REDIRECTING …', 'WEITERLEITUNG …') : tr('SIGN IN WITH SPOTIFY', 'MIT SPOTIFY ANMELDEN')}
                  </button>
                )}
              </div>
              <p className="dim">
                {spotifyAuth.status === 'signed_in' && spotifyAuth.user?.product === 'premium'
                  ? tr('Premium detected: full songs, and the music fades in at the start (not on iPhone/iPad).', 'Premium erkannt: ganze Songs, die Musik wird beim Start langsam lauter (nicht auf iPhone/iPad).')
                  : spotifyAuth.status === 'signed_in'
                    ? tr('Without Premium, you get the regular Spotify player.', 'Ohne Premium bleibt es beim normalen Spotify-Player.')
                    : spotifyAuth.status === 'error'
                      ? tr('Sign-in didn’t work, please try again.', 'Anmeldung hat nicht geklappt, versuch es nochmal.')
                      : tr('With Spotify Premium you get full songs, and the music fades in at the start.', 'Mit Spotify Premium laufen ganze Songs und die Musik wird beim Start langsam lauter.')}
              </p>
            </>
          )}
          <h4 className="pixel-font">{tr('TRACK (CHIPTUNE)', 'MUSIKSTÜCK (CHIPTUNE)')}</h4>
          <div className="settings-row" role="group" aria-label={tr('Track', 'Musikstück')}>
            {TRACKS.filter((t) => isOwned(t.id, state.owned)).map((t) => (
              <button
                key={t.id}
                className="px-btn"
                aria-pressed={state.track === t.id}
                onClick={() => {
                  set('track', t.id);
                  // Picking a tune means wanting to hear it.
                  if (!state.music) set('music', true);
                  set('musicSource', 'chip');
                }}
                data-nav
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="dim">{trackById(state.track).text}</p>
        </section>

        <section>
          <h3 className="pixel-font">{tr('SCREEN', 'BILDSCHIRM')}</h3>
          <div className="settings-row">
            {PALETTES.filter((p) => isOwned(p.id, state.owned)).map((p) => (
              <button
                key={p.id}
                className="px-btn"
                aria-pressed={state.palette === p.id}
                onClick={() => set('palette', p.id)}
                data-nav
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="dim">{tr('More designs and tracks are waiting at the prize counter under “Quests”.', 'Weitere Designs und Musikstücke gibt es am Preis-Tresen unter „Quests“.')}</p>
        </section>

        <section>
          <h3 className="pixel-font">{tr('LANGUAGE', 'SPRACHE')}</h3>
          <div className="settings-row" role="group" aria-label={tr('Language', 'Sprache')}>
            {LANGUAGES.map((l) => (
              <button key={l.id} className="px-btn" aria-pressed={LANG === l.id} onClick={() => setLang(l.id)} data-nav>
                {l.name.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="pixel-font">{tr('PRIVACY', 'DATENSCHUTZ')}</h3>
          <div className="settings-row">
            <button className="px-btn" aria-pressed={youtube} onClick={() => setConsent('youtube', !youtube)} data-nav>
              ▶ YOUTUBE {youtube ? tr('ALLOWED', 'ERLAUBT') : tr('OFF', 'AUS')}
            </button>
            <button className="px-btn" aria-pressed={spotify} onClick={() => setConsent('spotify', !spotify)} data-nav>
              ♫ SPOTIFY {spotify ? tr('ALLOWED', 'ERLAUBT') : tr('OFF', 'AUS')}
            </button>
          </div>
          <p className="dim">
            {tr(
              'Videos only load once you allow YouTube, and the metal music only once you allow Spotify. RetroMind fetches images and text from Wikipedia through its own server, so your browser never talks to Wikipedia directly.',
              'Videos laden erst, wenn du YouTube erlaubst, die Metal-Musik erst, wenn du Spotify erlaubst. Bilder und Texte von Wikipedia holt RetroMind über den eigenen Server, dein Browser spricht nicht direkt mit Wikipedia.'
            )}
          </p>
          <p>
            <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
              {tr('Privacy policy', 'Datenschutzerklärung')}
            </a>
            {' · '}
            <a href={IMPRINT_URL} target="_blank" rel="noreferrer">
              {tr('Legal notice', 'Impressum')}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
