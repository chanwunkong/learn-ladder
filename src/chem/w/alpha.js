/* ---------- 後中化學：α-碳化學的互動圖 ---------- */

/* ===== 1. 動力學 vs 熱力學烯醇離子：2-甲基環己酮 ===== */
W.enolsel = el => {
  let cur = 'k';
  const ring = { C1: { x: 0, y: 0.5, t: '' }, C2: { x: 0.87, y: 0, t: '' }, C3: { x: 0.87, y: -1, t: '' }, C4: { x: 0, y: -1.5, t: '' }, C5: { x: -0.87, y: -1, t: '' }, C6: { x: -0.87, y: 0, t: '' } };
  const rb = [['C2', 'C3', 's'], ['C3', 'C4', 's'], ['C4', 'C5', 's'], ['C5', 'C6', 's']];
  const sc = (m) => {   // m：'s' 起始、'ek'/'et' 烯醇離子、'pk'/'pt' 甲基化產物
    const atoms = JSON.parse(JSON.stringify(ring)), bonds = [...rb];
    atoms.O = { x: 0, y: 1.75, t: 'O', lp: m[0] === 'e' ? [30, 150, 90] : [30, 150], c: m[0] === 'e' ? '−' : '' };
    atoms.M = { x: 1.9, y: 0.55, t: 'CH₃' };
    bonds.push(['C2', 'M', 's'], ['C1', 'O', m[0] === 'e' ? 's' : 'd']);
    bonds.push(['C1', 'C2', m === 'et' ? 'd' : 's'], ['C1', 'C6', m === 'ek' ? 'd' : 's']);
    if (m === 's') { atoms.C2.halo = cur === 't' ? 0.32 : 0; atoms.C6.halo = cur === 'k' ? 0.32 : 0; }
    if (m === 'pt') atoms.N = { x: 1.9, y: -0.5, t: 'CH₃', hl: 1 }, bonds.push(['C2', 'N', 's']);
    if (m === 'pk') atoms.N = { x: -1.9, y: 0.55, t: 'CH₃', hl: 1 }, bonds.push(['C6', 'N', 's']);
    return { atoms, bonds };
  };
  const C = { k: ['LDA，THF，−78 °C', 'ek', 'pk', '動力學烯醇離子', '2,6-二甲基環己酮'], t: ['NaOEt，EtOH，室溫（可逆、達平衡）', 'et', 'pt', '熱力學烯醇離子', '2,2-二甲基環己酮'] };
  el.innerHTML = `${seg('esS', Object.entries(C).map(([k, v]) => [k, v[0]]), cur)}<div class="mrow" id="esR"></div><p class="note" id="esN"></p>`;
  function draw() {
    const c = C[cur], o = { w: 190, h: 170, s: 32, cy: 80 };
    $('#esR', el).innerHTML = [[sc('s'), '2-甲基環己酮'], [sc(c[1]), c[3]], [sc(c[2]), `加 CH₃I → ${c[4]}`]].map(([s, t], i) => `${i ? '<span class="marr">→</span>' : ''}<figure>${MOL.svg(s, { ...o, label: t })}<figcaption>${t}</figcaption></figure>`).join('');
    $('#esN', el).innerHTML = cur === 'k' ? '<b>LDA</b> 是又強又龐大的鹼（共軛酸 pKa 約 36），在低溫下一次就把 α-H 拿走、不可逆。它拿的是<b>比較容易靠近、H 比較多</b>的那一側（沒有甲基的 C6），生成速度最快的<b>動力學烯醇離子</b>。'
      : '較弱的鹼（NaOEt，共軛酸 pKa 約 16）只拿走少量 α-H，而且可逆，兩種烯醇離子會互相轉換、達到平衡。平衡偏向<b>雙鍵上取代基較多</b>、比較穩定的一側（有甲基的 C2）：<b>熱力學烯醇離子</b>，和查依采夫規則的道理相同。';
    pressSeg(el, 'esS', cur);
  }
  bindSeg(el, 'esS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 2. 碘仿試驗：哪些化合物呈陽性 ===== */
W.iodoform = el => {
  const D = [['乙醇', 'CH₃CH₂OH', 1, '先被 I₂ 氧化成乙醛 CH₃CHO，含 CH₃C=O。'], ['甲醇', 'CH₃OH', 0, '只有一個碳，無法形成 CH₃C=O。'], ['2-丙醇', 'CH₃CH(OH)CH₃', 1, '氧化成丙酮。'], ['1-丙醇', 'CH₃CH₂CH₂OH', 0, '氧化成丙醛 CH₃CH₂CHO，羰基旁是 CH₂CH₃ 而不是 CH₃。'],
    ['丙酮', 'CH₃COCH₃', 1, '甲基酮。'], ['3-戊酮', 'CH₃CH₂COCH₂CH₃', 0, '羰基兩側都是乙基。'], ['苯乙酮', 'C₆H₅COCH₃', 1, '甲基酮，產物是苯甲酸根。'], ['乙醛', 'CH₃CHO', 1, '唯一呈陽性的醛。'], ['2-丁醇', 'CH₃CH(OH)CH₂CH₃', 1, '氧化成 2-丁酮。'], ['苯甲醛', 'C₆H₅CHO', 0, '沒有 α-H。'], ['乙酸', 'CH₃COOH', 0, '羧酸的 α-H 酸性太低，而且先被鹼變成羧酸根。']];
  let cur = 4;
  el.innerHTML = `<div class="w-row">${D.map(([n], i) => `<button class="btn sm ghost" type="button" data-i="${i}">${n}</button>`).join('')}</div><ol class="cs" id="ioC"></ol><p class="note" id="ioN"></p>`;
  function draw() {
    const [n, f, ok, why] = D[cur];
    $('#ioC', el).innerHTML = ok ? `<li>${n}　${f}</li><li>I₂、NaOH：CH₃ 上的三個 α-H 依序被 I 取代 → R–CO–CI₃</li><li>OH⁻ 攻擊羰基，CI₃⁻ 是好的離去基 → R–COO⁻ + <b>CHI₃（黃色沉澱）</b></li>` : `<li>${n}　${f}</li><li>沒有 CH₃–C=O（或可被氧化成它的 CH₃–CH(OH)–）</li>`;
    $('#ioN', el).innerHTML = `${ok ? '<span class="ok">陽性</span>' : '<span class="bad">陰性</span>'}：${why} 碘仿試驗檢驗的是 <b>CH₃–CO–</b> 和 <b>CH₃–CH(OH)–</b> 兩種結構。`;
    $$('[data-i]', el).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === cur)));
  }
  $$('[data-i]', el).forEach(b => { b.onclick = () => { cur = +b.dataset.i; draw(); }; });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 3. 丙二酸酯與乙醯乙酸酯合成 ===== */
