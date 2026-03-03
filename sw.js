// Parkinson Planner - Service Worker (v109) - Sniper Edit
const CACHE_NAME = 'parkinson-v109';

// Önbelleğe alınacak dosyalar
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

// Eski önbellekleri temizler
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

// Ağ isteklerini yakalar
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// --- PUSH BİLDİRİM OPERASYONU (SES VE TİTREŞİM DESTEKLİ) ---
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'mOS', body: 'Yeni bildirim!' };
    
    const options = {
        body: data.body,
        icon: '/app_icon192.png', 
        badge: '/app_icon192.png', 
        // Titreşim: 200ms titre, 100ms dur, 200ms titre
        vibrate: [200, 100, 200], 
        data: { url: data.url || '/' },
        // Ses ve uyarıyı tetiklemek için kritik ayarlar:
        tag: 'mos-notification',
        renotify: true,
        actions: [
            { action: 'open', title: 'Görüntüle' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Bildirime tıklandığında uygulamayı aç
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Eğer uygulama zaten açıksa oraya odaklan, değilse yeni pencere aç
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});