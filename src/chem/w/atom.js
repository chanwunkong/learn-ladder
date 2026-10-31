/* ---------- 後中化學：原子結構與週期性的互動圖 ---------- */

/* ===== 1. 氫原子能階與光譜 ===== */
W.hspec = el => {
  let ni = 3, nf = 2, Z = 1;
  el.innerHTML = `<div class="w-row"><label class="sel">粒子 <select id="hsZ"><option value="1">H</option><option value="2">He⁺</option><option value="3">Li²⁺</option></select></label><label class="sel">從 n = <select id="hsI">${[2, 3, 4, 5, 6, 7].map(n => `<option>${n}</option>`).join('')}</select></label><label class="sel">掉到 n = <select id="hsF">${[1, 2, 3].map(n => `<option>${n}</option>`).join('')}</select></label><span class="sp"></span>${[[3, 2, '紅線'], [4, 2, '藍綠線'], [2, 1, '萊曼系'], [4, 3, '帕申系']].map(([a, b, t]) => `<button class="btn sm ghost" type="button" data-t="${a},${b}">${t}</button>`).join('')}</div><div class="hsgrid"><div id="hsL"></div><div id="hsS"></div></div><div class="cards" id="hsK"></div><p class="note" id="hsN"></p>`;
  const E = n => -13.6 * Z * Z / (n * n), hc = 1239.84;   // eV·nm；類氫粒子 Eₙ = −13.6 Z²/n²
  const col = l => nmRGB(l) || (l < 380 ? '#7a5cff' : '#a33');   // 和「一道光」同一套波長 → 顏色換算
  function draw() {
    if (nf >= ni) nf = Math.max(1, ni - 1);
    const dE = E(ni) - E(nf), lam = hc / dE, Y = v => 20 + (-v) / (13.6 * Z * Z) * 200;
    $('#hsL', el).innerHTML = `<svg viewBox="0 0 400 240" class="ch" role="img" aria-label="氫原子能階">${[1, 2, 3, 4, 5, 6, 7].map(n => `<line class="lvl${n === ni || n === nf ? ' on' : ''}" x1="40" x2="200" y1="${Y(E(n))}" y2="${Y(E(n))}"/>${n <= 3 ? `<text class="tk" x="206" y="${Y(E(n)) + 4}">n=${n}（${fx(E(n), 2)} eV）</text>` : ''}`).join('')}<text class="tk" x="206" y="${Y(E(5)) - 6}">n=4、5、6…（越來越密，趨近 0）</text><line x1="120" x2="120" y1="${Y(E(ni))}" y2="${Y(E(nf)) - 6}" stroke="${col(lam)}" stroke-width="3" marker-end="url(#hm2)"/><defs><marker id="hm2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${col(lam)}"/></marker></defs></svg>`;
    const lines = [3, 4, 5, 6].map(n => hc / (E(n) - E(2))).filter(l => l >= 380 && l <= 750);
    $('#hsS', el).innerHTML = chart({ x: [380, 750], y: [0, 1], xt: [400, 500, 600, 700], yt: [], xlab: '可見光波長（nm）：巴耳末系（掉到 n = 2）', h: 120 }, (X, Y) => `<defs><linearGradient id="vis" x1="0" x2="1"><stop offset="0" stop-color="#6a4cff"/><stop offset=".3" stop-color="#2f8fff"/><stop offset=".5" stop-color="#2fbf5f"/><stop offset=".65" stop-color="#e8d23a"/><stop offset=".8" stop-color="#f29a2e"/><stop offset="1" stop-color="#e2403a"/></linearGradient></defs><rect x="${X(380)}" y="${Y(1)}" width="${X(750) - X(380)}" height="${Y(0) - Y(1)}" fill="url(#vis)" opacity=".18"/>${lines.map(l => `<line x1="${X(l)}" x2="${X(l)}" y1="${Y(0)}" y2="${Y(1)}" stroke="${col(l)}" stroke-width="${Math.abs(l - lam) < 1 ? 5 : 2.5}"/>`).join('')}`);
    $('#hsK', el).innerHTML = card('e', 'ΔE', `${fx(dE, 2)} eV`, `${fx(dE * 96.485, 0)} kJ/mol`) + card('l', '光的波長 λ = hc ÷ ΔE', `${fx(lam, 0)} nm`) + card('r', '區域', lam < 380 ? '紫外光' : lam <= 750 ? '可見光' : '紅外光') + card('ie', `游離能（從 n = 1）`, `${fx(13.6 * Z * Z, 1)} eV`, `13.6 × ${Z}²`) + card('rad', `n = ${ni} 的軌道半徑`, `${fx(0.529 * ni * ni / Z, 2)} Å`, `0.529 × ${ni}² ÷ ${Z}`);
    $('#hsN', el).innerHTML = `電子從 n = ${ni} 掉到 n = ${nf}，放出能量 ΔE = 13.6 × ${Z}² × (1/${nf}² − 1/${ni}²) eV = ${fx(dE, 2)} eV 的光子，波長 ${fx(lam, 0)} nm。能階是<b>分立</b>的，所以光譜是一條一條的線，而不是連續的彩虹。掉到 n = 1 的（萊曼系）能量大，在紫外光；掉到 n = 2 的（巴耳末系）落在可見光。${Z > 1 ? ` ${Z === 2 ? 'He⁺' : 'Li²⁺'} 只有一個電子，和氫原子同一套公式，只是原子核電荷 Z = ${Z}：能量乘 Z²、半徑除以 Z。` : ''}`;
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
  el.innerHTML = `<div class="w-row" id="qnC"></div><div class="bgrid"><div id="qnS"></div><div class="cards" id="qnK"></div></div><p class="note" id="qnN"></p>`;
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
    $('#qnC', el).innerHTML = `<span class="small">n</span>${[1, 2, 3, 4].map(v => `<button class="btn sm${v === n ? ' pri' : ''}" type="button" data-n="${v}">${v}</button>`).join('')}<span class="small">ℓ</span>${[0, 1, 2, 3].map(v => `<button class="btn sm${v === l ? ' pri' : ''}" type="button" data-l="${v}"${v >= n ? ' disabled' : ''}>${v}（${LN[v]}）</button>`).join('')}<span class="small">mℓ</span>${Array.from({ length: 2 * l + 1 }, (_, i) => i - l).map(v => `<button class="btn sm${v === m ? ' pri' : ''}" type="button" data-m="${v}">${v}</button>`).join('')}`;
    $$('[data-n]', el).forEach(b => { b.onclick = () => { st.n = +b.dataset.n; st.l = Math.min(st.l, st.n - 1); st.m = clamp(st.m, -st.l, st.l); draw(); }; });
    $$('[data-l]', el).forEach(b => { b.onclick = () => { st.l = +b.dataset.l; st.m = clamp(st.m, -st.l, st.l); draw(); }; });
    $$('[data-m]', el).forEach(b => { b.onclick = () => { st.m = +b.dataset.m; draw(); }; });
    $('#qnS', el).innerHTML = l === 3 ? '<p class="note">f 軌域形狀複雜，考試只需要知道有 7 個。</p>' : `<svg viewBox="0 0 220 200" class="bk" role="img" aria-label="${n}${LN[l]} 軌域">${shape()}${nodesSvg()}<line x1="10" x2="210" y1="100" y2="100" class="axl"/><line x1="110" x2="110" y1="5" y2="195" class="axl"/><text class="tk" x="205" y="94">x</text><text class="tk" x="114" y="14">z</text></svg><p class="small mut c">${n}${LN[l]} 軌域（示意，深淺兩色為波函數正負號；虛線圓是徑向節點的球面，虛線直線是角節面）</p>`;
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
  const st = { Z: 26, q: 0 };
  const PRE = [[6, 0, 'C'], [7, 0, 'N'], [24, 0, 'Cr'], [29, 0, 'Cu'], [26, 0, 'Fe'], [26, 2, 'Fe²⁺'], [26, 3, 'Fe³⁺'], [42, 0, 'Mo'], [46, 0, 'Pd'], [47, 0, 'Ag'], [74, 0, 'W'], [79, 0, 'Au'], [16, -2, 'S²⁻'], [11, 1, 'Na⁺'], [50, 0, 'Sn']];
  el.innerHTML = `<div class="w-row">${PRE.map(([z, q, t]) => `<button class="btn sm ghost" type="button" data-p="${z},${q}">${t}</button>`).join('')}</div><div class="w-row"><label class="rng">原子序 Z <input type="range" id="ecZ" min="1" max="86" step="1"><output class="mono" id="ecO"></output></label></div>${seg('ecQ', [['-2', '−2'], ['-1', '−1'], ['0', '中性'], ['1', '+1'], ['2', '+2'], ['3', '+3']], '0')}<p class="eq" id="ecS"></p><div class="boxes" id="ecB"></div><div class="cards" id="ecK"></div><p class="note" id="ecN"></p>`;
  function draw() {
    const { Z, q } = st, cf = econf(Z, q), ne = Z - q, sup = n => String(n).split('').map(c => SUP[c]).join('');
    const core = CORES.find(([n]) => n < ne && econf(n).every(([o, k]) => (cf.find(x => x[0] === o) || [0, 0])[1] === k)), coreOrb = core ? econf(core[0]).map(x => x[0]) : [];
    const val = cf.filter(([o]) => !coreOrb.includes(o));
    const nm = `${ELEM[Z - 1]}${q ? (Math.abs(q) > 1 ? sup(Math.abs(q)) : '') + (q > 0 ? '⁺' : '⁻') : ''}`;
    $('#ecO', el).textContent = `${Z}　${ELEM[Z - 1]}（${ENAME[Z - 1]}）`; $('#ecZ', el).value = Z;
    $('#ecS', el).innerHTML = `${nm}：${core ? `[${core[1]}] ` : ''}${val.map(([o, k]) => `${o}${sup(k)}`).join(' ') || '（沒有價電子）'}　<span class="mut small">共 ${ne} 個電子</span>`;
    $('#ecB', el).innerHTML = val.map(([o, k]) => { const nb = 2 * LN[o[1]] + 1, up = Math.min(k, nb), dn = k - up;
      return `<div class="sub"><span class="mono small">${o}</span><div>${Array.from({ length: nb }, (_, i) => `<span class="box">${i < up ? '↑' : ''}${i < dn ? '↓' : ''}</span>`).join('')}</div></div>`; }).join('');
    const unp = cf.reduce((s2, [o, k]) => { const nb = 2 * LN[o[1]] + 1; return s2 + (k <= nb ? k : 2 * nb - k); }, 0);
    let last = ''; { let left = Z; for (const [o, c] of AUF) { if (left <= 0) break; last = o; left -= c; } }
    const iso = CORES.find(([n]) => n === ne);
    $('#ecK', el).innerHTML = card('n', '電子數', ne, `${Z} − (${q})`) + card('u', '未成對電子', unp, unp ? '順磁性' : '反磁性') + card('b', '週期表的區', `${last[1]} 區`, `最後填入 ${last}`) + (iso ? card('i', '等電子', iso[1], '與鈍氣電子數相同') : '');
    const exc = q === 0 && EXC[Z];
    $('#ecN', el).innerHTML = `依構築原理的填入順序 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 填電子，寫的時候依 n 由小到大排列。${exc ? `<b>${ENAME[Z - 1]}是例外</b>：半滿或全滿的 d（或 f）副層較穩定，實際組態和填入順序不同。` : ''}${q > 0 && Z > 20 ? ` 過渡金屬形成陽離子時，先失去 n 最大的 <b>s</b> 電子，再失去 (n−1)d 電子。` : ''}${q < 0 ? ` 陰離子把多的電子依同樣順序繼續填入。` : ''}`;
    pressSeg(el, 'ecQ', String(q));
    $$('[data-p]', el).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.p === `${Z},${q}`)));
  }
  $('#ecZ', el).oninput = e => { st.Z = +e.target.value; st.q = 0; draw(); };
  bindSeg(el, 'ecQ', v => { st.q = clamp(+v, -2, Math.min(3, st.Z - 1)); draw(); });
  $$('[data-p]', el).forEach(b => { b.onclick = () => { [st.Z, st.q] = b.dataset.p.split(',').map(Number); draw(); }; });
  draw();
  return { set(s2) { st.Z = s2.Z ?? st.Z; st.q = s2.q ?? 0; draw(); } };
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
  let cur = 7;
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
    $('#nuG', el).innerHTML = `<svg class="ch" style="max-width:260px;margin:auto" viewBox="-10 -6 250 232" role="img" aria-label="原子組成示意：原子核與電子殼層">${rings}${dots}</svg>`;
    $('#nuC', el).textContent = `電子殼層由內到外：${sh.join('、')}（共 ${e} 個）。${tot > 60 ? `原子核有 ${tot} 個粒子，圖上只畫 60 個，紅灰比例不變。` : ''}示意圖不按比例：實際的原子核只有原子大小的約十萬分之一；電子也不是在固定的圓形軌道上，真正的分布見第 5 節的軌域。`;
    $('#nuK', el).innerHTML = card('sym', '符號', `${supN(A)}${subN(Z)}${sy}${q ? (Math.abs(q) > 1 ? supN(Math.abs(q)) : '') + (q > 0 ? '⁺' : '⁻') : ''}`) + card('p', '質子（紅）= 原子序 Z', Z) + card('n', '中子（灰）= A − Z', `${N}`, `${A} − ${Z}`) + card('e', '電子（藍）= Z − 電荷', e, `${Z} − (${q})`);
    $('#nuN', el).innerHTML = `質量數 A = 質子 + 中子；原子序 Z = 質子數，決定是哪一種元素。${q ? `帶 ${q > 0 ? '+' : '−'}${Math.abs(q)} 電荷表示${q > 0 ? '失去' : '得到'} ${Math.abs(q)} 個電子，質子與中子不變。` : '中性原子的電子數等於質子數。'} Z 相同、A 不同的原子互為<b>同位素</b>（例如 ³⁵Cl 與 ³⁷Cl），化學性質幾乎相同。`;
    $$('[data-i]', el).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === cur)));
  }
  $$('[data-i]', el).forEach(b => { b.onclick = () => { cur = +b.dataset.i; draw(); }; });
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
<div id="wvG"></div><div id="wvS"></div><div class="cards" id="wvK"></div><p class="note" id="wvN"></p>`;
  function draw() {
    const col = nmRGB(nm), W0 = 600, H = 150, win = 3000;   // 畫面寬度代表 3000 nm
    let d = '';
    for (let x = 0; x <= W0; x += 2) { const y = H / 2 - 52 * Math.sin(2 * Math.PI * (x / W0 * win) / nm); d += `${x ? 'L' : 'M'}${x},${y.toFixed(1)}`; }
    const crests = Math.floor(win / nm), x1 = 60 + W0 * (nm / 4) / win, x2 = x1 + W0 * nm / win;
    $('#wvG', el).innerHTML = `<svg class="ch" viewBox="0 -16 ${W0} ${H + 46}" role="img" aria-label="波長 ${nm} nm 的波">
