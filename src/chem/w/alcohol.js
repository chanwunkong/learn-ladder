/* ---------- 後中化學：醇、醚與環氧化物的互動圖 ---------- */

/* ===== 1. 沸點比較：氫鍵的效果 ===== */
W.bpcmp = el => {
  const D = [['丙烷 CH₃CH₂CH₃', 44, -42, '只有分散力'], ['二甲醚 CH₃OCH₃', 46, -24, '有極性，但沒有 O–H，分子間不能形成氫鍵'], ['乙醇 CH₃CH₂OH', 46, 78, '有 O–H，分子間形成氫鍵'], ['乙醚 (CH₃CH₂)₂O', 74, 35, '和 1-丁醇同分子量，但沒有氫鍵'], ['1-丁醇', 74, 118, '氫鍵'], ['乙二醇 HOCH₂CH₂OH', 62, 197, '兩個 OH，氫鍵更多（汽車防凍液）']];
  el.innerHTML = `<div class="bars pk">${D.map(([n, m, b, w]) => `<div title="${w}"><span>${n}（${m}）</span><i class="${/醇/.test(n) ? 'ba' : 'bha'}" style="width:${4 + 96 * (b + 50) / 250}%"></i><b class="mono">${b} °C</b></div>`).join('')}</div><p class="small mut">括號內為分子量；橘色為醇</p><p class="note">分子量相近時，醇的沸點遠高於醚與烷，因為 O–H 能在分子之間形成<b>氫鍵</b>。醚的 O 有孤對電子，可以接受水的氫鍵，所以小分子醚在水中有一定溶解度，但醚分子之間不能互相形成氫鍵。醇的碳鏈越長，非極性部分越大，在水中的溶解度越低（乙醇和水完全互溶，1-丁醇只溶約 7.7 g/100 mL）。</p>`;
  return { set() {} };
};

