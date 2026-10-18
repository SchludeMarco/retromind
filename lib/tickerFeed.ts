import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getLang } from './i18n';

// The endless feed behind every ticker in both apps (Marco, 2026-10-18):
// "immer neues Material laden, wenn man weiter geht, und genügend Meldungen
// im Cache, um sie wieder zu holen". The ticker (components/TickerTrack.tsx)
// asks for more whenever little is left ahead of it; the feed deals the next
// entries from a shuffled deck of everything it has, and once that deck runs
// low it fetches fresh ones (from the AI, where the app offers that) in the
// background, so the deck is never just the same few again.
//
// What was on screen is kept: in memory up to MAX_ITEMS (dragging back brings
// them back), and the last KEEP_SEEN on this device, so after a reload the
// entries from the last visit are still there to the left of the new ones.
// Stored under "retromind.ticker.*", which stays on the device (lib/sync.ts):
// it changes all the time and would only make other devices reload.

export interface FeedItem {
  id: string;
}

/** One place in the run; the same item can come round again later. */
export interface FeedSlot<T> {
  seq: number;
  item: T;
}

export interface FeedSource<T extends FeedItem> {
  /** Storage name, e.g. "zeitreise" → retromind.ticker.zeitreise. */
  key: string;
  /** Everything that can run, in the current language (loaded fresh ones included). */
  pool: () => T[];
  /** The order to deal a full deck in (default: shuffled). */
  order?: (pool: T[]) => T[];
  /** Fresh entries from somewhere else; they should join `pool` from then on. */
  more?: (recent: T[]) => Promise<T[]>;
  /** Whether a stored entry can still be shown (e.g. it still exists). */
  valid?: (item: T) => boolean;
}

const MAX_ITEMS = 160;
const KEEP_SEEN = 60;
const BATCH = 8;
/** Fresh entries are fetched at most this often per visit. */
const MAX_FETCHES = 12;

export function shuffle<T>(list: T[]): T[] {
  const b = [...list];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const storeKey = (key: string) => `retromind.ticker.${key}`;

function loadSeen<T>(key: string): T[] {
  try {
    const raw = JSON.parse(localStorage.getItem(storeKey(key)) || 'null');
    if (raw && raw.lang === getLang() && Array.isArray(raw.items)) return raw.items as T[];
  } catch {
    /* storage unavailable or broken: start fresh */
  }
  return [];
}

function saveSeen<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(storeKey(key), JSON.stringify({ lang: getLang(), items: items.slice(-KEEP_SEEN) }));
  } catch {
    /* storage full or unavailable: only this visit keeps them */
  }
}

export interface TickerFeed<T> {
  slots: FeedSlot<T>[];
  /** Where the run starts: the first entry not shown on the last visit. */
  startSeq: number;
  /** Call when little is left ahead; deals the next batch. */
  needMore: () => void;
  /** Call with the furthest entry that has been on screen. */
  reached: (seq: number) => void;
}

export function useTickerFeed<T extends FeedItem>(source: FeedSource<T>): TickerFeed<T> {
  const src = useRef(source);
  src.current = source;
  const seqRef = useRef(0);
  const deck = useRef<T[]>([]);
  const fetching = useRef(false);
  /** One fetch per round through the deck, near its end. */
  const fetchedThisRound = useRef(false);
  const fetches = useRef(0);
  const furthest = useRef(-1);

  const deal = useCallback((count: number, recent: T[]): T[] => {
    const out: T[] = [];
    const avoid = new Set(recent.slice(-12).map((i) => i.id));
    let guard = 0;
    while (out.length < count && guard++ < count * 4) {
      if (!deck.current.length) {
        const pool = src.current.pool();
        if (!pool.length) break;
        // A new round: what just ran past doesn't come straight back.
        const fresh = pool.filter((i) => !avoid.has(i.id));
        deck.current = (src.current.order ?? shuffle)(fresh.length >= count ? fresh : pool);
        fetchedThisRound.current = false;
      }
      const next = deck.current.shift()!;
      if (!out.some((i) => i.id === next.id)) out.push(next);
    }
    return out;
  }, []);

  const [state, setState] = useState(() => {
    const valid = source.valid ?? (() => true);
    const seen = loadSeen<T>(source.key).filter(valid);
    const slots: FeedSlot<T>[] = seen.map((item) => ({ seq: seqRef.current++, item }));
    const startSeq = seqRef.current;
    deal(BATCH * 2, seen).forEach((item) => slots.push({ seq: seqRef.current++, item }));
    return { slots, startSeq };
  });
  const slotsRef = useRef(state.slots);
  slotsRef.current = state.slots;

  const fetchMore = useCallback(() => {
    const more = src.current.more;
    if (!more || fetching.current || fetchedThisRound.current || fetches.current >= MAX_FETCHES) return;
    fetching.current = true;
    fetchedThisRound.current = true;
    fetches.current++;
    more(slotsRef.current.map((s) => s.item))
      .then((fresh) => {
        const known = new Set(deck.current.map((i) => i.id));
        // Fresh ones go to the front of the deck, so they come up next;
        // from the next round on they are part of the pool.
        deck.current = [...shuffle(fresh.filter((i) => !known.has(i.id))), ...deck.current];
      })
      .catch(() => {
        // No AI right now: the deck simply goes round again.
        fetches.current = MAX_FETCHES;
      })
      .finally(() => {
        fetching.current = false;
      });
  }, []);

  const needMore = useCallback(() => {
    const add = deal(BATCH, slotsRef.current.map((s) => s.item));
    if (!add.length) return;
    const added = add.map((item) => ({ seq: seqRef.current++, item }));
    setState((prev) => {
      // The oldest fall off the front once there are plenty; the ticker
      // keeps its place (TickerTrack re-anchors on what is still there).
      let slots = [...prev.slots, ...added];
      if (slots.length > MAX_ITEMS) slots = slots.slice(slots.length - MAX_ITEMS);
      return { ...prev, slots };
    });
    if (deck.current.length < BATCH * 2) fetchMore();
  }, [deal, fetchMore]);

  const reached = useCallback(
    (seq: number) => {
      if (seq <= furthest.current) return;
      furthest.current = seq;
      saveSeen(
        src.current.key,
        slotsRef.current.filter((s) => s.seq <= seq).map((s) => s.item)
      );
    },
    []
  );

  // A changed pool (another decade) starts a fresh deck.
  const poolFn = source.pool;
  useEffect(() => {
    deck.current = [];
  }, [poolFn]);

  return useMemo(
    () => ({ slots: state.slots, startSeq: state.startSeq, needMore, reached }),
    [state, needMore, reached]
  );
}
