/* ---------- 後中化學：羧酸衍生物的補充互動圖 ---------- */

/* ===== 1. 水解會切在哪裡 =====
   [名稱, 醯基部分, 另一半, 醯基產物, 另一半產物, 說明] */
const HYDR = [
  ['乙酸苄酯', 'CH₃CO', 'OCH₂C₆H₅', '乙酸 CH₃COOH', '苄醇 C₆H₅CH₂OH', '醯基來自乙酸，所以水解不會得到苯甲酸。'],
  ['乙酸苯酯', 'CH₃CO', 'OC₆H₅', '乙酸', '苯酚', '苯環接在 O 上，屬於醇（酚）的部分。'],
  ['苯甲酸甲酯', 'C₆H₅CO', 'OCH₃', '苯甲酸', '甲醇', '醯基是苯甲醯基，水解得到苯甲酸。'],
  ['苯甲醯胺', 'C₆H₅CO', 'NH₂', '苯甲酸', 'NH₃（酸中為 NH₄⁺）', '醯胺最穩定，需要強酸或強鹼長時間加熱。'],
  ['阿斯匹靈（乙醯水楊酸）', 'CH₃CO', 'O–C₆H₄–COOH', '乙酸', '水楊酸', '阿斯匹靈受潮會慢慢水解，聞起來有醋味；產生的水楊酸使 FeCl₃ 顯紫色。'],
  ['γ-丁內酯（環狀酯）', 'O=C–CH₂CH₂CH₂', '–O（同一分子）', '4-羥基丁酸（開環）', '—', '內酯水解時環打開，酸與醇在同一個分子上。'],
  ['盤尼西林的 β-內醯胺', 'O=C（四員環）', 'N（同一分子）', '開環的胺基酸', '—', '四員環的醯胺有很大的環張力，而且 N 的孤對電子無法和 C=O 共平面共振，比一般醯胺活潑得多；細菌的轉肽酶就是被它醯化而失去活性。'],
];
W.hydro = el => {
  let cur = 0;
  el.innerHTML = `<label class="sel">化合物 <select id="hyS">${HYDR.map((h, i) => `<option value="${i}">${h[0]}</option>`).join('')}</select></label><div id="hyG"></div><div class="cards" id="hyK"></div><p class="note" id="hyN"></p>`;
  function draw() {
    const [, a, b, pa, pb, why] = HYDR[cur];
    $('#hyG', el).innerHTML = `<svg class="en" viewBox="0 0 460 90" style="max-width:480px;margin:auto" role="img" aria-label="水解切斷位置"><text x="220" y="50" text-anchor="end" style="font-size:20px;fill:var(--c1)">${a}</text><line x1="230" x2="230" y1="15" y2="75" style="stroke:var(--c2);stroke-width:3;stroke-dasharray:5 4"/><text x="240" y="50" style="font-size:20px;fill:var(--c3)">${b}</text><text class="tk" x="230" y="88" text-anchor="middle">H₂O 從這裡切開（醯基–雜原子鍵）</text></svg>`;
    $('#hyK', el).innerHTML = card('a', '醯基 → 羧酸', pa) + card('b', '另一半', pb);
    $('#hyN', el).innerHTML = `${why} 羧酸衍生物水解一定切在<b>羰基碳與 O（或 N、Cl）之間</b>：藍色的醯基部分加上 OH 成為羧酸，綠色部分加上 H 成為醇、酚或胺。容易水解的順序：醯氯 > 酸酐 > 酯 > 醯胺。`;
  }
  $('#hyS', el).onchange = e => { cur = +e.target.value; draw(); };
  draw();
  return { set(s) { cur = s.i ?? cur; $('#hyS', el).value = cur; draw(); } };
};

