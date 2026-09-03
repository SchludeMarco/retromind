import React from 'react';

export const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="rm-fixed fixed bottom-0 left-0 w-full h-3 bg-retro-ink/10 z-40" aria-hidden="true">
    <div
      className="h-full bg-retro-amber transition-all duration-500 ease-out border-t border-retro-ink"
      style={{ width: `${(current / total) * 100}%` }}
    />
  </div>
);
