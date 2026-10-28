/* ---------- 後中化學：配位化學的互動圖 ---------- */

/* ===== 1. 錯合物拆解：組成、氧化數、命名 =====
   lig：[顯示, 個數, 電荷, 牙數, 英文名]；out：外界離子 [顯示, 個數, 電荷] */
const CPLX = {
  co6: { f: '[Co(NH₃)₆]Cl₃', m: 'Co', mn: 'cobalt', lig: [['NH₃', 6, 0, 1, 'ammine']], out: [['Cl⁻', 3, -1]] },
  co5: { f: '[Co(NH₃)₅Cl]Cl₂', m: 'Co', mn: 'cobalt', lig: [['NH₃', 5, 0, 1, 'ammine'], ['Cl⁻', 1, -1, 1, 'chloro']], out: [['Cl⁻', 2, -1]] },
  cr3: { f: '[Cr(NH₃)₃Cl₃]', m: 'Cr', mn: 'chromium', lig: [['NH₃', 3, 0, 1, 'ammine'], ['Cl⁻', 3, -1, 1, 'chloro']], out: [] },
  cr4: { f: '[Cr(NH₃)₄Br₂]Br', m: 'Cr', mn: 'chromium', lig: [['NH₃', 4, 0, 1, 'ammine'], ['Br⁻', 2, -1, 1, 'bromo']], out: [['Br⁻', 1, -1]] },
  fe3: { f: 'K₃[Fe(CN)₆]', m: 'Fe', mn: 'ferrate', lig: [['CN⁻', 6, -1, 1, 'cyano']], out: [['K⁺', 3, 1]] },
  fe2: { f: 'K₄[Fe(CN)₆]', m: 'Fe', mn: 'ferrate', lig: [['CN⁻', 6, -1, 1, 'cyano']], out: [['K⁺', 4, 1]] },
  pt: { f: '[Pt(NH₃)₂Cl₂]', m: 'Pt', mn: 'platinum', lig: [['NH₃', 2, 0, 1, 'ammine'], ['Cl⁻', 2, -1, 1, 'chloro']], out: [] },
  en: { f: '[Co(en)₂Cl₂]Cl', m: 'Co', mn: 'cobalt', lig: [['Cl⁻', 2, -1, 1, 'chloro'], ['en', 2, 0, 2, 'ethylenediamine']], out: [['Cl⁻', 1, -1]] },
  ag: { f: 'Na[Ag(CN)₂]', m: 'Ag', mn: 'argentate', lig: [['CN⁻', 2, -1, 1, 'cyano']], out: [['Na⁺', 1, 1]] },
  ni: { f: '[Ni(CO)₄]', m: 'Ni', mn: 'nickel', lig: [['CO', 4, 0, 1, 'carbonyl']], out: [] },
};
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI'];
const MULT = ['', '', 'di', 'tri', 'tetra', 'penta', 'hexa'], MULT2 = ['', '', 'bis', 'tris', 'tetrakis'];
const CNAME_OUT = { 'Cl⁻': 'chloride', 'Br⁻': 'bromide', 'K⁺': 'potassium', 'Na⁺': 'sodium' };
function cplxInfo(d) {
  const outQ = d.out.reduce((s, [, n, q]) => s + n * q, 0), q = -outQ, ligQ = d.lig.reduce((s, [, n, c]) => s + n * c, 0), ox = q - ligQ;
  const cn = d.lig.reduce((s, [, n, , dent]) => s + n * dent, 0);
  const lig = [...d.lig].sort((a, b) => a[4].localeCompare(b[4])).map(([, n, , , nm]) => nm === 'ethylenediamine' ? `${MULT2[n]}(${nm})` : MULT[n] + nm).join('');
  const core = `${lig}${d.mn}(${ROMAN[ox]})`, cat = d.out.find(o => o[2] > 0), an = d.out.find(o => o[2] < 0);
  const name = cat ? `${CNAME_OUT[cat[0]]} ${core}` : an ? `${core} ${CNAME_OUT[an[0]]}` : core;
  return { q, ox, cn, name, ions: d.out.length ? 1 + d.out.reduce((s, [, n]) => s + n, 0) : 1, agcl: an && an[0] === 'Cl⁻' ? an[1] : 0, neutral: !d.out.length };
}
W.cname = el => {
  let cur = 'co5';
  el.innerHTML = `${seg('cnS', Object.entries(CPLX).map(([k, v]) => [k, v.f]), cur)}<ol class="cs" id="cnC"></ol><div class="cards" id="cnK"></div><p class="note" id="cnN"></p>`;
  function draw() {
    const d = CPLX[cur], r = cplxInfo(d), sg = v => (v > 0 ? `+${v}` : v < 0 ? `${v}` : '0');
    const ligTxt = d.lig.map(([t, n, c]) => `${n} × ${t}（${sg(c)}）`).join('、');
    $('#cnC', el).innerHTML = `<li>方括號內是錯離子；方括號外是<b>外界離子</b>：${d.out.length ? d.out.map(([t, n]) => `${n} 個 ${t}`).join('、') : '沒有（整個是中性分子）'}</li>
<li>錯離子電荷 = ${r.neutral ? '0' : `−(外界離子總電荷) = ${sg(r.q)}`}</li>
<li>配位基：${ligTxt}</li>
<li>${d.m} 的氧化數 = ${sg(r.q)} − (${sg(d.lig.reduce((s, [, n, c]) => s + n * c, 0))}) = <b>${sg(r.ox)}</b></li>
<li>配位數 = ${d.lig.map(([t, n, , dent]) => dent > 1 ? `${n} × ${dent}（${t} 是雙牙）` : `${n}`).join(' + ')} = <b>${r.cn}</b></li>`;
    $('#cnK', el).innerHTML = card('ox', '中心金屬氧化數', `${sg(r.ox)}`) + card('cn', '配位數', r.cn) + card('ion', '溶於水的離子數', r.ions, '每 1 個化學式') + card('ag', '加過量 AgNO₃', `${r.agcl} mol AgCl`, '每 1 mol 錯合物');
    $('#cnN', el).innerHTML = `IUPAC 名稱：<b class="mono">${r.name}</b><br>只有<b>外界</b>的 Cl⁻ 會和 Ag⁺ 生成 AgCl 沉澱；配位在金屬上的 Cl⁻ 被緊緊抓住，不會沉澱。溶液中的離子數也只算外界離子加上錯離子本身，所以導電度和凝固點下降可以用來判斷結構。${d.mn.endsWith('ate') ? '錯離子帶負電時，金屬名稱改成 <b>-ate</b> 結尾，鐵、銀、銅、金、鉛、錫用拉丁字根（ferrate、argentate、cuprate、aurate、plumbate、stannate）。' : ''}`;
    pressSeg(el, 'cnS', cur);
  }
  bindSeg(el, 'cnS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 2. 幾何異構物：八面體與平面四方 ===== */
// 八面體六個位置的平面投影（T 上、U 下；赤道面 A、B、C、D，A–C、B–D 互為反式）
const OCT = { T: [0, -1], U: [0, 1], A: [-0.9, 0.18], B: [0.38, 0.4], C: [0.9, -0.18], D: [-0.38, -0.4] };
const SQP = { A: [-0.95, 0], B: [0, 0.62], C: [0.95, 0], D: [0, -0.62] };
const ISO = {
  ma4b2: { t: '[MA₄B₂]', geo: OCT, list: [['cis', { B: 'AB' }], ['trans', { B: 'TU' }]], note: 'MA₄B₂ 有 2 種幾何異構物：兩個 B 相鄰（cis，夾角 90°）或相對（trans，180°）。例：[Co(NH₃)₄Cl₂]⁺ 的 cis 是紫色、trans 是綠色。' },
  ma3b3: { t: '[MA₃B₃]', geo: OCT, list: [['fac', { B: 'TAB' }], ['mer', { B: 'TAU' }]], note: 'MA₃B₃ 有 2 種：三個 B 佔同一個三角面（fac，彼此都是 cis），或排在通過金屬的同一條「子午線」上（mer，其中兩個是 trans）。' },
  sq: { t: '平面 [MA₂B₂]', geo: SQP, list: [['cis', { B: 'AB' }], ['trans', { B: 'AC' }]], note: '平面四方的 MA₂B₂ 有 cis、trans 兩種，順鉑（cisplatin）就是 cis-[Pt(NH₃)₂Cl₂]，trans 異構物沒有抗癌活性。<b>四面體</b>的四個位置彼此都相鄰，MA₂B₂ 沒有幾何異構物。' },
  en2: { t: '[M(en)₂B₂]', geo: OCT, list: [['trans', { B: 'TU', en: ['AB', 'CD'] }], ['cis', { B: 'TA', en: ['BC', 'DU'] }], ['cis 的鏡像', { B: 'TA', en: ['BC', 'DU'], mir: 1 }]], note: 'trans 有對稱面，是非掌性的；cis 沒有對稱面，它和鏡像疊不起來，所以 cis-[Co(en)₂Cl₂]⁺ 有一對<b>鏡像異構物</b>（光學異構物）。合計 3 種立體異構物。' },
  ma2b2c2: { t: '[MA₂B₂C₂]', geo: OCT, list: [['全 trans', { A: 'TU', B: 'AC', C: 'BD' }], ['A trans', { A: 'TU', B: 'AB', C: 'CD' }], ['B trans', { B: 'TU', A: 'AB', C: 'CD' }], ['C trans', { C: 'TU', A: 'AB', B: 'CD' }], ['全 cis', { A: 'TA', B: 'BU', C: 'CD' }], ['全 cis 的鏡像', { A: 'TA', B: 'BU', C: 'CD', mir: 1 }]],
    note: 'MA₂B₂C₂ 有 <b>5 種幾何異構物</b>：三對都 trans、只有一對 trans（3 種）、三對都 cis。全 cis 的那一種是掌性的，再多一個鏡像，所以立體異構物共 6 種。' },
};
W.ciso = el => {
  let cur = 'ma4b2';
  el.innerHTML = `${seg('ciS', Object.entries(ISO).map(([k, v]) => [k, v.t]), cur)}<div class="isos" id="ciG"></div><p class="note" id="ciN"></p>`;
  const one = (geo, spec, cap) => {
    const s = 44, cx = 80, cy = 70, P = Object.fromEntries(Object.entries(geo).map(([k, [x, y]]) => [k, [cx + (spec.mir ? -x : x) * s * 1.25, cy + y * s * 1.15]]));
    const who = {}; ['A', 'B', 'C'].forEach(L => [...(spec[L] || '')].forEach(p => { who[p] = L; }));
    const enP = new Set((spec.en || []).join('').split(''));
    Object.keys(geo).forEach(p => { if (!who[p]) who[p] = enP.has(p) ? 'N' : 'A'; });
    const back = p => p === 'C' || p === 'D';
    const bonds = Object.keys(geo).map(p => `<line class="cb${back(p) && geo === OCT ? ' bk' : ''}" x1="${cx}" y1="${cy}" x2="${P[p][0]}" y2="${P[p][1]}"/>`).join('');
    const edge = geo === OCT ? `<path class="oct" d="M${P.A}L${P.B}L${P.C}L${P.D}Z"/>` : `<path class="oct" d="M${P.A}L${P.B}L${P.C}L${P.D}Z"/>`;
    const ens = (spec.en || []).map(([a, b]) => { const [x1, y1] = P[a], [x2, y2] = P[b], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ox = (mx - cx) * 0.55, oy = (my - cy) * 0.55;
      return `<path class="enarc" d="M${x1} ${y1}Q${mx + ox} ${my + oy} ${x2} ${y2}"/>`; }).join('');
    const ligs = Object.keys(geo).map(p => `<g class="lg lg-${who[p]}"><circle cx="${P[p][0]}" cy="${P[p][1]}" r="12"/><text x="${P[p][0]}" y="${P[p][1] + 4.5}" text-anchor="middle">${who[p]}</text></g>`).join('');
    return `<figure><svg class="mol iso" viewBox="0 0 160 150" role="img" aria-label="${esc(cap)}">${edge}${bonds}${ens}<circle class="mc" cx="${cx}" cy="${cy}" r="11"/><text class="mt" x="${cx}" y="${cy + 4.5}" text-anchor="middle">M</text>${ligs}</svg><figcaption>${cap}</figcaption></figure>`;
  };
  function draw() {
    const d = ISO[cur];
    $('#ciG', el).innerHTML = d.list.map(([cap, spec]) => one(d.geo, spec, cap)).join('');
    $('#ciN', el).innerHTML = d.note + (cur === 'en2' ? ' 圖中 N–N 弧線代表一個 en（乙二胺，雙牙配位基），只能跨在兩個 cis 位置上。' : '') + (d.geo === OCT ? ' 虛線是往紙面後方的鍵。' : '');
    pressSeg(el, 'ciS', cur);
  }
  bindSeg(el, 'ciS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.t || cur; draw(); } };
};

/* ===== 3. 晶體場：d 軌域分裂與電子填法 ===== */
const DION = { 'Ti³⁺': 1, 'V³⁺': 2, 'Cr³⁺': 3, 'Mn³⁺': 4, 'Mn²⁺': 5, 'Fe³⁺': 5, 'Fe²⁺': 6, 'Co³⁺': 6, 'Co²⁺': 7, 'Ni²⁺': 8, 'Cu²⁺': 9, 'Zn²⁺': 10 };
// 各幾何的能階：[名稱, 軌域數, 相對能量（Δo 為 1）, 示意位置]；平面四方的位置只表示順序，未依比例
const DGEO = {
  oct: { t: '八面體', lv: [['t₂g（dxy, dxz, dyz）', 3, -0.4, -0.4], ['e_g（dz², dx²−y²）', 2, 0.6, 0.6]], d: 'Δo' },
  tet: { t: '四面體', lv: [['e（dz², dx²−y²）', 2, -0.267, -0.27], ['t₂（dxy, dxz, dyz）', 3, 0.178, 0.18]], d: 'Δt ≈ 4/9 Δo' },
  sq: { t: '平面四方', lv: [['dxz, dyz', 2, null, -0.62], ['dz²', 1, null, -0.3], ['dxy', 1, null, 0.12], ['dx²−y²', 1, null, 0.95]], d: '最高的 dx²−y² 正對四個配位基' },
};
const DEX = [['[Fe(H₂O)₆]²⁺', 'Fe²⁺', 'oct', 'w'], ['[Fe(CN)₆]⁴⁻', 'Fe²⁺', 'oct', 's'], ['[Fe(CN)₆]³⁻', 'Fe³⁺', 'oct', 's'], ['[CoF₆]³⁻', 'Co³⁺', 'oct', 'w'], ['[Co(NH₃)₆]³⁺', 'Co³⁺', 'oct', 's'],
  ['[Co(H₂O)₆]²⁺', 'Co²⁺', 'oct', 'w'], ['[Mn(CN)₆]⁴⁻', 'Mn²⁺', 'oct', 's'], ['[FeCl₄]⁻', 'Fe³⁺', 'tet', 'w'], ['[NiCl₄]²⁻', 'Ni²⁺', 'tet', 'w'], ['[Ni(CN)₄]²⁻', 'Ni²⁺', 'sq', 's']];
const svgSub = s => s.replace(/^t₂g(.*)$/, 't<tspan dy="4" font-size="80%">2g</tspan><tspan dy="-4">$1</tspan>').replace(/^e_g(.*)$/, 'e<tspan dy="4" font-size="80%">g</tspan><tspan dy="-4">$1</tspan>');
function dfill(n, geo, strong) {
  const lv = DGEO[geo].lv, occ = lv.map(l => Array(l[1]).fill(0));
  if (geo === 'oct' && !strong || geo === 'tet') {   // 高自旋：先每個軌域各放一個，再由低往高配對
    let k = n; occ.forEach(o => o.forEach((_, i) => { if (k > 0) { o[i] = 1; k--; } }));
    occ.forEach(o => o.forEach((_, i) => { if (k > 0) { o[i] = 2; k--; } }));
  } else {                                            // 低自旋：一層填滿再往上
    let k = n; occ.forEach(o => { const m = Math.min(k, 2 * o.length); o.forEach((_, i) => { o[i] = m > i ? 1 : 0; }); o.forEach((_, i) => { if (m - o.length > i) o[i] = 2; }); k -= m; });
  }
  return occ;
}
W.cfield = el => {
  const st = { ion: 'Fe²⁺', geo: 'oct', f: 'w', ex: '[Fe(H₂O)₆]²⁺' };
  el.innerHTML = `<div class="w-row">${DEX.map(([t]) => `<button class="btn sm ghost" type="button" data-ex="${t}">${t}</button>`).join('')}</div>${seg('cfI', Object.keys(DION).map(k => [k, `${k} d${DION[k]}`]), st.ion)}${seg('cfG', Object.entries(DGEO).map(([k, v]) => [k, v.t]), st.geo)}${seg('cfF', [['w', '弱場配位基（高自旋）'], ['s', '強場配位基（低自旋）']], st.f)}<div id="cfD"></div><div class="cards" id="cfK"></div><p class="note" id="cfN"></p>`;
  function draw() {
    const n = DION[st.ion], g = DGEO[st.geo], strong = st.geo === 'sq' || (st.geo === 'oct' && st.f === 's'), occ = dfill(n, st.geo, strong);
    const W0 = 560, H = 250, mid = 125, sc = st.geo === 'oct' ? 150 : st.geo === 'tet' ? 150 : 95, lx = 40, rx = 230, ow = 34, gp = 10;
    const yOf = l => mid - l[3] * sc;
    const ele = (x, o) => o ? `<text class="ele" x="${x + ow / 2}" y="${0}" text-anchor="middle">${o === 2 ? '↑↓' : '↑'}</text>` : '';
    let s = `<text class="lab" x="${lx}" y="${mid + 32}">自由離子的 5 個 d 軌域</text>`;
    for (let i = 0; i < 5; i++) s += `<line class="lvl" x1="${lx + i * (ow * 0.7 + 6)}" x2="${lx + i * (ow * 0.7 + 6) + ow * 0.7}" y1="${mid}" y2="${mid}"/>`;
    g.lv.forEach((l, j) => { const y = yOf(l), w = l[1] * ow + (l[1] - 1) * gp;
      s += `<line class="conn" x1="${lx + 5 * (ow * 0.7 + 6)}" y1="${mid}" x2="${rx - 6}" y2="${y}"/>`;
      occ[j].forEach((o, i) => { const x = rx + i * (ow + gp); s += `<line class="lvl" x1="${x}" x2="${x + ow}" y1="${y}" y2="${y}"/>${ele(x, o).replace('y="0"', `y="${y - 6}"`)}`; });
      s += `<text class="tk" x="${rx + w + 12}" y="${y + 4}">${svgSub(l[0])}</text>`; });
    if (st.geo !== 'sq') { const y1 = yOf(g.lv[0]), y2 = yOf(g.lv[g.lv.length - 1]), x = rx - 20;
      s += `<line class="dlt" x1="${x}" x2="${x}" y1="${y1}" y2="${y2}"/><text class="lab" x="${x - 6}" y="${(y1 + y2) / 2 + 4}" text-anchor="end">${st.geo === 'oct' ? 'Δo' : 'Δt'}</text>`; }
    $('#cfD', el).innerHTML = `<svg class="en" style="max-width:640px" viewBox="0 0 ${W0} ${H}" role="img" aria-label="d 軌域分裂圖">${s}</svg>`;
    const unp = occ.flat().filter(o => o === 1).length;
    const cfse = st.geo === 'sq' ? null : occ.reduce((a, o, j) => a + o.reduce((b, x) => b + x, 0) * g.lv[j][2], 0);
    $('#cfK', el).innerHTML = card('n', '未成對電子', unp) + card('m', '磁性', unp ? '順磁' : '反磁') + card('mu', '自旋磁矩', `${fx(Math.sqrt(unp * (unp + 2)), 2)} BM`, '√(n(n+2))')
      + (cfse == null ? '' : card('cf', '晶體場穩定能', `${fx(cfse, 2)} Δo`, st.geo === 'tet' ? '以 Δo 表示' : '不含成對能'));
    const ex = DEX.find(e => e[0] === st.ex && e[1] === st.ion && e[2] === st.geo && (e[3] === st.f || st.geo !== 'oct'));
    const why = st.geo === 'tet' ? '四面體的分裂能只有八面體的約 4/9，比電子成對所需的能量小，所以<b>四面體錯合物幾乎都是高自旋</b>。'
      : st.geo === 'sq' ? '平面四方中 dx²−y² 正對四個配位基，能量特別高；d⁸ 的 Ni²⁺（強場）、Pd²⁺、Pt²⁺ 會把 8 個電子全部成對放在下面四個軌域，所以是<b>反磁性</b>。'
      : n >= 4 && n <= 7 ? (st.f === 's' ? '強場配位基使 Δo 大於成對能，電子寧可在 t<sub>2g</sub> 成對，也不往上跳到 e<sub>g</sub>：<b>低自旋</b>。' : '弱場配位基的 Δo 小於成對能，電子先各自佔一個軌域（包括 e<sub>g</sub>）再成對：<b>高自旋</b>。')
      : `d${n} 在八面體中高自旋和低自旋的填法相同，只有 d⁴–d⁷ 才需要判斷。`;
    $('#cfN', el).innerHTML = `${ex ? `<b>${ex[0]}</b>：` : ''}${st.ion} 是 d${n}（過渡金屬離子先失去 4s 電子）。${why}`;
    pressSeg(el, 'cfI', st.ion); pressSeg(el, 'cfG', st.geo); pressSeg(el, 'cfF', st.f);
    $$('#cfF button', el).forEach(b => { b.disabled = st.geo !== 'oct'; });
    $$('[data-ex]', el).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ex === st.ex)));
  }
  bindSeg(el, 'cfI', v => { st.ion = v; st.ex = ''; draw(); });
  bindSeg(el, 'cfG', v => { st.geo = v; st.ex = ''; draw(); });
  bindSeg(el, 'cfF', v => { st.f = v; st.ex = ''; draw(); });
  $$('[data-ex]', el).forEach(b => { b.onclick = () => { const e = DEX.find(x => x[0] === b.dataset.ex); Object.assign(st, { ex: e[0], ion: e[1], geo: e[2], f: e[3] }); draw(); }; });
  draw();
  return { set(s) { if (s.ex) { const e = DEX.find(x => x[0] === s.ex); Object.assign(st, { ex: e[0], ion: e[1], geo: e[2], f: e[3] }); } else Object.assign(st, s, { ex: '' }); draw(); } };
};

