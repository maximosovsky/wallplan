const CACHE_NAME = 'wallplan-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/calendar.js',
    '/favicon.png',
    '/manifest.json',
    '/locales/en.js',
    '/locales/ru.js',
    '/locales/zh.js'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
