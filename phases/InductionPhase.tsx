import React from 'react';
import { GalleryItem } from '../types';
import { DECADES_DB } from '../constants';
import { GalleryCard } from '../components';
import { describeFocusDecade } from '../lib/format';
import { tr } from '../lib/i18n';
import { PhaseNav, StopHeader } from '../components/PhaseNav';

export const InductionPhase: React.FC<{
  focusDecade: string;
  birthDate: string;
  onSelectGalleryItem: (item: GalleryItem) => void;
  onContinue: () => void;
  onBack: () => void;
}> = ({ focusDecade, birthDate, onSelectGalleryItem, onContinue, onBack }) => {
  const decadeData = DECADES_DB[focusDecade];
  return (
    <div className="py-8 animate-fadeIn">
      <StopHeader
        center
        eyebrow={tr('The clock has stopped: you have arrived in your era', 'Die Uhr steht: du bist in deiner Zeit angekommen')}
        title={decadeData?.title}
        lead={
          <>
            {describeFocusDecade(birthDate, focusDecade)}{' '}
            {tr(
              'A few impressions to get you in the mood – tap one for its story.',
              'Ein paar Impressionen zum Einstimmen – tippe für die Beschreibung.'
            )}
          </>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {decadeData?.galleryItems.map((item) => (
          <GalleryCard key={item.keyword} item={item} onClick={() => onSelectGalleryItem(item)} />
        ))}
      </div>
      <p className="text-xs text-retro-tan mt-4 text-center italic">
        {tr(
          'Unless noted otherwise, the pictures are symbolic impressions of the era, not real historical documents.',
          'Die Bilder sind – wo nicht anders angegeben – symbolische Zeit-Impressionen, keine echten Zeitdokumente.'
        )}
      </p>

      <PhaseNav back={{ to: 'onboarding', onClick: onBack }} next={{ to: 'exploration', onClick: onContinue }} />
    </div>
  );
};
