import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { chip } from '../lib/chiptune';
import { tr } from '../../lib/i18n';
import { Boss, BOSS_COINS, bossLife, bossOfDay, BossLog, bossScore, coinsFor, CONTINUE_COST, GAME_NAME, HEARTS } from '../lib/boss';
import { Entry, fetchDayBoard, lastInitials, submitScore } from '../lib/highscores';
import { InitialsPicker } from '../../components/InitialsPicker';
import { ScoreTable } from './minigames/HighscoreBoard';
import { BlitzBossContext } from './minigames/bossContext';
import { today } from '../lib/quests';

// The fight against the boss of the day (lib/boss.ts, Marco 2026-11-28).
// Between the rounds the boss stands on screen with his life bar, the
// player's hearts and what he has to say; a round is one of the Blitz games
// with the boss's goal (components/minigames/Blitz.tsx via bossContext).

const Blitz = {
  blitzbuttons: lazy(() => import('./minigames/Blitz').then((m) => ({ default: m.BlitzButtons }))),
  blitzconsole: lazy(() => import('./minigames/Blitz').then((m) => ({ default: m.BlitzConsole }))),
  blitzyear: lazy(() => import('./minigames/Blitz').then((m) => ({ default: m.BlitzYear }))),
  blitzpixel: lazy(() => import('./minigames/Blitz').then((m) => ({ default: m.BlitzPixel }))),
  blitzcolor: lazy(() => import('./minigames/Blitz').then((m) => ({ default: m.BlitzColor }))),
  blitzcombo: lazy(() => import('./minigames/Blitz').then((m) => ({ default: m.BlitzCombo }))),
};

const pick = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];
const noop = () => undefined;

/** The boss as pixel art. */
export const BossSprite: React.FC<{ boss: Pick<Boss, 'sprite' | 'colors'>; size?: number; className?: string }> = ({ boss, size = 8, className }) => {
  const w = Math.max(...boss.sprite.map((r) => r.length));
  const h = boss.sprite.length;
  return (
    <svg className={className} width={w * size} height={h * size} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden="true">
      {boss.sprite.flatMap((row, y) =>
        [...row].map((c, x) => (c === '.' || !boss.colors[c] ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={boss.colors[c]} />))
      )}
    </svg>
  );
};

export const Hearts: React.FC<{ left: number }> = ({ left }) => (
  <span className="boss-hearts" aria-label={tr(`${left} of ${HEARTS} hearts`, `${left} von ${HEARTS} Herzen`)}>
    {Array.from({ length: HEARTS }, (_, i) => (
      <span key={i} className={i < left ? 'on' : 'off'} aria-hidden="true">
        ♥
      </span>
    ))}
  </span>
);

/** The most a boss pays: every round, the win, no heart lost, first in the hall. */
export const bossMaxCoins = (boss: ReturnType<typeof bossOfDay>) =>
  coinsFor(boss, BOSS_COINS.round * boss.fight.length + BOSS_COINS.defeat + BOSS_COINS.perfect + BOSS_COINS.first);

type Result = { hit: boolean; coins: number; log: BossLog };

