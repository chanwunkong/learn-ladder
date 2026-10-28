/* ---------- 後中化學：互動圖 ----------
   W.名稱(el) 在 el 裡畫出互動圖，回傳 { set(狀態) } 給練習題的「在圖上看」使用。 */
const W = {};
const seg = (id, opts, cur) => `<div class="seg" id="${id}" role="group">${opts.map(([v, t]) => `<button type="button" data-v="${v}" aria-pressed="${v === cur}">${t}</button>`).join('')}</div>`;
const bindSeg = (el, id, f) => $$(`#${id} button`, el).forEach(b => { b.onclick = () => f(b.dataset.v); });
const pressSeg = (el, id, v) => $$(`#${id} button`, el).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
const card = (k, lab, val, sub = '') => `<div class="card" data-k="${k}"><span>${lab}</span><b>${val}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
let UID = 0;

/* ===== 1. 滴定：燒杯（粒子）＋滴定曲線 ===== */
W.titration = (el, opt = {}) => {
  const id = 't' + (++UID), st = { acid: 'weak', v: 0, ind: opt.ind || 'none' }, Va = 25, Ca0 = 0.1, Cb = 0.1;
  el.innerHTML = `<div class="w-row">${seg(id + 'a', [['weak', '醋酸（弱酸）'], ['strong', '鹽酸（強酸）']], st.acid)}<label class="sel">指示劑 <select id="${id}i">${Object.entries(IND).map(([k, d]) => `<option value="${k}"${k === st.ind ? ' selected' : ''}>${d.name}${d.txt ? `（${d.lo}–${d.hi}，${d.txt}）` : ''}</option>`).join('')}</select></label></div>
<div class="tgrid"><div class="beaker" id="${id}b"></div><div class="tcurve" id="${id}c"></div></div>
<div class="w-row"><label class="rng">加入 NaOH <input type="range" id="${id}v" min="0" max="50" step="0.1" value="0"><output id="${id}o" class="mono"></output></label></div>
<div class="w-row">${[[-1, '−1 mL'], [-0.1, '−0.1'], [0.1, '+0.1'], [1, '+1 mL']].map(([d, t]) => `<button class="btn sm" type="button" data-d="${d}">${t}</button>`).join('')}<span class="sp"></span>${[[0, '起點'], [12.5, '半當量點'], [25, '當量點'], [30, '鹼過量']].map(([v, t]) => `<button class="btn sm ghost" type="button" data-j="${v}">${t}</button>`).join('')}</div>
<div class="cards" id="${id}k"></div><p class="note" id="${id}n" aria-live="polite"></p>`;
  const curve = strong => { const xs = []; for (let v = 0; v <= 50.001; v += (Math.abs(v - 25) < 1.2 ? 0.02 : 0.25)) xs.push(v); return xs.map(v => [v, titr({ Va, Ca0, Cb, Vb: v, strong, pKa: ACID[strong ? 'strong' : 'weak'].pKa }).pH]); };
  const CUR = { weak: curve(false), strong: curve(true) };
  function beaker(r) {
    const W0 = 250, H0 = 270, x0 = 30, x1 = 180, yb = 250, top = 70, lv = yb - (r.V / 80) * (yb - top) - 4;
    const strong = st.acid === 'strong', icons = [];
    const push = (n, cls, t) => { for (let i = 0; i < Math.round(n / 0.1); i++) icons.push([cls, t]); };
    if (strong) push(r.nH, 'ih', 'H⁺'); else push(r.nHA, 'iha', 'HA');
    if (!strong) push(r.nA, 'ia', 'A⁻');
    if (r.nOH > 0.05) push(r.nOH, 'ioh', 'OH⁻');
    const cols = 8, cw = (x1 - x0 - 12) / cols, rowH = 15;
    const g = icons.slice(0, 64).map(([c, t], i) => { const cx = x0 + 6 + cw * (i % cols + 0.5), cy = yb - 10 - rowH * Math.floor(i / cols); return `<g class="${c}"><circle cx="${cx}" cy="${cy}" r="7"/><text x="${cx}" y="${cy + 3}" text-anchor="middle">${t}</text></g>`; }).join('');
    const drops = st.v > 0 ? `<line class="burette" x1="115" y1="6" x2="115" y2="40"/><circle class="drop" cx="115" cy="52" r="3"/>` : `<line class="burette" x1="115" y1="6" x2="115" y2="40"/>`;
    return `<svg viewBox="0 0 ${W0} ${H0}" class="bk" role="img" aria-label="燒杯中的粒子">${drops}<path class="liq" d="M${x0 + 2} ${lv}L${x1 - 2} ${lv}L${x1 - 2} ${yb - 2}L${x0 + 2} ${yb - 2}Z" style="fill:${indColor(st.ind, r.pH)}"/><path class="glass" d="M${x0} ${top - 10}L${x0} ${yb}L${x1} ${yb}L${x1} ${top - 10}"/>${g}<text class="phm" x="${x1 + 4}" y="${top + 4}">pH</text><text class="phv" x="${x1 + 4}" y="${top + 26}">${fx(r.pH)}</text><text class="tk" x="${(x0 + x1) / 2}" y="${H0 - 4}" text-anchor="middle">${strong ? '每個圓 = 0.1 mmol（Na⁺、Cl⁻ 不畫）' : '每個圓 = 0.1 mmol（Na⁺ 不畫）'}</text></svg>`;
  }
  function narrate(r) {
    const strong = st.acid === 'strong', v = st.v, nOH = Cb * v, n0 = Ca0 * Va, eq = Math.abs(v - 25) < 0.05;
    if (strong) {
      if (v === 0) return `HCl 是強酸，在水中<b>完全解離</b>：[H⁺] = 0.100 M，pH = 1.00。燒杯裡的「酸」就是 2.50 mmol 的 H⁺。`;
      if (eq) return `加入的 OH⁻ 剛好中和所有 H⁺。燒杯裡只剩 Na⁺、Cl⁻ 和水，兩者都不和水反應，所以 <b>pH = 7.00</b>。`;
      if (v < 25) return `加入 ${fx(nOH, 2)} mmol OH⁻，中和等量的 H⁺，剩 ${fx(n0 - nOH, 2)} mmol H⁺ 在 ${fx(r.V, 1)} mL 中 → [H⁺] = ${sci((n0 - nOH) / r.V)} M，pH = ${fx(r.pH)}。沒有弱酸可以「接住」變化，所以沒有緩衝區。`;
      return `H⁺ 已中和完，多出 ${fx(nOH - n0, 2)} mmol OH⁻，pH 由過量的強鹼決定：${fx(r.pH)}。`;
    }
    if (v === 0) return `還沒加鹼。燒杯裡幾乎都是 HA，只有約 ${fx(100 * r.nH / n0, 1)}% 解離：[H⁺] ≈ √(Ka·C) → pH = ${fx(r.pH)}。只有一點點 A⁻，所以剛開始加鹼時比例變化很大，pH 爬得快。`;
    if (Math.abs(v - 12.5) < 0.05) return `<b>半當量點</b>：一半的 HA 變成 A⁻，HA = A⁻ = ${fx(r.nA, 2)} mmol。比例 1：1，所以 <b>pH = pKa = ${fx(r.pH)}</b>。這也是緩衝能力最強的位置。`;
    if (eq) return `<b>當量點</b>：HA 全部變成 A⁻（${fx(r.nA, 2)} mmol）。A⁻ 是弱鹼，A⁻ + H₂O ⇌ HA + OH⁻，所以溶液偏鹼，<b>pH = ${fx(r.pH)}</b>，不是 7。`;
    if (v < 23.5) return `加入 ${fx(nOH, 2)} mmol OH⁻ → 生成 ${fx(nOH, 2)} mmol A⁻，剩 ${fx(n0 - nOH, 2)} mmol HA。HA 和 A⁻ 都很多，是<b>緩衝溶液</b>：pH ≈ pKa + log(${fx(nOH, 2)} ÷ ${fx(n0 - nOH, 2)}) = ${fx(r.pH)}。`;
    if (v < 25) return `只剩 ${fx(n0 - nOH, 2)} mmol HA 了。HA 越少，每一滴鹼讓 A⁻/HA 比例改變得越劇烈，pH 開始<b>暴衝</b>。`;
    return `HA 已用完，多出 ${fx(nOH - n0, 2)} mmol OH⁻。過量強鹼產生的 OH⁻ 遠多於 A⁻ 水解產生的，pH 由過量 OH⁻ 決定：${fx(r.pH)}。這之後的曲線和強酸完全重合。`;
  }
  function draw() {
    const strong = st.acid === 'strong', r = titr({ Va, Ca0, Cb, Vb: st.v, strong, pKa: ACID[st.acid].pKa }), d = IND[st.ind];
    $('#' + id + 'b', el).innerHTML = beaker(r);
    $('#' + id + 'c', el).innerHTML = chart({ x: [0, 50], y: [0, 14], xt: [0, 10, 20, 25, 30, 40, 50], yt: [0, 2, 4, 6, 7, 8, 10, 12, 14], xlab: '加入 NaOH（mL）', ylab: 'pH', h: 290, label: '滴定曲線' }, (X, Y) =>
      (d.lo ? `<rect class="indband" x="${X(0)}" y="${Y(d.hi)}" width="${X(50) - X(0)}" height="${Y(d.lo) - Y(d.hi)}" style="fill:${indColor(st.ind, (d.lo + d.hi) / 2)}"/><text class="tk" x="${X(49)}" y="${Y(d.hi) - 4}" text-anchor="end">${d.name}變色範圍</text>` : '') +
      (strong ? '' : `<rect class="buf" data-k="buf" x="${X(25 / 11)}" y="${Y(14)}" width="${X(250 / 11) - X(25 / 11)}" height="${Y(0) - Y(14)}"/><text class="tk" x="${X(12.5)}" y="${Y(13)}" text-anchor="middle">緩衝區（pKa ± 1）</text><line class="mk" x1="${X(12.5)}" x2="${X(12.5)}" y1="${Y(0)}" y2="${Y(4.74)}"/><line class="mk" x1="${X(0)}" x2="${X(12.5)}" y1="${Y(4.74)}" y2="${Y(4.74)}"/><text class="tk" x="${X(13)}" y="${Y(4.74) + 14}">半當量點 pH = pKa</text>`) +
      `<line class="mk" x1="${X(25)}" x2="${X(25)}" y1="${Y(0)}" y2="${Y(14)}"/><text class="tk" x="${X(25.6)}" y="${Y(1)}">當量點</text>` +
      `<path class="tline" d="${path(CUR[st.acid].map(([v, p]) => [X(v), Y(p)]))}"/>${strong ? '' : `<path class="tline2" d="${path(CUR.strong.map(([v, p]) => [X(v), Y(p)]))}"/>`}<circle class="dot" cx="${X(st.v)}" cy="${Y(r.pH)}" r="7"/>`);
    $('#' + id + 'o', el).textContent = `${fx(st.v, 1)} mL`;
    $('#' + id + 'v', el).value = st.v;
    $('#' + id + 'k', el).innerHTML = card('ph', 'pH', fx(r.pH)) + (strong ? card('h', 'H⁺', `${fx(r.nH, 2)} mmol`) : card('ha', 'HA', `${fx(r.nHA, 2)} mmol`) + card('a', 'A⁻', `${fx(r.nA, 2)} mmol`)) + card('oh', '過量 OH⁻', `${fx(Math.max(0, Cb * st.v - Ca0 * Va), 2)} mmol`) + card('vt', '總體積', `${fx(r.V, 1)} mL`);
    $('#' + id + 'n', el).innerHTML = narrate(r) + (d.lo ? ` 此時${d.name}呈 <span class="sw" style="background:${indColor(st.ind, r.pH)}"></span>${r.pH < d.lo ? '酸色' : r.pH > d.hi ? '鹼色' : '過渡色'}。` : '');
    pressSeg(el, id + 'a', st.acid);
  }
  const setV = v => { st.v = Math.round(clamp(v, 0, 50) * 10) / 10; draw(); };
  bindSeg(el, id + 'a', v => { st.acid = v; draw(); });
  $('#' + id + 'v', el).oninput = e => setV(+e.target.value);
  $('#' + id + 'i', el).onchange = e => { st.ind = e.target.value; draw(); };
  $$('[data-d]', el).forEach(b => { b.onclick = () => setV(st.v + +b.dataset.d); });
  $$('[data-j]', el).forEach(b => { b.onclick = () => setV(+b.dataset.j); });
  draw();
  return { set(s) { Object.assign(st, s); if (s.ind) $('#' + id + 'i', el).value = s.ind; draw(); } };
};
W.indicator = el => W.titration(el, { ind: 'pp' });

/* ===== 2. 緩衝溶液 vs 純水 ===== */
W.buffer = el => {
  const st = { C: 0.1, net: 0 }, V = 100, step = 1;
  el.innerHTML = `<div class="w-row"><button class="btn sm" type="button" data-a="H">＋ 1 mmol HCl</button><button class="btn sm" type="button" data-a="OH">＋ 1 mmol NaOH</button><button class="btn sm ghost" type="button" data-a="0">⟲ 重來</button></div>
