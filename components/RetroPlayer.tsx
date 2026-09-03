import React, { useState } from 'react';
import { DECADES_DB } from '../constants';

export const RetroPlayer: React.FC<{
  currentDecade: string;
  onDecadeChange: (d: string) => void;
  isPlaying: boolean;
  onToggle: () => void;
  volume: number;
  onVolumeChange: (v: number) => void;
}> = ({ currentDecade, onDecadeChange, isPlaying, onToggle, volume, onVolumeChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const info = DECADES_DB[currentDecade];

  if (!isExpanded) {
    return (
      <div className="rm-fixed fixed bottom-10 right-4 md:right-10 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          aria-label="Radio-Player öffnen"
          className={`retro-button w-11 h-11 rounded-full border-2 border-retro-ink flex items-center justify-center bg-retro-amber ${isPlaying ? 'animate-spin' : ''}`}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-retro-cream border border-retro-ink" />
        </button>
      </div>
    );
  }

  return (
    <div className="rm-fixed fixed bottom-10 right-4 md:right-10 z-50">
      <div className="retro-card bg-retro-cream p-4 flex flex-col gap-3 border-2 border-retro-ink w-64 max-w-[80vw]">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className={`w-11 h-11 rounded-full border-2 border-retro-ink flex items-center justify-center bg-retro-amber flex-shrink-0 ${isPlaying ? 'animate-spin' : ''}`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-retro-cream border border-retro-ink" />
          </div>
          <div className="overflow-hidden flex-grow">
            <p className="text-[10px] uppercase font-bold text-retro-tan tracking-widest">Nostalgie-Radio</p>
            <p className="text-xs font-bold truncate">{info?.audioLabel || '—'}</p>
          </div>
          <button onClick={onToggle} aria-label={isPlaying ? 'Musik pausieren' : 'Musik abspielen'} className="retro-button p-2 bg-white min-w-[40px]">
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={() => setIsExpanded(false)} aria-label="Radio-Player minimieren" className="retro-button p-2 bg-white min-w-[32px]">
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-2 pt-2 border-t border-retro-ink/20">
          <div className="flex justify-between items-center">
            <label htmlFor="rm-era" className="text-[10px] font-bold uppercase text-retro-tan">Ära wählen</label>
            <select
              id="rm-era"
              value={currentDecade}
              onChange={(e) => onDecadeChange(e.target.value)}
              className="text-sm bg-transparent font-bold cursor-pointer"
            >
              {Object.keys(DECADES_DB).map((d) => (
                <option key={d} value={d}>{d}er</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-xs">🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="Lautstärke"
              className="flex-grow accent-retro-amber cursor-pointer h-1.5"
            />
            <span aria-hidden="true" className="text-xs">🔊</span>
          </div>
        </div>
      </div>
    </div>
  );
};
