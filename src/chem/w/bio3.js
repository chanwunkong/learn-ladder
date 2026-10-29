/* ---------- 後中化學：天然物骨架、鹼基結構與生化能量 ---------- */

/* 苯環（左）與右側環的座標：兩環共用 (0, ±0.5) 這條邊 */
const BZL = { a: [0, 0.5], b: [-0.866, 1], c: [-1.732, 0.5], d: [-1.732, -0.5], e: [-0.866, -1], f: [0, -0.5] };
const bzAtoms = () => Object.fromEntries(Object.entries(BZL).map(([k, [x, y]]) => [k, { x, y, t: '' }]));
const BZB = [['a', 'b', 'd'], ['b', 'c', 's'], ['c', 'd', 'd'], ['d', 'e', 's'], ['e', 'f', 'd'], ['f', 'a', 's']];

/* ===== 1. 含氧雜環骨架 ===== */
const SCAF = {
  chromone: ['色酮（chromone）', 'C4 是 C=O，C2=C3 為雙鍵', null],
  flavone: ['黃酮（flavone）', '色酮的 C2 接苯基；類黃酮（如槲皮素）的骨架', 2],
  isoflavone: ['異黃酮（isoflavone）', '苯基接在 C3；大豆異黃酮', 3],
  coumarin: ['香豆素（coumarin）', 'C2 是 C=O（內酯），C3=C4 為雙鍵；有香味，可溶於沸水與有機溶劑', null],
  aurone: ['橙酮（aurone）', '五員環（苯并呋喃酮），C2 以雙鍵接 =CH–苯基；黃色花朵的色素', null],
};
W.scaffold = el => {
  let cur = 'flavone';
  el.innerHTML = `${seg('scS', Object.entries(SCAF).map(([k, v]) => [k, v[0].split('（')[0]]), cur)}<div id="scG"></div><p class="note" id="scN"></p>`;
  function draw() {
    const A = bzAtoms(), B = [...BZB];
    if (cur === 'aurone') {
      Object.assign(A, { o1: { x: 0.95, y: 0.81, t: 'O' }, c2: { x: 1.54, y: 0, t: '' }, c3: { x: 0.95, y: -0.81, t: '' }, ox: { x: 1.3, y: -1.75, t: 'O', hl: 1 }, ch: { x: 2.5, y: 0.2, t: '' }, ph: { x: 3.2, y: -0.4, t: 'Ph' } });
      B.push(['a', 'o1', 's'], ['o1', 'c2', 's'], ['c2', 'c3', 's'], ['c3', 'f', 's'], ['c3', 'ox', 'd'], ['c2', 'ch', 'd'], ['ch', 'ph', 's']);
    } else {
      Object.assign(A, { o1: { x: 0.866, y: 1, t: 'O' }, c2: { x: 1.732, y: 0.5, t: '' }, c3: { x: 1.732, y: -0.5, t: '' }, c4: { x: 0.866, y: -1, t: '' } });
      B.push(['a', 'o1', 's'], ['o1', 'c2', 's'], ['c4', 'f', 's']);
      if (cur === 'coumarin') { A.ox = { x: 2.6, y: 1, t: 'O', hl: 1 }; B.push(['c2', 'ox', 'd'], ['c2', 'c3', 's'], ['c3', 'c4', 'd']); }
      else { A.ox = { x: 0.866, y: -2, t: 'O', hl: 1 }; B.push(['c4', 'ox', 'd'], ['c2', 'c3', 'd'], ['c3', 'c4', 's']); }
      const ph = SCAF[cur][2];
      if (ph === 2) { A.ph = { x: 2.6, y: 1, t: 'Ph' }; B.push(['c2', 'ph', 's']); }
      if (ph === 3) { A.ph = { x: 2.6, y: -1, t: 'Ph' }; B.push(['c3', 'ph', 's']); }
    }
    $('#scG', el).innerHTML = MOL.svg({ atoms: A, bonds: B }, { w: 460, h: 230, s: 52, cx: 200, label: SCAF[cur][0] });
    $('#scN', el).innerHTML = `<b>${SCAF[cur][0]}</b>：${SCAF[cur][1]}。這幾個骨架都是苯環併上一個含 O 的環，差別在 <b>C=O 的位置</b>（C2 是香豆素的內酯、C4 是色酮的酮）、<b>苯基接在哪裡</b>（C2 黃酮、C3 異黃酮），以及右側是六員還是五員環（橙酮）。`;
    pressSeg(el, 'scS', cur);
  }
  bindSeg(el, 'scS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 2. 濫用藥物與天然藥物的結構特徵 ===== */
const DRUG = {
  amph: ['安非他命', 'C₆H₅–CH₂–CH(CH₃)–NH₂', '苯乙胺骨架加一個 α-甲基，一級胺；甲基安非他命的 N 上再多一個甲基。和多巴胺、腎上腺素的骨架相同。'],
  ket: ['K 他命（ketamine）', '環己酮 + 2-氯苯基 + NHCH₃（接在同一個碳上）', '有 Cl、有酮、二級胺、一個掌性中心。'],
  thc: ['大麻酚（THC）', '三環（苯并哌喃）+ 酚 OH + 戊基長鏈', '沒有 N，是萜酚類，脂溶性高。'],
  mor: ['嗎啡', '五環骨架：酚 OH、醇 OH、醚橋、三級胺 N–CH₃、一個 C=C', '兩個 OH 都乙醯化就是海洛因；酚 OH 甲基化是可待因。'],
  coc: ['古柯鹼', '托烷（雙環、N–CH₃）+ 甲酯 CO₂CH₃ + 苯甲酸酯', '有兩個酯基，代謝時水解。'],
  andro: ['穿心蓮內酯', '二萜 + α,β-不飽和 γ-內酯', '內酯旁的 C=C 是<b>麥可受體</b>：蛋白質半胱胺酸的 –SH 進攻 β 碳形成共價鍵，使蛋白質失去活性。'],
};
W.drugs = el => {
  let cur = 'amph';
  el.innerHTML = `${seg('drgS', Object.entries(DRUG).map(([k, v]) => [k, v[0].split('（')[0]]), cur)}<div class="cards" id="drgK"></div><p class="note">辨認藥物結構時，先找最有特色的官能基：有沒有 N（胺的級數）、有沒有 Cl、酯、酚 OH、幾個環。題目常給四個結構要你配對名稱。</p>`;
  function draw() {
    const [n, f, w] = DRUG[cur];
    $('#drgK', el).innerHTML = card('n', n, f) + card('w', '辨認重點', w);
    pressSeg(el, 'drgS', cur);
  }
  bindSeg(el, 'drgS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.d || cur; draw(); } };
};

/* ===== 3. 核酸鹼基的結構 ===== */
W.bases = el => {
  let cur = 'T';
  el.innerHTML = `${seg('bsS', [['A', '腺嘌呤 A'], ['G', '鳥嘌呤 G'], ['C', '胞嘧啶 C'], ['T', '胸腺嘧啶 T'], ['U', '尿嘧啶 U']], cur)}<div id="bsG"></div><p class="note" id="bsN"></p>`;
  function draw() {
    let A, B;
    if ('ACG'.includes(cur) && cur !== 'C') {
      A = { c5: { x: 0, y: 0.5, t: '' }, c6: { x: -0.866, y: 1, t: '' }, n1: { x: -1.732, y: 0.5, t: cur === 'G' ? 'NH' : 'N' }, c2: { x: -1.732, y: -0.5, t: '' }, n3: { x: -0.866, y: -1, t: 'N' }, c4: { x: 0, y: -0.5, t: '' }, n7: { x: 0.95, y: 0.81, t: 'N' }, c8: { x: 1.54, y: 0, t: '' }, n9: { x: 0.95, y: -0.81, t: 'NH' } };
      B = [['c5', 'c6', 's'], ['c2', 'n3', 'd'], ['n3', 'c4', 's'], ['c4', 'c5', 'd'], ['c5', 'n7', 's'], ['n7', 'c8', 'd'], ['c8', 'n9', 's'], ['n9', 'c4', 's']];
      if (cur === 'A') { A.x6 = { x: -0.866, y: 2, t: 'NH₂', hl: 1 }; B.push(['c6', 'x6', 's'], ['c6', 'n1', 'd'], ['n1', 'c2', 's']); }
      else { A.x6 = { x: -0.866, y: 2, t: 'O', hl: 1 }; A.x2 = { x: -2.6, y: -1, t: 'H₂N', hl: 1 }; B.push(['c6', 'x6', 'd'], ['c6', 'n1', 's'], ['n1', 'c2', 's'], ['c2', 'x2', 's']); }
    } else {
      A = { n1: { x: 0, y: -1, t: 'NH' }, c2: { x: -0.866, y: -0.5, t: '' }, n3: { x: -0.866, y: 0.5, t: cur === 'C' ? 'N' : 'NH' }, c4: { x: 0, y: 1, t: '' }, c5: { x: 0.866, y: 0.5, t: '' }, c6: { x: 0.866, y: -0.5, t: '' }, o2: { x: -1.73, y: -1, t: 'O', hl: 1 } };
      B = [['n1', 'c2', 's'], ['c2', 'o2', 'd'], ['c2', 'n3', 's'], ['c5', 'c6', 'd'], ['c6', 'n1', 's']];
      if (cur === 'C') { A.x4 = { x: 0, y: 2, t: 'NH₂', hl: 1 }; B.push(['n3', 'c4', 'd'], ['c4', 'c5', 's'], ['c4', 'x4', 's']); }
      else { A.x4 = { x: 0, y: 2, t: 'O', hl: 1 }; B.push(['n3', 'c4', 's'], ['c4', 'c5', 's'], ['c4', 'x4', 'd']); if (cur === 'T') { A.me = { x: 1.73, y: 1, t: 'CH₃', hl: 1 }; B.push(['c5', 'me', 's']); } }
    }
    $('#bsG', el).innerHTML = MOL.svg({ atoms: A, bonds: B }, { w: 420, h: 250, s: 52, cx: 200, label: '鹼基' });
    $('#bsN', el).innerHTML = { A: '嘌呤（六員環併五員環）＋ C6 上的 NH₂。', G: '嘌呤 ＋ C6 的 C=O ＋ C2 的 NH₂。', C: '嘧啶（單一六員環）＋ C4 的 NH₂、C2 的 C=O。', T: '嘧啶 ＋ C2、C4 兩個 C=O ＋ C5 的甲基。只在 DNA。', U: '和胸腺嘧啶一樣，但 C5 沒有甲基。只在 RNA。' }[cur] + ' 辨認方法：先看是一個環（嘧啶：C、T、U）還是兩個環（嘌呤：A、G），再看 C=O 與 NH₂ 的位置。T 和 U 只差一個 CH₃。';
    pressSeg(el, 'bsS', cur);
  }
  bindSeg(el, 'bsS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.b || cur; draw(); } };
};

/* ===== 4. 磷酸化合物的水解自由能 =====
   ΔG°′（kJ/mol）：Lehninger《Principles of Biochemistry》表 13-6 的約略值 */
const HIP = [['磷酸烯醇丙酮酸 PEP', -61.9], ['1,3-雙磷酸甘油酸', -49.3], ['磷酸肌酸', -43.0], ['乙醯磷酸', -43.0], ['ATP → ADP + Pᵢ', -30.5], ['葡萄糖-1-磷酸', -20.9], ['果糖-6-磷酸', -15.9], ['葡萄糖-6-磷酸', -13.8], ['甘油-3-磷酸', -9.2]];
W.hiP = el => {
  el.innerHTML = `<div class="bars pk">${HIP.map(([n, g]) => `<div><span>${n}</span><i class="${g < -30.5 ? 'ba' : g === -30.5 ? 'bha' : 'bha'}" style="width:${100 * -g / 62}%;${g === -30.5 ? 'background:var(--c2)' : g > -30.5 ? 'opacity:.45' : ''}"></i><b class="mono">${g}</b></div>`).join('')}</div><p class="small mut">水解的 ΔG°′（kJ/mol），Lehninger《Principles of Biochemistry》的約略值</p><p class="note">水解放出的自由能比 ATP 多（長條比 ATP 長）的化合物，可以直接把磷酸轉給 ADP 生成 ATP（受質層次磷酸化）。糖解中做這件事的是 <b>1,3-雙磷酸甘油酸</b>與 <b>PEP</b>；葡萄糖-6-磷酸、果糖-6-磷酸放出的能量不夠。氧化還原反應的自由能則用 ΔG = −nFΔE 計算：每轉移 1 mol 電子、電位差 0.1 V，約 −9.6 kJ。</p>`;
  return { set() {} };
};

/* ===== 5. 20 種胺基酸的側鏈 ===== */
const AA20 = [
  ['np', 'Gly', 'G', '甘胺酸', '–H', '唯一沒有掌性的胺基酸'], ['np', 'Ala', 'A', '丙胺酸', '–CH₃', ''], ['np', 'Val', 'V', '纈胺酸', '–CH(CH₃)₂', '必需'], ['np', 'Leu', 'L', '白胺酸', '–CH₂CH(CH₃)₂', '必需'],
  ['np', 'Ile', 'I', '異白胺酸', '–CH(CH₃)CH₂CH₃', '必需；側鏈也有掌性中心（共 2 個）'], ['np', 'Pro', 'P', '脯胺酸', '–CH₂CH₂CH₂–（接回 N 成環）', '二級胺；茚三酮呈黃色；會打斷 α 螺旋'], ['np', 'Met', 'M', '甲硫胺酸', '–CH₂CH₂SCH₃', '必需；蛋白質合成的起始胺基酸'],
  ['ar', 'Phe', 'F', '苯丙胺酸', '–CH₂C₆H₅', '必需'], ['ar', 'Tyr', 'Y', '酪胺酸', '–CH₂C₆H₄OH（對位酚）', '由苯丙胺酸合成'], ['ar', 'Trp', 'W', '色胺酸', '–CH₂–吲哚（接在吲哚 C3）', '必需；血清素的前驅物'],
  ['po', 'Ser', 'S', '絲胺酸', '–CH₂OH', ''], ['po', 'Thr', 'T', '蘇胺酸', '–CH(OH)CH₃', '必需；側鏈也有掌性中心'], ['po', 'Cys', 'C', '半胱胺酸', '–CH₂SH', '形成雙硫鍵；L-半胱胺酸是 R'], ['po', 'Asn', 'N', '天門冬醯胺', '–CH₂CONH₂', ''], ['po', 'Gln', 'Q', '麩醯胺', '–CH₂CH₂CONH₂', ''],
  ['ac', 'Asp', 'D', '天門冬胺酸', '–CH₂COOH', 'pI 約 2.8'], ['ac', 'Glu', 'E', '麩胺酸', '–CH₂CH₂COOH', 'pI 約 3.2'],
  ['ba', 'Lys', 'K', '離胺酸', '–(CH₂)₄NH₂', '必需；pI 約 9.7'], ['ba', 'Arg', 'R', '精胺酸', '–(CH₂)₃NHC(=NH)NH₂（胍基）', '最鹼，pI 約 10.8'], ['ba', 'His', 'H', '組胺酸', '–CH₂–咪唑', '必需；側鏈 pKa 約 6，可在生理 pH 附近得失質子'],
];
const AAC = { np: '非極性', ar: '芳香族', po: '極性不帶電', ac: '酸性', ba: '鹼性' };
W.aaside = el => {
  const st = { c: 'ar', i: 9 };
  el.innerHTML = `${seg('a2C', Object.entries(AAC), st.c)}<div class="w-row" id="a2L"></div><div class="cards" id="a2K"></div><p class="note">所有胺基酸都是 H₂N–CH(R)–COOH，差別只在側鏈 R。辨認順序：先看 R 有沒有苯環（芳香族）、有沒有 COOH（酸性）或額外的 N（鹼性）、有沒有 OH／SH／醯胺（極性），其餘是非極性。</p>`;
  function draw() {
    const L = AA20.map((a, i) => [a, i]).filter(([a]) => a[0] === st.c);
    if (!L.some(([, i]) => i === st.i)) st.i = L[0][1];
    $('#a2L', el).innerHTML = L.map(([a, i]) => `<button class="btn sm${i === st.i ? ' pri' : ''}" type="button" data-i="${i}">${a[3]} ${a[1]}</button>`).join('');
    $$('#a2L [data-i]', el).forEach(b => { b.onclick = () => { st.i = +b.dataset.i; draw(); }; });
    const [, t3, t1, n, r, w] = AA20[st.i];
    $('#a2K', el).innerHTML = card('n', '名稱', `${n}（${t3}，${t1}）`) + card('r', '側鏈 R', r) + card('w', '特點', w || '—');
    pressSeg(el, 'a2C', st.c);
  }
  bindSeg(el, 'a2C', v => { st.c = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};
