import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  AppPhase,
  UserProfile,
  VideoStatus,
  GalleryItem,
  CapturedMemory,
  SessionState,
  BuzzwordCategory,
} from './types';
import { DECADES_DB } from './constants';
import {
  generateDeepQuestion,
  analyzeMemoryImage,
  generateVeoVideo,
  getAiAvailability,
  AiAvailability,
} from './services/geminiService';
import {
  SFX,
  ProgressBar,
  Header,
  FontSizeControl,
  Modal,
  GalleryCard,
  ChatBot,
  MemoryAnswer,
  RetroPlayer,
} from './components';

// --- Persistence & helpers ---
const STORAGE_KEY = 'retromind.session.v2';
const PHASES: AppPhase[] = ['intro', 'onboarding', 'induction', 'exploration', 'diary', 'book', 'finish'];
const EMPTY_USER: UserProfile = { name: '', gender: 'divers', birthDate: '', interests: [] };
const INTEREST_LABELS = ['Musik', 'Technik', 'Spielzeug', 'Alltag', 'Mode', 'Essen'];
const INTEREST_TO_CATEGORY: Record<string, BuzzwordCategory> = {
  Musik: 'music', Technik: 'tech', Spielzeug: 'toy', Alltag: 'lifestyle', Mode: 'lifestyle', Essen: 'food',
};

