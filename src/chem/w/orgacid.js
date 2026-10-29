/* ---------- 後中化學：有機酸鹼的互動圖 ---------- */

/* ===== 1. 苯環取代基的位置與 pKa =====
   數值：CRC Handbook of Chemistry and Physics（25 °C 水溶液），取到小數點後兩位的約略值 */
const SUBP = {
  phenol: { n: '取代酚 X–C₆H₄OH', p0: 9.99, y: [6.5, 11], d: { NO2: [7.23, 8.36, 7.15], Cl: [8.56, 9.12, 9.41], CH3: [10.29, 10.09, 10.26], OCH3: [9.98, 9.65, 10.21] } },
  benzoic: { n: '取代苯甲酸 X–C₆H₄COOH', p0: 4.20, y: [1.5, 5], d: { NO2: [2.17, 3.45, 3.44], Cl: [2.94, 3.83, 3.99], CH3: [3.91, 4.27, 4.37], OCH3: [4.09, 4.09, 4.47], OH: [2.97, 4.06, 4.58] } },
  anil: { n: '取代苯胺的共軛酸 X–C₆H₄NH₃⁺', p0: 4.63, y: [-1, 6], d: { NO2: [-0.26, 2.47, 1.00], Cl: [2.66, 3.52, 3.98], CH3: [4.44, 4.73, 5.08], OCH3: [4.52, 4.23, 5.34] } },
};
const SUBN = { NO2: 'NO₂', Cl: 'Cl', CH3: 'CH₃', OCH3: 'OCH₃', OH: 'OH' };
const SUBWHY = {
  NO2: ['拉電子：誘導效應在三個位置都有；在鄰、對位還能以共振把負電荷拉到 NO₂ 的 O 上，所以鄰、對位的影響比間位大得多。', '間位不能共振，只剩誘導效應。'],
  Cl: ['Cl 的誘導效應拉電子，距離越近越強（鄰 > 間 > 對）；在鄰、對位它的孤對電子還會以共振稍微推回電子，所以對位影響最小。', ''],
  CH3: ['甲基微弱地推電子，讓負電荷較不穩定，酸性稍弱（pKa 稍大）。', ''],
  OCH3: ['OCH₃ 在鄰、對位以共振推電子（O 的孤對電子進入苯環），酸性變弱；在間位不能共振，只剩 O 的誘導拉電子，酸性反而變強。', ''],
  OH: ['OH 和 OCH₃ 一樣：對位共振推電子，酸性變弱；間位只有誘導拉電子。鄰位的水楊酸特別強，因為羧酸根和相鄰的 OH 形成分子內氫鍵。', ''],
};
W.subst = el => {
  const st = { p: 'phenol', x: 'NO2' };
  el.innerHTML = `${seg('suP', Object.entries(SUBP).map(([k, v]) => [k, v.n]), st.p)}<div class="seg" id="suX" role="group"></div><div id="suG"></div><p class="small mut">25 °C 水溶液的 pKa（CRC Handbook 約略值）。虛線是沒有取代基的母體。</p><p class="note" id="suN"></p>`;
  function draw() {
    const P = SUBP[st.p]; if (!P.d[st.x]) st.x = 'NO2';
    $('#suX', el).innerHTML = Object.keys(P.d).map(k => `<button type="button" data-v="${k}" aria-pressed="${k === st.x}">${SUBN[k]}</button>`).join('');
    $$('#suX button', el).forEach(b => { b.onclick = () => { st.x = b.dataset.v; draw(); }; });
    const v = P.d[st.x], cats = ['鄰位 (o)', '間位 (m)', '對位 (p)'], step = (P.y[1] - P.y[0]) > 5 ? 1 : 0.5;
    const yt = []; for (let t = Math.ceil(P.y[0] / step) * step; t <= P.y[1]; t += step) yt.push(+t.toFixed(1));
    $('#suG', el).innerHTML = chart({ x: [0, 3], y: P.y, yt, ylab: 'pKa', h: 260, label: 'pKa 與取代位置' }, (X, Y) => {
      let s = `<line x1="${X(0)}" x2="${X(3)}" y1="${Y(P.p0)}" y2="${Y(P.p0)}" style="stroke:var(--muted);stroke-dasharray:5 4"/><text class="tk" x="${X(3) - 4}" y="${Y(P.p0) - 6}" text-anchor="end">母體 ${P.p0}</text>`;
      v.forEach((p, i) => { const x = X(i + 0.5), up = p > P.p0; s += `<rect x="${x - 22}" y="${Math.min(Y(p), Y(P.p0))}" width="44" height="${Math.max(2, Math.abs(Y(p) - Y(P.p0)))}" style="fill:${up ? 'var(--base)' : 'var(--acid)'};opacity:.85"/><text class="tk" x="${x}" y="${up ? Y(p) - 6 : Y(p) + 15}" text-anchor="middle">${p.toFixed(2)}</text><text class="tk" x="${x}" y="${Y(P.y[0]) + 16}" text-anchor="middle">${cats[i]}</text>`; });
      return s;
    });
    const strong = v.indexOf(Math.min(...v));
    $('#suN', el).innerHTML = `${SUBWHY[st.x][0]}${SUBWHY[st.x][1] ? ' ' + SUBWHY[st.x][1] : ''}<br>${st.p === 'anil' ? 'pKa 越小，表示共軛酸越強、<b>苯胺本身的鹼性越弱</b>：拉電子基讓 N 的孤對電子更不願意接 H⁺。' : `向下的長條表示酸性變強。此組最強的是<b>${cats[strong]}</b>。`}${st.p === 'benzoic' ? ' 苯甲酸有「鄰位效應」：幾乎任何鄰位取代基（連 CH₃ 也是）都讓酸性變強，因為 COOH 被擠出苯環平面。' : ''}`;
    pressSeg(el, 'suP', st.p);
  }
  bindSeg(el, 'suP', v => { st.p = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. 選哪個鹼才拿得走這個 H =====
   pKa 主要採 OpenStax《Organic Chemistry》（McMurry）與 Evans pKa 表的約略值 */
const DPA = [
  ['乙醯丙酮 CH₃COCH₂COCH₃', 9, '負電荷可以共振到兩個 C=O 的 O 上。'],
  ['丙二酸二乙酯 CH₂(COOEt)₂', 13, '兩個酯基共振；酯的 OR 推電子，C=O 接受負電荷的能力比酮弱，所以比乙醯丙酮弱。'],
  ['環戊二烯 C₅H₆', 16, '共軛鹼是 6 個 π 電子、平面、環狀共軛的芳香陰離子，特別穩定，是最酸的烴之一。'],
  ['乙醇 CH₃CH₂OH', 16, '負電荷在電負度大的 O 上，但沒有共振。'],
  ['丙酮 CH₃COCH₃（α-H）', 19.3, '負電荷共振到一個 C=O 的 O 上（烯醇離子）。'],
  ['乙炔 HC≡CH', 25, '負電荷在 sp 軌域，s 性質 50%，靠近原子核。'],
  ['乙酸乙酯（α-H）', 25, '只有一個 C=O，而且 OR 推電子，比酮的 α-H 弱。'],
  ['三苯甲烷 (C₆H₅)₃CH', 31.5, '負電荷共振分散到三個苯環。'],
  ['氨 NH₃', 35, 'N 的電負度比 O 小，負電荷較不穩定。'],
  ['甲苯 C₆H₅CH₃', 41, '苄基陰離子可以共振到苯環，但苯環接受負電荷的能力遠不如 C=O。'],
  ['乙烷 CH₃CH₃', 50, 'sp³ 碳、沒有共振，幾乎不酸。'],
];
const DPB = [
  ['吡啶', 5.2, '吡啶鎓'], ['NaHCO₃', 6.35, 'H₂CO₃'], ['NaOH', 15.7, 'H₂O'], ['NaOEt', 16, '乙醇'], ['t-BuOK', 18, 't-BuOH'],
  ['NaH', 35, 'H₂（氣體逸出，不可逆）'], ['NaNH₂', 35, 'NH₃'], ['LDA', 36, '二異丙基胺'], ['n-BuLi', 50, '丁烷'],
];
W.deprot = el => {
  let ia = 4;
  el.innerHTML = `<label class="sel">要拿走的 H <select id="dpA">${DPA.map((a, i) => `<option value="${i}"${i === ia ? ' selected' : ''}>${a[0]}（pKa ${a[1]}）</option>`).join('')}</select></label><div id="dpG"></div><div class="cards" id="dpK"></div><p class="note" id="dpN"></p>`;
  function draw() {
    const A = DPA[ia];
    $('#dpG', el).innerHTML = chart({ x: [0, 55], y: [0, 10], xt: [0, 10, 20, 30, 40, 50], xlab: 'pKa（鹼的位置 = 共軛酸的 pKa）', h: 250, label: '去質子化' }, (X, Y) => {
      let s = `<line x1="${X(A[1])}" x2="${X(A[1])}" y1="${Y(10)}" y2="${Y(0)}" style="stroke:var(--acid);stroke-width:2"/><text class="tk" x="${X(A[1])}" y="${Y(9.4)}" text-anchor="${A[1] > 40 ? 'end' : 'start'}" dx="${A[1] > 40 ? -4 : 4}" style="fill:var(--acid)">要拿走的 H：pKa ${A[1]}</text>`;
      s += `<rect x="${X(A[1])}" y="${Y(8.6)}" width="${X(55) - X(A[1])}" height="${Y(0) - Y(8.6)}" style="fill:var(--good, #23704A);opacity:.08"/>`;
      DPB.forEach(([n, p], j) => { const ok = p > A[1] + 1, y = Y(1 + (j % 4) * 2); const lf = p > 45 || (p < A[1] && A[1] - p < 9); s += `<circle cx="${X(p)}" cy="${y}" r="6" style="fill:${ok ? '#23704A' : 'var(--muted)'}"/><text class="tk" x="${X(p) + (lf ? -9 : 9)}" y="${y + 4}" text-anchor="${lf ? 'end' : 'start'}" style="fill:${ok ? '#23704A' : 'var(--muted)'}">${n}</text>`; });
      return s;
    });
    const ok = DPB.filter(b => b[1] > A[1] + 1).map(b => b[0]), no = DPB.filter(b => b[1] <= A[1] + 1).map(b => b[0]);
    $('#dpK', el).innerHTML = card('a', '能幾乎完全拿走', ok.join('、') || '（都不行）') + card('b', '不夠強', no.join('、') || '（無）');
    $('#dpN', el).innerHTML = `<b>${A[0]}</b>：${A[2]}<br>綠色區域內的鹼，共軛酸的 pKa 比要拿走的 H 大，平衡偏向產物（差 1 就是 10 倍）。所以在 THF 中鹼性 n-BuLi > LDA > t-BuOK > 吡啶。NaH 的共軛酸是 H₂，生成後以氣體離開，反應不可逆；鈉金屬 Na 和醇是氧化還原反應（2ROH + 2Na → 2RONa + H₂），也不可逆。NaOH 和乙醇的 pKa 幾乎相同，只能得到平衡混合物。`;
  }
  $('#dpA', el).onchange = e => { ia = +e.target.value; draw(); };
  draw();
  return { set(s) { ia = s.a ?? ia; $('#dpA', el).value = ia; draw(); } };
};

/* ===== 3. 用酸鹼萃取分離混合物 =====
   [名稱, 類別（a 酸 b 鹼 n 中性）, pKa（鹼為共軛酸的 pKa）] */
const EXCMP = [['苯甲酸', 'a', 4.2], ['4-羥基苯甲醛', 'a', 7.6], ['酚', 'a', 10.0], ['苯胺', 'b', 4.6], ['萘', 'n', 0]];
const EXW = { w: ['水', 7], bic: ['5% NaHCO₃', 6.35], oh: ['1 M NaOH', 15.7], hcl: ['1 M HCl', -1.7] };
W.extract = el => {
  let cur = 'bic';
  el.innerHTML = `${seg('exS', Object.entries(EXW).map(([k, v]) => [k, v[0]]), cur)}<div id="exG"></div><p class="note" id="exN"></p>`;
  function where(c) {
    const [, t, p] = c, [, q] = EXW[cur];
    if (cur === 'w') return 0;
    if (t === 'a' && cur !== 'hcl') return q > p + 1 ? 1 : 0;
    if (t === 'b' && cur === 'hcl') return 1;
    return 0;
  }
  function draw() {
    const top = [], bot = [];
    EXCMP.forEach(c => (where(c) ? bot : top).push(c));
    const ion = c => c[1] === 'a' ? c[0] + '⁻（鹽）' : c[0] + 'H⁺（鹽）';
    const row = (arr, y, f) => arr.map((c, i) => `<text class="tk" x="${220}" y="${y + i * 20}" text-anchor="middle" style="font-size:13px;fill:var(--ink)">${f(c)}</text>`).join('');
    $('#exG', el).innerHTML = `<svg class="en" viewBox="0 0 440 300" style="max-width:440px;margin:auto" role="img" aria-label="分液漏斗"><path d="M120 20 H320 V170 L240 250 V290 H200 V250 L120 170 Z" style="fill:none;stroke:var(--ink);stroke-width:2"/><path d="M121 30 H319 V110 H121 Z" style="fill:#E9A23B;opacity:.18"/><path d="M121 110 H319 V170 L240 249 H200 L121 170 Z" style="fill:#3B7BE9;opacity:.16"/><text class="tk" x="330" y="70">乙醚層（上）</text><text class="tk" x="330" y="160">水層（下）</text>${row(top, 52, c => c[0])}${row(bot, 132, ion)}</svg>`;
    $('#exN', el).innerHTML = `${EXW[cur][0]}：${cur === 'w' ? '中性的有機分子都留在乙醚層，無法分離。' : cur === 'hcl' ? '只有鹼（苯胺）被質子化成銨鹽，溶進水層。' : `只有 pKa 比 ${EXW[cur][1]}（鹼的共軛酸）小的酸會被拿走 H⁺，變成帶電的鹽溶進水層。`}帶電的離子溶於水，中性分子溶於有機溶劑：這就是<b>酸鹼萃取</b>。所以 NaHCO₃ 能把羧酸和酚分開（只拿走羧酸的 H），NaOH 則把兩者都拉進水層。水層再加酸，就能把酸沉澱回收。`;
    pressSeg(el, 'exS', cur);
  }
  bindSeg(el, 'exS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};
