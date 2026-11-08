// 題目識別碼檢查：同一章內不能有兩題的識別碼相同（否則練習紀錄會混在一起）
// 並把目前所有題目的識別碼存到 tests/chem/qids.txt；與上次相比消失的題目會讓測試失敗（2026-11-08：改寫題目後舊錯題對不到題目，首頁和錯題本頁數字不一致）
// 處理方法：改寫的題目在新題目加 was: ['舊識別碼']；搬到別章不用處理（識別碼不變就找得到）；真的刪掉就把識別碼加到 tests/chem/retired.txt
const fs = require('fs'), path = require('path');
global.CH = [];
const dir = path.join(__dirname, '../../src/chem/ch');
for (const f of fs.readdirSync(dir)) eval(fs.readFileSync(path.join(dir, f), 'utf8'));
const strip = h => String(h).replace(/<[^>]+>/g, '');
const qhash = s => { let h = 5381; for (const ch of s) h = ((h << 5) + h + ch.codePointAt(0)) >>> 0; return h.toString(36); };
const ids = [], alias = new Set(); let bad = 0;
for (const c of CH) { const seen = new Map();
  for (const k of ['quiz', 'exam']) (c[k] || []).forEach((q, i) => { const id = q.id || qhash(c.id + '|' + (k === 'exam' ? 'x' : 'q') + '|' + strip(q.q)), key = c.id + '|' + id;
    if (seen.has(key)) { console.log(`重複識別碼：${c.id} ${k}[${i}] 與 ${seen.get(key)}：${strip(q.q).slice(0, 40)}`); bad++; } seen.set(key, `${k}[${i}]`); ids.push(`${key}\t${strip(q.q).slice(0, 40)}`); alias.add(id); (q.was || []).forEach(x => alias.add(x)); }); }
const file = path.join(__dirname, 'qids.txt');
const rf = path.join(__dirname, 'retired.txt'), retired = new Set(fs.existsSync(rf) ? fs.readFileSync(rf, 'utf8').split('\n').map(l => l.split('\t')[0].trim()).filter(Boolean) : []);
if (fs.existsSync(file)) { const gone = fs.readFileSync(file, 'utf8').split('\n').filter(l => { const id = l.split('\t')[0].split('|')[1]; return id && !alias.has(id) && !retired.has(id); });
  if (gone.length) { console.log(`${gone.length} 題已不在題庫，舊的錯題紀錄會對不到題目：改寫的在新題目加 was: ['舊識別碼']，刪掉的把識別碼加到 tests/chem/retired.txt\n` + gone.join('\n')); process.exit(1); } }
fs.writeFileSync(file, ids.join('\n') + '\n');
if (bad) process.exit(1);
console.log(`題目識別碼 OK：${ids.length} 題`);
