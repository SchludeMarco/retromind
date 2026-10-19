import React from 'react';
import { tr } from '../../lib/i18n';
import { cameFromZeitreise, zeitreiseHref } from '../lib/cameFrom';

// All of the hall's controls behind one small handle at the right edge,
// halfway down the screen, like in the Zeitreise (Marco, 2026-10-18). The
// handle opens the settings as a panel sliding in from the right, with the
// controls at its top: the sections (formerly the dock at the bottom), the
// music, sound, the Guru, feedback, leaving the club and the way back to the
// Zeitreise (formerly buttons in the top bar; _removed_content/).

export const GamingHandle: React.FC<{ onOpen: () => void; dot?: boolean }> = ({ onOpen, dot = false }) => (
  <button
    type="button"
    className="gm-control-handle"
    onClick={onOpen}
    aria-label={tr('Open controls and settings', 'Steuerung und Einstellungen öffnen')}
    title={tr('Controls and settings', 'Steuerung und Einstellungen')}
    data-nav
  >
    {/* Three pixel faders. */}
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M1 3h14v1H1zM1 8h14v1H1zM1 12h14v1H1z" />
      <path d="M4 1h3v5H4zM9 6h3v5H9zM3 10h3v5H3z" />
    </svg>
    {dot && <span className="gm-control-dot" aria-hidden="true" />}
  </button>
);

export interface Section<V extends string> {
  id: V | 'systems';
  label: string;
}

export function GamingControls<V extends string>({
  sections,
  current,
  onSection,
  music,
  muted,
  onToggleMute,
  guruOpen,
  onGuru,
  onFeedback,
  onChat,
  chatNews = false,
  onLeave,
}: {
  sections: Section<V>[];
  current: V;
  onSection: (id: V | 'systems') => void;
  /** Back / play / next and the song, plus "more music". */
  music?: React.ReactNode;
  muted: boolean;
  onToggleMute: () => void;
  guruOpen: boolean;
  onGuru: () => void;
  onFeedback: () => void;
  /** The chat corner with the other guests (components/GuestChat.tsx). */
  onChat?: () => void;
  chatNews?: boolean;
  onLeave: () => void;
}) {
  return (
    <div className="gm-controls">
      <section>
        <h3 className="pixel-font">{tr('SECTIONS', 'BEREICHE')}</h3>
        <div className="gm-controls-grid">
          {sections.map((s) => (
            <button
              key={s.id}
              className="px-btn"
              aria-current={s.id === current ? 'page' : undefined}
              onClick={() => onSection(s.id)}
              data-nav
            >
              {s.id === current ? '► ' : ''}
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {music && (
        <section>
          <h3 className="pixel-font">{tr('MUSIC', 'MUSIK')}</h3>
          {music}
        </section>
      )}

      <section>
        <h3 className="pixel-font">{tr('QUICK ACCESS', 'SCHNELLZUGRIFF')}</h3>
        <div className="gm-controls-row">
          <button className="px-btn" onClick={onToggleMute} aria-pressed={muted} data-nav>
            {muted ? tr('🔇 SOUND OFF', '🔇 TON AUS') : tr('🔊 SOUND ON', '🔊 TON AN')}
          </button>
          <button className="px-btn" onClick={onGuru} aria-pressed={guruOpen} data-nav>
            {guruOpen ? tr('✕ CLOSE GURU', '✕ GURU ZU') : '☻ GURU'}
          </button>
          {onChat && (
            <button className="px-btn gm-chat-btn" onClick={onChat} data-nav>
              {tr('☏ CHAT CORNER', '☏ PLAUDERECKE')}
              {chatNews && <span className="gm-control-dot" aria-label={tr('new messages', 'neue Nachrichten')} />}
            </button>
          )}
          <button className="px-btn gm-feedback" onClick={onFeedback} data-nav>
            ✉ FEEDBACK
          </button>
          <button className="px-btn" onClick={onLeave} data-nav>
            {tr('⏏ LEAVE THE CLUB', '⏏ CLUB VERLASSEN')}
          </button>
          {cameFromZeitreise() && (
            <a
              className="px-btn"
              href={zeitreiseHref()}
              onClick={(e) => {
                e.currentTarget.href = zeitreiseHref();
              }}
              data-nav
            >
              {tr('◄ BACK TO RETROMIND', '◄ ZURÜCK ZU RETROMIND')}
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
