import { ChatMessage } from '../../types';
import { LANG, tr } from '../../lib/i18n';

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
    body: JSON.stringify({ action, payload, lang: LANG }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 503 || res.status === 404) throw new AiUnavailableError(data?.message || tr('AI not available', 'KI nicht verfügbar'));
  if (!res.ok) throw new Error(data?.message || tr(`API error ${res.status}`, `API-Fehler ${res.status}`));
  return data;
}

export async function fetchGameGuide(game: { title: string; platform: string; year: number }): Promise<GameGuide> {
  const data = await call('gameGuide', game);
  return { text: data.text || '', sources: data.sources || [], searchWidget: data.searchWidget };
}

/** Old magazine scores, where to play it today, passwords: from the web. */
export async function fetchGamePress(game: { title: string; platform: string; year: number }): Promise<GameGuide> {
  const data = await call('gamePress', game);
  return { text: data.text || '', sources: data.sources || [], searchWidget: data.searchWidget };
}

export async function sendGuruMessage(history: ChatMessage[]): Promise<string> {
  const { text } = await call('chat', { history, persona: 'gaming' });
  return text || '';
}
