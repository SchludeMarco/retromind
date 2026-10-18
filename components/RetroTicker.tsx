import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { tr } from '../lib/i18n';
import { TickerItem, tickerItem, tickerRun } from '../lib/tickerItems';
import { addToGrabbelkiste, removeFromGrabbelkiste, useGrabbelkiste } from '../lib/grabbelkiste';
import { Modal } from './Modal';

// The ticker on the start page (Marco, 2026-10-13): sayings and everyday
// things from back then run past like the news crawl on an old TV. Behind
// each one sits a floppy disk; tapping it puts the saying into the
// Grabbelkiste (lib/grabbelkiste.ts), the box at the start of the ticker,
// which opens a list of everything collected. Tapping the saying itself
// opens a little card with where it comes from.
//
// Easy on older eyes and hands: it moves slowly, stops while a finger or the
// mouse is on it or a disk has keyboard focus, has its own pause button
// (WCAG 2.2.2), and for people who turned motion off it is a still row that
// can be swiped sideways. A finger (or the mouse) can drag it back and forth
// (Marco, 2026-10-17); it runs on by itself after letting go. Retro Warm pins it just above the bottom
// navigation; the other designs show it at the end of the start page.
// Styles in index.css (.rm-ticker).

const PX_PER_SECOND = 38;

const reducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const FloppyIcon: React.FC<{ saved?: boolean; className?: string }> = ({ saved = false, className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
    <path d="M4 3h13l3 3v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="currentColor" />
    <rect x="7" y="3" width="9" height="6" rx="0.6" fill="#2a1a10" opacity="0.55" />
    <rect x="12.5" y="4" width="2" height="4" rx="0.4" fill="currentColor" />
    <rect x="6" y="12" width="12" height="8" rx="0.8" fill="#fff8ec" />
    {saved ? (
      <path d="M8.6 16.2l2.2 2.1 4.6-4.6" fill="none" stroke="#2f7a52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M8 14.6h8M8 17.4h5.5" stroke="#b9a58f" strokeWidth="1.2" strokeLinecap="round" />
    )}
  </svg>
);

export const BoxIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <path d="M3 9.5h18l-1.6 10.2a1.5 1.5 0 0 1-1.5 1.3H6.1a1.5 1.5 0 0 1-1.5-1.3z" />
    <path d="M3 9.5l2.5-4.5h13L21 9.5M9 13.5h6" />
  </svg>
);

const decadeLabel = (d: string) => tr(`${d}s`, `${d}er`);

const kindLabel = (item: TickerItem) => (item.kind === 'saying' ? tr('Saying', 'Spruch') : tr('Back then', 'Damals'));

const Entry: React.FC<{
  item: TickerItem;
  saved: boolean;
  copy: boolean;
  onToggle: (item: TickerItem) => void;
  onOpen: (item: TickerItem) => void;
}> = ({ item, saved, copy, onToggle, onOpen }) => (
  <li className="rm-ticker-entry">
    {/* Tapping the saying itself tells a little more about it (Marco). */}
    <button
      type="button"
      onClick={() => onOpen(item)}
      tabIndex={copy ? -1 : undefined}
      aria-label={tr(`More about: ${item.text}`, `Mehr dazu: ${item.text}`)}
      className="rm-ticker-text"
    >
      {item.text}
    </button>
    <button
      type="button"
      onClick={() => onToggle(item)}
      tabIndex={copy ? -1 : undefined}
      aria-pressed={saved}
      aria-label={saved
        ? tr(`Take out of the Grabbelkiste: ${item.text}`, `Aus der Grabbelkiste nehmen: ${item.text}`)
        : tr(`Put in the Grabbelkiste: ${item.text}`, `In die Grabbelkiste legen: ${item.text}`)}
      title={saved ? tr('In your Grabbelkiste', 'In deiner Grabbelkiste') : tr('Put in the Grabbelkiste', 'In die Grabbelkiste legen')}
      className={`rm-ticker-disk ${saved ? 'is-saved' : ''}`}
    >
      <FloppyIcon saved={saved} />
    </button>
    <span aria-hidden="true" className="rm-ticker-dot">✦</span>
  </li>
);

const CloseButton: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <button
    type="button"
    onClick={onClose}
    aria-label={tr('Close', 'Schließen')}
    className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-2xl leading-none hover:bg-retro-highlight"
  >
    ✕
  </button>
);

