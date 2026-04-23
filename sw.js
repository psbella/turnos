const CACHE_NAME = 'farmacias-mdp-v1';
const urlsToCache = [
  '/turnos/',
  '/turnos/index.html',
  '/turnos/manifest.json',
  '/turnos/ciclos_final.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // NO interceptar NINGUNA petición a APIs externas
  if (url.hostname !== 'psbella.github.io') {
    return; // Dejar que el navegador maneje todo lo que no sea tu dominio
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
