/* ---------- 後中化學：立體化學與構形的互動圖 ----------
   掌性中心以四面體的四個位置表示：上（紙面）、右（紙面）、楔形（朝向讀者）、虛楔（遠離讀者）。
   構型一律由三維向量計算：優先順序 1、2、3 的向量 v1·(v2 × v3) < 0 為 R，> 0 為 S（不靠記憶規則，避免畫錯）。 */
const TET = { up: [0, 1, 0], right: [0.94, -0.33, 0], wedge: [-0.47, -0.33, 0.82], dash: [-0.47, -0.33, -0.82] };
const POS2 = { up: [0, 1.1], right: [1.0, -0.38], wedge: [-0.85, -0.52], dash: [-0.22, -1.02] };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const chir = (v1, v2, v3) => (dot3(v1, cross(v2, v3)) < 0 ? 'R' : 'S');
// slots：{ 位置: 基團索引 }；pri：各基團優先順序（1 最高）
function centerScene(labels, slots, mirror = false, hl = {}) {
  const atoms = { C: { x: 0, y: 0, t: 'C' } }, bonds = [];
  for (const [pos, gi] of Object.entries(slots)) {
    const [x, y] = POS2[pos], id = 'g' + gi; atoms[id] = { x: mirror ? -x : x, y, t: labels[gi], hl: hl[gi] ? 1 : 0 };
    bonds.push(['C', id, pos === 'wedge' ? 'w' : pos === 'dash' ? 'h' : 's']);
  }
  return { atoms, bonds };
}

/* ===== 1. 掌性：鏡像能不能疊合 ===== */
W.chiral = el => {
  const SETS = {
    butanol: { n: '2-丁醇', g: ['OH', 'H', 'CH₃', 'C₂H₅'] },
    propanol: { n: '2-丙醇', g: ['OH', 'H', 'CH₃', 'CH₃'] },
    ala: { n: '丙胺酸', g: ['NH₂', 'H', 'CH₃', 'COOH'] },
    gly: { n: '甘胺酸', g: ['NH₂', 'COOH', 'H', 'H'] },
  };
  let cur = 'butanol', rot = false;
  el.innerHTML = `${seg('chS', Object.entries(SETS).map(([k, v]) => [k, v.n]), cur)}<div class="mirror"><div id="chA"></div><div class="mline"></div><div id="chB"></div></div><div class="w-row"><button class="btn sm" type="button" id="chR">把鏡像繞直立軸轉 180°，疊到原分子上</button></div><p class="note" id="chN"></p>`;
  function draw() {
    const g = SETS[cur].g, slots = { up: 0, right: 1, wedge: 2, dash: 3 }, chiralMol = new Set(g).size === 4;
    $('#chA', el).innerHTML = MOL.svg(centerScene(g, slots), { w: 230, h: 190, s: 52, label: '原分子' }) + '<p class="small mut c">原分子</p>';
    // 鏡像：x → −x；再繞直立軸轉 180°：x → −x、z → −z，結果等於原位置但楔形與虛楔互換
    const rs = { up: 0, right: 1, wedge: 3, dash: 2 }, diff = rot && g[2] !== g[3] ? { 2: 1, 3: 1 } : {};
    $('#chB', el).innerHTML = MOL.svg(rot ? centerScene(g, rs, false, diff) : centerScene(g, slots, true), { w: 230, h: 190, s: 52, label: '鏡像' }) + `<p class="small mut c">${rot ? '鏡像轉 180° 後' : '鏡像'}</p>`;
    $('#chN', el).innerHTML = !rot ? `${SETS[cur].n}的中心碳連著 ${g.join('、')}。按按鈕把鏡像轉過來，看能不能和原分子完全重疊。`
      : chiralMol ? `<span class="bad">疊不起來</span>：上和右對上了，但楔形和虛楔上的 ${g[2]}、${g[3]} 剛好相反（紅色）。不管怎麼轉都無法重疊，所以這是<b>掌性分子</b>，它和鏡像是一對<b>鏡像異構物</b>。關鍵：中心碳連著<b>四個不同</b>的基團。`
        : `<span class="ok">完全重疊</span>：楔形和虛楔上都是 ${g[2]}，互換之後一模一樣。中心碳有兩個相同的基團，分子有一個鏡面，所以<b>不是掌性分子</b>。`;
    pressSeg(el, 'chS', cur); $('#chR', el).textContent = rot ? '回到鏡像' : '把鏡像繞直立軸轉 180°，疊到原分子上';
  }
  bindSeg(el, 'chS', v => { cur = v; rot = false; draw(); });
  $('#chR', el).onclick = () => { rot = !rot; draw(); };
  draw();
  return { set(s) { if (s.set) cur = s.set; rot = !!s.rot; draw(); } };
};

