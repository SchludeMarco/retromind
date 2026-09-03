import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChatMessage, GalleryItem } from './types';
import { DECADES_DB } from './constants';
import { sendChatMessage } from './services/geminiService';

// --- Boot overlay ---
// Shown once when the app mounts: a pixel grid that starts fully black and
// dissolves cell by cell, at random, so the app seems to slowly wake up
// rather than simply appear — like opening your eyes in a time capsule.
const BOOT_GRID_COLS = 18;
const BOOT_GRID_ROWS = 10;
const BOOT_HOLD_MS = 600; // beat of pure black before anything stirs
const BOOT_MAX_DELAY_MS = 2600;
const BOOT_MIN_DURATION_MS = 1200;
const BOOT_MAX_EXTRA_DURATION_MS = 700;
const BOOT_TOTAL_MS = BOOT_HOLD_MS + BOOT_MAX_DELAY_MS + BOOT_MIN_DURATION_MS + BOOT_MAX_EXTRA_DURATION_MS;
const BOOT_REDUCED_MOTION_MS = 900;

export const BootOverlay: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [dissolve, setDissolve] = useState(false);
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const cells = useMemo(
    () =>
      Array.from({ length: BOOT_GRID_COLS * BOOT_GRID_ROWS }, () => ({
        delay: Math.random() * BOOT_MAX_DELAY_MS,
        duration: BOOT_MIN_DURATION_MS + Math.random() * BOOT_MAX_EXTRA_DURATION_MS,
      })),
    []
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      const end = setTimeout(() => setVisible(false), BOOT_REDUCED_MOTION_MS);
      return () => clearTimeout(end);
    }
    const start = setTimeout(() => setDissolve(true), BOOT_HOLD_MS);
    const end = setTimeout(() => setVisible(false), BOOT_TOTAL_MS);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [prefersReducedMotion]);

  // A soft, slowly swelling hum underscores the dissolve — synthesized so the
  // boot chime always matches the visual timing exactly, with no asset to load.
  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const totalSec = (prefersReducedMotion ? BOOT_REDUCED_MOTION_MS : BOOT_TOTAL_MS) / 1000;
    const ctx: AudioContext = new AudioCtx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.05, now + totalSec * 0.35);
    master.gain.setValueAtTime(0.05, now + totalSec * 0.7);
    master.gain.linearRampToValueAtTime(0, now + totalSec);
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.connect(master);

    [110, 165].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start(now);
      osc.stop(now + totalSec);
    });

    ctx.resume().catch(() => {});

    // Browsers refuse to actually produce sound until the page has seen a
    // user gesture. If the boot chime was born suspended, the first tap,
    // click or key anywhere on the page unlocks it — better late than never.
    const unlock = () => { ctx.resume().catch(() => {}); };
    const gestureEvents: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];
    gestureEvents.forEach((evt) => document.addEventListener(evt, unlock, { once: true, capture: true }));

    return () => {
      gestureEvents.forEach((evt) => document.removeEventListener(evt, unlock, { capture: true }));
      ctx.close().catch(() => {});
    };
  }, [prefersReducedMotion]);

  if (!visible) return null;

  if (prefersReducedMotion) {
    return <div aria-hidden="true" className="fixed inset-0 z-[999] bg-black pointer-events-none animate-fadeOut" />;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[999] grid pointer-events-none"
      style={{ gridTemplateColumns: `repeat(${BOOT_GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${BOOT_GRID_ROWS}, 1fr)` }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          className="bg-black"
          style={{
            opacity: dissolve ? 0 : 1,
            transition: dissolve ? `opacity ${cell.duration}ms ease-in-out ${cell.delay}ms` : 'none',
          }}
        />
      ))}
    </div>
  );
};

// UI sound effects.
export const SFX = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  transition: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
};

// Web Speech API is prefixed in most browsers and missing in others.
export const SpeechRecognitionImpl: any =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined;

export const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="rm-fixed fixed bottom-0 left-0 w-full h-3 bg-retro-ink/10 z-40" aria-hidden="true">
    <div
      className="h-full bg-retro-amber transition-all duration-500 ease-out border-t border-retro-ink"
      style={{ width: `${(current / total) * 100}%` }}
    />
  </div>
);

export const Header: React.FC = () => (
  <header className="py-8 text-center">
    <h1 className="text-5xl md:text-7xl font-bold text-retro-ink mb-2 tracking-tighter">RetroMind</h1>
    <p className="text-lg italic text-retro-brown">Deine Reise zurück in die Zeit</p>
    <div className="w-32 h-1 bg-retro-ink mx-auto mt-4" />
  </header>
);

export const FontSizeControl: React.FC<{ scale: number; onChange: (n: number) => void }> = ({ scale, onChange }) => (
  <div className="rm-fixed fixed top-3 right-3 z-50 flex gap-1 bg-retro-cream border-2 border-retro-ink p-1" role="group" aria-label="Schriftgröße">
    {[1, 2, 3].map((n) => (
      <button
        key={n}
        onClick={() => onChange(n)}
        aria-pressed={scale === n}
        aria-label={`Schrift ${['normal', 'groß', 'sehr groß'][n - 1]}`}
        className={`w-8 h-8 font-bold border border-retro-ink ${scale === n ? 'bg-retro-ink text-white' : 'bg-white text-retro-ink'}`}
        style={{ fontSize: `${0.7 + n * 0.15}rem` }}
      >
        A
      </button>
    ))}
  </div>
);