/* ===== 2. 醇的轉換：讓 OH 變成好離去基 ===== */
W.alcconv = el => {
  const R = [
    ['HBr、HCl（濃）', '鹵烷', '三級：SN1（快，可能重排）；一級：SN2', 'OH 先被質子化成 –OH₂⁺，以水離開。三級醇與濃 HCl 室溫就反應（盧卡斯試驗：三級最快混濁、二級較慢、一級幾乎不反應）。'],
    ['PBr₃', '溴烷', '一級、二級；SN2，構型反轉', 'O 進攻 P 形成好的離去基，Br⁻ 從背面 SN2。不經過碳陽離子，所以不重排。'],
    ['SOCl₂（吡啶）', '氯烷', '一級、二級；SN2', '副產物 SO₂ 和 HCl 都是氣體，容易分離。'],
    ['TsCl、吡啶', '對甲苯磺酸酯（R–OTs）', '構型保留（C–O 鍵沒斷）', '把 OH 變成 OTs（極好的離去基，TsOH 是強酸），之後再用任何親核基做 SN2。分兩步，所以總結果是一次反轉。'],
    ['濃 H₂SO₄，加熱', '烯（脫水）', '三級 > 二級 > 一級；E1（三級、二級）', '質子化後失去水形成碳陽離子，再失去 β-H。查依采夫產物為主，可能重排。這是酸催化水合的逆反應。'],
    ['PCC（CH₂Cl₂）', '一級 → 醛；二級 → 酮', '溫和氧化劑，停在醛', '無水條件下，醛不會再被氧化成羧酸。'],
    ['K₂Cr₂O₇／H₂SO₄（瓊斯試劑）', '一級 → 羧酸；二級 → 酮', '強氧化劑', '一級醇先成醛，醛在水中形成水合物後再被氧化成羧酸。橙色 Cr⁶⁺ 變成綠色 Cr³⁺，舊式酒測器的原理。'],
  ];
  let cur = 0;
  el.innerHTML = `<div class="tscroll"><table class="tbl sel-tbl" id="acT"><thead><tr><th>試劑</th><th>產物</th><th>適用／立體</th></tr></thead><tbody>${R.map((r, i) => `<tr data-i="${i}" tabindex="0"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div><p class="note" id="acN"></p>`;
  function draw() { $$('#acT tbody tr', el).forEach((t, i) => t.classList.toggle('on', i === cur)); $('#acN', el).innerHTML = `<b>${R[cur][0]}</b>：${R[cur][3]}`; }
  $$('#acT tbody tr', el).forEach(t => { t.onclick = t.onkeydown = e => { if (e.type === 'keydown' && e.key !== 'Enter') return; cur = +t.dataset.i; draw(); }; });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 3. 醇的氧化：看帶 OH 的碳上有幾個 H ===== */
W.oxid = el => {
  const A = { p: ['一級醇 RCH₂OH', 2], s: ['二級醇 R₂CHOH', 1], t: ['三級醇 R₃COH', 0] }, O = { pcc: 'PCC', swern: '斯沃恩（DMSO, (COCl)₂）', dmp: '戴斯–馬丁（DMP）', cr: 'K₂Cr₂O₇／H₂SO₄（瓊斯）', mn: 'KMnO₄' }, MILD = { pcc: 1, swern: 1, dmp: 1 };
  const st = { a: 'p', o: 'pcc' };
  el.innerHTML = `${seg('oxA', Object.entries(A).map(([k, v]) => [k, v[0]]), st.a)}${seg('oxO', Object.entries(O), st.o)}<div class="oxpath" id="oxP"></div><p class="note" id="oxN"></p>`;
  function draw() {
    const [nm, h] = A[st.a], steps = h === 0 ? [nm, '不反應'] : h === 1 ? [nm, '酮 R₂C=O'] : MILD[st.o] ? [nm, '醛 RCHO'] : [nm, '醛 RCHO', '羧酸 RCOOH'];
    $('#oxP', el).innerHTML = steps.map((s, i) => `<span class="oxs${i === steps.length - 1 ? ' end' : ''}">${s}</span>`).join('<span class="oxa">→</span>');
    $('#oxN', el).innerHTML = `帶 OH 的碳上有 <b>${h} 個 H</b>。醇氧化時，這個碳要失去一個 H（連同 O–H 的 H）形成 C=O，所以：${h === 0 ? '三級醇沒有 H 可以拿，<b>不會被氧化</b>（強烈條件下只會斷 C–C 鍵）。' : h === 1 ? '二級醇氧化一次就成為酮，酮的羰基碳上已經沒有 H，停在這裡。' : MILD[st.o] ? '一級醇氧化成醛；PCC、斯沃恩氧化、戴斯–馬丁試劑（以及 CrO₃·吡啶的沙瑞特試劑）都在無水條件下反應，醛無法形成水合物，所以停在醛。' : '一級醇先成醛；在水溶液中醛形成水合物，羰基碳上還有 H，會繼續被氧化成羧酸（瓊斯試劑、KMnO₄、Na₂Cr₂O₇ 都是如此）。'}`;
    pressSeg(el, 'oxA', st.a); pressSeg(el, 'oxO', st.o);
  }
  bindSeg(el, 'oxA', v => { st.a = v; draw(); }); bindSeg(el, 'oxO', v => { st.o = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 4. 環氧化物開環：酸性 vs 鹼性 ===== */
W.epox = el => {
  let cond = 'base';
  el.innerHTML = `<p class="eq">2,2-二甲基環氧乙烷 + CH₃OH</p>${seg('epS', [['base', '鹼性：CH₃O⁻ / CH₃OH'], ['acid', '酸性：H⁺ / CH₃OH']], cond)}<div id="epM"></div><p class="note" id="epN"></p>`;
  function draw() {
    const base = cond === 'base';
    const sc = { atoms: { C1: { x: -0.65, y: 0, t: 'C' }, C2: { x: 0.65, y: 0, t: 'CH₂' }, O: { x: 0, y: 1.0, t: 'O', c: base ? '' : '+', lp: base ? [60, 120] : [90] }, M1: { x: -1.45, y: 0.55, t: 'CH₃' }, M2: { x: -1.45, y: -0.6, t: 'CH₃' }, H: { x: 0, y: 1.9, t: 'H', hide: base }, Nu: { x: base ? 1.4 : -0.95, y: -1.75, t: base ? 'CH₃O' : 'CH₃OH', c: base ? '−' : '', lp: [90] } },
      bonds: [['C1', 'C2', 's'], ['O', 'C1', 's'], ['O', 'C2', 's'], ['C1', 'M1', 's'], ['C1', 'M2', 's'], ...(base ? [] : [['O', 'H', 's']])],
      arrows: [{ f: { lp: ['Nu', 90] }, t: { a: base ? 'C2' : 'C1' }, bend: base ? 0.3 : -0.3 }, { f: { b: base ? ['O', 'C2'] : ['O', 'C1'] }, t: { a: 'O' }, bend: base ? -0.6 : 0.6 }] };
    $('#epM', el).innerHTML = MOL.svg(sc, { w: 360, h: 270, s: 58, cy: 140, label: '環氧化物開環' });
    $('#epN', el).innerHTML = base ? '<b>鹼性條件</b>：強親核基 CH₃O⁻ 直接做 <b>SN2</b>，從背面進攻<b>立體較空、取代較少</b>的碳（CH₂）。產物：1-甲氧基-2-甲基-2-丙醇。三元環的環張力很大，所以即使 O⁻ 不是好離去基，環也會打開。'
      : '<b>酸性條件</b>：O 先被質子化，C–O 鍵開始變長，正電荷主要累積在<b>較能承受正電荷的三級碳</b>上（類似 SN1）。弱親核基 CH₃OH 進攻<b>取代較多</b>的碳。產物：2-甲氧基-2-甲基-1-丙醇。兩種條件下親核基都從 O 的背面進攻，所以開環都是<b>反式</b>的。';
    pressSeg(el, 'epS', cond);
  }
  bindSeg(el, 'epS', v => { cond = v; draw(); });
  draw();
  return { set(s) { cond = s.c || cond; draw(); } };
};