<line class="ax" x1="0" x2="${W0}" y1="${H / 2}" y2="${H / 2}" stroke-dasharray="3 4"/>
<path d="${d}" fill="none" stroke="${col || 'var(--muted)'}" stroke-width="3" ${col ? '' : 'stroke-dasharray="6 4"'}/>
${x2 < W0 ? `<line class="mk" x1="${x1}" x2="${x2}" y1="${H / 2 - 62}" y2="${H / 2 - 62}"/><text class="tk" x="${(x1 + x2) / 2}" y="${H / 2 - 68}" text-anchor="middle">λ = ${nm} nm</text>` : ''}
<text class="tk" x="${W0 / 2}" y="${H + 22}" text-anchor="middle">同一段距離（3000 nm）裡有 ${crests} 個多波峰：波長越短，越密</text></svg>`;
    // 可見光色帶與目前位置
    const stops = Array.from({ length: 38 }, (_, i) => { const w = 380 + i * 10; return `<stop offset="${(i / 37 * 100).toFixed(1)}%" stop-color="${nmRGB(w)}"/>`; }).join('');
    const sx = v => 40 + (v - 200) / 1200 * 520;
    $('#wvS', el).innerHTML = `<svg class="ch" viewBox="0 0 600 46" role="img" aria-label="可見光範圍與目前波長"><defs><linearGradient id="wvGr">${stops}</linearGradient></defs>
