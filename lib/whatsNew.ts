// "Was ist neu?" is fed straight from CHANGELOG.md, so every change that is
// logged there (see CLAUDE.md) shows up in the app without extra work. The
// file is bundled as raw text and parsed here into plain entries.
import changelog from '../CHANGELOG.md?raw';

export interface WhatsNewEntry {
  id: string;
  /** "Zeitreise", "Gaming-Edition" … when the title starts with a module name. */
  module?: string;
  title: string;
  date?: string;
  text: string;
}

export interface WhatsNewSection {
  /** "Unreleased" or a version number such as "2.0.1". */
  version: string;
  entries: WhatsNewEntry[];
}

const SEEN_KEY = 'retromind.whatsnew.seen';
const MODULES = ['Zeitreise', 'Gaming-Edition'];

// Entries that only concern the repository, not the app people use.
const HIDDEN_TITLES = /^Dokumentation\b/;

const cleanText = (s: string) =>
  s
    // a parenthesis holding only a file path is meaningless in the app
    .replace(/\s*\(`[^`]*`(?:,\s*[^)]*)?\)/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const parseEntry = (raw: string, index: number): WhatsNewEntry | null => {
  const body = raw.replace(/^-\s*/, '').replace(/\n\s*/g, ' ').trim();
  const bold = body.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  let title = bold ? bold[1].trim() : '';
  let rest = bold ? bold[2] : body;

  if (HIDDEN_TITLES.test(title)) return null;

  // "(2026-10-03, PR #81): …" right after the title
  let date: string | undefined;
  const meta = rest.match(/^\(([^)]*)\)\s*:?\s*/);
  if (meta) {
    date = meta[1].match(/\d{4}-\d{2}-\d{2}/)?.[0];
    rest = rest.slice(meta[0].length);
  }
  rest = rest.replace(/^:\s*/, '');
  title = title.replace(/:$/, '').trim();

  let module: string | undefined;
  const prefix = MODULES.find((m) => title.startsWith(`${m}:`));
  if (prefix) {
    module = prefix;
    title = title.slice(prefix.length + 1).trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  const text = cleanText(rest);
  if (!title && !text) return null;
  return { id: `${index}:${title || text.slice(0, 40)}`, module, title: cleanText(title), date, text };
};

export const parseChangelog = (md: string): WhatsNewSection[] => {
  const sections: WhatsNewSection[] = [];
  let current: WhatsNewSection | null = null;
  let entry: string[] | null = null;
  let index = 0;

  const flush = () => {
    if (current && entry) {
      const parsed = parseEntry(entry.join('\n'), index++);
      if (parsed) current.entries.push(parsed);
    }
    entry = null;
  };

  for (const line of md.split('\n')) {
    const heading = line.match(/^## (.+)$/);
    if (heading) {
      flush();
      current = { version: heading[1].trim(), entries: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith('- ')) {
      flush();
      entry = [line];
    } else if (entry && /^\s+\S/.test(line)) {
      entry.push(line);
    } else {
      // blank line, sub-heading or free paragraph ends the entry
      flush();
    }
  }
  flush();
  return sections.filter((s) => s.entries.length);
};

export const WHATS_NEW: WhatsNewSection[] = parseChangelog(changelog);

const newestId = () => WHATS_NEW[0]?.entries[0]?.id ?? '';

/** True while the newest entry hasn't been seen on this device yet. */
export const hasUnseenNews = (): boolean => {
  try {
    const seen = localStorage.getItem(SEEN_KEY);
    return !!newestId() && seen !== newestId();
  } catch {
    return false;
  }
};

export const markNewsSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, newestId());
  } catch {
    /* storage unavailable: the dot just shows again next time */
  }
};
