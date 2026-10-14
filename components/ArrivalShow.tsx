import React, { useEffect, useRef, useState } from 'react';
import { isMuted } from '../lib/mute';
import { isGerman, tr } from '../lib/i18n';
import { DECADES_DB } from '../constants';

// The "wow" of arriving (Marco, 2026-10-14: "Wenn man in der App angekommen
// ist, ist das wirklich etwas sehr langweilig, ich erwarte da einen
// gewissen Wow-Moment … ich möchte geflasht werden"). Right after the time
// machine, a few seconds of show over the app:
// 1. time circuits like in a time-travel film: "PRESENT TIME" in green,
//    "DESTINATION TIME" in red, its digits racing from today back to the
//    day you were born, with a rattling counter;
// 2. lock-in: a flash, a shockwave ring, a deep boom, and the year in huge
//    glowing digits with the decade's title, while things of that decade
//    (cassette, joystick, disco ball …) burst out of the middle;
// 3. the show fades and leaves the app with "Welcome to the year …".
// Tapping anywhere skips it. Without motion (prefers-reduced-motion) it
// isn't shown. Sounds are Web Audio, quiet at first and off when muted.

const RACE_MS = 1900;
const HOLD_MS = 2600;
const FADE_MS = 700;

const ERA_THINGS: Record<string, string[]> = {
  '1960': ['🚀', '📺', '🌼', '🎸', '🛵', '📻', '☮️', '🎞️'],
  '1970': ['🪩', '📼', '🛼', '🌈', '🎙️', '📻', '🕶️', '🍦'],
  '1980': ['🕹️', '📼', '🎧', '🧊', '👾', '📺', '🛹', '💿'],
  '1990': ['💾', '📟', '🎮', '📀', '🖥️', '🧃', '🛴', '📼'],
  '2000': ['📱', '💿', '🎧', '🧸', '💻', '📸', '🎮', '🛹'],
  '2010': ['📲', '🎧', '🤳', '⭐', '🎮', '📷', '🛴', '💬'],
  '2020': ['📱', '🎧', '🛸', '🎮', '💻', '🚲', '📷', '✨'],
};

const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTHS_DE = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
const MONTHS = isGerman ? MONTHS_DE : MONTHS_EN;

interface Stamp {
  month: number;
  day: number;
  year: number;
}

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (isMuted()) return null;
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = ctx ?? new AC();
    ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

/** One click of the racing counter. */
function tick(level: number) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'square';
  o.frequency.value = 1400 + Math.random() * 600;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.02 + 0.05 * level, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.04);
}

/** The lock-in: a deep boom under a bright shimmer. */
function boom() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.5, t + 0.03);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
  out.connect(c.destination);
  const low = c.createOscillator();
  low.type = 'sine';
  low.frequency.setValueAtTime(110, t);
  low.frequency.exponentialRampToValueAtTime(38, t + 1.2);
  low.connect(out);
  low.start(t);
  low.stop(t + 2.4);
  // A bright major chord that rings out, the "arrived" feeling.
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'triangle';
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + 0.05 + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.12 + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o.connect(g).connect(c.destination);
    o.start(t + 0.05 + i * 0.05);
    o.stop(t + 2.3);
  });
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

const Row: React.FC<{ label: string; stamp: Stamp; tone: 'red' | 'green' | 'amber'; locked?: boolean }> = ({ label, stamp, tone, locked }) => (
  <div className={`rm-tc-row is-${tone} ${locked ? 'is-locked' : ''}`}>
    <div className="rm-tc-cells">
      <span className="rm-tc-cell">
        <small>{tr('Month', 'Monat')}</small>
        <b>{MONTHS[stamp.month]}</b>
      </span>
      <span className="rm-tc-cell">
        <small>{tr('Day', 'Tag')}</small>
        <b>{pad(stamp.day)}</b>
      </span>
      <span className="rm-tc-cell rm-tc-year">
        <small>{tr('Year', 'Jahr')}</small>
        <b>{stamp.year}</b>
      </span>
    </div>
    <span className="rm-tc-label">{label}</span>
  </div>
);