function loadSession(): Partial<SessionState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const s = JSON.parse(raw);
    return s && s.version === 2 ? s : {};
  } catch {
    return {};
  }
}
function persistSession(s: SessionState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable — non-fatal */
  }
}
function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function downloadBlob(filename: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const todayStamp = () => new Date().toISOString().slice(0, 10);

// Shrink an uploaded photo before it travels to the API (request-size + speed).
function downscaleImage(dataUrl: string, max = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function buildBookText(user: UserProfile, decade: string, memories: CapturedMemory[], note: string): string {
  const out: string[] = [
    'RETROMIND — ERINNERUNGS-BUCH',
    '================================',
    user.name ? `Für: ${user.name}` : '',
    user.birthDate ? `Geboren: ${user.birthDate}` : '',
    `Schwerpunkt: die ${decade}er Jahre`,
    user.interests.length ? `Interessen: ${user.interests.join(', ')}` : '',
    `Erstellt: ${new Date().toLocaleString('de-DE')}`,
  ].filter(Boolean);

  const groups: Record<string, CapturedMemory[]> = {};
  for (const m of memories) (groups[m.decade] ||= []).push(m);
  for (const d of Object.keys(groups).sort()) {
    out.push('', `— ${d}er —`, '');
    for (const m of groups[d]) {
      out.push(`• ${m.term}`);
      if (m.prompt) out.push(`  Frage: ${m.prompt}`);
      out.push(`  ${m.answer.trim() || '(keine Notiz)'}`, '');
    }
  }
  if (note.trim()) out.push('', '— FREIE NOTIZ —', '', note.trim());
  return out.join('\n') + '\n';
}

// --- Main Application ---

const App: React.FC = () => {
  const saved = useMemo(loadSession, []);

  const [phase, setPhase] = useState<AppPhase>('intro');
  const [resumeTarget, setResumeTarget] = useState<AppPhase | null>(
    saved.phase && saved.phase !== 'intro' ? saved.phase : null
  );
  const [user, setUser] = useState<UserProfile>(saved.user ?? EMPTY_USER);
  const [memories, setMemories] = useState<CapturedMemory[]>(saved.memories ?? []);
  const [diaryEntry, setDiaryEntry] = useState<string>(saved.diaryEntry ?? '');
  const [clickedBuzzwords, setClickedBuzzwords] = useState<string[]>(saved.clickedBuzzwords ?? []);
  const [manualDecade, setManualDecade] = useState<string | null>(saved.manualDecade ?? null);
  const [fontScale, setFontScale] = useState<number>(saved.fontScale ?? 1);

  const [selectedWord, setSelectedWord] = useState<
    { id: string; term: string; knowledge: string; question: string; decade: string } | null
  >(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.05);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiAvailability, setAiAvailability] = useState<AiAvailability>('unknown');
  const [toast, setToast] = useState<string | null>(null);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisOk, setAnalysisOk] = useState(false);
  const [analysisSaved, setAnalysisSaved] = useState(false);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>({ status: 'idle' });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  // Stable identity (reads volume from a ref) so effects that depend on it
  // don't re-fire when the volume slider moves.
  const playSFX = useCallback((type: keyof typeof SFX) => {
    if (!sfxRef.current) return;
    sfxRef.current.src = SFX[type];
    sfxRef.current.volume = Math.min(volumeRef.current * 5, 0.4);
    sfxRef.current.currentTime = 0;
    sfxRef.current.play().catch(() => {});
  }, []);

  // --- derived ---
  const focusDecade = useMemo(() => {
    if (!user.birthDate) return '1980';
    const year = new Date(user.birthDate).getFullYear();
    if (Number.isNaN(year)) return '1980';
    const raw = Math.floor((year + 8) / 10) * 10;
    return String(Math.min(2010, Math.max(1960, raw)));
  }, [user.birthDate]);

  const currentAudioDecade = manualDecade || focusDecade;
  const userCategories = useMemo(
    () => new Set(user.interests.map((i) => INTEREST_TO_CATEGORY[i]).filter(Boolean)),
    [user.interests]
  );
  const phaseIndex = PHASES.indexOf(phase) + 1;

  const memoryFor = useCallback(
    (id: string) => memories.find((m) => m.kind === 'buzzword' && m.id === `bw-${id}`),
    [memories]
  );

  // --- effects ---
  useEffect(() => {
    getAiAvailability().then(setAiAvailability);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = ['18px', '20px', '23px'][fontScale - 1] || '18px';
  }, [fontScale]);

  // Persist the whole session whenever something meaningful changes. While the
  // user is still on the intro with a resume offer pending, keep the stored
  // phase pointing at where they left off (don't overwrite it with 'intro').
  useEffect(() => {
    const state: SessionState = {
      version: 2,
      phase: phase === 'intro' && resumeTarget ? resumeTarget : phase,
      user,
      diaryEntry,
      memories,
      clickedBuzzwords,
      manualDecade,
      fontScale,
      updatedAt: Date.now(),
    };
    persistSession(state);
  }, [phase, resumeTarget, user, diaryEntry, memories, clickedBuzzwords, manualDecade, fontScale]);

  useEffect(() => {
    if (!audioRef.current) return;
    const track = DECADES_DB[currentAudioDecade]?.audioUrl;
    if (track && audioRef.current.src !== track) {
      audioRef.current.src = track;
      audioRef.current.load();
      if (isMusicPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentAudioDecade]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isMusicPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (phase !== 'intro') playSFX('transition');
  }, [phase, playSFX]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // --- navigation ---
  const goTo = (p: AppPhase) => {
    playSFX('click');
    setPhase(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startJourney = () => {
    playSFX('click');
    setPhase('onboarding');
    setIsMusicPlaying(true);
  };

  const resumeJourney = () => {
    playSFX('success');
    setPhase(resumeTarget || 'exploration');
    setResumeTarget(null);
    setIsMusicPlaying(true);
  };

  const resetJourney = () => {
    playSFX('click');
    clearSession();
    setResumeTarget(null);
    setUser(EMPTY_USER);
    setMemories([]);
    setDiaryEntry('');
    setClickedBuzzwords([]);
    setManualDecade(null);
    setUploadedImage(null);
    setAnalysis(null);
    setAnalysisSaved(false);
    setVideoStatus({ status: 'idle' });
    setPhase('intro');
    window.scrollTo({ top: 0 });
  };

  const handleOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    playSFX('success');
    setPhase('induction');
  };

  const toggleInterest = (interest: string) => {
    playSFX('click');
    setUser((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  // --- memories ---
  const upsertMemory = (mem: CapturedMemory) => {
    setMemories((prev) => {
      const idx = prev.findIndex((m) => m.id === mem.id);
      if (idx === -1) return [...prev, mem];
      const copy = [...prev];
      copy[idx] = mem;
      return copy;
    });
  };

  // Tracks which buzzword's question is currently being awaited, so a slow
  // request for a word the user has since left doesn't clobber the modal
  // that's open (or reopen one they already closed) when it finally resolves.
  const activeWordRequestRef = useRef<string | null>(null);

  const closeBuzzwordModal = () => {
    activeWordRequestRef.current = null;
    setSelectedWord(null);
  };

  const openBuzzword = async (
    wordId: string,
    term: string,
    knowledge: string,
    decade: string,
    fallbackQuestion: string
  ) => {
    playSFX('click');
    setClickedBuzzwords((prev) => (prev.includes(wordId) ? prev : [...prev, wordId]));
    const existing = memoryFor(wordId);
    setAnswerDraft(existing?.answer ?? '');
    setIsGenerating(!existing);
    activeWordRequestRef.current = wordId;
    // Reuse the stored question if we already have one for this word.
    const question =
      existing?.prompt ??
      (await generateDeepQuestion(
        term,
        user.name,
        user.interests.join(', ') || 'allgemein',
        decade,
        fallbackQuestion
      ));
    if (activeWordRequestRef.current !== wordId) return; // user moved on or closed the modal
    setSelectedWord({ id: wordId, term, knowledge, question, decade });
    setIsGenerating(false);
  };

  const saveBuzzwordAnswer = () => {
    if (!selectedWord) return;
    playSFX('success');
    activeWordRequestRef.current = null;
    upsertMemory({
      id: `bw-${selectedWord.id}`,
      kind: 'buzzword',
      decade: selectedWord.decade,
      term: selectedWord.term,
      prompt: selectedWord.question,
      answer: answerDraft.trim(),
      createdAt: Date.now(),
    });
    setSelectedWord(null);
    setToast('Erinnerung gespeichert');
  };

  // --- photo lab ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Bitte eine Bilddatei wählen.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Das Bild ist zu groß (max. 20 MB).');
      return;
    }
    setUploadError(null);
    setAnalysis(null);
    setAnalysisOk(false);
    setAnalysisSaved(false);
    setVideoStatus({ status: 'idle' });
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    setUploadedImage(await downscaleImage(dataUrl));
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;
    playSFX('click');
    setAnalysis('Analysiere…');
    setAnalysisOk(false);
    setAnalysisSaved(false);
    const base64 = uploadedImage.split(',')[1];
    const mime = uploadedImage.split(';')[0].split(':')[1] || 'image/jpeg';
    const result = await analyzeMemoryImage(base64, mime);
    setAnalysis(result.text);
    setAnalysisOk(result.ok);
  };

  const saveAnalysisAsMemory = () => {
    if (!analysis || !analysisOk || !uploadedImage) return;
    playSFX('success');
    upsertMemory({
      id: `photo-${uid()}`,
      kind: 'photo',
      decade: currentAudioDecade,
      term: 'Mein Foto',
      prompt: 'Was die KI in diesem Bild gesehen hat',
      answer: analysis,
      photo: uploadedImage,
      createdAt: Date.now(),
    });
    setAnalysisSaved(true);
    setToast('Foto-Erinnerung gespeichert');
  };

  const handleGenerateVideo = async () => {
    if (!uploadedImage || videoStatus.status === 'generating') return;
    playSFX('click');
    setVideoStatus({ status: 'generating', message: 'Erwecke das Bild zum Leben – das dauert ein paar Minuten.' });
    const base64 = uploadedImage.split(',')[1];
    const mime = uploadedImage.split(';')[0].split(':')[1] || 'image/png';
    const result = await generateVeoVideo(
      'Ein nostalgisches Video, das dieses Foto sanft zum Leben erweckt, ruhige Bewegungen, warme Atmosphäre.',
      base64,
      mime
    );
    if (result.url) {
      setVideoStatus({ status: 'done', url: result.url, message: 'Fertig – dein Foto bewegt sich.' });
    } else {
      const msg =
        result.error === 'not_configured'
          ? 'Video-Generierung ist in diesem Demo nicht aktiv.'
          : result.error === 'timeout'
          ? 'Die Generierung hat zu lange gedauert. Versuch es später noch einmal.'
          : 'Die Video-Generierung ist fehlgeschlagen (benötigt ein Google-Projekt mit Billing).';
      setVideoStatus({ status: 'error', message: msg });
    }
  };

  // --- exports ---
  const bookText = () => buildBookText(user, focusDecade, memories, diaryEntry);
  const exportText = () => {
    playSFX('click');
    downloadBlob(`retromind-erinnerungsbuch-${todayStamp()}.txt`, bookText(), 'text/plain;charset=utf-8');
  };
  const exportSession = () => {
    playSFX('click');
    const state: SessionState = {
      version: 2,
      phase,
      user,
      diaryEntry,
      memories,
      clickedBuzzwords,
      manualDecade,
      fontScale,
      updatedAt: Date.now(),
    };
    downloadBlob(`retromind-sitzung-${todayStamp()}.json`, JSON.stringify(state, null, 2), 'application/json');
  };
  const importSession = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const s = JSON.parse(await file.text());
      if (s.version !== 2) throw new Error('bad version');
      setUser(s.user ?? EMPTY_USER);
      setMemories(s.memories ?? []);
      setDiaryEntry(s.diaryEntry ?? '');
      setClickedBuzzwords(s.clickedBuzzwords ?? []);
      setManualDecade(s.manualDecade ?? null);
      setFontScale(s.fontScale ?? 1);
      setResumeTarget(null);
      setPhase(s.phase && PHASES.includes(s.phase) ? s.phase : 'book');
      setToast('Sitzung geladen');
    } catch {
      setToast('Diese Datei konnte nicht gelesen werden');
    }
  };

  const printBook = () => {
    playSFX('click');
    window.print();
  };

  // --- render helpers ---
  const decadeData = DECADES_DB[focusDecade];
  // Treat an inconclusive ping the same as "not configured": if we can't
  // confirm the AI server is reachable, offering buttons that then fail with
  // a confusing "try again" error is worse than showing the honest demo notice.
  const aiOff = aiAvailability !== 'available';

  const AiNotice = () =>
    aiOff ? (
      <div className="mb-6 border-2 border-[#2c1810] bg-[#fef3c7] p-3 text-sm text-[#2c1810]">
        <strong>Demo-Hinweis:</strong> Dieses Demo läuft ohne KI-Schlüssel. Erinnerungsfragen kommen aus der
        Sammlung; Bildanalyse, Video und Chat-Begleiter sind deaktiviert.
      </div>
    ) : null;

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 max-w-6xl mx-auto text-[#2c1810]">
      <audio ref={audioRef} loop />
      <audio ref={sfxRef} />

      <FontSizeControl scale={fontScale} onChange={(n) => { playSFX('click'); setFontScale(n); }} />
      <Header />

      {phase !== 'intro' && (
        <>
          <button
            onClick={() => { playSFX('click'); setIsChatOpen((v) => !v); }}
            aria-label={isChatOpen ? 'Begleiter schließen' : 'Begleiter öffnen'}
            className="rm-fixed fixed bottom-10 left-4 md:left-10 z-50 w-14 h-14 bg-[#2c1810] text-white rounded-full retro-button flex items-center justify-center text-2xl shadow-lg"
          >
            {isChatOpen ? '✕' : '💬'}
          </button>
          <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} playSFX={playSFX} disabled={aiOff} />
          <RetroPlayer
            currentDecade={currentAudioDecade}
            onDecadeChange={(d) => { playSFX('click'); setManualDecade(d); }}
            isPlaying={isMusicPlaying}
            onToggle={() => { playSFX('click'); setIsMusicPlaying((v) => !v); }}
            volume={volume}
            onVolumeChange={setVolume}
          />
        </>
      )}

      {toast && (
        <div className="rm-fixed fixed top-16 left-1/2 -translate-x-1/2 z-[70] bg-[#2c1810] text-white px-5 py-2 font-bold text-sm shadow-lg animate-fadeIn">
          {toast}
        </div>
      )}

      {/* INTRO */}
      {phase === 'intro' && (
        <div className="flex flex-col items-center py-10 text-center animate-fadeIn">
          <div className="retro-card p-8 md:p-12 max-w-2xl bg-[#fff9eb]">
            <h2 className="text-4xl mb-6">Willkommen, Zeitreisende:r</h2>
            <p className="text-lg mb-8 leading-relaxed">
              Öffne die Truhe deiner Kindheit. RetroMind führt dich Jahrzehnt für Jahrzehnt zurück, stellt dir
              persönliche Fragen und sammelt deine Antworten zu einem Erinnerungs-Buch.
            </p>

            {resumeTarget && (
              <div className="mb-8 border-2 border-[#d97706] bg-[#fef3c7] p-4">
                <p className="font-bold mb-3">
                  Du hast eine begonnene Reise ({memories.length} Erinnerung{memories.length === 1 ? '' : 'en'}).
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button onClick={resumeJourney} className="retro-button bg-[#2c1810] text-white px-6 py-3 font-bold">
                    Weitermachen
                  </button>
                  <button onClick={resetJourney} className="px-6 py-3 border-2 border-[#2c1810] font-bold bg-white">
                    Neu beginnen
                  </button>
                </div>
              </div>
            )}

            {!resumeTarget && (
              <button
                onClick={startJourney}
                className="retro-button bg-[#d97706] text-white px-12 py-5 text-2xl font-bold hover:bg-[#b45309] w-full md:w-auto"
              >
                Zeitreise starten
              </button>
            )}

            <details className="mt-10 text-left text-sm text-[#5b4636]">
              <summary className="cursor-pointer font-bold uppercase tracking-widest text-xs">
                Wie RetroMind mit deinen Daten umgeht
              </summary>
              <ul className="list-disc pl-5 mt-3 space-y-1">
                <li>Profil, Antworten und Tagebuch bleiben <strong>nur in diesem Browser</strong> (localStorage). Kein Konto, kein Server-Speicher.</li>
                <li>Lädst du ein Foto hoch, wird es zur Beschreibung an die Google-Gemini-API gesendet (und für die optionale Video-Funktion an Veo). Sonst verlässt nichts dein Gerät.</li>
                <li>Über „Sitzung sichern" kannst du alles als Datei exportieren, über „Neu beginnen" alles löschen.</li>
              </ul>
            </details>
          </div>
        </div>
      )}

      {/* ONBOARDING */}
      {phase === 'onboarding' && (
        <div className="py-8 animate-fadeIn">
          <div className="retro-card p-6 md:p-12 bg-[#fff9eb]">
            <h2 className="text-3xl mb-8 border-b-2 border-[#2c1810] pb-2">Wer bist du?</h2>
            <form onSubmit={handleOnboarding} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label htmlFor="rm-name" className="block text-sm font-bold uppercase mb-1">Name</label>
                  <input
                    id="rm-name"
                    required
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="w-full border-2 border-[#2c1810] p-3 bg-white"
                    placeholder="Wie wirst du genannt?"
                  />
                </div>
                <div>
                  <label htmlFor="rm-birth" className="block text-sm font-bold uppercase mb-1">Geburtsdatum</label>
                  <input
                    id="rm-birth"
                    required
                    type="date"
                    min="1930-01-01"
                    max={todayStamp()}
                    value={user.birthDate}
                    onChange={(e) => setUser({ ...user, birthDate: e.target.value })}
                    className="w-full border-2 border-[#2c1810] p-3 bg-white"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <span className="block text-sm font-bold uppercase mb-1">Interessen (für persönlichere Fragen)</span>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_LABELS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      aria-pressed={user.interests.includes(interest)}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 border-2 border-[#2c1810] text-sm font-bold ${
                        user.interests.includes(interest) ? 'bg-[#2c1810] text-white' : 'bg-white'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 text-right pt-2">
                <button type="submit" className="retro-button bg-[#2c1810] text-white px-10 py-4 font-bold">
                  Weiter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INDUCTION */}
      {phase === 'induction' && (
        <div className="py-8 animate-fadeIn">
          <div className="text-center mb-10">
            <h2 className="text-4xl mb-3">Deine Zeit: {decadeData?.title}</h2>
            <p className="text-[#5b4636]">
              Du warst in den {focusDecade}ern ungefähr im Grundschulalter. Ein paar Impressionen zum Einstimmen –
              tippe für die Beschreibung.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {decadeData?.galleryItems.map((item) => (
              <GalleryCard key={item.keyword} item={item} onClick={() => { playSFX('click'); setSelectedGalleryItem(item); }} />
            ))}
          </div>
          <p className="text-xs text-[#8a6a3f] mt-4 text-center italic">
            Die Bilder sind – wo nicht anders angegeben – symbolische Zeit-Impressionen, keine echten Zeitdokumente.
          </p>

          <div className="mt-12 text-center">
            <button onClick={() => goTo('exploration')} className="retro-button bg-[#d97706] text-white px-12 py-5 text-xl font-bold">
              In die Details eintauchen
            </button>
          </div>
        </div>
      )}

      {/* EXPLORATION */}
      {phase === 'exploration' && (
        <div className="py-8 animate-fadeIn space-y-14">
          <AiNotice />

          {/* Memory lab */}
          <div className="retro-card p-6 md:p-8 bg-[#fffcf5] border-4 border-double">
            <h2 className="text-3xl mb-3 flex items-center gap-3">
              <span aria-hidden="true">🧪</span> Das Memory-Labor
            </h2>
            <p className="mb-6 text-[#5b4636] italic">
              Lade ein altes Foto hoch. Die KI beschreibt es dir – und du kannst die Beschreibung als Erinnerung behalten.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-4 border-dashed border-[#2c1810]/20 p-6 bg-white min-h-[280px] flex flex-col items-center justify-center text-center">
                {uploadedImage ? (
                  <>
                    <img src={uploadedImage} alt="Dein hochgeladenes Foto" className="max-h-56 border-2 border-[#2c1810] shadow-md" />
                    <button onClick={() => { playSFX('click'); setUploadedImage(null); setAnalysis(null); setAnalysisOk(false); }} className="mt-3 text-xs underline font-bold text-[#5b4636]">
                      Anderes Bild wählen
                    </button>
                  </>
                ) : (
                  <label className="retro-button bg-[#2c1810] text-white px-6 py-3 cursor-pointer font-bold">
                    Bild hochladen
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
                {uploadError && <p className="mt-3 text-xs font-bold text-red-700">{uploadError}</p>}
              </div>

              <div className="space-y-4">
                <button
                  disabled={!uploadedImage || aiOff}
                  onClick={handleAnalyze}
                  className={`retro-button py-3 font-bold w-full ${!uploadedImage || aiOff ? 'opacity-50 cursor-not-allowed bg-white' : 'bg-white hover:bg-gray-100'}`}
                >
                  Foto beschreiben lassen
                </button>
                <div>
                  <button
                    disabled={!uploadedImage || aiOff || videoStatus.status === 'generating'}
                    onClick={handleGenerateVideo}
                    className={`retro-button py-3 font-bold text-white w-full ${
                      !uploadedImage || aiOff || videoStatus.status === 'generating' ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#d97706] hover:bg-[#b45309]'
                    }`}
                  >
                    {videoStatus.status === 'generating' ? 'KI arbeitet…' : 'Foto zum Leben erwecken (Video)'}
                  </button>
                  <p className="text-xs mt-1 text-[#8a6a3f] text-center">
                    Video-Funktion benötigt ein Google-Projekt mit Billing.
                  </p>
                </div>

                {analysis && (
                  <div className="p-4 bg-white border-2 border-[#2c1810] text-sm leading-relaxed">
                    <p className="font-bold mb-2 uppercase text-[#b45309]">Nostalgische Beschreibung</p>
                    <div className="whitespace-pre-wrap">{analysis}</div>
                    {analysisOk && (
                      <button
                        onClick={saveAnalysisAsMemory}
                        disabled={analysisSaved}
                        className="mt-3 text-xs font-bold uppercase border-2 border-[#2c1810] px-3 py-1.5 bg-[#fff9eb] disabled:opacity-50"
                      >
                        {analysisSaved ? '✓ Im Buch gespeichert' : 'Zur Erinnerung hinzufügen'}
                      </button>
                    )}
                  </div>
                )}

                {videoStatus.status !== 'idle' && (
                  <div className="p-4 bg-[#2c1810] text-white border-2 border-white">
                    <p className="text-xs font-bold uppercase mb-1">
                      {videoStatus.status === 'generating' ? 'Filmrolle wird entwickelt…' : videoStatus.status === 'done' ? 'Fertig!' : 'Hinweis'}
                    </p>
                    <p className="text-xs opacity-90">{videoStatus.message}</p>
                    {videoStatus.url && (
                      <div className="mt-3">
                        <video src={videoStatus.url} controls className="w-full border-2 border-white" />
                        <a href={videoStatus.url} className="text-xs underline mt-2 block font-bold text-orange-200">
                          Video herunterladen
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wall of words */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl border-b-2 border-[#2c1810] pb-2">Die Erinnerungs-Wand</h2>
              <p className="text-sm text-[#5b4636] mt-2">
                Tippe auf ein Stichwort. Du bekommst eine persönliche Frage – und ein Feld, um deine Antwort
                festzuhalten. {userCategories.size > 0 && 'Stichworte zu deinen Interessen stehen oben.'}
              </p>
            </div>

            {Object.entries(DECADES_DB).map(([year, data]) => {
              const sorted = [...data.buzzwords].sort((a, b) => {
                const am = userCategories.has(a.category) ? 0 : 1;
                const bm = userCategories.has(b.category) ? 0 : 1;
                return am - bm;
              });
              return (
                <div
                  key={year}
                  className={`p-5 rounded-lg ${year === focusDecade ? 'bg-[#fef3c7] border-2 border-dashed border-[#d97706]' : ''}`}
                >
                  <h3 className="text-2xl mb-5 flex items-center gap-3 flex-wrap">
                    <span className="bg-[#2c1810] text-white px-3 py-1 text-sm font-bold">{year}er</span>
                    {data.title}
                    {year === focusDecade && <span className="text-xs uppercase font-bold text-[#b45309]">deine Zeit</span>}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {sorted.map((bw) => {
                      const answered = !!memoryFor(bw.id);
                      const clicked = clickedBuzzwords.includes(bw.id);
                      const highlight = userCategories.has(bw.category);
                      return (
                        <button
                          key={bw.id}
                          onClick={() => openBuzzword(bw.id, bw.term, bw.knowledge, year, bw.question)}
                          className={`px-5 py-3 border-2 font-bold relative ${
                            answered
                              ? 'bg-[#3f7d4f] text-white border-transparent'
                              : clicked
                              ? 'bg-[#8b5cf6] text-white border-transparent'
                              : 'bg-white border-[#2c1810] hover:bg-[#fff9eb]'
                          }`}
                        >
                          {highlight && <span aria-hidden="true" className="mr-1">★</span>}
                          {bw.term}
                          {answered && <span aria-hidden="true" className="absolute -top-2 -right-2 text-sm">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button onClick={() => goTo('induction')} className="px-6 py-3 border-2 border-[#2c1810] font-bold bg-white">
              ← Zu den Impressionen
            </button>
            <button onClick={() => goTo('diary')} className="retro-button bg-[#2c1810] text-white px-10 py-4 font-bold">
              Weiter zum Tagebuch ({memories.length})
            </button>
          </div>
        </div>
      )}

      {/* DIARY */}
      {phase === 'diary' && (
        <div className="py-8 animate-fadeIn max-w-3xl mx-auto">
          <div className="retro-card p-6 md:p-8 bg-[#fff9eb]">
            <h2 className="text-3xl mb-2">Freie Notiz</h2>
            <p className="text-sm text-[#5b4636] mb-4">
              Deine {memories.length} gesammelte{memories.length === 1 ? '' : 'n'} Erinnerung
              {memories.length === 1 ? '' : 'en'} sind schon im Buch. Hier ist Platz für alles, was sonst noch hochkam.
            </p>
            <textarea
              className="w-full h-56 p-4 border-2 border-[#2c1810] bg-white text-[#2c1810] focus:outline-none focus:ring-2 focus:ring-[#d97706]"
              placeholder="Diese Musik hat mich sofort zurückversetzt in…"
              value={diaryEntry}
              onChange={(e) => setDiaryEntry(e.target.value)}
            />
            <p className="text-xs text-[#8a6a3f] mt-2">Wird automatisch in diesem Browser gespeichert.</p>
            <div className="flex flex-wrap justify-between items-center gap-3 mt-6">
              <button onClick={() => goTo('exploration')} className="px-6 py-3 border-2 border-[#2c1810] font-bold bg-white">
                ← Zurück zur Wand
              </button>
              <button onClick={() => goTo('book')} className="retro-button bg-[#2c1810] text-white px-10 py-4 font-bold">
                Erinnerungs-Buch ansehen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEMORY BOOK */}
      {phase === 'book' && (
        <div className="py-8 animate-fadeIn max-w-3xl mx-auto">
          <div id="memory-book" className="retro-card p-6 md:p-10 bg-white">
            <div className="text-center border-b-4 border-double border-[#2c1810] pb-6 mb-6">
              <p className="uppercase tracking-[0.3em] text-xs font-bold text-[#8a6a3f]">RetroMind</p>
              <h2 className="text-4xl retro-serif font-bold my-2">Erinnerungs-Buch</h2>
              {user.name && <p className="text-lg">für {user.name}</p>}
              <p className="text-sm text-[#5b4636]">
                Eine Zeitreise durch die {focusDecade}er · {new Date().toLocaleDateString('de-DE')}
              </p>
              {user.interests.length > 0 && (
                <p className="text-xs text-[#8a6a3f] mt-1">Interessen: {user.interests.join(', ')}</p>
              )}
            </div>

            {memories.length === 0 && !diaryEntry.trim() && (
              <p className="text-center text-[#5b4636] italic py-8">
                Noch keine Erinnerungen gesammelt. Geh zurück zur Wand und beantworte ein paar Fragen.
              </p>
            )}

            {memories.map((m) => (
              <div key={m.id} className="mb-6 pb-6 border-b border-[#2c1810]/15 last:border-0">
                <p className="text-xs uppercase font-bold text-[#8a6a3f]">{m.decade}er · {m.term}</p>
                {m.prompt && <p className="retro-serif italic text-lg mt-1 mb-2">{m.prompt}</p>}
                {m.photo && (
                  <img src={m.photo} alt="" className="my-3 max-h-64 border-2 border-[#2c1810]" />
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{m.answer.trim() || '(keine Notiz)'}</p>
              </div>
            ))}

            {diaryEntry.trim() && (
              <div className="mt-4">
                <p className="text-xs uppercase font-bold text-[#8a6a3f]">Freie Notiz</p>
                <p className="whitespace-pre-wrap leading-relaxed mt-1">{diaryEntry.trim()}</p>
              </div>
            )}
          </div>

          <div className="no-print flex flex-wrap gap-3 justify-center mt-8">
            <button onClick={printBook} className="retro-button bg-[#d97706] text-white px-8 py-4 font-bold">
              Als PDF speichern / drucken
            </button>
            <button onClick={exportText} className="px-6 py-4 border-2 border-[#2c1810] font-bold bg-white">
              Als Textdatei
            </button>
            <button onClick={exportSession} className="px-6 py-4 border-2 border-[#2c1810] font-bold bg-white">
              Sitzung sichern (.json)
            </button>
            <button onClick={() => importInputRef.current?.click()} className="px-6 py-4 border-2 border-[#2c1810] font-bold bg-white">
              Sitzung laden
            </button>
            <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={importSession} />
          </div>
          <div className="no-print flex flex-wrap gap-3 justify-center mt-3">
            <button onClick={() => goTo('diary')} className="px-6 py-3 border-2 border-[#2c1810] font-bold bg-white text-sm">
              ← Zurück
            </button>
            <button onClick={() => goTo('finish')} className="px-6 py-3 border-2 border-[#2c1810] font-bold bg-white text-sm">
              Reise abschließen
            </button>
          </div>
        </div>
      )}

      {/* FINISH */}
      {phase === 'finish' && (
        <div className="py-16 text-center animate-fadeIn">
          <div className="inline-block p-8 md:p-12 bg-white border-8 border-double border-[#2c1810] shadow-2xl max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Alles Gute{user.name ? `, ${user.name}` : ''}!</h2>
            <p className="text-lg text-[#5b4636] mb-8">
              Deine Zeitreise ist für heute vorbei. {memories.length} Erinnerung
              {memories.length === 1 ? '' : 'en'} liegen jetzt in deinem Buch – jederzeit wieder abrufbar.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => goTo('book')} className="retro-button bg-[#2c1810] text-white px-8 py-4 font-bold">
                Buch ansehen
              </button>
              <button onClick={resetJourney} className="px-8 py-4 border-2 border-[#2c1810] font-bold bg-white">
                Neue Reise beginnen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery detail modal */}
      {selectedGalleryItem && (
        <Modal onClose={() => setSelectedGalleryItem(null)} label={selectedGalleryItem.title}>
          <button
            onClick={() => { playSFX('click'); setSelectedGalleryItem(null); }}
            aria-label="Schließen"
            className="absolute top-3 right-3 text-2xl leading-none"
          >
            ✕
          </button>
          <span className="text-xs uppercase font-bold text-[#b45309] block">Zeit-Impression</span>
          <h3 className="text-3xl font-bold mb-3">{selectedGalleryItem.title}</h3>
          {selectedGalleryItem.image && (
            <img src={selectedGalleryItem.image} alt={selectedGalleryItem.title} className="w-full border-2 border-[#2c1810] mb-3" />
          )}
          <p className="text-lg leading-relaxed italic border-t-2 border-[#2c1810] pt-3">
            {selectedGalleryItem.description}
          </p>
          {selectedGalleryItem.credit && (
            <p className="text-xs text-[#8a6a3f] mt-2">{selectedGalleryItem.credit}</p>
          )}
          <button
            onClick={() => { playSFX('click'); setSelectedGalleryItem(null); }}
            className="w-full mt-6 retro-button bg-[#2c1810] text-white py-3 font-bold uppercase"
          >
            Schließen
          </button>
        </Modal>
      )}

      {/* Buzzword / memory-capture modal */}
      {selectedWord && (
        <Modal onClose={closeBuzzwordModal} label={`Erinnerung: ${selectedWord.term}`}>
          <button
            onClick={() => { playSFX('click'); closeBuzzwordModal(); }}
            aria-label="Schließen"
            className="absolute top-3 right-3 text-2xl leading-none"
          >
            ✕
          </button>
          <span className="text-xs uppercase font-bold text-[#b45309] block">Wissen von damals</span>
          <h3 className="text-3xl font-bold mb-2">{selectedWord.term}</h3>
          <p className="text-base leading-relaxed mb-5 italic">"{selectedWord.knowledge}"</p>

          <div className="bg-[#f3f4f6] p-4 border-l-4 border-[#d97706] mb-4">
            <h4 className="text-xs uppercase font-bold text-[#5b4636] mb-2">Deine persönliche Frage</h4>
            {isGenerating ? (
              <p className="italic text-sm animate-pulse">Die KI überlegt sich eine Frage für dich…</p>
            ) : (
              <p className="text-lg retro-serif leading-snug">{selectedWord.question}</p>
            )}
          </div>

          <MemoryAnswer
            value={answerDraft}
            onChange={setAnswerDraft}
            placeholder="Was fällt dir dazu ein? Ein Detail, ein Geruch, ein Moment…"
          />

          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={saveBuzzwordAnswer} className="retro-button bg-[#2c1810] text-white px-6 py-3 font-bold flex-grow">
              {memoryFor(selectedWord.id) ? 'Erinnerung aktualisieren' : 'Erinnerung speichern'}
            </button>
            <button onClick={() => { playSFX('click'); closeBuzzwordModal(); }} className="px-6 py-3 border-2 border-[#2c1810] font-bold bg-white">
              Später
            </button>
          </div>
        </Modal>
      )}

      <ProgressBar current={phaseIndex} total={PHASES.length} />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-popIn { animation: popIn 0.25s ease-out forwards; }
        .animate-spin { animation: spin 4s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-fadeIn, .animate-popIn, .animate-spin, .animate-pulse { animation: none !important; }
          * { scroll-behavior: auto !important; }
        }
        @media print {
          body { background: #fff !important; }
          .rm-fixed, .no-print { display: none !important; }
          #memory-book { border: none !important; box-shadow: none !important; padding: 0 !important; }
          .retro-card { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