<div class="w-row"><label class="rng">緩衝溶液濃度（HA 與 A⁻ 各）<input type="range" id="bc" min="0.01" max="0.3" step="0.01" value="0.1"><output class="mono" id="bco"></output></label></div>
<div class="bgrid"><div id="bcards" class="cards"></div><div id="bbars"></div></div><div id="bch"></div><p class="note" id="bn" aria-live="polite"></p>`;
  const calc = net => ({ b: buffer({ C: st.C, V, addH: Math.max(0, net), addOH: Math.max(0, -net) }), w: water({ V, addH: Math.max(0, net), addOH: Math.max(0, -net) }) });
  function draw() {
    const r = calc(st.net), r0 = calc(0), cap = st.C * V;
    $('#bco', el).textContent = `${fx(st.C, 2)} M（各 ${fx(cap, 1)} mmol）`;
    const added = st.net === 0 ? '還沒加任何東西' : st.net > 0 ? `已加入 ${st.net} mmol HCl` : `已加入 ${-st.net} mmol NaOH`;
    $('#bcards', el).innerHTML = `<p class="small mut" style="width:100%;margin:0">${added}（100 mL）</p>` + card('bw', '純水 pH', fx(r.w.pH), `變化 ${(r.w.pH - r0.w.pH >= 0 ? '+' : '')}${fx(r.w.pH - r0.w.pH)}`) + card('bb', '緩衝溶液 pH', fx(r.b.pH), `變化 ${(r.b.pH - r0.b.pH >= 0 ? '+' : '')}${fx(r.b.pH - r0.b.pH)}`);
    const mx = 2 * cap;
    $('#bbars', el).innerHTML = `<div class="bars"><div><span>HA</span><i style="width:${100 * r.b.nHA / mx}%" class="bha"></i><b class="mono">${fx(r.b.nHA, 2)}</b></div><div><span>A⁻</span><i style="width:${100 * r.b.nA / mx}%" class="ba"></i><b class="mono">${fx(r.b.nA, 2)}</b></div></div><p class="small mut">緩衝溶液中 HA 與 A⁻ 的量（mmol）</p>`;
    const lim = 15, xs = Array.from({ length: 121 }, (_, i) => -lim + i * 2 * lim / 120);
    $('#bch', el).innerHTML = chart({ x: [-lim, lim], y: [0, 14], xt: [-15, -10, -5, 0, 5, 10, 15], yt: [0, 2, 4, 6, 7, 8, 10, 12, 14], xlab: '← 加入 NaOH（mmol）　　　加入 HCl（mmol）→', ylab: 'pH', h: 250, label: '加酸加鹼後的 pH' }, (X, Y) =>
      `<rect class="buf" x="${X(-cap)}" y="${Y(14)}" width="${X(cap) - X(-cap)}" height="${Y(0) - Y(14)}"/><text class="tk" x="${X(0)}" y="${Y(13.2)}" text-anchor="middle">緩衝容量內</text>` +
      `<path class="tline2" d="${path(xs.map(x => [X(x), Y(calc(x).w.pH)]))}"/><path class="tline" d="${path(xs.map(x => [X(x), Y(calc(x).b.pH)]))}"/>` +
      `<circle class="dot2" cx="${X(st.net)}" cy="${Y(r.w.pH)}" r="6"/><circle class="dot" cx="${X(st.net)}" cy="${Y(r.b.pH)}" r="7"/><text class="tk" x="${X(lim) - 4}" y="${Y(calc(lim).w.pH) - 8}" text-anchor="end">純水</text><text class="tk" x="${X(-lim) + 4}" y="${Y(calc(-lim).b.pH) + 16}">緩衝溶液</text>`);
    const over = Math.abs(st.net) > cap;
    $('#bn', el).innerHTML = st.net === 0 ? '兩杯都還沒加東西。緩衝溶液 HA：A⁻ = 1：1，pH = pKa = 4.74。'
      : over ? `加入的${st.net > 0 ? ' H⁺ 已超過 A⁻' : ' OH⁻ 已超過 HA'}的量，緩衝被<b>打穿</b>：多出來的強${st.net > 0 ? '酸' : '鹼'}沒有東西可以吃掉，pH 開始像純水一樣大幅變化。`
        : `${st.net > 0 ? `加入的 ${st.net} mmol H⁺ 被 A⁻ 接走：A⁻ + H⁺ → HA` : `加入的 ${-st.net} mmol OH⁻ 被 HA 中和：HA + OH⁻ → A⁻ + H₂O`}。比例變成 ${fx(r.b.nA, 1)} ÷ ${fx(r.b.nHA, 1)}，pH = 4.74 + log(${fx(r.b.nA / r.b.nHA, 2)}) = ${fx(r.b.pH)}。純水沒有東西可以吃掉它，pH 直接變到 ${fx(r.w.pH)}。`;
    $('#bc', el).value = st.C;
  }
  $$('[data-a]', el).forEach(b => { b.onclick = () => { const a = b.dataset.a; st.net = a === '0' ? 0 : clamp(st.net + (a === 'H' ? step : -step), -15, 15); draw(); }; });
  $('#bc', el).oninput = e => { st.C = +e.target.value; draw(); };
  draw();
  return { set(s) { st.net = s.add === 'H' ? 1 : s.add === 'OH' ? -1 : 0; draw(); } };
};

/* ===== 3. 分率曲線與 Henderson–Hasselbalch ===== */
W.species = el => {
  const st = { pKa: 4.74, pH: 4.74 };
  el.innerHTML = `<div class="w-row"><span class="small mut">常見弱酸：</span>${[[4.74, '醋酸 4.74'], [6.35, '碳酸 6.35'], [9.25, '銨離子 9.25']].map(([v, t]) => `<button class="btn sm ghost" type="button" data-p="${v}">${t}</button>`).join('')}</div>