export const ArrivalShow: React.FC<{
  /** "YYYY-MM-DD" of the destination (the birthday). */
  birthDate: string;
  year: number;
  decade: string;
  /** Called at the lock-in (the voice speaks then). */
  onLock: () => void;
  onDone: () => void;
}> = ({ birthDate, year, decade, onLock, onDone }) => {
  const now = new Date();
  const present: Stamp = { month: now.getMonth(), day: now.getDate(), year: now.getFullYear() };
  const [, m, d] = birthDate.split('-').map(Number);
  const target: Stamp = { month: (m || 1) - 1, day: d || 1, year };
  const [shown, setShown] = useState<Stamp>(present);
  const [phase, setPhase] = useState<'race' | 'locked' | 'fade'>('race');
  const onLockRef = useRef(onLock);
  onLockRef.current = onLock;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const started = performance.now();
    let raf = 0;
    let lastYear = present.year;
    const step = () => {
      const p = Math.min(1, (performance.now() - started) / RACE_MS);
      // Fast at first, then slowing down onto the target, like a dial.
      const e = 1 - Math.pow(1 - p, 3);
      const y = Math.round(present.year + (target.year - present.year) * e);
      if (y !== lastYear) {
        tick(p);
        lastYear = y;
      }
      setShown(
        p < 1
          ? { year: y, month: p > 0.85 ? target.month : Math.floor(Math.random() * 12), day: p > 0.92 ? target.day : 1 + Math.floor(Math.random() * 28) }
          : target
      );
      if (p < 1) raf = requestAnimationFrame(step);
      else {
        setPhase('locked');
        boom();
        onLockRef.current();
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === 'locked') {
      const t = window.setTimeout(() => setPhase('fade'), HOLD_MS);
      return () => window.clearTimeout(t);
    }
    if (phase === 'fade') {
      const t = window.setTimeout(() => onDoneRef.current(), FADE_MS);
      return () => window.clearTimeout(t);
    }
  }, [phase]);

  const skip = () => {
    if (phase === 'race') {
      setShown(target);
      setPhase('locked');
      boom();
      onLockRef.current();
    } else onDoneRef.current();
  };

  const things = ERA_THINGS[decade] ?? ERA_THINGS['1980'];
  const title = DECADES_DB[decade]?.title;

  return (
    <div
      className={`rm-arrival-show is-${phase}`}
      onClick={skip}
      role="dialog"
      aria-label={tr(`Arrived in ${year}`, `Angekommen in ${year}`)}
    >
      <div className="rm-arrival-stars" aria-hidden="true" />
      <div className="rm-tc" aria-hidden={phase !== 'race'}>
        <Row label={tr('Destination time', 'Zielzeit')} stamp={shown} tone="red" locked={phase !== 'race'} />
        <Row label={tr('Present time', 'Gegenwart')} stamp={present} tone="green" />
      </div>
      {phase !== 'race' && (
        <>
          <div className="rm-arrival-flash" aria-hidden="true" />
          <div className="rm-arrival-wave" aria-hidden="true" />
          <div className="rm-arrival-wave is-late" aria-hidden="true" />
          <div className="rm-arrival-burst" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <span
                key={i}
                style={{
                  ['--a' as string]: `${(i / 24) * 360 + (i % 2) * 7}deg`,
                  ['--r' as string]: `${32 + (i % 3) * 14}vmax`,
                  ['--d' as string]: `${(i % 5) * 60}ms`,
                }}
              >
                {things[i % things.length]}
              </span>
            ))}
          </div>
          <div className="rm-arrival-year">
            <p className="rm-arrival-eyebrow">{tr('Welcome back', 'Willkommen zurück')}</p>
            <p className="rm-arrival-digits">{year}</p>
            {title && <p className="rm-arrival-title">{title}</p>}
          </div>
        </>
      )}
      <p className="rm-arrival-skip">{tr('Tap to continue', 'Tippen zum Weitergehen')}</p>
    </div>
  );
};
