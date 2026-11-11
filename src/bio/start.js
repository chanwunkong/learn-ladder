/* ---------- 後中生物：啟動、雲端同步、PWA ---------- */
boot();
const COURSE = {
  tracks: [],
  count: () => { const f = firstAns(); return DIAG.filter(q => f.has(qh(q))).length; },
  total: () => DIAG.length,
  refresh: route,
  logs: { doc: 'bioLog', get: () => LOG, set: a => { LOG.length = 0; LOG.push(...a); store.set('log', LOG); } },
};
if (document.querySelector('meta[name="app-site"]')) {
  document.querySelector('.brand').insertAdjacentHTML('beforebegin', '<a class="home-link" href="../">‹ 學習階梯</a>');
  if (typeof CLOUD !== 'undefined') CLOUD.start();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('../sw.js', { scope: '../' }).catch(() => {});
  if ('serviceWorker' in navigator) navigator.serviceWorker.controller && navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
}