/* ===== 2. R/S 命名：一步一步 ===== */
const RSMOL = {
  brbut: { n: '2-溴丁烷', g: ['Br', 'C₂H₅', 'CH₃', 'H'], why: 'Br 的原子序 35 最大。C₂H₅ 和 CH₃ 第一個原子都是 C，往下一層比：C₂H₅ 的碳連著 (C, H, H)，CH₃ 連著 (H, H, H)，C 勝，所以 C₂H₅ 優先。' },
  but: { n: '2-丁醇', g: ['OH', 'C₂H₅', 'CH₃', 'H'], why: 'O（8）> C（6）> H（1）。兩個碳基團往下一層比：C₂H₅ 的碳連著 (C, H, H)，勝過 CH₃ 的 (H, H, H)。' },
  ala: { n: '丙胺酸', g: ['NH₂', 'COOH', 'CH₃', 'H'], why: 'N（7）最大。COOH 和 CH₃ 都是 C 開頭，往下一層：COOH 的碳連著 (O, O, O)（C=O 雙鍵的 O 算兩次），CH₃ 是 (H, H, H)，COOH 優先。' },
  gla: { n: '甘油醛', g: ['OH', 'CHO', 'CH₂OH', 'H'], why: 'OH 的 O 最大。CHO 的碳連著 (O, O, H)，CH₂OH 的碳連著 (O, H, H)；第一個 O 相同，第二個 O > H，所以 CHO 優先。' },
};
W.rs = el => {
  let cur = 'but', slots = { up: 0, right: 1, wedge: 2, dash: 3 }, step = 0;
  el.innerHTML = `${seg('rsS', Object.entries(RSMOL).map(([k, v]) => [k, v.n]), cur)}<div class="rsgrid"><div id="rsM"></div><ol class="rsteps" id="rsT"></ol></div>
<div class="w-row"><button class="btn sm" type="button" data-sw="wedge,dash">交換楔形與虛楔</button><button class="btn sm" type="button" data-sw="up,right">交換上與右</button><button class="btn sm" type="button" data-sw="up,dash">交換上與虛楔</button><span class="sp"></span><button class="btn sm" type="button" id="rsB">‹ 上一步</button><button class="btn sm pri" type="button" id="rsN">下一步 ›</button></div>`;
  function draw() {
    const m = RSMOL[cur], g = m.g, posOf = gi => Object.keys(slots).find(p => slots[p] === gi);
    const v = [0, 1, 2].map(i => TET[posOf(i)]), truth = chir(...v), low = posOf(3);
    const sc = centerScene(g, slots);
    if (step >= 1) [0, 1, 2, 3].forEach(i => { const p = POS2[posOf(i)]; sc.notes = (sc.notes || []).concat({ x: p[0] * 1.55, y: p[1] * 1.55 - 0.12, t: String(i + 1), cls: 'pri' }); });
    let arc = '', vis = '';
    if (step >= 3) {
      const P = [0, 1, 2].map(i => POS2[posOf(i)]), area = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]);
      vis = area < 0 ? '順時針' : '逆時針';
      const S = 56, cx = 130, cy = 115, Q = P.map(([x, y]) => [cx + x * S * 0.72, cy - y * S * 0.72]);
      arc = `<path class="arr" d="M${Q[0][0]} ${Q[0][1]}Q${(Q[0][0] + Q[1][0]) / 2 + (Q[0][0] + Q[1][0] - 2 * cx) * 0.5} ${(Q[0][1] + Q[1][1]) / 2 + (Q[0][1] + Q[1][1] - 2 * cy) * 0.5} ${Q[1][0]} ${Q[1][1]}Q${(Q[1][0] + Q[2][0]) / 2 + (Q[1][0] + Q[2][0] - 2 * cx) * 0.5} ${(Q[1][1] + Q[2][1]) / 2 + (Q[1][1] + Q[2][1] - 2 * cy) * 0.5} ${Q[2][0]} ${Q[2][1]}" marker-end="url(#ah)"/>`;
    }
    $('#rsM', el).innerHTML = MOL.svg(sc, { w: 260, h: 230, s: 56, cx: 130, cy: 115, label: m.n }).replace('</svg>', arc + '</svg>');
    const where = low === 'dash' ? '最低優先的 H 在<b>虛楔</b>（遠離你）：直接看 1 → 2 → 3 的方向。' : low === 'wedge' ? '最低優先的 H 在<b>楔形</b>（朝向你）：看到的方向要<b>反過來</b>判斷。' : '最低優先的 H 在<b>紙面</b>上：先把它和虛楔上的基團互換（互換一次構型就反轉），判斷完再把答案反過來。';
    const visR = vis === '順時針' ? 'R' : 'S', ans = low === 'dash' ? visR : low === 'wedge' ? (visR === 'R' ? 'S' : 'R') : null;
    const S = [`<b>排優先順序</b>（看直接相連的原子，原子序大的優先；相同就往下一層比）：${m.why}`, where,
      step >= 3 ? `1 → 2 → 3 看起來是<b>${vis}</b>${low === 'dash' ? `，所以是 <b>${visR}</b>（順時針 = R，逆時針 = S）。` : low === 'wedge' ? `；H 朝向你，反過來，所以是 <b>${ans}</b>。` : '；因為 H 在紙面上，用上面的互換法再判斷一次。'}` : '畫出 1 → 2 → 3 的方向。',
      `答案：<b>(${truth})-${m.n}</b>。試試「交換」按鈕：任意交換兩個基團，構型就會反轉。`];
    $('#rsT', el).innerHTML = S.slice(0, step + 1).map(x => `<li>${x}</li>`).join('');
    $('#rsB', el).disabled = step === 0; $('#rsN', el).disabled = step >= 3; pressSeg(el, 'rsS', cur);
  }
  bindSeg(el, 'rsS', v => { cur = v; slots = { up: 0, right: 1, wedge: 2, dash: 3 }; step = 0; draw(); });
  $$('[data-sw]', el).forEach(b => { b.onclick = () => { const [p, q] = b.dataset.sw.split(','); [slots[p], slots[q]] = [slots[q], slots[p]]; draw(); }; });
  $('#rsN', el).onclick = () => { step = Math.min(3, step + 1); draw(); };
  $('#rsB', el).onclick = () => { step = Math.max(0, step - 1); draw(); };
  draw();
  return { set(s) { if (s.mol) { cur = s.mol; slots = { up: 0, right: 1, wedge: 2, dash: 3 }; } if (s.swap) { const [p, q] = s.swap.split(','); [slots[p], slots[q]] = [slots[q], slots[p]]; } step = s.step ?? 3; draw(); } };
};

