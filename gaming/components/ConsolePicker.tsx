import React, { useEffect, useRef, useState } from 'react';
import { KIND_ICON, MAKERS, PLATFORMS, PlatformInfo, photoUrl } from '../data/platforms';

// The console shelf: one tap opens every system, grouped by maker like the
// shelves in an old game shop. Each tile is a photo of the console (from
// Wikimedia Commons); if a photo can't load, its icon stands in.

const Photo: React.FC<{ file?: string; icon: string }> = ({ file, icon }) => {
  const [failed, setFailed] = useState(!file);
  return failed ? (
    <span className="console-icon" aria-hidden="true">
      {icon}
    </span>
  ) : (
    <img className="console-photo" src={photoUrl(file!)} alt="" loading="lazy" onError={() => setFailed(true)} />
  );
};

// Nicknames people actually type, on top of the name, maker and the
// Wikipedia category (which already brings "Genesis", "Commodore", …).
const NICKNAMES: Record<string, string> = {
  NES: 'nintendo entertainment system famicom',
  SNES: 'super nintendo super famicom',
  'Nintendo 64': 'n64',
  'Game Boy Color': 'gbc',
  'Game Boy Advance': 'gba',
  'Nintendo DS': 'nds',
  'Nintendo 3DS': '3ds',
  PlayStation: 'ps1 psx playstation 1',
  'PlayStation 2': 'ps2',
  'PlayStation 3': 'ps3',
  'PlayStation 4': 'ps4',
  PSP: 'playstation portable',
  'PS Vita': 'playstation vita',
  'Mega Drive': 'genesis',
  'PC Engine': 'turbografx',
  'MS-DOS': 'dos pc ibm',
  Windows: 'pc',
  Arcade: 'spielhalle automat',
};

/** Lower case, without spaces and dashes, so "ps 2" finds "PS2". */
const squash = (s: string) => s.toLowerCase().replace(/[\s\-_.]+/g, '');

const matches = (q: string, p: Pick<PlatformInfo, 'id'> & Partial<PlatformInfo>, makerLabel = '') => {
  if (!q) return true;
  const hay = [p.id, p.category ?? '', makerLabel, p.maker ?? '', NICKNAMES[p.id] ?? ''];
  // Every word must match somewhere, e.g. "game boy color" or "sony ps".
  return q
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.some((h) => squash(h).includes(squash(w))));
};

export const ConsolePicker: React.FC<{
  current: string | null;
  /** Systems only the curated catalog uses, e.g. Multiplattform. */
  extras: string[];
  onPick: (platform: string | null) => void;
  onClose: () => void;
}> = ({ current, extras, onPick, onClose }) => {
  const [query, setQuery] = useState('');
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // On a phone the keyboard would hide the shelf, so only jump into the
    // field where there is a real keyboard anyway.
    if (window.matchMedia?.('(pointer: fine)').matches) field.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const tile = (id: string, icon: string, color: string, sub?: string, photo?: string) => (
    <button
      key={id}
      className="console-tile"
      style={{ ['--tile' as string]: color }}
      aria-pressed={current === id}
      onClick={() => onPick(id)}
      data-nav
    >
      <span className="console-pic">
        <Photo file={photo} icon={icon} />
      </span>
      <span className="console-name">{id}</span>
      {sub && <span className="console-sub">{sub}</span>}
    </button>
  );

  const shelves = [
    ...MAKERS.map((m) => {
      const list = PLATFORMS.filter((p) => p.maker === m.id && matches(query, p, m.label)).sort((a, b) => a.from - b.from);
      return { id: m.id as string, label: m.label, ids: list.map((p) => p.id), tiles: list.map((p) => tile(p.id, KIND_ICON[p.kind], p.color, `seit ${p.from}`, p.photo)) };
    }),
    (() => {
      const list = extras.filter((id) => matches(query, { id }, 'Sonstiges'));
      return { id: 'extras', label: 'Sonstiges', ids: list, tiles: list.map((id) => tile(id, '🌐', '#b03a6f', 'nur Schätze')) };
    })(),
  ].filter((s) => s.ids.length > 0);
  const hits = shelves.flatMap((s) => s.ids);

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog console-picker"
        role="dialog"
        aria-modal="true"
        aria-label="Konsole wählen"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="console-head">
          <h2 className="pixel-font">WELCHE KISTE?</h2>
          <button className="px-btn close-x" onClick={onClose} aria-label="Schließen" data-nav>
            ✕
          </button>
          <div className="search console-search">
            <input
              ref={field}
              type="text"
              inputMode="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hits.length === 1) onPick(hits[0]);
              }}
              placeholder="Kiste suchen, z. B. PS2, Sega, Game Boy …"
              aria-label="Konsole suchen"
              enterKeyHint="go"
              data-nav
            />
            {query && (
              <button className="px-btn" onClick={() => (setQuery(''), field.current?.focus())} aria-label="Suche leeren" data-nav>
                ✕
              </button>
            )}
          </div>
        </div>
        {!query && (
          <>
            <button className="px-btn big console-all" aria-pressed={current === null} onClick={() => onPick(null)} data-nav>
              ★ ALLE KONSOLEN
            </button>
            <p className="dim console-credit">Fotos: Wikimedia Commons (freie Lizenzen)</p>
          </>
        )}
        {shelves.map((shelf) => (
          <section key={shelf.id} className="console-shelf">
            <h3 className="pixel-font">{shelf.label.toUpperCase()}</h3>
            <div className="console-grid">{shelf.tiles}</div>
          </section>
        ))}
        {query && hits.length === 0 && (
          <p className="dim console-none">
            Keine Kiste passt zu „{query}“. Ätzend.{' '}
            <button className="px-btn" onClick={() => setQuery('')} data-nav>
              ALLE ZEIGEN
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
