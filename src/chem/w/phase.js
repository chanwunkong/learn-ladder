/* ---------- 後中化學：相圖、晶格與核化學的互動圖 ---------- */

/* ===== 1. 相圖：水與二氧化碳 =====
   以實測的特徵點畫邊界（三相點、正常沸點或昇華點、臨界點），氣液線與昇華線在 (1/T, ln P) 上分段線性；熔化線用近似斜率。圖為示意，但特徵點數值正確。 */
W.phase = el => {
  const SUB = {
    water: { n: '水', tp: [273.16, 0.00604], bp: [373.15, 1], cp: [647.1, 217.7], subB: 6146, melt: P => 273.16 - 0.0074 * (P - 0.00604), notes: '熔化線向左傾（負斜率）：加壓會讓冰熔化，因為冰的密度比水小。' },
    co2: { n: '二氧化碳', tp: [216.6, 5.11], bp: null, sp: [194.7, 1], cp: [304.2, 72.9], melt: P => 216.6 + 0.02 * (P - 5.11), notes: '三相點壓力 5.1 atm 高於 1 atm，所以在一大氣壓下 CO₂ 不會變成液體，乾冰直接昇華（−78.5 °C）。熔化線向右傾，和大多數物質一樣。' },
  };
  const st = { s: 'water', T: 298, lp: 0 };
  el.innerHTML = `${seg('phS', Object.entries(SUB).map(([k, v]) => [k, v.n]), st.s)}<div class="w-row"><label class="rng">溫度（°C）<input type="range" id="phT" min="-120" max="420" step="1"><output class="mono" id="phTo"></output></label><label class="rng">壓力（atm，對數）<input type="range" id="phP" min="-3" max="3" step="0.05"><output class="mono" id="phPo"></output></label></div><div id="phG"></div><p class="note" id="phN"></p>`;
  const lin = (a, b, x) => a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
  function curves(d) {
    const iT = T => 1 / T, L = (p, q, T) => Math.exp(lin([iT(p[0]), Math.log(p[1])], [iT(q[0]), Math.log(q[1])], iT(T)));
    const lv = T => (d.bp ? (T <= d.bp[0] ? L(d.tp, d.bp, T) : L(d.bp, d.cp, T)) : L(d.tp, d.cp, T));
    const sub = T => (d.sp ? L(d.sp, d.tp, T) : d.tp[1] * Math.exp(-d.subB * (1 / T - 1 / d.tp[0])));
    return { lv, sub, pv: T => (T < d.tp[0] ? sub(T) : lv(T)) };
  }
  function phaseAt(d, T, P) {
    const c = curves(d);
    if (T >= d.cp[0] && P >= d.cp[1]) return '超臨界流體';
    if (T >= d.cp[0]) return '氣體';
    if (P < c.pv(T)) return '氣體';
    return T < d.melt(P) ? '固體' : '液體';
  }
  function draw() {
    const d = SUB[st.s], c = curves(d), P = 10 ** st.lp, T = st.T, ph = phaseAt(d, T, P);
    const Ts = (a, b) => Array.from({ length: 80 }, (_, i) => a + (b - a) * i / 79);
    $('#phG', el).innerHTML = chart({ x: [150, 700], y: [-3, 3], xt: [173, 273, 373, 473, 573, 673], yt: [-3, -2, -1, 0, 1, 2, 3], xlab: '溫度（K）', ylab: 'log P（atm）', h: 270, label: `${d.n}的相圖` }, (X, Y) => {
      const cl = v => clamp(Math.log10(v), -3, 3);
      const sub = Ts(150, d.tp[0]).map(t => [X(t), Y(cl(c.sub(t)))]), lv = Ts(d.tp[0], d.cp[0]).map(t => [X(t), Y(cl(c.lv(t)))]);
      const melt = Array.from({ length: 40 }, (_, i) => { const lp = Math.log10(d.tp[1]) + (3 - Math.log10(d.tp[1])) * i / 39; return [X(d.melt(10 ** lp)), Y(lp)]; });
      return `<line class="mk" x1="${X(150)}" x2="${X(700)}" y1="${Y(0)}" y2="${Y(0)}"/><text class="tk" x="${X(690)}" y="${Y(0) - 5}" text-anchor="end">1 atm</text><path class="pb" d="${path(sub)}"/><path class="pb" d="${path(lv)}"/><path class="pb" d="${path(melt)}"/>
<circle class="dot2" cx="${X(d.tp[0])}" cy="${Y(Math.log10(d.tp[1]))}" r="5"/><text class="tk" x="${X(d.tp[0]) + 8}" y="${Y(Math.log10(d.tp[1])) + 14}">三相點</text><circle class="dot2" cx="${X(d.cp[0])}" cy="${Y(Math.log10(d.cp[1]))}" r="5"/><text class="tk" x="${X(d.cp[0]) + 6}" y="${Y(Math.log10(d.cp[1])) - 6}">臨界點</text>
<text class="tk hl" x="${X(st.s === 'water' ? 200 : 170)}" y="${Y(2.2)}">固</text><text class="tk hl" x="${X(st.s === 'water' ? 330 : 260)}" y="${Y(2.2)}">液</text><text class="tk hl" x="${X(450)}" y="${Y(-1.5)}">氣</text>
<circle class="dot" cx="${X(clamp(T, 150, 700))}" cy="${Y(st.lp)}" r="7"/>`;
    });
    $('#phN', el).innerHTML = `${d.n}在 ${fx(T - 273.15, 0)} °C、${P >= 0.1 ? fx(P, 2) : sci(P, 1)} atm：<b>${ph}</b>。${d.notes} 三相點：${fx(d.tp[0] - 273.15, 2)} °C、${d.tp[1]} atm；臨界點：${fx(d.cp[0] - 273.15, 1)} °C、${d.cp[1]} atm，超過臨界點後液體與氣體沒有界線（超臨界 CO₂ 用來萃取咖啡因）。`;
    $('#phT', el).value = T - 273.15; $('#phTo', el).textContent = fx(T - 273.15, 0); $('#phP', el).value = st.lp; $('#phPo', el).textContent = P >= 0.1 ? fx(P, 2) : sci(P, 1); pressSeg(el, 'phS', st.s);
  }
  bindSeg(el, 'phS', v => { st.s = v; draw(); });
  $('#phT', el).oninput = e => { st.T = +e.target.value + 273.15; draw(); };
  $('#phP', el).oninput = e => { st.lp = +e.target.value; draw(); };
  draw();
  return { set(s) { if (s.s) st.s = s.s; if (s.C != null) st.T = s.C + 273.15; if (s.P != null) st.lp = Math.log10(s.P); draw(); } };
};

