/* ---------- 後中化學：軌域的實心形狀（第一章第 5 節單一軌域、第 6 節原子模型共用） ----------
   固定的斜角度（等角投影），s 是球、p 是啞鈴、d 是四葉草（d_z² 是兩瓣加一圈）。
   原子模型：顏色表示填的狀態（灰色虛線＝空、淺色＝一個電子、深色＝兩個電子）；大小用斯萊特規則的有效核電荷估算
   （J. C. Slater, Phys. Rev. 36, 57, 1930），只比相對大小，不標數值。 */
const ORBV = (() => {
  const prj = (x, y, z) => [(x - y) * 0.866, (x + y) * 0.5 - z];   // 視線方向 (1, 1, 1)
  const N = v => { const l = Math.hypot(...v); return v.map(a => a / l); };
  // 各實數軌域的瓣：[方向, 正負]；順序：p = x, y, z；d = xy, yz, xz, x²−y², z²
  const LOBES = {
    p: [[[[1, 0, 0], 1], [[-1, 0, 0], -1]], [[[0, 1, 0], 1], [[0, -1, 0], -1]], [[[0, 0, 1], 1], [[0, 0, -1], -1]]],
    d: [[[[1, 1, 0], 1], [[-1, -1, 0], 1], [[1, -1, 0], -1], [[-1, 1, 0], -1]], [[[0, 1, 1], 1], [[0, -1, -1], 1], [[0, 1, -1], -1], [[0, -1, 1], -1]],
      [[[1, 0, 1], 1], [[-1, 0, -1], 1], [[1, 0, -1], -1], [[-1, 0, 1], -1]], [[[1, 0, 0], 1], [[-1, 0, 0], 1], [[0, 1, 0], -1], [[0, -1, 0], -1]], [[[0, 0, 1], 1], [[0, 0, -1], 1]]],
  };
  const NAMES = { s: ['s'], p: ['pₓ', 'p_y', 'p_z'], d: ['d_xy', 'd_yz', 'd_xz', 'd_x²−y²', 'd_z²'] };
  // mℓ → 上面的編號（教科書慣用的對應）
  const BYM = { p: { '-1': 1, 0: 2, 1: 0 }, d: { '-2': 0, '-1': 1, 0: 4, 1: 2, 2: 3 } };
  // 節面：每個軌域的節面 [e1, e2]（平面上的兩個方向）；d_z² 的節面是兩個圓錐，不畫
  const PLANES = { p: [[[[0, 1, 0], [0, 0, 1]]], [[[1, 0, 0], [0, 0, 1]]], [[[1, 0, 0], [0, 1, 0]]]],
    d: [[[[1, 0, 0], [0, 0, 1]], [[0, 1, 0], [0, 0, 1]]], [[[1, 0, 0], [0, 1, 0]], [[1, 0, 0], [0, 0, 1]]], [[[1, 0, 0], [0, 1, 0]], [[0, 1, 0], [0, 0, 1]]],
      [[N([1, 1, 0]), [0, 0, 1]], [N([1, -1, 0]), [0, 0, 1]]], []] };
  // 一個瓣：中心在 0.55R、沿方向的半長 0.5R、寬 w×R
  function lobe(cx, cy, R, u, w, attr) {
    const n = N(u), [px, py] = prj(...n), L = Math.hypot(px, py), ang = Math.atan2(py, px) * 180 / Math.PI, [ox, oy] = prj(...n.map(a => a * 0.55 * R)), X = (cx + ox).toFixed(1), Y = (cy + oy).toFixed(1);
    return `<ellipse cx="${X}" cy="${Y}" rx="${Math.max(0.5 * R * L, w * R * 1.05).toFixed(1)}" ry="${(w * R).toFixed(1)}" transform="rotate(${ang.toFixed(1)} ${X} ${Y})" ${attr}/>`;
  }
  const depth = u => u[0] + u[1] + u[2];
  // 一個軌域的形狀；style(sign) 回傳屬性字串
  function shape(cx, cy, R, type, idx, style) {
    if (type === 's') return `<circle cx="${cx}" cy="${cy}" r="${(0.62 * R).toFixed(1)}" ${style(1)}/>`;
    if (type === 'f') return `<circle cx="${cx}" cy="${cy}" r="${(0.45 * R).toFixed(1)}" ${style(1)}/>`;
    const ls = LOBES[type][idx].slice().sort((a, b) => depth(a[0]) - depth(b[0])), w = type === 'p' ? 0.26 : 0.2;
    let s = ls.filter(l => depth(l[0]) < 0).map(([u, sg]) => lobe(cx, cy, R, u, w, style(sg))).join('');
    if (type === 'd' && idx === 4) s += `<ellipse cx="${cx}" cy="${cy}" rx="${(0.5 * R * 1.225).toFixed(1)}" ry="${(0.5 * R * 0.707).toFixed(1)}" ${style(-1).replace(/fill="[^"]*"/, 'fill="none"').replace(/stroke-width="[^"]*"/, '')} stroke-width="${(0.14 * R).toFixed(1)}"/>`;
    return s + ls.filter(l => depth(l[0]) >= 0).map(([u, sg]) => lobe(cx, cy, R, u, w, style(sg))).join('');
  }
  function plane(cx, cy, R, e1, e2) {
    const c = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([a, b]) => prj(...e1.map((v, i) => (a * v + b * e2[i]) * 1.1 * R)));
    return `<polygon points="${c.map(([x, y]) => `${(cx + x).toFixed(1)},${(cy + y).toFixed(1)}`).join(' ')}" class="nplane"/>`;
  }
  // 斯萊特規則：有效核電荷與平均半徑（只用來比相對大小）
  const NSTAR = { 1: 1, 2: 2, 3: 3, 4: 3.7, 5: 4, 6: 4.2 }, GRP = ['1s', '2sp', '3sp', '3d', '4sp', '4d', '4f', '5sp', '5d', '6sp'], grp = o => (o[1] === 's' || o[1] === 'p' ? o[0] + 'sp' : o);
  function zeff(cf, o) {
    const g = grp(o), gi = GRP.indexOf(g), n = +o[0], sp = g.endsWith('sp'); let s = 0;
    cf.forEach(([o2, k]) => { const g2 = grp(o2), gi2 = GRP.indexOf(g2), n2 = +o2[0];
      if (g2 === g) s += (o2 === o ? Math.max(0, k - 1) : k) * (g === '1s' ? 0.30 : 0.35);
      else if (gi2 < gi) s += k * (sp ? (n2 === n - 1 ? 0.85 : n2 < n - 1 ? 1 : 0) : 1); });
    return Math.max(1, cf.reduce((a, [, k]) => a + k, 0) - s);
  }
  const meanR = (o, cf) => (2 * NSTAR[+o[0]] + 1) / (2 * zeff(cf, o) / NSTAR[+o[0]]);
  return { prj, shape, plane, PLANES, NAMES, BYM, zeff, meanR };
})();
// 填的狀態 → 樣式：空＝灰色虛線、一個電子＝淺色、兩個電子＝深色；剛變化的加粗外框
const FILLHUE = { s: '#3A7BD5', p: '#D9822B', d: '#2E9E6B', f: '#9B59B6' };
const fillStyle = (type, e, isNew) => () => (e === 0 ? `fill="none" stroke="var(--muted)" stroke-dasharray="4 3" stroke-width="1.4"`
  : `fill="${FILLHUE[type]}" fill-opacity="${e === 1 ? 0.3 : 0.78}" stroke="${isNew ? 'var(--arrow)' : FILLHUE[type]}" stroke-width="${isNew ? 3 : 1.2}"`);
