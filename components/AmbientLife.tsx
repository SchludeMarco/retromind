import React, { useMemo } from 'react';

// A little life in the air on every page of the Zeitreise (Marco,
// 2026-10-14: "Es passiert wirklich nichts die meiste Zeit"): a few specks
// drift slowly upwards and sway, like dust in the sunlight of an old living
// room. Each design colours them its own way in index.css (.rm-ambient):
// warm golden light in Retro Warm, paper dust in Klassisch, fireflies in
// Nachtschicht. They never catch a touch and are gone under
// prefers-reduced-motion and in print.

const SPECKS = 9;

export const AmbientLife: React.FC = () => {
  const specks = useMemo(
    () =>
      Array.from({ length: SPECKS }, (_, i) => ({
        left: `${(i / SPECKS) * 100 + Math.random() * (100 / SPECKS)}%`,
        size: `${5 + Math.random() * 6}px`,
        duration: `${16 + Math.random() * 14}s`,
        delay: `${-Math.random() * 30}s`,
        sway: `${(Math.random() < 0.5 ? -1 : 1) * (14 + Math.random() * 26)}px`,
      })),
    []
  );
  return (
    <div className="rm-ambient no-print" aria-hidden="true">
      {specks.map((s, i) => (
        <span
          key={i}
          style={
            {
              left: s.left,
              width: s.size,
              height: s.size,
              animationDuration: `${s.duration}, 5.5s`,
              animationDelay: `${s.delay}, ${s.delay}`,
              '--sway': s.sway,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
