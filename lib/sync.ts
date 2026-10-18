import { deleteDriveFile, loadDriveJson, loadSessionFromDrive, saveDriveJson } from '../services/googleDriveService';
import { ensureGoogleSession, googleSessionLikely, onGoogleSessionChange } from './googleLogin';
import { addHandoffPart, b64urlToBytes, bytesToB64url, takeHandoff } from './handoff';

// One RetroMind: the Zeitreise and the Gaming edition keep their data like a
// single app (Marco, 2026-10-17). Everything still lives in localStorage
// first, under keys starting with "retromind"; this module keeps those keys
// the same everywhere:
//
// - On this device, across both domains: every link from one app to the
//   other carries the data along in its #fragment (lib/handoff.ts), so the
//   other side starts with the same language, initials, journey and savegame.
// - In the cloud, after a Google sign-in: one file, retromind-sync.json, in
//   the person's own Drive appDataFolder (both apps use the same Google
//   client, so they share that folder). It is read before the app starts,
//   written a moment after every change, and checked again every minute and
//   whenever the tab comes back to the front.
//
// Each key carries the time it last changed on any device, and the newer
// value wins. The first time a device meets an account's cloud copy and the
// two differ, the person decides once: the cloud's data (recommended) or this
// device's. Data that changes while the app is open elsewhere is written to
// localStorage right away and shown by reloading the page the next time it
// comes back to the front (the open page keeps its place, lib/pageMemory.ts).
//
// The sign-ins count in both apps too: the Spotify login (its refresh token)
// syncs like any other key, and the Google login travels with every link
// between the apps (lib/googleLogin.ts; it can't come from the cloud, since
// reaching the cloud needs it) and is kept per device by the server
// (api/_googleKeep.js). Not synced: the Google token itself, the
// consent for Spotify/YouTube (asked per address), caches and per-tab state.

export type SyncApp = 'zeitreise' | 'gaming';
export type SyncStatus = 'off' | 'loading' | 'saving' | 'saved' | 'error';

const FILE = 'retromind-sync.json';
const META = 'retromind.sync.meta';
/** sessionStorage: set before a reload that brought in data, shown as a toast after it. */
const NOTICE = 'retromind.sync.notice';
const DATA_PART = 'rm_data';

const DEVICE_ONLY = new Set([
  'retromind.google',
  'retromind.google.session',
  'retromind.consent',
  'retromind.weather.now',
  'retromind.gaming.cloud',
  'retromind.gaming.fromZeitreise',
  'retromind.page',
  'retromind-gaming.page',
]);
const DEVICE_PREFIXES = ['retromind.sync', 'retromind.visit.', 'retromind.spotify.verifier', 'retromind.spotify.state'];

/** Whether a localStorage key travels between the apps and devices. */
export function isSynced(key: string): boolean {
  return key.startsWith('retromind') && !DEVICE_ONLY.has(key) && !DEVICE_PREFIXES.some((p) => key.startsWith(p));
}

/** Keys the Gaming edition reads; anything else changing doesn't need its page reloaded. */
const GAMING_KEYS = ['retromind.lang', 'retromind.muted', 'retromind.music.volume', 'retromind.initials', 'retromind.spotify.autoTheme', 'retromind.spotify.refresh_token'];

/** Read fresh on every use (hooks/useSpotifyAuth.ts): a renewed one needs no reload, only signing in or out does. */
const QUIET_KEYS = ['retromind.spotify.refresh_token'];

function relevant(app: SyncApp, key: string): boolean {
  return app === 'gaming' ? key.startsWith('retromind.gaming') || GAMING_KEYS.includes(key) : !key.startsWith('retromind.gaming');
}

interface Entry {
  v: string | null;
  t: number;
}
interface CloudFile {
  version: 1;
  updatedAt: number;
  keys: Record<string, Entry>;
}
interface Meta {
  /** When each key last changed (0 or missing: before this module existed). */
  times: Record<string, number>;
  /** The Google account this device last synced with. */
  account?: string;
}

