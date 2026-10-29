/* ---------- 後中化學：酸鹼定義、pH 計算、強度與多質子酸的互動圖 ---------- */

/* ===== 1. 三種酸鹼定義：誰給誰什麼 ===== */
const ABRX = [
  ['HNO₂ + H₂O ⇌ NO₂⁻ + H₃O⁺', [['HNO₂', 'a'], ['H₂O', 'b']], [['NO₂⁻', 'cb'], ['H₃O⁺', 'ca']], 'BL', 'HNO₂ 給 H⁺ 給水：HNO₂/NO₂⁻、H₃O⁺/H₂O 是兩組共軛酸鹼對。'],
  ['NH₃ + H₂O ⇌ NH₄⁺ + OH⁻', [['NH₃', 'b'], ['H₂O', 'a']], [['NH₄⁺', 'ca'], ['OH⁻', 'cb']], 'BL', '這裡水是酸（給 H⁺），在上一題水是鹼：水是兩性物質。NH₃ 不含 OH⁻，卻使溶液產生 OH⁻，所以也算阿瑞尼斯鹼。'],
  ['HCO₃⁻ + OH⁻ ⇌ CO₃²⁻ + H₂O', [['HCO₃⁻', 'a'], ['OH⁻', 'b']], [['CO₃²⁻', 'cb'], ['H₂O', 'ca']], 'BL', 'HCO₃⁻ 遇到鹼時當酸；遇到酸時（HCO₃⁻ + H⁺ → H₂CO₃）當鹼，也是兩性物質。'],
  ['BF₃ + :NH₃ → F₃B–NH₃', [['BF₃', 'la'], ['NH₃', 'lb']], [['F₃B–NH₃', '']], 'L', '沒有 H⁺ 轉移。NH₃ 提供孤對電子（路易斯鹼），B 有空軌域接受（路易斯酸），形成配位共價鍵。'],
  ['CaO + SiO₂ → CaSiO₃', [['CaO', 'lb'], ['SiO₂', 'la']], [['CaSiO₃', '']], 'L', 'O²⁻ 提供電子對給 Si：鹼性氧化物 + 酸性氧化物，屬於路易斯酸鹼反應。'],
  ['Cl₂ + H₂O → HCl + HOCl', [['Cl₂', ''], ['H₂O', '']], [['HCl', ''], ['HOCl', '']], 'R', 'Cl 的氧化數由 0 變成 −1 與 +1，是氧化還原（自身氧化還原），不是酸鹼反應。'],
  ['Fe³⁺ + 6H₂O → Fe(H₂O)₆³⁺', [['Fe³⁺', 'la'], ['H₂O', 'lb']], [['Fe(H₂O)₆³⁺', '']], 'L', '金屬離子接受水分子的孤對電子；高電荷的水合金屬離子還會再釋出 H⁺，所以 FeCl₃、AlCl₃ 溶液呈酸性。'],
];
W.abdef = el => {
  let cur = 0;
  el.innerHTML = `${seg('adS', ABRX.map((r, i) => [String(i), r[0].split(' ')[0] + ' …']), '0')}<p class="eq" id="adE"></p><div class="w-row" id="adC"></div><div class="cards" id="adK"></div><p class="note" id="adN"></p>`;
  const LAB = { a: ['酸', 'qc pos'], b: ['鹼', 'qc neg'], ca: ['共軛酸', 'qc pos'], cb: ['共軛鹼', 'qc neg'], la: ['路易斯酸', 'qc pos'], lb: ['路易斯鹼', 'qc neg'], '': ['', 'qc'] };
  function draw() {
    const [rx, L, R, kind, note] = ABRX[cur];
    $('#adE', el).textContent = rx;
    $('#adC', el).innerHTML = L.concat([['→', null]]).concat(R).map(([t, k]) => (k === null ? '<span class="marr">→</span>' : `<span class="${LAB[k][1]}">${t}${LAB[k][0] ? `<small>${LAB[k][0]}</small>` : ''}</span>`)).join('');
    const yes = t => `<b class="${t ? 'ok' : 'bad'}">${t ? '是' : '否'}</b>`;
    $('#adK', el).innerHTML = card('a', '阿瑞尼斯（水中產生 H⁺／OH⁻）', yes(cur < 2)) + card('b', '布忍斯特–羅瑞（H⁺ 轉移）', yes(kind === 'BL')) + card('l', '路易斯（電子對）', yes(kind !== 'R'));
    $('#adN', el).innerHTML = `${note} 三種定義由窄到寬：所有布忍斯特–羅瑞酸鹼反應也都是路易斯酸鹼反應（鹼用孤對電子接受 H⁺）。`;
    pressSeg(el, 'adS', String(cur));
  }
  bindSeg(el, 'adS', v => { cur = +v; draw(); });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 2. pH 計算：強、弱、極稀、鹽類 ===== */
const PHT = { sa: ['強酸 HCl', 0, 'a'], wa: ['弱酸 CH₃COOH', 4.74, 'a'], hf: ['弱酸 HF', 3.17, 'a'], sb: ['強鹼 NaOH', 0, 'b'], wb: ['弱鹼 NH₃', 4.75, 'b'], naf: ['鹽 NaF（F⁻ 是弱鹼）', 14 - 3.17, 'b'], nh4: ['鹽 NH₄Cl（NH₄⁺ 是弱酸）', 9.25, 'a'] };
function phSolve(type, C) {   // 回傳 [H⁺]；強酸鹼含水的解離，弱者解二次式
  const Kw = 1e-14, [, pK, ab] = PHT[type];
  let x;
  if (pK === 0) x = (C + Math.sqrt(C * C + 4 * Kw)) / 2;
  else { const K = 10 ** -pK; x = (-K + Math.sqrt(K * K + 4 * K * C)) / 2; x = Math.max(x, Math.sqrt(Kw)); }
  return ab === 'a' ? x : Kw / x;
}
W.phcalc = el => {
  const st = { t: 'wa', lc: -1 };
  el.innerHTML = `${seg('pcT', Object.entries(PHT).map(([k, v]) => [k, v[0]]), st.t)}<div class="w-row"><label class="rng">濃度 C（對數）<input type="range" id="pcC" min="-8" max="0" step="0.05"><output class="mono" id="pcCo"></output></label></div><div id="pcG"></div><ol class="cs" id="pcF"></ol><div class="cards" id="pcK"></div><p class="note" id="pcN"></p>`;
  function draw() {
    const [nm, pK, ab] = PHT[st.t], C = 10 ** st.lc, H = phSolve(st.t, C), pH = -Math.log10(H), xs = Array.from({ length: 81 }, (_, i) => -8 + i * 0.1);
    $('#pcG', el).innerHTML = chart({ w: 560, h: 220, x: [-8, 0], y: [0, 14], xt: [-8, -6, -4, -2, 0], yt: [0, 7, 14], xlab: 'log C', ylab: 'pH', label: 'pH 與濃度' }, (X, Y) =>
      `<line class="mk" x1="${X(-8)}" x2="${X(0)}" y1="${Y(7)}" y2="${Y(7)}"/><path class="tline" d="${path(xs.map(x => [X(x), Y(-Math.log10(phSolve(st.t, 10 ** x)))]))}"/><circle class="dot" cx="${X(st.lc)}" cy="${Y(pH)}" r="7"/>`);
    const ion = ab === 'a' ? H : 1e-14 / H;
    const K = pK ? 10 ** -pK : null;
    $('#pcF', el).innerHTML = pK === 0
      ? `<li>完全解離：[${ab === 'a' ? 'H⁺' : 'OH⁻'}] ≈ C = ${sci(C, 2)} M</li>${C < 1e-6 ? '<li>濃度太低時，水本身解離的 1.0 × 10⁻⁷ M 不能忽略：解 x² − Cx − Kw = 0</li>' : ''}`
      : `<li>${ab === 'a' ? 'Ka' : 'Kb'} = ${sci(K, 2)}${st.t === 'naf' ? '（= Kw ÷ Ka(HF)）' : st.t === 'nh4' ? '（= Kw ÷ Kb(NH₃)）' : ''}</li><li>x² ÷ (C − x) = K → x = ${sci(ion, 2)} M（近似 √(KC) = ${sci(Math.sqrt(K * C), 2)}）</li>`;
    $('#pcK', el).innerHTML = card('h', '[H⁺]', `${sci(H, 2)} M`) + card('p', 'pH', fx(pH, 2)) + card('o', 'pOH', fx(14 - pH, 2)) + card('a', '解離度 α', `${fx(100 * Math.min(1, ion / C), 1)}%`, pK ? '= x ÷ C' : '');
    $('#pcN', el).innerHTML = pK === 0 ? `強${ab === 'a' ? '酸' : '鹼'}完全解離，pH 由濃度直接決定。但濃度低於 10⁻⁶ M 時，pH 不會跨過 7：5 × 10⁻⁸ M 的 HNO₃ pH 約 6.9，而不是 7.3。`
      : `弱${ab === 'a' ? '酸' : '鹼'}只解離一小部分。往左拖（稀釋），解離度 α 反而<b>變大</b>（約和 √(K/C) 成正比，濃度變 4 倍 α 變一半），但 [${ab === 'a' ? 'H⁺' : 'OH⁻'}] 仍然變小。${st.t === 'naf' || st.t === 'nh4' ? ' 鹽類溶液的酸鹼性看離子：強酸強鹼生成的鹽（NaCl、KNO₃）中性；弱酸的陰離子（F⁻、CH₃COO⁻、CN⁻）使溶液偏鹼；弱鹼的陽離子（NH₄⁺）與高電荷的金屬離子（Al³⁺、Fe³⁺）使溶液偏酸。' : ''}`;
    $('#pcC', el).value = st.lc; $('#pcCo', el).textContent = `${sci(C, 1)} M`; pressSeg(el, 'pcT', st.t);
  }
  bindSeg(el, 'pcT', v => { st.t = v; draw(); });
  $('#pcC', el).oninput = e => { st.lc = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. 酸的強度階梯：Ka × Kb = Kw =====
   25 °C 的 pKa（教科書常用值） */
const KAL = [['HSO₄⁻', 'SO₄²⁻', 1.99], ['H₃PO₄', 'H₂PO₄⁻', 2.15], ['HClO₂', 'ClO₂⁻', 1.96], ['HF', 'F⁻', 3.17], ['HNO₂', 'NO₂⁻', 3.35], ['CH₃COOH', 'CH₃COO⁻', 4.74], ['C₅H₅NH⁺', 'C₅H₅N', 5.23], ['H₂CO₃', 'HCO₃⁻', 6.35], ['H₂PO₄⁻', 'HPO₄²⁻', 7.20], ['HCN', 'CN⁻', 9.21], ['NH₄⁺', 'NH₃', 9.25], ['HCO₃⁻', 'CO₃²⁻', 10.33], ['HPO₄²⁻', 'PO₄³⁻', 12.35]];
W.kaladder = el => {
  let cur = 3;
  el.innerHTML = `<div id="klG"></div><div class="cards" id="klK"></div><p class="note" id="klN"></p>`;
  function draw() {
    const Y = p => 20 + (p - 1.5) / 11.5 * 400;
    let s = `<line class="axl" x1="280" x2="280" y1="10" y2="430"/><text class="tk" x="200" y="12" text-anchor="middle">酸（越上越強）</text><text class="tk" x="360" y="12" text-anchor="middle">共軛鹼（越下越強）</text>`;
    const used = [];
    KAL.forEach(([a, b, p], i) => { let y = Y(p); while (used.some(u => Math.abs(u - y) < 15)) y += 15; used.push(y);
      s += `<g data-i="${i}" class="klr${i === cur ? ' on' : ''}" role="button"><line x1="270" x2="290" y1="${Y(p)}" y2="${Y(p)}" class="mk"/><text class="tk" x="262" y="${y + 4}" text-anchor="end">${a}</text><text class="tk" x="298" y="${y + 4}">${b}</text><text class="tk sm" x="150" y="${y + 4}" text-anchor="end">${p}</text></g>`; });
    $('#klG', el).innerHTML = `<svg class="ch" style="max-width:520px;margin:auto" viewBox="100 0 380 440" role="img" aria-label="酸鹼強度">${s}</svg>`;
    const [a, b, p] = KAL[cur];
    $('#klK', el).innerHTML = card('ka', `${a} 的 Ka`, sci(10 ** -p, 2), `pKa ${p}`) + card('kb', `${b} 的 Kb`, sci(10 ** (p - 14), 2), `pKb ${fx(14 - p, 2)}`) + card('kw', 'Ka × Kb', '1.0 × 10⁻¹⁴', 'Kw');
    $('#klN', el).innerHTML = `點選任一列。左邊越上面的酸越強（pKa 越小），它的共軛鹼就越弱；兩者的 Ka × Kb 永遠等於 Kw。所以 Ka(HF) &gt; Ka(HCN) 時，鹼性 CN⁻ &gt; F⁻。等濃度的鈉鹽溶液，共軛鹼越強 pH 越高；反過來，由鹽溶液的 pH 也能排出酸的強弱。`;
    $$('[data-i]', el).forEach(g => { g.onclick = () => { cur = +g.dataset.i; draw(); }; });
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 4. 多質子酸的物種分布 ===== */
const POLY = { h3po4: ['H₃PO₄', [2.15, 7.20, 12.35], ['H₃PO₄', 'H₂PO₄⁻', 'HPO₄²⁻', 'PO₄³⁻']], ox: ['草酸 H₂C₂O₄', [1.25, 4.27], ['H₂C₂O₄', 'HC₂O₄⁻', 'C₂O₄²⁻']], co3: ['碳酸 H₂CO₃', [6.35, 10.33], ['H₂CO₃', 'HCO₃⁻', 'CO₃²⁻']] };
const PCOL = ['#2F3B99', '#B5326C', '#23704A', '#8F5400'];
W.polyprot = el => {
  const st = { a: 'h3po4', pH: 7 };
  el.innerHTML = `${seg('ppS', Object.entries(POLY).map(([k, v]) => [k, v[0]]), st.a)}<div class="w-row"><label class="rng">pH<input type="range" id="ppH" min="0" max="14" step="0.05"><output class="mono" id="ppO"></output></label></div><div id="ppG"></div><div class="cards" id="ppK"></div><p class="note" id="ppN"></p>`;
  const frac = (pKs, pH) => { const H = 10 ** -pH, K = pKs.map(p => 10 ** -p), terms = [1]; K.forEach((k, i) => terms.push(terms[i] * k / H)); const s = terms.reduce((a, b) => a + b, 0); return terms.map(t => t / s); };
  function draw() {
    const [, pKs, sp] = POLY[st.a], xs = Array.from({ length: 141 }, (_, i) => i / 10), f = frac(pKs, st.pH);
    $('#ppG', el).innerHTML = chart({ w: 560, h: 240, x: [0, 14], y: [0, 1], xt: [0, 2, 4, 6, 8, 10, 12, 14], yt: [0, 0.5, 1], xlab: 'pH', ylab: '所佔比例', label: '多質子酸分布' }, (X, Y) =>
      sp.map((_, j) => `<path class="tline" style="stroke:${PCOL[j]}" d="${path(xs.map(x => [X(x), Y(frac(pKs, x)[j])]))}"/>`).join('') + pKs.map(p => `<line class="mk" x1="${X(p)}" x2="${X(p)}" y1="${Y(0)}" y2="${Y(0.5)}"/>`).join('')
      + `<line class="cur" x1="${X(st.pH)}" x2="${X(st.pH)}" y1="${Y(0)}" y2="${Y(1)}"/>`);
    $('#ppK', el).innerHTML = sp.map((t, j) => `<div class="card"><span style="color:${PCOL[j]}">${t}</span><b>${fx(100 * f[j], 1)}%</b></div>`).join('');
    const amph = pKs.slice(0, -1).map((p, i) => `${sp[i + 1]} 溶液 pH ≈ (${p} + ${pKs[i + 1]}) ÷ 2 = ${fx((p + pKs[i + 1]) / 2, 2)}`).join('；');
    $('#ppN', el).innerHTML = `每兩條曲線在 pH = pKa 處交叉（虛線），此時兩種形式各半。兩個 pKa 相差很大時，任何 pH 下最多只有兩種形式同時明顯存在。兩性物質（中間形式）的溶液：${amph}。二質子酸 H₂A 溶液中 [A²⁻] ≈ Ka₂，和濃度無關。`;
    $('#ppH', el).value = st.pH; $('#ppO', el).textContent = fx(st.pH, 2); pressSeg(el, 'ppS', st.a);
  }
  bindSeg(el, 'ppS', v => { st.a = v; draw(); });
  $('#ppH', el).oninput = e => { st.pH = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};
