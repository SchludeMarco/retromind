import React, { useEffect, useRef, useState } from 'react';
import { MantelClock } from './MantelClock';
import { startTicking, playWarp, WARP_SECONDS } from '../lib/clockSounds';
import { useMuted } from '../lib/mute';
import { LoudSign } from './LoudSign';
import { tr } from '../lib/i18n';
import { PRIVACY_URL, setConsent, useConsent } from '../lib/privacy';

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

// The very first thing anyone sees, on top of the whole app (and the
// BootOverlay dissolve reveals it, rather than the intro card underneath).
// Purely a local greeting gate — not part of the persisted session phase —
// so it appears again on every fresh page load. The mantel clock ticks the
// whole time (lib/clockSounds.ts); the start button takes the look of the
// chosen design (.splash-start in index.css).
// onReveal fires as the white starts giving way to the main menu (music
// begins there), onStart once the splash is gone.
export const SplashScreen: React.FC<{ onStart: () => void; onReveal?: () => void }> = ({ onStart, onReveal }) => {
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
      <div className="splash-content relative h-full flex flex-col items-center justify-center text-center px-6">
      <h1 className="splash-title relative font-display text-5xl md:text-7xl font-bold text-retro-paper tracking-wide mb-6">
        Welcome to <span className="text-red-600">R</span>etro<span className="text-red-600">M</span>ind
      </h1>
      <p className="relative font-elegant text-xl md:text-2xl italic tracking-wide text-[#c9ab78] mb-12">
        The ticket to your past🏳️
      </p>
      <div className="splash-start-row relative">
        <span className="splash-start-tilt relative inline-block">
          <button onClick={handleStart} disabled={struck} className="splash-start relative">
            Go back...
          </button>
        </span>
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
