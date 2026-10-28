/* ---------- 後中化學：化學鍵與分子形狀的互動圖 ---------- */

/* ===== 1. 電負度差與鍵的類型 ===== */
const EN = { H: 2.20, Li: 0.98, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Na: 0.93, Mg: 1.31, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16, K: 0.82, As: 2.18, Br: 2.96, I: 2.66 };
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
  const NAME = { '2,0': ['直線', '180°', 'CO₂、BeCl₂、HCN、NO₂⁺'], '3,0': ['平面三角形', '120°', 'BF₃、SO₃、NO₃⁻、CO₃²⁻'], '3,1': ['彎曲', '< 120°', 'SO₂、O₃、NO₂⁻'], '4,0': ['正四面體', '109.5°', 'CH₄、CCl₄、SiCl₄、NH₄⁺、SO₄²⁻'], '4,1': ['三角錐', '約 107°', 'NH₃、PCl₃、H₃O⁺'], '4,2': ['彎曲', '約 104.5°', 'H₂O、OF₂'],
    '5,0': ['三角雙錐', '90°、120°', 'PCl₅、PF₅'], '5,1': ['蹺蹺板', '< 90°、< 120°', 'SF₄、SeF₄'], '5,2': ['T 形', '< 90°', 'ClF₃、IF₃'], '5,3': ['直線', '180°', 'XeF₂、I₃⁻'],
    '6,0': ['正八面體', '90°', 'SF₆、PF₆⁻'], '6,1': ['四角錐', '< 90°', 'BrF₅、IF₅、XeOF₄'], '6,2': ['平面四方形', '90°', 'XeF₄、ICl₄⁻'] };
  const HYB = { 2: 'sp', 3: 'sp²', 4: 'sp³', 5: 'sp³d', 6: 'sp³d²' }, NONPOLAR = ['2,0', '3,0', '4,0', '5,0', '5,3', '6,0', '6,2'];
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
    const key = `${st.d},${st.lp}`;
    $('#vsK', el).innerHTML = card('g', '電子區域排列', { 2: '直線', 3: '平面三角形', 4: '四面體', 5: '三角雙錐', 6: '八面體' }[st.d]) + card('s', '分子形狀', nm) + card('a', '鍵角', ang) + card('h', '中心原子混成', HYB[st.d], `${st.d} 個電子區域`) + card('p', '周圍原子相同時', NONPOLAR.includes(key) ? '非極性' : '極性', NONPOLAR.includes(key) ? '鍵偶極抵消' : '不對稱');
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

/* ===== 5. 位能曲線：鍵長與鍵能 =====
   鍵長 pm、鍵能 kJ/mol（教科書常用值）；曲線用 E = D[(r₀/r)¹² − 2(r₀/r)⁶] 示意 */
