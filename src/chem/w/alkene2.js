/* ---------- 後中化學：烯烴與炔烴的補充互動圖 ---------- */

/* ===== 1. 加成反應：選試劑看產物 =====
   [試劑, 反應名, 接到取代較多碳的基團 X, 接到取代較少碳的基團 Y, 立體（syn／anti／mix／—）, 區域, 中間物, 說明] */
const ADDR = [
  ['HBr', 'HX 加成', 'Br', 'H', 'mix', '馬可尼可夫', '碳陽離子（可能重排）', 'π 電子先抓 H⁺，生成較穩定的碳陽離子，Br⁻ 從平面兩側加上，兩種立體都有。'],
  ['H₂O, H₂SO₄', '酸催化水合', 'OH', 'H', 'mix', '馬可尼可夫', '碳陽離子（可能重排）', '和 HBr 一樣經碳陽離子，加上的是水再失去 H⁺；是 E1 脫水的逆反應。'],
  ['① Hg(OAc)₂, H₂O ② NaBH₄', '羥汞化–脫汞', 'OH', 'H', '—', '馬可尼可夫', '汞鎓離子（三元環，不重排）', '結果和酸催化水合相同（OH 在取代較多的碳），但經過三元環的汞鎓離子，沒有碳陽離子，所以<b>不重排</b>。'],
  ['Br₂', '鹵化', 'Br', 'Br', 'anti', '—', '溴鎓離子', 'Br⁻ 從溴鎓離子的背面打開，兩個 Br 在相反兩側（反式加成）。'],
  ['Br₂, H₂O', '鹵醇', 'OH', 'Br', 'anti', 'OH 在取代較多的碳', '溴鎓離子', '大量的水打開溴鎓離子，攻擊較能承受正電荷的取代較多碳。'],
  ['H₂, Pd／C', '氫化', 'H', 'H', 'syn', '—', '金屬表面', '兩個 H 從金屬表面同一側加上（同側加成）。'],
  ['① BH₃·THF ② H₂O₂, NaOH', '硼氫化–氧化', 'H', 'OH', 'syn', '<b>反馬可尼可夫</b>', '四中心過渡狀態（不重排）', 'B 加到取代較少、較空的碳，H 同時從同一側加到另一碳；B 再被 OH 取代，位置與構型不變。'],
  ['HBr, ROOR', '自由基加成', 'H', 'Br', 'mix', '<b>反馬可尼可夫</b>', '自由基', '過氧化物產生 Br·，Br· 先加到末端，生成較穩定的自由基。只有 HBr 有此效果。'],
  ['OsO₄（或冷稀 KMnO₄）', '雙羥基化', 'OH', 'OH', 'syn', '—', '環狀酯', '兩個 O 同時從同一側接上，得到順式二醇。'],
  ['① mCPBA ② H₃O⁺', '環氧化再開環', 'OH', 'OH', 'anti', '—', '環氧化物', 'mCPBA 先把一個 O 同側加上形成環氧化物；酸性水從背面打開，得到<b>反式</b>二醇，和 OsO₄ 相反。'],
  ['mCPBA', '環氧化', 'epox', '', 'syn', '—', '協同（一步）', '過氧酸把一個 O 原子交給雙鍵，形成三元環醚（環氧化物），原雙鍵上的取代基相對位置保持不變。'],
  ['CH₂I₂, Zn(Cu)', '環丙烷化（Simmons–Smith）', 'cp', '', 'syn', '—', '類卡賓（協同）', 'CH₂ 同時接到雙鍵兩個碳上，生成環丙烷，立體保持。'],
  ['① O₃ ② Zn／CH₃COOH', '臭氧分解', 'oz', '', '—', '—', '臭氧化物', 'C=C 完全斷開，每個雙鍵碳變成 C=O。由產物的羰基位置可反推雙鍵位置。'],
];
W.addmap = el => {
  const st = { i: 6, s: 'ring' };
  el.innerHTML = `${seg('amS', [['prop', '丙烯'], ['ring', '1-甲基環己烯']], st.s)}<label class="sel">試劑 <select id="amR">${ADDR.map((r, i) => `<option value="${i}"${i === st.i ? ' selected' : ''}>${r[0]}（${r[1]}）</option>`).join('')}</select></label><div id="amG"></div><div class="cards" id="amK"></div><p class="note" id="amN"></p>`;
  function ring(r) {
    const [, , X, Y, sto] = r, A = {}, B = [];
    const ang = [150, 90, 30, -30, -90, -150];
    ang.forEach((a, k) => { A['r' + k] = { x: Math.cos(a * Math.PI / 180) * 1.0 - 0.6, y: Math.sin(a * Math.PI / 180) * 1.0, t: '' }; });
    for (let k = 0; k < 6; k++) B.push(['r' + k, 'r' + ((k + 1) % 6), 's']);
    // C1 = r2（右上，接甲基），C2 = r3（右下）
    if (X === 'oz') {
      const z = { c1: [0, 0], c2: [0.87, 0.5], c3: [1.73, 0], c4: [2.6, 0.5], c5: [3.46, 0], c6: [4.33, 0.5], c7: [5.2, 0] }, at = {}, bd = [];
      Object.entries(z).forEach(([k, [x, y]]) => { at[k] = { x: x - 2.6, y, t: '' }; });
      at.o2 = { x: 0.87 - 2.6, y: 1.5, t: 'O' }; at.o7 = { x: 5.2 - 2.6, y: -1, t: 'O' }; at.h7 = { x: 6.07 - 2.6, y: 0.5, t: 'H' };
      ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'].forEach((k, i, a) => { if (i) bd.push([a[i - 1], k, 's']); });
      bd.push(['c2', 'o2', 'd'], ['c7', 'o7', 'd'], ['c7', 'h7', 's']);
      return { atoms: at, bonds: bd, cap: '6-氧代庚醛 CH₃CO(CH₂)₄CHO：環打開成一條鏈，兩端各一個 C=O' };
    }
    A.me = { x: A.r2.x + 0.95, y: A.r2.y + 0.45, t: 'CH₃' }; B.push(['r2', 'me', X === 'epox' || X === 'cp' || sto === 'mix' || sto === '—' ? 's' : 'h']);
    if (X === 'epox' || X === 'cp') { A.b = { x: A.r2.x + 0.75, y: 0, t: X === 'epox' ? 'O' : '' }; B.push(['r2', 'b', 's'], ['r3', 'b', 's']); A.h2 = { x: A.r3.x + 0.95, y: A.r3.y - 0.45, t: 'H' }; B.push(['r3', 'h2', 's']); return { atoms: A, bonds: B, cap: X === 'epox' ? '1-甲基-1,2-環氧環己烷' : '1-甲基雙環[4.1.0]庚烷' }; }
    A.x = { x: A.r2.x + 0.2, y: A.r2.y + 1.05, t: X === 'H' ? 'H' : X }; B.push(['r2', 'x', sto === 'mix' || sto === '—' ? 's' : 'w']);
    A.y = { x: A.r3.x + 0.2, y: A.r3.y - 1.05, t: Y }; B.push(['r3', 'y', sto === 'syn' ? 'w' : sto === 'anti' ? 'h' : 's']);
    return { atoms: A, bonds: B, cap: sto === 'syn' ? '兩個新基團在環的同一側（都是楔形）' : sto === 'anti' ? '兩個新基團在環的兩側（一個楔形、一個虛楔）' : '兩種立體都會生成（不標楔形）' };
  }
  function chain(r) {
    const [, , X, Y] = r, A = { c1: { x: -0.87, y: -0.25, t: '' }, c2: { x: 0, y: 0.25, t: '' }, c3: { x: 0.87, y: -0.25, t: '' } }, B = [['c1', 'c2', 's'], ['c2', 'c3', 's']];
    if (X === 'oz') return { atoms: { a: { x: -1.6, y: 0, t: 'CH₃CHO' }, b: { x: 0.2, y: 0, t: '+' }, c: { x: 1.6, y: 0, t: 'HCHO' } }, bonds: [], cap: '乙醛 + 甲醛' };
    if (X === 'epox' || X === 'cp') { A.b = { x: -0.45, y: 1.0, t: X === 'epox' ? 'O' : '' }; B.push(['c1', 'b', 's'], ['c2', 'b', 's']); return { atoms: A, bonds: B, cap: X === 'epox' ? '1,2-環氧丙烷' : '甲基環丙烷' }; }
    if (X !== 'H') { A.x = { x: 0, y: 1.25, t: X }; B.push(['c2', 'x', 's']); }
    if (Y !== 'H') { A.y = { x: -1.74, y: 0.25, t: Y }; B.push(['c1', 'y', 's']); }
    const nm = { 'Br|H': '2-溴丙烷', 'OH|H': '2-丙醇', 'Br|Br': '1,2-二溴丙烷', 'OH|Br': '1-溴-2-丙醇', 'H|H': '丙烷', 'H|OH': '1-丙醇', 'H|Br': '1-溴丙烷', 'OH|OH': '1,2-丙二醇' }[`${X}|${Y}`];
    return { atoms: A, bonds: B, cap: nm };
  }
  function draw() {
    const r = ADDR[st.i], sc = st.s === 'ring' ? ring(r) : chain(r);
    $('#amG', el).innerHTML = MOL.svg(sc, { w: 480, h: 230, s: 48, label: r[1] }) + `<p class="small mut" style="text-align:center">${sc.cap}</p>`;
    $('#amK', el).innerHTML = card('r', '區域選擇', r[5]) + card('s', '立體', { syn: '同側（syn）', anti: '反式（anti）', mix: '兩面都有', '—': '—' }[r[4]]) + card('i', '中間物', r[6]);
    $('#amN', el).innerHTML = `<b>${r[1]}</b>：${r[7]}`;
    pressSeg(el, 'amS', st.s);
  }
  bindSeg(el, 'amS', v => { st.s = v; draw(); });
  $('#amR', el).onchange = e => { st.i = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); $('#amR', el).value = st.i; draw(); } };
};

