/* ---------- 後中國文：啟動、雲端同步、PWA ---------- */
boot();
store.set('weeks', ZWEEKS.length);  // 給學習階梯首頁顯示進度
const COURSE = {
  tracks: [],
  count: () => ZWEEKS.reduce((s, w) => s + w.days.filter((x, d) => frac(slotQs(w, d, 'am'), okSet()) >= 1 && frac(slotQs(w, d, 'pm'), okSet()) >= 1).length, 0),
  total: () => ZWEEKS.reduce((s, w) => s + w.days.length, 0),
  refresh: route,
  logs: { doc: 'zhLog', get: () => LOG, set: a => { LOG.length = 0; LOG.push(...a); store.set('log', LOG); } },
};
if (document.querySelector('meta[name="app-site"]')) {
  document.querySelector('.brand').insertAdjacentHTML('beforebegin', '<a class="home-link" href="../">‹ 學習階梯</a>');
  if (typeof CLOUD !== 'undefined') CLOUD.start();
  // 新版：service worker 換成新版本時重新整理一次（第一次安裝沒有舊版，不重整；2026-11-09 使用者要求：更新後不用再開兩次）
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('../sw.js', { scope: '../' }).catch(() => {});
  if ('serviceWorker' in navigator) navigator.serviceWorker.controller && navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
}
