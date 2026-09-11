
self.addEventListener('install', e=>{e.waitUntil(caches.open('tasbih-v1').then(c=>c.addAll(['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'])));self.skipWaiting();});
self.addEventListener('fetch', e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
