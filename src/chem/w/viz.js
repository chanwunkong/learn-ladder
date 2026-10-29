/* ---------- 後中化學：把文字段落改成圖的補充互動圖 ---------- */

/* ===== 1. 烯醇的比例（log 尺度） =====
   平衡時烯醇所佔百分比的約略值（純液體或非極性溶劑） */
const ENP = [['丙酮', 1e-7, '一個 C=O，沒有額外穩定'], ['環己酮', 1e-4, '烯醇的 C=C 在環內，稍有利'], ['乙醯乙酸乙酯', 8, '烯醇與酯的 C=O 共軛並形成分子內氫鍵，但酯的 C=O 接受能力較弱'], ['2,4-戊二酮（乙醯丙酮）', 76, '烯醇與另一個 C=O 共軛，並形成六員環的分子內氫鍵'], ['酚', 99.99, '「烯醇」形式是芳香環，酮式會失去芳香性']];
W.enolpct = el => {
  let cur = 3;
  el.innerHTML = `<div id="enG"></div><p class="note" id="enN"></p>`;
  function draw() {
    $('#enG', el).innerHTML = chart({ x: [-8, 2.2], y: [0, ENP.length], xt: [-8, -6, -4, -2, 0, 2], xlab: 'log（烯醇 %）：0 = 1%、2 = 100%', h: 240, label: '烯醇比例' }, (X, Y) => ENP.map(([n, p], i) => { const y = Y(ENP.length - i - 0.5), lp = Math.log10(p); return `<g data-i="${i}" style="cursor:pointer"><rect x="${X(-8)}" y="${y - 11}" width="${X(lp) - X(-8)}" height="22" style="fill:var(--c1);opacity:${i === cur ? 1 : 0.5}"/><text class="tk" x="${X(-8) + 6}" y="${y + 4}" style="fill:#fff">${n}</text></g>`; }).join(''));
    $$('#enG [data-i]', el).forEach(g => { g.onclick = () => { cur = +g.dataset.i; draw(); }; });
    const [n, p, w] = ENP[cur];
    $('#enN', el).innerHTML = `<b>${n}</b>：烯醇約 ${p < 0.01 ? p.toExponential(0) : p}%。${w}。烯醇比例取決於烯醇能不能被額外穩定：共軛、分子內氫鍵、芳香性。在極性、能形成氫鍵的溶劑（水）中，分子內氫鍵被溶劑取代，1,3-二羰基的烯醇比例會下降；在氣態或非極性溶劑中最高。（約略值）`;
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 2. 合成順序：先放誰？ ===== */
const SYNO = {
  mbn: ['間溴硝基苯', [['① HNO₃／H₂SO₄', '硝基苯（NO₂ 是間位定位基）'], ['② Br₂／FeBr₃', '間溴硝基苯 ✓']], [['① Br₂／FeBr₃', '溴苯（Br 是鄰對位定位基）'], ['② HNO₃／H₂SO₄', '鄰、對溴硝基苯 ✗']]],
  pbn: ['對溴硝基苯', [['① Br₂／FeBr₃', '溴苯（鄰對位定位）'], ['② HNO₃／H₂SO₄', '對溴硝基苯（分離掉鄰位） ✓']], [['① HNO₃／H₂SO₄', '硝基苯'], ['② Br₂／FeBr₃', '間溴硝基苯 ✗']]],
  mbe: ['間溴乙苯', [['① CH₃COCl／AlCl₃', '苯乙酮（間位定位）'], ['② Br₂／FeBr₃', '間溴苯乙酮'], ['③ Zn(Hg)／HCl', '間溴乙苯 ✓']], [['① CH₃CH₂Cl／AlCl₃', '乙苯（鄰對位）'], ['② Br₂／FeBr₃', '鄰、對溴乙苯 ✗']]],
  mba: ['間溴苯胺', [['① HNO₃／H₂SO₄', '硝基苯'], ['② Br₂／FeBr₃', '間溴硝基苯'], ['③ Fe／HCl', '間溴苯胺 ✓']], [['① HNO₃／H₂SO₄', '硝基苯'], ['② Fe／HCl', '苯胺（強活化）'], ['③ Br₂', '2,4,6-三溴苯胺 ✗']]],
  pnba: ['對硝基苯甲酸', [['① CH₃Cl／AlCl₃', '甲苯'], ['② HNO₃／H₂SO₄', '對硝基甲苯'], ['③ KMnO₄, 熱', '對硝基苯甲酸 ✓']], [['① CH₃Cl／AlCl₃', '甲苯'], ['② KMnO₄, 熱', '苯甲酸（間位定位）'], ['③ HNO₃／H₂SO₄', '間硝基苯甲酸 ✗']]],
};
W.synorder = el => {
  const st = { t: 'mbe', r: 0 };
  el.innerHTML = `${seg('soT', Object.entries(SYNO).map(([k, v]) => [k, v[0]]), st.t)}${seg('soR', [['0', '順序 A'], ['1', '順序 B']], '0')}<div class="oxpath" id="soP"></div><p class="note" id="soN"></p>`;
  function draw() {
    const [nm, a, b] = SYNO[st.t], R = st.r ? b : a, ok = R[R.length - 1][1].includes('✓');
    $('#soP', el).innerHTML = ['苯', ...R.map(([r, p]) => `<small>${r}</small><br>${p}`)].map((x, i, arr) => `<span class="oxs${i === arr.length - 1 ? ' end' : ''}">${x}</span>`).join('<span class="oxa">→</span>');
    $('#soN', el).innerHTML = `目標：<b>${nm}</b>。${ok ? '這個順序可以：每一步都由當時環上已有的取代基決定新基團的位置。' : '這個順序得不到目標：第一個放上去的取代基把下一個基團導到錯的位置（或讓環太活化、太鈍化）。'}原則：要間位關係就先放間位定位基；要鄰、對位就先放鄰對位定位基；需要的取代基如果定位不對，就先放一個「之後能轉換」的基團（醯基 → 烷基、硝基 → 胺基、甲基 → 羧基）。`;
    pressSeg(el, 'soT', st.t); pressSeg(el, 'soR', String(st.r));
  }
  bindSeg(el, 'soT', v => { st.t = v; draw(); });
  bindSeg(el, 'soR', v => { st.r = +v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. [3,3] σ 遷移：哪根鍵斷、哪根鍵生成 ===== */
W.sigma = el => {
  const st = { k: 'claisen', p: 0 };
  el.innerHTML = `${seg('sgK', [['claisen', '克萊森（烯丙基乙烯基醚）'], ['cope', '柯普（1,5-己二烯）']], st.k)}${seg('sgP', [['0', '反應前'], ['1', '過渡狀態'], ['2', '產物']], '0')}<div id="sgG"></div><p class="note" id="sgN"></p>`;
  const P = [[-1.3, 0.75], [-1.3, -0.75], [0, -1.5], [1.3, -0.75], [1.3, 0.75], [0, 1.5]];   // 1..6 的位置（環狀排列）
  function draw() {
    const cl = st.k === 'claisen', lab = ['C1', 'C2', cl ? 'O3' : 'C3', 'C4', 'C5', 'C6'];
    const atoms = {};
    P.forEach(([x, y], i) => { atoms['a' + i] = { x, y, t: cl && i === 2 ? 'O' : '' }; atoms['n' + i] = { x: x * 1.45, y: y * 1.35, t: `<tspan class="cnum">${i + 1}</tspan>` }; });
    // 鍵：1-2、2-3、3-4、4-5、5-6；新鍵 1-6；斷鍵 3-4
    const B = st.p === 0 ? [['a0', 'a1', 'd'], ['a1', 'a2', 's'], ['a2', 'a3', 's'], ['a3', 'a4', 's'], ['a4', 'a5', 'd']]
      : st.p === 1 ? [['a0', 'a1', 'sd'], ['a1', 'a2', 'sd'], ['a2', 'a3', 'p'], ['a3', 'a4', 'sd'], ['a4', 'a5', 'sd'], ['a5', 'a0', 'p']]
      : [['a0', 'a1', 's'], ['a1', 'a2', 'd'], ['a3', 'a4', 'd'], ['a4', 'a5', 's'], ['a5', 'a0', 's']];
    $('#sgG', el).innerHTML = MOL.svg({ atoms, bonds: B }, { w: 420, h: 320, s: 62, label: '[3,3] 遷移' });
    $('#sgN', el).innerHTML = `${['六個原子排成一圈（椅式過渡狀態的投影）。原本 ' + lab[2] + '–' + lab[3] + ' 之間是 σ 鍵，C1=C2 與 C5=C6 是 π 鍵。', '一步協同：' + lab[2] + '–' + lab[3] + ' 的 σ 鍵斷裂（虛線）、C1–C6 的新 σ 鍵生成（虛線），兩個 π 鍵移到新的位置。', '新的 σ 鍵在 C1–C6；π 鍵移到 ' + lab[1] + '=' + lab[2] + ' 與 C4=C5。' + (cl ? '克萊森重排生成 C=O，得到 γ,δ-不飽和羰基化合物，因為 C=O 很強，反應幾乎不可逆。' : '柯普重排的產物仍是 1,5-二烯，平衡偏向較穩定（取代較多）的一方。')][st.p]} 「[3,3]」表示斷開的 σ 鍵兩端各算 1，新鍵分別形成在兩邊的第 3 個原子上。`;
    pressSeg(el, 'sgK', st.k); pressSeg(el, 'sgP', String(st.p));
  }
  bindSeg(el, 'sgK', v => { st.k = v; draw(); });
  bindSeg(el, 'sgP', v => { st.p = +v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 4. 氧化斷裂 ===== */
const CLV = {
  mb: ['2-甲基-2-丁烯 (CH₃)₂C=CHCH₃', { oz: '丙酮 + 乙醛', ozp: '丙酮 + 乙酸', mn: '丙酮 + 乙酸' }],
  mch: ['1-甲基環己烯', { oz: '6-氧代庚醛（一個酮、一個醛，在同一條鏈上）', ozp: '6-氧代庚酸', mn: '6-氧代庚酸' }],
  sty: ['苯乙烯 C₆H₅CH=CH₂', { oz: '苯甲醛 + 甲醛', ozp: '苯甲酸 + CO₂', mn: '苯甲酸 + CO₂' }],
  diol: ['1,2-環己二醇', { io: '己二醛 OHC(CH₂)₄CHO' }],
  pin: ['2,3-二甲基-2,3-丁二醇', { io: '2 分子丙酮' }],
};
const CLR = { oz: '① O₃ ② Zn／CH₃COOH', ozp: '① O₃ ② H₂O₂', mn: 'KMnO₄（熱、濃）', io: 'NaIO₄（或 HIO₄）' };
W.cleave = el => {
  const st = { s: 'mch', r: 'oz' };
  el.innerHTML = `${seg('clS', Object.entries(CLV).map(([k, v]) => [k, v[0].split(' ')[0]]), st.s)}<div class="seg" id="clR" role="group"></div><div class="oxpath" id="clP"></div><p class="note" id="clN"></p>`;
  function draw() {
    const [nm, P] = CLV[st.s]; if (!P[st.r]) st.r = Object.keys(P)[0];
    $('#clR', el).innerHTML = Object.keys(P).map(k => `<button type="button" data-v="${k}" aria-pressed="${k === st.r}">${CLR[k]}</button>`).join('');
    $$('#clR button', el).forEach(b => { b.onclick = () => { st.r = b.dataset.v; draw(); }; });
    $('#clP', el).innerHTML = `<span class="oxs">${nm}</span><span class="oxa">→</span><span class="oxs end">${P[st.r]}</span>`;
    $('#clN', el).innerHTML = st.r === 'io' ? 'NaIO₄ 只切開<b>鄰二醇</b>的 C–C 鍵，兩個帶 OH 的碳各變成 C=O。' : `雙鍵兩端各變成 C=O。差別在接 H 的那一端：${st.r === 'oz' ? 'Zn 還原處理停在<b>醛</b>' : '氧化處理（H₂O₂ 或 KMnO₄）把醛繼續氧化成<b>羧酸</b>，末端的 =CH₂ 變成 CO₂'}；接兩個碳的一端都是酮。環烯斷開後不會變成兩個分子，而是一條兩端都有 C=O 的鏈。`;
    pressSeg(el, 'clS', st.s);
  }
  bindSeg(el, 'clS', v => { st.s = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 5. 保護基：保護 → 反應 → 移除 ===== */
const PROT = {
  ket: ['在有酮的分子上做格里納', '4-溴環己酮', ['HOCH₂CH₂OH, H⁺', '環狀縮醛（酮被藏起來）'], ['Mg；再加 D₂O（或醛酮）', 'C–Br 變成 C–D（或接上新碳）'], ['H₃O⁺', '酮回來'], '格里納試劑會攻擊自己的 C=O，所以先把酮變成縮醛。'],
  alc: ['在有醇的分子上做格里納', 'HOCH₂CH₂CH₂Br', ['TBSCl, 咪唑', 'TBSO–CH₂CH₂CH₂Br（矽醚）'], ['Mg；再加 CH₃CHO', '接上新的醇'], ['TBAF（F⁻）', '移除矽醚'], 'O–H 的 H 會把格里納試劑質子化，所以先換成矽醚。'],
  cbz: ['胜肽合成時保護胺基', 'H₂N–CHR–COOH', ['Cbz–Cl（苄氧羰基氯）或 Boc₂O', 'Cbz–NH–CHR–COOH（胺甲酸酯）'], ['DCC + 另一個胺基酸', '只在 COOH 端形成胜肽鍵'], ['Cbz：H₂／Pd；Boc：三氟乙酸', '放出甲苯 + CO₂（Cbz）或異丁烯 + CO₂（Boc），胺基回來'], '胺基酸自己的 NH₂ 也會和活化的 COOH 反應，所以先把要保護的 NH₂ 變成胺甲酸酯。Cbz 以氫解移除時，苄基變成甲苯、胺甲酸分解放出 CO₂。'],
  ami: ['苯胺只要單取代', '苯胺', ['(CH₃CO)₂O', '乙醯苯胺（活化變溫和）'], ['Br₂', '對溴乙醯苯胺（只取代一次）'], ['H₃O⁺, 熱', '對溴苯胺'], '–NH₂ 太活化，直接溴化會得到三溴苯胺；醯胺化後活化變弱、體積變大，只進入對位。'],
};
W.protect = el => {
  let cur = 'ket';
  el.innerHTML = `${seg('prS', Object.entries(PROT).map(([k, v]) => [k, v[0]]), cur)}<div class="oxpath" id="prP"></div><p class="note" id="prN"></p>`;
  function draw() {
    const [, s0, a, b, c, why] = PROT[cur];
    $('#prP', el).innerHTML = [s0, ...[a, b, c].map(([r, p], i) => `<small>${['① 保護', '② 反應', '③ 移除'][i]}：${r}</small><br>${p}`)].map((x, i, arr) => `<span class="oxs${i === arr.length - 1 ? ' end' : ''}">${x}</span>`).join('<span class="oxa">→</span>');
    $('#prN', el).innerHTML = `${why} 好的保護基要：容易接上、在第 ② 步的條件下完全不反應、最後能在溫和條件下移除。`;
    pressSeg(el, 'prS', cur);
  }
  bindSeg(el, 'prS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 6. 光譜解題器 ===== */
const PUZ = {
  ea: ['C₄H₈O₂', [['不飽和度', '(2×4 + 2 − 8) ÷ 2 = 1：一個 C=O 或 C=C 或環', []], ['IR', '1740 cm⁻¹ 強峰，沒有 3300 寬峰：酯的 C=O，沒有 O–H', ['丁酸', '1,4-二氧六環']], ['¹H NMR', '4.1（q, 2H）、2.0（s, 3H）、1.3（t, 3H）：乙基接在 O 上（q 在 4.1），單峰甲基接在 C=O 上', ['丙酸甲酯', '甲酸丙酯']]], ['乙酸乙酯', '丙酸甲酯', '甲酸丙酯', '丁酸', '1,4-二氧六環']],
  pp: ['C₉H₁₀O', [['不飽和度', '(18 + 2 − 10) ÷ 2 = 5：苯環（4）+ 一個 C=O 或 C=C', []], ['IR', '1690 cm⁻¹ 強峰、沒有 O–H：和苯環共軛的酮（未共軛的酮約 1715）', ['1-苯基-2-丙烯-1-醇', '苄基甲基酮']], ['¹H NMR', '7.4–8.0（m, 5H）單取代苯；3.0（q, 2H）、1.2（t, 3H）乙基，CH₂ 接在 C=O 旁；沒有 9–10 ppm 的醛 H', ['4-甲基苯乙酮', '3-苯基丙醛']]], ['苯丙酮 C₆H₅COCH₂CH₃', '4-甲基苯乙酮', '苄基甲基酮', '3-苯基丙醛', '1-苯基-2-丙烯-1-醇']],
  pe: ['C₈H₁₀O', [['不飽和度', '(16 + 2 − 10) ÷ 2 = 4：一個苯環，沒有 C=O', []], ['IR', '3350 cm⁻¹ 寬峰：O–H；沒有 1700', ['苯乙醚', '苄基甲基醚']], ['¹H NMR', '7.2（m, 5H）、3.8（t, 2H）、2.8（t, 2H）、約 2（s, 1H，加 D₂O 消失）：–CH₂CH₂OH 接在苯環上', ['1-苯基乙醇', '4-乙基苯酚']]], ['2-苯基乙醇', '1-苯基乙醇', '4-乙基苯酚', '苯乙醚', '苄基甲基醚']],
};
W.solve = el => {
  const st = { p: 'ea', k: 0 };
  el.innerHTML = `${seg('svP', Object.entries(PUZ).map(([k, v]) => [k, v[0]]), st.p)}<div class="w-row"><button class="btn sm" type="button" data-m="-1">上一步</button><button class="btn sm pri" type="button" data-m="1">下一步</button></div><div class="cards" id="svC"></div><p class="note" id="svN"></p>`;
  function draw() {
    const [f, S, C] = PUZ[st.p], out = new Set(S.slice(0, st.k).flatMap(s => s[2]));
    $('#svC', el).innerHTML = C.map(c => card(out.has(c) ? 'no' : 'ok', out.has(c) ? '已排除' : '候選', c)).join('');
    $('#svN', el).innerHTML = st.k === 0 ? `分子式 ${f}。按「下一步」依序使用每一項資料，看哪些候選結構被排除。` : `第 ${st.k} 步・<b>${S[st.k - 1][0]}</b>：${S[st.k - 1][1]}${st.k === S.length ? `<br>答案：<b>${C[0]}</b>。` : ''}`;
    $('[data-m="-1"]', el).disabled = st.k === 0; $('[data-m="1"]', el).disabled = st.k === S.length;
    pressSeg(el, 'svP', st.p);
  }
  bindSeg(el, 'svP', v => { st.p = v; st.k = 0; draw(); });
  $$('[data-m]', el).forEach(b => { b.onclick = () => { st.k = clamp(st.k + +b.dataset.m, 0, PUZ[st.p][1].length); draw(); }; });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 7. 艾德曼降解 ===== */
const AAN = { G: '甘胺酸 Gly', A: '丙胺酸 Ala', F: '苯丙胺酸 Phe', L: '白胺酸 Leu', K: '離胺酸 Lys', S: '絲胺酸 Ser', C: '半胱胺酸 Cys', Y: '酪胺酸 Tyr' };
W.edman = el => {
  const st = { seq: 'GAFLK', k: 0 };
  el.innerHTML = `<label class="sel">胜肽（N 端 → C 端，一個字母一個胺基酸）<input id="edI" value="${st.seq}" maxlength="10" style="font-family:var(--mono);border:1px solid var(--line);border-radius:6px;padding:5px 8px;background:var(--bg);color:var(--ink)"></label><div class="w-row"><button class="btn sm" type="button" data-m="0">重來</button><button class="btn sm pri" type="button" data-m="1">做一次艾德曼循環</button></div><div id="edG"></div><p class="note" id="edN"></p>`;
  function draw() {
    const s = st.seq.toUpperCase().replace(/[^GAFLKSCY]/g, ''), k = Math.min(st.k, s.length);
    const box = (ch, x, cut) => `<rect x="${x - 18}" y="40" width="36" height="30" rx="6" style="fill:${cut ? 'none' : 'var(--c1)'};stroke:var(--c1);stroke-dasharray:${cut ? '4 3' : '0'}"/><text x="${x}" y="60" text-anchor="middle" style="font-size:14px;fill:${cut ? 'var(--muted)' : '#fff'};font-family:var(--mono)">${ch}</text>`;
    const W0 = Math.max(260, 130 + s.length * 46);
    $('#edG', el).innerHTML = `<svg class="en" viewBox="0 0 ${W0} 110" style="max-width:${W0}px;margin:auto" role="img" aria-label="艾德曼降解"><text class="tk" x="4" y="60">H₃N⁺–</text>${[...s].map((ch, i) => box(ch, 70 + i * 46, i < k) + (i < s.length - 1 ? `<line x1="${88 + i * 46}" x2="${98 + i * 46}" y1="55" y2="55" style="stroke:var(--ink)"/>` : '')).join('')}<text class="tk" x="${70 + s.length * 46 - 10}" y="60">–COO⁻</text>${k ? `<text class="tk" x="${70 + (k - 1) * 46}" y="95" text-anchor="middle" style="fill:var(--c2)">PTH-${s[k - 1]}</text>` : ''}</svg>`;
    $('#edN', el).innerHTML = k === 0 ? '苯基異硫氰酸酯（PITC）只和 N 端的游離 –NH₂ 反應。每做一次循環，切下 N 端的一個胺基酸成為 PTH 衍生物（用層析鑑定），其餘胜肽保持完整，可以繼續下一輪。' : `第 ${k} 輪切下 <b>${AAN[s[k - 1]]}</b>（PTH-${s[k - 1]}）。${k === s.length ? '整條胜肽定序完成：' + [...s].map(c => AAN[c].split(' ')[1]).join('–') + '（N → C）。' : '剩下的胜肽新的 N 端是 ' + AAN[s[k]] + '。'}實際上每輪產率不到 100%，所以艾德曼降解只適合約 30–50 個胺基酸以內的胜肽；更長的蛋白質先用酵素切成片段。`;
  }
  $('#edI', el).oninput = e => { st.seq = e.target.value; st.k = 0; draw(); };
  $('[data-m="0"]', el).onclick = () => { st.k = 0; draw(); };
  $('[data-m="1"]', el).onclick = () => { st.k++; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 8. 苯衍生物的俗名 ===== */
const TRIV = {
  tol: ['甲苯 toluene', [[0, 'CH₃']]], phe: ['酚 phenol', [[0, 'OH']]], ani: ['苯胺 aniline', [[0, 'NH₂']]], anis: ['苯甲醚 anisole', [[0, 'OCH₃']]],
  bzh: ['苯甲醛 benzaldehyde', [[0, 'CHO']]], bza: ['苯甲酸 benzoic acid', [[0, 'COOH']]], acp: ['苯乙酮 acetophenone', [[0, 'COCH₃']]], sty: ['苯乙烯 styrene', [[0, 'CH=CH₂']]],
  bal: ['苄醇 benzyl alcohol', [[0, 'CH₂OH']]], oxy: ['鄰二甲苯 o-xylene', [[0, 'CH₃'], [1, 'CH₃']]], pcr: ['對甲酚 p-cresol', [[0, 'OH'], [3, 'CH₃']]], sal: ['水楊酸 salicylic acid', [[0, 'COOH'], [1, 'OH']]],
  ccm: ['4-氯-3-甲基苯甲醛', [[0, 'CHO'], [2, 'CH₃'], [3, 'Cl']]],
};
W.trivial = el => {
  let cur = 'ccm';
  el.innerHTML = `<label class="sel">名稱 <select id="tvS">${Object.entries(TRIV).map(([k, v]) => `<option value="${k}"${k === cur ? ' selected' : ''}>${v[0]}</option>`).join('')}</select></label><div id="tvG"></div><p class="note" id="tvN"></p>`;
  function draw() {
    const [nm, subs] = TRIV[cur], A = {}, B = [];
    for (let k = 0; k < 6; k++) { const a = (90 - 60 * k) * Math.PI / 180; A['r' + k] = { x: Math.cos(a), y: Math.sin(a), t: '' }; A['n' + k] = { x: Math.cos(a) * 0.62, y: Math.sin(a) * 0.62, t: `<tspan class="cnum">${k + 1}</tspan>` }; B.push(['r' + k, 'r' + ((k + 1) % 6), k % 2 ? 's' : 'd']); }
    subs.forEach(([k, t]) => { const a = (90 - 60 * k) * Math.PI / 180; A['s' + k] = { x: Math.cos(a) * 2.05, y: Math.sin(a) * 2.05, t, hl: 1 }; B.push(['r' + k, 's' + k, 's']); });
    $('#tvG', el).innerHTML = MOL.svg({ atoms: A, bonds: B }, { w: 420, h: 280, s: 54, label: nm });
    $('#tvN', el).innerHTML = `<b>${nm}</b>。有俗名的母體（如苯甲醛）以它的官能基碳為 1 號，其他取代基拿最小號碼並依字母排序。二取代時也可以用 o-（1,2）、m-（1,3）、p-（1,4）。`;
  }
  $('#tvS', el).onchange = e => { cur = e.target.value; draw(); };
  draw();
  return { set(s) { cur = s.c || cur; $('#tvS', el).value = cur; draw(); } };
};

/* ===== 9. 薄層層析：極性與 Rf ===== */
const TLCC = [['萘（非極性）', 0.1], ['苯甲酸甲酯（酯）', 0.45], ['苯甲醇（醇）', 0.7], ['苯甲酸（羧酸）', 0.92]];
W.tlc = el => {
  let pol = 30;
  el.innerHTML = `<div class="w-row"><label class="rng">移動相中乙酸乙酯（極性）比例 <input type="range" id="tlR" min="0" max="100" step="5" value="${pol}"><output class="mono" id="tlO"></output></label></div><div id="tlG"></div><p class="note" id="tlN"></p>`;
  function draw() {
    const e = pol / 100, rf = TLCC.map(([, p]) => clamp(Math.pow(1 - p, 1.6) * (0.25 + 0.85 * e) + 0.6 * e * e * (1 - p), 0.02, 0.97));
    $('#tlO', el).textContent = `${pol}%（其餘為己烷）`;
    const H = 220, y0 = 195, yf = 25, cols = ['var(--c1)', 'var(--c3)', 'var(--c4)', 'var(--c2)'];
    $('#tlG', el).innerHTML = `<svg class="en" viewBox="0 0 460 ${H + 20}" style="max-width:460px;margin:auto" role="img" aria-label="TLC 片"><rect x="40" y="10" width="220" height="${H - 10}" rx="6" style="fill:var(--surface);stroke:var(--line)"/><line x1="40" x2="260" y1="${y0}" y2="${y0}" style="stroke:var(--muted);stroke-dasharray:4 4"/><line x1="40" x2="260" y1="${yf}" y2="${yf}" style="stroke:var(--c2);stroke-dasharray:4 4"/><text class="tk" x="268" y="${yf + 4}">溶劑前緣</text><text class="tk" x="268" y="${y0 + 4}">起點</text>${rf.map((r, i) => `<circle cx="${75 + i * 50}" cy="${y0 - r * (y0 - yf)}" r="9" style="fill:${cols[i]}"/><text class="tk" x="${75 + i * 50}" y="${y0 + 18}" text-anchor="middle">${i + 1}</text>`).join('')}${TLCC.map(([n], i) => `<text class="tk" x="300" y="${80 + i * 22}" style="fill:${cols[i]}">${i + 1} ${n}：Rf ${fx(rf[i], 2)}</text>`).join('')}</svg>`;
    $('#tlN', el).innerHTML = '固定相矽膠很極性。化合物越極性，被矽膠吸得越緊，移動越慢、<b>Rf 越小</b>；移動相越極性，越能把化合物「推」上去，所有 Rf 都變大。Rf = 化合物移動距離 ÷ 溶劑前緣距離，介於 0 與 1。（示意圖，Rf 為說明趨勢用）';
  }
  $('#tlR', el).oninput = e => { pol = +e.target.value; draw(); };
  draw();
  return { set(s) { pol = s.p ?? pol; $('#tlR', el).value = pol; draw(); } };
};

/* ===== 10. 碳的同素異形體 ===== */
const CALL = {
  dia: ['鑽石', 'sp³', '立體網狀，每個 C 接 4 個 C（四面體）', '不導電（沒有離域電子）', '最硬的天然物質，熔點極高'],
  gra: ['石墨', 'sp²', '平面六角層，層與層之間只有分散力', '沿層面導電（離域 π 電子）', '層間容易滑動，可當潤滑劑與鉛筆芯'],
  gph: ['石墨烯', 'sp²', '單層石墨', '導電性極佳', '強度很高、幾乎透明'],
  c60: ['富勒烯 C₆₀', 'sp²（略彎曲）', '12 個五元環 + 20 個六元環組成的球', '半導體', '分子晶體，可溶於某些有機溶劑'],
  cnt: ['奈米碳管', 'sp²', '石墨烯捲成的管', '依捲法為金屬性或半導體', '強度高、可導電'],
};
W.carbon = el => {
  let cur = 'dia';
  el.innerHTML = `${seg('caS', Object.entries(CALL).map(([k, v]) => [k, v[0]]), cur)}<div class="cards" id="caK"></div><p class="note">只有鑽石全部是 sp³；其他都是 sp² 碳，所以有離域的 π 電子，能導電或呈半導體。</p>`;
  function draw() {
    const [, h, s, c, p] = CALL[cur];
    $('#caK', el).innerHTML = card('h', '混成', h) + card('s', '結構', s) + card('c', '導電性', c) + card('p', '性質', p);
    pressSeg(el, 'caS', cur);
  }
  bindSeg(el, 'caS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 11. 四種晶體 ===== */
const XTY = {
  ion: ['離子晶體', '陰陽離子以離子鍵交錯排列', '熔點高、硬而脆；固體不導電，熔融或溶於水可導電', 'NaCl、MgO（電荷越大、離子越小，熔點越高）', 'ion'],
  mol: ['分子晶體', '分子之間只有分子間作用力（分散力、偶極、氫鍵）', '熔點低、軟、不導電', '冰、乾冰、碘、蔗糖、C₆₀', 'mol'],
  net: ['共價網狀晶體', '原子全部以共價鍵連成立體網', '熔點極高、極硬、多數不導電', '鑽石、石英 SiO₂、碳化矽 SiC', 'net'],
  met: ['金屬晶體', '金屬陽離子浸在自由電子海中', '導電導熱、有延展性、有光澤', 'Cu、Fe、Na', 'met'],
};
W.xtype = el => {
  let cur = 'ion';
  el.innerHTML = `${seg('xtS', Object.entries(XTY).map(([k, v]) => [k, v[0]]), cur)}<div id="xtG"></div><div class="cards" id="xtK"></div>`;
  function draw() {
    const [, b, p, e, k] = XTY[cur];
    let s = '';
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
      const x = 60 + i * 60, y = 40 + j * 50, alt = (i + j) % 2;
      if (k === 'ion') s += `<circle cx="${x}" cy="${y}" r="${alt ? 13 : 20}" style="fill:${alt ? 'var(--c1)' : 'var(--c2)'}"/><text x="${x}" y="${y + 5}" text-anchor="middle" style="font-size:13px;fill:#fff">${alt ? '+' : '−'}</text>`;
      if (k === 'mol') s += `<g transform="rotate(${(i * 37 + j * 23) % 90} ${x} ${y})"><circle cx="${x - 9}" cy="${y}" r="10" style="fill:var(--c3)"/><circle cx="${x + 9}" cy="${y}" r="10" style="fill:var(--c3)"/><line x1="${x - 9}" x2="${x + 9}" y1="${y}" y2="${y}" style="stroke:var(--ink);stroke-width:3"/></g>`;
      if (k === 'net') { s += `<circle cx="${x}" cy="${y}" r="8" style="fill:var(--ink)"/>`; if (i < 4) s += `<line x1="${x}" x2="${x + 60}" y1="${y}" y2="${y}" style="stroke:var(--ink);stroke-width:2"/>`; if (j < 2) s += `<line x1="${x}" x2="${x}" y1="${y}" y2="${y + 50}" style="stroke:var(--ink);stroke-width:2"/>`; }
      if (k === 'met') s += `<circle cx="${x}" cy="${y}" r="16" style="fill:var(--c4)"/><text x="${x}" y="${y + 5}" text-anchor="middle" style="font-size:13px;fill:#fff">+</text>`;
    }
    if (k === 'met') for (let n = 0; n < 22; n++) s += `<circle cx="${40 + (n * 53) % 270}" cy="${25 + (n * 31) % 130}" r="3" style="fill:var(--c1)"/>`;
    $('#xtG', el).innerHTML = `<svg class="en" viewBox="0 0 340 170" style="max-width:340px;margin:auto" role="img" aria-label="晶體粒子示意">${s}</svg>`;
    $('#xtK', el).innerHTML = card('b', '粒子之間', b) + card('p', '性質', p) + card('e', '例子', e);
    pressSeg(el, 'xtS', cur);
  }
  bindSeg(el, 'xtS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.x || cur; draw(); } };
};
