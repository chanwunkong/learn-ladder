/* ---------- 後中化學：配位化學的互動圖 ----------
   原則：讀者自己拖拉、切換；公式的每一項都對應圖上看得到的長度、位置或數字。 */

/* ===== 1. 錯合物拆解：電荷收支圖 =====
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
  return { q, ox, ligQ, cn, name, ions: d.out.length ? 1 + d.out.reduce((s, [, n]) => s + n, 0) : 1, agcl: an && an[0] === 'Cl⁻' ? an[1] : 0 };
}
W.cname = el => {
  let cur = 'co5';
  el.innerHTML = `${seg('cnS', Object.entries(CPLX).map(([k, v]) => [k, v.f]), cur)}<div class="qbal" id="cnQ"></div><div class="cards" id="cnK"></div><p class="note" id="cnN"></p>`;
  const sg = v => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0');
  const chips = (t, n, q, cls) => Array.from({ length: n }, () => `<span class="qc ${cls}${q > 0 ? ' pos' : q < 0 ? ' neg' : ''}">${t}<small>${sg(q)}</small></span>`).join('');
  function draw() {
    const d = CPLX[cur], r = cplxInfo(d);
    $('#cnQ', el).innerHTML = `<div class="qrow"><span class="qlab">方括號裡</span><span class="qbox">${chips(d.m, 1, r.ox, 'metal')}${d.lig.map(([t, n, c, dent]) => chips(t + (dent > 1 ? '（雙牙）' : ''), n, c, 'lig')).join('')}</span><span class="qsum">${sg(r.q)}</span></div>
<div class="qrow"><span class="qlab">方括號外</span><span class="qbox">${d.out.length ? d.out.map(([t, n, c]) => chips(t, n, c, 'out')).join('') : '<span class="mut small">（沒有，整個是中性分子）</span>'}</span><span class="qsum">${sg(-r.q)}</span></div>
<div class="qrow tot"><span class="qlab">全部加起來</span><span class="qbox"></span><span class="qsum">0</span></div>`;
    $('#cnK', el).innerHTML = card('ox', `${d.m} 的氧化數`, sg(r.ox), `${sg(r.q)} − (${sg(r.ligQ)})`) + card('cn', '配位數', r.cn, '數方括號裡抓住金屬的手') + card('ion', '溶於水的粒子', r.ions, '錯離子 1 + 外界離子') + card('ag', '加過量 AgNO₃', `${r.agcl} AgCl`, '只有外界 Cl⁻ 會沉澱');
    $('#cnN', el).innerHTML = `把每個離子想成帶電的小方塊：<b>整個化合物的電荷收支一定是 0</b>。方括號外的方塊決定錯離子帶多少電，再扣掉配位基的電荷，剩下的就是金屬的氧化數。<br>IUPAC 名稱：<b class="mono">${r.name}</b>`;
    pressSeg(el, 'cnS', cur);
  }
  bindSeg(el, 'cnS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 2. d 軌域分裂：拖近配位基 ===== */