<div class="w-row"><label class="rng">pKa <input type="range" id="sk" min="2" max="12" step="0.01"><output class="mono" id="sko"></output></label><label class="rng">pH <input type="range" id="sp" min="0" max="14" step="0.05"><output class="mono" id="spo"></output></label></div>
<div id="sch"></div><div id="sbar"></div><div class="cards" id="sk2"></div><p class="note" id="sn"></p>`;
  function draw() {
    const { pKa, pH } = st, fA = 1 / (1 + 10 ** (pKa - pH)), xs = Array.from({ length: 141 }, (_, i) => i / 10);
    $('#sko', el).textContent = fx(pKa); $('#spo', el).textContent = fx(pH); $('#sk', el).value = pKa; $('#sp', el).value = pH;
    $('#sch', el).innerHTML = chart({ x: [0, 14], y: [0, 1], xt: [0, 2, 4, 6, 8, 10, 12, 14], yt: [0, 0.25, 0.5, 0.75, 1], xlab: 'pH', ylab: '所佔比例', h: 250, label: '分率曲線' }, (X, Y) =>
      `<rect class="buf" data-k="range" x="${X(Math.max(0, pKa - 1))}" y="${Y(1)}" width="${X(Math.min(14, pKa + 1)) - X(Math.max(0, pKa - 1))}" height="${Y(0) - Y(1)}"/><text class="tk" x="${X(pKa)}" y="${Y(1) + 14}" text-anchor="middle">pKa ± 1</text>` +
      `<path class="sha" d="${path(xs.map(x => [X(x), Y(1 - 1 / (1 + 10 ** (pKa - x)))]))}"/><path class="sa" d="${path(xs.map(x => [X(x), Y(1 / (1 + 10 ** (pKa - x)))]))}"/>` +
      `<line class="mk" x1="${X(pKa)}" x2="${X(pKa)}" y1="${Y(0)}" y2="${Y(0.5)}"/><text class="tk" x="${X(pKa) + 4}" y="${Y(0.04)}">pKa</text>` +
      `<line class="cur" x1="${X(pH)}" x2="${X(pH)}" y1="${Y(0)}" y2="${Y(1)}"/><circle class="dot" cx="${X(pH)}" cy="${Y(fA)}" r="6"/><circle class="dot2" cx="${X(pH)}" cy="${Y(1 - fA)}" r="6"/>` +
      `<text class="tk lha" x="${X(0.3)}" y="${Y(0.93)}">HA</text><text class="tk la" x="${X(13.7)}" y="${Y(0.93)}" text-anchor="end">A⁻</text>`);
    const nA = Math.round(100 * fA);
    $('#sbar', el).innerHTML = `<div class="stack"><i class="bha" style="width:${100 - nA}%">${100 - nA >= 8 ? `HA ${100 - nA}` : ''}</i><i class="ba" style="width:${nA}%">${nA >= 8 ? `A⁻ ${nA}` : ''}</i></div><p class="small mut">每 100 個分子中，HA 與 A⁻ 各有幾個</p>`;
    const ratio = 10 ** (pH - pKa);
    $('#sk2', el).innerHTML = card('r', '[A⁻] ÷ [HA]', ratio >= 100 || ratio < 0.01 ? sci(ratio, 1) : fx(ratio)) + card('lr', 'log 比例', fx(pH - pKa)) + card('hh', 'pKa + log 比例', fx(pKa + Math.log10(ratio)), '= pH');
    const d = pH - pKa;
    $('#sn', el).innerHTML = Math.abs(d) < 0.05 ? '<b>pH = pKa</b>：HA 和 A⁻ 各佔一半，兩條曲線正好在這裡交叉。'
      : `pH ${d > 0 ? '比 pKa 高' : '比 pKa 低'} ${fx(Math.abs(d))}，所以 [A⁻]/[HA] = 10 的 ${fx(d)} 次方 = ${ratio >= 100 || ratio < 0.01 ? sci(ratio, 1) : fx(ratio)}。${Math.abs(d) > 1 ? '已經超出 pKa ± 1：其中一種形式不到 10%，加酸或加鹼時能「接住」的那一種太少，緩衝效果很差。' : '仍在 pKa ± 1 之內，兩種形式都夠多，緩衝效果好。'}`;
  }
  $('#sk', el).oninput = e => { st.pKa = +e.target.value; draw(); };
  $('#sp', el).oninput = e => { st.pH = +e.target.value; draw(); };
  $$('[data-p]', el).forEach(b => { b.onclick = () => { st.pKa = +b.dataset.p; st.pH = st.pKa; draw(); }; });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 4. 滴定曲線關鍵點的計算 ===== */
W.calc = el => {
  const Va = 25, C0 = 0.1, Cb = 0.1, pKa = 4.74, Ka = 10 ** -pKa, n0 = C0 * Va;
  const PTS = [['0', 0, '起點'], ['10', 10, '緩衝區（10.0 mL）'], ['12.5', 12.5, '半當量點'], ['25', 25, '當量點'], ['30', 30, '鹼過量（30.0 mL）']];
  let cur = '0';
  el.innerHTML = `${seg('cp', PTS.map(p => [p[0], p[2]]), cur)}<div class="calc" id="cbox"></div><div id="cmini"></div>`;
  function steps(v) {
    const nOH = Cb * v, V = Va + v, ex = titr({ Va, Ca0: C0, Cb, Vb: v, pKa });
    let main, s = [], approx;
    if (v === 0) {
      main = '只有弱酸 HA（還沒加鹼）';
      const h = Math.sqrt(Ka * C0); approx = -Math.log10(h);
      s = [`Ka = 10<sup>−${pKa}</sup> = ${sci(Ka)}`, `HA 只解離一小部分：[H⁺] ≈ √(Ka × C) = √(${sci(Ka)} × ${fx(C0, 3)})`, `= ${sci(h)} M`, `pH = −log(${sci(h)}) = <b>${fx(approx)}</b>`];
    } else if (v < 25) {
      main = 'HA 和 A⁻ 並存 → 緩衝溶液';
      const nA = nOH, nHA = n0 - nOH; approx = pKa + Math.log10(nA / nHA);
      s = [`加入 OH⁻：${fx(Cb, 3)} M × ${fx(v, 1)} mL = ${fx(nOH, 2)} mmol`, `HA + OH⁻ → A⁻ + H₂O（完全反應）`, `剩 HA = ${fx(n0, 2)} − ${fx(nOH, 2)} = ${fx(nHA, 2)} mmol；生成 A⁻ = ${fx(nA, 2)} mmol`, `pH = pKa + log(A⁻ ÷ HA) = ${pKa} + log(${fx(nA, 2)} ÷ ${fx(nHA, 2)})`, `= ${pKa} + (${fx(Math.log10(nA / nHA))}) = <b>${fx(approx)}</b>`];
      if (v === 12.5) s.push('A⁻ = HA，log 1 = 0，所以 pH 正好等於 pKa。');
    } else if (v === 25) {
      main = '只剩共軛鹼 A⁻ → 弱鹼水解';
      const C = n0 / V, Kb = 1e-14 / Ka, oh = Math.sqrt(Kb * C); approx = 14 + Math.log10(oh);
      s = [`HA 全部變成 A⁻：${fx(n0, 2)} mmol，總體積 ${fx(V, 1)} mL → [A⁻] = ${fx(C, 4)} M`, `A⁻ + H₂O ⇌ HA + OH⁻，Kb = Kw ÷ Ka = 10⁻¹⁴ ÷ ${sci(Ka)} = ${sci(Kb)}`, `[OH⁻] ≈ √(Kb × C) = √(${sci(Kb)} × ${fx(C, 4)}) = ${sci(oh)} M`, `pOH = ${fx(-Math.log10(oh))}，pH = 14 − pOH = <b>${fx(approx)}</b>`];
    } else {
      main = 'OH⁻ 過量 → 由強鹼決定';
      const exOH = nOH - n0, c = exOH / V; approx = 14 + Math.log10(c);
      s = [`加入 OH⁻ ${fx(nOH, 2)} mmol，中和 HA ${fx(n0, 2)} mmol 後多出 ${fx(exOH, 2)} mmol`, `[OH⁻] = ${fx(exOH, 2)} ÷ ${fx(V, 1)} mL = ${sci(c)} M（A⁻ 水解的貢獻小到可以忽略）`, `pOH = ${fx(-Math.log10(c))}，pH = 14 − pOH = <b>${fx(approx)}</b>`];
    }
    return { main, s, approx, exact: ex.pH, v };
  }
  function draw() {
    const v = +cur, r = steps(v);
    $('#cbox', el).innerHTML = `<p class="cq">① 燒杯裡主要是什麼？　<b>${r.main}</b></p><p class="cq">② 計算</p><ol class="cs">${r.s.map(x => `<li>${x}</li>`).join('')}</ol><p class="cq">③ 對照精確解（解電荷平衡）：pH = ${fx(r.exact)}　${Math.abs(r.exact - r.approx) < 0.03 ? '<span class="ok">✓ 近似成立</span>' : `<span class="warn">差 ${fx(Math.abs(r.exact - r.approx))}</span>`}</p>`;
    const pts = []; for (let x = 0; x <= 40.001; x += Math.abs(x - 25) < 1 ? 0.05 : 0.25) pts.push([x, titr({ Va, Ca0: C0, Cb, Vb: x, pKa }).pH]);
    $('#cmini', el).innerHTML = chart({ x: [0, 40], y: [0, 14], xt: [0, 10, 12.5, 25, 30, 40], yt: [0, 7, 14], xlab: '加入 NaOH（mL）', ylab: 'pH', h: 170, w: 560 }, (X, Y) => `<path class="tline" d="${path(pts.map(([a, b]) => [X(a), Y(b)]))}"/>${PTS.map(p => `<circle class="${p[0] === cur ? 'dot' : 'dot3'}" cx="${X(p[1])}" cy="${Y(titr({ Va, Ca0: C0, Cb, Vb: p[1], pKa }).pH)}" r="${p[0] === cur ? 7 : 4}"/>`).join('')}`);
    pressSeg(el, 'cp', cur);
  }
  bindSeg(el, 'cp', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = String(s.v ?? 0); draw(); } };
};

/* ===== 5. 離去基：共軛酸的 pKa ===== */
W.leaving = el => {
  const X = {
    F: { ion: 'F⁻', ca: 'HF', pKa: 3.2, r: 133, v: '差', d: 'HF 是弱酸，F⁻ 相對不穩定，而且 C–F 鍵很強。氟烷幾乎不進行 SN1／SN2。' },
    Cl: { ion: 'Cl⁻', ca: 'HCl', pKa: -7, r: 181, v: '好', d: 'HCl 是強酸，Cl⁻ 很穩定。' },
    Br: { ion: 'Br⁻', ca: 'HBr', pKa: -9, r: 196, v: '很好', d: 'HBr 比 HCl 更強，Br⁻ 更大、負電荷分散在更大的體積。' },
    I: { ion: 'I⁻', ca: 'HI', pKa: -10, r: 220, v: '最好', d: 'HI 最強，I⁻ 最大、最容易被極化，是鹵素中最好的離去基。' },
    OH: { ion: 'OH⁻', ca: 'H₂O', pKa: 15.7, v: '極差', d: 'H₂O 是極弱的酸，OH⁻ 是強鹼、很不穩定，不願意帶著電子離開。所以醇不能直接被取代。' },
    OH2: { ion: 'H₂O', ca: 'H₃O⁺', pKa: -1.7, v: '好', d: '醇在酸中先質子化成 R–OH₂⁺，離開的是中性的水分子。H₃O⁺ 是強酸，H₂O 很穩定，成為好離去基。' },
  };
  let cur = 'Br';
  el.innerHTML = `${seg('lx', [['F', 'F'], ['Cl', 'Cl'], ['Br', 'Br'], ['I', 'I'], ['OH', 'OH（醇）'], ['OH2', 'OH₂⁺（質子化的醇）']], cur)}<div class="lgrid"><div id="lmol"></div><div id="lion"></div></div><div id="lscale"></div><p class="note" id="ln"></p>`;
  function draw() {
    const d = X[cur], lab = cur === 'OH' ? 'OH' : cur === 'OH2' ? 'OH₂' : cur;
    const sc = { atoms: { C: { x: -0.4, y: 0, t: 'C', c: 'δ+' }, X: { x: 1.0, y: 0, t: lab, c: cur === 'OH2' ? '+' : 'δ−', lp: cur === 'OH2' ? [0] : cur === 'OH' ? [60, -60] : [0, 90, 270] }, h1: { x: -0.85, y: 0.9, t: 'H' }, h2: { x: -1.35, y: -0.35, t: 'H' }, h3: { x: -0.65, y: -0.95, t: 'H' } },
      bonds: [['C', 'X', 's'], ['C', 'h1', 's'], ['C', 'h2', 'w'], ['C', 'h3', 'h']], arrows: [{ f: { b: ['C', 'X'] }, t: { a: 'X' }, bend: -0.9 }] };
    $('#lmol', el).innerHTML = MOL.svg(sc, { w: 260, h: 160, s: 50, label: 'C–X 鍵' }) + `<p class="small mut">電子偏向 ${lab}；離開時帶走整對電子 → ${d.ion}</p>`;
    $('#lion', el).innerHTML = d.r ? `<svg viewBox="0 0 260 160" class="ions">${['F', 'Cl', 'Br', 'I'].map((k, i) => { const r = X[k].r / 9; return `<circle class="${k === cur ? 'ionc on' : 'ionc'}" cx="${40 + i * 62}" cy="80" r="${r}"/><text class="tk" x="${40 + i * 62}" y="${84}" text-anchor="middle">${X[k].ion}</text><text class="tk" x="${40 + i * 62}" y="${140}" text-anchor="middle">${X[k].r} pm</text>`; }).join('')}</svg><p class="small mut">鹵離子半徑：越大，負電荷分散在越大的體積，越穩定</p>` : `<p class="note">${cur === 'OH' ? 'OH⁻ 體積小、電荷集中，是強鹼。' : '離開的是中性分子，不必帶著負電荷離開。'}</p>`;
    const keys = ['I', 'Br', 'Cl', 'OH2', 'F', 'OH'];
    $('#lscale', el).innerHTML = chart({ x: [-12, 18], y: [0, 1], xt: [-10, -5, 0, 5, 10, 15], yt: [], xlab: '離開基團的共軛酸的 pKa　（越左：酸越強 → 離開的基團越穩定 → 越好離開）', h: 170, label: '共軛酸 pKa' }, (Xs, Y) =>
      keys.map((k, i) => { const x = Xs(X[k].pKa), y = Y([0.75, 0.5, 0.25][i % 3]); return `<line class="mk" x1="${x}" x2="${x}" y1="${Y(0)}" y2="${y}"/><circle class="${k === cur ? 'dot' : 'dot3'}" cx="${x}" cy="${y}" r="${k === cur ? 7 : 5}"/><text class="tk${k === cur ? ' hl' : ''}" x="${x}" y="${y - 10}" text-anchor="middle">${X[k].ca}（${X[k].pKa}）</text>`; }).join(''));
    $('#ln', el).innerHTML = `<b>${d.ion} 作為離去基：${d.v}</b>。共軛酸 ${d.ca} 的 pKa = ${d.pKa}。${d.d}`;
    pressSeg(el, 'lx', cur);
  }
  bindSeg(el, 'lx', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.x || cur; draw(); } };
};

/* ===== 6. SN2 機構 ===== */
const GRP = { H: 0.3, 'CH₃': 0.52, 'C₂H₅': 0.6 };
const SUBS = {
  methyl: { n: '甲基', s: ['H', 'H', 'H'], r: '溴甲烷', p: '甲醇', rate: 30 },
  primary: { n: '一級', s: ['H', 'H', 'CH₃'], r: '溴乙烷', p: '乙醇', rate: 1 },
  secondary: { n: '二級', s: ['H', 'CH₃', 'C₂H₅'], r: '(R)-2-溴丁烷', p: '(S)-2-丁醇', rate: 0.025 },
  tertiary: { n: '三級', s: ['CH₃', 'CH₃', 'CH₃'], r: '2-溴-2-甲基丙烷', p: '', rate: 0 },
};
const SLOT = { R: [[-0.38, 1.0], [-1.0, -0.42], [-0.12, -1.05]], T: [[0, 1.1], [-0.6, -0.62], [0.55, -0.82]], P: [[0.38, 1.0], [1.0, -0.42], [0.12, -1.05]] };
const subAtoms = (labels, pos, halo = true) => Object.fromEntries(labels.map((t, i) => [`s${i}`, { x: pos[i][0], y: pos[i][1], t, halo: halo ? GRP[t] : 0 }]));
const subBonds = (c = 'C') => [[c, 's0', 's'], [c, 's1', 'w'], [c, 's2', 'h']];
W.sn2 = el => {
  let sub = 'secondary', pl;
  el.innerHTML = `${seg('s2s', Object.entries(SUBS).map(([k, v]) => [k, `${v.n}（${v.r}）`]), sub)}<div id="s2p"></div><div id="s2r"></div>`;
  const frames = () => {
    const S = SUBS[sub], lb = S.s;
    const R = { atoms: { O: { x: -3.0, y: 0, t: 'HO', c: '−', lp: [0, 90, 270] }, C: { x: 0, y: 0, t: 'C', c: 'δ+' }, Br: { x: 1.95, y: 0, t: 'Br', c: 'δ−', lp: [0, 90, 270] }, ...subAtoms(lb, SLOT.R) },
      bonds: [['C', 'Br', 's'], ...subBonds()], arrows: [{ f: { lp: ['O', 0] }, t: { a: 'C' }, bend: -0.35 }, { f: { b: ['C', 'Br'] }, t: { a: 'Br' }, bend: -0.9 }], notes: [{ x: 0, y: -2.05, t: S.r }] };
    if (sub === 'tertiary') return [
      { sc: R, at: 0, cap: '三級碳上三個甲基把背面擋住了。親核基能不能靠近？按「下一步」。' },
      { sc: { ...R, atoms: { ...R.atoms, O: { ...R.atoms.O, x: -2.3 } }, arrows: [], notes: [{ x: -1.25, y: 0.35, t: '✕', cls: 'bad' }, { x: 0, y: -2.05, t: '背面被三個甲基擋住：SN2 幾乎不發生' }] }, at: 0.25, cap: '親核基撞上三個甲基的電子雲，到不了碳的背面。三級鹵烷改走 SN1 或 E2（後面兩節）。' }];
    const T = { atoms: { O: { x: -2.05, y: 0, t: 'HO', c: 'δ−', lp: [90, 270] }, C: { x: 0, y: 0, t: 'C' }, Br: { x: 2.1, y: 0, t: 'Br', c: 'δ−', lp: [0, 90, 270] }, ...subAtoms(lb, SLOT.T) },
      bonds: [['O', 'C', 'p'], ['C', 'Br', 'p'], ...subBonds()], ts: true };
    const P = { atoms: { O: { x: -1.5, y: 0, t: 'HO', lp: [90, 270] }, C: { x: 0, y: 0, t: 'C' }, Br: { x: 3.3, y: 0, t: 'Br', c: '−', lp: [0, 90, 180, 270] }, ...subAtoms(lb, SLOT.P) },
      bonds: [['O', 'C', 's'], ...subBonds()], notes: [{ x: 0, y: -2.05, t: `${S.p}（構型反轉）` }] };
    return [
      { sc: R, at: 0, cap: '親核基 HO⁻ 的孤對電子對準碳的<b>背面</b>（和 Br 相反的方向）。彎箭頭表示電子對的移動：一對從 O 流向 C，另一對從 C–Br 鍵流向 Br。碳周圍的淡色圓表示各基團佔的空間。' },
      { sc: T, at: 0.5, cap: '<b>過渡狀態</b>：O–C 鍵形成一半、C–Br 鍵斷了一半（虛線），三個基團被推到同一平面。這是能量最高點，碳此時同時連著五個基團，所以基團越大越擠、能量越高。' },
      { sc: P, at: 1, cap: `產物：三個基團像雨傘一樣翻到另一側，<b>構型反轉</b>。${sub === 'secondary' ? '(R)-2-溴丁烷變成 (S)-2-丁醇。' : ''}Br⁻ 帶著原本 C–Br 鍵的電子對離開。` }];
  };
  function rates() {
    const mx = Math.log10(30) + 2.5;
    $('#s2r', el).innerHTML = `<p class="lbl">SN2 相對速率（以乙基 = 1；常見教學數據，數值隨親核基與溶劑而異，數量級才是重點）</p><div class="bars">${Object.entries(SUBS).map(([k, v]) => `<div class="${k === sub ? 'on' : ''}"><span>${v.n}</span><i class="ba" style="width:${v.rate ? 100 * (Math.log10(v.rate) + 2.5) / mx : 1}%"></i><b class="mono">${v.rate || '≈ 0'}</b></div>`).join('')}</div><p class="small mut">長條為對數長度：每多一個基團擋住背面，速率就掉好幾十倍。</p>`;
  }
  pl = mechPlayer($('#s2p', el), { frames, energy: [[0, 0.3], [0.5, 0.9], [1, 0.12]], elabels: [[0, '反應物'], [0.5, '過渡狀態'], [1, '產物']], w: 520, h: 250, label: 'SN2 反應機構' });
  bindSeg(el, 's2s', v => { sub = v; pressSeg(el, 's2s', v); pl.reset(); rates(); });
  rates();
  return { set(s) { if (s.sub) { sub = s.sub; pressSeg(el, 's2s', sub); pl.reset(); rates(); } pl.go(s.step || 0, false); } };
};

/* ===== 7. SN1 機構（可選擇進攻方向）＋碳陽離子穩定度 ===== */
W.sn1 = el => {
  let side = 'L', pl;
  el.innerHTML = `${seg('s1d', [['L', '水從左邊進攻'], ['R', '水從右邊進攻']], side)}<div id="s1p"></div><div id="s1s"></div>`;
  const lb = ['CH₃', 'C₂H₅', 'C₃H₇'];
  const frames = () => {
    const k = side === 'L' ? -1 : 1, W2 = (x, y) => ({ O: { x: k * x, y, t: 'O', lp: [side === 'L' ? 0 : 180, side === 'L' ? 180 : 0] }, Ha: { x: k * (x + 0.45), y: y + 0.75, t: 'H' }, Hb: { x: k * (x + 0.45), y: y - 0.75, t: 'H' } });
    const wb = [['O', 'Ha', 's'], ['O', 'Hb', 's']], br = { x: 1.0, y: -2.05, t: 'Br', c: '−', lp: [0, 90, 180, 270] };
    const F0 = { atoms: { C: { x: 0, y: 0, t: 'C', c: 'δ+' }, Br: { x: 1.95, y: 0, t: 'Br', c: 'δ−', lp: [0, 90, 270] }, ...subAtoms(lb, SLOT.R, false) }, bonds: [['C', 'Br', 's'], ...subBonds()], arrows: [{ f: { b: ['C', 'Br'] }, t: { a: 'Br' }, bend: -0.9 }], notes: [{ x: 0, y: -2.1, t: '3-溴-3-甲基己烷（三級）' }] };
    const F1 = { atoms: { C: { x: 0, y: 0, t: 'C', c: '+' }, Br: br, ...subAtoms(lb, SLOT.T, false) }, bonds: subBonds(), orbs: [{ a: 'C', ang: 0 }] };
    const F2 = { atoms: { ...F1.atoms, ...W2(2.35, 0) }, bonds: [...F1.bonds, ...wb], orbs: F1.orbs, arrows: [{ f: { lp: ['O', side === 'L' ? 0 : 180] }, t: { a: 'C' }, bend: side === 'L' ? -0.35 : 0.35 }] };
    const W3 = W2(1.5, 0), O2 = { x: k * 3.1, y: 1.55, t: 'H₂O', lp: [side === 'L' ? -31 : -149] };
    const F3 = { atoms: { C: { x: 0, y: 0, t: 'C' }, Br: br, ...subAtoms(lb, side === 'L' ? SLOT.P : SLOT.R, false), ...W3, O: { ...W3.O, c: '+', lp: [] }, O2 }, bonds: [['C', 'O', 's'], ...subBonds(), ...wb],
      arrows: [{ f: { lp: ['O2', side === 'L' ? -31 : -149] }, t: { a: 'Ha' }, bend: side === 'L' ? -0.3 : 0.3 }, { f: { b: ['O', 'Ha'] }, t: { a: 'O' }, bend: side === 'L' ? 0.6 : -0.6 }] };
    const F4 = { atoms: { ...F3.atoms, O: { ...W3.O, lp: [] }, Ha: { x: k * 2.55, y: 1.05, t: 'H' }, O2: { ...O2, c: '+', lp: [] } }, bonds: [['C', 'O', 's'], ...subBonds(), ['O', 'Hb', 's'], ['O2', 'Ha', 's']],
      notes: [{ x: 0, y: -2.1, t: side === 'L' ? '構型反轉的產物' : '構型保留的產物' }] };
    return [
      { sc: F0, at: 0, cap: '<b>第一步（慢）</b>：C–Br 鍵自己斷開，兩個電子都跟著 Br 走。這一步只有鹵烷參與，決定整個反應的速率：rate = k[RX]。' },
      { sc: F1, at: 0.45, cap: '生成<b>碳陽離子</b>：中心碳只剩三個基團，攤成平面（sp²）。空的 p 軌域兩瓣朝左右，兩邊都可以接受電子。' },
      { sc: F2, at: 0.45, cap: `<b>第二步（快）</b>：水的孤對電子攻擊帶正電的碳，這次從${side === 'L' ? '左' : '右'}邊。切換上面的按鈕可以改從另一邊。` },
      { sc: F3, at: 0.76, cap: '生成質子化的醇（氧帶正電）。<b>第三步</b>：另一個水分子拿走 O 上的 H⁺。' },
      { sc: F4, at: 1, cap: `產物：醇 + H₃O⁺。${side === 'L' ? '從左邊（原本 Br 的背面）進攻，基團翻到另一側：<b>構型反轉</b>。' : '從右邊（原本 Br 的那一側）進攻，基團留在原位：<b>構型保留</b>。'}兩種產物互為鏡像，所以 SN1 得到接近外消旋的混合物。` }];
  };
  pl = mechPlayer($('#s1p', el), { frames, energy: [[0, 0.3], [0.25, 0.92], [0.45, 0.62], [0.6, 0.72], [0.76, 0.4], [0.88, 0.46], [1, 0.16]], elabels: [[0.25, '過渡狀態 1'], [0.45, '碳陽離子', 16]], w: 520, h: 250, label: 'SN1 反應機構' });
  bindSeg(el, 's1d', v => { side = v; pressSeg(el, 's1d', v); const i = pl.i; pl.reset(); pl.go(i, false); });
  const CC = [['甲基 CH₃⁺', 0], ['一級 CH₃CH₂⁺', 3], ['二級 (CH₃)₂CH⁺', 6], ['三級 (CH₃)₃C⁺', 9]];
  $('#s1s', el).innerHTML = `<p class="lbl">碳陽離子穩定度：相鄰 C–H 鍵越多，越能分攤正電荷（超共軛）</p><div class="bars">${CC.map(([n, k]) => `<div><span>${n}</span><i class="ba" style="width:${k / 9 * 100}%"></i><b class="mono">${k} 個 C–H</b></div>`).join('')}</div><p class="small mut">穩定度：三級 > 二級 > 一級 > 甲基。一級與甲基碳陽離子太不穩定，實際上不走 SN1。</p>`;
  return { set(s) { if (s.side) { side = s.side; pressSeg(el, 's1d', side); pl.reset(); } pl.go(s.step || 0, false); } };
};

/* ===== 8. E2 機構 ===== */
W.e2 = el => {
  el.innerHTML = '<div id="e2p"></div>';
  const frames = () => {
    const F0 = { atoms: { Cb: { x: -0.7, y: 0, t: 'C' }, Ca: { x: 0.7, y: 0, t: 'C' }, H: { x: -1.05, y: 1.0, t: 'H', hl: 1 }, b1: { x: -1.5, y: -0.45, t: 'H' }, b2: { x: -0.95, y: -0.95, t: 'H' }, Br: { x: 1.05, y: -1.0, t: 'Br', lp: [0, 270, 315] }, m: { x: 1.55, y: 0.45, t: 'CH₃' }, h: { x: 0.95, y: 0.95, t: 'H' }, O: { x: -1.95, y: 2.15, t: 'EtO', c: '−', lp: [-52] } },
      bonds: [['Cb', 'Ca', 's'], ['Cb', 'H', 's'], ['Cb', 'b1', 'w'], ['Cb', 'b2', 'h'], ['Ca', 'Br', 's'], ['Ca', 'm', 'w'], ['Ca', 'h', 'h']],
      arrows: [{ f: { lp: ['O', -52] }, t: { a: 'H' }, bend: -0.3 }, { f: { b: ['Cb', 'H'] }, t: { m: ['Cb', 'Ca'] }, bend: 0.5 }, { f: { b: ['Ca', 'Br'] }, t: { a: 'Br' }, bend: 0.7 }], notes: [{ x: 0, y: -2.0, t: '2-溴丙烷 + 乙氧基' }] };
    const F1 = { atoms: { Cb: { x: -0.65, y: 0, t: 'C' }, Ca: { x: 0.65, y: 0, t: 'C' }, H: { x: -1.3, y: 1.6, t: 'H' }, b1: { x: -1.25, y: -0.6, t: 'H' }, b2: { x: -1.25, y: 0.6, t: 'H' }, Br: { x: 1.7, y: -1.75, t: 'Br', c: '−', lp: [0, 90, 180, 270] }, m: { x: 1.4, y: 0.6, t: 'CH₃' }, h: { x: 1.25, y: -0.6, t: 'H' }, O: { x: -1.95, y: 2.15, t: 'EtO', lp: [] } },
      bonds: [['Cb', 'Ca', 'd'], ['Cb', 'b1', 's'], ['Cb', 'b2', 's'], ['Ca', 'm', 's'], ['Ca', 'h', 's'], ['O', 'H', 's']], notes: [{ x: 0, y: -2.0, t: '丙烯 + EtOH + Br⁻' }] };
    return [
      { sc: F0, at: 0, cap: '強鹼 EtO⁻ 對準 <b>β-碳上的 H</b>（紅色）。注意這個 H 和 Br 分別在 C–C 鍵的上下兩側、同一平面：<b>反式共平面</b>。三個彎箭頭同時發生。' },
      { sc: F1, at: 1, cap: '一步完成：鹼拿走 H 變成 EtOH、C–H 的電子對變成 C=C 的 π 鍵、Br⁻ 帶著電子對離開。產物是丙烯。' }];
  };
  const pl = mechPlayer($('#e2p', el), { frames, energy: [[0, 0.3], [0.5, 0.88], [1, 0.12]], elabels: [[0.5, '過渡狀態']], w: 520, h: 280, cy: 150, label: 'E2 反應機構' });
  return { set(s) { pl.go(s.step || 0, false); } };
};

/* ===== 9. 紐曼投影：轉動後碳，找反式共平面 ===== */
W.newman = el => {
  let ang = 60;
  el.innerHTML = `<div class="w-row"><label class="rng">轉動後面的碳（H–C–C–Br 二面角）<input type="range" id="nwa" min="0" max="360" step="5" value="60"><output class="mono" id="nwo"></output></label></div><div class="w-row">${[0, 60, 120, 180, 240, 300].map(a => `<button class="btn sm ghost" type="button" data-a="${a}">${a}°</button>`).join('')}</div><div class="ngrid"><div id="nws"></div><p class="note" id="nwn"></p></div>`;
  function draw() {
    const cx = 150, cy = 130, R = 52, L = 98, P = (a, r) => [cx + Math.cos(a * Math.PI / 180) * r, cy - Math.sin(a * Math.PI / 180) * r];
    const front = [[90, 'H', 'hl'], [210, 'H', ''], [330, 'H', '']], back = [[90 - ang, 'Br', 'br'], [210 - ang, 'CH₃', ''], [330 - ang, 'H', '']];
    const vis = a => { const r = ((a - 90) % 120 + 180) % 120 - 60; return Math.abs(r) < 16 ? a - r + (r < 0 ? -16 : 16) : a; };  // 重疊式時後方基團稍微錯開，畫面才看得到
    const bl = ([a0, t, c]) => { const a = vis(a0), [x1, y1] = P(a, R), [x2, y2] = P(a, L); const [tx, ty] = P(a, L + 16); return `<line class="nb" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="at ${c}" x="${tx}" y="${ty + 5}" text-anchor="middle">${t}</text>`; };
    const fl = ([a, t, c]) => { const [x2, y2] = P(a, L - 10); const [tx, ty] = P(a, L + 6); return `<line class="nb" x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}"/><text class="at ${c}" x="${tx}" y="${ty + 5}" text-anchor="middle">${t}</text>`; };
    $('#nws', el).innerHTML = `<svg viewBox="0 0 300 260" class="mol" role="img" aria-label="紐曼投影式">${back.map(bl).join('')}<circle class="nc" cx="${cx}" cy="${cy}" r="${R}"/>${front.map(fl).join('')}<circle cx="${cx}" cy="${cy}" r="3" class="lp"/></svg>`;
    const d = ((ang % 360) + 360) % 360, anti = Math.abs(d - 180) <= 10, syn = d <= 10 || d >= 350;
    $('#nwn', el).innerHTML = `前面的碳（β 碳）：紅色的 H；後面的碳：Br。二面角 ${d}°。<br>` + (anti ? '<span class="ok">✓ 反式共平面</span>：H 和 Br 在相反兩側且同一平面，C–H 的電子可以順利推進 C–Br 的反鍵結軌域，<b>E2 可以發生</b>。這也是交錯式構形，能量低。'
      : syn ? '<span class="warn">順式共平面</span>：理論上軌域也平行，但這是重疊式構形，H 和 Br 擠在一起，能量很高，很少經由這個構形反應。'
        : '<span class="bad">✕ 不行</span>：C–H 和 C–Br 沒有平行，電子推不過去。分子要先轉到 180°（反式共平面）才能進行 E2。');
    $('#nwo', el).textContent = `${d}°`; $('#nwa', el).value = d;
  }
  $('#nwa', el).oninput = e => { ang = +e.target.value; draw(); };
  $$('[data-a]', el).forEach(b => { b.onclick = () => { ang = +b.dataset.a; draw(); }; });
  draw();
  return { set(s) { ang = s.ang ?? ang; draw(); } };
};

