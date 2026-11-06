// 選項不可提示答案（寫作標準 S7）：正解不可是唯一最長且長 1.3 倍以上，也不可只有正解附括號說明。
// 用法：node tests/options.test.js [--list]；目前檢查英文全部與化學 tests/chem/strict.txt 列出的章節。
const fs = require('fs'), path = require('path'), R = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const L = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, '').length, P = s => /[（(]/.test(String(s).replace(/<[^>]+>/g, ''));
function bad(opts, ri) {
  const ls = opts.map(L), r = ls[ri], o = ls.filter((_, i) => i !== ri);
  if (r > Math.max(...o) && r >= 1.3 * Math.min(...o) && r - Math.max(...o) >= 3) return '正解最長';
  if (P(opts[ri]) && !opts.some((x, i) => i !== ri && P(x))) return '只有正解有括號';
  return '';
}
const out = [];
const src = ['src/eng/ui.js', ...fs.readdirSync(path.join(__dirname, '../src/eng/wk')).sort().map(f => 'src/eng/wk/' + f)].map(R).join('\n');
const W = new Function('localStorage', src + ';return WEEKS;')({ getItem: () => null, setItem() {} });
W.forEach(w => {
  w.sents.flat().forEach(s => s.steps.forEach(st => { const b = bad(st.slice(1, 4), 0); if (b) out.push(['英文長句', b, st[0], st.slice(1, 4)]); }));
  [...w.gram.flatMap(g => g.qs), ...w.passages.flatMap(p => p.qs)].forEach(q => {
    const b = bad(q.o, 0); if (b) out.push(['英文題目 ' + q.id, b, q.q, q.o]);
    (q.st || []).forEach(st => { const b2 = bad(st.slice(1, 4), 0); if (b2) out.push(['英文步驟 ' + q.id, b2, st[0], st.slice(1, 4)]); });
  });
});
const strict = R('tests/chem/strict.txt').split('\n').filter(l => l.trim() && !l.startsWith('#'));
const STEPS = new Function('const STEPS = {};' + strict.map(c => R(`src/chem/st/${c}.js`)).join('\n') + ';return STEPS;')();
Object.entries(STEPS).forEach(([c, m]) => Object.entries(m).forEach(([k, sts]) => sts.forEach(st => { const b = bad(st.slice(1, 4), 0); if (b) out.push([`化學步驟 ${c} ${k}`, b, st[0], st.slice(1, 4)]); })));
if (process.argv.includes('--list')) out.forEach(x => console.log(JSON.stringify(x)));
if (out.length) { console.log(`選項提示答案：${out.length} 組`); process.exit(1); }
console.log('選項 OK');
