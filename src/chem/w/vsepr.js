/* ---------- 後中化學：化學鍵與分子形狀的互動圖（第二章；3D 分子在 vsepr3d.js） ---------- */

/* ===== 第 1 節：位能曲線＋兩個原子之間的吸引與排斥 =====
   鍵長 pm、鍵能 kJ/mol（教科書常用值）；曲線用 E = D[(r₀/r)¹² − 2(r₀/r)⁶] 示意 */
// 雙鍵、三鍵留給第 4 節；F–F 比 Cl–Cl 弱是例外，第 1 節不放
const BONDS2 = { 'H–H': [74, 436], 'Cl–Cl': [199, 243], 'Br–Br': [228, 193], 'I–I': [267, 151] };
W.potcurve = el => {
  const st = { b: 'Cl–Cl', r: 300 };
  el.innerHTML = `${seg('pcS', Object.keys(BONDS2).map(k => [k, k]), st.b)}<div class="w-row"><label class="rng">核間距離 r<input type="range" id="pcR" min="60" max="450" step="1"><output class="mono" id="pcO"></output></label></div><div id="pcA"></div><div id="pcG"></div><p class="eq" id="pcF"></p><p class="note" id="pcN"></p>`;
  const E = (r, [r0, D]) => D * ((r0 / r) ** 12 - 2 * (r0 / r) ** 6);
  function atoms() {
    const [r0] = BONDS2[st.b], [a, b] = st.b.split(/[–=≡]/), half = st.r * 0.5, x1 = 280 - half, x2 = 280 + half, R = Math.min(30, Math.max(14, r0 * 0.12));
    // 箭頭長度＝力的大小（曲線斜率）：吸引 ∝ (r₀/r)⁷、排斥 ∝ (r₀/r)¹³，在 r₀ 兩者相等；r₀ 時 = 40 px
    const fa = (r0 / st.r) ** 7, fr = (r0 / st.r) ** 13, La = Math.min(110, 40 * fa), Lr = Math.min(110, 40 * fr);
    const ar = (x, dir, L, y, c) => (L < 3 ? '' : `<line x1="${x}" y1="${y}" x2="${x + dir * L}" y2="${y}" stroke="${c}" stroke-width="5" marker-end="url(#pc${c === '#3A6FD8' ? 'b' : 'r'})"/>`);
    return `<svg viewBox="0 0 560 100" class="chart" role="img" aria-label="兩個原子之間的吸引與排斥"><defs><marker id="pcb" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill="#3A6FD8"/></marker><marker id="pcr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--bad)"/></marker></defs>
<circle cx="${x1}" cy="50" r="${R}" fill="var(--accent)" opacity=".25"/><circle cx="${x2}" cy="50" r="${R}" fill="var(--accent)" opacity=".25"/><text class="tk" x="${x1}" y="55" text-anchor="middle">${a}</text><text class="tk" x="${x2}" y="55" text-anchor="middle">${b}</text>
<text class="tk" x="8" y="${50 - R - 4}" fill="#3A6FD8">吸引</text><text class="tk" x="8" y="${50 + R + 13}" fill="var(--bad)">排斥</text>${ar(x1, 1, La, 50 - R - 8, '#3A6FD8')}${ar(x2, -1, La, 50 - R - 8, '#3A6FD8')}${ar(x1, -1, Lr, 50 + R + 8, 'var(--bad)')}${ar(x2, 1, Lr, 50 + R + 8, 'var(--bad)')}</svg>`;
  }
  function draw() {
    const d = BONDS2[st.b], e = E(st.r, d), xs = r0 => Array.from({ length: 200 }, (_, i) => 50 + i * 2).filter(r => r > r0 * 0.86);
    $('#pcA', el).innerHTML = atoms();
    $('#pcG', el).innerHTML = chart({ w: 560, h: 240, x: [50, 450], y: [-600, 400], xt: [100, 200, 300, 400], xtl: ['1', '2', '3', '4'], yt: [-600, -300, 0, 400], xlab: '核間距離 r（Å）', ylab: '位能（kJ/mol）', label: '位能曲線' }, (X, Y) =>
      Object.entries(BONDS2).filter(([k]) => k !== st.b).map(([, v]) => `<path class="tline faint" d="${path(xs(v[0]).map(r => [X(r), Y(clamp(E(r, v), -600, 400))]))}"/>`).join('')
      // 選到的鍵：排斥項（紅）、吸引項（藍）、相加（黑），顏色和上面的箭頭一致
      + `<path d="${path(xs(d[0]).filter(r => d[1] * (d[0] / r) ** 12 <= 400).map(r => [X(r), Y(d[1] * (d[0] / r) ** 12)]))}" fill="none" stroke="var(--bad)" stroke-width="2" stroke-dasharray="5 3"/>`
      + `<path d="${path(xs(d[0] * 0.6).filter(r => -2 * d[1] * (d[0] / r) ** 6 >= -600).map(r => [X(r), Y(-2 * d[1] * (d[0] / r) ** 6)]))}" fill="none" stroke="#3A6FD8" stroke-width="2" stroke-dasharray="5 3"/>`
      + `<path class="tline" style="stroke:var(--ink)" d="${path(xs(d[0]).map(r => [X(r), Y(clamp(E(r, d), -600, 400))]))}"/>`
      + `<text class="tk sm" x="${X(445)}" y="${Y(0) - 6}" text-anchor="end">分開時位能 = 0</text>`
      + `<line class="mk" x1="${X(d[0])}" x2="${X(d[0])}" y1="${Y(0)}" y2="${Y(-d[1])}"/><circle class="dot" data-cur="${st.b}" cx="${X(st.r)}" cy="${Y(clamp(e, -1000, 400))}" r="7"/>`);
    $('#pcR', el).value = st.r; $('#pcO', el).textContent = `${(st.r / 100).toFixed(2)} Å`;
    $('#pcF', el).innerHTML = `${st.b}：最低點 r = <b>${(d[0] / 100).toFixed(2)} Å</b>（鍵長），深度 <b>${d[1]} kJ/mol</b>（鍵能）；目前 r = ${(st.r / 100).toFixed(2)} Å，位能 ${fx(e, 0)} kJ/mol`;
    $('#pcN', el).innerHTML = st.r > d[0] * 1.05 ? '吸引比排斥大：原子會再靠近，位能往下走。' : st.r < d[0] * 0.95 ? '排斥比吸引大：位能急遽升高。' : '兩個力一樣大：這個距離就是鍵長。';
    pressSeg(el, 'pcS', st.b);
  }
  $('#pcR', el).oninput = e => { st.r = +e.target.value; draw(); };
  bindSeg(el, 'pcS', v => { st.b = v; st.r = Math.round(BONDS2[v][0] * 1.6); draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};
W.potx = el => {
  const st = { b: 'Cl–Cl', r: 300 };
  el.innerHTML = `${seg('pxS', Object.keys(BONDS2).map(k => [k, k]), st.b)}<div class="w-row"><label class="rng">核間距離 r<input type="range" id="pxR" min="60" max="450" step="1"><output class="mono" id="pxO"></output></label></div><div id="pxG"></div><div class="cards" id="pxC"></div><p class="note" id="pxN"></p>`;
  const big = v => (v >= 1e5 ? '> 100000' : v >= 100 ? fx(v, 0) : v.toPrecision(3));   // 拖到很近時排斥項極大，卡片寬度不跳
  function draw() {
    // 每種鍵的 A、B 由鍵長 r₀（Å）與鍵能 D 決定：A = D·r₀¹²、B = 2D·r₀⁶，頂點在 x₀ = 1/r₀⁶
    const [r0p, D] = BONDS2[st.b], r0 = r0p / 100, r = st.r / 100, x0 = 1 / r0 ** 6, x = 1 / r ** 6, A = D * r0 ** 12, B = 2 * D * r0 ** 6;
    const xmax = 2.2 * x0, E = v => A * v * v - B * v, tick = v => Number(v.toPrecision(2)).toString();
    $('#pxG', el).innerHTML = chart({ w: 560, h: 240, x: [0, xmax], y: [-600, 400], xt: [0, x0, 2 * x0], xtl: ['0', tick(x0), tick(2 * x0)], yt: [-600, -300, 0, 400], xlab: 'x = 1/r⁶（1/Å⁶）', ylab: '位能（kJ/mol）', label: '把橫軸換成 x = 1/r⁶ 的位能曲線' }, (X, Y) =>
      `<path class="tline" style="stroke:var(--ink)" d="${path(Array.from({ length: 111 }, (_, i) => i * xmax / 110).map(v => [X(v), Y(clamp(E(v), -600, 400))]))}"/>`
      + `<line class="mk" x1="${X(x0)}" x2="${X(x0)}" y1="${Y(0)}" y2="${Y(-D)}"/><text class="tk sm" x="${X(x0) + 6}" y="${Y(-D) + 16}">頂點 x = B ÷ 2A</text>`
      + `<text class="tk sm" x="${X(xmax) - 4}" y="${Y(-600) - 8}" text-anchor="end">x 越大，r 越小 →</text>`
      + (x <= xmax ? `<circle class="dot" data-cur="${st.b}" cx="${X(x)}" cy="${Y(clamp(E(x), -600, 400))}" r="7"/>` : ''));
    const rep = A * x * x, att = B * x;
    $('#pxC', el).innerHTML = card('r', '排斥項 A/r¹²（kJ/mol）', big(rep)) + card('a', '吸引項 B/r⁶（kJ/mol）', big(att)) + card('q', '吸引項 ÷ 排斥項', att / rep < 0.01 ? '< 0.01' : (att / rep).toPrecision(3));
    $('#pxR', el).value = st.r; $('#pxO', el).textContent = `${r.toFixed(2)} Å`;
    $('#pxN', el).innerHTML = x > xmax ? '核間距離太近，點已超出圖的右邊。' : Math.abs(x / x0 - 1) < 0.03 ? `在頂點：r = ${r0.toFixed(2)} Å 就是鍵長，吸引項是排斥項的 2 倍。` : x < x0 ? '在頂點左邊：r 比鍵長大。' : '在頂點右邊：r 比鍵長小。';
    pressSeg(el, 'pxS', st.b);
  }
  $('#pxR', el).oninput = e => { st.r = +e.target.value; draw(); };
  bindSeg(el, 'pxS', v => { st.b = v; st.r = Math.round(BONDS2[v][0] * 1.4); draw(); });
  draw();
  return { set(o) { Object.assign(st, o); draw(); } };
};


/* ===== 第 2 節：電負度差 → 電子雲偏向哪一邊 ===== */
const EN = { H: 2.20, Li: 0.98, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Na: 0.93, Mg: 1.31, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16, K: 0.82, As: 2.18, Br: 2.96, I: 2.66 };
W.bondtype = el => {
  let a = 'H', b = 'Cl';
  const opts = Object.keys(EN).map(k => `<option>${k}</option>`).join('');
  el.innerHTML = `<div class="w-row">${ctl('兩個原子', `<label class="sel">A <select id="btA">${opts}</select></label><label class="sel">B <select id="btB">${opts}</select></label>`)}${ctl('常見的鍵', [['H', 'H'], ['C', 'H'], ['H', 'Cl'], ['C', 'O'], ['H', 'F'], ['Na', 'Cl']].map(([x, y]) => `<button class="btn sm ghost" type="button" data-p="${x},${y}">${x}–${y}</button>`).join(''))}</div><div id="btE"></div><div id="btC"></div><p class="note" id="btN"></p>`;
  function cloud(d, hiLeft) {
    const xa = 190, xb = 370, f = Math.min(d / 1.7, 1), ion = d >= 1.7, dir = hiLeft ? -1 : 1;
    const cx = ion ? (hiLeft ? xa : xb) : 280 + dir * f * 75, rx = ion ? 46 : 105 - 45 * f;
    const lab = (x, t) => `<text class="tk hl" x="${x}" y="20" text-anchor="middle">${t}</text>`;
    const tags = d < 0.05 ? '' : ion ? lab(hiLeft ? xb : xa, '+') + lab(hiLeft ? xa : xb, '−') : lab(hiLeft ? xb : xa, 'δ+') + lab(hiLeft ? xa : xb, 'δ−');
    return `<svg viewBox="0 0 560 120" class="chart" role="img" aria-label="鍵上的電子雲"><ellipse data-cur="${a}–${b}" cx="${cx}" cy="68" rx="${rx}" ry="${ion ? 46 : 34}" fill="var(--accent)" opacity=".28"/>
<circle cx="${xa}" cy="68" r="24" fill="none" stroke="currentColor" stroke-opacity=".5"/><circle cx="${xb}" cy="68" r="24" fill="none" stroke="currentColor" stroke-opacity=".5"/><text class="tk" x="${xa}" y="73" text-anchor="middle">${a}</text><text class="tk" x="${xb}" y="73" text-anchor="middle">${b}</text>${tags}</svg>`;
  }
  function draw() {
    const d = Math.abs(EN[a] - EN[b]), hi = EN[a] >= EN[b] ? a : b, lo = hi === a ? b : a;
    $('#btE', el).innerHTML = cloud(d, EN[a] > EN[b]);
    $('#btC', el).innerHTML = chart({ x: [0, 3.3], y: [0, 1], xt: [0, 1, 2, 3], yt: [], xlab: '電負度差 ΔEN', h: 110 }, (X, Y) => `<rect x="${X(0)}" y="${Y(1)}" width="${X(0.5) - X(0)}" height="${Y(0) - Y(1)}" fill="var(--acid)" opacity=".12"/><rect x="${X(0.5)}" y="${Y(1)}" width="${X(1.7) - X(0.5)}" height="${Y(0) - Y(1)}" fill="var(--accent)" opacity=".12"/><rect x="${X(1.7)}" y="${Y(1)}" width="${X(3.3) - X(1.7)}" height="${Y(0) - Y(1)}" fill="var(--base)" opacity=".14"/><text class="tk" x="${X(0.25)}" y="${Y(0.8)}" text-anchor="middle">非極性</text><text class="tk sm" x="${X(0.5)}" y="${Y(0.15)}" text-anchor="middle">約 0.5</text><text class="tk sm" x="${X(1.7)}" y="${Y(0.15)}" text-anchor="middle">約 1.7</text><text class="tk" x="${X(1.1)}" y="${Y(0.8)}" text-anchor="middle">極性共價</text><text class="tk" x="${X(2.5)}" y="${Y(0.8)}" text-anchor="middle">離子性為主</text><circle class="dot" cx="${X(Math.min(3.2, d))}" cy="${Y(0.35)}" r="8"/>`);
    $('#btN', el).innerHTML = a === b ? `${a}–${b}：ΔEN = 0，<b>非極性共價鍵</b>。` : `${a}–${b}：ΔEN = ${fx(d, 2)}，${d < 0.5 ? '<b>非極性共價鍵</b>。' : d < 1.7 ? `<b>極性共價鍵</b>，${hi} 端 δ−。` : `<b>離子鍵</b>：${lo} 變成陽離子、${hi} 變成陰離子。`}`;
    $('#btA', el).value = a; $('#btB', el).value = b;
  }
  $('#btA', el).onchange = e => { a = e.target.value; draw(); };
  $('#btB', el).onchange = e => { b = e.target.value; draw(); };
  $$('[data-p]', el).forEach(x => { x.onclick = () => { [a, b] = x.dataset.p.split(','); draw(); }; });
  draw();
  return { set(s) { a = s.a || a; b = s.b || b; draw(); } };
};

/* ===== 第 2 節：晶格能——兩組離子並排比較電荷與距離 =====
   晶格能 kJ/mol（Brown《Chemistry: The Central Science》表 8.2）；離子半徑 pm（Shannon，配位數 6） */
const IONRAD = { 'Li⁺': 76, 'Na⁺': 102, 'K⁺': 138, 'Cs⁺': 167, 'Mg²⁺': 72, 'Ca²⁺': 100, 'Sr²⁺': 118, 'F⁻': 133, 'Cl⁻': 181, 'Br⁻': 196, 'I⁻': 220, 'O²⁻': 140 };
const LAT = [['LiF', 'Li⁺', 'F⁻', 1, 1030], ['LiCl', 'Li⁺', 'Cl⁻', 1, 834], ['NaF', 'Na⁺', 'F⁻', 1, 910], ['NaCl', 'Na⁺', 'Cl⁻', 1, 788], ['NaBr', 'Na⁺', 'Br⁻', 1, 732], ['NaI', 'Na⁺', 'I⁻', 1, 682], ['KCl', 'K⁺', 'Cl⁻', 1, 701], ['CsCl', 'Cs⁺', 'Cl⁻', 1, 657], ['MgO', 'Mg²⁺', 'O²⁻', 4, 3795], ['CaO', 'Ca²⁺', 'O²⁻', 4, 3414], ['SrO', 'Sr²⁺', 'O²⁻', 4, 3217]];
W.lattice = el => {
  const st = { a: 'NaCl', b: 'MgO' };
  const opts = LAT.map(([f]) => `<option>${f}</option>`).join('');
  el.innerHTML = `<div class="w-row">${ctl('左邊', `<label class="sel"><select id="ltA">${opts}</select></label>`)}${ctl('右邊', `<label class="sel"><select id="ltB">${opts}</select></label>`)}${ctl('常考的比較', [['NaF', 'NaI'], ['NaCl', 'MgO'], ['LiCl', 'KCl'], ['MgO', 'SrO']].map(([x, y]) => `<button class="btn sm ghost" type="button" data-p="${x},${y}">${x}／${y}</button>`).join(''))}</div><div id="ltG"></div><div class="cards" id="ltK"></div><p class="note" id="ltN"></p>`;
  const row = f => LAT.find(x => x[0] === f), xv = ([, c, a, q]) => 1000 * q / (IONRAD[c] + IONRAD[a]);
  function pair(f, cx) {
    const [, c, a] = row(f), k = 0.33, rc = IONRAD[c] * k, ra = IONRAD[a] * k, x0 = cx - (rc + ra), y = 82, ly = y + Math.max(rc, ra) + 12;
    return `<circle cx="${x0 + rc}" cy="${y}" r="${rc}" fill="var(--base)" opacity=".3"/><circle cx="${x0 + 2 * rc + ra}" cy="${y}" r="${ra}" fill="var(--bad)" opacity=".25"/>
<text class="tk" x="${x0 + rc}" y="${y + 5}" text-anchor="middle">${c}</text><text class="tk" x="${x0 + 2 * rc + ra}" y="${y + 5}" text-anchor="middle">${a}</text>
<line x1="${x0 + rc}" y1="${ly}" x2="${x0 + 2 * rc + ra}" y2="${ly}" stroke="currentColor" stroke-width="2" data-cur="${f}"/><text class="tk" x="${cx}" y="${ly + 17}" text-anchor="middle">${f}：r = ${IONRAD[c] + IONRAD[a]} pm</text>`;
  }
  function draw() {
    const A = row(st.a), B = row(st.b), qs = d => (d[3] === 4 ? '2 × 2' : '1 × 1');
    $('#ltG', el).innerHTML = `<svg viewBox="0 0 560 196" class="chart" role="img" aria-label="兩組離子照比例並排">${pair(st.a, 140)}${pair(st.b, 420)}</svg>`;
    $('#ltK', el).innerHTML = card('a', `${st.a} 晶格能`, `${A[4]} kJ/mol`) + card('b', `${st.b} 晶格能`, `${B[4]} kJ/mol`) + card('r', '右 ÷ 左', `${fx(B[4] / A[4], 2)} 倍`, `電荷乘積 ÷ r 是 ${fx(xv(B) / xv(A), 2)} 倍`);
    $('#ltN', el).innerHTML = A[3] !== B[3] ? '電荷乘積差 4 倍，影響比距離大得多。' : '電荷相同，只比距離：r 越小，晶格能越大。';
    $('#ltA', el).value = st.a; $('#ltB', el).value = st.b;
  }
  $('#ltA', el).onchange = e => { st.a = e.target.value; draw(); };
  $('#ltB', el).onchange = e => { st.b = e.target.value; draw(); };
  $$('[data-p]', el).forEach(x => { x.onclick = () => { [st.a, st.b] = x.dataset.p.split(','); draw(); }; });
  draw();
  return { set(s) { if (s.f) { st.b = s.f; if (st.a === s.f) st.a = s.f === 'NaCl' ? 'NaI' : 'NaCl'; } draw(); } };
};

/* ===== 第 3 節：路易斯結構與形式電荷 =====
   每個結構：原子 [元素, 孤對數, x, y]、鍵 [i, j, 鍵級] */
const VAL = { N: 5, C: 4, O: 6, P: 5, Cl: 7, S: 6 };
const LEWIS = {
  nco: ['NCO⁻', [[['N', 2, -1.3, 0], ['C', 0, 0, 0], ['O', 2, 1.3, 0]], [[0, 1, 2], [1, 2, 2]]], [[['N', 1, -1.3, 0], ['C', 0, 0, 0], ['O', 3, 1.3, 0]], [[0, 1, 3], [1, 2, 1]]], [[['N', 3, -1.3, 0], ['C', 0, 0, 0], ['O', 1, 1.3, 0]], [[0, 1, 1], [1, 2, 3]]]],
  n2o: ['N₂O', [[['N', 2, -1.3, 0], ['N', 0, 0, 0], ['O', 2, 1.3, 0]], [[0, 1, 2], [1, 2, 2]]], [[['N', 1, -1.3, 0], ['N', 0, 0, 0], ['O', 3, 1.3, 0]], [[0, 1, 3], [1, 2, 1]]], [[['N', 3, -1.3, 0], ['N', 0, 0, 0], ['O', 1, 1.3, 0]], [[0, 1, 1], [1, 2, 3]]]],
  co2: ['CO₂', [[['O', 2, -1.3, 0], ['C', 0, 0, 0], ['O', 2, 1.3, 0]], [[0, 1, 2], [1, 2, 2]]], [[['O', 1, -1.3, 0], ['C', 0, 0, 0], ['O', 3, 1.3, 0]], [[0, 1, 3], [1, 2, 1]]]],
  co: ['CO', [[['C', 1, -0.65, 0], ['O', 1, 0.65, 0]], [[0, 1, 3]]]],
  cn: ['CN⁻', [[['C', 1, -0.65, 0], ['N', 1, 0.65, 0]], [[0, 1, 3]]]],
  no: ['NO⁺', [[['N', 1, -0.65, 0], ['O', 1, 0.65, 0]], [[0, 1, 3]]]],
  no3: ['NO₃⁻', [[['N', 0, 0, 0], ['O', 2, 0, 1.3], ['O', 3, -1.15, -0.65], ['O', 3, 1.15, -0.65]], [[0, 1, 2], [0, 2, 1], [0, 3, 1]]]],
  pocl3: ['POCl₃', [[['P', 0, 0, 0], ['O', 2, 0, 1.3], ['Cl', 3, -1.15, -0.55], ['Cl', 3, 1.15, -0.55], ['Cl', 3, 0, -1.3]], [[0, 1, 2], [0, 2, 1], [0, 3, 1], [0, 4, 1]]], [[['P', 0, 0, 0], ['O', 3, 0, 1.3], ['Cl', 3, -1.15, -0.55], ['Cl', 3, 1.15, -0.55], ['Cl', 3, 0, -1.3]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]]],
};
const FCCOL = { N: '#3A6FD8', C: '#59615E', O: '#D9453B', P: '#E08A2E', Cl: '#3FA34D', S: '#C9A21F' };
W.fcharge = el => {
  const st = { m: 'nco', k: 0, t: 'fc', a: 1 };
  el.innerHTML = `<div class="w-row">${ctl('粒子', segX('fcS', Object.entries(LEWIS).map(([k, v]) => [k, v[0]]), st.m))}</div>
<div class="w-row">${ctl('步驟', segX('fcT', [['val', '① 數價電子'], ['lew', '② 畫結構'], ['fc', '③ 算形式電荷']], st.t))}${ctl('結構', segX('fcK', [0, 1, 2].map(i => [String(i), `結構 ${i + 1}`]), '0'))}</div>
<div id="fcG"></div><div class="fcrows" id="fcR"></div><p class="note" id="fcN"></p>`;
  const nb = (bd, i) => bd.filter(b => b[0] === i || b[1] === i).reduce((s, b) => s + b[2], 0);
  const fcOf = ([at, bd]) => at.map(([e, lp], i) => VAL[e] - 2 * lp - nb(bd, i));
  const sgn = v => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0'), chs = v => (v === 0 ? '' : `${Math.abs(v) > 1 ? Math.abs(v) : ''}${v > 0 ? '+' : '−'}`);
  const score = f => { const fc = fcOf(f); return fc.reduce((a, v) => a + Math.abs(v), 0) * 10 - fc.reduce((a, v, i) => a + (v < 0 ? EN[f[0][i][0]] : 0), 0); };
  const W2 = 380, H2 = 200, S = 52, P = (x, y) => [W2 / 2 + x * S, H2 / 2 - y * S];
  function lewisSVG(f, nm, fc, sel) {
    const [at, bd] = f, atoms = {}, bonds = [];
    at.forEach(([e, lp, x, y], i) => {
      const dirs = bd.filter(b => b[0] === i || b[1] === i).map(b => { const j = b[0] === i ? b[1] : b[0]; return Math.atan2(at[j][3] - y, at[j][2] - x) * 180 / Math.PI; });
      let lps = [];
      if (dirs.length === 1) lps = Array.from({ length: lp }, (_, q) => dirs[0] + 180 + (q - (lp - 1) / 2) * 90);
      else { const mx = dirs.reduce((a, t) => a + Math.cos(t * Math.PI / 180), 0), my = dirs.reduce((a, t) => a + Math.sin(t * Math.PI / 180), 0), base = Math.hypot(mx, my) > 0.2 ? Math.atan2(-my, -mx) * 180 / Math.PI : 90; lps = Array.from({ length: lp }, (_, q) => base + (lp === 2 && Math.hypot(mx, my) <= 0.2 ? q * 180 : (q - (lp - 1) / 2) * 70)); }
      atoms['a' + i] = { x, y, t: e, lp: lps, c: fc ? chs(fc[i]) : '' };
    });
    bd.forEach(([i, j, o]) => bonds.push(['a' + i, 'a' + j, o === 3 ? 't' : o === 2 ? 'd' : 's']));
    let extra = '';
    if (sel != null) {   // 圈出屬於這個原子的電子：自己的孤對（整圈）＋每個鍵的一半（粗線）
      const [x, y] = P(at[sel][2], at[sel][3]);
      bd.filter(b => b[0] === sel || b[1] === sel).forEach(b => { const j = b[0] === sel ? b[1] : b[0], [x2, y2] = P(at[j][2], at[j][3]); extra += `<line x1="${x}" y1="${y}" x2="${(x + x2) / 2}" y2="${(y + y2) / 2}" stroke="var(--accent)" stroke-width="12" stroke-linecap="round" opacity=".35"/>`; });
      extra += `<circle cx="${x}" cy="${y}" r="${S * 0.58}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="5 4" data-cur="${at[sel][0]}"/>`;
    }
    const hit = at.map(([, , x, y], i) => { const [px, py] = P(x, y); return `<circle cx="${px}" cy="${py}" r="20" fill="transparent" data-a="${i}" style="cursor:pointer"/>`; }).join('');
    return MOL.svg({ atoms, bonds }, { w: W2, h: H2, s: S, label: nm }).replace('<svg ', '<svg style="max-width:420px;margin:auto" ').replace('</svg>', extra + hit + '</svg>');
  }
  function valSVG(at, q) {   // 每個原子分開畫，價電子用自己的顏色點在四周
    const n = at.length, gap = Math.min(110, 340 / n), x0 = W2 / 2 - gap * (n - 1) / 2, side = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    let s = at.map(([e], i) => { const cx = x0 + i * gap, cy = 92, c = FCCOL[e] || '#555';
      const dots = Array.from({ length: VAL[e] }, (_, k) => { const [dx, dy] = side[k % 4], o = k < 4 ? -4 : 4, px = cx + dx * 22 + (dx ? 0 : o), py = cy + dy * 22 + (dy ? 0 : o); return `<circle cx="${px}" cy="${py}" r="3.4" fill="${c}"/>`; }).join('');
      return `<text class="at" x="${cx}" y="${cy + 6}" text-anchor="middle" fill="${c}">${e}</text>${dots}<text class="tk" x="${cx}" y="${cy + 52}" text-anchor="middle">${VAL[e]}</text>`; }).join('');
    if (q) s += Array.from({ length: Math.abs(q) }, (_, k) => `<circle cx="${W2 - 24 - k * 10}" cy="30" r="3.4" fill="var(--muted)"/>`).join('') + `<text class="tk" x="${W2 - 22}" y="56" text-anchor="end">電荷 ${q < 0 ? '+' : '−'}${Math.abs(q)}</text>`;
    return `<svg viewBox="0 0 ${W2} 170" class="chart" style="max-width:420px;margin:auto" role="img" aria-label="各原子的價電子">${s}</svg>`;
  }
  function draw() {
    const [nm, ...forms] = LEWIS[st.m]; st.k = Math.min(st.k, forms.length - 1);
    const f = forms[st.k], [at, bd] = f, fc = fcOf(f), q = fcOf(forms[0]).reduce((a, b) => a + b, 0), best = forms.map(score).indexOf(Math.min(...forms.map(score)));
    st.a = Math.min(st.a, at.length - 1);
    const tot = at.reduce((s, [e]) => s + VAL[e], 0) - q;
    if (st.t === 'val') {
      $('#fcG', el).innerHTML = valSVG(at, q);
      $('#fcR', el).innerHTML = `<span>${at.map(([e]) => `${e} ${VAL[e]}`).join(' ＋ ')}${q ? ` ${q < 0 ? '＋' : '−'} 電荷 ${Math.abs(q)}` : ''} = <b>${tot} 個價電子 = ${tot / 2} 對</b></span>`;
      $('#fcN', el).innerHTML = '先數總價電子數：每個原子帶來自己的價電子（主族元素 = 族號的個位數），陰離子多幾個負電荷就加幾個，陽離子減掉。下一步把這些電子對分配成鍵和孤對電子。';
    } else {
      $('#fcG', el).innerHTML = lewisSVG(f, nm, st.t === 'fc' ? fc : null, st.t === 'fc' ? st.a : null);
      if (st.t === 'lew') {
        $('#fcR', el).innerHTML = `<span>鍵 ${bd.reduce((s, b) => s + b[2], 0)} 對 ＋ 孤對 ${at.reduce((s, a) => s + a[1], 0)} 對 = <b>${tot / 2} 對</b>（和第 ① 步一樣）</span>`;
        $('#fcN', el).innerHTML = `畫法：先用單鍵把原子連起來，剩下的電子對當孤對電子補給外圍原子，讓每個原子周圍有 8 個電子（八隅體）；不夠時把孤對電子改成雙鍵或參鍵。${forms.length > 1 ? `${nm} 可以畫出 ${forms.length} 種，到第 ③ 步比較哪一個最好。` : ''}${st.m === 'pocl3' && st.k === 0 ? ' 結構 1 的 P 周圍有 10 個電子（擴展八隅體）：P 在第三週期，有空的 3d 軌域可以容納多出來的電子，體積也大到能圍住更多原子。' : ''}`;
      } else {
        $('#fcR', el).innerHTML = at.map(([e, lp], i) => `<span class="${i === st.a ? 'on' : ''}" data-a="${i}"><b>${e}</b>：價電子 ${VAL[e]} − 圈到（孤對 ${2 * lp} ＋ 鍵 ${nb(bd, i)}）= <b class="${fc[i] ? 'bad' : ''}">${sgn(fc[i])}</b></span>`).join('');
        $('#fcN', el).innerHTML = `點圖上的原子。虛線圈住的是「算給它」的電子：自己的孤對電子全部算，每個鍵只算一半（一條線算 1 個）。形式電荷 = 價電子數 − 圈到的電子數；全部加起來 = ${sgn(fc.reduce((a, b) => a + b, 0))}，等於整個粒子的電荷。${forms.length > 1 ? `選最好的結構：形式電荷越接近 0 越好，負的放在電負度大的原子上——這裡是<b>結構 ${best + 1}</b>。` : ''}`;
      }
    }
    pressSeg(el, 'fcS', st.m); pressSeg(el, 'fcT', st.t);
    $$('#fcK button', el).forEach(b => { b.disabled = +b.dataset.v >= forms.length || st.t === 'val'; b.setAttribute('aria-pressed', String(+b.dataset.v === st.k)); });
    $$('[data-a]', el).forEach(x => { x.onclick = () => { st.a = +x.dataset.a; if (st.t !== 'fc') st.t = 'fc'; draw(); }; });
  }
  bindSeg(el, 'fcS', v => { st.m = v; st.k = 0; const at = LEWIS[v][1][0]; st.a = at.length === 2 ? 0 : at.length === 3 && at[0][0] !== 'N' && at[0][0] !== 'O' ? 0 : at.length === 3 ? 1 : 0; draw(); });
  bindSeg(el, 'fcT', v => { st.t = v; draw(); });
  bindSeg(el, 'fcK', v => { st.k = +v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); if (s.m && s.a == null) st.a = LEWIS[s.m][1][0].length === 3 ? 1 : 0; draw(); } };
};

/* ===== 第 4 節：共振結構、平均鍵級與鍵長 =====
   [名稱, 鍵長 pm, 結構們（原子 [標籤, 孤對, x, y]、鍵 [i, j, 鍵級]，同一粒子的鍵順序相同）, 要比的鍵在第幾條]
   鍵長：教科書常用值；N₂O₄ 的 N–N 為 175 pm（很長的單鍵） */
const RES = {
  co: ['C–O 鍵', [
    ['CH₃OH', 143, [[[['H₃C', 0, -0.8, 0], ['O', 2, 0.55, 0], ['H', 0, 1.35, 0.55]], [[0, 1, 1], [1, 2, 1]]]], 0],
    ['CO₃²⁻', 129, [0, 1, 2].map(k => [[['C', 0, 0, 0], ['O', k === 0 ? 2 : 3, 0, 1.2], ['O', k === 1 ? 2 : 3, -1.05, -0.6], ['O', k === 2 ? 2 : 3, 1.05, -0.6]], [[0, 1, k === 0 ? 2 : 1], [0, 2, k === 1 ? 2 : 1], [0, 3, k === 2 ? 2 : 1]]]), 0],
    ['HCOO⁻', 127, [0, 1].map(k => [[['C', 0, 0, 0], ['H', 0, -1.1, 0], ['O', k ? 3 : 2, 0.65, 0.95], ['O', k ? 2 : 3, 0.65, -0.95]], [[0, 1, 1], [0, 2, k ? 1 : 2], [0, 3, k ? 2 : 1]]]), 1],
    ['H₂C=O', 121, [[[['C', 0, -0.3, 0], ['O', 2, 0.95, 0], ['H', 0, -0.95, 0.9], ['H', 0, -0.95, -0.9]], [[0, 1, 2], [0, 2, 1], [0, 3, 1]]]], 0],
    ['CO₂', 116, [[[['O', 2, -1.2, 0], ['C', 0, 0, 0], ['O', 2, 1.2, 0]], [[0, 1, 2], [1, 2, 2]]]], 0],
    ['CO', 113, [[[['C', 1, -0.6, 0], ['O', 1, 0.6, 0]], [[0, 1, 3]]]], 0]]],
  nn: ['N–N 鍵', [
    ['N₂O₄', 175, [[[['N', 0, -0.62, 0], ['N', 0, 0.62, 0], ['O', 2, -1.25, 0.95], ['O', 3, -1.25, -0.95], ['O', 2, 1.25, 0.95], ['O', 3, 1.25, -0.95]], [[0, 1, 1], [0, 2, 2], [0, 3, 1], [1, 4, 2], [1, 5, 1]]]], 0],
    ['N₂H₄', 145, [[[['N', 1, -0.62, 0], ['N', 1, 0.62, 0], ['H', 0, -1.2, 0.8], ['H', 0, -1.2, -0.8], ['H', 0, 1.2, 0.8], ['H', 0, 1.2, -0.8]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]]]], 0],
    ['N₂O', 113, [[[['N', 2, -1.2, 0], ['N', 0, 0, 0], ['O', 2, 1.2, 0]], [[0, 1, 2], [1, 2, 2]]], [[['N', 1, -1.2, 0], ['N', 0, 0, 0], ['O', 3, 1.2, 0]], [[0, 1, 3], [1, 2, 1]]]], 0],
    ['N₂', 110, [[[['N', 1, -0.6, 0], ['N', 1, 0.6, 0]], [[0, 1, 3]]]], 0]]],
  cc: ['C–C 鍵', [
    ['乙烷', 154, [[[['H₃C', 0, -0.65, 0], ['CH₃', 0, 0.65, 0]], [[0, 1, 1]]]], 0],
    ['苯', 140, [0, 1].map(k => [Array.from({ length: 6 }, (_, i) => ['', 0, Math.cos((90 + 60 * i) * Math.PI / 180) * 1.1, Math.sin((90 + 60 * i) * Math.PI / 180) * 1.1]), Array.from({ length: 6 }, (_, i) => [i, (i + 1) % 6, (i + k) % 2 ? 1 : 2])]), 0],
    ['乙烯', 134, [[[['H₂C', 0, -0.65, 0], ['CH₂', 0, 0.65, 0]], [[0, 1, 2]]]], 0],
    ['乙炔', 120, [[[['HC', 0, -0.65, 0], ['CH', 0, 0.65, 0]], [[0, 1, 3]]]], 0]]],
};
W.bondlen = el => {
  const st = { c: 'co', i: 2 };
  el.innerHTML = `<div class="w-row">${ctl('比哪一種鍵', segX('blS', Object.entries(RES).map(([k, v]) => [k, v[0]]), st.c))}${ctl('粒子', '<label class="sel"><select id="blM"></select></label>')}</div>
<div class="resrow" id="blF"></div><div id="blA"></div><div id="blR"></div><p class="note" id="blN"></p>`;
  const kind = o => (o === 3 ? 't' : o === 2 ? 'd' : 's');
  const svgOf = ([at, bd], o) => { const atoms = {}, bonds = [];
    at.forEach(([t, lp, x, y], i) => { atoms['a' + i] = { x, y, t, lp: lp ? Array.from({ length: lp }, (_, q) => (Math.atan2(y, x) * 180 / Math.PI) + (q - (lp - 1) / 2) * 75) : [] }; });
    bd.forEach(([i, j, k]) => bonds.push(['a' + i, 'a' + j, k]));
    return MOL.svg({ atoms, bonds }, o); };
  function draw() {
    const [nm, list] = RES[st.c]; st.i = Math.min(st.i, list.length - 1);
    const [name, len, forms, tb] = list[st.i], avg = forms[0][1].map((_, b) => forms.reduce((s, f) => s + f[1][b][2], 0) / forms.length), bo = avg[tb];
    $('#blM', el).innerHTML = list.map(([n], i) => `<option value="${i}"${i === st.i ? ' selected' : ''}>${n}</option>`).join('');
    const small = { w: 170, h: 130, s: 36 };
    $('#blF', el).innerHTML = forms.length > 1 ? forms.map(f => `<div>${svgOf([f[0], f[1].map(([i, j, o]) => [i, j, kind(o)])], small)}</div>`).join('<span class="rarr">↔</span>') : `<p class="small mut">${name} 只有一種路易斯結構，沒有共振。</p>`;
    // 平均結構：鍵級不是整數的畫成一實一虛；要比的鍵標上鍵級
    const f0 = forms[0], [i0, j0] = f0[1][tb], ab = f0[1].map(([i, j], b) => [i, j, Number.isInteger(avg[b]) ? kind(avg[b]) : avg[b] < 2 ? 'sd' : 't']);
    const [x1, y1, x2, y2] = [f0[0][i0][2], f0[0][i0][3], f0[0][j0][2], f0[0][j0][3]], S = 44, cx = 190, cy = 85, mx = cx + (x1 + x2) / 2 * S, my = cy - (y1 + y2) / 2 * S, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    // 鍵級標籤放在鍵的旁邊：兩個垂直方向中，離其他原子比較遠的那一邊
    const near = (x, y) => Math.min(...f0[0].map(a => Math.hypot(cx + a[2] * S - x, cy - a[3] * S - y)));
    const cand = [1, -1].map(sg => [sg * dy / L, sg * dx / L]), [ux, uy] = cand.sort((p, q) => near(mx + q[0] * 40, my + q[1] * 40) - near(mx + p[0] * 40, my + p[1] * 40))[0], lx = mx + ux * 24, ly = my + uy * 20 + 4, lab = Number.isInteger(bo) ? bo : bo === 1.5 ? '1.5' : bo > 2 ? '2.5' : '4/3';
    $('#blA', el).innerHTML = `<p class="lbl c">${forms.length > 1 ? '真實的粒子＝平均：' : ''}${name}</p>` + svgOf([forms.length > 1 ? f0[0].map(a => [a[0], 0, a[2], a[3]]) : f0[0], ab], { w: 380, h: 170, s: S }).replace('<svg ', '<svg style="max-width:400px;margin:auto" ').replace('</svg>', `<text class="tk hl" x="${lx}" y="${ly}" text-anchor="${ux > 0.4 ? 'start' : ux < -0.4 ? 'end' : 'middle'}" data-cur="${name}">鍵級 ${lab}</text></svg>`);
    const lo = 100, hi = 180, X = v => 120 + (v - lo) / (hi - lo) * 300;
    $('#blR', el).innerHTML = `<svg viewBox="0 0 560 ${list.length * 28 + 30}" class="chart" role="img" aria-label="${nm}的鍵長">${list.map(([n, l, fs, t], i) => { const a = fs[0][1].map((_, b) => fs.reduce((s, f) => s + f[1][b][2], 0) / fs.length)[t], y = 18 + i * 28;
      return `<text class="tk${i === st.i ? ' hl' : ''}" x="110" y="${y + 5}" text-anchor="end">${n}</text><rect x="120" y="${y - 7}" width="${X(l) - 120}" height="14" rx="3" fill="${i === st.i ? 'var(--accent)' : 'var(--muted)'}" opacity="${i === st.i ? 0.9 : 0.4}"/><text class="tk" x="${X(l) + 8}" y="${y + 5}">${l} pm・鍵級 ${Number.isInteger(a) ? a : fx(a, 2).replace(/0$/, '')}</text>`; }).join('')}
<text class="tk" x="120" y="${list.length * 28 + 24}">尺：長條越長＝鍵越長</text></svg>`;
    $('#blN', el).innerHTML = `${forms.length > 1 ? `${name} 有 ${forms.length} 個共振結構，只差在電子（雙鍵）放在哪裡。真實的粒子不會在它們之間跳來跳去，而是固定的平均：每個鍵的鍵級 = 各結構的鍵級平均 = <b>${lab}</b>，所以這幾個鍵一樣長。` : `${name} 的這個鍵鍵級是 <b>${lab}</b>。`}下面的尺把同一種鍵排在一起：<b>鍵級越高，鍵越短</b>（也越強）。${st.c === 'nn' && st.i === 0 ? 'N₂O₄ 的 N–N 是單鍵，而且兩個 N 都帶正的形式電荷互相排斥，所以特別長。' : ''}`;
    pressSeg(el, 'blS', st.c);
  }
  bindSeg(el, 'blS', v => { st.c = v; st.i = 0; draw(); });
  $('#blM', el).onchange = e => { st.i = +e.target.value; draw(); };
  draw();
  return { set(s) { if (s.c) { st.c = s.c; st.i = s.i ?? (s.c === 'co' ? 2 : 0); } draw(); } };
};