/* ===== 4. 顏色與光譜化學序列：[CrL₆] 的吸收 =====
   Cr³⁺ 八面體錯合物的 Δo（cm⁻¹，教科書常見值，四捨五入） */
const CRL = [['Cl⁻', '[CrCl₆]³⁻', 13600], ['F⁻', '[CrF₆]³⁻', 15200], ['H₂O', '[Cr(H₂O)₆]³⁺', 17400], ['NH₃', '[Cr(NH₃)₆]³⁺', 21600], ['en', '[Cr(en)₃]³⁺', 21900], ['CN⁻', '[Cr(CN)₆]³⁻', 26600]];
// 吸收波長 → 看到的顏色（互補色，近似）
const SEEN = [[400, '淡黃（吸收在紫外區）', '#EFE3A0'], [435, '黃綠', '#A9C23A'], [480, '黃', '#E3BC2E'], [490, '橙', '#E08A2E'], [500, '紅', '#C8402E'], [560, '紫紅', '#A8306E'], [580, '紫', '#7650A8'], [595, '藍', '#3F5BC8'], [650, '藍綠', '#2E8A8C'], [800, '綠', '#3E9550']];
W.ccolor = el => {
  let cur = 'H₂O';
  el.innerHTML = `${seg('ccS', CRL.map(([l]) => [l, l]), cur)}<p class="small mut">配位基由左到右照光譜化學序列排列：場強度（Δo）由弱到強。</p><div class="spec"><div class="spec-bar"></div><i id="ccM"></i><span class="spec-l">380 nm</span><span class="spec-r">750 nm</span></div><div class="cards" id="ccK"></div><p class="note" id="ccN"></p>`;
  function draw() {
    const [l, f, d] = CRL.find(x => x[0] === cur), lam = 1e7 / d, seen = SEEN.find(s => lam < s[0]) || SEEN[SEEN.length - 1];
    $('#ccM', el).style.left = `${clamp((lam - 380) / 370, 0, 1) * 100}%`;
    $('#ccK', el).innerHTML = card('d', 'Δo', `${d.toLocaleString()} cm⁻¹`, `${Math.round(d * 0.01196)} kJ/mol`) + card('l', '吸收波長', `${Math.round(lam)} nm`) + `<div class="card" data-k="c"><span>看到的顏色</span><b><i class="swatch" style="background:${seen[2]}"></i>${seen[1]}</b></div>`;
    $('#ccN', el).innerHTML = `<b>${f}</b>：電子吸收能量剛好等於 Δo 的光，從 t<sub>2g</sub> 跳到 e<sub>g</sub>。被吸收的顏色從白光中扣掉，眼睛看到的是它的<b>互補色</b>。配位基場越強 → Δo 越大 → 吸收的光能量越高、<b>波長越短</b>。${cur === 'CN⁻' ? '這裡的吸收已經跑到紫外區，可見光幾乎沒被吸收，所以顏色很淡。' : ''} d⁰ 和 d¹⁰（例如 Zn²⁺、Sc³⁺、Cu⁺）沒有 d–d 躍遷，溶液通常無色。`;
    pressSeg(el, 'ccS', cur);
  }
  bindSeg(el, 'ccS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.l || cur; draw(); } };
};
