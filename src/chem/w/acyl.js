/* ---------- 後中化學：羧酸及其衍生物的互動圖 ---------- */

/* ===== 1. 親核醯基取代：加成–脫去 ===== */
W.nacyl = el => {
  const X = { cl: ['醯氯', 'Cl', [0, 270, 315]], es: ['酯', 'OCH₃', [0, 270]], am: ['醯胺', 'NH₂', [270]] };
  let cur = 'cl', pl;
  el.innerHTML = `${seg('nyS', Object.entries(X).map(([k, v]) => [k, `${v[0]} + OH⁻`]), cur)}<div id="nyP"></div>`;
  const frames = () => {
    const [nm, xl, xlp] = X[cur];
    const F0 = { atoms: { C: { x: 0, y: 0, t: 'C', c: 'δ+' }, O: { x: 0, y: 1.25, t: 'O', lp: [45, 135] }, Me: { x: -1.15, y: -0.6, t: 'CH₃' }, X: { x: 1.2, y: -0.6, t: xl, lp: xlp }, N: { x: -0.35, y: -2.1, t: 'HO', c: '−', lp: [70] } }, bonds: [['C', 'O', 'd'], ['C', 'Me', 's'], ['C', 'X', 's']],
      arrows: [{ f: { lp: ['N', 70] }, t: { a: 'C' }, bend: -0.25 }, { f: { b: ['C', 'O'] }, t: { a: 'O' }, bend: -0.8 }], notes: [{ x: 0, y: -2.85, t: `${nm}（平面羰基）` }] };
    const F1 = { atoms: { C: { x: 0, y: 0, t: 'C' }, O: { x: 0.2, y: 1.2, t: 'O', c: '−', lp: [0, 90, 150] }, Me: { x: -1.15, y: -0.45, t: 'CH₃' }, X: { x: 1.15, y: -0.55, t: xl, lp: xlp }, N: { x: -0.2, y: -1.2, t: 'HO' } }, bonds: [['C', 'O', 's'], ['C', 'Me', 's'], ['C', 'X', 's'], ['C', 'N', 's']],
      arrows: [{ f: { lp: ['O', 150] }, t: { m: ['C', 'O'] }, bend: 0.6 }, { f: { b: ['C', 'X'] }, t: { a: 'X' }, bend: 0.7 }], notes: [{ x: 0, y: -2.85, t: '四面體中間物' }] };
    const F2 = { atoms: { C: { x: 0, y: 0, t: 'C' }, O: { x: 0, y: 1.25, t: 'O', lp: [45, 135] }, Me: { x: -1.15, y: -0.6, t: 'CH₃' }, X: { x: 2.4, y: -1.1, t: xl, c: '−', lp: xlp }, N: { x: 1.15, y: -0.6, t: 'OH' } }, bonds: [['C', 'O', 'd'], ['C', 'Me', 's'], ['C', 'N', 's']], notes: [{ x: 0, y: -2.85, t: `乙酸 + ${xl}⁻` }] };
    return [
      { sc: F0, at: 0, cap: '<b>加成</b>：和醛酮一樣，親核基攻擊羰基碳，π 電子推到 O 上。' },
      { sc: F1, at: 0.45, cap: '生成<b>四面體中間物</b>。到這裡為止和醛酮完全相同；差別是羰基碳上有一個可以離開的基團。' },
      { sc: F2, at: 1, cap: `<b>脫去</b>：O 上的電子推回來重新形成 C=O，把 ${xl}⁻ 擠出去。結果是 ${xl} 被 OH 取代：<b>親核醯基取代</b>。${cur === 'cl' ? 'Cl⁻ 是極好的離去基，這一步非常快。' : cur === 'es' ? 'CH₃O⁻ 是較差的離去基，需要加熱（皂化）；生成的羧酸立刻被鹼拿走 H⁺，變成羧酸根，使反應不可逆。' : 'NH₂⁻ 是極差的離去基，醯胺水解要在強酸或強鹼中長時間加熱。'}` }];
  };
  pl = mechPlayer($('#nyP', el), { frames, energy: () => ({ pts: cur === 'cl' ? [[0, 0.4], [0.25, 0.7], [0.45, 0.55], [0.65, 0.6], [1, 0.1]] : cur === 'es' ? [[0, 0.3], [0.25, 0.78], [0.45, 0.6], [0.65, 0.72], [1, 0.2]] : [[0, 0.2], [0.25, 0.85], [0.45, 0.68], [0.65, 0.88], [1, 0.3]], labels: [[0.45, '四面體中間物', 14]] }), w: 440, h: 290, s: 54, cy: 120, label: '親核醯基取代' });
  bindSeg(el, 'nyS', v => { cur = v; pressSeg(el, 'nyS', v); pl.reset(); });
  return { set(s) { if (s.x) { cur = s.x; pressSeg(el, 'nyS', cur); pl.reset(); } pl.go(s.step || 0, false); } };
};

