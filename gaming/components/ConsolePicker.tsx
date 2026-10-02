import React, { useEffect, useRef, useState } from 'react';
import { KIND_ICON, MAKERS, PLATFORMS, photoUrl } from '../data/platforms';

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

export const ConsolePicker: React.FC<{
  current: string | null;
  /** Systems only the curated catalog uses, e.g. Multiplattform. */
  extras: string[];
  onPick: (platform: string | null) => void;
  onClose: () => void;
}> = ({ current, extras, onPick, onClose }) => {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    first.current?.focus();
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

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog console-picker"
        role="dialog"
        aria-modal="true"
        aria-label="Konsole wählen"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pixel-font">KONSOLE WÄHLEN</h2>
        <button className="px-btn close-x" onClick={onClose} aria-label="Schließen" data-nav>
          ✕
        </button>
        <button
          ref={first}
          className="px-btn big console-all"
          aria-pressed={current === null}
          onClick={() => onPick(null)}
          data-nav
        >
          ★ ALLE KONSOLEN
        </button>
        <p className="dim console-credit">Fotos: Wikimedia Commons (freie Lizenzen)</p>
        {MAKERS.map((m) => (
          <section key={m.id} className="console-shelf">
            <h3 className="pixel-font">{m.label.toUpperCase()}</h3>
            <div className="console-grid">
              {PLATFORMS.filter((p) => p.maker === m.id)
                .sort((a, b) => a.from - b.from)
                .map((p) => tile(p.id, KIND_ICON[p.kind], p.color, `seit ${p.from}`, p.photo))}
            </div>
          </section>
        ))}
        {extras.length > 0 && (
          <section className="console-shelf">
            <h3 className="pixel-font">SONSTIGES</h3>
            <div className="console-grid">{extras.map((id) => tile(id, '🌐', '#b03a6f', 'nur Schätze'))}</div>
          </section>
        )}
      </div>
    </div>
  );
};
