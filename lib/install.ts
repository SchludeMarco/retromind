import { useEffect, useState } from 'react';
import { tr } from './i18n';

// Installing RetroMind as an app (Marco, 2026-10-18: "das Installieren der
// App auf einem Android einfacher machen"). Chrome on Android hands over an
// install prompt (beforeinstallprompt) that a button can trigger; it often
// fires before React is up, so this module catches it as soon as it is
// imported (index.tsx and gaming/main.tsx import it first). Where there is no
// prompt (iPhone, Firefox, or Chrome deciding not to offer one yet), the
// steps for the browser's own menu are shown instead.

let deferred: any = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

function runsInstalled(): boolean {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  } catch {
    return false;
  }
}

if (typeof window !== 'undefined') {
  installed = runsInstalled();
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    notify();
  });
}

export type InstallPlatform = 'android' | 'ios' | 'desktop';

export function installPlatform(): InstallPlatform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return /Android/i.test(ua) ? 'android' : 'desktop';
}

/** Opens the browser's own install dialog; false when it has none to offer. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const e = deferred;
  deferred = null;
  notify();
  e.prompt();
  const choice = await e.userChoice.catch(() => null);
  return choice?.outcome === 'accepted';
}

export function useInstall() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return { canPrompt: !!deferred, installed, platform: installPlatform() };
}

/** What to tap when the browser offers no install button of its own. */
export function installSteps(platform: InstallPlatform): string[] {
  if (platform === 'ios') {
    return [
      tr('Open this page in Safari.', 'Öffne diese Seite in Safari.'),
      tr('Tap the Share button (the square with the arrow) at the bottom.', 'Tippe unten auf „Teilen“ (das Quadrat mit dem Pfeil).'),
      tr('Choose “Add to Home Screen”, then “Add”.', 'Wähle „Zum Home-Bildschirm“ und dann „Hinzufügen“.'),
    ];
  }
  if (platform === 'android') {
    return [
      tr('Open this page in Chrome.', 'Öffne diese Seite in Chrome.'),
      tr('Tap the three dots ⋮ at the top right.', 'Tippe oben rechts auf die drei Punkte ⋮.'),
      tr('Choose “Install app” (or “Add to Home screen”), then “Install”.', 'Wähle „App installieren“ (oder „Zum Startbildschirm hinzufügen“) und dann „Installieren“.'),
    ];
  }
  return [
    tr('In Chrome or Edge, click the install icon at the right end of the address bar.', 'Klicke in Chrome oder Edge rechts in der Adresszeile auf das Installieren-Symbol.'),
    tr('Or open the browser menu and choose “Install RetroMind”.', 'Oder öffne das Browser-Menü und wähle „RetroMind installieren“.'),
  ];
}
