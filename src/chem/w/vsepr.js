/* ---------- 後中化學：化學鍵與分子形狀的互動圖 ---------- */

/* ===== 1. 電負度差與鍵的類型 ===== */
const EN = { H: 2.20, Li: 0.98, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Na: 0.93, Mg: 1.31, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16, K: 0.82, Br: 2.96, I: 2.66 };
W.bondtype = el => {
  let a = 'H', b = 'Cl';
  el.innerHTML = `<div class="w-row"><label class="sel">原子 A <select id="btA">${Object.keys(EN).map(k => `<option>${k}</option>`).join('')}</select></label><label class="sel">原子 B <select id="btB">${Object.keys(EN).map(k => `<option>${k}</option>`).join('')}</select></label><span class="sp"></span>${[['H', 'H'], ['C', 'H'], ['H', 'Cl'], ['C', 'O'], ['Na', 'Cl']].map(([x, y]) => `<button class="btn sm ghost" type="button" data-p="${x},${y}">${x}–${y}</button>`).join('')}</div><div id="btC"></div><p class="note" id="btN"></p>`;
  function draw() {
    const d = Math.abs(EN[a] - EN[b]), hi = EN[a] >= EN[b] ? a : b, lo = hi === a ? b : a;
    $('#btC', el).innerHTML = chart({ x: [0, 3.3], y: [0, 1], xt: [0, 0.5, 1, 1.7, 2, 3], yt: [], xlab: '電負度差 ΔEN', h: 120 }, (X, Y) => `<rect x="${X(0)}" y="${Y(1)}" width="${X(0.5) - X(0)}" height="${Y(0) - Y(1)}" fill="var(--acid)" opacity=".12"/><rect x="${X(0.5)}" y="${Y(1)}" width="${X(1.7) - X(0.5)}" height="${Y(0) - Y(1)}" fill="var(--accent)" opacity=".12"/><rect x="${X(1.7)}" y="${Y(1)}" width="${X(3.3) - X(1.7)}" height="${Y(0) - Y(1)}" fill="var(--base)" opacity=".14"/><text class="tk" x="${X(0.25)}" y="${Y(0.85)}" text-anchor="middle">非極性共價</text><text class="tk" x="${X(1.1)}" y="${Y(0.85)}" text-anchor="middle">極性共價</text><text class="tk" x="${X(2.5)}" y="${Y(0.85)}" text-anchor="middle">離子性為主</text><circle class="dot" cx="${X(Math.min(3.2, d))}" cy="${Y(0.4)}" r="8"/>`);
    $('#btN', el).innerHTML = a === b ? `${a}–${b}：完全相同的原子，電子平均共用，<b>非極性共價鍵</b>。` : `${a}（${EN[a]}）與 ${b}（${EN[b]}），ΔEN = ${fx(d, 2)}：${d < 0.5 ? '<b>非極性共價鍵</b>（C–H 屬此類，所以烷類幾乎不反應）' : d < 1.7 ? `<b>極性共價鍵</b>，電子偏向 ${hi}：${hi} 帶 δ−、${lo} 帶 δ+` : `<b>離子鍵為主</b>：電子幾乎完全轉移到 ${hi}，形成 ${lo}⁺ 與 ${hi}⁻`}。界線（0.5、1.7）只是大約的分法，鍵的性質是連續變化的。`;
    $('#btA', el).value = a; $('#btB', el).value = b;
  }
  $('#btA', el).onchange = e => { a = e.target.value; draw(); };
  $('#btB', el).onchange = e => { b = e.target.value; draw(); };
  $$('[data-p]', el).forEach(x => { x.onclick = () => { [a, b] = x.dataset.p.split(','); draw(); }; });
  draw();
  return { set(s) { a = s.a || a; b = s.b || b; draw(); } };
};

