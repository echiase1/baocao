        // Auto-generated Offline-First Service Worker by HTML to PWA Converter
        const CACHE_NAME = 'pwa-offline-v508145';
        const PRECACHE_ASSETS = [
            "./index.html",
"./offline.html",
"./manifest.json",
"./pwa-install.js",
"./icons/icon-192.png",
"./icons/icon-512.png"
        ];

        // 1. Install Event - Pre-cache Static Local Assets
        self.addEventListener('install', event => {
            self.skipWaiting();
            event.waitUntil(
                caches.open(CACHE_NAME).then(cache => {
                    console.log('[ServiceWorker] Pre-caching static assets');
                    return Promise.allSettled(
                        PRECACHE_ASSETS.map(url => {
                            return cache.add(url).catch(err => console.warn('[ServiceWorker] Skipping non-critical asset:', url, err));
                        })
                    );
                })
            );
        });

        // 2. Activate Event - Claim Clients & Delete Old Caches
        self.addEventListener('activate', event => {
          event.waitUntil(
            caches.keys().then(keys => {
              return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => {
                  console.log('[ServiceWorker] Cleaning old cache:', key);
                  return caches.delete(key);
                })
              );
            }).then(() => self.clients.claim())
          );
        });

        // 3. Fetch Event - Robust Offline-First with Navigation Fallback & CDN Support
        self.addEventListener('fetch', event => {
          if (event.request.method !== 'GET') return;

          // A. Navigation Requests (HTML Page Loading / Refresh)
          if (event.request.mode === 'navigate') {
            event.respondWith(
              fetch(event.request)
                .then(networkResponse => {
                  if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                  }
                  return networkResponse;
                })
                .catch(() => {
                  console.log('[ServiceWorker] Offline navigation fallback');
                  return caches.match(event.request)
                    || caches.match('./index.html')
                    || caches.match('./offline.html');
                })
            );
            return;
          }

          // B. Static Resources & CDN Assets (Cache-First with Network Fallback)
          event.respondWith(
            caches.match(event.request).then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }

              return fetch(event.request).then(networkResponse => {
                // Support caching 200 OK and CORS opaque responses (CDNs)
                if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
                  return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                return networkResponse;
              }).catch(err => {
                console.warn('[ServiceWorker] Fetch failed offline for:', event.request.url);
                if (event.request.destination === 'image') {
                  return caches.match('./icons/icon-192.png');
                }
                return new Response('Offline resource unavailable', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({ 'Content-Type': 'text/plain' })
                });
              });
            })
          );
        });