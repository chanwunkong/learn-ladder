/* ---------- 後中化學：分子軌域理論的互動圖 ---------- */

/* ===== 1. 原子軌域相加、相減：成鍵與反鍵 ===== */
W.lcao = el => {
  const st = { t: 'b', m: 'homo' };
  el.innerHTML = `${seg('lcT', [['b', '相加：成鍵軌域'], ['a', '相減：反鍵軌域']], st.t)}${seg('lcM', [['homo', 'H₂（同核）'], ['hetero', 'HeH⁺（異核）']], st.m)}<div id="lcG"></div><p class="eq" id="lcF"></p><p class="note" id="lcN"></p>`;
  function draw() {
    const het = st.m === 'hetero', bond = st.t === 'b', cA = het ? (bond ? 0.85 : 0.53) : 0.71, cB = (het ? (bond ? 0.53 : 0.85) : 0.71) * (bond ? 1 : -1);
    const fA = x => Math.exp(-Math.abs(x + 0.9) * (het ? 1.4 : 1)), fB = x => Math.exp(-Math.abs(x - 0.9)), psi = x => cA * fA(x) + cB * fB(x), xs = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05);
    $('#lcG', el).innerHTML = chart({ w: 560, h: 250, x: [-4, 4], y: [-1, 1.4], xt: [], yt: [-1, 0, 1], xlab: '沿著鍵軸的位置', ylab: 'ψ（線）與 ψ²（陰影）', label: '分子軌域' }, (X, Y) =>
      `<path d="${path(xs.map(x => [X(x), Y(psi(x) ** 2)]))}L${X(4)} ${Y(0)}L${X(-4)} ${Y(0)}Z" class="dens"/><path class="tline faint" d="${path(xs.map(x => [X(x), Y(cA * fA(x))]))}"/><path class="tline faint" d="${path(xs.map(x => [X(x), Y(cB * fB(x))]))}"/><path class="tline" d="${path(xs.map(x => [X(x), Y(psi(x))]))}"/>`
      + `<line class="mk" x1="${X(-4)}" x2="${X(4)}" y1="${Y(0)}" y2="${Y(0)}"/><circle class="nucA" cx="${X(-0.9)}" cy="${Y(0)}" r="7"/><circle class="nucB" cx="${X(0.9)}" cy="${Y(0)}" r="6"/><text class="tk" x="${X(-0.9)}" y="${Y(-0.25)}" text-anchor="middle">${het ? 'He' : 'H'}</text><text class="tk" x="${X(0.9)}" y="${Y(-0.25)}" text-anchor="middle">H</text>`
      + (bond ? '' : (() => { let x0 = -0.9; for (let x = -0.9; x <= 0.9; x += 0.005) if (psi(x) * psi(-0.9) <= 0) { x0 = x; break; } return `<line class="node" x1="${X(x0)}" x2="${X(x0)}" y1="${Y(-0.9)}" y2="${Y(1.3)}"/><text class="tk hl" x="${X(x0)}" y="${Y(1.2)}" text-anchor="middle">節面</text>`; })()));
    $('#lcF', el).innerHTML = `ψ${bond ? '' : '*'} = ${fx(cA, 2)} ψ(${het ? 'He' : 'H'}) ${bond ? '+' : '−'} ${fx(Math.abs(cB), 2)} ψ(H)`;
    $('#lcN', el).innerHTML = bond ? `兩個原子軌域<b>同號相加</b>，在兩個原子核之間互相加強，電子密度（陰影）集中在兩核之間，同時被兩個原子核吸引，能量比原來的原子軌域<b>低</b>：成鍵軌域。${het ? '異核分子中，成鍵軌域比較像能量較低、電負度較大的原子（He）的軌域，所以 He 的係數較大。' : ''}`
      : `兩個原子軌域<b>異號相減</b>，在兩核之間互相抵消，出現一個<b>節面</b>（電子密度為 0），電子被推到兩核外側，能量比原子軌域<b>高</b>：反鍵軌域（以 * 表示）。${het ? '異核分子中，反鍵軌域比較像能量較高、電負度較小的原子（H）的軌域，所以 H 的係數較大。' : ''}`;
    pressSeg(el, 'lcT', st.t); pressSeg(el, 'lcM', st.m);
  }
  bindSeg(el, 'lcT', v => { st.t = v; draw(); });
  bindSeg(el, 'lcM', v => { st.m = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. 雙原子分子的分子軌域能階圖 =====
   [名稱, 總電子數]；第二週期以 1s 內層 4 個電子計 */
const MOSP = [['H₂⁺', 1], ['H₂', 2], ['H₂⁻', 3], ['He₂', 4], ['Li₂', 6], ['Be₂', 8], ['B₂', 10], ['C₂', 12], ['N₂', 14], ['O₂', 16], ['F₂', 18], ['Ne₂', 20],
  ['N₂⁺', 13], ['N₂⁻', 15], ['O₂²⁺', 14], ['O₂⁺', 15], ['O₂⁻', 17], ['O₂²⁻', 18], ['C₂²⁻', 14], ['CO', 14], ['CN⁻', 14], ['NO⁺', 14], ['NO', 15], ['NO⁻', 16]];
W.modiagram = el => {
  let cur = 'O₂';
  el.innerHTML = `<div class="w-row">${MOSP.map(([t]) => `<button class="btn sm ghost" type="button" data-m="${t}">${t}</button>`).join('')}</div><div id="mdG"></div><p class="eq" id="mdC"></p><div class="cards" id="mdK"></div><p class="note" id="mdN"></p>`;
  function draw() {
    const [, ne] = MOSP.find(x => x[0] === cur), light = ne <= 4, mixed = ne <= 14;
    // 能階：[名稱, 簡併數, 是否反鍵, y]
    const L = light ? [['σ1s', 1, 0, 220], ['σ*1s', 1, 1, 110]]
      : mixed ? [['σ2s', 1, 0, 285], ['σ*2s', 1, 1, 245], ['π2p', 2, 0, 175], ['σ2p', 1, 0, 140], ['π*2p', 2, 1, 90], ['σ*2p', 1, 1, 40]]
        : [['σ2s', 1, 0, 285], ['σ*2s', 1, 1, 245], ['σ2p', 1, 0, 180], ['π2p', 2, 0, 145], ['π*2p', 2, 1, 90], ['σ*2p', 1, 1, 40]];
    let left = light ? ne : ne - 4; const occ = L.map(l => { const k = Math.min(left, 2 * l[1]); left -= k; return k; });
    let s = '';
    L.forEach(([n, g, anti, y], i) => {
      const xs = g === 2 ? [250, 310] : [280], k = occ[i];
      xs.forEach((x, j) => { const e = g === 2 ? (k >= j + 1 ? 1 : 0) + (k >= j + 3 ? 1 : 0) : k; s += `<line class="lvl${anti ? ' anti' : ''}" x1="${x - 22}" x2="${x + 22}" y1="${y}" y2="${y}"/>${e ? `<text class="mo-e" x="${x}" y="${y - 5}" text-anchor="middle">${e === 2 ? '↑↓' : '↑'}</text>` : ''}`; });
      s += `<text class="tk${anti ? ' anti' : ''}" x="215" y="${y + 4}" text-anchor="end">${n}</text>`;
    });
    const ao = light ? [['1s', 165]] : [['2s', 265], ['2p', 115]];
    ao.forEach(([n, y]) => { s += `<line class="lvl ao" x1="70" x2="120" y1="${y}" y2="${y}"/><line class="lvl ao" x1="440" x2="490" y1="${y}" y2="${y}"/><text class="tk" x="60" y="${y + 4}" text-anchor="end">${n}</text><text class="tk" x="500" y="${y + 4}">${n}</text>`; });
    s += `<text class="tk" x="95" y="318" text-anchor="middle">原子 A</text><text class="tk" x="280" y="318" text-anchor="middle">分子</text><text class="tk" x="465" y="318" text-anchor="middle">原子 B</text>`;
    $('#mdG', el).innerHTML = `<svg class="en" style="max-width:620px;margin:auto" viewBox="0 0 560 325" role="img" aria-label="${esc(cur)} 分子軌域能階圖">${s}</svg>`;
    const nb = L.reduce((a, l, i) => a + (l[2] ? 0 : occ[i]), 0), na = L.reduce((a, l, i) => a + (l[2] ? occ[i] : 0), 0), bo = (nb - na) / 2;
    const unp = L.reduce((a, l, i) => a + (l[1] === 2 ? (occ[i] === 1 || occ[i] === 3 ? 1 : occ[i] === 2 ? 2 : 0) : occ[i] === 1 ? 1 : 0), 0);
    const sup = n => String(n).split('').map(c => SUP[c]).join('');
    $('#mdC', el).innerHTML = `${light ? '' : '(σ1s)²(σ*1s)²'}${L.map((l, i) => (occ[i] ? `(${l[0]})${sup(occ[i])}` : '')).join('')}`;
    $('#mdK', el).innerHTML = card('e', light ? '電子數' : '價電子數', light ? ne : ne - 4, `總共 ${ne}`) + card('bo', '鍵級', fx(bo, bo % 1 ? 1 : 0), `(${nb} − ${na}) ÷ 2`) + card('u', '未成對電子', unp) + card('m', '磁性', unp ? '順磁性' : '反磁性');
    $('#mdN', el).innerHTML = `${bo <= 0 ? `<b>鍵級 0：</b>成鍵與反鍵的電子一樣多，${cur} 不能穩定存在。` : `鍵級 = (成鍵電子 − 反鍵電子) ÷ 2，圖上黑線是成鍵、紅線是反鍵。鍵級越大，鍵越強、越短。`}${light ? '' : mixed ? ' 總電子數 ≤ 14（B₂、C₂、N₂ 及其等電子粒子）時，2s 與 2p 互相作用，π2p 在 σ2p 下方。' : ' O₂、F₂ 以後 σ2p 在 π2p 下方。'}${cur === 'O₂' ? ' O₂ 的最後兩個電子各佔一個 π*2p（洪德定則），有 2 個未成對電子，所以有順磁性；路易斯結構 O=O 看不出這一點。' : ''}`;
    $$('[data-m]', el).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === cur)));
  }
  $$('[data-m]', el).forEach(b => { b.onclick = () => { cur = b.dataset.m; draw(); }; });
  draw();
  return { set(s) { cur = s.m || cur; draw(); } };
};