export const BossFight: React.FC<{
  log: BossLog;
  tokens: number;
  reducedMotion: boolean;
  onRound: (score: number) => Result;
  onContinue: () => boolean;
  onFirst: (first: boolean) => number;
  onEntered: () => void;
  onClose: () => void;
}> = ({ log, tokens, reducedMotion, onRound, onContinue, onFirst, onEntered, onClose }) => {
  const boss = useMemo(() => bossOfDay(), []);
  const [phase, setPhase] = useState<'lobby' | 'round'>('lobby');
  const [line, setLine] = useState(() => (log.won ? boss.defeat : boss.taunt));
  const [fx, setFx] = useState<'' | 'hit' | 'miss' | 'down'>('');
  const [paid, setPaid] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(false);
  const ended = useRef(false);
  const dialog = useRef<HTMLDivElement>(null);

  // The demonic laugh as he appears (same voice as the door, lib/chiptune.ts).
  useEffect(() => {
    if (!log.won) chip.laugh(reducedMotion ? 0 : 0.15);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const endRound = (score: number) => {
    if (ended.current) return;
    ended.current = true;
    started.current = false;
    const r = onRound(score);
    setPaid(r.coins);
    setPhase('lobby');
    if (r.log.won) {
      chip.play('achievement');
      setFx('down');
      setLine(boss.defeat);
      checkFirst();
    } else if (r.hit) {
      chip.play('powerup');
      setFx('hit');
      setLine(pick(boss.hurt));
    } else {
      chip.play('error');
      chip.laugh(0.2);
      setFx('miss');
      setLine(r.log.hearts > 0 ? pick(boss.gloat) : tr('GAME OVER! Insert coin to continue…', 'GAME OVER! Münze einwerfen zum Weiterspielen …'));
    }
    window.setTimeout(() => setFx((f) => (f === 'down' ? f : '')), 900);
    dialog.current?.scrollTo({ top: 0 });
  };

  // Walking away from a running round counts as a miss, so quitting a bad round doesn't pay.
  const close = () => {
    if (phase === 'round' && started.current && !ended.current) endRound(0);
    onClose();
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // First boss slayer in the hall today: nobody on the day's table yet.
  const checkFirst = async () => {
    let first = false;
    try {
      const res = await fetch(`/api/highscores?game=boss&day=${today()}`);
      const data = await res.json();
      first = !!data.ready && Array.isArray(data.scores) && data.scores.length === 0;
    } catch {
      /* offline: no bonus */
    }
    const coins = onFirst(first);
    if (coins) {
      chip.play('coin');
      setPaid((p) => (p ?? 0) + coins);
    }
  };

  const startRound = () => {
    chip.play('select');
    started.current = false;
    ended.current = false;
    setPaid(null);
    setFx('');
    setAttempt((a) => a + 1);
    setPhase('round');
  };

  const cont = () => {
    if (!onContinue()) return chip.play('error');
    chip.play('coin');
    setLine(tr('Back for more? Fine by me!', 'Noch nicht genug? Na schön!'));
  };

  const round = Math.min(log.round, boss.fight.length - 1);
  const game = boss.fight[round];
  const Game = Blitz[game];
  const out = !log.won && log.hearts <= 0;

  return (
    <div className="overlay" onClick={close}>
      <div
        ref={dialog}
        className={`dialog boss-dialog${boss.super ? ' super' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={boss.name}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="px-btn close-x" onClick={close} aria-label={tr('Close', 'Schließen')} data-nav>
          ✕
        </button>
        <p className="pixel-font boss-kicker">{boss.super ? tr('☠ SUNDAY FINAL BOSS ☠', '☠ SONNTAGS-ENDBOSS ☠') : tr('☠ BOSS OF THE DAY ☠', '☠ ENDGEGNER DES TAGES ☠')}</p>
        <h2 className="pixel-font boss-name">{boss.name}</h2>

        <div className="boss-status">
          <div className="boss-life" aria-label={tr(`Boss life: ${Math.round(bossLife(log, boss) * 100)} percent`, `Lebensenergie des Bosses: ${Math.round(bossLife(log, boss) * 100)} Prozent`)}>
            {boss.fight.map((_, i) => (
              <span key={i} className={i < log.round ? 'gone' : ''} />
            ))}
          </div>
          <Hearts left={log.hearts} />
        </div>

        {phase === 'lobby' ? (
          <>
            <div className={`boss-stage${fx ? ` fx-${fx}` : ''}`}>
              <BossSprite boss={boss} size={10} className="boss-sprite" />
              <p className="boss-says" aria-live="polite">
                „{line}“
              </p>
            </div>
            {paid ? <p className="pixel-font boss-paid">+{paid} COINS</p> : null}

            <ol className="boss-rounds">
              {boss.fight.map((g, i) => (
                <li key={i} className={i < log.round ? 'done' : i === log.round && !log.won ? 'now' : ''}>
                  <span className="pixel-font">{tr(`ROUND ${i + 1}`, `RUNDE ${i + 1}`)}</span>
                  <span>{GAME_NAME[g]()}</span>
                  <span className="pixel-font">
                    {i < log.round ? '✔' : `${tr('GOAL', 'ZIEL')} ${boss.goals[i]}`}
                  </span>
                </li>
              ))}
            </ol>

            {log.won ? (
              <Victory log={log} boss={boss} onEntered={onEntered} />
            ) : out ? (
              <div className="boss-actions">
                <p className="pixel-font boss-over blink">GAME OVER</p>
                <button className="px-btn big" onClick={cont} disabled={tokens < CONTINUE_COST} data-nav autoFocus>
                  {tr(`CONTINUE? ${CONTINUE_COST} COINS`, `CONTINUE? ${CONTINUE_COST} COINS`)}
                </button>
                <p className="dim">
                  {tokens < CONTINUE_COST
                    ? tr(`You have ${tokens} coins. Tomorrow a new boss comes, with fresh hearts.`, `Du hast ${tokens} Coins. Morgen kommt ein neuer Boss, mit frischen Herzen.`)
                    : tr('All three hearts back, the boss keeps his wounds. Or try the next boss tomorrow.', 'Alle drei Herzen zurück, der Boss behält seine Wunden. Oder morgen gegen den nächsten Boss.')}
                </p>
              </div>
            ) : (
              <div className="boss-actions">
                <button className="px-btn big boss-go" onClick={startRound} data-nav autoFocus>
                  {log.round === 0 && log.hearts === HEARTS && !log.continues ? tr('⚔ FIGHT!', '⚔ KAMPF!') : tr(`⚔ ROUND ${log.round + 1}`, `⚔ RUNDE ${log.round + 1}`)}
                </button>
                <p className="dim boss-rules">
                  {tr(
                    `Reach the goal in each 30-second round. A miss costs a heart. +${coinsFor(boss, BOSS_COINS.round)} per round, +${coinsFor(boss, BOSS_COINS.defeat)} for the win, +${coinsFor(boss, BOSS_COINS.perfect)} without losing a heart, +${coinsFor(boss, BOSS_COINS.first)} if you’re the first in the hall today.`,
                    `Schaff in jeder 30-Sekunden-Runde das Ziel. Daneben kostet ein Herz. +${coinsFor(boss, BOSS_COINS.round)} pro Runde, +${coinsFor(boss, BOSS_COINS.defeat)} für den Sieg, +${coinsFor(boss, BOSS_COINS.perfect)} ohne Herz zu verlieren, +${coinsFor(boss, BOSS_COINS.first)} als Erste:r in der Halle heute.`
                  )}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="boss-round">
            <p className="pixel-font boss-round-title">
              {tr(`ROUND ${log.round + 1} / ${boss.fight.length}`, `RUNDE ${log.round + 1} / ${boss.fight.length}`)} · {GAME_NAME[game]()}
            </p>
            <BlitzBossContext.Provider
              value={{
                seed: `${boss.day}:${log.round}:${log.continues}:${log.hearts}:${attempt}`,
                goal: boss.goals[log.round],
                onStart: () => {
                  started.current = true;
                },
                onEnd: endRound,
              }}
            >
              <Suspense fallback={<p className="dim mini-loading">{tr('Loading…', 'Lädt …')}</p>}>
                <Game key={attempt} onWin={noop} />
              </Suspense>
            </BlitzBossContext.Provider>
          </div>
        )}
      </div>
    </div>
  );
};

/** After the win: the Coins, and the day's table of boss slayers. */
const Victory: React.FC<{ log: BossLog; boss: ReturnType<typeof bossOfDay>; onEntered: () => void }> = ({ log, boss, onEntered }) => {
  const [day, setDay] = useState<Entry[] | null>(null);
  const [name, setName] = useState(lastInitials);
  const [busy, setBusy] = useState(false);
  const score = bossScore(log, boss);
  useEffect(() => {
    let alive = true;
    fetchDayBoard('boss').then((d) => alive && setDay(d));
    return () => {
      alive = false;
    };
  }, [log.entered]);

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (name.length !== 3 || busy) return chip.play('error');
    setBusy(true);
    chip.play('powerup');
    await submitScore('boss', name, score);
    onEntered();
    setDay(await fetchDayBoard('boss'));
    setBusy(false);
  };

  return (
    <div className="boss-victory">
      <p className="pixel-font boss-win">{tr('★ BOSS DEFEATED! ★', '★ BOSS BESIEGT! ★')}</p>
      <p>
        {tr(
          `${log.coins} coins today${log.first ? ', first in the hall!' : '.'} ${log.hearts === HEARTS && !log.continues ? 'Flawless: not a single heart lost!' : ''} Tomorrow a new boss is waiting.`,
          `${log.coins} Coins heute${log.first ? ', als Erste:r in der Halle!' : '.'} ${log.hearts === HEARTS && !log.continues ? 'Makellos: kein einziges Herz verloren!' : ''} Morgen wartet ein neuer Boss.`
        )}
      </p>
      {!log.entered ? (
        <form className="hs-enter" onSubmit={save}>
          <p className="pixel-font">{tr(`ENTER THE SLAYERS’ LIST · ${score} PTS`, `TRAG DICH BEI DEN BEZWINGERN EIN · ${score} PKT`)}</p>
          <InitialsPicker value={name} onChange={setName} onEnter={() => save()} autoFocus />
          <button className="px-btn big" type="submit" disabled={busy} data-nav>
            OK
          </button>
        </form>
      ) : null}
      {day && day.length > 0 && (
        <>
          <p className="pixel-font hs-week-title">{tr('TODAY’S BOSS SLAYERS', 'BOSS-BEZWINGER HEUTE')}</p>
          <ScoreTable game="boss" entries={day.slice(0, 10)} />
        </>
      )}
    </div>
  );
};
