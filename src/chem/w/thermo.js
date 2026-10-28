/* ---------- 後中化學：熱力學的互動圖 ---------- */

/* ===== 1. 赫斯定律：焓是狀態函數 ===== */
W.hess = el => {
  const EX = {
    co: { n: '碳燃燒：直接 vs 經過 CO', lv: [['C(s) + O₂(g)', 0], ['CO(g) + ½O₂(g)', -110.5], ['CO₂(g)', -393.5]], steps: [[0, 1, 'C + ½O₂ → CO'], [1, 2, 'CO + ½O₂ → CO₂']], direct: [0, 2, 'C + O₂ → CO₂'] },
    ch4: { n: '甲烷燃燒：用生成焓', lv: [['CH₄(g) + 2O₂(g)', -74.8], ['C(s) + 2H₂(g) + 2O₂(g)（元素）', 0], ['CO₂(g) + 2H₂O(l)', -965.1]], steps: [[0, 1, '拆成元素'], [1, 2, '組成產物']], direct: [0, 2, 'CH₄ + 2O₂ → CO₂ + 2H₂O'] },
  };
  let cur = 'co', mode = 'steps';
  el.innerHTML = `${seg('heS', Object.entries(EX).map(([k, v]) => [k, v.n]), cur)}${seg('heM', [['steps', '分步走'], ['direct', '直接走']], mode)}<div id="heD"></div><p class="note" id="heN"></p>`;
  function draw() {
    const e = EX[cur], lo = Math.min(...e.lv.map(l => l[1])), hi = Math.max(...e.lv.map(l => l[1])), W0 = 520, H0 = 300, Y = v => 30 + (hi - v) / (hi - lo) * (H0 - 70), X0 = 150;
    const lvl = e.lv.map(([t, v], i) => `<line class="lvl" x1="${X0 - 70 + i * 20}" x2="${X0 + 230 + i * 20}" y1="${Y(v)}" y2="${Y(v)}"/><text class="tk hl" x="${X0 + 236 + i * 20}" y="${Y(v) + 4}">${t}</text>`).join('');
    const arr = (a, b, t, x, cls) => `<line class="${cls}" x1="${x}" x2="${x}" y1="${Y(e.lv[a][1])}" y2="${Y(e.lv[b][1]) - (e.lv[b][1] < e.lv[a][1] ? 6 : -6)}" marker-end="url(#hm)"/><text class="tk" x="${x + 6}" y="${(Y(e.lv[a][1]) + Y(e.lv[b][1])) / 2}">${t}：${fx(e.lv[b][1] - e.lv[a][1], 1)}</text>`;
    const body = mode === 'steps' ? e.steps.map(([a, b, t], i) => arr(a, b, t, X0 - 40 + i * 120, 'harr')).join('') : arr(e.direct[0], e.direct[1], e.direct[2], X0 + 20, 'harr2');
    $('#heD', el).innerHTML = `<svg viewBox="0 0 ${W0 + 120} ${H0}" class="ch" role="img" aria-label="焓的能階圖"><defs><marker id="hm" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--arrow)"/></marker></defs>${lvl}${body}<text class="lab" x="20" y="20">H（kJ）</text></svg>`;
    const tot = e.lv[e.direct[1]][1] - e.lv[e.direct[0]][1];
    $('#heN', el).innerHTML = `不論分幾步走，起點和終點相同，ΔH 就相同：<b>ΔH = ${fx(tot, 1)} kJ</b>。${cur === 'co' ? '直接量 C → CO 的熱很難（碳燒起來一定有部分變成 CO₂），但可以用兩個好量的反應相減得到：這就是赫斯定律的用處。' : '用生成焓計算：ΔH°反應 = Σ ΔH°f(產物) − Σ ΔH°f(反應物) = [−393.5 + 2(−285.8)] − (−74.8) = −890.3 kJ。元素的 ΔH°f 定義為 0（O₂ 也是）。'}`;
    pressSeg(el, 'heS', cur); pressSeg(el, 'heM', mode);
  }
  bindSeg(el, 'heS', v => { cur = v; draw(); }); bindSeg(el, 'heM', v => { mode = v; draw(); });
  draw();
  return { set(s) { if (s.ex) cur = s.ex; if (s.mode) mode = s.mode; draw(); } };
};

