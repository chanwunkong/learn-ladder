/* ---------- 後中化學：醛與酮的互動圖 ---------- */

/* ===== 1. 親核加成：選親核基 ===== */
W.nucadd = el => {
  const NU = {
    h: { n: 'NaBH₄（H⁻）', nu: 'H', nuc: '−', sub: ['CH₃', 'CH₃'], prod: '2-丙醇（二級醇）', note: '硼氫化鈉提供氫負離子 H⁻，把酮還原成二級醇；醛則還原成一級醇。' },
    me: { n: 'CH₃MgBr（格里納）', nu: 'CH₃', nuc: '−', sub: ['CH₃', 'CH₃'], prod: '2-甲基-2-丙醇（三級醇）', note: '格里納試劑的 C–Mg 鍵極性很大，碳帶負電，像碳負離子一樣進攻。這是形成新 C–C 鍵最重要的方法之一：甲醛 → 一級醇、其他醛 → 二級醇、酮 → 三級醇。' },
    cn: { n: 'HCN（CN⁻）', nu: 'CN', nuc: '−', sub: ['CH₃', 'CH₃'], prod: '丙酮氰醇', note: 'CN⁻ 進攻後質子化得到氰醇。這一步可逆；氰醇的 CN 之後可以水解成 COOH，等於多接一個碳。' },
  };
  let cur = 'h', pl;
  el.innerHTML = `${seg('naS', Object.entries(NU).map(([k, v]) => [k, v.n]), cur)}<div id="naP"></div>`;
  const frames = () => {
    const d = NU[cur], base = { C: { x: 0, y: 0, t: 'C' }, R1: { x: -1.05, y: -0.65, t: d.sub[0] }, R2: { x: 1.05, y: -0.65, t: d.sub[1] } };
    const F0 = { atoms: { ...base, C: { ...base.C, c: 'δ+' }, O: { x: 0, y: 1.25, t: 'O', c: 'δ−', lp: [45, 135] }, N: { x: -2.4, y: 0.2, t: d.nu, c: '−', lp: d.nu === 'H' || d.nu === 'CH₃' ? [] : [0] } }, bonds: [['C', 'R1', 's'], ['C', 'R2', 's'], ['C', 'O', 'd']],
      arrows: [{ f: d.nu === 'CN' ? { lp: ['N', 0] } : { lp: ['N', 0] }, t: { a: 'C' }, bend: -0.3 }, { f: { b: ['C', 'O'] }, t: { a: 'O' }, bend: -0.8 }], notes: [{ x: 0, y: -1.7, t: '丙酮（平面，sp²）' }] };
    const F1 = { atoms: { ...base, R1: { x: -0.95, y: -0.75, t: d.sub[0] }, R2: { x: 0.95, y: -0.75, t: d.sub[1] }, O: { x: 0.35, y: 1.2, t: 'O', c: '−', lp: [0, 90, 150] }, N: { x: -1.15, y: 0.45, t: d.nu }, Hs: { x: 2.0, y: 1.75, t: 'H₃O⁺' } }, bonds: [['C', 'R1', 's'], ['C', 'R2', 'w'], ['C', 'O', 's'], ['C', 'N', 's']],
      arrows: [{ f: { lp: ['O', 0] }, t: { a: 'Hs' }, bend: -0.3 }], notes: [{ x: 0, y: -1.7, t: '四面體的烷氧離子（sp³）' }] };
    const F2 = { atoms: { ...F1.atoms, O: { x: 0.35, y: 1.2, t: 'OH', lp: [] }, Hs: { x: 2.0, y: 1.75, t: 'H₂O' } }, bonds: F1.bonds, notes: [{ x: 0, y: -1.7, t: d.prod }] };
    return [
      { sc: F0, cap: 'C=O 的電子偏向 O，碳帶部分正電，而且是平面的，上下兩面都沒有遮擋。親核基的電子對攻擊羰基碳，同時 π 電子被推到 O 上。' },
      { sc: F1, cap: '碳從平面的 sp² 變成四面體的 sp³，O 帶負電（烷氧離子）。這就是<b>親核加成</b>：加上去，不是取代。' },
      { sc: F2, cap: `加酸處理，O 接上 H⁺，得到${d.prod}。${d.note}` }];
  };
  pl = mechPlayer($('#naP', el), { frames, w: 460, h: 230, s: 54, label: '親核加成' });
  bindSeg(el, 'naS', v => { cur = v; pressSeg(el, 'naS', v); pl.reset(); });
  return { set(s) { if (s.nu) { cur = s.nu; pressSeg(el, 'naS', cur); pl.reset(); } pl.go(s.step || 0, false); } };
};

