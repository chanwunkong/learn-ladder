/* ---------- 後中化學第二章：可旋轉的 3D 分子（形狀、混成、極性三節共用） ----------
   中心原子＋周圍原子＋孤對電子（半透明氣球）；方向用理想的 VSEPR 排列，孤對電子把鍵稍微推開。 */
const M3COL = { H: '#D3D8D6', C: '#59615E', N: '#3A6FD8', O: '#D9453B', F: '#58B34A', Cl: '#3FA34D', Br: '#A0522D', I: '#7B4BA8', S: '#D4B12A', P: '#E08A2E', Xe: '#3BA6B5', B: '#E39A9A', Be: '#8FB35E', Si: '#B39C7F', X: '#8A9590' };
const M3EN = { H: 2.20, B: 2.04, Be: 1.57, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16, Br: 2.96, I: 2.66, Xe: 2.60 };
const M3VAL = { H: 1, Be: 2, B: 3, C: 4, Si: 4, N: 5, P: 5, O: 6, S: 6, F: 7, Cl: 7, Br: 7, I: 7, Xe: 8 };
// 各電子區域數的理想方向；孤對電子依 LP 的順序放（三角雙錐先放赤道，八面體放相對位置）
const M3DIR = {
  2: [[-1, 0, 0], [1, 0, 0]],
  3: [[0, 0, 1], [0.866, 0, -0.5], [-0.866, 0, -0.5]],
  4: [[0, 0, 1], [0.943, 0, -0.333], [-0.471, 0.816, -0.333], [-0.471, -0.816, -0.333]],
  5: [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-0.5, 0.866, 0], [-0.5, -0.866, 0]],
  6: [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]],
};
const M3LP = { 2: [], 3: [0], 4: [0, 1], 5: [2, 3, 4], 6: [0, 1] };
const M3ARR = { 2: '直線', 3: '平面三角形', 4: '四面體', 5: '三角雙錐', 6: '八面體' };
const M3HYB = { 2: 'sp', 3: 'sp²', 4: 'sp³', 5: 'sp³d', 6: 'sp³d²' };
const M3SHAPE = { '2,0': ['直線', '180°'], '3,0': ['平面三角形', '120°'], '3,1': ['彎曲', '略小於 120°'], '4,0': ['正四面體', '109.5°'], '4,1': ['三角錐', '約 107°'], '4,2': ['彎曲', '約 104.5°'],
  '5,0': ['三角雙錐', '90°、120°'], '5,1': ['蹺蹺板', '略小於 90°、120°'], '5,2': ['T 形', '略小於 90°'], '5,3': ['直線', '180°'], '6,0': ['正八面體', '90°'], '6,1': ['四角錐', '略小於 90°'], '6,2': ['平面四方形', '90°'] };
