import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { WHATS_NEW, markNewsSeen } from '../lib/whatsNew';

const FIRST_BATCH = 8;

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

export const WhatsNewModal: React.FC<{
  onDismiss: () => void;
  onCloseClick: () => void;
}> = ({ onDismiss, onCloseClick }) => {
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    markNewsSeen();
  }, []);

  let shown = 0;
  const total = WHATS_NEW.reduce((n, s) => n + s.entries.length, 0);

  return (
    <Modal onClose={onDismiss} label="Was ist neu?">
      <button onClick={onCloseClick} aria-label="Schließen" className="absolute top-3 right-3 text-2xl leading-none">
        ✕
      </button>
      <span className="text-xs uppercase font-bold text-retro-amber-dark block">RetroMind</span>
      <h3 className="text-3xl font-bold mb-5">Was ist neu?</h3>

      {WHATS_NEW.map((section) => {
        if (!showAll && shown >= FIRST_BATCH) return null;
        const entries = showAll ? section.entries : section.entries.slice(0, FIRST_BATCH - shown);
        shown += entries.length;
        return (
          <section key={section.version} className="mb-5">
            <span className="block text-xs uppercase font-bold text-retro-brown mb-3 pb-1 border-b border-retro-ink/20">
              {section.version === 'Unreleased' ? 'Neueste Änderungen' : `Version ${section.version}`}
            </span>
            <ul className="space-y-4">
              {entries.map((e) => (
                <li key={e.id}>
                  {(e.module || e.date) && (
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {e.module && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 border border-retro-ink/40 text-retro-brown">
                          {e.module === 'Gaming-Edition' ? '🕹️ Gaming' : e.module}
                        </span>
                      )}
                      {e.date && <span className="text-[10px] text-retro-tan">{formatDate(e.date)}</span>}
                    </div>
                  )}
                  {e.title && <strong className="block text-sm mb-1">{e.title}</strong>}
                  {e.text && <p className="text-xs leading-relaxed">{e.text}</p>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {!showAll && total > FIRST_BATCH && (
        <button
          onClick={() => setShowAll(true)}
          className="retro-button px-4 py-2 border-2 border-retro-ink bg-white font-bold text-sm"
        >
          Ältere Änderungen anzeigen
        </button>
      )}
    </Modal>
  );
};
