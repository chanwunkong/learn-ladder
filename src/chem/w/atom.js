/* ---------- 後中化學：原子結構與週期性的互動圖 ---------- */

/* ===== 1. 氫原子能階與光譜 ===== */
W.hspec = el => {
  let ni = 3, nf = 2, Z = 1;
  const SER = { 1: '來曼系', 2: '巴耳末系', 3: '帕申系' };
  el.innerHTML = `<div class="w-row"><label class="sel">粒子 <select id="hsZ"><option value="1">H</option><option value="2">He⁺</option><option value="3">Li²⁺</option></select></label><label class="sel">從 n = <select id="hsI">${[2, 3, 4, 5, 6, 7].map(n => `<option>${n}</option>`).join('')}</select></label><label class="sel">掉到 n = <select id="hsF">${[1, 2, 3].map(n => `<option>${n}</option>`).join('')}</select></label></div>${ctl('常見的譜線', `<div class="w-row" style="margin:0">${[[3, 2, '紅線 656 nm'], [4, 2, '藍綠線 486 nm'], [2, 1, '來曼系第一條'], [4, 3, '帕申系第一條']].map(([a, b, t]) => `<button class="btn sm ghost" type="button" data-t="${a},${b}">${t}</button>`).join('')}</div>`)}<div class="hsgrid"><div id="hsL"></div><div id="hsS"></div></div><div class="cards" id="hsK"></div><p class="note" id="hsN"></p>`;
  const E = n => -13.6 * Z * Z / (n * n), hc = 1239.84;   // eV·nm；類氫粒子 Eₙ = −13.6 Z²/n²
  const col = l => nmRGB(l) || (l < 380 ? '#7a5cff' : '#c0504a');   // 和「一道光」同一套波長 → 顏色換算
  // 標籤避讓：依 y 排序，太近就往下推，再用細線連回能階
  const spread = (items, gap) => { items.sort((a, b) => a.y - b.y); items.forEach((it, i) => { it.ly = i ? Math.max(it.y, items[i - 1].ly + gap) : it.y; }); return items; };
  const nice = (a, b) => { const span = b - a, st = [1, 2, 5, 10, 20, 50, 100, 200, 500].map(x => x * Math.pow(10, Math.floor(Math.log10(span)) - 1)).find(s => span / s <= 6); const t = []; for (let v = Math.ceil(a / st) * st; v <= b; v += st) t.push(+v.toFixed(6)); return t; };
  function draw() {
    if (nf >= ni) nf = Math.max(1, ni - 1);
    // 能階圖：真實比例（越往上越密）。掉到 n = 1 時畫全部；掉到 n ≥ 2 時放大「0 到終點能階」這一段，箭頭才看得清楚
    const dE = E(ni) - E(nf), lam = hc / dE, zoom = nf > 1, Emin = zoom ? E(nf) * 1.3 : E(1), Y = v => 26 + v / Emin * 206;
    const tk = nice(Emin, 0), ticks = tk.filter(v => v >= Emin), shown = [1, 2, 3, 4, 5, 6, 7].filter(n => E(n) >= Emin);
    const labs = spread([{ y: Y(0), t: 'n = ∞（0 eV，電子離開原子）', on: 0 }, ...[1, 2, 3].concat(ni > 3 ? [ni] : []).filter(k => E(k) >= Emin).map(k => ({ y: Y(E(k)), t: `n = ${k}（${fx(E(k), 2)} eV）`, on: k === ni || k === nf })),
      ...(ni <= 3 ? [{ y: Y(E(5)), t: 'n = 4、5、6…（越往上越密）', on: 0 }] : [])], 15);
    $('#hsL', el).innerHTML = `<svg viewBox="0 0 420 ${zoom ? 268 : 250}" class="ch" role="img" aria-label="能階圖：從 n = ${ni} 掉到 n = ${nf}">
<text class="tk" x="40" y="12" text-anchor="end">eV</text>${ticks.map(v => `<line x1="42" x2="47" y1="${Y(v)}" y2="${Y(v)}" class="ax"/><text class="tk" x="40" y="${Y(v) + 4}" text-anchor="end">${fx(v, 0)}</text>`).join('')}<line class="ax" x1="47" x2="47" y1="${Y(0)}" y2="${Y(Emin)}"/>${zoom ? `<text class="tk" x="56" y="${Y(Emin) + 16}">已放大 0 到 ${fx(Emin, 1)} eV；n = 1（${fx(E(1), 1)} eV）在更下方</text>` : ''}
<line x1="56" x2="210" y1="${Y(0)}" y2="${Y(0)}" class="node"/>${shown.map(n => `<line class="lvl${n === ni || n === nf ? ' on' : ''}" x1="56" x2="210" y1="${Y(E(n))}" y2="${Y(E(n))}"${n === ni || n === nf ? '' : ' style="stroke-width:1.2"'}/>`).join('')}
${labs.map(l => `<line x1="212" x2="222" y1="${l.y}" y2="${l.ly}" class="node"/><text class="tk${l.on ? ' hl' : ''}" x="226" y="${l.ly + 4}">${l.t}</text>`).join('')}
<line data-cur="躍遷箭頭" x1="133" x2="133" y1="${Y(E(ni))}" y2="${Y(E(nf)) - 7}" stroke="${col(lam)}" stroke-width="3.5" marker-end="url(#hm2)"/><defs><marker id="hm2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="${col(lam)}"/></marker></defs></svg>`;
    // 光譜：畫「掉到 n = nf」這一整個系列，範圍跟著系列走（來曼系在紫外、帕申系在紅外）
    const ks = Array.from({ length: 12 - nf }, (_, i) => nf + 1 + i), ls = ks.map(k => hc / (E(k) - E(nf))), lim = hc / -E(nf);
    const x0 = lim * 0.94, x1 = ls[0] * 1.06, xt = nice(x0, x1), reg = l => (l < 380 ? '紫外光' : l <= 750 ? '可見光' : '紅外光');
    $('#hsS', el).innerHTML = chart({ x: [x0, x1], y: [0, 1.3], xt, yt: [], xlab: `${SER[nf]}（掉到 n = ${nf}）的譜線，波長 nm；虛線是系列極限 ${fx(lim, 0)} nm`, h: 150 }, (X, Y) => {
      const va = Math.max(380, x0), vb = Math.min(750, x1), band = [];
      if (vb > va) { const st = []; for (let l = va; l <= vb; l += 10) st.push(`<stop offset="${((l - va) / (vb - va)).toFixed(3)}" stop-color="${nmRGB(Math.min(l, 749))}"/>`);
        band.push(`<defs><linearGradient id="hsVis" gradientUnits="userSpaceOnUse" x1="${X(va)}" x2="${X(vb)}" y1="0" y2="0">${st.join('')}</linearGradient></defs><rect x="${X(va)}" y="${Y(1)}" width="${X(vb) - X(va)}" height="${Y(0) - Y(1)}" fill="url(#hsVis)" opacity=".25"/>`); }
      const zones = [['紫外光', x0, Math.min(380, x1)], ['可見光', Math.max(380, x0), Math.min(750, x1)], ['紅外光', Math.max(750, x0), x1]].filter(z => X(z[2]) - X(z[1]) > 60);
      const anc = X(lam) < 140 ? 'start' : X(lam) > 420 ? 'end' : 'middle';
      return band.join('') + zones.map(z => `<text class="tk" x="${(X(z[1]) + X(z[2])) / 2}" y="${Y(0.12)}" text-anchor="middle">${z[0]}</text>`).join('')
        + `<line x1="${X(lim)}" x2="${X(lim)}" y1="${Y(0)}" y2="${Y(1)}" class="node"/>`
        + ls.map((l, i) => `<line x1="${X(l)}" x2="${X(l)}" y1="${Y(0)}" y2="${Y(1)}" stroke="${col(l)}" stroke-width="${ks[i] === ni ? 5 : 1.6}" opacity="${ks[i] === ni ? 1 : 0.75}"${ks[i] === ni ? ` data-cur="${ni}→${nf} 譜線"` : ''}/>`).join('')
        + `<text class="tk hl" x="${X(lam)}" y="${Y(1.1)}" text-anchor="${anc}">n = ${ni} → ${nf}：${fx(lam, 0)} nm（${reg(lam)}）</text>`;
    });
    $('#hsK', el).innerHTML = card('e', 'ΔE（放出的光子能量）', `${fx(dE, 2)} eV`, `${fx(dE * 96.485, 0)} kJ/mol`) + card('l', '光的波長 λ = hc ÷ ΔE', `${fx(lam, 0)} nm`, `≈ 1240 ÷ ${fx(dE, 2)}`) + card('r', '區域', reg(lam), SER[nf]) + card('ie', `游離能（從 n = 1 拿走）`, `${fx(13.6 * Z * Z, 1)} eV`, `13.6 × ${Z}²`);
    $('#hsN', el).innerHTML = `電子從 n = ${ni} 掉到 n = ${nf}，放出能量 ΔE = 13.6 × ${Z}² × (1/${nf}² − 1/${ni}²) eV = ${fx(dE, 2)} eV 的光子，波長 ${fx(lam, 0)} nm。能階是<b>分立</b>的，所以光譜是一條一條的線，而不是連續的彩虹。同一個系列的線越往短波長越密，最後收在虛線（從 n = ∞ 掉下來，就是游離的逆過程）。掉到 n = 1（來曼系）能量大、在紫外光；掉到 n = 2（巴耳末系）落在可見光；掉到 n = 3（帕申系）在紅外光。${Z > 1 ? ` ${Z === 2 ? 'He⁺' : 'Li²⁺'} 只有一個電子，和氫原子同一套公式，只是原子核電荷 Z = ${Z}：能量乘 Z²，所以同一個系列整個移到更短的波長。` : ''}`;
    $('#hsI', el).value = ni; $('#hsF', el).value = nf; $('#hsZ', el).value = Z;
  }
  $('#hsI', el).onchange = e => { ni = +e.target.value; draw(); };
  $('#hsZ', el).onchange = e => { Z = +e.target.value; draw(); };
  $('#hsF', el).onchange = e => { nf = +e.target.value; draw(); };
  $$('[data-t]', el).forEach(b => { b.onclick = () => { [ni, nf] = b.dataset.t.split(',').map(Number); draw(); }; });
  draw();
  return { set(s) { ni = s.ni ?? ni; nf = s.nf ?? nf; Z = s.Z ?? Z; draw(); } };
};