// 分子：[名稱, 中心, 周圍原子（依空位順序）, 鍵級, 電荷, 鍵角（有實測的才寫）]
const M3MOL = {
  co2: ['CO₂', 'C', ['O', 'O'], [2, 2], 0], cs2: ['CS₂', 'C', ['S', 'S'], [2, 2], 0], becl2: ['BeCl₂', 'Be', ['Cl', 'Cl'], [1, 1], 0], no2p: ['NO₂⁺', 'N', ['O', 'O'], [2, 2], 1],
  bf3: ['BF₃', 'B', ['F', 'F', 'F'], [1, 1, 1], 0], so3: ['SO₃', 'S', ['O', 'O', 'O'], [2, 2, 2], 0], no3: ['NO₃⁻', 'N', ['O', 'O', 'O'], [2, 1, 1], -1],
  so2: ['SO₂', 'S', ['O', 'O'], [2, 2], 0, '約 119°'], o3: ['O₃', 'O', ['O', 'O'], [2, 1], 0, '約 117°'], no2m: ['NO₂⁻', 'N', ['O', 'O'], [2, 1], -1, '約 115°'],
  ch4: ['CH₄', 'C', ['H', 'H', 'H', 'H'], [1, 1, 1, 1], 0], ccl4: ['CCl₄', 'C', ['Cl', 'Cl', 'Cl', 'Cl'], [1, 1, 1, 1], 0], sicl4: ['SiCl₄', 'Si', ['Cl', 'Cl', 'Cl', 'Cl'], [1, 1, 1, 1], 0],
  ch3cl: ['CH₃Cl', 'C', ['Cl', 'H', 'H', 'H'], [1, 1, 1, 1], 0], ch2cl2: ['CH₂Cl₂', 'C', ['Cl', 'Cl', 'H', 'H'], [1, 1, 1, 1], 0], chcl3: ['CHCl₃', 'C', ['H', 'Cl', 'Cl', 'Cl'], [1, 1, 1, 1], 0],
  nh4: ['NH₄⁺', 'N', ['H', 'H', 'H', 'H'], [1, 1, 1, 1], 1],
  nh3: ['NH₃', 'N', ['H', 'H', 'H'], [1, 1, 1], 0, '107°'], nf3: ['NF₃', 'N', ['F', 'F', 'F'], [1, 1, 1], 0, '102°'], ncl3: ['NCl₃', 'N', ['Cl', 'Cl', 'Cl'], [1, 1, 1], 0, '107°'], pcl3: ['PCl₃', 'P', ['Cl', 'Cl', 'Cl'], [1, 1, 1], 0, '100°'],
  h2o: ['H₂O', 'O', ['H', 'H'], [1, 1], 0, '104.5°'], h2s: ['H₂S', 'S', ['H', 'H'], [1, 1], 0, '92°'], scl2: ['SCl₂', 'S', ['Cl', 'Cl'], [1, 1], 0, '103°'], of2: ['OF₂', 'O', ['F', 'F'], [1, 1], 0, '103°'],
  pcl5: ['PCl₅', 'P', ['Cl', 'Cl', 'Cl', 'Cl', 'Cl'], [1, 1, 1, 1, 1], 0], sf4: ['SF₄', 'S', ['F', 'F', 'F', 'F'], [1, 1, 1, 1], 0], clf3: ['ClF₃', 'Cl', ['F', 'F', 'F'], [1, 1, 1], 0],
  brf3: ['BrF₃', 'Br', ['F', 'F', 'F'], [1, 1, 1], 0], icl3: ['ICl₃', 'I', ['Cl', 'Cl', 'Cl'], [1, 1, 1], 0], xef2: ['XeF₂', 'Xe', ['F', 'F'], [1, 1], 0], i3: ['I₃⁻', 'I', ['I', 'I'], [1, 1], -1],
  sf6: ['SF₆', 'S', ['F', 'F', 'F', 'F', 'F', 'F'], [1, 1, 1, 1, 1, 1], 0], brf5: ['BrF₅', 'Br', ['F', 'F', 'F', 'F', 'F'], [1, 1, 1, 1, 1], 0], if5: ['IF₅', 'I', ['F', 'F', 'F', 'F', 'F'], [1, 1, 1, 1, 1], 0],
  xef4: ['XeF₄', 'Xe', ['F', 'F', 'F', 'F'], [1, 1, 1, 1], 0], icl4: ['ICl₄⁻', 'I', ['Cl', 'Cl', 'Cl', 'Cl'], [1, 1, 1, 1], -1],
};
// 電子對數 =（中心價電子 ＋ 周圍提供的電子 − 電荷）÷ 2；H 與鹵素各提供 1 個，O、S 不提供
const m3give = e => (['H', 'F', 'Cl', 'Br', 'I'].includes(e) ? 1 : 0);
function m3info(k) {
  const [n, c, L, bo, q, ang] = M3MOL[k], give = L.reduce((s, e) => s + m3give(e), 0), tot = M3VAL[c] + give - q, d = tot / 2, lp = d - L.length;
  return { k, n, c, L, bo, q, ang, give, tot, d, lp };
}
// 一個分子的 3D 模型：回傳 { quads, labels, pos（周圍原子位置）, dirs, lps }
function m3model(info, o = {}) {
  const { d, lp, c, L, bo } = info, R = o.R || 1.3, lpIdx = o.lpIdx || M3LP[d].slice(0, lp), dirs0 = M3DIR[d];
  const lpd = lpIdx.map(i => dirs0[i]), free = dirs0.map((_, i) => i).filter(i => !lpIdx.includes(i));
  const push = v => R3D.norm(lpd.reduce((s, u) => [s[0] - 0.13 * u[0], s[1] - 0.13 * u[1], s[2] - 0.13 * u[2]], v));
  const dirs = free.map(i => (lpd.length ? push(dirs0[i]) : dirs0[i])), pos = dirs.map(u => u.map(x => x * R));
  const q = [], labels = [], hasL = !o.noLabel;
  q.push(...R3D.ball([0, 0, 0], 0.34, M3COL[c] || M3COL.X, 1));
  dirs.forEach((u, i) => {
    const e = L[i] || 'X', r = e === 'H' ? 0.2 : 0.28, p = pos[i], b = bo[i] || 1;
    if (b === 1) q.push(...R3D.tube(u.map(x => x * 0.3), u.map(x => x * (R - r)), 0.065, '#9AA3A0', 1));
    else { const side = R3D.norm(Math.abs(u[2]) < 0.9 ? [u[1], -u[0], 0] : [0, u[2], -u[1]]); [-1, 1].forEach(sg => q.push(...R3D.tube(u.map((x, k) => x * 0.3 + side[k] * 0.07 * sg), u.map((x, k) => x * (R - r) + side[k] * 0.07 * sg), 0.045, '#9AA3A0', 1))); }
    q.push(...R3D.ball(p, r, M3COL[e] || M3COL.X, 1));
    if (hasL) labels.push({ p: p.map(x => x * 1.32), t: e, size: 24 });
  });
  if (o.lpShow !== false) lpd.forEach(u => q.push(...R3D.ellipsoid(u.map(x => x * 0.6), u, 0.46, 0.3, '#6E9BE6', 0.38)));
  if (hasL) labels.push({ p: [0, 0, 0], t: c, size: 26, big: true, fix: true });
  return { quads: q, labels, pos, dirs, lps: lpd };
}
const m3canvas = (el, id, w, h, aria) => { const box = $(`#${id}`, el); if (!box.querySelector('canvas')) box.innerHTML = `<canvas width="${w}" height="${h}" class="r3d" style="max-width:${Math.round(w * 0.64)}px" aria-label="${aria}，左右拖動旋轉"></canvas>`; return box.querySelector('canvas'); };
const m3opts = (pick, sel) => Object.entries(pick).map(([g, ks]) => `<optgroup label="${g}">${ks.map(k => `<option value="${k}"${k === sel ? ' selected' : ''}>${M3MOL[k][0]}</option>`).join('')}</optgroup>`).join('');

