import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FitMarquee } from './FitMarquee';
import { MusicStatus, useMusicStatus } from '../lib/musicStatus';
import { setMusicVolume, useMusicVolume } from '../lib/musicVolume';
import { searchSpotify, setAutoTheme, SpotifyHit, useAutoTheme } from '../lib/spotifyApi';
import { tr } from '../lib/i18n';
import { openSpotifyApp, retryConnect, useConnectState } from '../lib/spotifyConnect';
import { beginSpotifyLogin } from '../lib/spotifyAuth';
import './musicDock.css';

// The music controls (Marco, 2026-10-06): tucked away behind a small
// black-blue metal button at the very bottom centre. Pressing it opens the
// controls as a panel over the lower half of the screen: what is playing,
// and back / play-pause / next as symbols. It only steers the hidden Spotify
// player (lib/spotifyEmbed) of the Zeitreise or the gaming hall; each app
// places the button between its own ones through `className`. One look for
// both apps, see musicDock.css.

// The top-left mini player (components/MusicMini) opens this panel too.
const OPEN_EVENT = 'rm-music-dock-open';
export function openMusicDock() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export interface MusicDockProps {
  /** "Title · Artist" of the song playing, when known. */
  title: string | null;
  /** Where the music comes from, e.g. "Musik der 80er". */
  source: string;
  playing: boolean;
  ready: boolean;
  /** false while there is no song list to jump around in. */
  canSkip: boolean;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  /** The app-wide speaker switch (lib/mute), shown in the panel. */
  muted?: boolean;
  onToggleMute?: () => void;
  /** Sound for opening and closing (the apps' own click sounds). */
  onOpenChange?: (open: boolean) => void;
  /** Placement of the round button. */
  className?: string;
  /** Symbol on the button and the disc: a note (Zeitreise) or a lightning
   *  bolt (gaming hall, Marco 2026-10-06). */
  icon?: 'note' | 'bolt';
  /** Small "now playing" line in the top-left corner while music plays
   *  (Marco, 2026-10-06). On by default. */
  ticker?: boolean;
  /** More controls once signed in with Spotify (Marco, 2026-10-07). */
  extras?: MusicDockExtras;
  /** The app also plays music of its own that the volume slider turns down (gaming hall). */
  ownMusic?: boolean;
  /** No round button of its own: the panel only opens through openMusicDock()
   *  (the control panel behind the handle at the right edge, Marco 2026-10-18). */
  hideKnob?: boolean;
}

export interface MusicDockExtras {
  status: MusicStatus;
  signedIn: boolean;
  /** Offered when not signed in (Spotify login). */
  onSignIn?: () => void;
  onSeek: (seconds: number) => void;
  onVolume: (volume: number) => void;
  onPick: (hit: SpotifyHit) => void;
  /** What plays instead of the app's own music, if anything. */
  special: { name: string; auto: boolean } | null;
  /** The app's own music, e.g. "Musik der 80er". */
  themeName: string;
  onBackToTheme: () => void;
  /** What "Musik zum Thema" does here, one short line. */
  themeHint: string;
}

