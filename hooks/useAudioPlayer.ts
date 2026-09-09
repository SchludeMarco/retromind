import { useCallback } from 'react';
import { playSfx, SfxType } from '../lib/sfx';

// Owns the click/success UI sound effects — synthesized via the Web Audio
// API (see lib/sfx.ts) rather than an <audio> element, so they always match
// the app's 8-bit identity without shipping audio assets.
export function useAudioPlayer() {
  const playSFX = useCallback((type: SfxType) => {
    playSfx(type, 0.08);
  }, []);

  return { playSFX };
}
