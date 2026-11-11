// 後中生物：檢查章節與程度測驗題（每章 6 題、四個選項不重複、每個選項都有說明、識別碼不重複、先修存在）。用法：node tests/bio/data.test.js
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
  if (!q.q || !Array.isArray(q.o) || q.o.length !== 4 || new Set(q.o).size !== 4 || q.o.some(x => !String(x).trim())) errs.push(`${w} 選項不是 4 個不重複`);
  if (q.o.includes('不確定')) errs.push(`${w} 選項不能是「不確定」（網站會自己加）`);
  if (!Array.isArray(q.ex) || q.ex.length !== 4 || q.ex.some(x => typeof x !== 'string' || x.trim().length < 8)) errs.push(`${w} 四個選項的說明不完整`);
  if ((q.ex || []).some(x => /\([A-D]\)|選項 ?[A-D]/.test(x))) errs.push(`${w} 說明用選項字母，但選項會打亂`);
});
UNITS.forEach(p => { const n = p.items.map(([u]) => DIAG.filter(q => q.u === u).length);
  if (n.some(x => x) && n.some(x => x !== 6)) errs.push(`${p.part} 有章節不是 6 題：${n.join(',')}`); });
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
console.log(`bio data ok：${units.length} 章，${DIAG.length} 題`);
