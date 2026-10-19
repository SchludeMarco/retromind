import React, { useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest } from './shared';
import { Card, flick, isRed, newDeck, PlayingCard, SUITS } from './cards';

// Solitaire (Klondike), the card game that came with every Windows PC:
// build the four suits up from ace to king. Tap a card to pick it up, then
// tap where it should go; tap it a second time and it goes to the best place
// on its own (up to its suit pile if it can). The stock turns one card at a
// time and can be gone through as often as you like. Undo is always allowed,
// it's meant to relax. Best time counts.

interface Slot {
  card: Card;
  up: boolean;
}
interface State {
  stock: Card[];
  waste: Card[];
  /** One pile per suit, in SUITS order. */
  found: Card[][];
  tab: Slot[][];
  moves: number;
}
type Pick = { from: 'waste' } | { from: 'found'; pile: number } | { from: 'tab'; col: number; idx: number };
type Target = { to: 'found'; pile: number } | { to: 'tab'; col: number };

function dealGame(): State {
  const deck = newDeck();
  const tab: Slot[][] = [];
  let k = 0;
  for (let col = 0; col < 7; col++) {
    tab.push([]);
    for (let row = 0; row <= col; row++) tab[col].push({ card: deck[k++], up: row === col });
  }
  return { stock: deck.slice(k), waste: [], found: [[], [], [], []], tab, moves: 0 };
}

const top = <T,>(a: T[]): T | undefined => a[a.length - 1];

/** The cards a pick takes along (a tableau pick takes everything below it). */
function picked(s: State, p: Pick): Card[] {
  if (p.from === 'waste') return s.waste.length ? [top(s.waste)!] : [];
  if (p.from === 'found') return s.found[p.pile].length ? [top(s.found[p.pile])!] : [];
  return s.tab[p.col].slice(p.idx).map((x) => x.card);
}

function legal(s: State, cards: Card[], t: Target): boolean {
  const c = cards[0];
  if (!c) return false;
  if (t.to === 'found') {
    if (cards.length !== 1 || SUITS.indexOf(c.suit) !== t.pile) return false;
    return s.found[t.pile].length === c.rank - 1;
  }
  const under = top(s.tab[t.col]);
  if (!under) return c.rank === 13;
  return under.up && isRed(under.card) !== isRed(c) && under.card.rank === c.rank + 1;
}

/** Moves the pick to the target (assumed legal) and turns over the card it uncovers. */
function apply(s: State, p: Pick, t: Target): State {
  const cards = picked(s, p);
  const n: State = { stock: s.stock, waste: [...s.waste], found: s.found.map((f) => [...f]), tab: s.tab.map((c) => c.map((x) => ({ ...x }))), moves: s.moves + 1 };
  if (p.from === 'waste') n.waste.pop();
  else if (p.from === 'found') n.found[p.pile].pop();
  else {
    n.tab[p.col].splice(p.idx);
    const last = top(n.tab[p.col]);
    if (last) last.up = true;
  }
  if (t.to === 'found') n.found[t.pile].push(cards[0]);
  else n.tab[t.col].push(...cards.map((card) => ({ card, up: true })));
  return n;
}

/** Where a tapped-twice card goes: its suit pile first, then a column that holds it. */
function bestTarget(s: State, p: Pick): Target | null {
  const cards = picked(s, p);
  if (!cards.length) return null;
  if (p.from !== 'found') {
    const pile = SUITS.indexOf(cards[0].suit);
    if (legal(s, cards, { to: 'found', pile })) return { to: 'found', pile };
  }
  const cols = [0, 1, 2, 3, 4, 5, 6].filter((col) => !(p.from === 'tab' && p.col === col));
  // Prefer a column with cards over an empty one, and don't shuffle a king
  // that already heads a column from one empty column to the next.
  const full = cols.find((col) => s.tab[col].length && legal(s, cards, { to: 'tab', col }));
  if (full !== undefined) return { to: 'tab', col: full };
  if (p.from === 'tab' && p.idx === 0) return null;
  const empty = cols.find((col) => !s.tab[col].length && legal(s, cards, { to: 'tab', col }));
  return empty !== undefined ? { to: 'tab', col: empty } : null;
}

