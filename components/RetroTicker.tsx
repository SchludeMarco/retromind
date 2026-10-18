import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { tr } from '../lib/i18n';
import { addAiTickerItems, TickerItem, tickerItem, tickerOrder, tickerPool } from '../lib/tickerItems';
import { addToGrabbelkiste, removeFromGrabbelkiste, useGrabbelkiste } from '../lib/grabbelkiste';
import { useTickerFeed } from '../lib/tickerFeed';
import { fetchTickerMore } from '../services/geminiService';
import { Modal } from './Modal';
import { BoxIcon, FloppyIcon } from './TickerIcons';
import { TickerArrow, TickerTrack, TickerTrackHandle } from './TickerTrack';

// The ticker on the start page (Marco, 2026-10-13): sayings and everyday
// things from back then run past like the news crawl on an old TV. Behind
// each one sits a floppy disk; tapping it puts the saying into the
// Grabbelkiste (lib/grabbelkiste.ts), the box at the start of the ticker,
// which opens a list of everything collected. Tapping the saying itself
// opens a little card with where it comes from.
//
// Easy on older eyes and hands: it moves slowly, stops while a finger or the
// mouse is on it or a disk has keyboard focus, and has its own pause button
// (WCAG 2.2.2). A finger (or the mouse) pushes it back and forth, the arrows
// step one entry (components/TickerTrack.tsx), and it never runs out: new
// entries keep coming, the ones already gone can be fetched back
// (lib/tickerFeed.ts, Marco 2026-10-18). Retro Warm pins it just above the
// bottom navigation; the other designs show it at the end of the start page.
// Styles in index.css (.rm-ticker).

export { BoxIcon, FloppyIcon };

const decadeLabel = (d: string) => (d ? tr(`${d}s`, `${d}er`) : 'Gaming');

const kindLabel = (item: TickerItem) =>
  item.kind === 'saying' ? tr('Saying', 'Spruch') : item.kind === 'year' ? tr('The year', 'Das Jahr') : item.kind === 'game' ? 'Fun Fact' : tr('Back then', 'Damals');

const Entry: React.FC<{
  item: TickerItem;
  saved: boolean;
  onToggle: (item: TickerItem) => void;
  onOpen: (item: TickerItem) => void;
}> = ({ item, saved, onToggle, onOpen }) => (
  <>
    {/* Tapping the saying itself tells a little more about it (Marco). */}
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={tr(`More about: ${item.text}`, `Mehr dazu: ${item.text}`)}
      className="rm-ticker-text"
    >
      {item.text}
    </button>
    <button
      type="button"
      onClick={() => onToggle(item)}
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
  </>
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
          'Everything you picked out of the tickers, here and in the gaming hall. Tap a floppy disk there to add more.',
          'Alles, was du aus den Laufbändern herausgefischt hast, hier und in der Spielhalle. Tippe dort auf eine Diskette, um mehr hineinzulegen.'
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
                {item.info && <span className="block text-sm mt-1 leading-snug">{item.info}</span>}
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
  const feed = useTickerFeed<TickerItem>({
    key: 'zeitreise',
    pool: tickerPool,
    order: (items) => tickerOrder(items, focusDecade),
    more: async (recent) => addAiTickerItems(await fetchTickerMore(focusDecade, recent.map((i) => i.text))),
    valid: (i) => !!tickerItem(i.id),
  });
  const saved = useGrabbelkiste();
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [boxOpen, setBoxOpen] = useState(false);
  const closeBox = useCallback(() => setBoxOpen(false), []);
  const [infoItem, setInfoItem] = useState<TickerItem | null>(null);
  const closeInfo = useCallback(() => setInfoItem(null), []);
  const [bump, setBump] = useState(0);
  const [announce, setAnnounce] = useState('');
  const track = useRef<TickerTrackHandle>(null);

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
      addToGrabbelkiste(item.id, item.id.startsWith('ai-') ? item : undefined);
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
      <TickerArrow dir={-1} className="rm-ticker-step" onStep={() => track.current?.step(-1)} />
      <TickerTrack
        ref={track}
        slots={feed.slots}
        startSeq={feed.startSeq}
        stopped={paused || held}
        onHold={setHeld}
        onNeedMore={feed.needMore}
        onReach={feed.reached}
        className="rm-ticker-viewport"
        listClassName="rm-ticker-copy"
        itemClassName="rm-ticker-entry"
        render={({ item }) => (
          <Entry item={item} saved={saved.includes(item.id)} onToggle={toggle} onOpen={setInfoItem} />
        )}
      />
      <TickerArrow dir={1} className="rm-ticker-step" onStep={() => track.current?.step(1)} />
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
