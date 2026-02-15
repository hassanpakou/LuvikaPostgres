// 🔑 SERVICE WORKER LUVIKA PWA - VERSION PRODUCTION
const CACHE_NAME = 'luvika-v3';
const OFFLINE_URL = '/offline.html';
const CORE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/lo.png',
  '/icons/lo.png',
  '/_next/static/css/app/dashboard/layout.css',
  '/_next/static/chunks/app/dashboard/layout.js'
];

// 🚀 INSTALLATION - Mise en cache des ressources critiques
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources...');
        return cache.addAll(CORE_ASSETS.map(asset => 
          new Request(asset, { credentials: 'same-origin' })
        ));
      })
      .then(() => {
        console.log('[Service Worker] Installation terminée');
        return self.skipWaiting();
      })
  );
});

// 🔄 ACTIVATION - Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] Suppression du cache ancien: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Contrôle des clients...');
      return self.clients.claim();
    })
  );
});

// 🌐 STRATÉGIE DE MISE EN CACHE INTELLIGENTE
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-HTTP et les requêtes chrome-extension
  if (
    event.request.url.startsWith('chrome-extension://') ||
    event.request.url.startsWith('chrome://') ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // 🔹 STRATÉGIE 1: Navigation (HTML) = Network-first avec fallback offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Mise à jour du cache avec la nouvelle page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback vers la page offline
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 🔹 STRATÉGIE 2: API = Network-only (pas de cache pour les données sensibles)
  if (event.request.url.includes('/api/') || event.request.url.includes('/_next/data/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Pour les erreurs API, retourner une réponse vide mais ne pas bloquer l'UI
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 🔹 STRATÉGIE 3: Ressources statiques = Cache-first avec mise à jour en arrière-plan
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Mise à jour silencieuse du cache
        fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response);
            });
          }
        });
        return cachedResponse;
      }

      // Si pas en cache, utiliser le réseau
      return fetch(event.request).then((response) => {
        // Cloner la réponse pour le cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => {
        // Fallback universel pour les erreurs réseau
        return new Response('Ressource non disponible hors ligne', {
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});

// 🔔 GESTION DES NOTIFICATIONS PUSH (OPTIONNEL MAIS RECOMMANDÉ)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const title = data.title || 'LUVIKA';
  const options = {
    body: data.body || 'Vous avez une nouvelle notification',
    icon: '/icons/lo.png',
    badge: '/icons/lo.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: 'Voir', icon: '/icons/lo.png' },
      { action: 'close', title: 'Fermer', icon: '/icons/lo.png' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});