export type AppPhase =
  | 'intro'
  | 'onboarding'
  | 'induction'
  | 'exploration'
  | 'diary'
  | 'book'
  | 'finish';

export interface UserProfile {
  name: string;
  gender: string;
  birthDate: string;
  interests: string[];
}

export type BuzzwordCategory = 'music' | 'tech' | 'toy' | 'lifestyle' | 'food';

export interface Buzzword {
  id: string;
  term: string;
  category: BuzzwordCategory;
  knowledge: string;
  question: string;
}

export interface GalleryItem {
  /** stable id / seed */
  keyword: string;
  /** human-readable German heading */
  title: string;
  description: string;
  /** optional real public-domain image; falls back to a typographic card */
  image?: string;
  /** attribution shown under a real image */
  credit?: string;
}

export interface DecadeData {
  title: string;
  audioLabel: string;
  galleryItems: GalleryItem[];
  buzzwords: Buzzword[];
  /** Spotify playlist id for real chart hits of this decade (optional, opt-in embed). */
  spotifyPlaylistId?: string;
}

export interface ContentDatabase {
  [key: string]: DecadeData;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type VideoStage = 'idle' | 'generating' | 'done' | 'error';

export interface VideoStatus {
  status: VideoStage;
  url?: string;
  message?: string;
}

/** A memory the user actually captured during the journey. */
export interface CapturedMemory {
  id: string;
  kind: 'buzzword' | 'photo' | 'note' | 'perspective';
  decade: string;
  term: string;
  prompt: string;
  answer: string;
  /** downscaled data URL, only for photo memories */
  photo?: string;
  createdAt: number;
}

/** Minimal profile returned by Google after sign-in. */
export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

/** Everything that is persisted / exported for one journey. */
export interface SessionState {
  version: 2;
  phase: AppPhase;
  user: UserProfile;
  diaryEntry: string;
  memories: CapturedMemory[];
  clickedBuzzwords: string[];
  manualDecade: string | null;
  fontScale: number;
  updatedAt: number;
}
