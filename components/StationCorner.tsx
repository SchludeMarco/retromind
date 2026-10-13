import React, { useEffect, useRef, useState } from 'react';
import { AppPhase } from '../types';
import { tr } from '../lib/i18n';
import { Hot } from './CozyRoom';
import { playClick, playCrackle, playPurr, playTvOn } from '../lib/roomSounds';

// A corner of the Stube at the top of every station of the journey (Marco,
// 2026-10-13: the living room should carry through the whole app, not only
// the start page). Each station gets its own piece of furniture from the
// same room, with the same wallpaper and floorboards, and the cat has come
// along and naps in a corner: an armchair by the coat rack for the profile,
// the old TV for the impressions, the record player for exploring, the
// writing desk for the diary, the bookshelf for the memory book and a cake
// with a candle for the wrap-up. One thing in each corner can be touched,
// with a little sound (lib/roomSounds.ts); so can the cat. Animations stop
// for reduced motion (index.css, .cozy-room).

type Scene = Exclude<AppPhase, 'intro'>;

const WALL_H = 88;

const Room: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <defs>
      <pattern id="corner-wallpaper" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#f2dcbc" />
        <rect width="12" height="24" fill="#efd5b2" />
        <circle cx="18" cy="6" r="1.6" fill="#e2b98a" />
        <circle cx="6" cy="18" r="1.6" fill="#e9c79c" />
      </pattern>
      <linearGradient id="corner-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a8693e" />
        <stop offset="1" stopColor="#8c5430" />
      </linearGradient>
      <linearGradient id="corner-chair" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d48a4b" />
        <stop offset="1" stopColor="#b5672f" />
      </linearGradient>
      <radialGradient id="corner-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffd88a" stopOpacity="0.8" />
        <stop offset="1" stopColor="#ffb85c" stopOpacity="0" />
      </radialGradient>
      <clipPath id="corner-screen">
        <rect x="170" y="33" width="50" height="36" rx="8" />
      </clipPath>
    </defs>
    <rect width="400" height={WALL_H} fill="url(#corner-wallpaper)" />
    <rect y="14" width="400" height="3" fill="#c9965f" opacity="0.6" />
    <rect y={WALL_H} width="400" height={110 - WALL_H} fill="url(#corner-floor)" />
    <line x1="0" y1="99" x2="400" y2="99" stroke="#7a4626" strokeWidth="0.8" opacity="0.5" />
    {[60, 150, 240, 330].map((x) => (
      <line key={x} x1={x} y1={WALL_H} x2={x} y2="99" stroke="#7a4626" strokeWidth="0.8" opacity="0.4" />
    ))}
    <rect y={WALL_H - 6} width="400" height="6" fill="#7f4a29" />
    <rect y={WALL_H - 6} width="400" height="1.5" fill="#a46a43" />
    {children}
  </>
);

/** The cat, asleep in the corner; it purrs and sends up a heart when stroked. */
const Cat: React.FC<{ x: number }> = ({ x }) => {
  const [petted, setPetted] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const awake = petted > 0;
  return (
    <Hot
      on
      label={tr('Cat: stroke it', 'Katze: streicheln')}
      onAct={() => {
        playPurr();
        setPetted((n) => n + 1);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setPetted(0), 2600);
      }}
      box={[x - 30, 78, 66, 28]}
    >
      <g transform={`translate(${x - 182} -96)`}>
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
        {awake && (
          <g key={petted} className="cozy-hearts" fill="#e0472a" stroke="#fff6e6" strokeWidth="0.8">
            <path d="M160 174c-3-4.5-9-1.5-6 3l6 6 6-6c3-4.5-3-7.5-6-3z" />
          </g>
        )}
      </g>
    </Hot>
  );
};

