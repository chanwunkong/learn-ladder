/* ---------- 後中國文：介面小工具與能力分類 ---------- */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const store = {
  get(k, d) { try { const v = localStorage.getItem('zh-ladder:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('zh-ladder:' + k, JSON.stringify(v)); } catch (e) { /* 無法儲存時忽略 */ } },
};
function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function shuffled(n, seed) {
  let x = hash(seed) || 1; const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { x = (Math.imul(x, 1103515245) + 12345) >>> 0; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// 能力分類：依 114、115 三校國文考卷的題型（analysis/zh/README.md）
const SKILLS = {
  'z.sound': '字音', 'z.form': '字形與錯別字', 'z.word': '字詞義與詞性', 'z.idiom': '成語',
  'z.lore': '國學與文化常識', 'z.rhet': '修辭', 'z.order': '排序與填空',
  'r.classic': '古文閱讀', 'r.poem': '詩詞', 'r.modern': '白話與新詩', 'r.med': '醫古文',
};
// 每週的資料檔（wk/wNN.js）把自己 push 進來：{ n, theme, days: [{ t 當天主題, am: [題], pm: [題組或題] }] }
// 題：{ id, sk, q, o: [正解, 誤, 誤, 誤], why, st?: [[問題, 正解, 誤1, 誤2, 說明], …] }；題組：{ title, src, text, qs: [題…] }
const ZWEEKS = [];
