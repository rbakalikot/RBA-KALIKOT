self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('rba-v1').then((cache) => cache.addAll(['/', 'index.html', 'logo.png', 'logo.jpg'])));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
