import React, { useEffect, useRef, useState } from 'react';
import { Cloud } from '../lib/useCloudSync';
import { SpotifyAuth } from '../../hooks/useSpotifyAuth';
import { warmUpGoogle } from '../../lib/googleAuth';
import { setConsent } from '../../lib/privacy';
import { chip, DOOR_SWING } from '../lib/chiptune';
import { MuteButton } from './MuteButton';
import { LoudSign } from '../../components/LoudSign';
import { isGerman, tr } from '../../lib/i18n';

// The way in: a run-down arcade hall on a rainy street, a wobbly bulb over
// the entrance and the hall's metal thumping muffled through the wall. "ENTER" throws the door open,
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

// A bare bulb on a short cord under the hall's canopy, wobbling and
// flickering. Sized relative to the photo so it sits on the real socket.
const Bulb: React.FC = () => (
  <div className="hall-lamp">
    <span className="hall-lamp-cord" />
    <svg className="hall-lamp-bulb" viewBox="0 0 60 96">
      <rect x="20" y="0" width="20" height="22" rx="3" fill="#2b2b2b" />
      <rect x="18" y="20" width="24" height="8" rx="2" fill="#bdb7a8" />
      <path d="M18 30 h24 v6 c10 6 14 16 14 26 a26 26 0 0 1 -52 0 c0 -10 4 -20 14 -26z" className="lamp-glass" />
      <path d="M24 40 l3 18 l3 -10 l3 10 l3 -18" className="lamp-filament" />
    </svg>
  </div>
);

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

export const Entrance: React.FC<{
  onEnter: () => void;
  reducedMotion: boolean;
  muted: boolean;
  music: boolean;
  /** Spotify (Premium) already plays the hall's music out here. */
  spotifyAtDoor: boolean;
  onToggleMute: () => void;
  cloud: Cloud;
  spotifyAuth: SpotifyAuth;
}> = ({ onEnter, reducedMotion, muted, music, spotifyAtDoor, onToggleMute, cloud, spotifyAuth }) => {
  const [entering, setEntering] = useState(false);
  const [soundWaiting, setSoundWaiting] = useState(false);
  const stopAmbient = useRef<() => void>(() => {});

  // Queue the muffled hall sound now; the first touch or key anywhere lets it play.
  useEffect(() => {
    chip.unlock();
    if (!music) {
      chip.debug.ambient = 'aus (Musik ausgeschaltet)';
      return;
    }
    const stop = spotifyAtDoor ? () => {} : chip.ambient();
    if (spotifyAtDoor) chip.debug.ambient = 'Spotify läuft leise vor der Tür';
    stopAmbient.current = stop;
    const wake = () => chip.unlock();
    const events = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'];
    events.forEach((e) => window.addEventListener(e, wake, true));
    const poll = setInterval(() => setSoundWaiting(!chip.ready), 300);
    return () => {
      events.forEach((e) => window.removeEventListener(e, wake, true));
      clearInterval(poll);
      stop();
    };
  }, [music, spotifyAtDoor]);

  const enter = () => {
    if (entering) return;
    setEntering(true);
    chip.unlock();
    stopAmbient.current();
    // Inside the hall a heavy metal riff kicks in before the hub tune, unless
    // Spotify already plays out here and simply carries on inside.
    if (!spotifyAtDoor) chip.queueMetalIntro();
    if (reducedMotion) {
      chip.chime();
      setTimeout(onEnter, 300);
      return;
    }
    // The door creaks open (1.2 s), the logo shines out of the doorway, the
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
      {/* Marco's run-down "Arcade Hallen" (generated with Nano Banana); the
          EINGANG door is cut out of the same photo so it can swing open. */}
      <div className="hall" aria-hidden="true">
        <img className="hall-photo" src="/gaming/arcade-hallen.webp" alt="" />
        <div className="hall-neon" />
        <div className="hall-glow" />
        <div className="hall-door">
          <div className="door-inside" />
          <img className="door-leaf" src="/gaming/arcade-door.webp" alt="" />
        </div>
        <Bulb />
        <img className="door-logo" src="/gaming/logo.webp" alt="" />
      </div>
      <div className="entrance-controls">
        <p className="dim entrance-hint">
          {muted
            ? tr('The old games are waiting inside. Sound is off.', 'Da drin warten die alten Games. Der Ton ist aus.')
            : soundWaiting
              ? tr('Psst … tap anywhere once and you’ll hear what’s going on inside.', 'Psst … einmal irgendwo hintippen, dann hörst du, was drinnen los ist.')
              : tr('The old games are waiting inside. Go on in, Player 1.', 'Da drin warten die alten Games. Trau dich, Player 1.')}
        </p>
        <div className="entrance-row">
          {/* Looks like the EINGANG door itself: grey metal frame, roll shutter
              and graffiti, with the white sign lettering. */}
          <button className="enter-btn" onClick={enter} disabled={entering} autoFocus>
            <span className="enter-label">ENTER</span>
          </button>
          <LoudSign show={!muted} />
          <MuteButton muted={muted} onToggle={onToggleMute} />
        </div>
        <DoorLogins cloud={cloud} spotifyAuth={spotifyAuth} disabled={entering} />
      </div>
      <div className="white-out" />
      {SOUND_DEBUG && <SoundDebug />}
    </div>
  );
};