<rect x="${sx(200)}" y="8" width="${sx(380) - sx(200)}" height="16" fill="var(--sunk)"/><rect x="${sx(380)}" y="8" width="${sx(750) - sx(380)}" height="16" fill="url(#wvGr)"/><rect x="${sx(750)}" y="8" width="${sx(1400) - sx(750)}" height="16" fill="var(--sunk)"/>
<text class="tk" x="${sx(290)}" y="40" text-anchor="middle">紫外光</text><text class="tk" x="${sx(565)}" y="40" text-anchor="middle">可見光</text><text class="tk" x="${sx(1075)}" y="40" text-anchor="middle">紅外光</text>
<path d="M${sx(nm)},4 l-6,-6 h12 z" class="dot"/><line class="mk" x1="${sx(nm)}" x2="${sx(nm)}" y1="4" y2="28"/></svg>`;
    const nu = 2.998e8 / (nm * 1e-9), E = 6.626e-34 * nu, Em = E * 6.022e23 / 1000;
    $('#wvO', el).textContent = `${nm} nm`;
    $('#wvK', el).innerHTML = card('c', '顏色', `<span style="display:inline-block;width:.9em;height:.9em;border-radius:3px;vertical-align:-.1em;margin-right:.3em;background:${col || 'transparent'};border:1px solid var(--line)"></span>${nmName(nm)}`)
      + card('n', '頻率 ν = c ÷ λ', `${sci(nu, 3)} Hz`, '每秒通過的波峰數') + card('e', '一個光子 E = hν', `${sci(E, 3)} J`) + card('m', '一莫耳光子', `${fx(Em, 0)} kJ/mol`, `≈ 119,600 ÷ ${nm}`);
    $('#wvN', el).innerHTML = `波長變短一半，頻率和光子能量就變成兩倍。${nm < 400 ? '紫外光的光子能量（超過約 300 kJ/mol）已經和許多化學鍵的鍵能相當，所以能打斷鍵、曬傷皮膚。' : nm > 750 ? '紅外光的光子能量太小，不能讓電子躍遷，只能讓化學鍵振動（光譜一章的 IR）。' : '可見光的光子能量剛好讓某些分子的電子躍遷，所以物質才有顏色。'}`;
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
  el.innerHTML = `<div class="w-row"><label class="sel">粒子 <select id="brZ"><option value="1">H（Z = 1）</option><option value="2">He⁺（Z = 2）</option><option value="3">Li²⁺（Z = 3）</option></select></label>${seg('brN', [1, 2, 3, 4].map(n => [String(n), `n = ${n}`]), '2')}</div><div id="brG"></div><div class="cards" id="brK"></div><p class="note" id="brN"></p>`;
  function draw() {
    const { Z, n } = st, r = k => 0.529 * k * k / Z, sc = 105 / r(4) * Z / 1;   // 以 H 的 n = 4 當最大圈，比例固定，換 Z 時圈會縮小
    const R = k => 0.529 * k * k / Z * (105 / (0.529 * 16));
    $('#brG', el).innerHTML = `<svg class="ch" style="max-width:300px;margin:auto" viewBox="0 0 240 240" role="img" aria-label="波耳軌道半徑">${[1, 2, 3, 4].map(k => `<circle cx="120" cy="120" r="${R(k)}" class="nuO" style="${k === n ? 'stroke:var(--accent);stroke-width:2.5;stroke-dasharray:none' : ''}"/>${R(k) > 9 ? `<text class="tk" x="${120 + R(k) * 0.7 + 2}" y="${120 - R(k) * 0.7}">n=${k}</text>` : ''}`).join('')}<circle cx="120" cy="120" r="4" class="nuP"/><circle cx="${120 + R(n)}" cy="120" r="5" class="nuE"/></svg>`;
    $('#brK', el).innerHTML = card('r', `r${['', '₁', '₂', '₃', '₄'][n]} = 0.529 × ${n}² ÷ ${Z}`, `${fx(r(n), 3)} Å`) + card('x', '是氫基態的幾倍', `${fx(n * n / Z, 2)} 倍`, 'n² ÷ Z');
    $('#brN', el).innerHTML = `半徑和 n² 成正比：n = 2 是 n = 1 的 4 倍、n = 3 是 9 倍，所以高能階的圈越來越大、能量間距卻越來越小。Z 越大，原子核拉得越緊，同一層的圈縮成 1/Z（換成 He⁺、Li²⁺ 看看）。圖上的比例固定，以氫的 n = 4 為最外圈。`;
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
  const st = { n: 3, l: 0 }, LN = 'spdf';
  el.innerHTML = `<div class="w-row" id="rdC"></div><div id="rdG"></div><div class="cards" id="rdK"></div><p class="note" id="rdN"></p>`;
  function draw() {
    const { n, l } = st, k = n - l - 1, rmax = n * n * 2 + 6, N = 300;
    const P = Array.from({ length: N + 1 }, (_, i) => { const r = rmax * i / N, rho = 2 * r / n, R = Math.pow(rho, l) * Math.exp(-rho / 2) * lagu(k, 2 * l + 1, rho); return [r, r * r * R * R]; });
    const mx = Math.max(...P.map(p => p[1]));
    const nodes = []; for (let i = 1; i < N; i++) { const a = lagu(k, 2 * l + 1, 2 * P[i][0] / n), b = lagu(k, 2 * l + 1, 2 * P[i + 1][0] / n); if (a * b < 0) nodes.push(P[i][0] + (P[i + 1][0] - P[i][0]) * a / (a - b)); }
    const xt = Array.from({ length: Math.floor(rmax / 5) + 1 }, (_, i) => i * 5);
    $('#rdC', el).innerHTML = `<span class="small">n</span>${[1, 2, 3, 4].map(v => `<button class="btn sm${v === n ? ' pri' : ''}" type="button" data-n="${v}">${v}</button>`).join('')}<span class="small">ℓ</span>${[0, 1, 2, 3].map(v => `<button class="btn sm${v === l ? ' pri' : ''}" type="button" data-l="${v}" ${v >= n ? 'disabled' : ''}>${LN[v]}</button>`).join('')}`;
    $('#rdG', el).innerHTML = chart({ w: 600, h: 250, x: [0, rmax], y: [0, 1.08], xt, yt: [], xlab: '離原子核的距離 r（單位 a₀ = 0.529 Å）', ylab: '機率', label: '徑向機率分布' }, (X, Y) =>
      `<path class="tline" d="${P.map(([r, p], i) => `${i ? 'L' : 'M'}${X(r).toFixed(1)},${Y(p / mx).toFixed(1)}`).join('')}"/>`
      + nodes.map(r => `<line class="mk" x1="${X(r)}" x2="${X(r)}" y1="${Y(0)}" y2="${Y(1.05)}"/><circle class="dot" cx="${X(r)}" cy="${Y(0)}" r="5"/><text class="tk hl" x="${X(r)}" y="${Y(1.05) - 3}" text-anchor="middle">節點 ${fx(r, 1)} a₀</text>`).join(''));
    $('#rdK', el).innerHTML = card('o', '軌域', `${n}${LN[l]}`) + card('r', '徑向節點（球面）', `${k} 個`, `n − ℓ − 1 = ${n} − ${l} − 1`) + card('a', '角節面（平面）', `${l} 個`, `= ℓ`);
    $('#rdN', el).innerHTML = `曲線是「在半徑 r 的薄球殼上找到電子」的機率。曲線碰到 0 的地方就是<b>徑向節點</b>：那個半徑的整個球面上都找不到電子。1s 沒有節點；2s 有 1 個，在 r = 2a₀；3s 有 2 個。n 越大，電子越常出現在離原子核越遠的地方，所以原子越大。同一層的 s 軌域在原子核附近有一個小峰（穿透得較深），這就是 2s 比 2p 能量低、填電子時先填 s 的原因。`;
    $$('[data-n]', el).forEach(b => { b.onclick = () => { st.n = +b.dataset.n; st.l = Math.min(st.l, st.n - 1); draw(); }; });
    $$('[data-l]', el).forEach(b => { b.onclick = () => { st.l = +b.dataset.l; draw(); }; });
  }
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
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
    $('#emF', el).innerHTML = `E = hν = hc/λ = (6.626×10⁻³⁴)(2.998×10⁸) ÷ λ = <b>${sci(E, 3)} J</b>（一個光子）　× Nₐ ＝ <b>${sci(Em, 3)} kJ/mol</b>`;
    $('#emK', el).innerHTML = card('l', '波長 λ', ls) + card('n', '頻率 ν = c/λ', `${sci(nu, 2)} Hz`) + card('e', '每莫耳光子能量', `${sci(Em, 3)} kJ/mol`) + card('r', '區域', reg[0]);
    $('#emN', el).innerHTML = `波長和頻率成反比，能量和頻率成正比：<b>波長越短，能量越高</b>。由長到短：無線電波 &gt; 微波 &gt; 紅外光 &gt; 可見光（紅 → 紫）&gt; 紫外光 &gt; X 射線 &gt; γ 射線。常用換算：E（kJ/mol）≈ 119,600 ÷ λ（nm）。要打斷一莫耳 O=O 鍵需要 498 kJ，對應的光子最長波長約 240 nm（紫外光）。`;
    $('#emR', el).value = lg;
  }
  $('#emR', el).oninput = e => { lg = +e.target.value; draw(); };
  $$('[data-v]', el).forEach(b => { b.onclick = () => { lg = Math.log10(+b.dataset.v); draw(); }; });
  draw();
  return { set(s) { if (s.l) lg = Math.log10(s.l); draw(); } };
};

/* ===== 7. 一維箱中粒子 ===== */
W.pbox = el => {
  const st = { L: 1.0, t: '1-2' };
  el.innerHTML = `<div class="w-row"><label class="rng">箱子長度 L<input type="range" id="pbL" min="0.2" max="2" step="0.05"><output class="mono" id="pbO"></output></label></div>${seg('pbS', [['1-2', 'n = 1 → 2'], ['1-3', 'n = 1 → 3'], ['2-3', 'n = 2 → 3']], st.t)}<div id="pbG"></div><p class="eq" id="pbF"></p><div class="cards" id="pbK"></div><p class="note" id="pbN"></p>`;
  function draw() {
    const h = 6.626e-34, m = 9.109e-31, L = st.L * 1e-9, E1 = h * h / (8 * m * L * L), eV = E1 / 1.602e-19, [a, b] = st.t.split('-').map(Number), dE = (b * b - a * a) * E1, lam = h * 2.998e8 / dE;
    const Y = n => 235 - n * n * 12, x0 = 70, x1 = 330;
    let s = `<line class="ax" x1="${x0}" x2="${x0}" y1="20" y2="240"/><line class="ax" x1="${x1}" x2="${x1}" y1="20" y2="240"/><line class="ax" x1="${x0}" x2="${x1}" y1="240" y2="240"/><text class="tk" x="${(x0 + x1) / 2}" y="256" text-anchor="middle">0 ← L → L</text>`;
    for (let n = 1; n <= 4; n++) {
      const y = Y(n), on = n === a || n === b;
      s += `<line class="lvl${on ? ' on' : ''}" x1="${x0}" x2="${x1}" y1="${y}" y2="${y}"/><path class="tline" d="${path(Array.from({ length: 61 }, (_, i) => [x0 + (x1 - x0) * i / 60, y - 11 * Math.sin(n * Math.PI * i / 60)]))}" opacity="${on ? 1 : 0.35}"/><text class="tk" x="${x1 + 10}" y="${y + 4}">n = ${n}：E = ${n * n} E₁</text>`;
    }
    s += `<line x1="${x1 + 140}" x2="${x1 + 140}" y1="${Y(a)}" y2="${Y(b) + 6}" class="dlt up" marker-end="url(#pbA)"/><defs><marker id="pbA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="ahp"/></marker></defs>`;
    $('#pbG', el).innerHTML = `<svg class="en" style="max-width:620px" viewBox="40 0 460 262" role="img" aria-label="箱中粒子能階">${s}</svg>`;
    $('#pbO', el).textContent = `${fx(st.L, 2)} nm`; $('#pbL', el).value = st.L;
    $('#pbF', el).innerHTML = `Eₙ = n²h² / (8mL²)　→　ΔE = (${b}² − ${a}²) × h²/(8mL²) = <b>${b * b - a * a} E₁</b>`;
    $('#pbK', el).innerHTML = card('e1', 'E₁（電子）', `${fx(eV, 3)} eV`) + card('de', 'ΔE', `${fx(dE / 1.602e-19, 3)} eV`) + card('l', '吸收光的波長', `${fx(lam * 1e9, 0)} nm`);
    $('#pbN', el).innerHTML = `粒子被關在長度 L 的箱子裡，波函數兩端必須是 0，只能放整數個半波長，所以能量只能取 n² 倍的 E₁。最小的激發是 n = 1 → 2，需要 <b>3h²/(8mL²)</b>。L 變成兩倍，所有能量變成 1/4：箱子越長，能階越密，吸收波長越長。共軛分子越長、吸收光波長越長，就是這個道理。`;
    pressSeg(el, 'pbS', st.t);
  }
  $('#pbL', el).oninput = e => { st.L = +e.target.value; draw(); };
  bindSeg(el, 'pbS', v => { st.t = v; draw(); });
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
  el.innerHTML = `${seg('irS', Object.entries(IONR).map(([k, v]) => [k, v[0]]), cur)}<div class="bars pk" id="irB"></div><p class="note" id="irN"></p>`;
  function draw() {
    const [, d] = IONR[cur];
    $('#irB', el).innerHTML = d.map(([t, Z, r]) => `<div><span>${t}（${Z} 個質子）</span><i class="ba" style="width:${r / 190 * 100}%"></i><b class="mono">${r} pm</b></div>`).join('');
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
  el.innerHTML = `${seg('siS', Object.keys(SIE).map(k => [k, k]), cur)}<div id="siG"></div><div class="cards" id="siK"></div><p class="note" id="siN"></p>`;
  function draw() {
    const [, v] = SIE[cur], r = v.slice(1).map((x, i) => x / v[i]), k = r.indexOf(Math.max(...r)) + 1;
    $('#siG', el).innerHTML = chart({ w: 560, h: 240, x: [0.4, 6.6], y: [2.5, 4.5], xt: [1, 2, 3, 4, 5, 6], yt: [3, 3.5, 4, 4.5], xlab: '第幾個游離能 Iₙ', ylab: 'log₁₀ I（kJ/mol）', label: '連續游離能' }, (X, Y) =>
      v.map((x, i) => `<rect x="${X(i + 1) - 18}" y="${Y(Math.log10(x))}" width="36" height="${Y(2.5) - Y(Math.log10(x))}" class="${i < k ? 'bv' : 'bc'}"/><text class="tk" x="${X(i + 1)}" y="${Y(Math.log10(x)) - 5}" text-anchor="middle">${x}</text>`).join('')
      + `<line class="mk" x1="${X(k + 0.5)}" x2="${X(k + 0.5)}" y1="${Y(4.5)}" y2="${Y(2.5)}"/>`);
    $('#siK', el).innerHTML = card('j', '最大的跳躍', `I${subN(k)} → I${subN(k + 1)}`, `×${fx(r[k - 1], 1)}`) + card('v', '價電子數', k) + card('g', '族', k <= 2 ? `第 ${k} 族` : `第 ${k + 10} 族`);
    $('#siN', el).innerHTML = `前 ${k} 個電子在最外層，拿掉之後剩下的是穩定的鈍氣組態；第 ${k + 1} 個要從<b>內層</b>拿，所以游離能突然跳很大（縱軸是對數，跳躍仍然很明顯）。看到「第 k 個之後大跳」，就知道有 k 個價電子。`;
    pressSeg(el, 'siS', cur);
  }
  bindSeg(el, 'siS', v => { cur = v; draw(); });
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
    $('#iaG', el).innerHTML = chart({ w: 520, h: 230, x: [lo, hi], y: [0, 100], xt: Array.from({ length: hi - lo + 1 }, (_, i) => lo + i), yt: [0, 25, 50, 75, 100], xlab: '質量（u）', ylab: '天然豐度（%）', label: '同位素豐度' }, (X, Y) =>
      d.map(([A, m, p]) => `<rect x="${X(m) - 16}" y="${Y(p)}" width="32" height="${Y(0) - Y(p)}" class="bv"/><text class="tk" x="${X(m)}" y="${Y(p) - 6}" text-anchor="middle">${supN(A)}${cur} ${p}%</text>`).join('')
      + `<line class="mk" x1="${X(avg)}" x2="${X(avg)}" y1="${Y(0)}" y2="${Y(100)}"/><circle class="dot" cx="${X(avg)}" cy="${Y(0)}" r="7"/><text class="tk hl" x="${X(avg)}" y="${Y(100) + 12}" text-anchor="middle">平均 ${fx(avg, 2)}</text>`);
    $('#iaF', el).innerHTML = `平均原子量 = ${d.map(([, m, p]) => `${m} × ${fx(p / 100, 4)}`).join(' + ')} = <b>${fx(avg, 2)}</b>`;
    $('#iaN', el).innerHTML = `長條的高度是豐度、位置是質量；平均原子量是以豐度加權的「重心」（紅色虛線），會偏向豐度較高的同位素。質譜中 ${cur} 會出現 ${d.length} 個峰，高度比約 ${d.map(x => Math.round(x[2])).join(' : ')}。`;
    $('#iaR', el).value = a1; $('#iaO', el).textContent = `${fx(a1, 1)}%`;
    if (ab != null) $('#iaN', el).innerHTML += ` 拖動豐度時，平均值跟著往豐度較高的那一邊移動；天然的 ${cur} 原子量是 ${fx(nat.reduce((a, [, m, p]) => a + m * p / 100, 0), 2)}。反過來，已知平均原子量求豐度：設較輕的佔 x，解 m₁x + m₂(1 − x) = 平均值。`;
    pressSeg(el, 'iaS', cur);
  }
  $('#iaR', el).oninput = e => { ab = +e.target.value; draw(); };
  $('#iaB', el).onclick = () => { ab = null; draw(); };
  bindSeg(el, 'iaS', v => { cur = v; ab = null; draw(); });
  draw();
  return { set(s2) { cur = s2.e || cur; draw(); } };
};
