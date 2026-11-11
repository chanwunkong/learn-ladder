// 後中生物：檢查章節與程度測驗題（每章 6 題、每題 4 句對錯判斷且都有說明、對錯句長度相近、識別碼不重複、先修存在）。用法：node tests/bio/data.test.js
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '../../src/bio');
const src = ['ui.js', 'content.js', ...fs.readdirSync(path.join(dir, 'dg')).sort().map(f => 'dg/' + f)].map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
const { UNITS, TREE, DIAG } = new Function('localStorage', src + '\n;return { UNITS, TREE, DIAG };')({ getItem: () => null, setItem() {} });
const errs = [], ids = new Set(), units = UNITS.flatMap(p => p.items.map(i => i[0]));
units.forEach(u => { const t = TREE[u]; if (!t || t.w.length !== 5) errs.push(`${u} 沒有比重`); else t.pre.forEach(x => { if (!TREE[x]) errs.push(`${u} 的先修 ${x} 不存在`); }); });
DIAG.forEach(q => {
  const w = q.id || '?';
  if (!units.includes(q.u)) errs.push(`${w} 章 ${q.u} 不存在`);
  if (ids.has(q.id)) errs.push(`${w} 識別碼重複`); ids.add(q.id);
  if (!q.q || !Array.isArray(q.s) || q.s.length !== 4) { errs.push(`${w} 不是 4 句敘述`); return; }
  if (new Set(q.s.map(x => x[0])).size !== 4) errs.push(`${w} 敘述重複`);
  q.s.forEach(([text, tv, ex], i) => {
    if (typeof text !== 'string' || text.trim().length < 6) errs.push(`${w}:${i} 敘述太短`);
    if (tv !== 0 && tv !== 1) errs.push(`${w}:${i} 對錯要寫 1 或 0`);
    if (typeof ex !== 'string' || ex.trim().length < 8) errs.push(`${w}:${i} 說明不完整`);
  });
});
// 不能讓長度透露對錯（2026-11-11：四選一的正解常常最長）：每章對的句子和錯的句子平均長度差 20% 以內，全部差 10% 以內；對的句子佔 35–65%
const len = s => s[0].length, avg = a => a.reduce((x, y) => x + y, 0) / a.length;
const bal = (ss, tol, where) => { const T = ss.filter(s => s[1]).map(len), F = ss.filter(s => !s[1]).map(len);
  if (!T.length || !F.length) return; const r = avg(T) / avg(F); if (Math.abs(r - 1) > tol) errs.push(`${where} 對的句子平均 ${avg(T).toFixed(1)} 字、錯的 ${avg(F).toFixed(1)} 字，長度會透露答案`); };
units.forEach(u => bal(DIAG.filter(q => q.u === u).flatMap(q => q.s), .2, u));
const all = DIAG.flatMap(q => q.s); bal(all, .1, '全部');
if (all.length) { const r = all.filter(s => s[1]).length / all.length; if (r < .35 || r > .65) errs.push(`對的句子佔 ${(100 * r).toFixed(0)}%，太偏`); }
// 每題對幾句要有變化：同一個數字超過六成就能被猜出規律（2026-11-11：原本 42 題有 39 題剛好 2 句對）
if (DIAG.length >= 12) { const d = [0, 0, 0, 0, 0]; DIAG.forEach(q => d[q.s.filter(s => s[1]).length]++); if (Math.max(...d) > .6 * DIAG.length || d.filter(x => x).length < 4) errs.push(`每題對幾句的分布太集中：${d.join(',')}`); }
UNITS.forEach(p => { const n = p.items.map(([u]) => DIAG.filter(q => q.u === u).length);
  if (n.some(x => x) && n.some(x => x !== 6)) errs.push(`${p.part} 有章節不是 6 題：${n.join(',')}`); });
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
console.log(`bio data ok：${units.length} 章，${DIAG.length} 題、${DIAG.length * 4} 句`);
