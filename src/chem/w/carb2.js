/* ---------- 後中化學：醛與酮的補充互動圖 ---------- */

/* ===== 1. 丙酮加上不同試劑：產物長什麼樣 =====
   k：'add'（四面體：X 與 Y）、'dbl'（C=Z）、'ch2'（變成 CH₂）、'bv'（拜耳–維利格）、'ac'（環狀縮醛） */
const CMAP = [
  ['NaBH₄（或 LiAlH₄），再 H₃O⁺', 'add', 'H', 'OH', '2-丙醇（二級醇）', '還原：H⁻ 加到羰基碳。醛得一級醇、酮得二級醇。不可逆。'],
  ['CH₃CH₂MgBr，再 H₃O⁺', 'add', 'CH₂CH₃', 'OH', '2-甲基-2-丁醇（三級醇）', '格里納試劑的 R⁻ 加到羰基碳，形成新的 C–C 鍵。甲醛得一級醇、其他醛得二級醇、酮得三級醇。需無水。'],
  ['HCN（CN⁻ 催化）', 'add', 'CN', 'OH', '丙酮氰醇', '多接一個碳；CN 可再水解成 COOH 或還原成 CH₂NH₂。可逆。'],
  ['H₂O', 'add', 'OH', 'OH', '水合物（偕二醇）', '可逆，丙酮的平衡幾乎全在左邊（約 0.1%）；甲醛則幾乎全是水合物。'],
  ['2 CH₃OH，H⁺，去除水', 'add', 'OCH₃', 'OCH₃', '2,2-二甲氧基丙烷（縮醛）', '先成半縮醛，OH 質子化離開後接上第二個 CH₃OH。在鹼中穩定，用來保護羰基；加酸和水即可水解回來。'],
  ['HOCH₂CH₂OH，H⁺', 'ac', '', '', '環狀縮醛（1,3-二氧戊環）', '一分子二醇同時提供兩個 OH，第二步是分子內反應，比用兩分子甲醇更容易形成（熵較有利）。'],
  ['CH₃NH₂（一級胺），pH 約 4–5', 'dbl', 'N–CH₃', '', '亞胺（席夫鹼）', '加成後脫去水，形成 C=N。二級胺（R₂NH）無法形成 C=N⁺–H，改從 α 碳失去 H，生成<b>烯胺</b>。'],
  ['NH₂OH', 'dbl', 'N–OH', '', '肟（oxime）', '和亞胺同理。'],
  ['H₂N–NH₂', 'dbl', 'N–NH₂', '', '腙（hydrazone）', '2,4-二硝基苯肼（2,4-DNP）形成橙黃色沉澱，是檢驗醛酮的方法。'],
  ['Ph₃P=CH₂（維蒂希）', 'dbl', 'CH₂', '', '2-甲基丙烯', 'C=O 直接換成 C=C，雙鍵位置完全確定。副產物是極穩定的 Ph₃P=O。'],
  ['H₂NNH₂, KOH, 加熱（沃爾夫–基希納）', 'ch2', '', '', '丙烷', '先成腙，在強鹼中失去 N₂，C=O 變成 CH₂。克萊門森還原（Zn(Hg)／HCl）在酸中得到相同結果。'],
  ['mCPBA（拜耳–維利格）', 'bv', '', '', '乙酸甲酯', '過氧酸把一個 O 插入羰基碳和一個烷基之間，酮變成酯。遷移能力：三級 > 二級 ≈ 苯基 > 一級 > 甲基。'],
];
W.carbmap = el => {
  let cur = 1;
  el.innerHTML = `<p class="small mut">起始物：丙酮 (CH₃)₂C=O</p><label class="sel">試劑 <select id="cmS">${CMAP.map((r, i) => `<option value="${i}"${i === cur ? ' selected' : ''}>${r[0]}</option>`).join('')}</select></label><div id="cmG"></div><p class="note" id="cmN"></p>`;
  function draw() {
    const [, k, X, Y, nm, why] = CMAP[cur];
    let A = {}, B = [];
    if (k === 'add') { A = { c: { x: 0, y: 0, t: '' }, r1: { x: -1, y: 0, t: 'CH₃' }, r2: { x: 1, y: 0, t: 'CH₃' }, x: { x: 0, y: 1, t: X, hl: 1 }, y: { x: 0, y: -1, t: Y } }; B = [['c', 'r1', 's'], ['c', 'r2', 's'], ['c', 'x', 's'], ['c', 'y', 's']]; }
    if (k === 'dbl') { A = { c: { x: 0, y: 0, t: '' }, r1: { x: -0.87, y: -0.5, t: 'CH₃' }, r2: { x: 0.87, y: -0.5, t: 'CH₃' }, z: { x: 0, y: 1, t: X === 'CH₂' ? 'CH₂' : 'N', hl: 1 } }; B = [['c', 'r1', 's'], ['c', 'r2', 's'], ['c', 'z', 'd']]; if (X.startsWith('N–')) { A.zz = { x: 0.87, y: 1.5, t: X.slice(2) }; B.push(['z', 'zz', 's']); } }
    if (k === 'ch2') { A = { c: { x: 0, y: 0.25, t: '' }, r1: { x: -0.87, y: -0.25, t: '' }, r2: { x: 0.87, y: -0.25, t: '' } }; B = [['c', 'r1', 's'], ['c', 'r2', 's']]; }
    if (k === 'bv') { A = { c: { x: -0.6, y: 0, t: '' }, r1: { x: -1.47, y: -0.5, t: 'CH₃' }, o1: { x: -0.6, y: 1, t: 'O' }, o2: { x: 0.27, y: -0.5, t: 'O', hl: 1 }, r2: { x: 1.14, y: 0, t: 'CH₃' } }; B = [['c', 'r1', 's'], ['c', 'o1', 'd'], ['c', 'o2', 's'], ['o2', 'r2', 's']]; }
    if (k === 'ac') { A = { c: { x: 0, y: -0.3, t: '' }, r1: { x: -1, y: -0.8, t: 'CH₃' }, r2: { x: 1, y: -0.8, t: 'CH₃' }, o1: { x: -0.6, y: 0.5, t: 'O', hl: 1 }, o2: { x: 0.6, y: 0.5, t: 'O', hl: 1 }, a: { x: -0.4, y: 1.4, t: '' }, b: { x: 0.4, y: 1.4, t: '' } }; B = [['c', 'r1', 's'], ['c', 'r2', 's'], ['c', 'o1', 's'], ['c', 'o2', 's'], ['o1', 'a', 's'], ['a', 'b', 's'], ['b', 'o2', 's']]; }
    $('#cmG', el).innerHTML = MOL.svg({ atoms: A, bonds: B }, { w: 420, h: 200, s: 56, label: nm }) + `<p class="small mut" style="text-align:center">${nm}</p>`;
    $('#cmN', el).innerHTML = why;
  }
  $('#cmS', el).onchange = e => { cur = +e.target.value; draw(); };
  draw();
  return { set(s) { cur = s.i ?? cur; $('#cmS', el).value = cur; draw(); } };
};

