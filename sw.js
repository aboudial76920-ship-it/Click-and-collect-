// On passe à la version 2 pour forcer la mise à jour
const CACHE_NAME = 'casa-karima-v2';
const urlsToCache = [
  './',
  './index.html',
  './logo casa karima plein.png'
];

// Installation du Service Worker
self.addEventListener('install', function(event) {
  // Cette ligne force le nouveau service worker à prendre le contrôle tout de suite
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Nettoyage des anciens caches (supprime la v1 pour faire place à la v2)
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// La nouvelle stratégie : INTERNET D'ABORD (Network First)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Si on a internet, on récupère la page ET on met à jour le cache pour la prochaine fois
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(function() {
        // Si on n'a PAS internet, on regarde dans le cache
        return caches.match(event.request);
      })
  );
});
