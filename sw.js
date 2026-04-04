const cacheName = 'rba-v4';
const assets = [
  '/',
  'index.html',
  'logo.png',
  'logo.jpg',
  'bg.jpg',
  'story.json'
];

// Install Service Worker
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching assets');
      cache.addAll(assets).catch(err => console.log('Cache error:', err));
    })
  );
});

// Active Service Worker
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch Logic
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});