const BONDS2 = { 'H–H': [74, 436], 'F–F': [142, 158], 'Cl–Cl': [199, 243], 'Br–Br': [228, 193], 'I–I': [267, 151], 'O=O': [121, 498], 'N≡N': [110, 945] };
W.potcurve = el => {
  const st = { b: 'Cl–Cl', r: 300 };
  el.innerHTML = `${seg('pcS', Object.keys(BONDS2).map(k => [k, k]), st.b)}<div class="w-row"><label class="rng">核間距離 r<input type="range" id="pcR" min="60" max="450" step="2"><output class="mono" id="pcO"></output></label></div><div id="pcG"></div><p class="eq" id="pcF"></p><p class="note" id="pcN"></p>`;
  const E = (r, [r0, D]) => D * ((r0 / r) ** 12 - 2 * (r0 / r) ** 6);
  function draw() {
    const d = BONDS2[st.b], e = E(st.r, d), xs = r0 => Array.from({ length: 200 }, (_, i) => 50 + i * 2).filter(r => r > r0 * 0.86);
    $('#pcG', el).innerHTML = chart({ w: 560, h: 260, x: [50, 450], y: [-1000, 400], xt: [100, 200, 300, 400], yt: [-1000, -500, 0, 400], xlab: '核間距離 r（pm）', ylab: '位能（kJ/mol）', label: '位能曲線' }, (X, Y) =>
      Object.entries(BONDS2).map(([k, v]) => `<path class="tline${k === st.b ? '' : ' faint'}" d="${path(xs(v[0]).map(r => [X(r), Y(clamp(E(r, v), -1000, 400))]))}"/>`).join('')
      + `<line class="mk" x1="${X(d[0])}" x2="${X(d[0])}" y1="${Y(0)}" y2="${Y(-d[1])}"/><circle class="dot" cx="${X(st.r)}" cy="${Y(clamp(e, -1000, 400))}" r="7"/>`);
    $('#pcR', el).value = st.r; $('#pcO', el).textContent = `${st.r} pm`;
    $('#pcF', el).innerHTML = `${st.b}：最低點在 r = <b>${d[0]} pm</b>（鍵長），深度 <b>${d[1]} kJ/mol</b>（鍵能）；目前 r = ${st.r} pm，位能 ${fx(e, 0)} kJ/mol`;
    $('#pcN', el).innerHTML = `${st.r > d[0] * 1.05 ? '距離較遠時，原子核吸引對方的電子，越靠近位能越低（吸引為主）。' : st.r < d[0] * 0.95 ? '靠得太近時，兩個原子核（以及內層電子）互相排斥，位能急遽升高。' : '位能最低點：吸引與排斥平衡，這個距離就是鍵長。'} 拆開一個鍵要把位能從谷底拉回 0，所需的能量就是鍵能。比較各曲線：鍵級越高（N≡N）谷越深、鍵越短；同族往下（Cl₂ → I₂）原子越大，鍵越長、越弱。F–F 是例外，F 原子小、孤對電子互相排斥，鍵能比 Cl–Cl 小。`;
    pressSeg(el, 'pcS', st.b);
  }
  $('#pcR', el).oninput = e => { st.r = +e.target.value; draw(); };
  bindSeg(el, 'pcS', v => { st.b = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 6. 晶格能：電荷乘積 ÷ 離子間距 =====
   晶格能 kJ/mol（Brown《Chemistry: The Central Science》表 8.2）；離子半徑 pm（Shannon，配位數 6） */
const IONRAD = { 'Li⁺': 76, 'Na⁺': 102, 'K⁺': 138, 'Cs⁺': 167, 'Mg²⁺': 72, 'Ca²⁺': 100, 'Sr²⁺': 118, 'F⁻': 133, 'Cl⁻': 181, 'Br⁻': 196, 'I⁻': 220, 'O²⁻': 140 };
const LAT = [['LiF', 'Li⁺', 'F⁻', 1, 1030], ['LiCl', 'Li⁺', 'Cl⁻', 1, 834], ['NaF', 'Na⁺', 'F⁻', 1, 910], ['NaCl', 'Na⁺', 'Cl⁻', 1, 788], ['NaBr', 'Na⁺', 'Br⁻', 1, 732], ['NaI', 'Na⁺', 'I⁻', 1, 682], ['KCl', 'K⁺', 'Cl⁻', 1, 701], ['CsCl', 'Cs⁺', 'Cl⁻', 1, 657], ['MgO', 'Mg²⁺', 'O²⁻', 4, 3795], ['CaO', 'Ca²⁺', 'O²⁻', 4, 3414], ['SrO', 'Sr²⁺', 'O²⁻', 4, 3217]];
W.lattice = el => {
  let cur = 'NaCl';
  el.innerHTML = `<div class="w-row">${LAT.map(([f]) => `<button class="btn sm ghost" type="button" data-f="${f}">${f}</button>`).join('')}</div><div id="ltG"></div><p class="eq" id="ltF"></p><p class="note" id="ltN"></p>`;
  const xv = ([, c, a, q]) => 1000 * q / (IONRAD[c] + IONRAD[a]);
  function draw() {
    const d = LAT.find(x => x[0] === cur), x0 = xv(d);
    $('#ltG', el).innerHTML = chart({ w: 560, h: 250, x: [0, 20], y: [0, 4000], xt: [0, 5, 10, 15, 20], yt: [0, 1000, 2000, 3000, 4000], xlab: '|q₊ × q₋| ÷ (r₊ + r₋)（×10⁻³ pm⁻¹）', ylab: '晶格能（kJ/mol）', label: '晶格能' }, (X, Y) =>
      LAT.map(v => `<circle cx="${X(xv(v))}" cy="${Y(v[4])}" r="${v[0] === cur ? 8 : 5}" class="${v[0] === cur ? 'dot' : 'pt'}" data-f="${v[0]}"/>`).join('') + `<text class="tk hl" x="${X(x0) + 12}" y="${Y(d[4]) + 4}">${cur}</text>`);
    $('#ltF', el).innerHTML = `${cur}：|${d[3] === 4 ? '(+2)(−2)' : '(+1)(−1)'}| ÷ (${IONRAD[d[1]]} + ${IONRAD[d[2]]}) pm = ${fx(x0, 2)} × 10⁻³　→　晶格能 ${d[4]} kJ/mol`;
    $('#ltN', el).innerHTML = `晶格能是把一莫耳離子晶體拆成氣態離子所需的能量。依庫侖定律，它和<b>離子電荷的乘積成正比、和離子間距離成反比</b>，所以點大致落在一條直線上。+2/−2 的 MgO 電荷乘積是 NaCl 的 4 倍，晶格能也約大 4 倍多；同為 1:1 的鹵化鈉中，離子越小（F⁻ &lt; Cl⁻ &lt; Br⁻ &lt; I⁻）晶格能越大，熔點也越高。`;
    $$('[data-f]', el).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === cur)));
  }
  el.addEventListener('click', e => { const t = e.target.closest('[data-f]'); if (t) { cur = t.dataset.f; draw(); } });
  draw();
  return { set(s) { cur = s.f || cur; draw(); } };
};