/* ===== 10. 查依采夫 vs 霍夫曼 ===== */
W.zaitsev = el => {
  let base = 'eto';
  const B = { eto: { n: '乙氧基 EtO⁻（體積小）', z: '主產物', h: '次產物' }, tbuo: { n: '第三丁氧基 t-BuO⁻（體積大）', z: '次產物', h: '主產物' } };
  el.innerHTML = `${seg('zb', Object.entries(B).map(([k, v]) => [k, v.n]), base)}<div class="zgrid"><div id="zs"></div><div id="zp"></div></div><p class="note" id="zn"></p>`;
  function draw() {
    const big = base === 'tbuo';
    const sc = { atoms: { C2: { x: 0, y: 0, t: 'C' }, C1: { x: -1.0, y: 0.55, t: 'CH₃', hl: big ? 1 : 0, halo: big ? 0.55 : 0 }, Me: { x: -1.0, y: -0.6, t: 'CH₃', hl: big ? 1 : 0, halo: big ? 0.55 : 0 }, Br: { x: 0, y: -1.1, t: 'Br' }, C3: { x: 1.0, y: 0.55, t: 'CH₂', hl: big ? 0 : 1, halo: big ? 0 : 0.55 }, C4: { x: 2.05, y: 0, t: 'CH₃' },
      Bs: { x: big ? -1.95 : 1.55, y: big ? 1.6 : 1.75, t: big ? 't-BuO⁻' : 'EtO⁻', halo: big ? 0.85 : 0.45 } },
      bonds: [['C2', 'C1', 's'], ['C2', 'Me', 's'], ['C2', 'Br', 's'], ['C2', 'C3', 's'], ['C3', 'C4', 's']] };
    $('#zs', el).innerHTML = MOL.svg(sc, { w: 300, h: 210, s: 52, cx: 140, cy: 110, label: '2-溴-2-甲基丁烷' }) + `<p class="small mut">2-溴-2-甲基丁烷。β-H 有兩種：CH₂ 上 2 個（內側），兩個 CH₃ 上共 6 個（外側）。</p>`;
    const d = B[base];
    $('#zp', el).innerHTML = `<div class="prod"><p class="pf">(CH₃)₂C=CH–CH₃</p><p class="small">2-甲基-2-丁烯　三取代烯（較穩定）<br>拿走內側 CH₂ 的 H：<b>查依采夫產物</b></p><p class="pbadge ${d.z === '主產物' ? 'on' : ''}">${d.z}</p></div>
<div class="prod"><p class="pf">CH₂=C(CH₃)–CH₂CH₃</p><p class="small">2-甲基-1-丁烯　二取代烯<br>拿走外側 CH₃ 的 H：<b>霍夫曼產物</b></p><p class="pbadge ${d.h === '主產物' ? 'on' : ''}">${d.h}</p></div>`;
    $('#zn', el).innerHTML = big ? '體積很大的 t-BuO⁻ 擠不進三級碳旁邊的 CH₂，只能拿外側、比較好接近的 CH₃ 上的 H，所以取代較少的烯反而是主產物。'
      : '小的 EtO⁻ 兩種 H 都拿得到。形成取代較多的雙鍵，過渡狀態已經有部分雙鍵的穩定性，所以較穩定的三取代烯是主產物。';
    pressSeg(el, 'zb', base);
  }
  bindSeg(el, 'zb', v => { base = v; draw(); });
  draw();
  return { set(s) { base = s.base || base; draw(); } };
};

