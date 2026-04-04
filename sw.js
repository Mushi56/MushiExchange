// ════════════════════════════════════════════════════════════
// MushiEx Service Worker — Offline Support
// ════════════════════════════════════════════════════════════
const CACHE_NAME = 'mushiex-v1';

// All files needed for the app to work offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './logo.png',
  './manifest.json',
  './icons/icon-earth.png',
  './icons/icon-moneybag.png',
  './icons/icon-money.png',
  './icons/icon-save.png',
  './icons/icon-receipt.png',
  './icons/icon-delete.png',
  './icons/icon-report.png',
  './icons/icon-averages.png',
  './icons/icon-exchangesettings.png',
  './icons/icon-businessinfo.png',
  './icons/icon-install.png',
  './icons/icon-datacard.png',
  './icons/icon-exchange.png',
  './icons/icon-history.png',
  './icons/icon-summary.png',
  './icons/icon-settings.png',
  './icons/icon-swap.png',
  './icons/icon-refresh.png',
  './icons/icon-search.png',
  './icons/icon-warning.png',
  './icons/icon-stay.png',
  './icons/icon-closeapp.png',
  './icons/icon-empty.png',
  './icons/icon-customers.png',
  './icons/icon-phone.png',
  './icons/icon-ratesettings.png',
  './icons/icon-updaterate.png',
  './icons/icon-txndetail.png',
];

// ── INSTALL: cache all app assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can; don't fail if one icon is missing
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(() => null))
      );
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: remove old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: Cache-first strategy ──
// Serve from cache, fall back to network, then cache the result
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests (Google Fonts, CDN, etc.)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Not in cache — fetch from network and store
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => {
        // Network failed and no cache — return offline fallback for HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