// 照填入順序（不管例外）的組態：例外比較用
function econfAuf(Z) { const m = []; let left = Z; for (const [o, c] of AUF) { if (left <= 0) break; m.push([o, Math.min(c, left)]); left -= c; } return m; }
const occOf = (k, m) => Array.from({ length: m }, (_, i) => (k > i ? 1 : 0) + (k > m + i ? 1 : 0));   // 洪德定則：先每格一個，再成對
const MORB = { s: 1, p: 3, d: 5, f: 7 };
// 這一週期要顯示的外層副層（空的也畫，畫成虛線）：ns、(n−2)f、(n−1)d、np
function valenceSet(Z, coreOrb) {
  const per = Z <= 2 ? 1 : Z <= 10 ? 2 : Z <= 18 ? 3 : Z <= 36 ? 4 : Z <= 54 ? 5 : 6;
  if (per === 1) return ['1s'];
  const s = [`${per}s`]; if (per === 6 && Z >= 57 && Z <= 71) s.push('4f'); if (per >= 4) s.push(`${per - 1}d`); s.push(`${per}p`);
  return s.filter(o => !coreOrb.includes(o));
}
// 軌域圖：每個軌域畫成小形狀，依能量高低排（示意，不標數值）；ns 與 (n−1)d 幾乎同高，d 填進電子後畫在 ns 下面一點
function orbitalChart(id, cf, subs, opts = {}) {
  const cnt = Object.fromEntries(cf), dFilled = subs.some(o => o[1] === 'd' && cnt[o]);
  // d 和下一層的 s 幾乎同高：d 還沒填時在 s 上面一點，填了之後在下面一點；opts.equal 時完全同高（例外比較）
  const rank = o => { const n = +o[0], l = 'spdf'.indexOf(o[1]); if (o[1] === 'd') { const b = (n + 1) * 11; return opts.equal ? b : b + (dFilled ? -1 : 1); } return o[1] === 's' ? n * 11 : (n + l) * 10 + n; };
  const rows = subs.slice().sort((a, b) => rank(b) - rank(a)), ys = {}; let y = 30;
  rows.forEach((o, i) => { if (i) y += Math.abs(rank(rows[i - 1]) - rank(o)) < 4 ? (opts.equal ? 0 : 40) : 62; ys[o] = y; });
  if (opts.equal) { const so = rows.find(o => o[1] === 's'); rows.forEach(o => { if (o[1] !== 's') ys[o] = ys[so]; }); }
  const W = 34, x0 = 64, pos = {}, ups = {}, dns = {}; let svg = '';
  rows.forEach(o => {
    const t = o[1], oc = occOf(cnt[o] || 0, MORB[t]);
    if (!(opts.equal && t === 'd')) svg += `<text class="tk" x="${x0 - 10}" y="${ys[o] + 5}" text-anchor="end">${opts.equal ? rows.filter(r => r !== o).concat([o]).reverse().join(' ＝ ') : o}</text>`;
    const sx = opts.equal && t === 'd' ? W + 22 : 0;
    oc.forEach((e, i) => { const cx = x0 + 20 + sx + i * (W + 6), cy = ys[o]; pos[o + i] = [cx, cy];
      svg += `<rect x="${cx - W / 2}" y="${cy - 17}" width="${W}" height="34" rx="6" class="obox${opts.pairRed && e === 2 && t === 's' ? ' red' : ''}"/>`
        + ORBV.shape(cx, cy - 2, 24, t, t === 'f' ? 0 : Math.min(i, t === 'd' ? 4 : 2), fillStyle(t, e, false))
        + (e ? `<text class="arr" x="${cx}" y="${cy + 14}" text-anchor="middle">${e === 2 ? '↑↓' : '↑'}</text>` : '');
      if (e) (ups[o] = ups[o] || []).push([cx, cy]); if (e === 2) (dns[o] = dns[o] || []).push([cx, cy]); });
  });
  // 同方向的電子兩兩連線（同一個副層內）：↑ 和 ↑ 連在格子上方，↓ 和 ↓ 連在下方；連線越多，交換能越大
  let nl = 0;
  const arcs = (groups, up) => Object.values(groups).forEach(ps => { for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) { nl++; const [ax, ay] = ps[i], [bx] = ps[j], h = 8 + (bx - ax) / 5, yy = up ? ay - 18 : ay + 18; svg += `<path d="M${ax},${yy} Q${(ax + bx) / 2},${up ? yy - h : yy + h} ${bx},${yy}" class="xlink${up ? '' : ' dn'}"/>`; } });
  if (opts.links) { arcs(ups, true); arcs(dns, false); }
  if (opts.move) { const [fo, to] = opts.move, [fx0, fy] = pos[fo + '0'], [tx, ty] = pos[to + '4'] || pos[to + '0'];
    svg += `<defs><marker id="mv${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--arrow)"/></marker></defs><path d="M${fx0},${fy + 20} C${fx0 + 20},${fy + 46} ${tx - 20},${ty + 46} ${tx},${ty + 20}" class="mv" marker-end="url(#mv${id})" data-cur="搬動的電子"/>`; }
  const maxW = x0 + 20 + Math.max(...rows.map(o => MORB[o[1]])) * (W + 6) + (opts.equal ? W + 22 : 0);
  return { svg: `<svg viewBox="0 0 ${Math.max(maxW, 250)} ${y + (opts.links ? 60 : 34)}" class="ch ochart" role="img" aria-label="軌域圖">${svg}</svg>`, links: nl };
}

