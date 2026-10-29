/* ---------- 後中化學：光譜的補充互動圖 ---------- */

/* ===== 1. 電磁波譜：每一區對分子做了什麼 ===== */
const EMB = [
  ['γ 射線', '< 0.01 nm', '原子核的躍遷', '—'], ['X 射線', '0.01–10 nm', '內層電子游離', 'X 光繞射定晶體結構'], ['紫外光', '10–400 nm', '價電子躍遷（π → π*、n → π*）', 'UV–Vis：看共軛'],
  ['可見光', '400–750 nm', '共軛很長的 π 系統的電子躍遷', '顏色、比色定量（比爾定律）'], ['紅外光', '2.5–25 μm（4000–400 cm⁻¹）', '鍵的振動', 'IR：看官能基'], ['微波', '1 mm–1 m', '分子轉動', '—'], ['無線電波', '> 1 m', '原子核自旋在磁場中的翻轉', 'NMR：看 H、C 的環境'],
];
W.emspec = el => {
  let cur = 4;
  el.innerHTML = `<div id="ebG"></div><div class="cards" id="ebK"></div><p class="note">由上到下波長越長、頻率越低、能量越小（E = hν = hc／λ）。紫外光的能量足以讓電子躍遷，紅外光只夠讓鍵振動，無線電波只夠翻轉核自旋。質譜不是光譜：它用高能電子撞擊分子，使分子失去一個電子形成自由基陽離子。</p>`;
  function draw() {
    $('#ebG', el).innerHTML = `<div class="bars pk">${EMB.map(([n, l], i) => `<div class="${i === cur ? 'on' : ''}" data-i="${i}" role="button"><span>${n}</span><i class="ba" style="width:${96 - i * 13}%"></i><b class="small">${l}</b></div>`).join('')}</div><p class="small mut">長條長度示意能量（由高到低）</p>`;
    $$('#ebG [data-i]', el).forEach(d => { d.onclick = () => { cur = +d.dataset.i; draw(); }; });
    const [n, , w, u] = EMB[cur];
    $('#ebK', el).innerHTML = card('w', `${n}讓分子`, w) + card('u', '對應的分析方法', u);
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 2. C=O 的 IR 頻率 =====
   典型值（cm⁻¹）：OpenStax《Organic Chemistry》表 12.8、19.? 與 21.? 的約略值 */
const COF = [
  ['酸酐', 1820, '兩個 C=O 耦合，出現 1820 與 1760 兩根'], ['醯氯', 1800, 'Cl 拉電子、共振給電子少，C=O 最強'], ['環丁酮', 1785, '環張力讓 C=O 的 s 性質提高，鍵變強'], ['環戊酮', 1750, '五員環仍有張力'], ['酯', 1735, 'O 的誘導拉電子略勝共振'],
  ['醛', 1730, '另有 2720、2820 cm⁻¹ 兩根 C–H 伸縮'], ['酮、環己酮', 1715, '參考值'], ['羧酸', 1710, '另有 2500–3300 的極寬 O–H'], ['α,β-不飽和酮、苯乙酮', 1690, '與 C=C 或苯環共軛，C=O 帶部分單鍵性質，頻率降低約 25–30'], ['醯胺', 1650, 'N 的共振給電子最強，C=O 最像單鍵'],
];
W.cofreq = el => {
  let cur = 6;
  el.innerHTML = `<div id="cfG"></div><p class="note" id="cfN"></p>`;
  function draw() {
    $('#cfG', el).innerHTML = chart({ x: [1620, 1840], y: [0, COF.length], xt: [1650, 1700, 1750, 1800], xlab: 'C=O 伸縮振動（cm⁻¹）', h: 300, label: '羰基 IR 頻率' }, (X, Y) => COF.map(([n, v], i) => { const y = Y(COF.length - i - 0.5); return `<g data-i="${i}" style="cursor:pointer"><line x1="${X(1620)}" x2="${X(v)}" y1="${y}" y2="${y}" style="stroke:${i === cur ? '#B5326C' : 'var(--line)'};stroke-width:2"/><circle cx="${X(v)}" cy="${y}" r="7" style="fill:${i === cur ? '#B5326C' : '#2F3B99'}"/><text class="tk" x="${X(v) - 12}" y="${y + 4}" text-anchor="end" style="fill:var(--ink)">${n} ${v}</text></g>`; }).join(''));
    $$('#cfG [data-i]', el).forEach(g => { g.onclick = () => { cur = +g.dataset.i; draw(); }; });
    $('#cfN', el).innerHTML = `<b>${COF[cur][0]}</b>：${COF[cur][2]}。規律：C=O 鍵越強（越像雙鍵）頻率越高。接上推電子共振的原子（N、共軛的 C=C）會降低頻率；拉電子基與環張力會提高頻率，所以環丙酮 > 環丁酮 > 環戊酮 > 環己酮。`;
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 3. 質譜的同位素峰：數 Cl 與 Br ===== */
W.isopat = el => {
  const st = { cl: 1, br: 0 };
  el.innerHTML = `<div class="w-row"><span class="small">Cl 數</span>${seg('ipC', [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3']], '1')}<span class="small">Br 數</span>${seg('ipB', [['0', '0'], ['1', '1'], ['2', '2']], '0')}</div><div id="ipG"></div><p class="note" id="ipN"></p>`;
  function draw() {
    let p = [1];
    const mul = (a, r) => { const o = Array(a.length + 1).fill(0); a.forEach((v, i) => { o[i] += v * r[0]; o[i + 1] += v * r[1]; }); return o; };
    for (let i = 0; i < st.cl; i++) p = mul(p, [0.758, 0.242]);
    for (let i = 0; i < st.br; i++) p = mul(p, [0.507, 0.493]);
    const mx = Math.max(...p), lab = p.map((_, i) => i ? `M+${2 * i}` : 'M');
    $('#ipG', el).innerHTML = chart({ x: [-0.6, p.length - 0.4], y: [0, 1.05], yt: [0, 0.5, 1], ylab: '相對強度', h: 220, label: '同位素峰' }, (X, Y) => p.map((v, i) => `<rect x="${X(i) - 18}" y="${Y(v / mx)}" width="36" height="${Y(0) - Y(v / mx)}" style="fill:#2F3B99"/><text class="tk" x="${X(i)}" y="${Y(0) + 16}" text-anchor="middle">${lab[i]}</text><text class="tk" x="${X(i)}" y="${Y(v / mx) - 5}" text-anchor="middle">${fx(100 * v / mx, 0)}</text>`).join(''));
    $('#ipN', el).innerHTML = `³⁵Cl : ³⁷Cl ≈ 3 : 1、⁷⁹Br : ⁸¹Br ≈ 1 : 1（天然豐度）。每多一個鹵素，就多一根相隔 2 的峰，強度比是二項式展開：一個 Cl 為 3 : 1，兩個 Cl 約 9 : 6 : 1，三個 Cl 約 27 : 27 : 9 : 1；一個 Br 為 1 : 1，兩個 Br 為 1 : 2 : 1。溴乙烷的分子離子出現在 m/z 108 與 110，強度相等。`;
    pressSeg(el, 'ipC', String(st.cl)); pressSeg(el, 'ipB', String(st.br));
  }
  bindSeg(el, 'ipC', v => { st.cl = +v; draw(); });
  bindSeg(el, 'ipB', v => { st.br = +v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 4. 質譜碎片：α-裂解與麥克拉弗蒂重排 ===== */
const MSF = {
  p2: ['2-戊酮 CH₃COCH₂CH₂CH₃', 86, [[43, 'α-裂解：CH₃C≡O⁺（失去丙基）'], [71, 'α-裂解：C₃H₇C≡O⁺（失去甲基）'], [58, '麥克拉弗蒂：γ-H 轉移、失去乙烯，留下烯醇自由基陽離子']]],
  p3: ['3-戊酮 CH₃CH₂COCH₂CH₃', 86, [[57, 'α-裂解：C₂H₅C≡O⁺'], [29, 'C₂H₅⁺']], '乙基沒有 γ-H，不能進行麥克拉弗蒂重排，所以沒有 m/z 58。'],
  bb: ['正丁苯 C₆H₅CH₂CH₂CH₂CH₃', 134, [[91, '苄位斷裂得 C₇H₇⁺（重排成芳香的環庚三烯陽離子）'], [92, '麥克拉弗蒂：γ-H 轉移到苯環、失去丙烯']]],
  non: ['4-壬酮 C₃H₇COC₅H₁₁', 142, [[71, 'α-裂解：C₃H₇C≡O⁺'], [99, 'α-裂解：C₅H₁₁C≡O⁺'], [114, '麥克拉弗蒂（丙基側，失去乙烯）'], [86, '麥克拉弗蒂（戊基側，失去丙烯）'], [58, '兩側各一次麥克拉弗蒂（雙重）']]],
  eb: ['溴乙烷 CH₃CH₂Br', 108, [[110, '⁸¹Br 的分子離子（和 108 等高）'], [29, '失去 Br·，留下 C₂H₅⁺']]],
};
W.msfrag = el => {
  let cur = 'p2';
  el.innerHTML = `${seg('mfS', Object.entries(MSF).map(([k, v]) => [k, v[0].split(' ')[0]]), cur)}<div id="mfG"></div><p class="note" id="mfN"></p>`;
  function draw() {
    const [nm, M, F, extra] = MSF[cur], pk = [[M, '分子離子 M⁺·'], ...F];
    $('#mfG', el).innerHTML = chart({ x: [20, 150], y: [0, 1.1], xt: [20, 40, 60, 80, 100, 120, 140], xlab: 'm/z', h: 220, label: '質譜' }, (X, Y) => pk.map(([m, t], i) => { const h = i ? 0.5 + 0.4 * ((i * 37) % 10) / 10 : 0.45; return `<line x1="${X(m)}" x2="${X(m)}" y1="${Y(0)}" y2="${Y(h)}" style="stroke:${i ? '#2F3B99' : '#B5326C'};stroke-width:4"/><text class="tk" x="${X(m)}" y="${Y(h) - 5}" text-anchor="middle">${m}</text>`; }).join(''));
    $('#mfN', el).innerHTML = `<b>${nm}</b>（M = ${M}）。${pk.slice(1).map(([m, t]) => `m/z ${m}：${t}`).join('；')}。${extra || ''}<br>分子離子是<b>自由基陽離子</b>（失去一個電子）；α-裂解得到的醯基離子是<b>陽離子</b>，丟掉的另一半是中性自由基，偵測不到。麥克拉弗蒂重排需要羰基（或苯環）的 γ 碳上有 H，經六員環過渡狀態丟掉一個中性的烯，留下的仍是自由基陽離子。峰高為示意。`;
    pressSeg(el, 'mfS', cur);
  }
  bindSeg(el, 'mfS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.m || cur; draw(); } };
};

/* ===== 5. DEPT：分辨 CH₃、CH₂、CH 與四級碳 ===== */
const DEPTC = {
  mp: ['2-甲基戊烷', [['C1 與 C2 上的甲基支鏈（等價）', 3], ['C2', 1], ['C3', 2], ['C4', 2], ['C5', 3]]],
  mpr: ['丙酸甲酯 CH₃CH₂COOCH₃', [['CH₃（乙基）', 3], ['CH₂', 2], ['C=O', 0], ['OCH₃', 3]]],
  tb: ['第三丁醇 (CH₃)₃COH', [['三個 CH₃（等價）', 3], ['C–OH', 0]]],
  ib: ['異丁醛 (CH₃)₂CHCHO', [['兩個 CH₃（等價）', 3], ['CH', 1], ['CHO', 1]]],
};
W.dept = el => {
  let cur = 'mp';
  el.innerHTML = `${seg('dpS', Object.entries(DEPTC).map(([k, v]) => [k, v[0]]), cur)}<div class="cards" id="dpK2"></div><p class="note">DEPT 是 ¹³C NMR 的一種實驗：<b>DEPT-90</b> 只出現 CH 的正峰；<b>DEPT-135</b> 中 CH 與 CH₃ 為正峰、CH₂ 為負峰；四級碳（包括 C=O）在兩種 DEPT 都不出現，只在一般 ¹³C 譜出現。一般 ¹³C 譜的訊號數 = 不等價碳的種類數。</p>`;
  function draw() {
    const [, C] = DEPTC[cur], n = k => C.filter(c => c[1] === k).length;
    $('#dpK2', el).innerHTML = card('a', '¹³C 訊號數', C.length) + card('b', 'DEPT-90 正峰', n(1)) + card('c', 'DEPT-135 正峰（CH、CH₃）', n(1) + n(3)) + card('d', 'DEPT-135 負峰（CH₂）', n(2)) + card('e', '碳的種類', C.map(([t, h]) => `${t}：${['四級', 'CH', 'CH₂', 'CH₃'][h]}`).join('<br>'));
    pressSeg(el, 'dpS', cur);
  }
  bindSeg(el, 'dpS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};