/* ===== 3. 鍵級、鍵長與鍵能：O₂ 系列 =====
   鍵長 pm（O₂²⁻：過氧根、O₂⁻：超氧根，教科書常用值） */
const O2S = [['O₂²⁻', 1, 149], ['O₂⁻', 1.5, 133], ['O₂', 2, 121], ['O₂⁺', 2.5, 112]];
W.o2series = el => {
  el.innerHTML = `<div id="osG"></div><p class="note">四個粒子的差別只有 π*2p 上的電子數：每拿掉一個反鍵電子，鍵級增加 0.5，鍵就變短、變強。O₂²⁻ 是過氧化物（H₂O₂、Na₂O₂）中的過氧根，O₂⁻ 是 KO₂ 中的超氧根。</p>`;
  $('#osG', el).innerHTML = chart({ w: 560, h: 230, x: [0.7, 2.8], y: [105, 155], xt: [1, 1.5, 2, 2.5], yt: [110, 120, 130, 140, 150], xlab: '鍵級', ylab: 'O–O 鍵長（pm）', label: 'O₂ 系列鍵長' }, (X, Y) =>
    `<path class="tline faint" d="${path(O2S.map(([, b, l]) => [X(b), Y(l)]))}"/>` + O2S.map(([t, b, l]) => `<circle class="dot" cx="${X(b)}" cy="${Y(l)}" r="6"/><text class="tk" x="${X(b) + 10}" y="${Y(l) - 6}">${t} ${l} pm</text>`).join(''));
  return { set() {} };
};
