import React, { useEffect, useRef, useState } from 'react';
import { MantelClock } from './MantelClock';
import { startTicking, playWarp, playThunder, WARP_SECONDS } from '../lib/clockSounds';
import { useMuted } from '../lib/mute';
import { LoudSign } from './LoudSign';
import { tr } from '../lib/i18n';
import { PRIVACY_URL, setConsent, useConsent } from '../lib/privacy';
import { TimeCircuitRow, type Stamp } from './ArrivalShow';

// After the start button the time machine pulls you in (Marco, 2026-10-14):
// everything spirals into the clock's face while rings rush towards its
// centre (WARP_MS), a bright light swallows the screen as the gong strikes
// (FLASH_MS), and the light opens from the middle like an iris onto what
// lies on the other side, the time machine's ticket or the living room
// (IRIS_MS). The sound to it is lib/clockSounds playWarp.
const WARP_MS = WARP_SECONDS * 1000;
const FLASH_MS = 320;
const IRIS_MS = 1700;
// Without motion: a calm fade through the light instead.
const CALM_WARP_MS = 500;
// How long the "the clock is running" note stays after the first tap.
const HEARD_NOTE_MS = 6000;
// The speed the time machine needs, reached as the warp swallows everything.
const TIME_SPEED = 88;

// A time-travel film's look for the welcome screen (Marco, 2026-10-18: "viel
// mehr dem Thema entsprechend … gerne dem Film zurück in die Zukunft
// entsprechend", "animierte Blitze dürfen natürlich nicht fehlen"): lightning
// over the clock, a chrome-and-fire title, time circuits showing where the
// journey goes, a flux button whose speedometer races to 88 and leaves two
// trails of fire. Only the mood is borrowed, no logo, font or film picture.

// Where in its cycle a bolt flashes (the rmBolt keyframes in index.css), and
// how far away each one sounds: bolt a strikes the clock, b and c are farther.
const FLASH_AT = 0.81;
const BOLT_DISTANCE = { a: 0, b: 0.6, c: 0.9 } as const;

/**
 * Lightning: three bolts flicker now and then (one strikes the clock) and
 * light up the room, each with its thunder; during the warp they strike
 * non-stop (the warp's own sound carries that part, so no thunder then).
 */
const Storm: React.FC<{ thunder: boolean }> = ({ thunder }) => {
  const thunderRef = useRef(thunder);
  thunderRef.current = thunder;
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // Each cycle of a flash's animation: thunder at the moment it lights up.
  const onCycle = (bolt: keyof typeof BOLT_DISTANCE) => (e: React.AnimationEvent<HTMLSpanElement>) => {
    const seconds = parseFloat(getComputedStyle(e.currentTarget).animationDuration) || 0;
    timers.current.push(
      window.setTimeout(() => thunderRef.current && playThunder(BOLT_DISTANCE[bolt]), seconds * FLASH_AT * 1000),
    );
  };
  return (
  <div aria-hidden="true" className="rm-storm">
    {(['a', 'b', 'c'] as const).map((b) => (
      <span key={b} className={`rm-sky-flash is-${b}`} onAnimationStart={onCycle(b)} onAnimationIteration={onCycle(b)} />
    ))}
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMin slice" className="rm-storm-bolts">
      <g className="rm-bolt is-a">
        <path d="M520 -10 L494 90 L534 112 L478 210 L520 228 L496 330" />
        <path d="M534 112 L590 160 L576 196 L626 250" />
      </g>
      <g className="rm-bolt is-b">
        <path d="M150 -10 L196 110 L150 140 L232 270 L190 290 L262 430" />
        <path d="M150 140 L96 230 L118 262 L70 340" />
      </g>
      <g className="rm-bolt is-c">
        <path d="M880 -10 L842 96 L890 126 L800 250 L846 272 L772 400" />
        <path d="M890 126 L940 210 L912 236 L960 320" />
      </g>
    </svg>
  </div>
  );
};

/** The flux button's emblem: three glowing tubes meeting in the middle, light running inwards. */
const FluxIcon: React.FC = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="rm-flux-icon">
    <rect x="2" y="2" width="44" height="44" rx="6" className="rm-flux-box" />
    <g className="rm-flux-tubes">
      <path d="M10 10 L24 25" />
      <path d="M38 10 L24 25" />
      <path d="M24 42 L24 25" />
    </g>
    <g className="rm-flux-glow">
      <path d="M10 10 L24 25" />
      <path d="M38 10 L24 25" />
      <path d="M24 42 L24 25" />
    </g>
    <circle cx="24" cy="25" r="3.2" className="rm-flux-core" />
  </svg>
);

