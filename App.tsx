
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { AppPhase, UserProfile, DecadeData, ChatMessage, VideoStatus, GalleryItem } from './types';
import { DECADES_DB } from './constants';
import { generateDeepQuestion, analyzeMemoryImage, generateVeoVideo } from './services/geminiService';

// --- Assets ---
const SFX = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  transition: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'
};

// --- Helper Components ---

const ProgressBar: React.FC<{ currentPhase: number, totalPhases: number }> = ({ currentPhase, totalPhases }) => {
  const progress = (currentPhase / totalPhases) * 100;
  return (
    <div className="fixed bottom-0 left-0 w-full h-4 bg-[#2c1810]/10 z-40">
      <div 
        className="h-full bg-[#d97706] transition-all duration-500 ease-out border-t border-[#2c1810]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const Header: React.FC = () => (
  <header className="py-8 text-center">
    <h1 className="text-5xl md:text-7xl font-bold text-[#2c1810] mb-2 tracking-tighter">RetroMind</h1>
    <p className="text-xl italic opacity-70">Deine Reise zurück in die Zeit</p>
    <div className="w-32 h-1 bg-[#2c1810] mx-auto mt-4"></div>
  </header>
);

const RetroPlayer: React.FC<{ 
  currentDecade: string,
  onDecadeChange: (decade: string) => void,
  isPlaying: boolean, 
  onToggle: () => void,
  volume: number,
  onVolumeChange: (vol: number) => void
}> = ({ currentDecade, onDecadeChange, isPlaying, onToggle, volume, onVolumeChange }) => {
  const decadeInfo = DECADES_DB[currentDecade];
  
  return (
    <div className="fixed bottom-10 right-4 md:right-10 z-50 animate-fadeIn">
      <div className="retro-card bg-[#fff9eb] p-4 flex flex-col gap-3 border-2 border-[#2c1810] w-64">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full border-2 border-[#2c1810] flex items-center justify-center bg-[#d97706] transition-transform duration-[2s] linear flex-shrink-0 ${isPlaying ? 'animate-spin' : ''}`}>
            <div className="w-4 h-4 rounded-full bg-[#fff9eb] border border-[#2c1810]"></div>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] uppercase font-bold opacity-50 mb-0.5 tracking-widest">Nostalgie-Radio</p>
            <p className="text-xs font-bold leading-none truncate">{decadeInfo?.audioLabel || 'Warten...'}</p>
          </div>
          <button 
            onClick={onToggle}
            className="retro-button p-2 bg-white hover:bg-gray-100 flex items-center justify-center min-w-[40px] ml-auto"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
        
        <div className="flex flex-col gap-2 pt-2 border-t border-[#2c1810]/20">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase opacity-50">Ära wählen</label>
            <select 
              value={currentDecade}
              onChange={(e) => onDecadeChange(e.target.value)}
              className="text-xs bg-transparent border-none font-bold focus:ring-0 cursor-pointer text-[#2c1810]"
            >
              {Object.keys(DECADES_DB).map(d => (
                <option key={d} value={d}>{d}er</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs">🔈</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="flex-grow accent-[#d97706] cursor-pointer h-1.5"
            />
            <span className="text-xs">🔊</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- New Components for AI Features ---

const ChatBot: React.FC<{ isOpen: boolean, onClose: () => void, playSFX: (t: any) => void }> = ({ isOpen, onClose, playSFX }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // One persistent chat session so the model keeps the conversation history
  // instead of starting fresh on every message.
  const chatRef = useRef<Chat | null>(null);

  const getChat = (): Chat => {
    if (!chatRef.current) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: { systemInstruction: "Du bist ein nostalgischer Begleiter. Halte Antworten kurz und herzlich." }
      });
    }
    return chatRef.current;
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    playSFX('click');
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await getChat().sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Entschuldige, ich habe gerade Verbindungsprobleme." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 left-4 md:left-10 z-50 w-80 h-96 retro-card bg-[#fff9eb] flex flex-col animate-fadeIn overflow-hidden">
      <div className="bg-[#2c1810] text-white p-3 flex justify-between items-center">
        <span className="font-bold text-sm">Nostalgie-Begleiter</span>
        <button onClick={onClose} className="hover:scale-110">✕</button>
      </div>
      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-3 bg-[#fffcf5]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-2 text-xs border-2 ${m.role === 'user' ? 'bg-[#d97706] text-white border-[#2c1810]' : 'bg-white border-[#2c1810]'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-[10px] animate-pulse">Schreibt...</div>}
      </div>
      <div className="p-3 border-t-2 border-[#2c1810] flex gap-2">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Frag nach damals..."
          className="flex-grow text-xs p-2 border-2 border-[#2c1810] focus:outline-none"
        />
        <button onClick={handleSend} className="bg-[#2c1810] text-white px-3 text-xs font-bold">↑</button>
      </div>
    </div>
  );
};

// --- Persistence (per-browser, best effort) ---

const STORAGE_KEYS = { user: 'retromind.user', diary: 'retromind.diary' } as const;

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw != null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode / quota) — non-fatal */
  }
}

// --- Main Application ---

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>('intro');
  const [user, setUser] = useState<UserProfile>(() =>
    loadStored<UserProfile>(STORAGE_KEYS.user, { name: '', gender: 'divers', birthDate: '', interests: [] })
  );
  const [clickedBuzzwords, setClickedBuzzwords] = useState<Set<string>>(new Set());
  const [selectedWord, setSelectedWord] = useState<{ term: string, knowledge: string, aiQuestion: string } | null>(null);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [diaryEntry, setDiaryEntry] = useState<string>(() => loadStored<string>(STORAGE_KEYS.diary, ''));
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.05); // Initial volume set to very quiet (5%)
  const [manualDecade, setManualDecade] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Lab States
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>({ status: 'idle' });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
        return;
      }
      // Standalone build: a key baked in via GEMINI_API_KEY also counts.
      setHasApiKey(Boolean(process.env.API_KEY));
    };
    checkKey();
  }, []);

  // Persist profile and diary so a reload does not wipe the session.
  useEffect(() => { saveStored(STORAGE_KEYS.user, user); }, [user]);
  useEffect(() => { saveStored(STORAGE_KEYS.diary, diaryEntry); }, [diaryEntry]);

  const downloadDiary = () => {
    playSFX('click');
    const stamp = new Date().toLocaleString('de-DE');
    const body = [
      'RetroMind – Erinnerungs-Tagebuch',
      user.name ? `Für: ${user.name}` : null,
      `Erstellt: ${stamp}`,
      '',
      diaryEntry.trim() || '(noch kein Eintrag)',
      '',
    ].filter((l): l is string => l !== null).join('\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `retromind-tagebuch-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const startNewJourney = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.diary);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  const selectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const playSFX = (type: keyof typeof SFX) => {
    if (sfxRef.current) {
      sfxRef.current.src = SFX[type];
      sfxRef.current.volume = Math.min(volume * 5, 0.4); // SFX should be audible even at low music volume
      sfxRef.current.currentTime = 0;
      sfxRef.current.play().catch(e => console.debug("SFX blocked", e));
    }
  };

  const calculatedChildhoodDecade = useMemo(() => {
    if (!user.birthDate) return '1980';
    const birthYear = new Date(user.birthDate).getFullYear();
    if (Number.isNaN(birthYear)) return '1980';
    const childhoodMid = birthYear + 8;
    const rawDecade = Math.floor(childhoodMid / 10) * 10;
    // Clamp to the decades we actually have content for (1960–2000).
    const decade = Math.min(2000, Math.max(1960, rawDecade));
    return decade.toString();
  }, [user.birthDate]);

  const currentAudioDecade = manualDecade || calculatedChildhoodDecade;

  useEffect(() => {
    if (audioRef.current) {
      const currentTrack = DECADES_DB[currentAudioDecade]?.audioUrl;
      if (currentTrack && audioRef.current.src !== currentTrack) {
        audioRef.current.src = currentTrack;
        audioRef.current.load();
        if (isMusicPlaying) audioRef.current.play().catch(console.debug);
      }
    }
  }, [currentAudioDecade]);

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) audioRef.current.play().catch(console.debug);
      else audioRef.current.pause();
    }
  }, [isMusicPlaying]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  useEffect(() => { if (phase !== 'intro') playSFX('transition'); }, [phase]);

  const startJourney = () => {
    playSFX('click');
    setPhase('onboarding');
    setIsMusicPlaying(true); 
  };

  const handleOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    playSFX('success');
    setPhase('induction');
  };

  const toggleInterest = (interest: string) => {
    playSFX('click');
    setUser(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest]
    }));
  };

  const handleBuzzwordClick = async (wordId: string, term: string, knowledge: string, decade: string, fallbackQuestion: string) => {
    playSFX('click');
    setClickedBuzzwords(prev => new Set(prev).add(wordId));
    setIsGenerating(true);
    const interestsString = user.interests.length > 0 ? user.interests.join(', ') : "Allgemeine Kindheitserinnerungen";
    const question = await generateDeepQuestion(term, user.name, interestsString, decade, fallbackQuestion);
    setSelectedWord({ term, knowledge, aiQuestion: question });
    setIsGenerating(false);
  };

  // --- Lab Actions ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;
    playSFX('click');
    setAnalysis("Analysiere...");
    const base64 = uploadedImage.split(',')[1];
    const mime = uploadedImage.split(';')[0].split(':')[1];
    const result = await analyzeMemoryImage(base64, mime);
    setAnalysis(result);
  };

  const handleGenerateVideo = async () => {
    if (!uploadedImage) return;
    
    // Check for API key only when needed for Veo
    let hasKey = hasApiKey;
    if (window.aistudio?.hasSelectedApiKey) {
      hasKey = await window.aistudio.hasSelectedApiKey();
    }

    if (!hasKey) {
      playSFX('click');
      await selectKey();
      // After selection, we assume success as per instructions
    }

    playSFX('click');
    setVideoStatus({ status: 'generating', message: 'Erwecke Bild zum Leben... Bitte hab einen Moment Geduld.' });
    try {
      const base64 = uploadedImage.split(',')[1];
      const mime = uploadedImage.split(';')[0].split(':')[1];
      const videoUrl = await generateVeoVideo(`Ein nostalgisches Video, das dieses Foto zum Leben erweckt, sanfte Bewegungen, atmosphärisch.`, base64, mime);
      setVideoStatus({ status: 'done', url: videoUrl });
    } catch (e: any) {
      if (e?.message?.includes("Requested entity was not found")) {
         setHasApiKey(false);
         setVideoStatus({ status: 'error', message: 'API Key ungültig. Bitte erneut auswählen.' });
      } else {
         setVideoStatus({ status: 'error', message: 'Fehler bei der Video-Generierung.' });
      }
    }
  };

  const currentPhaseIndex = useMemo(() => {
    const phases: AppPhase[] = ['intro', 'onboarding', 'induction', 'exploration', 'diary', 'finish'];
    return phases.indexOf(phase) + 1;
  }, [phase]);

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      <audio ref={audioRef} loop />
      <audio ref={sfxRef} />
      
      <Header />

      {/* Floating Chat Button */}
      {phase !== 'intro' && (
        <button 
          onClick={() => { playSFX('click'); setIsChatOpen(!isChatOpen); }}
          className="fixed bottom-10 left-4 md:left-10 z-50 w-12 h-12 bg-[#2c1810] text-white rounded-full retro-button flex items-center justify-center text-xl shadow-lg"
        >
          {isChatOpen ? '✕' : '💬'}
        </button>
      )}

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} playSFX={playSFX} />

      {phase !== 'intro' && (
        <RetroPlayer 
          currentDecade={currentAudioDecade}
          onDecadeChange={(d) => { playSFX('click'); setManualDecade(d); }}
          isPlaying={isMusicPlaying} 
          onToggle={() => { playSFX('click'); setIsMusicPlaying(!isMusicPlaying); }} 
          volume={volume}
          onVolumeChange={setVolume}
        />
      )}

      {phase === 'intro' && (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-fadeIn">
          <div className="retro-card p-12 max-w-2xl bg-[#fff9eb]">
            <h2 className="text-4xl mb-6 text-[#2c1810]">Willkommen Zeitreisender</h2>
            <p className="text-lg mb-8 leading-relaxed text-[#2c1810]">
              Öffne die Truhe deiner Kindheit. Wir nutzen modernste KI, um deine alten Fotos zum Leben zu erwecken und deine Erinnerungen zu vertiefen.
            </p>
            <div className="mb-12">
               <button 
                 onClick={startJourney}
                 className="retro-button bg-[#d97706] text-white px-12 py-5 text-2xl font-bold hover:bg-[#b45309] w-full md:w-auto"
               >
                 Zeitreise starten
               </button>
            </div>
            
            <p className="text-xs opacity-50 italic">
               Die App funktioniert auch ohne API-Key. Für Video-Generierung (Veo) wirst du bei Bedarf gefragt.
            </p>
          </div>
        </div>
      )}

      {phase === 'onboarding' && (
        <div className="py-8 animate-fadeIn">
          <div className="retro-card p-8 md:p-12 bg-[#fff9eb]">
            <h2 className="text-3xl mb-8 border-b-2 border-[#2c1810] pb-2">Wer bist du?</h2>
            <form onSubmit={handleOnboarding} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase mb-1">Name</label>
                  <input required type="text" value={user.name} onChange={e => setUser({...user, name: e.target.value})} className="w-full border-2 border-[#2c1810] p-3 bg-white text-[#2c1810]" placeholder="Wie hießest du früher?" />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-1">Geburtsdatum</label>
                  <input required type="date" value={user.birthDate} onChange={e => setUser({...user, birthDate: e.target.value})} className="w-full border-2 border-[#2c1810] p-3 bg-white text-[#2c1810]" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold uppercase mb-1">Interessen</label>
                <div className="flex flex-wrap gap-2">
                  {['Musik', 'Technik', 'Spielzeug', 'Alltag', 'Mode', 'Essen'].map(interest => (
                    <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`px-4 py-2 border-2 border-[#2c1810] text-sm font-bold transition-all ${user.interests.includes(interest) ? 'bg-[#2c1810] text-white' : 'bg-white text-[#2c1810]'}`}>
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 text-right pt-4">
                <button type="submit" className="retro-button bg-[#2c1810] text-white px-10 py-4 font-bold">Zeitreise beginnen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {phase === 'induction' && (
        <div className="py-8 animate-fadeIn">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-[#2c1810]">Deine Zeit: {DECADES_DB[calculatedChildhoodDecade]?.title}</h2>
            <p className="opacity-80">Ein Blick zurück in die Jahre deiner Kindheit... Klicke auf ein Bild für Details.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DECADES_DB[calculatedChildhoodDecade]?.galleryItems.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => { playSFX('click'); setSelectedGalleryItem(item); }}
                className="retro-card overflow-hidden h-64 group relative text-left"
              >
                <img 
                  src={`https://picsum.photos/seed/${item.keyword.replace(/\s/g, '')}/800/600`} 
                  alt={item.keyword} 
                  className="w-full h-full object-cover filter sepia-[0.3] grayscale-[0.2] group-hover:sepia-0 group-hover:grayscale-0 transition-all duration-300" 
                />
                <div className="absolute bottom-0 left-0 w-full bg-[#2c1810]/80 text-white p-2 text-xs font-bold uppercase text-center">{item.keyword}</div>
              </button>
            ))}
          </div>

          {selectedGalleryItem && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="retro-card max-w-lg w-full p-8 bg-white relative animate-popIn">
                <button onClick={() => { playSFX('click'); setSelectedGalleryItem(null); }} className="absolute top-4 right-4 text-2xl text-[#2c1810] hover:scale-110">✕</button>
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-[#d97706] mb-1 block">Zeitreise-Detail</span>
                  <h3 className="text-3xl font-bold mb-4 text-[#2c1810]">{selectedGalleryItem.keyword}</h3>
                </div>
                <div className="border-t-2 border-[#2c1810] pt-4">
                  <p className="text-lg leading-relaxed text-[#2c1810] italic">
                    {selectedGalleryItem.description}
                  </p>
                </div>
                <button onClick={() => { playSFX('click'); setSelectedGalleryItem(null); }} className="w-full mt-8 retro-button bg-[#2c1810] text-white py-3 font-bold uppercase">Schließen</button>
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <button onClick={() => setPhase('exploration')} className="retro-button bg-[#d97706] text-white px-12 py-5 text-xl font-bold">In die Details eintauchen</button>
          </div>
        </div>
      )}

      {phase === 'exploration' && (
        <div className="py-8 animate-fadeIn space-y-16">
          {/* Section: Memory Lab */}
          <div className="retro-card p-8 bg-[#fffcf5] border-double border-4">
            <h2 className="text-3xl mb-6 text-[#2c1810] flex items-center gap-3">
              <span className="text-4xl">🧪</span> Das Memory-Labor
            </h2>
            <p className="mb-8 opacity-70 italic">Lade ein altes Foto hoch. Wir analysieren es oder erwecken es mit Veo zum Leben.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="border-4 border-dashed border-[#2c1810]/20 p-8 text-center bg-white min-h-[300px] flex flex-col items-center justify-center">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded" className="max-h-64 mx-auto border-2 border-[#2c1810] shadow-md" />
                  ) : (
                    <div className="py-12">
                      <p className="text-sm opacity-50 mb-4 font-bold">Kein Bild ausgewählt</p>
                      <label className="retro-button bg-[#2c1810] text-white px-6 py-2 cursor-pointer inline-block font-bold hover:bg-[#3d2216]">
                        Bild hochladen
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                  )}
                  {uploadedImage && (
                    <button onClick={() => setUploadedImage(null)} className="mt-4 text-[10px] underline uppercase font-bold text-[#2c1810]/60 hover:text-[#2c1810]">Anderes Bild wählen</button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <button 
                    disabled={!uploadedImage}
                    onClick={handleAnalyze}
                    className={`retro-button py-3 font-bold ${!uploadedImage ? 'opacity-50 cursor-not-allowed' : 'bg-white text-[#2c1810] hover:bg-gray-100'}`}
                  >
                    Foto analysieren (Gemini Pro)
                  </button>
                  <div className="relative">
                    <button 
                      disabled={!uploadedImage || videoStatus.status === 'generating'}
                      onClick={handleGenerateVideo}
                      className={`retro-button py-3 font-bold text-white w-full ${!uploadedImage || videoStatus.status === 'generating' ? 'bg-gray-400' : 'bg-[#d97706] hover:bg-[#b45309]'}`}
                    >
                      {videoStatus.status === 'generating' ? 'KI arbeitet...' : 'Zum Leben erwecken (Veo Video)'}
                    </button>
                    {!hasApiKey && (
                      <p className="text-[10px] mt-1 opacity-60 text-center font-bold">Premium Feature: Benötigt API-Key mit Billing</p>
                    )}
                  </div>
                </div>

                {analysis && (
                  <div className="p-4 bg-white border-2 border-[#2c1810] text-sm leading-relaxed animate-fadeIn shadow-inner">
                    <p className="font-bold mb-2 uppercase text-[#d97706]">Nostalgische Analyse:</p>
                    <div className="whitespace-pre-wrap">{analysis}</div>
                  </div>
                )}

                {videoStatus.status !== 'idle' && (
                  <div className="p-4 bg-[#2c1810] text-white border-2 border-white animate-fadeIn shadow-lg">
                    <p className="text-xs font-bold uppercase mb-2">{videoStatus.status === 'generating' ? 'Filmrolle wird entwickelt...' : 'Fertig!'}</p>
                    <p className="text-xs opacity-80">{videoStatus.message}</p>
                    {videoStatus.url && (
                      <div className="mt-4">
                        <video src={videoStatus.url} controls className="w-full border-2 border-white shadow-xl" />
                        <a href={videoStatus.url} download className="text-[10px] underline mt-3 block font-bold text-orange-200">Video für die Ewigkeit speichern</a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="text-3xl text-[#2c1810] border-b-2 border-[#2c1810] pb-2">Die Wissens-Wand</h2>
            {Object.entries(DECADES_DB).map(([year, data]) => (
              <div key={year} className={`p-6 rounded-lg ${year === calculatedChildhoodDecade ? 'bg-[#fef3c7] border-2 border-dashed border-[#d97706]' : ''}`}>
                <h3 className="text-2xl mb-6 flex items-center gap-4 text-[#2c1810]">
                  <span className="bg-[#2c1810] text-white px-3 py-1 text-sm font-bold">{year}er</span> {data.title}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {data.buzzwords.map(bw => {
                    const isClicked = clickedBuzzwords.has(bw.id);
                    return (
                      <button 
                        key={bw.id} 
                        onClick={() => handleBuzzwordClick(bw.id, bw.term, bw.knowledge, year, bw.question)}
                        className={`px-6 py-3 border-2 font-bold transition-all relative ${isClicked ? 'bg-[#8b5cf6] text-white border-transparent' : 'bg-white border-[#2c1810] text-[#2c1810] hover:bg-[#fff9eb]'}`}
                      >
                        {bw.term}
                        {isClicked && <span className="absolute -top-2 -right-2 text-xs">✨</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {selectedWord && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="retro-card max-w-lg w-full p-8 bg-white relative animate-popIn">
                <button onClick={() => { playSFX('click'); setSelectedWord(null); }} className="absolute top-4 right-4 text-2xl text-[#2c1810] hover:scale-110">✕</button>
                <div className="mb-6">
                  <span className="text-[10px] uppercase font-bold text-[#d97706] mb-1 block">Wissen von Damals</span>
                  <h3 className="text-3xl font-bold mb-4 text-[#2c1810]">{selectedWord.term}</h3>
                  <p className="text-lg leading-relaxed mb-8 italic text-[#2c1810]">"{selectedWord.knowledge}"</p>
                </div>
                <div className="bg-[#f3f4f6] p-6 border-l-4 border-[#d97706] shadow-inner">
                  <h4 className="text-[10px] uppercase font-bold text-[#2c1810]/60 mb-2">Persönliche Erinnerungs-Frage:</h4>
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#d97706] animate-ping"></div>
                      <span className="italic text-[#2c1810] text-sm">KI erstellt individuelle Frage...</span>
                    </div>
                  ) : (
                    <p className="text-xl retro-serif text-[#2c1810] leading-snug">{selectedWord.aiQuestion}</p>
                  )}
                </div>
                <button onClick={() => { playSFX('click'); setSelectedWord(null); }} className="w-full mt-8 retro-button bg-[#2c1810] text-white py-3 font-bold uppercase tracking-widest text-xs">Ich erinnere mich...</button>
              </div>
            </div>
          )}

          <div className="mt-16 flex justify-center">
            <button onClick={() => setPhase('diary')} className="retro-button bg-[#2c1810] text-white px-12 py-5 text-xl font-bold uppercase tracking-tighter">Erinnerungen im Tagebuch bewahren</button>
          </div>
        </div>
      )}

      {phase === 'diary' && (
        <div className="py-8 animate-fadeIn max-w-3xl mx-auto">
          <div className="retro-card p-8 bg-[#fff9eb]">
            <h2 className="text-3xl mb-4 text-[#2c1810]">Mein Erinnerungs-Tagebuch</h2>
            <p className="text-xs opacity-60 mb-6 uppercase font-bold tracking-widest italic">Halte fest, was heute wieder ans Licht gekommen ist.</p>
            <textarea 
              className="w-full h-64 p-6 border-2 border-[#2c1810] bg-white font-mono text-[#2c1810] mb-8 shadow-inner focus:ring-2 focus:ring-[#d97706] outline-none" 
              placeholder="Diese Musik hat mich sofort zurückversetzt in..." 
              value={diaryEntry} 
              onChange={e => setDiaryEntry(e.target.value)} 
            />
            <p className="text-[10px] opacity-50 mb-4 uppercase font-bold tracking-widest">Dein Eintrag wird automatisch in diesem Browser gespeichert.</p>
            <div className="flex flex-wrap justify-between items-center gap-3">
              <button onClick={() => { playSFX('click'); setPhase('exploration'); }} className="px-6 py-3 border-2 border-[#2c1810] font-bold text-xs uppercase">← Zurück zur Wand</button>
              <div className="flex flex-wrap gap-3">
                <button onClick={downloadDiary} className="px-6 py-3 border-2 border-[#2c1810] font-bold text-xs uppercase bg-white hover:bg-gray-100">Als Textdatei speichern</button>
                <button onClick={() => { playSFX('success'); setPhase('finish'); }} className="retro-button bg-[#2c1810] text-white px-12 py-3 font-bold uppercase">Reise beenden</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'finish' && (
        <div className="py-20 text-center animate-fadeIn">
          <div className="inline-block p-12 bg-white border-8 border-double border-[#2c1810] shadow-2xl">
            <h2 className="text-5xl font-bold mb-6 text-[#2c1810]">Alles Gute, {user.name}!</h2>
            <p className="text-xl opacity-80 mb-12">Deine Zeitreise ist für heute vorbei. Mögen die Erinnerungen lebendig bleiben.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={downloadDiary} className="px-8 py-4 border-2 border-[#2c1810] font-bold uppercase bg-white hover:bg-gray-100">Tagebuch speichern</button>
              <button onClick={startNewJourney} className="retro-button bg-[#d97706] text-white px-12 py-4 font-bold uppercase">Eine neue Reise planen</button>
            </div>
          </div>
        </div>
      )}

      <ProgressBar currentPhase={currentPhaseIndex} totalPhases={6} />
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-spin { animation: spin 4s linear infinite; }
      `}</style>
    </div>
  );
};

export default App;
