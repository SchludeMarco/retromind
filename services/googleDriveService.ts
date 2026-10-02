import { SessionState } from '../types';

// Persists the RetroMind session into the signed-in user's own Google Drive
// "appDataFolder" — a hidden per-app, per-user space that no other app or
// person can see or browse. There is no shared database on our side: every
// user's memories live only in their own Drive account (decentralized
// storage), the same way `localStorage` keeps them only in their own browser.
const FILE_NAME = 'retromind-session.json';
const FILES_API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';

async function findFileId(accessToken: string, fileName: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${fileName}' and trashed=false`);
  const res = await fetch(`${FILES_API}?spaces=appDataFolder&q=${q}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('drive_list_failed');
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

/** Reads one JSON file from the app's private Drive folder (null if absent). */
export async function loadDriveJson<T = unknown>(accessToken: string, fileName: string): Promise<T | null> {
  const fileId = await findFileId(accessToken, fileName);
  if (!fileId) return null;
  const res = await fetch(`${FILES_API}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('drive_download_failed');
  return (await res.json()) as T;
}

/** Writes one JSON file to the app's private Drive folder, creating it once. */
export async function saveDriveJson(accessToken: string, fileName: string, data: unknown): Promise<void> {
  const fileId = await findFileId(accessToken, fileName);
  const body = JSON.stringify(data);

  if (fileId) {
    const res = await fetch(`${UPLOAD_API}/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok) throw new Error('drive_update_failed');
    return;
  }

  const metadata = { name: fileName, parents: ['appDataFolder'] };
  const boundary = 'retromind-drive-boundary';
  const multipartBody =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
  const res = await fetch(`${UPLOAD_API}?uploadType=multipart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });
  if (!res.ok) throw new Error('drive_create_failed');
}

export async function loadSessionFromDrive(accessToken: string): Promise<SessionState | null> {
  const state = await loadDriveJson<SessionState>(accessToken, FILE_NAME);
  return state && state.version === 2 ? state : null;
}

export function saveSessionToDrive(accessToken: string, state: SessionState): Promise<void> {
  return saveDriveJson(accessToken, FILE_NAME, state);
}