/* ===== 2. VSEPR：電子區域與孤對電子 ===== */
W.vsepr = el => {
  // 各位置（二維投影）＋鍵型；孤對電子位置由前面開始放（三角雙錐先放赤道）
  const GEO = {
    2: [[[-1.3, 0], 's'], [[1.3, 0], 's']],
    3: [[[0, 1.25], 's'], [[-1.1, -0.65], 's'], [[1.1, -0.65], 's']],
    4: [[[0, 1.25], 's'], [[1.15, -0.4], 's'], [[-0.95, -0.55], 'w'], [[-0.25, -1.1], 'h']],
    5: [[[1.3, 0], 's'], [[-0.75, -0.45], 'w'], [[-0.5, 0.55], 'h'], [[0, 1.35], 's'], [[0, -1.35], 's']],
    6: [[[1.3, 0], 's'], [[-1.3, 0], 's'], [[0.6, 0.5], 'h'], [[-0.6, -0.5], 'w'], [[0, 1.35], 's'], [[0, -1.35], 's']],
  };
  const NAME = { '2,0': ['直線', '180°', 'CO₂、BeCl₂'], '3,0': ['平面三角形', '120°', 'BF₃、SO₃'], '3,1': ['彎曲', '< 120°', 'SO₂'], '4,0': ['正四面體', '109.5°', 'CH₄、CCl₄'], '4,1': ['三角錐', '約 107°', 'NH₃'], '4,2': ['彎曲', '約 104.5°', 'H₂O'],
    '5,0': ['三角雙錐', '90°、120°', 'PCl₅'], '5,1': ['蹺蹺板', '< 90°、< 120°', 'SF₄'], '5,2': ['T 形', '< 90°', 'ClF₃'], '5,3': ['直線', '180°', 'XeF₂、I₃⁻'],
    '6,0': ['正八面體', '90°', 'SF₆'], '6,1': ['四角錐', '< 90°', 'BrF₅'], '6,2': ['平面四方形', '90°', 'XeF₄'] };
  const LPORDER = { 2: [], 3: [0], 4: [0, 3], 5: [0, 1, 2], 6: [4, 5] };
  const st = { d: 4, lp: 1 };
  el.innerHTML = `<div class="w-row"><span class="small">電子區域數</span>${[2, 3, 4, 5, 6].map(v => `<button class="btn sm" type="button" data-d="${v}">${v}</button>`).join('')}<span class="sp"></span><span class="small">其中孤對電子</span><span id="vsL"></span></div><div class="bgrid"><div id="vsM"></div><div class="cards" id="vsK"></div></div><p class="note" id="vsN"></p>`;
  function draw() {
    const maxlp = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 2 }[st.d]; st.lp = Math.min(st.lp, maxlp);
    $('#vsL', el).innerHTML = Array.from({ length: maxlp + 1 }, (_, i) => `<button class="btn sm${i === st.lp ? ' pri' : ''}" type="button" data-l="${i}">${i}</button>`).join('');
    $$('[data-l]', el).forEach(b => { b.onclick = () => { st.lp = +b.dataset.l; draw(); }; });
    $$('[data-d]', el).forEach(b => b.classList.toggle('pri', +b.dataset.d === st.d));
    const lps = new Set(LPORDER[st.d].slice(0, st.lp)), atoms = { A: { x: 0, y: 0, t: 'A' } }, bonds = [];
    GEO[st.d].forEach(([[x, y], k], i) => { if (lps.has(i)) { atoms['L' + i] = { x: x * 0.62, y: y * 0.62, t: '', lp: [Math.atan2(y, x) * 180 / Math.PI] }; return; } atoms['X' + i] = { x, y, t: 'X' }; bonds.push(['A', 'X' + i, k]); });
    const svg = MOL.svg({ atoms, bonds }, { w: 260, h: 220, s: 62 }).replace(/<circle class="lp"/g, '<circle class="lp big"');
    $('#vsM', el).innerHTML = svg;
    const [nm, ang, ex] = NAME[`${st.d},${st.lp}`];
    $('#vsK', el).innerHTML = card('g', '電子區域排列', { 2: '直線', 3: '平面三角形', 4: '四面體', 5: '三角雙錐', 6: '八面體' }[st.d]) + card('s', '分子形狀', nm) + card('a', '鍵角', ang);
    $('#vsN', el).innerHTML = `例子：${ex}。電子區域（鍵或孤對）彼此排斥，盡量遠離，決定<b>電子區域的排列</b>；但<b>分子形狀</b>只看原子的位置，孤對電子「看不見」。孤對電子比鍵結電子佔更多空間，會把鍵角壓小（CH₄ 109.5° → NH₃ 107° → H₂O 104.5°）。${st.d === 5 && st.lp ? '三角雙錐的孤對電子放在<b>赤道</b>位置（120° 方向，比較寬敞）。' : ''}${st.d === 6 && st.lp === 2 ? '八面體的兩對孤對電子放在<b>相對</b>位置，互相離得最遠，所以是平面四方形。' : ''}`;
  }
  $$('[data-d]', el).forEach(b => { b.onclick = () => { st.d = +b.dataset.d; draw(); }; });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. 分子極性：鍵偶極的向量和 ===== */