function toStamp(date?: string): Stamp | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date ?? '');
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3]) };
}

// The very first thing anyone sees, on top of the whole app (and the
// BootOverlay dissolve reveals it, rather than the intro card underneath).
// Purely a local greeting gate — not part of the persisted session phase —
// so it appears again on every fresh page load. The mantel clock ticks the
// whole time (lib/clockSounds.ts). The screen looks the same in every design
// (.rm-tm-*, .rm-flux-start, .rm-storm in index.css).
// onReveal fires as the white starts giving way to the main menu (music
// begins there), onStart once the splash is gone.
export const SplashScreen: React.FC<{
  onStart: () => void;
  onReveal?: () => void;
  /** "YYYY-MM-DD" of the birthday, when known: the time circuits' destination. */
  destinationDate?: string;
}> = ({ onStart, onReveal, destinationDate }) => {
  const [struck, setStruck] = useState(false);
  // 'warp' while being pulled in, 'flash' in the light, 'iris' while it opens.
  const [stage, setStage] = useState<'idle' | 'warp' | 'flash' | 'iris'>('idle');
  const [waitingForTouch, setWaitingForTouch] = useState(false);
  // After the tap that unlocks sound, a short note pulses with every tick, so
  // the tap gets a visible answer even on a phone set to silent.
  const [heard, setHeard] = useState(false);
  const [beat, setBeat] = useState(0);
  const wasWaiting = useRef(false);
  const heardRef = useRef(false);
  const muted = useMuted();
  // The music question lives here, before the journey starts, instead of
  // popping up later in the middle of the form (MusicConsentBanner stays as
  // the fallback for anyone who leaves the switch alone).
  const musicAllowed = useConsent('spotify') === true;
  const [mph, setMph] = useState(0);
  const destination = toStamp(destinationDate);
  const now = new Date();
  const present: Stamp = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (struck) return;
    return startTicking(
      (waiting) => {
        if (wasWaiting.current && !waiting) {
          heardRef.current = true;
          setHeard(true);
        }
        wasWaiting.current = waiting;
        setWaitingForTouch(waiting);
      },
      () => { if (heardRef.current) setBeat((b) => b + 1); },
    );
  }, [struck]);

  useEffect(() => {
    if (!heard) return;
    const t = setTimeout(() => { heardRef.current = false; setHeard(false); }, HEARD_NOTE_MS);
    return () => clearTimeout(t);
  }, [heard]);

  const handleStart = () => {
    if (struck) return;
    setStruck(true);
    setStage('warp');
    playWarp();
    const warp = reduceMotion ? CALM_WARP_MS : WARP_MS;
    // The speedometer: slow off the line, then faster and faster up to 88.
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / (warp * 0.85));
      setMph(Math.round(TIME_SPEED * k * k));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    setTimeout(() => setStage('flash'), warp);
    setTimeout(() => {
      setStage('iris');
      onReveal?.();
    }, warp + FLASH_MS);
    setTimeout(onStart, warp + FLASH_MS + IRIS_MS);
  };

  return (
    <div
      className={`splash-screen fixed inset-0 z-[900] overflow-hidden ${stage === 'iris' ? '' : 'rm-night-room'} ${
        struck ? 'pointer-events-none' : 'animate-fadeIn'
      } ${stage === 'warp' && !reduceMotion ? 'is-warping' : ''}`}
    >
      {stage !== 'iris' && (
      <>
      <div className="grainy-bg" />
      <div className="mantel-clock-wrapper absolute top-1/2 left-1/2 w-[140vmin] h-[100vmin] max-w-[1400px] max-h-[1000px] opacity-60 pointer-events-none">
        <MantelClock className="w-full h-full" rewinding={stage === 'warp'} />
      </div>
      {stage === 'warp' && !reduceMotion && (
        <div aria-hidden="true" className="splash-vortex">
          <div className="splash-swirl" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="splash-ring" style={{ animationDelay: `${i * 0.16}s` }} />
          ))}
          <div className="splash-core" />
        </div>
      )}
      <Storm thunder={!struck && !reduceMotion} />
      <div className="splash-content relative h-full flex flex-col items-center justify-center text-center px-6">
      <h1 className="rm-tm-title relative">
        <span className="rm-tm-welcome">{tr('Welcome to', 'Willkommen bei')}</span>
        <span className="rm-tm-logo">
          <span className="rm-tm-logo-rim">RetroMind</span>
          <span aria-hidden="true" className="rm-tm-logo-edge">RetroMind</span>
          <span aria-hidden="true" className="rm-tm-logo-fill">RetroMind</span>
        </span>
        <span aria-hidden="true" className="rm-tm-streak" />
      </h1>
      <p className="rm-tm-sub relative">
        {tr('The ticket to your past', 'Die Fahrkarte in deine Vergangenheit')}
      </p>
      <div className="rm-tc rm-tc-mini relative" aria-label={tr('Time circuits', 'Zeitschaltkreise')} role="group">
        <TimeCircuitRow label={tr('Destination time', 'Zielzeit')} stamp={destination} tone="red" />
        <TimeCircuitRow label={tr('Present time', 'Gegenwart')} stamp={present} tone="green" />
      </div>
      <div className="splash-start-row relative">
        <button
          onClick={handleStart}
          disabled={struck}
          className={`rm-flux-start relative ${mph >= 88 ? 'is-88' : ''}`}
          data-quiet
        >
          <FluxIcon />
          <span className="rm-flux-text">
            <span className="rm-flux-label">{tr('Go back in time', 'Ab in die Vergangenheit')}</span>
            <span className="rm-flux-speed" aria-hidden="true">
              <b>{String(mph).padStart(2, '0')}</b> MPH
            </span>
          </span>
        </button>
        <LoudSign show={!muted && !struck} />
      </div>
      <p
        aria-live="polite"
        className={`relative mt-6 text-sm text-[#c9ab78]/80 transition-opacity duration-500 ${
          (waitingForTouch || heard) && !muted && !struck ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {heard ? (
          <>
            <span key={beat} aria-hidden="true" className="inline-block animate-[tickPulse_0.3s_ease-out]">🔊</span>{' '}
            {tr('Tick, tock … the clock is running. No sound? Turn your volume up.', 'Tick, tack … die Uhr läuft. Nichts zu hören? Stell den Ton lauter.')}
          </>
        ) : (
          tr('🔊 Tap anywhere on the screen to hear the clock tick.', '🔊 Tippe irgendwo auf den Bildschirm, um die Uhr ticken zu hören.')
        )}
      </p>
      <div className="relative mt-4 flex flex-col items-center gap-1 max-w-xs">
        <button
          type="button"
          role="switch"
          aria-checked={musicAllowed}
          disabled={struck}
          onClick={() => setConsent('spotify', !musicAllowed)}
          className="flex items-center gap-3 rounded-full border border-[#c9ab78]/50 bg-black/30 pl-4 pr-2 py-2 text-sm font-semibold text-[#f1dfb8] hover:bg-black/45"
        >
          <span>🎵 {tr('Real hits of your decade', 'Echte Hits deines Jahrzehnts')}</span>
          <span
            aria-hidden="true"
            className={`relative w-11 h-6 rounded-full transition-colors ${musicAllowed ? 'bg-[#bf4b28]' : 'bg-[#5a4630]'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#f7ecd6] transition-transform ${musicAllowed ? 'translate-x-5' : ''}`} />
          </span>
        </button>
        <p className="text-xs leading-snug text-[#c9ab78]/80">
          {tr(
            'The music comes from Spotify. Only once you switch it on does Spotify get your IP address and may set cookies.',
            'Die Musik kommt von Spotify. Erst wenn du sie einschaltest, bekommt Spotify deine IP-Adresse und kann Cookies setzen.'
          )}{' '}
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="underline">
            {tr('Privacy', 'Datenschutz')}
          </a>
        </p>
      </div>
      </div>
      {mph >= 88 && !reduceMotion && (
        <div aria-hidden="true" className="rm-fire-trails">
          <span />
          <span />
        </div>
      )}
      </>
      )}
      {(stage === 'flash' || stage === 'iris' || (stage === 'warp' && reduceMotion)) && (
        <div
          aria-hidden="true"
          className={`rm-time-light fixed inset-0 pointer-events-none ${stage === 'iris' ? 'rm-iris-open' : ''}`}
          style={
            stage === 'iris'
              ? { animationDuration: `${IRIS_MS}ms` }
              : { animation: `splashWhiteIn ${reduceMotion ? CALM_WARP_MS : FLASH_MS}ms ease-out forwards` }
          }
        />
      )}
    </div>
  );
};