/* ===== 3. 兩個掌性中心：費雪投影、非鏡像異構物、內消旋 ===== */
const FISH = {
  tart: { n: '酒石酸', top: 'COOH', bot: 'COOH', x: ['OH', 'OH'], sym: true,
    // 各中心的優先順序：[水平基團 X, 上方, 下方]（H 為 4）
    pri: [{ X: 1, up: 2, down: 3 }, { X: 1, up: 3, down: 2 }] },
  brcl: { n: '2-溴-3-氯丁烷', top: 'CH₃', bot: 'CH₃', x: ['Br', 'Cl'], sym: false,
    pri: [{ X: 1, up: 3, down: 2 }, { X: 1, up: 2, down: 3 }] },
};
const FV = { up: [0, 1, -1], down: [0, -1, -1], left: [-1, 0, 1], right: [1, 0, 1] };
function fConfig(m, sides) { return sides.map((s, i) => { const p = m.pri[i], v = {}; v[p.X] = FV[s]; v[p.up] = FV.up; v[p.down] = FV.down; return chir(v[1], v[2], v[3]); }); }
W.fischer = el => {
  let cur = 'tart', sides = ['right', 'left'];
  el.innerHTML = `${seg('fiS', Object.entries(FISH).map(([k, v]) => [k, v.n]), cur)}<div class="w-row"><button class="btn sm" type="button" data-f="0">翻轉 C2 的 ${'X'}</button><button class="btn sm" type="button" data-f="1">翻轉 C3 的 X</button></div><div class="mirror"><div id="fiA"></div><div class="mline"></div><div id="fiB"></div></div><p class="note" id="fiN"></p><div id="fiG" class="fgrid"></div>`;
  const draw1 = (m, sd, cfg, hl) => {
    const row = (y, s, X, lab) => `<line class="b" x1="70" y1="${y}" x2="170" y2="${y}"/><text class="at${hl ? ' hl' : ''}" x="${s === 'left' ? 52 : 188}" y="${y + 5}" text-anchor="middle">${X}</text><text class="at" x="${s === 'left' ? 188 : 52}" y="${y + 5}" text-anchor="middle">H</text><text class="tk" x="236" y="${y + 4}">${lab}</text>`;
    return `<svg viewBox="0 0 270 210" class="mol" role="img" aria-label="費雪投影式"><line class="b" x1="120" y1="40" x2="120" y2="170"/><text class="at" x="120" y="30" text-anchor="middle">${m.top}</text><text class="at" x="120" y="192" text-anchor="middle">${m.bot}</text>${row(80, sd[0], m.x[0], `C2 ${cfg[0]}`)}${row(130, sd[1], m.x[1], `C3 ${cfg[1]}`)}</svg>`;
  };
  const key = (m, c) => (m.sym && c[0] !== c[1] ? 'meso' : c.join(''));
  function draw() {
    const m = FISH[cur], cfg = fConfig(m, sides), mir = sides.map(s => (s === 'left' ? 'right' : 'left')), mcfg = fConfig(m, mir);
    const same = key(m, cfg) === key(m, mcfg);
    $('#fiA', el).innerHTML = draw1(m, sides, cfg) + `<p class="small mut c">(2${cfg[0]},3${cfg[1]})</p>`;
    $('#fiB', el).innerHTML = draw1(m, mir, mcfg) + `<p class="small mut c">鏡像 (2${mcfg[0]},3${mcfg[1]})</p>`;
    $('#fiN', el).innerHTML = `費雪投影式：<b>橫線朝向你、直線遠離你</b>。${same ? `<span class="ok">鏡像就是自己</span>：分子中間有一個鏡面（上下兩半互為鏡像），雖然有兩個掌性中心卻不是掌性分子，稱為<b>內消旋（meso）</b>化合物，沒有光學活性。` : '這個分子和它的鏡像不能重疊，兩者是一對<b>鏡像異構物</b>：兩個掌性中心的構型<b>全部相反</b>。'}`;
    const all = [['right', 'right'], ['left', 'left'], ['right', 'left'], ['left', 'right']], seen = new Set();
    $('#fiG', el).innerHTML = `<p class="lbl">所有立體異構物（和上面那個比較）</p>` + all.map(sd => { const c = fConfig(m, sd), k = key(m, c); if (seen.has(k)) return ''; seen.add(k);
      const rel = k === key(m, cfg) ? '就是它' : (c[0] !== cfg[0] && c[1] !== cfg[1]) || (k === key(m, mcfg)) ? '鏡像異構物' : '非鏡像異構物';
      return `<div class="fcell ${rel === '就是它' ? 'on' : ''}"><b>${k === 'meso' ? '內消旋 (2R,3S)' : `(2${c[0]},3${c[1]})`}</b><span>${rel}</span></div>`; }).join('') +
      `<p class="small mut">兩個掌性中心最多有 2² = 4 個立體異構物；${m.sym ? '酒石酸兩端相同，(2R,3S) 和 (2S,3R) 是同一個內消旋化合物，所以只有 3 個。' : '兩端不同，沒有內消旋，4 個都存在。'}只有部分中心相反的，稱為<b>非鏡像異構物</b>：它們的物理性質（熔點、溶解度）不同。</p>`;
    pressSeg(el, 'fiS', cur); $$('[data-f]', el).forEach((b, i) => { b.textContent = `翻轉 C${i + 2} 的 ${m.x[i]}`; });
  }
  bindSeg(el, 'fiS', v => { cur = v; draw(); });
  $$('[data-f]', el).forEach(b => { b.onclick = () => { const i = +b.dataset.f; sides[i] = sides[i] === 'left' ? 'right' : 'left'; draw(); }; });
  draw();
  return { set(s) { if (s.mol) cur = s.mol; if (s.sides) sides = s.sides.slice(); draw(); } };
};

