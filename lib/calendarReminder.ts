import { tr } from './i18n';

// A reminder without push or mail (Marco, 2026-10-18): the person's own
// calendar reminds them once a week to drop by. Nothing is stored or sent by
// RetroMind; the button either hands over a calendar file (.ics, opens in the
// phone's calendar) or opens Google Calendar with the event filled in.

export type ReminderApp = 'zeitreise' | 'gaming';

const pad = (n: number) => String(n).padStart(2, '0');

/** Next Sunday (or today, if it's Sunday and before the hour) at the given hour, local time. */
function nextSunday(hour: number, now = new Date()): Date {
  const d = new Date(now);
  d.setHours(hour, 0, 0, 0);
  const add = (7 - d.getDay()) % 7;
  d.setDate(d.getDate() + (add === 0 && d <= now ? 7 : add));
  return d;
}

// Floating local time (no Z): the calendar keeps it at 10:00 wherever the phone is.
const icsStamp = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

function texts(app: ReminderApp) {
  const url = window.location.origin + (app === 'gaming' && window.location.pathname.startsWith('/gaming') ? '/gaming/' : '/');
  return app === 'gaming'
    ? {
        title: tr('RetroMind – Gaming: new quests are waiting', 'RetroMind – Gaming: neue Quests warten'),
        details: tr(`A few minutes in the arcade: daily quests, the weekly duel and your streak. ${url}`, `Ein paar Minuten in der Spielhalle: Tages-Quests, Wochen-Duell und deine Serie. ${url}`),
        url,
      }
    : {
        title: tr('RetroMind: your question of the day', 'RetroMind: deine Frage des Tages'),
        details: tr(`A cup of tea and a memory: the living room has a new question for you. ${url}`, `Eine Tasse Tee und eine Erinnerung: In der Stube wartet eine neue Frage auf dich. ${url}`),
        url,
      };
}

/** Downloads a weekly Sunday-morning reminder as a calendar file. */
export function downloadReminder(app: ReminderApp) {
  const { title, details, url } = texts(app);
  const start = nextSunday(10);
  const end = new Date(start.getTime() + 15 * 60_000);
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RetroMind//Reminder//EN',
    'BEGIN:VEVENT',
    `UID:retromind-${app}-${Date.now()}@retromind`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    'RRULE:FREQ=WEEKLY;BYDAY=SU',
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(details)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(title)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = app === 'gaming' ? 'retromind-gaming.ics' : 'retromind.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

/** The same reminder as a pre-filled Google Calendar page. */
export function googleCalendarLink(app: ReminderApp): string {
  const { title, details } = texts(app);
  const start = nextSunday(10);
  const end = new Date(start.getTime() + 15 * 60_000);
  const qs = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details,
    dates: `${icsStamp(start)}/${icsStamp(end)}`,
    recur: 'RRULE:FREQ=WEEKLY;BYDAY=SU',
  });
  return `https://calendar.google.com/calendar/render?${qs}`;
}
