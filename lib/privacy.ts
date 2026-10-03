import { useSyncExternalStore } from 'react';

// Privacy helpers shared by every RetroMind module.
//
// 1) viaProxy(): images, sounds and Wikipedia answers from other servers are
//    fetched through /api/proxy, so the visitor's browser (and IP address)
//    never talks to those servers directly.
// 2) Consent for embedded services that set their own cookies (Spotify
//    music, YouTube videos): nothing from them loads before the visitor
//    agrees. The choice is kept in localStorage per origin and can be changed
//    in the settings at any time.

/** Routes a third-party URL through our own server. */
export function viaProxy(url: string | undefined): string {
  if (!url || !/^https?:\/\//.test(url)) return url ?? '';
  return `/api/proxy?u=${encodeURIComponent(url)}`;
}

export type ExternalService = 'spotify' | 'youtube';
type Choices = Partial<Record<ExternalService, boolean>>;

const KEY = 'retromind.consent';
const listeners = new Set<() => void>();
let choices: Choices = read();

function read(): Choices {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

const emit = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    choices = read();
    emit();
  });
}

/** true = allowed, false = declined, undefined = not asked yet. */
export function getConsent(service: ExternalService): boolean | undefined {
  return choices[service];
}

export function setConsent(service: ExternalService, allowed: boolean) {
  choices = { ...choices, [service]: allowed };
  try {
    localStorage.setItem(KEY, JSON.stringify(choices));
  } catch {
    /* storage unavailable — still applies for this visit */
  }
  emit();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** React binding: re-renders when the choice for this service changes. */
export function useConsent(service: ExternalService): boolean | undefined {
  return useSyncExternalStore(subscribe, () => choices[service], () => undefined);
}

/** Links to the legal pages (static files in public/, same on both domains). */
export const PRIVACY_URL = '/datenschutz.html';
export const IMPRINT_URL = '/impressum.html';
