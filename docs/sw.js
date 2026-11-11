/* 學習階梯 service worker（全站共用）：先用手機上存的版本（立即打開），同時在背景下載新版，下次打開就是新版；
   沒有存過的才等網路。版本號由 build.py 依頁面內容產生，網站更新後新的 service worker 會預先下載全部頁面。 */
const CACHE = 'learn-ladder-4d75f4e96d';
const LOCAL = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./biostat/", "./chem/", "./eng/", "./zh/"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(LOCAL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => /^(learn|biostat)-ladder-/.test(k) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  // 只處理本站與 Firebase SDK 的 GET；登入、資料庫連線不經過快取
  if (r.method !== 'GET' || !(u.origin === location.origin || u.href.startsWith('https://www.gstatic.com/firebasejs/'))) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net.catch(() => caches.match(new URL('./', u).href));
  }));
});
