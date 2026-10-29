/* ---------- 後中化學：有機金屬與人名反應 ---------- */

/* ===== 1. 官能基互換地圖 ===== */
const FGN = ['烯', '炔', '鹵烷', '醇', '醛／酮', '羧酸', '酯', '胺', '腈'];
const FGX = [
  [0, 2, 'HBr（馬可尼可夫）；HBr, ROOR（反馬可尼可夫）'], [0, 3, 'H₂O／H⁺；Hg(OAc)₂ 再 NaBH₄；BH₃ 再 H₂O₂／OH⁻'], [0, 4, 'O₃ 再 Zn（臭氧分解）'], [0, 5, 'KMnO₄, 熱（雙鍵斷開）；O₃ 再 H₂O₂'],
  [1, 0, 'H₂／林德拉（順式）；Na／NH₃（反式）'], [1, 4, 'H₂O, H₂SO₄, HgSO₄（甲基酮）；R₂BH 再 H₂O₂（醛）'],
  [2, 0, '強鹼（E2）；t-BuOK（霍夫曼烯）'], [2, 1, '2 當量 NaNH₂（二鹵化物脫去兩次）'], [2, 3, 'OH⁻（SN2）；H₂O（SN1）'], [2, 5, 'Mg 再 CO₂、H₃O⁺（多一個碳）'], [2, 7, 'NH₃（過量）；鄰苯二甲醯亞胺鉀再 H₂NNH₂（蓋布瑞爾）'], [2, 8, 'NaCN（SN2，多一個碳）'],
  [3, 0, '濃 H₂SO₄, 熱（E1）；POCl₃／吡啶'], [3, 2, 'HBr；PBr₃；SOCl₂'], [3, 4, 'PCC、斯沃恩、DMP（一級醇 → 醛）；瓊斯（二級醇 → 酮）'], [3, 5, 'K₂Cr₂O₇／H₂SO₄；KMnO₄（一級醇）'], [3, 6, 'RCOOH／H⁺（費雪酯化）；RCOCl／吡啶'],
  [4, 0, 'Ph₃P=CR₂（維蒂希）'], [4, 3, 'NaBH₄；LiAlH₄；RMgBr（多接碳）'], [4, 5, 'Ag(NH₃)₂⁺；KMnO₄（醛）；I₂／NaOH（甲基酮 → 少一個碳的酸）'], [4, 6, 'mCPBA（拜耳–維利格，酮 → 酯）'], [4, 7, 'RNH₂ 再 NaBH₃CN（還原胺化）'],
  [5, 3, 'LiAlH₄；BH₃'], [5, 6, 'R′OH／H⁺（費雪酯化）'], [5, 2, 'Ag⁺ 鹽 + Br₂（漢斯狄克，少一個碳）'],
  [6, 3, 'LiAlH₄（兩個醇）；2 RMgBr（三級醇）'], [6, 4, 'DIBAL-H, −78 °C（醛）'], [6, 5, 'NaOH, H₂O（皂化）再 H₃O⁺'],
  [7, 0, 'CH₃I（過量）、Ag₂O, 熱（霍夫曼消去）'],
  [8, 5, 'H₃O⁺, 熱（水解）'], [8, 7, 'LiAlH₄（RCH₂NH₂）'], [8, 4, 'RMgBr 再 H₃O⁺（酮）'],
];
W.fgmap = el => {
  const st = { f: 3, t: 4 };
  el.innerHTML = `<div id="fmG"></div><div class="cards" id="fmK"></div><p class="note">列是起始的官能基、欄是產物；有顏色的格子表示一步可以做到。點格子看試劑。多步合成就是在這張圖上找路徑：例如烯 → 醛／酮需要兩步時，可以走「烯 → 醇 → 醛／酮」。</p>`;
  function draw() {
    const n = FGN.length, c = 40, L = 70, T = 66;
    let s = FGN.map((g, i) => `<text class="tk" x="${L - 6}" y="${T + i * c + c / 2 + 4}" text-anchor="end">${g}</text><text class="tk" x="${L + i * c + c / 2}" y="${T - 8}" text-anchor="middle" transform="rotate(-45 ${L + i * c + c / 2} ${T - 8})">${g}</text>`).join('');
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const has = FGX.find(x => x[0] === i && x[1] === j), on = i === st.f && j === st.t;
      s += `<rect data-f="${i}" data-t="${j}" x="${L + j * c + 1}" y="${T + i * c + 1}" width="${c - 2}" height="${c - 2}" rx="4" style="cursor:${has ? 'pointer' : 'default'};fill:${i === j ? 'var(--line)' : has ? (on ? '#B5326C' : '#2F3B99') : 'var(--surface)'};opacity:${has ? (on ? 1 : 0.55) : 1};stroke:var(--line)"/>`;
    }
    $('#fmG', el).innerHTML = `<svg class="en" viewBox="0 0 ${L + n * c + 10} ${T + n * c + 10}" style="max-width:460px;margin:auto" role="img" aria-label="官能基互換">${s}</svg>`;
    const x = FGX.find(x => x[0] === st.f && x[1] === st.t);
    $('#fmK', el).innerHTML = card('f', `${FGN[st.f]} → ${FGN[st.t]}`, x ? x[2] : '沒有常用的一步反應，試著找中間的官能基');
    $$('#fmG rect', el).forEach(r => { r.onclick = () => { if (FGX.find(x => x[0] === +r.dataset.f && x[1] === +r.dataset.t)) { st.f = +r.dataset.f; st.t = +r.dataset.t; draw(); } }; });
  }
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. 有機金屬試劑：誰和誰反應 ===== */
const OMR = { li: ['RLi（有機鋰）', 'RX + 2 Li'], mg: ['RMgX（格里納）', 'RX + Mg, 乙醚'], cu: ['R₂CuLi（吉爾曼）', '2 RLi + CuI'] };
const OME = [['醛、酮', 'li mg', '1,2-加成成醇'], ['酯', 'li mg', '加兩次，得三級醇'], ['醯氯', 'cu', '吉爾曼只加一次，停在酮（格里納會再加一次）'], ['α,β-不飽和酮', 'cu', '吉爾曼 1,4-共軛加成；RLi、RMgX 主要 1,2-加成'], ['環氧化物', 'mg cu', '在較不擠的碳 SN2 開環，多接兩個碳'], ['CO₂', 'li mg', '羧酸（多一個碳）'], ['鹵烷 R′X', 'cu', '偶合成 R–R′（科里–豪斯）'], ['H₂O、ROH、RCOOH、RNH₂', 'li mg cu', '被質子化，試劑失效（R–H）；用 D₂O 可以把 D 接到碳上']];
W.organom = el => {
  let cur = 'mg';
  el.innerHTML = `${seg('omS', Object.entries(OMR).map(([k, v]) => [k, v[0]]), cur)}<p class="small mut" id="omP"></p><div class="cards" id="omK"></div><p class="note">三種試劑的 C–金屬鍵都讓碳帶部分負電。C–Li 最偏離子性、最活潑；銅試劑較「軟」、較溫和，所以能選擇性地做共軛加成和偶合。所有有機金屬試劑都是強鹼，分子內不能有酸性的 H；需要時先用保護基（例如把酮變成縮醛）把會干擾的官能基藏起來。</p>`;
  function draw() {
    $('#omP', el).textContent = `製備：${OMR[cur][1]}`;
    $('#omK', el).innerHTML = OME.map(([e, w, r]) => { const ok = w.split(' ').includes(cur); return card(ok ? 'ok' : 'no', e, ok ? '✓ 反應' : '— 不適合', r); }).join('');
    pressSeg(el, 'omS', cur);
  }
  bindSeg(el, 'omS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.r || cur; draw(); } };
};

/* ===== 3. 人名反應索引 ===== */
const NAMED = [
  ['C–C', '格里納反應', 'RMgX + 醛／酮 → 醇', 'carbonyl'], ['C–C', '維蒂希反應', 'R₂C=O + Ph₃P=CR′₂ → R₂C=CR′₂', 'carbonyl'], ['C–C', '傅–克烷基化／醯基化', 'ArH + RCl（RCOCl）, AlCl₃', 'aromatic'],
  ['C–C', 'Diels–Alder 反應', '共軛二烯 + 親雙烯物 → 環己烯', 'conj'], ['C–C', '醛醇縮合', '兩分子醛 → β-羥基醛 → 烯醛', 'alpha'], ['C–C', '克萊森縮合', '兩分子酯 → β-酮酯', 'alpha'],
  ['C–C', '麥可加成', '烯醇離子 + α,β-不飽和羰基（1,4-加成）', 'alpha'], ['C–C', '羅賓森環化', '麥可加成 + 分子內醛醇縮合', 'alpha'], ['C–C', '鈴木偶合', 'ArB(OH)₂ + Ar′X, Pd → Ar–Ar′', 'rxn'], ['C–C', '赫克反應', 'ArX + 烯, Pd → 芳基取代烯', 'rxn'],
  ['C–C', '西蒙斯–史密斯', '烯 + CH₂I₂, Zn(Cu) → 環丙烷', 'alkene'], ['C–C', '科里–豪斯', 'R₂CuLi + R′X → R–R′', 'rxn'],
  ['氧化', '斯沃恩氧化', '一級醇 → 醛（DMSO, (COCl)₂, Et₃N）', 'alcohol'], ['氧化', '瓊斯氧化', '一級醇 → 酸、二級醇 → 酮', 'alcohol'], ['氧化', '拜耳–維利格', '酮 + 過氧酸 → 酯', 'carbonyl'], ['氧化', '托倫斯試驗', '醛 → 羧酸（銀鏡）', 'carbonyl'], ['氧化', '碘仿反應', '甲基酮 → 少一個碳的酸 + CHI₃', 'alpha'],
  ['還原', '克萊門森還原', 'C=O → CH₂（Zn(Hg), HCl）', 'carbonyl'], ['還原', '沃爾夫–基希納還原', 'C=O → CH₂（H₂NNH₂, KOH）', 'carbonyl'], ['還原', '伯奇還原', '苯 → 1,4-環己二烯', 'aromatic'], ['還原', '羅森蒙德還原', '醯氯 → 醛（H₂, Pd／BaSO₄）', 'acyl'], ['還原', '康尼查羅反應', '無 α-H 的醛 → 醇 + 羧酸（濃 NaOH）', 'carbonyl'],
  ['雜原子', '威廉森醚合成', 'RO⁻ + R′X → ROR′', 'alcohol'], ['雜原子', '費雪酯化', 'RCOOH + R′OH, H⁺ ⇌ 酯', 'acyl'], ['雜原子', '蓋布瑞爾合成', '鄰苯二甲醯亞胺 + RX → 一級胺', 'amine'], ['雜原子', '霍夫曼重排', 'RCONH₂ + Br₂, NaOH → RNH₂（少一個碳）', 'amine'],
  ['雜原子', '桑德邁爾反應', 'ArN₂⁺ + CuX → ArX', 'aromatic'], ['雜原子', '赫爾–佛哈德–澤林斯基', 'RCH₂COOH + Br₂, PBr₃ → α-溴酸', 'alpha'], ['雜原子', '霍夫曼消去', '四級銨鹽 → 取代較少的烯', 'amine'],
  ['重排', '克萊森重排', '烯丙基乙烯基醚 → γ,δ-不飽和羰基', 'conj'], ['重排', '柯普重排', '1,5-二烯 ⇌ 1,5-二烯（[3,3]）', 'conj'], ['重排', '片吶可重排', '1,2-二醇 + H⁺ → 酮（烷基移位）', 'rxn'],
];
W.named = el => {
  let cat = 'C–C';
  const cats = [...new Set(NAMED.map(n => n[0]))];
  el.innerHTML = `${seg('nmS', cats.map(c => [c, { 'C–C': '形成 C–C 鍵', 氧化: '氧化', 還原: '還原', 雜原子: '接上雜原子', 重排: '重排' }[c]]), cat)}<div class="cards" id="nmK"></div><p class="note">點卡片跳到教這個反應的章節。人名反應不必死背名字，先問三件事：起始官能基是什麼、試劑提供親核基還是親電子試劑、產物多了或少了幾個碳。</p>`;
  function draw() {
    $('#nmK', el).innerHTML = NAMED.filter(n => n[0] === cat).map(([, n, r, ch]) => `<a href="#${ch}" style="text-decoration:none;color:inherit">${card('n', n, r)}</a>`).join('');
    pressSeg(el, 'nmS', cat);
  }
  bindSeg(el, 'nmS', v => { cat = v; draw(); });
  draw();
  return { set(s) { cat = s.c || cat; draw(); } };
};
