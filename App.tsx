import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppPhase,
  VideoStatus,
  GalleryItem,
  BuzzwordCategory,
} from './types';
import {
  generateDeepQuestion,
  generatePerspectiveQuestion,
  analyzeMemoryImage,
  generateVeoVideo,
  getAiAvailability,
  AiAvailability,
} from './services/geminiService';
import { ProgressBar, Header, SettingsModal, AccountControls, ChatBot, BootOverlay, CrtOverlay } from './components';
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
import { useSpotifyBackground } from './hooks/useSpotifyBackground';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { loadSessionFromDrive, saveSessionToDrive } from './services/googleDriveService';
import { PHASES, INTEREST_TO_CATEGORY } from './lib/session';
import { downloadBlob, todayStamp, buildBookText, downscaleImage, uid } from './lib/format';

const App: React.FC = () => {
  const session = useRetroSession();
  const {
    phase, setPhase,
    resumeTarget, setResumeTarget,
    user, setUser,
    memories, memoryFor, perspectiveFor, upsertMemory,
    diaryEntry, setDiaryEntry,
    clickedBuzzwords, setClickedBuzzwords,
    manualDecade, setManualDecade,
    fontScale, setFontScale,
    focusDecade,
    resetJourney, importSession, exportSession, loadRemoteState, hasProgress,
  } = session;

  const currentAudioDecade = manualDecade || focusDecade;
  const {
    sfxRef,
    isMusicPlaying, setIsMusicPlaying,
    isAudioBlocked, resumeBlockedPlayback,
    volume, setVolume,
    playSFX,
  } = useAudioPlayer(currentAudioDecade);
  const spotify = useSpotifyBackground(currentAudioDecade);

  const googleAuth = useGoogleAuth();
  const spotifyAuth = useSpotifyAuth();
  const [driveSyncState, setDriveSyncState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const remoteLoadAttempted = useRef(false);

  const [selectedWord, setSelectedWord] = useState<
    { id: string; term: string; knowledge: string; question: string; decade: string } | null
  >(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [perspective, setPerspective] = useState<{ question: string } | null>(null);
  const [perspectiveDraft, setPerspectiveDraft] = useState('');
  const [isGeneratingPerspective, setIsGeneratingPerspective] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showBottomControls, setShowBottomControls] = useState(false);
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

  // Settings and Google-account controls stay out of the way while reading —
  // they slide in only once the page is scrolled (near) to the bottom.
  useEffect(() => {
    const checkScrollPosition = () => {
      const doc = document.documentElement;
      const nearBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 24;
      setShowBottomControls(nearBottom);
    };
    checkScrollPosition();
    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition);
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [phase]);

  // On sign-in, check the user's Google Drive for a previously saved journey.
  // A fresh (empty) local session adopts it; an already-in-progress local
  // session is left alone and simply starts syncing to Drive going forward.
  useEffect(() => {
    if (googleAuth.status !== 'signed_in' || remoteLoadAttempted.current) return;
    remoteLoadAttempted.current = true;
    (async () => {
      const token = await googleAuth.getFreshAccessToken();
      if (!token) return;
      try {
        const remote = await loadSessionFromDrive(token);
        if (!remote) return;
        if (!hasProgress) {
          loadRemoteState(remote);
          setToast('Gespeicherte Reise aus Google Drive geladen');
        } else {
          setToast('Deine Reise wird jetzt zusätzlich in Google Drive gesichert');
        }
      } catch {
        setDriveSyncState('error');
      }
    })();
    // hasProgress / loadRemoteState are stable enough for this one-shot check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleAuth.status]);

  // Debounced push of the current session to Drive while signed in.
  useEffect(() => {
    if (googleAuth.status !== 'signed_in' || !remoteLoadAttempted.current) return;
    const timer = setTimeout(async () => {
      const token = await googleAuth.getFreshAccessToken();
      if (!token) {
        setDriveSyncState('error');
        return;
      }
      setDriveSyncState('saving');
      try {
        await saveSessionToDrive(token, exportSession());
        setDriveSyncState('saved');
      } catch {
        setDriveSyncState('error');
      }
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleAuth.status, phase, user, memories, diaryEntry, clickedBuzzwords, manualDecade, fontScale]);

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
  const closeSettingsWithSfx = () => {
    playSFX('click');
    setIsSettingsOpen(false);
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
    const existingPerspective = perspectiveFor(wordId);
    setPerspective(existingPerspective ? { question: existingPerspective.prompt } : null);
    setPerspectiveDraft(existingPerspective?.answer ?? '');
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

  const openPerspective = async () => {
    if (!selectedWord) return;
    playSFX('click');
    setIsGeneratingPerspective(true);
    const fallback =
      `Stell dir vor, eine gute Freundin, ein Geschwister oder ein Elternteil von ` +
      `damals hätte "${selectedWord.term}" erlebt – wie hätte diese Person den Moment wohl erzählt?`;
    const question = await generatePerspectiveQuestion(
      selectedWord.term,
      user.name,
      selectedWord.decade,
      memoryFor(selectedWord.id)?.answer ?? '',
      fallback
    );
    setPerspective({ question });
    setIsGeneratingPerspective(false);
  };

  const savePerspectiveAnswer = () => {
    if (!selectedWord || !perspective) return;
    playSFX('success');
    upsertMemory({
      id: `pw-${selectedWord.id}`,
      kind: 'perspective',
      decade: selectedWord.decade,
      term: `${selectedWord.term} · Perspektivwechsel`,
      prompt: perspective.question,
      answer: perspectiveDraft.trim(),
      createdAt: Date.now(),
    });
    setToast('Perspektive gespeichert');
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

  // --- Google account ---
  const handleGoogleSignIn = () => {
    playSFX('click');
    googleAuth.signIn();
  };
  const handleGoogleSignOut = () => {
    playSFX('click');
    googleAuth.signOut();
    remoteLoadAttempted.current = false;
    setDriveSyncState('idle');
  };

  // --- Spotify account ---
  const handleSpotifySignIn = () => {
    playSFX('click');
    spotifyAuth.signIn();
  };
  const handleSpotifySignOut = () => {
    playSFX('click');
    spotifyAuth.signOut();
  };

  // --- render helpers ---
  const aiOff = aiAvailability === 'not_configured';
  const isAnswered = (id: string) => !!memoryFor(id);

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 max-w-6xl mx-auto text-retro-ink">
      <BootOverlay />
      <CrtOverlay />
      <audio ref={sfxRef} />
      {/* Off-screen, always mounted: autoplays the era's real Spotify
          playlist in the background once the first tap/click unlocks audio
          (see useSpotifyBackground) — invisible by design, controlled from
          the Settings modal via play/pause only (Spotify exposes no volume
          control we could put here). */}
      <div ref={spotify.containerRef} aria-hidden="true" className="absolute w-px h-px overflow-hidden -left-full" />

      <AccountControls
        googleStatus={googleAuth.status}
        googleUser={googleAuth.user}
        driveSyncState={driveSyncState}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        spotifyStatus={spotifyAuth.status}
        spotifyUser={spotifyAuth.user}
        onSpotifySignIn={handleSpotifySignIn}
        onSpotifySignOut={handleSpotifySignOut}
        visible={showBottomControls}
      />
      <Header />

      {/* Settings live where the music button used to sit — the ambient
          player is available from the very first screen via its controls
          here, since music already starts playing at app boot. */}
      <button
        onClick={() => { playSFX('click'); setIsSettingsOpen(true); }}
        aria-label="App-Einstellungen öffnen"
        className={`rm-fixed fixed bottom-2 right-4 md:right-10 z-50 w-10 h-10 rounded-full bg-retro-cream border-2 border-retro-ink retro-button flex items-center justify-center text-base transition-opacity duration-300 ${
          showBottomControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        ⚙️
      </button>
      {isSettingsOpen && (
        <SettingsModal
          fontScale={fontScale}
          onFontScaleChange={(n) => { playSFX('click'); setFontScale(n); }}
          currentDecade={currentAudioDecade}
          onDecadeChange={(d) => { playSFX('click'); setManualDecade(d); }}
          isPlaying={isMusicPlaying}
          isBlocked={isAudioBlocked}
          onToggleMusic={() => {
            playSFX('click');
            if (isMusicPlaying && isAudioBlocked) resumeBlockedPlayback();
            else setIsMusicPlaying((v) => !v);
          }}
          volume={volume}
          onVolumeChange={setVolume}
          isSpotifyReady={spotify.isReady}
          isSpotifyPlaying={spotify.isPlaying}
          onToggleSpotify={() => { playSFX('click'); spotify.togglePlay(); }}
          onDismiss={() => setIsSettingsOpen(false)}
          onCloseClick={closeSettingsWithSfx}
        />
      )}

      {phase !== 'intro' && (
        <>
          <button
            onClick={() => { playSFX('click'); setIsChatOpen((v) => !v); }}
            aria-label={isChatOpen ? 'Begleiter schließen' : 'Begleiter öffnen'}
            className="rm-fixed fixed bottom-20 left-4 md:left-10 z-50 w-14 h-14 bg-retro-ink text-white rounded-full retro-button flex items-center justify-center text-2xl shadow-lg"
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
          googleStatus={googleAuth.status}
          googleUser={googleAuth.user}
          onGoogleSignIn={handleGoogleSignIn}
          spotifyStatus={spotifyAuth.status}
          spotifyUser={spotifyAuth.user}
          onSpotifySignIn={handleSpotifySignIn}
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
          perspective={perspective}
          isGeneratingPerspective={isGeneratingPerspective}
          perspectiveDraft={perspectiveDraft}
          onPerspectiveAnswerChange={setPerspectiveDraft}
          isPerspectiveSaved={!!perspectiveFor(selectedWord.id)}
          onOpenPerspective={openPerspective}
          onSavePerspective={savePerspectiveAnswer}
        />
      )}

      <ProgressBar current={phaseIndex} total={PHASES.length} />
    </div>
  );
};

export default App;
