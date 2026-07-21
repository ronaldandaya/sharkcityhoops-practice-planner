var CACHE_NAME = 'sch-planner-v6';
var ASSETS = [
  './',
  './index.html',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Don't cache html2canvas CDN - always fetch from network
  if (e.request.url.indexOf('cdnjs.cloudflare.com') > -1) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(resp) {
      return resp || fetch(e.request).then(function(r) {
        return caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, r.clone());
          return r;
        });
      });
    })
  );
});