// --- localStorage without the stamping below --------------------------------

const proto = typeof Storage !== 'undefined' ? Storage.prototype : null;
const nativeGet = proto?.getItem;
const nativeSet = proto?.setItem;
const nativeRemove = proto?.removeItem;

function ls(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function get(key: string): string | null {
  const s = ls();
  return s && nativeGet ? nativeGet.call(s, key) : null;
}

function put(key: string, value: string | null) {
  const s = ls();
  if (!s || !nativeSet || !nativeRemove) return;
  try {
    if (value === null) nativeRemove.call(s, key);
    else nativeSet.call(s, key, value);
  } catch {
    /* storage full or blocked — this key stays as it was */
  }
}

let meta: Meta = { times: {} };

function readMeta() {
  try {
    const parsed = JSON.parse(get(META) || '{}');
    meta = { times: parsed?.times && typeof parsed.times === 'object' ? parsed.times : {}, account: parsed?.account };
  } catch {
    meta = { times: {} };
  }
}

function writeMeta() {
  put(META, JSON.stringify(meta));
}

function localKeys(): string[] {
  const s = ls();
  const keys = new Set<string>(Object.keys(meta.times).filter(isSynced));
  if (s) {
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && isSynced(k)) keys.add(k);
    }
  }
  return [...keys];
}

let lastStamp = 0;
function now(): number {
  // Strictly increasing, so two changes in the same millisecond still order.
  lastStamp = Math.max(Date.now(), lastStamp + 1);
  return lastStamp;
}

// --- noticing every change ---------------------------------------------------

let app: SyncApp = 'zeitreise';
let installed = false;

function install() {
  if (installed || !proto || !nativeGet || !nativeSet || !nativeRemove) return;
  installed = true;
  const getItem = nativeGet;
  const setItem = nativeSet;
  const removeItem = nativeRemove;
  proto.setItem = function (this: Storage, key: string, value: string) {
    if (this !== ls() || !isSynced(key)) return setItem.call(this, key, value);
    const before = getItem.call(this, key);
    setItem.call(this, key, value);
    if (before !== String(value)) touched(key);
  };
  proto.removeItem = function (this: Storage, key: string) {
    if (this !== ls() || !isSynced(key)) return removeItem.call(this, key);
    const before = getItem.call(this, key);
    removeItem.call(this, key);
    if (before !== null) touched(key);
  };
}

function touched(key: string) {
  readMeta(); // another tab of this app may have stamped keys meanwhile
  meta.times[key] = now();
  writeMeta();
  schedulePush();
  scheduleHandoff();
}

// --- status for the settings ("saved in your Google Drive") -----------------

let status: SyncStatus = 'off';
const statusListeners = new Set<() => void>();

function setStatus(next: SyncStatus) {
  if (status === next) return;
  status = next;
  statusListeners.forEach((fn) => fn());
}

export function getSyncStatus(): SyncStatus {
  return status;
}

export function onSyncStatus(fn: () => void): () => void {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
}

// --- merging -----------------------------------------------------------------

/** Equal apart from a stored "updatedAt" (the journey stamps one on every save). */
function sameContent(a: string, b: string): boolean {
  if (a === b) return true;
  try {
    const x = JSON.parse(a);
    const y = JSON.parse(b);
    if (!x || !y || typeof x !== 'object' || typeof y !== 'object') return false;
    delete x.updatedAt;
    delete y.updatedAt;
    return JSON.stringify(x) === JSON.stringify(y);
  } catch {
    return false;
  }
}

/** Takes in what is newer elsewhere; returns the keys that changed here. */
function takeNewer(incoming: Record<string, Entry>): string[] {
  readMeta();
  const applied: string[] = [];
  for (const [key, e] of Object.entries(incoming)) {
    if (!isSynced(key) || !e || typeof e.t !== 'number') continue;
    const local = get(key);
    const lt = meta.times[key] ?? 0;
    if (e.v === local) {
      if (e.t > lt) meta.times[key] = e.t;
      continue;
    }
    // Newer wins; a value the device never had comes in even without a time.
    if (e.t > lt || (local === null && lt === 0 && e.v !== null)) {
      put(key, e.v);
      meta.times[key] = e.t;
      if (!(QUIET_KEYS.includes(key) && local !== null && e.v !== null)) applied.push(key);
    }
  }
  writeMeta();
  return applied;
}

