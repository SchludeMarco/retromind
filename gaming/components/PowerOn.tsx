import React, { useEffect, useRef, useState } from 'react';
import { chip } from '../lib/chiptune';

// Stage 1: the console is off; the user flips the power switch (this gesture
// is also what lets the browser play sound). Stage 2: the CRT warms up, the
// logo scrolls down and chimes. Stage 3: the title screen waits for START.

type Stage = 'off' | 'boot' | 'title';

export const PowerOn: React.FC<{ onStart: () => void; reducedMotion: boolean }> = ({ onStart, reducedMotion }) => {
  const [stage, setStage] = useState<Stage>('off');
  const started = useRef(false);

  useEffect(() => {
    if (stage !== 'boot') return;
    // The chime lands as the logo settles (crt-on 0.9s + logo-drop 2.4s).
    const chime = setTimeout(() => chip.chime(), reducedMotion ? 100 : 3300);
    const next = setTimeout(() => setStage('title'), reducedMotion ? 900 : 5200);
    return () => {
      clearTimeout(chime);
      clearTimeout(next);
    };
  }, [stage, reducedMotion]);

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
          Schalte die Konsole ein. Mit Ton – Lautsprecher an!
        </p>
      </div>
    );
  }

  if (stage === 'boot') {
    return (
      <div className="screen-full crt-on" onClick={() => setStage('title')}>
        <div className="logo-drop">
          <p className="pixel-font rgb-split title-logo" style={{ fontSize: 'clamp(22px, 5vw, 48px)' }}>
            RETROMIND
          </p>
        </div>
        <p className="pixel-font dim fade-in-late" style={{ fontSize: 10, marginTop: 24 }}>
          LIZENZIERT FÜR ERINNERUNGEN
        </p>
      </div>
    );
  }

  return (
    <div className="screen-full" style={{ background: 'transparent' }} onClick={start}>
      <h1 className="pixel-font rgb-split title-logo">RETROMIND</h1>
      <p className="pixel-font title-sub glow">– GAMING –</p>
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
    </div>
  );
};