/* ===== 2. 熵：分子怎麼分布 ===== */
W.entropy = el => {
  let N = 10;
  el.innerHTML = `<div class="w-row"><label class="rng">氣體分子數 <input type="range" id="enN" min="2" max="40" step="1"><output class="mono" id="enO"></output></label></div><div class="bgrid"><div id="enB"></div><div id="enC"></div></div><p class="note" id="enT"></p>`;
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
  function draw() {
    const ks = Array.from({ length: N + 1 }, (_, k) => k), tot = 2 ** N, pk = ks.map(k => C(N, k) / tot), mx = Math.max(...pk);
    $('#enC', el).innerHTML = chart({ x: [-0.5, N + 0.5], y: [0, mx * 1.1], xt: [0, Math.round(N / 2), N], yt: [], xlab: '左半邊的分子數', ylab: '機率', h: 210, label: '分子分布的機率' }, (X, Y) => pk.map((p, k) => `<rect class="${k === N ? 'barhl' : 'bar'}" x="${X(k - 0.4)}" y="${Y(p)}" width="${X(k + 0.4) - X(k - 0.4)}" height="${Y(0) - Y(p)}"/>`).join(''));
    const dots = Array.from({ length: N }, (_, i) => { const left = i < Math.round(N / 2); return `<circle class="gas" cx="${(left ? 20 : 140) + (i * 37 % 100)}" cy="${20 + (i * 53 % 110)}" r="5"/>`; }).join('');
    $('#enB', el).innerHTML = `<svg viewBox="0 0 260 150" class="bk" role="img" aria-label="兩格容器"><rect x="10" y="10" width="240" height="130" fill="none" stroke="var(--muted)" stroke-width="2"/><line x1="130" x2="130" y1="10" y2="140" stroke="var(--muted)" stroke-dasharray="4 4"/>${dots}</svg><p class="small mut c">打開隔板後，分子自由分布在兩邊</p>`;
    $('#enO', el).textContent = N; $('#enN', el).value = N;
    $('#enT', el).innerHTML = `${N} 個分子分在左右兩邊，總共有 2<sup>${N}</sup> = ${sci(tot, 2)} 種排法。「全部在左邊」只有 1 種，機率 ${sci(1 / tot, 2)}；「各半」有 ${sci(C(N, Math.round(N / 2)), 2)} 種，最常出現。分子越多，分布越集中在「均勻」附近：1 莫耳氣體自己全部跑回一邊的機率小到永遠看不到。<br><b>熵</b> S = k ln W（W 是排法數）量度的就是能量與粒子能分散的方式有多少。自發過程朝 W 變大（熵增加）的方向進行。`;
  }
  $('#enN', el).oninput = e => { N = +e.target.value; draw(); };
  draw();
  return { set(s) { N = s.N ?? N; draw(); } };
};

