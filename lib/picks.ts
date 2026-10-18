import { LANG } from './i18n';

// Shared helpers for the tap-to-pick lists (favourite bands, the treasure
// chest): one way to compare names, one way to write bilingual suggestions.

/** Compares names loosely: case, apostrophes, "&"/"and", a leading "The" and punctuation don't count. */
export function norm(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/^the\s+/, '')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

/**
 * A suggestion as written in the data files: one name for both languages,
 * `de:Name` (German UI only), `en:Name` (English UI only), or [English, German].
 * Returns the name for the current language, or null when it doesn't show.
 */
export type Suggestion = string | [string, string];

export function localize(item: Suggestion): string | null {
  if (Array.isArray(item)) return LANG === 'de' ? item[1] : item[0];
  if (item.startsWith('de:')) return LANG === 'de' ? item.slice(3) : null;
  if (item.startsWith('en:')) return LANG === 'en' ? item.slice(3) : null;
  return item;
}

export interface IdeaGroup {
  key: string;
  label?: string;
  items: string[];
}

/** Drops names that already showed in an earlier group (or twice in one), and empty groups. */
export function dedupeGroups(groups: IdeaGroup[]): IdeaGroup[] {
  const seen = new Set<string>();
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => {
        const k = norm(item);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      }),
    }))
    .filter((g) => g.items.length > 0);
}

/** "· aged 3–7" for a stretch of years, or '' without a birth year. */
export function ageSuffix(from: number, to: number, birthYear: number | null, tr: (en: string, de: string) => string): string {
  if (!birthYear) return '';
  if (to < birthYear) return tr(' · before your time', ' · vor deiner Zeit');
  const a = Math.max(0, from - birthYear);
  const b = Math.max(0, to - birthYear);
  return a === b ? tr(` · aged ${a}`, ` · mit ${a}`) : tr(` · aged ${a}–${b}`, ` · mit ${a}–${b}`);
}

/** Year from an ISO birth date, or null. */
export function birthYearOf(birthDate: string): number | null {
  return /^\d{4}/.test(birthDate) ? Number(birthDate.slice(0, 4)) : null;
}
