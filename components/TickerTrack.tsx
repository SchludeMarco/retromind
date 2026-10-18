import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import type { FeedSlot } from '../lib/tickerFeed';
import { tr } from '../lib/i18n';

// The moving part of every ticker in both apps (the Laufband on the
// Zeitreise start page, the fun facts in the gaming hall). Marco,
// 2026-10-18: slower, and pushed along with a finger: back to an entry that
// was interesting but already gone, or on to the next one when this one
// isn't. It runs on by itself after letting go (a flick carries it a bit
// further), and the arrow buttons around it do the same one entry at a time
// for anyone who'd rather tap than drag (WCAG 2.5.7).
//
// It never loops: the run is a long row from lib/tickerFeed.ts that grows on
// the right while it moves (onNeedMore) and loses its oldest entries on the
// left, and the row keeps its place when that happens. With motion turned
// off it stands still but can still be dragged and stepped.

/** Slow enough to read in passing, for older eyes too. */
export const TICKER_PX_PER_SECOND = 24;

export interface TickerTrackHandle {
  /** Glides to the previous (-1) or next (1) entry. */
  step: (dir: -1 | 1) => void;
}

interface Props<T> {
  slots: FeedSlot<T>[];
  startSeq: number;
  /** Everything inside one entry's <li>. */
  render: (slot: FeedSlot<T>) => React.ReactNode;
  stopped: boolean;
  onNeedMore: () => void;
  onReach: (seq: number) => void;
  className: string;
  listClassName: string;
  itemClassName: string;
  speed?: number;
  /** Fires whenever a finger, the mouse or the keyboard is on the ticker. */
  onHold?: (held: boolean) => void;
}

const reducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function TickerTrackInner<T>(
  { slots, startSeq, render, stopped, onNeedMore, onReach, className, listClassName, itemClassName, speed = TICKER_PX_PER_SECOND, onHold }: Props<T>,
  ref: React.ForwardedRef<TickerTrackHandle>
) {
  const viewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const stoppedRef = useRef(stopped);
  stoppedRef.current = stopped;
  const cb = useRef({ onNeedMore, onReach, onHold });
  cb.current = { onNeedMore, onReach, onHold };

  // Where the row stands: px from its left end to the left edge of the view.
  const offset = useRef(0);
  const placed = useRef(false);
  /** Flick speed in px/s after letting go, fading out. */
  const fling = useRef(0);
  /** An arrow button's target. */
  const glide = useRef<number | null>(null);
  const drag = useRef<{ id: number; x: number; from: number; moved: boolean; lastX: number; lastT: number; v: number } | null>(null);
  const swallowClick = useRef(false);
  const asked = useRef(-1);
  const lastReach = useRef(-1);
  /** Each entry's left edge at the last layout, to keep the place when the row changes. */
  const lefts = useRef(new Map<number, number>());

  const entries = () => Array.from(listRef.current?.children ?? []) as HTMLElement[];

  const place = useCallback(() => {
    const list = listRef.current;
    const view = viewRef.current;
    if (!list || !view) return;
    const max = Math.max(0, list.scrollWidth - view.clientWidth);
    if (offset.current > max) offset.current = max;
    if (offset.current < 0) offset.current = 0;
    list.style.transform = `translate3d(${-offset.current}px,0,0)`;

    // Little left ahead: ask for more (once for each new end of the row).
    if (max - offset.current < Math.max(view.clientWidth * 2, 2400) && asked.current !== lastSeq.current) {
      asked.current = lastSeq.current;
      cb.current.onNeedMore();
    }
    // The furthest entry that has fully come into view counts as seen.
    const right = offset.current + view.clientWidth;
    let seen = -1;
    for (const el of entries()) {
      if (el.offsetLeft + el.offsetWidth > right) break;
      seen = Number(el.dataset.seq);
    }
    if (seen > lastReach.current) {
      lastReach.current = seen;
      cb.current.onReach(seen);
    }
  }, []);

  const lastSeq = useRef(-1);
  lastSeq.current = slots.length ? slots[slots.length - 1].seq : -1;

  // Keep the place when entries are added or dropped: find one that was
  // there before and move by however far it shifted.
  useLayoutEffect(() => {
    const els = entries();
    if (!placed.current) {
      const start = els.find((el) => Number(el.dataset.seq) >= startSeq);
      // Start a little before the first new entry, so the last one from the
      // previous visit just peeks in from the left.
      offset.current = start ? Math.max(0, start.offsetLeft - 48) : 0;
      placed.current = true;
    } else {
      for (const el of els) {
        const before = lefts.current.get(Number(el.dataset.seq));
        if (before !== undefined) {
          offset.current += el.offsetLeft - before;
          break;
        }
      }
    }
    lefts.current = new Map(els.map((el) => [Number(el.dataset.seq), el.offsetLeft]));
    place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, place]);

  useEffect(() => {
    let last = performance.now();
    let frame = 0;
    const still = reducedMotion();
    const tick = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      if (!drag.current) {
        if (glide.current !== null) {
          const diff = glide.current - offset.current;
          if (Math.abs(diff) < 0.5) {
            offset.current = glide.current;
            glide.current = null;
          } else offset.current += diff * Math.min(1, dt * 9);
          place();
        } else if (Math.abs(fling.current) > 1) {
          offset.current += fling.current * dt;
          fling.current *= Math.pow(0.04, dt);
          place();
        } else if (!still && !stoppedRef.current) {
          offset.current += speed * dt;
          place();
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [place, speed]);

  useImperativeHandle(ref, () => ({
    step(dir) {
      const from = glide.current ?? offset.current;
      const lefts = entries().map((el) => el.offsetLeft);
      const target =
        dir > 0 ? lefts.find((l) => l > from + 4) : [...lefts].reverse().find((l) => l < from - 4);
      fling.current = 0;
      glide.current = target ?? (dir > 0 ? from : 0);
    },
  }), []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    fling.current = 0;
    glide.current = null;
    drag.current = { id: e.pointerId, x: e.clientX, from: offset.current, moved: false, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) {
      d.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.v = 0.7 * d.v + 0.3 * ((d.lastX - e.clientX) / dt) * 1000;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    offset.current = d.from - dx;
    place();
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.moved) {
      // A drag isn't a tap: the entry under the finger stays as it is.
      swallowClick.current = true;
      // A quick flick carries on a little (only if the finger was still moving).
      if (e.timeStamp - d.lastT < 80) fling.current = Math.max(-2500, Math.min(2500, d.v));
    }
    drag.current = null;
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  // Keyboard: an entry that gets focus is brought into view.
  const onFocus = (e: React.FocusEvent) => {
    cb.current.onHold?.(true);
    const target = e.target as HTMLElement;
    // Not for a tap or click (that focuses too): only the Tab key.
    if (drag.current || !target.matches?.(':focus-visible')) return;
    const el = target.closest('[data-seq]') as HTMLElement | null;
    const view = viewRef.current;
    if (!el || !view) return;
    const left = el.offsetLeft;
    if (left < offset.current || left + el.offsetWidth > offset.current + view.clientWidth) {
      glide.current = Math.max(0, left - 24);
    }
  };

  return (
    <div
      ref={viewRef}
      className={className}
      onPointerEnter={() => cb.current.onHold?.(true)}
      onPointerLeave={() => cb.current.onHold?.(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      onFocus={onFocus}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) cb.current.onHold?.(false);
      }}
    >
      <ul ref={listRef} className={listClassName}>
        {slots.map((slot) => (
          <li key={slot.seq} data-seq={slot.seq} className={itemClassName}>
            {render(slot)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const TickerTrack = forwardRef(TickerTrackInner) as <T>(
  props: Props<T> & { ref?: React.Ref<TickerTrackHandle> }
) => React.ReactElement;

/** The buttons left and right of a ticker: one entry back or on. */
export const TickerArrow: React.FC<{ dir: -1 | 1; className: string; onStep: () => void }> = ({ dir, className, onStep }) => (
  <button
    type="button"
    onClick={onStep}
    aria-label={dir < 0 ? tr('Previous entry', 'Vorherige Meldung') : tr('Next entry', 'Nächste Meldung')}
    title={dir < 0 ? tr('Back', 'Zurück') : tr('Next', 'Weiter')}
    className={className}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d={dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);
