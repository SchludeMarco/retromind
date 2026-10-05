import React from 'react';
import { activeQuests, freshLog, PRIZES } from '../lib/quests';
import { ArcadeState } from '../lib/useArcadeState';

// The quest board (today's three quests plus the weekly one) and the prize
// counter where the tokens buy extra designs and hub tunes.
export const QuestBoard: React.FC<{
  state: ArcadeState;
  onBuy: (id: string) => void;
  onUse: (id: string) => void;
}> = ({ state, onBuy, onUse }) => {
  const quests = activeQuests(freshLog(state.quests));
  return (
    <div className="quest-board">
      <section className="panel quest-panel">
        <h3 className="pixel-font">QUESTS</h3>
        <p className="dim">Jeden Tag drei neue, dazu eine große pro Woche. Jede bringt Spielmarken.</p>
        <ul className="quest-list">
          {quests.map((q) => {
            const done = q.claimed || q.progress >= q.goal;
            return (
              <li key={q.key} className={`quest${done ? ' done' : ''}`}>
                <span className="quest-tag pixel-font">{q.weekly ? 'WOCHE' : 'HEUTE'}</span>
                <span className="quest-text">
                  {done ? 'GESCHAFFT: ' : ''}
                  {q.text}
                </span>
                <span className="quest-meter" aria-label={`${q.progress} von ${q.goal}`}>
                  <span style={{ width: `${(100 * q.progress) / q.goal}%` }} />
                </span>
                <span className="quest-reward pixel-font">
                  {q.progress}/{q.goal} · +{q.reward} MARKEN
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel quest-panel">
        <h3 className="pixel-font">PREIS-TRESEN</h3>
        <p className="dim">
          Du hast <strong className="pixel-font tokens">{state.tokens}</strong> Spielmarken. Lös sie hier ein, wie früher an
          der Ticket-Theke.
        </p>
        <div className="prize-list">
          {PRIZES.map((p) => {
            const owned = state.owned.includes(p.id);
            const inUse = p.kind === 'palette' ? state.palette === p.id : state.track === p.id;
            return (
              <div key={p.id} className={`prize${owned ? ' owned' : ''}`}>
                <span className="pixel-font prize-kind">{p.kind === 'palette' ? 'DESIGN' : 'MUSIK'}</span>
                <span className="pixel-font prize-name">{p.label}</span>
                <span className="prize-text">{p.text}</span>
                {owned ? (
                  <button className="px-btn" aria-pressed={inUse} onClick={() => onUse(p.id)} disabled={inUse} data-nav>
                    {inUse ? 'AKTIV' : 'BENUTZEN'}
                  </button>
                ) : (
                  <button className="px-btn" onClick={() => onBuy(p.id)} disabled={state.tokens < p.price} data-nav>
                    {p.price} MARKEN
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