/* ===== 7. 路易斯結構與形式電荷 =====
   每個結構：原子 [元素, 孤對數, x, y]、鍵 [i, j, 鍵級] */
const VAL = { N: 5, C: 4, O: 6, P: 5, Cl: 7, S: 6 };
const LEWIS = {
  nco: ['NCO⁻', [[['N', 2, -1.3, 0], ['C', 0, 0, 0], ['O', 2, 1.3, 0]], [[0, 1, 2], [1, 2, 2]]], [[['N', 1, -1.3, 0], ['C', 0, 0, 0], ['O', 3, 1.3, 0]], [[0, 1, 3], [1, 2, 1]]], [[['N', 3, -1.3, 0], ['C', 0, 0, 0], ['O', 1, 1.3, 0]], [[0, 1, 1], [1, 2, 3]]]],
  n2o: ['N₂O', [[['N', 2, -1.3, 0], ['N', 0, 0, 0], ['O', 2, 1.3, 0]], [[0, 1, 2], [1, 2, 2]]], [[['N', 1, -1.3, 0], ['N', 0, 0, 0], ['O', 3, 1.3, 0]], [[0, 1, 3], [1, 2, 1]]], [[['N', 3, -1.3, 0], ['N', 0, 0, 0], ['O', 1, 1.3, 0]], [[0, 1, 1], [1, 2, 3]]]],
  co2: ['CO₂', [[['O', 2, -1.3, 0], ['C', 0, 0, 0], ['O', 2, 1.3, 0]], [[0, 1, 2], [1, 2, 2]]], [[['O', 1, -1.3, 0], ['C', 0, 0, 0], ['O', 3, 1.3, 0]], [[0, 1, 3], [1, 2, 1]]]],
  no: ['NO⁺', [[['N', 1, -0.65, 0], ['O', 1, 0.65, 0]], [[0, 1, 3]]]],
  o3: ['O₃', [[['O', 2, -1.15, -0.5], ['O', 1, 0, 0.3], ['O', 3, 1.15, -0.5]], [[0, 1, 2], [1, 2, 1]]]],
  no3: ['NO₃⁻', [[['N', 0, 0, 0], ['O', 2, 0, 1.3], ['O', 3, -1.15, -0.65], ['O', 3, 1.15, -0.65]], [[0, 1, 2], [0, 2, 1], [0, 3, 1]]]],
  pocl3: ['POCl₃', [[['P', 0, 0, 0], ['O', 2, 0, 1.3], ['Cl', 3, -1.15, -0.55], ['Cl', 3, 1.15, -0.55], ['Cl', 3, 0, -1.3]], [[0, 1, 2], [0, 2, 1], [0, 3, 1], [0, 4, 1]]], [[['P', 0, 0, 0], ['O', 3, 0, 1.3], ['Cl', 3, -1.15, -0.55], ['Cl', 3, 1.15, -0.55], ['Cl', 3, 0, -1.3]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]]],
};
W.fcharge = el => {
  const st = { m: 'nco', k: 1 };
  el.innerHTML = `${seg('fcS', Object.entries(LEWIS).map(([k, v]) => [k, v[0]]), st.m)}<div class="w-row" id="fcK"></div><div id="fcG"></div><div class="fcrows" id="fcR"></div><p class="note" id="fcN"></p>`;
  const fcOf = ([at, bd]) => at.map(([e, lp], i) => VAL[e] - 2 * lp - bd.filter(b => b[0] === i || b[1] === i).reduce((s2, b) => s2 + b[2], 0));
  const sgn = v => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0'), chs = v => (v === 0 ? '' : `${Math.abs(v) > 1 ? Math.abs(v) : ''}${v > 0 ? '+' : '−'}`);
  const score = f => { const fc = fcOf(f); return fc.reduce((a, v) => a + Math.abs(v), 0) * 10 - fc.reduce((a, v, i) => a + (v < 0 ? EN[f[0][i][0]] : 0), 0); };
  function draw() {
    const [nm, ...forms] = LEWIS[st.m]; st.k = Math.min(st.k, forms.length - 1);
    const f = forms[st.k], [at, bd] = f, fc = fcOf(f), best = forms.map(score).indexOf(Math.min(...forms.map(score)));
    $('#fcK', el).innerHTML = forms.length > 1 ? forms.map((_, i) => `<button class="btn sm${i === st.k ? ' pri' : ''}" type="button" data-k="${i}">結構 ${i + 1}${i === best ? '（最佳）' : ''}</button>`).join('') : '';
    $$('[data-k]', el).forEach(b => { b.onclick = () => { st.k = +b.dataset.k; draw(); }; });
    const atoms = {}, bonds = [];
    at.forEach(([e, lp, x, y], i) => {
      const nb = bd.filter(b => b[0] === i || b[1] === i).map(b => { const j = b[0] === i ? b[1] : b[0]; return Math.atan2(at[j][3] - y, at[j][2] - x) * 180 / Math.PI; });
      let lps = [];
      if (nb.length === 1) lps = Array.from({ length: lp }, (_, q) => nb[0] + 180 + (q - (lp - 1) / 2) * 90);
      else { const mx = nb.reduce((a, t) => a + Math.cos(t * Math.PI / 180), 0), my = nb.reduce((a, t) => a + Math.sin(t * Math.PI / 180), 0), base = Math.hypot(mx, my) > 0.2 ? Math.atan2(-my, -mx) * 180 / Math.PI : 90; lps = Array.from({ length: lp }, (_, q) => base + (lp === 2 && Math.hypot(mx, my) <= 0.2 ? q * 180 : (q - (lp - 1) / 2) * 70)); }
      atoms['a' + i] = { x, y, t: e, lp: lps, c: chs(fc[i]) };
    });
    bd.forEach(([i, j, o]) => bonds.push(['a' + i, 'a' + j, o === 3 ? 't' : o === 2 ? 'd' : 's']));
    $('#fcG', el).innerHTML = MOL.svg({ atoms, bonds }, { w: 380, h: 200, s: 52, label: nm }).replace('<svg ', '<svg style="max-width:420px;margin:auto" ');
    $('#fcR', el).innerHTML = at.map(([e, lp], i) => { const nb = bd.filter(b => b[0] === i || b[1] === i).reduce((s2, b) => s2 + b[2], 0); return `<span><b>${e}</b>：${VAL[e]} − ${2 * lp} − ${nb} = <b class="${fc[i] ? 'bad' : ''}">${sgn(fc[i])}</b></span>`; }).join('');
    $('#fcN', el).innerHTML = `形式電荷 = 價電子數 − 未共用電子數 − 鍵數（每條線算 1）。每個原子下方的算式對應圖上數得到的點與線。總和 = ${sgn(fc.reduce((a, b) => a + b, 0))}，等於整個粒子的電荷。${forms.length > 1 ? `判斷最佳結構：形式電荷越接近 0 越好；有負的形式電荷時，放在電負度較大的原子上較好。${st.m === 'pocl3' ? ' 結構 1 中 P 有 10 個價電子（擴展八隅體），形式電荷全為 0。' : ''}` : ''}`;
    pressSeg(el, 'fcS', st.m);
  }
  bindSeg(el, 'fcS', v => { st.m = v; st.k = 0; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 8. 鍵級與鍵長 =====
   pm（教科書常用值） */
const BLEN = {
  co: ['C–O 鍵', [['CH₃OH', 1, 143], ['CO₃²⁻', 1.33, 129], ['HCOO⁻', 1.5, 127], ['H₂C=O', 2, 121], ['CO₂', 2, 116], ['C≡O', 3, 113]]],
  nn: ['N–N 鍵', [['N₂H₄', 1, 145], ['N₂O', 2.5, 113], ['N₂', 3, 110]]],
  cc: ['C–C 鍵', [['乙烷', 1, 154], ['苯', 1.5, 140], ['乙烯', 2, 134], ['乙炔', 3, 120]]],
};
W.bondlen = el => {
  let cur = 'co';
  el.innerHTML = `${seg('blS', Object.entries(BLEN).map(([k, v]) => [k, v[0]]), cur)}<div id="blG"></div><p class="note" id="blN"></p>`;
  function draw() {
    const [nm, d] = BLEN[cur];
    $('#blG', el).innerHTML = chart({ w: 560, h: 250, x: [0.7, 3.3], y: [105, 160], xt: [1, 1.5, 2, 2.5, 3], yt: [110, 120, 130, 140, 150, 160], xlab: '鍵級', ylab: '鍵長（pm）', label: '鍵級與鍵長' }, (X, Y) =>
      d.map(([t, o, l], i) => `<circle class="dot" cx="${X(o)}" cy="${Y(l)}" r="6"/><text class="tk" x="${X(o) + (i % 2 ? -10 : 10)}" y="${Y(l) + 4}" text-anchor="${i % 2 ? 'end' : 'start'}">${t} ${l}</text>`).join(''));
    $('#blN', el).innerHTML = `${nm}：<b>鍵級越高，鍵越短</b>（也越強）。有共振的粒子，鍵級是平均值：CO₃²⁻ 的三個 C–O 共用一個 π 鍵，鍵級 4/3；HCOO⁻ 的兩個 C–O 共用一個 π 鍵，鍵級 3/2，所以長度介於單鍵和雙鍵之間。`;
    pressSeg(el, 'blS', cur);
  }
  bindSeg(el, 'blS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 9. 沸點比較：哪一種作用力在主導 =====
   正常沸點 °C、偶極矩 D（CRC Handbook） */
const BPS = {
  mw: ['分子量相近', [['丙烷 C₃H₈', 44, -42, 0.1, 0], ['甲醚 CH₃OCH₃', 46, -24, 1.3, 0], ['氯甲烷 CH₃Cl', 50, -24, 1.9, 0], ['乙醛 CH₃CHO', 44, 20, 2.7, 0], ['乙腈 CH₃CN', 41, 82, 3.9, 0], ['乙醇 C₂H₅OH', 46, 78, 1.7, 1]]],
  br: ['支鏈（C₅H₁₂）', [['正戊烷', 72, 36, 0, 0], ['異戊烷', 72, 28, 0.1, 0], ['新戊烷', 72, 10, 0, 0]]],
  al: ['醇的碳數', [['甲醇', 32, 65, 1.7, 1], ['乙醇', 46, 78, 1.7, 1], ['1-丙醇', 60, 97, 1.6, 1], ['1-丁醇', 74, 118, 1.7, 1]]],
  is: ['醇與醚（C₃H₈O）', [['1-丙醇', 60, 97, 1.6, 1], ['2-丙醇', 60, 82, 1.6, 1], ['甲乙醚', 60, 7, 1.2, 0]]],
  hx: ['氫化物', [['CH₄', 16, -161, 0, 0], ['NH₃', 17, -33, 1.5, 1], ['HF', 20, 20, 1.8, 1], ['H₂O', 18, 100, 1.9, 1]]],
};
W.bpcompare = el => {
  let cur = 'mw';
  el.innerHTML = `${seg('bpS', Object.entries(BPS).map(([k, v]) => [k, v[0]]), cur)}<div class="bars pk bpb" id="bpB"></div><p class="note" id="bpN"></p>`;
  const NOTE = { mw: '分子量都在 41–50 之間，分散力差不多；沸點的差別來自<b>偶極矩</b>（極性越大，偶極–偶極力越強），能形成<b>氫鍵</b>的乙醇又更高。',
    br: '分子式相同、分散力的差別來自<b>形狀</b>：直鏈分子接觸面積大，支鏈越多越接近球形、接觸面積越小，沸點越低。',
    al: '都有一個 –OH 可以形成氫鍵，碳鏈每多一個 CH₂，分散力增加，沸點約升高 15–20 °C。',
    is: '分子式相同。醇有 O–H 可以互相形成氫鍵，醚的 O 上沒有 H，分子之間不能形成氫鍵，沸點低很多；2-丙醇的支鏈使接觸面積較小。',
    hx: '分子量相近。CH₄ 只有分散力；N、O、F 上的 H 能形成氫鍵。H₂O 每個分子有 2 個 H 和 2 對孤對電子，平均能形成最多氫鍵，沸點最高。' };
  function draw() {
    const [, d] = BPS[cur], lo = Math.min(...d.map(x => x[2])) - 20, hi = Math.max(...d.map(x => x[2])) + 10;
    $('#bpB', el).innerHTML = d.map(([n, mw, bp, mu, hb]) => `<div><span>${n}<small>M ${mw}、μ ${mu} D</small></span><span class="imfc"><i class="ba" style="width:${(bp - lo) / (hi - lo) * 100}%"></i><em class="tag d">分散</em>${mu >= 1 ? '<em class="tag p">偶極</em>' : ''}${hb ? '<em class="tag h">氫鍵</em>' : ''}</span><b class="mono">${bp} °C</b></div>`).join('');
    $('#bpN', el).innerHTML = NOTE[cur];
    pressSeg(el, 'bpS', cur);
  }
  bindSeg(el, 'bpS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};
