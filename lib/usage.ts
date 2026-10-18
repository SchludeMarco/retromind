// Anonymous usage numbers for the admin area (api/stats.js). No cookie, no
// ID sent along: an app start carries the device type, whether the app runs
// installed, and how long ago this device last opened it as a rough bucket
// (lib/visits.ts: first visit, same day, a day, a week, a month, longer); an
// event names what was opened (a decade, a game, a mini-game) and nothing
// about who opened it.
import { returnBucket } from './visits';
export type UsageApp = 'zeitreise' | 'gaming';
export type UsageEvent = 'decade' | 'game' | 'minigame';

let counted = false;

function send(payload: object) {
  if (!import.meta.env.PROD) return;
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.('/api/stats', new Blob([body], { type: 'application/json' }))) return;
  } catch {
    /* fall back to fetch */
  }
  fetch('/api/stats', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(
    () => {},
  );
}

function deviceType(): 'phone' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  // iPads report themselves as a Mac with a touch screen.
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
    return 'tablet';
  }
  return /Mobi|iPhone|Android/i.test(ua) ? 'phone' : 'desktop';
}

function runsInstalled(): boolean {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  } catch {
    return false;
  }
}

export function countAppStart(app: UsageApp) {
  if (counted) return;
  counted = true;
  send({ app, device: deviceType(), installed: runsInstalled(), back: returnBucket(app) });
}

const seen = new Set<string>();

/** Counts what was opened, once per page visit and item. */
export function countOpened(app: UsageApp, kind: UsageEvent, key: string) {
  const id = `${app}|${kind}|${key}`;
  if (!key || seen.has(id)) return;
  seen.add(id);
  send({ app, event: { kind, key } });
}