/* ===== 2. 量子數與軌域 ===== */
W.qn = el => {
  const st = { n: 2, l: 1, m: 0 }, LN = 'spdf';
  el.innerHTML = `<div id="qnC"></div><div class="bgrid"><div id="qnS"><div id="qnV"></div><p class="small mut c" id="qnCap"></p></div><div class="cards" id="qnK"></div></div><p class="note" id="qnN"></p>`;
  let QV = null;
  function shape() {
    const { l, m } = st;
    if (l === 0) return '<circle class="orbf" cx="110" cy="100" r="58"/>';
    if (l === 1) { const v = m === 0; return v ? '<ellipse class="orbf" cx="110" cy="55" rx="28" ry="44"/><ellipse class="orbf b" cx="110" cy="145" rx="28" ry="44"/>' : `<ellipse class="orbf" cx="${m > 0 ? 55 : 60}" cy="100" rx="44" ry="28"/><ellipse class="orbf b" cx="${m > 0 ? 165 : 160}" cy="100" rx="44" ry="28"/>`; }
    if (m === 0) return '<ellipse class="orbf" cx="110" cy="45" rx="20" ry="40"/><ellipse class="orbf" cx="110" cy="155" rx="20" ry="40"/><ellipse class="orbf b" cx="110" cy="100" rx="56" ry="15"/>';
    return [0, 1, 2, 3].map(k => { const a = k * 90 + (Math.abs(m) === 1 ? 45 : 0), x = 110 + Math.cos(a * Math.PI / 180) * 48, y = 100 - Math.sin(a * Math.PI / 180) * 48; return `<ellipse class="orbf${k % 2 ? ' b' : ''}" cx="${x}" cy="${y}" rx="34" ry="18" transform="rotate(${-a} ${x} ${y})"/>`; }).join('');
  }
  // 節點：徑向節點畫成虛線圓（球面的截面），角節面畫成虛線直線（平面的截面）
  function nodesSvg() {
    const { n, l, m } = st, k = n - l - 1, ang = [];
    if (l === 1) ang.push(m === 0 ? 0 : 90);
    if (l === 2) { if (m === 0) ang.push(35.3, -35.3); else if (Math.abs(m) === 1) ang.push(0, 90); else ang.push(45, -45); }
    const radial = Array.from({ length: k }, (_, i) => `<circle cx="110" cy="100" r="${l === 0 ? 16 + i * 18 : 10 + i * 8}" class="node"/>`).join('');
    const planes = ang.map(a => { const r = a * Math.PI / 180, dx = Math.cos(r) * 100, dy = -Math.sin(r) * 100; return `<line x1="${110 - dx}" y1="${100 - dy}" x2="${110 + dx}" y2="${100 + dy}" class="node"/>`; }).join('');
    return radial + planes;
  }
  function draw() {
    const { n, l, m } = st;
    // 三個量子數各一行；ℓ、mℓ 的按鈕數量固定（4 個、7 個），不合規則的變灰
    $('#qnC', el).innerHTML = ctl('n 主量子數：第幾層', segX('qnN1', [1, 2, 3, 4].map(v => [String(v), v]), String(n)))
      + ctl('ℓ 角量子數：形狀（0 到 n − 1）', segX('qnL', [0, 1, 2, 3].map(v => [String(v), `${v}（${LN[v]}）`]), String(l), v => +v >= n))
      + ctl('mℓ 磁量子數：方向（−ℓ 到 +ℓ）', segX('qnM', [-3, -2, -1, 0, 1, 2, 3].map(v => [String(v), v > 0 ? '+' + v : v < 0 ? '−' + -v : '0']), String(m), v => Math.abs(+v) > l).replace('class="seg"', 'class="seg fixw"'));
    bindSeg(el, 'qnN1', v => { st.n = +v; st.l = Math.min(st.l, st.n - 1); st.m = clamp(st.m, -st.l, st.l); draw(); });
    bindSeg(el, 'qnL', v => { st.l = +v; st.m = clamp(st.m, -st.l, st.l); draw(); });
    bindSeg(el, 'qnM', v => { st.m = +v; draw(); });
    // 立體形狀：藍、橘＝波函數正負；半透明圓盤＝角節面；裡面反色的小形狀＝徑向節點之內的部分（外層調成半透明才看得到）
    const t = 'spdf'[l], idx = l === 0 || l === 3 ? 0 : ORBV.BYM[t][m], nm = l === 0 ? `${n}s` : l === 3 ? `${n}f` : `${n}${ORBV.NAMES[t][idx]}`, k = n - l - 1;
    const SG = sg => (sg > 0 ? '#3A7BD5' : '#E07B39'), quads = [];
    if (l < 3) {
      quads.push(...orbMesh(t, idx, l === 0 ? 1.25 : 1, sg => [SG(sg), k ? 0.32 : 0.95]));
      for (let j = 1; j <= k; j++) { const r = 1 - j / (k + 1), flip = j % 2 ? -1 : 1; quads.push(...orbMesh(t, idx, (l === 0 ? 1.25 : 0.85) * r, sg => [SG(sg * flip), 0.95])); }
      if (l) ORBV.PLANES[t][idx].forEach(([e1, e2]) => quads.push(...R3D.disc(e1, e2, 0.8, '#8A9490', 0.13)));
      // d_z² 的兩個角節面是圓錐：頂點在原子核、和 z 軸夾 54.7°（cos²θ = 1/3）
      if (l === 2 && idx === 4) [1, -1].forEach(z => quads.push(...R3D.tube([0, 0, 0], [0, 0, 0.8 * z / Math.sqrt(3)], 0, '#8A9490', 0.13, 0.8 * Math.sqrt(2 / 3)).map(q => ({ ...q, two: true }))));
    } else quads.push(...R3D.sphere(0.4, '#9B59B6', 0.6));
    if (!QV) { $('#qnV', el).innerHTML = '<canvas width="600" height="540" class="r3d" aria-label="軌域的立體模型，左右拖動旋轉"></canvas>'; QV = R3D.view($('#qnV canvas', el)); }
    QV.set({ quads, scale: 205, axes: 1.3 });
    $('#qnCap', el).innerHTML = l === 3 ? 'f 軌域形狀複雜，考試只需要知道有 7 個。' : `${nm} 軌域，左右拖動可以旋轉。藍色、橘色是波函數的正、負號。${l ? `灰色半透明的${l === 2 && m === 0 ? '圓錐面' : '圓盤'}是<b>角節面</b>（${l} 個）：面上找不到電子，兩邊正負號相反。` : ''}${k ? `外層調成半透明，裡面反色的${l ? '小瓣' : '小球'}代表有 <b>${k} 個徑向節點</b>：在兩者交界的球面上找不到電子，越過它正負號就反過來。` : ''}${l === 2 && m === 0 ? ' d_z² 的兩個角節面是圓錐（和 z 軸夾 54.7°），不是平面。' : ''}`;
    $('#qnK', el).innerHTML = card('o', '軌域', `${n}${LN[l]}`) + card('c', '這個副層的軌域數', 2 * l + 1) + card('e', '最多電子數', 2 * (2 * l + 1)) + card('s', `n = ${n} 殼層總軌域數`, n * n) + card('nd', '節面數（角節面 ℓ + 徑向 n−ℓ−1）', `${l} + ${n - l - 1}`);
    $('#qnN', el).innerHTML = `規則：n = 1, 2, 3…；ℓ = 0 到 n − 1；mℓ = −ℓ 到 +ℓ；每個軌域再有 ms = ±½ 兩個自旋。所以第 n 層有 n² 個軌域、最多 2n² 個電子。<b>沒有 1p、2d</b>，因為 ℓ 必須小於 n。`;
  }
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. 電子組態 ===== */
const ELEM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn'.split(' ');
const ENAME = '氫 氦 鋰 鈹 硼 碳 氮 氧 氟 氖 鈉 鎂 鋁 矽 磷 硫 氯 氬 鉀 鈣 鈧 鈦 釩 鉻 錳 鐵 鈷 鎳 銅 鋅 鎵 鍺 砷 硒 溴 氪 銣 鍶 釔 鋯 鈮 鉬 鎝 釕 銠 鈀 銀 鎘 銦 錫 銻 碲 碘 氙 銫 鋇 鑭 鈰 鐠 釹 鉕 釤 銪 釓 鋱 鏑 鈥 鉺 銩 鐿 鎦 鉿 鉭 鎢 錸 鋨 銥 鉑 金 汞 鉈 鉛 鉍 釙 砈 氡'.split(' ');
const AUF = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10], ['4p', 6], ['5s', 2], ['4d', 10], ['5p', 6], ['6s', 2], ['4f', 14], ['5d', 10], ['6p', 6]];
// 基態的例外（與構築原理不同）：[軌域, 電子數] 覆寫
const EXC = { 24: [['4s', 1], ['3d', 5]], 29: [['4s', 1], ['3d', 10]], 41: [['5s', 1], ['4d', 4]], 42: [['5s', 1], ['4d', 5]], 44: [['5s', 1], ['4d', 7]], 45: [['5s', 1], ['4d', 8]], 46: [['5s', 0], ['4d', 10]], 47: [['5s', 1], ['4d', 10]],
  57: [['4f', 0], ['5d', 1]], 58: [['4f', 1], ['5d', 1]], 64: [['4f', 7], ['5d', 1]], 78: [['6s', 1], ['5d', 9]], 79: [['6s', 1], ['5d', 10]] };
const LN = { s: 0, p: 1, d: 2, f: 3 };
function econf(Z, q = 0) {   // 回傳依 n、ℓ 排序的 [[軌域, 電子數]]
  const base = q < 0 ? Z - q : Z, m = new Map(); let left = base;
  for (const [o, c] of AUF) { if (left <= 0) break; const k = Math.min(c, left); m.set(o, k); left -= k; }
  if (q >= 0) (EXC[Z] || []).forEach(([o, k]) => m.set(o, k));
  const sorted = () => [...m.entries()].filter(([, k]) => k > 0).sort((x, y) => (+x[0][0] - +y[0][0]) || (LN[x[0][1]] - LN[y[0][1]]));
  for (let i = 0; i < q; i++) { const ls = sorted(), [o] = ls[ls.length - 1]; m.set(o, m.get(o) - 1); }   // 陽離子：先拿 n 最大（同 n 中 ℓ 最大）的電子
  return sorted();
}
const CORES = [[86, 'Rn'], [54, 'Xe'], [36, 'Kr'], [18, 'Ar'], [10, 'Ne'], [2, 'He']];
W.econf = el => {
  const st = { Z: 26, q: 0, v: 'val' };
  const PRE = [[6, 0, 'C'], [7, 0, 'N'], [19, 0, 'K'], [20, 0, 'Ca'], [21, 0, 'Sc'], [24, 0, 'Cr'], [26, 0, 'Fe'], [26, 2, 'Fe²⁺'], [29, 0, 'Cu'], [42, 0, 'Mo'], [46, 0, 'Pd'], [47, 0, 'Ag'], [16, -2, 'S²⁻'], [11, 1, 'Na⁺'], [50, 0, 'Sn']];
  el.innerHTML = ctl('常見的例子', `<div class="w-row" style="margin:0">${PRE.map(([z, q, t]) => `<button class="btn sm ghost" type="button" data-p="${z},${q}">${t}</button>`).join('')}</div>`)
    + `<div class="w-row"><label class="rng">原子序 Z <input type="range" id="ecZ" min="1" max="86" step="1"><output class="mono" id="ecO"></output></label></div>`
    + ctl('電荷', seg('ecQ', [['-2', '−2'], ['-1', '−1'], ['0', '中性'], ['1', '+1'], ['2', '+2'], ['3', '+3']], '0'))
    + `<div class="cards" id="ecK"></div>`
    + `<p class="eq" id="ecS"></p><p class="lbl">課本的寫法：一格是一個軌域，箭頭是電子與自旋</p><div class="boxes" id="ecB"></div><div id="ecL"></div><p class="note" id="ecN"></p>`;
  const sup = n => String(n).split('').map(c => SUP[c]).join('');
  function draw() {
    const { Z, q, v } = st, cf = econf(Z, q), cf0 = econf(Z), ne = Z - q;
    const core = CORES.find(([n]) => n < ne && econf(n).every(([o, k]) => (cf.find(x => x[0] === o) || [0, 0])[1] === k)), coreOrb = core ? econf(core[0]).map(x => x[0]) : [];
    const val = cf.filter(([o]) => !coreOrb.includes(o));
    const nm = `${ELEM[Z - 1]}${q ? (Math.abs(q) > 1 ? sup(Math.abs(q)) : '') + (q > 0 ? '⁺' : '⁻') : ''}`;
    $('#ecO', el).textContent = `${Z}　${ELEM[Z - 1]}（${ENAME[Z - 1]}）`; $('#ecZ', el).value = Z;
    let last = ''; { let left = Z; for (const [o, c] of AUF) { if (left <= 0) break; last = o; left -= c; } }
    $('#ecL', el).innerHTML = q ? `<p class="small mut">${q > 0 ? '形成陽離子時，先拿走能量最高的電子。' : '陰離子多出的電子放進最低、還有空位的副層。'}</p>` : '';
    $('#ecS', el).innerHTML = `${nm}：${core ? `[${core[1]}] ` : ''}${val.map(([o, k]) => `${o}${sup(k)}`).join(' ') || '（沒有價電子）'}　<span class="mut small">共 ${ne} 個電子</span>`;
    $('#ecB', el).innerHTML = val.map(([o, k]) => { const nb = 2 * LN[o[1]] + 1, up = Math.min(k, nb), dn = k - up;
      return `<div class="sub"><span class="mono small">${o}</span><div>${Array.from({ length: nb }, (_, i) => `<span class="box">${i < up ? '↑' : ''}${i < dn ? '↓' : ''}</span>`).join('')}</div></div>`; }).join('');
    const unp = cf.reduce((s2, [o, k]) => { const nb = 2 * LN[o[1]] + 1; return s2 + (k <= nb ? k : 2 * nb - k); }, 0);
    const iso = CORES.find(([n]) => n === ne);
    $('#ecK', el).innerHTML = card('n', '電子數', ne, `${Z} − (${q})`) + card('u', '未成對電子', unp, unp ? '順磁性' : '反磁性') + card('b', '週期表的區', `${last[1]} 區`, `最後填入 ${last}`) + card('i', '等電子', iso ? iso[1] : '—', iso ? '與鈍氣電子數相同' : '不是鈍氣組態');
    // 陽離子：從中性原子拿走的是哪個副層
    const lost = q > 0 ? cf0.filter(([o, k]) => k > (Object.fromEntries(cf)[o] || 0)).map(([o]) => o) : [], exc = q === 0 && EXC[Z] && ![57, 58, 64].includes(Z);
    $('#ecN', el).innerHTML = `這張圖是課本的寫法：一格是一個軌域，最多兩個箭頭（自旋相反）；同一個副層先每格一個、同方向，再成對。`
      + (exc ? ` <b>${ENAME[Z - 1]}的實際組態和照順序寫的不同</b>：原因看上面原子模型下方的比較圖。` : '')
      + (lost.length ? ` 拿走的是 ${lost.join('、')}：它們在中性 ${ELEM[Z - 1]} 裡能量最高。${lost.includes('4s') && Z >= 21 ? ' 3d 填了電子之後比 4s 低，所以先失去 4s。' : ''}` : '')
      + (q < 0 ? ' 陰離子把多的電子依同樣順序繼續填入。' : '');
    pressSeg(el, 'ecQ', String(q));
    $$('[data-p]', el).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.p === `${Z},${q}`)));
  }
  $('#ecZ', el).oninput = e => { st.Z = +e.target.value; st.q = 0; draw(); };
  bindSeg(el, 'ecQ', v => { st.q = clamp(+v, -2, Math.min(3, st.Z - 1)); draw(); });
  $$('[data-p]', el).forEach(b => { b.onclick = () => { [st.Z, st.q] = b.dataset.p.split(',').map(Number); draw(); }; });
  draw();
  return { set(s2) { st.Z = s2.Z ?? st.Z; st.q = s2.q ?? 0; draw(); } };
};

