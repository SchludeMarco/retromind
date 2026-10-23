import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StationCorner } from './components/StationCorner';
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
import { RetroTicker } from './components/RetroTicker';
import { AmbientLife } from './components/AmbientLife';
import { ChristmasDeco } from './components/ChristmasDeco';
import { Header, SettingsModal, FeedbackModal, ChatBot, BootOverlay, CrtOverlay, SplashScreen, VerifyGate, WhatsNewModal, MusicConsentBanner, BackToTop, MusicDock } from './components';
import { ControlCenter, ControlHandle } from './components/ControlHandle';
import { HelpBot } from './components/HelpBot';
import { GuestChat } from './components/GuestChat';
import { useChatOpenRequest, useChatUnread } from './lib/chat';
import { MusicMini } from './components/MusicMini';
import { openMusicDock } from './components/MusicDock';
import { YearWelcome } from './components/YearWelcome';
import { ArrivalShow } from './components/ArrivalShow';
import { setRoomEra } from './lib/roomEra';
import { announceWelcomeBack, announceYear } from './lib/robotVoice';
import { JourneyBar } from './components/JourneyBar';
import { IMPRINT_URL, PRIVACY_URL, setConsent } from './lib/privacy';
import { hasUnseenNews } from './lib/whatsNew';
import { useWarmChrome } from './lib/theme';
import { WarmTopBar } from './components/WarmChrome';
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
import { Sparte, sparteLabel } from './phases/ExplorationPhase';
import { useRetroSession } from './hooks/useRetroSession';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useSpotifyBackground } from './hooks/useSpotifyBackground';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { countOpened } from './lib/usage';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { INTEREST_TO_CATEGORY, PHASES } from './lib/session';
import { installMicroFx } from './lib/microFx';
import { downloadBlob, todayStamp, buildBookText, downscaleImage, uid } from './lib/format';
import { toggleMuted, useMuted } from './lib/mute';
import { DECADES_DB, INTEREST_LABELS } from './constants';
import { tr } from './lib/i18n';
import { treasureLines } from './lib/treasures';
import { readPage, writePage } from './lib/pageMemory';
import { findTrack, useAutoTheme, useSpotifyApi } from './lib/spotifyApi';

// Where this tab was before a reload: the open page and whether the welcome screen was passed.
const PAGE_KEY = 'retromind.page';
type OpenPage = { phase: AppPhase; splashDone: boolean };