/* ===== 11. E1 機構 ===== */
W.e1 = el => {
  el.innerHTML = '<div id="e1p"></div>';
  const frames = () => {
    const base = { Cb: { x: -0.7, y: 0, t: 'C' }, H: { x: -1.05, y: 1.0, t: 'H', hl: 1 }, b1: { x: -1.5, y: -0.45, t: 'H' }, b2: { x: -0.95, y: -0.95, t: 'H' } };
    const F0 = { atoms: { ...base, Ca: { x: 0.7, y: 0, t: 'C' }, Br: { x: 1.05, y: -1.0, t: 'Br', lp: [0, 270, 315] }, m1: { x: 1.55, y: 0.45, t: 'CH₃' }, m2: { x: 0.95, y: 0.95, t: 'CH₃' } },
      bonds: [['Cb', 'Ca', 's'], ['Cb', 'H', 's'], ['Cb', 'b1', 'w'], ['Cb', 'b2', 'h'], ['Ca', 'Br', 's'], ['Ca', 'm1', 'w'], ['Ca', 'm2', 'h']], arrows: [{ f: { b: ['Ca', 'Br'] }, t: { a: 'Br' }, bend: 0.7 }], notes: [{ x: 0, y: -2.0, t: '2-溴-2-甲基丙烷' }] };
    const cat = { ...base, Ca: { x: 0.7, y: 0, t: 'C', c: '+' }, Br: { x: 1.8, y: -1.75, t: 'Br', c: '−', lp: [0, 90, 180, 270] }, m1: { x: 1.4, y: 0.75, t: 'CH₃' }, m2: { x: 1.4, y: -0.75, t: 'CH₃' } };
    const cb = [['Cb', 'Ca', 's'], ['Cb', 'H', 's'], ['Cb', 'b1', 'w'], ['Cb', 'b2', 'h'], ['Ca', 'm1', 's'], ['Ca', 'm2', 's']];
    const F1 = { atoms: cat, bonds: cb };
    const F2 = { atoms: { ...cat, O: { x: -1.95, y: 2.15, t: 'H₂O', lp: [-52] } }, bonds: cb, arrows: [{ f: { lp: ['O', -52] }, t: { a: 'H' }, bend: -0.3 }, { f: { b: ['Cb', 'H'] }, t: { m: ['Cb', 'Ca'] }, bend: 0.5 }] };
    const F3 = { atoms: { Cb: { x: -0.65, y: 0, t: 'C' }, Ca: { x: 0.65, y: 0, t: 'C' }, H: { x: -1.3, y: 1.6, t: 'H' }, b1: { x: -1.25, y: -0.6, t: 'H' }, b2: { x: -1.25, y: 0.6, t: 'H' }, Br: cat.Br, m1: { x: 1.4, y: 0.6, t: 'CH₃' }, m2: { x: 1.4, y: -0.6, t: 'CH₃' }, O: { x: -1.95, y: 2.15, t: 'H₂O', c: '+' } },
      bonds: [['Cb', 'Ca', 'd'], ['Cb', 'b1', 's'], ['Cb', 'b2', 's'], ['Ca', 'm1', 's'], ['Ca', 'm2', 's'], ['O', 'H', 's']], notes: [{ x: 0, y: -2.0, t: '2-甲基丙烯 + H₃O⁺' }] };
    return [
      { sc: F0, at: 0, cap: '<b>第一步（慢）</b>：和 SN1 完全相同，C–Br 鍵先斷開。' },
      { sc: F1, at: 0.45, cap: '生成三級碳陽離子。接下來它可以被水加上去（SN1），也可以失去 β-H（E1）。' },
      { sc: F2, at: 0.45, cap: '<b>第二步</b>：水當作弱鹼，拿走 β-碳上的 H；C–H 的電子對轉過去形成 C=C。這裡不需要反式共平面：碳陽離子的空軌域隨時對得上。' },
      { sc: F3, at: 1, cap: '產物：2-甲基丙烯 + H₃O⁺ + Br⁻。一個分子變成三個，熵增加，所以加熱有利於 E1。' }];
  };
  const pl = mechPlayer($('#e1p', el), { frames, energy: [[0, 0.3], [0.25, 0.92], [0.45, 0.62], [0.62, 0.74], [1, 0.22]], elabels: [[0.25, '過渡狀態 1'], [0.45, '碳陽離子', 16]], w: 520, h: 260, label: 'E1 反應機構' });
  return { set(s) { pl.go(s.step || 0, false); } };
};

