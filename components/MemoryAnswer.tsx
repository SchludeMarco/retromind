import React, { useRef, useState } from 'react';

// Web Speech API is prefixed in most browsers and missing in others.
const SpeechRecognitionImpl: any =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined;

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
