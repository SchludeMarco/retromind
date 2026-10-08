import React from 'react';
import { activeQuests, freshLog, PRIZES } from '../lib/quests';
import { EGGS } from '../lib/eggs';
import { ArcadeState } from '../lib/useArcadeState';
import { tr } from '../../lib/i18n';

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
            {tr(
              <>
                🪙 You have <strong className="pixel-font tokens">{state.tokens}</strong> Coins. They’re backed up in your Google Drive
                and come with you to every device.
              </>,
              <>
                🪙 Du hast <strong className="pixel-font tokens">{state.tokens}</strong> Coins. Sie sind in deinem Google
                Drive gesichert und kommen auf jedes Gerät mit.
              </>
            )}
          </span>
        ) : (
          <>
            <span>
              {tr(
                <>
                  🪙 You have <strong className="pixel-font tokens">{state.tokens}</strong> Coins.{' '}
                  <strong>Heads up: without a Google sign-in they’re only saved on this device.</strong> If you clear your
                  browser data or switch devices, they’re gone.
                </>,
                <>
                  🪙 Du hast <strong className="pixel-font tokens">{state.tokens}</strong> Coins.{' '}
                  <strong>Achtung: Ohne Google-Anmeldung sind sie nur auf diesem Gerät gespeichert.</strong> Löschst du die
                  Browserdaten oder wechselst das Gerät, sind sie weg.
                </>
              )}
            </span>
            <button className="px-btn" onClick={onOpenSettings} data-nav>
              {tr('SAVE WITH GOOGLE', 'MIT GOOGLE SICHERN')}
            </button>
          </>
        )}
      </div>

      <section className="panel quest-panel">
        <h3 className="pixel-font">QUESTS</h3>
        <p className="dim">{tr('Three new ones every day, plus a big one each week. Every quest earns you Coins.', 'Jeden Tag drei neue, dazu eine große pro Woche. Jede bringt Coins.')}</p>
        <ul className="quest-list">
          {quests.map((q) => {
            const done = q.claimed || q.progress >= q.goal;
            return (
              <li key={q.key} className={`quest${done ? ' done' : ''}`}>
                <span className="quest-tag pixel-font">{q.weekly ? tr('WEEK', 'WOCHE') : tr('TODAY', 'HEUTE')}</span>
                <span className="quest-text">
                  {done ? tr('DONE: ', 'GESCHAFFT: ') : ''}
                  {q.text}
                </span>
                <span className="quest-meter" aria-label={tr(`${q.progress} of ${q.goal}`, `${q.progress} von ${q.goal}`)}>
                  <span style={{ width: `${(100 * q.progress) / q.goal}%` }} />
                </span>
                <span className="quest-reward pixel-font">
                  {q.progress}/{q.goal} · +{q.reward} COINS
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
        <p className="dim">{tr('There’s stuff hidden all over the arcade. Every egg you find pays out Coins once.', 'Überall in der Halle ist was versteckt. Jedes gefundene Ei bringt einmal Coins.')}</p>
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
                  <span className="egg-text">{got ? e.text : tr(`Hint: ${e.hint}`, `Tipp: ${e.hint}`)}</span>
                </span>
                <span className="pixel-font egg-reward">{got ? tr('FOUND', 'GEFUNDEN') : `+${e.reward}`}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel quest-panel">
        <h3 className="pixel-font">{tr('PRIZE COUNTER', 'PREIS-TRESEN')}</h3>
        <p className="dim">
          {tr(
            <>
              You have <strong className="pixel-font tokens">{state.tokens}</strong> Coins. Cash them in here, just like at the
              old ticket counter.
            </>,
            <>
              Du hast <strong className="pixel-font tokens">{state.tokens}</strong> Coins. Lös sie hier ein, wie früher an
              der Ticket-Theke.
            </>
          )}
        </p>
        <div className="prize-list">
          {PRIZES.map((p) => {
            const owned = state.owned.includes(p.id);
            const inUse = p.kind === 'palette' ? state.palette === p.id : p.kind === 'track' ? state.track === p.id : state.partyLogo;
            return (
              <div key={p.id} className={`prize${owned ? ' owned' : ''}`}>
                <span className="pixel-font prize-kind">{p.kind === 'palette' ? 'DESIGN' : p.kind === 'track' ? tr('MUSIC', 'MUSIK') : tr('EFFECT', 'EFFEKT')}</span>
                <span className="pixel-font prize-name">{p.label}</span>
                <span className="prize-text">{p.text}</span>
                {owned && p.kind === 'effect' ? (
                  <button className="px-btn" aria-pressed={inUse} onClick={() => onUse(p.id)} data-nav>
                    {inUse ? tr('ON', 'AN') : tr('OFF', 'AUS')}
                  </button>
                ) : owned ? (
                  <button className="px-btn" aria-pressed={inUse} onClick={() => onUse(p.id)} disabled={inUse} data-nav>
                    {inUse ? tr('ACTIVE', 'AKTIV') : tr('USE', 'BENUTZEN')}
                  </button>
                ) : (
                  <button className="px-btn" onClick={() => onBuy(p.id)} disabled={state.tokens < p.price} data-nav>
                    {p.price} COINS
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
