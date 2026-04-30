const CACHE_NAME = 'farmaturnos-v3'; // Cambié la versión para forzar actualización
const urls = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/app.js',
  '/icon-512.png',
  '/icon-96.png',
  '/icon-48.png',
  '/icon-32.png',
  '/icon-16.png',
  '/privacidad.html'
  // NOTA: NO cachees ciclos_oficiales_definitivo.json aquí porque cambia diariamente
];

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

self.addEventListener('fetch', (event) => {
  // Estrategia: Cache First para archivos estáticos, Network First para datos
  const url = new URL(event.request.url);
  
  // Si es una petición a tu Worker de datos, NO cachees (siempre red)
  if (url.href.includes('farmacias-mdp-app.pablo-s-bella.workers.dev')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Para todo lo demás: intenta caché primero, luego red
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        // Solo cacheamos respuestas exitosas y que sean del mismo origen
        if (networkResponse && networkResponse.status === 200 && 
            url.origin === location.origin) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});

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
  event.waitUntil(clients.claim()); // Toma control inmediato
});
