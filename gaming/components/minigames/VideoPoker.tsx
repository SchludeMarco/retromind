import React, { useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys } from './shared';
import { Card, flick, newDeck, PlayingCard } from './cards';

// Video poker like the cabinets in the casino corner of the old arcades
// ("Jacks or Better"): bet 1 to 5 credits, get five cards, tap the ones to
// keep, draw once. A pair of jacks or better pays. A session is 20 hands
// with 100 play credits (no real money, nothing to buy); the credits left at
// the end go on the high score table.

const START = 100;
const HANDS = 20;
const MAX_BET = 5;

type HandId = 'royal' | 'sflush' | 'four' | 'full' | 'flush' | 'straight' | 'three' | 'twopair' | 'jacks';

/** Pay per credit bet; the royal flush pays extra at 5 credits, like on the real machines. */
const PAYTABLE: { id: HandId; name: () => string; pays: number }[] = [
  { id: 'royal', name: () => tr('ROYAL FLUSH', 'ROYAL FLUSH'), pays: 250 },
  { id: 'sflush', name: () => tr('STRAIGHT FLUSH', 'STRAIGHT FLUSH'), pays: 50 },
  { id: 'four', name: () => tr('FOUR OF A KIND', 'VIERLING'), pays: 25 },
  { id: 'full', name: () => tr('FULL HOUSE', 'FULL HOUSE'), pays: 9 },
  { id: 'flush', name: () => tr('FLUSH', 'FLUSH'), pays: 6 },
  { id: 'straight', name: () => tr('STRAIGHT', 'STRASSE'), pays: 4 },
  { id: 'three', name: () => tr('THREE OF A KIND', 'DRILLING'), pays: 3 },
  { id: 'twopair', name: () => tr('TWO PAIR', 'ZWEI PAARE'), pays: 2 },
  { id: 'jacks', name: () => tr('JACKS OR BETTER', 'BUBEN ODER BESSER'), pays: 1 },
];

const payout = (id: HandId, bet: number) => (id === 'royal' && bet === MAX_BET ? 4000 : PAYTABLE.find((p) => p.id === id)!.pays * bet);

/** The best paying hand among five cards, or null. */
export function evaluate(hand: Card[]): HandId | null {
  const counts = new Map<number, number>();
  hand.forEach((c) => counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1));
  const groups = [...counts.values()].sort((a, b) => b - a);
  const flush = hand.every((c) => c.suit === hand[0].suit);
  const ranks = [...counts.keys()].sort((a, b) => a - b);
  const broadway = ranks.join() === '1,10,11,12,13';
  const straight = counts.size === 5 && (ranks[4] - ranks[0] === 4 || broadway);
  if (straight && flush) return broadway ? 'royal' : 'sflush';
  if (groups[0] === 4) return 'four';
  if (groups[0] === 3 && groups[1] === 2) return 'full';
  if (flush) return 'flush';
  if (straight) return 'straight';
  if (groups[0] === 3) return 'three';
  if (groups[0] === 2 && groups[1] === 2) return 'twopair';
  if (groups[0] === 2) {
    const pair = [...counts.entries()].find(([, n]) => n === 2)![0];
    if (pair === 1 || pair >= 11) return 'jacks';
  }
  return null;
}

type Phase = 'bet' | 'hold' | 'over';