/* ===== 第 5 節：分子是什麼形狀？ ===== */
const M3FIRST = { '2,0': 'co2', '3,0': 'bf3', '3,1': 'so2', '4,0': 'ch4', '4,1': 'nh3', '4,2': 'h2o', '5,0': 'pcl5', '5,1': 'sf4', '5,2': 'clf3', '5,3': 'xef2', '6,0': 'sf6', '6,1': 'brf5', '6,2': 'xef4' };
const M3PICK = { '2 個區域': ['co2', 'becl2', 'no2p'], '3 個區域': ['bf3', 'so3', 'no3', 'so2', 'o3', 'no2m'], '4 個區域': ['ch4', 'ccl4', 'sicl4', 'nh4', 'nh3', 'pcl3', 'nf3', 'h2o', 'h2s', 'of2'],
  '5 個區域': ['pcl5', 'sf4', 'clf3', 'brf3', 'icl3', 'xef2', 'i3'], '6 個區域': ['sf6', 'brf5', 'if5', 'xef4', 'icl4'] };
W.vsepr = el => {
  const st = { m: 'nh3' }; let V = null;
  const MAXLP = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 2 };
  el.innerHTML = `<div class="w-row">${ctl('例子', `<label class="sel"><select id="vsM">${m3opts(M3PICK, st.m)}</select></label>`)}</div>
<div class="w-row">${ctl('電子區域數', segX('vsD', [2, 3, 4, 5, 6].map(v => [String(v), String(v)]), '4'))}${ctl('其中孤對電子', segX('vsL', [0, 1, 2, 3].map(v => [String(v), String(v)]), '1'))}</div>
<p class="eq" id="vsF"></p><div id="vsV"></div><div class="cards" id="vsK"></div><p class="note" id="vsN"></p>`;
  function draw() {
    const I = m3info(st.m), key = `${I.d},${I.lp}`, [shape, ang0] = M3SHAPE[key], ang = I.ang || ang0;
    if (!V) V = R3D.view(m3canvas(el, 'vsV', 600, 470, `${I.n} 的立體模型`));
    const M = m3model(I); V.set({ quads: M.quads, labels: M.labels, scale: 128, axes: 0, dot: false });
    $('#vsF', el).innerHTML = `${I.n}：中心 ${I.c} 價電子 ${M3VAL[I.c]}${I.give ? ` ＋ ${I.L.length} 個 ${[...new Set(I.L)].join('、')} 提供 ${I.give}` : `（${[...new Set(I.L)].join('、')} 不提供）`}${I.q ? ` ${I.q > 0 ? '−' : '＋'} 電荷 ${Math.abs(I.q)}` : ''} = ${I.tot} 個電子 → <b>${I.d} 對</b> = ${I.L.length} 個鍵 ＋ <b>${I.lp} 對孤對</b>`;
    $('#vsK', el).innerHTML = card('g', '電子區域排列', M3ARR[I.d]) + card('s', '分子形狀', shape) + card('a', '鍵角', ang) + card('h', '中心原子混成', M3HYB[I.d]);
    $('#vsN', el).innerHTML = `藍色氣球是孤對電子：它佔一個方向，但<b>分子形狀只看原子</b>，氣球「看不見」。${I.lp ? '氣球比鍵胖（孤對電子只被一個原子核拉住，散得比較開），把旁邊的鍵往外推，鍵角變小。' : '沒有孤對電子，所有方向都是鍵，形狀和電子區域排列相同。'}${I.d === 5 && I.lp ? '三角雙錐的孤對電子都放在赤道（下一張圖說明原因）。' : ''}${I.d === 6 && I.lp === 2 ? '兩對孤對電子放在上下相對的位置，離彼此最遠。' : ''}`;
    $('#vsM', el).value = st.m; pressSeg(el, 'vsD', String(I.d));
    $$('#vsL button', el).forEach(b => { b.disabled = +b.dataset.v > MAXLP[I.d]; b.setAttribute('aria-pressed', String(+b.dataset.v === I.lp)); });
  }
  $('#vsM', el).onchange = e => { st.m = e.target.value; draw(); };
  bindSeg(el, 'vsD', v => { const lp = Math.min(m3info(st.m).lp, MAXLP[v]); st.m = M3FIRST[`${v},${lp}`]; draw(); });
  bindSeg(el, 'vsL', v => { st.m = M3FIRST[`${m3info(st.m).d},${v}`]; draw(); });
  draw();
  return { set(s) { if (s.m && M3MOL[s.m]) st.m = s.m; else if (s.d) st.m = M3FIRST[`${s.d},${s.lp || 0}`] || st.m; draw(); } };
};

