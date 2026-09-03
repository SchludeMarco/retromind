import React, { useState } from 'react';
import { GalleryItem } from '../types';

export const GalleryCard: React.FC<{ item: GalleryItem; onClick: () => void }> = ({ item, onClick }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = item.image && !imgFailed;
  return (
    <button onClick={onClick} className="retro-card overflow-hidden h-56 group relative text-left bg-retro-cream">
      {showImage ? (
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover sepia-[0.25] group-hover:sepia-0 transition-all duration-300"
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
