const CACHE_NAME = 'r8-store-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon-512.jpg',
  '/manifest.json'
];

// Install Event - Pre-cache essential static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Dynamic caching with specific exclusions
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // EXCLUSIONS: Do NOT cache API endpoints, checkout pages, or admin login paths
  const shouldExclude = 
    url.pathname.includes('/api/') || 
    url.pathname.includes('/checkout') || 
    url.pathname.includes('/admin/login') ||
    url.pathname.includes('/login') ||
    event.request.method !== 'GET';

  if (shouldExclude) {
    // Network-only strategy for excluded endpoints
    event.respondWith(fetch(event.request));
    return;
  }

  // Network First, Falling Back to Cache strategy for main app shell
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If valid response, clone and cache it
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network is unavailable
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If a navigation request fails (e.g. refreshing index.html offline)
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
