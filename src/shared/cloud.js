/* ---------- 雲端同步（Firebase，各課程與首頁共用）：Google 登入後，把「已完成的章節」存到 Firestore ----------
   只在正式網站（GitHub Pages，HEAD 帶 app-site meta）啟用；Artifact 與本機檔案不載入 SDK。
   位置：users/{uid}/settings/<課程 doc> ＝ { done: {章節id: 1}, lang, updated }
   使用前先定義 COURSE：
     tracks: [{ doc, get() → 已完成表, set(表) }]   課程頁一條；首頁列出全部課程，一次同步
     count() / total()                             面板上顯示的完成章數
     refresh()                                     從雲端合併進新章節後重畫畫面
     logs: { doc, get() → 紀錄陣列, set(陣列) } 或其陣列（選用） 練習紀錄：與雲端取聯集合併，任何一邊都不會刪掉另一邊的紀錄
   介面：右上角按鈕 → 下拉面板說明「登入有什麼用」與目前同步狀態；hint() 給首頁的提示列。 */
const CLOUD = (() => {
  const CFG = { apiKey: 'AIzaSyD8oEe02SY2PCDe3d40NtTprrApqW_DhB8', authDomain: 'test-5dbba.firebaseapp.com', projectId: 'test-5dbba' };
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-';
  let auth = null, db = null, user = null, timer = 0, ready = false, busy = false, err = '', last = 0;
  const on = () => !!document.querySelector('meta[name="app-site"]') && /^https?:$/.test(location.protocol);
  const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const ref = doc => db.collection('users').doc(user.uid).collection('settings').doc(doc);
  const zh = () => (typeof isZh === 'function' ? isZh() : true), lang = () => (typeof I18N !== 'undefined' ? I18N.lang : 'zh-TW');
  const T = (a, b) => (zh() ? a : b);
  const nDone = () => COURSE.count();
  const time = t => new Date(t).toLocaleTimeString(zh() ? 'zh-TW' : 'en', { hour: '2-digit', minute: '2-digit' });
  const G = '<svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true"><path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.7H9v3.3h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 5.9-2.2L12 13.6c-.8.5-1.8.9-3 .9-2.3 0-4.3-1.6-5-3.7H1v2.3A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M4 10.8a5.4 5.4 0 0 1 0-3.5V4.9H1a9 9 0 0 0 0 8.1l3-2.3z"/><path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 1 4.9l3 2.3c.7-2.1 2.7-3.6 5-3.6z"/></svg>';

  function panelHTML() {
    if (!ready) return `<p class="cp-t">${T('連線中…', 'Connecting…')}</p>`;
    const n = nDone(), tot = COURSE.total(), e = err ? `<p class="cp-err">${esc(err)}</p>` : '';
    if (!user) return `<p class="cp-t">${T('在不同裝置接著學', 'Pick up where you left off on any device')}</p>
<p>${T('用 Google 帳號登入後，你完成的章節會存到雲端。之後在手機或其他電腦登入同一個帳號，進度會自動接上。', 'Sign in with Google and the chapters you finish are saved to the cloud. Sign in with the same account on your phone or another computer and your progress follows you.')}</p>
<p class="cp-st">${T(`目前：進度只存在這台裝置（已完成 ${n} / ${tot} 章）`, `Now: progress is saved on this device only (${n} / ${tot} chapters done)`)}</p>
<button class="btn pri cp-go" type="button" id="cpIn">${G}<span>${T('用 Google 登入', 'Sign in with Google')}</span></button>
<p class="cp-s">${T('不登入也能使用全部內容。這裡只儲存「完成了哪些章節」與練習紀錄，不會讀取你的其他 Google 資料。', 'Everything works without signing in. Only the list of finished chapters is stored, nothing else from your Google account.')}</p>${e}`;
    return `<p class="cp-t">${user.photoURL ? `<img class="cp-av" src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : ''}<span>${esc(user.displayName || T('已登入', 'Signed in'))}<small>${esc(user.email || '')}</small></span></p>
<p class="cp-st ok">${busy ? T('同步中…', 'Syncing…') : `✓ ${T(`已同步 ${n} / ${tot} 章`, `${n} / ${tot} chapters synced`)}${last ? ` · ${time(last)}` : ''}`}</p>
<p>${T('在其他裝置用同一個帳號登入，就會看到相同的進度；在任何一台標記完成，其他裝置也會跟著更新。', 'Sign in with the same account on another device to see the same progress. Chapters you finish anywhere show up everywhere.')}</p>
<button class="btn" type="button" id="cpOut">${T('登出', 'Sign out')}</button>
<p class="cp-s" style="margin-top:8px !important">${T('登出後，這台裝置上的進度仍會保留。', 'Signing out keeps your progress on this device.')}</p>${e}`;
  }
  function render() {
    const b = document.getElementById('cloudBtn'), p = document.getElementById('cloudPanel');
    if (b) {
      b.innerHTML = user ? `${user.photoURL ? `<img class="cb-av" src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : '<span class="cb-dot"></span>'}<span>${busy ? T('同步中', 'Syncing') : T('已同步', 'Synced')}</span>` : `<span aria-hidden="true">☁</span><span>${T('同步進度', 'Sync progress')}</span>`;
      b.title = user ? T('進度已同步到雲端，點一下看詳情', 'Progress is synced; click for details') : T('登入後可在不同裝置同步學習進度', 'Sign in to sync progress across devices');
    }
    if (p && !p.hidden) {
      p.innerHTML = panelHTML();
      const i = document.getElementById('cpIn'), o = document.getElementById('cpOut');
      if (i) i.onclick = signIn;
      if (o) o.onclick = () => auth.signOut();
    }
    const h = document.getElementById('syncHint'); if (h) h.outerHTML = hint();
  }
  function signIn() {
    err = ''; if (!ready) return;
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(e => {
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') { err = T('登入失敗：', 'Sign-in failed: ') + e.code; toggle(true); }
    });
  }
  function toggle(show) {
    const p = document.getElementById('cloudPanel'), b = document.getElementById('cloudBtn'); if (!p) return;
    p.hidden = show === undefined ? !p.hidden : !show; b.setAttribute('aria-expanded', String(!p.hidden)); render();
  }
  function push() {
    if (!user) return;
    clearTimeout(timer); busy = true; render();
    timer = setTimeout(() => Promise.all(COURSE.tracks.map(t => ref(t.doc).set({ done: t.get(), lang: lang(), updated: Date.now() })))
      .then(() => { busy = false; err = ''; last = Date.now(); render(); })
      .catch(e => { busy = false; err = T('同步失敗：', 'Sync failed: ') + e.code; render(); }), 800);
  }
  // 練習紀錄：只增不減。上傳最近 3000 筆（Firestore 單一文件上限 1 MB）；下載時與本機取聯集
  const lkey = e => `${e.t}|${e.c}|${e.h || e.k + e.i}|${e.p}`;
  let ltimer = 0;
  const LOGS = () => [].concat(COURSE.logs || []);
  function pushLog() {
    if (!user || !LOGS().length) return;
    clearTimeout(ltimer);
    ltimer = setTimeout(() => LOGS().forEach(L => ref(L.doc).set({ log: L.get().slice(-3000), updated: Date.now() }).catch(e => console.warn('log sync', e.code))), 2000);
  }
  async function pullLog() {
    let added = 0;
    for (const L of LOGS()) {
      try {
        const snap = await ref(L.doc).get(), remote = (snap.exists && snap.data().log) || [], local = L.get();
        const seen = new Set(local.map(lkey)), add = remote.filter(e => !seen.has(lkey(e)));
        if (add.length) { L.set(local.concat(add).sort((a, b) => a.t - b.t)); added += add.length; }
        const rs = new Set(remote.map(lkey));
        if (local.some(e => !rs.has(lkey(e)))) pushLog();
      } catch (e) { console.warn('log sync', e.code); }
    }
    return added;
  }
  async function pull() {
    try {
      busy = true; render();
      let added = 0, ahead = false;
      for (const t of COURSE.tracks) {
        const snap = await ref(t.doc).get(), remote = (snap.exists && snap.data().done) || {}, local = { ...t.get() };
        const add = Object.keys(remote).filter(k => !local[k]);
        add.forEach(k => { local[k] = 1; });
        if (add.length) { t.set(local); added += add.length; }
        if (Object.keys(local).some(k => !remote[k])) ahead = true;
      }
      if (await pullLog()) added++;
      if (added) COURSE.refresh();
      busy = false; last = Date.now(); err = '';
      if (ahead) push(); else render();
    } catch (e) { busy = false; err = T('同步失敗：', 'Sync failed: ') + e.code; render(); }
  }
  // 首頁提示：有進度、還沒登入、沒按過「不用了」時才出現
  function hint() {
    if (!on() || user || !ready || !nDone() || store.get('syncHintOff', 0)) return '<div id="syncHint" hidden></div>';
    return `<div id="syncHint" class="sync-hint" data-notr><span>☁ ${T(`你已完成 ${nDone()} 章，進度目前只存在這台裝置。登入 Google 帳號，換手機或電腦也能接著學。`, `You've finished ${nDone()} chapters, saved on this device only. Sign in with Google to continue on your phone or another computer.`)}</span><button class="btn sm pri" type="button" data-sync="in">${T('登入同步', 'Sign in')}</button><button class="btn sm" type="button" data-sync="off">${T('不用了', 'No thanks')}</button></div>`;
  }
  async function start() {
    if (!on()) return;
    const top = document.querySelector('.top-in');
    if (!top) return;
    top.insertAdjacentHTML('beforeend', '<div class="cloud" data-notr><button class="btn cloud-btn" type="button" id="cloudBtn" aria-expanded="false" aria-controls="cloudPanel"></button><div class="cloud-panel" id="cloudPanel" role="dialog" hidden></div></div>');
    document.getElementById('cloudBtn').onclick = e => { e.stopPropagation(); toggle(); };
    document.addEventListener('click', e => {
      if (!e.target.closest('.cloud')) toggle(false);
      const s = e.target.closest('[data-sync]');
      if (s) { if (s.dataset.sync === 'in') signIn(); else { store.set('syncHintOff', 1); render(); } }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
    render();
    try {
      await load(SDK + 'app-compat.js');
      await Promise.all([load(SDK + 'auth-compat.js'), load(SDK + 'firestore-compat.js')]);
    } catch (e) { document.querySelector('.cloud').remove(); return; }
    firebase.initializeApp(CFG);
    auth = firebase.auth(); db = firebase.firestore();
    auth.onAuthStateChanged(u => { user = u; ready = true; err = ''; render(); if (u) pull(); });
  }
  return { start, push, pushLog, hint, render };
})();