/* ===== 2. 立方晶格 ===== */
W.cell = el => {
  const C = { sc: { n: '簡單立方', z: 1, cn: 6, pf: 52, rel: 'a = 2r', ex: '釙（Po）' }, bcc: { n: '體心立方', z: 2, cn: 8, pf: 68, rel: '體對角線 √3·a = 4r', ex: 'Na、K、Fe（室溫）' }, fcc: { n: '面心立方', z: 4, cn: 12, pf: 74, rel: '面對角線 √2·a = 4r', ex: 'Cu、Ag、Au、Al；NaCl 的 Cl⁻ 排列' } };
  let cur = 'fcc';
  el.innerHTML = `${seg('ceS', Object.entries(C).map(([k, v]) => [k, v.n]), cur)}<div class="bgrid"><div id="ceV"></div><div class="cards" id="ceK"></div></div><p class="note" id="ceN"></p>`;
  function draw() {
    const c = C[cur], o = [70, 150], s = 110, d = [45, -35], P = (x, y, z) => [o[0] + x * s + z * d[0], o[1] - y * s + z * d[1]];
    const corners = []; for (const x of [0, 1]) for (const y of [0, 1]) for (const z of [0, 1]) corners.push([x, y, z]);
    const edges = corners.flatMap(a => corners.filter(b => (a[0] !== b[0]) + (a[1] !== b[1]) + (a[2] !== b[2]) === 1 && a < b).map(b => [a, b]));
    const pts = [...corners.map(p => [p, '1/8'])];
    if (cur === 'bcc') pts.push([[0.5, 0.5, 0.5], '1']);
    if (cur === 'fcc') [[0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, 0, 0.5], [0.5, 1, 0.5], [0, 0.5, 0.5], [1, 0.5, 0.5]].forEach(p => pts.push([p, '1/2']));
    pts.sort((a, b) => a[0][2] - b[0][2]);
    $('#ceV', el).innerHTML = `<svg viewBox="0 0 240 210" class="bk" role="img" aria-label="${c.n}">${edges.map(([a, b]) => { const p = P(...a), q = P(...b); return `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="var(--muted)"/>`; }).join('')}${pts.map(([p, f]) => { const [x, y] = P(...p); return `<circle cx="${x}" cy="${y}" r="${f === '1' ? 15 : 11}" class="${f === '1/8' ? 'atc' : f === '1' ? 'atb' : 'atf'}"/>`; }).join('')}</svg><p class="small mut c">角落（藍）算 1/8、面心（橘）算 1/2、體心（紅）算 1</p>`;
    $('#ceK', el).innerHTML = card('z', '每個晶胞的原子數', c.z) + card('n', '配位數', c.cn) + card('p', '堆積效率', `${c.pf}%`) + card('r', '邊長與半徑', c.rel);
    $('#ceN', el).innerHTML = `<b>${c.n}</b>：${cur === 'sc' ? '8 個角 × 1/8 = 1' : cur === 'bcc' ? '8 × 1/8 + 1（體心）= 2' : '8 × 1/8 + 6 × 1/2（面心）= 4'} 個原子。例子：${c.ex}。晶體密度 = (每晶胞原子數 × 莫耳質量) ÷ (亞佛加厥數 × a³)，是常見計算題。`;
    pressSeg(el, 'ceS', cur);
  }
  bindSeg(el, 'ceS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 3. 放射性衰變與半衰期 ===== */
W.decay = el => {
  const I = { f18: ['¹⁸F（PET 造影）', 109.8, '分鐘'], tc: ['⁹⁹ᵐTc（核醫造影）', 6.01, '小時'], i131: ['¹³¹I（甲狀腺治療）', 8.02, '天'], c14: ['¹⁴C（定年）', 5730, '年'] };
  const st = { i: 'c14', n: 1 };
  el.innerHTML = `${seg('dyS', Object.entries(I).map(([k, v]) => [k, v[0]]), st.i)}<div class="w-row"><label class="rng">經過幾個半衰期 <input type="range" id="dyN" min="0" max="8" step="0.05"><output class="mono" id="dyO"></output></label></div><div id="dyG"></div><div class="cards" id="dyK"></div><p class="note" id="dyN2"></p>`;
  function draw() {
    const [nm, h, u] = I[st.i], f = 0.5 ** st.n, xs = Array.from({ length: 161 }, (_, i) => i / 20);
    $('#dyG', el).innerHTML = chart({ x: [0, 8], y: [0, 1], xt: [0, 1, 2, 3, 4, 5, 6, 7, 8], yt: [0, 0.25, 0.5, 1], xlab: '半衰期數', ylab: '剩下的比例', h: 200 }, (X, Y) => `<path class="tline" d="${path(xs.map(x => [X(x), Y(0.5 ** x)]))}"/>${[1, 2, 3].map(k => `<line class="mk" x1="${X(k)}" x2="${X(k)}" y1="${Y(0)}" y2="${Y(0.5 ** k)}"/>`).join('')}<circle class="dot" cx="${X(st.n)}" cy="${Y(f)}" r="7"/>`);
    $('#dyK', el).innerHTML = card('t', '經過時間', `${fx(st.n * h, h > 100 ? 0 : 1)} ${u}`) + card('f', '剩下', `${fx(100 * f, 2)}%`) + card('k', '衰變常數 k = 0.693 ÷ t½', `${sci(Math.LN2 / h, 3)} /${u}`);
    $('#dyN2', el).innerHTML = `放射性衰變是<b>一級反應</b>：每經過一個半衰期剩下一半，和初始量無關。t = (t½ ÷ 0.693) × ln(N₀/N)。${st.i === 'c14' ? '¹⁴C 定年：活的生物體內 ¹⁴C/¹²C 比例和大氣相同，死亡後 ¹⁴C 開始衰變；測出剩下的比例就能推算年代。' : '醫用同位素要選半衰期適中的：太長會讓病人長時間受輻射，太短則來不及送到醫院使用。'}`;
    $('#dyN', el).value = st.n; $('#dyO', el).textContent = fx(st.n, 2); pressSeg(el, 'dyS', st.i);
  }
  bindSeg(el, 'dyS', v => { st.i = v; draw(); });
  $('#dyN', el).oninput = e => { st.n = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 4. 蒸氣壓與克勞修斯–克拉佩龍 =====
   ΔH蒸發 kJ/mol、正常沸點 K（教科書常用值） */
const VAPL = { water: ['水', 40.7, 373.15], ethanol: ['乙醇', 38.6, 351.4], ipa: ['異丙醇', 44.0, 355.5], ether: ['乙醚', 26.5, 307.6] };
W.ccvap = el => {
  const st = { l: 'water', P: 0.70 };
  el.innerHTML = `${seg('cvS', Object.entries(VAPL).map(([k, v]) => [k, v[0]]), st.l)}<div class="w-row"><label class="rng">外界壓力（atm）<input type="range" id="cvP" min="0.1" max="2" step="0.01"><output class="mono" id="cvO"></output></label></div><div id="cvG"></div><p class="eq" id="cvF"></p><p class="note" id="cvN"></p>`;
  function draw() {
    const [nm, H, Tb] = VAPL[st.l], lnP = T => -H * 1000 / 8.314 * (1 / T - 1 / Tb), T = 1 / (1 / Tb - Math.log(st.P) * 8.314 / (H * 1000)), xs = Array.from({ length: 41 }, (_, i) => 2.5 + i * 0.025);
    $('#cvG', el).innerHTML = chart({ w: 560, h: 240, x: [2.5, 3.5], y: [-3, 1], xt: [2.6, 2.8, 3.0, 3.2, 3.4], yt: [-3, -2, -1, 0, 1], xlab: '1000 / T（K⁻¹）', ylab: 'ln P（atm）', label: '克勞修斯–克拉佩龍' }, (X, Y) =>
      Object.entries(VAPL).map(([k, v]) => `<path class="tline${k === st.l ? '' : ' faint'}" d="${path(xs.map(x => [X(x), Y(clamp(-v[1] * 1000 / 8.314 * (1 / (1000 / x) - 1 / v[2]), -3, 1))]))}"/>`).join('')
      + `<line class="mk" x1="${X(2.5)}" x2="${X(3.5)}" y1="${Y(Math.log(st.P))}" y2="${Y(Math.log(st.P))}"/><circle class="dot" cx="${X(1000 / T)}" cy="${Y(Math.log(st.P))}" r="7"/>`);
    $('#cvF', el).innerHTML = `ln(P₂/P₁) = −(ΔH蒸發/R)(1/T₂ − 1/T₁)　斜率 = −ΔH/R = ${fx(-H * 1000 / 8.314, 0)} K；${fx(st.P, 2)} atm 下的沸點 = <b>${fx(T - 273.15, 1)} °C</b>`;
    $('#cvN', el).innerHTML = `ln P 對 1/T 是直線，斜率由蒸發熱決定（分子間作用力越強，ΔH 越大、直線越陡）。沸點是蒸氣壓等於外界壓力的溫度：把壓力調低（高山上），水平線往下移，沸點降低。已知兩個溫度的蒸氣壓，就能用上式求出 ΔH蒸發 或其他溫度的蒸氣壓。蒸發時 ΔS = ΔH蒸發 ÷ T沸點（${nm}：${fx(H * 1000 / Tb, 0)} J/(mol·K)）。`;
    $('#cvP', el).value = st.P; $('#cvO', el).textContent = fx(st.P, 2); pressSeg(el, 'cvS', st.l);
  }
  bindSeg(el, 'cvS', v => { st.l = v; draw(); });
  $('#cvP', el).oninput = e => { st.P = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 5. 加熱曲線：冰 → 水蒸氣 ===== */
W.heatcurve = el => {
  const st = { m: 18 };
  el.innerHTML = `<div class="w-row"><label class="rng">水的質量（g）<input type="range" id="hcM" min="5" max="100" step="1"><output class="mono" id="hcO"></output></label></div><div id="hcG"></div><ol class="cs" id="hcC"></ol><p class="note">溫度不變的兩段是相變化：吸收的熱用來克服分子間作用力，而不是使分子跑更快。汽化熱遠大於熔化熱，因為液體變成氣體要把分子完全拉開。</p>`;
  function draw() {
    const n = st.m / 18.02, seg2 = [['冰 −20 → 0 °C', st.m * 2.09 * 20, -20, 0], ['熔化（0 °C）', n * 6.01e3, 0, 0], ['水 0 → 100 °C', st.m * 4.184 * 100, 0, 100], ['汽化（100 °C）', n * 40.7e3, 100, 100], ['水蒸氣 100 → 120 °C', st.m * 2.01 * 20, 100, 120]];
    const tot = seg2.reduce((a, s) => a + s[1], 0); let q = 0; const pts = [[0, -20]]; seg2.forEach(s => { q += s[1]; pts.push([q / 1000, s[3]]); });
    $('#hcG', el).innerHTML = chart({ w: 560, h: 230, x: [0, tot / 1000], y: [-30, 130], xt: [0, +(tot / 2000).toFixed(1), +(tot / 1000).toFixed(1)], yt: [-20, 0, 50, 100], xlab: '加入的熱（kJ）', ylab: '溫度（°C）', label: '加熱曲線' }, (X, Y) => `<path class="tline" d="${path(pts.map(([x, y]) => [X(x), Y(y)]))}"/>`);
    $('#hcC', el).innerHTML = seg2.map(([t, v]) => `<li>${t}：${fx(v / 1000, 2)} kJ</li>`).join('') + `<li>合計 ${fx(tot / 1000, 2)} kJ（升溫用 q = mcΔT；相變化用 q = n·ΔH）</li>`;
    $('#hcM', el).value = st.m; $('#hcO', el).textContent = st.m;
  }
  $('#hcM', el).oninput = e => { st.m = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 6. 晶胞的密度：d = Z·M ÷ (Nₐ·a³) ===== */
W.celldens = el => {
  const LAT = { sc: ['簡單立方', 1, a => a / 2, '2r = a'], bcc: ['體心立方', 2, a => Math.sqrt(3) * a / 4, '4r = √3·a'], fcc: ['面心立方', 4, a => Math.sqrt(2) * a / 4, '4r = √2·a'] };
  const st = { l: 'bcc', a: 300, M: 95.95 };
  el.innerHTML = `${seg('cdS2', Object.entries(LAT).map(([k, v]) => [k, v[0]]), st.l)}<div class="w-row"><label class="rng">邊長 a（pm）<input type="range" id="cdA" min="200" max="600" step="1"><output class="mono" id="cdAo"></output></label><label class="rng">莫耳質量（g/mol）<input type="range" id="cdM" min="20" max="200" step="0.05"><output class="mono" id="cdMo"></output></label></div><div class="cards" id="cdK"></div><p class="eq" id="cdF"></p>`;
  function draw() {
    const [nm, Z, rf, rel] = LAT[st.l], a = st.a * 1e-10, d = Z * st.M / (6.022e23 * a ** 3);
    $('#cdK', el).innerHTML = card('z', '每個晶胞原子數 Z', Z) + card('r', `原子半徑（${rel}）`, `${fx(rf(st.a), 1)} pm`) + card('d', '密度', `${fx(d, 2)} g/cm³`);
    $('#cdF', el).innerHTML = `d = Z·M ÷ (Nₐ·a³) = ${Z} × ${st.M} ÷ (6.022 × 10²³ × (${st.a} × 10⁻¹⁰ cm)³) = <b>${fx(d, 2)} g/cm³</b>`;
    $('#cdA', el).value = st.a; $('#cdAo', el).textContent = st.a; $('#cdM', el).value = st.M; $('#cdMo', el).textContent = st.M; pressSeg(el, 'cdS2', st.l);
  }
  bindSeg(el, 'cdS2', v => { st.l = v; draw(); });
  $('#cdA', el).oninput = e => { st.a = +e.target.value; draw(); };
  $('#cdM', el).oninput = e => { st.M = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 7. 原子核穩定帶：中子與質子比決定衰變方式 ===== */
const NUCS = [['¹⁴C', 6, 8, 'β⁻', '¹⁴N'], ['³H', 1, 2, 'β⁻', '³He'], ['⁹⁰Sr', 38, 52, 'β⁻', '⁹⁰Y'], ['¹³¹I', 53, 78, 'β⁻', '¹³¹Xe'], ['¹⁸F', 9, 9, 'β⁺', '¹⁸O'], ['¹¹C', 6, 5, 'β⁺', '¹¹B'], ['²²²Rn', 86, 136, 'α', '²¹⁸Po'], ['²³⁸U', 92, 146, 'α', '²³⁴Th'], ['⁶⁰Co', 27, 33, 'β⁻', '⁶⁰Ni']];
W.nucstab = el => {
  let cur = 6;
  el.innerHTML = `<div class="w-row">${NUCS.map(([t], i) => `<button class="btn sm ghost" type="button" data-i="${i}">${t}</button>`).join('')}</div><div id="nsG"></div><p class="eq" id="nsF"></p><p class="note" id="nsN"></p>`;
  function draw() {
    const [t, Z, N, mode, prod] = NUCS[cur];
    $('#nsG', el).innerHTML = chart({ w: 560, h: 260, x: [0, 100], y: [0, 150], xt: [0, 20, 40, 60, 80, 100], yt: [0, 50, 100, 150], xlab: '質子數 Z', ylab: '中子數 N', label: '原子核穩定帶' }, (X, Y) =>
      `<line class="mk" x1="${X(0)}" y1="${Y(0)}" x2="${X(100)}" y2="${Y(100)}"/><path class="band" d="M${X(0)} ${Y(0)}L${X(20)} ${Y(22)}L${X(50)} ${Y(70)}L${X(83)} ${Y(126)}L${X(83)} ${Y(132)}L${X(50)} ${Y(78)}L${X(20)} ${Y(26)}L${X(0)} ${Y(2)}Z"/><text class="tk" x="${X(60)}" y="${Y(50)}">N = Z</text>`
      + NUCS.map(([tt, z, n], i) => `<circle class="${i === cur ? 'dot' : 'pt'}" cx="${X(z)}" cy="${Y(n)}" r="${i === cur ? 7 : 4}"/>`).join('') + `<text class="tk hl" x="${X(Z) + 10}" y="${Y(N) + 4}">${t}</text>`);
    const eq = { 'β⁻': `${t} → ${prod} + ⁰₋₁e`, 'β⁺': `${t} → ${prod} + ⁰₊₁e`, 'α': `${t} → ${prod} + ⁴₂He` }[mode];
    $('#nsF', el).innerHTML = `${eq}　（質量數與原子序兩邊守恆）`;
    $('#nsN', el).innerHTML = `${t}：Z = ${Z}、N = ${N}，N/Z = ${fx(N / Z, 2)}。${mode === 'β⁻' ? '中子太多（在穩定帶上方）：一個中子變成質子並放出電子（β⁻），Z + 1。' : mode === 'β⁺' ? '質子太多（在穩定帶下方）：一個質子變成中子並放出正子（β⁺）或捕獲電子，Z − 1。PET 造影用的 ¹⁸F 就是 β⁺ 衰變。' : 'Z > 83 的重原子核都不穩定，常以 α 衰變減少質量數 4、原子序 2。'} 灰色帶是穩定原子核的位置：輕原子核 N ≈ Z，越重需要越多中子。`;
    $$('[data-i]', el).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === cur)));
  }
  $$('[data-i]', el).forEach(b => { b.onclick = () => { cur = +b.dataset.i; draw(); }; });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 8. 質量虧損與核能 ===== */
W.massdefect = el => {
  const RX = { dt: ['核融合 ²H + ³H → ⁴He + n', [['²H', 2.01410], ['³H', 3.01605]], [['⁴He', 4.00260], ['n', 1.00866]]], he: ['⁴He 的結合能（2p + 2n → ⁴He）', [['2 × p', 2 * 1.00728], ['2 × n', 2 * 1.00866]], [['⁴He 原子核', 4.00150]]] };
  let cur = 'dt';
  el.innerHTML = `${seg('mdS', Object.entries(RX).map(([k, v]) => [k, v[0]]), cur)}<div class="bars pk" id="mdB"></div><p class="eq" id="mdF"></p><p class="note">反應後的總質量比反應前小，少掉的質量 Δm 依 E = Δm·c² 變成能量。1 u 相當於 931.5 MeV；每莫耳反應的能量 = Δm（g/mol 換成 kg/mol）× (3.00 × 10⁸ m/s)²。核反應的能量比化學反應大約一百萬倍，太陽的能量來自氫的核融合。</p>`;
  function draw() {
    const [, L, R] = RX[cur], mL = L.reduce((a, x) => a + x[1], 0), mR = R.reduce((a, x) => a + x[1], 0), dm = mL - mR;
    $('#mdB', el).innerHTML = `<div><span>反應前 ${L.map(x => x[0]).join(' + ')}</span><i class="ba" style="width:100%"></i><b class="mono">${fx(mL, 5)} u</b></div><div class="on"><span>反應後 ${R.map(x => x[0]).join(' + ')}</span><i class="ba" style="width:${mR / mL * 100}%"></i><b class="mono">${fx(mR, 5)} u</b></div>`;
    $('#mdF', el).innerHTML = `Δm = ${fx(dm, 5)} u → E = ${fx(dm * 931.5, 1)} MeV；每莫耳 ${sci(dm / 1000 * 9e16, 2)} J = ${sci(dm / 1000 * 9e16 / 1000, 2)} kJ`;
    pressSeg(el, 'mdS', cur);
  }
  bindSeg(el, 'mdS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};
