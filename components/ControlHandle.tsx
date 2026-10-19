import React from 'react';
import { AppPhase } from '../types';
import { PHASES } from '../lib/session';
import { STATION_NAME } from '../lib/stations';
import { toggleMuted, useMuted } from '../lib/mute';
import { tr } from '../lib/i18n';

// All of the app's controls behind one small handle at the right edge,
// halfway down the screen (Marco, 2026-10-18: "die ganze Steuerung der App
// wie die Steuerung des Teils der Zeitreise befindet sich nun rechts hinter
// einem kleinen Symbol in der Mitte. Wenn man hierauf klickt, öffnet sich ein
// Overlay mit allen Einstellungen und Optionen"). The handle opens the
// settings as a panel sliding in from the right (SettingsModal `side`), with
// the controls below at its top. Replaces the settings and sound buttons, the
// music corner, the account pills, the home and companion buttons, the Retro
// Warm bottom navigation and the journey's floating pill (_removed_content/).

export const ControlHandle: React.FC<{ onOpen: () => void; hasNews: boolean; chatNews?: boolean }> = ({ onOpen, hasNews, chatNews = false }) => (
  <button
    type="button"
    onClick={onOpen}
    className="rm-control-handle rm-fixed no-print"
    aria-label={chatNews
      ? tr('Open controls and settings (new chat messages)', 'Steuerung und Einstellungen öffnen (neue Chat-Nachrichten)')
      : hasNews
        ? tr('Open controls and settings (new: What’s new)', 'Steuerung und Einstellungen öffnen (neu: Was ist neu)')
        : tr('Open controls and settings', 'Steuerung und Einstellungen öffnen')}
    title={tr('Controls and settings', 'Steuerung und Einstellungen')}
  >
    {/* Three sliders, like the knobs on an old mixing desk. */}
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="9" cy="6" r="2.2" fill="currentColor" />
      <circle cx="15" cy="12" r="2.2" fill="currentColor" />
      <circle cx="7" cy="18" r="2.2" fill="currentColor" />
    </svg>
    {(hasNews || chatNews) && <span className="rm-control-handle-dot" aria-hidden="true" />}
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-5 first:mt-0">
    <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{title}</span>
    {children}
  </div>
);

const btn = 'retro-button px-3 py-2 border-2 border-retro-ink bg-white font-bold text-sm text-left';

// The controls at the top of the panel: the stops of the journey, the music,
// the sound, the companion and feedback. Every tap that leaves the panel
// (a stop, the music panel, the companion, feedback) closes it first.
export const ControlCenter: React.FC<{
  /** The journey's stop; null before name and birthday are known. */
  phase: AppPhase | null;
  onSelectStop: (p: AppPhase) => void;
  /** Back / play / next and the song (components/MusicMini). */
  music?: React.ReactNode;
  onOpenMusic?: () => void;
  onOpenCompanion?: () => void;
  companionOpen?: boolean;
  onFeedback?: () => void;
  /** The chat corner with the other guests (components/GuestChat.tsx). */
  onOpenGuestChat?: () => void;
  guestChatNews?: boolean;
}> = ({ phase, onSelectStop, music, onOpenMusic, onOpenCompanion, companionOpen = false, onFeedback, onOpenGuestChat, guestChatNews = false }) => {
  const muted = useMuted();
  const index = phase ? PHASES.indexOf(phase) : -1;
  return (
    <div className="rm-control-center mb-6 pb-5 border-b border-retro-ink/20">
      {phase && (
        <Section title={tr('Your time travel', 'Deine Zeitreise')}>
          <ol className="grid grid-cols-1 gap-1.5" aria-label={tr('Stops of the journey', 'Halte der Reise')}>
            {PHASES.map((p, i) => {
              const now = i === index;
              return (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => onSelectStop(p)}
                    aria-current={now ? 'step' : undefined}
                    className={`rm-cc-stop ${now ? 'is-now' : i < index ? 'is-done' : ''}`}
                  >
                    <span className="rm-cc-stop-dot" aria-hidden="true">{i < index ? '✓' : i + 1}</span>
                    <span className="flex-grow min-w-0 truncate">{STATION_NAME[p]}</span>
                    {now && <span className="text-[10px] uppercase font-bold">{tr('You are here', 'Du bist hier')}</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </Section>
      )}

      {music && (
        <Section title={tr('Music', 'Musik')}>
          <div className="rm-cc-music">{music}</div>
          {onOpenMusic && (
            <button type="button" onClick={onOpenMusic} className={`${btn} mt-2`}>
              🎛️ {tr('More music: volume, search, songs', 'Mehr Musik: Lautstärke, Suche, Songs')}
            </button>
          )}
        </Section>
      )}

      <Section title={tr('Quick access', 'Schnellzugriff')}>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={toggleMuted} aria-pressed={muted} className={btn}>
            {muted ? tr('🔇 Sound off', '🔇 Ton aus') : tr('🔊 Sound on', '🔊 Ton an')}
          </button>
          {onOpenCompanion && (
            <button type="button" onClick={onOpenCompanion} aria-pressed={companionOpen} className={btn}>
              💬 {companionOpen ? tr('Close companion', 'Begleiter schließen') : tr('Ask the companion', 'Begleiter fragen')}
            </button>
          )}
          {onOpenGuestChat && (
            <button type="button" onClick={onOpenGuestChat} className={`${btn} relative`}>
              🛋️ {tr('Chat corner', 'Plauderecke')}
              {guestChatNews && <span className="rm-control-handle-dot" style={{ top: '-0.3rem', left: 'auto', right: '-0.3rem' }} aria-label={tr('new messages', 'neue Nachrichten')} />}
            </button>
          )}
          {onFeedback && (
            <button type="button" onClick={onFeedback} className={`${btn} !bg-[#c62828] !text-white`}>
              ✉️ Feedback
            </button>
          )}
        </div>
      </Section>
    </div>
  );
};
