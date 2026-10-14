import React, { useEffect, useRef, useState } from 'react';
import { AppPhase } from '../types';
import { PHASES } from '../lib/session';
import { STATION_NAME, STATION_SHORT } from '../lib/stations';
import { tr } from '../lib/i18n';

// "You are here" on the time travel (Marco, 2026-10-14: "der User muss
// jederzeit spüren, wo er in seiner Reise ist und was der nächste logische
// Schritt ist"). One bar for every design, above every stop:
// - a small mantel clock whose hand points at the current stop, the
//   journey's leading picture (the welcome screen's clock comes along),
// - "Stop 4 of 7" and the stop's name, with a breadcrumb for a Sparte on
//   the Explore stop ("Explore › Music"),
// - the seven stops on a line, done ones filled, every one tappable,
// - the way back to the previous stop.
// Once the bar is scrolled away, a slim pill with the same clock, the stop
// and back / next arrows stays at the top of the screen.
// Replaces the Retro Warm stepper, the Classic/Night Shift station picker
// and the thin progress line (all in _removed_content/).

const STOPS = PHASES;

/** The little clock: one dot per stop around the dial, the hand on the current one. */
export const JourneyClock: React.FC<{ index: number; className?: string }> = ({ index, className = 'w-12 h-12' }) => {
  const angle = (i: number) => (i / STOPS.length) * 2 * Math.PI - Math.PI / 2;
  const handAngle = (index / STOPS.length) * 360;
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={`rm-journey-clock shrink-0 ${className}`}>
      <circle cx="24" cy="24" r="22" className="rm-jc-rim" />
      <circle cx="24" cy="24" r="18.5" className="rm-jc-face" />
      {STOPS.map((_, i) => (
        <circle
          key={i}
          cx={24 + 14 * Math.cos(angle(i))}
          cy={24 + 14 * Math.sin(angle(i))}
          r={i === index ? 2.6 : 1.8}
          className={i < index ? 'rm-jc-done' : i === index ? 'rm-jc-now' : 'rm-jc-todo'}
        />
      ))}
      <g className="rm-jc-hand" style={{ transform: `rotate(${handAngle}deg)` }}>
        <line x1="24" y1="24" x2="24" y2="12" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      {/* The seconds hand ticks on, so the time machine always seems alive. */}
      <g className="rm-jc-second">
        <line x1="24" y1="27" x2="24" y2="8.5" strokeWidth="0.9" strokeLinecap="round" />
      </g>
      <circle cx="24" cy="24" r="2.2" className="rm-jc-pin" />
    </svg>
  );
};

export const JourneyBar: React.FC<{
  phase: AppPhase;
  warm: boolean;
  /** An open sub-page of the stop, shown as a breadcrumb; onUp goes back to the stop's overview. */
  crumb?: { label: string; onUp: () => void };
  onSelect: (p: AppPhase) => void;
}> = ({ phase, warm, crumb, onSelect }) => {
  const index = STOPS.indexOf(phase);
  const ref = useRef<HTMLElement | null>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setPinned(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (index < 0) return null;
  const prev = index > 0 ? STOPS[index - 1] : null;
  const next = index < STOPS.length - 1 ? STOPS[index + 1] : null;
  const stopOf = tr(`Stop ${index + 1} of ${STOPS.length}`, `Halt ${index + 1} von ${STOPS.length}`);

  const title = (
    <nav aria-label={tr('You are here', 'Du bist hier')} className="min-w-0">
      <ol className="rm-crumbs">
        <li>
          {crumb ? (
            <button type="button" onClick={crumb.onUp} className="rm-crumb-link">
              {STATION_NAME[phase]}
            </button>
          ) : (
            <span aria-current="page">{STATION_NAME[phase]}</span>
          )}
        </li>
        {crumb && (
          <li>
            <span aria-hidden="true" className="rm-crumb-sep">›</span>
            <span aria-current="page">{crumb.label}</span>
          </li>
        )}
      </ol>
    </nav>
  );

  return (
    <>
      <section
        ref={ref}
        aria-label={tr('Your time travel', 'Deine Zeitreise')}
        className={`rm-journey no-print ${warm ? 'mt-4' : 'mt-2'}`}
      >
        <div className="flex items-center gap-3">
          <JourneyClock index={index} />
          <div className="min-w-0 flex-1">
            <p className="rm-eyebrow"><span className="hidden sm:inline">{tr('Your time travel', 'Deine Zeitreise')} · </span>{stopOf}</p>
            <div className="rm-journey-title">{title}</div>
          </div>
          {prev && (
            <button
              type="button"
              onClick={() => onSelect(prev)}
              className="rm-journey-back"
              aria-label={tr(`Back to: ${STATION_NAME[prev]}`, `Zurück zu: ${STATION_NAME[prev]}`)}
            >
              <span aria-hidden="true">←</span>
              <span className="hidden sm:inline">{STATION_SHORT[prev]}</span>
            </button>
          )}
        </div>
        <ol className="rm-journey-line" style={{ ['--rm-progress' as string]: index / (STOPS.length - 1) }}>
          {STOPS.map((p, i) => {
            const state = i < index ? 'is-done' : i === index ? 'is-now' : 'is-todo';
            return (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => i !== index && onSelect(p)}
                  aria-current={i === index ? 'step' : undefined}
                  aria-label={tr(`Stop ${i + 1}: ${STATION_NAME[p]}`, `Halt ${i + 1}: ${STATION_NAME[p]}`)}
                  className={`rm-stop ${state}`}
                >
                  <span className="rm-stop-dot">{i < index ? '✓' : i + 1}</span>
                  <span className="rm-stop-label">{STATION_SHORT[p]}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* The slim pill that stays at the top while reading. */}
      <div
        className={`rm-journey-mini rm-fixed no-print ${warm ? 'is-warm' : ''} ${pinned ? 'is-shown' : ''}`}
        aria-hidden={!pinned}
      >
        <button
          type="button"
          tabIndex={pinned ? 0 : -1}
          disabled={!prev}
          onClick={() => prev && onSelect(prev)}
          className="rm-mini-arrow"
          aria-label={prev ? tr(`Back to: ${STATION_NAME[prev]}`, `Zurück zu: ${STATION_NAME[prev]}`) : undefined}
        >
          ‹
        </button>
        <button
          type="button"
          tabIndex={pinned ? 0 : -1}
          onClick={() => (crumb ? crumb.onUp() : window.scrollTo({ top: 0, behavior: 'smooth' }))}
          className="rm-mini-mid"
          title={tr('Show the whole journey', 'Die ganze Reise zeigen')}
        >
          <JourneyClock index={index} className="w-7 h-7" />
          <span className="truncate">
            <span className="rm-mini-count">{index + 1}/{STOPS.length}</span> {STATION_NAME[phase]}
            {crumb && <> › {crumb.label}</>}
          </span>
        </button>
        <button
          type="button"
          tabIndex={pinned ? 0 : -1}
          disabled={!next}
          onClick={() => next && onSelect(next)}
          className="rm-mini-arrow"
          aria-label={next ? tr(`Next stop: ${STATION_NAME[next]}`, `Nächster Halt: ${STATION_NAME[next]}`) : undefined}
        >
          ›
        </button>
      </div>
    </>
  );
};
