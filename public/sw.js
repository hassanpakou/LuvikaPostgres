// Service Worker pour LUVIKA PWA

const CACHE_NAME = 'luvika-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/icons/lo.png',
  '/lo.png',
  '/favicon.ico',
  '/manifest.json'
];

// Installation - mise en cache des ressources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activation - nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retourne la ressource mise en cache ou la demande réseau
        return response || fetch(event.request);
      }
    )
  );
});

// Gestion des notifications push
self.addEventListener('push', event => {
  const options = {
    body: 'LUVIKA : Nouvelle mise à jour disponible !',
    icon: '/icons/lo.png',
    badge: '/icons/lo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Ouvrir LUVIKA',
        icon: '/icons/lo.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/lo.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('LUVIKA', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});