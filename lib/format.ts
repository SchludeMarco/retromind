import { CapturedMemory, UserProfile } from '../types';

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const todayStamp = () => new Date().toISOString().slice(0, 10);

export function downloadBlob(filename: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Shrink an uploaded photo before it travels to the API (request-size + speed).
export function downscaleImage(dataUrl: string, max = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function buildBookText(user: UserProfile, decade: string, memories: CapturedMemory[], note: string): string {
  const out: string[] = [
    'RETROMIND — ERINNERUNGS-BUCH',
    '================================',
    user.name ? `Für: ${user.name}` : '',
    user.birthDate ? `Geboren: ${user.birthDate}` : '',
    `Schwerpunkt: die ${decade}er Jahre`,
    user.interests.length ? `Interessen: ${user.interests.join(', ')}` : '',
    `Erstellt: ${new Date().toLocaleString('de-DE')}`,
  ].filter(Boolean);

  const groups: Record<string, CapturedMemory[]> = {};
  for (const m of memories) (groups[m.decade] ||= []).push(m);
  for (const d of Object.keys(groups).sort()) {
    out.push('', `— ${d}er —`, '');
    for (const m of groups[d]) {
      out.push(`• ${m.term}`);
      if (m.prompt) out.push(`  Frage: ${m.prompt}`);
      out.push(`  ${m.answer.trim() || '(keine Notiz)'}`, '');
    }
  }
  if (note.trim()) out.push('', '— FREIE NOTIZ —', '', note.trim());
  return out.join('\n') + '\n';
}

// A user was born in `birthDate`; they'd have been ~8 years old (prime
// nostalgia age) in this decade. Clamped to the decades we have content for.
export function computeFocusDecade(birthDate: string): string {
  if (!birthDate) return '1980';
  const year = new Date(birthDate).getFullYear();
  if (Number.isNaN(year)) return '1980';
  const raw = Math.floor((year + 8) / 10) * 10;
  return String(Math.min(2010, Math.max(1960, raw)));
}
