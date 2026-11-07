// 產生首頁用的化學章節資料：章名、所屬部分、每份考卷約幾題（志願校中國醫藥的比重）、題目數。
// 由 build.py 每次建置時執行，輸出到 src/portal/chem-meta.js（不要手改那個檔）。
const fs = require('fs'), path = require('path'), R = path.join(__dirname, '../../src/chem/');
const src = fs.readFileSync(R + 'content.js', 'utf8').replace(/^const (UNITS|TREE|CH|STEPS) =/mg, 'global.$1 =');
global.CH = []; global.STEPS = {};
eval(src);
for (const f of fs.readdirSync(R + 'ch')) eval(fs.readFileSync(R + 'ch/' + f, 'utf8'));
const order = UNITS.flatMap(p => p.items.map(i => i[0]));
const part = u => UNITS.find(p => p.items.some(i => i[0] === u)).key;
// 題目識別碼與所屬小節：要和 src/chem/app.js 的 strip、qhash、qid、secOf 一致
const strip = h => String(h).replace(/<[^>]+>/g, '');
const qhash = s => { let h = 5381; for (const ch of s) h = ((h << 5) + h + ch.codePointAt(0)) >>> 0; return h.toString(36); };
const qid = (cid, q, k) => q.id || qhash(cid + '|' + k + '|' + strip(q.q));
const secOf = (c, q) => { if (q.s) return q.s; const k = q.show ? c.sections.findIndex(s => [].concat(s.w || []).includes(q.show.w)) : -1; return k + 1; };
// s：每一節的題目（'題型|識別碼'），最後一組是綜合練習；沒有題目的小節不列（量不到進度）
const secs = c => { const g = Array.from({ length: c.sections.length + 1 }, () => []);
  [['q', c.quiz || []], ['x', c.exam || []]].forEach(([k, qs]) => qs.forEach(q => g[(secOf(c, q) || c.sections.length + 1) - 1].push(k + '|' + qid(c.id, q, k))));
  return g.filter(x => x.length); };
const out = CH.slice().sort((a, b) => order.indexOf(a.unit) - order.indexOf(b.unit)).map(c => ({
  id: c.id, t: c.title.split('：')[0], p: part(c.unit), w: (TREE[c.unit] || { w: [0, 0, 0] }).w[2], n: (c.quiz || []).length + (c.exam || []).length, s: secs(c),
}));
process.stdout.write('/* 由 tools/chem/meta.js 自動產生，請勿手改 */\nconst CHEM_META = ' + JSON.stringify(out) + ';\n');
