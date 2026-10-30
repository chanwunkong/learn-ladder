// 產生首頁用的化學章節資料：章名、所屬部分、每份考卷約幾題（志願校中國醫藥的比重）、題目數。
// 由 build.py 每次建置時執行，輸出到 src/portal/chem-meta.js（不要手改那個檔）。
const fs = require('fs'), path = require('path'), R = path.join(__dirname, '../../src/chem/');
const src = fs.readFileSync(R + 'content.js', 'utf8').replace(/^const (UNITS|TREE|CH|STEPS) =/mg, 'global.$1 =');
global.CH = []; global.STEPS = {};
eval(src);
for (const f of fs.readdirSync(R + 'ch')) eval(fs.readFileSync(R + 'ch/' + f, 'utf8'));
const order = UNITS.flatMap(p => p.items.map(i => i[0]));
const part = u => UNITS.find(p => p.items.some(i => i[0] === u)).key;
const out = CH.slice().sort((a, b) => order.indexOf(a.unit) - order.indexOf(b.unit)).map(c => ({
  id: c.id, t: c.title.split('：')[0], p: part(c.unit), w: (TREE[c.unit] || { w: [0, 0, 0] }).w[2], n: (c.quiz || []).length + (c.exam || []).length,
}));
process.stdout.write('/* 由 tools/chem/meta.js 自動產生，請勿手改 */\nconst CHEM_META = ' + JSON.stringify(out) + ';\n');