const DORB = {
  xy: ['dxy', 't', [[1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0]]],
  xz: ['dxz', 't', [[1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1]]],
  yz: ['dyz', 't', [[0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1]]],
  z2: ['dz²', 'e', [[0, 0, 1], [0, 0, -1]]],
  x2: ['dx²−y²', 'e', [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]]],
};
W.dsplit = el => {
  const st = { c: 0, o: 'x2' };
  el.innerHTML = `<div class="w-row"><label class="rng">讓配位基靠近 →<input type="range" id="dsR" min="0" max="1" step="0.05"><output class="mono" id="dsO"></output></label></div>${seg('dsS', Object.entries(DORB).map(([k, v]) => [k, v[0]]), st.o)}<div class="mrow two" id="dsG"></div><p class="eq" id="dsF"></p><p class="note" id="dsN"></p>`;
  const cx = 165, cy = 150, L = 55, EX = [-0.55, 0.4], EY = [0.95, 0.04], EZ = [0, -0.95];
  const pj = v => [v[0] * EX[0] + v[1] * EY[0] + v[2] * EZ[0], v[0] * EX[1] + v[1] * EY[1] + v[2] * EZ[1]];
  const P = (v, k = 1) => { const [x, y] = pj(v); return [cx + x * L * k, cy + y * L * k]; };
  const mix = (a, b, t) => { const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  function lobe(d, col, big) {
    const n = Math.hypot(...d), u = d.map(x => x / n), [sx, sy] = pj(u), len = Math.hypot(sx, sy), [x, y] = P(u, big ? 0.72 : 0.62);
    return `<ellipse cx="${x}" cy="${y}" rx="${L * (big ? 0.58 : 0.5) * Math.max(len, 0.35)}" ry="${L * 0.23}" transform="rotate(${Math.atan2(sy, sx) * 180 / Math.PI} ${x} ${y})" fill="${col}" class="lobe"/>`;
  }
  function draw() {
    const c = st.c, rr = 2.4 - 1.2 * c, D = 120 * c, o = DORB[st.o], up = o[1] === 'e';
    const col = mix('#9AA3A0', up ? '#D0443C' : '#3D6FD6', c);
    let s = ['x', 'y', 'z'].map((a, i) => { const v = [0, 0, 0]; v[i] = 1.75; const w = v.map(x => -x), [x1, y1] = P(w), [x2, y2] = P(v), [tx, ty] = P(v.map(x => x * 1.1)); return `<line class="axl" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="tk" x="${tx}" y="${ty + 4}" text-anchor="middle">${a}</text>`; }).join('');
    s += o[2].map(d => lobe(d, col, st.o === 'z2')).join('');
    if (st.o === 'z2') s += `<path class="lobe" fill="${col}" d="${Array.from({ length: 37 }, (_, i) => { const t = i * Math.PI / 18, [x, y] = P([Math.cos(t) * 0.42, Math.sin(t) * 0.42, 0]); return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; }).join('')}Z" fill-opacity=".85"/>`;
    s += `<circle class="mc" cx="${cx}" cy="${cy}" r="6"/>`;
    [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(d => { const [x, y] = P(d.map(v => v * rr)); s += `<circle class="lgd" cx="${x}" cy="${y}" r="${9 - 2 * (d[0] < 0)}"/>`; });
    const sL = s; s = '';   // 右邊：能階
    const yb = 150, ye = yb - 0.6 * D, yt = yb + 0.4 * D;
    s += `<line class="conn" x1="390" x2="620" y1="${yb}" y2="${yb}"/>`;
    [['xy', 400], ['xz', 445], ['yz', 490]].forEach(([k, x]) => { s += `<line class="lvl${st.o === k ? ' on' : ''}" x1="${x}" x2="${x + 36}" y1="${yt}" y2="${yt}" style="stroke:${st.o === k ? '' : mix('#1A211F', '#3D6FD6', c)}"/>`; });
    [['z2', 545], ['x2', 590]].forEach(([k, x]) => { s += `<line class="lvl${st.o === k ? ' on' : ''}" x1="${x}" x2="${x + 36}" y1="${ye}" y2="${ye}" style="stroke:${st.o === k ? '' : mix('#1A211F', '#D0443C', c)}"/>`; });
    s += `<text class="tk" x="463" y="${yt + 20}" text-anchor="middle">t₂g（dxy dxz dyz）</text><text class="tk" x="585" y="${ye - 10}" text-anchor="middle">eg（dz² dx²−y²）</text>`;
    if (D >= 60) s += `<line class="dlt up" x1="378" x2="378" y1="${yb}" y2="${ye}"/><line class="dlt dn" x1="378" x2="378" y1="${yb}" y2="${yt}"/><text class="lab" x="372" y="${(yb + ye) / 2 + 4}" text-anchor="end">+0.6Δo</text><text class="lab" x="372" y="${(yb + yt) / 2 + 4}" text-anchor="end">−0.4Δo</text>`;
    $('#dsG', el).innerHTML = `<figure><svg class="en" viewBox="0 0 320 300" role="img" aria-label="d 軌域與配位基">${sL}</svg></figure><figure class="wide"><svg class="en" viewBox="320 0 320 300" role="img" aria-label="能階分裂">${s}</svg></figure>`;
    $('#dsR', el).value = st.c; $('#dsO', el).textContent = c < 0.05 ? '很遠' : c > 0.95 ? '貼近' : `${Math.round(c * 100)}%`;
    $('#dsF', el).innerHTML = `Δo ＝ ${Math.round(c * 100)}（任意單位）　　平衡：3 × (−0.4Δo) + 2 × (+0.6Δo) = ${fx(Math.abs(3 * -0.4 * c * 100 + 2 * 0.6 * c * 100), 0)}`;
    $('#dsN', el).innerHTML = c < 0.05 ? '配位基還很遠：五個 d 軌域能量一樣，畫在同一條線上。把滑桿往右拖，讓六個灰色的配位基沿著 x、y、z 軸靠近。'
      : up ? `<b>${o[0]}</b> 的花瓣<b>正對著</b>軸上的配位基（灰色球），電子雲被負電排斥，能量<b>往上推</b>。這兩個軌域合稱 eg。`
        : `<b>${o[0]}</b> 的花瓣<b>夾在兩軸中間</b>，閃開了配位基，能量<b>往下掉</b>。這三個軌域合稱 t₂g。`;
    pressSeg(el, 'dsS', st.o);
  }
  $('#dsR', el).oninput = e => { st.c = +e.target.value; draw(); };
  bindSeg(el, 'dsS', v => { st.o = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. 爬樓梯還是擠一擠：高自旋與低自旋 ===== */
const SPINEX = [['[Cr(H₂O)₆]³⁺', 3, 0.7], ['[Fe(H₂O)₆]²⁺', 6, 0.5], ['[Fe(CN)₆]⁴⁻', 6, 1.7], ['[CoF₆]³⁻', 6, 0.7], ['[Co(NH₃)₆]³⁺', 6, 1.5], ['[Mn(CN)₆]⁴⁻', 5, 1.5], ['[Co(H₂O)₆]²⁺', 7, 0.5], ['[Ni(H₂O)₆]²⁺', 8, 0.7]];
function spinFill(n, low) {   // 回傳 5 個格子（t₂g×3, eg×2）各放幾顆
  const ord = low ? [0, 1, 2, 0, 1, 2, 3, 4, 3, 4] : [0, 1, 2, 3, 4, 0, 1, 2, 3, 4], occ = [0, 0, 0, 0, 0];
  ord.slice(0, n).forEach(i => occ[i]++);
  return occ;
}
const spinCost = (occ, g) => { const up = occ[3] + occ[4], pr = occ.filter(o => o === 2).length; return { up, pr, v: up * g + pr }; };
W.spin = el => {
  const st = { n: 6, g: 0.5, ex: '[Fe(H₂O)₆]²⁺' };
  el.innerHTML = `<div class="w-row">${SPINEX.map(([t]) => `<button class="btn sm ghost" type="button" data-ex="${t}">${t}</button>`).join('')}</div>
<div class="w-row"><button class="btn sm" type="button" data-n="-1">－ 拿走一顆電子</button><button class="btn sm pri" type="button" data-n="1">＋ 放一顆電子</button><label class="rng">樓梯高度 Δo（以成對能 P 為 1）<input type="range" id="spG" min="0.3" max="1.9" step="0.2"><output class="mono" id="spO"></output></label></div>
<div id="spD"></div><div class="bars pk spc" id="spB"></div><div class="cards" id="spK"></div><p class="note" id="spN"></p>`;
  function draw() {
    const hi = spinFill(st.n, false), lo = spinFill(st.n, true), ch = spinCost(hi, st.g), cl = spinCost(lo, st.g), low = cl.v < ch.v - 1e-9, occ = low ? lo : hi;
    const yt = 170, ye = yt - st.g * 50, sx = [300, 370, 440, 335, 405], sy = [yt, yt, yt, ye, ye];
    let s = '';
    sx.forEach((x, i) => {
      s += `<line class="lvl" x1="${x - 26}" x2="${x + 26}" y1="${sy[i]}" y2="${sy[i]}"/>`;
      const k = occ[i]; for (let j = 0; j < k; j++) { const bx = k === 2 ? x + (j ? 11 : -11) : x; s += `<circle class="eball${j ? ' dn' : ''}" cx="${bx}" cy="${sy[i] - 12}" r="9"/><text class="ebt" x="${bx}" y="${sy[i] - 8}" text-anchor="middle">${j ? '↓' : '↑'}</text>`; }
    });
    s += `<path class="stairs" d="M480 ${yt}${Array.from({ length: 4 }, (_, i) => `H${488 + i * 10}V${yt - (yt - ye) * (i + 1) / 4}`).join('')}H${530}"/><text class="lab" x="540" y="${(yt + ye) / 2 + 4}">爬樓梯：Δo</text>`;
    s += `<text class="tk" x="370" y="${yt + 22}" text-anchor="middle">t₂g（下層 3 格）</text><text class="tk" x="370" y="${ye - 32}" text-anchor="middle">eg（上層 2 格）</text>`;
    $('#spD', el).innerHTML = `<svg class="en" style="max-width:600px;margin:auto" viewBox="230 30 400 170" role="img" aria-label="電子填入 d 軌域">${s}</svg>`;
    const U = 26, row = (nm, c, on) => `<div class="${on ? 'on' : ''}"><span>${nm}<small class="mono">${c.up}×${fx(st.g, 1)} + ${c.pr}×1 = ${fx(c.v, 1)}</small></span><span class="stk"><i class="ba up" style="width:${c.up * st.g * U}px"></i><i class="ba pr" style="width:${c.pr * U}px"></i></span></div>`;
    $('#spB', el).innerHTML = row('高自旋：先上樓', ch, !low) + row('低自旋：先擠一擠', cl, low);
    const unp = occ.filter(o => o === 1).length;
    $('#spK', el).innerHTML = card('n', '電子數', `d${st.n}`) + card('u', '未成對電子 n', unp) + card('m', '磁性', unp ? '順磁（被磁鐵吸）' : '反磁') + card('mu', '磁矩 μ = √(n(n+2))', `${fx(Math.sqrt(unp * (unp + 2)), 2)} BM`, `√(${unp}×${unp + 2})`);
    $('#spN', el).innerHTML = `長條圖就是公式：橘色＝上樓的電子數 × Δo，灰色＝成對數 × P。電子選<b>總長度較短</b>的那一種。${Math.abs(ch.v - cl.v) < 1e-9 ? `d${st.n} 兩種放法一樣，不用選。` : low ? '樓梯太高，寧可在下層擠一擠：<b>低自旋</b>。' : '樓梯很矮，上樓比擠在一起便宜：<b>高自旋</b>。'} 只有 d⁴～d⁷ 會出現兩種選擇。`;
    $('#spG', el).value = st.g; $('#spO', el).textContent = `${fx(st.g, 1)} P`;
    $('[data-n="-1"]', el).disabled = st.n <= 1; $('[data-n="1"]', el).disabled = st.n >= 10;
    $$('[data-ex]', el).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ex === st.ex)));
  }
  $('#spG', el).oninput = e => { st.g = +e.target.value; st.ex = ''; draw(); };
  $$('[data-n]', el).forEach(b => { b.onclick = () => { st.n = clamp(st.n + +b.dataset.n, 1, 10); st.ex = ''; draw(); }; });
  $$('[data-ex]', el).forEach(b => { b.onclick = () => { const e = SPINEX.find(x => x[0] === b.dataset.ex); Object.assign(st, { ex: e[0], n: e[1], g: e[2] }); draw(); }; });
  draw();
  return { set(s) { if (s.ex) { const e = SPINEX.find(x => x[0] === s.ex); Object.assign(st, { ex: e[0], n: e[1], g: e[2] }); } else Object.assign(st, s, { ex: '' }); draw(); } };
};

/* ===== 4. 吃掉一種顏色：Δ = hc/λ 與色輪 =====
   Cr³⁺ 八面體錯合物的 Δo（cm⁻¹，教科書常見值，四捨五入） */
const CRL = [['Cl⁻', '[CrCl₆]³⁻', 13600], ['F⁻', '[CrF₆]³⁻', 15200], ['H₂O', '[Cr(H₂O)₆]³⁺', 17400], ['NH₃', '[Cr(NH₃)₆]³⁺', 21600], ['en', '[Cr(en)₃]³⁺', 21900], ['CN⁻', '[Cr(CN)₆]³⁻', 26600]];
// 色輪：相對的兩色互為互補色。[名稱, 顏色, 波長下限, 上限]
const WHEEL = [['紅', '#D0352B', 650, 760], ['橙', '#EE8A25', 590, 650], ['黃', '#F2D23A', 560, 590], ['綠', '#3BA55C', 490, 560], ['藍', '#2F6FD6', 430, 490], ['紫', '#7A45B5', 380, 430]];
W.colorwheel = el => {
  let cur = 'H₂O';
  el.innerHTML = `${seg('cwS', CRL.map(([l]) => [l, l]), cur)}<p class="small mut">按鈕由左到右是光譜化學序列：配位基的「推力」由弱到強。</p><div class="mrow" id="cwG"></div><p class="eq" id="cwF"></p><p class="note" id="cwN"></p>`;
  function draw() {
    const [, f, cm] = CRL.find(x => x[0] === cur), E = cm * 0.01196, lam = 119600 / E, ai = WHEEL.findIndex(w => lam >= w[2] && lam < w[3]), si = ai < 0 ? -1 : (ai + 3) % 6;
    const xs = Array.from({ length: 81 }, (_, i) => 360 + i * 5);
    const plot = chart({ w: 340, h: 250, x: [360, 760], y: [140, 340], xt: [400, 500, 600, 700], yt: [150, 200, 250, 300], xlab: '被吃掉的光的波長 λ（nm）', ylab: 'Δo（kJ/mol）', label: 'Δ 與波長' }, (X, Y) =>
      `${WHEEL.map(w => `<rect x="${X(Math.max(360, w[2]))}" y="${Y(140) - 6}" width="${X(w[3]) - X(Math.max(360, w[2]))}" height="6" fill="${w[1]}"/>`).join('')}<path class="tline" d="${path(xs.map(x => [X(x), Y(119600 / x)]))}"/>`
      + `<line class="mk" x1="${X(lam)}" x2="${X(lam)}" y1="${Y(E)}" y2="${Y(140)}"/><line class="mk" x1="${X(360)}" x2="${X(lam)}" y1="${Y(E)}" y2="${Y(E)}"/><circle class="dot" cx="${X(lam)}" cy="${Y(E)}" r="7"/>`);
    const R = 92, r0 = 44, cx = 115, cy = 115, arc = (i, rr) => { const a = (-90 + i * 60) * Math.PI / 180; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; };
    const segs = WHEEL.map((w, i) => { const [a, b, c, d] = [arc(i - 0.5, R), arc(i + 0.5, R), arc(i + 0.5, r0), arc(i - 0.5, r0)], [tx, ty] = arc(i, (R + r0) / 2);
      return `<path class="wseg${i === ai ? ' eat' : ''}${i === si ? ' see' : ''}" d="M${a}A${R} ${R} 0 0 1 ${b}L${c}A${r0} ${r0} 0 0 0 ${d}Z" fill="${w[1]}"/><text class="wl" x="${tx}" y="${ty + 5}" text-anchor="middle">${w[0]}</text>`; }).join('');
    const cut = ai < 0 ? '' : (() => { const [x1, y1] = arc(ai, r0 - 4), [x2, y2] = arc(si, r0 - 4); return `<line class="wcut" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#wa)"/>`; })();
    const wheel = `<svg class="ch" viewBox="0 0 230 230" role="img" aria-label="互補色色輪"><defs><marker id="wa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="ahp"/></marker></defs>${segs}<circle cx="${cx}" cy="${cy}" r="${r0 - 8}" fill="${si < 0 ? '#F4EFC8' : WHEEL[si][1]}" class="wsol"/>${cut}</svg>`;
    $('#cwG', el).innerHTML = `<figure class="wide">${plot}</figure><figure>${wheel}<figcaption>中間圓＝溶液看起來的顏色</figcaption></figure>`;
    $('#cwF', el).innerHTML = `Δo = hc/λ　→　λ = 119,600 ÷ Δo(kJ/mol) = 119,600 ÷ ${Math.round(E)} = <b>${Math.round(lam)} nm</b>`;
    $('#cwN', el).innerHTML = `<b>${f}</b>：${ai < 0 ? '樓梯太高，要吃的是紫外光；可見光幾乎都穿過去，溶液顏色很淡。' : `電子跳上樓梯時吃掉<b>${WHEEL[ai][0]}光</b>（色輪上變暗的那一格），剩下的光混起來，就是它在色輪<b>正對面</b>的<b>${WHEEL[si][0]}色</b>。`} 配位基推力越強 → 樓梯 Δo 越高 → 曲線上的點往左上走 → 吃掉的光越偏藍紫。`;
    pressSeg(el, 'cwS', cur);
  }
  bindSeg(el, 'cwS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.l || cur; draw(); } };
};

/* ===== 5. 可以轉的八面體：異構物與鏡像 =====
   六個方向：+x −x +y −y +z −z；lab：各方向的配位基；en：雙牙配位基跨的兩個方向 */
const OD = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const OPRE = {
  cis42: { t: 'cis-[MA₄B₂]', lab: 'BABAAA', en: [] },
  trans42: { t: 'trans-[MA₄B₂]', lab: 'AAAABB', en: [] },
  fac: { t: 'fac-[MA₃B₃]', lab: 'BABABA', en: [] },
  mer: { t: 'mer-[MA₃B₃]', lab: 'BBBAAA', en: [] },
  cisen: { t: 'cis-[M(en)₂B₂]', lab: 'BNBNNN', en: [[1, 4], [3, 5]] },
  transen: { t: 'trans-[M(en)₂B₂]', lab: 'NNNNBB', en: [[0, 2], [1, 3]] },
  abc: { t: '全 cis-[MA₂B₂C₂]', lab: 'ABACBC', en: [] },
};
const m3 = (A, B) => A.map((r, i) => B[0].map((_, j) => r.reduce((s, _, k) => s + A[i][k] * B[k][j], 0)));
const mv = (A, v) => A.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
const rotA = (ax, t) => { const [x, y, z] = ax, c = Math.cos(t), s = Math.sin(t), C = 1 - c; return [[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]]; };
const I3 = () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const det3 = A => A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
const SIGNED = (() => { const out = [], ps = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  ps.forEach(p => [1, -1].forEach(a => [1, -1].forEach(b => [1, -1].forEach(c => { const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], sg = [a, b, c]; p.forEach((j, i) => { M[i][j] = sg[i]; }); out.push(M); })))); return out; })();
const dirIdx = v => OD.findIndex(d => d.every((x, i) => Math.abs(x - v[i]) < 1e-6));
// 鏡像能否用一個轉動疊回原本的樣子：找行列式 −1 的對稱操作 G，使配位基與 en 都對得上
function mirrorMatch(p) {
  return SIGNED.filter(G => det3(G) < 0).find(G => OD.every((v, i) => p.lab[dirIdx(mv(G, v))] === p.lab[i])
    && p.en.every(([a, b]) => { const A = dirIdx(mv(G, OD[a])), B = dirIdx(mv(G, OD[b])); return p.en.some(([c, d]) => (c === A && d === B) || (c === B && d === A)); })) || null;
}
W.oct3d = el => {
  let cur = 'cisen';
  const V0 = m3(rotA([1, 0, 0], 0.38), rotA([0, 1, 0], -0.55)), S = [[-1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const st = { D: [I3(), I3()], A: I3() };   // D：兩個模型各自被拖動的轉動；A：鏡像模型自己的轉動
  el.innerHTML = `${seg('o3S', Object.entries(OPRE).map(([k, v]) => [k, v.t]), cur)}<div id="o3G" class="o3g"></div><div class="w-row"><button class="btn sm pri" type="button" data-fit>疊疊看：右邊轉得成左邊嗎？</button><button class="btn sm" type="button" data-reset>轉回原位</button></div><p class="note" id="o3N"></p>`;
  const T = m3(m3(V0.map((r, i) => V0.map(q => q[i])), S), V0);   // 模型空間中的鏡射：Vᵀ S V
  function model(k) {   // 回傳畫面座標
    const p = OPRE[cur], M = k ? m3(st.D[1], m3(V0, m3(st.A, T))) : m3(st.D[0], V0), cx = k ? 380 : 140;
    return { pts: OD.map((v, i) => { const [x, y, z] = mv(M, v); return { i, x: cx + x * 78, y: 135 - y * 78, z, l: p.lab[i] }; }), cx };
  }
  function scene(k) {
    const { pts, cx } = model(k), p = OPRE[cur], order = [...pts].sort((a, b) => a.z - b.z);
    let s = '';
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (OD[i].every((x, q) => x + OD[j][q] !== 0 || x === 0) && dirIdx(OD[i].map(x => -x)) !== j) s += `<line class="oe" x1="${pts[i].x}" y1="${pts[i].y}" x2="${pts[j].x}" y2="${pts[j].y}"/>`;
    const far = order.filter(q => q.z < 0), near = order.filter(q => q.z >= 0);
    const bond = q => `<line class="cb" x1="${cx}" y1="135" x2="${q.x}" y2="${q.y}"/>`;
    const lig = q => { const r = 14 + 3 * q.z; return `<g class="lg lg-${q.l}"><circle cx="${q.x}" cy="${q.y}" r="${r}"/><text x="${q.x}" y="${q.y + 4.5}" text-anchor="middle">${q.l}</text></g>`; };
    const ens = p.en.map(([a, b]) => { const A = pts[a], B = pts[b], mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2; return `<path class="enarc" d="M${A.x} ${A.y}Q${mx + (mx - cx) * 0.6} ${my + (my - 135) * 0.6} ${B.x} ${B.y}"/>`; }).join('');
    return s + ens + far.map(bond).join('') + far.map(lig).join('') + `<circle class="mc" cx="${cx}" cy="135" r="12"/><text class="mt" x="${cx}" y="139.5" text-anchor="middle">M</text>` + near.map(bond).join('') + near.map(lig).join('');
  }
  function draw(msg) {
    $('#o3G', el).innerHTML = `<svg class="mol o3" viewBox="20 0 480 270" role="img" aria-label="可轉動的八面體與鏡像"><line class="mirror" x1="260" x2="260" y1="10" y2="245"/><text class="tk" x="260" y="262" text-anchor="middle">鏡子</text>${scene(0)}${scene(1)}</svg>`;
    $('#o3N', el).innerHTML = msg || `用手指或滑鼠<b>拖動</b>左右兩個模型，自己轉轉看。右邊是左邊在鏡子裡的樣子。${OPRE[cur].en.length ? '綠色弧線是一個 en（雙牙配位基），只能跨在相鄰的兩個位置。' : ''} 按「疊疊看」檢查：有沒有一種轉法能讓右邊和左邊完全重合？`;
    pressSeg(el, 'o3S', cur);
  }
  function fit() {
    const G = mirrorMatch(OPRE[cur]);
    st.D = [I3(), I3()];
    if (G) { st.A = m3(G, T); draw(`<span class="ok">疊得起來</span>：把右邊轉一下就和左邊一模一樣（現在兩邊排列相同）。所以它和鏡像是<b>同一個分子</b>，<b>沒有光學異構物</b>（非掌性）。`); }
    else { st.A = I3(); draw(`<span class="bad">疊不起來</span>：八面體一共只有 24 種轉法，全部試過，右邊都無法和左邊重合。左右是一對<b>鏡像異構物</b>（光學異構物），這個錯合物是<b>掌性</b>的。`); }
  }
  let drag = null;
  el.addEventListener('pointerdown', e => { const svg = e.target.closest('svg.o3'); if (!svg) return; const b = svg.getBoundingClientRect(); drag = { k: (e.clientX - b.left) / b.width > 0.5 ? 1 : 0, x: e.clientX, y: e.clientY }; svg.setPointerCapture?.(e.pointerId); });
  el.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
    st.D[drag.k] = m3(m3(rotA([0, 1, 0], dx * 0.012), rotA([1, 0, 0], dy * 0.012)), st.D[drag.k]); draw(); });
  el.addEventListener('pointerup', () => { drag = null; });
  bindSeg(el, 'o3S', v => { cur = v; st.D = [I3(), I3()]; st.A = I3(); draw(); });
  $('[data-fit]', el).onclick = fit;
  $('[data-reset]', el).onclick = () => { st.D = [I3(), I3()]; st.A = I3(); draw(); };
  draw();
  return { set(s) { if (s.t) { cur = s.t; st.D = [I3(), I3()]; st.A = I3(); } draw(); if (s.fit) fit(); } };
};
