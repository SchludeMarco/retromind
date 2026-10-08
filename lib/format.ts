import { CapturedMemory, UserProfile } from '../types';
import { GENDER_LABELS, INTEREST_LABELS } from '../constants';
import { tr, LOCALE } from './i18n';

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
    tr('RETROMIND — MEMORY BOOK', 'RETROMIND — ERINNERUNGS-BUCH'),
    '================================',
    user.name ? tr(`For: ${user.name}`, `Für: ${user.name}`) : '',
    user.birthDate ? tr(`Born: ${user.birthDate}`, `Geboren: ${user.birthDate}`) : '',
    user.gender ? tr('Gender', 'Geschlecht') + `: ${GENDER_LABELS[user.gender] ?? user.gender}` : '',
    tr(`Focus: the ${decade}s`, `Schwerpunkt: die ${decade}er Jahre`),
    user.interests.length
      ? tr('Interests', 'Interessen') + `: ${user.interests.map((i) => INTEREST_LABELS[i] ?? i).join(', ')}`
      : '',
    user.favoriteArtists.length
      ? tr('Favorite artists', 'Lieblingsmusiker:innen') + `: ${user.favoriteArtists.join(', ')}`
      : '',
    tr('Created', 'Erstellt') + `: ${new Date().toLocaleString(LOCALE)}`,
  ].filter(Boolean);

  const groups: Record<string, CapturedMemory[]> = {};
  for (const m of memories) (groups[m.decade] ||= []).push(m);
  for (const d of Object.keys(groups).sort()) {
    out.push('', tr(`— ${d}s —`, `— ${d}er —`), '');
    for (const m of groups[d]) {
      out.push(`• ${m.term}`);
      if (m.prompt) out.push(`  ${tr('Question', 'Frage')}: ${m.prompt}`);
      out.push(`  ${m.answer.trim() || tr('(no note)', '(keine Notiz)')}`, '');
    }
  }
  if (note.trim()) out.push('', tr('— FREE NOTE —', '— FREIE NOTIZ —'), '', note.trim());
  return out.join('\n') + '\n';
}

// A user was born in `birthDate`; they'd have been ~8 years old (prime
// nostalgia age) in this decade. Clamped to the decades we have content for.
const FIRST_DECADE = 1960;
const LAST_DECADE = 2010;

function birthYearOf(birthDate: string): number | null {
  if (!birthDate) return null;
  const year = new Date(birthDate).getFullYear();
  return Number.isNaN(year) ? null : year;
}

export function computeFocusDecade(birthDate: string): string {
  const year = birthYearOf(birthDate);
  if (year === null) return '1980';
  const raw = Math.floor((year + 8) / 10) * 10;
  return String(Math.min(LAST_DECADE, Math.max(FIRST_DECADE, raw)));
}

// Why this decade is "deine Zeit", in concrete years. Saying only "in den
// 2010ern warst du im Grundschulalter" read as a contradiction to someone
// born in 2010, and was plainly wrong when the decade had to be clamped.
export function describeFocusDecade(birthDate: string, focusDecade: string): string {
  const year = birthYearOf(birthDate);
  if (year === null) return tr(`We’ll start in the ${focusDecade}s.`, `Wir starten in den ${focusDecade}ern.`);
  const from = year + 6;
  const to = year + 10;
  const raw = Math.floor((year + 8) / 10) * 10;
  const intro = tr(
    `You were born in ${year}, so you were in elementary school from about ${from} to ${to}.`,
    `Du bist ${year} geboren, in der Grundschule warst du also etwa von ${from} bis ${to}.`
  );
  if (raw > LAST_DECADE) {
    return tr(
      `${intro} RetroMind doesn’t reach that far yet, so we’ll start with the most recent decade, the ${focusDecade}s.`,
      `${intro} So weit reicht RetroMind noch nicht, deshalb starten wir mit dem jüngsten Jahrzehnt, den ${focusDecade}ern.`
    );
  }
  if (raw < FIRST_DECADE) {
    return tr(
      `${intro} RetroMind doesn’t go back that far yet, so we’ll start with the earliest decade, the ${focusDecade}s.`,
      `${intro} So weit zurück reicht RetroMind noch nicht, deshalb starten wir mit dem ältesten Jahrzehnt, den ${focusDecade}ern.`
    );
  }
  return tr(`${intro} That’s why we’ll start in the ${focusDecade}s.`, `${intro} Deshalb starten wir in den ${focusDecade}ern.`);
}
