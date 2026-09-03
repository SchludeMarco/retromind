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
import { SFX, ProgressBar, Header, FontSizeControl, ChatBot, RetroPlayer, BootOverlay } from './components';
import {
  IntroPhase,
  OnboardingPhase,
  InductionPhase,
  ExplorationPhase,
  DiaryPhase,
  BookPhase,
  FinishPhase,
  GalleryDetailModal,
  BuzzwordModal,
} from './phases';

// --- Persistence & helpers ---
const STORAGE_KEY = 'retromind.session.v2';
const PHASES: AppPhase[] = ['intro', 'onboarding', 'induction', 'exploration', 'diary', 'book', 'finish'];
const EMPTY_USER: UserProfile = { name: '', gender: 'divers', birthDate: '', interests: [] };
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
  const [analysisSaved, setAnalysisSaved] = useState(false);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>({ status: 'idle' });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
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

  const selectGalleryItem = (item: GalleryItem) => {
    playSFX('click');
    setSelectedGalleryItem(item);
  };
  const closeGalleryItemWithSfx = () => {
    playSFX('click');
    setSelectedGalleryItem(null);
  };
  const closeBuzzwordModalWithSfx = () => {
    playSFX('click');
    setSelectedWord(null);
  };
  const clearUploadedImage = () => {
    playSFX('click');
    setUploadedImage(null);
    setAnalysis(null);
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
    setSelectedWord({ id: wordId, term, knowledge, question, decade });
    setIsGenerating(false);
  };

  const saveBuzzwordAnswer = () => {
    if (!selectedWord) return;
    playSFX('success');
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
    setAnalysisSaved(false);
    const base64 = uploadedImage.split(',')[1];
    const mime = uploadedImage.split(';')[0].split(':')[1] || 'image/jpeg';
    setAnalysis(await analyzeMemoryImage(base64, mime));
  };

  const saveAnalysisAsMemory = () => {
    if (!analysis || !uploadedImage) return;
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
  const aiOff = aiAvailability === 'not_configured';
  const isAnswered = (id: string) => !!memoryFor(id);

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 max-w-6xl mx-auto text-retro-ink">
      <BootOverlay />
      <audio ref={audioRef} loop />
      <audio ref={sfxRef} />

      <FontSizeControl scale={fontScale} onChange={(n) => { playSFX('click'); setFontScale(n); }} />
      <Header />

      {phase !== 'intro' && (
        <>
          <button
            onClick={() => { playSFX('click'); setIsChatOpen((v) => !v); }}
            aria-label={isChatOpen ? 'Begleiter schließen' : 'Begleiter öffnen'}
            className="rm-fixed fixed bottom-10 left-4 md:left-10 z-50 w-14 h-14 bg-retro-ink text-white rounded-full retro-button flex items-center justify-center text-2xl shadow-lg"
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
        <div className="rm-fixed fixed top-16 left-1/2 -translate-x-1/2 z-[70] bg-retro-ink text-white px-5 py-2 font-bold text-sm shadow-lg animate-fadeIn">
          {toast}
        </div>
      )}

      {phase === 'intro' && (
        <IntroPhase
          resumeTarget={resumeTarget}
          memoriesCount={memories.length}
          onStart={startJourney}
          onResume={resumeJourney}
          onReset={resetJourney}
        />
      )}

      {phase === 'onboarding' && (
        <OnboardingPhase
          user={user}
          onUserChange={setUser}
          onToggleInterest={toggleInterest}
          onSubmit={handleOnboarding}
          maxBirthDate={todayStamp()}
        />
      )}

      {phase === 'induction' && (
        <InductionPhase
          focusDecade={focusDecade}
          onSelectGalleryItem={selectGalleryItem}
          onContinue={() => goTo('exploration')}
        />
      )}

      {phase === 'exploration' && (
        <ExplorationPhase
          aiOff={aiOff}
          uploadedImage={uploadedImage}
          uploadError={uploadError}
          analysis={analysis}
          analysisSaved={analysisSaved}
          videoStatus={videoStatus}
          onImageUpload={handleImageUpload}
          onClearImage={clearUploadedImage}
          onAnalyze={handleAnalyze}
          onSaveAnalysis={saveAnalysisAsMemory}
          onGenerateVideo={handleGenerateVideo}
          focusDecade={focusDecade}
          userCategories={userCategories}
          clickedBuzzwords={clickedBuzzwords}
          memoriesCount={memories.length}
          isAnswered={isAnswered}
          onOpenBuzzword={openBuzzword}
          onBack={() => goTo('induction')}
          onNext={() => goTo('diary')}
        />
      )}

      {phase === 'diary' && (
        <DiaryPhase
          memoriesCount={memories.length}
          diaryEntry={diaryEntry}
          onDiaryChange={setDiaryEntry}
          onBack={() => goTo('exploration')}
          onNext={() => goTo('book')}
        />
      )}

      {phase === 'book' && (
        <BookPhase
          user={user}
          focusDecade={focusDecade}
          memories={memories}
          diaryEntry={diaryEntry}
          onPrint={printBook}
          onExportText={exportText}
          onExportSession={exportSession}
          onImportSession={importSession}
          onBack={() => goTo('diary')}
          onNext={() => goTo('finish')}
        />
      )}

      {phase === 'finish' && (
        <FinishPhase
          userName={user.name}
          memoriesCount={memories.length}
          onViewBook={() => goTo('book')}
          onRestart={resetJourney}
        />
      )}

      {selectedGalleryItem && (
        <GalleryDetailModal
          item={selectedGalleryItem}
          onDismiss={() => setSelectedGalleryItem(null)}
          onCloseClick={closeGalleryItemWithSfx}
        />
      )}

      {selectedWord && (
        <BuzzwordModal
          word={selectedWord}
          isGenerating={isGenerating}
          answerDraft={answerDraft}
          onAnswerChange={setAnswerDraft}
          isExistingMemory={!!memoryFor(selectedWord.id)}
          onSave={saveBuzzwordAnswer}
          onDismiss={() => setSelectedWord(null)}
          onCloseClick={closeBuzzwordModalWithSfx}
        />
      )}

      <ProgressBar current={phaseIndex} total={PHASES.length} />
    </div>
  );
};

export default App;
