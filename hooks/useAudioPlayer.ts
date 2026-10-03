import { useCallback, useRef } from 'react';
import { SFX } from '../lib/sfx';
import { isMuted } from '../lib/mute';

// Owns the click/success UI sound effects.
export function useAudioPlayer() {
  const sfxRef = useRef<HTMLAudioElement | null>(null);

  const playSFX = useCallback((type: keyof typeof SFX) => {
    if (!sfxRef.current || isMuted()) return;
    sfxRef.current.src = SFX[type];
    sfxRef.current.volume = 0.4;
    sfxRef.current.currentTime = 0;
    sfxRef.current.play().catch(() => {});
  }, []);

  return { sfxRef, playSFX };
}
