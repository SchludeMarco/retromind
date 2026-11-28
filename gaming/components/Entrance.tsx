import React, { useEffect, useRef, useState } from 'react';
import { Cloud } from '../lib/useCloudSync';
import { SpotifyAuth } from '../../hooks/useSpotifyAuth';
import { warmUpGoogle } from '../../lib/googleAuth';
import { setConsent } from '../../lib/privacy';
import { chip, DOOR_SWING } from '../lib/chiptune';
import { DoorSong } from '../lib/street';
import { MuteButton } from './MuteButton';
import { BackToZeitreise } from './BackToZeitreise';
import { LoudSign } from '../../components/LoudSign';
import { isGerman, tr } from '../../lib/i18n';
import { checkSpotifyApp, useConnectPlayback, useLoginLost } from '../../lib/spotifyPremium';
import { openSpotifyApp } from '../../lib/spotifyConnect';
import { beginSpotifyLogin } from '../../lib/spotifyAuth';
import { setInitials, useInitials } from '../../lib/initials';
import { InitialsPicker } from '../../components/InitialsPicker';

// The way in: a run-down arcade on a rainy street, the ARCADE neon sign
// lighting up letter by letter and the hall's metal thumping muffled through the wall. Tapping the door throws it open,
// the logo shines out of the doorway, the picture goes white and the hub
// follows.
//
// Browsers only allow sound after the visitor has touched the page, so the
// muffled hall sound is queued right away and starts with the first tap or key
// anywhere (installed apps and often-visited sites may play it at once).

// Open the app with ?ton to see what the intro sounds did on this device.
const SOUND_DEBUG = new URLSearchParams(window.location.search).has('ton');

const SoundDebug: React.FC = () => {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, []);
  return (
    <pre className="sound-debug">
      {`Audio: ${chip.debugState}\nAmbiente: ${chip.debug.ambient ?? '–'}\nBling: ${chip.debug.chime ?? '–'}`}
    </pre>
  );
};

// The ARCADE neon sign over the door (Marco, 2026-10-08): one more letter
// lights up every second, a second after all six burn everything goes dark,
// then it starts again. The photo itself carries the sign switched off; each
// letter is a lit cut-out of the original picture, placed in photo pixels.
const PHOTO_W = 941;
const PHOTO_H = 1672;
const SIGN_LETTERS: [x: number, y: number, w: number, h: number][] = [
  [93, 145, 182, 293],
  [266, 145, 129, 293],
  [386, 145, 111, 293],
  [488, 145, 149, 293],
  [628, 145, 115, 293],
  [734, 145, 124, 293],
];

const NeonSign: React.FC<{ still: boolean }> = ({ still }) => {
  // 1..6 letters lit, 0 = all dark.
  const [lit, setLit] = useState(still ? 6 : 1);
  useEffect(() => {
    if (still) {
      setLit(6);
      return;
    }
    const id = setInterval(() => setLit((n) => (n + 1) % 7), 1000);
    return () => clearInterval(id);
  }, [still]);
  return (
    <>
      {SIGN_LETTERS.map(([x, y, w, h], i) => (
        <img
          key={i}
          className={`neon-letter${i < lit ? ' on' : ''}`}
          src={`/gaming/arcade-sign-${i}.webp`}
          alt=""
          style={{
            left: `${(x / PHOTO_W) * 100}%`,
            top: `${(y / PHOTO_H) * 100}%`,
            width: `${(w / PHOTO_W) * 100}%`,
            height: `${(h / PHOTO_H) * 100}%`,
          }}
        />
      ))}
    </>
  );
};

// Optional sign-ins right at the door (Marco, 2026-10-08): Google keeps the
// profile and coins in sync, Spotify (its own account) brings whole songs.
const LOGIN_TEXT = {
  en: {
    google: 'SIGN IN WITH GOOGLE',
    googleBusy: 'SIGNING IN …',
    googleAs: (n: string) => `Signed in with Google as ${n}`,
    spotify: 'CONNECT SPOTIFY',
    spotifyBusy: 'REDIRECTING …',
    spotifyAs: (n: string) => `Spotify connected (${n})`,
    note: 'Optional. Google saves your progress and coins, Spotify plays the hall music in full.',
  },
  de: {
    google: 'MIT GOOGLE ANMELDEN',
    googleBusy: 'ANMELDEN …',
    googleAs: (n: string) => `Mit Google angemeldet als ${n}`,
    spotify: 'SPOTIFY VERBINDEN',
    spotifyBusy: 'WEITERLEITUNG …',
    spotifyAs: (n: string) => `Spotify verbunden (${n})`,
    note: 'Freiwillig. Google sichert Fortschritt und Coins, mit Spotify läuft die Hallenmusik in voller Länge.',
  },
};

