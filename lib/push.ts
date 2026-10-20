import { useCallback, useEffect, useState } from 'react';
import { getLang } from './i18n';

// Notifications for both apps (api/_push.js). Two parts:
// - This device: one browser push subscription (the browser asks for
//   permission once). The service workers (public/sw.js,
//   public/gaming/sw.js) show the messages.
// - The settings (Marco, 2026-10-20): a main switch plus one switch per
//   topic, "rivals" (Gaming: someone passed you on a high score table,
//   gaming/lib/rivals.ts), "chat" (a direct message for you in the chat
//   corner, lib/chat.ts) and "room" (a new message in the room "Everyone",
//   off unless switched on). They are synced (lib/sync.ts) and stored on the
//   server once per guest, so they apply to all devices.

export type PushTopic = 'rivals' | 'chat' | 'room';
export type PushState = 'unsupported' | 'install-first' | 'blocked' | 'off' | 'on';
export interface NotifyPrefs {
  on: boolean;
  rivals: boolean;
  chat: boolean;
  room: boolean;
}

const PREFS = 'retromind.notify';
// Which topics this device asked for before the settings existed (PR #261,
// #262). Device only (lib/sync.ts); only read to carry the old choice over.
const OLD_TOPICS = 'retromind.push.topics';

const DEFAULTS: NotifyPrefs = { on: true, rivals: true, chat: true, room: false };

function storedPrefs(): NotifyPrefs | null {
  try {
    const raw = localStorage.getItem(PREFS);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function oldTopics(): PushTopic[] | null {
  try {
    const raw = localStorage.getItem(OLD_TOPICS);
    const list = raw === null ? null : JSON.parse(raw);
    return Array.isArray(list) ? list : null;
  } catch {
    return null;
  }
}

/** The settings, or what this device had switched on before they existed. */
export function getPrefs(): NotifyPrefs {
  const stored = storedPrefs();
  if (stored) return stored;
  const old = oldTopics();
  return old ? { ...DEFAULTS, rivals: old.includes('rivals'), chat: old.includes('chat') } : DEFAULTS;
}

/** Whether the "Overtaken!" note may pop up in the arcade (the note stays in the Hall of Fame either way). */
export function rivalNotesWanted(): boolean {
  const stored = storedPrefs();
  return !stored || (stored.on && stored.rivals);
}

const tellServer = async (body: object): Promise<{ ok: boolean }> => {
  try {
    const res = await fetch('/api/highscores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return await res.json();
  } catch {
    return { ok: false };
  }
};

function savePrefs(prefs: NotifyPrefs) {
  try {
    localStorage.setItem(PREFS, JSON.stringify(prefs));
  } catch {
    /* storage unavailable: the server still knows */
  }
  return tellServer({ prefs });
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

/** Whether this device can show notifications and is signed up for them. */
export async function deviceState(): Promise<PushState> {
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

/** Asks for permission and signs this device up; the new state. */
async function deviceOn(): Promise<PushState> {
  const reg = await registration();
  if (!reg) return 'unsupported';
  if ((await Notification.requestPermission()) !== 'granted') return Notification.permission === 'denied' ? 'blocked' : 'off';
  try {
    const { key } = await (await fetch('/api/highscores?vapid=1')).json();
    if (!key) return 'unsupported';
    const had = await reg.pushManager.getSubscription();
    const sub = had ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: fromB64url(key) }));
    if ((await tellServer({ push: sub.toJSON(), lang: getLang() })).ok) return 'on';
    if (!had) await sub.unsubscribe();
  } catch {
    /* subscribing failed (private window, blocked push service) */
  }
  return 'off';
}

/** Signs this device off, here and on the server ("Delete my data" does the same). */
async function deviceOff(): Promise<PushState> {
  const sub = await (await registration())?.pushManager.getSubscription();
  if (sub) {
    await tellServer({ push: null, endpoint: sub.endpoint });
    await sub.unsubscribe().catch(() => {});
  }
  return 'off';
}

/** The notification settings for a settings panel, the same in both apps. */
export function useNotifySettings() {
  const [prefs, setPrefs] = useState<NotifyPrefs>(getPrefs);
  const [device, setDevice] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    deviceState().then((state) => {
      setDevice(state);
      // A device signed up before the settings existed: hand its choice to the server once.
      if (state === 'on' && !storedPrefs()) savePrefs(getPrefs());
    });
  }, []);

  const change = useCallback(
    async (next: NotifyPrefs) => {
      setPrefs(next);
      setBusy(true);
      try {
        // Switching something on on a device that isn't signed up yet asks the browser right away.
        const wantsDevice = next.on && (next.rivals || next.chat || next.room);
        if (wantsDevice && device === 'off') setDevice(await deviceOn());
        await savePrefs(next);
      } finally {
        setBusy(false);
      }
    },
    [device]
  );

  return {
    prefs,
    /** This device: null while checking. */
    device,
    busy,
    setMain: (on: boolean) => change({ ...prefs, on }),
    setTopic: (topic: PushTopic, on: boolean) => change({ ...prefs, on: on ? true : prefs.on, [topic]: on }),
    /** Signs this device up (the others keep their own choice). */
    allowHere: async () => {
      setBusy(true);
      setDevice(await deviceOn());
      setBusy(false);
    },
    /** Stops notifications on this device only. */
    stopHere: async () => {
      setBusy(true);
      setDevice(await deviceOff());
      setBusy(false);
    },
  };
}