/* ===== 3. ΔG = ΔH − TΔS ===== */
W.gibbs = el => {
  const PRE = { ice: ['冰熔化', 6.01, 22.0], caco3: ['CaCO₃ 分解', 178.3, 160.6], nh3: ['N₂ + 3H₂ → 2NH₃', -92.2, -198.7], comb: ['葡萄糖氧化', -2803, 259] };
  const st = { dH: 6.01, dS: 22.0, T: 298 };
  el.innerHTML = `<div class="w-row"><span class="small mut">例子：</span>${Object.entries(PRE).map(([k, p]) => `<button class="btn sm ghost" type="button" data-p="${k}">${p[0]}</button>`).join('')}</div><div class="w-row"><label class="rng">ΔH（kJ/mol）<input type="range" id="gH" min="-200" max="200" step="0.5"><output class="mono" id="gHo"></output></label><label class="rng">ΔS（J/K·mol）<input type="range" id="gS" min="-300" max="300" step="0.5"><output class="mono" id="gSo"></output></label></div><div class="w-row"><label class="rng">溫度（K）<input type="range" id="gT" min="0" max="1500" step="1"><output class="mono" id="gTo"></output></label></div><div id="gC"></div><div class="cards" id="gK"></div><p class="note" id="gN"></p>`;
  function draw() {
    const { dH, dS, T } = st, G = t => dH - t * dS / 1000, g = G(T), Tc = dS !== 0 ? dH / (dS / 1000) : NaN, lim = Math.max(30, Math.abs(dH) * 1.3, Math.abs(G(1500)) * 1.1);
    $('#gC', el).innerHTML = chart({ x: [0, 1500], y: [-lim, lim], xt: [0, 300, 600, 900, 1200, 1500], yt: [-Math.round(lim), 0, Math.round(lim)], xlab: '溫度（K）', ylab: 'ΔG（kJ/mol）', h: 230, label: 'ΔG 對溫度' }, (X, Y) =>
      `<rect class="buf" x="${X(0)}" y="${Y(0)}" width="${X(1500) - X(0)}" height="${Y(-lim) - Y(0)}"/><text class="tk" x="${X(1490)}" y="${Y(-lim) - 6}" text-anchor="end">ΔG &lt; 0：自發</text><line class="mk" x1="${X(0)}" x2="${X(1500)}" y1="${Y(0)}" y2="${Y(0)}"/><line class="tline" x1="${X(0)}" y1="${Y(clamp(G(0), -lim, lim))}" x2="${X(1500)}" y2="${Y(clamp(G(1500), -lim, lim))}"/>${Tc > 0 && Tc < 1500 ? `<circle class="dot2" cx="${X(Tc)}" cy="${Y(0)}" r="5"/><text class="tk" x="${X(Tc)}" y="${Y(0) - 8}" text-anchor="middle">T = ${fx(Tc, 0)} K</text>` : ''}<circle class="dot" cx="${X(T)}" cy="${Y(clamp(g, -lim, lim))}" r="7"/>`);
    $('#gK', el).innerHTML = card('g', `ΔG（${T} K）`, `${fx(g, 1)} kJ/mol`) + card('t', '−TΔS', `${fx(-T * dS / 1000, 1)}`) + card('c', '轉折溫度 ΔH ÷ ΔS', Tc > 0 ? `${fx(Tc, 0)} K` : '無');
    const q = dH < 0 && dS > 0 ? 'ΔH < 0、ΔS > 0：任何溫度都自發。' : dH > 0 && dS < 0 ? 'ΔH > 0、ΔS < 0：任何溫度都不自發。' : dH < 0 ? 'ΔH < 0、ΔS < 0：<b>低溫</b>自發（焓有利、熵不利，溫度低時 TΔS 影響小）。' : 'ΔH > 0、ΔS > 0：<b>高溫</b>自發（靠熵推動，溫度要夠高）。';
    $('#gN', el).innerHTML = `${q} 在 ${T} K，ΔG = ${fx(dH, 1)} − ${T} × (${fx(dS, 1)} ÷ 1000) = <b>${fx(g, 1)} kJ/mol</b>，${g < 0 ? '自發' : '不自發'}。注意 ΔS 的單位是 J，要先除以 1000 才能和 kJ 的 ΔH 相減。`;
    $('#gHo', el).textContent = fx(dH, 1); $('#gSo', el).textContent = fx(dS, 1); $('#gTo', el).textContent = T; $('#gH', el).value = clamp(dH, -200, 200); $('#gS', el).value = clamp(dS, -300, 300); $('#gT', el).value = T;
  }
  $('#gH', el).oninput = e => { st.dH = +e.target.value; draw(); };
  $('#gS', el).oninput = e => { st.dS = +e.target.value; draw(); };
  $('#gT', el).oninput = e => { st.T = +e.target.value; draw(); };
  $$('[data-p]', el).forEach(b => { b.onclick = () => { const p = PRE[b.dataset.p]; st.dH = p[1]; st.dS = p[2]; draw(); }; });
  draw();
  return { set(s) { if (s.p) { const p = PRE[s.p]; st.dH = p[1]; st.dS = p[2]; } if (s.T != null) st.T = s.T; draw(); } };
};

/* ===== 4. 卡計：放出的熱 = 吸收的熱 =====
   比熱 J/(g·°C) */
