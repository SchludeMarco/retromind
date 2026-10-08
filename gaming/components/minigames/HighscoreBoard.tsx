import React, { useEffect, useState } from 'react';
import { BoardGame, Entry, fetchBoard, lastInitials, qualifies, submitScore } from '../../lib/highscores';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';

// The arcade ritual after a good game: enter three initials, then the top ten.
export const HighscoreBoard: React.FC<{ game: BoardGame; score: number }> = ({ game, score }) => {
  const [board, setBoard] = useState<Entry[] | null>(null);
  const [entering, setEntering] = useState(false);
  const [name, setName] = useState(lastInitials);

  useEffect(() => {
    let alive = true;
    fetchBoard(game).then((b) => {
      if (!alive) return;
      setBoard(b);
      setEntering(qualifies(b, score));
    });
    return () => {
      alive = false;
    };
  }, [game, score]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length !== 3) return chip.play('error');
    chip.play('powerup');
    setEntering(false);
    setBoard(await submitScore(game, name, score));
  };

  if (!board) return null;
  return (
    <div className="hiscore">
      {entering ? (
        <form className="hs-enter" onSubmit={save}>
          <p className="pixel-font blink">{tr('ENTER YOUR INITIALS', 'TRAG DICH EIN')}</p>
          <input
            className="hs-initials pixel-font"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))}
            maxLength={3}
            autoFocus
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            aria-label={tr('Three initials', 'Drei Buchstaben')}
            onFocus={(e) => e.currentTarget.select()}
          />
          <button className="px-btn big" type="submit" data-nav>
            OK
          </button>
        </form>
      ) : null}
      {board.length > 0 && (
        <ol className="hs-table pixel-font">
          {board.map((e, i) => (
            <li key={`${e.name}-${e.score}-${i}`} className={e.mine ? 'mine' : undefined}>
              <span>{String(i + 1).padStart(2, ' ')}.</span>
              <span>{e.name}</span>
              <span>{e.score.toLocaleString('en-US')}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
