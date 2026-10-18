import React from 'react';

// The floppy disk (keep an entry) and the box (the Grabbelkiste) of the
// tickers in both apps (components/RetroTicker.tsx, gaming/components/HallTicker.tsx).

export const FloppyIcon: React.FC<{ saved?: boolean; className?: string }> = ({ saved = false, className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
    <path d="M4 3h13l3 3v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="currentColor" />
    <rect x="7" y="3" width="9" height="6" rx="0.6" fill="#2a1a10" opacity="0.55" />
    <rect x="12.5" y="4" width="2" height="4" rx="0.4" fill="currentColor" />
    <rect x="6" y="12" width="12" height="8" rx="0.8" fill="#fff8ec" />
    {saved ? (
      <path d="M8.6 16.2l2.2 2.1 4.6-4.6" fill="none" stroke="#2f7a52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M8 14.6h8M8 17.4h5.5" stroke="#b9a58f" strokeWidth="1.2" strokeLinecap="round" />
    )}
  </svg>
);

export const BoxIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <path d="M3 9.5h18l-1.6 10.2a1.5 1.5 0 0 1-1.5 1.3H6.1a1.5 1.5 0 0 1-1.5-1.3z" />
    <path d="M3 9.5l2.5-4.5h13L21 9.5M9 13.5h6" />
  </svg>
);
