/* ---------- 後中化學：生物分子與合成策略的互動圖 ---------- */

/* ===== 1. 胺基酸的帶電狀態與等電點 ===== */
W.aa = el => {
  // 各解離基團：[名稱, pKa, 'a'（酸性：COOH，去質子後 −1）或 'b'（鹼性：NH₃⁺，去質子後 0）]
  const A = {
    gly: { n: '甘胺酸 Gly', g: [['α-COOH', 2.34, 'a'], ['α-NH₃⁺', 9.60, 'b']] },
    asp: { n: '天門冬胺酸 Asp', g: [['α-COOH', 1.88, 'a'], ['側鏈 COOH', 3.65, 'a'], ['α-NH₃⁺', 9.60, 'b']] },
    lys: { n: '離胺酸 Lys', g: [['α-COOH', 2.18, 'a'], ['α-NH₃⁺', 8.95, 'b'], ['側鏈 NH₃⁺', 10.53, 'b']] },
  };
  const st = { a: 'gly', pH: 7.4 };
  el.innerHTML = `${seg('aaS', Object.entries(A).map(([k, v]) => [k, v.n]), st.a)}<div class="w-row"><label class="rng">pH <input type="range" id="aaP" min="0" max="14" step="0.05"><output class="mono" id="aaPo"></output></label></div><div id="aaG"></div><div class="cards" id="aaK"></div><p class="note" id="aaN"></p>`;
  const q = (g, pH) => g.reduce((s, [, pk, t]) => s + (t === 'a' ? -1 / (1 + 10 ** (pk - pH)) : 1 / (1 + 10 ** (pH - pk))), 0);
  function pI(g) { let lo = 0, hi = 14; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (q(g, m) > 0) lo = m; else hi = m; } return (lo + hi) / 2; }
  function draw() {
    const d = A[st.a], z = q(d.g, st.pH), p = pI(d.g), xs = Array.from({ length: 141 }, (_, i) => i / 10);
    $('#aaG', el).innerHTML = chart({ x: [0, 14], y: [-2.2, 2.2], xt: [0, 2, 4, 6, 7.4, 8, 10, 12, 14], yt: [-2, -1, 0, 1, 2], xlab: 'pH', ylab: '淨電荷', h: 220, label: '淨電荷對 pH' }, (X, Y) => `<line class="mk" x1="${X(0)}" x2="${X(14)}" y1="${Y(0)}" y2="${Y(0)}"/><path class="tline" d="${path(xs.map(x => [X(x), Y(q(d.g, x))]))}"/><circle class="dot2" cx="${X(p)}" cy="${Y(0)}" r="5"/><text class="tk" x="${X(p)}" y="${Y(0) - 8}" text-anchor="middle">pI ${fx(p, 2)}</text><circle class="dot" cx="${X(st.pH)}" cy="${Y(z)}" r="7"/>`);
    $('#aaK', el).innerHTML = card('z', `pH ${fx(st.pH, 1)} 的淨電荷`, (z >= 0 ? '+' : '') + fx(z, 2)) + card('p', '等電點 pI', fx(p, 2)) + d.g.map(([n, pk, t], i) => card('g' + i, `${n}（pKa ${pk}）`, t === 'a' ? (st.pH > pk ? 'COO⁻' : 'COOH') : (st.pH < pk ? 'NH₃⁺' : 'NH₂'))).join('');
    $('#aaN', el).innerHTML = `每個基團都用 Henderson–Hasselbalch 判斷：pH 高於 pKa 就以去質子的形式為主。在<b>等電點 pI</b>，正負電荷剛好抵消，淨電荷為零，分子在電場中不移動（電泳的原理）。${st.a === 'gly' ? '中性胺基酸的 pI ≈ 兩個 pKa 的平均：(2.34 + 9.60) ÷ 2 = 5.97。' : st.a === 'asp' ? '酸性胺基酸的 pI 取兩個羧基 pKa 的平均：(1.88 + 3.65) ÷ 2 = 2.77。' : '鹼性胺基酸的 pI 取兩個胺基 pKa 的平均：(8.95 + 10.53) ÷ 2 = 9.74。'} 生理 pH 7.4 時，胺基酸是<b>兩性離子</b>（同時帶 −COO⁻ 與 −NH₃⁺）。`;
    $('#aaP', el).value = st.pH; $('#aaPo', el).textContent = fx(st.pH, 1); pressSeg(el, 'aaS', st.a);
  }
  bindSeg(el, 'aaS', v => { st.a = v; draw(); });
  $('#aaP', el).oninput = e => { st.pH = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. 葡萄糖的環化：α 與 β 變旋異構物 ===== */
W.sugar = el => {
  let ab = 'b';
  el.innerHTML = `${seg('sgS', [['a', 'α-D-葡萄哌喃糖'], ['b', 'β-D-葡萄哌喃糖']], ab)}<div class="bgrid"><div id="sgM"></div><div><div class="stack"><i class="bha" style="width:36%">α 36%</i><i class="ba" style="width:64%">β 64%</i></div><p class="small mut">水溶液中達平衡時的比例（開鏈形式 &lt; 0.01%）</p></div></div><p class="note" id="sgN"></p>`;
  function draw() {
    // 哈沃斯投影：環在紙面略為傾斜，O 在右後方；基團向上或向下
    const P = { O: [1.1, 0.35], C1: [1.1, -0.45], C2: [0.35, -0.95], C3: [-0.55, -0.95], C4: [-1.2, -0.45], C5: [-0.6, 0.35] };
    const up = { C1: ab === 'b', C2: false, C3: true, C4: false, C5: true }, sub = { C1: 'OH', C2: 'OH', C3: 'OH', C4: 'OH', C5: 'CH₂OH' };
    const atoms = { O: { x: P.O[0], y: P.O[1], t: 'O' } }, bonds = [];
    ['C1', 'C2', 'C3', 'C4', 'C5'].forEach(c => { atoms[c] = { x: P[c][0], y: P[c][1], t: '' }; const u = up[c], k = c + 's'; atoms[k] = { x: P[c][0] + (c === 'C1' ? 0.6 : 0), y: P[c][1] + (u ? 0.75 : -0.75), t: sub[c], hl: c === 'C1' ? 1 : 0 }; bonds.push([c, k, 's']); });
    [['O', 'C1'], ['C1', 'C2'], ['C2', 'C3'], ['C3', 'C4'], ['C4', 'C5'], ['C5', 'O']].forEach(([a, b]) => bonds.push([a, b, 's']));
    $('#sgM', el).innerHTML = MOL.svg({ atoms, bonds, notes: [{ x: 1.55, y: -0.5, t: 'C1' }] }, { w: 320, h: 270, s: 62, label: '葡萄糖哈沃斯投影' });
    $('#sgN', el).innerHTML = `葡萄糖的 C5–OH 攻擊 C1 的醛基，形成六元環的<b>半縮醛</b>（醛酮一章）。C1 變成新的掌性中心，稱為<b>變旋碳</b>：OH 朝下為 α、朝上（和 CH₂OH 同側）為 β。${ab === 'b' ? 'β 型在椅式構形中所有大基團都在平伏鍵，最穩定，所以佔 64%。' : 'α 型 C1 的 OH 在直立鍵，比 β 型稍不穩定，佔 36%。'} 兩者經由開鏈形式互相轉換，使旋光度隨時間改變（<b>變旋現象</b>）。澱粉是 α-1,4 鍵結、纖維素是 β-1,4 鍵結，一個字母的差別決定人體能不能消化。`;
    pressSeg(el, 'sgS', ab);
  }
  bindSeg(el, 'sgS', v => { ab = v; draw(); });
  draw();
  return { set(s) { ab = s.ab || ab; draw(); } };
};

/* ===== 3. 合成策略：步驟順序 ===== */
W.synth = el => {
  const P = [
    { t: '從苯合成間溴硝基苯（m-BrC₆H₄NO₂）', o: [['先硝化，再溴化', true, '硝基是間位定位基，再溴化時 Br 進入間位。'], ['先溴化，再硝化', false, 'Br 是鄰對位定位基，硝化會得到鄰、對溴硝基苯，不是間位。']] },
    { t: '從苯合成對溴硝基苯（p-BrC₆H₄NO₂）', o: [['先溴化，再硝化', true, 'Br 是鄰對位定位基；對位較不擁擠，是主產物，再分離掉鄰位。'], ['先硝化，再溴化', false, '硝基讓 Br 進入間位。']] },
    { t: '從丙烯合成 1-丙醇', o: [['① BH₃ ② H₂O₂, NaOH', true, '硼氫化–氧化：反馬可尼可夫，OH 在末端。'], ['H₂O, H₂SO₄', false, '酸催化水合是馬可尼可夫，得到 2-丙醇。']] },
    { t: '從溴乙烷合成丙腈 CH₃CH₂CN（多一個碳）', o: [['NaCN（DMSO）', true, 'CN⁻ 對一級鹵烷做 SN2，在極性非質子性溶劑中最快。'], ['KOtBu', false, '體積大的強鹼會做 E2，得到乙烯。']] },
    { t: '從丙酮合成 2-甲基-2-丁醇', o: [['① CH₃CH₂MgBr ② H₃O⁺', true, '格里納試劑加到羰基碳，酮 → 三級醇，多接上一個乙基。'], ['① NaBH₄ ② H₃O⁺', false, 'NaBH₄ 只加上 H，得到 2-丙醇。']] },
  ];
  let i = 0, pick = null;
  el.innerHTML = `<div class="w-row" id="syN"></div><p class="qt" id="syT"></p><div class="opts" id="syO"></div><p class="note" id="syF"></p>`;
  function draw() {
    const p = P[i];
    $('#syN', el).innerHTML = P.map((_, k) => `<button class="btn sm${k === i ? ' pri' : ''}" type="button" data-k="${k}">題 ${k + 1}</button>`).join('');
    $$('[data-k]', el).forEach(b => { b.onclick = () => { i = +b.dataset.k; pick = null; draw(); }; });
    $('#syT', el).textContent = p.t;
    $('#syO', el).innerHTML = p.o.map((o, k) => `<button class="opt${pick === k ? (o[1] ? ' right' : ' wrong') : ''}" type="button" data-o="${k}">${o[0]}</button>`).join('');
    $$('[data-o]', el).forEach(b => { b.onclick = () => { pick = +b.dataset.o; draw(); }; });
    $('#syF', el).innerHTML = pick == null ? '先想一想再選。合成題的關鍵：<b>從產物往回推</b>（逆合成），並注意每一步的區域選擇與定位效應。' : `${p.o[pick][1] ? '<span class="ok">✓ 正確</span>' : '<span class="bad">✕ 不對</span>'}：${p.o[pick][2]}`;
  }
  draw();
  return { set(s) { i = s.i ?? i; pick = null; draw(); } };
};
