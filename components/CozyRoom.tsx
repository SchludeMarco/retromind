import React, { useEffect, useRef, useState } from 'react';
import type { WeatherKind } from '../lib/weather';
import { useMuted } from '../lib/mute';
import { tr } from '../lib/i18n';
import { playClick, playCrackle, playPurr, playTvOn, setFireSound, tapFeel } from '../lib/roomSounds';

// The "Stube" at the top of the Retro Warm start page (Marco, 2026-10-13:
// "man soll sich direkt wie Zuhause auf der warmen Couch in der warmen Stube
// fühlen"): a living room drawn in SVG, with a caramel couch, a crocheted
// blanket, a floor lamp that glows, a cup of tea that steams, a wood stove
// that burns in the evening and a cat asleep on the rug. The window shows the
// real time of day, so in the evening the sun sets outside and at night the
// moon is up; with the real weather switched on (lib/weather.ts) it also
// rains, snows, storms or gets foggy out there. The gentle animations stop
// for people who ask for reduced motion (index.css).
//
// Since Marco's "größeres Update in Haptik und Optik" the room is the start
// page in every design and can be touched: the old TV starts the journey,
// the lamp clicks on and off, the stove can be lit (and then crackles), the
// cat purrs, the window opens the real weather, and the picture and the
// books lead to the journey's stations. Each touch gives a little sound
// (lib/roomSounds.ts) and, on phones that can, a short buzz.

export type DayTime = 'morning' | 'day' | 'evening' | 'night';

export function dayTime(hour = new Date().getHours()): DayTime {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

const SKY: Record<DayTime, [string, string]> = {
  morning: ['#bfe0f0', '#ffe3a8'],
  day: ['#8fc9ea', '#dff1f8'],
  evening: ['#7d5a8c', '#f4a25a'],
  night: ['#1f2149', '#43386a'],
};

// The granny squares of the blanket over the armrest.
const GRANNY = ['#d95d39', '#e8a838', '#4b7b72', '#f3e1c4', '#a43716', '#e8a838', '#4b7b72', '#d95d39', '#f3e1c4'];

// What the window shows when the real weather is switched on (lib/weather.ts).
const RAIN = Array.from({ length: 16 }, (_, i) => ({ x: 270 + i * 4.6, y: 40 + ((i * 37) % 70), d: -((i * 0.17) % 0.7) }));
const SNOW = Array.from({ length: 18 }, (_, i) => ({ x: 271 + ((i * 23) % 68), y: 42 + ((i * 29) % 70), d: -((i * 0.53) % 4), r: 1 + (i % 3) * 0.4 }));

const WindowWeather: React.FC<{ kind: WeatherKind; lit: boolean }> = ({ kind, lit }) => (
  <g clipPath="url(#cozy-glass)">
    {kind === 'fog' && <rect x="268" y="40" width="72" height="74" fill="#f2efe9" opacity="0.65" />}
    {(kind === 'rain' || kind === 'storm') && <rect x="268" y="40" width="72" height="74" fill="#4f5666" opacity={lit ? 0.35 : 0.45} />}
    {kind === 'snow' && <rect x="268" y="40" width="72" height="74" fill="#dfe5ec" opacity={lit ? 0.15 : 0.35} />}
    {kind !== 'fog' && (
      <g className="cozy-clouds" fill={kind === 'clouds' ? '#ffffff' : '#9aa2ae'} opacity={kind === 'clouds' ? 0.85 : 0.9}>
        <path d="M272 58a7 7 0 0 1 12-5 6 6 0 0 1 11 2 5 5 0 0 1 1 10h-22a4 4 0 0 1-2-7z" />
        <path d="M306 50a6 6 0 0 1 10-4 5 5 0 0 1 10 2 4 4 0 0 1 1 8h-19a3.5 3.5 0 0 1-2-6z" />
      </g>
    )}
    {(kind === 'rain' || kind === 'storm') &&
      RAIN.map((r, i) => (
        <line key={i} className="cozy-rain" x1={r.x} y1={r.y} x2={r.x - 2} y2={r.y + 7} stroke="#dfe8f2" strokeWidth="1" strokeLinecap="round" style={{ animationDelay: `${r.d}s` }} />
      ))}
    {kind === 'snow' &&
      SNOW.map((f, i) => (
        <circle key={i} className="cozy-snow" cx={f.x} cy={f.y} r={f.r} fill="#ffffff" style={{ animationDelay: `${f.d}s` }} />
      ))}
    {kind === 'storm' && <rect className="cozy-lightning" x="268" y="40" width="72" height="74" fill="#ffffff" opacity="0" />}
  </g>
);

type Box = [x: number, y: number, w: number, h: number];

// Something in the room that can be touched: a button for the keyboard and
// screen readers too, with a dashed outline on hover and keyboard focus.
export const Hot: React.FC<{
  on: boolean;
  label: string;
  onAct: () => void;
  box: Box;
  extra?: Box;
  hint?: boolean;
  children: React.ReactNode;
}> = ({ on, label, onAct, box, extra, hint = false, children }) => {
  if (!on) return <g>{children}</g>;
  const [x, y, w, h] = box;
  const act = () => {
    tapFeel();
    onAct();
  };
  return (
    <g
      className="cozy-hot"
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={act}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          act();
        }
      }}
    >
      {children}
      <rect x={x} y={y} width={w} height={h} fill="transparent" />
      {extra && <rect x={extra[0]} y={extra[1]} width={extra[2]} height={extra[3]} fill="transparent" />}
      <rect className={`cozy-hot-ring ${hint ? 'is-hint' : ''}`} x={x} y={y} width={w} height={h} rx="6" fill="none" />
    </g>
  );
};

