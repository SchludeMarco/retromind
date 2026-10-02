import { ChatMessage } from '../../types';

// Gaming-specific calls to the shared /api/gemini proxy. The key stays on
// the server; without it these calls fail soft and the UI says so.

export interface GuideSource {
  uri: string;
  title: string;
}

export interface GameGuide {
  text: string;
  sources: GuideSource[];
  /** Google's required "search suggestions" chip (HTML), when grounding was used. */
  searchWidget?: string;
}

export class AiUnavailableError extends Error {}

async function call(action: string, payload: unknown): Promise<any> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 503 || res.status === 404) throw new AiUnavailableError(data?.message || 'KI nicht verfügbar');
  if (!res.ok) throw new Error(data?.message || `API-Fehler ${res.status}`);
  return data;
}

export async function fetchGameGuide(game: { title: string; platform: string; year: number }): Promise<GameGuide> {
  const data = await call('gameGuide', game);
  return { text: data.text || '', sources: data.sources || [], searchWidget: data.searchWidget };
}

export async function sendGuruMessage(history: ChatMessage[]): Promise<string> {
  const { text } = await call('chat', { history, persona: 'gaming' });
  return text || '';
}
