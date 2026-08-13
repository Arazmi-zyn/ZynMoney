// Service worker ZynMoney — strategi Network First.
// Selalu coba ambil versi terbaru dulu dari internet; kalau gagal
// (misal lagi offline), baru pakai versi yang tersimpan di cache.
// Ini sengaja dipilih supaya app nggak "nyangkut" di versi lama
// tiap kali ada update.

const CACHE_NAME = 'zynmoney-cache-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Jangan cache panggilan API ke Apps Script — itu harus selalu fresh/live.
  if (event.request.url.indexOf('script.google.com') !== -1) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
