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
const BOLTS = {
  a: ['M520 -10 L494 90 L534 112 L478 210 L520 228 L496 330', 'M534 112 L590 160 L576 196 L626 250'],
  b: ['M150 -10 L196 110 L150 140 L232 270 L190 290 L262 430', 'M150 140 L96 230 L118 262 L70 340'],
  c: ['M880 -10 L842 96 L890 126 L800 250 L846 272 L772 400', 'M890 126 L940 210 L912 236 L960 320'],
} as const;

/**
 * Lightning: three bolts flicker now and then (one strikes the clock) and
 * light up the room, each with its thunder; during the warp they strike
 * non-stop (the warp's own sound carries that part, so no thunder then).
 */
const Storm = React.memo(({ thunder }: { thunder: boolean }) => {
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
    {/* Each flash is one layer, its bolt drawn inside it, so a flash only
        fades that layer instead of repainting the sky. */}
    {(['a', 'b', 'c'] as const).map((b) => (
      <span key={b} className={`rm-sky-flash is-${b}`} onAnimationStart={onCycle(b)} onAnimationIteration={onCycle(b)}>
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMin slice" className="rm-storm-bolts rm-bolt">
          {BOLTS[b].map((d) => <path key={d} d={d} />)}
        </svg>
      </span>
    ))}
  </div>
  );
});

/**
 * The pull into the clock, drawn on one canvas at screen size (Marco,
 * 2026-10-19: the start asked so much of the graphics chip and memory that
 * it stuttered). Before, the swirl and six rings were each a CSS layer one
 * and a half screens wide, which at a phone's pixel density meant hundreds
 * of megabytes of graphics memory. Same picture: a swirl turning faster and
 * faster, rings of light rushing to the centre, a bright core that grows
 * until it fills the screen.
 */
const WarpVortex: React.FC<{ ms: number }> = ({ ms }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);
    const cx = w / 2;
    const cy = h / 2;
    const vmax = Math.max(w, h);
    const reach = Math.hypot(cx, cy);
    const t0 = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      const elapsed = now - t0;
      const k = Math.min(1, elapsed / ms);
      ctx.clearRect(0, 0, w, h);
      // The swirl: amber spokes turning ever faster, dark towards the rim.
      const turn = -1260 * k * k * (Math.PI / 180);
      const swirlR = vmax * 0.85 * (1.3 - 0.7 * k);
      ctx.globalAlpha = Math.min(1, k / 0.25);
      ctx.fillStyle = 'rgba(232, 168, 56, 0.22)';
      ctx.beginPath();
      for (let a = 0; a < 360; a += 24) {
        const a0 = turn + ((a + 13) * Math.PI) / 180;
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, swirlR, a0, a0 + (3 * Math.PI) / 180);
        ctx.closePath();
      }
      ctx.fill();
      const shade = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(swirlR, reach));
      shade.addColorStop(0, 'rgba(4, 3, 2, 0)');
      shade.addColorStop(0.18, 'rgba(4, 3, 2, 0)');
      shade.addColorStop(0.62, 'rgba(4, 3, 2, 0.85)');
      shade.addColorStop(1, 'rgba(4, 3, 2, 0.85)');
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, w, h);
      // Rings rushing inwards, one after another.
      for (let i = 0; i < 6; i++) {
        const local = elapsed - i * 160;
        if (local < 0) continue;
        const p = (local % 950) / 950;
        const r = vmax * 0.75 * (1 - 0.98 * p * p);
        const alpha = p < 0.3 ? (p / 0.3) * 0.9 : 0.9 - ((p - 0.3) / 0.7) * 0.7;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(232, 168, 56, 0.25)';
        ctx.lineWidth = 14;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(240, 196, 120, 0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      // The bright core, from halfway on, growing until it fills the screen.
      if (k > 0.5) {
        const q = (k - 0.5) / 0.5;
        const coreR = vmax * 0.2 * 4.5 * q * q * q;
        if (coreR > 1) {
          const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
          core.addColorStop(0, '#fffaf0');
          core.addColorStop(0.3, '#ffe4a8');
          core.addColorStop(0.55, 'rgba(232, 168, 56, 0.55)');
          core.addColorStop(0.72, 'rgba(232, 168, 56, 0)');
          ctx.globalAlpha = 1;
          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (k < 1) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [ms]);
  return <canvas ref={ref} aria-hidden="true" className="splash-vortex" />;
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
  // The speedometer is written straight into the page on every frame, so the
  // whole screen doesn't redraw 60 times a second; only reaching 88 re-renders.
  const speedRef = useRef<HTMLElement>(null);
  const [at88, setAt88] = useState(false);
  const destination = toStamp(destinationDate);
  const now = new Date();
  const present: Stamp = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // While the welcome screen covers the app, what lies beneath it (the
  // app-wide old-screen pane, the ticket) has nothing to show and only costs
  // work; it comes back as the light opens.
  const covering = stage !== 'iris';
  useEffect(() => {
    if (!covering) return;
    document.documentElement.classList.add('rm-splash-up');
    return () => document.documentElement.classList.remove('rm-splash-up');
  }, [covering]);

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
      const mph = Math.round(TIME_SPEED * k * k);
      if (speedRef.current) speedRef.current.textContent = String(mph).padStart(2, '0');
      if (mph >= TIME_SPEED) setAt88(true);
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
      {stage === 'warp' && !reduceMotion && (
        <WarpVortex ms={WARP_MS} />
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
      {/* The clock gets its own gap between the time circuits and the start
          button, so nothing covers its face (Marco, 2026-10-18: "Der Button
          sollte die Uhr nicht verdecken!"). */}
      <div className="splash-clock-slot" aria-hidden="true">
        <div className="mantel-clock-wrapper pointer-events-none">
          <MantelClock className="w-full h-full" rewinding={stage === 'warp'} lightning />
        </div>
      </div>
      <div className="splash-start-row relative">
        <button
          onClick={handleStart}
          disabled={struck}
          className={`rm-flux-start relative ${at88 ? 'is-88' : ''}`}
          data-quiet
        >
          <FluxIcon />
          <span className="rm-flux-text">
            <span className="rm-flux-label">{tr('Go back in time', 'Ab in die Vergangenheit')}</span>
            <span className="rm-flux-speed" aria-hidden="true">
              <b ref={speedRef}>00</b> MPH
            </span>
          </span>
        </button>
        <LoudSign show={!muted && !struck} />
      </div>
      <p
        aria-live="polite"
        className={`relative mt-3 text-sm text-[#c9ab78]/80 transition-opacity duration-500 ${
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
      <div className="relative mt-2 flex flex-col items-center gap-1 max-w-xs">
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
      {at88 && !reduceMotion && (
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