W.malonic = el => {
  // [鹵烷, R, 碳數, 丙二酸酯產物, 乙醯乙酸酯產物, 再加 CH₃ 的丙二酸酯產物, 再加 CH₃ 的乙醯乙酸酯產物]
  const R = [['CH₃Br', 'CH₃', 1, '丙酸', '2-丁酮', '2-甲基丙酸', '3-甲基-2-丁酮'], ['CH₃CH₂Br', 'CH₃CH₂', 2, '丁酸', '2-戊酮', '2-甲基丁酸', '3-甲基-2-戊酮'], ['1-溴丙烷', 'CH₃(CH₂)₂', 3, '戊酸', '2-己酮', '2-甲基戊酸', '3-甲基-2-己酮'],
    ['1-溴丁烷', 'CH₃(CH₂)₃', 4, '己酸', '2-庚酮', '2-甲基己酸', '3-甲基-2-庚酮'], ['1-溴己烷', 'CH₃(CH₂)₅', 6, '辛酸', '2-壬酮', '2-甲基辛酸', '3-甲基-2-壬酮'], ['苄基溴', 'C₆H₅CH₂', 7, '3-苯基丙酸', '4-苯基-2-丁酮', '2-甲基-3-苯基丙酸', '3-甲基-4-苯基-2-丁酮'], ['2-溴-2-甲基丙烷', '(CH₃)₃C', 4, null, null, null, null]];
  const st = { m: 'mal', r: 4, two: 0 };
  el.innerHTML = `${seg('mlS', [['mal', '丙二酸二乙酯 → 羧酸'], ['aca', '乙醯乙酸乙酯 → 甲基酮']], st.m)}<div class="w-row">${R.map(([n], i) => `<button class="btn sm ghost" type="button" data-r="${i}">${n}</button>`).join('')}</div>${seg('mlT', [['0', '烷基化一次'], ['1', '再用 CH₃I 烷基化一次']], '0')}<ol class="cs" id="mlC"></ol><p class="note" id="mlN"></p>`;
  function draw() {
    const r = R[st.r], mal = st.m === 'mal', start = mal ? 'CH₂(COOEt)₂' : 'CH₃COCH₂COOEt', tail = mal ? 'COOEt' : 'COCH₃';
    if (!r[3]) {
      $('#mlC', el).innerHTML = `<li>${start} + NaOEt → 烯醇離子</li><li>烯醇離子 + ${r[0]}：三級鹵烷無法進行 SN2</li>`;
      $('#mlN', el).innerHTML = '<span class="bad">不能用</span>：烷基化是烯醇離子對鹵烷的 <b>SN2</b>，只能用甲基、一級（與苄基、烯丙基）鹵烷。三級鹵烷遇到強鹼只會發生 E2 脫去。';
    } else {
      const sub = st.two ? `CH₃–C(${r[1]})` : `${r[1]}–CH`;
      $('#mlC', el).innerHTML = `<li>${start} + NaOEt → 夾在兩個羰基間的 α-H 被拿走（pKa ${mal ? '13' : '11'}）</li><li>烯醇離子 + ${r[0]}（SN2）→ ${r[1]}–CH(${mal ? 'COOEt' : 'COCH₃'})COOEt</li>${st.two ? `<li>再一次 NaOEt、CH₃I → ${sub}(${tail})COOEt</li>` : ''}<li>H₃O⁺、加熱：酯水解成 β-羰基羧酸，再<b>脫羧</b>（失去 CO₂）</li><li>產物：<b>${mal ? (st.two ? `${r[1]}–CH(CH₃)–COOH` : `${r[1]}–CH₂–COOH`) : (st.two ? `${r[1]}–CH(CH₃)–COCH₃` : `${r[1]}–CH₂–COCH₃`)}</b>　${mal ? r[st.two ? 5 : 3] : r[st.two ? 6 : 4]}</li>`;
      $('#mlN', el).innerHTML = mal ? `丙二酸酯合成＝在 <b>CH₂–COOH</b> 上接 R：產物的碳數 = R 的碳數 + 2。所以要得到辛酸（8 個碳）要用 6 個碳的 1-溴己烷。` : `乙醯乙酸酯合成＝在 <b>CH₂–CO–CH₃</b>（丙酮的一端）上接 R，得到甲基酮：碳數 = R 的碳數 + 3。`;
    }
    pressSeg(el, 'mlS', st.m); pressSeg(el, 'mlT', String(st.two));
    $$('[data-r]', el).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.r === st.r)));
  }
  bindSeg(el, 'mlS', v => { st.m = v; draw(); });
  bindSeg(el, 'mlT', v => { st.two = +v; draw(); });
  $$('[data-r]', el).forEach(b => { b.onclick = () => { st.r = +b.dataset.r; draw(); }; });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 4. 醛醇反應的機構（兩分子乙醛） ===== */