/** The cloud copy with every key this device has newer; null when nothing changed. */
function newerHere(remote: Record<string, Entry>): Record<string, Entry> | null {
  const next = { ...remote };
  let changed = false;
  for (const key of localKeys()) {
    const v = get(key);
    const t = meta.times[key] ?? 0;
    const r = remote[key];
    if (r ? t > r.t && r.v !== v : v !== null) {
      next[key] = { v, t };
      changed = true;
    }
  }
  return changed ? next : null;
}

// --- the cloud ---------------------------------------------------------------

/** The initials' own file from before this module (PR #231); taken over once, then deleted. */
const LEGACY_INITIALS = 'retromind-initials.json';

/** Before this file existed each app kept its own backup; those count as old cloud values. */
async function legacyKeys(token: string): Promise<Record<string, Entry>> {
  const keys: Record<string, Entry> = {};
  try {
    const session = await loadSessionFromDrive(token);
    if (session) keys['retromind.session.v2'] = { v: JSON.stringify(session), t: 1 };
  } catch {
    /* no old journey backup */
  }
  try {
    const tag = await loadDriveJson<{ version: number; initials: string }>(token, LEGACY_INITIALS);
    if (tag?.version === 1 && tag.initials) keys['retromind.initials'] = { v: String(tag.initials), t: 1 };
  } catch {
    /* no old initials file */
  }
  try {
    const gaming = await loadDriveJson<{ version: number; state: unknown }>(token, 'retromind-gaming.json');
    if (gaming?.version === 1 && gaming.state) keys['retromind.gaming.v1'] = { v: JSON.stringify(gaming.state), t: 1 };
  } catch {
    /* no old Gaming backup */
  }
  return keys;
}

let chain: Promise<unknown> = Promise.resolve();
let asking = false;

/** One round with the cloud: read, ask once if needed, take in, write back. */
function syncCloud(): Promise<string[]> {
  const run = chain.then(async () => {
    const session = await ensureGoogleSession();
    if (!session) {
      setStatus('off');
      return [];
    }
    readMeta();
    const token = session.token.accessToken;
    const account = session.user.email || session.user.id;
    setStatus(status === 'off' ? 'loading' : 'saving');
    try {
      const file = await loadDriveJson<CloudFile>(token, FILE);
      const remote = file?.version === 1 && file.keys ? file.keys : await legacyKeys(token);
      if (meta.account !== account) {
        const conflicts = Object.entries(remote)
          .filter(([k, e]) => isSynced(k) && e.v !== null && get(k) !== null && !sameContent(get(k)!, e.v))
          .map(([k]) => k);
        if (conflicts.length) {
          asking = true;
          const choice = await askWhichData().finally(() => (asking = false));
          const t = now();
          for (const k of conflicts) meta.times[k] = choice === 'cloud' ? 0 : t;
          // The cloud's time must beat 0 even for an old backup without one.
          if (choice === 'cloud') for (const k of conflicts) remote[k] = { ...remote[k], t: Math.max(remote[k].t, 1) };
        }
        meta.account = account;
        writeMeta();
      }
      const applied = takeNewer(remote);
      const upload = newerHere(remote) ?? (file ? null : remote);
      if (upload) await saveDriveJson(token, FILE, { version: 1, updatedAt: Date.now(), keys: upload } satisfies CloudFile);
      if (!file) await deleteDriveFile(token, LEGACY_INITIALS).catch(() => {});
      setStatus('saved');
      return applied;
    } catch {
      setStatus('error');
      return [];
    }
  });
  chain = run.catch(() => {});
  return run;
}

let pushTimer: number | undefined;
function schedulePush() {
  if (!googleSessionLikely()) return;
  window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => {
    pushTimer = undefined;
    void background();
  }, 2000);
}

