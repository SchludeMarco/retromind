import React from 'react';
import { GalleryItem } from '../types';
import { Modal } from '../components';

export const GalleryDetailModal: React.FC<{
  item: GalleryItem;
  onDismiss: () => void;
  onCloseClick: () => void;
}> = ({ item, onDismiss, onCloseClick }) => (
  <Modal onClose={onDismiss} label={item.title}>
    <button onClick={onCloseClick} aria-label="Schließen" className="absolute top-3 right-3 text-2xl leading-none">
      ✕
    </button>
    <span className="text-xs uppercase font-bold text-retro-amber-dark block">Zeit-Impression</span>
    <h3 className="text-3xl font-bold mb-3">{item.title}</h3>
    {item.image && (
      <img src={item.image} alt={item.title} className="w-full border-2 border-retro-ink mb-3" />
    )}
    <p className="text-lg leading-relaxed italic border-t-2 border-retro-ink pt-3">
      {item.description}
    </p>
    {item.credit && <p className="text-xs text-retro-tan mt-2">{item.credit}</p>}
    <button onClick={onCloseClick} className="w-full mt-6 retro-button bg-retro-ink text-white py-3 font-bold uppercase">
      Schließen
    </button>
  </Modal>
);