W.aldolmech = el => {
  const base = () => ({ Ca: { x: 0.4, y: -0.1, t: 'CH₂' }, Ha: { x: 0.4, y: -1.25, t: 'H' }, C1: { x: 1.5, y: 0.55, t: 'CH' }, O1: { x: 2.65, y: -0.05, t: 'O', lp: [60, 300] },
    C2: { x: -1.3, y: 0.75, t: 'CH' }, O2: { x: -1.3, y: 2.0, t: 'O', lp: [45, 135] }, M2: { x: -2.55, y: 0.15, t: 'CH₃' }, B: { x: -0.6, y: -2.3, t: 'HO', c: '−', lp: [20] } });
  const frames = () => {
    const F0 = { atoms: base(), bonds: [['Ca', 'Ha', 's'], ['Ca', 'C1', 's'], ['C1', 'O1', 'd'], ['C2', 'O2', 'd'], ['C2', 'M2', 's']],
      arrows: [{ f: { lp: ['B', 20] }, t: { a: 'Ha' }, bend: -0.3 }, { f: { b: ['Ca', 'Ha'] }, t: { m: ['Ca', 'C1'] }, bend: 0.6 }, { f: { b: ['C1', 'O1'] }, t: { a: 'O1' }, bend: -0.6 }], notes: [{ x: 0, y: -3.1, t: '兩分子乙醛 + OH⁻' }] };
    const a1 = base(); Object.assign(a1.O1, { c: '−', lp: [0, 60, 300] }); a1.Ha.hide = 1; Object.assign(a1.B, { t: 'H₂O', c: '', lp: [] });
    const F1 = { atoms: a1, bonds: [['Ca', 'C1', 'd'], ['C1', 'O1', 's'], ['C2', 'O2', 'd'], ['C2', 'M2', 's']],
      arrows: [{ f: { lp: ['O1', 60] }, t: { m: ['O1', 'C1'] }, bend: 0.5 }, { f: { b: ['Ca', 'C1'] }, t: { a: 'C2' }, bend: 0.4 }, { f: { b: ['C2', 'O2'] }, t: { a: 'O2' }, bend: -0.6 }], notes: [{ x: 0, y: -3.1, t: '烯醇離子（親核基）' }] };
    const a2 = base(); a2.Ha.hide = 1; Object.assign(a2.C2, { x: -0.75, y: 0.7 }); Object.assign(a2.O2, { x: -0.75, y: 1.95, c: '−', lp: [0, 90, 180] }); Object.assign(a2.M2, { x: -1.95, y: 0.1 }); Object.assign(a2.B, { t: 'H₂O', c: '', lp: [], x: -2.4, y: 2.3 });
    const F2 = { atoms: a2, bonds: [['Ca', 'C1', 's'], ['C1', 'O1', 'd'], ['Ca', 'C2', 's'], ['C2', 'O2', 's'], ['C2', 'M2', 's']],
      arrows: [{ f: { lp: ['O2', 180] }, t: { a: 'B' }, bend: -0.3 }], notes: [{ x: 0, y: -3.1, t: '烷氧離子' }] };
    const a3 = JSON.parse(JSON.stringify(a2)); Object.assign(a3.O2, { t: 'OH', c: '', lp: [] }); Object.assign(a3.B, { t: 'HO', c: '−', lp: [] });
    const F3 = { atoms: a3, bonds: F2.bonds, notes: [{ x: 0, y: -3.1, t: '3-羥基丁醛（醛醇加成產物）' }] };
    const a4 = JSON.parse(JSON.stringify(a3)); Object.assign(a4.Ca, { t: 'CH' }); a4.O2.hide = 1; a4.B.hide = 1;
    const F4 = { atoms: a4, bonds: [['Ca', 'C1', 's'], ['C1', 'O1', 'd'], ['Ca', 'C2', 'd'], ['C2', 'M2', 's']], notes: [{ x: 0, y: -3.1, t: '2-丁烯醛（α,β-不飽和醛）+ H₂O' }] };
    return [
      { sc: F0, cap: '<b>1. 形成烯醇離子</b>：OH⁻ 拿走 α-H，C–H 的電子推向 C=C，羰基的 π 電子推到 O 上。' },
      { sc: F1, cap: '<b>2. 烯醇離子是親核基</b>：負電荷大部分在 O 上，但反應時用<b>碳端</b>進攻另一分子乙醛的羰基碳，形成新的 C–C 鍵。' },
      { sc: F2, cap: '<b>3. 烷氧離子</b>：和一般親核加成一樣，得到帶負電的 O。' },
      { sc: F3, cap: '<b>4. 質子化</b>：從水拿回 H⁺，得到 <b>β-羥基醛</b>（醛醇，aldol = ald + ol），OH⁻ 再生，所以鹼只需要催化量。' },
      { sc: F4, cap: '<b>5. 加熱脫水</b>：α-H 仍然有酸性，失去 H 和 β 位的 OH（經由烯醇離子，E1cB），生成和羰基<b>共軛</b>的 C=C。這一步讓反應往右推，稱為<b>醛醇縮合</b>。' }];
  };
  const pl = mechPlayer(el, { frames, w: 460, h: 300, s: 50, cy: 140, label: '醛醇反應機構' });
  return { set(s) { pl.go(s.step || 0, false); } };
};