export interface RoomActions {
  /** The TV: starts (or continues) the journey. */
  onTv?: () => void;
  onWindow?: () => void;
  onPicture?: () => void;
  onBooks?: () => void;
}

export const CozyRoom: React.FC<{
  time?: DayTime;
  weather?: WeatherKind | null;
  className?: string;
  /** Makes the things in the room touchable. */
  interactive?: boolean;
  actions?: RoomActions;
  /** Read out for the TV, e.g. "Start the time travel". */
  tvLabel?: string;
}> = ({ time = dayTime(), weather = null, className = '', interactive = false, actions = {}, tvLabel }) => {
  const [skyTop, skyBottom] = SKY[time];
  const evening = time === 'evening' || time === 'night';
  const [lampOn, setLampOn] = useState(true);
  const [fireOn, setFireOn] = useState(evening);
  const [petted, setPetted] = useState(0);
  const [tvOn, setTvOn] = useState(false);
  const [wobble, setWobble] = useState<'' | 'picture' | 'books'>('');
  const timers = useRef<number[]>([]);
  const muted = useMuted();
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // A burning stove crackles quietly, as long as sound is on.
  useEffect(() => {
    setFireSound(interactive && fireOn && !muted);
    return () => setFireSound(false);
  }, [interactive, fireOn, muted]);

  const lit = evening && lampOn;
  const fire = fireOn;
  const dark = evening ? (lampOn ? (time === 'night' ? 0.2 : 0.1) : time === 'night' ? 0.42 : 0.3) : lampOn ? 0 : 0.06;

  const tapTv = () => {
    playTvOn();
    setTvOn(true);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    later(() => actions.onTv?.(), reduce ? 150 : 900);
  };
  const tapLamp = () => {
    playClick();
    setLampOn((v) => !v);
  };
  const tapStove = () => {
    if (!fireOn) playCrackle();
    else playClick();
    setFireOn((v) => !v);
  };
  const tapCat = () => {
    playPurr();
    setPetted((n) => n + 1);
    later(() => setPetted((n) => Math.max(0, n - 1)), 2600);
  };
  const wiggle = (what: 'picture' | 'books', go?: () => void) => {
    playClick();
    setWobble(what);
    later(() => setWobble(''), 700);
    if (go) later(go, 450);
  };
  const awake = petted > 0;
  // Rain, snow and fog hide the sun and the moon; clouds only drift past.
  const overcast = weather === 'rain' || weather === 'snow' || weather === 'fog' || weather === 'storm';
  return (
    <svg
      viewBox="0 0 400 220"
      className={`cozy-room block w-full h-auto ${interactive ? 'is-interactive' : ''} ${className}`}
      {...(interactive
        ? { role: 'group', 'aria-label': tr('The living room. Everything in it can be tapped.', 'Die Stube. Alles darin kann man antippen.') }
        : { 'aria-hidden': true, focusable: 'false' })}
    >
      <defs>
        <pattern id="cozy-wallpaper" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="#f2dcbc" />
          <rect width="12" height="24" fill="#efd5b2" />
          <circle cx="18" cy="6" r="1.6" fill="#e2b98a" />
          <circle cx="6" cy="18" r="1.6" fill="#e9c79c" />
        </pattern>
        <clipPath id="cozy-screen">
          <rect x="344" y="123" width="36" height="30" rx="7" />
        </clipPath>
        <clipPath id="cozy-glass">
          <rect x="268" y="40" width="72" height="74" />
        </clipPath>
        <linearGradient id="cozy-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
        <radialGradient id="cozy-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd88a" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#ffc46b" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffb85c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cozy-fire-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff8a3c" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ff7a2a" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ff7a2a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cozy-tv-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#cfe6ff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#cfe6ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cozy-couch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d48a4b" />
          <stop offset="1" stopColor="#b5672f" />
        </linearGradient>
        <linearGradient id="cozy-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8693e" />
          <stop offset="1" stopColor="#8c5430" />
        </linearGradient>
      </defs>

      {/* Wall and floor */}
      <rect width="400" height="168" fill="url(#cozy-wallpaper)" />
      <rect y="24" width="400" height="3" fill="#c9965f" opacity="0.6" />
      <rect y="166" width="400" height="54" fill="url(#cozy-floor)" />
      {[178, 192, 207].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#7a4626" strokeWidth="0.8" opacity="0.5" />
      ))}
      {[40, 130, 220, 310, 85, 175, 265, 355].map((x, i) => (
        <line key={x} x1={x} y1={i < 4 ? 166 : 178} x2={x} y2={i < 4 ? 178 : 192} stroke="#7a4626" strokeWidth="0.8" opacity="0.4" />
      ))}
      <rect y="160" width="400" height="7" fill="#7f4a29" />
      <rect y="160" width="400" height="1.5" fill="#a46a43" />

      {/* Window with the real time of day outside */}
      <Hot
        on={interactive && !!actions.onWindow}
        label={tr('Window: show your real weather', 'Fenster: dein echtes Wetter zeigen')}
        onAct={() => actions.onWindow?.()}
        box={[248, 26, 112, 98]}
      >
        <rect x="262" y="34" width="84" height="86" rx="3" fill="#fff4e2" />
        <rect x="268" y="40" width="72" height="74" fill="url(#cozy-sky)" />
        {!overcast && (
          <>
          {time === 'morning' && <circle cx="292" cy="98" r="10" fill="#ffd36b" />}
          {time === 'day' && (
            <>
              <circle cx="320" cy="58" r="9" fill="#ffe08a" />
              <path d="M278 80a6 6 0 0 1 11-3 5 5 0 0 1 9 3z" fill="#ffffff" opacity="0.9" />
            </>
          )}
          {time === 'evening' && <circle cx="304" cy="112" r="13" fill="#ffb347" />}
          {time === 'night' && (
            <>
              <circle cx="318" cy="58" r="8" fill="#fff3c4" />
              <circle cx="322" cy="55" r="7" fill="#2a2a55" />
              {[[280, 52], [296, 66], [330, 86], [286, 92], [310, 76]].map(([x, y]) => (
                <circle key={`${x}-${y}`} className="cozy-star" cx={x} cy={y} r="1.1" fill="#fff8dc" />
              ))}
            </>
          )}
          </>
        )}
        {/* far hills */}
        <path d="M268 106q18-10 36-2t36-4v14h-72z" fill={weather === 'snow' ? '#f4f6f8' : evening ? '#3d3555' : '#9cc49a'} opacity="0.85" />
        {weather && weather !== 'clear' && <WindowWeather kind={weather} lit={evening} />}
        <rect x="302.5" y="40" width="3" height="74" fill="#fff4e2" />
        <rect x="268" y="75" width="72" height="3" fill="#fff4e2" />
        <rect x="256" y="118" width="96" height="6" rx="2" fill="#e9d2b0" />
        {weather === 'snow' && <path d="M258 118c6-4 14-3 22-2s20-3 30-1 22 1 30 3z" fill="#ffffff" />}
        {/* curtains, tied back */}
        <path d="M250 28h22c-2 30 6 52 2 70-3 14-12 20-20 22-6-28 2-60-4-92z" fill="#c2532f" />
        <path d="M358 28h-22c2 30-6 52-2 70 3 14 12 20 20 22 6-28-2-60 4-92z" fill="#c2532f" />
        <path d="M258 34c2 24-2 50 0 78M350 34c-2 24 2 50 0 78" stroke="#a43716" strokeWidth="1.4" fill="none" opacity="0.6" />
        <rect x="246" y="24" width="116" height="5" rx="2.5" fill="#8a5a33" />
        <circle cx="246" cy="26.5" r="4" fill="#8a5a33" />
        <circle cx="362" cy="26.5" r="4" fill="#8a5a33" />
        {/* a small plant on the sill */}
        <path d="M264 109h12l-1.6 9h-8.8z" fill="#c2532f" />
        <path d="M270 109c-1-7-6-10-9-11 3 4 4.5 7 5 11M270 109c.5-8 4-13 8-15-2 5-3.5 10-4 15M270 109c0-6-1-12-.5-17 1.5 5 2 11 1.5 17" fill="#5f8f6a" />
      </Hot>

      {/* Pictures on the wall */}
      <Hot
        on={interactive && !!actions.onPicture}
        label={tr('Picture: explore your decades', 'Bild: deine Jahrzehnte erkunden')}
        onAct={() => wiggle('picture', actions.onPicture)}
        box={[124, 32, 98, 48]}
      >
        <g className={wobble === 'picture' ? 'cozy-wobble' : ''}>
          <rect x="128" y="36" width="56" height="42" rx="2" fill="#c99a4c" />
          <rect x="133" y="41" width="46" height="32" fill="#f6e3bf" />
          <circle cx="168" cy="50" r="5" fill="#e8a838" />
          <path d="M133 73l13-15 9 9 7-6 17 12z" fill="#6f9a7c" />
        </g>
        <ellipse cx="208" cy="58" rx="13" ry="16" fill="#c99a4c" />
        <ellipse cx="208" cy="58" rx="9.5" ry="12.5" fill="#f3e1c4" />
        <circle cx="208" cy="54" r="4" fill="#9a7b62" />
        <path d="M200 69c1-6 5-9 8-9s7 3 8 9" fill="#9a7b62" />
      </Hot>


      {/* Rug */}
      <ellipse cx="190" cy="198" rx="140" ry="17" fill="#c9553a" />
      <ellipse cx="190" cy="198" rx="128" ry="13" fill="#e2a868" />
      <ellipse cx="190" cy="198" rx="128" ry="13" fill="none" stroke="#fff1dc" strokeWidth="1.2" strokeDasharray="4 5" />
      <ellipse cx="190" cy="198" rx="80" ry="7" fill="none" stroke="#c9553a" strokeWidth="1.5" />

      {/* Wood stove (Marco, 2026-10-13): a cast-iron stove with a glass door.
          In the evening and at night the fire burns and flickers and throws
          its glow into the room; by day only the embers glow. */}
      <Hot
        on={interactive}
        label={fireOn ? tr('Stove: let the fire go out', 'Ofen: Feuer ausgehen lassen') : tr('Stove: light the fire', 'Ofen: Feuer anzünden')}
        onAct={tapStove}
        box={[8, 104, 48, 90]}
      >
        <rect x="27" y="0" width="9" height="122" fill="#3a302b" />
        <rect x="25" y="70" width="13" height="4" rx="1" fill="#2b231f" />
        <rect x="12" y="120" width="40" height="6" rx="2" fill="#2b231f" />
        <rect x="14" y="126" width="36" height="56" rx="5" fill="#3a302b" />
        <rect x="14" y="126" width="36" height="3" fill="#4d413a" />
        <rect x="16" y="182" width="5" height="9" rx="1" fill="#2b231f" />
        <rect x="43" y="182" width="5" height="9" rx="1" fill="#2b231f" />
        <rect x="19" y="134" width="26" height="30" rx="3" fill="#1c1411" stroke="#5c4d44" strokeWidth="1.5" />
        {/* logs */}
        <path d="M21 160l22-5M22 156l20 6" stroke="#6b4428" strokeWidth="3.5" strokeLinecap="round" />
        {fire ? (
          <g className="cozy-fire">
            <path className="cozy-flame cozy-flame-1" d="M24 159c-2-7 3-10 2-17 4 4 7 9 5 17z" fill="#e8552a" />
            <path className="cozy-flame cozy-flame-2" d="M29 159c-3-9 4-13 3-22 5 6 8 13 5 22z" fill="#ff9a3c" />
            <path className="cozy-flame cozy-flame-3" d="M35 159c-1-6 3-8 3-13 3 4 5 8 3 13z" fill="#ffd36b" />
            <path className="cozy-flame cozy-flame-1" d="M31 159c-1-4 1-6 1-9 2 3 3 6 1 9z" fill="#fff1b8" />
          </g>
        ) : (
          <ellipse className="cozy-ember" cx="32" cy="158" rx="9" ry="2.5" fill="#d9542a" opacity="0.7" />
        )}
        <rect x="19" y="134" width="26" height="30" rx="3" fill="#ffffff" opacity="0.06" />
        <rect x="46" y="146" width="2.5" height="8" rx="1" fill="#8a7a6e" />
        <rect x="18" y="169" width="28" height="6" rx="1.5" fill="#2b231f" />
        {/* kettle on the stove top */}
        <path d="M24 120c0-7 4-10 8-10s8 3 8 10z" fill="#c2532f" />
        <rect x="30" y="107" width="4" height="3" rx="1" fill="#2b231f" />
        <path d="M40 115l5-4" stroke="#c2532f" strokeWidth="2.2" strokeLinecap="round" />
        {/* firewood */}
        <g>
          <rect x="2" y="184" width="16" height="5" rx="2.5" fill="#8a5a33" />
          <rect x="4" y="179" width="14" height="5" rx="2.5" fill="#9c6a3e" />
          <circle cx="3" cy="186.5" r="2.3" fill="#d9a066" />
          <circle cx="5" cy="181.5" r="2.3" fill="#d9a066" />
        </g>
      </Hot>

      {/* Couch */}
      <g>
        <rect x="92" y="104" width="160" height="56" rx="18" fill="url(#cozy-couch)" />
        <path d="M120 112v40M172 112v40M224 112v40" stroke="#b5672f" strokeWidth="1.6" opacity="0.7" />
        <rect x="96" y="140" width="152" height="30" rx="10" fill="#c97b3f" />
        <path d="M172 142v26" stroke="#a8602c" strokeWidth="1.6" />
        <rect x="82" y="122" width="26" height="54" rx="12" fill="#b5672f" />
        <rect x="236" y="122" width="26" height="54" rx="12" fill="#b5672f" />
        <rect x="92" y="176" width="5" height="10" rx="1.5" fill="#5e3a22" />
        <rect x="247" y="176" width="5" height="10" rx="1.5" fill="#5e3a22" />
        {/* cushions */}
        <rect x="108" y="116" width="34" height="30" rx="9" fill="#4b7b72" transform="rotate(-8 125 131)" />
        <circle cx="125" cy="131" r="2.4" fill="#34645c" />
        <rect x="146" y="118" width="32" height="28" rx="9" fill="#f3e1c4" transform="rotate(5 162 132)" />
        <path d="M150 127h24M150 132h24M150 137h24" stroke="#e8a838" strokeWidth="2" transform="rotate(5 162 132)" />
        {/* crocheted blanket over the right armrest */}
        <g transform="translate(212 116) rotate(6)">
          {GRANNY.map((c, i) => (
            <rect key={i} x={(i % 3) * 13} y={Math.floor(i / 3) * 13} width="12" height="12" rx="1.5" fill={c} />
          ))}
          {GRANNY.map((_, i) => (
            <rect key={`c${i}`} x={(i % 3) * 13 + 4} y={Math.floor(i / 3) * 13 + 4} width="4" height="4" rx="1" fill="#fff6e6" opacity="0.8" />
          ))}
          <path d="M0 39l3 5 3-5 3 5 3-5 3 5 3-5 3 5 3-5 3 5 3-5 3 5 3-5" fill="none" stroke="#e8a838" strokeWidth="1.4" />
        </g>
      </g>

      {/* Floor lamp, in front of the couch's left arm */}
      <Hot
        on={interactive}
        label={lampOn ? tr('Lamp: switch off', 'Lampe: ausschalten') : tr('Lamp: switch on', 'Lampe: einschalten')}
        onAct={tapLamp}
        box={[42, 46, 74, 44]}
        extra={[70, 88, 16, 106]}
      >
      <g transform="translate(20 0)">
        <ellipse cx="58" cy="190" rx="16" ry="4" fill="#5e3a22" />
        <rect x="56" y="78" width="4" height="112" fill="#6e4528" />
        <path d="M34 50h48l10 30H24z" fill={lampOn ? '#f2b24f' : '#c98a3c'} />
        {lampOn && <path d="M34 50h48l10 30H24z" fill="#ffe2a4" opacity="0.45" />}
        {/* pull chain */}
        <path d="M70 80v14" stroke="#b08d57" strokeWidth="0.9" strokeDasharray="1.2 1" />
        <circle cx="70" cy="95.5" r="1.6" fill="#b08d57" />
        <path d="M24 80h68" stroke="#d98b2b" strokeWidth="2" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={26 + i * 5.8} y1="81" x2={26 + i * 5.8} y2="86" stroke="#d98b2b" strokeWidth="1.2" />
        ))}
      </g>
      </Hot>

      {/* Side table with a cup of tea and a book */}
      <g>
        <rect x="282" y="146" width="48" height="6" rx="2" fill="#8a5a33" />
        <rect x="288" y="152" width="4" height="36" fill="#6e4528" />
        <rect x="320" y="152" width="4" height="36" fill="#6e4528" />
        <Hot
          on={interactive && !!actions.onBooks}
          label={tr('Books: open your memory book', 'Bücher: dein Erinnerungsbuch aufschlagen')}
          onAct={() => wiggle('books', actions.onBooks)}
          box={[282, 128, 30, 20]}
        >
          <g className={wobble === 'books' ? 'cozy-wobble' : ''}>
            <rect x="286" y="140" width="22" height="6" rx="1" fill="#4b7b72" />
            <rect x="288" y="135" width="18" height="5" rx="1" fill="#d95d39" />
            <rect x="287" y="130" width="19" height="5" rx="1" fill="#e8a838" />
          </g>
        </Hot>
        <path d="M312 132h12v8a6 6 0 0 1-12 0z" fill="#fff6e6" />
        <path d="M324 134a3.5 3.5 0 0 1 0 7" fill="none" stroke="#fff6e6" strokeWidth="1.8" />
        <ellipse cx="318" cy="146" rx="9" ry="1.6" fill="#e9d2b0" />
        <path className="cozy-steam" d="M316 128c-3-4 3-6 0-10s3-6 0-9" fill="none" stroke="#b98b62" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        <path className="cozy-steam cozy-steam-2" d="M321 128c-3-4 3-6 0-10" fill="none" stroke="#b98b62" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
      </g>

      {/* The old tube TV on its cabinet: the way into the time travel. */}
      <Hot
        on={interactive && !!actions.onTv}
        label={tvLabel || tr('TV: start the time travel', 'Fernseher: Zeitreise starten')}
        onAct={tapTv}
        box={[334, 92, 64, 100]}
        hint
      >
        <rect x="336" y="156" width="60" height="30" rx="2" fill="#8a5a33" />
        <rect x="339" y="160" width="26" height="22" rx="1.5" fill="#9c6a3e" />
        <rect x="367" y="160" width="26" height="22" rx="1.5" fill="#9c6a3e" />
        <circle cx="362" cy="171" r="1.3" fill="#e9d2b0" />
        <circle cx="370" cy="171" r="1.3" fill="#e9d2b0" />
        <rect x="339" y="186" width="4" height="5" fill="#5e3a22" />
        <rect x="389" y="186" width="4" height="5" fill="#5e3a22" />
        <path d="M366 118l-13-22M368 118l13-22" stroke="#3a302b" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="353" cy="96" r="1.6" fill="#3a302b" />
        <circle cx="381" cy="96" r="1.6" fill="#3a302b" />
        <ellipse cx="367" cy="118.5" rx="6" ry="2.6" fill="#3a302b" />
        <rect x="340" y="119" width="54" height="38" rx="5" fill="#6e4528" />
        <rect x="340" y="119" width="54" height="2.5" rx="1" fill="#8a5a33" />
        <rect x="344" y="123" width="36" height="30" rx="7" fill="#26302c" />
        <g clipPath="url(#cozy-screen)">
          {tvOn ? (
            <rect className="cozy-tv-on" x="344" y="123" width="36" height="30" fill="#f6fbff" />
          ) : (
            <g className="cozy-tv-flicker" opacity="0.85">
              {['#e6e6e6', '#e8d23c', '#3cc6d0', '#4cc04a', '#c84ac0', '#d0403c', '#3c4ad0'].map((c, i) => (
                <rect key={c} x={344 + i * (36 / 7)} y="123" width={36 / 7 + 0.2} height="22" fill={c} />
              ))}
              <rect x="344" y="145" width="36" height="8" fill="#1c1c22" />
              <circle cx="362" cy="138" r="7" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
            </g>
          )}
          <path d="M346 126c6-2 14-2 20 0" stroke="#ffffff" strokeWidth="1.6" opacity="0.25" fill="none" />
        </g>
        <circle cx="387" cy="129" r="2.6" fill="#e9d2b0" />
        <circle cx="387" cy="137" r="2.6" fill="#e9d2b0" />
        <path d="M387 127v2.4M387 135v2.4" stroke="#6e4528" strokeWidth="0.9" />
        <rect x="384" y="143" width="6" height="1.2" fill="#3a302b" />
        <rect x="384" y="146" width="6" height="1.2" fill="#3a302b" />
        <rect x="384" y="149" width="6" height="1.2" fill="#3a302b" />
      </Hot>

      {/* Lamplight: in the evening the room dims a little and the lamp pours
          warm light over the couch; by day it only glows softly. */}
      <g pointerEvents="none">
        {dark > 0 && <rect width="400" height="220" fill="#3b1f10" opacity={dark} />}
        {lampOn && (
          <>
            <path d="M54 84L10 220h150L102 84z" fill="#ffd27a" opacity={lit ? 0.16 : 0.06} style={{ mixBlendMode: 'screen' }} />
            <circle
              className="cozy-glow"
              cx="78"
              cy="68"
              r={lit ? 130 : 80}
              fill="url(#cozy-glow)"
              opacity={lit ? 0.9 : 0.45}
              style={{ mixBlendMode: 'screen' }}
            />
          </>
        )}
        {fire && (
          <circle className="cozy-fire-glow" cx="32" cy="150" r={evening ? 70 : 50} fill="url(#cozy-fire-glow)" opacity={evening ? 1 : 0.6} style={{ mixBlendMode: 'screen' }} />
        )}
        {tvOn && <circle cx="362" cy="138" r="60" fill="url(#cozy-tv-glow)" style={{ mixBlendMode: 'screen' }} />}
      </g>

      {/* The cat, curled up asleep on the rug; it purrs when stroked. */}
      <Hot
        on={interactive}
        label={tr('Cat: stroke it', 'Katze: streicheln')}
        onAct={tapCat}
        box={[150, 168, 78, 36]}
      >
      <g className="cozy-cat">
        <path className="cozy-tail" d="M198 196c10 4 22 2 24-6" fill="none" stroke="#6b5446" strokeWidth="5" strokeLinecap="round" />
        <ellipse className="cozy-cat-body" cx="182" cy="192" rx="20" ry="10" fill="#6b5446" />
        <path d="M172 186c3 2 5 2 8 0M182 184c3 2 5 2 8 0" stroke="#87705f" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="164" cy="190" r="8" fill="#6b5446" />
        <path d="M158 184l1-8 5 5zM166 182l4-7 2 7z" fill="#6b5446" />
        {awake ? (
          <>
            <ellipse cx="161.5" cy="190" rx="1.3" ry="1.6" fill="#e8c34a" />
            <ellipse cx="167.5" cy="190" rx="1.3" ry="1.6" fill="#e8c34a" />
          </>
        ) : (
          <path d="M159.5 190.5q2 1.5 4 0M165.5 190.5q2 1.5 4 0" stroke="#3c2e25" strokeWidth="1" fill="none" strokeLinecap="round" />
        )}
      </g>
      {awake ? (
        <g key={petted} className="cozy-hearts" fill="#e0472a" stroke="#fff6e6" strokeWidth="0.8">
          <path d="M158 174c-3-4.5-9-1.5-6 3l6 6 6-6c3-4.5-3-7.5-6-3z" />
          <path className="cozy-heart-2" d="M174 168c-2.4-3.6-7.2-1.2-4.8 2.4l4.8 4.8 4.8-4.8c2.4-3.6-2.4-6-4.8-2.4z" />
        </g>
      ) : (
        interactive && (
          <g className="cozy-zzz" fill="#6b5446" fontFamily="Georgia, serif" fontStyle="italic">
            <text x="150" y="178" fontSize="7">z</text>
            <text x="145" y="170" fontSize="9">z</text>
          </g>
        )
      )}
      </Hot>
    </svg>
  );
};
