import React, { useState } from 'react';
import { chip } from '../lib/chiptune';
import { CHALLENGE_HOURS, useNotifySettings } from '../../lib/push';
import { tr } from '../../lib/i18n';

// The bell next to the daily challenge (Marco, 2026-11-27: "Neben dem ersten
// Punkt soll ein Button sein, mit dem man die Benachrichtigung zur
// Tages-Challenge aktivieren/deaktivieren/zeitmäßig umstellen kann").
// It opens a small panel under the challenge: on/off and the hour. The same
// setting as in Settings → Notifications (lib/push.ts), for all devices.

const hourLabel = (h: number) => tr(`${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`, `${h}:00`);

export const ChallengeBell: React.FC = () => {
  const n = useNotifySettings();
  const [open, setOpen] = useState(false);
  const active = n.prefs.on && n.prefs.challenge && n.device !== 'blocked' && n.device !== 'unsupported';
  const hour = n.prefs.challengeHour ?? 18;
  const click = (fn: () => unknown) => () => {
    chip.play('select');
    fn();
  };

  return (
    <>
      <button
        className={`px-btn challenge-bell${active ? ' on' : ''}`}
        onClick={click(() => setOpen((o) => !o))}
        aria-expanded={open}
        aria-controls="challenge-bell-panel"
        aria-label={
          active
            ? tr(`Reminder for the daily challenge: on, at ${hourLabel(hour)}. Change`, `Erinnerung an die Tages-Challenge: an, um ${hourLabel(hour)} Uhr. Ändern`)
            : tr('Reminder for the daily challenge: off. Change', 'Erinnerung an die Tages-Challenge: aus. Ändern')
        }
        title={tr('Reminder for the daily challenge', 'Erinnerung an die Tages-Challenge')}
        data-nav
      >
        <span aria-hidden="true">{active ? '🔔' : '🔕'}</span>
        <span className="challenge-bell-time" aria-hidden="true">
          {active ? tr(hourLabel(hour), `${hour}h`) : tr('OFF', 'AUS')}
        </span>
      </button>
      {open && (
        <div id="challenge-bell-panel" className="challenge-bell-panel" role="group" aria-label={tr('Reminder for the daily challenge', 'Erinnerung an die Tages-Challenge')}>
          <p className="pixel-font">{tr('🔔 REMIND ME', '🔔 ERINNERE MICH')}</p>
          {n.device === 'install-first' ? (
            <p className="dim">
              {tr(
                'On iPhone and iPad, reminders only work in the app on your home screen: install the arcade first (Settings), then switch them on there.',
                'Auf iPhone und iPad gehen Erinnerungen nur in der App auf dem Home-Bildschirm: installiere zuerst die Spielhalle (Einstellungen) und schalte sie dort an.'
              )}
            </p>
          ) : n.device === 'blocked' ? (
            <p className="dim">
              {tr('Notifications are blocked for this site. You can allow them again in your browser settings.', 'Mitteilungen sind für diese Seite gesperrt. In den Browser-Einstellungen kannst du sie wieder erlauben.')}
            </p>
          ) : n.device === 'unsupported' ? (
            <p className="dim">{tr('This browser can’t show notifications.', 'Dieser Browser kann keine Mitteilungen anzeigen.')}</p>
          ) : (
            <>
              <div className="challenge-bell-hours">
                {CHALLENGE_HOURS.map((h) => (
                  <button
                    key={h}
                    className={`px-btn${active && h === hour ? ' on' : ''}`}
                    aria-pressed={active && h === hour}
                    onClick={click(() => n.setChallengeHour(h))}
                    disabled={n.busy}
                    data-nav
                  >
                    {hourLabel(h)}
                  </button>
                ))}
                <button
                  className={`px-btn${!active ? ' on' : ''}`}
                  aria-pressed={!active}
                  onClick={click(() => n.setTopic('challenge', false))}
                  disabled={n.busy || !active}
                  data-nav
                >
                  {tr('OFF', 'AUS')}
                </button>
              </div>
              <p className="dim">
                {active
                  ? tr(
                      `A reminder around ${hourLabel(hour)}, only if you haven’t made today’s challenge yet. On all your devices.`,
                      `Gegen ${hourLabel(hour)} Uhr eine Erinnerung, nur wenn du die Challenge noch nicht geschafft hast. Auf all deinen Geräten.`
                    )
                  : tr('Pick a time and you’ll get a reminder when today’s challenge is still open.', 'Wähl eine Uhrzeit, dann kommt eine Erinnerung, wenn die Challenge noch offen ist.')}
                {active && n.device === 'off' && ` ${tr('This device doesn’t show them yet: pick the time again to allow it here.', 'Dieses Gerät zeigt sie noch nicht: tipp die Uhrzeit noch einmal, um es hier zu erlauben.')}`}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
};