const App: React.FC = () => {
  const reloaded = useMemo(() => readPage<OpenPage>(PAGE_KEY), []);
  const session = useRetroSession(reloaded?.phase);
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
    resetJourney, importSession, exportSession,
  } = session;

  const currentAudioDecade = manualDecade || focusDecade;
  const { playSFX } = useAudioPlayer();
  // Every tap, card and page answers with a little sound and motion (lib/microFx).
  useEffect(installMicroFx, []);
  // Which way the journey went, so the next stop slides in from the right
  // side (onwards) or the left (back), with a sweep of light across the screen.
  const stage = useRef({ phase, dir: 'onward' as 'onward' | 'back', moves: 0 });
  if (stage.current.phase !== phase) {
    stage.current = {
      phase,
      dir: PHASES.indexOf(phase) >= PHASES.indexOf(stage.current.phase) ? 'onward' : 'back',
      moves: stage.current.moves + 1,
    };
  }
  // The welcome screen sits on top of everything on each fresh visit (a reload
  // keeps the page that was open); music waits until it is gone.
  const [showSplash, setShowSplash] = useState(!reloaded?.splashDone);
  // Music starts the moment the main menu shows through the white-out, not
  // after the splash is fully gone (the browser only allows audio shortly
  // after the start button press).
  const [menuRevealed, setMenuRevealed] = useState(false);
  const birthYear = /^\d{4}/.test(user.birthDate) ? Number(user.birthDate.slice(0, 4)) : null;
  const spotify = useSpotifyBackground(currentAudioDecade, menuRevealed || !showSplash, birthYear);
  // Where the time machine has put you: the chosen decade, else your birth
  // year (the ticket's departure). Every journey bumps `travel`: the robot
  // voice says "Welcome to the year …" and YearWelcome opens its video.
  const travelYear = manualDecade ? Number(manualDecade) : birthYear;
  const [travel, setTravel] = useState(0);
  const [arrivalShow, setArrivalShow] = useState(false);
  const muted = useMuted();

  const googleAuth = useGoogleAuth();
  const spotifyAuth = useSpotifyAuth();

  const [selectedWord, setSelectedWord] = useState<
    { id: string; term: string; knowledge: string; question: string; decade: string } | null
  >(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [perspective, setPerspective] = useState<{ question: string } | null>(null);
  const [perspectiveDraft, setPerspectiveDraft] = useState('');
  const [isGeneratingPerspective, setIsGeneratingPerspective] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Gates every phase behind name + birthday. Not stored itself: it is set
  // again on each load as soon as both are known (see the effect below).
  const [verified, setVerified] = useState(false);
  // The dark room opening onto the app right after the ticket (see render).
  const [arrival, setArrival] = useState(false);
  // The open "Sparte" on the Explore stop, lifted here so the journey bar
  // can show it as a breadcrumb ("Explore › Music").
  const [exploreSparte, setExploreSparte] = useState<Sparte | null>(null);
  // Set once the person asks to change name/birthday, so the Google shortcut
  // below doesn't skip the form they just opened.
  const [profileEditRequested, setProfileEditRequested] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  // The chat corner with the other guests (components/GuestChat.tsx); chatWith opens one conversation.
  const [isGuestChatOpen, setIsGuestChatOpen] = useState(false);
  const [chatWith, setChatWith] = useState<string | null>(null);
  const chatUnread = useChatUnread(verified);
  useChatOpenRequest((id) => {
    setChatWith(id);
    setIsGuestChatOpen(true);
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [unseenNews, setUnseenNews] = useState(hasUnseenNews);
  const warm = useWarmChrome();
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

  // --- effects ---
  useEffect(() => {
    getAiAvailability().then(setAiAvailability);
  }, []);

  useEffect(() => {
    writePage(PAGE_KEY, { phase, splashDone: !showSplash } satisfies OpenPage);
  }, [phase, showSplash]);

  useEffect(() => {
    document.documentElement.style.fontSize = ['18px', '20px', '23px'][fontScale - 1] || '18px';
  }, [fontScale]);

  // A page of the album turns with every change of stop (not on load).
  const firstPhase = useRef(true);
  useEffect(() => {
    if (firstPhase.current) {
      firstPhase.current = false;
      return;
    }
    playSFX('transition');
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
  };

  const resumeJourney = () => {
    playSFX('success');
    setPhase(resumeTarget || 'exploration');
    setResumeTarget(null);
  };

  // Any station straight from the start page's "Etappen" overview.
  const openStage = (p: AppPhase) => {
    setResumeTarget(null);
    goTo(p);
  };

  const goHome = () => {
    playSFX('click');
    setResumeTarget(phase);
    setPhase('intro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  const closeFeedbackWithSfx = () => {
    playSFX('click');
    setIsFeedbackOpen(false);
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
    countOpened('zeitreise', 'decade', decade);
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
        [
          user.interests.map((i) => INTEREST_LABELS[i] ?? i).join(', ') || tr('general', 'allgemein'),
          user.favoriteArtists.length
            ? tr('favorite bands', 'Lieblingsbands') + `: ${user.favoriteArtists.join(', ')}`
            : '',
          ...treasureLines(user, 8),
        ].filter(Boolean).join('; '),
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
    setToast(tr('Memory saved', 'Erinnerung gespeichert'));
  };

  const openPerspective = async () => {
    if (!selectedWord) return;
    playSFX('click');
    setIsGeneratingPerspective(true);
    const fallback = tr(
      `Imagine a close friend, a sibling or a parent from back then had experienced ` +
        `"${selectedWord.term}" – how would that person have told the story?`,
      `Stell dir vor, eine gute Freundin, ein Geschwister oder ein Elternteil von ` +
        `damals hätte "${selectedWord.term}" erlebt – wie hätte diese Person den Moment wohl erzählt?`
    );
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
      term: `${selectedWord.term} · ${tr('A different view', 'Perspektivwechsel')}`,
      prompt: perspective.question,
      answer: perspectiveDraft.trim(),
      createdAt: Date.now(),
    });
    setToast(tr('Perspective saved', 'Perspektive gespeichert'));
  };

  // --- photo lab ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError(tr('Please choose an image file.', 'Bitte eine Bilddatei wählen.'));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError(tr('That image is too large (max. 20 MB).', 'Das Bild ist zu groß (max. 20 MB).'));
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
    setAnalysis(tr('Analyzing…', 'Analysiere…'));
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
      term: tr('My photo', 'Mein Foto'),
      prompt: tr('What the AI saw in this picture', 'Was die KI in diesem Bild gesehen hat'),
      answer: analysis,
      photo: uploadedImage,
      createdAt: Date.now(),
    });
    setAnalysisSaved(true);
    setToast(tr('Photo memory saved', 'Foto-Erinnerung gespeichert'));
  };

  const handleGenerateVideo = async () => {
    if (!uploadedImage || videoStatus.status === 'generating') return;
    playSFX('click');
    setVideoStatus({ status: 'generating', message: tr('Bringing your picture to life – this takes a few minutes.', 'Erwecke das Bild zum Leben – das dauert ein paar Minuten.') });
    const base64 = uploadedImage.split(',')[1];
    const mime = uploadedImage.split(';')[0].split(':')[1] || 'image/png';
    const result = await generateVeoVideo(
      tr(
        'A nostalgic video that gently brings this photo to life, calm movements, warm atmosphere.',
        'Ein nostalgisches Video, das dieses Foto sanft zum Leben erweckt, ruhige Bewegungen, warme Atmosphäre.'
      ),
      base64,
      mime
    );
    if (result.url) {
      setVideoStatus({
        status: 'done',
        url: result.url,
        message: tr(
          'Done – your photo is moving. This video was made by an AI (Google Veo).',
          'Fertig – dein Foto bewegt sich. Dieses Video hat eine KI erzeugt (Google Veo).'
        ),
      });
    } else {
      const msg =
        result.error === 'under_18'
          ? tr('The AI features (Google Gemini) are only for people aged 18 and over.', 'Die KI-Funktionen (Google Gemini) gibt es erst ab 18 Jahren.')
          : result.error === 'not_configured'
          ? tr('Video generation isn’t turned on in this demo.', 'Video-Generierung ist in diesem Demo nicht aktiv.')
          : result.error === 'timeout'
          ? tr('That took too long. Please try again later.', 'Die Generierung hat zu lange gedauert. Versuch es später noch einmal.')
          : tr('Video generation failed (it needs a Google project with billing enabled).', 'Die Video-Generierung ist fehlgeschlagen (benötigt ein Google-Projekt mit Billing).');
      setVideoStatus({ status: 'error', message: msg });
    }
  };

  // --- exports ---
  const exportText = () => {
    playSFX('click');
    downloadBlob(
      `retromind-${tr('memory-book', 'erinnerungsbuch')}-${todayStamp()}.txt`,
      buildBookText(user, focusDecade, memories, diaryEntry),
      'text/plain;charset=utf-8'
    );
  };
  const exportSessionFile = () => {
    playSFX('click');
    downloadBlob(`retromind-${tr('session', 'sitzung')}-${todayStamp()}.json`, JSON.stringify(exportSession(), null, 2), 'application/json');
  };
  const importSessionFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const ok = await importSession(file);
    setToast(ok ? tr('Session loaded', 'Sitzung geladen') : tr('Couldn’t read this file', 'Diese Datei konnte nicht gelesen werden'));
  };
  const printBook = () => {
    playSFX('click');
    window.print();
  };

  // --- time travel announcements (lib/robotVoice, components/YearWelcome) ---
  // A journey: leaving the welcome screen's time machine (straight in, or
  // after the ticket), and every switch of the decade. A reload of an open
  // page is no journey.
  const sawSplashRef = useRef(showSplash);
  // The start of the app says "Welcome back"; a decade switch the year.
  const startTravelRef = useRef(false);
  const landedRef = useRef(false);
  useEffect(() => {
    if (showSplash) {
      sawSplashRef.current = true;
      landedRef.current = false;
      return;
    }
    if (!verified || landedRef.current || !sawSplashRef.current) return;
    landedRef.current = true;
    startTravelRef.current = true;
    // Decided together with the journey, so the year's video already knows
    // it has to wait for the show.
    if (birthYear && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setArrivalShow(true);
    setTravel((n) => n + 1);
  }, [showSplash, verified]);
  const decadeSeenRef = useRef(manualDecade);
  useEffect(() => {
    if (decadeSeenRef.current === manualDecade) return;
    decadeSeenRef.current = manualDecade;
    if (verified) setTravel((n) => n + 1);
  }, [manualDecade, verified]);
  useEffect(() => {
    if (!travel) return;
    const atStart = startTravelRef.current;
    startTravelRef.current = false;
    if (!atStart && !travelYear) return;
    // The start gets its show (components/ArrivalShow), which speaks at its
    // lock-in; without motion, the voice alone.
    if (atStart && birthYear && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // After the gong of the arrival / while the iris opens.
    const t = window.setTimeout(() => (atStart ? announceWelcomeBack() : announceYear(travelYear!)), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travel]);
  // After the landing (once the arrival show is over) the Stube is furnished
  // in the style of the decade you're in (lib/roomEra.ts).
  useEffect(() => {
    setRoomEra(verified && !showSplash && !arrivalShow ? currentAudioDecade || null : null);
  }, [verified, showSplash, arrivalShow, currentAudioDecade]);
  // The year's video, the arrival show's hit fanfare and the Spotify music
  // don't play at the same time. Each of the two reports itself on and off;
  // the music only comes back once neither plays any more (Marco,
  // 2026-10-14: at the start the music played over the video, because the
  // end of the fanfare brought it back while the video was running).
  const pausedForVideoRef = useRef(false);
  const musicRef = useRef(spotify);
  musicRef.current = spotify;
  const [quietFor, setQuietFor] = useState<{ video: boolean; fanfare: boolean }>({ video: false, fanfare: false });
  const videoOn = quietFor.video || quietFor.fanfare;
  const handleYearVideo = useCallback((on: boolean) => setQuietFor((q) => (q.video === on ? q : { ...q, video: on })), []);
  const handleFanfare = useCallback((on: boolean) => setQuietFor((q) => (q.fanfare === on ? q : { ...q, fanfare: on })), []);
  // A moment's grace: the music comes back while the fanfare is still fading
  // out (a soft crossfade), and a closed-then-reopened video doesn't flicker it.
  useEffect(() => {
    if (videoOn || !pausedForVideoRef.current) return;
    const t = window.setTimeout(() => {
      pausedForVideoRef.current = false;
      const sp = musicRef.current;
      if (!sp.isPlaying) sp.togglePlay();
    }, 1500);
    return () => window.clearTimeout(t);
  }, [videoOn]);
  // Pause once while they play, also when the music only starts after them.
  useEffect(() => {
    if (!videoOn || !spotify.isPlaying || pausedForVideoRef.current) return;
    pausedForVideoRef.current = true;
    spotify.togglePlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoOn, spotify.isPlaying]);

  // --- verification ---
  const handleVerified = (name: string, birthDate: string) => {
    setUser((prev) => ({ ...prev, name, birthDate }));
    setVerified(true);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setArrival(true);
  };

  // Once name and birthday are known (saved on this device or from a Drive
  // backup; the name may also come from the signed-in Google account), there's no need to ask
  // again on every visit; they can be changed in the settings.
  useEffect(() => {
    if (verified || profileEditRequested) return;
    const google = googleAuth.status === 'signed_in';
    const name = (user.name || (google ? googleAuth.user?.name : '') || '').trim();
    const birthDate = user.birthDate || '';
    if (!name || !birthDate) return;
    setUser((prev) => ({ ...prev, name, birthDate }));
    setVerified(true);
    setToast(tr(`Welcome, ${name.split(' ')[0]}!`, `Willkommen, ${name.split(' ')[0]}!`));
  }, [verified, profileEditRequested, googleAuth.status, googleAuth.user, user.name, user.birthDate]);

  const handleEditProfile = () => {
    playSFX('click');
    setIsSettingsOpen(false);
    setProfileEditRequested(true);
    setVerified(false);
  };

  // --- Google account ---
  const handleGoogleSignIn = () => {
    playSFX('click');
    googleAuth.signIn();
  };
  const handleGoogleSignOut = () => {
    playSFX('click');
    googleAuth.signOut();
  };

  // --- Spotify account ---
  const handleSpotifySignIn = () => {
    playSFX('click');
    // Signing in to Spotify means wanting its music too.
    setConsent('spotify', true);
    spotifyAuth.signIn();
  };
  const handleSpotifySignOut = () => {
    playSFX('click');
    spotifyAuth.signOut();
  };

  // Music to the topic (Marco, 2026-10-07): signed in with Spotify, opening
  // a music word (a hit, a band) plays its song; closing it goes back to the
  // decade's music. Switch: "Musik zum Thema" in the player panel.
  const spotifyApi = useSpotifyApi();
  const autoTheme = useAutoTheme();
  const spotifyRef = useRef(spotify);
  spotifyRef.current = spotify;
  const themeWord = selectedWord
    ? DECADES_DB[selectedWord.decade]?.buzzwords.find((b) => b.id === selectedWord.id && b.category === 'music') ?? null
    : null;
  useEffect(() => {
    if (!themeWord || !spotifyApi || !autoTheme || !spotifyRef.current.allowed) return;
    // Something picked in the search keeps playing.
    const picked = spotifyRef.current.special;
    if (picked && !picked.auto) return;
    let live = true;
    findTrack(themeWord.song ?? themeWord.term, themeWord.song ? undefined : currentAudioDecade).then((hit) => {
      if (live && hit) spotifyRef.current.playUri(hit, true);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeWord?.id, spotifyApi, autoTheme]);
  useEffect(() => {
    if (!themeWord && spotifyRef.current.special?.auto) spotifyRef.current.backToTheme();
  }, [themeWord]);

  // --- render helpers ---
  const aiOff = aiAvailability === 'not_configured';
  const isAnswered = (id: string) => !!memoryFor(id);


  // The music controls (Marco, 2026-10-06): a panel over the lower half of
  // the screen. Since 2026-10-18 it has no button of its own any more; it
  // opens from the control panel behind the handle at the right edge.
  const decadeMusicName = spotify.youthLabel ?? tr(
    `Music of the ${Number(currentAudioDecade) >= 2000 ? currentAudioDecade : currentAudioDecade.slice(2)}s`,
    `Musik der ${Number(currentAudioDecade) >= 2000 ? currentAudioDecade : currentAudioDecade.slice(2)}er`
  );
  // Back / play / next and the song: in the bottom row between "Nach oben"
  // and the help, and at the top of the control panel (components/MusicMini).
  const musicMini = spotify.allowed
    ? (variant: 'bar' | 'float') => (
        <MusicMini
          variant={variant}
          title={spotify.songTitle}
          songUri={spotify.songUri}
          source={decadeMusicName}
          playing={spotify.isPlaying}
          ready={spotify.isReady}
          canSkip={spotify.canSkip}
          onPrev={() => { playSFX('click'); spotify.playPrevious(); }}
          onToggle={() => { playSFX('click'); spotify.togglePlay(); }}
          onNext={() => { playSFX('click'); spotify.playNext(); }}
          status={spotify.status}
        />
      )
    : null;
  const musicDock = spotify.allowed ? (
    <MusicDock
      ticker={false}
      hideKnob
      title={spotify.songTitle}
      songUri={spotify.songUri}
      source={decadeMusicName}
      playing={spotify.isPlaying}
      ready={spotify.isReady}
      canSkip={spotify.canSkip}
      onPrev={() => { playSFX('click'); spotify.playPrevious(); }}
      onToggle={() => { playSFX('click'); spotify.togglePlay(); }}
      onNext={() => { playSFX('click'); spotify.playNext(); }}
      muted={muted}
      onToggleMute={() => { playSFX('click'); toggleMuted(); }}
      onOpenChange={() => playSFX('click')}
      extras={{
        status: spotify.status,
        signedIn: spotifyApi,
        onSignIn: spotifyAuth.status === 'not_configured' ? undefined : handleSpotifySignIn,
        onSeek: spotify.seek,
        onVolume: spotify.setVolume,
        onPick: (hit) => { playSFX('click'); spotify.playUri(hit); },
        special: spotify.special,
        themeName: decadeMusicName,
        onBackToTheme: () => { playSFX('click'); spotify.backToTheme(); },
        themeHint: tr('Open a music term and its song plays.', 'Öffnest du einen Musik-Begriff, läuft sein Song.'),
      }}
    />
  ) : null;
  return (
    <div className={`rm-app min-h-screen px-4 md:px-8 max-w-6xl mx-auto text-retro-ink ${warm ? 'pt-16 pb-24' : 'pb-16'}`}>
      <BootOverlay />
      <CrtOverlay />
      <ChristmasDeco />
      {verified && !showSplash && <AmbientLife />}
      {/* All controls behind one handle at the right edge, halfway down
          (Marco, 2026-10-18); on the welcome screen too, so sound and
          language can be set before the first note. */}
      {!isSettingsOpen && !isHelpOpen && !isGuestChatOpen && (
        <ControlHandle hasNews={unseenNews} chatNews={verified && chatUnread} onOpen={() => { playSFX('click'); setIsSettingsOpen(true); }} />
      )}
      {warm && !showSplash && verified && <WarmTopBar phase={phase} />}
      {showSplash && <SplashScreen destinationDate={user.birthDate} onReveal={() => setMenuRevealed(true)} onStart={() => setShowSplash(false)} />}
      {/* Off-screen, always mounted: autoplays the era's real Spotify
          playlist in the background once the first tap/click unlocks audio
          (see useSpotifyBackground) — invisible by design, controlled from
          the player bar at the bottom centre (spotifyBar below) and the
          Settings modal (Spotify exposes no volume control we could put
          here). */}
      {/* Spotify swaps the ref'd element for its own iframe (dropping our
          classes), so the hiding sits on a wrapper around it. */}
      <div aria-hidden="true" className="spotify-host">
        <div ref={spotify.containerRef} />
      </div>
      {/* Asked on the welcome screen first; anyone who left that switch alone
          gets this card once they are through the name form, not in it. */}
      {!showSplash && verified && <MusicConsentBanner />}

      {verified && (!warm || phase === 'intro') && <Header compact={phase !== 'intro'} />}
      {/* Coming out of the time machine: the dark clock room opens from the
          middle onto the app (after "Set the clock" on the ticket). */}
      {arrival && (
        <div
          aria-hidden="true"
          className="rm-iris-dark rm-night-room rm-iris-open"
          style={{ animationDuration: '2400ms', animationTimingFunction: 'cubic-bezier(0.45, 0, 0.25, 1)' }}
          onAnimationEnd={() => setArrival(false)}
        />
      )}

      {arrivalShow && birthYear && (
        <ArrivalShow
          birthDate={user.birthDate}
          year={birthYear}
          decade={String(Math.min(2020, Math.max(1960, Math.floor(birthYear / 10) * 10)))}
          onLock={announceWelcomeBack}
          onDone={() => setArrivalShow(false)}
          memories={memories}
          onMusic={handleFanfare}
          musicPlaying={spotify.isPlaying}
        />
      )}
      {toast && (
        <div className="rm-fixed fixed top-16 left-1/2 -translate-x-1/2 z-[95] bg-retro-ink text-white px-5 py-2 font-bold text-sm shadow-lg animate-fadeIn">
          {toast}
        </div>
      )}

      {isFeedbackOpen && (
        <FeedbackModal
          onDismiss={() => setIsFeedbackOpen(false)}
          onCloseClick={closeFeedbackWithSfx}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          fontScale={fontScale}
          onFontScaleChange={(n) => { playSFX('click'); setFontScale(n); }}
          currentDecade={currentAudioDecade}
          onDecadeChange={(d) => { playSFX('click'); setManualDecade(d); }}
          isSpotifyReady={spotify.isReady}
          isSpotifyPlaying={spotify.isPlaying}
          onToggleSpotify={() => { playSFX('click'); spotify.togglePlay(); }}
          spotifyAllowed={spotify.allowed}
          onOpenWhatsNew={() => { playSFX('click'); setIsSettingsOpen(false); setIsWhatsNewOpen(true); setUnseenNews(false); }}
          onBackToWelcome={showSplash ? undefined : () => { playSFX('click'); setIsSettingsOpen(false); setMenuRevealed(false); setShowSplash(true); }}
          hasUnseenNews={unseenNews}
          userName={user.name}
          userBirthDate={user.birthDate}
          profile={user}
          onProfileChange={(patch) => setUser((prev) => ({ ...prev, ...patch }))}
          onEditProfile={showSplash || !verified ? undefined : handleEditProfile}
          googleStatus={googleAuth.status}
          googleUser={googleAuth.user}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
          spotifyStatus={spotifyAuth.status}
          spotifyUser={spotifyAuth.user}
          onSpotifySignIn={handleSpotifySignIn}
          onSpotifySignOut={handleSpotifySignOut}
          aboveSplash={showSplash}
          controls={
            <ControlCenter
              phase={verified && !showSplash ? phase : null}
              onSelectStop={(p) => {
                setIsSettingsOpen(false);
                if (p === phase) return;
                if (p === 'intro') goHome();
                else {
                  setResumeTarget(null);
                  goTo(p);
                }
              }}
              music={!showSplash && verified ? musicMini?.('float') : undefined}
              onOpenMusic={() => { playSFX('click'); setIsSettingsOpen(false); openMusicDock(); }}
              onOpenCompanion={verified && !showSplash && phase !== 'intro' ? () => { playSFX('click'); setIsSettingsOpen(false); setIsHelpOpen(false); setIsChatOpen((v) => !v); } : undefined}
              companionOpen={isChatOpen}
              onFeedback={() => { playSFX('click'); setIsSettingsOpen(false); setIsFeedbackOpen(true); }}
              onOpenGuestChat={verified ? () => { playSFX('click'); setIsSettingsOpen(false); setIsHelpOpen(false); setChatWith(null); setIsGuestChatOpen(true); } : undefined}
              guestChatNews={chatUnread}
            />
          }
          onDismiss={() => setIsSettingsOpen(false)}
          onCloseClick={closeSettingsWithSfx}
        />
      )}


      {isWhatsNewOpen && (
        <WhatsNewModal
          aboveSplash={showSplash}
          onDismiss={() => setIsWhatsNewOpen(false)}
          onCloseClick={() => { playSFX('click'); setIsWhatsNewOpen(false); }}
        />
      )}

      {!verified ? (
        <VerifyGate
          googleStatus={googleAuth.status}
          googleUser={googleAuth.user}
          initialName={user.name}
          initialBirthDate={user.birthDate}
          maxBirthDate={todayStamp()}
          onGoogleSignIn={handleGoogleSignIn}
          onVerified={handleVerified}
          revealed={menuRevealed || !showSplash}
        />
      ) : (
        <>
          {phase !== 'intro' && (
            <JourneyBar
              phase={phase}
              warm={warm}
              crumb={phase === 'exploration' && exploreSparte ? { label: sparteLabel(exploreSparte), onUp: () => { playSFX('click'); setExploreSparte(null); window.scrollTo({ top: 0, behavior: 'smooth' }); } } : undefined}
              onSelect={(p) => { if (p === 'intro') goHome(); else if (p !== phase) goTo(p); }}
            />
          )}
          {travelYear && <YearWelcome year={travelYear} travel={travel} onPlayingChange={handleYearVideo} />}
          {musicDock}
          <BackToTop warm={warm} hidden={isChatOpen} onClick={() => playSFX('click')} />
          {/* What's playing, between "Nach oben" and the "?" help (Marco, 2026-10-18). */}
          {!showSplash && musicMini && !isChatOpen && <div className="rm-bottom-music rm-fixed no-print">{musicMini('float')}</div>}
          {/* Questions about the app: the AI help at the very bottom right. */}
          <HelpBot
            app="zeitreise"
            open={isHelpOpen}
            hidden={isGuestChatOpen}
            onOpenChange={(o) => { setIsHelpOpen(o); if (o) { setIsChatOpen(false); setIsGuestChatOpen(false); } }}
            onSound={() => playSFX('click')}
          />
          {/* Writing with the other guests (Marco, 2026-10-19). */}
          <GuestChat
            app="zeitreise"
            open={isGuestChatOpen}
            openWith={chatWith}
            suggestedName={user.name}
            onClose={() => setIsGuestChatOpen(false)}
            onSound={() => playSFX('click')}
          />

          {phase !== 'intro' && (
            <>
              <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} playSFX={playSFX} disabled={aiOff} />
            </>
          )}

          {stage.current.moves > 0 && <div key={`sheen-${stage.current.moves}`} aria-hidden="true" className={`rm-stop-sheen is-${stage.current.dir}`} />}
          <div id="rm-stage" key={phase} className={`rm-stage is-${stage.current.dir}`}>
          {/* A corner of the Stube above every station (components/StationCorner.tsx). */}
          {phase !== 'intro' && <StationCorner phase={phase} warm={warm} />}

          {phase === 'intro' && (
            <IntroPhase
              resumeTarget={resumeTarget}
              memoriesCount={memories.length}
              onStart={startJourney}
              onResume={resumeJourney}
              onReset={handleResetJourney}
              focusDecade={focusDecade}
              onSelectGalleryItem={selectGalleryItem}
              diaryWritten={diaryEntry.trim().length > 0}
              onOpenStage={openStage}
              userName={user.name}
              birthYear={birthYear}
              memories={memories}
              onSaveMemory={upsertMemory}
            />
          )}

          {phase === 'onboarding' && (
            <OnboardingPhase
              user={user}
              onUserChange={setUser}
              onToggleInterest={toggleInterest}
              onSubmit={handleOnboarding}
              onBack={goHome}
            />
          )}

          {phase === 'induction' && (
            <InductionPhase
              focusDecade={focusDecade}
              birthDate={user.birthDate}
              onSelectGalleryItem={selectGalleryItem}
              onContinue={() => goTo('exploration')}
              onBack={() => goTo('onboarding')}
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
              sparte={exploreSparte}
              onSparteChange={setExploreSparte}
              onPlaySong={spotify.allowed ? (hit) => { playSFX('click'); spotify.playUri(hit); } : undefined}
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
          </div>
          {phase === 'intro' && <RetroTicker warm={warm} focusDecade={focusDecade} />}

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

        </>
      )}
      <footer className="no-print relative z-10 mt-12 text-center text-xs text-retro-tan">
        {warm && <p className="text-sm text-retro-brown mb-2">{tr('Made with ♥ for everyone who loves to look back', 'Mit ♥ gemacht für alle, die gern zurückdenken')}</p>}
        <a href={PRIVACY_URL} className="underline">{tr('Privacy', 'Datenschutz')}</a>
        {' · '}
        <a href={IMPRINT_URL} className="underline">{tr('Legal notice', 'Impressum')}</a>
      </footer>
    </div>
  );
};

export default App;
