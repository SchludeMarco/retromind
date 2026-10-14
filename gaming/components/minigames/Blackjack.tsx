import React, { useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys } from './shared';
import { Card, flick, newDeck, PlayingCard } from './cards';

// Blackjack (17 und 4) against the dealer: get closer to 21 than the dealer
// without going over. Hit, stand or double down on the first two cards; the
// dealer draws to 16 and stands on every 17. A blackjack pays 3 to 2. A
// session is 10 hands with 100 play chips (no real money); the chips left
// go on the high score table.

const START = 100;
const HANDS = 10;
const BETS = [5, 10, 25, 50];
const STEP = 520; // ms between the dealer's cards

/** Best total of a hand, and whether an ace still counts 11 ("soft"). */
export function total(hand: Card[]): { value: number; soft: boolean } {
  let value = 0;
  let aces = 0;
  for (const c of hand) {
    value += Math.min(c.rank, 10);
    if (c.rank === 1) aces++;
  }
  const soft = aces > 0 && value + 10 <= 21;
  return { value: soft ? value + 10 : value, soft };
}

const isBlackjack = (hand: Card[]) => hand.length === 2 && total(hand).value === 21;

type Phase = 'bet' | 'play' | 'dealer' | 'done' | 'over';
type Outcome = 'blackjack' | 'win' | 'push' | 'lose' | 'bust' | 'dealerbj';

const OUTCOME_TEXT: Record<Outcome, () => string> = {
  blackjack: () => tr('BLACKJACK! Pays 3 to 2.', 'BLACKJACK! Zahlt 3 zu 2.'),
  win: () => tr('You win!', 'Gewonnen!'),
  push: () => tr('Push: you get your bet back.', 'Unentschieden: Einsatz zurück.'),
  lose: () => tr('The dealer wins.', 'Die Bank gewinnt.'),
  bust: () => tr('Bust! Over 21.', 'Überkauft! Über 21.'),
  dealerbj: () => tr('The dealer has blackjack.', 'Die Bank hat Blackjack.'),
};