/* ===== 第 6 節：原子模型＋軌域圖 ===== */
W.atom3d = el => {
  const st = { Z: 1, q: 0, phase: 1 };
  el.innerHTML = `<div class="w-row"><button class="btn sm" type="button" data-d="-1">－ 拿走一個電子</button><button class="btn sm pri" type="button" data-d="1">＋ 加一個電子</button></div>
<div class="w-row"><label class="rng">原子序 Z<input type="range" id="a3Z" min="1" max="86" step="1"><output class="mono" id="a3O"></output></label></div>
${ctl('電荷', seg('a3Q', [['0', '中性'], ['1', '+1'], ['2', '+2'], ['3', '+3']], '0'))}
<p class="legend3"><span class="lg0">空的</span><span class="lg1">一個電子（半滿）</span><span class="lg2">兩個電子（全滿）</span></p>
<div class="a3grid"><div id="a3M"></div><div id="a3B"></div></div><p class="eq" id="a3S"></p><div id="a3X"></div><p class="note" id="a3N"></p>`;
  const sup = n => String(n).split('').map(c => SUP[c]).join(''), DEXC = Object.keys(EXC).map(Number).filter(z => ![57, 58, 64].includes(z));
  let timer = 0;
  function model(Z, cf, prevCnt, coreName, coreOrb, subs) {
    const cnt = Object.fromEntries(cf), all = subs.concat(cf.map(x => x[0]).filter(o => !coreOrb.includes(o) && !subs.includes(o)))
      .filter(o => cnt[o] || o[1] === 's' || (o[1] === 'd' && [19, 20, 37, 38].includes(Z)));
    // 依畫出來的最大形狀放大到填滿（s 球半徑 0.62R、p 瓣伸到 1.31R、d 瓣伸到 1.16R）
    const R = o => ORBV.meanR(o, cf), coreR = coreOrb.length ? Math.max(...coreOrb.map(R)) : 0, reach = o => R(o) * ({ s: 0.62, p: 1.31, d: 1.16, f: 0.5 })[o[1]];
    const k = 148 / Math.max(coreR * 0.62, ...all.map(reach)), cx = 170, cy = 160;
    const cr = Math.max(16, coreR * k * 0.62);
    let s = '';
    // s 球由大到小，接著內層的灰色球（畫在 s 球上面才看得到），再畫 p、d、f；剛變化的加粗外框
    all.filter(o => o[1] === 's').sort((a, b) => R(b) - R(a)).forEach(o => { const e = cnt[o] || 0; s += ORBV.shape(cx, cy, R(o) * k, 's', 0, fillStyle('s', e, e !== (prevCnt[o] || 0))); });
    if (coreName) s += `<circle cx="${cx}" cy="${cy}" r="${cr.toFixed(1)}" class="coreb"/>`;
    all.filter(o => o[1] !== 's').forEach(o => { const t = o[1], oc = occOf(cnt[o] || 0, MORB[t]), op = occOf(prevCnt[o] || 0, MORB[t]);
      oc.forEach((e, i) => { if (t !== 'f' || i === 0) s += ORBV.shape(cx, cy, R(o) * k * (t === 'p' ? 1.25 : 1.1), t, t === 'f' ? 0 : Math.min(i, t === 'd' ? 4 : 2), fillStyle(t, e, e !== op[i])); }); });
    return `<svg viewBox="0 0 340 320" class="ch amodel" role="img" aria-label="${ELEM[Z - 1]} 的原子模型">${s}<circle cx="${cx}" cy="${cy}" r="4" class="nuP"/>${coreName ? `<text class="tk corel" x="${cx}" y="${cy + 296 / 2 - 4}" text-anchor="middle">中間灰色的球＝內層 [${coreName}]</text>` : ''}</svg>`;
  }
  function draw() {
    clearTimeout(timer);
    const { Z, q } = st, isExc = q === 0 && DEXC.includes(Z), cf = isExc && st.phase === 1 ? econfAuf(Z) : econf(Z, q);
    const prev = Object.fromEntries(isExc && st.phase === 2 ? econfAuf(Z) : q ? econf(Z, q - 1) : Z > 1 ? econf(Z - 1) : []);
    const ne = Z - q, core = Z > 10 ? CORES.find(([n]) => n < ne && econf(n).every(([o, k]) => (cf.find(x => x[0] === o) || [0, 0])[1] === k)) : null, coreOrb = core ? econf(core[0]).map(x => x[0]) : [];
    const subs = valenceSet(Z, coreOrb), val = cf.filter(([o, k]) => !coreOrb.includes(o) && k > 0);
    $('#a3M', el).innerHTML = model(Z, cf, prev, core && core[1], coreOrb, subs);
    $('#a3B', el).innerHTML = `<p class="lbl">軌域圖：越上面能量越高${Z >= 19 ? '；s 和 d 幾乎一樣高' : ''}</p>` + orbitalChart('m', cf, subs).svg;
    $('#a3O', el).textContent = `${Z}　${ELEM[Z - 1]}（${ENAME[Z - 1]}）`; $('#a3Z', el).value = Z;
    const nm = `${ELEM[Z - 1]}${q ? (q > 1 ? sup(q) : '') + '⁺' : ''}`;
    $('#a3S', el).innerHTML = `${nm}：${core ? `<b>[${core[1]}]</b> ` : ''}${val.map(([o, k]) => `${o}${sup(k)}`).join(' ')}${isExc && st.phase === 1 ? '　<span class="mut small">（照順序寫的，等一下會變）</span>' : ''}`;
    // 例外：照順序 vs 實際，兩張軌域圖並排；原因畫在圖上（搬動的箭頭、同方向電子的連線、成對的排斥）
    if (isExc) {
      const a = econfAuf(Z), b = econf(Z), sv = subs.filter(o => o[1] === 's' || o[1] === 'd'), so = sv.find(o => o[1] === 's'), dd = sv.find(o => o[1] === 'd');
      const A = orbitalChart('a', a, sv, { links: true, pairRed: true, equal: true }), B = orbitalChart('b', b, sv, { links: true, pairRed: true, equal: true, move: [so, dd] });
      const s2a = (Object.fromEntries(a)[so] || 0) === 2, s2b = (Object.fromEntries(b)[so] || 0) === 2;
      $('#a3X', el).innerHTML = `<div class="xcmp"><div><p class="lbl">照順序：${sv.map(o => o + sup(Object.fromEntries(a)[o] || 0)).join(' ')}</p>${A.svg}<p class="small">同方向的連線 <b>${A.links}</b> 條${s2a ? '；s 擠兩個，<span class="redt">互相排斥</span>' : ''}</p></div>
<div><p class="lbl">實際：${sv.map(o => o + sup(Object.fromEntries(b)[o] || 0)).join(' ')}</p>${B.svg}<p class="small">同方向的連線 <b>${B.links}</b> 條${s2b ? '' : '；s 沒有擠在一起'}</p></div></div>
<p class="note">s 和 d 幾乎一樣高，電子從 s 搬到 d 幾乎不用付出能量；換來的是同方向的連線從 ${A.links} 條變 ${B.links} 條（同方向的電子可以互換位置，越多越穩定，稱為交換能）${s2a && !s2b ? '，s 也不用兩個擠在一格' : ''}。得到的比付出的多，所以實際是右邊。${st.phase === 2 ? ' <button class="btn sm" type="button" id="a3R">再看一次</button>' : ''}</p>`;
      const r = $('#a3R', el); if (r) r.onclick = () => { st.phase = 1; draw(); };
      if (st.phase === 1) timer = setTimeout(() => { st.phase = 2; draw(); }, 1300);
    } else $('#a3X', el).innerHTML = '';
    const nw = val.filter(([o, k]) => k !== (prev[o] || 0)).map(([o]) => o), shp = { s: '球', p: '啞鈴', d: '四葉草', f: '多瓣' };
    $('#a3N', el).innerHTML = (q ? `${nm}：從中性原子拿走最上面（能量最高）的電子。${Z >= 21 && Z <= 30 ? ' 3d 填了電子之後畫在 4s 下面，所以先被拿走的是 4s（變成虛線）。' : ''}`
      : `${nw.length ? `第 ${Z} 個電子放進 <b>${nw.join('、')}</b>（紅色外框）。` : ''}電子放進能量最低、還有空位的軌域；同一組軌域先各放一個（淺色），再成對（深色）。`)
      + (core ? ` 灰色的球是內層，和 ${core[1]} 一樣，就是寫法裡的 [${core[1]}]。` : '')
      + (q === 0 && (Z === 19 || Z === 20) ? ' 看軌域圖：3d 是空的虛線，畫在 4s 上面一點，所以電子先放 4s。' : '')
      + ([57, 58, 64].includes(Z) ? ' 鑭系有少數例外（La、Ce、Gd），考試不考。' : '');
    pressSeg(el, 'a3Q', String(q));
  }
  const setZ = z => { st.Z = Math.max(1, Math.min(86, z)); st.q = 0; st.phase = 1; draw(); };
  $$('[data-d]', el).forEach(b => { b.onclick = () => setZ(st.Z + +b.dataset.d); });
  $('#a3Z', el).oninput = e => setZ(+e.target.value);
  bindSeg(el, 'a3Q', v => { st.q = Math.min(+v, st.Z - 1); st.phase = 2; draw(); });
  draw();
  return { set(s2) { Object.assign(st, s2, { phase: 1 }); draw(); } };
};