/* ===== 2. 炔烴的反應 ===== */
const ALKY = [
  ['H₂（2 當量）, Pd／C', 'alkane', '完全氫化成烷：參鍵加兩次 H₂。'],
  ['H₂, 林德拉觸媒', 'cis', '林德拉觸媒（Pd 毒化）只讓 H₂ 加一次，兩個 H 從表面同側加上，得到<b>順式（Z）烯</b>。'],
  ['Na, NH₃(l)', 'trans', '溶解金屬還原：電子一個一個加上，中間的自由基陰離子讓兩個烷基盡量遠離，得到<b>反式（E）烯</b>。'],
  ['H₂O, H₂SO₄, HgSO₄', 'ketone', '馬可尼可夫水合先得烯醇，烯醇互變成酮。末端炔得到<b>甲基酮</b>。'],
  ['① 二取代硼烷 ② H₂O₂, NaOH', 'aldehyde', '硼氫化（反馬可尼可夫）後烯醇互變，末端炔得到<b>醛</b>。'],
  ['① NaNH₂ ② CH₃CH₂Br', 'alkyl', '末端炔的 H（pKa 25）被 NaNH₂ 拿走，乙炔負離子對一級鹵烷做 SN2，接上新的碳鏈。'],
  ['HBr（2 當量）', 'gem', '兩次馬可尼可夫加成，兩個 Br 都接在內側的碳上（同碳二鹵化物）。'],
];
W.alkyne = el => {
  let cur = 1;
  el.innerHTML = `<p class="small mut">起始物：1-丁炔 HC≡C–CH₂CH₃（還原的例子用 2-丁炔 CH₃C≡CCH₃）</p><label class="sel">試劑 <select id="akR">${ALKY.map((r, i) => `<option value="${i}"${i === cur ? ' selected' : ''}>${r[0]}</option>`).join('')}</select></label><div id="akyG"></div><p class="note" id="akyN"></p>`;
  function draw() {
    const [, k, why] = ALKY[cur];
    let sc, cap;
    if (k === 'cis' || k === 'trans') {
      const t = k === 'trans';
      sc = { atoms: { a: { x: -0.6, y: 0, t: '' }, b: { x: 0.6, y: 0, t: '' }, m1: { x: -1.3, y: 0.85, t: 'CH₃' }, h1: { x: -1.3, y: -0.85, t: 'H' }, m2: { x: 1.3, y: t ? -0.85 : 0.85, t: 'CH₃' }, h2: { x: 1.3, y: t ? 0.85 : -0.85, t: 'H' } }, bonds: [['a', 'b', 'd'], ['a', 'm1', 's'], ['a', 'h1', 's'], ['b', 'm2', 's'], ['b', 'h2', 's']] };
      cap = t ? '(E)-2-丁烯（反式）' : '(Z)-2-丁烯（順式）';
    } else {
      const P = { alkane: ['CH₃CH₂CH₂CH₃', '丁烷'], ketone: ['CH₃–CO–CH₂CH₃', '2-丁酮（甲基酮）'], aldehyde: ['OHC–CH₂CH₂CH₃', '丁醛'], alkyl: ['CH₃CH₂–C≡C–CH₂CH₃', '3-己炔'], gem: ['CH₃–CBr₂–CH₂CH₃', '2,2-二溴丁烷'] }[k];
      sc = { atoms: { a: { x: 0, y: 0, t: P[0] } }, bonds: [] }; cap = P[1];
    }
    $('#akyG', el).innerHTML = MOL.svg(sc, { w: 420, h: 170, s: 50, label: cap }) + `<p class="small mut" style="text-align:center">${cap}</p>`;
    $('#akyN', el).innerHTML = why;
  }
  $('#akR', el).onchange = e => { cur = +e.target.value; draw(); };
  draw();
  return { set(s) { cur = s.i ?? cur; $('#akR', el).value = cur; draw(); } };
};

