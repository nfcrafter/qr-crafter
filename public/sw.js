const CACHE_NAME = 'nfcrafter-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.png',
  '/favicon.svg'
];

// Install Event - cache initial app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching initial shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - dynamic caching with Network-First strategy & offline bypass
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and HTTP/HTTPS schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // 1. Safari Offline Bypass: If navigator says offline, go straight to cache
  if (event.defaultPrevented || !navigator.onLine) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // SPA Fallback for route navigation when offline
        if (event.request.mode === 'navigate') {
          return caches.match('/') || caches.match('/index.html');
        }
      })
    );
    return;
  }

  // 2. Online: Network-first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If the request was successful, copy it to the cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails unexpectedly, look in the cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // SPA Routing Fallback: serve /index.html when navigating offline
          if (event.request.mode === 'navigate') {
            return caches.match('/') || caches.match('/index.html');
          }
        });
      })
  );
});