const SPH = { Al: ['鋁', 0.897], Fe: ['鐵', 0.449], Cu: ['銅', 0.385], Ag: ['銀', 0.235], Pb: ['鉛', 0.129] };
W.calor = el => {
  const st = { k: 'Cu', mm: 50, Tm: 95, mw: 100, Tw: 22 };
  el.innerHTML = `${seg('clS', Object.entries(SPH).map(([k, v]) => [k, `${v[0]}（c = ${v[1]}）`]), st.k)}<div class="w-row"><label class="rng">金屬質量（g）<input type="range" id="clM" min="10" max="200" step="1"><output class="mono" id="clMo"></output></label><label class="rng">水的質量（g）<input type="range" id="clW" min="50" max="500" step="5"><output class="mono" id="clWo"></output></label></div><div id="clG"></div><p class="eq" id="clF"></p><p class="note" id="clN"></p>`;
  function draw() {
    const c = SPH[st.k][1], Cm = st.mm * c, Cw = st.mw * 4.184, Tf = (Cm * st.Tm + Cw * st.Tw) / (Cm + Cw), q = Cw * (Tf - st.Tw);
    $('#clG', el).innerHTML = chart({ w: 560, h: 220, x: [0, 1], y: [0, 100], xt: [], yt: [0, 25, 50, 75, 100], ylab: '溫度（°C）', label: '熱平衡' }, (X, Y) =>
      `<line class="tline" x1="${X(0.1)}" y1="${Y(st.Tm)}" x2="${X(0.9)}" y2="${Y(Tf)}" style="stroke:#D0443C"/><line class="tline" x1="${X(0.1)}" y1="${Y(st.Tw)}" x2="${X(0.9)}" y2="${Y(Tf)}"/><circle class="dot" cx="${X(0.9)}" cy="${Y(Tf)}" r="6"/>`
      + `<text class="tk" x="${X(0.1)}" y="${Y(st.Tm) - 8}">金屬 ${st.Tm} °C</text><text class="tk" x="${X(0.1)}" y="${Y(st.Tw) + 16}">水 ${st.Tw} °C</text><text class="tk hl" x="${X(0.9)}" y="${Y(Tf) - 10}" text-anchor="end">最終 ${fx(Tf, 2)} °C</text>`);
    $('#clF', el).innerHTML = `金屬放熱 ${st.mm} × ${c} × (${st.Tm} − ${fx(Tf, 2)}) = 水吸熱 ${st.mw} × 4.184 × (${fx(Tf, 2)} − ${st.Tw}) = <b>${fx(q, 0)} J</b>`;
    $('#clN', el).innerHTML = `熱量 q = m·c·ΔT。兩者接觸直到溫度相同，金屬失去的熱等於水得到的熱。比熱小的金屬（鉛）同樣質量能帶進去的熱較少，水溫升高較少。水的比熱很大（4.184 J/(g·°C)），所以溫度變化很小。`;
    $('#clM', el).value = st.mm; $('#clMo', el).textContent = st.mm; $('#clW', el).value = st.mw; $('#clWo', el).textContent = st.mw; pressSeg(el, 'clS', st.k);
  }
  bindSeg(el, 'clS', v => { st.k = v; draw(); });
  $('#clM', el).oninput = e => { st.mm = +e.target.value; draw(); };
  $('#clW', el).oninput = e => { st.mw = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 5. 熱力學第一定律：ΔE = q + w（1 mol 單原子理想氣體） ===== */
W.firstlaw = el => {
  const st = { p: 'iso', r: 2, dT: 50 };
  el.innerHTML = `${seg('flS', [['iso', '等溫膨脹（298 K）'], ['cp', '定壓加熱'], ['cv', '定容加熱']], st.p)}<div class="w-row"><label class="rng" id="flL"><span></span><input type="range" id="flR"><output class="mono" id="flO"></output></label></div><div class="bars pk flb" id="flB"></div><div class="cards" id="flK"></div><p class="note" id="flN"></p>`;
  const R = 8.314;
  function draw() {
    let q, w, dE, dS, txt;
    if (st.p === 'iso') { w = -R * 298 * Math.log(st.r); dE = 0; q = -w; dS = R * Math.log(st.r); txt = `理想氣體的內能只和溫度有關，等溫時 ΔE = 0：氣體對外做的功 −w = nRT ln(V₂/V₁) 全部由吸收的熱補充。熵增加 ΔS = nR ln(V₂/V₁) = ${fx(dS, 2)} J/K。`; }
    else if (st.p === 'cp') { q = 2.5 * R * st.dT; w = -R * st.dT; dE = 1.5 * R * st.dT; dS = 2.5 * R * Math.log((298 + st.dT) / 298); txt = `定壓下 q = ΔH = nCₚΔT（Cₚ = 5/2 R），其中一部分用來推動活塞（w = −PΔV = −nRΔT），其餘使內能增加 nCᵥΔT。所以 Cₚ − Cᵥ = R。`; }
    else { q = 1.5 * R * st.dT; w = 0; dE = q; dS = 1.5 * R * Math.log((298 + st.dT) / 298); txt = `體積不變，不做功（w = 0），吸收的熱全部變成內能：q = ΔE = nCᵥΔT（單原子 Cᵥ = 3/2 R）。彈卡計就是定容，量到的是 ΔE。`; }
    const mx = Math.max(Math.abs(q), Math.abs(w), Math.abs(dE), 1);
    $('#flB', el).innerHTML = [['q（吸收的熱）', q], ['w（環境對系統做的功）', w], ['ΔE = q + w', dE]].map(([t, v]) => `<div><span>${t}</span><span class="zbar"><i class="${v >= 0 ? 'pos' : 'neg'}" style="width:${Math.abs(v) / mx * 50}%;${v >= 0 ? 'left:50%' : `right:50%`}"></i></span><b class="mono">${v >= 0 ? '+' : '−'}${fx(Math.abs(v), 0)} J</b></div>`).join('');
    $('#flK', el).innerHTML = card('s', 'ΔS', `${fx(dS, 2)} J/K`) + card('t', '過程', st.p === 'iso' ? `V₂/V₁ = ${st.r}` : `ΔT = ${st.dT} K`);
    $('#flN', el).innerHTML = `${txt} 符號規則：系統吸熱 q &gt; 0，環境對系統做功 w &gt; 0（被壓縮），系統對外做功 w &lt; 0（膨脹）。q 和 w 和路徑有關，ΔE、ΔH、ΔS 是狀態函數。`;
    const L = $('#flL', el), r = $('#flR', el);
    if (st.p === 'iso') { L.firstChild.textContent = '體積變為幾倍 V₂/V₁'; r.min = 1; r.max = 4; r.step = 0.1; r.value = st.r; $('#flO', el).textContent = fx(st.r, 1); }
    else { L.firstChild.textContent = '升溫 ΔT（K）'; r.min = 0; r.max = 200; r.step = 5; r.value = st.dT; $('#flO', el).textContent = st.dT; }
    pressSeg(el, 'flS', st.p);
  }
  bindSeg(el, 'flS', v => { st.p = v; draw(); });
  $('#flR', el).oninput = e => { if (st.p === 'iso') st.r = +e.target.value; else st.dT = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 6. 波恩–哈柏循環：由生成焓求晶格能 =====
   kJ/mol（教科書常用值）；晶格能由循環算出 */
const BH = {
  NaCl: [['Na(s) + ½Cl₂(g)', 0], ['Na(g) + ½Cl₂(g)', 107, 'Na 昇華'], ['Na(g) + Cl(g)', 122, '½ Cl–Cl 鍵能'], ['Na⁺(g) + e⁻ + Cl(g)', 496, 'Na 游離能'], ['Na⁺(g) + Cl⁻(g)', -349, 'Cl 電子親和力']], NaClf: -411,
  LiF: [['Li(s) + ½F₂(g)', 0], ['Li(g) + ½F₂(g)', 161, 'Li 昇華'], ['Li(g) + F(g)', 79, '½ F–F 鍵能'], ['Li⁺(g) + e⁻ + F(g)', 520, 'Li 游離能'], ['Li⁺(g) + F⁻(g)', -328, 'F 電子親和力']], LiFf: -616,
};
W.bornhaber = el => {
  let cur = 'NaCl';
  el.innerHTML = `${seg('bhS', [['NaCl', 'NaCl'], ['LiF', 'LiF']], cur)}<div id="bhG"></div><p class="eq" id="bhF"></p><p class="note" id="bhN"></p>`;
  function draw() {
    const st = BH[cur], f = BH[cur + 'f'], lv = []; let e = 0; st.forEach(([t, d], i) => { if (i) e += d; lv.push([t, e, d, st[i][2]]); });
    const U = lv[lv.length - 1][1] - f, top = Math.max(...lv.map(l => l[1])), bot = f, Y = v => 20 + (top - v) / (top - bot) * 250;
    let s = lv.map(([t, v], i) => `<line class="lvl" x1="${60 + i * 60}" x2="${200 + i * 60}" y1="${Y(v)}" y2="${Y(v)}"/><text class="tk" x="${205 + i * 60}" y="${Y(v) + 4}">${t}</text>`).join('');
    s += lv.slice(1).map(([, v, d, nm], i) => `<line class="${d > 0 ? 'dlt up' : 'dlt dn'}" x1="${110 + (i + 1) * 60}" x2="${110 + (i + 1) * 60}" y1="${Y(v - d)}" y2="${Y(v)}"/><text class="tk sm" x="${104 + (i + 1) * 60}" y="${(Y(v - d) + Y(v)) / 2 + 3}" text-anchor="end">${d > 0 ? '+' : ''}${d}</text>`).join('');
    s += `<line class="lvl on" x1="60" x2="200" y1="${Y(f)}" y2="${Y(f)}"/><text class="tk hl" x="205" y="${Y(f) + 4}">${cur}(s)　ΔHf = ${f}</text><line class="dlt dn" x1="420" x2="420" y1="${Y(lv[lv.length - 1][1])}" y2="${Y(f)}"/><text class="tk hl" x="426" y="${(Y(lv[lv.length - 1][1]) + Y(f)) / 2}">−${fx(U, 0)}（晶格能）</text>`;
    $('#bhG', el).innerHTML = `<svg class="en" style="max-width:640px" viewBox="40 0 600 285" role="img" aria-label="波恩–哈柏循環">${s}</svg>`;
    $('#bhF', el).innerHTML = `ΔHf = ${st.slice(1).map(x => `(${x[1] > 0 ? '+' : ''}${x[1]})`).join(' + ')} + (−U)　→　U = <b>${fx(U, 0)} kJ/mol</b>`;
    $('#bhN', el).innerHTML = `從元素到離子晶體，可以直接生成（ΔHf），也可以分步走：金屬昇華、非金屬斷鍵、游離、得電子，最後氣態離子結合成晶體（放出晶格能）。焓是狀態函數，兩條路的總和相同，所以可以用已知的各步驟反推晶格能。同樣的道理，溶解熱 = 晶格能 + 水合能：NaI 晶格能 686、溶解熱 −7.6 kJ/mol，則水合能 = −7.6 − 686 = −693.6 kJ/mol。`;
    pressSeg(el, 'bhS', cur);
  }
  bindSeg(el, 'bhS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 7. ln K 對 1/T（凡特何夫） ===== */
const VH = { nh3: ['N₂ + 3H₂ ⇌ 2NH₃（放熱）', -92.2, -198.7], no2: ['N₂O₄ ⇌ 2NO₂（吸熱）', 57.2, 175.8] };
W.vanthoff = el => {
  const st = { r: 'nh3', T: 298 };
  el.innerHTML = `${seg('vhS', Object.entries(VH).map(([k, v]) => [k, v[0]]), st.r)}<div class="w-row"><label class="rng">溫度（K）<input type="range" id="vhT" min="250" max="800" step="5"><output class="mono" id="vhO"></output></label></div><div id="vhG"></div><p class="eq" id="vhF"></p><p class="note" id="vhN"></p>`;
  function draw() {
    const [nm, H, S] = VH[st.r], lnK = T => -H * 1000 / (8.314 * T) + S / 8.314, xs = Array.from({ length: 41 }, (_, i) => 1.25 + i * 0.0725), y = lnK(st.T), ys = xs.map(x => lnK(1000 / x)), lo = Math.floor(Math.min(...ys) / 5) * 5, hi = Math.ceil(Math.max(...ys) / 5) * 5;
    $('#vhG', el).innerHTML = chart({ w: 560, h: 240, x: [1.25, 4.15], y: [lo, hi], xt: [1.5, 2, 2.5, 3, 3.5, 4], yt: [lo, (lo + hi) / 2, hi].map(Math.round), xlab: '1000 / T（K⁻¹）', ylab: 'ln K', label: 'ln K 對 1/T' }, (X, Y) =>
      `<path class="tline" d="${path(xs.map((x, i) => [X(x), Y(ys[i])]))}"/><circle class="dot" cx="${X(1000 / st.T)}" cy="${Y(y)}" r="7"/>`);
    $('#vhF', el).innerHTML = `ln K = −ΔH°/(RT) + ΔS°/R　→　斜率 = −ΔH°/R = ${fx(-H * 1000 / 8.314, 0)} K；${st.T} K 時 ln K = ${fx(y, 2)}，K = ${sci(Math.exp(y), 2)}`;
    $('#vhN', el).innerHTML = `由 ΔG° = ΔH° − TΔS° = −RT ln K 得到這條直線。<b>放熱反應</b>斜率為正：往右（低溫）ln K 變大，升溫使 K 變小；<b>吸熱反應</b>相反，升溫 K 變大。這就是勒沙特列原理中溫度效應的定量版本。`;
    $('#vhT', el).value = st.T; $('#vhO', el).textContent = `${st.T} K`; pressSeg(el, 'vhS', st.r);
  }
  bindSeg(el, 'vhS', v => { st.r = v; draw(); });
  $('#vhT', el).oninput = e => { st.T = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};
