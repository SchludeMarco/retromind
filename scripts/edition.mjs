// Post-build step for Vercel. The `retromind-gaming` project sets
// RETROMIND_EDITION=gaming, so its deployment serves the Gaming edition at
// the root of its own domain. /gaming/ keeps working there too, and the main
// `retromind` project (no variable set) is left untouched.
//
// To be installable from the root (Android only offers "Install app" when the
// page lies inside the manifest's scope), the root gets the Gaming manifest
// with scope "/" in place of the Zeitreise one, and the page links to it. The
// root service worker (public/sw.js) works for either edition.
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';

if (process.env.RETROMIND_EDITION === 'gaming') {
  const page = readFileSync('dist/gaming/index.html', 'utf8').replace(
    'href="/gaming/manifest.webmanifest"',
    'href="/manifest.webmanifest"'
  );
  writeFileSync('dist/index.html', page);
  const manifest = JSON.parse(readFileSync('dist/gaming/manifest.webmanifest', 'utf8'));
  writeFileSync('dist/manifest.webmanifest', JSON.stringify({ ...manifest, id: '/', start_url: '/', scope: '/' }, null, 2));
  copyFileSync('dist/gaming/apple-touch-icon.png', 'dist/apple-touch-icon.png');
  console.log('RetroMind edition: gaming → serving gaming/index.html and its manifest at /');
}
