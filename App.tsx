import React, { useEffect, useMemo, useState } from 'react';
import {
  AppPhase,
  VideoStatus,
  GalleryItem,
  BuzzwordCategory,
} from './types';
import { generateDeepQuestion, analyzeMemoryImage, generateVeoVideo, getAiAvailability, AiAvailability } from './services/geminiService';
import { ProgressBar, Header, FontSizeControl, ChatBot, RetroPlayer, BootOverlay, CrtOverlay } from './components';
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
import { useRetroSession } from './hooks/useRetroSession';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { PHASES, INTEREST_TO_CATEGORY } from './lib/session';
import { downloadBlob, todayStamp, buildBookText, downscaleImage, uid } from './lib/format';

const App: React.FC = () => {
  const session = useRetroSession();
  const {
    phase, setPhase,
    resumeTarget, setResumeTarget,
    user, setUser,
    memories, memoryFor, upsertMemory,
    diaryEntry, setDiaryEntry,
    clickedBuzzwords, setClickedBuzzwords,
    manualDecade, setManualDecade,
    fontScale, setFontScale,
    focusDecade,
    resetJourney, importSession, exportSession,
  } = session;

  const currentAudioDecade = manualDecade || focusDecade;
  const {
    audioRef, sfxRef,
    isMusicPlaying, setIsMusicPlaying,
    isAudioBlocked, resumeBlockedPlayback,
    volume, setVolume,
    playSFX,
  } = useAudioPlayer(currentAudioDecade);

  const [selectedWord, setSelectedWord] = useState<
    { id: string; term: string; knowledge: string; question: string; decade: string } | null
  >(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiAvailability, setAiAvailability] = useState<AiAvailability>('unknown');
  const [toast, setToast] = useState<string | null>(null);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisSaved, setAnalysisSaved] = useState(false);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>({ status: 'idle' });

  const userCategories = useMemo(
    () => new Set(user.interests.map((i) => INTEREST_TO_CATEGORY[i]).filter(Boolean) as BuzzwordCategory[]),
    [user.interests]
  );
  const phaseIndex = PHASES.indexOf(phase) + 1;

  // --- effects ---
  useEffect(() => {
    getAiAvailability().then(setAiAvailability);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = ['18px', '20px', '23px'][fontScale - 1] || '18px';
  }, [fontScale]);

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

  const handleResetJourney = () => {
    playSFX('click');
    resetJourney();
    setUploadedImage(null);
    setAnalysis(null);
    setAnalysisSaved(false);
    setVideoStatus({ status: 'idle' });
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
  const exportText = () => {
    playSFX('click');
    downloadBlob(
      `retromind-erinnerungsbuch-${todayStamp()}.txt`,
      buildBookText(user, focusDecade, memories, diaryEntry),
      'text/plain;charset=utf-8'
    );
  };
  const exportSessionFile = () => {
    playSFX('click');
    downloadBlob(`retromind-sitzung-${todayStamp()}.json`, JSON.stringify(exportSession(), null, 2), 'application/json');
  };
  const importSessionFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const ok = await importSession(file);
    setToast(ok ? 'Sitzung geladen' : 'Diese Datei konnte nicht gelesen werden');
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
      <CrtOverlay />
      <audio ref={audioRef} loop />
      <audio ref={sfxRef} />

      <FontSizeControl scale={fontScale} onChange={(n) => { playSFX('click'); setFontScale(n); }} />
      <Header />

      {/* The ambient player stays available from the very first screen, since
          music already starts playing at app boot. */}
      <RetroPlayer
        currentDecade={currentAudioDecade}
        onDecadeChange={(d) => { playSFX('click'); setManualDecade(d); }}
        isPlaying={isMusicPlaying}
        isBlocked={isAudioBlocked}
        onToggle={() => {
          playSFX('click');
          if (isMusicPlaying && isAudioBlocked) resumeBlockedPlayback();
          else setIsMusicPlaying((v) => !v);
        }}
        volume={volume}
        onVolumeChange={setVolume}
      />

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
          onReset={handleResetJourney}
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
          onExportSession={exportSessionFile}
          onImportSession={importSessionFile}
          onBack={() => goTo('diary')}
          onNext={() => goTo('finish')}
        />
      )}

      {phase === 'finish' && (
        <FinishPhase
          userName={user.name}
          memoriesCount={memories.length}
          onViewBook={() => goTo('book')}
          onRestart={handleResetJourney}
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
