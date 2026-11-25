import React, { useEffect, useRef, useState } from 'react';
import { WarpVortex } from './SplashScreen';
import { playThunder, playWarp, WARP_SECONDS } from '../lib/clockSounds';

// The time machine pulls you in again when you pick a new destination
// (Marco, 2026-11-23: "Wenn ich das Datum ändere und die Zeitreise erneut
// startet, sollten visuelle und audio Effekte auftreten"): the same pull as
// at the start (lib/clockSounds playWarp: racing ticks, rising hum, gong),
// the room darkens and spirals into a vortex of rings, a thunder crack and a
// white flash. The time circuits (ArrivalShow) come up with the pull itself
// and race to the new date in front of the vortex (Marco, 2026-11-25).

const WARP_MS = WARP_SECONDS * 1000;
const FLASH_MS = 320;
const FADE_MS = 700;

export const TimeWarp: React.FC<{ onFlash?: () => void; onDone: () => void }> = ({ onFlash, onDone }) => {
  const [stage, setStage] = useState<'warp' | 'flash' | 'fade'>('warp');
  const cb = useRef({ onFlash, onDone });
  cb.current = { onFlash, onDone };
  useEffect(() => {
    playWarp();
    navigator.vibrate?.([30, 60, 30]);
    const t1 = window.setTimeout(() => {
      setStage('flash');
      playThunder(0);
      navigator.vibrate?.(120);
    }, WARP_MS);
    const t2 = window.setTimeout(() => {
      setStage('fade');
      cb.current.onFlash?.();
    }, WARP_MS + FLASH_MS);
    const t3 = window.setTimeout(() => cb.current.onDone(), WARP_MS + FLASH_MS + FADE_MS);
    return () => [t1, t2, t3].forEach((t) => window.clearTimeout(t));
  }, []);
  return (
    <div aria-hidden="true" className={`rm-timewarp is-${stage}`}>
      {stage === 'warp' && (
        <>
          <div className="rm-timewarp-dark" />
          <WarpVortex ms={WARP_MS} />
        </>
      )}
      {stage !== 'warp' && (
        <div
          className="rm-time-light rm-timewarp-light"
          style={stage === 'flash' ? { animation: `splashWhiteIn ${FLASH_MS}ms ease-out forwards` } : undefined}
        />
      )}
    </div>
  );
};
