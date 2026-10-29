/* ---------- 後中化學：芳香族的補充互動圖 ---------- */

/* ===== 1. 親電子試劑怎麼產生 ===== */
const EGEN = [
  ['溴化', 'Br₂ + FeBr₃', 'Br₂ + FeBr₃ → Br–Br⁺–FeBr₃⁻（極化的 Br⁺）', 'Br⁺', 'FeBr₃ 是路易斯酸，接受 Br 的孤對電子，使另一個 Br 帶部分正電。Cl₂／FeCl₃ 同理；I₂ 需要氧化劑（CuCl₂）。'],
  ['硝化', 'HNO₃ + H₂SO₄', 'HNO₃ + 2H₂SO₄ → NO₂⁺ + H₃O⁺ + 2HSO₄⁻', 'NO₂⁺（硝醯離子，O=N⁺=O）', '硫酸把硝酸的 OH 質子化，失去水得到直線形的 NO₂⁺。硝基之後可用 Fe／HCl 或 H₂／Pd 還原成 NH₂。'],
  ['磺化', 'SO₃ + H₂SO₄（發煙硫酸）', 'SO₃ + H₂SO₄ ⇌ HSO₃⁺ + HSO₄⁻', 'SO₃ 或 HSO₃⁺', '磺化是<b>可逆</b>的：在稀酸中加熱可把 SO₃H 移除，所以常用來暫時佔住對位。'],
  ['傅–克烷基化', 'RCl + AlCl₃', 'R–Cl + AlCl₃ → R⁺ + AlCl₄⁻', 'R⁺（碳陽離子）', '<b>碳陽離子會重排</b>：(CH₃)₂CHCH₂Cl 得到第三丁基苯，CH₃CH₂CH₂Cl 主要得到異丙基苯。產物比苯更活化，容易多烷基化。乙烯基或芳基鹵化物不能形成碳陽離子，不能使用。'],
  ['傅–克醯基化', 'RCOCl + AlCl₃', 'R–CO–Cl + AlCl₃ → R–C≡O⁺ + AlCl₄⁻', 'RCO⁺（醯基離子，共振穩定）', '醯基離子<b>不會重排</b>，產物的 C=O 鈍化環，只取代一次。之後用 Zn(Hg)／HCl（克萊門森）或 H₂NNH₂／KOH（沃爾夫–基希納）把 C=O 還原成 CH₂，就能接上直鏈烷基。'],
  ['甲醯化（加特曼–科赫）', 'CO + HCl + AlCl₃／CuCl', 'CO + HCl → [HC≡O⁺]', 'HCO⁺', '把 –CHO 直接接到苯環上，產物是苯甲醛。'],
];
W.easgen = el => {
  let cur = 1;
  el.innerHTML = `${seg('egS', EGEN.map((e, i) => [String(i), e[0]]), String(cur))}<p class="eq" id="egE"></p><div class="cards" id="egK"></div><p class="note" id="egN"></p>`;
  function draw() {
    const [n, r, eq, E, why] = EGEN[cur];
    $('#egE', el).innerHTML = eq;
    $('#egK', el).innerHTML = card('r', '試劑', r) + card('e', '真正的親電子試劑', E);
    $('#egN', el).innerHTML = `<b>${n}</b>：${why} 所有反應都接著同樣的兩步：環的 π 電子攻擊 E⁺ 形成 σ 錯合物（慢），再失去 H⁺ 恢復芳香性（快）。`;
    pressSeg(el, 'egS', String(cur));
  }
  bindSeg(el, 'egS', v => { cur = +v; draw(); });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 2. 取代基對速率的影響（log 尺度） =====
   硝化相對速率（苯 = 1）：OpenStax《Organic Chemistry》16.4 節 */
const NRATE = [['酚 C₆H₅OH', 1000, 'a', '強活化（孤對電子共振推電子）', '鄰、對位'], ['甲苯 C₆H₅CH₃', 25, 'a', '弱活化（烷基推電子）', '鄰、對位'], ['苯', 1, 'n', '參考', '—'], ['氯苯 C₆H₅Cl', 0.033, 'h', '弱鈍化（誘導拉電子 > 共振推電子）', '鄰、對位'], ['硝基苯 C₆H₅NO₂', 6e-8, 'd', '強鈍化（共振與誘導都拉電子）', '間位']];
W.easrate = el => {
  let cur = 1;
  el.innerHTML = `<div id="erG"></div><p class="small"><b>歷屆考法</b>：排硝化或溴化速率的順序（酚 > 甲苯 > 苯 > 氯苯 > 硝基苯），不考數值。</p><div class="cards" id="erK"></div><p class="note" id="erN"></p>`;
  const COL = { a: 'var(--c3)', n: 'var(--muted)', h: 'var(--c4)', d: 'var(--c2)' };
  function draw() {
    $('#erG', el).innerHTML = chart({ x: [-8, 3.5], y: [0, NRATE.length], xt: [-8, -6, -4, -2, 0, 2], xlab: 'log（硝化相對速率，苯 = 0）', h: 260, label: '硝化相對速率' }, (X, Y) => NRATE.map(([n, r, k], i) => { const y = Y(NRATE.length - i - 0.5), lr = Math.log10(r); return `<g data-i="${i}" style="cursor:pointer"><rect x="${Math.min(X(0), X(lr))}" y="${y - 12}" width="${Math.max(2, Math.abs(X(lr) - X(0)))}" height="24" style="fill:${COL[k]};opacity:${i === cur ? 1 : 0.55}"/><text class="tk" x="${lr >= 0 ? X(0) - 6 : X(0) + 6}" y="${y + 4}" text-anchor="${lr >= 0 ? 'end' : 'start'}" style="fill:var(--ink)">${n}</text></g>`; }).join('') + `<line x1="${X(0)}" x2="${X(0)}" y1="${Y(0)}" y2="${Y(NRATE.length)}" style="stroke:var(--ink)"/>`);
    const [n, r, , t, pos] = NRATE[cur];
    $('#erK', el).innerHTML = card('r', '相對速率', r < 0.001 ? '6 × 10⁻⁸' : String(r)) + card('t', '類型', t) + card('p', '定位', pos);
    $('#erN', el).innerHTML = `<b>${n}</b>。點選長條比較。推電子基讓環富電子、σ 錯合物較穩定，反應變快；拉電子基相反。三類取代基：<b>活化、鄰對位</b>（–NH₂、–OH、–OR、–NHCOR、烷基）；<b>鈍化、鄰對位</b>（鹵素）；<b>鈍化、間位</b>（–NO₂、–CN、–SO₃H、–CHO、–COR、–COOH、–COOR、–NR₃⁺、–CF₃）。傅–克反應在強鈍化的環（硝基苯）上完全不發生；–NH₂ 會和 AlCl₃ 結合變成強鈍化基，也不能做傅–克反應。`;
    $$('#erG [data-i]', el).forEach(g => { g.onclick = () => { cur = +g.dataset.i; draw(); }; });
  }
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 3. 環上已有兩個取代基：新基團去哪裡 =====
   subs：[環位置 0–5, 標籤, 類型]；best：預測位置；why：理由 */
const MSUB = {
  pnt: ['對硝基甲苯', [[0, 'CH₃', 'a'], [3, 'NO₂', 'd']], [1, 5], 'CH₃ 指向鄰位（1、5），NO₂ 指向它的間位（也是 1、5）：兩者一致。'],
  dcb: ['1,3-二氯苯', [[0, 'Cl', 'h'], [2, 'Cl', 'h']], [3, 5], '4、6 位置對一個 Cl 是鄰位、對另一個是對位；夾在兩個 Cl 中間的 2 號位太擠；5 號位是兩者的間位。所以取代在 4（= 6）號位。'],
  pma: ['4-甲基苯甲醚', [[0, 'OCH₃', 'a'], [3, 'CH₃', 'a']], [1, 5], '兩者方向衝突時，<b>活化力較強的取代基決定位置</b>：OCH₃ 比 CH₃ 強，新基團進入 OCH₃ 的鄰位。'],
  pcp: ['4-氯苯酚', [[0, 'OH', 'a'], [3, 'Cl', 'h']], [1, 5], 'OH 是強活化基，勝過鈍化的 Cl，新基團進入 OH 的鄰位。'],
  ntb: ['間硝基苯甲酸', [[0, 'COOH', 'd'], [2, 'NO₂', 'd']], [4], '兩個都是間位定位基，共同的間位是 5 號位；但環非常鈍化，反應很慢。'],
};
W.multi = el => {
  let cur = 'dcb';
  el.innerHTML = `${seg('muS', Object.entries(MSUB).map(([k, v]) => [k, v[0]]), cur)}<div id="muG"></div><p class="note" id="muN"></p>`;
  function draw() {
    const [, subs, best, why] = MSUB[cur], A = {}, B = [];
    for (let k = 0; k < 6; k++) { const a = (90 - 60 * k) * Math.PI / 180; A['r' + k] = { x: Math.cos(a), y: Math.sin(a), t: '' }; }
    for (let k = 0; k < 6; k++) B.push(['r' + k, 'r' + ((k + 1) % 6), k % 2 ? 's' : 'd']);
    subs.forEach(([k, t]) => { const a = (90 - 60 * k) * Math.PI / 180; A['s' + k] = { x: Math.cos(a) * 2, y: Math.sin(a) * 2, t }; B.push(['r' + k, 's' + k, 's']); });
    best.forEach(k => { const a = (90 - 60 * k) * Math.PI / 180; A['e' + k] = { x: Math.cos(a) * 1.75, y: Math.sin(a) * 1.75, t: 'E', hl: 1, halo: 0.42 }; B.push(['r' + k, 'e' + k, 'p']); });
    $('#muG', el).innerHTML = MOL.svg({ atoms: A, bonds: B }, { w: 420, h: 280, s: 52, label: '新取代基的位置' });
    $('#muN', el).innerHTML = `紅色 E 是新基團最可能進入的位置。${why} 判斷順序：① 先看兩者是否指向同一位置；② 衝突時聽活化力最強的；③ 避開夾在兩個取代基中間（彼此間位）的位置。`;
    pressSeg(el, 'muS', cur);
  }
  bindSeg(el, 'muS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.m || cur; draw(); } };
};

/* ===== 4. 其他芳香族反應 ===== */
const ARX = [
  ['側鏈氧化', 'KMnO₄（或 K₂Cr₂O₇／H⁺）, 加熱', 'C₆H₅CH₂CH₂CH₃ → C₆H₅COOH', '不論側鏈多長，只要苄位碳上有 H，整條側鏈都被氧化成 –COOH。第三丁基苯沒有苄位 H，不反應。'],
  ['苄位溴化', 'NBS, 光或過氧化物', 'C₆H₅CH₂CH₃ → C₆H₅CHBrCH₃', '苄基自由基共振穩定，只取代苄位的 H。'],
  ['硝基還原', 'Fe（或 Sn）／HCl；H₂／Pd', 'C₆H₅NO₂ → C₆H₅NH₂', '間位定位的 NO₂ 變成鄰對位定位的 NH₂，合成時常用來「改變定位」。'],
  ['羰基還原', 'Zn(Hg)／HCl 或 H₂NNH₂／KOH', 'C₆H₅COCH₂CH₃ → C₆H₅CH₂CH₂CH₃', '醯基化後再還原：得到不重排的直鏈烷基，也把間位定位基變成鄰對位定位基。'],
  ['伯奇還原', 'Na 或 Li, NH₃(l), ROH', 'C₆H₆ → 1,4-環己二烯', '苯環被還原成兩個雙鍵不共軛的 1,4-環己二烯。推電子基（OCH₃、烷基）留在雙鍵碳上；拉電子基（COOH）留在 sp³ 碳上。'],
  ['親核芳香取代 SNAr', 'NaOH（或 RO⁻、NH₃）', '對硝基氯苯 → 對硝基酚', 'Nu⁻ 先加到接 Cl 的碳上，形成負電荷的邁森海默錯合物，再失去 Cl⁻。需要<b>鄰或對位的強拉電子基</b>（NO₂）分攤負電荷；間位沒有幫助。'],
  ['苯炔', 'NaOH, 340 °C；或 NaNH₂', 'C₆H₅Cl → C₆H₅OH', '沒有拉電子基時，強鹼先脫去 HCl 生成高活性的苯炔，再加上 Nu。Nu 可能接在原本的碳或旁邊的碳上，標記實驗中會得到兩種產物。'],
  ['重氮鹽：桑德邁爾', 'ArNH₂ + NaNO₂, HCl（0 °C）→ ArN₂⁺；再加 CuCl、CuBr、CuCN', 'ArN₂⁺ → ArCl、ArBr、ArCN', 'N₂ 是極好的離去基。其他取代：H₂O, 加熱 → ArOH；KI → ArI；HBF₄ → ArF；H₃PO₂ → ArH（移除胺基）。'],
  ['偶氮偶合', 'ArN₂⁺ + 苯酚或苯胺', 'Ar–N=N–C₆H₄–OH（偶氮染料）', '重氮離子是弱的親電子試劑，只能進攻強活化的環，進入對位。重氮離子上有拉電子基（NO₂）時正電荷更集中，反應更快。'],
  ['異丙苯法（製酚）', '① O₂（自由基）② H₃O⁺', 'C₆H₅CH(CH₃)₂ → C₆H₅OH + CH₃COCH₃', '異丙苯的苄位 C–H 被 O₂ 自由基氧化成過氧化氫異丙苯，在酸中苯基移位到 O 上，水解成酚和丙酮。工業上同時得到兩種產物。'],
  ['柯爾貝–施密特', '酚氧鈉 + CO₂, 加熱加壓；再加酸', 'C₆H₅ONa → 水楊酸', '產物是羧酸（不是醛），是製造阿斯匹靈的第一步。'],
  ['賴默–蒂曼', '酚 + CHCl₃, NaOH', 'C₆H₅OH → 水楊醛', '經二氯卡賓，在 OH 的鄰位接上 –CHO（產物是醛）。'],
];
W.arside = el => {
  let cur = 0;
  el.innerHTML = `<label class="sel">反應 <select id="axS">${ARX.map((r, i) => `<option value="${i}">${r[0]}</option>`).join('')}</select></label><div class="cards" id="axK"></div><p class="eq" id="axE"></p><p class="note" id="axN"></p>`;
  function draw() {
    const [n, r, eq, why] = ARX[cur];
    $('#axK', el).innerHTML = card('r', '試劑', r);
    $('#axE', el).innerHTML = eq;
    $('#axN', el).innerHTML = `<b>${n}</b>：${why}`;
  }
  $('#axS', el).onchange = e => { cur = +e.target.value; draw(); };
  draw();
  return { set(s) { cur = s.i ?? cur; $('#axS', el).value = cur; draw(); } };
};
