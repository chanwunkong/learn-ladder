// node addst.js 章id 檔案：每行「q3｜問題｜正解｜誤1｜誤2｜說明」，同題多行＝多步；寫入 src/chem/st/章id.js（與既有合併）
const { fs, R, CH, STEPS, strip, key } = require('./stlib.js');
const c = CH.find(x => x.id === process.argv[2]); const st = STEPS[c.id] || {}; let n = 0; const add = {};
for (const line of fs.readFileSync(process.argv[3], 'utf8').split('\n')) { if (!line.trim() || line.startsWith('#')) continue;
  const f = line.split('｜').map(x => x.trim()); const m = f[0].match(/^([qx])(\d+)$/); if (!m || f.length !== 6) { console.log('格式錯：' + line.slice(0, 40)); process.exit(1); }
  const q = (m[1] === 'q' ? c.quiz : c.exam)[+m[2]]; if (!q) { console.log('沒有這題：' + f[0]); process.exit(1); }
  const k = key(c, q, m[1]); (add[k] = add[k] || { t: strip(q.q).slice(0, 24), s: [] }).s.push(f.slice(1)); }
for (const k in add) { st[k] = add[k].s; n++; }
const all = {}; [['q', c.quiz || []], ['x', c.exam || []]].forEach(([kk, arr]) => arr.forEach(q => { all[key(c, q, kk)] = strip(q.q).slice(0, 24); }));
const lines = Object.keys(st).map(k => `  // ${all[k] || '（題目已不在題庫）'}\n  ${JSON.stringify(k)}: [\n${st[k].map(s => '    ' + JSON.stringify(s)).join(',\n')}],`);
fs.writeFileSync(R + 'st/' + c.id + '.js', `/* ---------- 後中化學：${c.title}－各題的拆解步驟 ---------- */\nSTEPS[${JSON.stringify(c.id)}] = {\n${lines.join('\n')}\n};\n`);
console.log(`${c.id}：新增／更新 ${n} 題，共 ${Object.keys(st).length} 題有步驟（全章 ${Object.keys(all).length} 題）`);
