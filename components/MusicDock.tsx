import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
}

const Svg: React.FC<{ d: string; size?: number }> = ({ d, size = 28 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
    <path d={d} />
  </svg>
);

const NOTE = 'M9 3v10.6A3.5 3.5 0 1 0 11 17V8h6V3z';
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
}) => {
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
      <button
        type="button"
        className={`music-dock-knob${playing ? ' playing' : ''} ${className}`}
        onClick={() => toggle(!open)}
        aria-expanded={open}
        aria-controls="music-dock-panel"
        aria-label={open ? 'Musiksteuerung schließen' : 'Musiksteuerung öffnen'}
        title="Musik"
      >
        <Svg d={NOTE} size={22} />
      </button>
      {open &&
        createPortal(
        <div className="music-dock-backdrop" onClick={() => toggle(false)}>
          <section
            id="music-dock-panel"
            className="music-dock-panel"
            role="dialog"
            aria-label="Musiksteuerung"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="music-dock-close" onClick={() => toggle(false)} aria-label="Musiksteuerung schließen">
              <Svg d={DOWN} size={26} />
            </button>
            <p className="music-dock-source">{source}</p>
            <div className={`music-dock-disc${playing ? ' spinning' : ''}`} aria-hidden="true">
              <Svg d={NOTE} size={34} />
            </div>
            <p className="music-dock-label">{playing ? 'Läuft gerade' : 'Pausiert'}</p>
            <p className="music-dock-title" aria-live="polite">
              {ready ? title ?? 'Spotify' : 'Spotify lädt …'}
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
