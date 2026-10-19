import { getLang } from './i18n';

// Push messages on this device, for both apps (api/_push.js): one browser
// subscription, switched on per topic, "rivals" (Gaming: someone passed you
// on a high score table, gaming/lib/rivals.ts) and "chat" (a message for you
// in the chat corner, lib/chat.ts). The service workers (public/sw.js,
// public/gaming/sw.js) show them. Push only after you ask for it; the browser
// asks for permission once more.

export type PushTopic = 'rivals' | 'chat';
export type PushState = 'unsupported' | 'install-first' | 'blocked' | 'off' | 'on';

// Which topics this device gets. Device only (lib/sync.ts): a push
// subscription belongs to one browser.
const TOPICS = 'retromind.push.topics';

function storedTopics(hasSub: boolean): PushTopic[] {
  try {
    const raw = localStorage.getItem(TOPICS);
    // Subscriptions from before topics existed were for rival alerts.
    if (raw === null) return hasSub ? ['rivals'] : [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function storeTopics(list: PushTopic[]) {
  try {
    localStorage.setItem(TOPICS, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

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

export async function topicState(topic: PushTopic): Promise<PushState> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    // On iPhone and iPad push only works in the app on the home screen.
    return isIOS() && !standalone() ? 'install-first' : 'unsupported';
  }
  if (Notification.permission === 'denied') return 'blocked';
  const reg = await registration();
  if (!reg) return 'unsupported';
  const sub = await reg.pushManager.getSubscription();
  return sub && storedTopics(true).includes(topic) ? 'on' : 'off';
}

const fromB64url = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function tellServer(body: object): Promise<{ ok: boolean; topics?: PushTopic[] }> {
  try {
    const res = await fetch('/api/highscores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return await res.json();
  } catch {
    return { ok: false };
  }
}

/** Asks for permission and subscribes this device to the topic; the new state. */
export async function topicOn(topic: PushTopic): Promise<PushState> {
  const reg = await registration();
  if (!reg) return 'unsupported';
  if ((await Notification.requestPermission()) !== 'granted') return Notification.permission === 'denied' ? 'blocked' : 'off';
  try {
    const { key } = await (await fetch('/api/highscores?vapid=1')).json();
    if (!key) return 'unsupported';
    const had = await reg.pushManager.getSubscription();
    const sub = had ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: fromB64url(key) }));
    const out = await tellServer({ push: sub.toJSON(), lang: getLang(), topic });
    if (out.ok) {
      storeTopics(out.topics ?? [...new Set([...storedTopics(!!had), topic])]);
      return 'on';
    }
    if (!had) await sub.unsubscribe();
  } catch {
    /* subscribing failed (private window, blocked push service) */
  }
  return 'off';
}

export async function topicOff(topic: PushTopic): Promise<PushState> {
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    const out = await tellServer({ push: null, endpoint: sub.endpoint, topic });
    const left = out.ok && out.topics ? out.topics : storedTopics(true).filter((t) => t !== topic);
    storeTopics(left);
    // The last topic gone: the browser can forget the subscription too.
    if (!left.length) await sub.unsubscribe().catch(() => {});
  }
  return 'off';
}