/* ===== 3b. 填入順序：n + ℓ 小的先填，相同時 n 小的先填（對角線圖） ===== */
W.nlorder = el => {
  const st = { Z: 21 };
  el.innerHTML = `<div class="w-row"><label class="rng">電子數（原子序 Z）<input type="range" id="nlZ" min="1" max="86" step="1"><output class="mono" id="nlO"></output></label></div><div id="nlG"></div><p class="note" id="nlN"></p>`;
  const cell = o => ({ n: +o[0], l: LN[o[1]] }), X = l => 46 + l * 98, Y = n => 30 + (n - 1) * 42;
  function draw() {
    const Z = st.Z; let left = Z, last = '', lastK = 0;
    const fill = AUF.map(([o, c], i) => { const k = Math.max(0, Math.min(c, left)); left -= c; if (k > 0) { last = o; lastK = k; } return { o, c, k, i }; });
    const sums = [...new Set(AUF.map(([o]) => cell(o).n + cell(o).l))];
    const diag = sums.map(m => { const cs = AUF.map(([o]) => o).filter(o => cell(o).n + cell(o).l === m).map(cell).sort((a, b) => a.n - b.n); const a = cs[0], b = cs[cs.length - 1];
      return `<line x1="${X(a.l) + 86}" y1="${Y(a.n) - 6}" x2="${X(b.l) - 4}" y2="${Y(b.n) + 34}" class="diag" marker-end="url(#nlAr)"/><text class="tk sm" x="${X(a.l) + 84}" y="${Y(a.n) - 8}">n+ℓ=${m}</text>`; }).join('');
    const lc = cell(last);
    $('#nlG', el).innerHTML = `<svg viewBox="0 0 470 300" class="ch" role="img" aria-label="填入順序的對角線圖"><defs><marker id="nlAr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker></defs>
${['s（ℓ=0）', 'p（ℓ=1）', 'd（ℓ=2）', 'f（ℓ=3）'].map((t, l) => `<text class="tk" x="${X(l) + 40}" y="14" text-anchor="middle">${t}</text>`).join('')}
${diag}${fill.map(({ o, c, k }) => { const { n, l } = cell(o), on = o === last;
      return `<rect x="${X(l)}" y="${Y(n)}" width="80" height="28" rx="5" class="nlc${on ? ' cur' : ''}"${on ? ` data-cur="正在填 ${o}"` : ''}/><rect x="${X(l)}" y="${Y(n)}" width="${80 * k / c}" height="28" rx="5" class="nlf"/><text class="tk${on ? ' hl' : ''}" x="${X(l) + 10}" y="${Y(n) + 19}">${o}</text><text class="tk sm" x="${X(l) + 72}" y="${Y(n) + 18}" text-anchor="end">${k}/${c}</text>`; }).join('')}</svg>`;
    $('#nlO', el).textContent = `${Z}　${ELEM[Z - 1]}`; $('#nlZ', el).value = Z;
    const m = lc.n + lc.l, same = AUF.map(([o]) => o).filter(o => cell(o).n + cell(o).l === m && o !== last);
    $('#nlN', el).innerHTML = `第 ${Z} 個電子放進 <b>${last}</b>（這一格第 ${lastK} 個）：n + ℓ = ${lc.n} + ${lc.l} = ${m}。${same.length ? `同樣 n + ℓ = ${m} 的還有 ${same.join('、')}，這時 n 小的先填。` : ''} 沿著箭頭從右上往左下讀，就是填入順序 1s → 2s → 2p → 3s → 3p → 4s → 3d → …；這是依真實能量排出來的記憶方法，少數元素（Cr、Cu…）的實際組態不同，下面加電子的圖會說明原因。`;
  }
  $('#nlZ', el).oninput = e => { st.Z = +e.target.value; draw(); };
  draw();
  return { set(s2) { Object.assign(st, s2); draw(); } };
};

/* ===== 4. 週期趨勢 ===== */
W.trend = el => {
  // 主族元素：[符號, 週期, 族序（1–8 表示 1, 2, 13–18 族）, 共價半徑 pm（Cordero 2008）, 第一游離能 kJ/mol, 鮑林電負度]
  const D = [['H', 1, 1, 31, 1312, 2.20], ['He', 1, 8, 28, 2372, null], ['Li', 2, 1, 128, 520, 0.98], ['Be', 2, 2, 96, 899, 1.57], ['B', 2, 3, 84, 801, 2.04], ['C', 2, 4, 76, 1086, 2.55], ['N', 2, 5, 71, 1402, 3.04], ['O', 2, 6, 66, 1314, 3.44], ['F', 2, 7, 57, 1681, 3.98], ['Ne', 2, 8, 58, 2081, null],
    ['Na', 3, 1, 166, 496, 0.93], ['Mg', 3, 2, 141, 738, 1.31], ['Al', 3, 3, 121, 578, 1.61], ['Si', 3, 4, 111, 787, 1.90], ['P', 3, 5, 107, 1012, 2.19], ['S', 3, 6, 105, 1000, 2.58], ['Cl', 3, 7, 102, 1251, 3.16], ['Ar', 3, 8, 106, 1521, null],
    ['K', 4, 1, 203, 419, 0.82], ['Ca', 4, 2, 176, 590, 1.00], ['Ga', 4, 3, 122, 579, 1.81], ['Ge', 4, 4, 120, 762, 2.01], ['As', 4, 5, 119, 947, 2.18], ['Se', 4, 6, 120, 941, 2.55], ['Br', 4, 7, 120, 1140, 2.96], ['Kr', 4, 8, 116, 1351, 3.00]];
  const P = { r: ['原子半徑（pm）', 3, 210], ie: ['第一游離能（kJ/mol）', 4, 2400], en: ['電負度', 5, 4.5] };
  let cur = 'ie';
  el.innerHTML = `${seg('trS', Object.entries(P).map(([k, v]) => [k, v[0]]), cur)}<div id="trG" class="ptab"></div><div id="trC"></div><p class="note" id="trN"></p>`;
  function draw() {
    const [nm, idx, mx] = P[cur];
    $('#trG', el).innerHTML = D.map(d => { const v = d[idx]; return `<div class="pcell" style="grid-row:${d[1]};grid-column:${d[2]};--v:${v == null ? 0 : v / mx}"><b>${d[0]}</b><small>${v == null ? '—' : v}</small></div>`; }).join('');
    const row = D.filter(d => d[1] === 2 && d[idx] != null);
    $('#trC', el).innerHTML = chart({ x: [0.5, 8.5], y: [0, mx], xt: [], yt: [0, mx / 2, mx], xlab: '第二週期（Li → Ne）', ylab: nm, h: 200 }, (X, Y) => `<path class="tline" d="${path(row.map(d => [X(d[2]), Y(d[idx])]))}"/>${row.map(d => `<circle class="dot3" cx="${X(d[2])}" cy="${Y(d[idx])}" r="5"/><text class="tk" x="${X(d[2])}" y="${Y(d[idx]) - 9}" text-anchor="middle">${d[0]}</text>`).join('')}`);
    $('#trN', el).innerHTML = { r: '<b>原子半徑</b>：同週期由左到右<b>變小</b>（質子增加、電子在同一層，有效核電荷變大，拉得更緊）；同族由上到下<b>變大</b>（多一層電子）。',
      ie: '<b>第一游離能</b>：拿走最外層一個電子需要的能量。同週期由左到右大致<b>變大</b>、同族由上到下<b>變小</b>，和半徑相反。注意第二週期的兩個<b>凹陷</b>：B 比 Be 低（B 的電子在能量較高的 2p）；O 比 N 低（O 的 2p 有一個軌域要放兩個電子，互相排斥，比較容易拿走一個）。',
      en: '<b>電負度</b>：原子在鍵中吸引電子的能力。右上角最大（F = 3.98），左下角最小。電負度差決定鍵的極性，是判斷有機反應中哪裡帶 δ+、δ− 的依據。' }[cur];
    pressSeg(el, 'trS', cur);
  }
  bindSeg(el, 'trS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.p || cur; draw(); } };
};

/* ===== 5. 原子的組成：質子、中子、電子 ===== */
const SUBD = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
const supN = v => String(v).split('').map(c => SUP[c]).join(''), subN = v => String(v).split('').map(c => SUBD[c]).join('');
// [按鈕, 元素符號, Z, A, 電荷, 各殼層電子數（K, L, M…）]
const NUC = [['¹H', 'H', 1, 1, 0, [1]], ['²H（氘）', 'H', 1, 2, 0, [1]], ['¹²C', 'C', 6, 12, 0, [2, 4]], ['¹⁴C', 'C', 6, 14, 0, [2, 4]], ['²³Na⁺', 'Na', 11, 23, 1, [2, 8]], ['³⁵Cl⁻', 'Cl', 17, 35, -1, [2, 8, 8]], ['³⁷Cl', 'Cl', 17, 37, 0, [2, 8, 7]], ['⁵⁶Fe³⁺', 'Fe', 26, 56, 3, [2, 8, 13]], ['³²S²⁻', 'S', 16, 32, -2, [2, 8, 8]], ['²³⁸U', 'U', 92, 238, 0, [2, 8, 18, 32, 21, 9, 2]]];
W.nuclide = el => {
  let cur = 7, hl = '';
  el.innerHTML = `<div class="w-row">${NUC.map(([t], i) => `<button class="btn sm ghost" type="button" data-i="${i}">${t}</button>`).join('')}</div><div id="nuG"></div><p class="small mut" id="nuC"></p><div class="cards" id="nuK"></div><p class="note" id="nuN"></p>`;
  function draw() {
    const [, sy, Z, A, q, sh] = NUC[cur], N = A - Z, e = Z - q, tot = Z + N, nn = Math.min(tot, 60), np = Math.round(nn * Z / tot);
    // 原子核：質子與中子依固定的打散順序交錯排在一起（同一核種每次畫出來都一樣）
    const kind = Array.from({ length: nn }, (_, i) => i < np);
    let sd = A * 7 + Z; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
    for (let i = nn - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [kind[i], kind[j]] = [kind[j], kind[i]]; }
    const rN = nn > 30 ? 3 : 4.2, dots = kind.map((p, i) => { const a = i * 2.4, r = rN * 1.15 * Math.sqrt(i); return `<circle cx="${110 + Math.cos(a) * r}" cy="${110 + Math.sin(a) * r}" r="${rN}" class="${p ? 'nuP' : 'nuN'}"/>`; }).join('');
    const core = rN * 1.15 * Math.sqrt(nn) + rN + 6, gap = (104 - core) / sh.length;
    // 電子：依殼層分圈，每圈平均排開；圈上標 n 與這一層的電子數
    const rings = sh.map((k, j) => { const R = core + gap * (j + 1), er = k > 20 ? 2.2 : k > 10 ? 2.8 : 3.6;
      return `<circle cx="110" cy="110" r="${R}" class="nuO"/>` + Array.from({ length: k }, (_, i) => { const a = -Math.PI / 2 + (i + 0.5) / k * Math.PI * 2 + (k > 1 ? 0.35 : 0.6); return `<circle cx="${110 + Math.cos(a) * R}" cy="${110 + Math.sin(a) * R}" r="${er}" class="nuE"/>`; }).join('')
        + (sh.length <= 4 ? `<text class="tk" x="110" y="${110 - R + 3}" text-anchor="middle" style="paint-order:stroke;stroke:var(--bg);stroke-width:3px">n=${j + 1}</text>` : ''); }).join('');
    const qs = q ? (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '+' : '−') : '';
    $('#nuG', el).innerHTML = `<div class="nsym" role="group" aria-label="點符號上的數字">${['A', 'Z'].map(x => '').join('')}<span class="ns-l"><button type="button" data-h="A" class="ns-n">${A}</button><button type="button" data-h="Z" class="ns-n">${Z}</button></span><span class="ns-x">${sy}</span>${q ? `<button type="button" data-h="q" class="ns-n ns-q">${qs}</button>` : ''}</div>
<svg class="ch nusvg${hl ? ' hl-' + hl : ''}" style="max-width:260px;margin:auto" viewBox="-10 -6 250 232" role="img" aria-label="原子組成示意：原子核與電子殼層">${rings}${dots}</svg>`;
    $$('[data-h]', el).forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.h === hl)); b.onclick = () => { hl = hl === b.dataset.h ? '' : b.dataset.h; draw(); }; });
    $('#nuC', el).textContent = `電子殼層由內到外：${sh.join('、')}（共 ${e} 個）。${tot > 60 ? `原子核有 ${tot} 個粒子，圖上只畫 60 個，紅灰比例不變。` : ''}示意圖不按比例：實際的原子核只有原子大小的約十萬分之一；電子也不是在固定的圓形軌道上，真正的分布見第 5 節的軌域。`;
    $('#nuK', el).innerHTML = card('sym', '符號', `${supN(A)}${subN(Z)}${sy}${q ? (Math.abs(q) > 1 ? supN(Math.abs(q)) : '') + (q > 0 ? '⁺' : '⁻') : ''}`) + card('p', '質子（紅）= 原子序 Z', Z) + card('n', '中子（灰）= A − Z', `${N}`, `${A} − ${Z}`) + card('e', '電子（藍）= Z − 電荷', e, `${Z} − (${q})`);
    $('#nuN', el).innerHTML = (hl === 'A' ? `<b>左上的 ${A} 是質量數</b>：原子核裡質子＋中子的總數（亮起來的紅、灰點）。` : hl === 'Z' ? `<b>左下的 ${Z} 是原子序</b>：質子數（亮起來的紅點），決定是哪一種元素。` : hl === 'q' ? `<b>右上的 ${qs} 是電荷</b>：電子數 = ${Z} − (${q}) = ${Z - q}（亮起來的藍點）。` : '點上面符號的數字，看它對應哪些粒子。') + ` 質量數 A = 質子 + 中子；原子序 Z = 質子數，決定是哪一種元素。${q ? `帶 ${q > 0 ? '+' : '−'}${Math.abs(q)} 電荷表示${q > 0 ? '失去' : '得到'} ${Math.abs(q)} 個電子，質子與中子不變。` : '中性原子的電子數等於質子數。'} Z 相同、A 不同的原子互為<b>同位素</b>（例如 ³⁵Cl 與 ³⁷Cl），化學性質幾乎相同。`;
    $$('[data-i]', el).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === cur)));
  }
  $$('[data-i]', el).forEach(b => { b.onclick = () => { cur = +b.dataset.i; hl = ''; draw(); }; });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 6a. 一道光：拖動波長，看波的疏密、顏色、頻率與光子能量 ===== */
