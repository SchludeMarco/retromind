import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import { SFX } from '../lib/sfx';
import { sendChatMessage } from '../services/geminiService';
import { tr } from '../lib/i18n';

export const ChatBot: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  playSFX: (t: keyof typeof SFX) => void;
  disabled: boolean;
}> = ({ isOpen, onClose, playSFX, disabled }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    playSFX('click');
    const next: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setIsTyping(true);
    try {
      // Full history goes to the server each turn, so the model keeps context.
      const reply = await sendChatMessage(next);
      setMessages((m) => [...m, { role: 'model', text: reply || '…' }]);
    } catch {
      setMessages((m) => [...m, { role: 'model', text: tr('Sorry, the connection is acting up right now.', 'Entschuldige, die Verbindung klemmt gerade.') }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rm-chat-panel rm-fixed fixed bottom-36 left-4 md:left-10 z-50 w-80 max-w-[90vw] h-96 retro-card bg-retro-cream flex flex-col animate-fadeIn overflow-hidden">
      <div className="bg-retro-ink text-white p-3 flex justify-between items-center">
        <span className="font-bold text-sm">{tr('Nostalgia Buddy', 'Nostalgie-Begleiter')}</span>
        <button onClick={onClose} aria-label={tr('Close chat', 'Chat schließen')} className="text-lg leading-none px-1">
          ✕
        </button>
      </div>
      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-3 bg-retro-cream-light">
        {disabled ? (
          <p className="text-xs text-retro-brown">
            {tr(
              'The chat buddy needs the AI server and isn’t available in this demo right now.',
              'Der Chat-Begleiter braucht den KI-Server und ist in diesem Demo gerade nicht verfügbar.'
            )}
          </p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-retro-brown">{tr('Ask me anything about “back then” – or just start telling.', 'Frag mich etwas über „damals" – oder erzähl einfach los.')}</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-2 text-sm border-2 border-retro-ink ${
                  m.role === 'user' ? 'bg-retro-amber text-white' : 'bg-white text-retro-ink'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
        {isTyping && <div className="text-xs text-retro-brown animate-pulse">{tr('Typing…', 'Schreibt…')}</div>}
      </div>
      {!disabled && (
        <div className="p-3 border-t-2 border-retro-ink flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={tr('Ask about back then…', 'Frag nach damals…')}
            aria-label={tr('Message to your buddy', 'Nachricht an den Begleiter')}
            className="flex-grow text-sm p-2 border-2 border-retro-ink bg-white focus:outline-none focus:ring-2 focus:ring-retro-amber"
          />
          <button onClick={handleSend} aria-label={tr('Send', 'Senden')} className="bg-retro-ink text-white px-3 font-bold">
            ↑
          </button>
        </div>
      )}
    </div>
  );
};
