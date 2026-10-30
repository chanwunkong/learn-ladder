/* 學習階梯 service worker（全站共用）：網路優先、離線時用快取；版本號由 build.py 依頁面內容產生 */
const CACHE = 'learn-ladder-021d913411';
const LOCAL = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./biostat/", "./chem/"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(LOCAL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => /^(learn|biostat)-ladder-/.test(k) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  // 只處理本站與 Firebase SDK 的 GET；登入、資料庫連線不經過快取
  if (r.method !== 'GET' || !(u.origin === location.origin || u.href.startsWith('https://www.gstatic.com/firebasejs/'))) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match(new URL('./', u).href))));
});
