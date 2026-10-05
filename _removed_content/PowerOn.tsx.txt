import React, { useEffect, useRef, useState } from 'react';
import { chip } from '../lib/chiptune';
import { MuteButton } from './MuteButton';

// Stage 1: the console is off; the user flips the power switch (this gesture
// is also what lets the browser play sound). Stage 2: the CRT warms up, the
// logo scrolls down to a starting diesel engine and chimes. Stage 3: the title screen waits for START.

type Stage = 'off' | 'suck' | 'boot' | 'title';

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

// A bare arcade bulb hanging from its cord, flickering on a concrete wall.
// Decorative only; the light holds still with reduced motion.
const ArcadeLamp: React.FC = () => (
  <div className="lamp-scene" aria-hidden="true">
    <div className="lamp-light" />
    <div className="lamp">
      <span className="lamp-cord" />
      <svg className="lamp-bulb" viewBox="0 0 60 96">
        <rect x="20" y="0" width="20" height="22" rx="3" fill="#2b2b2b" />
        <rect x="18" y="20" width="24" height="8" rx="2" fill="#bdb7a8" />
        <path d="M18 30 h24 v6 c10 6 14 16 14 26 a26 26 0 0 1 -52 0 c0 -10 4 -20 14 -26z" className="lamp-glass" />
        <path d="M24 40 l3 18 l3 -10 l3 10 l3 -18" className="lamp-filament" />
      </svg>
    </div>
  </div>
);

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

  // After the tap the whole wall is pulled into the power button, spinning
  // faster and faster, before the console boots.
  const [suckOrigin, setSuckOrigin] = useState('50% 50%');
  const powerOn = (e: React.MouseEvent<HTMLButtonElement>) => {
    chip.unlock();
    if (reducedMotion) {
      setStage('boot');
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    setSuckOrigin(`${r.left + r.width / 2}px ${r.top + r.height / 2}px`);
    chip.play('powerup');
    setStage('suck');
  };
  useEffect(() => {
    if (stage !== 'suck') return;
    const id = setTimeout(() => setStage('boot'), 1100);
    return () => clearTimeout(id);
  }, [stage]);

  const start = () => {
    if (started.current) return;
    started.current = true;
    chip.play('start');
    onStart();
  };

  if (stage === 'off' || stage === 'suck') {
    return (
      <div
        className={`screen-full power-off${stage === 'suck' ? ' sucked-in' : ''}`}
        style={stage === 'suck' ? { transformOrigin: suckOrigin } : undefined}
      >
        <ArcadeLamp />
        <button className="power-switch" onClick={powerOn} disabled={stage === 'suck'} aria-label="Konsole einschalten" autoFocus>
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
          {muted ? 'Kiste an, Alter! Der Ton ist aus.' : 'Kiste an, Alter! Mit Sound, also Boxen aufdrehen!'}
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
        Vergessene Games von den 80ern bis heute: Screenshots, Guides, Cheats &amp; Storys. Voll retro, no cap.
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
