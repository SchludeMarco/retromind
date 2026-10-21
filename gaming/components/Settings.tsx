import React, { useEffect, useState } from 'react';
import { Cloud } from '../lib/useCloudSync';
import { ArcadeState, Palette } from '../lib/useArcadeState';
import { toggleMuted, useMuted } from '../../lib/mute';
import { setMusicVolume, useMusicVolume } from '../../lib/musicVolume';
import { TINT_TRACK, setColorTint, useColorTint } from '../../lib/colorTint';
import { TRACKS, trackById } from '../lib/tracks';
import { isOwned } from '../lib/quests';
import { IMPRINT_URL, PRIVACY_URL, setConsent, useConsent } from '../../lib/privacy';
import { deleteMyData, downloadMyData } from '../../lib/myData';
import { warmUpGoogle } from '../../lib/googleAuth';
import { useSecretAdminTaps } from '../../lib/admin';
import { SpotifyAuth } from '../../hooks/useSpotifyAuth';
import { LANG, LANGUAGES, setLang, tr } from '../../lib/i18n';
import { setInitials, useInitials } from '../../lib/initials';
import { InitialsPicker } from '../../components/InitialsPicker';
import { chip } from '../lib/chiptune';
import { installSteps, promptInstall, useInstall } from '../../lib/install';
import { downloadReminder, googleCalendarLink } from '../../lib/calendarReminder';
import { PushTopic, useNotifySettings } from '../../lib/push';

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
  saving: tr('Syncing …', 'Gleicht ab …'),
  saved: tr('✓ Save game, stash and preferences are in sync on all your devices and with the Zeitreise (via your Google Drive).', '✓ Savegame, Stash und Vorlieben sind auf all deinen Geräten und mit der Zeitreise synchron (über dein Google Drive).'),
  error: tr('⚠ Sync isn’t working right now. Your profile stays on this device.', '⚠ Abgleich gerade nicht drin. Dein Profil bleibt auf diesem Gerät.'),
};

interface Props {
  cloud: Cloud;
  spotifyAuth: SpotifyAuth;
  state: ArcadeState;
  set: <K extends keyof ArcadeState>(key: K, value: ArcadeState[K]) => void;
  onClose: () => void;
  /** The hall's controls (components/ControlHandle GamingControls), at the top. */
  controls?: React.ReactNode;
}

