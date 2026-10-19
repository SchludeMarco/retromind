import React from 'react';
import { FitMarquee } from './FitMarquee';
import { MusicStatus, useMusicStatus } from '../lib/musicStatus';
import { tr } from '../lib/i18n';
import { openMusicDock } from './MusicDock';
import { FavoriteHeart } from './FavoriteSongs';

// The music always at hand, top left (Marco, 2026-10-14: "oben links dafür
// die Musiksteuerung, dass man eben play pause back forth machen kann und da
// ist der aktuelle Titel, ohne dass alles zugedrückt oder gemüllt ist").
// Back, play/pause and next as real buttons, the song in readable print next
// to them; tapping the song opens the full music panel (MusicDock). In Retro
// Warm it sits in the top bar, in Classic and Night Shift in the top-left
// corner. Replaces the tiny "now playing" ticker of the Zeitreise (the
// gaming hall keeps its ticker).

const PREV = 'M6 5h2v14H6zM20 5v14L9 12z';
const NEXT = 'M16 5h2v14h-2zM4 5v14l11-7z';
const PLAY = 'M7 4v16l13-8z';
const PAUSE = 'M6 4h4v16H6zM14 4h4v16h-4z';

const Svg: React.FC<{ d: string; size?: number }> = ({ d, size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d={d} />
  </svg>
);

export const MusicMini: React.FC<{
  title: string | null;
  /** spotify:track:… of that song, when known. */
  songUri?: string | null;
  /** Where the music comes from, e.g. "Music of the 80s". */
  source: string;
  playing: boolean;
  ready: boolean;
  canSkip: boolean;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  status?: MusicStatus;
  /** bar: inside the Retro Warm top bar; float: fixed in the top-left corner. */
  variant: 'bar' | 'float';
}> = ({ title, songUri = null, source, playing, ready, canSkip, onPrev, onToggle, onNext, status, variant }) => {
  const live = useMusicStatus(status).track;
  const shown = live ? `${live.name} · ${live.artists}` : title;
  // Inside an album the Premium player names another song than the one loaded.
  const favUri = live && title !== shown ? null : songUri;
  return (
    <div className={`rm-music-mini is-${variant} no-print`} role="group" aria-label={tr('Music', 'Musik')}>
      <button type="button" onClick={onPrev} disabled={!ready || !canSkip} aria-label={tr('Previous song', 'Vorheriger Song')} title={tr('Previous song', 'Vorheriger Song')}>
        <Svg d={PREV} size={16} />
      </button>
      <button
        type="button"
        className="rm-music-mini-play"
        onClick={onToggle}
        disabled={!ready}
        aria-label={playing ? 'Pause' : tr('Play', 'Abspielen')}
        title={playing ? 'Pause' : tr('Play', 'Abspielen')}
      >
        <Svg d={playing ? PAUSE : PLAY} size={18} />
      </button>
      <button type="button" onClick={onNext} disabled={!ready || !canSkip} aria-label={tr('Next song', 'Nächster Song')} title={tr('Next song', 'Nächster Song')}>
        <Svg d={NEXT} size={16} />
      </button>
      <button
        type="button"
        className="rm-music-mini-title"
        onClick={openMusicDock}
        aria-label={tr(`${shown ?? source}. Open music controls`, `${shown ?? source}. Musiksteuerung öffnen`)}
      >
        <span className="rm-music-mini-label">{!ready ? tr('Loading …', 'Lädt …') : playing ? tr('Now playing', 'Läuft gerade') : tr('Paused', 'Pausiert')}</span>
        <FitMarquee text={shown ?? source} maxSize={14} minSize={12} />
      </button>
      {/* A great song? Save it, a comment optional (Marco, 2026-10-19). */}
      <FavoriteHeart title={ready ? shown : null} uri={favUri} image={live?.image ?? null} where={source} />
    </div>
  );
};
