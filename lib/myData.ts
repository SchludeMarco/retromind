import { tr } from './i18n';

// "Your data" in the settings of both editions (DSGVO Art. 15, 17 and 20):
// everything RetroMind keeps lives in this browser under keys that start
// with "retromind", so one button downloads all of it as a file and another
// deletes all of it. Nothing about the visitor is stored on our server
// (the statistics only hold numbers, see the privacy policy), so there is
// nothing else to export or delete there.

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
      'Delete everything RetroMind stored in this browser (journey, profile, savegame, settings, privacy choices, sign-ins)? This cannot be undone. A backup in your own Google Drive stays; you can remove it in your Google account.',
      'Alles löschen, was RetroMind in diesem Browser gespeichert hat (Reise, Profil, Savegame, Einstellungen, Datenschutz-Entscheidungen, Anmeldungen)? Das lässt sich nicht rückgängig machen. Eine Sicherung in deinem eigenen Google Drive bleibt; die kannst du in deinem Google-Konto entfernen.'
    )
  );
  if (!ok) return false;
  try {
    for (const k of ownKeys(localStorage)) localStorage.removeItem(k);
    for (const k of ownKeys(sessionStorage)) sessionStorage.removeItem(k);
  } catch {
    /* storage blocked: nothing stored either */
  }
  window.location.reload();
  return true;
}
