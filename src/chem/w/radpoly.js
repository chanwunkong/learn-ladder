/* ---------- 後中化學：自由基反應與聚合物 ---------- */

/* ===== 1. 自由基鹵化的產物比例 =====
   每個 H 的相對反應性（25 °C）：Cl₂ 1° : 2° : 3° = 1 : 3.8 : 5；Br₂ = 1 : 82 : 1600（OpenStax《Organic Chemistry》10.3 節） */
const HALK = {
  prop: ['丙烷', [['1-鹵丙烷', 6, 1], ['2-鹵丙烷', 2, 2]]],
  but: ['丁烷', [['1-鹵丁烷', 6, 1], ['2-鹵丁烷', 4, 2]]],
  ib: ['2-甲基丙烷', [['1-鹵-2-甲基丙烷', 9, 1], ['2-鹵-2-甲基丙烷', 1, 3]]],
  mb: ['2-甲基丁烷', [['1-鹵-2-甲基丁烷', 6, 1], ['2-鹵-2-甲基丁烷', 1, 3], ['2-鹵-3-甲基丁烷', 2, 2], ['1-鹵-3-甲基丁烷', 3, 1]]],
  dmb: ['2,3-二甲基丁烷', [['1-鹵-2,3-二甲基丁烷', 12, 1], ['2-鹵-2,3-二甲基丁烷', 2, 3]]],
  mp: ['2-甲基戊烷', [['1-鹵-2-甲基戊烷', 6, 1], ['2-鹵-2-甲基戊烷', 1, 3], ['3-鹵-2-甲基戊烷', 2, 2], ['2-鹵-4-甲基戊烷', 2, 2], ['1-鹵-4-甲基戊烷', 3, 1]]],
};
const HREL = { Cl: [0, 1, 3.8, 5], Br: [0, 1, 82, 1600] };
W.halog = el => {
  const st = { a: 'dmb', x: 'Cl' };
  el.innerHTML = `${seg('hgA', Object.entries(HALK).map(([k, v]) => [k, v[0]]), st.a)}${seg('hgX', [['Cl', 'Cl₂, 光'], ['Br', 'Br₂, 光']], st.x)}<div id="hgB"></div><p class="small mut">每個 H 的相對反應性：Cl₂ 為 1° : 2° : 3° = 1 : 3.8 : 5；Br₂ 為 1 : 82 : 1600（25 °C，OpenStax《Organic Chemistry》10.3 節）</p><p class="note" id="hgN"></p>`;
  const COL = ['', '#2F3B99', '#B5326C', '#23704A'];
  function draw() {
    const [, P] = HALK[st.a], r = HREL[st.x], w = P.map(([, n, d]) => n * r[d]), T = w.reduce((a, b) => a + b, 0);
    $('#hgB', el).innerHTML = `<div class="bars pk">${P.map(([nm, n, d], i) => `<div><span>${nm.replace(/鹵/g, st.x === 'Cl' ? '氯' : '溴')}</span><i style="width:${Math.max(1, 100 * w[i] / T)}%;background:${COL[d]}"></i><b class="mono">${fx(100 * w[i] / T, 1)}%</b></div>`).join('')}</div>`;
    const big = P.map((p, i) => [p, w[i]]).sort((a, b) => b[1] - a[1])[0][0];
    $('#hgN', el).innerHTML = `產物比例 = (H 的數目 × 每個 H 的反應性) ÷ 總和：${P.map(([, n, d], i) => `${n} × ${r[d]} = ${fx(w[i], 0)}`).join('；')}。共有 <b>${P.length} 種</b>單鹵取代產物（藍：一級 H，紅：二級，綠：三級）。${st.x === 'Cl' ? '氯化選擇性低，H 的數目影響很大，常得到混合物。' : `溴化選擇性很高，幾乎只在最穩定自由基的位置反應，主產物是 ${big[0].replace(/鹵/g, '溴')}。`}`;
    pressSeg(el, 'hgA', st.a); pressSeg(el, 'hgX', st.x);
  }
  bindSeg(el, 'hgA', v => { st.a = v; draw(); });
  bindSeg(el, 'hgX', v => { st.x = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. 連鎖反應：起始、傳遞、終止 ===== */
const RCH = [
  ['起始', ['Cl₂ —(光或熱)→ 2 Cl·'], 'Cl–Cl 鍵最弱（243 kJ/mol），被光均勻斷裂（均裂），每個 Cl 帶走一個電子。過氧化苯甲醯、AIBN 等起始劑受熱也會產生自由基。'],
  ['傳遞 1', ['Cl· + H–CH₃ → H–Cl + ·CH₃'], 'Cl· 拿走烷上的一個 H 原子，留下碳自由基。這一步決定反應在哪個 C–H 上發生：生成越穩定的自由基越快。'],
  ['傳遞 2', ['·CH₃ + Cl–Cl → CH₃–Cl + Cl·'], '碳自由基搶走 Cl₂ 的一個 Cl，生成產物，同時再生 Cl·。Cl· 回到傳遞 1，一個起始自由基可以循環上千次。'],
  ['終止', ['Cl· + Cl· → Cl₂', '·CH₃ + Cl· → CH₃Cl', '·CH₃ + ·CH₃ → CH₃CH₃'], '兩個自由基相遇結合，自由基消失，連鎖停止。乙烷這種副產物證明有 ·CH₃ 生成。'],
];
W.radchain = el => {
  let cur = 1;
  el.innerHTML = `<div id="rcG"></div><p class="eq" id="rcE"></p><p class="note" id="rcN"></p>`;
  function draw() {
    const box = (x, y, t, i) => `<g data-i="${i}" style="cursor:pointer"><rect x="${x - 70}" y="${y - 20}" width="140" height="40" rx="8" style="fill:${i === cur ? 'var(--accent-soft, #dfeee9)' : 'var(--surface)'};stroke:${i === cur ? 'var(--accent)' : 'var(--line)'};stroke-width:2"/><text class="tk" x="${x}" y="${y + 5}" text-anchor="middle" style="font-size:13px;fill:var(--ink)">${t}</text></g>`;
    $('#rcG', el).innerHTML = `<svg class="en" viewBox="0 0 480 220" style="max-width:520px;margin:auto" role="img" aria-label="自由基連鎖反應"><defs><marker id="rca" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--muted)"/></marker></defs>
<path d="M240 70 C 330 70, 350 110, 330 135" style="fill:none;stroke:var(--muted);stroke-width:2" marker-end="url(#rca)"/><path d="M240 165 C 150 165, 130 120, 150 95" style="fill:none;stroke:var(--muted);stroke-width:2" marker-end="url(#rca)"/>
<text class="tk" x="345" y="85">CH₃·</text><text class="tk" x="112" y="152">Cl·</text>
${box(90, 30, '起始：產生 Cl·', 0)}${box(170, 70, '傳遞 1：拿 H', 1)}${box(310, 165, '傳遞 2：拿 Cl', 2)}${box(390, 30, '終止：兩個自由基結合', 3)}</svg>`;
    $('#rcE', el).innerHTML = RCH[cur][1].join('<br>');
    $('#rcN', el).innerHTML = `<b>${RCH[cur][0]}</b>：${RCH[cur][2]}`;
    $$('#rcG [data-i]', el).forEach(g => { g.onclick = () => { cur = +g.dataset.i; draw(); }; });
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 3. 聚合物：單體 → 重複單元 ===== */
const POLYM = {
  pe: ['聚乙烯 PE', 'CH₂=CH₂', '–[CH₂–CH₂]ₙ–', 'add', '自由基（高壓，低密度 LDPE）或齊格勒–納塔觸媒（高密度 HDPE）', '塑膠袋、瓶子'],
  pp: ['聚丙烯 PP', 'CH₂=CH–CH₃', '–[CH₂–CH(CH₃)]ₙ–', 'add', '齊格勒–納塔觸媒（TiCl₄／Al(C₂H₅)₃）得到同排聚丙烯', '容器、纖維'],
  pvc: ['聚氯乙烯 PVC', 'CH₂=CHCl', '–[CH₂–CHCl]ₙ–', 'add', '自由基（過氧化苯甲醯）', '水管'],
  ps: ['聚苯乙烯 PS', 'CH₂=CH–C₆H₅', '–[CH₂–CH(C₆H₅)]ₙ–', 'add', '自由基', '保麗龍'],
  ptfe: ['聚四氟乙烯 PTFE（鐵氟龍）', 'CF₂=CF₂', '–[CF₂–CF₂]ₙ–', 'add', '自由基', 'C–F 鍵極強，抗腐蝕性最好，用於不沾鍋'],
  pmma: ['聚甲基丙烯酸甲酯 PMMA（壓克力、有機玻璃）', 'CH₂=C(CH₃)COOCH₃', '–[CH₂–C(CH₃)(COOCH₃)]ₙ–', 'add', '自由基或陰離子（n-BuLi）', '透明板材'],
  pib: ['聚異丁烯', 'CH₂=C(CH₃)₂', '–[CH₂–C(CH₃)₂]ₙ–', 'add', '陽離子（BF₃ + 微量水）：兩個甲基穩定三級碳陽離子', '丁基橡膠'],
  rub: ['天然橡膠', 'CH₂=C(CH₃)–CH=CH₂（異戊二烯）', '–[CH₂–C(CH₃)=CH–CH₂]ₙ–（順式）', 'add', '生物合成（1,4-加成，雙鍵為順式）', '橡膠；硫化後交聯變硬'],
  nylon: ['尼龍-6,6', 'HOOC(CH₂)₄COOH ＋ H₂N(CH₂)₆NH₂', '–[CO(CH₂)₄CO–NH(CH₂)₆NH]ₙ–', 'cond', '兩種單體各有 6 個碳；形成醯胺鍵並失去 H₂O（實驗室用己二醯氯，加鹼中和 HCl）', '纖維'],
  pet: ['聚對苯二甲酸乙二酯 PET（達克綸）', 'HOOC–C₆H₄–COOH ＋ HOCH₂CH₂OH', '–[CO–C₆H₄–CO–OCH₂CH₂O]ₙ–', 'cond', '酯化，失去 H₂O（工業上用對苯二甲酸二甲酯，失去甲醇）', '寶特瓶、纖維'],
  epoxy: ['環氧樹脂', '雙酚 A ＋ 環氧氯丙烷', '–[O–C₆H₄–C(CH₃)₂–C₆H₄–O–CH₂CH(OH)CH₂]ₙ–', 'cond', '酚氧離子打開環氧環並取代 Cl', '黏著劑'],
  peg: ['聚乙二醇 PEG（Carbowax）', '環氧乙烷', 'HO–[CH₂CH₂O]ₙ–H', 'add', '環氧環開環聚合（酸或鹼催化）', '保濕劑、潤滑劑'],
};
W.poly = el => {
  let cur = 'pp';
  el.innerHTML = `<label class="sel">聚合物 <select id="poS">${Object.entries(POLYM).map(([k, v]) => `<option value="${k}"${k === cur ? ' selected' : ''}>${v[0]}</option>`).join('')}</select></label><div id="poG"></div><div class="cards" id="poK"></div><p class="note" id="poN"></p>`;
  function draw() {
    const [n, m, u, t, how, use] = POLYM[cur];
    $('#poG', el).innerHTML = `<svg class="en" viewBox="0 0 520 130" style="max-width:560px;margin:auto" role="img" aria-label="聚合"><text class="tk" x="10" y="30" style="font-size:12px">單體</text><text x="10" y="58" style="font-size:15px;fill:var(--ink)">${m}</text><text class="tk" x="10" y="92" style="font-size:12px">重複單元${t === 'cond' ? '（每接一次失去一個小分子）' : '（原子全部保留）'}</text><text x="10" y="118" style="font-size:15px;fill:${t === 'cond' ? '#B5326C' : '#2F3B99'}">${u}</text></svg>`;
    $('#poK', el).innerHTML = card('t', '類型', t === 'cond' ? '縮合（逐步成長）' : '加成（連鎖成長）') + card('u', '用途', use);
    $('#poN', el).innerHTML = `<b>${n}</b>：${how}。${t === 'cond' ? '縮合聚合物的單體兩端各有一個官能基（雙官能基），彼此反應時放出 H₂O、HCl 或 CH₃OH 等小分子。' : '加成聚合物由取代乙烯（或開環）單體的 π 鍵逐一打開連接，重複單元的分子式和單體相同。'}`;
  }
  $('#poS', el).onchange = e => { cur = e.target.value; draw(); };
  draw();
  return { set(s) { cur = s.p || cur; $('#poS', el).value = cur; draw(); } };
};

/* ===== 4. 立體規則性：同排、對排、雜排 ===== */
W.tactic = el => {
  let cur = 'iso';
  el.innerHTML = `${seg('taS', [['iso', '同排 isotactic'], ['syn', '對排 syndiotactic'], ['ata', '雜排 atactic']], cur)}<div id="taG"></div><p class="note" id="taN"></p>`;
  const AT = [1, 0, 0, 1, 0, 1, 1, 0];
  function draw() {
    const atoms = {}, bonds = [];
    for (let k = 0; k < 9; k++) { atoms['c' + k] = { x: (k - 4) * 0.87, y: k % 2 ? 0.25 : -0.25, t: '' }; if (k) bonds.push(['c' + (k - 1), 'c' + k, 's']); }
    [1, 3, 5, 7].forEach((k, j) => { const up = cur === 'iso' ? 1 : cur === 'syn' ? (j % 2 ? 0 : 1) : AT[k]; atoms['x' + k] = { x: atoms['c' + k].x, y: 1.25, t: 'Cl' }; bonds.push(['c' + k, 'x' + k, up ? 'w' : 'h']); });
    $('#taG', el).innerHTML = MOL.svg({ atoms, bonds }, { w: 520, h: 170, s: 54, cy: 110, label: '聚氯乙烯的立體規則性' });
    $('#taN', el).innerHTML = { iso: '所有取代基都在主鏈的同一側（都是楔形）。分子規則、容易排列結晶，硬度與熔點較高。齊格勒–納塔觸媒可以做出同排聚丙烯。', syn: '取代基交替出現在主鏈兩側。', ata: '取代基隨機分布在兩側，不容易結晶，通常較軟。自由基聚合多得到雜排。' }[cur] + ' 只有 CH₂=CHX 這類<b>單取代</b>（或兩端不同）的乙烯，主鏈上每隔一個碳才有立體中心，才有這三種排列；CH₂=CH₂、CH₂=CCl₂、Cl₂C=CCl₂ 都沒有。';
    pressSeg(el, 'taS', cur);
  }
  bindSeg(el, 'taS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.t || cur; draw(); } };
};
