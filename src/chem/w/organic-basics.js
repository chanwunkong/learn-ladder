/* ---------- 後中化學：有機基礎（形式電荷、混成、共振、有機酸鹼）的互動圖 ---------- */

/* ===== 1. 形式電荷 ===== */
W.fc = el => {
  const EL = { C: 4, N: 5, O: 6, X: 7 }, NAME = { C: '碳', N: '氮', O: '氧', X: '鹵素（F、Cl、Br、I）' };
  const st = { e: 'N', b: 4, lp: 0 };
  el.innerHTML = `<p class="lbl">原子</p>${seg('fcE', Object.entries(NAME), st.e)}<div class="w-row"><span class="small">鍵數（雙鍵算 2）</span>${[1, 2, 3, 4].map(v => `<button class="btn sm" type="button" data-b="${v}">${v}</button>`).join('')}<span class="sp"></span><span class="small">孤對電子對數</span>${[0, 1, 2, 3].map(v => `<button class="btn sm" type="button" data-l="${v}">${v}</button>`).join('')}</div><div class="bgrid"><div id="fcM"></div><div id="fcK"></div></div><p class="note" id="fcN"></p>`;
  function draw() {
    const v = EL[st.e], fc = v - 2 * st.lp - st.b, e = 2 * st.b + 2 * st.lp, lab = st.e === 'X' ? 'X' : st.e;
    const angs = { 1: [0], 2: [0, 180], 3: [90, 210, 330], 4: [90, 0, 180, 270] }[st.b], lps = [45, 135, 225, 315].slice(0, st.lp);
    const atoms = { A: { x: 0, y: 0, t: lab, lp: lps, c: fc > 0 ? '+' : fc < 0 ? '−' : '' } }, bonds = [];
    angs.forEach((a, i) => { atoms['r' + i] = { x: Math.cos(a * Math.PI / 180) * 1.2, y: Math.sin(a * Math.PI / 180) * 1.2, t: 'R' }; bonds.push(['A', 'r' + i, 's']); });
    $('#fcM', el).innerHTML = MOL.svg({ atoms, bonds }, { w: 220, h: 200, s: 56 });
    $('#fcK', el).innerHTML = card('v', '價電子', v) + card('n', '− 非鍵電子', 2 * st.lp) + card('b', '− 鍵數', st.b) + card('f', '形式電荷', fc > 0 ? `+${fc}` : fc < 0 ? `−${-fc}` : '0') + card('o', '周圍電子', `${e}${e === 8 ? '（八隅）' : ''}`);
    const common = { 'C4,0': '中性碳（最常見）', 'C3,0': '碳陽離子（只有 6 個電子，缺電子）', 'C3,1': '碳陰離子', 'N3,1': '中性氮（胺）', 'N4,0': '銨離子型的氮，帶 +1', 'N2,2': '帶 −1 的氮（例如 NH₂⁻）', 'O2,2': '中性氧（醇、醚）', 'O3,1': '鎓離子型的氧（例如 H₃O⁺、質子化的醇），帶 +1', 'O1,3': '帶 −1 的氧（例如 HO⁻、RO⁻）', 'X1,3': '中性鹵素', 'X0,4': '鹵離子' }[st.e + st.b + ',' + st.lp];
    $('#fcN', el).innerHTML = `形式電荷 = 價電子 − 非鍵電子 − 鍵數 = ${v} − ${2 * st.lp} − ${st.b} = <b>${fc}</b>。${common ? `這是<b>${common}</b>。` : ''}${e > 8 && st.e !== 'X' ? '<span class="bad">第二週期元素周圍超過 8 個電子，不可能存在。</span>' : ''}<br>記住常見組合就不用每次算：碳 4 鍵中性、3 鍵帶電；氮 3 鍵中性、4 鍵 +1；氧 2 鍵中性、3 鍵 +1、1 鍵 −1。`;
    pressSeg(el, 'fcE', st.e); $$('[data-b]', el).forEach(b => b.classList.toggle('pri', +b.dataset.b === st.b)); $$('[data-l]', el).forEach(b => b.classList.toggle('pri', +b.dataset.l === st.lp));
  }
  bindSeg(el, 'fcE', v => { st.e = v; draw(); });
  $$('[data-b]', el).forEach(b => { b.onclick = () => { st.b = +b.dataset.b; draw(); }; });
  $$('[data-l]', el).forEach(b => { b.onclick = () => { st.lp = +b.dataset.l; draw(); }; });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. 混成與形狀 ===== */
W.hyb = el => {
  const H = {
    sp3: { n: 'sp³（4 個電子區域）', ang: '109.5°', shape: '四面體', ex: 'CH₄、乙烷的碳；NH₃（1 對孤對，三角錐，107°）、H₂O（2 對孤對，彎曲，104.5°）',
      sc: { atoms: { C: { x: 0, y: 0, t: 'C' }, a: { x: 0, y: 1.15, t: 'H' }, b: { x: 1.05, y: -0.4, t: 'H' }, c: { x: -0.95, y: -0.55, t: 'H' }, d: { x: -0.2, y: -1.1, t: 'H' } }, bonds: [['C', 'a', 's'], ['C', 'b', 's'], ['C', 'c', 'w'], ['C', 'd', 'h']] } },
    sp2: { n: 'sp²（3 個電子區域）', ang: '120°', shape: '平面三角形', ex: '乙烯與羰基（C=O）的碳、苯的碳、碳陽離子；剩下一個未混成的 p 軌域形成 π 鍵',
      sc: { atoms: { C: { x: 0, y: 0, t: 'C' }, a: { x: -1.1, y: 0.65, t: 'H' }, b: { x: -1.1, y: -0.65, t: 'H' }, c: { x: 1.25, y: 0, t: 'R' } }, bonds: [['C', 'a', 's'], ['C', 'b', 's'], ['C', 'c', 's']], orbs: [{ a: 'C', ang: 90 }] } },
    sp: { n: 'sp（2 個電子區域）', ang: '180°', shape: '直線形', ex: '乙炔的碳、CO₂ 的碳、腈（C≡N）的碳；剩下兩個互相垂直的 p 軌域形成兩個 π 鍵',
      sc: { atoms: { C: { x: 0, y: 0, t: 'C' }, a: { x: -1.3, y: 0, t: 'H' }, b: { x: 1.3, y: 0, t: 'R' } }, bonds: [['C', 'a', 's'], ['C', 'b', 's']], orbs: [{ a: 'C', ang: 90 }] } },
  };
  let cur = 'sp3';
  el.innerHTML = `${seg('hyS', Object.entries(H).map(([k, v]) => [k, v.n]), cur)}<div class="bgrid"><div id="hyM"></div><div id="hyK"></div></div><p class="note" id="hyN"></p>`;
  function draw() {
    const h = H[cur];
    $('#hyM', el).innerHTML = MOL.svg(h.sc, { w: 260, h: 200, s: 60 });
    $('#hyK', el).innerHTML = card('a', '鍵角', h.ang) + card('s', '形狀', h.shape) + card('p', 's 性質', { sp3: '25%', sp2: '33%', sp: '50%' }[cur]);
    $('#hyN', el).innerHTML = `電子區域數 = σ 鍵數 + 孤對電子對數（雙鍵、參鍵都只算一個區域）。例子：${h.ex}。<b>s 性質越高，軌域越靠近原子核</b>：sp 碳上的電子對抓得最緊，所以乙炔的 C–H 比乙烯、乙烷都更容易被拿走 H⁺（有機酸鹼一章會用到）。`;
    pressSeg(el, 'hyS', cur);
  }
  bindSeg(el, 'hyS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.h || cur; draw(); } };
};

/* ===== 3. 共振：電子在移動，原子不動 ===== */
W.reson = el => {
  const EX = {
    acetate: { n: '醋酸根', frames: () => {
      const base = { C: { x: 0, y: 0, t: 'C' }, Me: { x: -1.3, y: -0.45, t: 'CH₃' } };
      const A = { atoms: { ...base, O1: { x: 0.75, y: 1.0, t: 'O', lp: [60, 150] }, O2: { x: 0.85, y: -0.85, t: 'O', c: '−', lp: [-30, -110, 30] } }, bonds: [['C', 'Me', 's'], ['C', 'O1', 'd'], ['C', 'O2', 's']], arrows: [{ f: { lp: ['O2', 30] }, t: { m: ['C', 'O2'] }, bend: -0.8 }, { f: { b: ['C', 'O1'] }, t: { a: 'O1' }, bend: -0.8 }] };
      const B = { atoms: { ...base, O1: { x: 0.75, y: 1.0, t: 'O', c: '−', lp: [60, 150, 0] }, O2: { x: 0.85, y: -0.85, t: 'O', lp: [-30, -110] } }, bonds: [['C', 'Me', 's'], ['C', 'O1', 's'], ['C', 'O2', 'd']] };
      const M = { atoms: { ...base, O1: { x: 0.75, y: 1.0, t: 'O', c: 'δ−' }, O2: { x: 0.85, y: -0.85, t: 'O', c: 'δ−' } }, bonds: [['C', 'Me', 's'], ['C', 'O1', 'sd'], ['C', 'O2', 'sd']] };
      return [{ sc: A, cap: '共振結構 1：負電荷在下面的 O。彎箭頭：O 上的孤對電子移進來形成 π 鍵，同時原本 C=O 的 π 電子移到上面的 O。<b>只有電子在動，原子位置完全不變。</b>' },
        { sc: B, cap: '共振結構 2：負電荷換到上面的 O。兩個結構能量相同，貢獻一樣多。' },
        { sc: M, cap: '真正的醋酸根是兩者的<b>共振混成</b>：兩個 C–O 鍵都是「一個半」鍵（實驗測得鍵長相同，介於單鍵與雙鍵之間），負電荷平均分在兩個 O 上。電荷分散 → 醋酸根很穩定 → 醋酸的酸性比乙醇強很多。' }]; } },
    allyl: { n: '烯丙基陽離子', frames: () => {
      const at = (c1, c3) => ({ C1: { x: -1.2, y: -0.35, t: 'CH₂', c: c1 }, C2: { x: 0, y: 0.35, t: 'CH' }, C3: { x: 1.2, y: -0.35, t: 'CH₂', c: c3 } });
      return [{ sc: { atoms: at('', '+'), bonds: [['C1', 'C2', 'd'], ['C2', 'C3', 's']], arrows: [{ f: { b: ['C1', 'C2'] }, t: { m: ['C2', 'C3'] }, bend: -0.7 }] }, cap: '正電荷在右邊的碳（只有 6 個電子）。左邊 C=C 的 π 電子可以移過來補它。' },
        { sc: { atoms: at('+', ''), bonds: [['C1', 'C2', 's'], ['C2', 'C3', 'd']], arrows: [{ f: { b: ['C2', 'C3'] }, t: { m: ['C1', 'C2'] }, bend: -0.7 }] }, cap: '正電荷換到左邊的碳。' },
        { sc: { atoms: at('δ+', 'δ+'), bonds: [['C1', 'C2', 'sd'], ['C2', 'C3', 'sd']] }, cap: '共振混成：正電荷分散在兩端，所以烯丙基陽離子比一般一級碳陽離子穩定得多。烯丙基鹵化物即使是一級，也能很快進行 SN1。' }]; } },
    amide: { n: '醯胺', frames: () => {
      const base = { C: { x: 0, y: 0, t: 'C' }, Me: { x: -1.2, y: -0.6, t: 'CH₃' } };
      return [{ sc: { atoms: { ...base, O: { x: 0, y: 1.25, t: 'O', lp: [45, 135] }, N: { x: 1.2, y: -0.6, t: 'NH₂', lp: [90] } }, bonds: [['C', 'Me', 's'], ['C', 'O', 'd'], ['C', 'N', 's']], arrows: [{ f: { lp: ['N', 90] }, t: { m: ['C', 'N'] }, bend: 0.6 }, { f: { b: ['C', 'O'] }, t: { a: 'O' }, bend: 0.8 }] }, cap: '醯胺的 N 上有一對孤對電子，旁邊就是 C=O。孤對電子可以推進來形成 C=N，C=O 的 π 電子推到 O 上。' },
        { sc: { atoms: { ...base, O: { x: 0, y: 1.25, t: 'O', c: '−', lp: [45, 135, 0] }, N: { x: 1.2, y: -0.6, t: 'NH₂', c: '+' } }, bonds: [['C', 'Me', 's'], ['C', 'O', 's'], ['C', 'N', 'd']] }, cap: '這個結構有電荷分離，貢獻比第一個少，但不能忽略。' },
        { sc: { atoms: { ...base, O: { x: 0, y: 1.25, t: 'O', c: 'δ−' }, N: { x: 1.2, y: -0.6, t: 'NH₂', c: 'δ+' } }, bonds: [['C', 'Me', 's'], ['C', 'O', 'sd'], ['C', 'N', 'sd']] }, cap: '結果：C–N 鍵有部分雙鍵性質，<b>不能自由旋轉</b>，醯胺是平面的（蛋白質的胜肽鍵因此是平面）；N 的孤對電子被拉走，所以醯胺<b>幾乎沒有鹼性</b>。' }]; } },
    benzene: { n: '苯', frames: () => {
      const atoms = {}; for (let k = 0; k < 6; k++) { const a = (90 + 60 * k) * Math.PI / 180; atoms['a' + k] = { x: Math.cos(a) * 1.2, y: Math.sin(a) * 1.2, t: '' }; }
      const ring = d => [0, 1, 2, 3, 4, 5].map(k => ['a' + k, 'a' + ((k + 1) % 6), (k + d) % 2 ? 's' : 'd']);
      const arr = d => [0, 1, 2, 3, 4, 5].filter(k => (k + d) % 2 === 0).map(k => ({ f: { b: ['a' + k, 'a' + ((k + 1) % 6)] }, t: { m: ['a' + ((k + 1) % 6), 'a' + ((k + 2) % 6)] }, bend: 0.6 }));
      return [{ sc: { atoms, bonds: ring(0), arrows: arr(0) }, cap: '苯的第一個凱庫勒結構。三個 π 鍵同時往旁邊移一格……' },
        { sc: { atoms, bonds: ring(1) }, cap: '……就得到第二個凱庫勒結構。兩者能量相同。' },
        { sc: { atoms, bonds: ring(0).map(b => [b[0], b[1], 's']), rings: [{ x: 0, y: 0, r: 0.72 }] }, cap: '真正的苯是共振混成：六個 C–C 鍵長完全相同（139 pm，介於單鍵 154 pm 與雙鍵 134 pm 之間），π 電子均勻分布在整個環上，常畫成六邊形中間一個圓。這種特別的穩定性稱為<b>芳香性</b>。' }]; } },
  };
  let cur = 'acetate', pl;
  el.innerHTML = `${seg('reS', Object.entries(EX).map(([k, v]) => [k, v.n]), cur)}<div id="reP"></div>`;
  pl = mechPlayer($('#reP', el), { frames: () => EX[cur].frames(), w: 420, h: 230, s: 56, label: '共振結構' });
  bindSeg(el, 'reS', v => { cur = v; pressSeg(el, 'reS', v); pl.reset(); });
  return { set(s) { if (s.ex) { cur = s.ex; pressSeg(el, 'reS', cur); pl.reset(); } pl.go(s.step ?? 0, false); } };
};

/* ===== 4. 用 pKa 預測酸鹼反應方向 ===== */
// pKa 主要採 OpenStax《Organic Chemistry》（McMurry）的數值；不同教科書略有差異（例如 NH₃ 為 35–38、CH₄ 為 50–60）
const PKA = [
  ['HCl', 'Cl⁻', -7], ['H₃O⁺', 'H₂O', -1.7], ['CH₃COOH', 'CH₃COO⁻', 4.76], ['H₂CO₃', 'HCO₃⁻', 6.35], ['NH₄⁺', 'NH₃', 9.25], ['C₆H₅OH（酚）', 'C₆H₅O⁻', 10.0],
  ['H₂O', 'OH⁻', 15.7], ['CH₃CH₂OH', 'CH₃CH₂O⁻', 16], ['HC≡CH', 'HC≡C⁻', 25], ['NH₃', 'NH₂⁻', 35], ['CH₃CH₃', 'CH₃CH₂⁻', 50],
];
W.pkaeq = el => {
  let ia = 8, ib = 6;
  const PRE = [['NaOH 能拿走乙炔的 H 嗎？', 8, 6], ['NaNH₂ 呢？', 8, 9], ['碳酸氫鈉能溶解醋酸嗎？', 2, 3], ['碳酸氫鈉能溶解酚嗎？', 5, 3], ['乙醇與 NaOH', 7, 6]];
  el.innerHTML = `<div class="w-row"><span class="small mut">試試：</span>${PRE.map((p, i) => `<button class="btn sm ghost" type="button" data-p="${i}">${p[0]}</button>`).join('')}</div>
<div class="w-row"><label class="sel">酸 HA <select id="pkA">${PKA.map((p, i) => `<option value="${i}">${p[0]}（pKa ${p[2]}）</option>`).join('')}</select></label><label class="sel">鹼 B⁻ <select id="pkB">${PKA.map((p, i) => `<option value="${i}">${p[1]}（共軛酸 pKa ${p[2]}）</option>`).join('')}</select></label></div><div id="pkR"></div><div id="pkS"></div><p class="note" id="pkN"></p>`;
  function draw() {
    const A = PKA[ia], B = PKA[ib], d = B[2] - A[2], K = 10 ** d, right = d > 0;
    $('#pkA', el).value = ia; $('#pkB', el).value = ib;
    $('#pkR', el).innerHTML = `<p class="eq">${A[0]} + ${B[1]} ${right ? '<b>⟶</b>' : '⟵'} ${A[1]} + ${B[0]}<br><span class="small">pKa ${A[2]}　　　　　　　　　pKa ${B[2]}</span></p>`;
    $('#pkS', el).innerHTML = chart({ x: [-10, 52], y: [0, 1], xt: [-10, 0, 10, 20, 30, 40, 50], yt: [], xlab: 'pKa（越左酸越強；共軛鹼越右越強）', h: 130 }, (X, Y) => PKA.map((p, i) => { const on = i === ia || i === ib, y = Y(0.25 + 0.55 * ((i % 3) / 2)); return `<line class="mk" x1="${X(p[2])}" x2="${X(p[2])}" y1="${Y(0)}" y2="${y}"/><circle class="${on ? 'dot' : 'dot3'}" cx="${X(p[2])}" cy="${y}" r="${on ? 6 : 4}"/><text class="tk${on ? ' hl' : ''}" x="${X(p[2])}" y="${y - 9}" text-anchor="middle">${p[0].replace(/（.*）/, '')}</text>`; }).join(''));
    $('#pkN', el).innerHTML = ia === ib ? '選兩個不同的物種。' : `平衡常數 K = 10<sup>(pKa 右邊的酸 − pKa 左邊的酸)</sup> = 10<sup>${fx(d, 2)}</sup> ≈ ${sci(K, 1)}。平衡偏向<b>較弱的酸（pKa 較大）那一側</b>：${right ? `${B[0]}（${B[2]}）比 ${A[0]}（${A[2]}）弱，所以反應<b>向右</b>，${B[1]} 可以把 ${A[0]} 的 H⁺ 拿走。` : `${A[0]}（${A[2]}）比 ${B[0]}（${B[2]}）弱，反應<b>幾乎不往右走</b>：${B[1]} 不夠強，拿不走 ${A[0]} 的 H⁺。`}`;
  }
  $('#pkA', el).onchange = e => { ia = +e.target.value; draw(); };
  $('#pkB', el).onchange = e => { ib = +e.target.value; draw(); };
  $$('[data-p]', el).forEach(b => { b.onclick = () => { const p = PRE[+b.dataset.p]; ia = p[1]; ib = p[2]; draw(); }; });
  draw();
  return { set(s) { ia = s.a ?? ia; ib = s.b ?? ib; draw(); } };
};

/* ===== 5. 什麼讓酸變強：看共軛鹼的負電荷穩不穩 ===== */
W.ario = el => {
  const T = {
    row: { n: '原子：同一週期', items: [['CH₄', 60], ['NH₃', 35], ['H₂O', 15.7], ['HF', 3.2]], why: '同一週期由左到右，電負度 C < N < O < F。負電荷落在電負度越大的原子上越穩定，所以 HF 最酸。' },
    col: { n: '原子：同一族', items: [['HF', 3.2], ['HCl', -7], ['HBr', -9], ['HI', -10]], why: '同一族由上到下，原子越大，負電荷分散在越大的體積，越穩定；而且 H–X 鍵越長越弱。<b>大小比電負度重要</b>，所以 HI 最酸，雖然 I 的電負度最小。' },
    res: { n: '共振', items: [['CH₃CH₂OH', 16], ['C₆H₅OH（酚）', 10.0], ['CH₃COOH', 4.76]], why: '乙氧離子的負電荷集中在一個 O 上；酚氧離子的負電荷可以分散到苯環上；醋酸根的負電荷平均分在兩個電負度大的 O 上（見上一章的共振）。<b>電荷越分散越穩定</b>。' },
    ind: { n: '誘導：拉電子基數目', items: [['CH₃COOH', 4.76], ['ClCH₂COOH', 2.9], ['Cl₂CHCOOH', 1.3], ['Cl₃CCOOH', 0.7]], why: 'Cl 電負度大，透過 σ 鍵把電子往自己拉，幫忙分攤羧酸根的負電荷。Cl 越多，效果越強，酸性越強。' },
    dist: { n: '誘導：距離', items: [['丁酸', 4.82], ['4-氯丁酸', 4.52], ['3-氯丁酸', 4.05], ['2-氯丁酸', 2.86]], why: '誘導效應隨距離快速減弱：Cl 越靠近 COOH，酸性越強；隔三個碳以後幾乎沒影響。' },
    orb: { n: '混成軌域', items: [['CH₃CH₃（sp³）', 50], ['CH₂=CH₂（sp²）', 44], ['HC≡CH（sp）', 25]], why: '負電荷所在軌域的 s 性質越高（sp 50%、sp² 33%、sp³ 25%），電子越靠近原子核、越穩定。所以末端炔的 H 可以被 NaNH₂ 拿走，烯和烷不行。' },
  };
  let cur = 'row';
  el.innerHTML = `${seg('arS', Object.entries(T).map(([k, v]) => [k, v.n]), cur)}<div id="arB"></div><p class="note" id="arN"></p>`;
  function draw() {
    const t = T[cur], lo = Math.min(...t.items.map(i => i[1])), hi = Math.max(...t.items.map(i => i[1]));
    $('#arB', el).innerHTML = `<div class="bars pk">${t.items.map(([n, p]) => `<div><span>${n}</span><i class="ba" style="width:${8 + 92 * (hi - p) / Math.max(1, hi - lo)}%"></i><b class="mono">pKa ${p}</b></div>`).join('')}</div><p class="small mut">長條越長 = 酸性越強（pKa 越小）</p>`;
    $('#arN', el).innerHTML = t.why + ' 判斷酸性強弱的萬用問題：<b>拿走 H⁺ 之後，留下的負電荷穩不穩定？</b>';
    pressSeg(el, 'arS', cur);
  }
  bindSeg(el, 'arS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.t || cur; draw(); } };
};

/* ===== 6. 鹼性：看共軛酸的 pKa ===== */
W.basic = el => {
  const B = [['二甲胺 (CH₃)₂NH', 10.73, '兩個甲基推電子，N 上的電子更多、更容易接 H⁺。'], ['甲胺 CH₃NH₂', 10.64, '烷基推電子，比氨稍強。'], ['氨 NH₃', 9.25, '參考標準。'],
    ['吡啶', 5.25, 'N 的孤對電子在 sp² 軌域（s 性質較高），抓得比較緊，較不願意給出。'], ['苯胺 C₆H₅NH₂', 4.63, 'N 的孤對電子和苯環共振，被分散掉了，所以鹼性弱很多。'], ['醯胺 CH₃CONH₂', -0.5, 'N 的孤對電子和 C=O 共振（見共振一節），幾乎沒有鹼性；質子化發生在 O 上。']];
  let cur = 0;
  el.innerHTML = `<div class="bars pk" id="bsB"></div><p class="small mut">點一下看原因。長條越長 = 鹼性越強（共軛酸 pKaH 越大）</p><p class="note" id="bsN"></p>`;
  function draw() {
    $('#bsB', el).innerHTML = B.map(([n, p], i) => `<div class="${i === cur ? 'on' : ''}" data-i="${i}" role="button" tabindex="0"><span>${n}</span><i class="bha" style="width:${6 + 94 * (p + 1) / 12}%"></i><b class="mono">${p}</b></div>`).join('');
    $$('[data-i]', el).forEach(d => { d.onclick = d.onkeydown = e => { if (e.type === 'keydown' && e.key !== 'Enter') return; cur = +d.dataset.i; draw(); }; });
    $('#bsN', el).innerHTML = `<b>${B[cur][0]}</b>：共軛酸 pKaH = ${B[cur][1]}。${B[cur][2]} 原則：<b>共軛酸越弱（pKaH 越大），鹼就越強</b>；孤對電子越「自由」，越容易接 H⁺。`;
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};
