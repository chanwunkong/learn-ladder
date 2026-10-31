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
