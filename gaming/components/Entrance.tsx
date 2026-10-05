import React, { useEffect, useRef, useState } from 'react';
import { chip } from '../lib/chiptune';
import { MuteButton } from './MuteButton';

// The way in: a wobbly bulb in front of a battered, graffiti-covered wooden
// door while a quiet piece plays. "Eintreten" throws the door open, the logo
// shines out of the doorway, the picture goes white and the hub follows.
//
// Browsers only allow sound after the visitor has touched the page, so the
// quiet piece is queued right away and starts with the first tap or key
// anywhere (installed apps and often-visited sites may play it at once).

// Open the app with ?ton to see what the intro sounds did on this device.
const SOUND_DEBUG = new URLSearchParams(window.location.search).has('ton');

const SoundDebug: React.FC = () => {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, []);
  return (
    <pre className="sound-debug">
      {`Audio: ${chip.debugState}\nAmbiente: ${chip.debug.ambient ?? '–'}\nBling: ${chip.debug.chime ?? '–'}`}
    </pre>
  );
};

// A bare bulb hanging from its cord, swinging and flickering.
const Bulb: React.FC = () => (
  <>
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
  </>
);

const PLANKS = ['#6e4b2c', '#5f3f24', '#74512f', '#654427', '#6a4829'];

// The door leaf: five weathered planks on a Z-brace, rusty fittings, a
// kicked-in hole, a rotten bottom and cheap spray-paint all over it.
const DoorLeaf: React.FC = () => (
  <svg className="door-leaf-art" viewBox="0 0 200 400" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <filter id="door-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.6" numOctaves="3" seed="4" />
        <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.07  0 0 0 0 0.03  0 0 0 0.55 0" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
      <linearGradient id="door-rot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1d2416" stopOpacity="0" />
        <stop offset="1" stopColor="#141a0e" stopOpacity="0.75" />
      </linearGradient>
      <filter id="spray">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
      </filter>
    </defs>
    {/* planks; the fourth one has rotted away at the bottom */}
    {PLANKS.map((c, i) => (
      <path
        key={i}
        d={
          i === 3
            ? `M${i * 40 + 1} 0 h38 v356 l-6 10 l-8 -6 l-7 12 l-6 -8 l-6 7 l-5 -3 z`
            : i === 4
              ? `M${i * 40 + 1} 34 l7 -12 l6 9 l9 -22 l5 14 l11 -18 v399 h-38 z`
              : `M${i * 40 + 1} 0 h38 v${i === 1 ? 392 : 400} h-38 z`
        }
        fill={c}
      />
    ))}
    <rect width="200" height="400" fill="#000" filter="url(#door-grain)" />
    {/* plank gaps */}
    {[40, 80, 120, 160].map((x) => (
      <line key={x} x1={x} y1="0" x2={x} y2="400" stroke="#1c120a" strokeWidth="2" />
    ))}
    {/* Z-brace */}
    <g fill="#563820" stroke="#2a1a0d" strokeWidth="1.5">
      <rect x="4" y="52" width="192" height="24" />
      <rect x="4" y="318" width="192" height="24" />
      <path d="M14 318 L170 76 h22 L36 318 z" />
    </g>
    {/* damp rot creeping up from the floor */}
    <rect y="300" width="200" height="100" fill="url(#door-rot)" />
    {/* a plank someone nailed across it once, now hanging askew */}
    <g transform="rotate(-13 100 196)">
      <rect x="-14" y="186" width="228" height="22" fill="#7b5a39" stroke="#2a1a0d" strokeWidth="1.5" />
      <path d="M-14 192 h228 M-14 201 h120" stroke="#5a3d22" strokeWidth="1" />
      <circle cx="4" cy="197" r="2.2" fill="#2b1d12" />
      <circle cx="196" cy="197" r="2.2" fill="#2b1d12" />
    </g>
    {/* peeled paint and a crack */}
    <path d="M128 140 q8 -6 18 2 q-4 10 -14 8 z M20 230 q10 -4 14 6 q-8 6 -14 -6 z" fill="#8a6a49" opacity="0.7" />
    <path d="M57 0 l3 38 l-4 30 l5 44 l-3 40" fill="none" stroke="#1c120a" strokeWidth="1.6" />
    {/* the kicked-in hole, splinters around a black gap */}
    <path d="M128 228 l12 -8 l6 10 l14 -6 l-2 14 l12 6 l-10 10 l6 14 l-16 -2 l-6 12 l-8 -12 l-14 4 l2 -14 l-10 -8 l12 -6 z" fill="#d1a877" />
    <path d="M134 234 l8 -4 l5 8 l10 -3 l-2 10 l8 5 l-8 6 l3 9 l-11 -2 l-5 8 l-5 -8 l-10 2 l2 -9 l-6 -6 l9 -4 z" fill="#0b0705" />
    {/* rusty hinges, handle and lock */}
    <g fill="#3b2a20" stroke="#7a3e1c" strokeWidth="1.2">
      <path d="M0 58 h46 l6 6 l-6 6 h-46 z" />
      <path d="M0 324 h46 l6 6 l-6 6 h-46 z" />
      <rect x="166" y="190" width="18" height="40" rx="3" />
    </g>
    <circle cx="175" cy="205" r="6" fill="none" stroke="#9a5a2a" strokeWidth="3" />
    <path d="M173 218 h4 v7 h-4 z" fill="#0b0705" />
    {[12, 30, 170, 188].map((x) => (
      <g key={x} fill="#23170e">
        <circle cx={x} cy="64" r="1.8" />
        <circle cx={x} cy="330" r="1.8" />
      </g>
    ))}
    {/* graffiti */}
    <g filter="url(#spray)" fontFamily="'Permanent Marker', 'Comic Sans MS', cursive" strokeLinejoin="round">
      <text x="14" y="128" transform="rotate(-9 14 128)" fontSize="46" fill="#ff4fa3" stroke="#14080f" strokeWidth="2.5" paintOrder="stroke">
        RETRO
      </text>
      <path d="M30 128 v12 M66 122 v16 M98 117 v10 M128 113 v14" stroke="#ff4fa3" strokeWidth="3" strokeLinecap="round" />
      <text x="24" y="186" transform="rotate(6 24 186)" fontSize="30" fill="#52f2ff" stroke="#05161a" strokeWidth="2" paintOrder="stroke">
        1UP
      </text>
      <text x="96" y="176" transform="rotate(-4 96 176)" fontSize="18" fill="#fff36b">
        no cap!
      </text>
      <text x="12" y="282" transform="rotate(-3 12 282)" fontSize="15" fill="#f4f4f4" opacity="0.9">
        Betreten verboten
      </text>
      <path d="M10 278 l110 -12" stroke="#ff3b3b" strokeWidth="3" strokeLinecap="round" />
      <text x="28" y="306" transform="rotate(-8 28 306)" fontSize="22" fill="#7dff6a" stroke="#0b1a08" strokeWidth="1.5" paintOrder="stroke">
        GG ;)
      </text>
      <text x="112" y="372" transform="rotate(-12 112 372)" fontSize="20" fill="#c08bff">
        Player 2?
      </text>
      {/* a wonky heart, a smiley and a scribbled tag */}
      <path d="M150 116 c-8 -12 -24 0 -10 14 l10 10 l10 -10 c14 -14 -2 -26 -10 -14 z" fill="none" stroke="#ff7a2f" strokeWidth="3" />
      <path d="M128 140 l44 -30 l-6 0 m6 0 l-1 6" fill="none" stroke="#ff7a2f" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="56" cy="222" r="15" fill="none" stroke="#fff36b" strokeWidth="3" />
      <path d="M50 218 v2 M62 218 v2 M48 227 q8 8 16 0" fill="none" stroke="#fff36b" strokeWidth="3" strokeLinecap="round" />
      <path d="M86 214 c6 -16 14 10 20 -6 s10 14 18 -2 s4 18 12 6" fill="none" stroke="#52f2ff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 30 q30 -14 60 4 t60 -6 t70 8" fill="none" stroke="#c08bff" strokeWidth="2" opacity="0.8" />
    </g>
  </svg>
);

