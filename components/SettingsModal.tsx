import React from 'react';
import { Modal } from './Modal';
import { FontSizeControl } from './FontSizeControl';
import { DECADES_DB } from '../constants';

export const SettingsModal: React.FC<{
  fontScale: number;
  onFontScaleChange: (n: number) => void;
  currentDecade: string;
  onDecadeChange: (d: string) => void;
  isPlaying: boolean;
  isBlocked?: boolean;
  onToggleMusic: () => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  onDismiss: () => void;
  onCloseClick: () => void;
}> = ({
  fontScale, onFontScaleChange,
  currentDecade, onDecadeChange, isPlaying, isBlocked, onToggleMusic, volume, onVolumeChange,
  onDismiss, onCloseClick,
}) => {
  const info = DECADES_DB[currentDecade];
  const needsTap = isPlaying && !!isBlocked;

  return (
    <Modal onClose={onDismiss} label="App-Einstellungen">
      <button onClick={onCloseClick} aria-label="Schließen" className="absolute top-3 right-3 text-2xl leading-none">
        ✕
      </button>
      <span className="text-xs uppercase font-bold text-retro-amber-dark block">Allgemein</span>
      <h3 className="text-3xl font-bold mb-5">Einstellungen</h3>

      <FontSizeControl scale={fontScale} onChange={onFontScaleChange} />

      <div className="mt-6 pt-5 border-t border-retro-ink/20">
        <span className="block text-xs uppercase font-bold text-retro-brown mb-2">Nostalgie-Radio</span>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onToggleMusic}
            aria-label={isPlaying ? 'Musik pausieren' : 'Musik abspielen'}
            title={needsTap ? 'Antippen, um die Musik zu starten' : undefined}
            className={`relative retro-button w-11 h-11 rounded-full border-2 border-retro-ink flex items-center justify-center bg-retro-amber flex-shrink-0 ${isPlaying && !needsTap ? 'animate-spin' : ''}`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-retro-cream border border-retro-ink" />
            {needsTap && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-retro-ink animate-pulse"
              />
            )}
          </button>
          <div className="overflow-hidden flex-grow">
            <p className="text-xs font-bold truncate">
              {needsTap ? 'Antippen, um die Musik zu starten' : info?.audioLabel || '—'}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
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

      <p className="mt-6 pt-4 border-t border-retro-ink/20 text-xs uppercase tracking-wide text-retro-brown">
        RetroMind · Version {__APP_VERSION__}
      </p>
    </Modal>
  );
};