// What opens when a saying in the ticker is tapped: the saying, where it
// comes from, and the floppy disk to keep it.
const InfoModal: React.FC<{ item: TickerItem; saved: boolean; onToggle: (item: TickerItem) => void; onClose: () => void }> = ({
  item, saved, onToggle, onClose,
}) => (
  <Modal onClose={onClose} label={item.text}>
    <div className="flex items-start justify-between gap-3 mb-1">
      <span className="text-sm font-semibold uppercase tracking-wider text-retro-amber-dark pt-3">
        {decadeLabel(item.decade)} · {kindLabel(item)}
      </span>
      <CloseButton onClose={onClose} />
    </div>
    <h2 className="text-2xl md:text-3xl mb-3 leading-snug">{item.text}</h2>
    <p className="text-lg leading-relaxed mb-5">{item.info}</p>
    <button
      type="button"
      onClick={() => onToggle(item)}
      aria-pressed={saved}
      className={`retro-button w-full py-3 font-bold flex items-center justify-center gap-2 ${saved ? 'bg-white border-2 border-retro-ink' : 'bg-retro-amber text-white'}`}
    >
      <FloppyIcon saved={saved} className={`w-6 h-6 ${saved ? 'text-retro-amber-dark' : ''}`} />
      {saved ? tr('In your Grabbelkiste (tap to take out)', 'In deiner Grabbelkiste (antippen zum Herausnehmen)') : tr('Put in the Grabbelkiste', 'In die Grabbelkiste legen')}
    </button>
  </Modal>
);

