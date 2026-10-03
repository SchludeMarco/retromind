import React from 'react';
import ReactDOM from 'react-dom/client';
import { GamingApp } from './GamingApp';
// Fonts are bundled with the app (no request to Google Fonts, DSGVO).
import '@fontsource/press-start-2p/latin-400.css';
import '@fontsource/vt323/latin-400.css';
import './gaming.css';

const root = document.getElementById('root');
if (!root) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <GamingApp />
  </React.StrictMode>
);

// Installable as its own app (see public/gaming/manifest.webmanifest).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/gaming/sw.js', { scope: '/gaming/' }).catch(() => {});
  });
}
