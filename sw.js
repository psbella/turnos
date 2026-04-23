const CACHE_NAME = 'farmacias-mdp-v1';
const urlsToCache = [
  '/turnos/',
  '/turnos/index.html',
  '/turnos/manifest.json',
  '/turnos/ciclos_final.json',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // NO interceptar peticiones a la API de geocoding (para evitar CORS)
  const url = new URL(event.request.url);
  if (url.hostname === 'nominatim.openstreetmap.org') {
    // Dejar que el navegador maneje la petición directamente
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
