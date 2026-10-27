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