// Profile: an armchair waiting for you, with a coat rack by the door.
const Armchair: React.FC = () => {
  const [hat, setHat] = useState(0);
  return (
    <>
      <Hot
        on
        label={tr('Hat: hang it up', 'Hut: aufhängen')}
        onAct={() => {
          playClick();
          setHat((n) => n + 1);
        }}
        box={[72, 6, 50, 98]}
      >
        <rect x="95" y="16" width="4" height="86" fill="#6e4528" />
        <ellipse cx="97" cy="102" rx="14" ry="3" fill="#5e3a22" />
        <path d="M86 26h22M84 30l-6 4M110 30l6 4" stroke="#6e4528" strokeWidth="2.5" strokeLinecap="round" />
        <g key={hat} className={hat ? 'cozy-wobble' : ''}>
          <ellipse cx="97" cy="20" rx="15" ry="3" fill="#4b3a2e" />
          <path d="M88 20c0-9 3-12 9-12s9 3 9 12z" fill="#5c4738" />
          <rect x="88" y="16" width="18" height="2.5" fill="#c2532f" />
        </g>
        <path d="M80 34c-3 14-1 24 3 32l6-1c-3-9-4-19-2-30z" fill="#4b7b72" />
        <path d="M80 62l3 8M84 61l2 9" stroke="#34645c" strokeWidth="1.4" />
      </Hot>
      <g>
        <rect x="160" y="30" width="80" height="54" rx="16" fill="url(#corner-chair)" />
        <path d="M200 36v40" stroke="#b5672f" strokeWidth="1.6" opacity="0.7" />
        <rect x="154" y="72" width="92" height="22" rx="8" fill="#c97b3f" />
        <rect x="144" y="56" width="22" height="44" rx="10" fill="#b5672f" />
        <rect x="234" y="56" width="22" height="44" rx="10" fill="#b5672f" />
        <rect x="150" y="98" width="5" height="8" rx="1.5" fill="#5e3a22" />
        <rect x="245" y="98" width="5" height="8" rx="1.5" fill="#5e3a22" />
        <rect x="186" y="48" width="30" height="26" rx="8" fill="#f3e1c4" transform="rotate(-6 201 61)" />
        <path d="M190 56h22M190 61h22M190 66h22" stroke="#e8a838" strokeWidth="2" transform="rotate(-6 201 61)" />
      </g>
      {/* a framed "Home sweet home" stitch on the wall */}
      <rect x="282" y="26" width="46" height="34" rx="2" fill="#c99a4c" />
      <rect x="286" y="30" width="38" height="26" fill="#fff6e6" />
      <path d="M305 40c-2-3-6-1-4 2l4 4 4-4c2-3-2-5-4-2z" fill="#d95d39" />
      <path d="M292 50h26" stroke="#4b7b72" strokeWidth="1.4" strokeDasharray="2 1.5" />
    </>
  );
};

