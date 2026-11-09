/* ---------- 啟動：套用語言、建立語言選單、啟動翻譯與雲端同步 ---------- */
applyContentPack();
(() => {
  const top = document.querySelector('.top-in'); if (top) top.insertAdjacentHTML('beforeend', langMenuHTML());
  const s = document.getElementById('langSel'); if (s) s.onchange = () => setLang(s.value);
})();
boot();
startTranslator();
store.set('total', CH.length);  // 給學習階梯首頁顯示進度
// 雲端同步設定（src/shared/cloud.js）
const COURSE = {
  tracks: [{ doc: 'biostatLadder', get: () => state.done, set: m => { state.done = m; store.set('done', m); } }],
  count: () => CH.filter(c => state.done[c.id]).length, total: () => CH.length,
  refresh: () => { updateProgress(); route(location.hash.slice(1)); },
};
if (typeof CLOUD !== 'undefined') CLOUD.start();
// 回到學習階梯首頁（只在正式網站）
if (document.querySelector('meta[name="app-site"]')) document.querySelector('.brand')?.insertAdjacentHTML('beforebegin', `<a class="home-link" href="../" data-notr>${isZh() ? '‹ 學習階梯' : '‹ Learn Ladder'}</a>`);
// 新版：service worker 換成新版本時重新整理一次（第一次安裝沒有舊版，不重整；2026-11-09 使用者要求：更新後不用再開兩次）
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && document.querySelector('meta[name="app-site"]')) navigator.serviceWorker.register('../sw.js', { scope: '../' }).catch(() => {});
if ('serviceWorker' in navigator) navigator.serviceWorker.controller && navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
