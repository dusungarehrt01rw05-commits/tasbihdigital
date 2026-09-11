const CACHE_NAME = 'tasbih-pwa-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Install Event - Cache file inti
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Menggunakan Promise.allSettled agar jika 1 gambar missing, SW tetap terinstall
      return Promise.all(
        ASSETS.map((url) => cache.add(url).catch((err) => console.warn(`Gagal cache: ${url}`, err)))
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event - Hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event - Stale-While-Revalidate / Cache-First untuk performa HP
self.addEventListener('fetch', (event) => {
  // Hanya proses request GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Ambil dari cache dulu, lalu perbarui di background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Abaikan error jaringan saat offline */});
        
        return cachedResponse;
      }

      return fetch(event.request);
    })
  );
});