const DoorLogins: React.FC<{ cloud: Cloud; spotifyAuth: SpotifyAuth; disabled: boolean }> = ({ cloud, spotifyAuth, disabled }) => {
  const t = LOGIN_TEXT[isGerman ? 'de' : 'en'];
  const google = cloud.status === 'signed_in';
  const spotifyOn = spotifyAuth.status !== 'not_configured';
  const spotify = spotifyAuth.status === 'signed_in';
  return (
    <div className="door-logins">
      <div className="door-login-row">
        {google ? (
          <span className="door-login-done">✓ {t.googleAs(cloud.user?.name?.split(' ')[0] ?? '')}</span>
        ) : (
          <button
            className="px-btn"
            onClick={cloud.signIn}
            // Google's script only loads once someone reaches for this button.
            onPointerEnter={warmUpGoogle}
            onPointerDown={warmUpGoogle}
            onFocus={warmUpGoogle}
            disabled={disabled || cloud.status === 'signing_in'}
          >
            {cloud.status === 'signing_in' ? t.googleBusy : t.google}
          </button>
        )}
        {spotifyOn &&
          (spotify ? (
            <span className="door-login-done">✓ {t.spotifyAs(spotifyAuth.user?.name ?? '')}</span>
          ) : (
            <button
              className="px-btn"
              onClick={() => {
                setConsent('spotify', true);
                spotifyAuth.signIn();
              }}
              disabled={disabled || spotifyAuth.status === 'signing_in'}
            >
              {spotifyAuth.status === 'signing_in' ? t.spotifyBusy : t.spotify}
            </button>
          ))}
      </div>
      {!(google && (spotify || !spotifyOn)) && <p className="dim door-login-note">{t.note}</p>}
    </div>
  );
};

/**
 * On phones the full songs play in the visitor's Spotify app (lib/spotifyConnect).
 * Marco, 2026-11-28: the hint to open it came only inside the hall, so the
 * hall started with previews. Now the door checks first: no app found, a
 * button opens it; back here, it checks again and says when it's ready.
 */