/** While the page is open: take in quietly, show it on the next return to the tab. */
let reloadPending = false;
async function background() {
  const applied = await syncCloud();
  if (applied.some((k) => relevant(app, k))) reloadPending = true;
}

/** Brings in what changed and shows it now by reloading the page (it keeps its place). */
async function foreground() {
  const applied = await syncCloud();
  if (reloadPending || applied.some((k) => relevant(app, k))) reloadWithNotice();
}

function reloadWithNotice() {
  try {
    sessionStorage.setItem(NOTICE, '1');
  } catch {
    /* no toast then */
  }
  window.location.reload();
}

// --- the same device, other domain --------------------------------------------

let handoffValue: string | null = null;
let handoffTimer: number | undefined;
/** Generous for a #fragment, small enough for every browser's address limit. */
const HANDOFF_BUDGET = 200_000;

function scheduleHandoff() {
  window.clearTimeout(handoffTimer);
  handoffTimer = window.setTimeout(() => void buildHandoff(), 300);
}

async function buildHandoff() {
  readMeta();
  // Smallest first, so a big journey with photos is the one left out.
  const entries = localKeys()
    .map((k) => [k, get(k), meta.times[k] ?? 0] as const)
    .sort((a, b) => (a[1]?.length ?? 0) - (b[1]?.length ?? 0));
  const pack: Record<string, [string | null, number]> = {};
  let size = 0;
  for (const [k, v, t] of entries) {
    size += k.length + (v?.length ?? 0) + 20;
    if (size > HANDOFF_BUDGET) break;
    pack[k] = [v, t];
  }
  const json = JSON.stringify(pack);
  try {
    const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
    handoffValue = 'z' + bytesToB64url(new Uint8Array(await new Response(stream).arrayBuffer()));
  } catch {
    handoffValue = 'j' + bytesToB64url(new TextEncoder().encode(json));
  }
}

async function readHandoff(value: string): Promise<Record<string, Entry>> {
  const bytes = b64urlToBytes(value.slice(1));
  let json: string;
  if (value[0] === 'z') {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    json = await new Response(stream).text();
  } else json = new TextDecoder().decode(bytes);
  const pack = JSON.parse(json) as Record<string, [string | null, number]>;
  const out: Record<string, Entry> = {};
  for (const [k, e] of Object.entries(pack)) if (Array.isArray(e)) out[k] = { v: e[0], t: Number(e[1]) || 0 };
  return out;
}

// --- start ---------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/**
 * Runs before the app's own modules load (index.tsx, gaming/main.tsx), so
 * every module reads the synced values on its first look into localStorage.
 * Waits for the cloud a short while only; a slow answer is shown by a reload.
 */
export async function bootSync(which: SyncApp): Promise<void> {
  app = which;
  try {
    readMeta();
    install();
    // The initials' old "keep mine" answer (PR #231); the shared question replaces it.
    put('retromind.initials.keptLocal', null);
  } catch {
    return;
  }

  const handed = takeHandoff(DATA_PART);
  if (handed) {
    try {
      takeNewer(await readHandoff(handed));
    } catch {
      /* garbled or cut off — the cloud or the next link brings it */
    }
  }

  addHandoffPart(DATA_PART, () => handoffValue);
  onGoogleSessionChange((session, renewed) => {
    if (renewed) return;
    if (session) void foreground();
    else setStatus('off');
  });
  let hiddenSince = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      hiddenSince = Date.now();
      // Leaving (another tab, the other app, closing): save right away.
      if (pushTimer !== undefined) {
        window.clearTimeout(pushTimer);
        pushTimer = undefined;
        void background();
      }
    } else if (googleSessionLikely() && Date.now() - hiddenSince > 5000) void foreground();
    else if (reloadPending) reloadWithNotice();
  });
  window.setInterval(() => {
    if (document.visibilityState === 'visible' && googleSessionLikely()) void background();
  }, 60_000);

  showNotice();
  void buildHandoff();

  // A kept sign-in whose hour is up is renewed first (api/_googleKeep.js);
  // a slow server just means the cloud follows a moment later.
  const renewal = ensureGoogleSession();
  if (!(await Promise.race([renewal, sleep(2500).then(() => null)]))) {
    void renewal.then((session) => session && foreground());
    return;
  }
  const first = syncCloud();
  const inTime = await Promise.race([
    first.then(() => true),
    (async () => {
      await sleep(2500);
      while (asking) await sleep(200);
      await sleep(1000);
      return false;
    })(),
  ]);
  if (!inTime) {
    first.then((applied) => {
      if (applied.some((k) => relevant(app, k))) reloadWithNotice();
    });
  }
  scheduleHandoff();
}