// Impressions: the old TV; each tap turns to another channel.
const CHANNELS = 4;
const Tv: React.FC = () => {
  const [channel, setChannel] = useState(0);
  return (
    <>
      <rect x="156" y="74" width="88" height="26" rx="2" fill="#8a5a33" />
      <rect x="160" y="78" width="38" height="18" rx="1.5" fill="#9c6a3e" />
      <rect x="202" y="78" width="38" height="18" rx="1.5" fill="#9c6a3e" />
      <rect x="160" y="100" width="4" height="6" fill="#5e3a22" />
      <rect x="236" y="100" width="4" height="6" fill="#5e3a22" />
      <Hot
        on
        label={tr('TV: switch the channel', 'Fernseher: umschalten')}
        onAct={() => {
          playTvOn();
          setChannel((c) => (c + 1) % CHANNELS);
        }}
        box={[160, 4, 80, 72]}
        hint
      >
        <path d="M199 28l-13-22M201 28l13-22" stroke="#3a302b" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="186" cy="6" r="1.6" fill="#3a302b" />
        <circle cx="214" cy="6" r="1.6" fill="#3a302b" />
        <rect x="164" y="28" width="72" height="46" rx="6" fill="#6e4528" />
        <rect x="170" y="33" width="50" height="36" rx="8" fill="#26302c" />
        <g clipPath="url(#corner-screen)" key={channel} className="cozy-tv-switch">
          {channel === 0 &&
            ['#e6e6e6', '#e8d23c', '#3cc6d0', '#4cc04a', '#c84ac0', '#d0403c', '#3c4ad0'].map((c, i) => (
              <rect key={c} x={170 + i * (50 / 7)} y="33" width={50 / 7 + 0.2} height="28" fill={c} />
            ))}
          {channel === 0 && <rect x="170" y="61" width="50" height="8" fill="#1c1c22" />}
          {channel === 1 && (
            <>
              <rect x="170" y="33" width="50" height="36" fill="#9fd0e8" />
              <circle cx="206" cy="44" r="5" fill="#ffe08a" />
              <path d="M170 62q12-10 25-3t25-4v14h-50z" fill="#6f9a7c" />
            </>
          )}
          {channel === 2 && (
            <>
              <rect x="170" y="33" width="50" height="36" fill="#2a2a55" />
              <circle cx="194" cy="48" r="7" fill="#fff3c4" />
              <path d="M188 58l6-5 6 5" stroke="#ffffff" strokeWidth="1" fill="none" />
            </>
          )}
          {channel === 3 && (
            <g className="cozy-tv-flicker">
              {Array.from({ length: 9 }, (_, i) => (
                <rect key={i} x="170" y={33 + i * 4} width="50" height="2" fill={i % 2 ? '#d6d6d6' : '#8f8f8f'} />
              ))}
            </g>
          )}
          <path d="M172 36c7-2 16-2 22 0" stroke="#ffffff" strokeWidth="1.6" opacity="0.25" fill="none" />
        </g>
        <circle cx="228" cy="40" r="3" fill="#e9d2b0" />
        <circle cx="228" cy="50" r="3" fill="#e9d2b0" />
        <rect x="224" y="58" width="8" height="1.2" fill="#3a302b" />
        <rect x="224" y="61" width="8" height="1.2" fill="#3a302b" />
      </Hot>
      {/* a vase of dried flowers beside it */}
      <path d="M262 82h14l-2 22h-10z" fill="#4b7b72" />
      <path d="M269 82c-2-14-8-20-12-22M269 82c0-16 2-24 6-30M269 82c2-12 8-18 12-19" stroke="#8a6a3e" strokeWidth="1.2" fill="none" />
      <circle cx="257" cy="60" r="3" fill="#e8a838" />
      <circle cx="275" cy="52" r="3" fill="#d95d39" />
      <circle cx="281" cy="63" r="3" fill="#f3e1c4" />
    </>
  );
};

