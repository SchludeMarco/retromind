import React from 'react';
import { Modal } from './Modal';
import { FontSizeControl } from './FontSizeControl';

export const SettingsModal: React.FC<{
  fontScale: number;
  onFontScaleChange: (n: number) => void;
  onDismiss: () => void;
  onCloseClick: () => void;
}> = ({ fontScale, onFontScaleChange, onDismiss, onCloseClick }) => (
  <Modal onClose={onDismiss} label="App-Einstellungen">
    <button onClick={onCloseClick} aria-label="Schließen" className="absolute top-3 right-3 text-2xl leading-none">
      ✕
    </button>
    <span className="text-xs uppercase font-bold text-retro-amber-dark block">Allgemein</span>
    <h3 className="text-3xl font-bold mb-5">Einstellungen</h3>

    <FontSizeControl scale={fontScale} onChange={onFontScaleChange} />
  </Modal>
);
