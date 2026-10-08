import React, { useEffect } from 'react';
import { Cloud } from '../lib/useCloudSync';
import { ArcadeState, Palette } from '../lib/useArcadeState';
import { toggleMuted, useMuted } from '../../lib/mute';
import { TRACKS, trackById } from '../lib/tracks';
import { isOwned } from '../lib/quests';
import { IMPRINT_URL, PRIVACY_URL, setConsent, useConsent } from '../../lib/privacy';
import { warmUpGoogle } from '../../lib/googleAuth';
import { ADMIN_URL, isAdminUser } from '../../lib/admin';
import { SpotifyAuth } from '../../hooks/useSpotifyAuth';

export const PALETTES: { id: Palette; label: string }[] = [
  { id: 'modul', label: 'MODUL' },
  { id: 'arcade', label: 'ARCADE' },
  { id: 'gameboy', label: 'HANDHELD' },
  { id: 'amber', label: 'BERNSTEIN' },
  // From the prize counter (quests.ts); only shown once bought.
  { id: 'vapor', label: 'VAPORWAVE' },
  { id: 'virtualboy', label: 'VIRTUAL BOY' },
];

const SYNC_TEXT: Record<Cloud['sync'], string> = {
  idle: '',
  loading: 'Lade dein Savegame …',
  saving: 'Saving …',
  saved: '✓ Savegame, Stash und Vorlieben liegen safe in deinem Google Drive.',
  error: '⚠ Backup gerade nicht drin. Dein Profil bleibt auf diesem Gerät.',
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
        aria-label="Einstellungen"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pixel-font">⚙ EINSTELLUNGEN</h2>
        <button className="px-btn close-x" onClick={onClose} aria-label="Schließen" data-nav>
          ✕
        </button>

        <section>
          <h3 className="pixel-font">DEIN ACCOUNT</h3>
          {cloud.status === 'not_configured' ? (
            <p className="dim">Die Anmeldung ist auf dieser Seite noch nicht eingerichtet. Dein Profil bleibt auf diesem Gerät.</p>
          ) : signedIn ? (
            <>
              <p className="pixel-font cloud-user">
                ANGEMELDET ALS {(cloud.user?.name ?? '').toUpperCase()}
              </p>
              {cloud.user?.email && <p className="dim">{cloud.user.email}</p>}
              {SYNC_TEXT[cloud.sync] && <p role="status">{SYNC_TEXT[cloud.sync]}</p>}
              <button className="px-btn" onClick={cloud.signOut} data-nav>
                ABMELDEN
              </button>
              <p className="dim">Beim Abmelden bleibt dein Profil auf diesem Gerät erhalten.</p>
            </>
          ) : (
            <>
              <p>
                Melde dich mit Google an, dann sind Highscore, Sammlung, Erfolge und deine Einstellungen auf jedem Gerät
                da. Gespeichert wird in deinem eigenen Google Drive, in einem privaten Ordner, den nur RetroMind sieht.
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
                  ? 'ANMELDEN …'
                  : cloud.status === 'error'
                    ? 'ERNEUT MIT GOOGLE ANMELDEN'
                    : 'MIT GOOGLE ANMELDEN'}
              </button>
              <p className="dim">
                Ohne Login läuft alles wie gehabt. Hast du schon auf einem anderen Gerät gezockt, werden beide
                Savegames zusammengeführt, nix geht verloren.
              </p>
            </>
          )}
        </section>

        <section>
          <h3 className="pixel-font">TON</h3>
          <div className="settings-row">
            <button className="px-btn" aria-pressed={state.music} onClick={() => set('music', !state.music)} data-nav>
              ♪ MUSIK {state.music ? 'AN' : 'AUS'}
            </button>
            <button className="px-btn" aria-pressed={state.sfx} onClick={() => set('sfx', !state.sfx)} data-nav>
              SFX {state.sfx ? 'AN' : 'AUS'}
            </button>
            <button className="px-btn" aria-pressed={muted} onClick={toggleMuted} data-nav>
              {muted ? 'TON AUS' : 'TON AN'}
            </button>
          </div>
          <h4 className="pixel-font">HALLENMUSIK</h4>
          <div className="settings-row" role="group" aria-label="Hallenmusik">
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
              🤘 80ER METAL (SPOTIFY)
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
                ? 'Heavy Metal aus den 80ern von Spotify. Ohne Spotify-Login spielt Spotify nur kurze Vorschauen.'
                : 'Spotify ist noch nicht erlaubt, bis dahin laufen die Chiptune-Stücke.'
              : 'Selbst komponierte Chiptune-Stücke vom Soundchip, dein Stück wählst du unten.'}
          </p>
          {state.musicSource === 'spotify' && spotifyAuth.status !== 'not_configured' && (
            <>
              <div className="settings-row">
                {spotifyAuth.status === 'signed_in' ? (
                  <button className="px-btn" onClick={spotifyAuth.signOut} data-nav>
                    SPOTIFY ABMELDEN ({spotifyAuth.user?.name ?? '?'})
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
                    {spotifyAuth.status === 'signing_in' ? 'WEITERLEITUNG …' : 'MIT SPOTIFY ANMELDEN'}
                  </button>
                )}
              </div>
              <p className="dim">
                {spotifyAuth.status === 'signed_in' && spotifyAuth.user?.product === 'premium'
                  ? 'Premium erkannt: ganze Songs, die Musik wird beim Start langsam lauter (nicht auf iPhone/iPad).'
                  : spotifyAuth.status === 'signed_in'
                    ? 'Ohne Premium bleibt es beim normalen Spotify-Player.'
                    : spotifyAuth.status === 'error'
                      ? 'Anmeldung hat nicht geklappt, versuch es nochmal.'
                      : 'Mit Spotify Premium laufen ganze Songs und die Musik wird beim Start langsam lauter.'}
              </p>
            </>
          )}
          <h4 className="pixel-font">MUSIKSTÜCK (CHIPTUNE)</h4>
          <div className="settings-row" role="group" aria-label="Musikstück">
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
          <h3 className="pixel-font">BILDSCHIRM</h3>
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
          <p className="dim">Weitere Designs und Musikstücke gibt es am Preis-Tresen unter „Quests“.</p>
        </section>

        {isAdminUser(cloud.user) && signedIn && (
          <section>
            <h3 className="pixel-font">NUR FÜR DICH</h3>
            <a className="px-btn" href={ADMIN_URL} data-nav>
              📊 ADMINBEREICH
            </a>
            <p className="dim">Wie viele Leute Zeitreise und Gaming nutzen.</p>
          </section>
        )}

        <section>
          <h3 className="pixel-font">DATENSCHUTZ</h3>
          <div className="settings-row">
            <button className="px-btn" aria-pressed={youtube} onClick={() => setConsent('youtube', !youtube)} data-nav>
              ▶ YOUTUBE {youtube ? 'ERLAUBT' : 'AUS'}
            </button>
            <button className="px-btn" aria-pressed={spotify} onClick={() => setConsent('spotify', !spotify)} data-nav>
              ♫ SPOTIFY {spotify ? 'ERLAUBT' : 'AUS'}
            </button>
          </div>
          <p className="dim">
            Videos laden erst, wenn du YouTube erlaubst, die Metal-Musik erst, wenn du Spotify erlaubst. Bilder und Texte von Wikipedia holt RetroMind über den eigenen
            Server, dein Browser spricht nicht direkt mit Wikipedia.
          </p>
          <p>
            <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
              Datenschutzerklärung
            </a>
            {' · '}
            <a href={IMPRINT_URL} target="_blank" rel="noreferrer">
              Impressum
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
