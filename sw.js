// Offline-Speicher für das Haushaltsbuch: die Seite selbst, Symbole, Schriften.
// Die Daten liegen nicht hier, sondern im Browser-Speicher des Geräts.
const CACHE = 'haushalt-v3';
const SEITE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SEITE)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const merken = res => { if (res && (res.ok || res.type === 'opaque')) { const kopie = res.clone(); caches.open(CACHE).then(c => c.put(req, kopie)); } return res; };
  if (url.origin === location.origin) {
    // Zuerst aus dem Netz (immer die neueste Version), ohne Netz aus dem Speicher
    e.respondWith(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(merken).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(merken)));
  }
});