// 波長（nm）→ 看到的顏色；可見光以外回傳 null（畫成灰色）
function nmRGB(nm) {
  if (nm < 380 || nm > 750) return null;
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = (440 - nm) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = (510 - nm) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = (645 - nm) / 65; } else r = 1;
  const f = nm < 420 ? 0.3 + 0.7 * (nm - 380) / 40 : nm > 700 ? 0.3 + 0.7 * (750 - nm) / 50 : 1;   // 兩端人眼較不敏感
  return `rgb(${[r, g, b].map(v => Math.round(255 * Math.pow(v * f, 0.8))).join(',')})`;
}
const nmName = nm => nm < 380 ? '紫外光（看不見）' : nm < 450 ? '紫' : nm < 495 ? '藍' : nm < 570 ? '綠' : nm < 590 ? '黃' : nm < 620 ? '橙' : nm <= 750 ? '紅' : '紅外光（看不見）';
W.wave = el => {
  let nm = 550;
  const P = [['紫外光 250 nm', 250], ['紫光 410 nm', 410], ['鈉的黃光 589 nm', 589], ['氫的紅線 656 nm', 656], ['紅外光 1200 nm', 1200]];
  el.innerHTML = `<div class="w-row">${P.map(([t, v]) => `<button class="btn sm ghost" type="button" data-v="${v}">${t}</button>`).join('')}</div>
<div class="w-row"><label class="rng">波長 λ<input type="range" id="wvR" min="200" max="1400" step="1"><output class="mono" id="wvO"></output></label></div>
<div id="wvG"></div><div id="wvS"></div><p class="eq" id="wvF"></p><p class="note" id="wvN"></p>`;
  // 第 2 節第一張圖只看波長、顏色和頻率；光子能量等課文講到光電效應之後才出現（2026-11-07 使用者：講解要一句承接一句）
  function draw() {
    const col = nmRGB(nm), W0 = 600, H = 150, win = 3000;   // 畫面寬度代表 3000 nm
    let d = '';
    for (let x = 0; x <= W0; x += 2) { const y = H / 2 - 52 * Math.sin(2 * Math.PI * (x / W0 * win) / nm); d += `${x ? 'L' : 'M'}${x},${y.toFixed(1)}`; }
    const crests = Math.floor(win / nm), x1 = 60 + W0 * (nm / 4) / win, x2 = x1 + W0 * nm / win;
    $('#wvG', el).innerHTML = `<svg class="ch" viewBox="0 -16 ${W0} ${H + 46}" role="img" aria-label="波長 ${nm} nm 的波">
<line class="ax" x1="0" x2="${W0}" y1="${H / 2}" y2="${H / 2}" stroke-dasharray="3 4"/>
<path d="${d}" fill="none" stroke="${col || 'var(--muted)'}" stroke-width="3" ${col ? '' : 'stroke-dasharray="6 4"'} data-cur="波"/>
${x2 < W0 ? `<line class="mk" x1="${x1}" x2="${x2}" y1="${H / 2 - 62}" y2="${H / 2 - 62}"/><text class="tk" x="${(x1 + x2) / 2}" y="${H / 2 - 68}" text-anchor="middle">λ = ${nm} nm</text>` : ''}
<text class="tk" x="${W0 / 2}" y="${H + 22}" text-anchor="middle">同一段距離（3000 nm）裡有 ${crests} 個多波峰：波長越短，越密</text></svg>`;
    const stops = Array.from({ length: 38 }, (_, i) => { const w = 380 + i * 10; return `<stop offset="${(i / 37 * 100).toFixed(1)}%" stop-color="${nmRGB(w)}"/>`; }).join('');
    const sx = v => 40 + (v - 200) / 1200 * 520;
    $('#wvS', el).innerHTML = `<svg class="ch" viewBox="0 0 600 62" role="img" aria-label="可見光範圍與目前波長"><defs><linearGradient id="wvGr">${stops}</linearGradient></defs>
<rect x="${sx(200)}" y="8" width="${sx(380) - sx(200)}" height="16" fill="var(--sunk)"/><rect x="${sx(380)}" y="8" width="${sx(750) - sx(380)}" height="16" fill="url(#wvGr)"/><rect x="${sx(750)}" y="8" width="${sx(1400) - sx(750)}" height="16" fill="var(--sunk)"/>
<text class="tk" x="${sx(290)}" y="40" text-anchor="middle">紫外光</text><text class="tk" x="${sx(565)}" y="40" text-anchor="middle">可見光</text><text class="tk" x="${sx(1075)}" y="40" text-anchor="middle">紅外光</text>
<path d="M${sx(nm)},4 l-6,-6 h12 z" class="dot"/><line class="mk" x1="${sx(nm)}" x2="${sx(nm)}" y1="4" y2="28"/><text class="tk hl" x="${sx(nm)}" y="58" text-anchor="${sx(nm) < 140 ? 'start' : sx(nm) > 460 ? 'end' : 'middle'}">現在：${nmName(nm)}</text></svg>`;
    const nu = 2.998e8 / (nm * 1e-9);
    $('#wvO', el).textContent = `${nm} nm`;
    $('#wvF', el).innerHTML = `頻率 ν = c/λ = (3.00 × 10⁸ m/s) ÷ (${nm} × 10⁻⁹ m) ≈ <b>${sci(nu, 2)} Hz</b>：每秒通過這麼多個波峰`;
    $('#wvN', el).innerHTML = `波長變短一半，頻率就變兩倍。人眼只看得到約 380–750 nm（可見光），比紫光短的是紫外光，比紅光長的是紅外光。`;
    $('#wvR', el).value = nm;
  }
  $('#wvR', el).oninput = e => { nm = +e.target.value; draw(); };
  $$('[data-v]', el).forEach(b => { b.onclick = () => { nm = +b.dataset.v; draw(); }; });
  draw();
  return { set(s) { if (s.nm) nm = s.nm; draw(); } };
};

/* ===== 3b. 氫原子的三個譜線系：來曼（→1）、巴耳末（→2）、帕申（→3）放在同一條波長軸上 ===== */
W.hseries = el => {
  const S = [[1, '來曼系', '紫外光'], [2, '巴耳末系', '可見光'], [3, '帕申系', '紅外光']];
  let cur = 2;
  el.innerHTML = `${seg('hsrS', S.map(([n, t]) => [String(n), `掉到 n = ${n}（${t}）`]), String(cur))}<div id="hsrG"></div><div class="cards" id="hsrK"></div><p class="note" id="hsrN"></p>`;
  const lam = (ni, nf) => 1239.84 / (13.6 * (1 / (nf * nf) - 1 / (ni * ni)));
  function draw() {
    const lx = v => Math.log10(v);
    $('#hsrG', el).innerHTML = chart({ w: 600, h: 190, x: [lx(80), lx(2200)], y: [0, 3.4], xt: [lx(100), lx(200), lx(400), lx(700), lx(1000), lx(2000)], xtl: ['100', '200', '400', '700', '1000', '2000'], yt: [], xlab: '波長 λ（nm，對數刻度）', label: '氫原子的三個譜線系' }, (X, Y) => {
      let g = `<rect x="${X(lx(380))}" y="${Y(3.4)}" width="${X(lx(750)) - X(lx(380))}" height="${Y(0) - Y(3.4)}" fill="var(--sunk)"/><text class="tk" x="${(X(lx(380)) + X(lx(750))) / 2}" y="${Y(3.25)}" text-anchor="middle">可見光</text>`;
      S.forEach(([nf, t], k) => {
        const yb = Y(2.6 - k * 1.0), on = nf === cur;
        for (let ni = nf + 1; ni <= nf + 6; ni++) { const l = lam(ni, nf), c = nmRGB(l); g += `<line x1="${X(lx(l))}" x2="${X(lx(l))}" y1="${yb - 22}" y2="${yb + 4}" stroke="${c || 'var(--muted)'}" stroke-width="${on ? 3 : 1.5}" opacity="${on ? 1 : 0.45}"/>`; }
        const lim = lam(1e9, nf);
        g += `<line x1="${X(lx(lim))}" x2="${X(lx(lim))}" y1="${yb - 26}" y2="${yb + 6}" class="mk"/><text class="tk${on ? ' hl' : ''}" x="${X(lx(lam(nf + 1, nf))) + 6}" y="${yb - 8}">${t}</text>`;
      });
      return g;
    });
    const l1 = lam(cur + 1, cur), lim = lam(1e9, cur);
    $('#hsrK', el).innerHTML = card('f', '落到', `n = ${cur}`) + card('l', '最長的一條', `${fx(l1, 0)} nm`, `${cur + 1} → ${cur}，能階差最小`) + card('s', '最短的極限', `${fx(lim, 0)} nm`, `∞ → ${cur}（虛線）`);
    $('#hsrN', el).innerHTML = `同一系的譜線越往短波長越擠，最後收斂到極限（從 ∞ 掉下來）。落到的能階越低，能階差越大、波長越短：來曼系全在紫外光，巴耳末系有四條在可見光（656 紅、486 藍綠、434 藍、410 紫），帕申系在紅外光。He⁺、Li²⁺ 的能量是氫的 Z² 倍，整組譜線往短波長移。`;
    pressSeg(el, 'hsrS', String(cur));
  }
  bindSeg(el, 'hsrS', v => { cur = +v; draw(); });
  draw();
  return { set(s) { if (s.nf) cur = s.nf; draw(); } };
};

