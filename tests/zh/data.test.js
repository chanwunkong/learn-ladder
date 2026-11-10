// 後中國文：檢查每週資料格式（7 天、每天早 8 題晚 7 題、四個選項不重複、每個選項都有說明、能力代碼、識別碼不重複）。用法：node tests/zh/data.test.js
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '../../src/zh');
const src = ['ui.js', ...fs.readdirSync(path.join(dir, 'wk')).sort().map(f => 'wk/' + f)].map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
const { ZWEEKS, SKILLS } = new Function('localStorage', src + '\n;return { ZWEEKS, SKILLS };')({ getItem: () => null, setItem() {} });
const errs = [], E = (w, m) => errs.push(`第 ${w.n} 週：${m}`);
let n = 0;
const mc = (w, q, where, ids) => {
  n++;
  if (!q.id || !q.q || !Array.isArray(q.o) || q.o.length !== 4) E(w, `${where} 格式錯`);
  // 每個選項都要有說明（2026-11-10：國文不用一步一步來，改成逐一說明四個選項）
  if (!Array.isArray(q.ex) || q.ex.length !== 4 || q.ex.some(x => typeof x !== 'string' || x.trim().length < 4)) E(w, `${where} 四個選項的說明（ex）不完整`);
  if (q.st || q.why) E(w, `${where} 國文不用 st／why，改用 ex`);
  if (ids.has(q.id)) E(w, `${where} 識別碼重複：${q.id}`); ids.add(q.id);
  if (new Set(q.o).size !== 4 || q.o.some(x => typeof x !== 'string' || !x.trim())) E(w, `${where} 選項重複或空白`);
  if (!SKILLS[q.sk]) E(w, `${where} 能力代碼不存在：${q.sk}`);
  if (q.ex && q.ex.some(x => /\([A-D]\)|選項 ?[A-D]/.test(x))) E(w, `${where} 說明用選項字母，但選項會打亂`);
};
ZWEEKS.forEach((w, wi) => {
  if (w.n !== wi + 1) E(w, '週次順序不對');
  if (w.days.length !== 7) E(w, '不是 7 天');
  const ids = new Set();
  w.days.forEach((x, d) => {
    if (!x.t) E(w, `第${d + 1}天沒有主題`);
    if (x.am.length !== 8) E(w, `第${d + 1}天早上不是 8 題`);
    x.am.forEach(q => mc(w, q, `第${d + 1}天早上 ${q.id}`, ids));
    const pq = x.pm.flatMap(b => (b.qs ? (b.text && b.title ? b.qs : (E(w, `第${d + 1}天晚上題組缺文章或標題`), b.qs)) : [b]));
    if (pq.length !== 7) E(w, `第${d + 1}天晚上不是 7 題`);
    pq.forEach(q => mc(w, q, `第${d + 1}天晚上 ${q.id}`, ids));
  });
});
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
console.log(`zh data ok：${ZWEEKS.length} 週，${n} 題`);
