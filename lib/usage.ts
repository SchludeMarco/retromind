// Anonymous usage numbers for the admin area (api/stats.js). No cookie,
// nothing written to the device, no ID sent along: an app start carries the
// device type and whether the app runs installed; an event names what was
// opened (a decade, a game, a mini-game) and nothing about who opened it.
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
  send({ app, device: deviceType(), installed: runsInstalled() });
}

const seen = new Set<string>();

/** Counts what was opened, once per page visit and item. */
export function countOpened(app: UsageApp, kind: UsageEvent, key: string) {
  const id = `${app}|${kind}|${key}`;
  if (!key || seen.has(id)) return;
  seen.add(id);
  send({ app, event: { kind, key } });
}