// Exploring: a record player on the sideboard; a tap drops the needle.
const RecordPlayer: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <rect x="132" y="66" width="136" height="34" rx="3" fill="#8a5a33" />
      <rect x="136" y="70" width="62" height="26" rx="2" fill="#9c6a3e" />
      <rect x="202" y="70" width="62" height="26" rx="2" fill="#9c6a3e" />
      <circle cx="194" cy="83" r="1.4" fill="#e9d2b0" />
      <circle cx="206" cy="83" r="1.4" fill="#e9d2b0" />
      <rect x="138" y="100" width="5" height="6" fill="#5e3a22" />
      <rect x="257" y="100" width="5" height="6" fill="#5e3a22" />
      <Hot
        on
        label={playing ? tr('Record player: stop', 'Plattenspieler: anhalten') : tr('Record player: drop the needle', 'Plattenspieler: Nadel auflegen')}
        onAct={() => {
          if (!playing) playCrackle();
          else playClick();
          setPlaying((p) => !p);
        }}
        box={[160, 30, 84, 38]}
        hint={!playing}
      >
        <rect x="164" y="54" width="76" height="12" rx="2" fill="#5c4738" />
        <rect x="164" y="54" width="76" height="2" fill="#7a5f4c" />
        <ellipse cx="196" cy="52" rx="26" ry="6" fill="#1c1411" />
        <ellipse cx="196" cy="52" rx="18" ry="4" fill="none" stroke="#3a302b" strokeWidth="0.6" />
        <ellipse cx="196" cy="52" rx="7" ry="1.8" fill="#d95d39" />
        <g className={playing ? 'cozy-spin' : ''}>
          <path d="M180 50.5c4-1.5 10-2 14-2" stroke="#ffffff" strokeWidth="0.8" opacity="0.35" fill="none" />
        </g>
        <path d={playing ? 'M232 46l-14 4' : 'M232 46l-2 10'} stroke="#c9c2b8" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="232" cy="46" r="2.6" fill="#8a7a6e" />
        {playing && (
          <g className="cozy-notes" fill="#6b4428">
            <path d="M206 36v-9l6-1.5v9" stroke="#6b4428" strokeWidth="1.2" fill="none" />
            <circle cx="204.5" cy="36" r="2" />
            <circle cx="210.5" cy="34.5" r="2" />
            <path className="cozy-heart-2" d="M184 32v-8" stroke="#6b4428" strokeWidth="1.2" />
            <circle className="cozy-heart-2" cx="182.5" cy="32" r="2" />
          </g>
        )}
      </Hot>
      {/* records leaning against the wall */}
      {[
        ['#d95d39', 276],
        ['#4b7b72', 284],
        ['#e8a838', 292],
      ].map(([c, x]) => (
        <rect key={x} x={x as number} y="56" width="34" height="34" rx="1" fill={c as string} transform={`rotate(${((x as number) - 284) / 2} ${(x as number) + 17} 90)`} />
      ))}
      <circle cx="309" cy="73" r="10" fill="#1c1411" opacity="0.85" />
      {/* a poster on the wall */}
      <rect x="60" y="22" width="40" height="52" rx="1" fill="#f3e1c4" />
      <circle cx="80" cy="42" r="12" fill="#1c1411" />
      <circle cx="80" cy="42" r="4" fill="#e8a838" />
      <path d="M66 62h28M70 67h20" stroke="#c2532f" strokeWidth="2" />
    </>
  );
};

// Diary: a writing desk with an open diary and a green banker's lamp.
const Desk: React.FC = () => {
  const [lampOn, setLampOn] = useState(true);
  return (
    <>
      {lampOn && <circle cx="246" cy="44" r="70" fill="url(#corner-glow)" opacity="0.7" pointerEvents="none" style={{ mixBlendMode: 'screen' }} />}
      <rect x="128" y="62" width="144" height="7" rx="2" fill="#8a5a33" />
      <rect x="134" y="69" width="5" height="37" fill="#6e4528" />
      <rect x="261" y="69" width="5" height="37" fill="#6e4528" />
      <rect x="196" y="69" width="66" height="16" rx="1" fill="#9c6a3e" />
      <circle cx="229" cy="77" r="1.5" fill="#e9d2b0" />
      {/* the diary, open, with a fountain pen */}
      <path d="M156 60l22-4 22 4v2h-44z" fill="#fff6e6" />
      <path d="M178 56v6" stroke="#d9c5a5" strokeWidth="0.8" />
      <path d="M160 58.5l14-2.4M160 60.5l14-2.4M182 56.1l14 2.4M182 58.1l14 2.4" stroke="#b9a58f" strokeWidth="0.5" />
      <path d="M154 61h48" stroke="#a43716" strokeWidth="2" />
      <path d="M204 59l18-6" stroke="#2a1a10" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M204 59l3-1" stroke="#e8a838" strokeWidth="1.8" strokeLinecap="round" />
      <Hot
        on
        label={lampOn ? tr('Desk lamp: switch off', 'Schreibtischlampe: ausschalten') : tr('Desk lamp: switch on', 'Schreibtischlampe: einschalten')}
        onAct={() => {
          playClick();
          setLampOn((v) => !v);
        }}
        box={[226, 22, 42, 40]}
      >
        <ellipse cx="248" cy="60" rx="10" ry="2.5" fill="#c99a4c" />
        <rect x="246.5" y="40" width="3" height="20" fill="#c99a4c" />
        <path d="M230 40c0-8 8-12 18-12s18 4 18 12z" fill={lampOn ? '#3f8a5c' : '#2e5e42'} />
        {lampOn && <ellipse cx="248" cy="40.5" rx="15" ry="1.8" fill="#fff1b8" />}
      </Hot>
      {/* a chair tucked in */}
      <path d="M112 30v74M112 66h30v6h-30" stroke="#6e4528" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M142 72v32" stroke="#6e4528" strokeWidth="4" strokeLinecap="round" />
      {/* a calendar on the wall */}
      <rect x="300" y="24" width="34" height="40" rx="1" fill="#fff6e6" />
      <rect x="300" y="24" width="34" height="10" fill="#d95d39" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={304 + (i % 4) * 7} y={38 + Math.floor(i / 4) * 8} width="4" height="4" fill={i === 6 ? '#d95d39' : '#d9c5a5'} />
      ))}
    </>
  );
};