// Settings: the optional Google account (which brings score, collection and
// preferences to every device) plus sound and screen colour.
export const Settings: React.FC<Props> = ({ cloud, spotifyAuth, state, set, onClose, controls }) => {
  const muted = useMuted();
  const musicVolume = useMusicVolume();
  const tint = Math.round(useColorTint() * 100);
  const youtube = useConsent('youtube') === true;
  const onHeadingTap = useSecretAdminTaps();
  const spotify = useConsent('spotify') === true;
  const initials = useInitials();
  const [tag, setTag] = useState(initials || 'AAA');
  const saveTag = () => {
    chip.play('powerup');
    setInitials(tag);
  };
  // The tag can also arrive from the cloud while this is open.
  useEffect(() => {
    if (initials) setTag(initials);
  }, [initials]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const signedIn = cloud.status === 'signed_in';
  const install = useInstall();
  const [installHelp, setInstallHelp] = useState(false);
  return (
    <div className="overlay side-overlay" onClick={onClose}>
      <div
        className="dialog settings-dialog side-panel"
        role="dialog"
        aria-modal="true"
        aria-label={tr('Settings', 'Einstellungen')}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pixel-font" onClick={onHeadingTap}>{tr('⚙ SETTINGS', '⚙ EINSTELLUNGEN')}</h2>
        <button className="px-btn close-x" onClick={onClose} aria-label={tr('Close', 'Schließen')} data-nav>
          ✕
        </button>

        {controls}

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
          <h3 className="pixel-font">{tr('YOUR INITIALS', 'DEIN KÜRZEL')}</h3>
          <div className="settings-row settings-initials">
            <InitialsPicker value={tag} onChange={setTag} onEnter={saveTag} />
            <button className="px-btn" onClick={saveTag} disabled={tag === initials} data-nav>
              {tag === initials ? tr('✓ SAVED', '✓ GESPEICHERT') : tr('SAVE', 'SPEICHERN')}
            </button>
          </div>
          <p className="dim">
            {signedIn
              ? tr(
                  'Three characters, like on the old pinball high score tables. They show up on every high score table and are also kept in your Google account, so they follow you to other devices and to the RetroMind journey.',
                  'Drei Zeichen, wie früher auf den Highscore-Tafeln am Flipper. Sie stehen bei jedem Highscore und liegen auch in deinem Google-Konto, so gelten sie auf anderen Geräten und in der RetroMind-Zeitreise.'
                )
              : tr(
                  'Three characters, like on the old pinball high score tables. They show up on every high score table and stay on this device. Sign in with Google to take them to other devices.',
                  'Drei Zeichen, wie früher auf den Highscore-Tafeln am Flipper. Sie stehen bei jedem Highscore und bleiben auf diesem Gerät. Mit Google-Anmeldung nimmst du sie auf andere Geräte mit.'
                )}
          </p>
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
          {/* Louder and quieter for the music (Marco, 2026-10-08), the same
              volume as the slider in the music player. */}
          <label className="settings-volume">
            <span className="pixel-font">{tr('MUSIC VOLUME', 'MUSIK-LAUTSTÄRKE')}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(musicVolume * 100)}
              onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
              aria-label={tr('Music volume', 'Musik-Lautstärke')}
              data-nav
            />
            <span className="pixel-font">{Math.round(musicVolume * 100)}</span>
          </label>
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
          {/* Blue to orange over the whole screen, the same slider as in the Zeitreise (lib/colorTint.ts). */}
          <label className="settings-volume settings-tint">
            <span className="pixel-font">{tr('BLUE', 'BLAU')}</span>
            <input
              type="range"
              min={-100}
              max={100}
              step={5}
              value={tint}
              onChange={(e) => setColorTint(Number(e.target.value) / 100)}
              aria-label={tr('Screen color from blue to orange', 'Bildschirmfarbe von Blau bis Orange')}
              style={{ background: TINT_TRACK }}
              data-nav
            />
            <span className="pixel-font">ORANGE</span>
          </label>
          {tint !== 0 && (
            <div className="settings-row">
              <button className="px-btn" onClick={() => setColorTint(0)} data-nav>
                {tr('COLOR NORMAL', 'FARBE NORMAL')}
              </button>
            </div>
          )}
          <p className="dim">{tr('More designs and tracks are waiting at the prize counter under “Quests”.', 'Weitere Designs und Musikstücke gibt es am Preis-Tresen unter „Quests“.')}</p>
        </section>

        <Notifications />

        {/* Install with one tap, or the menu steps where the browser has no prompt (lib/install.ts). */}
        <section>
          <h3 className="pixel-font">{tr('ON YOUR PHONE', 'AUFS HANDY')}</h3>
          {install.installed ? (
            <p className="dim">{tr('✓ The arcade is installed on this device.', '✓ Die Spielhalle ist auf diesem Gerät installiert.')}</p>
          ) : (
            <>
              <div className="settings-row">
                <button
                  className="px-btn"
                  onClick={async () => {
                    chip.play('select');
                    if (install.canPrompt) await promptInstall();
                    else setInstallHelp((v) => !v);
                  }}
                  aria-expanded={install.canPrompt ? undefined : installHelp}
                  data-nav
                >
                  {tr('⬇ INSTALL AS APP', '⬇ ALS APP INSTALLIEREN')}
                </button>
              </div>
              {installHelp && (
                <ol className="install-steps">
                  {installSteps(install.platform).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              )}
            </>
          )}
          <p className="dim">
            {tr(
              'A weekly nudge in your own calendar (Sunday morning). RetroMind stores nothing for it.',
              'Ein Stups pro Woche in deinem eigenen Kalender (Sonntagmorgen). RetroMind speichert dafür nichts.'
            )}
          </p>
          <div className="settings-row">
            <button className="px-btn" onClick={() => downloadReminder('gaming')} data-nav>
              {tr('📅 MY CALENDAR', '📅 MEIN KALENDER')}
            </button>
            <a className="px-btn" href={googleCalendarLink('gaming')} target="_blank" rel="noopener noreferrer" data-nav>
              {tr('GOOGLE CALENDAR', 'GOOGLE KALENDER')}
            </a>
          </div>
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
          <div className="settings-row">
            <button className="px-btn" onClick={() => downloadMyData('gaming')} data-nav>
              {tr('⬇ MY DATA', '⬇ MEINE DATEN')}
            </button>
            <button className="px-btn" onClick={() => deleteMyData()} data-nav>
              {tr('✕ DELETE ALL', '✕ ALLES LÖSCHEN')}
            </button>
          </div>
          <p className="dim">
            {tr(
              'Your savegame and settings live in this browser. “My data” downloads all of it as a file, “Delete all” removes all of it from this device.',
              'Savegame und Einstellungen liegen in diesem Browser. „Meine Daten“ lädt alles als Datei herunter, „Alles löschen“ entfernt alles von diesem Gerät.'
            )}
          </p>
        </section>

        <p className="dim settings-version">RetroMind – Gaming · Version {__APP_VERSION__}</p>
      </div>
    </div>
  );
};

/** Notifications for all devices (lib/push.ts): main switch, one per topic, this device. */
const Notifications: React.FC = () => {
  const n = useNotifySettings();
  if (n.device === null || n.device === 'unsupported') return null;
  const topics: { id: PushTopic; icon: string; label: string; hint: string }[] = [
    {
      id: 'rivals',
      icon: '⚔️',
      label: tr('OVERTAKEN!', 'ÜBERHOLT!'),
      hint: tr('Someone passes your entry on a high score table.', 'Jemand überholt deinen Eintrag auf einer Highscore-Tafel.'),
    },
    {
      id: 'chat',
      icon: '✉️',
      label: tr('MESSAGES TO YOU', 'NACHRICHTEN AN DICH'),
      hint: tr('Someone writes to you in the chat corner.', 'Jemand schreibt dir in der Plauderecke.'),
    },
    {
      id: 'room',
      icon: '👥',
      label: tr('GROUP CHAT', 'GRUPPENCHAT'),
      hint: tr('Every new message in “Everyone”.', 'Jede neue Nachricht in „Alle zusammen“.'),
    },
    {
      id: 'challenge',
      icon: '⚡',
      label: tr('BLITZ CHALLENGE', 'BLITZ-CHALLENGE'),
      hint: tr('A reminder in the evening if you haven’t made today’s challenge yet.', 'Abends eine Erinnerung, wenn du die Challenge des Tages noch nicht geschafft hast.'),
    },
  ];
  const click = (fn: () => unknown) => () => {
    chip.play('select');
    fn();
  };
  return (
    <section>
      <h3 className="pixel-font">{tr('NOTIFICATIONS', 'BENACHRICHTIGUNGEN')}</h3>
      <div className="settings-row">
        <button className="px-btn" aria-pressed={n.prefs.on} onClick={click(() => n.setMain(!n.prefs.on))} disabled={n.busy} data-nav>
          {n.prefs.on ? tr('🔔 ON', '🔔 AN') : tr('🔕 OFF', '🔕 AUS')}
        </button>
      </div>
      {n.prefs.on &&
        topics.map((t) => (
          <div key={t.id} className="settings-row settings-notify">
            <button className="px-btn" aria-pressed={n.prefs[t.id]} onClick={click(() => n.setTopic(t.id, !n.prefs[t.id]))} disabled={n.busy} data-nav>
              {t.icon} {t.label}: {n.prefs[t.id] ? tr('ON', 'AN') : tr('OFF', 'AUS')}
            </button>
            <span className="dim">{t.hint}</span>
          </div>
        ))}
      <p className="dim">
        {n.device === 'install-first'
          ? tr(
              'On iPhone and iPad, notifications only work in the app on your home screen: install the arcade first (below), then allow them there.',
              'Auf iPhone und iPad gehen Benachrichtigungen nur in der App auf dem Home-Bildschirm: installiere zuerst die Spielhalle (unten) und erlaube sie dort.'
            )
          : n.device === 'blocked'
            ? tr('Notifications are blocked for this site. You can allow them again in your browser settings.', 'Mitteilungen sind für diese Seite gesperrt. In den Browser-Einstellungen kannst du sie wieder erlauben.')
            : n.prefs.on
              ? tr(
                  'Applies to all your devices and to the Zeitreise. Off means no messages at all and no “Overtaken!” note in the arcade; who passed you is still in the Hall of Fame.',
                  'Gilt für all deine Geräte und für die Zeitreise. Aus heißt: gar keine Nachrichten und kein „Überholt!“-Hinweis in der Spielhalle; wer dich überholt hat, steht weiter in der Hall of Fame.'
                )
              : tr('All notifications are off, on all your devices.', 'Alle Benachrichtigungen sind aus, auf all deinen Geräten.')}
      </p>
      {n.prefs.on && (n.device === 'on' || n.device === 'off') && (
        <div className="settings-row settings-notify">
          <button className="px-btn" onClick={click(n.device === 'on' ? n.stopHere : n.allowHere)} disabled={n.busy} data-nav>
            {n.busy ? '…' : n.device === 'on' ? tr('NOT ON THIS DEVICE', 'NICHT AUF DIESEM GERÄT') : tr('ALLOW ON THIS DEVICE', 'AUF DIESEM GERÄT ERLAUBEN')}
          </button>
          <span className="dim">
            {n.device === 'on'
              ? tr('This device shows them.', 'Dieses Gerät zeigt sie an.')
              : tr('This device doesn’t show them yet.', 'Dieses Gerät zeigt sie noch nicht an.')}
          </span>
        </div>
      )}
    </section>
  );
};
