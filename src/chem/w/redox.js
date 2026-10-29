/* ---------- 後中化學：氧化數、平衡氧化還原、E° 階梯 ---------- */

/* ===== 1. 氧化數：總和等於電荷 =====
   [化學式, 電荷, [[元素, 個數, 氧化數, 依據]]] */
const OXN = [
  ['K₂Cr₂O₇', 0, [['K', 2, 1, '第 1 族'], ['O', 7, -2, '氧'], ['Cr', 2, 6, '補平']]],
  ['HClO₄', 0, [['H', 1, 1, '氫'], ['O', 4, -2, '氧'], ['Cl', 1, 7, '補平']]],
  ['MnO₄⁻', -1, [['O', 4, -2, '氧'], ['Mn', 1, 7, '補平']]],
  ['N₂H₄', 0, [['H', 4, 1, '氫'], ['N', 2, -2, '補平']]],
  ['NH₂OH', 0, [['H', 3, 1, '氫'], ['O', 1, -2, '氧'], ['N', 1, -1, '補平']]],
  ['N₂O₃', 0, [['O', 3, -2, '氧'], ['N', 2, 3, '補平']]],
  ['H₂O₂', 0, [['H', 2, 1, '氫'], ['O', 2, -1, '過氧化物例外']]],
  ['NaH', 0, [['Na', 1, 1, '第 1 族'], ['H', 1, -1, '金屬氫化物例外']]],
  ['CH₃OH', 0, [['H', 4, 1, '氫'], ['O', 1, -2, '氧'], ['C', 1, -2, '補平']]],
  ['HCOOH', 0, [['H', 2, 1, '氫'], ['O', 2, -2, '氧'], ['C', 1, 2, '補平']]],
  ['CH₃CH=CHCOOH', 0, [['H', 6, 1, '氫'], ['O', 2, -2, '氧'], ['C', 4, -0.5, '四個 C 的平均（總和 −2）']]],
];
W.oxnum = el => {
  let cur = 0;
  el.innerHTML = `${seg('oxS', OXN.map((v, i) => [String(i), v[0]]), '0')}<div id="oxG"></div><p class="eq" id="oxF"></p><p class="note" id="oxN"></p>`;
  function draw() {
    const [f, q, at] = OXN[cur];
    $('#oxG', el).innerHTML = chart({ w: 560, h: 120, x: [-4.5, 7.5], y: [0, 1], xt: [-4, -2, 0, 2, 4, 6], yt: [], xlab: '氧化數', label: '氧化數' }, (X, Y) =>
      at.map(([e, n, o], i) => `<circle class="dot" cx="${X(o)}" cy="${Y(0.35 + 0.22 * (i % 3))}" r="7"/><text class="tk hl" x="${X(o)}" y="${Y(0.35 + 0.22 * (i % 3)) - 11}" text-anchor="middle">${e} ${o > 0 ? '+' : ''}${fx(o, o % 1 ? 1 : 0)}</text>`).join(''));
    $('#oxF', el).innerHTML = `${at.map(([e, n, o]) => `${n} × (${o > 0 ? '+' : ''}${fx(o, o % 1 ? 1 : 0)})`).join(' + ')} = ${q}　（${at.map(([e, , , w]) => `${e}：${w}`).join('；')}）`;
    $('#oxN', el).innerHTML = `規則的優先順序：元素態為 0；第 1 族 +1、第 2 族 +2；F 為 −1；H 通常 +1（金屬氫化物中 −1）；O 通常 −2（過氧化物 −1）；最後用「總和 = 粒子的電荷」補出其餘的原子。有機分子中各個碳的氧化數不同，總和仍由同樣的方法求出。`;
    pressSeg(el, 'oxS', String(cur));
  }
  bindSeg(el, 'oxS', v => { cur = +v; draw(); });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 2. 半反應法平衡 ===== */
const BAL = {
  mno4: ['MnO₄⁻ + H₂C₂O₄（酸性）', [
    ['寫出兩個半反應', 'MnO₄⁻ → Mn²⁺　；　H₂C₂O₄ → CO₂'],
    ['平衡 O（加 H₂O）與 H（加 H⁺）', 'MnO₄⁻ + 8H⁺ → Mn²⁺ + 4H₂O　；　H₂C₂O₄ → 2CO₂ + 2H⁺'],
    ['加電子平衡電荷', 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O　；　H₂C₂O₄ → 2CO₂ + 2H⁺ + 2e⁻'],
    ['電子數取最小公倍數 10：前式 ×2、後式 ×5', '2MnO₄⁻ + 16H⁺ + 10e⁻ → 2Mn²⁺ + 8H₂O　；　5H₂C₂O₄ → 10CO₂ + 10H⁺ + 10e⁻'],
    ['相加、消去', '2MnO₄⁻ + 5H₂C₂O₄ + 6H⁺ → 2Mn²⁺ + 10CO₂ + 8H₂O']], '轉移 10 個電子；係數總和 2 + 5 + 6 + 2 + 10 + 8 = 33。'],
  cr: ['Cr₂O₇²⁻ + Cl⁻（酸性）', [
    ['寫出兩個半反應', 'Cr₂O₇²⁻ → Cr³⁺　；　Cl⁻ → Cl₂'],
    ['平衡原子', 'Cr₂O₇²⁻ + 14H⁺ → 2Cr³⁺ + 7H₂O　；　2Cl⁻ → Cl₂'],
    ['加電子', 'Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O　；　2Cl⁻ → Cl₂ + 2e⁻'],
    ['後式 ×3', '6Cl⁻ → 3Cl₂ + 6e⁻'],
    ['相加', 'Cr₂O₇²⁻ + 6Cl⁻ + 14H⁺ → 2Cr³⁺ + 3Cl₂ + 7H₂O']], '轉移 6 個電子。寫成分子式 K₂Cr₂O₇ + 14HCl → 2KCl + 2CrCl₃ + 3Cl₂ + 7H₂O 時，HCl 一部分當還原劑、一部分只提供 Cl⁻。'],
  so3: ['MnO₄⁻ + SO₃²⁻（酸性）', [
    ['寫出兩個半反應', 'MnO₄⁻ → Mn²⁺　；　SO₃²⁻ → SO₄²⁻'],
    ['平衡原子', 'MnO₄⁻ + 8H⁺ → Mn²⁺ + 4H₂O　；　SO₃²⁻ + H₂O → SO₄²⁻ + 2H⁺'],
    ['加電子', 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O　；　SO₃²⁻ + H₂O → SO₄²⁻ + 2H⁺ + 2e⁻'],
    ['前式 ×2、後式 ×5', '共轉移 10 個電子'],
    ['相加、消去', '2MnO₄⁻ + 5SO₃²⁻ + 6H⁺ → 2Mn²⁺ + 5SO₄²⁻ + 3H₂O']], '轉移 10 個電子。'],
  al: ['Al + OH⁻（鹼性）', [
    ['寫出兩個半反應', 'Al → Al(OH)₄⁻　；　H₂O → H₂'],
    ['先當作酸性平衡', 'Al + 4H₂O → Al(OH)₄⁻ + 4H⁺ + 3e⁻　；　2H⁺ + 2e⁻ → H₂'],
    ['前式 ×2、後式 ×3，相加', '2Al + 8H₂O → 2Al(OH)₄⁻ + 2H⁺ + 3H₂'],
    ['兩邊各加 2OH⁻，把 H⁺ 變成 H₂O', '2Al + 8H₂O + 2OH⁻ → 2Al(OH)₄⁻ + 2H₂O + 3H₂'],
    ['消去兩邊的水', '2Al + 2OH⁻ + 6H₂O → 2Al(OH)₄⁻ + 3H₂']], '鹼性溶液中先照酸性平衡，最後加 OH⁻ 中和 H⁺。係數總和 2 + 2 + 6 + 2 + 3 = 15。'],
};
W.balance = el => {
  const st = { r: 'mno4', k: 4 };
  el.innerHTML = `${seg('blS2', Object.entries(BAL).map(([k, v]) => [k, v[0]]), st.r)}<div class="w-row"><button class="btn sm" type="button" data-d="-1">‹ 上一步</button><button class="btn sm pri" type="button" data-d="1">下一步 ›</button><span class="mono small mut" id="blP"></span></div><ol class="cs bal" id="blL"></ol><p class="note" id="blN"></p>`;
  function draw() {
    const [, steps, note] = BAL[st.r]; st.k = clamp(st.k, 0, steps.length - 1);
    $('#blL', el).innerHTML = steps.slice(0, st.k + 1).map(([t, e], i) => `<li class="${i === st.k ? 'on' : ''}"><b>${t}</b><br>${e}</li>`).join('');
    $('#blP', el).textContent = `${st.k + 1} / ${steps.length}`;
    $('#blN', el).innerHTML = st.k === steps.length - 1 ? note : '半反應法：分開平衡氧化與還原兩半，讓兩邊的電子數相同後相加。';
    $('[data-d="-1"]', el).disabled = st.k === 0; $('[data-d="1"]', el).disabled = st.k === steps.length - 1; pressSeg(el, 'blS2', st.r);
  }
  bindSeg(el, 'blS2', v => { st.r = v; st.k = 0; draw(); });
  $$('[data-d]', el).forEach(b => { b.onclick = () => { st.k += +b.dataset.d; draw(); }; });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. E° 階梯：誰能氧化誰 =====
   標準還原電位（V，25 °C，教科書常用值） */
const ELAD = [['F₂', 'F⁻', 2.87], ['MnO₄⁻', 'Mn²⁺', 1.51], ['Au³⁺', 'Au', 1.50], ['Cl₂', 'Cl⁻', 1.36], ['Cr₂O₇²⁻', 'Cr³⁺', 1.33], ['MnO₂', 'Mn²⁺', 1.23], ['Br₂', 'Br⁻', 1.07], ['Ag⁺', 'Ag', 0.80], ['Fe³⁺', 'Fe²⁺', 0.77], ['I₂', 'I⁻', 0.54], ['Cu²⁺', 'Cu', 0.34], ['Sn⁴⁺', 'Sn²⁺', 0.15], ['H⁺', 'H₂', 0.00], ['Pb²⁺', 'Pb', -0.13], ['Ni²⁺', 'Ni', -0.23], ['Cd²⁺', 'Cd', -0.40], ['Fe²⁺', 'Fe', -0.44], ['Cr³⁺', 'Cr', -0.74], ['Zn²⁺', 'Zn', -0.76], ['H₂O', 'H₂ + OH⁻', -0.83], ['Al³⁺', 'Al', -1.66], ['Mg²⁺', 'Mg', -2.37], ['Na⁺', 'Na', -2.71], ['Ba²⁺', 'Ba', -2.91]];
W.eladder = el => {
  const st = { o: 3, r: 18 };
  el.innerHTML = `<p class="small mut">先點左欄選一個氧化劑，再點右欄選一個還原劑。</p><div id="elG"></div><div class="cards" id="elK"></div><p class="note" id="elN"></p>`;
  function draw() {
    const Y = i => 24 + i * 17;
    let s = `<text class="tk" x="150" y="16" text-anchor="end">氧化劑（越上越強）</text><text class="tk" x="250" y="16">還原劑（越下越強）</text>`;
    ELAD.forEach(([ox, rd, e], i) => { s += `<g class="klr${i === st.o ? ' on' : ''}" data-o="${i}" role="button"><text class="tk" x="150" y="${Y(i) + 12}" text-anchor="end">${ox}</text></g><text class="tk sm" x="200" y="${Y(i) + 12}" text-anchor="middle">${e > 0 ? '+' : ''}${e.toFixed(2)}</text><g class="klr${i === st.r ? ' on' : ''}" data-r="${i}" role="button"><text class="tk" x="250" y="${Y(i) + 12}">${rd}</text></g>`; });
    $('#elG', el).innerHTML = `<svg class="ch" style="max-width:420px;margin:auto" viewBox="20 0 360 ${Y(ELAD.length) + 6}" role="img" aria-label="標準還原電位">${s}</svg>`;
    const O = ELAD[st.o], R = ELAD[st.r], E = O[2] - R[2];
    $('#elK', el).innerHTML = card('o', '氧化劑', `${O[0]}（${O[2]} V）`) + card('r', '還原劑', `${R[1]}（${R[2]} V）`) + card('e', 'E° = E°(還原) − E°(氧化)', `${fx(E, 2)} V`, E > 0 ? '自發' : '不自發');
    $('#elN', el).innerHTML = `${E > 0 ? `<b>會反應</b>：${O[0]} 的半反應在 ${R[1]} 的上方，E° &gt; 0。` : `<b>不會反應</b>：${O[0]} 的半反應在 ${R[1]} 的下方（或同一列），E° ≤ 0。`} 左欄上方的氧化劑可以氧化右欄<b>下方</b>的還原劑。E° 是強度性質：方程式係數加倍，E° 不變（ΔG° 才加倍）。鹼性溶液中，E° 比 −0.83 V 更負的金屬（Mg、Ba、Na）能把水還原成 H₂；Cd（−0.40 V）不行。`;
    $$('[data-o]', el).forEach(g => { g.onclick = () => { st.o = +g.dataset.o; draw(); }; });
    $$('[data-r]', el).forEach(g => { g.onclick = () => { st.r = +g.dataset.r; draw(); }; });
  }
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};