// Memory book: the bookshelf; a tap pulls a book out a little.
const SPINES = [
  ['#d95d39', 10], ['#4b7b72', 8], ['#e8a838', 11], ['#a43716', 7], ['#f3e1c4', 9], ['#6f9a7c', 10], ['#c2532f', 8], ['#5c4738', 12],
] as const;
const Shelf: React.FC = () => {
  const [pulled, setPulled] = useState<number | null>(null);
  const tap = () => {
    playClick();
    setPulled((p) => ((p ?? -1) + 3) % SPINES.length);
  };
  const row = (y: number, h: number, offset: number) => {
    let x = 152;
    return SPINES.map(([c, w], i) => {
      const at = x;
      x += w + 1.5;
      const idx = (i + offset) % SPINES.length;
      const out = offset === 0 && pulled === idx;
      return <rect key={`${y}-${i}`} x={at} y={y - h + (i % 3)} width={w} height={h - (i % 3)} rx="1" fill={SPINES[idx][0]} transform={out ? 'translate(0 -5)' : undefined} />;
    });
  };
  return (
    <>
      <Hot on label={tr('Bookshelf: pull out a book', 'Bücherregal: ein Buch herausziehen')} onAct={tap} box={[144, 8, 112, 98]} hint={pulled === null}>
        <rect x="144" y="8" width="112" height="98" rx="2" fill="#6e4528" />
        <rect x="148" y="12" width="104" height="90" fill="#4d3020" />
        {row(38, 22, 0)}
        {row(66, 22, 3)}
        <rect x="152" y="80" width="36" height="14" rx="1.5" fill="#c99a4c" />
        <rect x="155" y="83" width="30" height="8" rx="1" fill="#f3e1c4" />
        <path d="M166 87c-1.5-2-4-1-3 1l3 3 3-3c1-2-1.5-3-3-1z" fill="#d95d39" />
        {row(94, 14, 5).slice(0, 4).map((r, i) => React.cloneElement(r, { key: `b${i}`, x: 194 + i * 12 }))}
        {[38, 66, 94].map((y) => (
          <rect key={y} x="148" y={y} width="104" height="4" fill="#8a5a33" />
        ))}
      </Hot>
      {/* a reading armchair corner and a framed photo */}
      <rect x="64" y="30" width="44" height="34" rx="2" fill="#c99a4c" />
      <rect x="68" y="34" width="36" height="26" fill="#d8c3a5" />
      <circle cx="80" cy="44" r="5" fill="#9a7b62" />
      <circle cx="93" cy="45" r="4.5" fill="#9a7b62" />
      <path d="M72 60c1-7 5-9 8-9s6 2 7 6c1-3 4-5 6-5s5 2 6 8z" fill="#9a7b62" />
    </>
  );
};

