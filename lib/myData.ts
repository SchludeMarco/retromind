import { tr } from './i18n';
import { deleteAllAnswers } from './familyBook';
import { leaveChat } from './chat';

// "Your data" in the settings of both editions (DSGVO Art. 15, 17 and 20):
// everything RetroMind keeps lives in this browser under keys that start
// with "retromind", so one button downloads all of it as a file and another
// deletes all of it. Apart from the family book and the chat (below), nothing about the
// visitor is stored on our server (the statistics only hold numbers, see the
// privacy policy). The Gaming edition's emulator
// (EmulatorJS) keeps its own settings ("ejs…" keys) and its saves, cores and
// game files in IndexedDB; deleting removes those too.

const PREFIX = 'retromind';

function ownKeys(store: Storage): string[] {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const k = store.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  return keys;
}

function readAll(store: Storage): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of ownKeys(store)) {
    const raw = store.getItem(k);
    if (raw == null) continue;
    try {
      out[k] = JSON.parse(raw);
    } catch {
      out[k] = raw;
    }
  }
  return out;
}

/** Downloads everything RetroMind stored in this browser as one JSON file. */
export function downloadMyData(edition: 'zeitreise' | 'gaming') {
  let local: Record<string, unknown> = {};
  let session: Record<string, unknown> = {};
  try {
    local = readAll(localStorage);
    session = readAll(sessionStorage);
  } catch {
    /* storage blocked: the file says so by being empty */
  }
  const data = {
    app: edition === 'gaming' ? 'RetroMind – Gaming' : 'RetroMind – Zeitreise',
    site: window.location.origin,
    exportedAt: new Date().toISOString(),
    note: tr(
      'Everything RetroMind stored in this browser. Sign-in tokens are included; do not share this file.',
      'Alles, was RetroMind in diesem Browser gespeichert hat. Anmelde-Tokens sind enthalten; gib die Datei nicht weiter.'
    ),
    localStorage: local,
    sessionStorage: session,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `retromind-${edition}-${tr('my-data', 'meine-daten')}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** After asking, deletes everything RetroMind stored in this browser and reloads. */
export function deleteMyData(): boolean {
  const ok = window.confirm(
    tr(
      'Delete everything RetroMind stored in this browser (journey, profile, savegame, settings, privacy choices, sign-ins), your answers in the family book and your chat messages? This cannot be undone. A backup in your own Google Drive stays; you can remove it in your Google account.',
      'Alles löschen, was RetroMind in diesem Browser gespeichert hat (Reise, Profil, Savegame, Einstellungen, Datenschutz-Entscheidungen, Anmeldungen), deine Antworten im Familienbuch und deine Chat-Nachrichten? Das lässt sich nicht rückgängig machen. Eine Sicherung in deinem eigenen Google Drive bleibt; die kannst du in deinem Google-Konto entfernen.'
    )
  );
  if (!ok) return false;
  const family = deleteAllAnswers();
  const chat = leaveChat();
  try {
    for (const k of ownKeys(localStorage)) localStorage.removeItem(k);
    for (const k of ownKeys(sessionStorage)) sessionStorage.removeItem(k);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith('ejs')) localStorage.removeItem(k);
    }
  } catch {
    /* storage blocked: nothing stored either */
  }
  Promise.all([family, chat, deleteEmulatorData(), stopRivalAlerts()]).finally(() => window.location.reload());
  return true;
}

/** Notifications (lib/push.ts): the settings on the server and this device's push subscription. */
async function stopRivalAlerts() {
  await fetch('/api/highscores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefs: null }),
  }).catch(() => {});
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    for (const reg of regs) {
      const sub = await reg.pushManager?.getSubscription();
      if (!sub) continue;
      await fetch('/api/highscores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ push: null, endpoint: sub.endpoint }),
      }).catch(() => {});
      await sub.unsubscribe().catch(() => {});
    }
  } catch {
    /* no service workers here: nothing subscribed either */
  }
}

/** The emulator's databases: "EmulatorJS-…" and the save folder "/data/saves". */
async function deleteEmulatorData() {
  try {
    const dbs = (await indexedDB.databases?.()) ?? [];
    await Promise.all(
      dbs
        .map((d) => d.name)
        .filter((n): n is string => !!n && (n.startsWith('EmulatorJS') || n.startsWith('/data')))
        .map(
          (n) =>
            new Promise<void>((done) => {
              const req = indexedDB.deleteDatabase(n);
              req.onsuccess = req.onerror = req.onblocked = () => done();
            })
        )
    );
  } catch {
    /* no IndexedDB here: nothing stored either */
  }
}
