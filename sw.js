const CACHE_NAME = 'farmaturnos-v1';
const urls = [
  '/turnos/',
  '/turnos/index.html',
  '/turnos/manifest.json',
  '/turnos/ciclos_final_definitivo.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urls)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
