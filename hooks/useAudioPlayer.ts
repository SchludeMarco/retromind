import { useCallback } from 'react';
import { playUiSound, UiSound } from '../lib/uiSounds';
import { celebrate } from '../lib/microFx';

// The app's UI sounds: a tap, a page turning between stops, a little chime
// when something worked (lib/uiSounds). A success also sends up a small
// burst of stars and hearts where the finger was (lib/microFx).
export function useAudioPlayer() {
  const playSFX = useCallback((type: UiSound) => {
    playUiSound(type);
    if (type === 'success') celebrate();
  }, []);

  return { playSFX };
}
