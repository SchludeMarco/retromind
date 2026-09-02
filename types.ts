
export type AppPhase = 'intro' | 'onboarding' | 'induction' | 'exploration' | 'diary' | 'finish';

export interface UserProfile {
  name: string;
  gender: string;
  birthDate: string;
  interests: string[];
}

export interface Buzzword {
  id: string;
  term: string;
  category: 'music' | 'tech' | 'toy' | 'lifestyle' | 'food';
  knowledge: string;
  question: string;
}

export interface GalleryItem {
  keyword: string;
  description: string;
}

export interface DecadeData {
  title: string;
  audioUrl: string;
  audioLabel: string;
  galleryItems: GalleryItem[];
  buzzwords: Buzzword[];
}

export interface ContentDatabase {
  [key: string]: DecadeData;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface VideoStatus {
  status: 'idle' | 'generating' | 'done' | 'error';
  url?: string;
  message?: string;
}
