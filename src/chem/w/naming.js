/* ---------- 後中化學：有機命名的互動圖 ---------- */

/* ===== 1. 烷類命名：主鏈、編號、排序 =====
   n：主鏈碳數；subs：[位置（由左編號）, 英文, 中文, 碳數] */
const ALKN = [
  { n: 6, subs: [[2, 'methyl', '甲基', 1], [3, 'ethyl', '乙基', 2]], en: 'hexane', zh: '己烷' },
  { n: 5, subs: [[2, 'methyl', '甲基', 1], [2, 'methyl', '甲基', 1], [4, 'methyl', '甲基', 1]], en: 'pentane', zh: '戊烷' },
  { n: 5, subs: [[2, 'chloro', '氯', 0], [3, 'methyl', '甲基', 1]], en: 'pentane', zh: '戊烷' },
  { n: 7, subs: [[3, 'methyl', '甲基', 1], [5, 'ethyl', '乙基', 2], [5, 'methyl', '甲基', 1]], en: 'heptane', zh: '庚烷' },
];
const MULTI = ['', '', 'di', 'tri', 'tetra'], MULTIZ = ['', '', '二', '三', '四'];
function alkName(p, rev) {
  const subs = p.subs.map(([i, e, z, c]) => [rev ? p.n + 1 - i : i, e, z, c]);
  const g = {}; subs.forEach(([i, e, z]) => { (g[e] = g[e] || { z, l: [] }).l.push(i); });
  const keys = Object.keys(g).sort();
  const en = keys.map(k => `${g[k].l.sort((a, b) => a - b).join(',')}-${MULTI[g[k].l.length]}${k}`).join('-') + p.en;
  const zh = keys.map(k => `${g[k].l.sort((a, b) => a - b).join(',')}-${MULTIZ[g[k].l.length]}${g[k].z}`).join('-') + p.zh;
  return { en, zh, loc: subs.map(s => s[0]).sort((a, b) => a - b) };
}
W.namealk = el => {
  const st = { i: 0, rev: 0 };
  el.innerHTML = `${seg('naS', ALKN.map((p, i) => [String(i), `結構 ${i + 1}`]), '0')}${seg('naD', [['0', '由左往右編號'], ['1', '由右往左編號']], '0')}<div id="naG"></div><div class="cards" id="naK"></div><p class="note" id="naN"></p>`;
  function draw() {
    const p = ALKN[st.i], atoms = {}, bonds = [], cnt = {};
    p.subs.forEach(([i]) => { cnt[i] = (cnt[i] || 0) + 1; });
    for (let k = 1; k <= p.n; k++) { const x = (k - (p.n + 1) / 2) * 0.87, y = k % 2 ? -0.25 : 0.25; atoms['c' + k] = { x, y, t: '' }; atoms['n' + k] = { x, y: y - Math.sign(y) * 0.6, t: `<tspan class="cnum">${st.rev ? p.n + 1 - k : k}</tspan>` }; if (k > 1) bonds.push(['c' + (k - 1), 'c' + k, 's']); }
    const used = {};
    p.subs.forEach(([i, e, z, c], j) => { const C0 = atoms['c' + i], dir = Math.sign(C0.y), dx = cnt[i] > 1 ? (used[i] ? 0.45 : -0.45) : 0; used[i] = 1;
      if (c === 0) { atoms['s' + j] = { x: C0.x + dx, y: C0.y + dir * 0.95, t: 'Cl' }; bonds.push(['c' + i, 's' + j, 's']); return; }
      let prev = 'c' + i; for (let m = 0; m < c; m++) { const id = `s${j}_${m}`; atoms[id] = { x: C0.x + dx + (m ? 0.5 : 0), y: C0.y + dir * (0.95 + m * 0.5), t: '' }; bonds.push([prev, id, 's']); prev = id; } });
    $('#naG', el).innerHTML = MOL.svg({ atoms, bonds }, { w: 520, h: 230, s: 50, label: '主鏈與編號' });
    const a = alkName(p, 0), b = alkName(p, 1), cur = st.rev ? b : a;
    const cmp = (x, y) => { for (let k = 0; k < x.length; k++) if (x[k] !== y[k]) return x[k] < y[k] ? 0 : 1; return 0; };
    const best = cmp(a.loc, b.loc);
    $('#naK', el).innerHTML = card('l', '目前的取代基位置', cur.loc.join(', ')) + card('o', '另一方向', (st.rev ? a : b).loc.join(', ')) + card('n', '名稱', st.rev === best ? '<span class="ok">✓ 正確</span>' : '<span class="bad">✗ 編號方向不對</span>');
    $('#naN', el).innerHTML = `<b class="mono">${cur.en}</b>（${cur.zh}）<br>步驟：① 找出最長的碳鏈當主鏈（一樣長時選取代基較多的）；② 從靠近取代基的一端編號，比較兩個方向的位置數組，第一個不同的數字較小者為準；③ 取代基依英文字母排序（di-、tri- 不算進排序），同樣的取代基用 di-、tri- 合併。`;
    pressSeg(el, 'naS', String(st.i)); pressSeg(el, 'naD', String(st.rev));
  }
  bindSeg(el, 'naS', v => { st.i = +v; draw(); });
  bindSeg(el, 'naD', v => { st.rev = +v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. E/Z：CIP 優先順序 =====
   [顯示, 優先序（越大越高）, 判斷依據] */
const CIPG = [['H', 0, '原子序 1'], ['CH₃', 1, 'C（H, H, H）'], ['CH₂CH₃', 2, 'C（C, H, H）'], ['CH(CH₃)₂', 3, 'C（C, C, H）'], ['CH₂OH', 3.5, 'C（O, H, H）'], ['OH', 4, 'O，原子序 8'], ['Cl', 5, 'Cl，原子序 17'], ['Br', 6, 'Br，原子序 35']];
W.ez = el => {
  const st = { a: 6, b: 1, c: 2, d: 0 };   // a、b 在左邊碳（上、下），c、d 在右邊碳（上、下）
  const sel = (id, v) => `<select id="${id}">${CIPG.map((g, i) => `<option value="${i}"${i === v ? ' selected' : ''}>${g[0]}</option>`).join('')}</select>`;
  el.innerHTML = `<div class="w-row"><label class="sel">左上 ${sel('ezA', st.a)}</label><label class="sel">左下 ${sel('ezB', st.b)}</label><label class="sel">右上 ${sel('ezC', st.c)}</label><label class="sel">右下 ${sel('ezD', st.d)}</label></div><div id="ezG"></div><div class="cards" id="ezK"></div><p class="note" id="ezN"></p>`;
  function draw() {
    const [A, B, C, D] = [st.a, st.b, st.c, st.d].map(i => CIPG[i]);
    const hiL = A[1] > B[1] ? 'up' : A[1] < B[1] ? 'down' : null, hiR = C[1] > D[1] ? 'up' : C[1] < D[1] ? 'down' : null;
    const atoms = { C1: { x: -0.65, y: 0, t: '' }, C2: { x: 0.65, y: 0, t: '' }, a: { x: -1.45, y: 0.9, t: A[0], halo: hiL === 'up' ? 0.45 : 0 }, b: { x: -1.45, y: -0.9, t: B[0], halo: hiL === 'down' ? 0.45 : 0 }, c: { x: 1.45, y: 0.9, t: C[0], halo: hiR === 'up' ? 0.45 : 0 }, d: { x: 1.45, y: -0.9, t: D[0], halo: hiR === 'down' ? 0.45 : 0 } };
    $('#ezG', el).innerHTML = MOL.svg({ atoms, bonds: [['C1', 'C2', 'd'], ['C1', 'a', 's'], ['C1', 'b', 's'], ['C2', 'c', 's'], ['C2', 'd', 's']] }, { w: 420, h: 210, s: 60, label: 'E/Z 判斷' });
    const res = !hiL || !hiR ? '無幾何異構' : hiL === hiR ? 'Z' : 'E';
    $('#ezK', el).innerHTML = card('l', '左邊碳的優先基', hiL ? (hiL === 'up' ? A[0] : B[0]) : '兩者相同') + card('r', '右邊碳的優先基', hiR ? (hiR === 'up' ? C[0] : D[0]) : '兩者相同') + card('z', '組態', res);
    $('#ezN', el).innerHTML = !hiL || !hiR ? '雙鍵任一端接了兩個相同的基團，就沒有 E/Z（也沒有 cis/trans）異構物。'
      : `每個雙鍵碳上，比較兩個取代基的優先順序（CIP 規則：先比直接相連原子的原子序，相同時再比下一層的原子：${[A, B, C, D].map(g => `${g[0]} ${g[2]}`).join('；')}）。圈起來的是高優先基：兩個高優先基在<b>同側為 Z</b>（zusammen），<b>對側為 E</b>（entgegen）。E/Z 和 cis/trans 不一定相同：cis/trans 只看兩個相同的基團。`;
  }
  [['A', 'a'], ['B', 'b'], ['C', 'c'], ['D', 'd']].forEach(([i, k]) => { $(`#ez${i}`, el).onchange = e => { st[k] = +e.target.value; draw(); }; });
  draw();
  return { set(s) { Object.assign(st, s); [['A', 'a'], ['B', 'b'], ['C', 'c'], ['D', 'd']].forEach(([i, k]) => { $(`#ez${i}`, el).value = st[k]; }); draw(); } };
};

/* ===== 3. 雙環化合物：三條橋 ===== */
const BIC = { nb: ['降冰片烷', [2, 2, 1]], bco: ['雙環[2.2.2]辛烷', [2, 2, 2]], b330: ['雙環[3.3.0]辛烷', [3, 3, 0]], dec: ['十氫萘', [4, 4, 0]], b311: ['雙環[3.1.1]庚烷', [3, 1, 1]] };
W.bicyclo = el => {
  let cur = 'nb';
  el.innerHTML = `${seg('bcS', Object.entries(BIC).map(([k, v]) => [k, v[0]]), cur)}<div id="bcG"></div><p class="eq" id="bcF"></p><p class="note">兩個環共用兩個以上的碳時，被共用的兩端稱為<b>橋頭碳</b>。三條連接橋頭碳的「橋」各有幾個碳，由大到小寫在方括號裡，總碳數 = 三條橋的碳數 + 2（兩個橋頭碳），字根依總碳數命名。橋上碳數為 0 表示兩個橋頭碳直接相連（兩環共用一個邊）。</p>`;
  const COL = ['var(--c1)', 'var(--c2)', 'var(--c3)'];
  function draw() {
    const [nm, br] = BIC[cur], L = [90, 145], R = [430, 145];
    const hd = `<circle cx="${L[0]}" cy="${L[1]}" r="11" style="fill:var(--bg);stroke:var(--ink);stroke-width:2"/><circle cx="${R[0]}" cy="${R[1]}" r="11" style="fill:var(--bg);stroke:var(--ink);stroke-width:2"/><text class="tk" x="${L[0]}" y="${L[1] + 32}" text-anchor="middle">橋頭碳</text><text class="tk" x="${R[0]}" y="${R[1] + 32}" text-anchor="middle">橋頭碳</text>`;
    let s = '';
    br.forEach((n, j) => { const yOff = [-95, 95, 0][j]; if (n === 0) { s += `<line x1="${L[0]}" y1="${L[1]}" x2="${R[0]}" y2="${R[1]}" style="stroke:${COL[j]};stroke-width:3"/><text class="tk" x="260" y="${L[1] - 10}" text-anchor="middle" style="fill:${COL[j]}">直接相連（0 個碳）</text>`; return; }
      const pts = Array.from({ length: n }, (_, k) => [L[0] + (R[0] - L[0]) * (k + 1) / (n + 1), L[1] + yOff * Math.sin(Math.PI * (k + 1) / (n + 1)) * (j === 2 ? 0 : 1)]);
      s += `<path d="${path([L, ...pts, R])}" fill="none" style="stroke:${COL[j]};stroke-width:3"/>` + pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" style="fill:${COL[j]}"/>`).join('') + `<text class="tk" x="260" y="${L[1] + yOff + (j === 0 ? -14 : j === 1 ? 26 : -16)}" text-anchor="middle" style="fill:${COL[j]}">${n} 個碳</text>`; });
    $('#bcG', el).innerHTML = `<svg class="en" style="max-width:560px;margin:auto" viewBox="40 20 440 260" role="img" aria-label="雙環結構">${s}${hd}</svg>`;
    const tot = br.reduce((a, b) => a + b, 0) + 2, root = ['', '', '', '', '', '', '', 'heptane', 'octane', 'nonane', 'decane'][tot];
    $('#bcF', el).innerHTML = `${nm}：bicyclo[${br.join('.')}]${root}　（${br.join(' + ')} + 2 = ${tot} 個碳）`;
    pressSeg(el, 'bcS', cur);
  }
  bindSeg(el, 'bcS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 4. 官能基的命名優先順序 ===== */
const SUFX = [['羧酸', '-oic acid', 'carboxy-', 'CH₃CH₂COOH propanoic acid'], ['酯', '-oate', '—', 'CH₃COOCH₂CH₃ ethyl acetate（乙酸乙酯）'], ['醯胺', '-amide', 'carbamoyl-', 'CH₃CONH₂ ethanamide'], ['腈', '-nitrile', 'cyano-', 'CH₃CN ethanenitrile'], ['醛', '-al', 'oxo-／formyl-', 'CH₃CH₂CHO propanal'], ['酮', '-one', 'oxo-', 'CH₃COCH₂CH₃ butan-2-one'], ['醇', '-ol', 'hydroxy-', '(CH₃)₂CHCH₂CH₂OH 3-methylbutan-1-ol'], ['胺', '-amine', 'amino-', 'CH₃CH₂NH₂ ethanamine'], ['烯、炔', '-ene、-yne', '—', 'HC≡C–CH=CH–CH₃ pent-3-en-1-yne'], ['鹵素、烷基', '（只當字首）', 'chloro-、methyl-', 'CH₃CHClCH₃ 2-chloropropane']];
W.suffix = el => {
  let cur = 6;
  el.innerHTML = `<div class="bars pk sfx" id="sxB"></div><div class="cards" id="sxK"></div><p class="note">分子中有好幾個官能基時，優先順序最高的當<b>字尾</b>，主鏈要包含它並給它最小的編號，其他官能基改用<b>字首</b>。烯、炔用字尾 -ene、-yne 插在字根中；同時有雙鍵和參鍵時，給多重鍵整組最小編號，若相同則雙鍵優先。酯的名稱是「醇的烷基 + 酸的 -oate」，例如 CH₃CH₂COOCH₃ 是 methyl propanoate。</p>`;
  function draw() {
    $('#sxB', el).innerHTML = SUFX.map(([n], i) => `<div class="${i === cur ? 'on' : ''}" data-i="${i}" role="button"><span>${i + 1}. ${n}</span><i class="ba" style="width:${100 - i * 9}%"></i><b></b></div>`).join('');
    const [n, sx, px, ex] = SUFX[cur];
    $('#sxK', el).innerHTML = card('s', '當字尾', sx) + card('p', '當字首', px) + card('e', '例子', ex);
    $$('#sxB [data-i]', el).forEach(d => { d.onclick = () => { cur = +d.dataset.i; draw(); }; });
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 5. 常見烷基：連接點在哪個碳 ===== */
const ALKYL = {
  pr: ['propyl', '丙基', [[0.87, 0.5], [1.73, 0], [2.6, 0.5]], [[0, 1], [1, 2], [2, 3]], 1, 'CH₃CH₂CH₂–'],
  ipr: ['isopropyl', '異丙基', [[0.87, 0.5], [1.73, 0], [0.87, 1.5]], [[0, 1], [1, 2], [1, 3]], 2, '(CH₃)₂CH–，IUPAC 名 1-methylethyl'],
  bu: ['butyl', '丁基', [[0.87, 0.5], [1.73, 0], [2.6, 0.5], [3.46, 0]], [[0, 1], [1, 2], [2, 3], [3, 4]], 1, 'CH₃CH₂CH₂CH₂–'],
  sbu: ['sec-butyl', '第二丁基', [[0.87, 0.5], [1.73, 0], [2.6, 0.5], [0.87, 1.5]], [[0, 1], [1, 2], [2, 3], [1, 4]], 2, 'CH₃CH₂CH(CH₃)–，IUPAC 名 1-methylpropyl'],
  ibu: ['isobutyl', '異丁基', [[0.87, 0.5], [1.73, 0], [2.6, 0.5], [1.73, -1]], [[0, 1], [1, 2], [2, 3], [2, 4]], 1, '(CH₃)₂CHCH₂–，IUPAC 名 2-methylpropyl'],
  tbu: ['tert-butyl', '第三丁基', [[1, 0], [1.5, 0.87], [1.5, -0.87], [2, 0]], [[0, 1], [1, 2], [1, 3], [1, 4]], 3, '(CH₃)₃C–，IUPAC 名 1,1-dimethylethyl'],
};
W.alkyl = el => {
  let cur = 'sbu';
  el.innerHTML = `${seg('akS', Object.entries(ALKYL).map(([k, v]) => [k, v[0]]), cur)}<div id="akG"></div><div class="cards" id="akK"></div><p class="note">連接點（接到主鏈的碳）用色塊標出。sec-（secondary）表示連接碳是二級碳，tert-（tertiary）表示三級碳。排字母順序時，<b>sec-、tert- 不算</b>（sec-butyl 排在 b），<b>iso- 要算</b>（isopropyl 排在 i）。結構更複雜的取代基，從連接碳編為 1 號，名稱放在括號裡，例如 (1,1,3-trimethylbutyl)。</p>`;
  function draw() {
    const [en, zh, pts, bd, deg, f] = ALKYL[cur], atoms = { R: { x: 0, y: 0, t: '主鏈' } };
    pts.forEach(([x, y], i) => { atoms['c' + i] = { x: x - 1.6, y, t: '', halo: i === 0 ? 0.32 : 0 }; });
    atoms.R.x = -1.6 - 0.9;
    const bonds = bd.map(([a, b]) => [a ? 'c' + (a - 1) : 'R', 'c' + (b - 1), 's']);
    $('#akG', el).innerHTML = MOL.svg({ atoms, bonds }, { w: 420, h: 190, s: 50, cx: 250, label: en });
    $('#akK', el).innerHTML = card('n', '名稱', `${en}（${zh}）`) + card('d', '連接碳', ['', '一級', '二級', '三級'][deg] + '碳') + card('f', '式子', f);
    pressSeg(el, 'akS', cur);
  }
  bindSeg(el, 'akS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.k || cur; draw(); } };
};
