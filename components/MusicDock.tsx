import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FitMarquee } from './FitMarquee';
import { MusicStatus, useMusicStatus } from '../lib/musicStatus';
import { searchSpotify, setAutoTheme, SpotifyHit, useAutoTheme } from '../lib/spotifyApi';
import './musicDock.css';

// The music controls (Marco, 2026-10-06): tucked away behind a small
// black-blue metal button at the very bottom centre. Pressing it opens the
// controls as a panel over the lower half of the screen: what is playing,
// and back / play-pause / next as symbols. It only steers the hidden Spotify
// player (lib/spotifyEmbed) of the Zeitreise or the gaming hall; each app
// places the button between its own ones through `className`. One look for
// both apps, see musicDock.css.

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

// Search, progress, volume and the "Musik zum Thema" switch.
const Extras: React.FC<{ extras: MusicDockExtras; onPicked: () => void }> = ({ extras, onPicked }) => {
  const { position, duration, volume } = useMusicStatus(extras.status);
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
        Mit Spotify anmelden: Suche, Musik zum Thema und mehr
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
            aria-label="Stelle im Song"
          />
          <span>{time(duration)}</span>
        </div>
      )}
      {volume !== null && (
        <label className="music-dock-volume">
          <span aria-hidden="true">🔈</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => extras.onVolume(Number(e.target.value) / 100)}
            aria-label="Lautstärke"
          />
          <span aria-hidden="true">🔊</span>
        </label>
      )}
      <div className="music-dock-chips">
        <button type="button" className="music-dock-chip" aria-pressed={auto} onClick={() => setAutoTheme(!auto)} title={extras.themeHint}>
          {auto ? '✓ ' : ''}Musik zum Thema
        </button>
        {extras.special && (
          <button type="button" className="music-dock-chip" onClick={extras.onBackToTheme}>
            ↺ Zurück zu {extras.themeName}
          </button>
        )}
      </div>
      <input
        type="search"
        className="music-dock-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Song, Album oder Künstler:in suchen"
        aria-label="Bei Spotify suchen"
        enterKeyHint="search"
      />
      {busy && !hits && <p className="music-dock-hint">Suche …</p>}
      {hits && !hits.length && <p className="music-dock-hint">Nichts gefunden.</p>}
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
}) => {
  const symbol = icon === 'bolt' ? BOLT : NOTE;
  // The Premium player says what really plays (also inside an album).
  const live = useMusicStatus(extras?.status).track;
  const shownTitle = live ? `${live.name} · ${live.artists}` : title;
  const [open, setOpen] = useState(false);
  const toggle = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && toggle(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
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
            aria-label={`Läuft gerade: ${shownTitle}. Musiksteuerung öffnen`}
          >
            <Svg d={symbol} size={10} />
            <FitMarquee text={shownTitle} maxSize={10} />
          </button>,
          document.body
        )}
      <button
        type="button"
        className={`music-dock-knob${playing ? ' playing' : ''} ${className}`}
        onClick={() => toggle(!open)}
        aria-expanded={open}
        aria-controls="music-dock-panel"
        aria-label={open ? 'Musiksteuerung schließen' : 'Musiksteuerung öffnen'}
        title="Musik"
      >
        <Svg d={symbol} size={22} />
      </button>
      {open &&
        createPortal(
        <div className="music-dock-backdrop" onClick={() => toggle(false)}>
          <section
            id="music-dock-panel"
            className={`music-dock-panel${extras?.signedIn ? ' music-dock-panel-tall' : ''}`}
            role="dialog"
            aria-label="Musiksteuerung"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="music-dock-close" onClick={() => toggle(false)} aria-label="Musiksteuerung schließen">
              <Svg d={DOWN} size={26} />
            </button>
            <p className="music-dock-source">
              {extras?.special ? (extras.special.auto ? 'Musik zum Thema' : 'Deine Auswahl') : source}
            </p>
            {live?.image ? (
              <img className="music-dock-cover" src={live.image} alt="" />
            ) : (
              <div className={`music-dock-disc${playing ? ' spinning' : ''}`} aria-hidden="true">
                <Svg d={symbol} size={34} />
              </div>
            )}
            <p className="music-dock-label">{playing ? 'Läuft gerade' : 'Pausiert'}</p>
            <p className="music-dock-title" aria-live="polite">
              <FitMarquee text={ready ? shownTitle ?? 'Spotify' : 'Spotify lädt …'} maxSize={22} minSize={14} />
            </p>
            <div className="music-dock-buttons">
              <button type="button" onClick={onPrev} disabled={!ready || !canSkip} aria-label="Vorheriger Song" title="Vorheriger Song">
                <Svg d={PREV} />
              </button>
              <button
                type="button"
                className="music-dock-play"
                onClick={onToggle}
                disabled={!ready}
                aria-label={playing ? 'Pause' : 'Abspielen'}
                title={playing ? 'Pause' : 'Abspielen'}
              >
                <Svg d={playing ? PAUSE : PLAY} size={36} />
              </button>
              <button type="button" onClick={onNext} disabled={!ready || !canSkip} aria-label="Nächster Song" title="Nächster Song">
                <Svg d={NEXT} />
              </button>
            </div>
            {extras && <Extras extras={extras} onPicked={() => undefined} />}
            {onToggleMute && (
              <button type="button" className="music-dock-mute" onClick={onToggleMute} aria-pressed={!!muted}>
                {muted ? '🔇 Ton ist aus – einschalten' : '🔊 Ton an – stummschalten'}
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
