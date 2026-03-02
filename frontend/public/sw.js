// This empty service worker replaces any previously registered Workbox/PWA service worker.
// It immediately takes control and clears all caches, then unregisters itself.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
  // Unregister this service worker after cleanup
  self.registration.unregister();
});
