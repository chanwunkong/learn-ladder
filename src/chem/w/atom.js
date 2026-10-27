/* ---------- 後中化學：原子結構與週期性的互動圖 ---------- */

/* ===== 1. 氫原子能階與光譜 ===== */
W.hspec = el => {
  let ni = 3, nf = 2;
  el.innerHTML = `<div class="w-row"><label class="sel">從 n = <select id="hsI">${[2, 3, 4, 5, 6, 7].map(n => `<option>${n}</option>`).join('')}</select></label><label class="sel">掉到 n = <select id="hsF">${[1, 2, 3].map(n => `<option>${n}</option>`).join('')}</select></label><span class="sp"></span>${[[3, 2, '紅線'], [4, 2, '藍綠線'], [2, 1, '萊曼系'], [4, 3, '帕申系']].map(([a, b, t]) => `<button class="btn sm ghost" type="button" data-t="${a},${b}">${t}</button>`).join('')}</div><div class="hsgrid"><div id="hsL"></div><div id="hsS"></div></div><div class="cards" id="hsK"></div><p class="note" id="hsN"></p>`;
  const E = n => -13.6 / (n * n), hc = 1239.84;   // eV·nm
  const col = l => l < 380 ? '#7a5cff' : l < 450 ? '#6a4cff' : l < 495 ? '#2f8fff' : l < 570 ? '#2fbf5f' : l < 590 ? '#e8d23a' : l < 620 ? '#f29a2e' : l <= 750 ? '#e2403a' : '#a33';
  function draw() {
    if (nf >= ni) nf = Math.max(1, ni - 1);
    const dE = E(ni) - E(nf), lam = hc / dE, Y = v => 20 + (-v) / 13.6 * 200;
    $('#hsL', el).innerHTML = `<svg viewBox="0 0 400 240" class="ch" role="img" aria-label="氫原子能階">${[1, 2, 3, 4, 5, 6, 7].map(n => `<line class="lvl${n === ni || n === nf ? ' on' : ''}" x1="40" x2="200" y1="${Y(E(n))}" y2="${Y(E(n))}"/>${n <= 3 ? `<text class="tk" x="206" y="${Y(E(n)) + 4}">n=${n}（${fx(E(n), 2)} eV）</text>` : ''}`).join('')}<text class="tk" x="206" y="${Y(E(5)) - 6}">n=4、5、6…（越來越密，趨近 0）</text><line x1="120" x2="120" y1="${Y(E(ni))}" y2="${Y(E(nf)) - 6}" stroke="${col(lam)}" stroke-width="3" marker-end="url(#hm2)"/><defs><marker id="hm2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${col(lam)}"/></marker></defs></svg>`;
    const lines = [3, 4, 5, 6].map(n => hc / (E(n) - E(2)));
    $('#hsS', el).innerHTML = chart({ x: [380, 750], y: [0, 1], xt: [400, 500, 600, 700], yt: [], xlab: '可見光波長（nm）：巴耳末系（掉到 n = 2）', h: 120 }, (X, Y) => `<defs><linearGradient id="vis" x1="0" x2="1"><stop offset="0" stop-color="#6a4cff"/><stop offset=".3" stop-color="#2f8fff"/><stop offset=".5" stop-color="#2fbf5f"/><stop offset=".65" stop-color="#e8d23a"/><stop offset=".8" stop-color="#f29a2e"/><stop offset="1" stop-color="#e2403a"/></linearGradient></defs><rect x="${X(380)}" y="${Y(1)}" width="${X(750) - X(380)}" height="${Y(0) - Y(1)}" fill="url(#vis)" opacity=".18"/>${lines.map(l => `<line x1="${X(l)}" x2="${X(l)}" y1="${Y(0)}" y2="${Y(1)}" stroke="${col(l)}" stroke-width="${Math.abs(l - lam) < 1 ? 5 : 2.5}"/>`).join('')}`);
    $('#hsK', el).innerHTML = card('e', 'ΔE', `${fx(dE, 2)} eV`) + card('l', '光的波長 λ = hc ÷ ΔE', `${fx(lam, 0)} nm`) + card('r', '區域', lam < 380 ? '紫外光' : lam <= 750 ? '可見光' : '紅外光');
    $('#hsN', el).innerHTML = `電子從 n = ${ni} 掉到 n = ${nf}，放出能量 ΔE = 13.6 × (1/${nf}² − 1/${ni}²) eV = ${fx(dE, 2)} eV 的光子，波長 ${fx(lam, 0)} nm。能階是<b>分立</b>的，所以光譜是一條一條的線，而不是連續的彩虹。掉到 n = 1 的（萊曼系）能量大，在紫外光；掉到 n = 2 的（巴耳末系）落在可見光。`;
    $('#hsI', el).value = ni; $('#hsF', el).value = nf;
  }
  $('#hsI', el).onchange = e => { ni = +e.target.value; draw(); };
  $('#hsF', el).onchange = e => { nf = +e.target.value; draw(); };
  $$('[data-t]', el).forEach(b => { b.onclick = () => { [ni, nf] = b.dataset.t.split(',').map(Number); draw(); }; });
  draw();
  return { set(s) { ni = s.ni ?? ni; nf = s.nf ?? nf; draw(); } };
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
  function draw() {
    const { n, l, m } = st;
    $('#qnC', el).innerHTML = `<span class="small">n</span>${[1, 2, 3, 4].map(v => `<button class="btn sm${v === n ? ' pri' : ''}" type="button" data-n="${v}">${v}</button>`).join('')}<span class="small">ℓ</span>${[0, 1, 2, 3].map(v => `<button class="btn sm${v === l ? ' pri' : ''}" type="button" data-l="${v}"${v >= n ? ' disabled' : ''}>${v}（${LN[v]}）</button>`).join('')}<span class="small">mℓ</span>${Array.from({ length: 2 * l + 1 }, (_, i) => i - l).map(v => `<button class="btn sm${v === m ? ' pri' : ''}" type="button" data-m="${v}">${v}</button>`).join('')}`;
    $$('[data-n]', el).forEach(b => { b.onclick = () => { st.n = +b.dataset.n; st.l = Math.min(st.l, st.n - 1); st.m = clamp(st.m, -st.l, st.l); draw(); }; });
    $$('[data-l]', el).forEach(b => { b.onclick = () => { st.l = +b.dataset.l; st.m = clamp(st.m, -st.l, st.l); draw(); }; });
    $$('[data-m]', el).forEach(b => { b.onclick = () => { st.m = +b.dataset.m; draw(); }; });
    $('#qnS', el).innerHTML = l === 3 ? '<p class="note">f 軌域形狀複雜，考試只需要知道有 7 個。</p>' : `<svg viewBox="0 0 220 200" class="bk" role="img" aria-label="${n}${LN[l]} 軌域">${shape()}<line x1="10" x2="210" y1="100" y2="100" class="axl"/><line x1="110" x2="110" y1="5" y2="195" class="axl"/><text class="tk" x="205" y="94">x</text><text class="tk" x="114" y="14">z</text></svg><p class="small mut c">${n}${LN[l]} 軌域（示意，深淺兩色為波函數正負號）</p>`;
    $('#qnK', el).innerHTML = card('o', '軌域', `${n}${LN[l]}`) + card('c', '這個副層的軌域數', 2 * l + 1) + card('e', '最多電子數', 2 * (2 * l + 1)) + card('s', `n = ${n} 殼層總軌域數`, n * n) + card('nd', '節面數（角節面 ℓ + 徑向 n−ℓ−1）', `${l} + ${n - l - 1}`);
    $('#qnN', el).innerHTML = `規則：n = 1, 2, 3…；ℓ = 0 到 n − 1；mℓ = −ℓ 到 +ℓ；每個軌域再有 ms = ±½ 兩個自旋。所以第 n 層有 n² 個軌域、最多 2n² 個電子。<b>沒有 1p、2d</b>，因為 ℓ 必須小於 n。`;
  }
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. 電子組態 ===== */
const ELEM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr'.split(' ');
const ENAME = '氫 氦 鋰 鈹 硼 碳 氮 氧 氟 氖 鈉 鎂 鋁 矽 磷 硫 氯 氬 鉀 鈣 鈧 鈦 釩 鉻 錳 鐵 鈷 鎳 銅 鋅 鎵 鍺 砷 硒 溴 氪'.split(' ');
function econf(Z) {
  const order = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10], ['4p', 6]], out = []; let left = Z;
  for (const [o, c] of order) { if (left <= 0) break; const k = Math.min(c, left); out.push([o, k]); left -= k; }
  const fix = { 24: [['4s', 1], ['3d', 5]], 29: [['4s', 1], ['3d', 10]] }[Z];   // 鉻、銅的例外：半滿、全滿的 d 較穩定
  if (fix) fix.forEach(([o, k]) => { const e = out.find(x => x[0] === o); if (e) e[1] = k; });
  return out;
}
W.econf = el => {
  let Z = 8;
  el.innerHTML = `<div class="w-row"><label class="rng">原子序 Z <input type="range" id="ecZ" min="1" max="36" step="1"><output class="mono" id="ecO"></output></label></div><div class="w-row">${[[6, '碳'], [7, '氮'], [8, '氧'], [24, '鉻（例外）'], [26, '鐵'], [29, '銅（例外）']].map(([z, t]) => `<button class="btn sm ghost" type="button" data-z="${z}">${t}</button>`).join('')}</div><p class="eq" id="ecS"></p><div class="boxes" id="ecB"></div><p class="note" id="ecN"></p>`;
  function draw() {
    const cf = econf(Z), sup = n => String(n).split('').map(c => SUP[c]).join('');
    $('#ecO', el).textContent = `${Z}　${ELEM[Z - 1]}（${ENAME[Z - 1]}）`; $('#ecZ', el).value = Z;
    $('#ecS', el).innerHTML = cf.map(([o, k]) => `${o}${sup(k)}`).join(' ');
    $('#ecB', el).innerHTML = cf.map(([o, k]) => { const nb = { s: 1, p: 3, d: 5 }[o[1]], up = Math.min(k, nb), dn = k - up;
      return `<div class="sub"><span class="mono small">${o}</span><div>${Array.from({ length: nb }, (_, i) => `<span class="box">${i < up ? '↑' : ''}${i < dn ? '↓' : ''}</span>`).join('')}</div></div>`; }).join('');
    const unp = cf.reduce((s, [o, k]) => { const nb = { s: 1, p: 3, d: 5 }[o[1]]; return s + (k <= nb ? k : 2 * nb - k); }, 0);
    $('#ecN', el).innerHTML = `${ENAME[Z - 1]}有 <b>${unp}</b> 個未成對電子${unp ? '（順磁性）' : '（反磁性）'}。填電子三規則：<b>構築原理</b>（由低能量填起：1s 2s 2p 3s 3p 4s 3d 4p）、<b>包立不相容</b>（每格最多兩個、自旋相反）、<b>洪德定則</b>（同一副層先各填一個、自旋平行）。${Z === 24 || Z === 29 ? `<b>例外</b>：${ENAME[Z - 1]}從 4s 借一個電子給 3d，形成${Z === 24 ? '半滿 3d⁵' : '全滿 3d¹⁰'}，比較穩定。` : ''}${Z >= 21 && Z <= 30 ? ' 過渡金屬形成陽離子時，先失去的是 <b>4s</b> 電子（例如 Fe²⁺ 是 [Ar]3d⁶）。' : ''}`;
  }
  $('#ecZ', el).oninput = e => { Z = +e.target.value; draw(); };
  $$('[data-z]', el).forEach(b => { b.onclick = () => { Z = +b.dataset.z; draw(); }; });
  draw();
  return { set(s) { Z = s.Z ?? Z; draw(); } };
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