/* ===== 4. 丁烷的構形與能量 ===== */
W.butane = el => {
  let ang = 180;
  // 相對能量（kJ/mol，McMurry）：反式 0、間扭式 3.8、CH₃/H 重疊 16、CH₃/CH₃ 重疊 19
  const PTS = [[0, 19], [60, 3.8], [120, 16], [180, 0], [240, 16], [300, 3.8], [360, 19]];
  const E = a => { a = ((a % 360) + 360) % 360; for (let i = 0; i < 6; i++) { const [a0, e0] = PTS[i], [a1, e1] = PTS[i + 1]; if (a <= a1) { const t = (a - a0) / (a1 - a0); return e0 + (e1 - e0) * (1 - Math.cos(Math.PI * t)) / 2; } } return 19; };
  const NAME = a => ({ 0: '全重疊式（CH₃ 與 CH₃ 重疊）', 60: '間扭式（gauche）', 120: '重疊式（CH₃ 與 H 重疊）', 180: '反式（anti）', 240: '重疊式（CH₃ 與 H 重疊）', 300: '間扭式（gauche）', 360: '全重疊式（CH₃ 與 CH₃ 重疊）' }[a]);
  el.innerHTML = `<div class="w-row"><label class="rng">轉動後碳（CH₃–C–C–CH₃ 二面角）<input type="range" id="buA" min="0" max="360" step="5"><output class="mono" id="buO"></output></label></div><div class="ngrid"><div id="buN"></div><div id="buE"></div></div><p class="note" id="buT"></p>`;
  function draw() {
    const cx = 130, cy = 120, R = 48, L = 92, P = (a, r) => [cx + Math.cos(a * Math.PI / 180) * r, cy - Math.sin(a * Math.PI / 180) * r];
    const front = [[90, 'CH₃', 'hl'], [210, 'H', ''], [330, 'H', '']], back = [[90 - ang, 'CH₃', 'br'], [210 - ang, 'H', ''], [330 - ang, 'H', '']];
    const bl = ([a, t, c]) => { const [x1, y1] = P(a, R), [x2, y2] = P(a, L), [tx, ty] = P(a, L + 16); return `<line class="nb" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="at ${c}" x="${tx}" y="${ty + 5}" text-anchor="middle">${t}</text>`; };
    const fl = ([a, t, c]) => { const [x2, y2] = P(a, L - 12), [tx, ty] = P(a, L + 4); return `<line class="nb" x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}"/><text class="at ${c}" x="${tx}" y="${ty + 5}" text-anchor="middle">${t}</text>`; };
    $('#buN', el).innerHTML = `<svg viewBox="0 0 260 245" class="mol" role="img" aria-label="丁烷紐曼投影">${back.map(bl).join('')}<circle class="nc" cx="${cx}" cy="${cy}" r="${R}"/>${front.map(fl).join('')}</svg>`;
    const xs = Array.from({ length: 73 }, (_, i) => i * 5);
    $('#buE', el).innerHTML = chart({ x: [0, 360], y: [0, 20], xt: [0, 60, 120, 180, 240, 300, 360], yt: [0, 3.8, 16, 19], xlab: '二面角（°）', ylab: '相對能量（kJ/mol）', h: 230, label: '丁烷構形能量' }, (X, Y) => `<path class="tline" d="${path(xs.map(a => [X(a), Y(E(a))]))}"/><circle class="dot" cx="${X(ang)}" cy="${Y(E(ang))}" r="7"/>`);
    const d = ang % 360 === 0 && ang ? 360 : ang, nm = NAME(d);
    $('#buT', el).innerHTML = `二面角 ${ang}°，相對能量 ${fx(E(ang), 1)} kJ/mol${nm ? `：<b>${nm}</b>` : ''}。` + (nm ? { 0: '兩個甲基正面相撞（立體張力）加上鍵電子互斥（扭轉張力），能量最高。', 60: '交錯式，但兩個甲基相鄰，有一點立體擁擠：比反式高 3.8 kJ/mol。', 120: '重疊式：鍵與鍵正對，扭轉張力大。', 180: '兩個甲基離得最遠，而且是交錯式：<b>能量最低、最穩定</b>，室溫下大部分丁烷分子處在這個構形。', 240: '重疊式：鍵與鍵正對，扭轉張力大。', 300: '交錯式，但兩個甲基相鄰：比反式高 3.8 kJ/mol。', 360: '兩個甲基正面相撞，能量最高。' }[d] : '介於兩種構形之間。室溫下 C–C 單鍵轉得很快（每秒數十億次），這些構形不能分離，只是出現的機率不同。');
    $('#buO', el).textContent = `${ang}°`; $('#buA', el).value = ang;
  }
  $('#buA', el).oninput = e => { ang = +e.target.value; draw(); };
  draw();
  return { set(s) { ang = s.ang ?? ang; draw(); } };
};

