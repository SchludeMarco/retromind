import { useCallback, useEffect, useRef, useState } from 'react';
import { DECADES_DB } from '../constants';
import { playSfx, SfxType } from '../lib/sfx';

// Owns the ambient-music <audio> element, the click/success sound effects,
// and the volume/decade controls for the fixed RetroPlayer widget.
export function useAudioPlayer(currentAudioDecade: string) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.05);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  // Stable identity (reads volume from a ref) so effects that depend on it
  // don't re-fire when the volume slider moves.
  const playSFX = useCallback((type: SfxType) => {
    playSfx(type, volumeRef.current);
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    const track = DECADES_DB[currentAudioDecade]?.audioUrl;
    if (track && audioRef.current.src !== track) {
      audioRef.current.src = track;
      audioRef.current.load();
      if (isMusicPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentAudioDecade]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isMusicPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return { audioRef, isMusicPlaying, setIsMusicPlaying, volume, setVolume, playSFX };
}