/* ===== 12. 判斷器 ===== */
W.decide = el => {
  const st = { sub: 'secondary', reag: 'base', solv: 'protic', heat: false };
  const SUB = { methyl: '甲基（CH₃X）', primary: '一級（RCH₂X）', secondary: '二級（R₂CHX）', tertiary: '三級（R₃CX）' };
  const REAG = { nuc: '強親核、弱鹼（I⁻、Br⁻、RS⁻、N₃⁻、CN⁻）', base: '強鹼、強親核（OH⁻、RO⁻）', bulky: '體積大的強鹼（t-BuO⁻）', weak: '弱親核、弱鹼（H₂O、ROH）' };
  const SOLV = { protic: '極性質子性（水、醇）', aprotic: '極性非質子性（丙酮、DMSO、DMF）' };
  el.innerHTML = `<p class="lbl">基質</p>${seg('ds', Object.entries(SUB), st.sub)}<p class="lbl">試劑</p>${seg('dr', Object.entries(REAG), st.reag)}<p class="lbl">溶劑</p>${seg('dv', Object.entries(SOLV), st.solv)}<label class="chk"><input type="checkbox" id="dh"> 加熱</label><div class="verdict" id="dv0"></div><ol class="reason" id="dl"></ol>`;
  function decide({ sub, reag, solv, heat }) {
    const s = [];
    s.push({ methyl: '甲基：背面最空，最適合 SN2；沒有 β-H，不能脫去；甲基碳陽離子極不穩定，不走 SN1／E1。', primary: '一級：背面還算空，SN2 容易；一級碳陽離子很不穩定，不走 SN1／E1。', secondary: '二級：背面有點擠、碳陽離子中等穩定，四條路都有可能，關鍵看試劑。', tertiary: '三級：背面被三個基團擋住，不走 SN2；碳陽離子穩定，可以走 SN1／E1；也有很多 β-H 可以做 E2。' }[sub]);
    s.push({ nuc: '試劑是好的親核基但鹼性弱：傾向去攻擊碳（取代），不太去拿 H（脫去）。', base: '試劑是強鹼，也是強親核基：取代和脫去互相競爭，基質越擠越偏向脫去。', bulky: '試劑是體積很大的強鹼：擠不到碳旁邊做取代，幾乎只拿外側的 β-H 做 E2。', weak: '試劑是弱親核、弱鹼：推不動 SN2，也拿不動 H 做 E2，只能等鹵烷自己解離成碳陽離子（SN1／E1）。' }[reag]);
    let major, minor = '';
    if (sub === 'methyl') { major = reag === 'weak' ? '幾乎不反應' : 'SN2'; if (reag === 'bulky') s.push('沒有 β-H 可以拿，t-BuO⁻ 只能很慢地做 SN2。'); if (reag === 'weak') s.push('弱親核基推不動 SN2，甲基碳陽離子又生不出來。'); }
    else if (sub === 'primary') {
      if (reag === 'nuc') major = 'SN2'; else if (reag === 'base') { major = 'SN2'; minor = 'E2'; s.push('一級背面夠空，強鹼大多直接當親核基做 SN2；加熱會讓 E2 比例上升。'); }
      else if (reag === 'bulky') { major = 'E2'; minor = 'SN2'; } else { major = '幾乎不反應'; s.push('一級碳陽離子太不穩定，弱親核基又推不動 SN2。'); }
    } else if (sub === 'secondary') {
      if (reag === 'nuc') major = 'SN2'; else if (reag === 'base') { major = 'E2'; minor = 'SN2'; s.push('二級背面有點擠，強鹼拿 β-H 比擠進背面容易，所以 E2 為主。'); }
      else if (reag === 'bulky') major = 'E2';
      else { major = heat ? 'E1' : 'SN1'; minor = heat ? 'SN1' : 'E1'; s.push('二級碳陽離子勉強可以生成，反應很慢，而且產物是取代和脫去的混合物。'); }
    } else {
      if (reag === 'nuc') { major = solv === 'protic' ? 'SN1' : 'SN1（很慢）'; minor = 'E1'; s.push(solv === 'protic' ? '背面被擋住只能走 SN1：先解離成碳陽離子，親核基再加上去。' : 'SN1 需要極性質子性溶劑幫忙穩定生成的離子；在非質子性溶劑中解離很慢。'); }
      else if (reag === 'base') { major = 'E2'; s.push('強鹼不必等碳陽離子生成，直接拿 β-H 做 E2，比 SN1 快得多。'); }
      else if (reag === 'bulky') { major = 'E2'; s.push('大體積的鹼拿外側的 H，霍夫曼產物（取代較少的烯）比例較高。'); }
      else { major = heat ? 'E1' : 'SN1'; minor = heat ? 'SN1' : 'E1'; }
    }
    if (/SN2/.test(major)) s.push(solv === 'aprotic' ? '溶劑是非質子性：不會用氫鍵包住親核基，親核基更有攻擊力，有利 SN2。' : '溶劑是質子性：會用氫鍵包住親核基，SN2 會變慢一些；換成丙酮、DMSO 會更快。');
    if (/SN1|E1/.test(major) && solv === 'protic') s.push('溶劑是極性質子性：能穩定碳陽離子和 X⁻，幫助第一步解離。');
    if (heat && /SN1|E1|SN2|E2/.test(major)) s.push(/E1|E2/.test(major) ? '加熱：脫去讓分子數增加（熵增加），高溫更有利於脫去。' : '加熱：會提高脫去產物的比例。');
    return { major, minor, s };
  }
  function draw() {
    const r = decide(st);
    $('#dv0', el).innerHTML = `<span class="lbl">主要</span><b class="big">${r.major}</b>${r.minor ? `<span class="lbl">次要</span><b>${r.minor}</b>` : ''}`;
    $('#dl', el).innerHTML = r.s.map(x => `<li>${x}</li>`).join('');
    pressSeg(el, 'ds', st.sub); pressSeg(el, 'dr', st.reag); pressSeg(el, 'dv', st.solv); $('#dh', el).checked = st.heat;
  }
  bindSeg(el, 'ds', v => { st.sub = v; draw(); }); bindSeg(el, 'dr', v => { st.reag = v; draw(); }); bindSeg(el, 'dv', v => { st.solv = v; draw(); });
  $('#dh', el).onchange = e => { st.heat = e.target.checked; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};
