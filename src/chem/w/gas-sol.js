/* ---------- 後中化學：氣體、計量與溶液的互動圖 ---------- */
const RL = 0.08206;   // L·atm/(mol·K)

/* ===== 1. 理想氣體：固定兩個量，看另外兩個 ===== */
W.pvt = el => {
  const st = { law: 'boyle', n: 1, T: 300, V: 24.6, P: 1 };
  const LAW = { boyle: ['波以耳（固定 n、T）', 'V', 'P'], charles: ['查理（固定 n、P）', 'T', 'V'], gay: ['給呂薩克（固定 n、V）', 'T', 'P'], avog: ['亞佛加厥（固定 T、P）', 'n', 'V'] };
  el.innerHTML = `${seg('pvS', Object.entries(LAW).map(([k, v]) => [k, v[0]]), st.law)}<div class="w-row"><label class="rng" id="pvL"></label></div><div class="bgrid"><div id="pvB"></div><div id="pvC"></div></div><div class="cards" id="pvK"></div><p class="note" id="pvN"></p>`;
  const RNG = { V: [5, 50, 0.5, 'V（L）'], T: [100, 600, 5, 'T（K）'], n: [0.2, 3, 0.1, 'n（mol）'] };
  function solve() { const L = st.law; if (L === 'boyle') st.P = st.n * RL * st.T / st.V; if (L === 'charles' || L === 'avog') st.V = st.n * RL * st.T / st.P; if (L === 'gay') st.P = st.n * RL * st.T / st.V; }
  function draw() {
    const [nm, xk, yk] = LAW[st.law], r = RNG[xk]; solve();
    $('#pvL', el).innerHTML = `${r[3]} <input type="range" id="pvX" min="${r[0]}" max="${r[1]}" step="${r[2]}" value="${st[xk]}"><output class="mono">${fx(st[xk], xk === 'n' ? 1 : 0)}</output>`;
    $('#pvX', el).oninput = e => { st[xk] = +e.target.value; draw(); };
    // 活塞：高度 ∝ V，粒子數 ∝ n，粒子顏色亮度 ∝ T
    const h = clamp(st.V / 50, 0.12, 1) * 150, N = Math.round(st.n * 14), heat = clamp((st.T - 100) / 500, 0, 1);
    const dots = Array.from({ length: N }, (_, i) => `<circle cx="${40 + (i * 47 % 140)}" cy="${170 - ((i * 29) % Math.max(10, h - 10)) - 6}" r="4.5" fill="rgb(${Math.round(60 + 190 * heat)},${Math.round(90 - 40 * heat)},${Math.round(200 - 150 * heat)})"/>`).join('');
    $('#pvB', el).innerHTML = `<svg viewBox="0 0 220 200" class="bk" role="img" aria-label="活塞中的氣體"><path d="M30 20L30 180L190 180L190 20" class="glass"/><rect x="31" y="${178 - h - 8}" width="158" height="8" fill="var(--muted)"/><line x1="110" x2="110" y1="${178 - h - 8}" y2="10" stroke="var(--muted)" stroke-width="5"/>${dots}<text class="tk" x="110" y="196" text-anchor="middle">P = ${fx(st.P, 2)} atm</text></svg>`;
    const xs = Array.from({ length: 61 }, (_, i) => r[0] + i * (r[1] - r[0]) / 60);
    const yv = x => { const s = { ...st, [xk]: x }; return yk === 'P' ? s.n * RL * s.T / s.V : s.n * RL * s.T / s.P; };
    const ymax = Math.max(...xs.map(yv)) * 1.05;
    $('#pvC', el).innerHTML = chart({ x: [r[0], r[1]], y: [0, ymax], xt: [r[0], r[1]], yt: [0, +(ymax / 2).toFixed(1), +ymax.toFixed(1)], xlab: r[3], ylab: yk === 'P' ? 'P（atm）' : 'V（L）', h: 220 }, (X, Y) => `<path class="tline" d="${path(xs.map(x => [X(x), Y(yv(x))]))}"/><circle class="dot" cx="${X(st[xk])}" cy="${Y(yv(st[xk]))}" r="7"/>`);
    $('#pvK', el).innerHTML = card('p', 'P', `${fx(st.P, 2)} atm`) + card('v', 'V', `${fx(st.V, 1)} L`) + card('n', 'n', `${fx(st.n, 1)} mol`) + card('t', 'T', `${fx(st.T, 0)} K`);
    $('#pvN', el).innerHTML = { boyle: '<b>P ∝ 1/V</b>：體積變小，同樣的分子撞牆更頻繁，壓力變大（曲線是雙曲線）。', charles: '<b>V ∝ T</b>：溫度升高，分子跑得更快，要維持同樣壓力，體積必須變大。延長直線會通過 0 K，這就是絕對溫標的由來。', gay: '<b>P ∝ T</b>：體積固定時加熱，撞擊更用力、更頻繁，壓力上升（密閉容器加熱很危險）。', avog: '<b>V ∝ n</b>：同溫同壓下，同體積的任何氣體含有相同的分子數。0 °C、1 atm 時 1 mol 理想氣體佔 22.4 L。' }[st.law] + ' 全部合起來就是 <b>PV = nRT</b>（R = 0.08206 L·atm/(mol·K) = 8.314 J/(mol·K)）。溫度一定要用 <b>K</b>。';
    pressSeg(el, 'pvS', st.law);
  }
  bindSeg(el, 'pvS', v => { st.law = v; st.n = 1; st.T = 300; st.V = 24.6; st.P = 1; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. 分子速率分布與格雷姆定律 ===== */
W.maxwell = el => {
  const G = { He: 4.0, N2: 28.0, O2: 32.0, CO2: 44.0, UF6: 352 }, LAB = { He: 'He', N2: 'N₂', O2: 'O₂', CO2: 'CO₂', UF6: 'UF₆' };
  const st = { a: 'He', b: 'N2', T: 300 };
  el.innerHTML = `<div class="w-row"><label class="sel">氣體 A <select id="mxA">${Object.keys(G).map(k => `<option value="${k}">${LAB[k]}（${G[k]}）</option>`).join('')}</select></label><label class="sel">氣體 B <select id="mxB">${Object.keys(G).map(k => `<option value="${k}">${LAB[k]}（${G[k]}）</option>`).join('')}</select></label><label class="rng">溫度（K）<input type="range" id="mxT" min="100" max="1000" step="10"><output class="mono" id="mxTo"></output></label></div><div id="mxC"></div><div class="cards" id="mxK"></div><p class="note" id="mxN"></p>`;
  const f = (v, M, T) => { const m = M / 1000, a = m / (2 * 8.314 * T); return 4 * Math.PI * (a / Math.PI) ** 1.5 * v * v * Math.exp(-a * v * v); };
  function draw() {
    const vs = Array.from({ length: 151 }, (_, i) => i * 3000 / 150), ua = Math.sqrt(3 * 8.314 * st.T / (G[st.a] / 1000)), ub = Math.sqrt(3 * 8.314 * st.T / (G[st.b] / 1000));
    const ymax = Math.max(...vs.map(v => Math.max(f(v, G[st.a], st.T), f(v, G[st.b], st.T)))) * 1.1;
    $('#mxC', el).innerHTML = chart({ x: [0, 3000], y: [0, ymax], xt: [0, 500, 1000, 1500, 2000, 2500, 3000], yt: [], xlab: '分子速率（m/s）', ylab: '分子比例', h: 220, label: '速率分布' }, (X, Y) => `<path class="sha" d="${path(vs.map(v => [X(v), Y(f(v, G[st.a], st.T))]))}"/><path class="sa" d="${path(vs.map(v => [X(v), Y(f(v, G[st.b], st.T))]))}"/><text class="tk lha" x="${X(Math.min(2900, ua))}" y="${Y(ymax * 0.95)}">${LAB[st.a]}</text><text class="tk la" x="${X(Math.min(2900, ub))}" y="${Y(ymax * 0.85)}">${LAB[st.b]}</text>`);
    $('#mxK', el).innerHTML = card('a', `${LAB[st.a]} 的 u<sub>rms</sub>`, `${fx(ua, 0)} m/s`) + card('b', `${LAB[st.b]} 的 u<sub>rms</sub>`, `${fx(ub, 0)} m/s`) + card('r', '擴散速率比 A : B', `${fx(Math.sqrt(G[st.b] / G[st.a]), 2)} : 1`);
    $('#mxN', el).innerHTML = `同一溫度下，所有氣體的<b>平均動能相同</b>（½mu² = 3/2 kT），所以輕的分子跑得快：u<sub>rms</sub> = √(3RT/M)（M 用 kg/mol）。<b>格雷姆定律</b>：逸散或擴散速率 ∝ 1/√M，${LAB[st.a]} 比 ${LAB[st.b]} 快 √(${G[st.b]} ÷ ${G[st.a]}) = ${fx(Math.sqrt(G[st.b] / G[st.a]), 2)} 倍。曼哈頓計畫就是利用 ²³⁵UF₆ 和 ²³⁸UF₆ 微小的速率差來濃縮鈾。`;
    $('#mxA', el).value = st.a; $('#mxB', el).value = st.b; $('#mxT', el).value = st.T; $('#mxTo', el).textContent = st.T;
  }
  $('#mxA', el).onchange = e => { st.a = e.target.value; draw(); };
  $('#mxB', el).onchange = e => { st.b = e.target.value; draw(); };
  $('#mxT', el).oninput = e => { st.T = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. 限量試劑 ===== */
W.limiting = el => {
  const RX = { nh3: { n: 'N₂ + 3H₂ → 2NH₃', A: 'N₂', B: 'H₂', P: 'NH₃', ca: 1, cb: 3, cp: 2 }, h2o: { n: '2H₂ + O₂ → 2H₂O', A: 'H₂', B: 'O₂', P: 'H₂O', ca: 2, cb: 1, cp: 2 } };
  const st = { rx: 'nh3', a: 3, b: 6 };
  el.innerHTML = `${seg('lmS', Object.entries(RX).map(([k, v]) => [k, v.n]), st.rx)}<div class="w-row"><label class="rng" id="lmA"></label><label class="rng" id="lmB"></label></div><div id="lmV"></div><p class="note" id="lmN"></p>`;
  function draw() {
    const r = RX[st.rx], ext = Math.min(st.a / r.ca, st.b / r.cb), lim = st.a / r.ca < st.b / r.cb ? r.A : st.a / r.ca > st.b / r.cb ? r.B : '剛好';
    const la = st.a - r.ca * ext, lb = st.b - r.cb * ext, p = r.cp * ext;
    $('#lmA', el).innerHTML = `${r.A}（mol） <input type="range" id="lmAi" min="0" max="10" step="1" value="${st.a}"><output class="mono">${st.a}</output>`;
    $('#lmB', el).innerHTML = `${r.B}（mol） <input type="range" id="lmBi" min="0" max="12" step="1" value="${st.b}"><output class="mono">${st.b}</output>`;
    $('#lmAi', el).oninput = e => { st.a = +e.target.value; draw(); }; $('#lmBi', el).oninput = e => { st.b = +e.target.value; draw(); };
    const row = (lab, n, cls, tot) => `<div class="lmrow"><span>${lab}</span><span>${Array.from({ length: Math.round(tot) }, (_, i) => `<i class="${i < n - 1e-9 ? cls : 'used'}"></i>`).join('')}</span><b class="mono">${fx(n, 1)}</b></div>`;
    $('#lmV', el).innerHTML = `<p class="lbl">反應前 → 反應後（每個方塊 1 mol）</p>${row(r.A + ' 剩下', la, 'qa', st.a)}${row(r.B + ' 剩下', lb, 'qb', st.b)}${row(r.P + ' 生成', p, 'qp', Math.max(1, p))}`;
    $('#lmN', el).innerHTML = st.a === 0 || st.b === 0 ? '缺少一種反應物，不會反應。' : `用係數換算：${r.A} 夠反應 ${fx(st.a / r.ca, 2)} 次「一份反應」，${r.B} 夠 ${fx(st.b / r.cb, 2)} 次。<b>次數較少的就是限量試劑</b>：${lim === '剛好' ? '兩者剛好用完' : `<b>${lim}</b>，它用完反應就停止`}。生成 ${r.P} = ${r.cp} × ${fx(ext, 2)} = ${fx(p, 2)} mol。注意：不是直接比莫耳數多寡，而是要除以係數。`;
    pressSeg(el, 'lmS', st.rx);
  }
  bindSeg(el, 'lmS', v => { st.rx = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 4. 依數性質 ===== */
W.colli = el => {
  const SOL = { glu: ['葡萄糖', 1], nacl: ['NaCl', 2], cacl2: ['CaCl₂', 3] };
  const st = { s: 'nacl', m: 0.5 };
  el.innerHTML = `${seg('coS', Object.entries(SOL).map(([k, v]) => [k, `${v[0]}（i = ${v[1]}）`]), st.s)}<div class="w-row"><label class="rng">濃度（mol/kg 或 M）<input type="range" id="coM" min="0" max="2" step="0.01"><output class="mono" id="coMo"></output></label></div><div class="bgrid"><div id="coT"></div><div class="cards" id="coK"></div></div><p class="note" id="coN"></p>`;
  function draw() {
    const [nm, i] = SOL[st.s], dTb = i * 0.512 * st.m, dTf = i * 1.86 * st.m, pi = i * st.m * RL * 310;
    $('#coT', el).innerHTML = chart({ x: [0, 1], y: [-12, 106], xt: [], yt: [-10, 0, 100], ylab: '溫度（°C）', h: 230, w: 260 }, (X, Y) => `<rect x="${X(0.15)}" y="${Y(100 + dTb)}" width="${X(0.85) - X(0.15)}" height="${Y(-dTf) - Y(100 + dTb)}" fill="var(--acid)" opacity=".1"/><line class="mk" x1="${X(0)}" x2="${X(1)}" y1="${Y(100)}" y2="${Y(100)}"/><line class="mk" x1="${X(0)}" x2="${X(1)}" y1="${Y(0)}" y2="${Y(0)}"/><line class="cur" x1="${X(0.15)}" x2="${X(0.85)}" y1="${Y(100 + dTb)}" y2="${Y(100 + dTb)}"/><line class="cur" x1="${X(0.15)}" x2="${X(0.85)}" y1="${Y(-dTf)}" y2="${Y(-dTf)}"/><text class="tk" x="${X(0.5)}" y="${Y(100 + dTb) - 6}" text-anchor="middle">沸點 ${fx(100 + dTb, 2)} °C</text><text class="tk" x="${X(0.5)}" y="${Y(-dTf) + 14}" text-anchor="middle">凝固點 ${fx(-dTf, 2)} °C</text><text class="tk" x="${X(0.5)}" y="${Y(50)}" text-anchor="middle">液態範圍變寬</text>`);
    $('#coK', el).innerHTML = card('b', 'ΔTb = i·Kb·m', `+${fx(dTb, 2)} °C`) + card('f', 'ΔTf = i·Kf·m', `−${fx(dTf, 2)} °C`) + card('p', '滲透壓 π = iMRT（37 °C）', `${fx(pi, 1)} atm`);
    $('#coN', el).innerHTML = `<b>依數性質</b>只和溶質<b>粒子的數目</b>有關，和是什麼粒子無關。${nm}在水中${i === 1 ? '不解離，i = 1' : `解離成 ${i} 個離子，i = ${i}（理想值；實際因離子配對略小）`}。水的 Kb = 0.512、Kf = 1.86 °C·kg/mol。${st.s === 'nacl' && Math.abs(st.m - 0.15) < 0.02 ? '這接近生理食鹽水（0.9% NaCl ≈ 0.154 M）：滲透壓約 7.8 atm，和血液等張。' : '生理食鹽水 0.9% NaCl ≈ 0.154 M，和紅血球等張；放進純水會吸水脹破（溶血），放進濃鹽水會失水皺縮。'}`;
    $('#coMo', el).textContent = fx(st.m, 2); $('#coM', el).value = st.m; pressSeg(el, 'coS', st.s);
  }
  bindSeg(el, 'coS', v => { st.s = v; draw(); });
  $('#coM', el).oninput = e => { st.m = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 5. 道耳頓分壓定律與排水集氣 ===== */
W.dalton = el => {
  const st = { a: 0.3, b: 0.1, w: 0 };
  el.innerHTML = `<div class="w-row"><label class="rng">O₂（mol）<input type="range" id="dlA" min="0" max="0.5" step="0.01"><output class="mono" id="dlAo"></output></label><label class="rng">N₂（mol）<input type="range" id="dlB" min="0" max="0.5" step="0.01"><output class="mono" id="dlBo"></output></label></div>${seg('dlW', [['0', '乾燥容器'], ['1', '排水集氣（含 25 °C 水蒸氣）']], '0')}<p class="small mut">容器 10.0 L、25 °C</p><div id="dlG"></div><div class="cards" id="dlK"></div><p class="note" id="dlN"></p>`;
  function draw() {
    const k = RL * 298.15 / 10, pa = st.a * k, pb = st.b * k, pw = st.w ? 23.8 / 760 : 0, P = pa + pb + pw, W0 = 520, sc = W0 / Math.max(P, 1.5);
    const seg2 = [[pa, '#2F3B99', 'O₂'], [pb, '#9AA3A0', 'N₂'], [pw, '#3D9BD6', 'H₂O']]; let x = 20;
    $('#dlG', el).innerHTML = `<svg class="ch" viewBox="0 0 560 70" role="img" aria-label="分壓">${seg2.map(([p, c, t]) => { const w = p * sc, r = p > 0 ? `<rect x="${x}" y="14" width="${w}" height="32" fill="${c}"/>${w > 44 ? `<text class="wl" x="${x + w / 2}" y="35" text-anchor="middle">${t}</text>` : ''}` : ''; x += w; return r; }).join('')}<text class="tk" x="20" y="64">0</text><text class="tk" x="${Math.min(540, 20 + P * sc)}" y="64" text-anchor="middle">${fx(P, 3)} atm</text></svg>`;
    $('#dlK', el).innerHTML = card('a', 'P(O₂) = n·RT/V', `${fx(pa, 3)} atm`) + card('b', 'P(N₂)', `${fx(pb, 3)} atm`) + (st.w ? card('w', 'P(H₂O)', `${fx(pw, 3)} atm`, '23.8 torr') : '') + card('t', '總壓', `${fx(P, 3)} atm`) + card('x', 'O₂ 的莫耳分率', P ? fx(pa / P, 3) : '—', 'P(O₂) ÷ P總');
    $('#dlN', el).innerHTML = `每種氣體的分壓就像它單獨佔滿容器時的壓力，長條的總長度就是總壓：P總 = ΣPᵢ，Pᵢ = Xᵢ × P總。${st.w ? '用排水集氣法收集時，瓶中的氣體被水蒸氣飽和：要算收集到的氣體，必須先扣掉該溫度的水蒸氣壓。' : ''} 水蒸氣的分壓最多只能等於該溫度的飽和蒸氣壓，多出來的水會凝結成液體。`;
    $('#dlA', el).value = st.a; $('#dlB', el).value = st.b; $('#dlAo', el).textContent = fx(st.a, 2); $('#dlBo', el).textContent = fx(st.b, 2); pressSeg(el, 'dlW', String(st.w));
  }
  $('#dlA', el).oninput = e => { st.a = +e.target.value; draw(); };
  $('#dlB', el).oninput = e => { st.b = +e.target.value; draw(); };
  bindSeg(el, 'dlW', v => { st.w = +v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 6. 由 PV = (m/M)RT 求分子量 ===== */
const GASM = [['H₂', 2.02], ['He', 4.00], ['CH₄', 16.04], ['NH₃', 17.03], ['Ne', 20.18], ['C₂H₂', 26.04], ['CO、N₂、C₂H₄', 28.0], ['C₂H₆', 30.07], ['O₂', 32.00], ['Ar', 39.95], ['CO₂、C₃H₈', 44.0], ['C₄H₈', 56.1], ['SO₂', 64.07], ['Cl₂', 70.90], ['C₆H₆', 78.11], ['Kr', 83.80]];
W.molarmass = el => {
  const st = { m: 9.33, V: 3.16, T: 32, P: 1.0 };
  const PRE = [['9.33 g、3.16 L、32 °C、1 atm', [9.33, 3.16, 32, 1.0]], ['0.625 g、0.500 L、0 °C、1 atm', [0.625, 0.5, 0, 1.0]], ['1.26 g、0.660 L、127 °C、1.12 atm', [1.26, 0.66, 127, 1.12]]];
  el.innerHTML = `<div class="w-row">${PRE.map(([t], i) => `<button class="btn sm ghost" type="button" data-p="${i}">${t}</button>`).join('')}</div><div class="w-row"><label class="rng">質量 m（g）<input type="range" id="mmM" min="0.1" max="12" step="0.005"><output class="mono" id="mmMo"></output></label><label class="rng">體積 V（L）<input type="range" id="mmV" min="0.1" max="5" step="0.01"><output class="mono" id="mmVo"></output></label></div><div class="w-row"><label class="rng">溫度（°C）<input type="range" id="mmT" min="-50" max="200" step="1"><output class="mono" id="mmTo"></output></label><label class="rng">壓力（atm）<input type="range" id="mmP" min="0.1" max="3" step="0.01"><output class="mono" id="mmPo"></output></label></div><ol class="cs" id="mmC"></ol><div class="bars pk" id="mmB"></div>`;
  function draw() {
    const T = st.T + 273.15, n = st.P * st.V / (RL * T), M = st.m / n, d = st.m / st.V;
    $('#mmC', el).innerHTML = `<li>n = PV / RT = ${fx(st.P, 2)} × ${fx(st.V, 2)} ÷ (0.08206 × ${fx(T, 1)}) = ${fx(n, 4)} mol</li><li>M = m / n = ${st.m} ÷ ${fx(n, 4)} = <b>${fx(M, 1)} g/mol</b>　（也可寫成 M = dRT/P，密度 d = ${fx(d, 3)} g/L）</li>`;
    const near = [...GASM].sort((a, b) => Math.abs(a[1] - M) - Math.abs(b[1] - M)).slice(0, 4);
    $('#mmB', el).innerHTML = near.map(([g, mm], i) => `<div class="${i ? '' : 'on'}"><span>${g}</span><i class="ba" style="width:${Math.max(4, 100 - Math.abs(mm - M) / M * 300)}%"></i><b class="mono">${mm} g/mol</b></div>`).join('') + '<p class="small mut">最接近的候選氣體（長條越長越接近）</p>';
    [['M', st.m, 3], ['V', st.V, 2], ['T', st.T, 0], ['P', st.P, 2]].forEach(([k, v, dg]) => { $(`#mm${k}`, el).value = v; $(`#mm${k}o`, el).textContent = fx(v, dg); });
  }
  [['M', 'm'], ['V', 'V'], ['T', 'T'], ['P', 'P']].forEach(([id, k]) => { $(`#mm${id}`, el).oninput = e => { st[k] = +e.target.value; draw(); }; });
  $$('[data-p]', el).forEach(b => { b.onclick = () => { [st.m, st.V, st.T, st.P] = PRE[+b.dataset.p][1]; draw(); }; });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 7. 真實氣體：PV/nRT 偏離 1 =====
   凡得瓦常數 a（L²·atm/mol²）、b（L/mol），CRC Handbook */
const VDW = { He: [0.0346, 0.0238], H2: [0.2476, 0.02661], N2: [1.370, 0.0387], CH4: [2.283, 0.04278], CO2: [3.640, 0.04267] }, VLAB = { He: 'He', H2: 'H₂', N2: 'N₂', CH4: 'CH₄', CO2: 'CO₂' };
W.realgas = el => {
  const st = { g: 'CO2', T: 300 };
  el.innerHTML = `${seg('rgS', Object.keys(VDW).map(k => [k, VLAB[k]]), st.g)}<div class="w-row"><label class="rng">溫度（K）<input type="range" id="rgT" min="250" max="800" step="10"><output class="mono" id="rgTo"></output></label></div><div id="rgG"></div><p class="eq" id="rgF"></p><p class="note" id="rgN"></p>`;
  const Z = (g, P, T) => { const [a, b] = VDW[g]; let lo = b * 1.0001, hi = 2 * RL * T / P + 1; const f = V => RL * T / (V - b) - a / (V * V) - P;
    // 找最大根（氣相）：由大往小掃描
    let V = hi; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; V = m; } return P * V / (RL * T); };
  function draw() {
    const Ps = Array.from({ length: 81 }, (_, i) => 1 + i * 10);
    $('#rgG', el).innerHTML = chart({ w: 560, h: 250, x: [0, 800], y: [0, 2], xt: [0, 200, 400, 600, 800], yt: [0, 0.5, 1, 1.5, 2], xlab: '壓力 P（atm）', ylab: 'PV / nRT', label: '真實氣體' }, (X, Y) =>
      `<line class="mk" x1="${X(0)}" x2="${X(800)}" y1="${Y(1)}" y2="${Y(1)}"/>` + Object.keys(VDW).map(g => `<path class="tline${g === st.g ? '' : ' faint'}" d="${path(Ps.map(P => [X(P), Y(clamp(Z(g, P, st.T), 0, 2))]))}"/>`).join('') + `<text class="tk" x="${X(790)}" y="${Y(1) - 6}" text-anchor="end">理想氣體 = 1</text>`);
    const [a, b] = VDW[st.g];
    $('#rgF', el).innerHTML = `(P + a·n²/V²)(V − n·b) = nRT　　${VLAB[st.g]}：a = ${a}、b = ${b}`;
    $('#rgN', el).innerHTML = `曲線低於 1：分子互相吸引（a），撞牆的力道變小，實際壓力比理想值低；曲線高於 1：分子本身佔有體積（b），可活動的空間變小。a 越大（分子越大、越容易極化，如 CO₂）向下彎得越明顯；溫度升高時分子動能大、吸引力相對不重要，曲線更接近 1。所以氣體在<b>高溫、低壓</b>下最接近理想，He、H₂ 最接近理想氣體。`;
    $('#rgT', el).value = st.T; $('#rgTo', el).textContent = `${st.T} K`; pressSeg(el, 'rgS', st.g);
  }
  bindSeg(el, 'rgS', v => { st.g = v; draw(); });
  $('#rgT', el).oninput = e => { st.T = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};