const time = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// Search, progress and the "Musik zum Thema" switch.
const Extras: React.FC<{ extras: MusicDockExtras; onPicked: () => void }> = ({ extras, onPicked }) => {
  const { position, duration } = useMusicStatus(extras.status);
  const auto = useAutoTheme();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SpotifyHit[] | null>(null);
  const [busy, setBusy] = useState(false);

  // Searches as you type, a moment after the last key.
  useEffect(() => {
    if (!extras.signedIn) return;
    const q = query.trim();
    if (q.length < 2) {
      setHits(null);
      return;
    }
    let live = true;
    const timer = window.setTimeout(() => {
      setBusy(true);
      searchSpotify(q).then((found) => {
        if (!live) return;
        setHits(found);
        setBusy(false);
      });
    }, 350);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [query, extras.signedIn]);

  if (!extras.signedIn) {
    return extras.onSignIn ? (
      <button type="button" className="music-dock-chip" onClick={extras.onSignIn}>
        {tr('Sign in with Spotify: search, theme music and more', 'Mit Spotify anmelden: Suche, Musik zum Thema und mehr')}
      </button>
    ) : null;
  }

  return (
    <div className="music-dock-extras">
      {duration > 0 && (
        <div className="music-dock-progress">
          <span>{time(position)}</span>
          <input
            type="range"
            min={0}
            max={Math.round(duration / 1000)}
            value={Math.round(position / 1000)}
            onChange={(e) => extras.onSeek(Number(e.target.value))}
            aria-label={tr('Position in song', 'Stelle im Song')}
          />
          <span>{time(duration)}</span>
        </div>
      )}
      <div className="music-dock-chips">
        <button type="button" className="music-dock-chip" aria-pressed={auto} onClick={() => setAutoTheme(!auto)} title={extras.themeHint}>
          {auto ? '✓ ' : ''}{tr('Theme music', 'Musik zum Thema')}
        </button>
        {extras.special && (
          <button type="button" className="music-dock-chip" onClick={extras.onBackToTheme}>
            ↺ {tr('Back to', 'Zurück zu')} {extras.themeName}
          </button>
        )}
      </div>
      <input
        type="search"
        className="music-dock-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={tr('Search for a song, album or artist', 'Song, Album oder Künstler:in suchen')}
        aria-label={tr('Search Spotify', 'Bei Spotify suchen')}
        enterKeyHint="search"
      />
      {busy && !hits && <p className="music-dock-hint">{tr('Searching …', 'Suche …')}</p>}
      {hits && !hits.length && <p className="music-dock-hint">{tr('Nothing found.', 'Nichts gefunden.')}</p>}
      {hits && hits.length > 0 && (
        <ul className="music-dock-hits">
          {hits.map((h) => (
            <li key={h.uri}>
              <button
                type="button"
                onClick={() => {
                  extras.onPick(h);
                  setQuery('');
                  setHits(null);
                  onPicked();
                }}
              >
                {h.image ? <img src={h.image} alt="" loading="lazy" className={h.kind === 'artist' ? 'round' : ''} /> : <span className="music-dock-hit-blank" />}
                <span className="music-dock-hit-text">
                  <strong>{h.name}</strong>
                  <small>{h.sub}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Svg: React.FC<{ d: string; size?: number }> = ({ d, size = 28 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
    <path d={d} />
  </svg>
);

// Louder and quieter (Marco, 2026-10-08). The slider sets the shared music
// volume (lib/musicVolume), which the app's own music and Spotify's Premium
// browser player follow. The embedded Spotify player can't be turned down by
// any page, so there the device's own volume buttons are the way.
const Volume: React.FC<{ extras?: MusicDockExtras; ownMusic: boolean }> = ({ extras, ownMusic }) => {
  const volume = useMusicVolume();
  const premium = useMusicStatus(extras?.status).volume !== null;
  return (
    <div className="music-dock-volume-box">
      {(premium || ownMusic) && (
        <label className="music-dock-volume">
          <span aria-hidden="true">🔈</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => {
              const v = Number(e.target.value) / 100;
              setMusicVolume(v);
              extras?.onVolume(v);
            }}
            aria-label={tr('Volume', 'Lautstärke')}
          />
          <span aria-hidden="true">🔊</span>
        </label>
      )}
      {!premium && (
        <p className="music-dock-volume-note">
          {ownMusic
            ? tr(
                'Spotify’s embedded player doesn’t follow the slider: use your device’s volume buttons for it.',
                'Spotifys eingebetteter Player hört nicht auf den Regler: Dafür nimmst du die Lautstärketasten deines Geräts.'
              )
            : tr(
                'Spotify’s embedded player can’t be turned down here: use your device’s volume buttons.',
                'Spotifys eingebetteter Player lässt sich hier nicht leiser stellen: Nimm die Lautstärketasten deines Geräts.'
              )}
        </p>
      )}
    </div>
  );
};

// Spotify Premium on a phone plays through the visitor's own Spotify app
// (lib/spotifyConnect, Zeitreise and gaming hall). Says where the music plays, or what
// to do when the app isn't found or the login is from before.
const ConnectNote: React.FC = () => {
  const { state, device } = useConnectState();
  if (state === 'off') return null;
  if (state === 'app')
    return (
      <p className="music-dock-volume-note">
        {tr(
          `Full songs with your Premium, playing in your Spotify app${device ? ` (${device})` : ''}. Use your phone’s volume buttons.`,
          `Ganze Songs mit deinem Premium, sie laufen in deiner Spotify-App${device ? ` (${device})` : ''}. Lauter und leiser geht mit den Tasten deines Handys.`
        )}
      </p>
    );
  if (state === 'login')
    return (
      <div className="music-dock-volume-note">
        <p>
          {tr(
            'For full songs through your Spotify app, sign in with Spotify once more (RetroMind needs one more permission).',
            'Für ganze Songs über deine Spotify-App melde dich noch einmal bei Spotify an (RetroMind braucht eine Erlaubnis mehr).'
          )}
        </p>
        <button type="button" className="music-dock-mute" onClick={() => beginSpotifyLogin().catch(() => undefined)}>
          {tr('Sign in with Spotify again', 'Neu bei Spotify anmelden')}
        </button>
      </div>
    );
  return (
    <div className="music-dock-volume-note">
      <p>
        {tr(
          'For full songs, open the Spotify app on your phone for a moment and come back: RetroMind then finds it on its own. Until then you hear short previews.',
          'Für ganze Songs öffne kurz die Spotify-App auf deinem Handy und komm zurück: RetroMind findet sie dann von selbst. Bis dahin hörst du kurze Ausschnitte.'
        )}
      </p>
      {ANDROID && <p>{ANDROID_TIP()}</p>}
      <button type="button" className="music-dock-mute" onClick={openSpotifyApp}>
        {tr('Open Spotify app', 'Spotify-App öffnen')}
      </button>
      <button type="button" className="music-dock-mute" onClick={retryConnect}>
        {tr('Try again', 'Nochmal versuchen')}
      </button>
    </div>
  );
};

// Only previews play although the visitor has Premium (no Spotify app found,
// or a login from before the needed permission): said right on the screen,
// not only inside the music panel behind the handle (Marco, 2026-10-18:
// "Dass immer volle Titel gespielt werden sollen ist irgendwie vergessen
// worden"). One tap opens the Spotify app (or the login); back in RetroMind
// the app is found on its own (lib/spotifyConnect) and full songs play.
const HINT_KEY = 'rm-full-songs-hint-closed';
// A web page can't start another app in the background: opening Spotify
// always brings it to the front (Marco, 2026-10-19: "Mach du das, aber
// verliert den Fokus auf RetroMind nicht"). On Android the Spotify app can
// stay reachable while closed, through its own setting; iPhones have none.
const ANDROID = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
const ANDROID_TIP = () =>
  tr(
    'Tip: in the Spotify app under Settings → Devices, switch on “Spotify Connect in background”. Then RetroMind finds the app even when it is closed, and you don’t have to open it any more.',
    'Tipp: In der Spotify-App unter Einstellungen → Geräte „Spotify Connect im Hintergrund“ einschalten. Dann findet RetroMind die App auch, wenn sie zu ist, und du musst sie nicht mehr öffnen.'
  );
const FullSongsHint: React.FC = () => {
  const { state } = useConnectState();
  // Closed for this state ("no-device" or "login") until the tab is closed.
  const [closedFor, setClosedFor] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(HINT_KEY);
    } catch {
      return null;
    }
  });
  if ((state !== 'no-device' && state !== 'login') || closedFor === state) return null;
  const close = () => {
    setClosedFor(state);
    try {
      sessionStorage.setItem(HINT_KEY, state);
    } catch {
      /* private mode */
    }
  };
  return createPortal(
    <div className="music-full-hint no-print" role="status">
      <button
        type="button"
        className="music-full-hint-go"
        onClick={() => (state === 'login' ? beginSpotifyLogin().catch(() => undefined) : openSpotifyApp())}
      >
        {state === 'login'
          ? tr('♪ Only previews: sign in to Spotify again for full songs', '♪ Nur Ausschnitte: für ganze Songs neu bei Spotify anmelden')
          : tr('♪ Only previews: open your Spotify app for full songs', '♪ Nur Ausschnitte: für ganze Songs Spotify-App öffnen')}
      </button>
      {state === 'no-device' && ANDROID && <p className="music-full-hint-tip">{ANDROID_TIP()}</p>}
      <button type="button" className="music-full-hint-x" onClick={close} aria-label={tr('Close', 'Schließen')}>
        ×
      </button>
    </div>,
    document.body
  );
};

const NOTE = 'M9 3v10.6A3.5 3.5 0 1 0 11 17V8h6V3z';
const BOLT = 'M13 2L4 14h6l-1 8 9-12h-6z';
const PREV = 'M6 5h2v14H6zM20 5v14L9 12z';
const NEXT = 'M16 5h2v14h-2zM4 5v14l11-7z';
const PLAY = 'M7 4v16l13-8z';
const PAUSE = 'M6 4h4v16H6zM14 4h4v16h-4z';
const DOWN = 'M5 8l7 7 7-7-1.4-1.4L12 12.2 6.4 6.6z';

export const MusicDock: React.FC<MusicDockProps> = ({
  title,
  source,
  playing,
  ready,
  canSkip,
  onPrev,
  onToggle,
  onNext,
  muted,
  onToggleMute,
  onOpenChange,
  className = '',
  icon = 'note',
  ticker = true,
  extras,
  ownMusic = false,
  hideKnob = false,
}) => {
  const symbol = icon === 'bolt' ? BOLT : NOTE;
  // The Premium player says what really plays (also inside an album).
  const live = useMusicStatus(extras?.status).track;
  const shownTitle = live ? `${live.name} · ${live.artists}` : title;
  // Playing in the Spotify app: its volume is the phone's, no slider.
  const inApp = useConnectState().state === 'app';
  const [open, setOpen] = useState(false);
  const toggle = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const onOpen = () => toggle(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && toggle(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {!open && <FullSongsHint />}
      {ticker &&
        playing &&
        shownTitle &&
        !open &&
        createPortal(
          // Tapping it opens the controls, just like the button below
          // (Marco, 2026-10-06).
          <button
            type="button"
            className="music-ticker"
            onClick={() => toggle(true)}
            aria-label={tr(`Now playing: ${shownTitle}. Open music controls`, `Läuft gerade: ${shownTitle}. Musiksteuerung öffnen`)}
          >
            <Svg d={symbol} size={10} />
            <FitMarquee text={shownTitle} maxSize={10} />
          </button>,
          document.body
        )}
      {!hideKnob && <button
        type="button"
        className={`music-dock-knob${playing ? ' playing' : ''} ${className}`}
        onClick={() => toggle(!open)}
        aria-expanded={open}
        aria-controls="music-dock-panel"
        aria-label={open ? tr('Close music controls', 'Musiksteuerung schließen') : tr('Open music controls', 'Musiksteuerung öffnen')}
        title={tr('Music', 'Musik')}
      >
        <Svg d={symbol} size={22} />
      </button>}
      {open &&
        createPortal(
        <div className="music-dock-backdrop" onClick={() => toggle(false)}>
          <section
            id="music-dock-panel"
            className={`music-dock-panel${extras?.signedIn ? ' music-dock-panel-tall' : ''}`}
            role="dialog"
            aria-label={tr('Music controls', 'Musiksteuerung')}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="music-dock-close" onClick={() => toggle(false)} aria-label={tr('Close music controls', 'Musiksteuerung schließen')}>
              <Svg d={DOWN} size={26} />
            </button>
            <p className="music-dock-source">
              {extras?.special ? (extras.special.auto ? tr('Theme music', 'Musik zum Thema') : tr('Your pick', 'Deine Auswahl')) : source}
            </p>
            {live?.image ? (
              <img className="music-dock-cover" src={live.image} alt="" />
            ) : (
              <div className={`music-dock-disc${playing ? ' spinning' : ''}`} aria-hidden="true">
                <Svg d={symbol} size={34} />
              </div>
            )}
            <p className="music-dock-label">{playing ? tr('Now playing', 'Läuft gerade') : tr('Paused', 'Pausiert')}</p>
            <p className="music-dock-title" aria-live="polite">
              <FitMarquee text={ready ? shownTitle ?? 'Spotify' : tr('Spotify is loading …', 'Spotify lädt …')} maxSize={22} minSize={14} />
            </p>
            <div className="music-dock-buttons">
              <button type="button" onClick={onPrev} disabled={!ready || !canSkip} aria-label={tr('Previous song', 'Vorheriger Song')} title={tr('Previous song', 'Vorheriger Song')}>
                <Svg d={PREV} />
              </button>
              <button
                type="button"
                className="music-dock-play"
                onClick={onToggle}
                disabled={!ready}
                aria-label={playing ? 'Pause' : tr('Play', 'Abspielen')}
                title={playing ? 'Pause' : tr('Play', 'Abspielen')}
              >
                <Svg d={playing ? PAUSE : PLAY} size={36} />
              </button>
              <button type="button" onClick={onNext} disabled={!ready || !canSkip} aria-label={tr('Next song', 'Nächster Song')} title={tr('Next song', 'Nächster Song')}>
                <Svg d={NEXT} />
              </button>
            </div>
            <ConnectNote />
            {!inApp && <Volume extras={extras} ownMusic={ownMusic} />}
            {extras && <Extras extras={extras} onPicked={() => undefined} />}
            {onToggleMute && (
              <button type="button" className="music-dock-mute" onClick={onToggleMute} aria-pressed={!!muted}>
                {muted ? tr('🔇 Sound is off – turn on', '🔇 Ton ist aus – einschalten') : tr('🔊 Sound on – mute', '🔊 Ton an – stummschalten')}
              </button>
            )}
          </section>
        </div>,
        // On <body>: a parent with backdrop-filter (the Retro Warm bottom
        // nav) would otherwise trap the fixed panel inside itself.
        document.body
      )}
    </>
  );
};