const won = (s: State) => s.found.every((f) => f.length === 13);
/** Everything is face up and the stock is gone: the rest can play itself. */
const solvable = (s: State) => !s.stock.length && !s.waste.length && s.tab.every((col) => col.every((x) => x.up));

const samePick = (a: Pick | null, b: Pick) => !!a && JSON.stringify(a) === JSON.stringify(b);

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

export const Solitaire: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [st, setSt] = useState<State>(dealGame);
  const [history, setHistory] = useState<State[]>([]);
  const [sel, setSel] = useState<Pick | null>(null);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ secs: number; moves: number; record: boolean } | null>(null);
  const [auto, setAuto] = useState(false);
  const started = useRef(Date.now());
  const timer = useRef<number | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const commit = (next: State) => {
    setHistory((h) => [...h.slice(-199), st]);
    setSt(next);
    setSel(null);
    if (won(next)) finish(next);
  };

  const finish = (s: State) => {
    const secs = Math.round((Date.now() - started.current) / 1000);
    chip.play('powerup');
    setAuto(false);
    setResult({ secs, moves: s.moves, record: saveBest('solitaire', secs, false) });
    onWin();
  };

  const move = (p: Pick, t: Target) => {
    const cards = picked(st, p);
    if (!legal(st, cards, t)) return false;
    if (t.to === 'found') chip.softNote(['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6', 'E6', 'F6', 'G6', 'A6'][cards[0].rank - 1], 0.14);
    else flick(cards[0].rank);
    commit(apply(st, p, t));
    return true;
  };

  const tapStock = () => {
    if (result || auto) return;
    if (st.stock.length) {
      flick(st.waste.length);
      commit({ ...st, stock: st.stock.slice(0, -1), waste: [...st.waste, top(st.stock)!], moves: st.moves + 1 });
    } else if (st.waste.length) {
      chip.play('back');
      commit({ ...st, stock: [...st.waste].reverse(), waste: [], moves: st.moves + 1 });
    } else chip.play('blip');
  };

  /** A tap on a card (or an empty spot) that can be picked up or dropped on. */
  const tap = (p: Pick | null, t: Target | null) => {
    if (result || auto) return;
    if (sel && p && samePick(sel, p)) {
      const best = bestTarget(st, sel);
      if (!best || !move(sel, best)) {
        chip.play('error');
        setSel(null);
      }
      return;
    }
    if (sel && t && move(sel, t)) return;
    if (p && picked(st, p).length) {
      chip.play('blip');
      setSel(p);
      return;
    }
    if (sel) chip.play('error');
    setSel(null);
  };

  const undo = () => {
    if (!history.length || result || auto) return;
    chip.play('back');
    setSt(top(history)!);
    setHistory(history.slice(0, -1));
    setSel(null);
  };

  // Once everything is open, the cards fly home one by one on their own.
  useEffect(() => {
    if (!auto || result) return;
    timer.current = window.setTimeout(() => {
      for (let col = 0; col < 7; col++) {
        const idx = st.tab[col].length - 1;
        if (idx < 0) continue;
        const p: Pick = { from: 'tab', col, idx };
        const pile = SUITS.indexOf(st.tab[col][idx].card.suit);
        if (move(p, { to: 'found', pile })) return;
      }
      setAuto(false);
    }, 110);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, st, result]);

  const again = () => {
    chip.play('select');
    setSt(dealGame());
    setHistory([]);
    setSel(null);
    setResult(null);
    setAuto(false);
    setRound((r) => r + 1);
    started.current = Date.now();
  };

  const isSel = (p: Pick) => samePick(sel, p);
  const selTab = sel?.from === 'tab' ? sel : null;
  const wasteTop = top(st.waste);
  const left = 52 - st.found.reduce((n, f) => n + f.length, 0);

  return (
    <>
      <p className="mini-score" aria-live="polite">
        {sel
          ? tr('Now tap where it should go, or tap it again to send it to the best place.', 'Jetzt antippen, wohin sie soll, oder nochmal tippen: Sie geht an den besten Platz.')
          : tr(`Moves: ${st.moves} · ${left} ${left === 1 ? 'card' : 'cards'} to go`, `Züge: ${st.moves} · noch ${left} ${left === 1 ? 'Karte' : 'Karten'}`)}
      </p>
      <div className="sol" key={round}>
        <div className="sol-row">
          <PlayingCard
            card={top(st.stock)}
            down
            className={st.stock.length ? '' : 'ghost recycle'}
            onClick={tapStock}
            label={st.stock.length ? tr(`Stock, ${st.stock.length} cards: turn one over`, `Stapel, ${st.stock.length} Karten: eine aufdecken`) : tr('Turn the stock over again', 'Stapel neu umdrehen')}
          />
          <PlayingCard
            key={`w${st.waste.length}`}
            card={wasteTop}
            className={wasteTop ? '' : 'ghost'}
            selected={isSel({ from: 'waste' })}
            delay={wasteTop ? 0 : undefined}
            onClick={() => tap({ from: 'waste' }, null)}
            label={wasteTop ? undefined : tr('empty', 'leer')}
          />
          <span />
          {st.found.map((f, pile) => (
            <PlayingCard
              key={pile}
              card={top(f)}
              className={f.length ? 'found' : `ghost found suit-${SUITS[pile]}`}
              selected={isSel({ from: 'found', pile })}
              onClick={() => tap(f.length ? { from: 'found', pile } : null, { to: 'found', pile })}
              label={f.length ? undefined : tr('Empty suit pile', 'Leerer Ablagestapel')}
            />
          ))}
        </div>
        <div className="sol-row sol-tab">
          {st.tab.map((col, c) => (
            <div key={c} className="sol-col">
              {col.length === 0 && <PlayingCard className="ghost" onClick={() => tap(null, { to: 'tab', col: c })} label={tr('Empty column: kings only', 'Leere Spalte: nur Könige')} />}
              {col.map((x, i) =>
                x.up ? (
                  <PlayingCard
                    key={`${x.card.suit}${x.card.rank}`}
                    card={x.card}
                    className="up"
                    selected={!!selTab && selTab.col === c && i >= selTab.idx}
                    onClick={() => tap({ from: 'tab', col: c, idx: i }, { to: 'tab', col: c })}
                  />
                ) : (
                  <PlayingCard key={`${x.card.suit}${x.card.rank}`} card={x.card} down />
                )
              )}
            </div>
          ))}
        </div>
      </div>
      {!result && (
        <div className="sol-controls">
          <button className="px-btn" onClick={undo} disabled={!history.length || auto} data-nav>
            {tr('↶ UNDO', '↶ ZURÜCK')}
          </button>
          {solvable(st) && !auto ? (
            <button
              className="px-btn big"
              onClick={() => {
                chip.play('start');
                setSel(null);
                setAuto(true);
              }}
              data-nav
              autoFocus
            >
              {tr('★ FINISH', '★ ABLEGEN')}
            </button>
          ) : (
            <button className="px-btn" onClick={again} disabled={auto} data-nav>
              {tr('NEW DEAL', 'NEU GEBEN')}
            </button>
          )}
        </div>
      )}
      {result && (
        <Done
          text={tr(`All cards home in ${fmt(result.secs)} minutes and ${result.moves} moves.`, `Alle Karten abgelegt in ${fmt(result.secs)} Minuten und ${result.moves} Zügen.`)}
          record={result.record}
          onAgain={again}
          board={{ game: 'solitaire', score: result.secs }}
        />
      )}
    </>
  );
};

export const solitaireBest = (n: number) => tr(`Best time: ${fmt(n)}`, `Bestzeit: ${fmt(n)}`);
