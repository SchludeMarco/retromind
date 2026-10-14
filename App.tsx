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
import { Header, SettingsModal, FeedbackModal, AccountControls, ChatBot, BootOverlay, CrtOverlay, SplashScreen, VerifyGate, MuteToggle, WhatsNewModal, MusicConsentBanner, BackToTop, MusicDock } from './components';
import { MusicMini } from './components/MusicMini';
import { YearWelcome } from './components/YearWelcome';
import { announceWelcomeBack, announceYear } from './lib/robotVoice';
import { JourneyBar } from './components/JourneyBar';
import { IMPRINT_URL, PRIVACY_URL, setConsent } from './lib/privacy';
import { hasUnseenNews } from './lib/whatsNew';
import { useWarmChrome } from './lib/theme';
import { WarmTopBar, WarmBottomNav, Icon, NewBadge } from './components/WarmChrome';
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
import { loadSessionFromDrive, saveSessionToDrive } from './services/googleDriveService';
import { INTEREST_TO_CATEGORY } from './lib/session';
import { downloadBlob, todayStamp, buildBookText, downscaleImage, uid } from './lib/format';
import { toggleMuted, useMuted } from './lib/mute';
import { DECADES_DB, INTEREST_LABELS } from './constants';
import { tr } from './lib/i18n';
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
    resetJourney, importSession, exportSession, loadRemoteState, hasProgress,
  } = session;

  const currentAudioDecade = manualDecade || focusDecade;
  const { sfxRef, playSFX } = useAudioPlayer();
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
  const muted = useMuted();

  const googleAuth = useGoogleAuth();
  const spotifyAuth = useSpotifyAuth();
  const [driveSyncState, setDriveSyncState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const remoteLoadAttempted = useRef(false);
  // True once the Drive copy has been read (or found missing). Saving waits
  // for it, so a fresh device can't overwrite the backup before reading it.
  const [remoteChecked, setRemoteChecked] = useState(false);

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [unseenNews, setUnseenNews] = useState(hasUnseenNews);
  const [showBottomControls, setShowBottomControls] = useState(false);
  const warm = useWarmChrome();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
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

  // The account controls (and the classic music knob) stay out of the way while reading —
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
          setToast(tr('Loaded your saved journey from Google Drive', 'Gespeicherte Reise aus Google Drive geladen'));
        } else {
          // The local journey wins, but profile fields still empty here
          // (birthday, gender, …) are taken from the backup.
          const r = remote.user;
          if (r) {
            setUser((prev) => ({
              ...prev,
              name: prev.name || r.name || '',
              birthDate: prev.birthDate || r.birthDate || '',
              gender: prev.gender || r.gender || '',
              interests: prev.interests.length ? prev.interests : r.interests ?? [],
              favoriteArtists: prev.favoriteArtists.length ? prev.favoriteArtists : r.favoriteArtists ?? [],
            }));
          }
          setToast(tr('Your journey is now also backed up to Google Drive', 'Deine Reise wird jetzt zusätzlich in Google Drive gesichert'));
        }
      } catch {
        setDriveSyncState('error');
      } finally {
        setRemoteChecked(true);
      }
    })();
    // hasProgress / loadRemoteState are stable enough for this one-shot check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleAuth.status]);

  // Debounced push of the current session to Drive while signed in.
  useEffect(() => {
    if (googleAuth.status !== 'signed_in' || !remoteChecked) return;
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
  }, [googleAuth.status, remoteChecked, phase, user, memories, diaryEntry, clickedBuzzwords, manualDecade, fontScale]);

  useEffect(() => {
    writePage(PAGE_KEY, { phase, splashDone: !showSplash } satisfies OpenPage);
  }, [phase, showSplash]);

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
        user.interests.map((i) => INTEREST_LABELS[i] ?? i).join(', ') || tr('general', 'allgemein'),
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
      setVideoStatus({ status: 'done', url: result.url, message: tr('Done – your photo is moving.', 'Fertig – dein Foto bewegt sich.') });
    } else {
      const msg =
        result.error === 'not_configured'
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
    // After the gong of the arrival / while the iris opens.
    const t = window.setTimeout(() => (atStart ? announceWelcomeBack() : announceYear(travelYear!)), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travel]);
  // The year's video and the Spotify music don't play at the same time.
  const pausedForVideoRef = useRef(false);
  const musicRef = useRef(spotify);
  musicRef.current = spotify;
  const [videoOn, setVideoOn] = useState(false);
  const handleYearVideo = useCallback((on: boolean) => {
    setVideoOn(on);
    if (on) return;
    const sp = musicRef.current;
    if (pausedForVideoRef.current) {
      pausedForVideoRef.current = false;
      if (!sp.isPlaying) sp.togglePlay();
    }
  }, []);
  // Pause once per video, also when the music only starts after it.
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

  // Once name and birthday are known (saved on this device, from a Drive
  // backup or from the signed-in Google account), there's no need to ask
  // again on every visit; they can be changed in the settings.
  useEffect(() => {
    if (verified || profileEditRequested) return;
    const google = googleAuth.status === 'signed_in';
    const name = (user.name || (google ? googleAuth.user?.name : '') || '').trim();
    const birthDate = user.birthDate || (google ? googleAuth.birthdayHint : '') || '';
    if (!name || !birthDate) return;
    setUser((prev) => ({ ...prev, name, birthDate }));
    setVerified(true);
    setToast(tr(`Welcome, ${name.split(' ')[0]}!`, `Willkommen, ${name.split(' ')[0]}!`));
  }, [verified, profileEditRequested, googleAuth.status, googleAuth.user, googleAuth.birthdayHint, user.name, user.birthDate]);

  // Gender shared on the Google account fills an empty "Geschlecht" field.
  useEffect(() => {
    if (googleAuth.status !== 'signed_in' || !googleAuth.genderHint || user.gender) return;
    setUser((prev) => (prev.gender ? prev : { ...prev, gender: googleAuth.genderHint! }));
  }, [googleAuth.status, googleAuth.genderHint, user.gender]);

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
    remoteLoadAttempted.current = false;
    setRemoteChecked(false);
    setDriveSyncState('idle');
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


  // The music controls (Marco, 2026-10-06): a small black-blue metal button
  // at the bottom centre that opens them as a panel over the lower half of
  // the screen. Retro Warm: in the middle of the bottom navigation; the other
  // designs: in the bottom row left of the settings button, and like it only
  // once the page is scrolled to the bottom (index.css .rm-music-knob).
  const decadeMusicName = spotify.youthLabel ?? tr(
    `Music of the ${Number(currentAudioDecade) >= 2000 ? currentAudioDecade : currentAudioDecade.slice(2)}s`,
    `Musik der ${Number(currentAudioDecade) >= 2000 ? currentAudioDecade : currentAudioDecade.slice(2)}er`
  );
  // Back / play / next and the song, top left (components/MusicMini).
  const musicMini = spotify.allowed
    ? (variant: 'bar' | 'float') => (
        <MusicMini
          variant={variant}
          title={spotify.songTitle}
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
      className={
        warm
          ? ''
          : `rm-music-knob rm-fixed transition-opacity duration-300 ${showBottomControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
      }
      title={spotify.songTitle}
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
    <div className={`min-h-screen px-4 md:px-8 max-w-6xl mx-auto text-retro-ink ${warm ? 'pt-16 pb-36' : 'pb-24'}`}>
      <BootOverlay />
      <CrtOverlay />
      {(!warm || showSplash || !verified) && <MuteToggle besideSettings />}
      {(!warm || showSplash || !verified) && (
        // Always in the top-right corner: on the welcome screen in every
        // design, and in Classic and Night Shift also while scrolling and
        // before the name form is filled in (Retro Warm has it in its top bar).
        <button
          onClick={() => { playSFX('click'); setIsSettingsOpen(true); }}
          aria-label={unseenNews
            ? tr('Open app settings (new: What’s new)', 'App-Einstellungen öffnen (neu: Was ist neu)')
            : tr('Open app settings', 'App-Einstellungen öffnen')}
          title={unseenNews ? tr('New in RetroMind: see “What’s new” in the settings', 'Neu in RetroMind: siehe „Was ist neu“ in den Einstellungen') : undefined}
          className="rm-fixed fixed top-3 right-4 md:right-10 z-[1000] w-10 h-10 rounded-full bg-retro-cream border-2 border-retro-ink retro-button flex items-center justify-center text-base"
        >
          ⚙️
          {unseenNews && <NewBadge />}
        </button>
      )}
      {!warm && !showSplash && verified && musicMini && <div className="rm-fixed fixed top-3 left-4 z-[1000] rm-music-mini-corner">{musicMini('float')}</div>}
      {warm && !showSplash && verified && (
        <WarmTopBar
          phase={phase}
          showAccount={verified}
          hasUnseenNews={unseenNews}
          accountOpen={isAccountOpen}
          onOpenSettings={() => { playSFX('click'); setIsSettingsOpen(true); }}
          music={musicMini?.('bar')}
          onToggleAccount={() => { playSFX('click'); setIsAccountOpen((v) => !v); }}
        />
      )}
      {showSplash && <SplashScreen onReveal={() => setMenuRevealed(true)} onStart={() => setShowSplash(false)} />}
      <audio ref={sfxRef} />
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
          birthdayHint={googleAuth.birthdayHint}
          initialName={user.name}
          initialBirthDate={user.birthDate}
          maxBirthDate={todayStamp()}
          onGoogleSignIn={handleGoogleSignIn}
          onVerified={handleVerified}
          revealed={menuRevealed || !showSplash}
        />
      ) : (
        <>
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
            onFeedback={() => { playSFX('click'); setIsFeedbackOpen(true); }}
            visible={warm ? isAccountOpen : showBottomControls}
            raised={warm}
          />

          {warm && (
            <WarmBottomNav
              phase={phase}
              center={musicDock}
              onNavigate={(target) => {
                if (target === 'intro') {
                  if (phase !== 'intro') goHome();
                } else if (target !== phase) {
                  setResumeTarget(null);
                  goTo(target);
                }
              }}
            />
          )}
          {phase !== 'intro' && (
            <JourneyBar
              phase={phase}
              warm={warm}
              crumb={phase === 'exploration' && exploreSparte ? { label: sparteLabel(exploreSparte), onUp: () => { playSFX('click'); setExploreSparte(null); window.scrollTo({ top: 0, behavior: 'smooth' }); } } : undefined}
              onSelect={(p) => { if (p === 'intro') goHome(); else if (p !== phase) goTo(p); }}
            />
          )}
          {travelYear && <YearWelcome year={travelYear} travel={travel} onPlayingChange={handleYearVideo} />}
          {!warm && musicDock}
          <BackToTop warm={warm} hidden={isChatOpen || (warm && isAccountOpen)} onClick={() => playSFX('click')} />

          {phase !== 'intro' && (
            <>
              {!warm && (
              <button
                onClick={goHome}
                aria-label={tr('Back to the home screen', 'Zum Startbildschirm zurückkehren')}
                className="rm-fixed fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-14 h-14 bg-retro-ink text-white rounded-full retro-button flex items-center justify-center text-2xl shadow-lg"
              >
                🏠
              </button>
              )}
              <button
                onClick={() => { playSFX('click'); setIsChatOpen((v) => !v); }}
                aria-label={isChatOpen ? tr('Close companion', 'Begleiter schließen') : tr('Open companion', 'Begleiter öffnen')}
                className="rm-chat-button rm-fixed fixed bottom-20 left-4 md:left-10 z-50 w-14 h-14 bg-retro-ink text-white rounded-full retro-button flex items-center justify-center text-2xl shadow-lg"
              >
                {warm ? <Icon name={isChatOpen ? 'close' : 'chat'} /> : isChatOpen ? '✕' : '💬'}
              </button>
              <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} playSFX={playSFX} disabled={aiOff} />
            </>
          )}

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
            />
          )}
          {phase === 'intro' && <RetroTicker warm={warm} focusDecade={focusDecade} />}

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
