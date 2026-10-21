import React, { useEffect, useState } from 'react';
import { BoardGame, Entry, fetchBoard, fetchDayBoard, fetchWeekBoard, formatScore, isDuelGame, lastInitials, qualifies, submitScore } from '../../lib/highscores';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { InitialsPicker } from '../../../components/InitialsPicker';
import { isChallengeGame } from '../../lib/challenge';

// The arcade ritual after a good game: enter three initials, then the top ten.
// This week's duel game (quests.ts) also shows the week's table, and a score
// that only makes that one may be entered too. Today's challenge game
// (challenge.ts) shows the day's table the same way.
export const HighscoreBoard: React.FC<{ game: BoardGame; score: number }> = ({ game, score }) => {
  const [board, setBoard] = useState<Entry[] | null>(null);
  const [week, setWeek] = useState<Entry[] | null>(null);
  const [day, setDay] = useState<Entry[] | null>(null);
  const [entering, setEntering] = useState(false);
  const [name, setName] = useState(lastInitials);
  const duel = isDuelGame(game);
  const challenge = isChallengeGame(game);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchBoard(game),
      duel ? fetchWeekBoard(game) : Promise.resolve(null),
      challenge ? fetchDayBoard(game) : Promise.resolve(null),
    ]).then(([b, w, d]) => {
      if (!alive) return;
      setBoard(b);
      setWeek(w);
      setDay(d);
      setEntering(qualifies(b, score, game) || (!!w && qualifies(w, score, game)) || (!!d && qualifies(d, score, game)));
    });
    return () => {
      alive = false;
    };
  }, [game, score, duel, challenge]);

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (name.length !== 3) return chip.play('error');
    chip.play('powerup');
    setEntering(false);
    setBoard(await submitScore(game, name, score));
    if (duel) setWeek(await fetchWeekBoard(game));
    if (challenge) setDay(await fetchDayBoard(game));
  };

  if (!board) return null;
  return (
    <div className="hiscore">
      {entering ? (
        <form className="hs-enter" onSubmit={save}>
          <p className="pixel-font blink">{tr('ENTER YOUR INITIALS', 'TRAG DICH EIN')}</p>
          <InitialsPicker value={name} onChange={setName} onEnter={() => save()} autoFocus />
          <button className="px-btn big" type="submit" data-nav>
            OK
          </button>
        </form>
      ) : null}
      {challenge && day && day.length > 0 && (
        <>
          <p className="pixel-font hs-week-title">{tr('TODAY’S CHALLENGE', 'TAGES-CHALLENGE')}</p>
          <ScoreTable game={game} entries={day.slice(0, 5)} />
          <p className="pixel-font hs-week-title">{tr('ALL TIME', 'ALLE ZEITEN')}</p>
        </>
      )}
      {duel && week && week.length > 0 && (
        <>
          <p className="pixel-font hs-week-title">{tr('THIS WEEK’S DUEL', 'WOCHEN-DUELL')}</p>
          <ScoreTable game={game} entries={week.slice(0, 5)} />
          <p className="pixel-font hs-week-title">{tr('ALL TIME', 'ALLE ZEITEN')}</p>
        </>
      )}
      {board.length > 0 && <ScoreTable game={game} entries={board} />}
    </div>
  );
};

/** A table in arcade style: rank, initials, score; your own lines glow. */
export const ScoreTable: React.FC<{ game: BoardGame; entries: Entry[] }> = ({ game, entries }) => (
  <ol className="hs-table pixel-font">
    {entries.map((e, i) => (
      <li key={`${e.name}-${e.score}-${i}`} className={e.mine ? 'mine' : e.me ? 'me' : undefined}>
        <span>{String(i + 1).padStart(2, ' ')}.</span>
        <span>{e.name}</span>
        <span>{formatScore(game, e.score)}</span>
      </li>
    ))}
  </ol>
);
