/* ---------- 後中英文：啟動、雲端同步、PWA ---------- */
boot();
store.set('weeks', WEEKS.length);  // 給學習階梯首頁顯示進度
const COURSE = {
  tracks: [],
  count: () => WEEKS.reduce((s, w) => s + w.words.filter((x, d) => frac(amIds(w, d), okSet()) >= 1 && frac(pmIds(w, d), okSet()) >= 1).length, 0),
  total: () => WEEKS.length * 7,
  refresh: route,
  logs: { doc: 'engLog', get: () => LOG, set: a => { LOG.length = 0; LOG.push(...a); store.set('log', LOG); } },
};
if (document.querySelector('meta[name="app-site"]')) {
  document.querySelector('.brand').insertAdjacentHTML('beforebegin', '<a class="home-link" href="../">‹ 學習階梯</a>');
  if (typeof CLOUD !== 'undefined') CLOUD.start();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('../sw.js', { scope: '../' }).catch(() => {});
}
