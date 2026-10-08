import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../../types';
import { AiUnavailableError, sendGuruMessage } from '../lib/ai';
import { chip } from '../lib/chiptune';
import { tr } from '../../lib/i18n';

// The "Retro-Guru": a chat persona that knows old games, cheats and where to
// play them legally today. Text appears letter by letter like an RPG dialog box.

const Typewriter: React.FC<{ text: string }> = ({ text }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    setN(0);
    const id = setInterval(() => {
      i++;
      if (i % 3 === 0) chip.play('blip');
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text]);
  return (
    <>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      <span className="sr-only">{text}</span>
    </>
  );
};

export const GuruChat: React.FC<{ onClose: () => void; onAsk?: (text: string) => void }> = ({ onClose, onAsk }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, busy]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    chip.play('select');
    onAsk?.(text);
    const next: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const reply = await sendGuruMessage(next);
      setMessages((m) => [...m, { role: 'model', text: reply || '…' }]);
    } catch (err) {
      chip.play('error');
      setMessages((m) => [
        ...m,
        {
          role: 'model',
          text:
            err instanceof AiUnavailableError
              ? tr('The Guru is AFK right now (no AI server set up).', 'Der Guru ist gerade AFK (kein KI-Server eingerichtet).')
              : tr('Lag! Connection lost, like a loose cartridge. Blow on it and try again.', 'Lag! Verbindung weg, wie ein Wackelkontakt am Modul. Einmal pusten und nochmal.'),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="guru" role="dialog" aria-label={tr('Retro Guru', 'Retro-Guru')}>
      <div className="guru-head pixel-font">
        <span>{tr('☻ RETRO GURU', '☻ RETRO-GURU')}</span>
        <button onClick={onClose} aria-label={tr('Close Guru', 'Guru schließen')}>
          ✕
        </button>
      </div>
      <div className="guru-log" ref={logRef} aria-live="polite">
        {messages.length === 0 && (
          <p className="dim">
            {tr(
              'Yo, Player 1! Ask me about a game you only half remember (“the one with the possum and the rocket pack …”), about cheats, or how you can still play it today.',
              'Yo, Player 1! Frag mich nach einem Game, an das du dich nur halb erinnerst („das mit dem Opossum und dem Raketenrucksack …“), nach Cheats oder wie du es heute noch zocken kannst.'
            )}
          </p>
        )}
        {messages.map((m, i) => (
          <p key={i} className={`guru-msg ${m.role === 'user' ? 'user' : ''}`}>
            {m.role === 'user' ? `> ${m.text}` : i === messages.length - 1 ? <Typewriter text={m.text} /> : m.text}
          </p>
        ))}
        {busy && <p className="blink">▮</p>}
      </div>
      <form onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tr('Ask the Guru, dude …', 'Frag den Guru, Digga …')}
          aria-label={tr('Message to the Retro Guru', 'Nachricht an den Retro-Guru')}
          autoFocus
        />
        <button className="px-btn" type="submit" disabled={busy}>
          OK
        </button>
      </form>
    </div>
  );
};
