// Cache public app assets only. Never cache Firebase requests or employee records.
const CACHE = 'baragshun-admin-v2';
const BASE = new URL('./', self.location.href);
const ASSETS = ['admin-app.css','admin-app.js','admin-offline.html','admin.webmanifest','app-icons/icon-192.png','app-icons/icon-512.png','app-icons/icon-maskable-512.png','app-icons/apple-touch-icon.png'].map(path => new URL(path,BASE).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('baragshun-admin-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== BASE.origin) return;
  if(event.request.mode === 'navigate' && url.pathname === new URL('admin.html',BASE).pathname) {
    event.respondWith(fetch(event.request).catch(() => caches.match(new URL('admin-offline.html',BASE).href)));
  } else if(ASSETS.includes(url.href)) {
    event.respondWith(fetch(event.request).then(response => {
      if(response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request,copy))); }
      return response;
    }).catch(() => caches.match(event.request)));
  }
});
