import React, { useState } from 'react';
import { GalleryItem } from '../types';

export const GalleryCard: React.FC<{ item: GalleryItem; onClick: () => void }> = ({ item, onClick }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = item.image && !imgFailed;
  return (
    <button onClick={onClick} className="retro-card retro-photo-frame overflow-hidden h-56 group relative text-left bg-retro-cream">
      {showImage ? (
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover retro-photo retro-photo-live transition-[filter] duration-300 group-hover:!filter-none group-hover:[animation-play-state:paused]"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-retro-paper">
          <span className="text-[10px] uppercase tracking-widest font-bold text-retro-tan">Zeit-Impression</span>
          <span className="retro-serif text-2xl font-bold text-retro-ink mt-2 leading-tight">{item.title}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 w-full bg-retro-ink/85 text-white p-2 text-sm font-bold text-center">
        {item.title}
      </div>
    </button>
  );
};
