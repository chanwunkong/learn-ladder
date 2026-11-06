/* ---------- 後中化學：3D 點雲（第一章第 5 節軌域、第 6 節原子模型共用） ----------
   形狀：實數球諧函數（s 球、p 啞鈴、d 四葉草、f 多瓣）；點的疏密＝電子出現的機率；兩種深淺＝波函數正負。
   單一軌域（第 5 節）用氫原子的真實徑向函數，所以徑向節點是點雲裡的空殼；
   原子模型（第 6 節）用斯萊特軌域，大小由斯萊特規則的有效核電荷決定（J. C. Slater, Phys. Rev. 36, 57, 1930）。 */
const O3D = (() => {
  const ANG = {
    s: [() => 1],
    p: [(x, y, z) => x, (x, y, z) => y, (x, y, z) => z],
    d: [(x, y, z) => x * y, (x, y, z) => y * z, (x, y, z) => x * z, (x, y, z) => (x * x - y * y) / 2, (x, y, z) => (3 * z * z - 1) / 3.46],
    f: [(x, y, z) => z * (5 * z * z - 3), (x, y, z) => x * (5 * z * z - 1), (x, y, z) => y * (5 * z * z - 1), (x, y, z) => z * (x * x - y * y) * 2.6, (x, y, z) => x * y * z * 5.2, (x, y, z) => x * (x * x - 3 * y * y), (x, y, z) => y * (3 * x * x - y * y)],
  };
  // 磁量子數 mℓ → 上面實數軌域的編號與名稱（教科書慣用的對應）
  const BYM = { p: { '-1': [1, 'p_y'], 0: [2, 'p_z'], 1: [0, 'p_x'] }, d: { '-2': [0, 'd_xy'], '-1': [1, 'd_yz'], 0: [4, 'd_z²'], 1: [2, 'd_xz'], 2: [3, 'd_x²−y²'] } };
  const rng = seed => { let x = seed >>> 0 || 1; return () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296); };
  // 方向：依 |角度部分|² 接受／拒絕
  function dir(f, r, mx) { for (;;) { const u = 2 * r() - 1, t = 6.283 * r(), q = Math.sqrt(1 - u * u), x = q * Math.cos(t), y = q * Math.sin(t), v = f(x, y, u); if (r() * mx <= v * v) return [x, y, u, v >= 0 ? 1 : -1]; } }
  function angMax(f, r) { let mx = 0; for (let i = 0; i < 500; i++) { const u = 2 * r() - 1, t = 6.283 * r(), q = Math.sqrt(1 - u * u), v = f(q * Math.cos(t), q * Math.sin(t), u); mx = Math.max(mx, v * v); } return mx; }
  // 氫原子軌域的點雲（單位 a₀）：徑向用真實的 R_nℓ（含徑向節點），r²R² 以接受／拒絕取樣
  function hydrogen(n, l, idx, N) {
    const f = ANG['spdf'[l]][idx], r = rng(n * 131 + l * 17 + idx * 7 + 1), mx = angMax(f, r), rmax = n * n * 2.6 + 6;
    const P = x => { const rho = 2 * x / n, R = Math.pow(rho, l) * Math.exp(-rho / 2) * lagu(n - l - 1, 2 * l + 1, rho); return x * x * R * R; };
    let pm = 0; for (let i = 1; i <= 400; i++) pm = Math.max(pm, P(rmax * i / 400));
    const pts = [];
    while (pts.length < N) { const x = r() * rmax; if (r() * pm > P(x)) continue; const [a, b, c, sg] = dir(f, r, mx); pts.push([a * x, b * x, c * x, sg]); }
    return { pts, R: rmax * 0.62 };
  }
  // 斯萊特軌域的點雲（單位 Å）：r 依 r^(2n*) e^(−2ζr) 分布（伽瑪分布）
  const NSTAR = { 1: 1, 2: 2, 3: 3, 4: 3.7, 5: 4, 6: 4.2 };
  function gamma(k, r) { const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d); for (;;) { let x, v; do { const u1 = r(), u2 = r(); x = Math.sqrt(-2 * Math.log(u1 || 1e-9)) * Math.cos(6.283 * u2); v = 1 + c * x; } while (v <= 0); v = v * v * v; const u = r(); if (Math.log(u || 1e-9) < 0.5 * x * x + d - d * v + d * Math.log(v)) return d * v; } }
  function slater(n, l, idx, ze, N, seed) {
    const f = ANG['spdf'[l]][idx], r = rng(seed), mx = angMax(f, r), ns = NSTAR[n], zeta = ze / ns, pts = [];
    while (pts.length < N) { const [a, b, c, sg] = dir(f, r, mx), x = gamma(2 * ns + 1, r) / (2 * zeta) * 0.529; pts.push([a * x, b * x, c * x, sg]); }
    return pts;
  }
  // 斯萊特規則：有效核電荷（cf 為 [[副層, 電子數]]）
  const GRP = ['1s', '2sp', '3sp', '3d', '4sp', '4d', '4f', '5sp', '5d', '6sp'], grp = o => (o[1] === 's' || o[1] === 'p' ? o[0] + 'sp' : o);
  function zeff(cf, o) {
    const g = grp(o), gi = GRP.indexOf(g), n = +o[0], sp = g.endsWith('sp'); let s = 0;
    cf.forEach(([o2, k]) => { const g2 = grp(o2), gi2 = GRP.indexOf(g2), n2 = +o2[0];
      if (g2 === g) s += (o2 === o ? k - 1 : k) * (g === '1s' ? 0.30 : 0.35);
      else if (gi2 < gi) s += k * (sp ? (n2 === n - 1 ? 0.85 : n2 < n - 1 ? 1 : 0) : 1); });
    return Math.max(1, cf.reduce((a, [, k]) => a + k, 0) - s);
  }
  const meanR = (n, ze) => (2 * NSTAR[n] + 1) / (2 * ze / NSTAR[n]) * 0.529;   // 斯萊特軌域的平均半徑（Å）
  const HUE = { s: '#3A7BD5', p: '#D9822B', d: '#2E9E6B', f: '#9B59B6' };
  const isDark = () => document.documentElement.dataset.theme === 'dark' || (document.documentElement.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  // 可拖動旋轉的畫布：layers 為 [{ pts, hue, alpha }]；scale＝每單位幾像素；extra(ctx, P) 畫額外的東西
  function view(cv, onTap) {
    const st = { yaw: -0.6, pitch: 0.35 }, cx = cv.getContext('2d'); let layers = [], scale = 30, unit = '', extra = null, drag = null;
    function draw() {
      const W2 = cv.width / 2, H2 = cv.height / 2, cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch), dark = isDark();
      const P = ([x, y, z]) => { const x1 = cy * x + sy * z, z1 = -sy * x + cy * z, y1 = cp * y - sp * z1; return [W2 + x1 * scale, H2 - y1 * scale]; };
      cx.clearRect(0, 0, cv.width, cv.height);
      cx.lineWidth = 1.5; cx.font = '22px system-ui'; cx.fillStyle = cx.strokeStyle = dark ? 'rgba(220,230,225,.4)' : 'rgba(40,50,45,.35)';
      const ext = Math.min(W2, H2) * 0.92 / scale;
      [[[ext, 0, 0], 'x'], [[0, ext, 0], 'z'], [[0, 0, ext], 'y']].forEach(([a, t]) => { const [x0, y0] = P([0, 0, 0]), [x1, y1] = P(a); cx.beginPath(); cx.moveTo(2 * x0 - x1, 2 * y0 - y1); cx.lineTo(x1, y1); cx.stroke(); cx.fillText(t, x1 + 4, y1 - 4); });
      if (extra) extra(cx, P, scale, dark);
      layers.forEach(L => L.pts.forEach(p => { const [x, y] = P(p); cx.globalAlpha = L.alpha * (p[3] > 0 ? 1 : 0.6); cx.fillStyle = p[3] > 0 ? L.hue : (dark ? '#E8E8E8' : '#2B2B2B'); cx.fillRect(x - 1.6, y - 1.6, 3.2, 3.2); }));
      cx.globalAlpha = 1; cx.fillStyle = '#C0392B'; cx.beginPath(); cx.arc(W2, H2, 6, 0, 6.283); cx.fill();
      if (unit) { cx.strokeStyle = cx.fillStyle = dark ? '#E3E8E5' : '#1A211F'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(24, cv.height - 24); cx.lineTo(24 + scale, cv.height - 24); cx.stroke(); cx.font = '22px system-ui'; cx.fillText(unit, 24, cv.height - 34); }
    }
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, y0: st.yaw, p0: st.pitch, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; st.yaw = drag.y0 + dx * 0.01; st.pitch = Math.max(-1.5, Math.min(1.5, drag.p0 + dy * 0.01)); draw(); });
    cv.addEventListener('pointerup', e => { if (drag && !drag.moved && onTap) { const r = cv.getBoundingClientRect(); onTap((e.clientX - r.left) / r.width * cv.width - cv.width / 2, (e.clientY - r.top) / r.height * cv.height - cv.height / 2, scale); } drag = null; });
    return { set(o) { ({ layers = layers, scale = scale, unit = unit, extra = extra } = o); draw(); }, draw };
  }
  return { ANG, BYM, hydrogen, slater, zeff, meanR, HUE, view, isDark };
})();