W.dipole = el => {
  const M = {
    co2: { n: 'CO₂', a: { C: [0, 0, 'C'], O1: [-1.3, 0, 'O'], O2: [1.3, 0, 'O'] }, b: [['C', 'O1', 'd'], ['C', 'O2', 'd']], v: [[-1, 0], [1, 0]], polar: false },
    h2o: { n: 'H₂O', a: { O: [0, 0.2, 'O'], H1: [-0.95, -0.55, 'H'], H2: [0.95, -0.55, 'H'] }, b: [['O', 'H1', 's'], ['O', 'H2', 's']], v: [[0.6, 0.55], [-0.6, 0.55]], polar: true },
    bf3: { n: 'BF₃', a: { B: [0, 0, 'B'], F1: [0, 1.25, 'F'], F2: [-1.1, -0.65, 'F'], F3: [1.1, -0.65, 'F'] }, b: [['B', 'F1', 's'], ['B', 'F2', 's'], ['B', 'F3', 's']], v: [[0, 1], [-0.87, -0.5], [0.87, -0.5]], polar: false },
    nh3: { n: 'NH₃', a: { N: [0, 0.25, 'N'], H1: [-1.05, -0.4, 'H'], H2: [0.3, -0.75, 'H'], H3: [1.0, -0.3, 'H'] }, b: [['N', 'H1', 's'], ['N', 'H2', 'w'], ['N', 'H3', 'h']], v: [[0.5, 0.3], [-0.1, 0.5], [-0.45, 0.3]], polar: true },
    ccl4: { n: 'CCl₄', a: { C: [0, 0, 'C'], A: [0, 1.25, 'Cl'], B: [1.15, -0.4, 'Cl'], D: [-0.95, -0.55, 'Cl'], E: [-0.25, -1.1, 'Cl'] }, b: [['C', 'A', 's'], ['C', 'B', 's'], ['C', 'D', 'w'], ['C', 'E', 'h']], v: [], polar: false },
    ch3cl: { n: 'CH₃Cl', a: { C: [0, 0, 'C'], A: [0, 1.25, 'Cl'], B: [1.15, -0.4, 'H'], D: [-0.95, -0.55, 'H'], E: [-0.25, -1.1, 'H'] }, b: [['C', 'A', 's'], ['C', 'B', 's'], ['C', 'D', 'w'], ['C', 'E', 'h']], v: [[0, 1]], polar: true },
  };
  let cur = 'h2o';
  el.innerHTML = `${seg('dpS', Object.entries(M).map(([k, v]) => [k, v.n]), cur)}<div class="bgrid"><div id="dpM"></div><p class="note" id="dpN"></p></div>`;
  function draw() {
    const m = M[cur], atoms = Object.fromEntries(Object.entries(m.a).map(([k, [x, y, t]]) => [k, { x, y, t }]));
    let svg = MOL.svg({ atoms, bonds: m.b }, { w: 280, h: 230, s: 62 });
    const sx = 140, sy = 115, S = 62, sum = m.v.reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]), L = Math.hypot(...sum);
    const arrows = m.polar ? `<line x1="${sx}" y1="${sy + 10}" x2="${sx + sum[0] / L * S * 1.2}" y2="${sy + 10 - sum[1] / L * S * 1.2}" class="netd" marker-end="url(#dpm)"/><defs><marker id="dpm" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--arrow)"/></marker></defs>` : '';
    $('#dpM', el).innerHTML = svg.replace('</svg>', arrows + '</svg>');
    $('#dpN', el).innerHTML = `<b>${m.n}</b>：${m.polar ? '<span class="ok">極性分子</span>。各鍵的偶極加起來不為零，紅色箭頭是淨偶極方向（指向電子偏向的一側）。' : '<span class="warn">非極性分子</span>。雖然每個鍵都有極性，但形狀對稱，鍵偶極互相抵消，淨偶極為零。'}判斷方法：先用 VSEPR 決定形狀，再把鍵偶極當向量相加。CCl₄ 非極性、CH₃Cl 極性，就是因為一個對稱、一個不對稱。`;
    pressSeg(el, 'dpS', cur);
  }
  bindSeg(el, 'dpS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.m || cur; draw(); } };
};

/* ===== 4. 分子間作用力：氫化物的沸點 ===== */
W.imf = el => {
  const G = { 14: ['CH₄', -161.5, 'SiH₄', -111.9, 'GeH₄', -88.5, 'SnH₄', -51.8], 15: ['NH₃', -33.3, 'PH₃', -87.7, 'AsH₃', -62.5, 'SbH₃', -17.0], 16: ['H₂O', 100.0, 'H₂S', -60.3, 'H₂Se', -41.3, 'H₂Te', -2.2], 17: ['HF', 19.5, 'HCl', -85.1, 'HBr', -66.8, 'HI', -35.4] };
  const C = { 14: 'var(--muted)', 15: 'var(--acid)', 16: 'var(--arrow)', 17: 'var(--base)' };
  el.innerHTML = `<div id="imC"></div><p class="note">第 14 族（CH₄ 系列）只有分散力：分子越大、電子越多，越容易被極化，沸點規律上升。第 15–17 族的第二週期（<b>NH₃、H₂O、HF</b>）沸點反常地高，因為 N、O、F 電負度大、半徑小，形成<b>氫鍵</b>。H₂O 每個分子可以形成四個氫鍵（兩個 H、兩對孤對電子），所以沸點最高。</p>`;
  $('#imC', el).innerHTML = chart({ x: [1.5, 5.5], y: [-180, 120], xt: [2, 3, 4, 5], yt: [-150, -100, -50, 0, 50, 100], xlab: '週期', ylab: '沸點（°C）', h: 280, label: '氫化物沸點' }, (X, Y) => Object.entries(G).map(([g, d]) => { const pts = [0, 1, 2, 3].map(i => [X(i + 2), Y(d[2 * i + 1])]); return `<path d="${path(pts)}" fill="none" stroke="${C[g]}" stroke-width="2.4"/>${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${C[g]}"/><text class="tk" x="${p[0] + ({ 14: -7, 15: 7, 16: 7, 17: -7 })[g]}" y="${p[1] + ({ 14: 4, 15: 14, 16: -6, 17: -6 })[g]}" text-anchor="${g == 14 || g == 17 ? 'end' : 'start'}">${d[2 * i]}</text>`).join('')}`; }).join(''));
  return { set() {} };
};