/* ===== 5. 環己烷椅式：直立鍵與平伏鍵 ===== */
W.chair = el => {
  let sub = 'me', f = 1, anim = 0;
  const SUB = { me: { t: 'CH₃', dG: 7.6 }, tbu: { t: 'C(CH₃)₃', dG: 22.8 } };
  el.innerHTML = `${seg('chairS', [['me', '甲基環己烷'], ['tbu', '第三丁基環己烷']], sub)}<div class="w-row"><button class="btn sm pri" type="button" id="chF">環翻轉 ⇄</button></div><div id="chairV"></div><div class="cards" id="chairK"></div><p class="note" id="chairN"></p>`;
  const r = 1.35, h = 0.3, S = 62, cx = 190, cy = 115;
  function geo(fl) {
    return Array.from({ length: 6 }, (_, k) => { const t = k * Math.PI / 3, x = r * Math.cos(t), y = r * Math.sin(t), z = fl * (k % 2 ? -1 : 1) * h; return { x, y, z, t, sx: cx + x * S, sy: cy - (0.32 * y + z) * S }; });
  }
  function draw() {
    const P = geo(f), axUp = f > 0, A = 0.85 * S;
    const ring = P.map((p, i) => { const q = P[(i + 1) % 6]; return `<line class="b" x1="${p.sx}" y1="${p.sy}" x2="${q.sx}" y2="${q.sy}"/>`; }).join('');
    const p0 = P[0], ax = [p0.sx, p0.sy - Math.sign(f || 1) * A * Math.abs(f)], eq = [p0.sx + A * 0.95, p0.sy - (-0.33 * Math.sign(f || 1)) * A * 0.5];
    const t = (1 - f) / 2, sp = [ax[0] + (eq[0] - ax[0]) * t, ax[1] + (eq[1] - ax[1]) * t], hp = [eq[0] + (ax[0] - eq[0]) * t, eq[1] + (ax[1] - eq[1]) * t];
    const axial = f > 0.2;
    const hs = [2, 4].map(k => { const p = P[k], y2 = p.sy - Math.sign(f || 1) * A * 0.7 * Math.abs(f); return `<line class="b" x1="${p.sx}" y1="${p.sy}" x2="${p.sx}" y2="${y2}"/><text class="at${axial ? ' hl' : ''}" x="${p.sx}" y="${y2 - 6}" text-anchor="middle">H</text>${axial ? `<line class="clash" x1="${p.sx}" y1="${y2}" x2="${sp[0] - 14}" y2="${sp[1]}"/>` : ''}`; }).join('');
    $('#chairV', el).innerHTML = `<svg viewBox="0 0 380 230" class="mol" role="img" aria-label="環己烷椅式">${ring}${hs}<line class="b" x1="${p0.sx}" y1="${p0.sy}" x2="${sp[0]}" y2="${sp[1]}"/><text class="at br" x="${sp[0] + (axial ? 0 : 30)}" y="${sp[1] + (axial ? -8 : 6)}" text-anchor="middle">${SUB[sub].t}</text><line class="b" x1="${p0.sx}" y1="${p0.sy}" x2="${hp[0]}" y2="${hp[1]}"/><text class="at" x="${hp[0] + (axial ? 12 : 0)}" y="${hp[1] + (axial ? 6 : -8)}" text-anchor="middle">H</text><text class="tk" x="${cx}" y="222" text-anchor="middle">${Math.abs(f) < 0.99 ? '翻轉中…' : axial ? '取代基在直立鍵（axial）' : '取代基在平伏鍵（equatorial）'}</text></svg>`;
    const d = SUB[sub].dG, ratio = Math.exp(d * 1000 / (8.314 * 298)), pe = 100 * ratio / (1 + ratio);
    $('#chairK', el).innerHTML = card('dg', '直立比平伏高', `${d} kJ/mol`) + card('pe', '平衡時平伏鍵構形', `${pe > 99.9 ? '> 99.9' : fx(pe, 1)}%`);
    $('#chairN', el).innerHTML = axial ? `取代基在<b>直立鍵</b>：它和同一側、隔一個碳的兩個直立 H（C3、C5，紅色）靠得很近，這叫 <b>1,3-雙直立作用</b>。按「環翻轉」，所有直立鍵和平伏鍵互換。`
      : `取代基在<b>平伏鍵</b>，指向環的外側，沒有 1,3-雙直立作用，比較穩定。${sub === 'me' ? '甲基' : '第三丁基'}在直立鍵時多出 ${d} kJ/mol 的能量，所以 25 °C 時約 ${pe > 99.9 ? '超過 99.9' : fx(pe, 0)}% 的分子處在平伏鍵構形。${sub === 'tbu' ? '第三丁基太大，等於把環「鎖」在這個構形。' : ''}`;
    pressSeg(el, 'chairS', sub);
  }
  function flip() {
    cancelAnimationFrame(anim); const f0 = f, f1 = f > 0 ? -1 : 1, t0 = performance.now();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { f = f1; draw(); return; }
    const tick = now => { const t = Math.min(1, (now - t0) / 900); f = f0 + (f1 - f0) * (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2); draw(); if (t < 1) anim = requestAnimationFrame(tick); else { f = f1; draw(); } };
    anim = requestAnimationFrame(tick);
  }
  bindSeg(el, 'chairS', v => { sub = v; draw(); });
  $('#chF', el).onclick = flip;
  draw();
  return { set(s) { if (s.sub) sub = s.sub; if (s.axial != null) f = s.axial ? 1 : -1; draw(); } };
};