/* ===== 2. 醛 vs 酮：水合的程度 ===== */
W.hydrate = el => {
  const D = [['甲醛 HCHO', 99.9, '兩邊都是 H：最空、羰基碳最缺電子。'], ['乙醛 CH₃CHO', 50, '一個甲基：推電子讓羰基碳較不缺電子，也較擋路。'], ['丙酮 (CH₃)₂CO', 0.1, '兩個甲基：推電子更多、更擠；而且加成後四個基團擠在一起。'], ['六氟丙酮 (CF₃)₂CO', 99.9, 'CF₃ 強烈拉電子，羰基碳非常缺電子，幾乎完全水合。']];
  let cur = 1;
  el.innerHTML = `<p class="eq">R₂C=O + H₂O ⇌ R₂C(OH)₂（水合物）</p><div class="bars pk" id="hyB"></div><p class="small mut">水溶液中以水合物形式存在的比例（約略值）</p><p class="note" id="hyN"></p>`;
  function draw() {
    $('#hyB', el).innerHTML = D.map(([n, p], i) => `<div class="${i === cur ? 'on' : ''}" data-i="${i}" role="button" tabindex="0"><span>${n}</span><i class="ba" style="width:${Math.max(1, p)}%"></i><b class="mono">${p}%</b></div>`).join('');
    $$('[data-i]', el).forEach(d => { d.onclick = d.onkeydown = e => { if (e.type === 'keydown' && e.key !== 'Enter') return; cur = +d.dataset.i; draw(); }; });
    $('#hyN', el).innerHTML = `<b>${D[cur][0]}</b>：${D[cur][2]} 兩個原因讓醛比酮活潑：<b>立體</b>（H 比烷基小，進攻和生成的四面體都比較不擠）與<b>電子</b>（烷基推電子，降低羰基碳的正電性）。`;
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 3. 羰基反應總整理 ===== */
W.carbtable = el => {
  const R = [
    ['NaBH₄ 或 LiAlH₄，再加 H₃O⁺', 'H⁻', '醇（醛→一級、酮→二級）', '不可逆', '還原。LiAlH₄ 更強，也能還原酯與羧酸。'],
    ['RMgBr（格里納），再加 H₃O⁺', 'R⁻', '醇（多接一個碳）', '不可逆', '形成 C–C 鍵。格里納遇水、醇、酸會被破壞，要在無水乙醚中進行。'],
    ['HCN／CN⁻', 'CN⁻', '氰醇', '可逆', '多接一個碳，CN 可再水解成 COOH。'],
    ['H₂O（酸或鹼催化）', 'H₂O', '水合物（偕二醇）', '可逆', '通常平衡偏向羰基，甲醛例外。'],
    ['2 ROH，酸催化，去除水', 'ROH', '縮醛（R₂C(OR)₂）', '可逆', '先成半縮醛，再取代掉 OH。縮醛在鹼中穩定，常用來<b>保護</b>羰基；加酸與水即可還原。醣類的環狀結構就是分子內的半縮醛。'],
    ['RNH₂（一級胺），弱酸（pH 約 4–5）', 'RNH₂', '亞胺（C=N–R）', '可逆', '加成後脫去水。pH 太低胺被質子化失去親核性，太高則 OH 無法質子化離開，所以有最適 pH。'],
    ['Ph₃P=CHR（維蒂希）', '磷葉立德', '烯（C=O 換成 C=CHR）', '不可逆', '雙鍵的位置完全確定，是合成烯的重要方法。'],
  ];
  let cur = 0;
  el.innerHTML = `<div class="tscroll"><table class="tbl sel-tbl" id="ctT"><thead><tr><th>試劑</th><th>親核基</th><th>產物</th><th>可逆？</th></tr></thead><tbody>${R.map((r, i) => `<tr data-i="${i}" tabindex="0"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div><p class="note" id="ctN"></p>`;
  function draw() { $$('#ctT tbody tr', el).forEach((t, i) => t.classList.toggle('on', i === cur)); $('#ctN', el).innerHTML = `<b>${R[cur][2]}</b>：${R[cur][4]}`; }
  $$('#ctT tbody tr', el).forEach(t => { t.onclick = t.onkeydown = e => { if (e.type === 'keydown' && e.key !== 'Enter') return; cur = +t.dataset.i; draw(); }; });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 4. α-氫的酸性與烯醇離子 ===== */
W.alphaH = el => {
  const D = [['丙烷的 C–H', 50, '一般烷基的 C–H：負電荷只能待在碳上。'], ['乙炔的 C–H', 25, 'sp 軌域的 s 性質高。'], ['丙酮的 α-H', 19.3, '拿走 α-H 後，負電荷可以共振到 O 上（烯醇離子），所以比一般 C–H 酸 30 個數量級。'], ['乙醯乙酸乙酯的 α-H（兩個羰基之間）', 10.7, '負電荷可以分散到兩個 O 上，更穩定。'], ['2,4-戊二酮的 α-H', 9, '兩個酮基夾著的 CH₂，酸性和酚差不多。']];
  let cur = 2;
  el.innerHTML = `<div class="bars pk" id="ahB"></div><p class="small mut">長條越長 = 越酸（pKa 越小）</p><p class="note" id="ahN"></p>`;
  function draw() {
    $('#ahB', el).innerHTML = D.map(([n, p], i) => `<div class="${i === cur ? 'on' : ''}" data-i="${i}" role="button" tabindex="0"><span>${n}</span><i class="ba" style="width:${6 + 94 * (52 - p) / 44}%"></i><b class="mono">pKa ${p}</b></div>`).join('');
    $$('[data-i]', el).forEach(d => { d.onclick = d.onkeydown = e => { if (e.type === 'keydown' && e.key !== 'Enter') return; cur = +d.dataset.i; draw(); }; });
    $('#ahN', el).innerHTML = `<b>${D[cur][0]}</b>：${D[cur][2]}`;
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};