/* ===== 2. 反應性階梯：只能往下走 ===== */
W.acylrank = el => {
  const L = [['醯氯 RCOCl', 'Cl⁻', 'HCl', -7, '幾乎沒有共振給電子（Cl 的 3p 軌域和 C 的 2p 重疊差）'], ['酸酐 (RCO)₂O', 'RCOO⁻', 'RCOOH', 4.8, 'O 的孤對電子分給兩個羰基'], ['酯 RCOOR′', "R′O⁻", "R′OH", 16, 'O 的孤對電子共振給羰基'], ['醯胺 RCONH₂', 'NH₂⁻', 'NH₃', 35, 'N 的孤對電子強烈共振給羰基（醯胺最穩定）'], ['羧酸根 RCOO⁻', 'O²⁻', 'OH⁻', '—', '帶負電，親核基幾乎無法進攻']];
  let a = 0, b = 2;
  el.innerHTML = `<div class="ladder2" id="arL"></div><div class="w-row"><label class="sel">從 <select id="arA">${L.map((x, i) => `<option value="${i}">${x[0]}</option>`).join('')}</select></label><label class="sel">變成 <select id="arB">${L.map((x, i) => `<option value="${i}">${x[0]}</option>`).join('')}</select></label></div><p class="note" id="arN"></p>`;
  function draw() {
    $('#arL', el).innerHTML = L.map((x, i) => `<div class="rung${i === a ? ' from' : ''}${i === b ? ' to' : ''}" style="margin-left:${i * 22}px"><b>${x[0]}</b><span>離去基 ${x[1]}（共軛酸 ${x[2]} pKa ${x[3]}）</span><small>${x[4]}</small></div>`).join('') + '<p class="small mut">越上面越活潑。</p>';
    const ok = b > a, same = a === b;
    $('#arN', el).innerHTML = same ? '選兩種不同的衍生物。' : ok ? `<span class="ok">可以直接轉換</span>：${L[a][0]} → ${L[b][0]} 是往下走（從較活潑變成較穩定），只要加入對應的親核基（${['', '羧酸根', '醇', '胺（或氨）', '鹼水解'][b]}）即可。離去的 ${L[a][1]} 比進來的基團更容易離開。`
      : `<span class="bad">不能直接轉換</span>：${L[a][0]} → ${L[b][0]} 是往上走。進來的 ${L[b][1]} 比要離開的 ${L[a][1]} 更好離開，四面體中間物會把新來的基團踢回去。必須先水解成羧酸、再用 SOCl₂ 轉成醯氯，才能往下走。`;
    $('#arA', el).value = a; $('#arB', el).value = b;
  }
  $('#arA', el).onchange = e => { a = +e.target.value; draw(); };
  $('#arB', el).onchange = e => { b = +e.target.value; draw(); };
  draw();
  return { set(s) { a = s.a ?? a; b = s.b ?? b; draw(); } };
};

/* ===== 3. 費雪酯化：用過量醇推高產率 ===== */
W.ester = el => {
  let r = 1; const K = 4;
  el.innerHTML = `<p class="eq">CH₃COOH + CH₃CH₂OH ⇌ CH₃COOCH₂CH₃ + H₂O　　K ≈ 4（H₂SO₄ 催化）</p><div class="w-row"><label class="rng">乙醇：乙酸 莫耳比 <input type="range" id="esR" min="0" max="2" step="0.02"><output class="mono" id="esO"></output></label></div><div id="esG"></div><p class="note" id="esN"></p>`;
  const yieldOf = r => { const a = K - 1, bq = -K * (1 + r), c = K * r; return (-bq - Math.sqrt(bq * bq - 4 * a * c)) / (2 * a); };   // x² = K(1−x)(r−x)
  function draw() {
    const y = yieldOf(r), xs = Array.from({ length: 101 }, (_, i) => 10 ** (i / 50));
    $('#esG', el).innerHTML = chart({ x: [0, 2], y: [0, 1], xt: [0, 1, 2], yt: [0, 0.5, 0.67, 1], xlab: 'log（乙醇／乙酸）：0 = 1:1、1 = 10:1、2 = 100:1', ylab: '酯的產率', h: 200 }, (X, Y) => `<path class="tline" d="${path(xs.map(v => [X(Math.log10(v)), Y(yieldOf(v))]))}"/><circle class="dot" cx="${X(Math.log10(r))}" cy="${Y(y)}" r="7"/>`);
    $('#esN', el).innerHTML = `乙醇：乙酸 = ${fx(r, 1)} : 1 時，酯的平衡產率（以乙酸計）= <b>${fx(100 * y, 1)}%</b>。K 只有 4，等莫耳時只得到約 67%。用勒沙特列原理推高產率：加入過量的醇（便宜的那一個），或把生成的水移走（迪安–史塔克分水器）。反過來，酯在大量水和酸中會水解回羧酸和醇；在鹼中水解（皂化）則因為生成羧酸根而不可逆。`;
    $('#esR', el).value = Math.log10(r); $('#esO', el).textContent = `${fx(r, 1)} : 1`;
  }
  $('#esR', el).oninput = e => { r = 10 ** +e.target.value; draw(); };
  draw();
  return { set(s) { r = s.r ?? r; draw(); } };
};
