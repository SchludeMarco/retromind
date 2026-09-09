import React from 'react';
import { GalleryItem } from '../types';
import { DECADES_DB } from '../constants';
import { GalleryCard } from '../components';

export const InductionPhase: React.FC<{
  focusDecade: string;
  onSelectGalleryItem: (item: GalleryItem) => void;
  onContinue: () => void;
}> = ({ focusDecade, onSelectGalleryItem, onContinue }) => {
  const decadeData = DECADES_DB[focusDecade];
  return (
    <div className="py-8 animate-fadeIn">
      <div className="text-center mb-10">
        <h2 className="text-4xl mb-3">Deine Zeit: {decadeData?.title}</h2>
        <p className="text-retro-brown">
          Du warst in den {focusDecade}ern ungefähr im Grundschulalter. Ein paar Impressionen zum Einstimmen –
          tippe für die Beschreibung.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {decadeData?.galleryItems.map((item) => (
          <GalleryCard key={item.keyword} item={item} onClick={() => onSelectGalleryItem(item)} />
        ))}
      </div>
      <p className="text-xs text-retro-tan mt-4 text-center italic">
        Die Bilder sind – wo nicht anders angegeben – symbolische Zeit-Impressionen, keine echten Zeitdokumente.
      </p>

      <div className="mt-12 text-center">
        <button onClick={onContinue} className="retro-button bg-retro-amber text-white px-12 py-5 text-xl font-bold">
          In die Details eintauchen
        </button>
      </div>
    </div>
  );
};
