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
  aq: { f: '[Co(H₂O)₆]Br₃', m: 'Co', mn: 'cobalt', lig: [['H₂O', 6, 0, 1, 'aqua']], out: [['Br⁻', 3, -1]] },
  ox: { f: 'Na[Cr(C₂O₄)₂(H₂O)₂]', m: 'Cr', mn: 'chromate', lig: [['H₂O', 2, 0, 1, 'aqua'], ['C₂O₄²⁻', 2, -2, 2, 'oxalato']], out: [['Na⁺', 1, 1]] },
};
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI'];
const GROUP = { Cr: 6, Fe: 8, Co: 9, Ni: 10, Pt: 10, Ag: 11 };   // 過渡金屬的族數：d 電子數 = 族數 − 氧化數
const MULT = ['', '', 'di', 'tri', 'tetra', 'penta', 'hexa'], MULT2 = ['', '', 'bis', 'tris', 'tetrakis'];
const CNAME_OUT = { 'Cl⁻': 'chloride', 'Br⁻': 'bromide', 'K⁺': 'potassium', 'Na⁺': 'sodium' };
function cplxInfo(d) {
  const outQ = d.out.reduce((s, [, n, q]) => s + n * q, 0), q = -outQ, ligQ = d.lig.reduce((s, [, n, c]) => s + n * c, 0), ox = q - ligQ;
  const cn = d.lig.reduce((s, [, n, , dent]) => s + n * dent, 0);
  const lig = [...d.lig].sort((a, b) => a[4].localeCompare(b[4])).map(([, n, , , nm]) => (nm === 'ethylenediamine' ? `${MULT2[n]}(${nm})` : MULT[n] + nm)).join('');
  const core = `${lig}${d.mn}(${ROMAN[ox]})`, cat = d.out.find(o => o[2] > 0), an = d.out.find(o => o[2] < 0);
  const name = cat ? `${CNAME_OUT[cat[0]]} ${core}` : an ? `${core} ${CNAME_OUT[an[0]]}` : core;
  return { q, ox, ligQ, cn, name, ions: d.out.length ? 1 + d.out.reduce((s, [, n]) => s + n, 0) : 1, agcl: an && an[0] === 'Cl⁻' ? an[1] : 0 };
}
W.cname = el => {
  let cur = 'co5';
  el.innerHTML = `${seg('cnS', Object.entries(CPLX).map(([k, v]) => [k, v.f]), cur)}<div id="cnG"></div><div class="qeq" id="cnQ"></div><div class="cards" id="cnK"></div><p class="note" id="cnN"></p>`;
  const sg = v => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0');
  const chg = q => (q === 0 ? '' : `${Math.abs(q) > 1 ? Math.abs(q) : ''}${q > 0 ? '+' : '−'}`);
  const PAL = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)'];
  function draw() {
    const d = CPLX[cur], r = cplxInfo(d), cx = 230, cy = 120, R = 84;
    const ang = r.cn === 6 ? [90, 30, -30, -90, -150, 150] : r.cn === 4 ? [90, 0, -90, 180] : [180, 0];
    const P = (a, rr) => [cx + Math.cos(a * Math.PI / 180) * rr, cy - Math.sin(a * Math.PI / 180) * rr];
    let s = '', k = 0;
    d.lig.forEach(([t, n, c, dent], li) => { const fc = `style="fill:${PAL[li]}"`; for (let i = 0; i < n; i++) {
      if (dent === 1) { const [x, y] = P(ang[k], R); s += `<line class="cb" x1="${cx}" y1="${cy}" x2="${P(ang[k], R - 16)[0]}" y2="${P(ang[k], R - 16)[1]}"/><text class="cl" ${fc} x="${x}" y="${y + 5}" text-anchor="middle">${t}</text>`; k++; }
      else { const a1 = ang[k], a2 = ang[k + 1], [x1, y1] = P(a1, R - 14), [x2, y2] = P(a2, R - 14), [lx, ly] = P((a1 + a2) / 2 + (Math.abs(a1 - a2) > 180 ? 180 : 0), R + 6);
        s += `<line class="cb" x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}"/><line class="cb" x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}"/><path class="biden" d="M${x1} ${y1}Q${lx} ${ly} ${x2} ${y2}"/><text class="cl" ${fc} x="${lx}" y="${ly + 5}" text-anchor="middle">${t}</text>`; k += 2; }
    } });
    s += `<circle class="cm" cx="${cx}" cy="${cy}" r="27"/><text class="cmt" x="${cx}" y="${cy + 1}" text-anchor="middle">${d.m}</text><text class="cmq" x="${cx}" y="${cy + 16}" text-anchor="middle">${sg(r.ox)}</text>`;
    s += `<path class="brk" d="M128 22H114V218H128"/><path class="brk" d="M332 22H346V218H332"/>${r.q ? `<text class="cq" x="352" y="30">${chg(r.q)}</text>` : ''}`;
    const outs = d.out.flatMap(([t, n, c]) => Array.from({ length: n }, () => [t, c])), cat = outs.filter(o => o[1] > 0), an = outs.filter(o => o[1] < 0);
    const col = (arr, x0) => arr.map(([t], i) => { const x = x0 + (i % 2) * 44, y = 70 + Math.floor(i / 2) * 50; return `<circle class="oi" cx="${x}" cy="${y}" r="18"/><text class="oit" x="${x}" y="${y + 5}" text-anchor="middle">${t}</text>`; }).join('');
    s += col(cat, 30) + col(an, 392);
    if (outs.length) s += `<text class="tk" x="${cat.length ? 52 : 414}" y="212" text-anchor="middle">外界離子</text>`;
    $('#cnG', el).innerHTML = `<svg class="mol cpx" style="max-width:560px;margin:auto" viewBox="0 0 460 236" role="img" aria-label="${esc(d.f)} 的結構">${s}</svg>`;
    const ligTerms = d.lig.map(([t, n, c]) => `${n > 1 ? `${n} × ` : ''}${t}（${sg(c)}）`).join(' + ');
    $('#cnQ', el).innerHTML = `<p><span class="qk">錯離子</span>${d.m}（<b>x</b>）+ ${ligTerms} = ${sg(r.q)}　→　<b>x = ${sg(r.ox)}</b></p>`
      + `<p><span class="qk">整個化合物</span>錯離子（${sg(r.q)}）${outs.length ? ` + ${d.out.map(([t, n, c]) => `${n > 1 ? `${n} × ` : ''}${t}（${sg(c)}）`).join(' + ')}` : ''} = 0</p>`;
    $('#cnK', el).innerHTML = card('cn', '配位數', r.cn, '和金屬相連的原子數') + card('dn', 'd 電子數', `d${GROUP[d.m] - r.ox}`, `第 ${GROUP[d.m]} 族 − ${r.ox}`) + card('ag', '加過量 AgNO₃', `${r.agcl} mol AgCl`, '每 mol；只數外界 Cl⁻') + card('ion', '粒子數 i', r.ions, '錯離子 1 + 外界離子') + card('tf', '0.010 m 溶液 ΔTf', `${fx(r.ions * 1.86 * 0.01, 3)} °C`, `i × 1.86 × 0.010`);
    const lp = [...d.lig].map((l, i) => [l, i]).sort((a, b) => a[0][4].localeCompare(b[0][4])).map(([[, n, , , nm], i]) => `<span style="color:${PAL[i]}">${nm === 'ethylenediamine' ? `${MULT2[n]}(${nm})` : MULT[n] + nm}</span>`).join('');
    const core = `${lp}<span class="nm-m">${d.mn}</span><span class="nm-o">(${ROMAN[r.ox]})</span>`, oc = d.out.find(o => o[2] > 0), oa = d.out.find(o => o[2] < 0);
    $('#cnN', el).innerHTML = `方括號裡的配位基用實線連在金屬上，溶於水時不會離開；框外的外界離子（虛線圓）會解離。<br>IUPAC 名稱（顏色對應圖上的配位基，照英文字母排序）：<b class="mono">${oc ? `<span class="nm-x">${CNAME_OUT[oc[0]]}</span> ${core}` : oa ? `${core} <span class="nm-x">${CNAME_OUT[oa[0]]}</span>` : core}</b>`;
    pressSeg(el, 'cnS', cur);
  }
  bindSeg(el, 'cnS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 2. d 軌域分裂：選形狀、拖近配位基 =====
   各形狀的相對能量（以 Δo 為 1，晶體場理論教科書值），重心皆為 0 */
const DORB = {
  xy: ['dxy', [[1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0]]],
  xz: ['dxz', [[1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1]]],
  yz: ['dyz', [[0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1]]],
  z2: ['dz²', [[0, 0, 1], [0, 0, -1]]],
  x2: ['dx²−y²', [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]]],
};
const T3 = 1 / Math.sqrt(3);
const DGEO = {
  oct: { t: '八面體', L: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], E: { xy: -0.4, xz: -0.4, yz: -0.4, z2: 0.6, x2: 0.6 },
    n: '六個配位基在 ±x、±y、±z 上。dz²、dx²−y² 的瓣正對它們，能量升高（eg）；dxy、dxz、dyz 降低（t₂g）。' },
  tet: { t: '四面體', L: [[T3, T3, T3], [T3, -T3, -T3], [-T3, T3, -T3], [-T3, -T3, T3]], E: { xy: 0.178, xz: 0.178, yz: 0.178, z2: -0.267, x2: -0.267 },
    n: '四個配位基在立方體相間的四個頂點，落在兩軸之間。這次是 dxy、dxz、dyz 比較靠近配位基而升高（t₂），dz²、dx²−y² 降低（e），方向和八面體相反；而且沒有任何軌域正對配位基，Δt ≈ 4/9 Δo。' },
  sq: { t: '平面四方', L: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]], E: { xy: 0.228, xz: -0.514, yz: -0.514, z2: -0.428, x2: 1.228 },
    n: '把八面體 z 軸上的兩個配位基拿走。dx²−y² 正對 xy 平面上的四個配位基，遠高於其他軌域；和 z 有關的 dz²、dxz、dyz 都下降。' },
  lin: { t: '直線形', L: [[0, 0, 1], [0, 0, -1]], E: { xy: -0.628, xz: 0.114, yz: 0.114, z2: 1.028, x2: -0.628 },
    n: '兩個配位基在 z 軸上，只有 dz² 正對它們，能量最高；dxz、dyz 一組；dxy 與 dx²−y² 都在 xy 平面上、離配位基一樣遠，能量相同且最低。' },
};
W.dsplit = el => {
  const st = { c: 0, o: 'x2', g: 'oct' };
  el.innerHTML = `${seg('dsG2', Object.entries(DGEO).map(([k, v]) => [k, v.t]), st.g)}<div class="w-row"><label class="rng">讓配位基靠近 →<input type="range" id="dsR" min="0" max="1" step="0.05"><output class="mono" id="dsO"></output></label></div>${seg('dsS', Object.entries(DORB).map(([k, v]) => [k, v[0]]), st.o)}<div class="mrow two" id="dsG"></div><p class="eq" id="dsF"></p><p class="note" id="dsN"></p>`;
  const cx = 165, cy = 150, L = 55, EX = [-0.55, 0.4], EY = [0.95, 0.04], EZ = [0, -0.95];
  const pj = v => [v[0] * EX[0] + v[1] * EY[0] + v[2] * EZ[0], v[0] * EX[1] + v[1] * EY[1] + v[2] * EZ[1]];
  const P = (v, k = 1) => { const [x, y] = pj(v); return [cx + x * L * k, cy + y * L * k]; };
  const mix = (a, b, t) => { const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  function lobe(d, col, big) {
    const n = Math.hypot(...d), u = d.map(x => x / n), [sx, sy] = pj(u), len = Math.hypot(sx, sy), [x, y] = P(u, big ? 0.72 : 0.62);
    return `<ellipse cx="${x}" cy="${y}" rx="${L * (big ? 0.58 : 0.5) * Math.max(len, 0.35)}" ry="${L * 0.23}" transform="rotate(${Math.atan2(sy, sx) * 180 / Math.PI} ${x} ${y})" fill="${col}" class="lobe"/>`;
  }
  function draw() {
    const g = DGEO[st.g], c = st.c, rr = 2.4 - 1.2 * c, D = 100 * c, o = DORB[st.o], e = g.E[st.o];
    const tint = E => mix('#9AA3A0', E > 0 ? '#D0443C' : '#3D6FD6', Math.min(1, c * Math.abs(E) / 0.6));
    let s = ['x', 'y', 'z'].map((a, i) => { const v = [0, 0, 0]; v[i] = 1.75; const w = v.map(x => -x), [x1, y1] = P(w), [x2, y2] = P(v), [tx, ty] = P(v.map(x => x * 1.1)); return `<line class="axl" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="tk" x="${tx}" y="${ty + 4}" text-anchor="middle">${a}</text>`; }).join('');
    const col = tint(e);
    s += o[1].map(d => lobe(d, col, st.o === 'z2')).join('');
    if (st.o === 'z2') s += `<path class="lobe" fill="${col}" d="${Array.from({ length: 37 }, (_, i) => { const t = i * Math.PI / 18, [x, y] = P([Math.cos(t) * 0.42, Math.sin(t) * 0.42, 0]); return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; }).join('')}Z" fill-opacity=".85"/>`;
    s += `<circle class="mc" cx="${cx}" cy="${cy}" r="6"/>`;
    g.L.forEach(d => { const [x, y] = P(d.map(v => v * rr)); s += `<circle class="lgd" cx="${x}" cy="${y}" r="${8 - 2 * (d[0] < -0.1)}"/>`; });
    const sL = s; s = '';
    const yb = 150, X = { xy: 400, xz: 445, yz: 490, z2: 545, x2: 590 };
    s += `<line class="conn" x1="390" x2="630" y1="${yb}" y2="${yb}"/>`;
    Object.keys(X).forEach(k => { const y = yb - g.E[k] * D, x = X[k];
      s += `<line class="lvl${st.o === k ? ' on' : ''}" x1="${x}" x2="${x + 36}" y1="${y}" y2="${y}" style="stroke:${st.o === k ? '' : tint(g.E[k])}"/><text class="tk sm" x="${x + 18}" y="${y + 15}" text-anchor="middle">${DORB[k][0]}</text>`; });
    if (st.g === 'oct' && D >= 50) s += `<line class="dlt up" x1="378" x2="378" y1="${yb}" y2="${yb - 0.6 * D}"/><line class="dlt dn" x1="378" x2="378" y1="${yb}" y2="${yb + 0.4 * D}"/><text class="lab" x="372" y="${yb - 0.3 * D + 4}" text-anchor="end">+0.6Δo</text><text class="lab" x="372" y="${yb + 0.2 * D + 4}" text-anchor="end">−0.4Δo</text>`;
    $('#dsG', el).innerHTML = `<figure><svg class="en" viewBox="0 0 320 300" role="img" aria-label="d 軌域與配位基">${sL}</svg></figure><figure class="wide"><svg class="en" viewBox="320 0 320 300" role="img" aria-label="能階分裂">${s}</svg></figure>`;
    $('#dsR', el).value = st.c; $('#dsO', el).textContent = c < 0.05 ? '很遠' : c > 0.95 ? '貼近' : `${Math.round(c * 100)}%`;
    const terms = Object.keys(X).map(k => g.E[k]), grp = [...new Set(terms.map(v => v.toFixed(3)))].map(v => [+v, terms.filter(t => t.toFixed(3) === v).length]);
    $('#dsF', el).innerHTML = `重心守恆：${grp.map(([v, n]) => `${n} × (${v > 0 ? '+' : ''}${fx(v, 3).replace(/0+$/, '').replace(/\.$/, '')})`).join(' + ')} = 0　（單位 Δo）`;
    $('#dsN', el).innerHTML = c < 0.05 ? `配位基還很遠：五個 d 軌域能量一樣。把滑桿往右拖，讓灰色的配位基靠近。` : `${g.n} 目前選的 <b>${o[0]}</b>：相對能量 ${e > 0 ? '+' : ''}${fx(e, 3)} Δo（${e > 0 ? '升高，紅色' : '降低，藍色'}）。`;
    pressSeg(el, 'dsS', st.o); pressSeg(el, 'dsG2', st.g);
  }
  $('#dsR', el).oninput = e => { st.c = +e.target.value; draw(); };
  bindSeg(el, 'dsS', v => { st.o = v; draw(); });
  bindSeg(el, 'dsG2', v => { st.g = v; if (st.c < 0.05) st.c = 1; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. 高自旋與低自旋 ===== */
const SPINEX = [['[Cr(H₂O)₆]³⁺', 3, 0.7], ['[Cr(en)₃]²⁺', 4, 1.3], ['[Mn(H₂O)₆]²⁺', 5, 0.5], ['[Fe(H₂O)₆]²⁺', 6, 0.5], ['[Fe(CN)₆]⁴⁻', 6, 1.7], ['[CoF₆]³⁻', 6, 0.7], ['[Co(NH₃)₆]³⁺', 6, 1.5], ['[Mn(CN)₆]⁴⁻', 5, 1.5], ['[Co(H₂O)₆]²⁺', 7, 0.5], ['[Ni(H₂O)₆]²⁺', 8, 0.7]];
function spinFill(n, low) {   // 回傳 5 個格子（t₂g×3, eg×2）各放幾顆
  const ord = low ? [0, 1, 2, 0, 1, 2, 3, 4, 3, 4] : [0, 1, 2, 3, 4, 0, 1, 2, 3, 4], occ = [0, 0, 0, 0, 0];
  ord.slice(0, n).forEach(i => occ[i]++);
  return occ;
}
const spinCost = (occ, g) => { const up = occ[3] + occ[4], pr = occ.filter(o => o === 2).length; return { up, pr, v: up * g + pr }; };
W.spin = el => {
  const st = { n: 6, g: 0.5, ex: '[Fe(H₂O)₆]²⁺' };
  el.innerHTML = `<div class="w-row">${SPINEX.map(([t]) => `<button class="btn sm ghost" type="button" data-ex="${t}">${t}</button>`).join('')}</div>
<div class="w-row"><button class="btn sm" type="button" data-n="-1">－ 拿走一顆電子</button><button class="btn sm pri" type="button" data-n="1">＋ 放一顆電子</button><label class="rng">分裂能 Δo（以成對能 P 為 1）<input type="range" id="spG" min="0.3" max="1.9" step="0.2"><output class="mono" id="spO"></output></label></div>
<div id="spD"></div><div class="bars pk spc" id="spB"></div><div class="cards" id="spK"></div><p class="note" id="spN"></p>`;
  function draw() {
    const hi = spinFill(st.n, false), lo = spinFill(st.n, true), ch = spinCost(hi, st.g), cl = spinCost(lo, st.g), low = cl.v < ch.v - 1e-9, occ = low ? lo : hi;
    const yt = 170, ye = yt - st.g * 50, sx = [300, 370, 440, 335, 405], sy = [yt, yt, yt, ye, ye];
    let s = '';
    sx.forEach((x, i) => {
      s += `<line class="lvl" x1="${x - 26}" x2="${x + 26}" y1="${sy[i]}" y2="${sy[i]}"/>`;
      const k = occ[i]; for (let j = 0; j < k; j++) { const bx = k === 2 ? x + (j ? 11 : -11) : x; s += `<circle class="eball${j ? ' dn' : ''}" cx="${bx}" cy="${sy[i] - 12}" r="9"/><text class="ebt" x="${bx}" y="${sy[i] - 8}" text-anchor="middle">${j ? '↓' : '↑'}</text>`; }
    });
    s += `<line class="conn" x1="466" x2="520" y1="${yt}" y2="${yt}"/><line class="conn" x1="431" x2="520" y1="${ye}" y2="${ye}"/><line class="dlt up" x1="515" x2="515" y1="${yt}" y2="${ye}"/><text class="lab" x="524" y="${(yt + ye) / 2 + 4}">Δo</text>`;
    s += `<text class="tk" x="370" y="${yt + 22}" text-anchor="middle">t₂g（下層 3 格）</text><text class="tk" x="370" y="${ye - 32}" text-anchor="middle">eg（上層 2 格）</text>`;
    $('#spD', el).innerHTML = `<svg class="en" style="max-width:600px;margin:auto" viewBox="230 30 400 170" role="img" aria-label="電子填入 d 軌域">${s}</svg>`;
    const U = 26, row = (nm, c, on) => `<div class="${on ? 'on' : ''}"><span>${nm}<small class="mono">${c.up}×${fx(st.g, 1)} + ${c.pr}×1 = ${fx(c.v, 1)}</small></span><span class="stk"><i class="ba up" style="width:${c.up * st.g * U}px"></i><i class="ba pr" style="width:${c.pr * U}px"></i></span></div>`;
    $('#spB', el).innerHTML = row('高自旋', ch, !low) + row('低自旋', cl, low);
    const unp = occ.filter(o => o === 1).length;
    $('#spK', el).innerHTML = card('n', '電子數', `d${st.n}`) + card('u', '未成對電子 n', unp) + card('m', '磁性', unp ? '順磁性' : '反磁性') + card('mu', '磁矩 μ = √(n(n+2))', `${fx(Math.sqrt(unp * (unp + 2)), 2)} BM`, `√(${unp}×${unp + 2})`);
    $('#spN', el).innerHTML = `長條＝總能量：橘色為 eg 電子數 × Δo，灰色為成對數 × P。實際採取<b>總長度較短</b>的填法。${Math.abs(ch.v - cl.v) < 1e-9 ? `d${st.n} 兩種放法一樣，不用選。` : low ? 'Δo > P：<b>低自旋</b>。' : 'Δo < P：<b>高自旋</b>。'} 只有 d⁴～d⁷ 會出現兩種選擇。`;
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

/* ===== 4. 吸收與互補色：Δ = hc/λ 與色輪 =====
   Cr³⁺ 八面體錯合物的 Δo（cm⁻¹，教科書常見值，四捨五入） */
const CRL = [['Cl⁻', '[CrCl₆]³⁻', 13600], ['F⁻', '[CrF₆]³⁻', 15200], ['H₂O', '[Cr(H₂O)₆]³⁺', 17400], ['NH₃', '[Cr(NH₃)₆]³⁺', 21600], ['en', '[Cr(en)₃]³⁺', 21900], ['CN⁻', '[Cr(CN)₆]³⁻', 26600]];
// 色輪：相對的兩色互為互補色。[名稱, 顏色, 波長下限, 上限]
const WHEEL = [['紅', '#D0352B', 650, 760], ['橙', '#EE8A25', 590, 650], ['黃', '#F2D23A', 560, 590], ['綠', '#3BA55C', 490, 560], ['藍', '#2F6FD6', 430, 490], ['紫', '#7A45B5', 380, 430]];
W.colorwheel = el => {
  let cur = 'H₂O';
  el.innerHTML = `${seg('cwS', CRL.map(([l]) => [l, l]), cur)}<p class="small mut">按鈕由左到右是光譜化學序列：Δo 由小到大。</p><div class="mrow" id="cwG"></div><p class="eq" id="cwF"></p><p class="note" id="cwN"></p>`;
  function draw() {
    const [, f, cm] = CRL.find(x => x[0] === cur), E = cm * 0.01196, lam = 119600 / E, ai = WHEEL.findIndex(w => lam >= w[2] && lam < w[3]), si = ai < 0 ? -1 : (ai + 3) % 6;
    const xs = Array.from({ length: 81 }, (_, i) => 360 + i * 5);
    const plot = chart({ w: 340, h: 250, x: [360, 760], y: [140, 340], xt: [400, 500, 600, 700], yt: [150, 200, 250, 300], xlab: '吸收光的波長 λ（nm）', ylab: 'Δo（kJ/mol）', label: 'Δ 與波長' }, (X, Y) =>
      `${WHEEL.map(w => `<rect x="${X(Math.max(360, w[2]))}" y="${Y(140) - 6}" width="${X(w[3]) - X(Math.max(360, w[2]))}" height="6" fill="${w[1]}"/>`).join('')}<path class="tline" d="${path(xs.map(x => [X(x), Y(119600 / x)]))}"/>`
      + `<line class="mk" x1="${X(lam)}" x2="${X(lam)}" y1="${Y(E)}" y2="${Y(140)}"/><line class="mk" x1="${X(360)}" x2="${X(lam)}" y1="${Y(E)}" y2="${Y(E)}"/><circle class="dot" cx="${X(lam)}" cy="${Y(E)}" r="7"/>`);
    const R = 92, r0 = 44, cx = 115, cy = 115, arc = (i, rr) => { const a = (-90 + i * 60) * Math.PI / 180; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; };
    const segs = WHEEL.map((w, i) => { const [a, b, c, d] = [arc(i - 0.5, R), arc(i + 0.5, R), arc(i + 0.5, r0), arc(i - 0.5, r0)], [tx, ty] = arc(i, (R + r0) / 2);
      return `<path class="wseg${i === ai ? ' eat' : ''}${i === si ? ' see' : ''}" d="M${a}A${R} ${R} 0 0 1 ${b}L${c}A${r0} ${r0} 0 0 0 ${d}Z" fill="${w[1]}"/><text class="wl" x="${tx}" y="${ty + 5}" text-anchor="middle">${w[0]}</text>`; }).join('');
    const cut = ai < 0 ? '' : (() => { const [x1, y1] = arc(ai, r0 - 4), [x2, y2] = arc(si, r0 - 4); return `<line class="wcut" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#wa)"/>`; })();
    const wheel = `<svg class="ch" viewBox="0 0 230 230" role="img" aria-label="互補色色輪"><defs><marker id="wa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="ahp"/></marker></defs>${segs}<circle cx="${cx}" cy="${cy}" r="${r0 - 8}" fill="${si < 0 ? '#F4EFC8' : WHEEL[si][1]}" class="wsol"/>${cut}</svg>`;
    $('#cwG', el).innerHTML = `<figure class="wide">${plot}</figure><figure>${wheel}<figcaption>中間圓＝溶液看起來的顏色</figcaption></figure>`;
    $('#cwF', el).innerHTML = `Δo = hc/λ　→　λ = 119,600 ÷ Δo(kJ/mol) = 119,600 ÷ ${Math.round(E)} = <b>${Math.round(lam)} nm</b>`;
    $('#cwN', el).innerHTML = `<b>${f}</b>：${ai < 0 ? 'Δo 太大，吸收在紫外區；可見光幾乎全部透過，溶液顏色很淡。' : `吸收<b>${WHEEL[ai][0]}光</b>（色輪上變暗的一格），看到的是相對位置的<b>${WHEEL[si][0]}色</b>。`} 配位基場越強 → Δo 越大 → 曲線上的點往左上移 → 吸收波長越短。`;
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
  cisbc: { t: 'cis-[M(en)₂BC]', lab: 'BNCNNN', en: [[1, 4], [3, 5]] },
  transbc: { t: 'trans-[M(en)₂BC]', lab: 'NNNNBC', en: [[0, 2], [1, 3]] },
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

/* ===== 6. 價鍵理論：軌域格子 =====
   d：金屬 d 電子在五個 (n−1)d 格子的分布；use：混成用到的格子（d0–d4、s、p0–p2、D0–D4 為外層 nd） */
const VB = [
  { f: '[Fe(CN)₆]³⁻', m: 'Fe³⁺', n: 3, d: [2, 2, 1, 0, 0], use: ['d3', 'd4', 's', 'p0', 'p1', 'p2'], h: 'd²sp³', g: '八面體', t: '內軌（低自旋）' },
  { f: '[Co(NH₃)₆]³⁺', m: 'Co³⁺', n: 3, d: [2, 2, 2, 0, 0], use: ['d3', 'd4', 's', 'p0', 'p1', 'p2'], h: 'd²sp³', g: '八面體', t: '內軌（低自旋）' },
  { f: '[CoF₆]³⁻', m: 'Co³⁺', n: 3, d: [2, 1, 1, 1, 1], use: ['s', 'p0', 'p1', 'p2', 'D0', 'D1'], h: 'sp³d²', g: '八面體', t: '外軌（高自旋）' },
  { f: '[Ni(CN)₄]²⁻', m: 'Ni²⁺', n: 3, d: [2, 2, 2, 2, 0], use: ['d4', 's', 'p0', 'p1'], h: 'dsp²', g: '平面四方', t: '' },
  { f: '[NiCl₄]²⁻', m: 'Ni²⁺', n: 3, d: [2, 2, 2, 1, 1], use: ['s', 'p0', 'p1', 'p2'], h: 'sp³', g: '四面體', t: '' },
  { f: '[Zn(NH₃)₄]²⁺', m: 'Zn²⁺', n: 3, d: [2, 2, 2, 2, 2], use: ['s', 'p0', 'p1', 'p2'], h: 'sp³', g: '四面體', t: '' },
  { f: '[Ag(NH₃)₂]⁺', m: 'Ag⁺', n: 4, d: [2, 2, 2, 2, 2], use: ['s', 'p0'], h: 'sp', g: '直線', t: '' },
];
W.vbbox = el => {
  let cur = 0;
  el.innerHTML = `${seg('vbS', VB.map((v, i) => [String(i), v.f]), '0')}<div class="vbg" id="vbG"></div><p class="small mut">藍色箭頭＝金屬本身的 d 電子；紅色＝配位基提供的電子對；粗框＝參與混成的軌域。</p><div class="cards" id="vbK"></div><p class="note" id="vbN"></p>`;
  function draw() {
    const v = VB[cur], n = v.n, box = (key, metal) => { const used = v.use.includes(key); return `<span class="vbx${used ? ' use' : ''}">${metal ? `<i class="em">${metal}</i>` : ''}${used ? '<i class="el">↑↓</i>' : ''}</span>`; };
    const arr = k => (k === 2 ? '↑↓' : k === 1 ? '↑' : '');
    const grp = (lab, keys, metal = []) => `<div class="vbgrp"><div class="vbr">${keys.map((k, i) => box(k, arr(metal[i] || 0))).join('')}</div><span class="mono small">${lab}</span></div>`;
    $('#vbG', el).innerHTML = grp(`${n}d`, ['d0', 'd1', 'd2', 'd3', 'd4'], v.d) + grp(`${n + 1}s`, ['s']) + grp(`${n + 1}p`, ['p0', 'p1', 'p2']) + grp(`${n + 1}d`, ['D0', 'D1', 'D2', 'D3', 'D4']);
    const unp = v.d.filter(x => x === 1).length, cnt = k => v.use.filter(u => u[0] === k).length;
    $('#vbK', el).innerHTML = card('h', '混成', v.h, `數粗框：${cnt('d') + cnt('D') ? `${cnt('d') + cnt('D')} 個 d、` : ''}1 個 s、${cnt('p')} 個 p`) + card('g', '形狀', v.g) + card('u', '未成對電子', unp) + (v.t ? card('t', '類型', v.t) : '');
    $('#vbN', el).innerHTML = `${v.m} 有 ${v.d.reduce((a, b) => a + b, 0)} 個 d 電子。${v.use.length} 個配位基各提供一對電子，放進金屬的空軌域並混成為 <b>${v.h}</b>（${v.g}）。${v.h === 'd²sp³' ? '金屬的 d 電子先在三個 (n−1)d 軌域中成對，空出兩個 (n−1)d 軌域參與混成，稱為內軌錯合物。' : v.h === 'sp³d²' ? '金屬的 d 電子不成對，混成只好用外層的 nd 軌域，稱為外軌錯合物，未成對電子較多。' : v.h === 'dsp²' ? '8 個 d 電子擠進四個 d 軌域，空出一個 d 參與混成，形狀為平面四方，沒有未成對電子。' : 'd 軌域不參與混成。'}`;
    pressSeg(el, 'vbS', String(cur));
  }
  bindSeg(el, 'vbS', x => { cur = +x; draw(); });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 7. 幾牙配位基：哪些原子抓住金屬 ===== */
const LIGS = {
  nh3: ['NH₃', 1, 0, 'N', { atoms: { M: { x: 0, y: -1.3, t: 'M', hl: 1 }, N: { x: 0, y: 0, t: 'NH₃', halo: 0.45 } }, bonds: [['M', 'N', 'p']] }],
  en: ['en（乙二胺）', 2, 0, 'N, N', { atoms: { M: { x: 0, y: -1.3, t: 'M', hl: 1 }, N1: { x: -1, y: 0, t: 'H₂N', halo: 0.45 }, N2: { x: 1, y: 0, t: 'NH₂', halo: 0.45 }, C1: { x: -0.55, y: 1.15, t: '' }, C2: { x: 0.55, y: 1.15, t: '' } }, bonds: [['N1', 'C1', 's'], ['C1', 'C2', 's'], ['C2', 'N2', 's'], ['M', 'N1', 'p'], ['M', 'N2', 'p']] }],
  ox: ['C₂O₄²⁻（草酸根）', 2, -2, 'O, O', { atoms: { M: { x: 0, y: -1.3, t: 'M', hl: 1 }, O1: { x: -0.95, y: 0, t: 'O', c: '−', halo: 0.4 }, O2: { x: 0.95, y: 0, t: 'O', c: '−', halo: 0.4 }, C1: { x: -0.6, y: 1.15, t: '' }, C2: { x: 0.6, y: 1.15, t: '' }, O3: { x: -1.35, y: 2.0, t: 'O' }, O4: { x: 1.35, y: 2.0, t: 'O' } }, bonds: [['O1', 'C1', 's'], ['C1', 'C2', 's'], ['C2', 'O2', 's'], ['C1', 'O3', 'd'], ['C2', 'O4', 'd'], ['M', 'O1', 'p'], ['M', 'O2', 'p']] }],
  acac: ['acac⁻（乙醯丙酮根）', 2, -1, 'O, O', { atoms: { M: { x: 0, y: -1.3, t: 'M', hl: 1 }, O1: { x: -1, y: 0, t: 'O', c: '−', halo: 0.4 }, O2: { x: 1, y: 0, t: 'O', halo: 0.4 }, C1: { x: -1.2, y: 1.2, t: '' }, C2: { x: 0, y: 1.85, t: '' }, C3: { x: 1.2, y: 1.2, t: '' }, M1: { x: -2.35, y: 1.75, t: 'CH₃' }, M2: { x: 2.35, y: 1.75, t: 'CH₃' } }, bonds: [['O1', 'C1', 's'], ['C1', 'C2', 'd'], ['C2', 'C3', 's'], ['C3', 'O2', 'd'], ['C1', 'M1', 's'], ['C3', 'M2', 's'], ['M', 'O1', 'p'], ['M', 'O2', 'p']] }],
  dien: ['dien（二乙三胺）', 3, 0, 'N, N, N', { atoms: { M: { x: 0, y: -1.3, t: 'M', hl: 1 }, N1: { x: -1.7, y: -0.3, t: 'H₂N', halo: 0.45 }, C1: { x: -1.95, y: 0.9, t: '' }, C2: { x: -0.95, y: 1.55, t: '' }, N2: { x: 0, y: 0.6, t: 'NH', halo: 0.45 }, C3: { x: 0.95, y: 1.55, t: '' }, C4: { x: 1.95, y: 0.9, t: '' }, N3: { x: 1.7, y: -0.3, t: 'NH₂', halo: 0.45 } }, bonds: [['N1', 'C1', 's'], ['C1', 'C2', 's'], ['C2', 'N2', 's'], ['N2', 'C3', 's'], ['C3', 'C4', 's'], ['C4', 'N3', 's'], ['M', 'N1', 'p'], ['M', 'N2', 'p'], ['M', 'N3', 'p']] }],
  edta: ['EDTA⁴⁻', 6, -4, '2 N, 4 O', { atoms: { M: { x: 0, y: 0, t: 'M', hl: 1 }, N1: { x: -0.75, y: 1.1, t: 'N', halo: 0.4 }, N2: { x: 0.75, y: 1.1, t: 'N', halo: 0.4 }, Ca: { x: -0.4, y: 2.1, t: '' }, Cb: { x: 0.4, y: 2.1, t: '' }, A1: { x: -2.0, y: 1.3, t: '' }, A2: { x: 2.0, y: 1.3, t: '' }, A3: { x: -1.3, y: 2.3, t: '' }, A4: { x: 1.3, y: 2.3, t: '' }, O1: { x: -1.75, y: 0.1, t: 'O', c: '−', halo: 0.4 }, O2: { x: 1.75, y: 0.1, t: 'O', c: '−', halo: 0.4 }, O3: { x: -1.0, y: -1.2, t: 'O', c: '−', halo: 0.4 }, O4: { x: 1.0, y: -1.2, t: 'O', c: '−', halo: 0.4 }, B3: { x: -2.1, y: -0.9, t: '' }, B4: { x: 2.1, y: -0.9, t: '' } },
    bonds: [['N1', 'Ca', 's'], ['Ca', 'Cb', 's'], ['Cb', 'N2', 's'], ['N1', 'A1', 's'], ['A1', 'O1', 's'], ['N2', 'A2', 's'], ['A2', 'O2', 's'], ['N1', 'A3', 's'], ['A3', 'B3', 's'], ['B3', 'O3', 's'], ['N2', 'A4', 's'], ['A4', 'B4', 's'], ['B4', 'O4', 's'], ['M', 'N1', 'p'], ['M', 'N2', 'p'], ['M', 'O1', 'p'], ['M', 'O2', 'p'], ['M', 'O3', 'p'], ['M', 'O4', 'p']] }],
};
W.ligand = el => {
  let cur = 'en';
  el.innerHTML = `${seg('lgS', Object.entries(LIGS).map(([k, v]) => [k, v[0].split('（')[0]]), cur)}<div id="lgG"></div><div class="cards" id="lgK"></div><p class="note" id="lgN"></p>`;
  function draw() {
    const [nm, dent, q, at, sc] = LIGS[cur];
    $('#lgG', el).innerHTML = MOL.svg(sc, { w: 440, h: 210, s: 42, cy: cur === 'edta' ? 112 : 135, label: nm });
    $('#lgK', el).innerHTML = card('d', '牙數', `${dent}`, `${dent === 1 ? '單' : dent === 2 ? '雙' : dent === 3 ? '三' : '六'}牙`) + card('a', '配位原子', at) + card('q', '電荷', q ? `${q}` : '0') + card('n', '填滿配位數 6 需要', `${6 / dent} 個`);
    $('#lgN', el).innerHTML = `<b>${nm}</b>：圈起來的原子帶有孤對電子，虛線是它們和金屬 M 形成的配位鍵。${dent > 1 ? `同一個分子用 ${dent} 個原子同時配位，和金屬圍成環（五員環最穩定），這種錯合物稱為<b>螯合物</b>。` : ''}`;
    pressSeg(el, 'lgS', cur);
  }
  bindSeg(el, 'lgS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.l || cur; draw(); } };
};

/* ===== 8. 列出全部異構物 ===== */
const ISOF = {
  ma5b: { t: '[MA₅B]（取代統計）', c: { A: 5, B: 1 }, aa: 0 },
  ma4b2: { t: '[MA₄B₂]', c: { A: 4, B: 2 }, aa: 0 },
  ma3b3: { t: '[MA₃B₃]', c: { A: 3, B: 3 }, aa: 0 },
  ma2b2c2: { t: '[MA₂B₂C₂]', c: { A: 2, B: 2, C: 2 }, aa: 0 },
  aa2b2: { t: '[M(AA)₂B₂]', c: { B: 2 }, aa: 2 },
  aa2bc: { t: '[M(AA)₂BC]', c: { B: 1, C: 1 }, aa: 2 },
  aa3: { t: '[M(AA)₃]', c: {}, aa: 3 },
};
const OPP = [1, 0, 3, 2, 5, 4];
function isoEnumerate(f) {
  const perm = (G, i) => dirIdx(mv(G, OD[i])), PROP = SIGNED.filter(G => det3(G) > 0), IMP = SIGNED.filter(G => det3(G) < 0);
  const key = (lab, en) => lab.join('') + '|' + en.map(p => [...p].sort().join('')).sort().join(',');
  const apply = (G, lab, en) => { const L = Array(6); lab.forEach((x, i) => { L[perm(G, i)] = x; }); return [L, en.map(([a, b]) => [perm(G, a), perm(G, b)])]; };
  const canon = (lab, en, ops) => ops.map(G => key(...apply(G, lab, en))).sort()[0];
  const out = new Map(), mono = Object.entries(f.c).flatMap(([k, n]) => Array(n).fill(k));
  const match = (pos) => { if (!pos.length) return [[]]; const [a, ...r] = pos; return r.filter(b => OPP[a] !== b).flatMap(b => match(r.filter(x => x !== b)).map(m => [[a, b], ...m])); };
  const pick = (arr, k) => (k === 0 ? [[]] : arr.flatMap((x, i) => pick(arr.slice(i + 1), k - 1).map(r => [x, ...r])));
  const monoPerms = arr => { const u = [...new Set(arr)]; if (arr.length <= 1) return [arr]; return u.flatMap(x => { const r = [...arr]; r.splice(r.indexOf(x), 1); return monoPerms(r).map(p => [x, ...p]); }); };
  pick([0, 1, 2, 3, 4, 5], 2 * f.aa).forEach(np => match(np).forEach(en => {
    const rest = [0, 1, 2, 3, 4, 5].filter(i => !np.includes(i));
    monoPerms(mono).forEach(mp => { const lab = Array(6).fill('N'); rest.forEach((p, i) => { lab[p] = mp[i]; }); const k = canon(lab, en, PROP); if (!out.has(k)) out.set(k, { lab, en }); });
  }));
  const list = [...out.values()], seen = new Set(), groups = [];
  list.forEach(x => { const k = canon(x.lab, x.en, PROP); if (seen.has(k)) return; seen.add(k);
    const [ml, me] = apply(IMP[0], x.lab, x.en), mk = canon(ml, me, PROP);
    if (mk === k) groups.push([x]); else { const y = list.find(z => canon(z.lab, z.en, PROP) === mk); seen.add(mk); groups.push([x, y]); } });
  return groups;
}
W.isolist = el => {
  let cur = 'ma2b2c2';
  el.innerHTML = `${seg('ilS', Object.entries(ISOF).map(([k, v]) => [k, v.t]), cur)}<div class="isos" id="ilG"></div><div class="cards" id="ilK"></div><p class="note" id="ilN"></p>`;
  const V0 = m3(rotA([1, 0, 0], 0.38), rotA([0, 1, 0], -0.55));
  const pic = (x, cap, hl) => {
    const pts = OD.map((v, i) => { const [a, b, z] = mv(V0, v); return { i, x: 80 + a * 52, y: 75 - b * 52, z, l: x.lab[i] }; }), order = [...pts].sort((a, b) => a.z - b.z);
    let s = '';
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (OPP[i] !== j) s += `<line class="oe" x1="${pts[i].x}" y1="${pts[i].y}" x2="${pts[j].x}" y2="${pts[j].y}"/>`;
    s += x.en.map(([a, b]) => { const A = pts[a], B = pts[b], mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2; return `<path class="enarc" d="M${A.x} ${A.y}Q${mx + (mx - 80) * 0.6} ${my + (my - 75) * 0.6} ${B.x} ${B.y}"/>`; }).join('');
    const lig = q => `<g class="lg lg-${q.l}${hl && hl(q.i) ? ' ring' : ''}"><circle cx="${q.x}" cy="${q.y}" r="${11 + 2 * q.z}"/><text x="${q.x}" y="${q.y + 4}" text-anchor="middle">${q.l === 'N' ? 'A' : q.l}</text></g>`;
    s += order.filter(q => q.z < 0).map(q => `<line class="cb" x1="80" y1="75" x2="${q.x}" y2="${q.y}"/>${lig(q)}`).join('') + `<circle class="mc" cx="80" cy="75" r="9"/>` + order.filter(q => q.z >= 0).map(q => `<line class="cb" x1="80" y1="75" x2="${q.x}" y2="${q.y}"/>${lig(q)}`).join('');
    return `<figure><svg class="mol o3" viewBox="0 0 160 150" role="img" aria-label="${esc(cap)}">${s}</svg><figcaption>${cap}</figcaption></figure>`;
  };
  const desc = x => Object.keys(ISOF[cur].c).filter(k => ISOF[cur].c[k] >= 2).map(k => { const ps = x.lab.map((l, i) => (l === k ? i : -1)).filter(i => i >= 0);
    if (ps.length === 2) return `${k} ${OPP[ps[0]] === ps[1] ? 'trans' : 'cis'}`; if (ps.length === 3) return `${k} ${ps.some(a => ps.includes(OPP[a])) ? 'mer' : 'fac'}`; return ''; }).filter(Boolean).join('、');
  function draw() {
    const f = ISOF[cur];
    if (cur === 'ma5b') {
      const x = { lab: ['B', 'A', 'A', 'A', 'A', 'A'], en: [] };
      $('#ilG', el).innerHTML = pic(x, '紅圈 4 個：和 B 相鄰（cis）', i => i !== 0 && i !== 1) + pic(x, '紅圈 1 個：和 B 相對（trans）', i => i === 1);
      $('#ilK', el).innerHTML = card('c', '取代相鄰的 A', '4 個位置', '→ cis-MA₄B₂') + card('t', '取代相對的 A', '1 個位置', '→ trans-MA₄B₂') + card('r', 'cis : trans', '4 : 1');
      $('#ilN', el).innerHTML = 'MA₅B 中任一個 A 被 B 隨機取代時，五個 A 被取代的機會相等：其中 4 個和原本的 B 相鄰、1 個相對，所以產物 cis : trans = 4 : 1。';
    } else {
      const gs = isoEnumerate(f), chiral = gs.filter(g => g.length === 2).length;
      $('#ilG', el).innerHTML = gs.map((g, i) => g.map((x, j) => pic(x, `${i + 1}${g.length === 2 ? (j ? '′（鏡像）' : '') : ''}${desc(x) ? `　${desc(x)}` : ''}`)).join('')).join('');
      $('#ilK', el).innerHTML = card('g', '幾何異構物', gs.length) + card('o', '其中有鏡像對的', chiral) + card('s', '立體異構物總數', gs.length + chiral, `${gs.length} + ${chiral}`);
      $('#ilN', el).innerHTML = `電腦把所有排法逐一轉動比對（八面體 24 種轉法），轉得過去的算同一個，剩下 <b>${gs.length}</b> 種幾何異構物。${chiral ? `其中 ${chiral} 種的鏡像疊不回去，各多出一個鏡像異構物（標 ′ 的那一個），所以立體異構物共 <b>${gs.length + chiral}</b> 種。` : '每一種都能和自己的鏡像重合，沒有光學異構物。'}${f.aa ? ' 綠色弧線是雙牙配位基 AA，只能跨在相鄰的兩個位置。' : ''}`;
    }
    pressSeg(el, 'ilS', cur);
  }
  bindSeg(el, 'ilS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.f || cur; draw(); } };
};

/* ===== 9. 金屬羰基：C–O 伸縮頻率 =====
   cm⁻¹，八面體 M(CO)₆ 等電子系列的教科書值 */
const COB = [['[Ti(CO)₆]²⁻', -2, 1748], ['[V(CO)₆]⁻', -1, 1858], ['Cr(CO)₆', 0, 2000], ['[Mn(CO)₆]⁺', 1, 2095], ['自由 CO', null, 2143]];
W.cobar = el => {
  let cur = 2;
  el.innerHTML = `<div id="cbG"></div><p class="note" id="cbN"></p>`;
  function draw() {
    $('#cbG', el).innerHTML = chart({ w: 560, h: 240, x: [-0.6, 4.6], y: [1650, 2200], xt: [], yt: [1700, 1800, 1900, 2000, 2100, 2200], ylab: 'ν(C–O)（cm⁻¹）', label: '羰基伸縮頻率' }, (X, Y) =>
      COB.map(([t, q, v], i) => `<rect x="${X(i) - 30}" y="${Y(v)}" width="60" height="${Y(1650) - Y(v)}" class="${i === 4 ? 'bc' : 'bv'}${i === cur ? ' on' : ''}" data-i="${i}" role="button" tabindex="0"/><text class="tk" x="${X(i)}" y="${Y(v) - 6}" text-anchor="middle">${v}</text><text class="tk" x="${X(i)}" y="${Y(1650) + 16}" text-anchor="middle">${t}</text>`).join('')
      + `<line class="mk" x1="${X(-0.6)}" x2="${X(4.6)}" y1="${Y(2143)}" y2="${Y(2143)}"/>`);
    const [t, q, v] = COB[cur];
    $('#cbN', el).innerHTML = q == null ? '自由的 CO 沒有金屬回送電子，C≡O 最強，頻率最高（虛線）。' : `<b>${t}</b>：錯合物電荷 ${q > 0 ? '+' : ''}${q}，ν(CO) = ${v} cm⁻¹。這四個錯合物的金屬都是 d⁶，差別只在電荷：負電越多，金屬越富電子，越多 d 電子回送到 CO 的 π* 軌域（π 逆授），C≡O 鍵越弱，頻率越低。點長條切換。`;
    $$('#cbG [data-i]', el).forEach(r => { r.onclick = () => { cur = +r.dataset.i; draw(); }; });
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 10. 18 電子規則：堆疊長條 ===== */
const E18 = [['Cr(CO)₆', 'Cr', 6, [['CO', 2, 6]]], ['Fe(CO)₅', 'Fe', 8, [['CO', 2, 5]]], ['Ni(CO)₄', 'Ni', 10, [['CO', 2, 4]]], ['Fe(C₅H₅)₂（二茂鐵）', 'Fe', 8, [['C₅H₅', 5, 2]]], ['V(CO)₆', 'V', 5, [['CO', 2, 6]]]];
W.e18 = el => {
  let cur = 3;
  el.innerHTML = `${seg('e1S', E18.map((v, i) => [String(i), v[0]]), '3')}<div id="e1G"></div><p class="eq" id="e1F"></p><p class="note" id="e1N"></p>`;
  function draw() {
    const [f, m, me, ls] = E18[cur], segs = [[m, me, 'm']].concat(ls.flatMap(([t, e, n]) => Array.from({ length: n }, () => [t, e, 'l']))), tot = segs.reduce((a, s) => a + s[1], 0);
    let x = 0;
    $('#e1G', el).innerHTML = `<svg class="ch" viewBox="0 0 600 110" role="img" aria-label="18 電子計算">${segs.map(([t, e, k]) => { const w = e * 28, r = `<rect x="${20 + x}" y="30" width="${w}" height="36" class="e18${k}"/><text class="wl" x="${20 + x + w / 2}" y="53" text-anchor="middle">${k === 'm' ? `${t} ${e}` : e}</text>`; x += w; return r; }).join('')}<line class="mk" x1="${20 + 18 * 28}" x2="${20 + 18 * 28}" y1="18" y2="80"/><text class="tk" x="${20 + 18 * 28}" y="96" text-anchor="middle">18</text></svg>`;
    $('#e1F', el).innerHTML = `${m}（第 ${me} 族）${me} + ${ls.map(([t, e, n]) => `${n} × ${t}（${e}）`).join(' + ')} = <b>${tot}</b>`;
    $('#e1N', el).innerHTML = tot === 18 ? `剛好 18 個價電子，相當於填滿金屬的 9 個價軌域（5 個 d、1 個 s、3 個 p），是穩定的組成。` : `只有 ${tot} 個，少一個電子：V(CO)₆ 很容易得到一個電子變成 [V(CO)₆]⁻，湊滿 18。`;
    pressSeg(el, 'e1S', String(cur));
  }
  bindSeg(el, 'e1S', v => { cur = +v; draw(); });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};
