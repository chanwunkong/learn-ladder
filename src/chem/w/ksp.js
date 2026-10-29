/* ---------- 後中化學：溶解度平衡的互動圖 ----------
   Ksp（25 °C，常見教科書數值；不同教科書略有差異） */
const KSP = {
  AgCl: { n: 'AgCl', k: 1.8e-10, x: 1, y: 1, c: 'Ag⁺', a: 'Cl⁻' },
  AgBr: { n: 'AgBr', k: 5.0e-13, x: 1, y: 1, c: 'Ag⁺', a: 'Br⁻' },
  AgI: { n: 'AgI', k: 8.3e-17, x: 1, y: 1, c: 'Ag⁺', a: 'I⁻' },
  BaSO4: { n: 'BaSO₄', k: 1.1e-10, x: 1, y: 1, c: 'Ba²⁺', a: 'SO₄²⁻' },
  CaF2: { n: 'CaF₂', k: 3.9e-11, x: 1, y: 2, c: 'Ca²⁺', a: 'F⁻' },
  Ag2CrO4: { n: 'Ag₂CrO₄', k: 1.1e-12, x: 2, y: 1, c: 'Ag⁺', a: 'CrO₄²⁻' },
  PbI2: { n: 'PbI₂', k: 1.4e-8, x: 1, y: 2, c: 'Pb²⁺', a: 'I⁻' },
  MgOH2: { n: 'Mg(OH)₂', k: 8.9e-12, x: 1, y: 2, c: 'Mg²⁺', a: 'OH⁻' },
  FeOH3: { n: 'Fe(OH)₃', k: 2.8e-39, x: 1, y: 3, c: 'Fe³⁺', a: 'OH⁻' },
  Ca3PO42: { n: 'Ca₃(PO₄)₂', k: 2.0e-33, x: 3, y: 2, c: 'Ca²⁺', a: 'PO₄³⁻' },
};
const solub = d => (d.k / (d.x ** d.x * d.y ** d.y)) ** (1 / (d.x + d.y));