export const Modal: React.FC<{ onClose: () => void; label: string; children: React.ReactNode }> = ({ onClose, label, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const selector = 'button, [href], input, textarea, select';
    (node?.querySelector<HTMLElement>(selector) || node)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(selector)).filter((el) => !el.hasAttribute('disabled'));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="rm-fixed fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="retro-card max-w-lg w-full p-6 md:p-8 bg-white relative animate-popIn max-h-[90vh] overflow-y-auto outline-none"
      >
        {children}
      </div>
    </div>
  );
};

export const GalleryCard: React.FC<{ item: GalleryItem; onClick: () => void }> = ({ item, onClick }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = item.image && !imgFailed;
  return (
    <button onClick={onClick} className="retro-card overflow-hidden h-56 group relative text-left bg-retro-cream">
      {showImage ? (
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover sepia-[0.25] group-hover:sepia-0 transition-all duration-300"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-retro-paper">
          <span className="text-[10px] uppercase tracking-widest font-bold text-retro-tan">Zeit-Impression</span>
          <span className="retro-serif text-2xl font-bold text-retro-ink mt-2 leading-tight">{item.title}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 w-full bg-retro-ink/85 text-white p-2 text-sm font-bold text-center">
        {item.title}
      </div>
    </button>
  );
};

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
      setMessages((m) => [...m, { role: 'model', text: 'Entschuldige, die Verbindung klemmt gerade.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rm-fixed fixed bottom-24 left-4 md:left-10 z-50 w-80 max-w-[90vw] h-96 retro-card bg-retro-cream flex flex-col animate-fadeIn overflow-hidden">
      <div className="bg-retro-ink text-white p-3 flex justify-between items-center">
        <span className="font-bold text-sm">Nostalgie-Begleiter</span>
        <button onClick={onClose} aria-label="Chat schließen" className="text-lg leading-none px-1">
          ✕
        </button>
      </div>
      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-3 bg-retro-cream-light">
        {disabled ? (
          <p className="text-xs text-retro-brown">
            Der Chat-Begleiter braucht den KI-Server und ist in diesem Demo gerade nicht verfügbar.
          </p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-retro-brown">Frag mich etwas über „damals" – oder erzähl einfach los.</p>
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
        {isTyping && <div className="text-xs text-retro-brown animate-pulse">Schreibt…</div>}
      </div>
      {!disabled && (
        <div className="p-3 border-t-2 border-retro-ink flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Frag nach damals…"
            aria-label="Nachricht an den Begleiter"
            className="flex-grow text-sm p-2 border-2 border-retro-ink bg-white focus:outline-none focus:ring-2 focus:ring-retro-amber"
          />
          <button onClick={handleSend} aria-label="Senden" className="bg-retro-ink text-white px-3 font-bold">
            ↑
          </button>
        </div>
      )}
    </div>
  );
};

// Answer box with optional voice dictation, reused in the buzzword modal.
export const MemoryAnswer: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleVoice = () => {
    if (!SpeechRecognitionImpl) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SpeechRecognitionImpl();
    rec.lang = 'de-DE';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join(' ');
      onChange((value ? value.trim() + ' ' : '') + transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full p-3 border-2 border-retro-ink bg-white text-retro-ink focus:outline-none focus:ring-2 focus:ring-retro-amber"
      />
      {SpeechRecognitionImpl && (
        <button
          type="button"
          onClick={toggleVoice}
          aria-pressed={listening}
          className={`mt-2 text-xs font-bold uppercase border-2 border-retro-ink px-3 py-1.5 ${
            listening ? 'bg-retro-amber text-white animate-pulse' : 'bg-white text-retro-ink'
          }`}
        >
          {listening ? '● Höre zu…' : '🎙 Antwort sprechen'}
        </button>
      )}
    </div>
  );
};

export const RetroPlayer: React.FC<{
  currentDecade: string;
  onDecadeChange: (d: string) => void;
  isPlaying: boolean;
  onToggle: () => void;
  volume: number;
  onVolumeChange: (v: number) => void;
}> = ({ currentDecade, onDecadeChange, isPlaying, onToggle, volume, onVolumeChange }) => {
  const info = DECADES_DB[currentDecade];
  return (
    <div className="rm-fixed fixed bottom-10 right-4 md:right-10 z-50">
      <div className="retro-card bg-retro-cream p-4 flex flex-col gap-3 border-2 border-retro-ink w-64 max-w-[80vw]">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className={`w-11 h-11 rounded-full border-2 border-retro-ink flex items-center justify-center bg-retro-amber flex-shrink-0 ${isPlaying ? 'animate-spin' : ''}`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-retro-cream border border-retro-ink" />
          </div>
          <div className="overflow-hidden flex-grow">
            <p className="text-[10px] uppercase font-bold text-retro-tan tracking-widest">Nostalgie-Radio</p>
            <p className="text-xs font-bold truncate">{info?.audioLabel || '—'}</p>
          </div>
          <button onClick={onToggle} aria-label={isPlaying ? 'Musik pausieren' : 'Musik abspielen'} className="retro-button p-2 bg-white min-w-[40px]">
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
        <div className="flex flex-col gap-2 pt-2 border-t border-retro-ink/20">
          <div className="flex justify-between items-center">
            <label htmlFor="rm-era" className="text-[10px] font-bold uppercase text-retro-tan">Ära wählen</label>
            <select
              id="rm-era"
              value={currentDecade}
              onChange={(e) => onDecadeChange(e.target.value)}
              className="text-sm bg-transparent font-bold cursor-pointer"
            >
              {Object.keys(DECADES_DB).map((d) => (
                <option key={d} value={d}>{d}er</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-xs">🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="Lautstärke"
              className="flex-grow accent-retro-amber cursor-pointer h-1.5"
            />
            <span aria-hidden="true" className="text-xs">🔊</span>
          </div>
        </div>
      </div>
    </div>
  );
};
