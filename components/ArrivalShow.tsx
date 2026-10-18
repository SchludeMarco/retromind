import React, { useEffect, useMemo, useRef, useState } from 'react';
import { isMuted } from '../lib/mute';
import { getConsent } from '../lib/privacy';
import { isGerman, tr } from '../lib/i18n';
import { DECADES_DB } from '../constants';
import { sharedAudioContext } from '../lib/clockSounds';
import { hitClipUrl, hitOf, yearOf } from '../lib/yearFacts';
import type { CapturedMemory } from '../types';

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
// Since Marco's second wish list (2026-10-14): under the year it says what the
// year stands for ("1989 … the year of the fall of the Berlin Wall",
// lib/yearFacts), the visitor's own memories (photos and terms they already
// collected) fly out with the decade's things, and a few seconds of that
// year's No. 1 hit ring out as the fanfare (the Spotify music pauses for it).
// Since Marco's calm-down wish (2026-10-18: "Nachdem die Zeitreise fertig ist,
// ändert sich die Musik kurz, sie bricht ab … zu stressig"): when the music
// is already running, it simply keeps running through the show and the hit
// is only named, not played; the fanfare only sounds when no music plays,
// and then fades out slowly instead of breaking off.
// Tapping anywhere skips it. Without motion (prefers-reduced-motion) it
// isn't shown. Sounds are Web Audio, quiet at first and off when muted.

const RACE_MS = 1900;
const HOLD_MS = 2600;
// With the hit playing, the year stays a little longer.
const HIT_HOLD_MS = 4600;
const FADE_MS = 700;
// The clip starts a moment in, past any fade-in of the preview.
const HIT_OFFSET_S = 2;
// How long the fanfare takes to fade out at the end (or when skipped).
const HIT_FADE_S = 2.5;

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

export interface Stamp {
  month: number;
  day: number;
  year: number;
}

