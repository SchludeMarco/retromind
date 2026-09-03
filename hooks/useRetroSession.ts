import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppPhase, CapturedMemory, SessionState, UserProfile } from '../types';
import { EMPTY_USER, PHASES, clearSession, loadSession, persistSession } from '../lib/session';
import { computeFocusDecade } from '../lib/format';

// Bundles the whole journey — profile, captured memories, diary, UI prefs —
// together with its localStorage persistence so App.tsx doesn't have to.
export function useRetroSession() {
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

  const focusDecade = useMemo(() => computeFocusDecade(user.birthDate), [user.birthDate]);

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

  const memoryFor = useCallback(
    (id: string) => memories.find((m) => m.kind === 'buzzword' && m.id === `bw-${id}`),
    [memories]
  );

  const upsertMemory = useCallback((mem: CapturedMemory) => {
    setMemories((prev) => {
      const idx = prev.findIndex((m) => m.id === mem.id);
      if (idx === -1) return [...prev, mem];
      const copy = [...prev];
      copy[idx] = mem;
      return copy;
    });
  }, []);

  const resetJourney = useCallback(() => {
    clearSession();
    setResumeTarget(null);
    setUser(EMPTY_USER);
    setMemories([]);
    setDiaryEntry('');
    setClickedBuzzwords([]);
    setManualDecade(null);
    setPhase('intro');
  }, []);

  const importSession = useCallback(async (file: File): Promise<boolean> => {
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
      return true;
    } catch {
      return false;
    }
  }, []);

  const exportSession = useCallback((): SessionState => ({
    version: 2,
    phase,
    user,
    diaryEntry,
    memories,
    clickedBuzzwords,
    manualDecade,
    fontScale,
    updatedAt: Date.now(),
  }), [phase, user, diaryEntry, memories, clickedBuzzwords, manualDecade, fontScale]);

  return {
    phase, setPhase,
    resumeTarget, setResumeTarget,
    user, setUser,
    memories, setMemories, memoryFor, upsertMemory,
    diaryEntry, setDiaryEntry,
    clickedBuzzwords, setClickedBuzzwords,
    manualDecade, setManualDecade,
    fontScale, setFontScale,
    focusDecade,
    resetJourney, importSession, exportSession,
  };
}

export type RetroSession = ReturnType<typeof useRetroSession>;