// --- the two bits of screen this module needs (before React is there) --------

function german(): boolean {
  return get('retromind.lang') === 'de';
}

function box(): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute('role', 'dialog');
  el.style.cssText =
    'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,12,8,.72);font-family:system-ui,-apple-system,Segoe UI,sans-serif';
  return el;
}

function askWhichData(): Promise<'cloud' | 'local'> {
  const de = german();
  return new Promise((resolve) => {
    const overlay = box();
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div style="max-width:440px;width:100%;background:#fff9eb;color:#2c1810;border:3px solid #2c1810;border-radius:14px;padding:22px;box-shadow:0 12px 40px rgba(0,0,0,.4)">
        <h2 style="margin:0 0 10px;font-size:20px">${de ? 'Deine Daten aus der Cloud' : 'Your data in the cloud'}</h2>
        <p style="margin:0 0 10px;line-height:1.45">${
          de
            ? 'In deinem Google-Konto liegt schon ein RetroMind-Stand (von einem anderen Gerät oder der anderen App), und auf diesem Gerät ist einiges anders.'
            : 'Your Google account already holds RetroMind data (from another device or the other app), and some of it differs on this device.'
        }</p>
        <p style="margin:0 0 16px;line-height:1.45;font-size:14px;opacity:.8">${
          de
            ? 'Was nur hier liegt, bleibt in jedem Fall erhalten. Ab jetzt sind beide Apps und alle Geräte immer auf demselben Stand.'
            : 'Anything that only exists here is kept either way. From now on both apps and all devices stay in sync.'
        }</p>
        <button data-c="cloud" style="display:block;width:100%;padding:12px;margin-bottom:8px;border:2px solid #2c1810;border-radius:10px;background:#d97706;color:#fff;font-weight:700;font-size:15px;cursor:pointer">${
          de ? 'Daten aus der Cloud nehmen (empfohlen)' : 'Use the cloud data (recommended)'
        }</button>
        <button data-c="local" style="display:block;width:100%;padding:12px;border:2px solid #2c1810;border-radius:10px;background:transparent;color:#2c1810;font-weight:600;font-size:15px;cursor:pointer">${
          de ? 'Daten von diesem Gerät behalten' : 'Keep the data on this device'
        }</button>
      </div>`;
    overlay.addEventListener('click', (e) => {
      const choice = (e.target as HTMLElement).closest('button')?.dataset.c;
      if (choice !== 'cloud' && choice !== 'local') return;
      overlay.remove();
      resolve(choice);
    });
    document.body.appendChild(overlay);
    overlay.querySelector('button')?.focus();
  });
}

function showNotice() {
  try {
    if (sessionStorage.getItem(NOTICE) !== '1') return;
    sessionStorage.removeItem(NOTICE);
  } catch {
    return;
  }
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.textContent = german() ? '☁️ Auf dem neuesten Stand aus der Cloud' : '☁️ Up to date with your cloud';
  el.style.cssText =
    'position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:2147483000;padding:10px 16px;border-radius:999px;background:#2c1810;color:#fff9eb;font:600 14px system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.35);transition:opacity .4s';
  document.body.appendChild(el);
  window.setTimeout(() => (el.style.opacity = '0'), 3500);
  window.setTimeout(() => el.remove(), 4000);
}
