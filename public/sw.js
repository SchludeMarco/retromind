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

// Push messages (lib/push.ts, api/_push.js): rival alerts (someone passed
// you on a high score table; a tap opens the arcade, which shows who it was)
// and chat messages (a tap opens that conversation, ?chat=<id>, lib/chat.ts).
self.addEventListener('push', (e) => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch {
    /* not ours */
  }
  if (!data.title) return;
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag,
      icon: '/gaming/icon-192.png',
      badge: '/gaming/favicon-48.png',
      data: { url: self.registration.scope, chat: typeof data.chat === 'string' ? data.chat : null },
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || self.registration.scope;
  const chat = e.notification.data?.chat;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => c.url.startsWith(url));
      if (open) {
        if (chat) open.postMessage({ type: 'rm-chat', chat });
        return open.focus();
      }
      return self.clients.openWindow(chat ? `${url}?chat=${encodeURIComponent(chat)}` : url);
    })
  );
});