/* ===== 2. 羧酸怎麼製備：格里納羧化或腈水解 ===== */
const CPREP = {
  bz: ['苯甲酸 C₆H₅COOH', 'C₆H₅Br', 1, 0, '芳基鹵化物不能 SN2，無法用 CN⁻ 取代；只能走格里納（或甲苯側鏈氧化）。'],
  pa: ['苯乙酸 C₆H₅CH₂COOH', 'C₆H₅CH₂Br', 1, 1, '苄基溴是一級、很容易 SN2，兩條路都可以。'],
  pv: ['三甲基乙酸 (CH₃)₃CCOOH', '(CH₃)₃CBr', 1, 0, '三級鹵烷遇 CN⁻ 會 E2 脫去，不能 SN2；格里納可以。'],
  ha: ['5-羥基戊酸', 'HOCH₂CH₂CH₂CH₂Br（類似）', 0, 1, '分子內有 OH，格里納試劑會被質子化破壞；CN⁻ 不受 OH 影響。'],
};
W.cprep = el => {
  let cur = 'bz';
  el.innerHTML = `${seg('cpS', Object.entries(CPREP).map(([k, v]) => [k, v[0]]), cur)}<div class="cards" id="cpK"></div><p class="note" id="cpN"></p>`;
  function draw() {
    const [nm, rx, g, n, why] = CPREP[cur];
    $('#cpK', el).innerHTML = card(g ? 'ok' : 'no', '① Mg ② CO₂ ③ H₃O⁺', g ? '✓ 可行' : '✗ 不行', `${rx} → RMgBr → RCOOH`) + card(n ? 'ok' : 'no', '① NaCN ② H₃O⁺, 加熱', n ? '✓ 可行' : '✗ 不行', `${rx} → RCN → RCOOH`);
    $('#cpN', el).innerHTML = `<b>${nm}</b>：${why} 兩條路都把鹵烷變成多一個碳的羧酸。格里納路線受限於分子中不能有酸性 H；腈路線受限於第一步必須是 SN2（甲基、一級、部分二級）。`;
    pressSeg(el, 'cpS', cur);
  }
  bindSeg(el, 'cpS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.c || cur; draw(); } };
};

/* ===== 3. 分子內反應：內酯與二酸加熱 ===== */
const LACT = [
  ['α-羥基酸（乳酸）', 3, '三員環張力太大，無法形成內酯；兩分子之間酯化成六員環的交酯（lactide），聚合後就是可分解的聚乳酸 PLA。'],
  ['β-羥基酸', 4, '四員環的 β-內酯張力很大，不易形成；加熱時通常脫水成 α,β-不飽和酸。'],
  ['γ-羥基酸', 5, '五員環：在酸中自發形成 γ-內酯，平衡強烈偏向內酯。'],
  ['δ-羥基酸', 6, '六員環：也很容易形成 δ-內酯。'],
  ['丙二酸 HOOC–CH₂–COOH，加熱', 0, '兩個 C=O 夾著同一個碳（β-羰基酸），加熱經六員環過渡狀態脫羧，放出 CO₂ 得到乙酸。丙二酸酯合成就是利用這一步。'],
  ['丁二酸（琥珀酸），加熱', 5, '兩個 COOH 相距適當，失去一分子水形成五員環的丁二酸酐。鄰苯二甲酸加熱也得到環狀酸酐。'],
];
W.lactone = el => {
  let cur = 2;
  el.innerHTML = `${seg('laS', LACT.map((l, i) => [String(i), l[0]]), String(cur))}<div id="laG"></div><p class="note" id="laN"></p>`;
  function draw() {
    const [, n, why] = LACT[cur];
    let s = '';
    if (n) { const R = 55, cx = 230, cy = 80; for (let k = 0; k < n; k++) { const a1 = (-90 + 360 * k / n) * Math.PI / 180, a2 = (-90 + 360 * (k + 1) / n) * Math.PI / 180; s += `<line x1="${cx + R * Math.cos(a1)}" y1="${cy + R * Math.sin(a1)}" x2="${cx + R * Math.cos(a2)}" y2="${cy + R * Math.sin(a2)}" style="stroke:${n <= 4 ? 'var(--c2)' : 'var(--c3)'};stroke-width:3"/>`; } s += `<text class="tk" x="${cx}" y="${cy + 5}" text-anchor="middle">${n} 員環</text>`; }
    else s = `<text x="230" y="80" text-anchor="middle" style="font-size:18px;fill:var(--ink)">HOOC–CH₂–COOH → CH₃COOH + CO₂↑</text>`;
    $('#laG', el).innerHTML = `<svg class="en" viewBox="0 0 460 160" style="max-width:480px;margin:auto" role="img" aria-label="環的大小">${s}</svg>`;
    $('#laN', el).innerHTML = `${why} 規律：分子內反應形成<b>五員或六員環</b>最快，因為鍵角接近理想值、兩端也容易碰到；三、四員環有很大的環張力。`;
    pressSeg(el, 'laS', String(cur));
  }
  bindSeg(el, 'laS', v => { cur = +v; draw(); });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};
