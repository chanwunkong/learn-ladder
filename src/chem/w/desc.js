/* ---------- 後中化學：元素、材料與分析化學的互動圖 ---------- */

/* ===== 1. 主族元素的週期分類 =====
   [符號, 週期, 位置(1–8), 金屬性 m/s/n, 氧化物 b/a/c/-, 氫化物 i/c/-] */
const MG = [['H', 1, 1, 'n', 'c', 'c'], ['He', 1, 8, 'n', '-', '-'], ['Li', 2, 1, 'm', 'b', 'i'], ['Be', 2, 2, 'm', 'a', 'c'], ['B', 2, 3, 's', 'c', 'c'], ['C', 2, 4, 'n', 'c', 'c'], ['N', 2, 5, 'n', 'c', 'c'], ['O', 2, 6, 'n', '-', 'c'], ['F', 2, 7, 'n', '-', 'c'], ['Ne', 2, 8, 'n', '-', '-'],
  ['Na', 3, 1, 'm', 'b', 'i'], ['Mg', 3, 2, 'm', 'b', 'i'], ['Al', 3, 3, 'm', 'a', 'c'], ['Si', 3, 4, 's', 'c', 'c'], ['P', 3, 5, 'n', 'c', 'c'], ['S', 3, 6, 'n', 'c', 'c'], ['Cl', 3, 7, 'n', 'c', 'c'], ['Ar', 3, 8, 'n', '-', '-'],
  ['K', 4, 1, 'm', 'b', 'i'], ['Ca', 4, 2, 'm', 'b', 'i'], ['Ga', 4, 3, 'm', 'a', 'c'], ['Ge', 4, 4, 's', 'a', 'c'], ['As', 4, 5, 's', 'c', 'c'], ['Se', 4, 6, 'n', 'c', 'c'], ['Br', 4, 7, 'n', 'c', 'c'], ['Kr', 4, 8, 'n', '-', '-'],
  ['Rb', 5, 1, 'm', 'b', 'i'], ['Sr', 5, 2, 'm', 'b', 'i'], ['In', 5, 3, 'm', 'a', 'c'], ['Sn', 5, 4, 'm', 'a', 'c'], ['Sb', 5, 5, 's', 'a', 'c'], ['Te', 5, 6, 's', 'c', 'c'], ['I', 5, 7, 'n', 'c', 'c'], ['Xe', 5, 8, 'n', 'c', '-']];
