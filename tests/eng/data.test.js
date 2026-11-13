// 後中英文：檢查每週資料格式（題目選項、步驟、能力代碼、克漏字空格、例句含單字、識別碼不重複）。用法：node tests/eng/data.test.js
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '../../src/eng'), wkDir = process.env.ENG_WK_DIR || path.join(dir, 'wk');
const files = ['ui.js', ...fs.readdirSync(wkDir).sort().map(f => path.join(wkDir, f)), 'app.js'];
const src = files.map(f => fs.readFileSync(path.isAbsolute(f) ? f : path.join(dir, f), 'utf8')).join('\n');
const g = new Function('localStorage', 'document', 'CSS', src + '\n;return { WEEKS, SKILLS, stemRe, qindex, amIds, pmIds, wordQ, zhClash };')({ getItem: () => null, setItem() {} }, {}, {});
const { WEEKS, SKILLS, stemRe, qindex, amIds, pmIds, wordQ, zhClash } = g;
const errs = [], E = (w, m) => errs.push(`第 ${w.n} 週：${m}`);
const sk = (w, k, where) => { if (!SKILLS[k]) E(w, `${where} 能力代碼不存在：${k}`); };
const step = (w, st, where) => { if (st.length < 6 || st.slice(0, 6).some(x => typeof x !== 'string' || !x)) E(w, `${where} 步驟格式錯`); if (new Set(st.slice(1, 4)).size < 3) E(w, `${where} 步驟選項重複`); sk(w, st[5], where); };
const mc = (w, q, where) => {
  if (!q.id || !q.q || !Array.isArray(q.o) || q.o.length !== 4 || !q.why) E(w, `${where} 格式錯`);
  if (new Set(q.o).size !== q.o.length) E(w, `${where} 選項重複`);
  sk(w, q.sk, where); (q.st || []).forEach((st, i) => step(w, st, `${where} 第${i + 1}步`));
  if (!q.st || q.st.length < 2) E(w, `${where} 少於 2 步`);
};
WEEKS.forEach((w, wi) => {
  if (w.n !== wi + 1) E(w, '週次順序不對');
  for (const k of ['words', 'sents', 'gram', 'passages']) if (!Array.isArray(w[k]) || w[k].length !== 7) E(w, `${k} 不是 7 天`);
  const ids = new Set(), seenW = new Set();
  w.words.forEach((day, d) => {
    if (w.n < 3 ? day.length !== (w.n > 1 ? 12 : 10) : day.length < 8 || day.length > 16) E(w, `第${d + 1}天單字有 ${day.length} 個`);   // 第 3 週起每天依程度 8–16 個
    day.forEach(x => {
      if (x.length !== 7) E(w, `${x[0]} 欄位數不對`);
      if (seenW.has(x[0])) E(w, `單字重複：${x[0]}`); seenW.add(x[0]);
      if (!stemRe(x[0]).test(x[4])) E(w, `例句沒有包含 ${x[0]}`);
      if (!Array.isArray(x[6]) || x[6].length !== 3 || x[6].some(p => !Array.isArray(p) || p.length !== 2 || p.some(s => typeof s !== 'string' || !s.trim()))) E(w, `${x[0]} 更多例句格式錯`);
      const all = [x[4], ...(Array.isArray(x[6]) ? x[6].map(p => p[0]) : [])];
      if (new Set(all).size !== 4) E(w, `${x[0]} 例句重複`);
      (x[6] || []).forEach(([en]) => {
        if (!stemRe(x[0]).test(en)) E(w, `更多例句沒有包含 ${x[0]}`);
        const wc = en.trim().split(/\s+/).length; if (wc < 8 || wc > 22) E(w, `${x[0]} 更多例句字數 ${wc} 不在 8–22`);
      });
    });
    if (new Set(day.map(x => x[2])).size !== day.length) E(w, `第${d + 1}天有中文意思相同的字（選項會重複）`);
  });
  const extraOwners = new Map();
  w.words.flat().forEach(x => (x[6] || []).forEach(([en]) => {
    if (extraOwners.has(en) && extraOwners.get(en) !== x[0]) E(w, `更多例句跨單字重複：${en}`);
    extraOwners.set(en, x[0]);
  }));
  w.sents.forEach((day, d) => day.forEach((s, j) => {
    if (!s.core || !s.zh || !s.chunks.length) E(w, `第${d + 1}天長句${j + 1} 缺欄位`);
    s.steps.forEach((st, i) => { step(w, st, `第${d + 1}天長句${j + 1}第${i + 1}步`); Object.keys(st[6] || {}).forEach(k => { if (!s.chunks[k]) E(w, `第${d + 1}天長句${j + 1} 標記片段 ${k} 不存在`); }); });
  }));
  w.gram.forEach((G, d) => { sk(w, G.id, `第${d + 1}天文法`); if (G.qs.length !== 3) E(w, `第${d + 1}天文法題不是 3 題`); G.qs.forEach(q => { if (ids.has(q.id)) E(w, `id 重複 ${q.id}`); ids.add(q.id); mc(w, q, q.id); }); });
  w.passages.forEach((day, d) => {
    const ps = [].concat(day);
    if (w.n > 1 && (!Array.isArray(day) || day.length !== 2)) E(w, `第${d + 1}天 passages 不是兩篇陣列`);
    ps.forEach((P, k) => {
      const want = w.n > 1 ? (k ? 'read' : 'cloze') : (d % 2 === 0 ? 'cloze' : 'read');
      if (P.type !== want) E(w, `第${d + 1}天第${k + 1}篇文章類型應為 ${want}`);
      if (P.qs.length !== 5) E(w, `第${d + 1}天第${k + 1}篇文章題不是 5 題`);
      P.qs.forEach(q => { if (ids.has(q.id)) E(w, `id 重複 ${q.id}`); ids.add(q.id); mc(w, q, q.id); if (P.type === 'read' && !q.pre) E(w, `${q.id} 缺 pre`); });
      if (P.type === 'cloze') { const b = (P.text.join(' ').match(/\{\d\}/g) || []); if (b.length !== P.qs.length) E(w, `第${d + 1}天克漏字空格 ${b.length} 個、題目 ${P.qs.length} 題`); }
      const wc = (P.text.join(' ').match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || []).length, min = w.n > 1 ? (P.type === 'cloze' ? 180 : 200) : 90;
      if (wc < min) E(w, `第${d + 1}天第${k + 1}篇文章只有 ${wc} 字`);
    });
  });
  // 字義題：4 個選項，誤答的中文不可和正解（或彼此）共用詞
  w.words.forEach((day, d) => day.forEach((x, i) => { const q = wordQ(w, d, i);
    if (q.o.length !== 4) E(w, `字義題 ${x[0]} 只有 ${q.o.length} 個選項`);
    q.o.forEach((a, j) => q.o.slice(j + 1).forEach((b, k) => { if (zhClash(a, b)) E(w, `字義題 ${x[0]}：「${a}」和「${b}」意思重疊（${q.ow[j]} / ${q.ow[j + 1 + k]}）`); })); }));
  for (let d = 0; d < 7; d++) [...amIds(w, d), ...pmIds(w, d)].forEach(h => { if (!qindex()[h]) E(w, `索引找不到 ${h}`); });
});
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
console.log(`eng data ok：${WEEKS.length} 週，${Object.keys(qindex()).length} 題`);