/* ===== 第 5 節：原因畫在圖上（孤對電子壓縮鍵角；三角雙錐孤對放赤道） ===== */
W.lpwhy = el => {
  const st = { v: 'ang' }; let V = null;
  el.innerHTML = `<div class="w-row">${ctl('比較', segX('lwS', [['ang', 'CH₄、NH₃、H₂O 的鍵角'], ['tbp', 'SF₄ 的孤對放哪裡']], st.v))}</div><div id="lwV"></div><p class="note" id="lwN"></p>`;
  function draw() {
    if (!V) V = R3D.view(m3canvas(el, 'lwV', 900, 430, '並排比較的立體模型'));
    let quads = [], labels = [];
    if (st.v === 'ang') {
      ['ch4', 'nh3', 'h2o'].forEach((k, i) => { const I = m3info(k), M = m3model(I, { R: 1.15 }), o = [(i - 1) * 2.9, 0.15];
        quads.push(...R3D.shift(M.quads, o)); labels.push(...M.labels.map(l => ({ ...l, o })), { p: [0, 0, 0], o: [o[0], -1.75], t: `${I.n}　${I.ang || '109.5°'}`, size: 28, big: true, fix: true }, { p: [0, 0, 0], o: [o[0], -2.12], t: `孤對 ${I.lp} 對`, size: 22, fix: true, c: '#4A78C8' }); });
      $('#lwN', el).innerHTML = '三個分子都是 4 個電子區域（四面體排列）。孤對電子的氣球比鍵胖，每多一對就把鍵擠得更近：109.5° → 107° → 104.5°。排斥力大小：孤對–孤對 &gt; 孤對–鍵 &gt; 鍵–鍵。第三週期的 H₂S 鍵角只有約 92°：S 比 O 大、電負度小，鍵結電子離 S 較遠、彼此推得不緊，S 幾乎直接用互相垂直（90°）的 3p 軌域和 H 成鍵。';
    } else {
      [[2], [0]].forEach((lpIdx, i) => { const I = m3info('sf4'), M = m3model(I, { R: 1.15, lpIdx }), o = [(i - 0.5) * 3.6, 0.15], u = M.lps[0];
        quads.push(...R3D.shift(M.quads, o));
        const near = M.pos.filter(p => Math.abs(p[0] * u[0] + p[1] * u[1] + p[2] * u[2]) / 1.15 < 0.45);
        near.forEach(p => quads.push(...R3D.shift(R3D.tube(u.map(x => x * 0.62), p.map(x => x * 0.62), 0.035, '#D0342C', 0.95), o)));
        labels.push(...M.labels.map(l => ({ ...l, o })), { p: [0, 0, 0], o: [o[0], -1.75], t: i ? '孤對在軸向' : '孤對在赤道', size: 28, big: true, fix: true }, { p: [0, 0, 0], o: [o[0], -2.12], t: `90° 的排斥 ${near.length} 個`, size: 24, fix: true, c: '#C0392B' }); });
      $('#lwN', el).innerHTML = '紅線連到和孤對電子成 90° 的鍵。90° 靠得最近，排斥最強；120° 遠得多，可以不計。孤對放在赤道只有 2 個 90° 的鄰居，放在軸向有 3 個，所以孤對電子放赤道。ClF₃（2 對）、XeF₂（3 對）也照這個規則，依序得到 T 形與直線形。';
    }
    V.set({ quads, labels, scale: 96, axes: 0, dot: false });
    pressSeg(el, 'lwS', st.v);
  }
  bindSeg(el, 'lwS', v => { st.v = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 第 6 節：混成與 σ、π 鍵 =====
   原子 [元素, x, y, z, 混成]、鍵 [i, j, 鍵級]、p 軌域 [原子, 軸 'y'|'z', π 編號] */
const HYBM = {
  c2h4: ['乙烯 CH₂=CH₂', [['C', -0.67, 0, 0, 'sp²'], ['C', 0.67, 0, 0, 'sp²'], ['H', -1.25, 0, 0.95], ['H', -1.25, 0, -0.95], ['H', 1.25, 0, 0.95], ['H', 1.25, 0, -0.95]], [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]], [[0, 'y', 0], [1, 'y', 0]], true],
  hcho: ['甲醛 H₂C=O', [['C', -0.4, 0, 0, 'sp²'], ['O', 0.85, 0, 0, 'sp²'], ['H', -1.0, 0, 0.95], ['H', -1.0, 0, -0.95]], [[0, 1, 2], [0, 2, 1], [0, 3, 1]], [[0, 'y', 0], [1, 'y', 0]], true],
  allene: ['丙二烯 CH₂=C=CH₂', [['C', -1.3, 0, 0, 'sp²'], ['C', 0, 0, 0, 'sp'], ['C', 1.3, 0, 0, 'sp²'], ['H', -1.88, 0, 0.95], ['H', -1.88, 0, -0.95], ['H', 1.88, 0.95, 0], ['H', 1.88, -0.95, 0]], [[0, 1, 2], [1, 2, 2], [0, 3, 1], [0, 4, 1], [2, 5, 1], [2, 6, 1]], [[0, 'y', 0], [1, 'y', 0], [1, 'z', 1], [2, 'z', 1]], false],
  ketene: ['乙烯酮 CH₂=C=O', [['C', -1.3, 0, 0, 'sp²'], ['C', 0, 0, 0, 'sp'], ['O', 1.2, 0, 0, 'sp²'], ['H', -1.88, 0, 0.95], ['H', -1.88, 0, -0.95]], [[0, 1, 2], [1, 2, 2], [0, 3, 1], [0, 4, 1]], [[0, 'y', 0], [1, 'y', 0], [1, 'z', 1], [2, 'z', 1]], true],
  co2: ['二氧化碳 O=C=O', [['O', -1.2, 0, 0, 'sp²'], ['C', 0, 0, 0, 'sp'], ['O', 1.2, 0, 0, 'sp²']], [[0, 1, 2], [1, 2, 2]], [[0, 'y', 0], [1, 'y', 0], [1, 'z', 1], [2, 'z', 1]], true],
  hcn: ['氰化氫 H–C≡N', [['H', -1.55, 0, 0], ['C', -0.4, 0, 0, 'sp'], ['N', 0.75, 0, 0, 'sp']], [[0, 1, 1], [1, 2, 3]], [[1, 'y', 0], [2, 'y', 0], [1, 'z', 1], [2, 'z', 1]], true],
};
const PICOL = ['#D9822B', '#2E9E6B'];
W.hybrid = el => {
  const st = { m: 'c2h4', p: 'on' }; let V = null;
  el.innerHTML = `<div class="w-row">${ctl('分子', segX('hyS', Object.entries(HYBM).map(([k, v]) => [k, v[0].split(' ')[0]]), st.m))}</div><div class="w-row">${ctl('沒有混成的 p 軌域', segX('hyP', [['on', '顯示'], ['off', '隱藏']], st.p))}</div>
<div id="hyV"></div><div class="cards" id="hyK"></div><p class="note" id="hyN"></p>`;
  function draw() {
    const [nm, at, bd, ps, flat] = HYBM[st.m], P = at.map(a => [a[1], a[3], a[2]]), q = [], labels = [];
    if (!V) V = R3D.view(m3canvas(el, 'hyV', 600, 440, '混成與 π 鍵的立體模型'));
    bd.forEach(([i, j, o]) => { const a = P[i], b = P[j]; q.push(...R3D.tube(a, b, o > 1 ? 0.085 : 0.06, '#9AA3A0', 1)); });
    at.forEach(([e], i) => q.push(...R3D.ball(P[i], e === 'H' ? 0.18 : 0.27, M3COL[e], 1)));
    if (st.p === 'on') ps.forEach(([i, ax, k]) => { const u = ax === 'y' ? [0, 0, 1] : [0, 1, 0];
      [-1, 1].forEach(sg => q.push(...R3D.ellipsoid(P[i].map((x, t) => x + u[t] * 0.48 * sg), u, 0.36, 0.17, PICOL[k], 0.7))); });
    at.forEach(([e, , , , h], i) => { labels.push({ p: P[i].map((x, t) => x + [0, -0.45, -0.25][t]), t: h ? `${e} ${h}` : e, size: 24, fix: true }); });
    V.set({ quads: q, labels, scale: 120, axes: 0, dot: false });
    const nS = bd.length, nP = bd.reduce((s, b) => s + b[2] - 1, 0);
    $('#hyK', el).innerHTML = card('s', 'σ 鍵', `${nS} 個`, '每條連線 1 個') + card('p', 'π 鍵', `${nP} 個`, '雙鍵 1、參鍵 2') + card('f', '所有原子共平面', flat ? '是' : '否');
    $('#hyN', el).innerHTML = `${nm}。同一種顏色的兩個 p 軌域<b>平行並排</b>，肩並肩重疊成一個 π 鍵。${st.m === 'allene' ? '中間的 C 是 sp，剩下兩個互相垂直的 p：左邊的 π（橘）在前後方向、右邊的 π（綠）在上下方向，所以兩端的 CH₂ 被固定在互相垂直的兩個平面，<b>不共平面</b>。轉一轉就看得到。' : st.m === 'c2h4' || st.m === 'hcho' ? '兩個 p 軌域要平行才能重疊，雙鍵兩端的原子就被固定在同一個平面上（轉不動）。' : st.m === 'ketene' ? '和丙二烯一樣有兩個互相垂直的 π，但 O 上沒有 H，剩下的原子仍在同一平面。' : '中心原子是 sp：一個 s 和一個 p 混成兩個軌域指向左右（180°），剩下兩個互相垂直的 p 各形成一個 π。'}混成軌域數 = 電子區域數：2 → sp、3 → sp²、4 → sp³。`;
    pressSeg(el, 'hyS', st.m); pressSeg(el, 'hyP', st.p);
  }
  bindSeg(el, 'hyS', v => { st.m = v; draw(); });
  bindSeg(el, 'hyP', v => { st.p = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 第 7 節：分子有沒有極性？鍵偶極頭尾相接 ===== */
const DPPICK = { '直線': ['co2', 'cs2', 'xef2'], '平面三角形與彎曲': ['bf3', 'so3', 'so2', 'o3'], '四面體類': ['ccl4', 'chcl3', 'ch2cl2', 'ch3cl', 'nh3', 'nf3', 'ncl3', 'pcl3', 'h2o', 'h2s', 'scl2'],
  '三角雙錐類': ['pcl5', 'sf4', 'clf3', 'icl3'], '八面體類': ['sf6', 'brf5', 'xef4'] };
W.dipole = el => {
  const st = { m: 'h2o' }; let V = null;
  el.innerHTML = `<div class="w-row">${ctl('分子', `<label class="sel"><select id="dpM">${m3opts(DPPICK, st.m)}</select></label>`)}</div><div id="dpV"></div><div class="cards" id="dpK"></div><p class="note" id="dpN"></p>`;
  function draw() {
    const I = m3info(st.m), M = m3model(I, { R: 1.2 }), q = [...R3D.shift(M.quads, [-1.55, 0])], labels = M.labels.map(l => ({ ...l, o: [-1.55, 0] }));
    if (!V) V = R3D.view(m3canvas(el, 'dpV', 900, 460, '鍵偶極與向量和的立體模型'));
    // 每個鍵的偶極：指向電負度大的一端（δ−）；O₃ 用形式電荷（中間 +1、兩端平均 −½）
    const vec = M.dirs.map((u, i) => { const dEN = st.m === 'o3' ? 0.6 : M3EN[I.L[i]] - M3EN[I.c], m = Math.sign(dEN) * Math.max(0.22, Math.min(1, Math.abs(dEN))) * 0.8; return Math.abs(dEN) < 0.02 ? [0, 0, 0] : u.map(x => x * m); });
    const arrow = (a, b, col, o, r = 0.05) => { const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d); if (L < 1e-6) return []; const h = d.map(x => x / L * Math.min(0.24, L * 0.5)), m = b.map((x, k) => x - h[k]);
      return R3D.shift([...R3D.tube(a, m, r, col, 1), ...R3D.tube(m, b, r * 2.6, col, 1, 0)], o); };
    // 箭頭畫在鍵的旁邊（往外側平移），才不會被鍵和原子蓋住
    vec.forEach((v, i) => { const u = M.dirs[i], side = R3D.norm(Math.abs(u[2]) < 0.9 ? [-u[1], u[0], 0.0001] : [0, -u[2], u[1]]), off = side.map(x => x * 0.24), L = Math.hypot(...v); if (L < 1e-6) return;
      const out = v[0] * u[0] + v[1] * u[1] + v[2] * u[2] > 0, s0 = u.map((x, k) => x * 0.25 + off[k]), e0 = u.map((x, k) => x * 1.05 + off[k]);
      q.push(...(out ? arrow(s0, e0, '#E08A2E', [-1.55, 0], 0.05) : arrow(e0, s0, '#E08A2E', [-1.55, 0], 0.05))); });
    // 頭尾相接：右邊從原點開始一個一個接上去
    let cur = [0, 0, 0]; const O = [1.85, 0];
    const K = 1.25; vec.forEach(v => { const nx = cur.map((x, k) => x + v[k] * K); q.push(...arrow(cur, nx, '#E08A2E', O, 0.05)); cur = nx; });
    const net = Math.hypot(...cur), polar = net > 0.06;
    q.push(...R3D.shift(R3D.ball([0, 0, 0], 0.07, '#1d2522', 1), O));
    if (polar) q.push(...arrow([0, 0, 0], cur, '#D0342C', O, 0.075));
    labels.push({ p: [0, 0, 0], o: [-1.55, -1.75], t: '每個鍵的偶極', size: 24, fix: true }, { p: [0, 0, 0], o: [1.85, -1.75], t: '頭尾相接', size: 24, fix: true }, { p: [0, 0, 0], o: [1.85, -2.1], t: polar ? '終點 ≠ 起點：有淨偶極' : '回到起點：淨偶極 = 0', size: 24, fix: true, big: true, c: polar ? '#C0392B' : '#2E8B57' });
    V.set({ quads: q, labels, scale: 100, axes: 0, dot: false });
    const sym = new Set(I.L).size === 1;
    $('#dpK', el).innerHTML = card('s', '形狀', M3SHAPE[`${I.d},${I.lp}`][0]) + card('a', '周圍原子', sym ? '都相同' : '不同') + card('p', '分子', polar ? '極性' : '非極性');
    $('#dpN', el).innerHTML = `橘色箭頭是每個鍵的偶極，從 δ+ 指向 δ−（電負度大的一端），長短代表電負度差。右邊把箭頭頭尾相接：${polar ? `終點沒有回到起點，紅色箭頭就是淨偶極，${I.n} 是<b>極性分子</b>。${I.lp ? '原因是孤對電子讓形狀不對稱，箭頭無法互相抵消。' : !sym ? '周圍原子不同，箭頭長短不一，抵消不掉。' : ''}${st.m === 'o3' ? 'O₃ 的三個原子相同，但中間的 O 形式電荷 +1、兩端平均 −½，電荷分布不對稱，所以仍有偶極。' : ''}` : `接回原點，鍵偶極完全抵消，${I.n} 是<b>非極性分子</b>${I.L.some(e => Math.abs(M3EN[e] - M3EN[I.c]) > 0.4) ? '（但它的鍵是極性鍵）' : ''}。`}轉一轉：從不同角度看，結果都一樣。`;
    $('#dpM', el).value = st.m;
  }
  $('#dpM', el).onchange = e => { st.m = e.target.value; draw(); };
  draw();
  return { set(s) { if (s.m && M3MOL[s.m]) st.m = s.m; draw(); } };
};
