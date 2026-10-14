import React from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { shuffle } from './shared';

// The deck the card games share (video poker, blackjack, solitaire): 52 cards
// drawn in HTML, so they stay sharp at every size and need no images. The
// card face keeps its paper white and red/black in every palette; the back
// takes the palette's accent colour.

export type Suit = 'S' | 'H' | 'D' | 'C';
export interface Card {
  /** 1 = ace … 11 = jack, 12 = queen, 13 = king. */
  rank: number;
  suit: Suit;
}

export const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
const SUIT_SIGN: Record<Suit, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };
const SUIT_NAME: Record<Suit, () => string> = {
  S: () => tr('spades', 'Pik'),
  H: () => tr('hearts', 'Herz'),
  D: () => tr('diamonds', 'Karo'),
  C: () => tr('clubs', 'Kreuz'),
};

export const isRed = (c: Card) => c.suit === 'H' || c.suit === 'D';

export function rankLabel(rank: number): string {
  if (rank === 1) return 'A';
  if (rank === 11) return tr('J', 'B');
  if (rank === 12) return tr('Q', 'D');
  if (rank === 13) return 'K';
  return String(rank);
}

function rankName(rank: number): string {
  if (rank === 1) return tr('ace', 'Ass');
  if (rank === 11) return tr('jack', 'Bube');
  if (rank === 12) return tr('queen', 'Dame');
  if (rank === 13) return tr('king', 'König');
  return String(rank);
}

/** "queen of hearts" / "Herz Dame", for screen readers. */
export const cardName = (c: Card) => tr(`${rankName(c.rank)} of ${SUIT_NAME[c.suit]()}`, `${SUIT_NAME[c.suit]()} ${rankName(c.rank)}`);

export function newDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit });
  return shuffle(deck);
}

/** The soft "flick" of a card landing on the felt. */
export function flick(i = 0) {
  chip.softNote(['G5', 'A5', 'B5', 'D6', 'E6', 'G6', 'A6'][i % 7], 0.06);
}

/**
 * One playing card. Without `card` (or with `down`) it shows its back.
 * Clickable when `onClick` is given; `delay` staggers the deal animation.
 */
export const PlayingCard: React.FC<{
  card?: Card | null;
  down?: boolean;
  selected?: boolean;
  held?: boolean;
  dim?: boolean;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  onClick?: () => void;
}> = ({ card, down, selected, held, dim, delay, className, style, label, onClick }) => {
  const faceUp = !!card && !down;
  const cls = [
    'pcard',
    faceUp ? (isRed(card!) ? 'red' : 'black') : 'back',
    selected ? 'sel' : '',
    held ? 'held' : '',
    dim ? 'dim' : '',
    delay !== undefined ? 'deal' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  const css = delay !== undefined ? { ...style, animationDelay: `${delay}ms` } : style;
  const inner = faceUp ? (
    <>
      <span className="pc-corner" aria-hidden="true">
        {rankLabel(card!.rank)}
        <br />
        {SUIT_SIGN[card!.suit]}
      </span>
      <span className="pc-pip" aria-hidden="true">
        {card!.rank > 10 ? rankLabel(card!.rank) : SUIT_SIGN[card!.suit]}
      </span>
    </>
  ) : null;
  const name = label ?? (faceUp ? cardName(card!) : tr('face-down card', 'verdeckte Karte'));
  return onClick ? (
    <button className={cls} style={css} onClick={onClick} data-nav aria-label={name} aria-pressed={selected || held || undefined}>
      {inner}
    </button>
  ) : (
    <span className={cls} style={css} role="img" aria-label={name}>
      {inner}
    </span>
  );
};
