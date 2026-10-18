import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import { askAppHelp } from '../services/geminiService';
import { tr } from '../lib/i18n';
import './helpBot.css';

// A round "?" at the very bottom right of both apps that opens an AI helper
// for every question about RetroMind (Marco, 2026-10-18: "einen Button ganz
// unten rechts für einen KI bot, dem man alle Fragen über die App stellen
// kann"). The answers come from the feature lists of both READMEs
// (api/gemini.js, persona "help"). It lifts above the pinned tickers; the
// control handle sits at the middle of the right edge, so they never meet.

export const HelpBot: React.FC<{
  app: 'zeitreise' | 'gaming';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Hides the button (the panel stays closed), e.g. while another chat is open. */
  hidden?: boolean;
  onSound?: () => void;
}> = ({ app, open, onOpenChange, hidden = false, onSound }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, busy, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const ask = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    onSound?.();
    const next: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const reply = await askAppHelp(next, app);
      setMessages((m) => [...m, { role: 'model', text: reply.trim() || '…' }]);
    } catch (e) {
      const code = (e as { code?: string })?.code;
      const text =
        code === 'under_18'
          ? (e as Error).message
          : code === 'not_configured'
            ? tr('The help needs the AI server, which isn’t set up here.', 'Die Hilfe braucht den KI-Server, der hier nicht eingerichtet ist.')
            : tr('Sorry, the connection is acting up right now. Please try again.', 'Entschuldige, die Verbindung klemmt gerade. Versuch es bitte noch einmal.');
      setMessages((m) => [...m, { role: 'model', text }]);
    } finally {
      setBusy(false);
    }
  };

  const starters =
    app === 'gaming'
      ? [
          tr('How do I find a game?', 'Wie finde ich ein Spiel?'),
          tr('What are Coins for?', 'Wofür sind die Coins?'),
          tr('Where are the settings?', 'Wo sind die Einstellungen?'),
        ]
      : [
          tr('How does the time travel work?', 'Wie funktioniert die Zeitreise?'),
          tr('Where are my memories saved?', 'Wo werden meine Erinnerungen gespeichert?'),
          tr('Where are the settings?', 'Wo sind die Einstellungen?'),
        ];

  if (hidden && !open) return null;

  return (
    <div className={`rm-help rm-fixed no-print is-${app}`}>
      {open ? (
        <div className="rm-help-panel" role="dialog" aria-label={tr('Help with RetroMind', 'Hilfe zu RetroMind')}>
          <div className="rm-help-head">
            <span>
              <b>{tr('Questions about the app?', 'Fragen zur App?')}</b>
              <small> · {tr('AI (Google Gemini)', 'KI (Google Gemini)')}</small>
            </span>
            <button type="button" onClick={() => { onSound?.(); onOpenChange(false); }} aria-label={tr('Close help', 'Hilfe schließen')}>
              ✕
            </button>
          </div>
          <div className="rm-help-log" ref={logRef} aria-live="polite">
            {messages.length === 0 && (
              <>
                <p className="rm-help-intro">
                  {tr(
                    'Ask me anything about RetroMind: what it can do, where to find something, how it works. I’m an AI and can be wrong.',
                    'Frag mich alles über RetroMind: was es kann, wo du etwas findest, wie es funktioniert. Ich bin eine KI und kann mich irren.'
                  )}
                </p>
                <div className="rm-help-starters">
                  {starters.map((s) => (
                    <button key={s} type="button" onClick={() => ask(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
            {messages.map((m, i) => (
              <p key={i} className={`rm-help-msg is-${m.role}`}>
                {m.text}
              </p>
            ))}
            {busy && <p className="rm-help-msg is-model is-typing">{tr('Looking it up…', 'Ich schau nach…')}</p>}
          </div>
          <form
            className="rm-help-form"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder={tr('Your question…', 'Deine Frage…')}
              aria-label={tr('Your question about the app', 'Deine Frage zur App')}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label={tr('Send', 'Senden')}>
              ↑
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          className="rm-help-fab"
          onClick={() => { onSound?.(); onOpenChange(true); }}
          aria-label={tr('Questions about the app? Ask the AI help', 'Fragen zur App? Frag die KI-Hilfe')}
          title={tr('Questions about the app?', 'Fragen zur App?')}
        >
          ?
        </button>
      )}
    </div>
  );
};