/* ===== 第 8 節：氫化物的沸點＋兩個分子之間的作用力 ===== */
const IMFH = { 14: ['CH₄', -161.5, 'SiH₄', -111.9, 'GeH₄', -88.5, 'SnH₄', -51.8], 15: ['NH₃', -33.3, 'PH₃', -87.7, 'AsH₃', -62.5, 'SbH₃', -17.0], 16: ['H₂O', 100.0, 'H₂S', -60.3, 'H₂Se', -41.3, 'H₂Te', -2.2], 17: ['HF', 19.5, 'HCl', -85.1, 'HBr', -66.8, 'HI', -35.4] };
// 兩分子圖：[中心元素, H 數, 孤對數, 作用力 'hb'|'dd'|'disp', 分子大小（分散力的雲）]
const IMFP = { 'CH₄': ['C', 4, 0, 'disp', 0.9], 'SnH₄': ['Sn', 4, 0, 'disp', 1.35], 'NH₃': ['N', 3, 1, 'hb'], 'HF': ['F', 1, 3, 'hb'], 'H₂O': ['O', 2, 2, 'hb'], 'H₂S': ['S', 2, 2, 'dd'], 'HCl': ['Cl', 1, 3, 'dd'] };
W.imf = el => {
  const st = { h: 'H₂O' }, C = { 14: 'var(--muted)', 15: 'var(--acid)', 16: 'var(--arrow)', 17: 'var(--base)' };
  el.innerHTML = `<div class="w-row">${ctl('看兩個分子之間', segX('imS', Object.keys(IMFP).map(k => [k, k]), st.h))}</div><div class="bgrid"><div id="imC"></div><div id="imP"></div></div><p class="note" id="imN"></p>`;
  function pairSVG() {
    const [X, nH, nLP, kind, size] = IMFP[st.h], atoms = {}, bonds = [];
    // 左分子：一個 H 指向右；右分子：一對孤對電子（或 H）指向左
    const mk = (id, cx, face) => { const n = nH + nLP, angs = Array.from({ length: n }, (_, i) => face + i * 360 / n);
      atoms[id] = { x: cx, y: 0, t: X, lp: [], halo: kind === 'disp' ? size : 0, c: kind === 'dd' ? (id === 'A' ? '' : 'δ−') : '' };
      const hFirst = id === 'A' || !nLP;
      angs.forEach((g, i) => { const isH = hFirst ? i < nH : i >= nLP; if (isH) { const h = id + 'h' + i; atoms[h] = { x: cx + Math.cos(g * Math.PI / 180) * 0.95, y: Math.sin(g * Math.PI / 180) * 0.95, t: 'H', c: kind === 'dd' && id === 'A' && i === 0 ? 'δ+' : '' }; bonds.push([id, h, 's']); } else atoms[id].lp.push(g); }); };
    mk('A', -1.65, 0); mk('B', 1.55, 180);
    const S = 46, cx = 200, P = (x, y) => [cx + x * S, 85 - y * S];
    let extra = '';
    if (kind !== 'disp') { const [x1, y1] = P(-0.6, 0), [x2, y2] = P(1.55 - 0.5, 0); extra = `<line x1="${x1 + 8}" y1="${y1}" x2="${x2 - 4}" y2="${y2}" stroke="${kind === 'hb' ? 'var(--bad)' : 'var(--muted)'}" stroke-width="${kind === 'hb' ? 3 : 2}" stroke-dasharray="${kind === 'hb' ? '6 4' : '2 4'}" data-cur="${st.h}"/><text class="tk${kind === 'hb' ? ' hl' : ''}" x="${(x1 + x2) / 2}" y="${y1 + 38}" text-anchor="middle">${kind === 'hb' ? '氫鍵' : '偶極–偶極力'}</text>`; }
    else extra = `<text class="tk hl" x="${cx - 2}" y="160" text-anchor="middle" data-cur="${st.h}">分散力（雲越大越強）</text>`;
    return MOL.svg({ atoms, bonds }, { w: 400, h: 175, s: S, cx, cy: 85 }).replace('<svg ', '<svg style="max-width:420px;margin:auto" ').replace('</svg>', extra + '</svg>');
  }
  function draw() {
    $('#imC', el).innerHTML = chart({ x: [1.5, 5.5], y: [-180, 120], xt: [2, 3, 4, 5], yt: [-150, -100, -50, 0, 50, 100], xlab: '週期', ylab: '沸點（°C）', h: 280, label: '氫化物沸點' }, (X, Y) => Object.entries(IMFH).map(([g, d]) => { const pts = [0, 1, 2, 3].map(i => [X(i + 2), Y(d[2 * i + 1])]);
      return `<path d="${path(pts)}" fill="none" stroke="${C[g]}" stroke-width="2.4"/>${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${d[2 * i] === st.h ? 8 : 4}" fill="${C[g]}" ${IMFP[d[2 * i]] ? `data-h="${d[2 * i]}" style="cursor:pointer"` : ''}/><text class="tk${d[2 * i] === st.h ? ' hl' : ''}" x="${p[0] + ({ 14: -7, 15: 7, 16: 7, 17: -7 })[g]}" y="${p[1] + ({ 14: 4, 15: 14, 16: -6, 17: -6 })[g]}" text-anchor="${g == 14 || g == 17 ? 'end' : 'start'}">${d[2 * i]}</text>`).join('')}`; }).join(''));
    $('#imP', el).innerHTML = pairSVG();
    const k = IMFP[st.h][3];
    $('#imN', el).innerHTML = (k === 'hb' ? `<b>${st.h}</b>：H 接在電負度很大、又很小的 ${IMFP[st.h][0]} 上，H 幾乎是裸露的正電，被隔壁分子 ${IMFP[st.h][0]} 的孤對電子強烈吸引（紅色虛線）＝<b>氫鍵</b>。拆開氫鍵要額外的能量，所以第二週期的 NH₃、H₂O、HF 沸點反常地高（偏離同族的趨勢）。H₂O 每個分子有 2 個 H、2 對孤對電子，能形成最多氫鍵，沸點最高。`
      : k === 'dd' ? `<b>${st.h}</b>：${IMFP[st.h][0]} 比 N、O、F 大、電負度小，H 上的正電不夠集中，只有較弱的<b>偶極–偶極力</b>（加上分散力），不是氫鍵。同族往下分子越大，分散力增加，沸點又慢慢上升。`
      : `<b>${st.h}</b>：沒有孤對電子、分子對稱，只有<b>分散力</b>。分子越大、電子越多，電子雲（圈）越容易被推歪，分散力越強：CH₄ → SnH₄ 沸點一路上升。`) + ' 點左圖的點也可以切換。';
    pressSeg(el, 'imS', st.h);
  }
  el.addEventListener('click', e => { const t = e.target.closest('[data-h]'); if (t) { st.h = t.dataset.h; draw(); } });
  bindSeg(el, 'imS', v => { st.h = v; draw(); });
  draw();
  return { set(s) { if (s.h && IMFP[s.h]) st.h = s.h; draw(); } };
};

/* ===== 第 8 節：誰能和水形成氫鍵？ =====
   原子 [id, 標籤, x, y, 孤對角度們, 電荷]、鍵 [a, b]、和水的連接 [原子 id, 方向角, 'acc'（孤對接水的 H）|'don'（H 接水的 O）|'ion'] */
const HBW = {
  ether: ['甲醚 CH₃OCH₃', [['O', 'O', 0, 0.2, [60, 120]], ['C1', 'H₃C', -1.15, -0.45], ['C2', 'CH₃', 1.15, -0.45]], [['O', 'C1'], ['O', 'C2']], [['O', 60, 'acc'], ['O', 120, 'acc']], 'O 上有兩對孤對電子，可以<b>接受</b>水的 H；但 O 上沒有 H，C–H 的 H 不夠正，不能提供。所以醚能溶於水，醚分子彼此之間卻沒有氫鍵（沸點低）。'],
  ch4: ['甲烷 CH₄', [['C', 'C', 0, 0], ['H1', 'H', 0, 1], ['H2', 'H', 0.95, -0.35], ['H3', 'H', -0.95, -0.35]], [['C', 'H1'], ['C', 'H2'], ['C', 'H3']], [], '沒有孤對電子，C–H 的 H 也不帶明顯正電：<b>不能</b>和水形成氫鍵，所以甲烷幾乎不溶於水。'],
  f: ['氟離子 F⁻', [['F', 'F', 0, 0, [], '−']], [], [['F', 45, 'acc'], ['F', 135, 'acc'], ['F', 225, 'acc'], ['F', 315, 'acc']], 'F⁻ 帶負電、有四對孤對電子，可以<b>接受</b>四個水分子的 H。'],
  hcooh: ['甲酸 HCOOH', [['C', 'C', -0.35, 0], ['H0', 'H', -1.35, 0], ['O1', 'O', 0.3, 0.95, [60, 165]], ['O2', 'O', 0.3, -0.95, [-150, -90]], ['H2', 'H', 1.2, -1.25]], [['C', 'H0'], ['C', 'O1'], ['C', 'O2'], ['O2', 'H2']], [['O1', 60, 'acc'], ['H2', -20, 'don']], '既能<b>提供</b>（O–H 的 H 接水的 O），也能<b>接受</b>（C=O 的 O 接水的 H）。羧酸、醇都是這樣，所以小分子的羧酸、醇易溶於水。'],
  na: ['鈉離子 Na⁺', [['Na', 'Na', 0, 0, [], '+']], [], [['Na', 0, 'ion'], ['Na', 90, 'ion'], ['Na', 180, 'ion'], ['Na', 270, 'ion']], 'Na⁺ 沒有 H、也沒有孤對電子可以給，<b>不是氫鍵</b>：它吸引水分子帶負電的 O 端，叫做<b>離子–偶極力</b>。'],
};
W.hbwater = el => {
  const st = { m: 'hcooh' };
  el.innerHTML = `<div class="w-row">${ctl('粒子', segX('hwS', Object.entries(HBW).map(([k, v]) => [k, v[0].split(' ')[1] || v[0]]), st.m))}</div><div id="hwG"></div><p class="note" id="hwN"></p>`;
  function draw() {
    const [nm, at, bd, links, note] = HBW[st.m], atoms = {}, bonds = [], pos = {};
    at.forEach(([id, t, x, y, lp, c]) => { atoms[id] = { x, y, t, lp: lp || [], c: c || '' }; pos[id] = [x, y]; });
    bd.forEach(([a, b]) => bonds.push([a, b, 's']));
    const S = 38, cx = 220, cy = 135, P = ([x, y]) => [cx + x * S, cy - y * S];
    let extra = '';
    links.forEach(([id, g, k], n) => { const u = [Math.cos(g * Math.PI / 180), Math.sin(g * Math.PI / 180)], at0 = pos[id], w = 'w' + n, add = (p, d) => [p[0] + u[0] * d, p[1] + u[1] * d], rot = (a, d) => { const t = (g + a) * Math.PI / 180; return [Math.cos(t) * d, Math.sin(t) * d]; };
      let first;
      if (k === 'acc') { const h = add(at0, 1.25), o = add(at0, 2.0), r = rot(180 + 105, 0.75); atoms[w + 'h'] = { x: h[0], y: h[1], t: 'H' }; atoms[w + 'o'] = { x: o[0], y: o[1], t: 'O' }; atoms[w + 'h2'] = { x: o[0] - r[0] * -1, y: o[1] - r[1] * -1, t: 'H' }; bonds.push([w + 'h', w + 'o', 's'], [w + 'o', w + 'h2', 's']); first = h; }
      else { const o = add(at0, k === 'ion' ? 1.45 : 1.3), r1 = rot(55, 0.75), r2 = rot(-55, 0.75); atoms[w + 'o'] = { x: o[0], y: o[1], t: 'O' }; atoms[w + 'a'] = { x: o[0] + r1[0], y: o[1] + r1[1], t: 'H' }; atoms[w + 'b'] = { x: o[0] + r2[0], y: o[1] + r2[1], t: 'H' }; bonds.push([w + 'o', w + 'a', 's'], [w + 'o', w + 'b', 's']); first = o; }
      const [x1, y1] = P(add(at0, 0.42)), [x2, y2] = P(add(first, -0.3));
      extra += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${k === 'ion' ? 'var(--muted)' : k === 'acc' ? 'var(--bad)' : '#3A6FD8'}" stroke-width="3" stroke-dasharray="6 4"${n ? '' : ` data-cur="${nm}"`}/>`; });
    $('#hwG', el).innerHTML = MOL.svg({ atoms, bonds }, { w: 440, h: 270, s: S, cx, cy }).replace('<svg ', '<svg style="max-width:440px;margin:auto" ').replace('</svg>', extra + '</svg>');
    $('#hwN', el).innerHTML = `<b>${nm}</b>：${note}<br><span style="color:var(--bad)">紅色虛線</span>＝它的孤對電子接受水的 H；<span style="color:#3A6FD8">藍色虛線</span>＝它的 H 被水的 O 接住；灰色虛線＝離子–偶極力。`;
    pressSeg(el, 'hwS', st.m);
  }
  bindSeg(el, 'hwS', v => { st.m = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 第 8 節：沸點比較：哪一種作用力在主導 =====
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
