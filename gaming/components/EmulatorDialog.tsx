import React, { useEffect, useRef } from 'react';
import { EmuLaunch } from '../lib/emulator';
import { controls } from '../lib/useControls';
import { isGerman, tr } from '../../lib/i18n';

// The emulator in a sheet over the hub. The game runs in a frame
// (public/emulator/play.html), so EmulatorJS's globals and its clean-up stay
// out of the app: closing the sheet removes the frame and everything in it.
// A file from the player's device is handed to the frame directly and never
// uploaded. The sheet closes only through its button, so a stray tap beside
// the screen doesn't end a game.

export const EmulatorDialog: React.FC<{ launch: EmuLaunch; onClose: () => void; onRunning?: (running: boolean) => void }> = ({ launch, onClose, onRunning }) => {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    controls.paused = true;
    onRunning?.(true);
    return () => {
      controls.paused = false;
      onRunning?.(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!('file' in launch)) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow || e.data?.type !== 'rm-emulator-ready') return;
      frame.current?.contentWindow?.postMessage({ type: 'rm-rom', file: launch.file, name: launch.file.name }, location.origin);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [launch]);

  const params = new URLSearchParams({ core: launch.core, lang: isGerman ? 'de' : 'en' });
  if ('rom' in launch) params.set('rom', launch.rom);

  return (
    <div className="overlay">
      <div className="dialog emu-dialog" role="dialog" aria-modal="true" aria-label={launch.title}>
        <h2 className="pixel-font">🕹️ {launch.title}</h2>
        <button className="px-btn close-x" onClick={onClose} aria-label={tr('Close', 'Schließen')} data-nav>
          ✕
        </button>
        <iframe
          ref={frame}
          className="emu-screen"
          src={`/emulator/play.html?${params}`}
          title={launch.title}
          allow="autoplay; fullscreen; gamepad"
          onLoad={() => frame.current?.focus()}
        />
        <p className="dim emu-keys">
          {tr(
            'Keyboard: arrow keys to move, Z = A, X = B, Enter = Start, V = Select. A connected gamepad works too. Saves stay in this browser.',
            'Tastatur: Pfeiltasten zum Laufen, Z = A, X = B, Enter = Start, V = Select. Ein angeschlossenes Gamepad geht auch. Spielstände bleiben in diesem Browser.'
          )}
        </p>
      </div>
    </div>
  );
};
