/* ---------- 後中化學：啟動、雲端同步、PWA ---------- */
boot();
store.set('total', CH.length);  // 給學習階梯首頁顯示進度
const COURSE = {
  tracks: [{ doc: 'chemLadder', get: () => state.done, set: m => { state.done = m; store.set('done', m); } }],
  count: () => CH.filter(c => state.done[c.id]).length, total: () => CH.length,
  refresh: () => { updateProgress(); route(location.hash.slice(1)); },
  logs: { doc: 'chemLog', get: () => LOG, set: a => { LOG.length = 0; LOG.push(...a); store.set('log', LOG); } },
};
if (document.querySelector('meta[name="app-site"]')) {
  document.querySelector('.brand').insertAdjacentHTML('beforebegin', '<a class="home-link" href="../">‹ 學習階梯</a>');
  if (typeof CLOUD !== 'undefined') CLOUD.start();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('../sw.js', { scope: '../' }).catch(() => {});
}