const GrabbelkisteModal: React.FC<{ ids: string[]; onClose: () => void }> = ({ ids, onClose }) => {
  const items = ids.map(tickerItem).filter((i): i is TickerItem => !!i);
  return (
    <Modal onClose={onClose} label={tr('Your Grabbelkiste', 'Deine Grabbelkiste')}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="text-2xl m-0 flex items-center gap-2">
          <BoxIcon className="w-7 h-7 text-retro-amber-dark" />
          {tr('Your Grabbelkiste', 'Deine Grabbelkiste')}
        </h2>
        <CloseButton onClose={onClose} />
      </div>
      <p className="text-retro-brown mb-4">
        {tr(
          'Everything you picked out of the ticker on the start page. Tap a floppy disk there to add more.',
          'Alles, was du aus dem Laufband auf der Startseite herausgefischt hast. Tippe dort auf eine Diskette, um mehr hineinzulegen.'
        )}
      </p>
      {items.length === 0 ? (
        <p className="rounded-xl bg-retro-cream p-4 text-center">
          {tr('Still empty. The first floppy disk is waiting for you!', 'Noch leer. Die erste Diskette wartet schon auf dich!')}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-xl bg-retro-cream border border-retro-ink/10 p-3">
              <FloppyIcon saved className="w-6 h-6 flex-shrink-0 text-retro-amber-dark" />
              <span className="flex-grow">
                <span className="block font-semibold leading-snug">{item.text}</span>
                <span className="block text-sm text-retro-brown">
                  {decadeLabel(item.decade)} · {kindLabel(item)}
                </span>
                <span className="block text-sm mt-1 leading-snug">{item.info}</span>
              </span>
              <button
                type="button"
                onClick={() => removeFromGrabbelkiste(item.id)}
                aria-label={tr(`Take out: ${item.text}`, `Herausnehmen: ${item.text}`)}
                className="flex-shrink-0 px-3 py-2 text-sm font-semibold underline text-retro-brown"
              >
                {tr('Take out', 'Herausnehmen')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export const RetroTicker: React.FC<{ warm: boolean; focusDecade: string }> = ({ warm, focusDecade }) => {
  const run = useMemo(() => tickerRun(focusDecade), [focusDecade]);
  const saved = useGrabbelkiste();
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [boxOpen, setBoxOpen] = useState(false);
  const closeBox = useCallback(() => setBoxOpen(false), []);
  const [infoItem, setInfoItem] = useState<TickerItem | null>(null);
  const closeInfo = useCallback(() => setInfoItem(null), []);
  const [bump, setBump] = useState(0);
  const [announce, setAnnounce] = useState('');
  const copyRef = useRef<HTMLUListElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const stopped = paused || held || focused;
  const stoppedRef = useRef(stopped);
  stoppedRef.current = stopped;

  // Where the run stands (px from the start of the first copy); moved by the
  // clock and by dragging. Two copies side by side make the loop seamless.
  const offset = useRef(0);
  const drag = useRef<{ id: number; x: number; from: number; moved: boolean } | null>(null);
  const swallowClick = useRef(false);
  const place = useCallback(() => {
    const width = copyRef.current?.offsetWidth || 0;
    if (width) offset.current = ((offset.current % width) + width) % width;
    if (trackRef.current) trackRef.current.style.transform = `translate3d(${-offset.current}px,0,0)`;
  }, []);

  // The same slow speed however long the run or wide the screen.
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    let last = performance.now();
    let frame = 0;
    const tick = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      if (!stoppedRef.current && !drag.current) {
        offset.current += PX_PER_SECOND * dt;
        place();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, place]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (reducedMotion() || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag.current = { id: e.pointerId, x: e.clientX, from: offset.current, moved: false };
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
    offset.current = d.from - dx;
    place();
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    // A drag isn't a tap: the saying or disk under the finger stays as it is.
    if (d.moved) swallowClick.current = true;
    drag.current = null;
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  // Retro Warm: lets the back-to-top button make room above the ticker.
  useEffect(() => {
    if (!warm) return;
    const root = document.documentElement;
    root.dataset.ticker = '';
    return () => {
      delete root.dataset.ticker;
    };
  }, [warm]);

  const toggle = (item: TickerItem) => {
    if (saved.includes(item.id)) {
      removeFromGrabbelkiste(item.id);
      setAnnounce(tr(`Taken out of the Grabbelkiste: ${item.text}`, `Aus der Grabbelkiste genommen: ${item.text}`));
    } else {
      addToGrabbelkiste(item.id);
      setBump((n) => n + 1);
      setAnnounce(tr(`Put in the Grabbelkiste: ${item.text}`, `In die Grabbelkiste gelegt: ${item.text}`));
    }
  };

  return (
    <section
      aria-label={tr('Sayings and things from back then', 'Sprüche und Dinge von damals')}
      className={`rm-ticker no-print ${warm ? 'rm-ticker-pinned' : 'rm-ticker-inline'}`}
    >
      <button
        type="button"
        onClick={() => setBoxOpen(true)}
        aria-label={tr(`Open your Grabbelkiste (${saved.length})`, `Deine Grabbelkiste öffnen (${saved.length})`)}
        title={tr('Your Grabbelkiste', 'Deine Grabbelkiste')}
        className="rm-ticker-box"
      >
        <BoxIcon />
        <span key={bump} className={`rm-ticker-count ${bump ? 'is-bumped' : ''}`}>{saved.length}</span>
        <span className="rm-ticker-box-label">{tr('Box', 'Kiste')}</span>
      </button>
      <div
        className="rm-ticker-viewport"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        <div ref={trackRef} className="rm-ticker-track">
          <ul ref={copyRef} className="rm-ticker-copy">
            {run.map((item) => (
              <Entry key={item.id} item={item} saved={saved.includes(item.id)} copy={false} onToggle={toggle} onOpen={setInfoItem} />
            ))}
          </ul>
          {/* The same run once more, so the loop has no gap. */}
          <ul aria-hidden="true" className="rm-ticker-copy rm-ticker-copy-2">
            {run.map((item) => (
              <Entry key={item.id} item={item} saved={saved.includes(item.id)} copy onToggle={toggle} onOpen={setInfoItem} />
            ))}
          </ul>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? tr('Let the ticker run', 'Laufband weiterlaufen lassen') : tr('Stop the ticker', 'Laufband anhalten')}
        className="rm-ticker-pause"
      >
        {paused ? (
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" /></svg>
        )}
      </button>
      <p aria-live="polite" className="sr-only">{announce}</p>
      {/* Portalled: the pinned ticker is its own layer below the top bar. */}
      {infoItem && createPortal(
        <InfoModal item={infoItem} saved={saved.includes(infoItem.id)} onToggle={toggle} onClose={closeInfo} />,
        document.body
      )}
      {boxOpen && createPortal(<GrabbelkisteModal ids={saved} onClose={closeBox} />, document.body)}
    </section>
  );
};
