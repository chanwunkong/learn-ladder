/* ---------- 後中化學：啟動、雲端同步、PWA ---------- */
// 頁首的返回連結要在 boot 之前放好，route 才能依頁面改成「回上一層」
if (document.querySelector('meta[name="app-site"]')) document.querySelector('.brand').insertAdjacentHTML('beforebegin', '<a class="home-link" href="../">‹ 學習階梯</a>');
boot();
store.set('total', CH.length);  // 給學習階梯首頁顯示進度
const COURSE = {
  tracks: [{ doc: 'chemLadder', get: () => state.done, set: m => { state.done = m; store.set('done', m); } }],
  count: () => CH.filter(c => state.done[c.id]).length, total: () => CH.length,
  refresh: () => { updateProgress(); route(location.hash.slice(1)); },
  logs: { doc: 'chemLog', get: () => LOG, set: a => { LOG.length = 0; LOG.push(...a); store.set('log', LOG); } },
};
if (document.querySelector('meta[name="app-site"]')) {
  if (typeof CLOUD !== 'undefined') CLOUD.start();
  // 新版：service worker 換成新版本時重新整理一次（第一次安裝沒有舊版，不重整；2026-11-09 使用者要求：更新後不用再開兩次）
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('../sw.js', { scope: '../' }).catch(() => {});
  if ('serviceWorker' in navigator) navigator.serviceWorker.controller && navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
}