export const Entrance: React.FC<{
  onEnter: () => void;
  reducedMotion: boolean;
  muted: boolean;
  music: boolean;
  onToggleMute: () => void;
}> = ({ onEnter, reducedMotion, muted, music, onToggleMute }) => {
  const [entering, setEntering] = useState(false);
  const [soundWaiting, setSoundWaiting] = useState(false);
  const stopAmbient = useRef<() => void>(() => {});

  // Queue the quiet piece now; the first touch or key anywhere lets it play.
  useEffect(() => {
    chip.unlock();
    if (!music) {
      chip.debug.ambient = 'aus (Musik ausgeschaltet)';
      return;
    }
    const stop = chip.ambient();
    stopAmbient.current = stop;
    const wake = () => chip.unlock();
    const events = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'];
    events.forEach((e) => window.addEventListener(e, wake, true));
    const poll = setInterval(() => setSoundWaiting(!chip.ready), 300);
    return () => {
      events.forEach((e) => window.removeEventListener(e, wake, true));
      clearInterval(poll);
      stop();
    };
  }, [music]);

  const enter = () => {
    if (entering) return;
    setEntering(true);
    chip.unlock();
    stopAmbient.current();
    if (reducedMotion) {
      chip.chime();
      setTimeout(onEnter, 300);
      return;
    }
    // Door flies open (0.5 s), the logo shines out of the doorway, the
    // picture fades to white, then the hub.
    chip.door();
    setTimeout(() => chip.chime(), 650);
    setTimeout(onEnter, 2300);
  };

  return (
    <div className={`screen-full entrance${entering ? ' entering' : ''}`}>
      <div className="entrance-scene" aria-hidden="true">
        <div className="doorway">
          <div className="door-inside" />
          <div className="door-leaf">
            <DoorLeaf />
          </div>
          <img className="door-logo" src="/gaming/logo.webp" alt="" />
        </div>
        <div className="entrance-dark" />
        <Bulb />
      </div>
      <div className="entrance-controls">
        <button className="px-btn big enter-btn pixel-font" onClick={enter} disabled={entering} autoFocus>
          EINTRETEN
        </button>
        <p className="dim">
          {muted
            ? 'Da drin warten die alten Games. Der Ton ist aus.'
            : soundWaiting
              ? 'Psst … einmal irgendwo hintippen, dann läuft leise Musik.'
              : 'Da drin warten die alten Games. Trau dich, Player 1.'}
        </p>
        <MuteButton className="power-mute" muted={muted} onToggle={onToggleMute} label />
      </div>
      <div className="white-out" />
      {SOUND_DEBUG && <SoundDebug />}
    </div>
  );
};