// The page's sound context, unlocked by the tap on the start button, so
// phones let the show sound too.
function audio(): AudioContext | null {
  if (isMuted()) return null;
  const c = sharedAudioContext();
  c?.resume().catch(() => {});
  return c;
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

/** The lock-in: a deep boom under a bright shimmer (the chord only without the hit). */
function boom(chord = true) {
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
  if (!chord) return;
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

/** One row of the time circuits; without a stamp it shows dashes (the welcome screen before anyone has entered a birthday). */
export const TimeCircuitRow: React.FC<{ label: string; stamp: Stamp | null; tone: 'red' | 'green' | 'amber'; locked?: boolean }> = ({ label, stamp, tone, locked }) => (
  <div className={`rm-tc-row is-${tone} ${locked ? 'is-locked' : ''}`}>
    <div className="rm-tc-cells">
      <span className="rm-tc-cell">
        <small>{tr('Month', 'Monat')}</small>
        <b>{stamp ? MONTHS[stamp.month] : '---'}</b>
      </span>
      <span className="rm-tc-cell">
        <small>{tr('Day', 'Tag')}</small>
        <b>{stamp ? pad(stamp.day) : '--'}</b>
      </span>
      <span className="rm-tc-cell rm-tc-year">
        <small>{tr('Year', 'Jahr')}</small>
        <b>{stamp ? stamp.year : '----'}</b>
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
  /** The visitor's collected memories: their photos and terms fly along. */
  memories?: CapturedMemory[];
  /** The hit's fanfare starts (true) or is over (false). */
  onMusic?: (on: boolean) => void;
  /** The app's music is playing: then it keeps playing and the fanfare stays silent. */
  musicPlaying?: boolean;
}> = ({ birthDate, year, decade, onLock, onDone, memories = [], onMusic, musicPlaying = false }) => {
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
  const onMusicRef = useRef(onMusic);
  onMusicRef.current = onMusic;
  const musicPlayingRef = useRef(musicPlaying);
  musicPlayingRef.current = musicPlaying;

  // The No. 1 hit of the year, loaded while the dials race.
  const hit = hitOf(year);
  const [hitOn, setHitOn] = useState(false);
  const hitBuffer = useRef<AudioBuffer | null>(null);
  const hitPlay = useRef<{ gain: GainNode; src: AudioBufferSourceNode } | null>(null);
  const lockedAt = useRef(0);
  const holdRef = useRef(HOLD_MS);

  const startHit = () => {
    const c = audio();
    const buf = hitBuffer.current;
    if (!c || !buf || hitPlay.current || !lockedAt.current || musicPlayingRef.current) return;
    const left = (holdRef.current + FADE_MS - (performance.now() - lockedAt.current)) / 1000;
    if (left < HIT_FADE_S + 1) return;
    const t = c.currentTime;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.9, t + 0.6);
    gain.gain.setValueAtTime(0.9, t + left - HIT_FADE_S);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + left);
    gain.connect(c.destination);
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(gain);
    src.start(t, Math.min(HIT_OFFSET_S, Math.max(0, buf.duration - left)));
    src.stop(t + left + 0.05);
    hitPlay.current = { gain, src };
    setHitOn(true);
    onMusicRef.current?.(true);
  };
  const startHitRef = useRef(startHit);
  startHitRef.current = startHit;

  useEffect(() => {
    // The clip is a piece of someone else's recording, so like the Spotify
    // music it only plays once the visitor allowed music (lib/privacy).
    if (!hit || isMuted() || getConsent('spotify') !== true || musicPlayingRef.current) return;
    let live = true;
    fetch(hitClipUrl(hit))
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
      .then((data) => {
        const c = audio();
        if (!c || !live) return null;
        // Older Safari only knows the callback form.
        return new Promise<AudioBuffer>((resolve, reject) => c.decodeAudioData(data, resolve, reject));
      })
      .then((buf) => {
        if (!buf || !live) return;
        hitBuffer.current = buf;
        startHitRef.current();
      })
      .catch(() => {});
    return () => {
      live = false;
      // Skipped or over: the fanfare fades out instead of breaking off.
      const p = hitPlay.current;
      if (p) {
        try {
          const c = p.gain.context;
          const t = c.currentTime;
          p.gain.gain.cancelScheduledValues(t);
          p.gain.gain.setValueAtTime(Math.max(0.0001, p.gain.gain.value), t);
          p.gain.gain.exponentialRampToValueAtTime(0.0001, t + HIT_FADE_S);
          p.src.stop(t + HIT_FADE_S + 0.05);
        } catch {
          /* already stopped */
        }
        onMusicRef.current?.(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lockIn = () => {
    lockedAt.current = performance.now();
    holdRef.current = hitBuffer.current && !musicPlayingRef.current ? HIT_HOLD_MS : HOLD_MS;
    setPhase('locked');
    boom(!hitBuffer.current);
    onLockRef.current();
    startHit();
  };

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
      else lockIn();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === 'locked') {
      const t = window.setTimeout(() => setPhase('fade'), holdRef.current);
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
      lockIn();
    } else onDoneRef.current();
  };

  const things = ERA_THINGS[decade] ?? ERA_THINGS['1980'];
  const line = yearOf(year);
  const title = DECADES_DB[decade]?.title;
  // What flies out: the visitor's own photos and terms among the decade's things.
  const burst = useMemo(() => {
    const photos = memories.filter((m) => m.photo).slice(0, 6).map((m) => ({ photo: m.photo!, term: m.term }));
    const terms = [...new Set(memories.filter((m) => !m.photo && m.term).map((m) => m.term.trim()))]
      .slice(0, 8)
      .map((t) => (t.length > 22 ? `${t.slice(0, 21)}…` : t));
    const own: ({ photo: string; term: string } | string)[] = [];
    for (let i = 0; own.length < photos.length + terms.length; i++) {
      if (photos[i]) own.push(photos[i]);
      if (terms[i]) own.push(terms[i]);
    }
    // Spread the own things evenly around the circle.
    const items: ({ kind: 'thing'; text: string } | { kind: 'term'; text: string } | { kind: 'photo'; src: string; alt: string })[] = [];
    const step = own.length ? 24 / own.length : 0;
    let next = 0;
    for (let i = 0; i < 24; i++) {
      if (next < own.length && i >= Math.round(next * step)) {
        const o = own[next++];
        items.push(typeof o === 'string' ? { kind: 'term', text: o } : { kind: 'photo', src: o.photo, alt: o.term });
      } else items.push({ kind: 'thing', text: things[i % things.length] });
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`rm-arrival-show is-${phase}`}
      onClick={skip}
      role="dialog"
      aria-label={tr(`Arrived in ${year}`, `Angekommen in ${year}`)}
    >
      <div className="rm-arrival-stars" aria-hidden="true" />
      <div className="rm-tc" aria-hidden={phase !== 'race'}>
        <TimeCircuitRow label={tr('Destination time', 'Zielzeit')} stamp={shown} tone="red" locked={phase !== 'race'} />
        <TimeCircuitRow label={tr('Present time', 'Gegenwart')} stamp={present} tone="green" />
      </div>
      {phase !== 'race' && (
        <>
          <div className="rm-arrival-flash" aria-hidden="true" />
          <div className="rm-arrival-wave" aria-hidden="true" />
          <div className="rm-arrival-wave is-late" aria-hidden="true" />
          <div className="rm-arrival-burst" aria-hidden="true">
            {burst.map((item, i) => (
              <span
                key={i}
                className={item.kind === 'thing' ? '' : `is-${item.kind}`}
                style={{
                  ['--a' as string]: `${(i / 24) * 360 + (i % 2) * 7}deg`,
                  // Own memories fly a little slower and not as far, so they can be seen.
                  ['--r' as string]: item.kind === 'thing' ? `${32 + (i % 3) * 14}vmax` : `${26 + (i % 3) * 6}vmax`,
                  ['--d' as string]: `${(i % 5) * 60}ms`,
                }}
              >
                {item.kind === 'photo' ? <img src={item.src} alt="" /> : item.text}
              </span>
            ))}
          </div>
          <div className="rm-arrival-year">
            <p className="rm-arrival-eyebrow">{tr('Welcome back', 'Willkommen zurück')}</p>
            <p className="rm-arrival-digits">{year}</p>
            {line ? <p className="rm-arrival-title">… {line}</p> : title && <p className="rm-arrival-title">{title}</p>}
            {(hitOn || musicPlaying) && hit && (
              <p className="rm-arrival-hit">
                {hitOn ? '♪ ' : ''}
                {tr(`US No. 1 of ${year}: `, `US-Nr. 1 von ${year}: `)}
                <b>{hit.title}</b> · {hit.artist}
              </p>
            )}
          </div>
        </>
      )}
      <p className="rm-arrival-skip">{tr('Tap to continue', 'Tippen zum Weitergehen')}</p>
    </div>
  );
};