/* ===== 第 6 節：原子模型。內層用鈍氣代替（和寫法 [Ar]… 一樣），點一下展開；外層畫真實形狀與大小；旁邊是外層的真實能量 ===== */
W.atom3d = el => {
  const st = { Z: 8, open: false };
  el.innerHTML = `<div class="w-row"><button class="btn sm" type="button" data-d="-1">－ 拿走一個電子</button><button class="btn sm pri" type="button" data-d="1">＋ 加一個電子</button></div>
<div class="w-row"><label class="rng">原子序 Z<input type="range" id="a3Z" min="1" max="86" step="1"><output class="mono" id="a3O"></output></label></div>
<div class="a3grid"><canvas id="a3C" width="640" height="560" class="a3c" aria-label="原子模型，可以拖動旋轉"></canvas><div id="a3E"></div></div><p class="eq" id="a3S"></p><div id="a3M"></div><p class="note" id="a3N"></p>`;
  const cache = new Map(), occ = (k, m) => Array.from({ length: m }, (_, i) => (k > i ? 1 : 0) + (k > m + i ? 1 : 0));   // 洪德定則：先每格一個，再成對
  const sup = n => String(n).split('').map(c => SUP[c]).join('');
  const V = O3D.view($('#a3C', el), (x, y, sc) => { if (model.core && Math.hypot(x, y) < Math.max(model.coreR * sc, 30)) { st.open = !st.open; update(); } });
  let model = null;
  function build() {
    const Z = st.Z, cf = econf(Z), prev = Z > 1 ? Object.fromEntries(econf(Z - 1)) : {};
    const core = Z > 10 ? CORES.find(([n]) => n < Z && econf(n).every(([o, k]) => (cf.find(x => x[0] === o) || [0, 0])[1] === k)) : null, coreOrb = core ? econf(core[0]).map(x => x[0]) : [];
    const orbs = [];
    cf.forEach(([o, k]) => { const l = LN[o[1]], m = 2 * l + 1, oc = occ(k, m), op = occ(prev[o] || 0, m), ze = O3D.zeff(cf, o), inCore = coreOrb.includes(o);
      oc.forEach((e, i) => { if (!e) return; const key = `${Z}|${o}|${i}|${inCore}`; if (!cache.has(key)) cache.set(key, O3D.slater(+o[0], l, i, ze, inCore ? 240 : 650, Z * 1009 + +o[0] * 97 + i * 13 + l)); orbs.push({ o, inCore, isNew: e !== op[i], pts: cache.get(key) }); }); });
    let coreR = 0; if (core) coreOrb.forEach(o => { coreR = Math.max(coreR, O3D.meanR(+o[0], O3D.zeff(cf, o))); });
    model = { Z, cf, core, coreOrb, coreR, orbs };
  }
  // 外層的真實能量（NIST）：每條線一個副層，越低抓得越緊
  function strip() {
    const { Z, cf, coreOrb } = model, E = ORBE[Z - 1][1], cnt = Object.fromEntries(cf), val = Object.keys(E).filter(o => !coreOrb.includes(o) || !model.core);
    const show = val.filter(o => -E[o] <= 40), lo = Math.min(...show.map(o => E[o]), -2), Y = e => 18 + e / lo * 190;
    const labs = show.map(o => ({ o, y: Y(E[o]) })).sort((a, b) => a.y - b.y); labs.forEach((l, i) => { l.ly = i ? Math.max(l.y, labs[i - 1].ly + 14) : l.y; });
    return `<p class="lbl">外層的真實能量（NIST，eV）</p><svg viewBox="0 0 220 236" class="ch" role="img" aria-label="外層副層的能量"><line x1="30" x2="30" y1="18" y2="208" class="ax"/><text class="tk sm" x="26" y="22" text-anchor="end">0</text><text class="tk sm" x="26" y="212" text-anchor="end">${Math.round(lo)}</text>
${labs.map(({ o, y, ly }) => `<line x1="36" x2="110" y1="${y}" y2="${y}" class="lvl" style="stroke:${O3D.HUE[o[1]]};stroke-width:3"/><text class="tk" x="116" y="${ly + 4}">${o}${cnt[o] ? sup(cnt[o]) : ''}　${E[o].toFixed(1)}</text>`).join('')}</svg>`;
  }
  function measured(Z) {
    const m = MEAS[Z]; if (!m) return '';
    const [g, alt, d, note] = m, y0 = 104, y1 = y0 - d * 24;
    return `<p class="lbl">實際測量（NIST 原子光譜資料庫）</p><svg viewBox="0 0 500 118" class="ch" role="img" aria-label="${ELEM[Z - 1]} 兩種排法的能量"><line x1="60" x2="200" y1="${y0}" y2="${y0}" class="lvl on"/><text class="tk hl" x="210" y="${y0 + 4}">實際：${g}（最低）</text><line x1="60" x2="200" y1="${y1}" y2="${y1}" class="lvl"/><text class="tk" x="210" y="${y1 + 4}">改成 ${alt}</text><line x1="130" x2="130" y1="${y0 - 3}" y2="${y1 + 7}" stroke="var(--arrow)" stroke-width="2" marker-end="url(#a3Ar)"/><text class="tk" x="136" y="${(y0 + y1) / 2 + 4}">高 ${d.toFixed(2)} eV</text><defs><marker id="a3Ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--arrow)"/></marker></defs></svg><p class="small mut">${note}</p>`;
  }
  function update() {
    build();
    const { Z, cf, core, coreOrb, coreR, orbs } = model, val = cf.filter(([o]) => !coreOrb.includes(o)), nw = orbs.filter(b => b.isNew);
    // 放大到填滿畫面（外層平均半徑的 2.2 倍），左下角的比例尺跟著變，大小仍可讀
    // 放大到剛加入電子的那個副層（看得清形狀）；更大的外層會淡淡地延伸到畫面外。左下角的比例尺跟著變
    const focus = nw.length ? nw.map(b => b.o) : cf.map(([o]) => o), rOut = Math.max(...focus.map(o => O3D.meanR(+o[0], O3D.zeff(cf, o)))) * 2.4, sc = 250 / rOut;
    V.set({ scale: sc, unit: '1 Å', layers: orbs.filter(b => !b.inCore || st.open).map(b => ({ pts: b.pts, hue: O3D.HUE[b.o[1]], alpha: b.isNew ? 0.95 : b.inCore ? 0.1 : 0.14 })),
      extra: core && !st.open ? (cx, P, sc, dark) => { const [x, y] = P([0, 0, 0]), g = cx.createRadialGradient(x, y, 0, x, y, coreR * sc); g.addColorStop(0, dark ? 'rgba(160,170,190,.55)' : 'rgba(120,130,150,.45)'); g.addColorStop(1, dark ? 'rgba(160,170,190,.1)' : 'rgba(120,130,150,.08)'); cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, coreR * sc, 0, 6.283); cx.fill(); } : null });
    $('#a3O', el).textContent = `${Z}　${ELEM[Z - 1]}（${ENAME[Z - 1]}）`; $('#a3Z', el).value = Z;
    $('#a3S', el).innerHTML = `${ELEM[Z - 1]}：${core ? `<b>[${core[1]}]</b> ` : ''}${val.map(([o, k]) => `${o}${sup(k)}`).join(' ')}`;
    $('#a3E', el).innerHTML = strip(); $('#a3M', el).innerHTML = measured(Z);
    const shape = { s: '球', p: '啞鈴', d: '四葉草', f: '多瓣' }, no = [...new Set(nw.map(b => b.o))];
    $('#a3N', el).innerHTML = `${no.length ? `第 ${Z} 個電子放進 <b>${no.join('、')}</b>（亮的那個${shape[no[0][1]]}）。` : ''}拖動圖可以旋轉；點的疏密是電子出現的機率。右邊是這些副層的真實能量：電子放進最低、還有空位的那一條。`
      + (core ? ` 灰色的球是內層，和 ${core[1]} 原子一樣，所以寫成 [${core[1]}]；${st.open ? '再點一下收起來。' : '點一下球可以展開看裡面。'}` : '')
      + ' 圖會放大到剛加入電子的軌域，左下角的比例尺是 1 Å；比它大的外層（例如 Fe 的 4s）會淡淡地延伸到畫面外。';
  }
  $$('[data-d]', el).forEach(b => { b.onclick = () => { st.Z = Math.max(1, Math.min(86, st.Z + +b.dataset.d)); st.open = false; update(); }; });
  $('#a3Z', el).oninput = e => { st.Z = +e.target.value; st.open = false; update(); };
  update();
  return { set(s2) { Object.assign(st, s2); update(); } };
};
