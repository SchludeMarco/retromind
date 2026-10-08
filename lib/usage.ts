// Counts one app start for the admin statistics (api/stats.js). Anonymous by
// design: no cookie, nothing written to the device, no ID sent along. The
// server turns IP + browser into a one-day hash it cannot reverse.
export type UsageApp = 'zeitreise' | 'gaming';

let counted = false;

export function countAppStart(app: UsageApp) {
  if (counted || !import.meta.env.PROD) return;
  counted = true;
  const body = JSON.stringify({ app });
  try {
    if (navigator.sendBeacon?.('/api/stats', new Blob([body], { type: 'application/json' }))) return;
  } catch {
    /* fall back to fetch */
  }
  fetch('/api/stats', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(
    () => {},
  );
}
