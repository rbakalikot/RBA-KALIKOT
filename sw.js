const cacheName = 'rba-music-v2';

// सुरुमै मोबाइलमा सेभ हुने कुराहरू (तपाईंको लोगो, डिजाइन र कथा)
const assets = [
  '/',
  './index.html',
  './manifest.json',
  './logo.png',
  './bg.jpg',
  './songs.json',
  './story.json'
];

// 1. Install Service Worker (सुरुका फाइलहरू सेभ गर्ने)
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching initial assets');
      return cache.addAll(assets).catch(err => console.log('Cache error:', err));
    })
  );
  self.skipWaiting();
});

// 2. Activate Service Worker (पुरानो भर्सनको क्यास डिलिट गरेर स्टोरेज खाली गर्ने)
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Logic (अफलाइन गीत सुन्न मिल्ने जादुगरी लजिक)
self.addEventListener('fetch', evt => {
  // फायरबेस (Like/Message) र एनालिटिक्सलाई अफलाइन सेभ नगर्ने
  if (evt.request.url.includes('firebaseio.com') || evt.request.url.includes('google-analytics') || evt.request.url.includes('secrethelp.io')) {
      return;
  }

  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      // यदि मोबाइलमा पहिल्यै सेभ छ भने त्यही दिने (इन्टरनेट नचाहिने)
      if (cacheRes) {
        return cacheRes;
      }
      
      // यदि सेभ छैन भने इन्टरनेटबाट ल्याउने र मोबाइलमा सेभ गरेर राख्ने (गीतको लागि)
      return fetch(evt.request).then(fetchRes => {
        // यदि रेस्पोन्स ठीक छैन भने सेभ नगर्ने
        if(!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic') {
          return fetchRes;
        }
        
        // गीत वा नयाँ फोटोलाई ब्याकग्राउन्डमा सेभ गर्ने
        const responseToCache = fetchRes.clone();
        caches.open(cacheName).then(cache => {
          cache.put(evt.request, responseToCache);
        });
        
        return fetchRes;
      }).catch(() => {
        // इन्टरनेट पनि छैन र क्यासमा पनि छैन भने (Error ह्यान्डलिङ)
        console.log('Offline and resource not found');
      });
    })
  );
});
