import React from 'react';

// The small Spotify player at the bottom centre (Marco, 2026-10-06): back,
// play/pause, next, and the song that is playing. It only steers the hidden
// Spotify player (lib/spotifyEmbed) of the Zeitreise or the gaming hall; each
// app places it between its own buttons and styles it through `className`
// (Zeitreise: index.css .rm-spotify-bar, Gaming: gaming.css .spotify-bar).

export interface SpotifyBarProps {
  title: string | null;
  playing: boolean;
  ready: boolean;
  /** false while there is no song list to jump around in. */
  canSkip: boolean;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  className?: string;
}

const Svg: React.FC<{ d: string }> = ({ d }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
    <path d={d} />
  </svg>
);

const PREV = 'M6 5h2v14H6zM20 5v14L9 12z';
const NEXT = 'M16 5h2v14h-2zM4 5v14l11-7z';
const PLAY = 'M7 4v16l13-8z';
const PAUSE = 'M6 4h4v16H6zM14 4h4v16h-4z';

export const SpotifyBar: React.FC<SpotifyBarProps> = ({ title, playing, ready, canSkip, onPrev, onToggle, onNext, className = '' }) => (
  <div className={`spotify-bar ${className}`} role="group" aria-label="Spotify-Player">
    <p className="spotify-bar-title" title={title ?? undefined} aria-live="polite">
      <span aria-hidden="true">♫ </span>
      {ready ? title ?? 'Spotify' : 'Spotify lädt …'}
    </p>
    <div className="spotify-bar-buttons">
      <button type="button" onClick={onPrev} disabled={!ready || !canSkip} aria-label="Vorheriger Song" title="Vorheriger Song">
        <Svg d={PREV} />
      </button>
      <button
        type="button"
        className="spotify-bar-play"
        onClick={onToggle}
        disabled={!ready}
        aria-label={playing ? 'Pause' : 'Abspielen'}
        title={playing ? 'Pause' : 'Abspielen'}
      >
        <Svg d={playing ? PAUSE : PLAY} />
      </button>
      <button type="button" onClick={onNext} disabled={!ready || !canSkip} aria-label="Nächster Song" title="Nächster Song">
        <Svg d={NEXT} />
      </button>
    </div>
  </div>
);
