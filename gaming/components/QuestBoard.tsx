import React from 'react';
import { activeQuests, freshLog, PRIZES } from '../lib/quests';
import { EGGS } from '../lib/eggs';
import { ArcadeState } from '../lib/useArcadeState';

// The quest board (today's three quests plus the weekly one), the easter egg
// hunt and the prize counter where the tokens buy extra designs and hub tunes.
export const QuestBoard: React.FC<{
  state: ArcadeState;
  signedIn: boolean;
  onBuy: (id: string) => void;
  onUse: (id: string) => void;
  onOpenSettings: () => void;
}> = ({ state, signedIn, onBuy, onUse, onOpenSettings }) => {
  const quests = activeQuests(freshLog(state.quests));
  const found = EGGS.filter((e) => state.eggs.includes(e.id)).length;
  return (
    <div className="quest-board">
      {/* Without Google the balance lives only in this browser (Marco, 2026-10-08). */}
      <div className={`panel token-save${signedIn ? ' safe' : ''}`} role="note">
        {signedIn ? (
          <span>
            🪙 Du hast <strong className="pixel-font tokens">{state.tokens}</strong> Spielmarken. Sie sind in deinem Google
            Drive gesichert und kommen auf jedes Gerät mit.
          </span>
        ) : (
          <>
            <span>
              🪙 Du hast <strong className="pixel-font tokens">{state.tokens}</strong> Spielmarken.{' '}
              <strong>Achtung: Ohne Google-Anmeldung sind sie nur auf diesem Gerät gespeichert.</strong> Löschst du die
              Browserdaten oder wechselst das Gerät, sind sie weg.
            </span>
            <button className="px-btn" onClick={onOpenSettings} data-nav>
              MIT GOOGLE SICHERN
            </button>
          </>
        )}
      </div>

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
        <h3 className="pixel-font">
          EASTER EGGS {found}/{EGGS.length}
        </h3>
        <p className="dim">Überall in der Halle ist was versteckt. Jedes gefundene Ei bringt einmal Spielmarken.</p>
        <ul className="egg-list">
          {EGGS.map((e) => {
            const got = state.eggs.includes(e.id);
            return (
              <li key={e.id} className={`egg${got ? ' found' : ''}`}>
                <span className="egg-icon" aria-hidden="true">
                  {got ? '🥚' : '❔'}
                </span>
                <span className="egg-body">
                  <span className="pixel-font egg-title">{got ? e.title.toUpperCase() : '???'}</span>
                  <span className="egg-text">{got ? e.text : `Tipp: ${e.hint}`}</span>
                </span>
                <span className="pixel-font egg-reward">{got ? 'GEFUNDEN' : `+${e.reward}`}</span>
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
            const inUse = p.kind === 'palette' ? state.palette === p.id : p.kind === 'track' ? state.track === p.id : state.partyLogo;
            return (
              <div key={p.id} className={`prize${owned ? ' owned' : ''}`}>
                <span className="pixel-font prize-kind">{p.kind === 'palette' ? 'DESIGN' : p.kind === 'track' ? 'MUSIK' : 'EFFEKT'}</span>
                <span className="pixel-font prize-name">{p.label}</span>
                <span className="prize-text">{p.text}</span>
                {owned && p.kind === 'effect' ? (
                  <button className="px-btn" aria-pressed={inUse} onClick={() => onUse(p.id)} data-nav>
                    {inUse ? 'AN' : 'AUS'}
                  </button>
                ) : owned ? (
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
