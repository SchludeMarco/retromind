import React, { useState } from 'react';
import { tr } from '../lib/i18n';
import { installSteps, promptInstall, useInstall } from '../lib/install';
import { downloadReminder, googleCalendarLink } from '../lib/calendarReminder';

// "RetroMind on your phone": install it as an app with one tap (or the steps
// for the browser menu where there's no prompt), and a weekly reminder in the
// person's own calendar (lib/install.ts, lib/calendarReminder.ts). Shown on
// the start page and in the settings.
export const StayInTouch: React.FC<{ warm: boolean; compact?: boolean }> = ({ warm, compact = false }) => {
  const { canPrompt, installed, platform } = useInstall();
  const [showSteps, setShowSteps] = useState(false);
  const [reminded, setReminded] = useState(false);
  const btn = warm
    ? 'retro-button px-4 py-2 rounded-xl bg-white border-2 border-retro-ink font-semibold text-sm'
    : 'retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm';
  const primary = warm
    ? 'retro-button px-4 py-2 rounded-xl bg-retro-amber text-white font-bold text-sm'
    : 'retro-button px-4 py-2 border-2 border-retro-ink bg-retro-amber text-white font-bold text-sm';

  const install = async () => {
    if (canPrompt) {
      await promptInstall();
      return;
    }
    setShowSteps((v) => !v);
  };

  return (
    <div className="text-left">
      {!installed && (
        <div className="mb-4">
          {!compact && (
            <p className="text-sm mb-2">
              {tr(
                'Put RetroMind on your home screen: it then opens like an app, full screen and with its own icon.',
                'Leg RetroMind auf deinen Startbildschirm: Es öffnet sich dann wie eine App, im Vollbild und mit eigenem Symbol.'
              )}
            </p>
          )}
          <button onClick={install} className={primary} aria-expanded={canPrompt ? undefined : showSteps}>
            📲 {platform === 'desktop' ? tr('Install as an app', 'Als App installieren') : tr('Add to home screen', 'Auf den Startbildschirm')}
          </button>
          {showSteps && (
            <ol className="list-decimal pl-5 mt-3 space-y-1 text-sm">
              {installSteps(platform).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          )}
        </div>
      )}
      {installed && !compact && (
        <p className="text-sm mb-4">{tr('✓ RetroMind is installed on this device.', '✓ RetroMind ist auf diesem Gerät installiert.')}</p>
      )}
      <p className="text-sm mb-2">
        {tr(
          'A gentle nudge once a week: a Sunday-morning reminder in your own calendar. RetroMind stores nothing for this.',
          'Ein sanfter Stups einmal pro Woche: eine Erinnerung am Sonntagmorgen in deinem eigenen Kalender. RetroMind speichert dafür nichts.'
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            downloadReminder('zeitreise');
            setReminded(true);
          }}
          className={btn}
        >
          📅 {tr('Add to my calendar', 'In meinen Kalender')}
        </button>
        <a href={googleCalendarLink('zeitreise')} target="_blank" rel="noopener noreferrer" className={btn} onClick={() => setReminded(true)}>
          {tr('Google Calendar', 'Google Kalender')}
        </a>
      </div>
      {reminded && (
        <p className="text-xs text-retro-brown mt-2">
          {tr(
            'If nothing opens, look for “retromind.ics” in your downloads and tap it.',
            'Öffnet sich nichts, findest du „retromind.ics“ in deinen Downloads; tipp sie an.'
          )}
        </p>
      )}
    </div>
  );
};
