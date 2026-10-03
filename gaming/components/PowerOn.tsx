import React, { useEffect, useRef, useState } from 'react';
import { chip } from '../lib/chiptune';
import { MuteButton } from './MuteButton';

// Stage 1: the console is off; the user flips the power switch (this gesture
// is also what lets the browser play sound). Stage 2: the CRT warms up, the
// logo scrolls down to a starting diesel engine and chimes. Stage 3: the title screen waits for START.

type Stage = 'off' | 'boot' | 'title';

// Open the app with ?ton to see what the boot sounds actually did on this
// device (for tracking down a silent phone without a debugger).
const SOUND_DEBUG = new URLSearchParams(window.location.search).has('ton');

const SoundDebug: React.FC = () => {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, []);
  return (
    <pre className="sound-debug">
      {`Audio: ${chip.debugState}\nDiesel: ${chip.debug.diesel ?? '–'}\nBling: ${chip.debug.chime ?? '–'}\nTitelmusik: ${chip.debug.title ?? '–'}`}
    </pre>
  );
};

export const PowerOn: React.FC<{
  onStart: () => void;
  reducedMotion: boolean;
  muted: boolean;
  onToggleMute: () => void;
}> = ({ onStart, reducedMotion, muted, onToggleMute }) => {
  const [stage, setStage] = useState<Stage>('off');
  const started = useRef(false);

  // Fetch the engine sample while the power switch waits for a tap.
  useEffect(() => chip.prefetchDiesel(), []);

  useEffect(() => {
    if (stage !== 'boot') return;
    // A diesel engine cranks and idles while the logo drops; the chime lands
    // as the logo settles (crt-on 0.9s + logo-drop 2.4s).
    if (reducedMotion) chip.debug.diesel = 'aus (Bewegung reduziert)';
    const stopEngine = reducedMotion ? () => {} : chip.diesel(3.2);
    const chime = setTimeout(() => chip.chime(), reducedMotion ? 100 : 3300);
    const next = setTimeout(() => setStage('title'), reducedMotion ? 900 : 5200);
    return () => {
      clearTimeout(chime);
      clearTimeout(next);
      stopEngine();
    };
  }, [stage, reducedMotion]);

  // The title screen plays its C64-style tune until START is pressed.
  useEffect(() => {
    if (stage !== 'title') return;
    chip.startTitleMusic();
    return () => chip.stopTitleMusic();
  }, [stage]);

  useEffect(() => {
    if (stage !== 'title') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const powerOn = () => {
    chip.unlock();
    setStage('boot');
  };

  const start = () => {
    if (started.current) return;
    started.current = true;
    chip.play('start');
    onStart();
  };

  if (stage === 'off') {
    return (
      <div className="screen-full power-off">
        <button className="power-switch" onClick={powerOn} aria-label="Konsole einschalten" autoFocus>
          {/* Drawn, not the ⏻ character: many phone fonts lack it. */}
          <svg className="power-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.05 6.5a8 8 0 1 0 9.9 0" />
            <path d="M12 2.5v9" />
          </svg>
        </button>
        <p className="pixel-font dim" style={{ fontSize: 11, marginTop: 28 }}>
          <span className="power-led" aria-hidden="true" />
          POWER
        </p>
        <p className="dim" style={{ maxWidth: 420 }}>
          {muted ? 'Schalte die Konsole ein. Der Ton ist aus.' : 'Schalte die Konsole ein. Mit Ton – Lautsprecher an!'}
        </p>
        <MuteButton className="power-mute" muted={muted} onToggle={onToggleMute} label />
      </div>
    );
  }

  if (stage === 'boot') {
    return (
      <div className="screen-full crt-on" onClick={() => setStage('title')}>
        <div className="logo-drop">
          <img className="boot-motif" src="/gaming/motif.webp" alt="" />
          <p className="pixel-font rgb-split title-logo" style={{ fontSize: 'clamp(22px, 5vw, 48px)' }}>
            RETROMIND
          </p>
        </div>
        <p className="pixel-font dim fade-in-late" style={{ fontSize: 10, marginTop: 24 }}>
          LIZENZIERT FÜR ERINNERUNGEN
        </p>
        {SOUND_DEBUG && <SoundDebug />}
      </div>
    );
  }

  return (
    <div className="screen-full" style={{ background: 'transparent' }} onClick={start}>
      <h1 className="title-logo title-art">
        <img src="/gaming/logo.webp" alt="RetroMind – Gaming" />
      </h1>
      <button className="pixel-font title-press blink" autoFocus>
        PRESS START
      </button>
      <p className="dim" style={{ marginTop: 36 }}>
        Vergessene Spiele von den 80ern bis heute: Screenshots, Guides, Tipps &amp; Geschichten.
      </p>
      <p className="pixel-font dim" style={{ fontSize: 9, marginTop: 24 }}>
        © 1980–{new Date().getFullYear()} RETROMIND · 1 PLAYER
      </p>
      <p className="dim" style={{ fontSize: 16, marginTop: 8 }}>
        <span className="power-led on" aria-hidden="true" />
        Tastatur, Maus oder Gamepad · Pfeiltasten bewegen den Cursor
      </p>
      {SOUND_DEBUG && <SoundDebug />}
    </div>
  );
};