const MGP = {
  m: ['金屬性', 3, { m: ['金屬', '#2F3B99'], s: ['類金屬', '#8F5400'], n: ['非金屬', '#B5326C'] }, '週期表左下是金屬、右上是非金屬，中間沿著 B–Si–As–Te 的斜線是類金屬（半導體材料多在這裡）。'],
  o: ['氧化物的酸鹼性', 4, { b: ['鹼性氧化物', '#2F3B99'], a: ['兩性氧化物', '#23704A'], c: ['酸性氧化物', '#B5326C'], '-': ['—', '#9AA3A0'] }, '金屬氧化物溶於水呈鹼性（Na₂O + H₂O → 2NaOH），非金屬氧化物呈酸性（SO₃ + H₂O → H₂SO₄、CO₂、P₄O₁₀），交界附近的 BeO、Al₂O₃、Ga₂O₃、SnO₂ 是兩性，同時能溶於酸和強鹼。鹼性氧化物和酸性氧化物可以直接反應（CaO + SiO₂ → CaSiO₃）。'],
  h: ['氫化物的類型', 5, { i: ['離子氫化物（H⁻）', '#2F3B99'], c: ['共價氫化物', '#B5326C'], '-': ['—', '#9AA3A0'] }, '第 1、2 族活潑金屬和 H 形成含 H⁻ 的離子氫化物（NaH、CaH₂），遇水劇烈反應放出 H₂：NaH + H₂O → NaOH + H₂；它們也是強還原劑。非金屬形成共價氫化物（CH₄、NH₃、H₂O、HF）。'],
};
W.pertable = el => {
  const st = { p: 'o', e: 'Al' };
  el.innerHTML = `${seg('ptS', Object.entries(MGP).map(([k, v]) => [k, v[0]]), st.p)}<div class="ptab" id="ptG"></div><div class="w-row" id="ptL"></div><p class="note" id="ptN"></p>`;
  function draw() {
    const [, idx, cls, note] = MGP[st.p];
    $('#ptG', el).innerHTML = MG.map(d => { const c = cls[d[idx]] || cls['-']; return `<div class="pcell ptc${d[0] === st.e ? ' on' : ''}" data-e="${d[0]}" role="button" style="grid-row:${d[1]};grid-column:${d[2]};background:${c[1]}22;border-color:${c[1]}"><b>${d[0]}</b><small>${c[0].slice(0, 4)}</small></div>`; }).join('');
    $('#ptL', el).innerHTML = Object.values(cls).filter(c => c[0] !== '—').map(c => `<span class="qc" style="border-color:${c[1]};background:${c[1]}22">${c[0]}</span>`).join('');
    $('#ptN', el).innerHTML = note;
    $$('[data-e]', el).forEach(b => { b.onclick = () => { st.e = b.dataset.e; draw(); }; });
    pressSeg(el, 'ptS', st.p);
  }
  bindSeg(el, 'ptS', v => { st.p = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. 半導體：n 型與 p 型 ===== */
const SEMI = { pure: ['純矽', 0, 0], P: ['矽摻磷（第 15 族）', 1, 0], As: ['矽摻砷（第 15 族）', 1, 0], B: ['矽摻硼（第 13 族）', -1, 0], In: ['矽摻銦（第 13 族）', -1, 0], alga: ['Al₀.₂₅Ga₀.₂₆As₀.₄₉', -1, 1] };
W.semi = el => {
  let cur = 'P';
  el.innerHTML = `${seg('smS', Object.entries(SEMI).map(([k, v]) => [k, v[0]]), cur)}<div id="smG"></div><p class="note" id="smN"></p>`;
  function draw() {
    const [nm, t, alg] = SEMI[cur];
    let s = `<rect x="40" y="20" width="480" height="50" class="cband"/><text class="tk" x="50" y="38">傳導帶（空）</text><rect x="40" y="150" width="480" height="50" class="vband"/><text class="tk" x="50" y="194">價帶（填滿）</text><text class="tk" x="280" y="114" text-anchor="middle">${t ? '' : '能隙'}</text>`;
    for (let i = 0; i < 10; i++) { const x = 70 + i * 45; if (t > 0) s += `<line class="lvl" x1="${x}" x2="${x + 20}" y1="80" y2="80"/><circle class="eball" cx="${x + 10}" cy="${i < 4 ? 45 : 74}" r="6"/>`; if (t < 0) s += `<line class="lvl" x1="${x}" x2="${x + 20}" y1="140" y2="140"/><circle class="${i < 4 ? 'hole' : 'eball'}" cx="${x + 10}" cy="${i < 4 ? 175 : 134}" r="6"/>`; }
    $('#smG', el).innerHTML = `<svg class="en" style="max-width:600px" viewBox="20 10 520 200" role="img" aria-label="能帶">${s}</svg>`;
    $('#smN', el).innerHTML = alg ? '第 13 族（Al + Ga）共 0.51、第 15 族（As）0.49：第 13 族略多，價電子不足，價帶出現<b>電洞</b>，是 <b>p 型半導體</b>。'
      : t > 0 ? `<b>${nm}</b>：磷、砷有 5 個價電子，比矽多 1 個。多的電子位於傳導帶下方的施體能階，很容易跳進傳導帶導電，載子是帶負電的電子：<b>n 型半導體</b>。`
        : t < 0 ? `<b>${nm}</b>：硼、銦只有 3 個價電子，比矽少 1 個，在價帶上方形成受體能階；價帶電子跳上去之後，價帶留下<b>電洞</b>（白圈），電洞移動就是導電：<b>p 型半導體</b>。`
          : '純矽的價帶填滿、傳導帶全空，中間有約 1.1 eV 的能隙；室溫下只有極少電子能跳過去，導電度很低。金屬沒有能隙，絕緣體的能隙很大。';
    pressSeg(el, 'smS', cur);
  }
  bindSeg(el, 'smS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 3. 比爾定律與檢量線 ===== */
W.beer = el => {
  const st = { A: 0.45, dil: 20 };
  el.innerHTML = `<div class="w-row"><label class="rng">稀釋後溶液測得的吸光度 A<input type="range" id="brA" min="0.05" max="0.95" step="0.01"><output class="mono" id="brAo"></output></label><label class="rng">稀釋倍數<input type="range" id="brD" min="1" max="50" step="1"><output class="mono" id="brDo"></output></label></div><div id="brG"></div><ol class="cs" id="brC"></ol><p class="note">比爾定律 A = εbc：吸光度和濃度成正比（光徑 b 固定）。先用已知濃度的標準溶液畫出<b>檢量線</b>（斜率 εb），再由未知樣品的吸光度讀出濃度。樣品若先稀釋，要再乘回稀釋倍數。吸光度太高（超出直線範圍）時要稀釋後再測。</p>`;
  const slope = 0.30;   // 每 1 mg/mL 的吸光度
  function draw() {
    const c = st.A / slope;
    $('#brG', el).innerHTML = chart({ w: 560, h: 230, x: [0, 3.5], y: [0, 1.05], xt: [0, 1, 2, 3], yt: [0, 0.5, 1], xlab: '濃度（mg/mL）', ylab: '吸光度 A', label: '檢量線' }, (X, Y) =>
      `<line class="tline" x1="${X(0)}" y1="${Y(0)}" x2="${X(3.5)}" y2="${Y(3.5 * slope)}"/>${[0.5, 1, 1.5, 2, 2.5, 3].map(v => `<circle class="pt" cx="${X(v)}" cy="${Y(v * slope)}" r="4"/>`).join('')}<line class="mk" x1="${X(0)}" x2="${X(c)}" y1="${Y(st.A)}" y2="${Y(st.A)}"/><line class="mk" x1="${X(c)}" x2="${X(c)}" y1="${Y(st.A)}" y2="${Y(0)}"/><circle class="dot" cx="${X(c)}" cy="${Y(st.A)}" r="7"/>`);
    $('#brC', el).innerHTML = `<li>由檢量線：c = A ÷ 斜率 = ${st.A} ÷ ${slope} = ${fx(c, 2)} mg/mL（稀釋後）</li><li>原液濃度 = ${fx(c, 2)} × ${st.dil} = <b>${fx(c * st.dil, 1)} mg/mL</b></li>`;
    $('#brA', el).value = st.A; $('#brAo', el).textContent = fx(st.A, 2); $('#brD', el).value = st.dil; $('#brDo', el).textContent = `${st.dil} 倍`;
  }
  $('#brA', el).oninput = e => { st.A = +e.target.value; draw(); };
  $('#brD', el).oninput = e => { st.dil = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 4. 準確度與精密度 ===== */
const ACC = { ap: ['準確又精密', 50, 50, 4], p: ['精密但不準確（系統誤差）', 72, 34, 4], a: ['準確但不精密（隨機誤差大）', 50, 50, 18], n: ['不準確也不精密', 70, 36, 18] };
W.precision = el => {
  let cur = 'p';
  el.innerHTML = `${seg('prS', Object.entries(ACC).map(([k, v]) => [k, v[0]]), cur)}<div class="mrow"><figure id="prG"></figure></div><div class="cards" id="prK"></div><p class="note" id="prN"></p>`;
  const pts = Array.from({ length: 8 }, (_, i) => [Math.cos(i * 2.4) * (0.4 + (i % 3) * 0.3), Math.sin(i * 2.4) * (0.4 + (i % 3) * 0.3)]);
  function draw() {
    const [, cx, cy, sp] = ACC[cur], P = pts.map(([x, y]) => [cx + x * sp * 1.5, cy + y * sp * 1.5]), mx = P.reduce((a, p) => a + p[0], 0) / P.length, my = P.reduce((a, p) => a + p[1], 0) / P.length;
    $('#prG', el).innerHTML = `<svg class="ch" viewBox="0 0 100 100" role="img" aria-label="準確度與精密度">${[45, 32, 19, 7].map((r, i) => `<circle cx="50" cy="50" r="${r}" class="ring${i % 2}"/>`).join('')}${P.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" class="shot"/>`).join('')}<circle cx="${mx}" cy="${my}" r="3" class="dot"/></svg>`;
    const sd = Math.sqrt(P.reduce((a, p) => a + (p[0] - mx) ** 2 + (p[1] - my) ** 2, 0) / (P.length - 1)), bias = Math.hypot(mx - 50, my - 50);
    $('#prK', el).innerHTML = card('b', '平均值離靶心（準確度）', fx(bias, 1)) + card('s', '數據的分散（精密度）', fx(sd, 1));
    $('#prN', el).innerHTML = `<b>準確度</b>是平均值和真值接近的程度，受<b>系統誤差</b>影響（儀器未校正、試劑不純、方法本身的偏差），重複測量也不會抵消；<b>精密度</b>是重複測量之間的一致程度，受<b>隨機誤差</b>影響，可以用標準偏差表示，增加測量次數可以降低它的影響。內標準法、空白試驗、校正儀器都是為了減少系統誤差。`;
    pressSeg(el, 'prS', cur);
  }
  bindSeg(el, 'prS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};
