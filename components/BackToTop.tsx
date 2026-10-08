import React from 'react';
import { scrollToTop, useScrolledDown } from '../hooks/useScrolledDown';
import { tr } from '../lib/i18n';

// Round "Nach oben" button, bottom left. Fades in only after some scrolling.
// Retro Warm: sits just above the bottom nav, mirroring the chat button on
// the right. Other designs: above the chat button, clear of the account pills.
export const BackToTop: React.FC<{ warm: boolean; hidden?: boolean; onClick?: () => void }> = ({ warm, hidden = false, onClick }) => {
  const scrolled = useScrolledDown();
  const show = scrolled && !hidden;
  return (
    <button
      onClick={() => { onClick?.(); scrollToTop(); }}
      aria-label={tr('Back to top', 'Nach oben')}
      title={tr('Back to top', 'Nach oben')}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`rm-back-to-top rm-fixed fixed left-4 md:left-10 z-[61] rounded-full retro-button flex items-center justify-center shadow-lg transition-opacity duration-300 ${
        warm
          ? 'bottom-[calc(5rem+env(safe-area-inset-bottom))] w-12 h-12 bg-retro-paper-white text-retro-ink border border-[#e6dac8]'
          : 'bottom-36 w-12 h-12 bg-retro-cream text-retro-ink border-2 border-retro-ink'
      } ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
};
