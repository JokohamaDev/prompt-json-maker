// Cache version - increment this number when updating assets to force cache refresh
const CACHE_VERSION = '1.5.0';
const CACHE = `prompt-maker-v${CACHE_VERSION}`;
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/data.js',
  '/js/generator.js',
  '/js/app.js',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Stale-while-revalidate strategy
  e.respondWith(
    caches.match(e.request).then((cached) => {
      // Serve from cache immediately if available
      const fetchPromise = fetch(e.request).then((response) => {
        // Update cache with fresh response
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, responseClone));
        }
        return response;
      });
      // Return cached version immediately, or wait for network if no cache
      return cached || fetchPromise;
    })
  );
});
