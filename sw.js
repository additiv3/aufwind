/* AUFWIND – Service Worker der veröffentlichten Einzeldatei (GitHub Pages).
   Netz zuerst (neue Spielversion sofort da), bei Funkloch oder langsamem Netz (> 4 s) die gespeicherte Kopie:
   so startet das Spiel auch ohne Empfang. tools/publish.py legt die Datei als sw.js neben index.html. */
const CACHE = 'aufwind-pages';
self.addEventListener('install', (e) => { e.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = req.mode === 'navigate' ? './index.html' : req;
    const net = fetch(req).then((res) => { if (res.ok) cache.put(key, res.clone()).catch(() => {}); return res; });
    const hit = await cache.match(key);
    try {
      return await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error('langsam')), hit ? 4000 : 60000))]);
    } catch (err) {
      return hit || net;
    }
  })());
});
