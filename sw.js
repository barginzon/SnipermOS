// Parkinson Planner - Service Worker (v106)
const CACHE_NAME = 'parkinson-v108';

// Önbelleğe alınacak dosyalar (Çevrimdışı çalışma desteği için)
const urlsToCache = [
  'index.html',
  'manifest.json',
  'app_icon192.png',
  'app_icon512.png'
];

// Service Worker yüklendiğinde çalışır
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Dosyalar önbelleğe alınıyor...');
        return cache.addAll(urlsToCache);
      })
  );
});

// Yeni bir versiyon yüklendiğinde eski önbellekleri temizler
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski önbellek temizleniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Ağ isteklerini yakalar ve önbellekte varsa oradan sunar
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Önbellekte varsa döndür, yoksa ağdan çek
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'mOS', body: 'Yeni bir görev var!' };
    
    const options = {
        body: data.body,
        icon: '/app_icon.ico', 
        badge: '/app_icon.ico', 
        vibrate: [100, 50, 100],
        data: { url: data.url || '/' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Bildirime tıklandığında uygulamayı açması için:
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});