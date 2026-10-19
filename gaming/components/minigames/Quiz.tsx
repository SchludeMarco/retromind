import React, { useMemo, useState } from 'react';
import { GAMES, Game } from '../../data/games';
import { platformLabel } from '../../data/platforms';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, shuffle } from './shared';

// "Name that game": the short description of a game (its name blacked out),
// with platform and year, and four titles to pick from. Every right answer
// pays a coin, up to five a day. Only games with a description take part.

const ROUNDS = 5;
const DAILY_COINS = 5;
const KEY = 'retromind.gaming.quiz.v1';
const QUIZ_GAMES = GAMES.filter((g) => g.blurb);

/** Blacks out the title and its longer words, so the description doesn't give the answer away. */
function hideTitle(text: string, title: string): string {
  const words = [title, ...title.split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 3)];
  const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return words.reduce((t, w) => t.replace(new RegExp(esc(w), 'giu'), '▮▮▮'), text);
}

function coinsLeftToday(): number {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return saved.day === new Date().toDateString() ? Math.max(0, DAILY_COINS - (saved.coins ?? 0)) : DAILY_COINS;
  } catch {
    return DAILY_COINS;
  }
}
function spendCoin() {
  try {
    const day = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    const coins = saved.day === day ? (saved.coins ?? 0) + 1 : 1;
    localStorage.setItem(KEY, JSON.stringify({ day, coins }));
  } catch {
    /* storage unavailable */
  }
}

const Round: React.FC<{ game: Game; onAnswer: (right: boolean) => void }> = ({ game, onAnswer }) => {
  const [picked, setPicked] = useState<string | null>(null);
  const options = useMemo(
    () => shuffle([game, ...shuffle(GAMES.filter((g) => g.id !== game.id)).slice(0, 3)]),
    [game]
  );
  const pick = (g: Game) => {
    if (picked) return;
    setPicked(g.id);
    const right = g.id === game.id;
    chip.play(right ? 'coin' : 'error');
  };
  return (
    <>
      <div className="quiz-clue panel">
        <p className="pixel-font quiz-meta">
          {platformLabel(game.platform)}
          {game.year ? ` · ${game.year}` : ''}
        </p>
        <p>{picked ? game.blurb : hideTitle(game.blurb ?? '', game.title)}</p>
      </div>
      <div className="quiz-options">
        {options.map((g) => (
          <button
            key={g.id}
            className={`px-btn${picked && g.id === game.id ? ' right' : ''}${picked === g.id && g.id !== game.id ? ' wrong' : ''}`}
            onClick={() => pick(g)}
            disabled={!!picked && g.id !== game.id && picked !== g.id}
            data-nav
          >
            {g.title}
          </button>
        ))}
      </div>
      {picked && (
        <button className="px-btn big" onClick={() => onAnswer(picked === game.id)} data-nav autoFocus>
          {tr('NEXT ►', 'WEITER ►')}
        </button>
      )}
    </>
  );
};

export const Quiz: React.FC<{ onWin: () => void; onEarn?: (coins: number) => void }> = ({ onWin, onEarn }) => {
  const [deck, setDeck] = useState(() => shuffle(QUIZ_GAMES));
  const [round, setRound] = useState(0);
  const [right, setRight] = useState(0);
  const [result, setResult] = useState<{ right: number; record: boolean } | null>(null);
  const [earned, setEarned] = useState(0);

  const answer = (ok: boolean) => {
    let n = right;
    if (ok) {
      n++;
      setRight(n);
      if (coinsLeftToday() > 0) {
        spendCoin();
        onEarn?.(1);
        setEarned((e) => e + 1);
      }
    }
    if (round + 1 >= ROUNDS) {
      if (n >= 3) onWin();
      setResult({ right: n, record: n > 0 && saveBest('quiz', n, true) });
      return;
    }
    setRound(round + 1);
  };
  const again = () => {
    chip.play('select');
    setDeck(shuffle(QUIZ_GAMES));
    setRound(0);
    setRight(0);
    setEarned(0);
    setResult(null);
  };

  return (
    <>
      <p className="mini-score">
        {tr('Round', 'Runde')} {Math.min(round + 1, ROUNDS)}/{ROUNDS} · {tr('Right', 'Richtig')}: {right}
        {coinsLeftToday() === 0 && !result && ` · ${tr('no more coins today', 'heute keine Coins mehr')}`}
      </p>
      {!result && deck[round] && <Round key={deck[round].id + round} game={deck[round]} onAnswer={answer} />}
      {result && (
        <Done
          title={tr('QUIZ OVER', 'QUIZ VORBEI')}
          text={tr(
            `${result.right} of ${ROUNDS} right${earned ? `, +${earned} ${earned === 1 ? 'coin' : 'coins'}` : ''}.`,
            `${result.right} von ${ROUNDS} richtig${earned ? `, +${earned} ${earned === 1 ? 'Coin' : 'Coins'}` : ''}.`
          )}
          record={result.record}
          onAgain={again}
          board={{ game: 'quiz', score: result.right }}
        />
      )}
    </>
  );
};

export const quizBest = (n: number) => tr(`Best: ${n} of ${ROUNDS} right`, `Bestes Quiz: ${n} von ${ROUNDS} richtig`);
