// 拆解步驟檢查：每一步要有 5 個欄位；對不到題目的步驟列出提醒（題目改寫後要重寫步驟）
const fs = require('fs'), path = require('path'), R = path.join(__dirname, '../../src/chem/');
global.CH = []; global.STEPS = {};
for (const f of fs.readdirSync(R + 'ch')) eval(fs.readFileSync(R + 'ch/' + f, 'utf8'));
for (const f of fs.readdirSync(R + 'st')) eval(fs.readFileSync(R + 'st/' + f, 'utf8'));
const strip = h => String(h).replace(/<[^>]+>/g, '');
const qhash = s => { let h = 5381; for (const ch of s) h = ((h << 5) + h + ch.codePointAt(0)) >>> 0; return h.toString(36); };
let bad = 0, n = 0, tot = 0;
for (const c of CH) { const st = STEPS[c.id] || {}, have = new Set();
  [['q', c.quiz || []], ['x', c.exam || []]].forEach(([k, a]) => a.forEach(q => { tot++; have.add(k + ':' + (q.id || qhash(c.id + '|' + k + '|' + strip(q.q)))); }));
  for (const k in st) { n++; if (!have.has(k)) console.log(`提醒：${c.id} ${k} 的步驟對不到題目`);
    st[k].forEach(s => { if (!Array.isArray(s) || s.length !== 5 || s.some(x => !x)) { console.log(`格式錯：${c.id} ${k}`); bad++; } }); } }
if (bad) process.exit(1);
console.log(`拆解步驟 OK：${n} / ${tot} 題有步驟`);