/* ===== 6. 旋光度與光學純度 ===== */
const EEC = { tart: ['酒石酸', '(+)', '(−)', 12.0], but: ['2-丁醇', '(S)-(+)', '(R)-(−)', 13.52] };
W.ee = el => {
  const st = { m: 'tart', x: 75 };
  el.innerHTML = `${seg('eeS', Object.entries(EEC).map(([k, v]) => [k, v[0]]), st.m)}<div class="w-row"><label class="sel" style="flex:1">右旋異構物佔 <input type="range" id="eeX" min="0" max="100" step="5" value="${st.x}" style="flex:1"><b class="mono" id="eeO"></b></label></div><div id="eeG"></div><div class="cards" id="eeK"></div><p class="note" id="eeN"></p>`;
  function draw() {
    const [n, p, m, a0] = EEC[st.m], x = st.x / 100, ee = 2 * x - 1, obs = a0 * ee, ang = obs * 3;
    $('#eeO', el).textContent = `${st.x}%`;
    const r = 80, cx = 110, cy = 105, t = ang * Math.PI / 180;
    const bar = (w, c, x0) => `<rect x="${x0}" y="70" width="${w}" height="30" style="fill:${c}"/>`;
    $('#eeG', el).innerHTML = `<svg class="en" viewBox="0 0 520 210" style="max-width:560px;margin:auto" role="img" aria-label="旋光">
<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:none;stroke:var(--line);stroke-width:2"/><line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" style="stroke:var(--muted);stroke-dasharray:4 4"/>
<line x1="${cx - r * Math.sin(t)}" y1="${cy + r * Math.cos(t)}" x2="${cx + r * Math.sin(t)}" y2="${cy - r * Math.cos(t)}" style="stroke:var(--acid);stroke-width:4"/>
<text class="tk" x="${cx}" y="${cy + r + 18}" text-anchor="middle">偏振面（角度放大 3 倍）</text>
${bar(260 * x, '#2F3B99', 240)}${bar(260 * (1 - x), '#B5326C', 240 + 260 * x)}
<text class="tk" x="240" y="60">${p} ${st.x}%</text><text class="tk" x="500" y="60" text-anchor="end">${m} ${100 - st.x}%</text>
<rect x="240" y="120" width="${260 * Math.abs(ee)}" height="14" style="fill:var(--acid);opacity:.8"/><text class="tk" x="240" y="152">多出來的部分 = 鏡像過量 ${fx(Math.abs(ee) * 100, 0)}%</text></svg>`;
    $('#eeK', el).innerHTML = card('a', '純右旋的比旋光度', `+${a0}°`) + card('o', '混合物的比旋光度', `${obs >= 0 ? '+' : '−'}${fx(Math.abs(obs), 2)}°`) + card('e', '光學純度（ee）', `${fx(Math.abs(ee) * 100, 0)}%`);
    $('#eeN', el).innerHTML = `等量的一對鏡像異構物旋光互相抵消，只有「多出來的那部分」會旋光。所以 <b>光學純度 = 觀測比旋光度 ÷ 純物質比旋光度 = 鏡像過量 (ee) = 多的 % − 少的 %</b>。${st.x === 50 ? '現在是外消旋混合物，旋光為 0。' : `${fx(Math.abs(ee) * 100, 0)}% 的過量加上其餘 ${fx(100 - Math.abs(ee) * 100, 0)}% 的外消旋部分。`}`;
    pressSeg(el, 'eeS', st.m);
  }
  bindSeg(el, 'eeS', v => { st.m = v; draw(); });
  $('#eeX', el).oninput = e => { st.x = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); $('#eeX', el).value = st.x; draw(); } };
};