export const VideoPoker: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [credits, setCredits] = useState(START);
  const [bet, setBet] = useState(1);
  const [hand, setHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [phase, setPhase] = useState<Phase>('bet');
  const [played, setPlayed] = useState(0);
  const [last, setLast] = useState<{ id: HandId | null; won: number } | null>(null);
  const [dealt, setDealt] = useState(0); // bumps on every deal/draw so the animation replays
  const [drawn, setDrawn] = useState<boolean[]>([true, true, true, true, true]);
  const [result, setResult] = useState<{ credits: number; record: boolean } | null>(null);

  const deal = () => {
    if (phase !== 'bet' || bet > credits) return;
    const d = newDeck();
    setHand(d.slice(0, 5));
    setDeck(d.slice(5));
    setHeld([false, false, false, false, false]);
    setDrawn([true, true, true, true, true]);
    setCredits(credits - bet);
    setLast(null);
    setDealt((n) => n + 1);
    setPhase('hold');
    for (let i = 0; i < 5; i++) window.setTimeout(() => flick(i), i * 70);
  };

  const toggle = (i: number) => {
    if (phase !== 'hold') return;
    chip.play(held[i] ? 'back' : 'blip');
    setHeld(held.map((h, k) => (k === i ? !h : h)));
  };

  const finish = (left: number) => {
    setPhase('over');
    const record = saveBest('poker', left, true);
    setResult({ credits: left, record });
    if (left > START) onWin();
  };

  const draw = () => {
    if (phase !== 'hold') return;
    let k = 0;
    const next = hand.map((c, i) => (held[i] ? c : deck[k++]));
    setHand(next);
    setDrawn(held.map((h) => !h));
    setDealt((n) => n + 1);
    held.forEach((h, i) => !h && window.setTimeout(() => flick(i), i * 70));
    const id = evaluate(next);
    const won = id ? payout(id, bet) : 0;
    const left = credits + won;
    setCredits(left);
    setLast({ id, won });
    const n = played + 1;
    setPlayed(n);
    window.setTimeout(() => chip.play(!id ? 'error' : id === 'royal' || id === 'sflush' || id === 'four' ? 'powerup' : 'coin'), 380);
    if (n >= HANDS || left < 1) window.setTimeout(() => finish(left), 900);
    else {
      setPhase('bet');
      if (bet > left) setBet(Math.max(1, Math.min(MAX_BET, left)));
    }
  };

  const again = () => {
    chip.play('select');
    setCredits(START);
    setBet(1);
    setHand([]);
    setPlayed(0);
    setLast(null);
    setResult(null);
    setPhase('bet');
  };

  const changeBet = (b: number) => {
    if (phase !== 'bet') return;
    const v = Math.max(1, Math.min(MAX_BET, credits, b));
    if (v !== bet) chip.play('blip');
    setBet(v);
  };

  useGameKeys((e, down) => {
    if (!down) return false;
    if (/^[1-5]$/.test(e.key) && phase === 'hold') {
      toggle(Number(e.key) - 1);
      return true;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      if (phase === 'bet') deal();
      else if (phase === 'hold') draw();
      else return false;
      return true;
    }
    if ((e.key === '+' || e.key === 'ArrowUp') && phase === 'bet') {
      changeBet(bet + 1);
      return true;
    }
    if ((e.key === '-' || e.key === 'ArrowDown') && phase === 'bet') {
      changeBet(bet - 1);
      return true;
    }
    return false;
  });

  const winRow = last?.id ?? null;

  return (
    <>
      <p className="mini-score" aria-live="polite">
        {tr('Credits', 'Credits')}: <b>{credits}</b> · {tr('Hand', 'Hand')} {Math.min(played + (phase === 'hold' ? 1 : phase === 'bet' ? 1 : 0), HANDS)}/{HANDS}
        {last && (last.id ? ` · ${PAYTABLE.find((p) => p.id === last.id)!.name()} +${last.won}` : ` · ${tr('no win', 'kein Gewinn')}`)}
      </p>
      <table className="vp-table pixel-font" aria-label={tr('Pay table', 'Gewinntabelle')}>
        <tbody>
          {PAYTABLE.map((p) => (
            <tr key={p.id} className={winRow === p.id && phase !== 'hold' ? 'hit' : undefined}>
              <th scope="row">{p.name()}</th>
              <td>{payout(p.id, bet)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="vp-hand">
        {(hand.length ? hand : Array<Card | null>(5).fill(null)).map((c, i) => (
          <div key={`${dealt}-${i}`} className="vp-slot">
            <PlayingCard
              card={c}
              held={held[i]}
              dim={phase !== 'hold' && !!last && !last.id}
              delay={c && drawn[i] ? i * 70 : undefined}
              onClick={phase === 'hold' ? () => toggle(i) : undefined}
              label={c ? undefined : tr('empty', 'leer')}
            />
            <span className={`vp-hold pixel-font${held[i] && phase === 'hold' ? ' on' : ''}`} aria-hidden="true">
              {tr('HOLD', 'HALTEN')}
            </span>
          </div>
        ))}
      </div>
      {phase !== 'over' && (
        <div className="vp-controls">
          <div className="vp-bet" role="group" aria-label={tr('Bet', 'Einsatz')}>
            <span className="dim">{tr('Bet', 'Einsatz')}</span>
            {[1, 2, 3, 4, 5].map((b) => (
              <button key={b} className={`px-btn${b === bet ? ' on' : ''}`} onClick={() => changeBet(b)} disabled={phase !== 'bet' || b > credits} data-nav aria-pressed={b === bet}>
                {b}
              </button>
            ))}
          </div>
          {phase === 'bet' ? (
            <button className="px-btn big" onClick={deal} data-nav autoFocus>
              {tr('▶ DEAL', '▶ GEBEN')}
            </button>
          ) : (
            <button className="px-btn big" onClick={draw} data-nav>
              {tr('▶ DRAW', '▶ ZIEHEN')}
            </button>
          )}
          <p className="dim vp-hint">
            {phase === 'hold'
              ? tr('Tap the cards you want to keep, then draw.', 'Tippe die Karten an, die du behalten willst, dann ziehen.')
              : tr('Play credits only, no real money. 5 credits make the royal flush pay 4000.', 'Nur Spielgeld, kein echtes Geld. Mit 5 Credits zahlt der Royal Flush 4000.')}
          </p>
        </div>
      )}
      {result && (
        <Done
          title={result.credits > START ? tr('CASHED OUT!', 'AUSGEZAHLT!') : tr('GAME OVER', 'SPIEL VORBEI')}
          text={tr(`You finished with ${result.credits} credits (started with ${START}).`, `Du hast ${result.credits} Credits übrig (Start: ${START}).`)}
          record={result.record}
          onAgain={again}
          board={{ game: 'poker', score: result.credits }}
        />
      )}
    </>
  );
};

export const pokerBest = (n: number) => tr(`Best: ${n} credits`, `Bestes Spiel: ${n} Credits`);
