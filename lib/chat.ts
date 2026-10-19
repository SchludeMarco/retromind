import { useEffect, useState, useSyncExternalStore } from 'react';

// The chat corner's side in the browser (api/_chat.js, served at /api/chat):
// invited guests write to each other in one shared room or person to person.
// Nothing goes to the server before someone joins with a name of their own,
// after reading what is stored. What was read last is a "retromind" key, so
// it travels with the rest of their data (lib/sync.ts) and an answer read on
// the phone doesn't show up as new on the laptop.

export interface ChatPerson {
  id: string;
  name: string;
}

export interface ChatMe extends ChatPerson {
  /** Marco: can remove any message in the room. */
  admin: boolean;
}

export interface ChatMessage {
  id: string;
  from: string;
  name: string;
  text: string;
  at: number;
  mine: boolean;
}

export interface ChatInbox {
  /** False when the chat isn't available here (no database, preview deployments). */
  ready: boolean;
  me: ChatMe | null;
  people: ChatPerson[];
  /** Newest message from someone else, per conversation ("all" = the room). */
  last: Record<string, number>;
}

export const ROOM = 'all';
const READ = 'retromind.chat.read';
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

async function call(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, { credentials: 'same-origin', ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`chat ${res.status}`), { code: data.error || String(res.status) });
  return data;
}

const json = (method: string, body: object): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const loadInbox = (): Promise<ChatInbox> =>
  call('/api/chat').catch(() => ({ ready: false, me: null, people: [], last: {} }));

export const loadMessages = async (withId: string, after = 0): Promise<ChatMessage[]> =>
  (await call(`/api/chat?with=${encodeURIComponent(withId)}${after ? `&after=${after}` : ''}`)).messages || [];

export const joinChat = async (name: string): Promise<ChatMe> => (await call('/api/chat', json('POST', { name }))).me;

export const sendMessage = async (to: string, text: string): Promise<ChatMessage> =>
  (await call('/api/chat', json('POST', { to, text }))).message;

export const deleteMessage = (withId: string, id: string): Promise<unknown> =>
  call(`/api/chat?with=${encodeURIComponent(withId)}&id=${id}`, { method: 'DELETE' });

/** Leaves the chat: the profile, own messages and conversations go ("Delete my data" too). */
export const leaveChat = (): Promise<unknown> => call('/api/chat?all=1', { method: 'DELETE' }).catch(() => null);

/* ---------------------------------------------------------------- read marks */

let readCache: { raw: string | null; map: Record<string, number> } = { raw: null, map: {} };

function readMarks(): Record<string, number> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(READ);
  } catch {
    /* storage unavailable */
  }
  if (raw !== readCache.raw) {
    let map: Record<string, number> = {};
    try {
      map = raw ? JSON.parse(raw) : {};
    } catch {
      /* broken: start fresh */
    }
    readCache = { raw, map };
  }
  return readCache.map;
}

export function markRead(withId: string, at = Date.now()) {
  const map = readMarks();
  if ((map[withId] || 0) >= at) return;
  try {
    localStorage.setItem(READ, JSON.stringify({ ...map, [withId]: at }));
  } catch {
    /* storage unavailable */
  }
  emit();
}

export const useReadMarks = () =>
  useSyncExternalStore((fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, readMarks);

/** Conversations with something new from others. */
export function unreadIn(inbox: ChatInbox | null, marks: Record<string, number>): string[] {
  if (!inbox?.me) return [];
  return Object.entries(inbox.last)
    .filter(([id, at]) => at > (marks[id] || 0))
    .filter(([id]) => id === ROOM || inbox.people.some((p) => p.id === id))
    .map(([id]) => id);
}

/* ---------------------------------------------------------------- the inbox, kept fresh */

let shared: ChatInbox | null = null;
let fetching: Promise<void> | null = null;

export async function refreshInbox(): Promise<ChatInbox> {
  if (!fetching) {
    fetching = loadInbox()
      .then((inbox) => {
        shared = inbox;
        emit();
      })
      .finally(() => {
        fetching = null;
      });
  }
  await fetching;
  return shared!;
}

const getInbox = () => shared;

/**
 * The inbox for the whole app: asked again every minute while the page is
 * visible (every few seconds while the chat is open is the panel's job).
 * Only for guests who joined: a first look tells whether they did.
 */
export function useChatInbox(enabled = true): ChatInbox | null {
  const inbox = useSyncExternalStore((fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, getInbox);
  const joined = !!inbox?.me;
  useEffect(() => {
    if (!enabled) return;
    if (!shared) refreshInbox();
    if (!joined) return;
    const tick = () => document.visibilityState === 'visible' && refreshInbox();
    const timer = window.setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [enabled, joined]);
  return inbox;
}

/** Whether something new waits in the chat. */
export function useChatUnread(enabled = true): boolean {
  const inbox = useChatInbox(enabled);
  const marks = useReadMarks();
  return unreadIn(inbox, marks).length > 0;
}

/** A conversation to open from a push message (?chat=<id>) or the service worker. */
export function useChatOpenRequest(onOpen: (withId: string) => void) {
  const [first] = useState(() => {
    try {
      const url = new URL(window.location.href);
      const id = url.searchParams.get('chat');
      if (!id) return null;
      url.searchParams.delete('chat');
      window.history.replaceState(window.history.state, '', url.toString());
      return id;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    if (first) onOpen(first);
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'rm-chat' && typeof e.data.chat === 'string') onOpen(e.data.chat);
    };
    navigator.serviceWorker?.addEventListener('message', onMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
