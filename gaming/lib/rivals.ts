// The rivalry around the high score tables (Marco, 2026-10-19): when someone
// passes your best entry on a table, the server leaves you a note
// (api/highscores.js ?news=1), shown when you next open the arcade. On
// devices where you switch on rival alerts the note also comes as a push
// message, even with the app closed (the service workers public/sw.js and
// public/gaming/sw.js show it). Push only after you ask for it; the browser
// asks for permission once more.

import { getLang } from '../../lib/i18n';
import { BoardGame } from './highscores';

export interface RivalNews {
  game: BoardGame;
  /** The rival's initials. */
  name: string;
  score: number;
  at: number;
}

// Synced (lib/sync.ts), so a note read on one device does not pop up on the next.
const SEEN = 'retromind.gaming.rivals.seen';

function seenAt(): number {
  try {
    return Number(localStorage.getItem(SEEN)) || 0;
  } catch {
    return 0;
  }
}

export function markRivalsSeen(at = Date.now()) {
  try {
    localStorage.setItem(SEEN, String(Math.max(at, seenAt())));
  } catch {
    /* storage unavailable */
  }
}

/** Notes about being overtaken, newest first. */
export async function fetchRivalNews(): Promise<RivalNews[]> {
  try {
    const res = await fetch('/api/highscores?news=1');
    const data = await res.json();
    return Array.isArray(data.news) ? data.news : [];
  } catch {
    return [];
  }
}

/** Notes not shown yet. The very first visit starts fresh instead of replaying old ones. */
export async function unseenRivalNews(): Promise<RivalNews[]> {
  const news = await fetchRivalNews();
  const since = seenAt();
  return since ? news.filter((n) => n.at > since) : [];
}

/* ---------------------------------------------------------------- Push */

export type PushState = 'unsupported' | 'install-first' | 'blocked' | 'off' | 'on';

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;

async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return (await navigator.serviceWorker.getRegistration()) ?? null;
  } catch {
    return null;
  }
}

export async function pushState(): Promise<PushState> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    // On iPhone and iPad push only works in the app on the home screen.
    return isIOS() && !standalone() ? 'install-first' : 'unsupported';
  }
  if (Notification.permission === 'denied') return 'blocked';
  const reg = await registration();
  if (!reg) return 'unsupported';
  return (await reg.pushManager.getSubscription()) ? 'on' : 'off';
}

const fromB64url = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function tellServer(body: object): Promise<boolean> {
  try {
    const res = await fetch('/api/highscores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return !!(await res.json()).ok;
  } catch {
    return false;
  }
}

/** Asks for permission and subscribes this device; the new state. */
export async function turnPushOn(): Promise<PushState> {
  const reg = await registration();
  if (!reg) return 'unsupported';
  if ((await Notification.requestPermission()) !== 'granted') return Notification.permission === 'denied' ? 'blocked' : 'off';
  try {
    const { key } = await (await fetch('/api/highscores?vapid=1')).json();
    if (!key) return 'unsupported';
    const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: fromB64url(key) }));
    if (await tellServer({ push: sub.toJSON(), lang: getLang() })) return 'on';
    await sub.unsubscribe();
  } catch {
    /* subscribing failed (private window, blocked push service) */
  }
  return 'off';
}

export async function turnPushOff(): Promise<PushState> {
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await tellServer({ push: null, endpoint: sub.endpoint });
    await sub.unsubscribe().catch(() => {});
  }
  return 'off';
}
