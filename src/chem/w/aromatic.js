/* ---------- 後中化學：芳香族化合物的互動圖 ---------- */

/* ===== 1. 休克耳規則與弗羅斯特圓 ===== */
W.huckel = el => {
  const R = {
    benzene: { n: '苯', size: 6, pi: 6, planar: true, conj: true, note: '六個 sp² 碳各提供一個 p 電子。' },
    cbd: { n: '環丁二烯', size: 4, pi: 4, planar: true, conj: true, note: '4 個 π 電子（4n，n = 1），有兩個電子落在未成對的軌域上：反芳香性，極不穩定。' },
    cot: { n: '環辛四烯', size: 8, pi: 8, planar: false, conj: true, note: '8 個 π 電子（4n），但分子會折成澡盆形避免反芳香性，雙鍵不共軛：非芳香性，行為像一般的烯。' },
    cp: { n: '環戊二烯負離子', size: 5, pi: 6, planar: true, conj: true, note: '帶負電的碳是 sp²，孤對電子在 p 軌域上參與共軛，共 6 個 π 電子。所以環戊二烯（pKa 約 16）對一個 C–H 來說非常酸。' },
    trop: { n: '環庚三烯陽離子', size: 7, pi: 6, planar: true, conj: true, note: '帶正電的碳有空的 p 軌域，讓整個環共軛，6 個 π 電子。' },
    pyrrole: { n: '吡咯', size: 5, pi: 6, planar: true, conj: true, note: 'N 的孤對電子在 p 軌域上參與 π 系統（兩個 C=C 共 4 個 + N 的 2 個）。因此吡咯的 N 幾乎沒有鹼性：孤對電子被用掉了。' },
    pyridine: { n: '吡啶', size: 6, pi: 6, planar: true, conj: true, note: '和苯一樣 6 個 π 電子；N 的孤對電子在 sp² 軌域上、指向環外，不參與 π 系統，所以吡啶有鹼性。' },
  };
  let cur = 'benzene';
  el.innerHTML = `${seg('hkS', Object.entries(R).map(([k, v]) => [k, v.n]), cur)}<div class="bgrid"><div id="hkR"></div><div id="hkF"></div></div><ul class="checks" id="hkC"></ul><p class="note" id="hkN"></p>`;
  function draw() {
    const r = R[cur], n = r.size, aro = r.planar && r.conj && (r.pi - 2) % 4 === 0, anti = r.planar && r.conj && r.pi % 4 === 0;
    // 環
    const atoms = {}, bonds = [];
    for (let k = 0; k < n; k++) { const a = (90 + 360 * k / n) * Math.PI / 180; atoms['a' + k] = { x: Math.cos(a) * 1.1, y: Math.sin(a) * 1.1, t: '' }; }
    if (cur === 'pyrrole') atoms.a0 = { ...atoms.a0, t: 'NH', lp: [90] };
    if (cur === 'pyridine') atoms.a0 = { ...atoms.a0, t: 'N', lp: [90] };
    if (cur === 'cp') atoms.a0 = { ...atoms.a0, c: '−' };
    if (cur === 'trop') atoms.a0 = { ...atoms.a0, c: '+' };
    const dbl = { benzene: [0, 2, 4], cbd: [0, 2], cot: [0, 2, 4, 6], cp: [1, 3], trop: [1, 3, 5], pyrrole: [1, 3], pyridine: [0, 2, 4] }[cur];
    for (let k = 0; k < n; k++) bonds.push(['a' + k, 'a' + ((k + 1) % n), dbl.includes(k) ? 'd' : 's']);
    $('#hkR', el).innerHTML = MOL.svg({ atoms, bonds }, { w: 220, h: 200, s: 62 }) + `<p class="small mut c">${r.n}（${r.pi} 個 π 電子）</p>`;
    // 弗羅斯特圓：正多邊形頂點朝下內接於圓，每個頂點的高度就是一個分子軌域的能量
    const cx = 120, cy = 100, rad = 70, lv = Array.from({ length: n }, (_, k) => cy + rad * Math.cos(2 * Math.PI * k / n));
    const levels = [...new Set(lv.map(v => Math.round(v * 10) / 10))].sort((a, b) => b - a);
    let left = r.pi; const fill = levels.map(y => { const deg = lv.filter(v => Math.round(v * 10) / 10 === y).length, e = Math.min(left, 2 * deg); left -= e; return [y, deg, e]; });
    const pts = Array.from({ length: n }, (_, k) => { const a = 2 * Math.PI * k / n; return [cx + rad * Math.sin(a), cy + rad * Math.cos(a)]; });
    // 洪德定則：同一能階先每個軌域放一個，再成對
    const occ = (e, deg, j) => (e > deg ? (j < e - deg ? 2 : 1) : (j < e ? 1 : 0));
    const lvl = fill.map(([y, deg, e]) => Array.from({ length: deg }, (_, j) => { const x0 = cx + (j - (deg - 1) / 2) * 46, ue = occ(e, deg, j); return `<line class="lvl" x1="${x0 - 16}" x2="${x0 + 16}" y1="${y}" y2="${y}"/>${ue >= 1 ? `<text class="spin" x="${x0 - 12}" y="${y - 3}">↑</text>` : ''}${ue >= 2 ? `<text class="spin" x="${x0 + 3}" y="${y - 3}">↓</text>` : ''}`; }).join('')).join('');
    $('#hkF', el).innerHTML = r.planar ? `<svg viewBox="0 0 260 200" class="ch" role="img" aria-label="弗羅斯特圓"><circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="var(--line)"/><polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--muted)" stroke-dasharray="3 3"/>${lvl}<line class="mk" x1="20" x2="220" y1="${cy}" y2="${cy}"/><text class="tk" x="222" y="${cy + 4}">非鍵</text></svg><p class="small mut c">π 分子軌域能階（弗羅斯特圓）</p>` : '<p class="note">分子不是平面，p 軌域無法連續重疊，不形成環狀 π 系統。</p>';
    $('#hkC', el).innerHTML = [['環狀', true], ['平面', r.planar], ['每個環原子都有 p 軌域（完全共軛）', r.conj], [`π 電子數 ${r.pi} = 4n + 2？`, (r.pi - 2) % 4 === 0]].map(([t, ok]) => `<li class="${ok ? 'ok' : 'bad'}">${ok ? '✓' : '✕'} ${t}</li>`).join('');
    $('#hkN', el).innerHTML = `<b>${aro ? '芳香性' : anti ? '反芳香性' : '非芳香性'}</b>。${r.note}${aro ? '弗羅斯特圓上，所有成鍵軌域都剛好填滿成對，沒有電子落在非鍵或反鍵軌域：這就是 4n + 2 特別穩定的原因。' : anti ? '弗羅斯特圓上，最後兩個電子只能分別放進兩個簡併的非鍵軌域，未成對：不穩定。' : ''}`;
    pressSeg(el, 'hkS', cur);
  }
  bindSeg(el, 'hkS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.r || cur; draw(); } };
};

/* ===== 2. 親電子芳香取代：苯的溴化 ===== */
W.eas = el => {
  el.innerHTML = '<div id="eaP"></div>';
  const ring = () => { const a = {}; for (let k = 0; k < 6; k++) { const t = (90 + 60 * k) * Math.PI / 180; a['a' + k] = { x: Math.cos(t) * 1.1 - 0.6, y: Math.sin(t) * 1.1, t: '' }; } return a; };
  const rb = d => [0, 1, 2, 3, 4, 5].map(k => ['a' + k, 'a' + ((k + 1) % 6), d.includes(k) ? 'd' : 's']);
  const frames = () => {
    const A = ring();
    const F0 = { atoms: { ...A, H: { x: 0.35, y: 0.95, t: 'H' }, E: { x: 1.9, y: 0.35, t: 'Br', c: '+' } }, bonds: [...rb([5, 1, 3]), ['a5', 'H', 's']], arrows: [{ f: { b: ['a4', 'a5'] }, t: { a: 'E' }, bend: -0.4 }], notes: [{ x: 0, y: -1.7, t: 'Br₂ + FeBr₃ → Br⁺（親電子試劑）' }] };
    const sig = (d, cc) => ({ atoms: { ...A, [cc]: { ...A[cc], c: '+' }, H: { x: 0.2, y: 1.15, t: 'H' }, E: { x: 0.75, y: 0.15, t: 'Br' } }, bonds: [...rb(d), ['a5', 'H', 's'], ['a5', 'E', 's']] });
    const F1 = { ...sig([1, 3], 'a4'), arrows: [{ f: { b: ['a3', 'a2'] }, t: { m: ['a3', 'a4'] }, bend: 0.5 }], notes: [{ x: 0, y: -1.7, t: 'σ 錯合物（芳烴正離子）：芳香性暫時被破壞' }] };
    const F2 = { ...sig([0, 3], 'a2'), notes: [{ x: 0, y: -1.7, t: '正電荷可以共振到三個位置（鄰位、對位）' }] };
    const F3 = { ...sig([0, 3], 'a2'), atoms: { ...sig([0, 3], 'a2').atoms, B: { x: -0.2, y: 2.3, t: 'FeBr₄', c: '−', lp: [] } }, arrows: [{ f: { b: ['a5', 'H'] }, t: { m: ['a4', 'a5'] }, bend: 0.6 }], notes: [{ x: 0, y: -1.7, t: '鹼拿走 H⁺，電子回到環上' }] };
    const F4 = { atoms: { ...A, E: { x: 0.35, y: 0.95, t: 'Br' } }, bonds: [...rb([5, 1, 3]), ['a5', 'E', 's']], notes: [{ x: 0, y: -1.7, t: '溴苯 + HBr + FeBr₃：芳香性恢復' }] };
    return [
      { sc: F0, at: 0, cap: 'Br₂ 和路易斯酸 FeBr₃ 生成很強的親電子試劑（可視為 Br⁺）。苯的 π 電子很穩定，必須用這麼強的親電子試劑才會反應。' },
      { sc: F1, at: 0.45, cap: '<b>第一步（慢）</b>：π 電子攻擊 Br⁺，接上 Br 的碳變成 sp³，生成帶正電的 <b>σ 錯合物</b>。芳香性被破壞，所以這一步的活化能很高。' },
      { sc: F2, at: 0.45, cap: '正電荷可以共振到三個碳上（相對於 Br 的鄰位與對位）。這一點決定了下一節取代基的定位效應。' },
      { sc: F3, at: 0.45, cap: '<b>第二步（快）</b>：鹼（FeBr₄⁻）拿走接 Br 那個碳上的 H⁺，C–H 的電子回到環上。' },
      { sc: F4, at: 1, cap: '芳香性恢復。注意結果是<b>取代</b>（H 被 Br 取代），不是像烯烴那樣的加成：加成會永久失去芳香性，能量上不划算。' }];
  };
  const pl = mechPlayer($('#eaP', el), { frames, energy: [[0, 0.3], [0.25, 0.9], [0.45, 0.62], [0.65, 0.7], [1, 0.2]], elabels: [[0.25, '過渡狀態 1'], [0.45, 'σ 錯合物', 16]], w: 460, h: 250, s: 54, label: '苯的溴化' });
  return { set(s) { pl.go(s.step || 0, false); } };
};

/* ===== 3. 取代基的活化與定位效應（硝化的產物分布） ===== */
W.directing = el => {
  // McMurry 表：取代苯硝化的鄰／間／對位百分比
  const S = {
    OH: { n: '–OH', d: [50, 0, 50], k: '強活化，鄰對位', why: 'O 的孤對電子可以共振給環（推電子），而且能直接穩定鄰、對位進攻時的正電荷（多一個所有原子都滿八隅的共振結構）。' },
    CH3: { n: '–CH₃', d: [63, 3, 34], k: '弱活化，鄰對位', why: '烷基經誘導與超共軛推電子；鄰、對位進攻時正電荷落在接甲基的碳上（三級碳陽離子），較穩定。' },
    Cl: { n: '–Cl', d: [35, 1, 64], k: '弱鈍化，鄰對位', why: '鹵素的誘導效應（拉電子）讓整個環變慢；但孤對電子仍能共振穩定鄰、對位的正電荷，所以定位在鄰對位。這是唯一「鈍化卻鄰對位」的一類。' },
    COOH: { n: '–COOH', d: [22, 76, 2], k: '鈍化，間位', why: '羰基拉電子。鄰、對位進攻時正電荷會落在接羰基的碳上，緊鄰另一個缺電子的碳，非常不穩定；間位進攻避開了這種情況。' },
    NO2: { n: '–NO₂', d: [7, 91, 2], k: '強鈍化，間位', why: '硝基強烈拉電子（N 帶正電）。鄰、對位進攻會讓兩個正電荷相鄰；只剩間位可行，而且整體反應很慢。' },
  };
  let cur = 'CH3';
  el.innerHTML = `${seg('drS', Object.entries(S).map(([k, v]) => [k, v.n]), cur)}<div class="bars pk" id="drB"></div><p class="small mut">取代苯硝化時，硝基進入鄰位、間位、對位的比例（OpenStax《Organic Chemistry》表 16.1，以 McMurry 為底本）</p><p class="note" id="drN"></p>`;
  function draw() {
    const s = S[cur];
    $('#drB', el).innerHTML = [['鄰位（ortho）', 0], ['間位（meta）', 1], ['對位（para）', 2]].map(([t, i]) => `<div><span>${t}</span><i class="${i === 1 ? 'bha' : 'ba'}" style="width:${Math.max(1, s.d[i])}%"></i><b class="mono">${s.d[i]}%</b></div>`).join('');
    $('#drN', el).innerHTML = `<b>${s.n}：${s.k}</b>。${s.why}`;
    pressSeg(el, 'drS', cur);
  }
  bindSeg(el, 'drS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.g || cur; draw(); } };
};
