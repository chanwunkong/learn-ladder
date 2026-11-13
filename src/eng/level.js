/* ---------- 後中英文：單字程度測驗 ----------
   60 個字取自三校 106–115 年 30 份考卷（analysis/eng/vocab.tsv），各程度至少出現在 3 份，前兩週學過的字不收。
   選中文意思；不會就按「不知道」，不要猜。結果決定新單字從哪個程度開始，也會放進每週匯出。 */
const LEVEL_BANDS = [['A', '常用字 2000–3000 名'], ['B', '3000–6000 名'], ['C', '6000–12000 名'], ['D', '12000 名以後']];
const LEVEL_WORDS = [
  ['appropriate', 'adj.', '適當的', 'A'], ['determine', 'v.', '決定、查明', 'A'], ['maintain', 'v.', '維持、保養', 'A'], ['equivalent', 'adj. / n.', '相等的；等同物', 'A'],
  ['domestic', 'adj.', '國內的、家庭的', 'A'], ['constantly', 'adv.', '不斷地', 'A'], ['capable', 'adj.', '有能力的', 'A'], ['identify', 'v.', '辨認、找出', 'A'],
  ['concentration', 'n.', '濃度；專注', 'B'], ['restore', 'v.', '恢復、修復', 'B'], ['precise', 'adj.', '精確的', 'B'], ['extend', 'v.', '擴大、延伸', 'B'],
  ['suitable', 'adj.', '合適的', 'B'], ['potentially', 'adv.', '潛在地、可能', 'B'], ['component', 'n.', '成分、零件', 'B'], ['regardless', 'adv.', '不管、無論', 'B'],
  ['harsh', 'adj.', '嚴厲的、惡劣的', 'B'], ['aspect', 'n.', '方面、層面', 'B'], ['assist', 'v.', '協助', 'B'], ['establish', 'v.', '建立、確立', 'B'],
  ['extent', 'n.', '程度', 'B'], ['absence', 'n.', '不在、缺席', 'B'], ['parallel', 'adj. / n.', '平行的；相似之處', 'B'], ['substantial', 'adj.', '大量的、可觀的', 'B'],
  ['excess', 'n. / adj.', '過量；多餘的', 'B'], ['intellectual', 'adj.', '智力的、知識的', 'B'], ['consistently', 'adv.', '一貫地', 'B'], ['occur', 'v.', '發生', 'B'],
  ['comprehend', 'v.', '理解', 'C'], ['minimize', 'v.', '減到最少', 'C'], ['inevitably', 'adv.', '不可避免地', 'C'], ['facilitate', 'v.', '促進、使容易', 'C'],
  ['breakthrough', 'n.', '突破', 'C'], ['viable', 'adj.', '可行的', 'C'], ['modify', 'v.', '修改', 'C'], ['reinforce', 'v.', '強化、加強', 'C'],
  ['prejudice', 'n.', '偏見', 'C'], ['offset', 'v.', '抵銷', 'C'], ['complexity', 'n.', '複雜性', 'C'], ['adaptation', 'n.', '適應；改編', 'C'],
  ['skeptical', 'adj.', '懷疑的', 'C'], ['possess', 'v.', '擁有', 'C'], ['interference', 'n.', '干擾、干涉', 'C'], ['assess', 'v.', '評估', 'C'],
  ['dominate', 'v.', '主導、支配', 'C'], ['transparent', 'adj.', '透明的', 'C'], ['threaten', 'v.', '威脅', 'C'], ['intend', 'v.', '打算、意圖', 'C'],
  ['overlook', 'v.', '忽略；俯瞰', 'D'], ['confine', 'v.', '限制、侷限', 'D'], ['complication', 'n.', '併發症', 'D'], ['dilute', 'v.', '稀釋', 'D'],
  ['prolong', 'v.', '延長', 'D'], ['indispensable', 'adj.', '不可或缺的', 'D'], ['hinder', 'v.', '阻礙', 'D'], ['tentative', 'adj.', '暫定的、試探性的', 'D'],
  ['jeopardize', 'v.', '危及', 'D'], ['deficient', 'adj.', '不足的、缺乏的', 'D'], ['infer', 'v.', '推斷', 'D'], ['discriminate', 'v.', '區別；歧視', 'D'],
];
const levelOrder = () => shuffled(LEVEL_WORDS.length, 'level-v1').map(i => LEVEL_WORDS[i]);
// 誤答：其他測驗字的中文，先挑詞性相同、意思不重疊的
function levelFoils(x) {
  const pos = p => p.split(/[\s/]/)[0], pick = [];
  const pool = LEVEL_WORDS.filter(y => y !== x && !zhClash(y[2], x[2])).sort((a, b) => (pos(a[1]) !== pos(x[1])) - (pos(b[1]) !== pos(x[1])) || hash(x[0] + a[0]) - hash(x[0] + b[0]));
  for (const y of pool) if (pick.length < 3 && !pick.some(z => zhClash(z[2], y[2]))) pick.push(y);
  return pick;
}
// 每個程度：答對、答錯、不知道；估計認得的比例＝(答對 − 答錯/3) ÷ 題數（扣掉猜對的機會）
function levelStats(ans = store.get('level', {}).ans || {}) {
  return LEVEL_BANDS.map(([b, label]) => {
    const ws = LEVEL_WORDS.filter(x => x[3] === b), n = ws.length, c = { ok: 0, x: 0, q: 0 };
    ws.forEach(x => { if (ans[x[0]]) c[ans[x[0]]]++; });
    const done = c.ok + c.x + c.q, est = done ? Math.max(0, (c.ok - c.x / 3) / done) : 0;
    return { b, label, n, done, ...c, est, miss: ws.filter(x => ans[x[0]] && ans[x[0]] !== 'ok') };
  });
}
// 起點：第一個估計認得不到八成的程度
const levelStart = st => st.find(s => s.done === s.n && s.est < 0.8);
function renderLevel() {
  const L = store.get('level', {}), ans = L.ans || {}, list = levelOrder(), i = list.findIndex(x => !ans[x[0]]);
  if (i < 0) return renderLevelResult();
  const x = list[i], fo = levelFoils(x), o = [x, ...fo], ord = shuffled(4, 'lv' + x[0]);
  $('#main').innerHTML = `<p class="eyebrow">單字程度測驗・${i + 1} / ${list.length}</p><h1>這個字是什麼意思？</h1>
<p class="lede">字都來自近 10 年三校的考卷。<b>不確定就按「不知道」，不要猜</b>，猜對會讓程度看起來比實際高。</p>
<div class="q" data-noans><p class="qt"><span class="enw">${esc(x[0])}</span>${sayBtn(x[0])} <span class="pos">${esc(x[1])}</span></p>
<div class="opts">${ord.map(j => `<button class="opt" type="button" data-lv="${j}">${esc(o[j][2])}</button>`).join('')}<button class="opt" type="button" data-lv="-1">不知道</button></div></div>
<p class="row">${bar(i / list.length)}</p>
<div class="row endrow"><a class="btn" href="#">之後再做（會記住進度）</a></div>`;
  $$('[data-lv]').forEach(b => { b.onclick = () => { const j = +b.dataset.lv; ans[x[0]] = j < 0 ? 'q' : j === 0 ? 'ok' : 'x'; store.set('level', { ans, t: Date.now() }); renderLevel(); window.scrollTo(0, 0); }; });
}
function renderLevelResult() {
  const st = levelStats(), start = levelStart(st), pct = v => Math.round(100 * v) + '%';
  $('#main').innerHTML = `<p class="eyebrow">單字程度測驗</p><h1>測驗結果</h1>
<p class="lede">${start ? `從<b>${esc(start.label)}</b>開始，認得的比例不到八成。下週起新單字從這個程度、考卷最常出現的字開始。` : '每個程度都認得八成以上，新單字會從最難的程度開始。'}</p>
<table class="lvtab"><thead><tr><th>程度</th><th>答對</th><th>答錯</th><th>不知道</th><th>估計認得</th></tr></thead><tbody>
${st.map(s => `<tr${s === start ? ' class="cur"' : ''}><td>${esc(s.label)}</td><td>${s.ok}</td><td>${s.x}</td><td>${s.q}</td><td>${pct(s.est)}</td></tr>`).join('')}</tbody></table>
<p class="small mut">估計認得＝(答對 − 答錯÷3) ÷ 題數，扣掉四選一猜對的機會。</p>
<h2>不認得的字</h2>
${st.map(s => s.miss.length ? `<p><b>${esc(s.label)}</b>：${s.miss.map(x => `<span class="enw">${esc(x[0])}</span> <span class="mut">${esc(x[2])}</span>`).join('、')}</p>` : '').join('') || '<p class="note">全部答對。</p>'}
<p class="note">結果會放進「本週報告與匯出」，產生下一週時會用到。</p>
<div class="row endrow"><a class="btn pri" href="#">回到本週</a><button class="btn" type="button" id="lvAgain">重新測驗</button></div>`;
  $('#lvAgain').onclick = () => { if (confirm('清除這次的答案，重新測驗？')) { store.set('level', {}); renderLevel(); } };
}
// 匯出用：程度測驗的結果
function levelMD() {
  const L = store.get('level', {}); if (!L.ans || !Object.keys(L.ans).length) return '';
  const st = levelStats(L.ans), start = levelStart(st);
  return `\n### 單字程度測驗（${new Date(L.t).toLocaleDateString('zh-TW')}，考卷字各程度抽樣）
| 程度 | 答對 | 答錯 | 不知道 | 估計認得 |
|---|---|---|---|---|
${st.map(s => `| ${s.label} | ${s.ok} | ${s.x} | ${s.q} | ${Math.round(100 * s.est)}% |`).join('\n')}

新單字起點：${start ? start.label : '各程度都認得八成以上'}
不認得的字：${st.flatMap(s => s.miss.map(x => x[0])).join(', ') || '（沒有）'}
`;
}