/* ===== 5. 羰基縮合家族 ===== */
W.condtab = el => {
  const D = {
    aldol: ['醛醇縮合', '醛或酮的烯醇離子', '另一分子醛或酮的羰基碳', 'β-羥基羰基 →（加熱）α,β-不飽和羰基', '2 CH₃CHO → CH₃CH(OH)CH₂CHO → CH₃CH=CHCHO', 'NaOH 催化量即可。'],
    cross: ['交叉醛醇（克來森–施密特）', '酮（或醛）的烯醇離子', '<b>沒有 α-H</b> 的醛：苯甲醛、甲醛', 'α,β-不飽和酮', 'C₆H₅CHO + CH₃COCH₃ → C₆H₅CH=CHCOCH₃', '只讓一方能形成烯醇、另一方只能當親電子基，才不會得到四種產物的混合物。'],
    intra: ['分子內醛醇', '同一分子的一端', '同一分子另一端的羰基', '五或六員環的環烯酮', '2,5-己二酮 → 3-甲基-2-環戊烯酮；2,6-庚二酮 → 3-甲基-2-環己烯酮', '可能的環有好幾種時，五員和六員環最有利（張力小）。'],
    claisen: ['克來森縮合', '酯的烯醇離子（NaOEt）', '另一分子酯的羰基碳', '<b>β-酮酯</b>（失去 EtO⁻）', '2 CH₃COOEt → CH₃COCH₂COOEt（乙醯乙酸乙酯）+ EtOH', '產物夾在兩個羰基間的 H（pKa 約 11）會被 EtO⁻ 拿走，這一步推動平衡，所以需要<b>一當量</b>鹼，最後再酸化。酯用和鹼相同的烷氧基，避免轉酯化。'],
    dieck: ['迪克曼縮合', '二酯一端的烯醇離子', '同一分子另一端的酯', '環狀 β-酮酯', '己二酸二乙酯（1,6-二酯）→ 2-氧代環戊烷甲酸乙酯（五員環）；1,7-二酯 → 六員環', '就是分子內的克來森縮合。'],
    michael: ['麥可加成', '穩定的烯醇離子（丙二酸酯、乙醯乙酸酯、β-二酮）、烯胺或 Gilman 試劑', 'α,β-不飽和羰基的 <b>β 碳</b>（共軛加成，1,4-加成）', '1,5-二羰基化合物', 'CH₂(COOEt)₂ + CH₂=CHCOCH₃ → (EtOOC)₂CH–CH₂CH₂COCH₃', 'β 碳因為共振帶部分正電。「軟」的親核基走 1,4-加成；格任亞、有機鋰等「硬」親核基直接加到羰基碳（1,2-加成）。'],
    robinson: ['羅賓森環化', '1,3-二羰基或酮的烯醇離子', '甲基乙烯基酮（MVK）', '新的六員環（環己烯酮）', '2-甲基-1,3-環己二酮 + MVK → 麥可加成 → 分子內醛醇縮合 → 雙環烯酮（類固醇骨架的起點）', '麥可加成 ＋ 分子內醛醇縮合，一次接上一個六員環。'],
    mannich: ['曼尼希反應', '醛或酮的烯醇', '<b>亞胺離子</b>（甲醛 + 二級胺生成）', 'β-胺基羰基（曼尼希鹼）', 'CH₃COCH₃ + HCHO + (CH₃)₂NH → CH₃COCH₂CH₂N(CH₃)₂', '許多生物鹼的生物合成都經過這一步。'],
  };
  let cur = 'aldol';
  el.innerHTML = `${seg('cdS', Object.entries(D).map(([k, v]) => [k, v[0]]), cur)}<table class="tbl" id="cdT"></table><p class="note" id="cdN"></p>`;
  function draw() {
    const d = D[cur];
    $('#cdT', el).innerHTML = `<tbody><tr><th>親核基（誰當烯醇）</th><td>${d[1]}</td></tr><tr><th>親電子基（被攻擊）</th><td>${d[2]}</td></tr><tr><th>產物</th><td>${d[3]}</td></tr><tr><th>例子</th><td>${d[4]}</td></tr></tbody>`;
    $('#cdN', el).innerHTML = `<b>${d[0]}</b>：${d[5]}`;
    pressSeg(el, 'cdS', cur);
  }
  bindSeg(el, 'cdS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.r || cur; draw(); } };
};
