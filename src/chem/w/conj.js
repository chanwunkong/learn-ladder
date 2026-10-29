/* ---------- 後中化學：共軛二烯與周環反應 ---------- */

/* ===== 1. 多烯的 π 分子軌域 =====
   係數 c_jk = sin(jkπ/(n+1))（Hückel）；λmax 為實驗值（約略）：乙烯 165、丁二烯 217、己三烯 258、辛四烯 290 nm */
const PLY = { 2: ['乙烯', 165], 4: ['1,3-丁二烯', 217], 6: ['1,3,5-己三烯', 258], 8: ['1,3,5,7-辛四烯', 290] };
W.polyene = el => {
  const st = { n: 4, ex: 0 };
  el.innerHTML = `${seg('pnN', Object.entries(PLY).map(([k, v]) => [k, v[0]]), '4')}${seg('pnE', [['0', '基態'], ['1', '照光（激發態）']], '0')}<div id="pnG"></div><div class="cards" id="pnK"></div><p class="note" id="pnT"></p>`;
  function draw() {
    const n = st.n, H = n / 2, row = 46, W0 = 600, top = 20, hgt = top + row * n + 10;
    let s = '';
    for (let j = n; j >= 1; j--) {
      const y = top + (n - j) * row + row / 2, occ = j <= H ? 2 : 0, e = st.ex ? (j === H ? 1 : j === H + 1 ? 1 : occ) : occ;
      const tag = j === H + (st.ex ? 1 : 0) ? 'HOMO' : j === H + 1 + (st.ex ? -1 : 0) && !st.ex ? 'LUMO' : st.ex && j === H ? '' : '';
      s += `<text class="tk" x="8" y="${y + 4}">ψ${j}${j > H ? '*' : ''}</text>`;
      for (let k = 1; k <= n; k++) {
        const c = Math.sin(j * k * Math.PI / (n + 1)), x = 70 + (k - 1) * (300 / (n - 1 || 1)), rr = 3 + 9 * Math.abs(c), up = c >= 0;
        if (Math.abs(c) < 1e-9) { s += `<circle cx="${x}" cy="${y}" r="2" style="fill:var(--muted)"/>`; continue; }
        s += `<ellipse cx="${x}" cy="${y - rr * 0.75}" rx="${rr * 0.55}" ry="${rr * 0.75}" style="fill:${up ? 'var(--c1)' : 'none'};stroke:var(--c1);stroke-width:1.4"/><ellipse cx="${x}" cy="${y + rr * 0.75}" rx="${rr * 0.55}" ry="${rr * 0.75}" style="fill:${up ? 'none' : 'var(--c1)'};stroke:var(--c1);stroke-width:1.4"/>`;
      }
      const el2 = [0, 1].map(i => i < e ? `<text x="${410 + i * 14}" y="${y + 6}" style="font-size:16px;fill:var(--ink)">${i ? '↓' : '↑'}</text>` : '').join('');
      const lab = (!st.ex && j === H) || (st.ex && j === H + 1) ? 'HOMO' : (!st.ex && j === H + 1) ? 'LUMO' : '';
      s += `<line x1="400" x2="445" y1="${y + 10}" y2="${y + 10}" style="stroke:var(--ink);stroke-width:2"/>${el2}<text class="tk" x="455" y="${y + 4}" style="fill:${lab === 'HOMO' ? 'var(--c2)' : 'var(--c3)'}">${lab} ${j - 1} 個節面</text>`;
      void tag;
    }
    $('#pnG', el).innerHTML = `<svg class="en" viewBox="0 0 ${W0} ${hgt}" style="max-width:${W0}px;margin:auto" role="img" aria-label="π 分子軌域">${s}</svg>`;
    const homo = st.ex ? H + 1 : H, ends = [1, n].map(k => Math.sign(Math.sin(homo * k * Math.PI / (n + 1)))), sym = ends[0] === ends[1];
    $('#pnK', el).innerHTML = card('l', '最大吸收波長 λmax', `${PLY[n][1]} nm`) + card('h', 'HOMO 兩端的瓣', sym ? '同相（對稱）' : '反相（反對稱）') + card('c', '閉環時兩端', sym ? '對旋（disrotatory）' : '順旋（conrotatory）');
    $('#pnT', el).innerHTML = `每個 π 軌域由 ${n} 個 p 軌域組成，實心與空心代表相位相反。能量越高，節面越多（ψ<sub>j</sub> 有 j − 1 個節面）。共軛越長，HOMO 與 LUMO 越接近，吸收的光波長越長：每多一個共軛雙鍵 λmax 約增加 30–40 nm，β-胡蘿蔔素（11 個共軛雙鍵）吸收約 450 nm 的藍光，所以看起來是橘色。<br>電環反應時，HOMO 兩端的瓣要轉成同相才能形成新的 σ 鍵：兩端同相時兩端反向轉（<b>對旋</b>），兩端反相時同向轉（<b>順旋</b>）。照光把一個電子送進 LUMO，HOMO 的對稱性改變，所以照光與加熱的結果相反。`;
    pressSeg(el, 'pnN', String(n)); pressSeg(el, 'pnE', String(st.ex));
  }
  bindSeg(el, 'pnN', v => { st.n = +v; draw(); });
  bindSeg(el, 'pnE', v => { st.ex = +v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. 電環反應：順旋或對旋 ===== */
const ELC = {
  cb_cis: ['cis-3,4-二甲基環丁烯（開環）', 4, { con: '(2E,4Z)-2,4-己二烯', dis: '(2E,4E)-2,4-己二烯' }],
  cb_tr: ['trans-3,4-二甲基環丁烯（開環）', 4, { con: '(2E,4E)-2,4-己二烯', dis: '(2E,4Z)-2,4-己二烯' }],
  ot_eze: ['(2E,4Z,6E)-2,4,6-辛三烯（閉環）', 6, { dis: 'cis-5,6-二甲基-1,3-環己二烯', con: 'trans-5,6-二甲基-1,3-環己二烯' }],
  ot_ezz: ['(2E,4Z,6Z)-2,4,6-辛三烯（閉環）', 6, { dis: 'trans-5,6-二甲基-1,3-環己二烯', con: 'cis-5,6-二甲基-1,3-環己二烯' }],
};
W.electro = el => {
  const st = { s: 'cb_cis', h: 'heat' };
  el.innerHTML = `${seg('ecS', Object.entries(ELC).map(([k, v]) => [k, v[0]]), st.s)}${seg('ecH', [['heat', '加熱 Δ'], ['light', '照光 hν']], st.h)}<div id="ecG"></div><div class="cards" id="ecK"></div><p class="note" id="ecN"></p>`;
  function draw() {
    const [nm, e, P] = ELC[st.s], mode = (e === 4) === (st.h === 'heat') ? 'con' : 'dis';
    const arc = (x, cw) => `<path d="M${x - 22} 70 A 26 26 0 0 ${cw ? 1 : 0} ${x + 22} 70" style="fill:none;stroke:var(--c2);stroke-width:3" marker-end="url(#eca)"/>`;
    const lobe = (x, up) => `<ellipse cx="${x}" cy="${110 - 16}" rx="11" ry="16" style="fill:${up ? 'var(--c1)' : 'none'};stroke:var(--c1);stroke-width:1.5"/><ellipse cx="${x}" cy="${110 + 16}" rx="11" ry="16" style="fill:${up ? 'none' : 'var(--c1)'};stroke:var(--c1);stroke-width:1.5"/>`;
    $('#ecG', el).innerHTML = `<svg class="en" viewBox="0 0 440 170" style="max-width:460px;margin:auto" role="img" aria-label="電環反應"><defs><marker id="eca" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--c2)"/></marker></defs>
${lobe(130, true)}${lobe(310, mode === 'dis')}<line x1="150" x2="290" y1="110" y2="110" style="stroke:var(--muted);stroke-dasharray:4 4"/>${arc(130, true)}${arc(310, mode === 'con')}
<text class="tk" x="220" y="160" text-anchor="middle">${mode === 'con' ? '順旋：兩端同方向轉' : '對旋：兩端反方向轉'}（藍色瓣要轉到同一側成鍵）</text></svg>`;
    $('#ecK', el).innerHTML = card('e', 'π 電子數', `${e}（${e === 4 ? '4n' : '4n + 2'}）`) + card('m', '旋轉方式', mode === 'con' ? '順旋' : '對旋') + card('p', '產物', P[mode]);
    $('#ecN', el).innerHTML = `<b>伍德沃德–霍夫曼規則</b>：4n 個 π 電子的系統，加熱順旋、照光對旋；4n + 2 個 π 電子的系統，加熱對旋、照光順旋。電環反應是一步完成的協同反應，所以有立體專一性：起始物的順反決定產物的順反。開環時原本在環上同側的兩個甲基，經順旋後一個朝外、一個朝內，所以 cis-3,4-二甲基環丁烯加熱得到 (2E,4Z)。維生素 D₃ 的生成也是一例：7-脫氫膽固醇照光，6π 系統順旋開環成前維生素 D₃，再經加熱的 [1,7] 氫遷移得到維生素 D₃。`;
    pressSeg(el, 'ecS', st.s); pressSeg(el, 'ecH', st.h);
    void nm;
  }
  bindSeg(el, 'ecS', v => { st.s = v; draw(); });
  bindSeg(el, 'ecH', v => { st.h = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. Diels–Alder 反應 ===== */
const DAD = {
  bd: ['1,3-丁二烯', 1, '可以轉成 s-cis 構形，正常反應。'],
  dmb: ['2,3-二甲基-1,3-丁二烯', 2, '兩個推電子的甲基提高 HOMO，反應更快；甲基在內側位置也有利於 s-cis。'],
  cp: ['環戊二烯', 3, '兩個雙鍵被環固定在 s-cis，反應最快（室溫下會自己二聚）。產物是雙環[2.2.1]庚烯。'],
  zz: ['(2Z,4Z)-2,4-己二烯', 0.2, '轉成 s-cis 時兩個朝內的甲基互撞，反應非常慢。'],
  pd: ['1,4-戊二烯', 0, '兩個雙鍵之間隔一個 CH₂，不是共軛二烯，不能進行 Diels–Alder。'],
  ad: ['1,2-丁二烯（累積二烯）', 0, '累積二烯的兩個 π 鍵互相垂直，不是共軛，不能當雙烯。'],
};
const DAP = {
  ma: ['馬來酐（順式，兩個 C=O）', 3, 'cis', '兩個拉電子的 C=O 降低 LUMO，是極好的親雙烯物。'],
  fum: ['反丁烯二酸二甲酯（反式）', 2, 'trans', '反式的兩個酯基在產物中也互為反式。'],
  mal: ['順丁烯二酸二甲酯（順式）', 2, 'cis', '順式的兩個酯基在產物中互為順式。'],
  acr: ['丙烯酸甲酯', 1.5, 'one', '一個拉電子基即可。'],
  eth: ['乙烯', 0.1, 'none', '沒有拉電子基，需要高溫高壓。'],
};
W.diels = el => {
  const st = { d: 'bd', p: 'ma' };
  const sel = (id, O, v) => `<select id="${id}">${Object.entries(O).map(([k, o]) => `<option value="${k}"${k === v ? ' selected' : ''}>${o[0]}</option>`).join('')}</select>`;
  el.innerHTML = `<div class="w-row"><label class="sel">雙烯 ${sel('daD', DAD, st.d)}</label><label class="sel">親雙烯物 ${sel('daP', DAP, st.p)}</label></div><div id="daG"></div><div class="cards" id="daK"></div><p class="note" id="daN"></p>`;
  function draw() {
    const D = DAD[st.d], P = DAP[st.p], ok = D[1] > 0, r = D[1] * P[1];
    let sc;
    if (!ok) sc = { atoms: { a: { x: 0, y: 0, t: '不反應' } }, bonds: [] };
    else {
      const A = {}, B = [], ang = [90, 30, -30, -90, -150, 150];
      ang.forEach((a, k) => { A['c' + k] = { x: Math.cos(a * Math.PI / 180), y: Math.sin(a * Math.PI / 180), t: '' }; });
      B.push(['c0', 'c1', 's'], ['c1', 'c2', 's'], ['c2', 'c3', 's'], ['c3', 'c4', 's'], ['c4', 'c5', 'd'], ['c5', 'c0', 's']);
      if (st.d === 'cp') { A.br = { x: -0.15, y: 0, t: '' }; B.push(['c0', 'br', 's'], ['c3', 'br', 's']); }
      if (st.d === 'dmb') { A.m1 = { x: -1.75, y: -0.95, t: 'CH₃' }; A.m2 = { x: -1.75, y: 0.95, t: 'CH₃' }; B.push(['c4', 'm1', 's'], ['c5', 'm2', 's']); }
      if (st.d === 'zz') { A.m1 = { x: 0.2, y: 1.95, t: 'CH₃' }; A.m2 = { x: 0.2, y: -1.95, t: 'CH₃' }; B.push(['c0', 'm1', 'w'], ['c3', 'm2', 'w']); }
      const E = P[2];
      if (st.p === 'ma') { A.e1 = { x: 1.8, y: 0.85, t: '' }; A.e2 = { x: 1.8, y: -0.85, t: '' }; A.ro = { x: 2.35, y: 0, t: 'O' }; A.o1 = { x: 2.3, y: 1.75, t: 'O' }; A.o2 = { x: 2.3, y: -1.75, t: 'O' }; B.push(['c1', 'e1', 'w'], ['c2', 'e2', 'w'], ['e1', 'ro', 's'], ['e2', 'ro', 's'], ['e1', 'o1', 'd'], ['e2', 'o2', 'd']); }
      else if (E === 'cis' || E === 'trans') { A.e1 = { x: 1.85, y: 0.95, t: 'CO₂CH₃' }; A.e2 = { x: 1.85, y: -0.95, t: 'CO₂CH₃' }; B.push(['c1', 'e1', 'w'], ['c2', 'e2', E === 'cis' ? 'w' : 'h']); }
      if (E === 'one') { A.e1 = { x: 1.85, y: 0.95, t: 'CO₂CH₃' }; B.push(['c1', 'e1', 's']); }
      sc = { atoms: A, bonds: B };
    }
    $('#daG', el).innerHTML = MOL.svg(sc, { w: 440, h: 230, s: 58, cx: 200, label: 'Diels–Alder 產物' });
    $('#daK', el).innerHTML = card('r', '反應性', !ok ? '不反應' : r >= 6 ? '很快' : r >= 2 ? '快' : r >= 1 ? '中等' : '很慢') + card('s', '產物立體', !ok ? '—' : P[2] === 'cis' ? '取代基順式（楔形同向）' : P[2] === 'trans' ? '取代基反式' : '—');
    $('#daN', el).innerHTML = `${D[2]} ${P[3]}<br>Diels–Alder 是 [4+2] 環加成：<b>雙烯的 HOMO</b> 與<b>親雙烯物的 LUMO</b> 重疊，三個 π 鍵在一步內同時變成兩個新 σ 鍵與一個新 π 鍵（綠色雙鍵位置）。沒有碳陽離子或其他中間體，所以親雙烯物上的順反關係完整保留（立體專一）。雙烯必須是共軛且能轉成 <b>s-cis</b>；雙烯帶推電子基、親雙烯物帶拉電子基時最快。環狀雙烯和有 C=O 的親雙烯物反應時，以 C=O 朝向新雙鍵下方的 <b>endo</b> 產物為主。`;
  }
  $('#daD', el).onchange = e => { st.d = e.target.value; draw(); };
  $('#daP', el).onchange = e => { st.p = e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); $('#daD', el).value = st.d; $('#daP', el).value = st.p; draw(); } };
};

/* ===== 4. 1,2-與 1,4-加成：動力學與熱力學控制 =====
   HBr + 1,3-丁二烯：−80 °C 1,2 : 1,4 = 80 : 20；40 °C = 15 : 85（OpenStax《Organic Chemistry》14.3 節） */
W.add14 = el => {
  let t = 'low';
  el.innerHTML = `${seg('a4S', [['low', '−80 °C'], ['high', '40 °C']], t)}<div id="a4G"></div><div class="cards" id="a4K"></div><p class="note" id="a4N"></p>`;
  function draw() {
    const lo = t === 'low';
    $('#a4G', el).innerHTML = energySVG([[0, 0.55], [0.22, 0.75], [0.4, 0.35], [0.62, 0.6], [1, 0.25]], null, { w: 460, h: 220, labels: [[0, '丁二烯 + HBr', 8], [0.4, '烯丙基陽離子', -24], [0.62, '1,2：能障較低', 8], [1, '1,2-產物', 8]], alt: [[0, 0.55], [0.22, 0.75], [0.4, 0.35], [0.66, 0.72], [1, 0.1]] }) + '<p class="small mut" style="text-align:center">實線：1,2-加成；虛線：1,4-加成（能障較高，但產物較穩定、能量較低）</p>';
    $('#a4K', el).innerHTML = card('a', '3-溴-1-丁烯（1,2-加成）', lo ? '80%' : '15%') + card('b', '1-溴-2-丁烯（1,4-加成）', lo ? '20%' : '85%') + card('c', '控制方式', lo ? '動力學控制' : '熱力學控制');
    $('#a4N', el).innerHTML = `H⁺ 先加到末端碳，生成烯丙基陽離子，正電荷共振分散在 C2 與 C4。Br⁻ 加到 C2 得到 1,2-加成產物，加到 C4 得到 1,4-加成產物。${lo ? '低溫時反應不可逆，哪個產物<b>生成得快</b>（活化能較低：Br⁻ 離 C2 較近）就以它為主：<b>動力學控制</b>。' : '較高溫時加成可逆，產物之間會達成平衡，以<b>較穩定</b>的產物為主（1,4-產物的雙鍵在內側、取代較多）：<b>熱力學控制</b>。'}共軛二烯和 1 當量 HBr 或 Br₂ 反應時，要考慮兩種產物以及它們的立體異構物。`;
    pressSeg(el, 'a4S', t);
  }
  bindSeg(el, 'a4S', v => { t = v; draw(); });
  draw();
  return { set(s) { t = s.t || t; draw(); } };
};