/* ===== 3. 氫化熱：烯的穩定度 =====
   kJ/mol；OpenStax《Organic Chemistry》（McMurry）表 7.2 */
const HHYD = [['CH₂=CH₂ 乙烯', 137, 0], ['CH₃CH=CH₂ 丙烯', 126, 1], ['cis-2-丁烯', 120, 2], ['(CH₃)₂C=CH₂ 2-甲基丙烯', 119, 2], ['trans-2-丁烯', 116, 2], ['(CH₃)₂C=CHCH₃ 2-甲基-2-丁烯', 113, 3], ['(CH₃)₂C=C(CH₃)₂ 2,3-二甲基-2-丁烯', 111, 4]];
W.hhyd = el => {
  let cur = 2;
  el.innerHTML = `<div class="bars pk" id="hhB"></div><p class="small mut">氫化熱（−ΔH°，kJ/mol），OpenStax《Organic Chemistry》表 7.2。點一列看說明。</p><p class="small"><b>歷屆考法</b>：比較放熱多寡或「何者氫化熱最低」：取代越多、反式、共軛的放熱越少。數字不必背。</p><p class="note" id="hhN"></p>`;
  function draw() {
    $('#hhB', el).innerHTML = HHYD.map(([n, v], i) => `<div class="${i === cur ? 'on' : ''}" data-i="${i}" role="button"><span>${n}</span><i class="ba" style="width:${(v - 100) * 2.4}%"></i><b class="mono">${v}</b></div>`).join('');
    $$('#hhB [data-i]', el).forEach(d => { d.onclick = () => { cur = +d.dataset.i; draw(); }; });
    const [n, v, k] = HHYD[cur];
    $('#hhN', el).innerHTML = `<b>${n}</b>：雙鍵上有 ${k} 個烷基，氫化放熱 ${v} kJ/mol。氫化產物相同時，<b>放熱越少表示烯本身越穩定</b>。規律：雙鍵上的烷基越多越穩定（超共軛）；反式比順式穩定約 4 kJ/mol（順式兩個烷基擠在同側）。所以加熱脫去時，生成取代多、反式的烯（查依采夫產物）。`;
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};
