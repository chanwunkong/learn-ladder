/* ---------- 後中英文：介面小工具與能力分類 ---------- */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const store = {
  get(k, d) { try { const v = localStorage.getItem('eng-ladder:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('eng-ladder:' + k, JSON.stringify(v)); } catch (e) { /* 無法儲存時忽略 */ } },
};
// 固定的亂數：同一題每次打開選項順序一樣（複習時才認得出來）
function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function shuffled(n, seed) {
  let x = hash(seed) || 1; const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { x = (Math.imul(x, 1103515245) + 12345) >>> 0; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// 能力分類：每一題、每一步都標其中一項；週報與匯出依此統計弱項
const SKILL_GROUPS = [
  ['v', '單字'], ['s', '句子結構'], ['g', '文法'], ['c', '克漏字'], ['r', '閱讀'],
];
const SKILLS = {
  'v.root': '字根拆字', 'v.mean': '字義', 'v.collo': '搭配用法',
  's.core': '找主幹（主詞＋動詞）', 's.rel': '關係子句', 's.part': '分詞修飾', 's.noun': '名詞子句', 's.pass': '被動語態', 's.para': '平行結構',
  'g.tense': '時態與主詞動詞一致', 'g.conj': '連接詞與轉折語',
  'c.logic': '前後文邏輯', 'c.form': '詞性與形式', 'c.collo': '固定搭配',
  'r.main': '主旨', 'r.locate': '找細節', 'r.para': '換句話說', 'r.infer': '推論', 'r.word': '由上下文猜字義', 'r.attitude': '作者態度',
};
// 每週的資料檔（wk/wNNa.js、wNNb.js）把自己 push 進來
const WEEKS = [];

/* ---------- 發音：瀏覽器內建的語音合成（不需網路）；語速與聲音存在本機 ----------
   按鈕寫成 <button class="say" data-say="要唸的英文">；data-say-el 表示唸「所在段落」的文字（克漏字：沒填的格子唸 blank）。 */
const SPEECH = (() => {
  const ok = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
  let rate = store.get('rate', 0.9), voiceName = store.get('voice', ''), cur = null;
  const voices = () => (ok ? speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang)) : []);
  const pick = () => { const vs = voices(); return vs.find(v => v.name === voiceName) || vs.find(v => /en[-_]US/i.test(v.lang) && /Samantha|Google US|Aria|Jenny/i.test(v.name)) || vs.find(v => /en[-_]US/i.test(v.lang)) || vs[0] || null; };
  function stop() { if (ok) speechSynthesis.cancel(); if (cur) cur.classList.remove('on'); cur = null; }
  function say(text, btn) {
    if (!ok || !text) return;
    const again = btn && btn === cur; stop(); if (again) return;   // 再按一次＝停止
    const u = new SpeechSynthesisUtterance(text), v = pick();
    u.lang = v ? v.lang : 'en-US'; if (v) u.voice = v; u.rate = rate;
    if (btn) { cur = btn; btn.classList.add('on'); u.onend = u.onerror = () => { if (cur === btn) { btn.classList.remove('on'); cur = null; } }; }
    speechSynthesis.speak(u);
  }
  function elText(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll('.say').forEach(b => b.remove());
    c.querySelectorAll('.blank').forEach(b => { b.textContent = b.classList.contains('fill') ? b.textContent.replace(/^\(\d\)\s*/, '') : ' blank '; });
    c.querySelectorAll('.gap').forEach(b => { b.textContent = ' blank '; });
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  // 頁首的語速與聲音
  function controls() {
    if (!ok) return '';
    return `<div class="spk"><label><span aria-hidden="true">🔊</span> 語速 <input type="range" id="spRate" min="0.5" max="1.3" step="0.1" value="${rate}" aria-label="發音語速"><output id="spRateV">${rate.toFixed(1)}×</output></label><select id="spVoice" aria-label="發音的聲音" hidden></select></div>`;
  }
  function bind() {
    if (!ok) { document.documentElement.classList.add('no-tts'); return; }
    const r = document.getElementById('spRate'), sel = document.getElementById('spVoice');
    if (r) r.oninput = () => { rate = +r.value; store.set('rate', rate); document.getElementById('spRateV').textContent = rate.toFixed(1) + '×'; };
    const fill = () => { const vs = voices(); if (!sel || vs.length < 2) return; const p = pick();
      sel.innerHTML = vs.map(v => `<option value="${esc(v.name)}"${p && v.name === p.name ? ' selected' : ''}>${esc(v.name.replace(/\s*\(.*\)/, ''))}（${esc(v.lang)}）</option>`).join(''); sel.hidden = false; };
    fill(); speechSynthesis.onvoiceschanged = fill;
    if (sel) sel.onchange = () => { voiceName = sel.value; store.set('voice', voiceName); };
    document.addEventListener('click', e => {
      const b = e.target.closest('.say'); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      say(b.dataset.sayEl != null ? elText(b.closest(b.dataset.sayEl || 'p')) : b.dataset.say, b);
    }, true);
    addEventListener('hashchange', stop);
  }
  return { ok, say, stop, controls, bind };
})();
const sayBtn = (text, label = '發音') => `<button class="say" type="button" data-say="${esc(text)}" aria-label="${label}：${esc(text)}" title="${label}"></button>`;
const sayEl = (sel, label = '朗讀這段') => `<button class="say" type="button" data-say-el="${sel}" aria-label="${label}" title="${label}"></button>`;