/* ===== 7. 雙取代環己烷：兩個椅式比一比 ===== */
W.disub = el => {
  const st = { pos: 2, cis: 1, g: 'mm' };
  const AV = { me: ['CH₃', 7.6], tb: ['t-Bu', 22.8] };
  el.innerHTML = `${seg('dsP', [['2', '1,2-'], ['3', '1,3-'], ['4', '1,4-']], '2')}${seg('dsC', [['1', '順式 cis'], ['0', '反式 trans']], '1')}${seg('dsG', [['mm', '兩個甲基'], ['mt', '甲基＋第三丁基']], 'mm')}<div id="dsV"></div><div class="cards" id="dsK"></div><p class="note" id="dsN"></p>`;
  const r = 1.2, h = 0.3, S = 52, A = 40;
  function chair(cx, fl, subs) {
    const P = Array.from({ length: 6 }, (_, k) => { const t = k * Math.PI / 3, z = fl * (k % 2 ? -1 : 1) * h; return { t, z, sx: cx + r * Math.cos(t) * S, sy: 110 - (0.32 * r * Math.sin(t) + z) * S }; });
    let s = P.map((p, i) => { const q = P[(i + 1) % 6]; return `<line class="b" x1="${p.sx}" y1="${p.sy}" x2="${q.sx}" y2="${q.sy}"/>`; }).join('');
    let E = 0; const lab = [];
    subs.forEach(([k, up, g]) => { const p = P[k], ax = (up > 0) === (p.z > 0), sg = Math.sign(p.z);
      const e = ax ? [p.sx, p.sy - sg * A] : [p.sx + Math.cos(p.t) * A * 0.95, p.sy - 0.32 * Math.sin(p.t) * A + sg * A * 0.35];
      if (ax) E += AV[g][1];
      s += `<line class="b" x1="${p.sx}" y1="${p.sy}" x2="${e[0]}" y2="${e[1]}"/><text class="at${ax ? ' hl' : ' br'}" style="font-size:13px" x="${e[0] + (ax ? 0 : Math.cos(p.t) * 22)}" y="${e[1] + (ax ? (sg > 0 ? -6 : 16) : 5)}" text-anchor="middle">${AV[g][0]}</text>`;
      lab.push(`C${k + 1} ${ax ? '直立' : '平伏'}`); });
    return { s, E, lab };
  }
  function draw() {
    const k2 = st.pos - 1, g2 = st.g === 'mm' ? 'me' : 'tb', subs = [[0, 1, 'me'], [k2, st.cis ? 1 : -1, g2]];
    const a = chair(150, 1, subs), b = chair(430, -1, subs), best = a.E <= b.E ? 0 : 1;
    $('#dsV', el).innerHTML = `<svg class="mol" viewBox="0 0 580 220" role="img" aria-label="兩個椅式構形">${a.s}${b.s}<text class="tk" x="290" y="20" text-anchor="middle">⇄ 環翻轉 ⇄</text><text class="tk" x="150" y="210" text-anchor="middle">${a.lab.join('、')}</text><text class="tk" x="430" y="210" text-anchor="middle">${b.lab.join('、')}</text></svg>`;
    const same = st.g === 'mm', pos = st.pos, chiral = pos === 4 ? false : same ? !st.cis : true;
    $('#dsK', el).innerHTML = card('a', '左邊椅式（直立的能量）', `${fx(a.E, 1)} kJ/mol${best === 0 && a.E !== b.E ? ' ✓' : ''}`) + card('b', '右邊椅式', `${fx(b.E, 1)} kJ/mol${best === 1 && a.E !== b.E ? ' ✓' : ''}`) + card('c', '掌性', chiral ? '掌性（有鏡像異構物）' : same && pos !== 4 ? '內消旋（非掌性）' : '非掌性');
    const ee = a.E === 0 || b.E === 0;
    $('#dsN', el).innerHTML = `紅色是直立的取代基，每個直立甲基約多 7.6 kJ/mol、第三丁基約 22.8 kJ/mol。${a.E === b.E ? '兩個椅式各有一個直立、一個平伏，能量相同。' : ee ? '其中一個椅式兩個取代基都在平伏鍵，最穩定。' : '兩個椅式都有直立的取代基，較大的基團會優先待在平伏鍵。'}規律：<b>順式 1,3-、反式 1,2-、反式 1,4-</b> 可以兩個都平伏。${pos === 4 ? '1,4-取代物有一個穿過 C1 和 C4 的鏡面，順反都不是掌性分子。' : same ? (st.cis ? '兩個相同取代基的順式異構物分子內有鏡面，是內消旋化合物。' : '反式異構物沒有鏡面，有一對鏡像異構物，具光學活性。') : '兩個取代基不同時，1,2- 與 1,3- 的順、反式都沒有鏡面，都是掌性分子。'}`;
    pressSeg(el, 'dsP', String(st.pos)); pressSeg(el, 'dsC', String(st.cis)); pressSeg(el, 'dsG', st.g);
  }
  bindSeg(el, 'dsP', v => { st.pos = +v; draw(); });
  bindSeg(el, 'dsC', v => { st.cis = +v; draw(); });
  bindSeg(el, 'dsG', v => { st.g = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};