export const Blackjack: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [chips, setChips] = useState(START);
  const [bet, setBet] = useState(10);
  const [stake, setStake] = useState(0); // what is on the table this hand (doubles on double down)
  const [deck, setDeck] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [shown, setShown] = useState(1); // dealer cards face up
  const [phase, setPhase] = useState<Phase>('bet');
  const [played, setPlayed] = useState(0);
  const [outcome, setOutcome] = useState<{ kind: Outcome; delta: number } | null>(null);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ chips: number; record: boolean } | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  /** Pays out (stake already taken from the chips) and moves on. */
  const settle = (kind: Outcome, staked: number, chipsNow: number) => {
    const back = kind === 'blackjack' ? staked + Math.floor(staked * 1.5) : kind === 'win' ? staked * 2 : kind === 'push' ? staked : 0;
    const left = chipsNow + back;
    setChips(left);
    setOutcome({ kind, delta: back - staked });
    setPhase('done');
    chip.play(kind === 'blackjack' ? 'powerup' : kind === 'win' ? 'coin' : kind === 'push' ? 'blip' : 'error');
    const n = played + 1;
    setPlayed(n);
    if (n >= HANDS || left < BETS[0]) {
      later(() => {
        setPhase('over');
        const record = saveBest('blackjack', left, true);
        setResult({ chips: left, record });
        if (left > START) onWin();
      }, 1100);
    } else if (bet > left) setBet([...BETS].reverse().find((b) => b <= left) ?? BETS[0]);
  };

  const deal = () => {
    if ((phase !== 'bet' && phase !== 'done') || bet > chips) return;
    chip.play('select');
    // A fresh shuffled deck every hand: simple, and no card counting.
    const d = newDeck();
    const p = [d[0], d[2]];
    const dl = [d[1], d[3]];
    const left = chips - bet;
    setDeck(d.slice(4));
    setPlayer(p);
    setDealer(dl);
    setShown(1);
    setStake(bet);
    setChips(left);
    setOutcome(null);
    setRound((r) => r + 1);
    for (let i = 0; i < 4; i++) later(() => flick(i), i * 90);
    if (isBlackjack(dl) || isBlackjack(p)) {
      setPhase('dealer');
      later(() => {
        setShown(2);
        flick(5);
        settle(isBlackjack(p) ? (isBlackjack(dl) ? 'push' : 'blackjack') : 'dealerbj', bet, left);
      }, 700);
    } else setPhase('play');
  };

  /** The dealer turns the hole card and draws to 17, one card at a time. */
  const dealerPlays = (p: Card[], d: Card[], staked: number, chipsNow: number) => {
    setPhase('dealer');
    const hand = [...dealer];
    let k = 0;
    while (total(hand).value < 17) hand.push(d[k++]);
    setDealer(hand);
    for (let i = 2; i <= hand.length; i++)
      later(() => {
        setShown(i);
        flick(i);
      }, (i - 1) * STEP);
    later(() => {
      const me = total(p).value;
      const them = total(hand).value;
      settle(them > 21 || me > them ? 'win' : me === them ? 'push' : 'lose', staked, chipsNow);
    }, hand.length * STEP);
  };

  const hit = () => {
    if (phase !== 'play') return;
    const p = [...player, deck[0]];
    const d = deck.slice(1);
    setPlayer(p);
    setDeck(d);
    flick(p.length);
    const v = total(p).value;
    if (v > 21) {
      setShown(2);
      later(() => settle('bust', stake, chips), 350);
    } else if (v === 21) later(() => dealerPlays(p, d, stake, chips), 300);
  };

  const stand = () => {
    if (phase !== 'play') return;
    chip.play('blip');
    dealerPlays(player, deck, stake, chips);
  };

  const canDouble = phase === 'play' && player.length === 2 && chips >= stake;
  const double = () => {
    if (!canDouble) return;
    const staked = stake * 2;
    const left = chips - stake;
    const p = [...player, deck[0]];
    const d = deck.slice(1);
    setStake(staked);
    setChips(left);
    setPlayer(p);
    setDeck(d);
    flick(3);
    if (total(p).value > 21) {
      setShown(2);
      later(() => settle('bust', staked, left), 350);
    } else later(() => dealerPlays(p, d, staked, left), 400);
  };

  const again = () => {
    chip.play('select');
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setChips(START);
    setBet(10);
    setPlayer([]);
    setDealer([]);
    setPlayed(0);
    setOutcome(null);
    setResult(null);
    setPhase('bet');
  };

  useGameKeys((e, down) => {
    if (!down) return false;
    const k = e.key.toLowerCase();
    if (phase === 'play' && (k === 'h' || k === 'k')) hit();
    else if (phase === 'play' && (k === 's' || k === 'b')) stand();
    else if (phase === 'play' && (k === 'd' || k === 'v')) double();
    else if ((phase === 'bet' || phase === 'done') && (k === 'enter' || k === ' ')) deal();
    else return false;
    return true;
  });

  const pv = total(player);
  const dealerVisible = dealer.slice(0, shown);
  const dv = total(dealerVisible);
  const betting = phase === 'bet' || phase === 'done';

  return (
    <>
      <p className="mini-score" aria-live="polite">
        {tr('Chips', 'Chips')}: <b>{chips}</b> · {tr('Hand', 'Hand')} {Math.min(played + (phase === 'done' || phase === 'over' ? 0 : 1), HANDS)}/{HANDS}
        {stake > 0 && !betting && phase !== 'over' && ` · ${tr('Bet', 'Einsatz')} ${stake}`}
      </p>
      <div className="bj-table">
        <div className="bj-row">
          <span className="bj-label pixel-font">
            {tr('DEALER', 'BANK')}
            {dealer.length > 0 && <b> {dv.value}</b>}
          </span>
          <div className="bj-cards">
            {dealer.length === 0 && <PlayingCard label={tr('empty', 'leer')} className="ghost" />}
            {dealer.map((c, i) => (
              <PlayingCard key={`${round}-d${i}`} card={c} down={i >= shown} delay={i < 2 ? (i * 2 + 1) * 90 : 0} />
            ))}
          </div>
        </div>
        <p className={`bj-outcome pixel-font${outcome ? ` ${outcome.delta > 0 ? 'up' : outcome.delta < 0 ? 'down' : ''}` : ''}`} aria-live="polite">
          {outcome ? `${OUTCOME_TEXT[outcome.kind]()} ${outcome.delta > 0 ? `+${outcome.delta}` : outcome.delta < 0 ? outcome.delta : ''}` : phase === 'bet' && !player.length ? tr('Place your bet', 'Setz deinen Einsatz') : ' '}
        </p>
        <div className="bj-row">
          <span className="bj-label pixel-font">
            {tr('YOU', 'DU')}
            {player.length > 0 && (
              <b>
                {' '}
                {pv.value}
                {pv.soft && pv.value < 21 ? tr(' soft', ' weich') : ''}
              </b>
            )}
          </span>
          <div className="bj-cards">
            {player.length === 0 && <PlayingCard label={tr('empty', 'leer')} className="ghost" />}
            {player.map((c, i) => (
              <PlayingCard key={`${round}-p${i}`} card={c} delay={i < 2 ? i * 2 * 90 : 0} />
            ))}
          </div>
        </div>
      </div>
      {phase !== 'over' && (
        <div className="bj-controls">
          {betting ? (
            <>
              <div className="vp-bet" role="group" aria-label={tr('Bet', 'Einsatz')}>
                <span className="dim">{tr('Bet', 'Einsatz')}</span>
                {BETS.map((b) => (
                  <button
                    key={b}
                    className={`px-btn${b === bet ? ' on' : ''}`}
                    onClick={() => {
                      chip.play('blip');
                      setBet(b);
                    }}
                    disabled={b > chips}
                    data-nav
                    aria-pressed={b === bet}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <button className="px-btn big" onClick={deal} data-nav autoFocus>
                {tr('▶ DEAL', '▶ GEBEN')}
              </button>
            </>
          ) : (
            <div className="bj-actions">
              <button className="px-btn big" onClick={hit} disabled={phase !== 'play'} data-nav autoFocus>
                {tr('HIT', 'KARTE')}
              </button>
              <button className="px-btn big" onClick={stand} disabled={phase !== 'play'} data-nav>
                {tr('STAND', 'HALTEN')}
              </button>
              <button className="px-btn big" onClick={double} disabled={!canDouble} data-nav>
                {tr('DOUBLE', 'VERDOPPELN')}
              </button>
            </div>
          )}
          <p className="dim vp-hint">{tr('Play chips only, no real money. The dealer stands on 17.', 'Nur Spielgeld, kein echtes Geld. Die Bank bleibt ab 17 stehen.')}</p>
        </div>
      )}
      {result && (
        <Done
          title={result.chips > START ? tr('YOU BEAT THE BANK!', 'BANK GESPRENGT!') : tr('GAME OVER', 'SPIEL VORBEI')}
          text={tr(`You finished with ${result.chips} chips (started with ${START}).`, `Du hast ${result.chips} Chips übrig (Start: ${START}).`)}
          record={result.record}
          onAgain={again}
          board={{ game: 'blackjack', score: result.chips }}
        />
      )}
    </>
  );
};

export const blackjackBest = (n: number) => tr(`Best: ${n} chips`, `Bestes Spiel: ${n} Chips`);
