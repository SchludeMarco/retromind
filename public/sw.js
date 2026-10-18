// Service worker for the installable RetroMind app at the root of its domain
// (the Zeitreise, or the Gaming edition on its own domain, where
// scripts/edition.mjs swaps in the Gaming manifest). Network first, so every
// deploy shows up immediately; the last good copy of each page/asset is kept
// so the app shell still opens offline.
const CACHE = 'rm-app-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && !k.startsWith('rm-gaming')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // Only same-origin GETs; AI calls, Wikipedia and the Gaming path (own worker) go straight to the network.
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/gaming/')) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && !res.redirected) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
  );
});
