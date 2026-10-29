// 題目識別碼檢查：同一章內不能有兩題的識別碼相同（否則練習紀錄會混在一起）
// 並把目前所有題目的識別碼存到 tests/chem/qids.txt；與上次相比消失的題目會列出來（紀錄仍保留，只是提醒）
const fs = require('fs'), path = require('path');
global.CH = [];
const dir = path.join(__dirname, '../../src/chem/ch');
for (const f of fs.readdirSync(dir)) eval(fs.readFileSync(path.join(dir, f), 'utf8'));
const strip = h => String(h).replace(/<[^>]+>/g, '');
const qhash = s => { let h = 5381; for (const ch of s) h = ((h << 5) + h + ch.codePointAt(0)) >>> 0; return h.toString(36); };
const ids = []; let bad = 0;
for (const c of CH) { const seen = new Map();
  for (const k of ['quiz', 'exam']) (c[k] || []).forEach((q, i) => { const id = q.id || qhash(c.id + '|' + (k === 'exam' ? 'x' : 'q') + '|' + strip(q.q)), key = c.id + '|' + id;
    if (seen.has(key)) { console.log(`重複識別碼：${c.id} ${k}[${i}] 與 ${seen.get(key)}：${strip(q.q).slice(0, 40)}`); bad++; } seen.set(key, `${k}[${i}]`); ids.push(`${key}\t${strip(q.q).slice(0, 40)}`); }); }
const file = path.join(__dirname, 'qids.txt');
if (fs.existsSync(file)) { const now = new Set(ids.map(l => l.split('\t')[0])); const gone = fs.readFileSync(file, 'utf8').split('\n').filter(l => l && !now.has(l.split('\t')[0]));
  if (gone.length) console.log(`提醒：${gone.length} 題已不在題庫（舊紀錄保留並顯示文字快照）：\n` + gone.slice(0, 20).join('\n')); }
fs.writeFileSync(file, ids.join('\n') + '\n');
if (bad) process.exit(1);
console.log(`題目識別碼 OK：${ids.length} 題`);