const SpotifyAppCheck: React.FC = () => {
  const connect = useConnectPlayback();
  const lost = useLoginLost();
  const [app, setApp] = useState<'ready' | 'missing' | 'login' | null>(null);
  useEffect(() => {
    if (!connect) return setApp(null);
    let alive = true;
    const check = () => {
      if (document.hidden) return;
      checkSpotifyApp().then((r) => alive && setApp(r));
    };
    check();
    // Back from the Spotify app (or every few seconds meanwhile): look again.
    const poll = window.setInterval(check, 6000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      alive = false;
      window.clearInterval(poll);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, [connect]);
  const state = lost ? 'login' : app;
  if (!state) return null;
  if (state === 'ready')
    return <p className="pixel-font door-spotify ready">{tr('♪ SPOTIFY READY: FULL SONGS INSIDE', '♪ SPOTIFY BEREIT: DRINNEN GANZE SONGS')}</p>;
  return (
    <button
      type="button"
      className="px-btn door-spotify"
      onClick={() => {
        chip.play('select');
        if (state === 'login') beginSpotifyLogin().catch(() => undefined);
        else openSpotifyApp();
      }}
    >
      {state === 'login'
        ? tr('♪ Sign in to Spotify again for full songs', '♪ Für ganze Songs neu bei Spotify anmelden')
        : tr('♪ Open your Spotify app first for full songs, then come back', '♪ Für ganze Songs erst die Spotify-App öffnen, dann zurückkommen')}
    </button>
  );
};

/**
 * The player's three initials, settled at the door (Marco, 2026-11-28:
 * "Direkt am Eingang sollten die 3 Spielerbuchstaben festgelegt werden …
 * Man soll nur nach den Buchstaben gefragt werden, wenn diese nicht bekannt
 * sind"). They live in lib/initials.ts: in this browser and, signed in, in
 * the Google account (lib/sync.ts), so a known player is only greeted.
 */
const DoorInitials: React.FC<{ nudge: number }> = ({ nudge }) => {
  // Starts at AAA like a fresh cabinet; the arrows (or typing) change it.
  const [tag, setTag] = useState('AAA');
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (!nudge) return;
    setShake(true);
    const id = setTimeout(() => setShake(false), 600);
    return () => clearTimeout(id);
  }, [nudge]);
  const save = () => {
    if (tag.length !== 3) return chip.play('error');
    chip.play('powerup');
    setInitials(tag);
  };
  return (
    <form
      className={`door-initials${shake ? ' shake' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <p className="pixel-font door-initials-title blink">{tr('NEW PLAYER! ENTER YOUR INITIALS', 'NEUER SPIELER! DEINE 3 BUCHSTABEN')}</p>
      <InitialsPicker value={tag} onChange={setTag} onEnter={save} />
      <button className="px-btn big" type="submit" disabled={tag.length !== 3} data-nav>
        OK
      </button>
      <p className="dim door-initials-note">
        {tr(
          'Like on the old high score tables. They stay on this device and, signed in with Google, in your account.',
          'Wie früher auf den Highscore-Tafeln. Sie bleiben auf diesem Gerät und mit Google-Anmeldung in deinem Konto.'
        )}
      </p>
    </form>
  );
};

export const Entrance: React.FC<{
  onEnter: () => void;
  reducedMotion: boolean;
  muted: boolean;
  music: boolean;
  /** Spotify (Premium) already plays the hall's music out here. */
  doorSong: DoorSong | null;
  onToggleMute: () => void;
  cloud: Cloud;
  spotifyAuth: SpotifyAuth;
  /** The hall plays Spotify (not the chiptunes): check the Spotify app at the door. */
  spotifyMusic?: boolean;
}> = ({ onEnter, reducedMotion, muted, music, doorSong, onToggleMute, cloud, spotifyAuth, spotifyMusic }) => {
  const [entering, setEntering] = useState(false);
  const [soundWaiting, setSoundWaiting] = useState(false);
  const initials = useInitials();
  // Signed in, the initials may still be on their way from Google: don't ask yet.
  const loading = cloud.status === 'signing_in' || (cloud.status === 'signed_in' && cloud.sync === 'loading');
  const needInitials = !initials && !loading;
  const [nudge, setNudge] = useState(0);
  const ambient = useRef<{ stop: () => void; songPlaying: () => boolean }>({
    stop: () => {},
    songPlaying: () => false,
  });

  // Queue the muffled hall sound now; the first touch or key anywhere lets it play.
  useEffect(() => {
    chip.unlock();
    if (!music) {
      chip.debug.ambient = 'aus (Musik ausgeschaltet)';
      return;
    }
    // The song from inside, muffled (it restarts once its name is known).
    const door = chip.ambient(doorSong);
    ambient.current = door;
    const wake = () => chip.unlock();
    const events = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'];
    events.forEach((e) => window.addEventListener(e, wake, true));
    const poll = setInterval(() => setSoundWaiting(!chip.ready), 300);
    return () => {
      events.forEach((e) => window.removeEventListener(e, wake, true));
      clearInterval(poll);
      door.stop();
    };
  }, [music, doorSong?.id, doorSong?.name]);

  const enter = () => {
    if (entering) return;
    // No initials yet: the door stays shut and points at the form.
    if (needInitials) {
      chip.play('error');
      setNudge((n) => n + 1);
      return;
    }
    setEntering(true);
    chip.unlock();
    const songOutside = ambient.current.songPlaying();
    ambient.current.stop();
    // Inside the hall a heavy metal riff kicks in before the hub tune, unless
    // the song from inside already played out here and simply goes on.
    if (!songOutside) chip.queueMetalIntro();
    // From deep inside, a demon laughs as the door gives way.
    chip.laugh(reducedMotion ? 0 : 0.3);
    if (reducedMotion) {
      chip.chime();
      setTimeout(onEnter, 300);
      return;
    }
    // The door creaks open (1.2 s), red light flickers inside, the logo shines out of the doorway, the
    // picture fades to white, then the hub. While you walk up to the door a
    // whine grows louder until everything is white.
    chip.door();
    const stopWhine = chip.whine(3);
    setTimeout(() => chip.chime(), DOOR_SWING * 1000 + 150);
    setTimeout(() => {
      stopWhine();
      onEnter();
    }, 3100);
  };

  return (
    <div className={`screen-full entrance${entering ? ' entering' : ''}`}>
      {/* Marco's run-down arcade (generated with ChatGPT, 2026-10-08); the
          ENTRANCE door is cut out of the same photo so it can swing open. */}
      <div className="hall-blur" aria-hidden="true" />
      <div className="hall">
        <img className="hall-photo" src="/gaming/arcade-entrance.webp" alt="" />
        <NeonSign still={reducedMotion} />
        {/* The door itself is the way in (Marco, 2026-10-08). */}
        <button
          className="hall-door"
          onClick={enter}
          disabled={entering}
          aria-label={tr('Enter the arcade', 'In die Spielhalle')}
          autoFocus
        >
          <span className="door-inside" />
          <img className="door-leaf" src="/gaming/arcade-entrance-door.webp" alt="" />
        </button>
        <img className="door-logo" src="/gaming/logo.webp" alt="" />
      </div>
      <div className="entrance-controls">
        {initials && <p className="pixel-font door-hello">{tr(`WELCOME BACK, ${initials}!`, `WILLKOMMEN ZURÜCK, ${initials}!`)}</p>}
        {needInitials && <DoorInitials nudge={nudge} />}
        <p className="dim entrance-hint">
          {muted
            ? tr('The old games are waiting inside. Tap the door. Sound is off.', 'Da drin warten die alten Games. Tipp auf die Tür. Der Ton ist aus.')
            : soundWaiting
              ? tr('Psst … tap anywhere once and you’ll hear what’s going on inside.', 'Psst … einmal irgendwo hintippen, dann hörst du, was drinnen los ist.')
              : tr(`The old games are waiting inside. Tap the door, ${initials || 'Player 1'}.`, `Da drin warten die alten Games. Tipp auf die Tür, ${initials || 'Player 1'}.`)}
        </p>
        <div className="entrance-row">
          <LoudSign show={!muted} />
          <MuteButton muted={muted} onToggle={onToggleMute} />
        </div>
        {spotifyMusic && !entering && <SpotifyAppCheck />}
        <DoorLogins cloud={cloud} spotifyAuth={spotifyAuth} disabled={entering} />
      </div>
      <BackToZeitreise className="pixel-font back-door" />
      <div className="white-out" />
      {SOUND_DEBUG && <SoundDebug />}
    </div>
  );
};
