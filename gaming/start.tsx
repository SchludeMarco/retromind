import React from 'react';
import ReactDOM from 'react-dom/client';
import { GamingApp } from './GamingApp';
// Fonts are bundled with the app (no request to Google Fonts, DSGVO).
import '@fontsource/press-start-2p/latin-400.css';
import '@fontsource/vt323/latin-400.css';
// Design "Modul" (Google Stitch): Space Grotesk headings, Plus Jakarta Sans text.
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import './gaming.css';
// The color tint from blue to orange, shared with the Zeitreise (settings).
import '../lib/colorTint';
import { countAppStart } from '../lib/usage';

const root = document.getElementById('root');
if (!root) throw new Error('Could not find root element to mount to');

countAppStart('gaming');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <GamingApp />
  </React.StrictMode>
);

// Installable as its own app (see public/gaming/manifest.webmanifest). On its
// own domain the Gaming edition lives at the root, so the root worker
// (public/sw.js) and manifest (scripts/edition.mjs) take over there.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // This module loads after the sync (main.tsx), often after "load" already fired.
  const register = () => {
    const inFolder = location.pathname.startsWith('/gaming');
    navigator.serviceWorker
      .register(inFolder ? '/gaming/sw.js' : '/sw.js', { scope: inFolder ? '/gaming/' : '/' })
      .catch(() => {});
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register);
}