/* ===== 2. 用格里納試劑合成醇：反推組合 ===== */
const GRIG = {
  mh: ['3-甲基-3-己醇（三級）', ['CH₃', 'CH₂CH₃', 'CH₂CH₂CH₃'], [['3-己酮', 'CH₃MgBr'], ['2-戊酮', 'CH₃CH₂MgBr'], ['2-丁酮', 'CH₃CH₂CH₂MgBr']]],
  b2: ['2-丁醇（二級）', ['H', 'CH₃', 'CH₂CH₃'], [['丙醛', 'CH₃MgBr'], ['乙醛', 'CH₃CH₂MgBr']]],
  tp: ['三苯甲醇（三級）', ['C₆H₅', 'C₆H₅', 'C₆H₅'], [['二苯甲酮', 'C₆H₅MgBr'], ['苯甲酸甲酯（2 當量格里納）', 'C₆H₅MgBr']]],
  pp: ['1-丁醇（一級）', ['H', 'H', 'CH₂CH₂CH₃'], [['甲醛', 'CH₃CH₂CH₂MgBr'], ['環氧乙烷（多兩個碳）', 'CH₃CH₂MgBr']]],
  ba: ['丁酸（羧酸）', [], [['CO₂，再 H₃O⁺', 'CH₃CH₂CH₂MgBr']]],
};
W.grig = el => {
  let cur = 'mh';
  el.innerHTML = `${seg('grS', Object.entries(GRIG).map(([k, v]) => [k, v[0]]), cur)}<div id="grG"></div><div class="cards" id="grK"></div><p class="note" id="grN"></p>`;
  function draw() {
    const [nm, g, R] = GRIG[cur];
    if (g.length) {
      const A = { c: { x: 0, y: 0, t: '' }, o: { x: 0, y: 1.05, t: 'OH', hl: 1 }, a: { x: -1, y: -0.45, t: g[0] }, b: { x: 1, y: -0.45, t: g[1] }, d: { x: 0, y: -1.1, t: g[2] } };
      $('#grG', el).innerHTML = MOL.svg({ atoms: A, bonds: [['c', 'o', 's'], ['c', 'a', 's'], ['c', 'b', 's'], ['c', 'd', 's']] }, { w: 420, h: 200, s: 62, label: nm });
    } else $('#grG', el).innerHTML = '<p class="eq">R–MgBr + O=C=O → R–COO⁻ MgBr⁺ → (H₃O⁺) R–COOH</p>';
    $('#grK', el).innerHTML = R.map(([c, m], i) => card('g' + i, `組合 ${i + 1}`, `${c} + ${m}`)).join('');
    $('#grN', el).innerHTML = g.length ? `反推的方法：接 OH 的碳上有幾個不同的 C 基團，就有幾種切法——把其中一個 C–C 鍵切開，那個基團來自格里納試劑，剩下的部分是羰基化合物。${nm} 有 <b>${R.length} 種</b>組合。格里納試劑也會和酯反應兩次（第一次脫去 OR 變成酮，再加一次），所以兩個相同基團的三級醇也能由酯製得。` : '格里納試劑加到 CO₂ 上，酸化後得到多一個碳的羧酸。';
    pressSeg(el, 'grS', cur);
  }
  bindSeg(el, 'grS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.t || cur; draw(); } };
};

/* ===== 3. 醛與酮的檢驗 ===== */
const CTEST = [['托倫斯試劑 Ag(NH₃)₂⁺', '銀鏡', 'ald'], ['斐林／本氏試劑 Cu²⁺', '磚紅色 Cu₂O', 'aliald'], ['2,4-DNP', '橙黃色沉澱', 'co'], ['碘仿試驗 I₂／NaOH', '黃色 CHI₃', 'me']];
const CTC = {
  ethanal: ['乙醛 CH₃CHO', { ald: 1, aliald: 1, co: 1, me: 1 }],
  acetone: ['丙酮 CH₃COCH₃', { ald: 0, aliald: 0, co: 1, me: 1 }],
  benz: ['苯甲醛 C₆H₅CHO', { ald: 1, aliald: 0, co: 1, me: 0 }],
  pent3: ['3-戊酮', { ald: 0, aliald: 0, co: 1, me: 0 }],
  etoh: ['乙醇', { ald: 0, aliald: 0, co: 0, me: 1 }],
  ipr: ['2-丙醇', { ald: 0, aliald: 0, co: 0, me: 1 }],
  glu: ['葡萄糖', { ald: 1, aliald: 1, co: 0, me: 0 }],
};
W.ctest = el => {
  let cur = 'acetone';
  el.innerHTML = `${seg('ctS', Object.entries(CTC).map(([k, v]) => [k, v[0]]), cur)}<div class="cards" id="ctK"></div><p class="note" id="ctN"></p>`;
  function draw() {
    const [nm, r] = CTC[cur];
    $('#ctK', el).innerHTML = CTEST.map(([t, ob, k]) => card(r[k] ? 'ok' : 'no', t, r[k] ? `✓ ${ob}` : '✗ 無')).join('');
    $('#ctN', el).innerHTML = `<b>${nm}</b>。托倫斯與斐林／本氏試劑是<b>氧化劑</b>，只和容易被氧化的醛反應；斐林試劑不和芳香醛反應。葡萄糖等還原糖在鹼中開環有醛基，所以呈陽性；但它主要以環狀半縮醛存在，和 2,4-DNP 的反應不明顯。2,4-DNP 和所有醛酮形成腙。碘仿試驗檢驗 CH₃CO– 或能被氧化成它的 CH₃CH(OH)–，所以乙醇、2-丙醇也呈陽性，而 3-戊酮、苯甲醛不會。`;
    pressSeg(el, 'ctS', cur);
  }
  bindSeg(el, 'ctS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};
