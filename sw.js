const CACHE_NAME = 'farmaturnos-v2';
const urls = [
  '/turnos/',
  '/turnos/index.html',
  '/turnos/manifest.json',
  '/turnos/ciclos_oficiales_definitivo.json',
  '/turnos/style.css',
  '/turnos/app.js',
  '/turnos/icon-512.png',
  '/turnos/icon-96.png',
  '/turnos/icon-48.png',
  '/turnos/icon-32.png',
  '/turnos/icon-16.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cacheando archivos');
      return cache.addAll(urls);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si el archivo está en caché, lo devuelve
      if (response) {
        return response;
      }
      // Si no, lo busca en la red
      return fetch(event.request).then((networkResponse) => {
        // Opcional: guardar en caché archivos nuevos (solo si son de la misma URL)
        if (networkResponse && networkResponse.status === 200) {
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
});