/* ===== 3c. 波耳軌道的大小：rₙ = 0.529 Å × n² / Z ===== */
W.bohrr = el => {
  const st = { Z: 1, n: 2 };
  el.innerHTML = `<div class="w-row"><label class="sel">粒子 <select id="brZ"><option value="1">H（Z = 1）</option><option value="2">He⁺（Z = 2）</option><option value="3">Li²⁺（Z = 3）</option></select></label></div>${ctl('看哪一層', seg('brN', [1, 2, 3, 4].map(n => [String(n), `n = ${n}`]), '2'))}<div id="brG"></div><div class="cards" id="brK"></div><p class="note" id="brT"></p>`;
  function draw() {
    const { Z, n } = st, r = k => 0.529 * k * k / Z, sc = 105 / r(4) * Z / 1;   // 以 H 的 n = 4 當最大圈，比例固定，換 Z 時圈會縮小
    const R = k => 0.529 * k * k / Z * (105 / (0.529 * 16));
    $('#brG', el).innerHTML = `<svg class="ch" style="max-width:300px;margin:auto" viewBox="0 0 240 240" role="img" aria-label="波耳軌道半徑">${[1, 2, 3, 4].map(k => `<circle cx="120" cy="120" r="${R(k)}" class="nuO" style="${k === n ? 'stroke:var(--accent);stroke-width:2.5;stroke-dasharray:none' : ''}"/>${R(k) > 9 ? `<text class="tk" x="${120 + R(k) * 0.7 + 2}" y="${120 - R(k) * 0.7}">n=${k}</text>` : ''}`).join('')}<circle cx="120" cy="120" r="4" class="nuP"/><circle cx="${120 + R(n)}" cy="120" r="5" class="nuE"/></svg>`;
    $('#brK', el).innerHTML = card('r', `r${['', '₁', '₂', '₃', '₄'][n]} = 0.529 × ${n}² ÷ ${Z}`, `${fx(r(n), 3)} Å`) + card('x', '是氫基態的幾倍', `${fx(n * n / Z, 2)} 倍`, 'n² ÷ Z');
    $('#brT', el).innerHTML = `半徑和 n² 成正比：n = 2 是 n = 1 的 4 倍、n = 3 是 9 倍，所以高能階的圈越來越大、能量間距卻越來越小。Z 越大，原子核拉得越緊，同一層的圈縮成 1/Z（換成 He⁺、Li²⁺ 看看）。圖上的比例固定，以氫的 n = 4 為最外圈。`;
    $('#brZ', el).value = Z; pressSeg(el, 'brN', String(n));
  }
  $('#brZ', el).onchange = e => { st.Z = +e.target.value; draw(); };
  bindSeg(el, 'brN', v => { st.n = +v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 5b. 電子在離原子核多遠的地方？氫原子的徑向機率分布 r²R² ===== */
// R_nℓ(r) ∝ ρ^ℓ e^(−ρ/2) L_{n−ℓ−1}^{2ℓ+1}(ρ)，ρ = 2r/(n a₀)；廣義拉蓋爾多項式用遞迴計算
function lagu(k, a, x) { if (k === 0) return 1; let L0 = 1, L1 = 1 + a - x; for (let i = 1; i < k; i++) { const L2 = ((2 * i + 1 + a - x) * L1 - (i + a) * L0) / (i + 1); L0 = L1; L1 = L2; } return L1; }
W.radial = el => {
  const st = { sel: ['2s', '2p'] }, ALL = ['1s', '2s', '2p', '3s', '3p', '3d', '4s', '4p', '4d', '4f'], COL = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)'];
  el.innerHTML = ctl('選幾個軌域疊在一起比較（最多 4 個）', `<div class="seg" id="rdS" role="group">${ALL.map(o => `<button type="button" data-o="${o}">${o}</button>`).join('')}</div>`) + `<div class="cards" id="rdK"></div><div id="rdG"></div><p class="small" id="rdL"></p><p class="note" id="rdN"></p>`;
  // 徑向機率 P(r) = r²R²，各自正規化成面積 1，高度才能互相比較
  const curve = (n, l, rmax, N = 300) => { const k = n - l - 1, P = Array.from({ length: N + 1 }, (_, i) => { const r = rmax * i / N, rho = 2 * r / n, R = Math.pow(rho, l) * Math.exp(-rho / 2) * lagu(k, 2 * l + 1, rho); return [r, r * r * R * R]; }); const A = P.reduce((s, p) => s + p[1], 0) * rmax / N; return P.map(([r, p]) => [r, p / A]); };
  const nodesOf = (n, l, rmax, N = 600) => { const k = n - l - 1, out = []; let prev = null; for (let i = 1; i <= N; i++) { const r = rmax * i / N, v = lagu(k, 2 * l + 1, 2 * r / n); if (prev != null && prev * v < 0) out.push(r); prev = v; } return out; };
  function draw() {
    const sel = st.sel, nmax = Math.max(...sel.map(o => +o[0])), rmax = nmax * nmax * 2 + 6, data = sel.map(o => ({ o, n: +o[0], l: 'spdf'.indexOf(o[1]), P: curve(+o[0], 'spdf'.indexOf(o[1]), rmax) }));
    const mx = Math.max(...data.flatMap(d => d.P.map(p => p[1]))), xt = Array.from({ length: Math.floor(rmax / 5) + 1 }, (_, i) => i * 5);
    $('#rdG', el).innerHTML = chart({ w: 600, h: 250, x: [0, rmax], y: [0, mx * 1.08], xt, yt: [], xlab: '離原子核的距離 r（單位 a₀ = 0.529 Å）', ylab: '機率', label: '徑向機率分布' }, (X, Y) =>
      `<rect x="${X(0)}" y="${Y(mx * 1.08)}" width="${X(Math.min(1.5, rmax)) - X(0)}" height="${Y(0) - Y(mx * 1.08)}" class="nearz"/><text class="tk sm" x="${X(0) + 3}" y="${Y(mx * 1.08) + 12}">靠近原子核</text>`
      + data.map((d, i) => `<path d="${d.P.map(([r, p], j) => `${j ? 'L' : 'M'}${X(r).toFixed(1)},${Y(p).toFixed(1)}`).join('')}" fill="none" stroke="${COL[i]}" stroke-width="3"${i === data.length - 1 ? ` data-cur="${d.o} 的曲線"` : ''}/>`
        + nodesOf(d.n, d.l, rmax).map(r => `<circle cx="${X(r)}" cy="${Y(0)}" r="4.5" fill="${COL[i]}"/>`).join('')).join(''));
    $('#rdL', el).innerHTML = data.map((d, i) => { const nd = nodesOf(d.n, d.l, rmax); return `<span class="lgd" style="--c:${COL[i]}">${d.o}</span>徑向節點 ${nd.length} 個${nd.length ? `（${nd.map(r => fx(r, 1)).join('、')} a₀）` : ''}`; }).join('　');
    const last = data[data.length - 1];
    $('#rdK', el).innerHTML = card('o', '最後選的軌域', last.o) + card('r', '徑向節點（球面）', `${last.n - last.l - 1} 個`, 'n − ℓ − 1') + card('a', '角節面（平面）', `${last.l} 個`, '= ℓ');
    const has2s2p = sel.includes('2s') && sel.includes('2p'), has3 = ['3s', '3p', '3d'].filter(o => sel.includes(o)).length >= 2;
    $('#rdN', el).innerHTML = `曲線是「在半徑 r 的薄球殼上找到電子」的機率，每條都調成面積相同，可以直接比較。曲線碰到 0 的地方（圓點）是<b>徑向節點</b>：那個半徑的整個球面上都找不到電子。`
      + (has2s2p ? ' <b>看 2s 和 2p</b>：兩條的主峰差不多遠，但 2s 在灰底區（靠近原子核）多了一個小峰，2p 幾乎沒有。這一小部分時間 2s 電子很靠近原子核（稱為<b>穿透</b>），被抓得比較緊，所以 2s 的能量比 2p 低，填電子時先填 2s。' : '')
      + (has3 ? ' 同一層裡 ℓ 越小，靠近原子核的小峰越多（3s > 3p > 3d），所以能量 3s < 3p < 3d。' : '')
      + (!has2s2p && !has3 ? ' 試試同時選 2s 和 2p，或 3s、3p、3d，比較靠近原子核的部分。' : '');
    $$('#rdS button', el).forEach(b => b.setAttribute('aria-pressed', String(sel.includes(b.dataset.o))));
  }
  $$('#rdS button', el).forEach(b => { b.onclick = () => { const o = b.dataset.o, i = st.sel.indexOf(o);
    if (i >= 0) { if (st.sel.length > 1) st.sel.splice(i, 1); } else { st.sel.push(o); if (st.sel.length > 4) st.sel.shift(); } draw(); }; });
  draw();
  return { set(s) { if (s.n) st.sel = [`${s.n}${'spdf'[s.l || 0]}`]; Object.assign(st, s.sel ? { sel: s.sel } : {}); draw(); } };
};

/* ===== 7b. 有效核電荷：外層電子實際感受到多少正電 ===== */
// 依構築順序填電子，回傳各殼層電子數（不處理 Cr、Cu 例外，對有效核電荷的趨勢沒有影響）
function shellsOf(Z) {
  const ORD = [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1]], sh = [0, 0, 0, 0, 0];
  let left = Z; for (const [n, l] of ORD) { const c = Math.min(left, 2 * (2 * l + 1)); sh[n] += c; left -= c; if (!left) break; }
  return sh.slice(1).filter((v, i, a) => v || a.slice(i).some(Boolean));
}
const ESYM = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'];
W.zeff = el => {
  let Z = 11;
  el.innerHTML = `<div class="w-row"><label class="rng">原子序 Z<input type="range" id="zfR" min="1" max="36" step="1"><output class="mono" id="zfO"></output></label></div><div class="bgrid"><div id="zfA"></div><div class="cards" id="zfK"></div></div><div id="zfG"></div><p class="note" id="zfN"></p>`;
  const zeffOf = z => { const sh = shellsOf(z); return z - (sh.reduce((a, b) => a + b, 0) - sh[sh.length - 1]); };
  function draw() {
    const sh = shellsOf(Z), outer = sh[sh.length - 1], core = Z - outer, zf = Z - core, nOut = sh.length;
    const R = j => 30 + (j + 1) * (78 / sh.length);
    $('#zfA', el).innerHTML = `<svg class="ch" style="max-width:240px;margin:auto" viewBox="0 0 240 240" role="img" aria-label="原子核、內層電子與最外層電子">
${sh.map((k, j) => `<circle cx="120" cy="120" r="${R(j)}" class="nuO" style="${j === nOut - 1 ? 'stroke:var(--accent);stroke-dasharray:none;stroke-width:2' : ''}"/>` + Array.from({ length: k }, (_, i) => { const a = -Math.PI / 2 + (i + 0.5) / k * 2 * Math.PI; return `<circle cx="${120 + Math.cos(a) * R(j)}" cy="${120 + Math.sin(a) * R(j)}" r="${k > 10 ? 2.6 : 3.6}" class="nuE" style="${j === nOut - 1 ? '' : 'opacity:.45'}"/>`; }).join('')).join('')}
<circle cx="120" cy="120" r="22" class="nuP"/><text x="120" y="125" text-anchor="middle" style="fill:#fff;font:700 14px var(--mono)">+${Z}</text></svg>`;
    $('#zfK', el).innerHTML = card('z', `原子核 ${ESYM[Z]}`, `+${Z}`) + card('c', '內層電子（遮蔽）', `−${core}`) + card('f', '有效核電荷 ≈ Z − 內層', `+${zf}`, `外層在 n = ${nOut}，有 ${outer} 個電子`);
    const pts = Array.from({ length: 36 }, (_, i) => [i + 1, zeffOf(i + 1)]);
    $('#zfG', el).innerHTML = chart({ w: 600, h: 240, x: [0, 37], y: [0, 9], xt: [2, 10, 18, 36], yt: [0, 2, 4, 6, 8], xlab: '原子序 Z（每個週期的鈍氣：He 2、Ne 10、Ar 18、Kr 36）', ylab: 'Zeff', label: '有效核電荷的週期變化' }, (X, Y) =>
      pts.map(([z, v]) => `<rect x="${X(z) - 5}" y="${Y(v)}" width="10" height="${Y(0) - Y(v)}" class="bv" style="${z === Z ? 'fill:var(--accent)' : 'opacity:.55'}"/>`).join('') + `<text class="tk hl" x="${X(Z)}" y="${Y(zeffOf(Z)) - 6}" text-anchor="middle">${ESYM[Z]}</text>`);
    $('#zfO', el).textContent = `${Z}（${ESYM[Z]}）`;
    $('#zfN', el).innerHTML = `簡化模型：假設內層電子把原子核的正電完全抵銷，同一層的電子彼此不遮蔽。<b>同週期往右</b>：質子多一個、新電子在同一層，有效核電荷一路增加（Na +1 → Cl +7），外層被拉得更緊：半徑變小、游離能與電負度變大。<b>換到下一個週期</b>：新電子進入更外面的一層，內層多了一整層遮蔽，有效核電荷掉回 +1（Ar → K），而且離原子核更遠：半徑突然變大、游離能突然變小。過渡金屬（Sc 到 Zn）新增的電子填在內層的 3d，外層 4s 感受到的有效核電荷幾乎不變，所以這一段的性質變化很小。`;
    $('#zfR', el).value = Z;
  }
  $('#zfR', el).oninput = e => { Z = +e.target.value; draw(); };
  draw();
  return { set(s) { if (s.Z) Z = s.Z; draw(); } };
};

/* ===== 9b. 電子親和力：加電子是放熱還是吸熱 ===== */
// 第一、第二電子親和力（ΔH，kJ/mol；O⁻ → O²⁻ 為常見教科書值）
const EAF = { O: [['O', 'O⁻', -141], ['O⁻', 'O²⁻', 744]], F: [['F', 'F⁻', -328]], Cl: [['Cl', 'Cl⁻', -349]], S: [['S', 'S⁻', -200]] };
W.eaff = el => {
  let cur = 'O';
  el.innerHTML = `${seg('eaS', Object.keys(EAF).map(k => [k, k]), cur)}<div id="eaG"></div><p class="note" id="eaN"></p>`;
  function draw() {
    const steps = EAF[cur], lv = [0]; steps.forEach(s => lv.push(lv[lv.length - 1] + s[2]));
    const lo = Math.min(...lv, -400), hi = Math.max(...lv, 100);
    $('#eaG', el).innerHTML = chart({ w: 520, h: 240, x: [0, steps.length + 1], y: [lo - 40, hi + 60], xt: [], yt: [-400, -200, 0, 200, 400, 600].filter(v => v >= lo - 40 && v <= hi + 60), ylab: '能量（kJ/mol，以中性原子為 0）', label: '加入電子的能量變化' }, (X, Y) =>
      lv.map((v, i) => `<line class="lvl on" x1="${X(i + 0.5) - 40}" x2="${X(i + 0.5) + 40}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--ink);stroke-width:3"/><text class="tk" x="${X(i + 0.5)}" y="${Y(v) - 8}" text-anchor="middle">${i ? steps[i - 1][1] : steps[0][0]}</text>`).join('')
      + steps.map((s, i) => { const up = s[2] > 0; return `<line class="mk" x1="${X(i + 1) - 6}" x2="${X(i + 1) - 6}" y1="${Y(lv[i])}" y2="${Y(lv[i + 1])}" style="stroke:${up ? 'var(--bad)' : 'var(--good)'};stroke-dasharray:none;stroke-width:2.5"/><text class="tk" x="${X(i + 1) - 12}" y="${(Y(lv[i]) + Y(lv[i + 1])) / 2 + 4}" text-anchor="end" style="fill:${up ? 'var(--bad)' : 'var(--good)'}">${up ? '+' : ''}${s[2]}（${up ? '吸熱' : '放熱'}）</text>`; }).join(''));
    $('#eaN', el).innerHTML = `中性的非金屬原子得到第一個電子時，新電子受到原子核吸引，能量下降（放熱，ΔH &lt; 0）。${cur === 'O' ? '但 O⁻ 已經帶負電，再塞一個電子要克服負電之間的排斥，第二電子親和力是<b>吸熱</b>的。O²⁻ 能在離子晶體中穩定存在，是因為晶格能把這些能量補回來。' : cur === 'F' || cur === 'Cl' ? 'F 的電負度比 Cl 大，但第一電子親和力卻是 Cl 放熱較多：F 太小，電子擠在 2p 互相排斥。' : '同族往下（O → S）原子變大，加入的電子較不擁擠。'}`;
    pressSeg(el, 'eaS', cur);
  }
  bindSeg(el, 'eaS', v => { cur = v; draw(); });
  draw();
  return { set(s) { if (s.e) cur = s.e; draw(); } };
};

/* ===== 6. 電磁波譜：λ、ν、E 與每莫耳能量 ===== */
const EMR = [['γ 射線', -14, -11, '#7a5cff', 0], ['X 射線', -11, -8, '#6a6ad8', 1], ['紫外光', -8, -6.42, '#8a4cff', 0], ['可見光', -6.42, -6.12, '#2fbf5f', 1], ['紅外光', -6.12, -3, '#e2403a', 0], ['微波', -3, 0, '#c87a3a', 1], ['無線電波', 0, 3, '#9a8a6a', 0]];
// 第 2 節：光電效應（觀察）：顏色決定電子飛不飛得出來，亮度只決定飛出幾個；金屬用鈉（約 2.3 eV，波長短於約 540 nm 才打得出）
W.photoel = el => {
  const st = { nm: 650, n: 3 }, C = [['紅光 650 nm', 650], ['綠光 520 nm', 520], ['紫光 410 nm', 410], ['紫外光 250 nm', 250]];
  el.innerHTML = `${ctl('光的顏色', seg('peC', C.map(([t, v]) => [String(v), t]), '650'))}${ctl('亮度', seg('peB', [['3', '暗'], ['9', '很亮']], '3'))}<div id="peG"></div><p class="note" id="peN"></p>`;
  function draw() {
    const ok = st.nm < 540, col = nmRGB(st.nm) || '#8E5BD6', ys = Array.from({ length: st.n }, (_, i) => 40 + i * (150 / st.n));
    const ph = ys.map(y => `<path d="${path(Array.from({ length: 41 }, (_, k) => [40 + k * 4.5, y + 7 * Math.sin(k * 0.9)]))}" fill="none" stroke="${col}" stroke-width="2.5"/><path d="M225 ${y} l-9 -5 v10 z" fill="${col}"/>`).join('');
    const ex = ok ? ys.map((y, i) => `<line x1="300" y1="${y + 6}" x2="${400 + (i % 3) * 30}" y2="${y - 18 + (i % 2) * 10}" stroke="var(--muted)" stroke-dasharray="3 3"/><circle cx="${400 + (i % 3) * 30}" cy="${y - 18 + (i % 2) * 10}" r="6" fill="#3A7BD5" data-cur="飛出的電子"/>`).join('') : '';
    $('#peG', el).innerHTML = `<svg viewBox="0 0 520 210" class="ch" role="img" aria-label="光照在金屬上">
<rect x="240" y="20" width="56" height="175" rx="4" fill="var(--sunk)" stroke="var(--line)"/><text class="tk sm" x="268" y="205" text-anchor="middle">金屬（鈉）</text>
${ph}${ex}${ok ? '' : Array.from({ length: 4 }, (_, i) => `<circle cx="262" cy="${50 + i * 38}" r="5" fill="#3A7BD5" opacity=".7"/>`).join('')}
<text class="tk ${ok ? 'hl' : 'bad'}" x="420" y="200" text-anchor="middle">${ok ? `飛出 ${st.n} 個電子` : '一個電子也沒有飛出來'}</text></svg>`;
    $('#peN', el).innerHTML = ok ? `${st.nm < 400 ? '紫外光' : '這個顏色'}照上去，電子馬上飛出來；${st.n > 3 ? '調亮之後飛出的電子變多了。' : '調亮看看：電子會變多。'}換成紅光試試。`
      : `${st.n > 3 ? '已經調到很亮，' : ''}還是一個電子也打不出來。${st.n > 3 ? '亮度沒有用，換一個顏色試試。' : '把亮度調高看看。'}`;
    pressSeg(el, 'peC', String(st.nm)); pressSeg(el, 'peB', String(st.n));
  }
  bindSeg(el, 'peC', v => { st.nm = +v; draw(); });
  bindSeg(el, 'peB', v => { st.n = +v; draw(); });
  draw();
  return { set(s2) { Object.assign(st, s2); draw(); } };
};
W.emspec = el => {
  let lg = Math.log10(240e-9);
  const P = [['O₂ 解離（498 kJ/mol）', 240e-9], ['300 nm 紫外光', 300e-9], ['鈉的黃光 589 nm', 589e-9], ['X 光 0.1 nm', 1e-10], ['微波爐 12 cm', 0.12], ['FM 廣播 3 m', 3]];
  el.innerHTML = `<div class="w-row">${P.map(([t, v]) => `<button class="btn sm ghost" type="button" data-v="${v}">${t}</button>`).join('')}</div><div class="w-row"><label class="rng">波長 λ（對數尺度）<input type="range" id="emR" min="-13" max="2.5" step="0.01"><output class="mono" id="emO"></output></label></div><div id="emG"></div><p class="eq" id="emF"></p><div class="cards" id="emK"></div><p class="note" id="emN"></p>`;
  function draw() {
    const l = 10 ** lg, nu = 2.998e8 / l, E = 6.626e-34 * nu, Em = E * 6.022e23 / 1000, reg = EMR.find(r => lg >= r[1] && lg < r[2]) || EMR[EMR.length - 1];
    $('#emG', el).innerHTML = chart({ w: 600, h: 150, x: [-14, 3], y: [0, 1], xt: [-12, -9, -6, -3, 0], yt: [], xlab: 'log₁₀ λ（m）　← 波長短、能量高　　波長長、能量低 →', label: '電磁波譜' }, (X, Y) =>
      EMR.map(r => `<rect x="${X(r[1])}" y="${Y(0.62)}" width="${X(r[2]) - X(r[1])}" height="${Y(0) - Y(0.62)}" fill="${r[3]}" opacity="${r === reg ? 0.75 : 0.22}"/><text class="tk${r === reg ? ' hl' : ''}" x="${X((r[1] + r[2]) / 2)}" y="${Y(r[4] ? 0.7 : 0.88)}" text-anchor="middle">${r[0]}</text>`).join('')
      + `<line class="mk" x1="${X(lg)}" x2="${X(lg)}" y1="${Y(0)}" y2="${Y(0.62)}"/><circle class="dot" cx="${X(lg)}" cy="${Y(0.31)}" r="7"/>`);
    const ls = l >= 1 ? `${fx(l, 2)} m` : l >= 1e-3 ? `${fx(l * 100, 1)} cm` : `${sci(l * 1e9, 3)} nm`;
    $('#emO', el).textContent = ls;
    $('#emF', el).innerHTML = `一莫耳光子：E（kJ/mol）≈ 119,600 ÷ λ（nm）≈ <b>${sci(Em, 3)} kJ/mol</b>`;
    $('#emK', el).innerHTML = card('l', '波長 λ', ls) + card('r', '區域', reg[0]) + card('e', '一莫耳光子（kJ/mol）', sci(Em, 3));
    const BONDS = [['Cl–Cl', 243], ['C–C', 348], ['H–H', 436], ['O=O', 498]];
    $('#emN', el).innerHTML = `<b>和化學鍵比</b>（打斷一莫耳鍵需要的能量）：${BONDS.map(([b, e]) => `${b} ${e}：${Em >= e ? '<b class="r-ok">打得斷</b>' : '<span class="mut">打不斷</span>'}（最長 ${fx(119600 / e, 0)} nm）`).join('；')}。波長越短、能量越高；由長到短：無線電波 &gt; 微波 &gt; 紅外光 &gt; 可見光 &gt; 紫外光 &gt; X 射線 &gt; γ 射線。`;
    $('#emR', el).value = lg;
  }
  $('#emR', el).oninput = e => { lg = +e.target.value; draw(); };
  $$('[data-v]', el).forEach(b => { b.onclick = () => { lg = Math.log10(+b.dataset.v); draw(); }; });
  draw();
  return { set(s) { if (s.l) lg = Math.log10(s.l); draw(); } };
};

/* ===== 7. 一維箱中粒子 ===== */
/* ===== 4a. 為什麼只能放整數個半波長？拖動波長，看波的右端有沒有剛好落在牆上 0 ===== */
W.boxfit = el => {
  const st = { lam: 1.3 };
  el.innerHTML = `<div class="w-row"><label class="rng">波長 λ（箱長 L 的幾倍）<input type="range" id="bfR" min="0.35" max="2.4" step="0.01"><output class="mono" id="bfO"></output></label></div><div id="bfG"></div><p class="note" id="bfN"></p>`;
  function draw() {
    const ok = [1, 2, 3, 4, 5].find(n => Math.abs(st.lam - 2 / n) < 0.03), lam = ok ? 2 / ok : st.lam, end = Math.sin(2 * Math.PI / lam);
    const x0 = 70, x1 = 450, yc = 80, A = 46, X = u => x0 + (x1 - x0) * u;
    const wave = path(Array.from({ length: 121 }, (_, i) => [X(i / 120), yc - A * Math.sin(2 * Math.PI * (i / 120) / lam)]));
    const lx = v => 60 + (v - 0.3) / 2.2 * 400;
    $('#bfG', el).innerHTML = `<svg viewBox="0 0 520 250" class="ch" role="img" aria-label="箱子裡的波">
<rect x="${x0 - 14}" y="${yc - 66}" width="14" height="132" class="wall"/><rect x="${x1}" y="${yc - 66}" width="14" height="132" class="wall"/>
<line x1="${x0}" x2="${x1}" y1="${yc}" y2="${yc}" class="node"/><text class="tk" x="${x0 - 7}" y="${yc + 84}" text-anchor="middle">牆</text><text class="tk" x="${x1 + 7}" y="${yc + 84}" text-anchor="middle">牆</text>
<path d="${wave}" fill="none" stroke-width="3.5" class="${ok ? 'w-ok' : 'w-bad'}" data-cur="波"/>
${ok ? '' : `<circle cx="${x1}" cy="${yc - A * end}" r="7" class="dot-bad"/>`}
<text class="tk ${ok ? 'hl' : 'bad'}" x="${(x0 + x1) / 2}" y="${yc - 58}" text-anchor="middle">${ok ? `兩端都是 0：剛好放進 ${ok} 個半波長（允許）` : '右牆上不是 0：不允許'}</text>
<line x1="60" x2="460" y1="200" y2="200" class="ax"/>${[1, 2, 3, 4, 5].map(n => `<line x1="${lx(2 / n)}" x2="${lx(2 / n)}" y1="192" y2="208" class="w-okl"/><text class="tk sm" x="${lx(2 / n)}" y="222" text-anchor="middle">n=${n}</text>`).join('')}
<circle cx="${lx(lam)}" cy="200" r="6" class="dot"/><text class="tk" x="60" y="242">允許的波長只有綠色刻度：λ = 2L ÷ n</text></svg>`;
    $('#bfR', el).value = st.lam; $('#bfO', el).textContent = `${fx(lam, 2)} L`;
    $('#bfN', el).innerHTML = `粒子穿不過牆，在牆上找到它的機率是 0，所以它的波在<b>兩端都必須是 0</b>。左端一定從 0 開始；拖動波長，只有在右端也剛好落在 0 的時候（綠色）才可以存在。這時箱子裡剛好放進整數個半波長：L = n × λ/2，所以 λ 只能是 2L、L、2L/3…，不能任意取。`;
  }
  $('#bfR', el).oninput = e => { st.lam = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 4b. 能量和 n²、L 的關係：真實單位 eV；左邊 L = 1 nm 的箱子固定，右邊的箱子寬度跟著 L 變 ===== */
// 第一章第 2、3 節：單位換算鏈，讀者自己選要乘哪些「等於 1 的比例」（可翻轉、可拿掉、不限順序），單位對了才算完成（2026-11-07 使用者要求：不要固定步驟的引導式）
const UC_CARDS = [
  { id: 'ev', num: '1 eV', den: '1.602 × 10⁻¹⁹ J', v: 1 / 1.602e-19, u: { eV: 1, J: -1 } },
  { id: 'nm', num: '10⁹ nm', den: '1 m', v: 1e9, u: { nm: 1, m: -1 } },
  { id: 'na', num: '6.02 × 10²³', den: '1 mol', v: 6.022e23, u: { mol: -1 } },
  { id: 'kj', num: '1 kJ', den: '1000 J', v: 1e-3, u: { kJ: 1, J: -1 } },
  { id: 'a', num: '10¹⁰ Å', den: '1 m', v: 1e10, u: { 'Å': 1, m: -1 } },
  { id: 'cal', num: '1 cal', den: '4.184 J', v: 1 / 4.184, u: { cal: 1, J: -1 } },
];
const HC = { txt: 'h × c = (6.63 × 10⁻³⁴ J·s)(3.00 × 10⁸ m/s)', v: 6.626e-34 * 2.998e8, u: { J: 1, m: 1 }, gone: ['s'] };
const UC_T = {
  mol: { lab: '一莫耳光子：kJ·nm/mol', start: HC, goal: { kJ: 1, nm: 1, mol: -1 }, done: 'E（kJ/mol）≈ 119,600 ÷ λ（nm）' },
  ev: { lab: '一個光子：eV·nm', start: HC, goal: { eV: 1, nm: 1 }, done: 'λ（nm）≈ 1240 ÷ ΔE（eV）' },
  evkj: { lab: '1 eV 是幾 kJ/mol', start: { txt: '1 eV（一個粒子的能量）', v: 1, u: { eV: 1 }, gone: [] }, goal: { kJ: 1, mol: -1 }, done: '1 eV（一個粒子）≈ 96.5 kJ/mol' },
};
const ucUnits = u => { const sup = n => (n === 1 ? '' : String(n).split('').map(c => SUP[c]).join('')), up = Object.keys(u).filter(k => u[k] > 0), dn = Object.keys(u).filter(k => u[k] < 0);
  return (up.map(k => k + sup(u[k])).join('·') || (dn.length ? '1' : '（沒有單位）')) + (dn.length ? '/' + dn.map(k => k + sup(-u[k])).join('·') : ''); };
const ucNum = v => { const a = Math.abs(v); if (a >= 1 && a < 1e6) return Number(v.toPrecision(4)).toLocaleString('en-US');
  const e = Math.floor(Math.log10(a)), m = v / 10 ** e; return `${m.toFixed(2)} × 10${String(e).split('').map(c => SUP[c]).join('')}`; };
function unitChain(el, t0) {
  const st = { t: t0, used: [], flip: {}, hint: false };
  el.innerHTML = `${ctl('換成什麼單位', seg('ucT', Object.entries(UC_T).map(([k, x]) => [k, x.lab]), t0))}<p class="lbl">算式（點下面的卡片乘進來，再點一次拿掉；↻ 翻轉分子分母）</p><div class="uc-chain" id="ucC"></div><p id="ucR"></p>
<p class="lbl">換算比例（每一張都等於 1）</p><div class="uc-cards" id="ucK"></div><div class="w-row"><button class="btn sm" type="button" id="ucH">提示</button><button class="btn sm" type="button" id="ucX">重來</button></div><p class="note" id="ucN"></p>`;
  const frac = (c, f) => `<span class="uc-frac"><span>${f > 0 ? c.num : c.den}</span><span>${f > 0 ? c.den : c.num}</span></span>`;
  function draw() {
    const T = UC_T[st.t], u = { ...T.start.u }, seen = new Set([...Object.keys(T.start.u), ...T.start.gone]); let v = T.start.v;
    st.used.forEach(({ id, f }) => { const c = UC_CARDS.find(x => x.id === id); v *= c.v ** f; Object.entries(c.u).forEach(([k, e]) => { u[k] = (u[k] || 0) + f * e; seen.add(k); }); });
    Object.keys(u).forEach(k => { if (!u[k]) delete u[k]; });
    const all = new Set([...Object.keys(u), ...Object.keys(T.goal)]), ok = [...all].every(k => (u[k] || 0) === (T.goal[k] || 0)), gone = [...seen].filter(k => !u[k]);
    const bad = Object.keys(u).filter(k => u[k] !== (T.goal[k] || 0));
    $('#ucC', el).innerHTML = `<span class="mono">${T.start.txt}</span>${st.used.map(({ id, f }) => ` × ${frac(UC_CARDS.find(x => x.id === id), f)}`).join('')}`;
    $('#ucR', el).innerHTML = `${ok ? '<b class="r-ok">完成：</b>' : '目前：'}<b class="mono">${ucNum(v)}</b> <span class="mono">${ok ? ucUnits(T.goal) : Object.keys(u).length ? ucUnits(u).replace(/[A-Za-zÅ]+/g, k => (bad.includes(k) ? `<span class="uc-bad">${k}</span>` : k)) : '（沒有單位）'}</span>${gone.length ? `　<span class="small mut">已消掉：${gone.map(k => `<s>${k}</s>`).join('、')}</span>` : ''}`;
    $('#ucR', el).className = ok ? 'uc-res ok' : 'uc-res';
    $('#ucK', el).innerHTML = UC_CARDS.map(c => { const on = st.used.find(x => x.id === c.id), f = on ? on.f : st.flip[c.id] || 1;
      return `<span class="uc-card${on ? ' on' : ''}"${on ? ' data-cur="已選的比例"' : ''}><button type="button" class="uc-use" data-c="${c.id}" aria-pressed="${!!on}">${frac(c, f)}</button><button type="button" class="uc-flip" data-f="${c.id}" aria-label="翻轉">↻</button></span>`; }).join('');
    const miss = Object.keys(T.goal).filter(k => (u[k] || 0) !== T.goal[k] && !bad.includes(k));
    $('#ucN', el).innerHTML = ok ? `單位剛好是 ${ucUnits(T.goal)}：<b>${T.done}</b>。換一種順序或路線也會得到同一個數。`
      : st.hint ? (bad.length ? `還有 <b>${bad.join('、')}</b> 的次方不對（多出來或方向反了）：找一張含有它的比例，讓它在分子分母各出現一次就會消掉。` : `還缺 <b>${miss.join('、')}</b>：找一張把它帶進來的比例。`)
      : `目標單位：${ucUnits(T.goal)}。卡片可以翻轉；選錯方向時，單位會變成消不掉的樣子（例如 J²），拿掉或翻轉就好。`;
    $$('.uc-use', el).forEach(b => { b.onclick = () => { const id = b.dataset.c, i = st.used.findIndex(x => x.id === id); if (i >= 0) st.used.splice(i, 1); else st.used.push({ id, f: st.flip[id] || 1 }); st.hint = false; draw(); }; });
    $$('.uc-flip', el).forEach(b => { b.onclick = () => { const id = b.dataset.f, x = st.used.find(y => y.id === id); st.flip[id] = -(st.flip[id] || 1); if (x) x.f = st.flip[id]; st.hint = false; draw(); }; });
    pressSeg(el, 'ucT', st.t);
  }
  bindSeg(el, 'ucT', v => { st.t = v; st.used = []; st.hint = false; draw(); });
  $('#ucH', el).onclick = () => { st.hint = true; draw(); };
  $('#ucX', el).onclick = () => { st.used = []; st.flip = {}; st.hint = false; draw(); };
  draw();
  return { set(s2) { Object.assign(st, s2); draw(); } };
}
W.unitmol = el => unitChain(el, 'mol');
W.unitev = el => unitChain(el, 'ev');
// 第一章第 4 節：電子的波繞原子核一圈要接得起來（2πr = nλ）；接不起來的畫紅色，接得起來的標出節點（2026-11-07 使用者確認：箱中粒子移到共軛二烯一章）
W.ringwave = el => {
  const st = { k: 2.6 };
  el.innerHTML = `<div class="w-row"><label class="rng">一圈放幾個波長<input type="range" id="rwR" min="1" max="6" step="0.02"><output class="mono" id="rwO"></output></label></div><div id="rwG"></div><p class="note" id="rwN"></p>`;
  function draw() {
    const n = Math.round(st.k), ok = Math.abs(st.k - n) < 0.05 && n >= 1, k = ok ? n : st.k, cx = 260, cy = 155, R = 100, A = 26, P = (r, t) => [cx + r * Math.cos(t - Math.PI / 2), cy + r * Math.sin(t - Math.PI / 2)];
    const wave = path(Array.from({ length: 361 }, (_, i) => { const t = i / 360 * 2 * Math.PI; return P(R + A * Math.sin(k * t), t); }));
    const end = P(R + A * Math.sin(k * 2 * Math.PI), 2 * Math.PI), start = P(R, 0);
    const nodes = ok ? Array.from({ length: 2 * n }, (_, i) => P(R, i * Math.PI / n)) : [];
    $('#rwG', el).innerHTML = `<svg viewBox="0 0 520 300" class="ch" role="img" aria-label="繞原子核一圈的電子波">
<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" class="node"/><circle cx="${cx}" cy="${cy}" r="9" fill="#C0392B"/><text class="tk sm" x="${cx}" y="${cy + 24}" text-anchor="middle">原子核</text>
<path d="${wave}" fill="none" stroke-width="3.5" class="${ok ? 'w-ok' : 'w-bad'}" data-cur="電子的波"/>
${ok ? nodes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="var(--ink)"/>`).join('') : `<circle cx="${start[0]}" cy="${start[1]}" r="6" fill="var(--ink)"/><circle cx="${end[0]}" cy="${end[1]}" r="7" class="dot-bad"/><line x1="${start[0]}" y1="${start[1]}" x2="${end[0]}" y2="${end[1]}" stroke="var(--bad)" stroke-width="2" stroke-dasharray="3 3"/><text class="tk sm" x="${start[0] - 12}" y="${start[1] - 4}" text-anchor="end">起點</text><text class="tk sm bad" x="${end[0] + 12}" y="${end[1] + 12}">繞一圈回來</text>`}
<text class="tk ${ok ? 'hl' : 'bad'}" x="${cx}" y="${cy - R - 36}" text-anchor="middle">${ok ? `剛好 ${n} 個波長：接得起來（允許，n = ${n}）` : '繞一圈接不起來：不允許'}</text>
${ok ? `<text class="tk sm" x="${cx + R + 30}" y="${cy + 4}">黑點：振幅 0（節點）</text>` : ''}</svg>`;
    $('#rwR', el).value = st.k; $('#rwO', el).textContent = `${fx(k, ok ? 0 : 2)} 個`;
    $('#rwN', el).innerHTML = ok ? `一圈剛好 ${n} 個波長，波繞回起點時和自己接上，可以穩定存在：這就是第 ${n} 個軌道（n = ${n}）。黑點是振幅為 0 的節點，電子不會出現在那裡。圖上把軌道畫成一樣大，只看接不接得起來；實際上 n 越大軌道越大（第 3 小節的 r ∝ n²）。`
      : `一圈是 ${fx(k, 2)} 個波長，不是整數：繞回起點時，波的高度（紅點）和起點（黑點）對不上，繞幾圈之後會互相抵消，不能存在。拖到整數看看。`;
  }
  $('#rwR', el).oninput = e => { st.k = +e.target.value; draw(); };
  draw();
  return { set(s2) { Object.assign(st, s2); draw(); } };
};
// 第 4 節開頭：箱中粒子對應到真實的東西：共軛分子的碳鏈＝箱子，鏈長＝L（2026-11-07 使用者：「箱中粒子是指半徑嗎？」）
W.pboxc = el => {
  const st = { c: 6 }, NM = { 4: '丁二烯（4 個碳）', 6: '己三烯（6 個碳）', 8: '辛四烯（8 個碳）' };
  el.innerHTML = `${ctl('碳鏈', seg('pcS', [['4', '丁二烯'], ['6', '己三烯'], ['8', '辛四烯']], '6'))}<div id="pcG"></div><p class="note" id="pcN"></p>`;
  function draw() {
    const n = st.c, dx = 50, x0 = 260 - (n - 1) * dx / 2, x1 = x0 + (n - 1) * dx, yc = 70, C = Array.from({ length: n }, (_, i) => [x0 + i * dx, yc + (i % 2 ? -14 : 14)]);
    const bonds = C.slice(1).map((q, i) => { const p0 = C[i], dbl = i % 2 === 0, ox = (q[1] - p0[1]) / 50 * 4, oy = -(q[0] - p0[0]) / 50 * 4;
      return `<line x1="${p0[0]}" y1="${p0[1]}" x2="${q[0]}" y2="${q[1]}" stroke="var(--ink)" stroke-width="3"/>` + (dbl ? `<line x1="${p0[0] + ox * 1.6}" y1="${p0[1] + oy * 1.6}" x2="${q[0] + ox * 1.6}" y2="${q[1] + oy * 1.6}" stroke="var(--ink)" stroke-width="3"/>` : ''); }).join('');
    const bx0 = x0 - 14, bx1 = x1 + 14, by = 200;
    $('#pcG', el).innerHTML = `<svg viewBox="0 0 520 270" class="ch" role="img" aria-label="共軛碳鏈與箱子">
<rect x="${x0 - 18}" y="${yc - 34}" width="${x1 - x0 + 36}" height="68" rx="34" fill="#3A7BD5" opacity=".14" data-cur="π 電子能跑的範圍"/>
${bonds}${C.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="var(--ink)"/>`).join('')}
<text class="tk sm" x="${x0 - 22}" y="${yc - 38}">π 電子可以沿整條鏈跑（藍色範圍）</text>
<line x1="${bx0}" x2="${bx0}" y1="${yc + 36}" y2="${by - 30}" class="node"/><line x1="${bx1}" x2="${bx1}" y1="${yc + 36}" y2="${by - 30}" class="node"/>
<rect x="${bx0 - 10}" y="${by - 30}" width="10" height="56" class="wall"/><rect x="${bx1}" y="${by - 30}" width="10" height="56" class="wall"/>
<line x1="${bx0}" x2="${bx1}" y1="${by + 24}" y2="${by + 24}" class="ax"/><circle cx="${(bx0 + bx1) / 2}" cy="${by}" r="7" fill="#3A7BD5"/><text class="tk sm" x="${(bx0 + bx1) / 2}" y="${by - 14}" text-anchor="middle">e⁻ ⇆</text>
<text class="tk hl" x="${(bx0 + bx1) / 2}" y="${by + 44}" text-anchor="middle">L ＝ 鏈長</text><text class="tk sm" x="${bx0 - 5}" y="${by + 44}" text-anchor="end">牆</text><text class="tk sm" x="${bx1 + 5}" y="${by + 44}">牆</text></svg>`;
    $('#pcN', el).innerHTML = `${NM[n]}：π 電子在整條碳鏈上都可以跑，但跑不出鏈的兩端。把它簡化成箱子：<b>鏈的兩端就是牆，鏈長就是 L</b>。碳越多，箱子越長。`;
    pressSeg(el, 'pcS', String(n));
  }
  bindSeg(el, 'pcS', v => { st.c = +v; draw(); });
  draw();
  return { set(s2) { Object.assign(st, s2); draw(); } };
};
// 第 4 節：一個箱子裡 n = 1～4 的駐波與能階（能量以 E₁ = h²/(8mL²) 為單位，不代數字）；點躍遷看能階差
W.pbox = el => {
  const st = { t: '1-2' };
  el.innerHTML = `${ctl('躍遷', seg('pbS', [['1-2', 'n = 1 → 2'], ['2-3', 'n = 2 → 3'], ['1-3', 'n = 1 → 3'], ['3-4', 'n = 3 → 4']], st.t))}<div id="pbG"></div><p class="eq" id="pbF"></p><p class="note" id="pbN"></p>`;
  function draw() {
    const [a, b] = st.t.split('-').map(Number), x0 = 120, x1 = 360, Y = e => 278 - e / 16 * 246, A = 10;
    const wave = n => path(Array.from({ length: 81 }, (_, i) => [x0 + (x1 - x0) * i / 80, Y(n * n) - A * Math.sin(n * Math.PI * i / 80)]));
    const ax = 440;
    $('#pbG', el).innerHTML = `<svg viewBox="0 0 520 300" class="ch" role="img" aria-label="箱子裡的駐波與能階">
<rect x="${x0 - 12}" y="${Y(17)}" width="12" height="${Y(0) - Y(17)}" class="wall"/><rect x="${x1}" y="${Y(17)}" width="12" height="${Y(0) - Y(17)}" class="wall"/>
<line class="ax" x1="${x0}" x2="${x1}" y1="${Y(0)}" y2="${Y(0)}"/><text class="tk sm" x="${x0 - 18}" y="${Y(0) + 4}" text-anchor="end">0</text>
${[1, 2, 3, 4].map(n => `<line class="lvl${n === a || n === b ? ' on' : ''}" x1="${x0}" x2="${x1}" y1="${Y(n * n)}" y2="${Y(n * n)}" opacity=".35"/><path d="${wave(n)}" fill="none" stroke-width="3" class="w-ok"${n === b ? ' data-cur="上面的能階"' : ''} opacity="${n === a || n === b ? 1 : 0.45}"/>
<text class="tk${n === a || n === b ? ' hl' : ''}" x="${x0 - 18}" y="${Y(n * n) + 4}" text-anchor="end">n=${n}</text><text class="tk${n === a || n === b ? ' hl' : ''}" x="${x1 + 20}" y="${Y(n * n) + 4}">${n * n} E₁</text>`).join('')}
<line x1="${ax}" x2="${ax}" y1="${Y(a * a)}" y2="${Y(b * b) + 6}" stroke="#D0443C" stroke-width="3" marker-end="url(#pbA)" data-cur="躍遷箭頭"/><text class="tk hl" x="${ax + 8}" y="${(Y(a * a) + Y(b * b)) / 2 + 4}">ΔE</text>
<defs><marker id="pbA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#D0443C"/></marker></defs></svg>`;
    $('#pbF', el).innerHTML = `ΔE = E${'₀₁₂₃₄'[b]} − E${'₀₁₂₃₄'[a]} = (${b}² − ${a}²) × h²/(8mL²) = <b>${b * b - a * a} h²/(8mL²)</b>`;
    $('#pbN', el).innerHTML = `每一條綠色的波就是一個允許的駐波：第 n 個能階放進 n 個半波長。往上走，半波越多、波長越短（2L/n）、電子跑得越快，能量是 E₁ 的 n² 倍。${a === 1 ? `n = 1 是<b>基態</b>，n = 2 是<b>第一激發態</b>。` : ''}從 n = ${a} 到 n = ${b}，差 ${b * b} − ${a * a} = ${b * b - a * a} 個 E₁。`;
    pressSeg(el, 'pbS', st.t);
  }
  bindSeg(el, 'pbS', v => { st.t = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};
// 第 4 節：箱子變長，能階變低：左邊固定長度 L，右邊是 k 倍；能量以左邊的 E₁ 為單位
W.pboxl = el => {
  const st = { k: 2 }, ratio = k => (k === 1 ? '1' : k > 1 ? `1/${fx(k * k, 2).replace(/\.?0+$/, '')}` : fx(1 / (k * k), 2));
  el.innerHTML = `<div class="w-row"><label class="rng">右邊箱子的長度<input type="range" id="plR" min="0.6" max="3" step="0.1"><output class="mono" id="plO"></output></label></div><div id="plG"></div><div class="cards" id="plK"></div><p class="note" id="plN"></p>`;
  function draw() {
    const k = st.k, Y = e => 268 - e / 10 * 236, W0 = 90, l0 = 64, r0 = l0 + W0 + 50, r1 = r0 + W0 * Math.min(k, 3);
    const box = (x0, x1, f, lab) => `<line class="ax" x1="${x0}" x2="${x0}" y1="${Y(10)}" y2="${Y(0)}"/><line class="ax" x1="${x1}" x2="${x1}" y1="${Y(10)}" y2="${Y(0)}"/><line class="ax" x1="${x0}" x2="${x1}" y1="${Y(0)}" y2="${Y(0)}"/><text class="tk sm" x="${(x0 + x1) / 2}" y="${Y(0) + 18}" text-anchor="middle">${lab}</text>`
      + (() => { let ly = 1e9; return [1, 2, 3].map(n => { const e = n * n * f; if (e > 10) return ''; ly = Math.min(Y(e) - 5, ly - 14);   // 標籤太近就往上推
        return `<line class="lvl${n === 1 ? ' on' : ''}" x1="${x0}" x2="${x1}" y1="${Y(e)}" y2="${Y(e)}"/><text class="tk sm" x="${x0 + 4}" y="${ly}">n=${n}・${fx(e, e < 1 ? 2 : 1)}</text>`; }).join(''); })();
    $('#plG', el).innerHTML = `<svg viewBox="0 0 520 296" class="ch" role="img" aria-label="兩個箱子的能階">
<text class="tk sm" x="${l0 - 10}" y="${Y(10) + 4}" text-anchor="end">10</text><text class="tk sm" x="${l0 - 10}" y="${Y(0) + 4}" text-anchor="end">0</text><text class="tk sm" x="4" y="14">能量（左邊的 E₁）</text>
${box(l0, l0 + W0, 1, '長度 L')}${box(r0, r1, 1 / (k * k), `長度 ${fx(k, 1)} L`)}</svg>`;
    $('#plR', el).value = k; $('#plO', el).textContent = `${fx(k, 1)} L`;
    $('#plK', el).innerHTML = card('l', '長度', `${fx(k, 1)} 倍`) + card('e', '每個能階', `${ratio(k)} 倍`, `1 ÷ ${fx(k, 1)}²`);
    $('#plN', el).innerHTML = `公式分母是 L²：長度變 ${fx(k, 1)} 倍，每個能階都變成 ${ratio(k)} 倍（紅線是 n = 1）。${k >= 1 ? '箱子越長，能放下越長的波，電子跑得越慢，能量越低；能階之間也靠得越近' : '箱子變短，波長被迫變短，電子跑得更快，能量變高；能階之間也拉得更開'}，n = 1 → 2 的差從 3 變成 ${fx(3 / (k * k), 2)}（單位：左邊的 E₁）。`;
  }
  $('#plR', el).oninput = e => { st.k = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 8. 離子半徑：等電子系列 =====
   半徑 pm：離子為 Shannon 有效離子半徑（配位數 6）；原子為教科書常用的原子半徑 */
const IONR = {
  ne: ['10 個電子（Ne 型）', [['O²⁻', 8, 140], ['F⁻', 9, 133], ['Na⁺', 11, 102], ['Mg²⁺', 12, 72], ['Al³⁺', 13, 54]]],
  ar: ['18 個電子（Ar 型）', [['S²⁻', 16, 184], ['Cl⁻', 17, 181], ['K⁺', 19, 138], ['Ca²⁺', 20, 100]]],
  ai: ['原子 → 離子', [['Na', 11, 186], ['Na⁺', 11, 102], ['Mg', 12, 160], ['Mg²⁺', 12, 72], ['Cl', 17, 99], ['Cl⁻', 17, 181], ['O', 8, 73], ['O²⁻', 8, 140]]],
};
W.ionrad = el => {
  let cur = 'ne';
  el.innerHTML = `${seg('irS', Object.entries(IONR).map(([k, v]) => [k, v[0]]), cur)}<div id="irB"></div><p class="note" id="irN"></p>`;
  function draw() {
    const [, d] = IONR[cur], sc = 0.36, slot = r => Math.max(2 * r * sc + 24, 112), W = d.reduce((s2, x) => s2 + slot(x[2]), 0) + 12, H = 2 * Math.max(...d.map(x => x[2])) * sc + 70;
    let x = 12;   // 圓的半徑照真實比例（pm），由左到右排
    $('#irB', el).innerHTML = `<svg viewBox="0 0 ${Math.max(W, 300)} ${H}" class="ch" role="img" aria-label="原子與離子的大小（照比例）">${d.map(([t, Z, r]) => { const R = r * sc, cx = x + slot(r) / 2; x += slot(r);
      // 電子層：照組態分 n 層，畫成同心圓，每層的電子平均排開
      const qq = (m => (m ? (({ '¹': 1, '²': 2, '³': 3 })[m[1]] || 1) * (m[2] === '⁺' ? 1 : -1) : 0))(t.match(/([¹²³]?)([⁺⁻])$/)), shells = {};
      econf(Z, qq).forEach(([o, n2]) => { shells[o[0]] = (shells[o[0]] || 0) + n2; });
      const ns = Object.keys(shells).sort(), cyy = H - 50 - R;
      const rings = ns.map((n, j) => { const rr = R * (j + 1) / ns.length * 0.92; return `<circle cx="${cx}" cy="${cyy}" r="${rr.toFixed(1)}" class="nuO"/>` + Array.from({ length: shells[n] }, (_, i) => { const a = -Math.PI / 2 + i / shells[n] * 6.283; return `<circle cx="${(cx + rr * Math.cos(a)).toFixed(1)}" cy="${(cyy + rr * Math.sin(a)).toFixed(1)}" r="2.2" class="nuE"/>`; }).join(''); }).join('');
      return `<circle cx="${cx}" cy="${cyy}" r="${R}" class="ionc"/>${rings}<circle cx="${cx}" cy="${cyy}" r="4" class="nuP"/><text class="tk" x="${cx}" y="${H - 30}" text-anchor="middle">${t}</text><text class="tk sm" x="${cx}" y="${H - 14}" text-anchor="middle">${Z} 個質子・${r} pm</text>`; }).join('')}</svg>`;
    $('#irN', el).innerHTML = cur === 'ai' ? '陽離子失去電子（常常整層失去），<b>比原子小</b>；陰離子多了電子、電子間排斥增加，<b>比原子大</b>。'
      : `這些粒子的<b>電子數相同</b>（等電子），差別只有質子數。質子越多，對同樣的電子拉得越緊，半徑越小：${d.map(x => x[0]).join(' > ')}。`;
    pressSeg(el, 'irS', cur);
  }
  bindSeg(el, 'irS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 9. 連續游離能：跳躍在哪裡 =====
   kJ/mol（CRC Handbook） */
const SIE = { Na: [11, [496, 4562, 6910, 9543]], Mg: [12, [738, 1451, 7733, 10543]], Al: [13, [578, 1817, 2745, 11577]], Si: [14, [787, 1577, 3232, 4356, 16091]], P: [15, [1012, 1907, 2914, 4964, 6274, 21267]], Ca: [20, [590, 1145, 4912, 6491, 8153]] };
W.succie = el => {
  let cur = 'Mg';
  let sel = 0;
  el.innerHTML = `${seg('siS', Object.keys(SIE).map(k => [k, k]), cur)}<div class="cards" id="siK"></div><div id="siG"></div><div id="siO"></div><p class="note" id="siN"></p>`;
  function draw() {
    const [Z, v] = SIE[cur], r = v.slice(1).map((x, i) => x / v[i]), k = r.indexOf(Math.max(...r)) + 1; if (!sel || sel > v.length) sel = k + 1;
    $('#siG', el).innerHTML = chart({ w: 560, h: 240, x: [0.4, 6.6], y: [2.5, 4.5], xt: [1, 2, 3, 4, 5, 6], yt: [3, 3.5, 4, 4.5], xlab: '第幾個游離能 Iₙ', ylab: 'log₁₀ I（kJ/mol）', label: '連續游離能' }, (X, Y) =>
      v.map((x, i) => `<rect x="${X(i + 1) - 18}" y="${Y(Math.log10(x))}" width="36" height="${Y(2.5) - Y(Math.log10(x))}" class="${i < k ? 'bv' : 'bc'}${i + 1 === sel ? ' sel' : ''}" data-b="${i + 1}" style="cursor:pointer"/><text class="tk" x="${X(i + 1)}" y="${Y(Math.log10(x)) - 5}" text-anchor="middle">${x}</text>`).join('')
      + `<line class="mk" x1="${X(k + 0.5)}" x2="${X(k + 0.5)}" y1="${Y(4.5)}" y2="${Y(2.5)}" data-cur="跳躍"/><text class="tk hl" x="${X(k + 0.5)}" y="${Y(2.5) - 8}" text-anchor="middle">大跳</text>`);
    // 拿走第 sel 個電子之前的組態，標出下一個要拿走的電子；週期 3 的元素連 2s、2p 一起畫，看得到「拿到內層」
    const cfq = econf(Z, sel - 1), last = cfq[cfq.length - 1][0], per = Z <= 18 ? 3 : 4, subs = per === 3 ? ['2s', '2p', '3s', '3p'] : ['3s', '3p', '4s'];
    $('#siO', el).innerHTML = `<p class="lbl">點長條：拿走第 ${sel} 個電子（I${subN(sel)}）時，被拿走的是 ${last} 的電子${sel > k ? '，已經是內層' : '，還在最外層'}</p>` + orbitalChart('si', cfq, subs, { mark: last }).svg;
    $$('#siG [data-b]', el).forEach(b => { b.onclick = () => { sel = +b.dataset.b; draw(); }; });
    $('#siK', el).innerHTML = card('j', '最大的跳躍', `I${subN(k)} → I${subN(k + 1)}`, `×${fx(r[k - 1], 1)}`) + card('v', '價電子數', k) + card('g', '族', k <= 2 ? `第 ${k} 族` : `第 ${k + 10} 族`);
    $('#siN', el).innerHTML = `前 ${k} 個電子在最外層，拿掉之後剩下的是穩定的鈍氣組態；第 ${k + 1} 個要從<b>內層</b>拿，所以游離能突然跳很大（縱軸是對數，跳躍仍然很明顯）。看到「第 k 個之後大跳」，就知道有 k 個價電子。`;
    pressSeg(el, 'siS', cur);
  }
  bindSeg(el, 'siS', v => { cur = v; sel = 0; draw(); });
  draw();
  return { set(s) { cur = s.e || cur; draw(); } };
};

/* ===== 10. 同位素與平均原子量 =====
   同位素質量（u）與天然豐度（%），IUPAC 數值 */
const ISO = { Cl: [[35, 34.969, 75.78], [37, 36.966, 24.22]], Br: [[79, 78.918, 50.69], [81, 80.916, 49.31]], Cu: [[63, 62.930, 69.15], [65, 64.928, 30.85]], B: [[10, 10.013, 19.9], [11, 11.009, 80.1]], Ga: [[69, 68.926, 60.11], [71, 70.925, 39.89]] };
W.isoavg = el => {
  let cur = 'Cl', ab = null;   // ab：使用者拖動的第一個同位素豐度（%）；null 表示用天然值
  el.innerHTML = `${seg('iaS', Object.keys(ISO).map(k => [k, k]), cur)}<div class="w-row"><label class="rng">較輕同位素的豐度<input type="range" id="iaR" min="0" max="100" step="0.5"><output class="mono" id="iaO"></output></label><button class="btn sm ghost" type="button" id="iaB">回到天然豐度</button></div><div id="iaG"></div><p class="eq" id="iaF"></p><p class="note" id="iaN"></p>`;
  function draw() {
    const nat = ISO[cur], a1 = ab == null ? nat[0][2] : ab, d = [[nat[0][0], nat[0][1], a1], [nat[1][0], nat[1][1], +(100 - a1).toFixed(2)]], avg = d.reduce((a, [, m, p]) => a + m * p / 100, 0), lo = Math.floor(d[0][1]) - 1, hi = Math.ceil(d[d.length - 1][1]) + 1;
    $('#iaG', el).innerHTML = chart({ w: 520, h: 230, x: [lo, hi], y: [0, 112], xt: Array.from({ length: hi - lo + 1 }, (_, i) => lo + i), yt: [0, 25, 50, 75, 100], xlab: '質量（u）', ylab: '天然豐度（%）', label: '同位素豐度' }, (X, Y) =>
      d.map(([A, m, p]) => `<rect x="${X(m) - 16}" y="${Y(p)}" width="32" height="${Y(0) - Y(p)}" class="bv"/><text class="tk" x="${X(m)}" y="${Y(p) - 6}" text-anchor="middle">${supN(A)}${cur} ${p}%</text>`).join('')
      + `<line class="mk" x1="${X(avg)}" x2="${X(avg)}" y1="${Y(0)}" y2="${Y(100)}"/><circle class="dot" cx="${X(avg)}" cy="${Y(0)}" r="7"/><text class="tk hl" x="${X(avg)}" y="${Y(100) + 12}" text-anchor="middle">平均 ${fx(avg, 2)}</text>`);
    $('#iaF', el).innerHTML = `平均原子量 = ${d.map(([, m, p]) => `${m} × ${fx(p / 100, 4)}`).join(' + ')} = <b>${fx(avg, 2)}</b>`;
    $('#iaN', el).innerHTML = `長條的高度是豐度、位置是質量；平均原子量是以豐度加權的「重心」（紅色虛線），會偏向豐度較高的同位素。質譜儀量 ${cur} 會出現 ${d.length} 個訊號，高度比約 ${d.map(x => Math.round(x[2])).join(' : ')}。`;
    $('#iaR', el).value = a1; $('#iaO', el).textContent = `${fx(a1, 1)}%`;
    if (ab != null) $('#iaN', el).innerHTML += ` 拖動豐度時，平均值跟著往豐度較高的那一邊移動；天然的 ${cur} 原子量是 ${fx(nat.reduce((a, [, m, p]) => a + m * p / 100, 0), 2)}。`;
    pressSeg(el, 'iaS', cur);
  }
  $('#iaR', el).oninput = e => { ab = +e.target.value; draw(); };
  $('#iaB', el).onclick = () => { ab = null; draw(); };
  bindSeg(el, 'iaS', v => { cur = v; ab = null; draw(); });
  draw();
  return { set(s2) { cur = s2.e || cur; draw(); } };
};
