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
// which opens a list of everything collected.
//
// Easy on older eyes and hands: it moves slowly, stops while a finger or the
// mouse is on it or a disk has keyboard focus, has its own pause button
// (WCAG 2.2.2), and for people who turned motion off it is a still row that
// can be swiped sideways. Retro Warm pins it just above the bottom
// navigation; the other designs show it at the end of the start page.
// Styles in index.css (.rm-ticker).

const PX_PER_SECOND = 38;

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

const Entry: React.FC<{ item: TickerItem; saved: boolean; copy: boolean; onToggle: (item: TickerItem) => void }> = ({
  item, saved, copy, onToggle,
}) => (
  <li className="rm-ticker-entry">
    <span>{item.text}</span>
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

const GrabbelkisteModal: React.FC<{ ids: string[]; onClose: () => void }> = ({ ids, onClose }) => {
  const items = ids.map(tickerItem).filter((i): i is TickerItem => !!i);
  return (
    <Modal onClose={onClose} label={tr('Your Grabbelkiste', 'Deine Grabbelkiste')}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="text-2xl m-0 flex items-center gap-2">
          <BoxIcon className="w-7 h-7 text-retro-amber-dark" />
          {tr('Your Grabbelkiste', 'Deine Grabbelkiste')}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={tr('Close', 'Schließen')}
          className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-2xl leading-none hover:bg-retro-highlight"
        >
          ✕
        </button>
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
                  {decadeLabel(item.decade)} · {item.kind === 'saying' ? tr('Saying', 'Spruch') : tr('Back then', 'Damals')}
                </span>
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
  const [bump, setBump] = useState(0);
  const [announce, setAnnounce] = useState('');
  const copyRef = useRef<HTMLUListElement>(null);
  const [seconds, setSeconds] = useState(60);

  // The speed stays the same however long the run or wide the screen.
  useLayoutEffect(() => {
    const el = copyRef.current;
    if (!el) return;
    const measure = () => setSeconds(Math.max(20, el.scrollWidth / PX_PER_SECOND));
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [run]);

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

  const stopped = paused || held;
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
      >
        <div
          className={`rm-ticker-track ${stopped ? 'is-paused' : ''}`}
          style={{ animationDuration: `${seconds}s` }}
        >
          <ul ref={copyRef} className="rm-ticker-copy">
            {run.map((item) => (
              <Entry key={item.id} item={item} saved={saved.includes(item.id)} copy={false} onToggle={toggle} />
            ))}
          </ul>
          {/* The same run once more, so the loop has no gap. */}
          <ul aria-hidden="true" className="rm-ticker-copy rm-ticker-copy-2">
            {run.map((item) => (
              <Entry key={item.id} item={item} saved={saved.includes(item.id)} copy onToggle={toggle} />
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
      {boxOpen && createPortal(<GrabbelkisteModal ids={saved} onClose={closeBox} />, document.body)}
    </section>
  );
};