/* ===== 1. Ksp 與莫耳溶解度 ===== */
W.ksp = el => {
  let cur = 'AgCl';
  el.innerHTML = `${seg('kpS', Object.entries(KSP).map(([k, v]) => [k, v.n]), cur)}<ol class="cs" id="kpC"></ol><div class="bars pk" id="kpB"></div><p class="small mut">各鹽類在純水中的莫耳溶解度 s（對數長度）</p><p class="note" id="kpN"></p>`;
  function draw() {
    const d = KSP[cur], s = solub(d), co = d.x === 1 ? 's' : `${d.x}s`, an = d.y === 1 ? 's' : `${d.y}s`;
    $('#kpC', el).innerHTML = `<li>${d.n}(s) ⇌ ${d.x > 1 ? d.x : ''}${d.c} + ${d.y > 1 ? d.y : ''}${d.a}</li><li>設溶解度為 s（M）：[${d.c}] = ${co}、[${d.a}] = ${an}</li><li>Ksp = (${co})${d.x > 1 ? SUP[d.x] : ''}(${an})${d.y > 1 ? SUP[d.y] : ''} = ${d.x ** d.x * d.y ** d.y === 1 ? '' : d.x ** d.x * d.y ** d.y}s${SUP[d.x + d.y] || ''} = ${sci(d.k)}</li><li>s = <b>${sci(s)} M</b></li>`;
    const ls = Object.values(KSP).map(solub), lo = Math.log10(Math.min(...ls)), hi = Math.log10(Math.max(...ls));
    $('#kpB', el).innerHTML = Object.entries(KSP).map(([k, v]) => { const sv = solub(v); return `<div class="${k === cur ? 'on' : ''}"><span>${v.n}（Ksp ${sci(v.k, 1)}）</span><i class="ba" style="width:${8 + 92 * (Math.log10(sv) - lo) / (hi - lo)}%"></i><b class="mono">${sci(sv, 1)} M</b></div>`; }).join('');
    $('#kpN', el).innerHTML = cur === 'Ag2CrO4' ? '注意：Ag₂CrO₄ 的 Ksp（1.1 × 10⁻¹²）比 AgCl（1.8 × 10⁻¹⁰）小，但溶解度反而<b>比較大</b>。因為 Ksp 的式子次方不同（s³ 對 s²），<b>只有化學式類型相同的鹽才能直接用 Ksp 比較溶解度</b>。'
      : `${d.n}：Ksp 是飽和溶液中離子濃度乘積（各取係數次方），固體不寫入。${d.x + d.y === 2 ? '1:1 型的鹽 s = √Ksp。' : `${d.x}:${d.y} 型的鹽 Ksp = ${d.x ** d.x * d.y ** d.y}s${SUP[d.x + d.y]}，s = (Ksp ÷ ${d.x ** d.x * d.y ** d.y}) 的 ${d.x + d.y} 次方根。`}${d.a === 'OH⁻' ? ` 飽和溶液的 [OH⁻] = ${d.y}s = ${sci(d.y * solub(d), 2)} M（若小於 10⁻⁷，pH 實際由水決定）。` : ''} 鹵化銀的溶解度 AgCl > AgBr > AgI，這是用沉澱顏色（白、淡黃、黃）鑑定鹵離子的基礎。`;
    pressSeg(el, 'kpS', cur);
  }
  bindSeg(el, 'kpS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.salt || cur; draw(); } };
};

/* ===== 2. 同離子效應 ===== */
W.commonion = el => {
  let c = 0.01; const K = KSP.AgCl.k;
  el.innerHTML = `<p class="eq">AgCl(s) ⇌ Ag⁺ + Cl⁻　　加入 NaCl（提供額外的 Cl⁻）</p><div class="w-row"><label class="rng">加入的 [Cl⁻]（M）<input type="range" id="ciC" min="-8" max="0" step="0.1"><output class="mono" id="ciO"></output></label></div><div id="ciG"></div><div class="cards" id="ciK"></div><p class="note" id="ciN"></p>`;
  const s = cl => (-cl + Math.sqrt(cl * cl + 4 * K)) / 2;
  function draw() {
    const xs = Array.from({ length: 81 }, (_, i) => -8 + i * 0.1), v = s(c);
    $('#ciG', el).innerHTML = chart({ x: [-8, 0], y: [-11, -4], xt: [-8, -6, -4, -2, 0], yt: [-10, -8, -6, -4], xlab: 'log 加入的 [Cl⁻]', ylab: 'log 溶解度 s', h: 220, label: '同離子效應' }, (X, Y) => `<path class="tline" d="${path(xs.map(x => [X(x), Y(Math.log10(s(10 ** x)))]))}"/><circle class="dot" cx="${X(Math.log10(c))}" cy="${Y(Math.log10(v))}" r="7"/><line class="mk" x1="${X(-8)}" x2="${X(0)}" y1="${Y(Math.log10(Math.sqrt(K)))}" y2="${Y(Math.log10(Math.sqrt(K)))}"/><text class="tk" x="${X(-7.9)}" y="${Y(Math.log10(Math.sqrt(K))) - 6}">純水中 1.3 × 10⁻⁵ M</text>`);
    $('#ciK', el).innerHTML = card('s', 'AgCl 溶解度', `${sci(v)} M`) + card('r', '是純水中的', `${sci(v / Math.sqrt(K), 2)} 倍`);
    $('#ciN', el).innerHTML = `溶液中已經有 Cl⁻，Ksp = [Ag⁺][Cl⁻] 要維持不變，能溶解的 Ag⁺ 就變少：勒沙特列原理。當加入的 Cl⁻ 遠大於 s 時，s ≈ Ksp ÷ [Cl⁻] = ${sci(K / c)} M。這就是為什麼鹵化銀沉澱要用含同離子的溶液清洗，損失較少。`;
    $('#ciC', el).value = Math.log10(c); $('#ciO', el).textContent = sci(c, 1);
  }
  $('#ciC', el).oninput = e => { c = 10 ** +e.target.value; draw(); };
  draw();
  return { set(st) { c = st.c ?? c; draw(); } };
};

/* ===== 3. 會不會沉澱：比較 Q 與 Ksp ===== */
W.precip = el => {
  const st = { ca: 1e-4, va: 50, cb: 1e-4, vb: 50 }, K = KSP.AgCl.k;
  el.innerHTML = `<p class="eq">AgNO₃ 溶液 + NaCl 溶液 → 混合後是否生成 AgCl 沉澱？</p><div class="w-row"><label class="rng">[AgNO₃]（M）<input type="range" id="ppA" min="-7" max="-1" step="0.1"><output class="mono" id="ppAo"></output></label><label class="rng">[NaCl]（M）<input type="range" id="ppB" min="-7" max="-1" step="0.1"><output class="mono" id="ppBo"></output></label></div><ol class="cs" id="ppC"></ol><p class="note" id="ppN"></p>`;
  function draw() {
    const V = st.va + st.vb, ag = st.ca * st.va / V, cl = st.cb * st.vb / V, Q = ag * cl, ppt = Q > K;
    $('#ppC', el).innerHTML = `<li>混合後體積加倍，濃度各減半：[Ag⁺] = ${sci(ag)} M、[Cl⁻] = ${sci(cl)} M</li><li>Q = [Ag⁺][Cl⁻] = ${sci(Q)}</li><li>Ksp(AgCl) = ${sci(K)}　→　Q ${ppt ? '&gt;' : '≤'} Ksp</li>`;
    $('#ppN', el).innerHTML = ppt ? `<span class="bad">會沉澱</span>：離子濃度乘積超過 Ksp，溶液過飽和，AgCl 會析出，直到剩下的離子濃度乘積降回 Ksp。` : `<span class="ok">不會沉澱</span>：Q 還沒達到 Ksp，溶液未飽和，離子都留在溶液中。`;
    $('#ppA', el).value = Math.log10(st.ca); $('#ppB', el).value = Math.log10(st.cb); $('#ppAo', el).textContent = sci(st.ca, 1); $('#ppBo', el).textContent = sci(st.cb, 1);
  }
  $('#ppA', el).oninput = e => { st.ca = 10 ** +e.target.value; draw(); };
  $('#ppB', el).oninput = e => { st.cb = 10 ** +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};


/* ===== 4. 溶解度和 pH：氫氧化物與弱酸鹽 ===== */
W.phsol = el => {
  const H = { MgOH2: ['Mg(OH)₂', 8.9e-12, 2], ZnOH2: ['Zn(OH)₂', 3.0e-17, 2], FeOH3: ['Fe(OH)₃', 2.8e-39, 3] };
  const st = { s: 'MgOH2', pH: 10 };
  el.innerHTML = `${seg('psS', Object.entries(H).map(([k, v]) => [k, v[0]]), st.s)}<div class="w-row"><label class="rng">溶液的 pH（緩衝）<input type="range" id="psH" min="2" max="13" step="0.1"><output class="mono" id="psO"></output></label></div><div id="psG"></div><p class="eq" id="psF"></p><p class="note" id="psN"></p>`;
  function draw() {
    const [nm, K, n] = H[st.s], ls = pH => Math.log10(K) + n * (14 - pH), xs = Array.from({ length: 111 }, (_, i) => 2 + i * 0.1);
    $('#psG', el).innerHTML = chart({ w: 560, h: 230, x: [2, 13], y: [-10, 4], xt: [2, 4, 6, 8, 10, 12], yt: [-10, -6, -2, 2], xlab: 'pH', ylab: 'log 溶解度（M）', label: '溶解度與 pH' }, (X, Y) =>
      `<path class="tline" d="${path(xs.map(x => [X(x), Y(clamp(ls(x), -10, 4))]))}"/><circle class="dot" cx="${X(st.pH)}" cy="${Y(clamp(ls(st.pH), -10, 4))}" r="7"/>`);
    $('#psF', el).innerHTML = `s = Ksp ÷ [OH⁻]${SUP[n]} = ${sci(K, 2)} ÷ (10⁻${fx(14 - st.pH, 1)})${SUP[n]} = <b>${sci(10 ** ls(st.pH), 2)} M</b>　（log s 對 pH 的斜率 = −${n}）`;
    $('#psN', el).innerHTML = `pH 每降低 1，[OH⁻] 變 1/10，${nm} 的溶解度增加 10${n === 2 ? '²' : '³'} 倍。同樣的道理適用於所有<b>弱酸的陰離子</b>（CO₃²⁻、S²⁻、F⁻、CH₃COO⁻、PO₄³⁻）：加酸把陰離子變成弱酸，溶解平衡往右。陰離子是強酸的共軛鹼（Cl⁻、Br⁻、I⁻、SO₄²⁻ 幾乎不受影響）時，溶解度和 pH 無關。兩種 Ksp 相近的銀鹽，共軛酸越弱的那一種越容易溶於酸。`;
    $('#psH', el).value = st.pH; $('#psO', el).textContent = fx(st.pH, 1); pressSeg(el, 'psS', st.s);
  }
  bindSeg(el, 'psS', v => { st.s = v; draw(); });
  $('#psH', el).oninput = e => { st.pH = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 5. 錯合物使沉澱溶解：K = Ksp × Kf ===== */
W.complexsol = el => {
  const SALT = { AgCl: ['AgCl', 1.8e-10], AgBr: ['AgBr', 5.0e-13], AgI: ['AgI', 8.3e-17] }, LIG = { nh3: ['NH₃', 'Ag(NH₃)₂⁺', 1.7e7], cn: ['CN⁻', 'Ag(CN)₂⁻', 1.0e21] };
  const st = { s: 'AgBr', l: 'nh3', c: 1.0 };
  el.innerHTML = `${seg('csS', Object.entries(SALT).map(([k, v]) => [k, v[0]]), st.s)}${seg('csL', Object.entries(LIG).map(([k, v]) => [k, v[0]]), st.l)}<div class="w-row"><label class="rng">配位基濃度（M）<input type="range" id="csC" min="0.05" max="6" step="0.05"><output class="mono" id="csO"></output></label></div><div class="bars pk" id="csB"></div><p class="eq" id="csF"></p><p class="note" id="csN"></p>`;
  function draw() {
    const [nm, ksp] = SALT[st.s], [ln, cx, kf] = LIG[st.l], K = ksp * kf, r = Math.sqrt(K), s = r * st.c / (1 + 2 * r), s0 = Math.sqrt(ksp);
    const lo = Math.log10(s0) - 1, hi = 1, w = v => clamp((Math.log10(v) - lo) / (hi - lo), 0.02, 1) * 100;
    $('#csB', el).innerHTML = `<div><span>在純水中</span><i class="ba" style="width:${w(s0)}%"></i><b class="mono">${sci(s0, 2)} M</b></div><div class="on"><span>在 ${fx(st.c, 2)} M ${ln} 中</span><i class="ba" style="width:${w(Math.min(s, st.c / 2))}%"></i><b class="mono">${sci(s, 2)} M</b></div><p class="small mut">長條為對數長度</p>`;
    $('#csF', el).innerHTML = `${nm}(s) + 2${ln} ⇌ ${cx} + ${nm.slice(2)}⁻　K = Ksp × Kf = ${sci(ksp, 1)} × ${sci(kf, 1)} = ${sci(K, 2)}；s² ÷ (C − 2s)² = K → s = √K·C ÷ (1 + 2√K)`;
    $('#csN', el).innerHTML = `配位基把 Ag⁺ 抓成錯離子，使 [Ag⁺] 極低，溶解平衡往右。總平衡常數是兩個反應相加：K = Ksp × Kf。${K > 1 ? '這裡 K 大於 1，沉澱幾乎可以全部溶解（受配位基的量限制）。' : `K 小於 1，Ksp 越小的鹽越難溶：AgCl 溶於氨水，AgI 幾乎不溶，需要形成常數更大的 CN⁻。`}`;
    $('#csC', el).value = st.c; $('#csO', el).textContent = fx(st.c, 2); pressSeg(el, 'csS', st.s); pressSeg(el, 'csL', st.l);
  }
  bindSeg(el, 'csS', v => { st.s = v; draw(); });
  bindSeg(el, 'csL', v => { st.l = v; draw(); });
  $('#csC', el).oninput = e => { st.c = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 6. 選擇性沉澱：誰先沉澱 ===== */
W.selprec = el => {
  const SYS = { ag: ['Cl⁻ 加入 Ag⁺ 與 Pb²⁺（各 0.010 M）', [['AgCl', 1.8e-10, 0.010, 1], ['PbCl₂', 1.7e-5, 0.010, 2]]], cl: ['Ag⁺ 加入 Cl⁻ 與 I⁻（各 0.010 M）', [['AgI', 8.3e-17, 0.010, 1], ['AgCl', 1.8e-10, 0.010, 1]]], pb: ['I⁻ 加入 2.0 × 10⁻³ M Pb²⁺ 與 1.0 × 10⁻⁴ M Cu⁺', [['CuI', 1.1e-12, 1.0e-4, 1], ['PbI₂', 1.4e-8, 2.0e-3, 2]]] };
  let cur = 'cl';
  el.innerHTML = `${seg('spS', Object.entries(SYS).map(([k, v]) => [k, v[0]]), cur)}<div id="spG"></div><ol class="cs" id="spC"></ol><p class="note" id="spN"></p>`;
  function draw() {
    const [, d] = SYS[cur], th = d.map(([n, k, c, m]) => [n, (k / c) ** (1 / m)]), lo = Math.floor(Math.log10(Math.min(...th.map(t => t[1])))) - 1, hi = Math.ceil(Math.log10(Math.max(...th.map(t => t[1])))) + 1;
    $('#spG', el).innerHTML = chart({ w: 560, h: 140, x: [lo, hi], y: [0, 1], xt: Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((_, i) => i % 2 === 0), yt: [], xlab: 'log 加入的沉澱劑濃度（M）　→ 越往右加得越多', label: '開始沉澱的濃度' }, (X, Y) =>
      th.map(([n, v], i) => `<line class="mk" x1="${X(Math.log10(v))}" x2="${X(Math.log10(v))}" y1="${Y(0)}" y2="${Y(1)}"/><circle class="dot" cx="${X(Math.log10(v))}" cy="${Y(0.5)}" r="6"/><text class="tk hl" x="${X(Math.log10(v)) + (X(Math.log10(v)) > 380 ? -8 : 8)}" y="${Y(i ? 0.25 : 0.8)}" text-anchor="${X(Math.log10(v)) > 380 ? 'end' : 'start'}">${n} 開始沉澱</text>`).join(''));
    $('#spC', el).innerHTML = d.map(([n, k, c, m]) => `<li>${n}：Ksp ${sci(k, 1)} ÷ ${sci(c, 1)} ${m > 1 ? `開 ${m} 次方根` : ''} = ${sci((k / c) ** (1 / m), 2)} M</li>`).join('');
    const first = th[0][1] < th[1][1] ? th[0] : th[1];
    $('#spN', el).innerHTML = `慢慢加入沉澱劑時，Q 先達到 Ksp 的那一種先沉澱：<b>${first[0]}</b> 需要的濃度最低。比較時要算出「開始沉澱所需的濃度」，化學式類型不同時不能直接比 Ksp。分離多種金屬離子時，依序加入只會沉澱其中一種的試劑，例如 Ag⁺、Pb²⁺、Ni²⁺ 的混合溶液依序加 NaCl（AgCl）、Na₂SO₄（PbSO₄）、Na₂S（NiS）。`;
    pressSeg(el, 'spS', cur);
  }
  bindSeg(el, 'spS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};