// Wrap-up: a cake with a candle; a tap blows it out (and lights it again).
const Cake: React.FC = () => {
  const [lit, setLit] = useState(true);
  return (
    <>
      {/* bunting across the wall */}
      <path d="M20 4q90 12 180 2t180 4" stroke="#8a5a33" strokeWidth="1" fill="none" />
      {Array.from({ length: 11 }, (_, i) => {
        const x = 30 + i * 34;
        const y = 6 + (i < 6 ? i * 0.8 : (10 - i) * 0.8);
        return <path key={i} d={`M${x - 6} ${y}h12l-6 10z`} fill={['#d95d39', '#e8a838', '#4b7b72', '#f3e1c4'][i % 4]} />;
      })}
      <rect x="140" y="70" width="120" height="6" rx="2" fill="#8a5a33" />
      <rect x="150" y="76" width="5" height="30" fill="#6e4528" />
      <rect x="245" y="76" width="5" height="30" fill="#6e4528" />
      <ellipse cx="200" cy="70" rx="30" ry="3" fill="#fff6e6" />
      <Hot
        on
        label={lit ? tr('Candle: blow it out', 'Kerze: auspusten') : tr('Candle: light it again', 'Kerze: wieder anzünden')}
        onAct={() => {
          if (lit) playClick();
          else playCrackle();
          setLit((v) => !v);
        }}
        box={[176, 18, 48, 52]}
        hint={lit}
      >
        <rect x="180" y="50" width="40" height="18" rx="3" fill="#f3e1c4" />
        <rect x="180" y="56" width="40" height="4" fill="#d95d39" />
        <path d="M180 50q5 5 10 0t10 0 10 0 10 0" fill="#ffffff" />
        <rect x="198" y="36" width="4" height="14" rx="1" fill="#4b7b72" />
        <path d="M200 33v3" stroke="#2a1a10" strokeWidth="0.8" />
        {lit ? (
          <path className="cozy-flame" d="M200 22c-3 4-4 7-2 10 1 1 3 1 4 0 2-3 1-6-2-10z" fill="#ffb347" />
        ) : (
          <path className="cozy-steam" d="M200 30c-2-3 2-5 0-8s2-5 0-7" stroke="#b98b62" strokeWidth="1.2" fill="none" />
        )}
      </Hot>
      {/* two cups of tea */}
      <path d="M232 60h10v6a5 5 0 0 1-10 0z" fill="#fff6e6" />
      <path d="M242 62a3 3 0 0 1 0 5" stroke="#fff6e6" strokeWidth="1.5" fill="none" />
      <path d="M156 60h10v6a5 5 0 0 1-10 0z" fill="#fff6e6" />
      <path d="M156 62a3 3 0 0 0 0 5" stroke="#fff6e6" strokeWidth="1.5" fill="none" />
    </>
  );
};

const SCENES: Record<Scene, { label: string; cat: number; Scene: React.FC }> = {
  onboarding: { label: tr('An armchair by the coat rack', 'Ein Sessel an der Garderobe'), cat: 346, Scene: Armchair },
  induction: { label: tr('The old TV', 'Der alte Fernseher'), cat: 340, Scene: Tv },
  exploration: { label: tr('The record player on the sideboard', 'Der Plattenspieler auf der Anrichte'), cat: 360, Scene: RecordPlayer },
  diary: { label: tr('The writing desk', 'Der Schreibtisch'), cat: 66, Scene: Desk },
  book: { label: tr('The bookshelf', 'Das Bücherregal'), cat: 330, Scene: Shelf },
  finish: { label: tr('A cake for you', 'Ein Kuchen für dich'), cat: 320, Scene: Cake },
};

export const StationCorner: React.FC<{ phase: AppPhase; warm: boolean }> = ({ phase, warm }) => {
  if (phase === 'intro') return null;
  const { label, cat, Scene: Furniture } = SCENES[phase];
  return (
    <div className={`cozy-frame rounded-xl overflow-hidden max-w-2xl mx-auto mb-6 no-print ${warm ? '' : 'border-4 border-retro-ink'}`}>
      <svg
        viewBox="0 0 400 110"
        className="cozy-room is-interactive block w-full h-auto"
        role="group"
        aria-label={tr(`A corner of the living room: ${label}. Things in it can be tapped.`, `Eine Ecke der Stube: ${label}. Man kann darin etwas antippen.`)}
      >
        <Room>
          <Furniture />
          <Cat x={cat} />
        </Room>
      </svg>
    </div>
  );
};
