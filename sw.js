const CACHE_NAME = 'farmaturnos-v6'; // ← Cambiá v5 por v6
const urls = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/config.json',
  '/privacidad.html',
  '/terminos.html',
  '/icon-512.png',
  '/icon-96.png',
  '/icon-48.png',
  '/icon-32.png',
  '/icon-16.png',
  // Módulos JS (v2.0)
  '/js/main.js',
  '/js/config.js',
  '/js/data.js',
  '/js/maps.js',
  '/js/ui.js',
  '/js/theme.js',
  '/js/install.js'
];

// Instalación: cachear archivos estáticos
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cacheando archivos estáticos');
      return cache.addAll(urls);
    })
  );
  self.skipWaiting();
});

// Fetch: estrategia según tipo de recurso
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Para archivos JSON y datos dinámicos: network-first (siempre buscar fresco)
  if (url.pathname.endsWith('.json') || url.pathname.includes('db.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Para archivos estáticos: cache-first (rápido, usa caché)
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Activación: limpiar cachés viejas
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando caché vieja:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});
