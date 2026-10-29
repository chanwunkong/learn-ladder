/* ---------- 後中化學：計量化學與溶液的互動圖 ---------- */
const AM = { H: 1.008, C: 12.01, N: 14.01, O: 16.00, S: 32.07, Cl: 35.45, Ca: 40.08, As: 74.92 };
const parseF = f => { const out = {}; f.replace(/([A-Z][a-z]?)(\d*)/g, (_, e, n) => { out[e] = (out[e] || 0) + (+n || 1); }); return out; };
const molarM = f => Object.entries(parseF(f)).reduce((a, [e, n]) => a + AM[e] * n, 0);
const subF = f => f.replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);

/* ===== 1. 有效數字：加減看小數位、乘除看位數 ===== */
const SF = [['4.23', '23.68'], ['23.68', '4.12'], ['0.0050', '12.30'], ['1.2', '3.456']];
const sigCount = s => { const t = s.replace('-', ''), d = t.replace('.', '').replace(/^0+/, ''); return t.includes('.') ? d.length : d.replace(/0+$/, '').length; };
const decimals = s => (s.includes('.') ? s.split('.')[1].length : 0);
W.sigfig = el => {
  const st = { i: 0, op: '+' };
  el.innerHTML = `<div class="w-row">${SF.map(([a, b], i) => `<button class="btn sm ghost" type="button" data-i="${i}">${a} 與 ${b}</button>`).join('')}</div>${seg('sfO', [['+', '相加'], ['×', '相乘']], st.op)}<div class="sfg" id="sfG"></div><p class="note" id="sfN"></p>`;
  const digits = s => { let seen = false; return s.split('').map(c => { if (c === '.') return '<span class="sd">.</span>'; if (c !== '0') seen = true; return `<span class="${seen ? 'sg' : 'ns'}">${c}</span>`; }).join(''); };
  function draw() {
    const [a, b] = SF[st.i], A = +a, B = +b;
    if (st.op === '+') {
      const dp = Math.min(decimals(a), decimals(b)), r = (A + B).toFixed(dp), w = Math.max(a.split('.')[0].length, b.split('.')[0].length);
      const pad = s => '&nbsp;'.repeat(w - s.split('.')[0].length) + digits(s);
      $('#sfG', el).innerHTML = `<div class="mono sfa">${pad(a)}<br>+ ${pad(b).replace(/^(&nbsp;)/, '')}<hr>${'&nbsp;'.repeat(Math.max(0, w - r.split('.')[0].length))}${digits(r)}</div><div class="cards">${card('a', `${a} 的小數位`, decimals(a))}${card('b', `${b} 的小數位`, decimals(b))}${card('r', '結果取', `${dp} 位小數`, `= ${r}`)}</div>`;
      $('#sfN', el).innerHTML = `加減法看<b>小數點後的位數</b>：把小數點對齊，結果只能保留到兩者中最不精確的那一位（${dp} 位小數），結果 ${r} 有 ${sigCount(r)} 位有效數字。`;
    } else {
      const n = Math.min(sigCount(a), sigCount(b)), r = Number((A * B).toPrecision(n));
      $('#sfG', el).innerHTML = `<div class="mono sfa">${digits(a)} × ${digits(b)} = ${(A * B).toPrecision(8).replace(/0+$/, '')}<br>→ <b>${r.toPrecision(n)}</b></div><div class="cards">${card('a', `${a} 的有效數字`, sigCount(a))}${card('b', `${b} 的有效數字`, sigCount(b))}${card('r', '結果取', `${n} 位`, `= ${r.toPrecision(n)}`)}</div>`;
      $('#sfN', el).innerHTML = `乘除法看<b>有效數字的位數</b>（深色的數字）：結果和兩者中位數較少的相同。開頭的 0 只是定位，不算有效數字（0.0050 只有 2 位）；小數點後面結尾的 0 要算。`;
    }
    pressSeg(el, 'sfO', st.op);
    $$('[data-i]', el).forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.i === st.i)));
  }
  $$('[data-i]', el).forEach(x => { x.onclick = () => { st.i = +x.dataset.i; draw(); }; });
  bindSeg(el, 'sfO', v => { st.op = v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. 莫耳：質量、粒子數、體積的換算中心 ===== */
const MOLC = [['C6H12O6', '葡萄糖', 0], ['H2O', '水', 0], ['CO2', '二氧化碳', 1], ['NH3', '氨', 1], ['CaCO3', '碳酸鈣', 0], ['As2S3', '雌黃', 0]];
W.molemap = el => {
  const st = { i: 0, g: 180 };
  el.innerHTML = `${seg('mmS', MOLC.map(([f, n], i) => [String(i), `${subF(f)}`]), '0')}<div class="w-row"><label class="rng">質量（g）<input type="range" id="mmG" min="1" max="600" step="1"><output class="mono" id="mmO"></output></label></div><div id="mmD"></div><p class="note" id="mmN"></p>`;
  function draw() {
    const [f, nm, gas] = MOLC[st.i], M = molarM(f), n = st.g / M, at = parseF(f);
    const box = (x, y, t, v, cls = '') => `<rect x="${x - 70}" y="${y - 26}" width="140" height="52" rx="8" class="mmb ${cls}"/><text class="tk" x="${x}" y="${y - 6}" text-anchor="middle">${t}</text><text class="mmv" x="${x}" y="${y + 15}" text-anchor="middle">${v}</text>`;
    const arr = (x1, y1, x2, y2, t, tx, ty) => `<line class="mma" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#mmA)" marker-start="url(#mmA)"/><text class="tk sm" x="${tx}" y="${ty}" text-anchor="middle">${t}</text>`;
    let s = `<defs><marker id="mmA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ahp"/></marker></defs>`;
    s += box(300, 120, '莫耳數 n', `${fx(n, 3)} mol`, 'hub') + box(90, 120, '質量', `${st.g} g`) + box(510, 120, '分子數', sci(n * 6.022e23, 3));
    s += arr(162, 120, 228, 120, `÷ M（${fx(M, 2)} g/mol）`, 195, 80) + arr(372, 120, 438, 120, '× 6.022 × 10²³', 405, 80);
    const na = Object.values(at).reduce((a, b) => a + b, 0);
    s += box(300, 230, gas ? '氣體體積（25 °C）' : '原子總數', gas ? `${fx(n * 24.47, 1)} L` : sci(n * na * 6.022e23, 3)) + arr(300, 148, 300, 202, gas ? '× 24.47 L/mol' : `× 6.022 × 10²³ × ${na}`, 380, 180);
    $('#mmD', el).innerHTML = `<svg class="ch" viewBox="0 0 600 270" role="img" aria-label="莫耳換算">${s}</svg>`;
    $('#mmG', el).value = st.g; $('#mmO', el).textContent = `${st.g} g`;
    const parts = Object.entries(at).map(([e, k]) => `${e}：${k} × ${AM[e]} = ${fx(k * AM[e], 2)}（${fx(100 * k * AM[e] / M, 1)}%）`).join('；');
    $('#mmN', el).innerHTML = `${nm} ${subF(f)} 的莫耳質量 M = ${parts}，合計 ${fx(M, 2)} g/mol。任何量都先換成中間的莫耳數，再換成要的量。${gas ? '' : `例如 ${st.g} g 中 ${Object.keys(at)[0]} 的質量 = ${fx(st.g * at[Object.keys(at)[0]] * AM[Object.keys(at)[0]] / M, 2)} g。`}`;
    pressSeg(el, 'mmS', String(st.i));
  }
  bindSeg(el, 'mmS', v => { st.i = +v; draw(); });
  $('#mmG', el).oninput = e => { st.g = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. 由百分組成求化學式 ===== */
const EMP = [['葡萄糖', { C: 40.0, H: 6.7, O: 53.3 }, 180], ['富馬酸', { C: 41.38, H: 3.47, O: 55.15 }, 116], ['硝酸羥胺', { N: 29.17, H: 4.20, O: 66.63 }, 96], ['乙酸乙酯', { C: 54.53, H: 9.15, O: 36.32 }, 88]];
W.empform = el => {
  let cur = 0;
  el.innerHTML = `${seg('efS', EMP.map((v, i) => [String(i), v[0]]), '0')}<div class="bars pk" id="efB"></div><ol class="cs" id="efC"></ol><p class="note" id="efN"></p>`;
  function draw() {
    const [nm, pc, M] = EMP[cur], mol = Object.fromEntries(Object.entries(pc).map(([e, p]) => [e, p / AM[e]])), mn = Math.min(...Object.values(mol));
    const rat = Object.fromEntries(Object.entries(mol).map(([e, v]) => [e, v / mn])), mult = [1, 2, 3].find(k => Object.values(rat).every(v => Math.abs(v * k - Math.round(v * k)) < 0.12)) || 1;
    const emp = Object.fromEntries(Object.entries(rat).map(([e, v]) => [e, Math.round(v * mult)])), em = Object.entries(emp).reduce((a, [e, k]) => a + AM[e] * k, 0), n = Math.round(M / em);
    const fstr = o => Object.entries(o).map(([e, k]) => `${e}${k > 1 ? subF(String(k)) : ''}`).join('');
    $('#efB', el).innerHTML = Object.entries(pc).map(([e, p]) => `<div><span>${e}：${p}% → ${fx(mol[e], 3)} mol</span><i class="ba" style="width:${rat[e] / Math.max(...Object.values(rat)) * 100}%"></i><b class="mono">${fx(rat[e], 2)}</b></div>`).join('');
    $('#efC', el).innerHTML = `<li>假設 100 g：各元素的質量 = 百分率，除以原子量得莫耳數</li><li>除以最小的莫耳數 ${fx(mn, 3)}：得比值（長條長度）${mult > 1 ? `，再乘 ${mult} 變成整數` : ''}</li><li>實驗式 ${fstr(emp)}，式量 ${fx(em, 1)}</li><li>分子量 ${M} ÷ ${fx(em, 1)} ≈ ${n} → 分子式 <b>${fstr(Object.fromEntries(Object.entries(emp).map(([e, k]) => [e, k * n])))}</b></li>`;
    $('#efN', el).innerHTML = `百分組成只能決定原子的<b>最簡整數比</b>（實驗式）；要知道真正的分子式，還需要分子量（例如由凝固點下降、氣體密度或質譜求得）。`;
    pressSeg(el, 'efS', String(cur));
  }
  bindSeg(el, 'efS', v => { cur = +v; draw(); });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 4. 燃燒分析：CₓHᵧO_z + O₂ → CO₂ + H₂O ===== */
const CMB = [['CH4', '甲烷'], ['C3H8', '丙烷'], ['C5H12', '戊烷（三種異構物皆同）'], ['C3H6', '丙烯'], ['C4H8', '環丁烷'], ['C2H6O', '乙醇'], ['C3H6O', '丙酮'], ['C6H12O6', '葡萄糖'], ['C4H6', '丁炔']];
W.combust = el => {
  let cur = 2;
  el.innerHTML = `${seg('cbS', CMB.map(([f], i) => [String(i), subF(f)]), '2')}<div class="bars pk" id="cbB"></div><p class="eq" id="cbF"></p><p class="note" id="cbN"></p>`;
  function draw() {
    const [f, nm] = CMB[cur], a = parseF(f), x = a.C || 0, y = a.H || 0, z = a.O || 0, o2 = x + y / 4 - z / 2, mx = Math.max(o2, x, y / 2, 1);
    $('#cbB', el).innerHTML = [['消耗 O₂', o2], ['生成 CO₂', x], ['生成 H₂O', y / 2]].map(([t, v]) => `<div><span>${t}</span><i class="ba" style="width:${v / mx * 100}%"></i><b class="mono">${fx(v, 1)} mol</b></div>`).join('');
    $('#cbF', el).innerHTML = `${subF(f)} + ${fx(o2, 1)} O₂ → ${x} CO₂ + ${fx(y / 2, 1)} H₂O　　O₂ = x + y/4 − z/2 = ${x} + ${y}/4 − ${z}/2`;
    $('#cbN', el).innerHTML = `${nm}：每個 C 變成一個 CO₂、每兩個 H 變成一個 H₂O，所以只看分子式，<b>同分異構物燃燒的產物量完全相同</b>（燃燒熱則不同）。${x === y / 2 ? '這個分子的 H 數是 C 的兩倍（CₙH₂ₙ…），生成的 CO₂ 與 H₂O 莫耳數相同。' : ''} 反過來，由 CO₂ 與 H₂O 的量可以求出 C 與 H 的比例。`;
    pressSeg(el, 'cbS', String(cur));
  }
  bindSeg(el, 'cbS', v => { cur = +v; draw(); });
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};

/* ===== 5. 濃度換算 ===== */
const CONC = [['甲醇', 'CH4O', 2.45, 0.976], ['硫酸', 'H2SO4', 1.0, 1.07], ['蔗糖', 'C12H22O11', 0.5, 1.06], ['乙醇', 'C2H6O', 3.0, 0.976]];
W.concconv = el => {
  const st = { i: 0, M: 2.45, d: 0.976 };
  el.innerHTML = `${seg('ccS', CONC.map((v, i) => [String(i), v[0]]), '0')}<div class="w-row"><label class="rng">體積莫耳濃度 M<input type="range" id="ccM" min="0.1" max="5" step="0.05"><output class="mono" id="ccMo"></output></label><label class="rng">溶液密度（g/mL）<input type="range" id="ccD" min="0.8" max="1.4" step="0.002"><output class="mono" id="ccDo"></output></label></div><div class="bars pk" id="ccB"></div><ol class="cs" id="ccC"></ol><div class="cards" id="ccK"></div>`;
  function draw() {
    const [nm, f] = CONC[st.i], Mm = molarM(f), tot = 1000 * st.d, solute = st.M * Mm, water = tot - solute;
    const m = water > 0 ? st.M / (water / 1000) : NaN, X = water > 0 ? st.M / (st.M + water / 18.02) : NaN;
    $('#ccB', el).innerHTML = `<div><span>1 L 溶液 = ${fx(tot, 1)} g</span><span class="stk"><i class="ba" style="width:${solute / tot * 100}%;background:var(--c2)"></i><i class="ba" style="width:${Math.max(0, water) / tot * 100}%;background:#9AA3A0"></i></span><b class="mono">溶質 ${fx(solute, 1)} g</b></div>`;
    $('#ccC', el).innerHTML = `<li>取 1 L 溶液：質量 = 1000 mL × ${st.d} g/mL = ${fx(tot, 1)} g</li><li>溶質 ${st.M} mol × ${fx(Mm, 2)} g/mol = ${fx(solute, 1)} g（紅）；溶劑 ${fx(tot, 1)} − ${fx(solute, 1)} = ${fx(water, 1)} g（灰）</li><li>重量莫耳濃度 m = ${st.M} mol ÷ ${fx(water / 1000, 4)} kg</li>`;
    $('#ccK', el).innerHTML = card('M', '體積莫耳濃度', `${fx(st.M, 2)} M`, 'mol / L 溶液') + card('m', '重量莫耳濃度', water > 0 ? `${fx(m, 2)} m` : '—', 'mol / kg 溶劑') + card('x', '溶質莫耳分率', water > 0 ? fx(X, 3) : '—') + card('w', '重量百分率', `${fx(100 * solute / tot, 1)}%`);
    $('#ccM', el).value = st.M; $('#ccMo', el).textContent = fx(st.M, 2); $('#ccD', el).value = st.d; $('#ccDo', el).textContent = fx(st.d, 3);
    pressSeg(el, 'ccS', String(st.i));
  }
  bindSeg(el, 'ccS', v => { st.i = +v; [, , st.M, st.d] = CONC[st.i]; draw(); });
  $('#ccM', el).oninput = e => { st.M = +e.target.value; draw(); };
  $('#ccD', el).oninput = e => { st.d = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 6. 拉午耳定律：兩種揮發性液體的理想溶液 =====
   25 °C 純物質蒸氣壓（torr） */
const RAO = { ph: ['戊烷', '己烷', 511, 150], bt: ['苯', '甲苯', 95.1, 28.4] };
W.raoult = el => {
  const st = { p: 'ph', x: 0.5 };
  el.innerHTML = `${seg('raS', Object.entries(RAO).map(([k, v]) => [k, `${v[0]}＋${v[1]}`]), st.p)}<div class="w-row"><label class="rng" id="raL"><span></span><input type="range" id="raX" min="0" max="1" step="0.01"><output class="mono" id="raO"></output></label></div><div id="raG"></div><div class="cards" id="raK"></div><p class="note" id="raN"></p>`;
  function draw() {
    const [a, b, pa, pb] = RAO[st.p], x = st.x, PA = x * pa, PB = (1 - x) * pb, P = PA + PB, ya = PA / P;
    $('#raL span', el).textContent = `溶液中${a}的莫耳分率 X`;
    $('#raG', el).innerHTML = chart({ w: 560, h: 240, x: [0, 1], y: [0, Math.ceil(pa / 50) * 50], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, Math.round(pa / 2), Math.ceil(pa / 50) * 50], xlab: `溶液中${a}的莫耳分率`, ylab: '蒸氣壓（torr）', label: '拉午耳定律' }, (X, Y) =>
      `<line class="tline faint" x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(pa)}"/><line class="tline faint" x1="${X(0)}" y1="${Y(pb)}" x2="${X(1)}" y2="${Y(0)}"/><line class="tline" x1="${X(0)}" y1="${Y(pb)}" x2="${X(1)}" y2="${Y(pa)}"/><line class="mk" x1="${X(x)}" x2="${X(x)}" y1="${Y(0)}" y2="${Y(P)}"/><circle class="dot" cx="${X(x)}" cy="${Y(P)}" r="6"/><circle class="pt" cx="${X(x)}" cy="${Y(PA)}" r="5"/><circle class="pt" cx="${X(x)}" cy="${Y(PB)}" r="5"/>`);
    $('#raK', el).innerHTML = card('a', `P(${a}) = X × P°`, `${fx(PA, 1)} torr`, `${fx(x, 2)} × ${pa}`) + card('b', `P(${b})`, `${fx(PB, 1)} torr`, `${fx(1 - x, 2)} × ${pb}`) + card('t', '總壓', `${fx(P, 1)} torr`) + card('y', `蒸氣中${a}的莫耳分率`, fx(ya, 3), `${fx(PA, 1)} ÷ ${fx(P, 1)}`);
    $('#raN', el).innerHTML = `每種成分的分壓 = 它在溶液中的莫耳分率 × 純物質的蒸氣壓（兩條淡線），總壓是兩者相加（深線）。蒸氣中各成分的比例由分壓決定，所以<b>蒸氣中較易揮發的${a}比例比溶液中高</b>（${fx(ya, 2)} &gt; ${fx(x, 2)}），這就是分餾的原理。`;
    $('#raX', el).value = x; $('#raO', el).textContent = fx(x, 2); pressSeg(el, 'raS', st.p);
  }
  bindSeg(el, 'raS', v => { st.p = v; draw(); });
  $('#raX', el).oninput = e => { st.x = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 7. 亨利定律：氣體溶解度和分壓成正比 =====
   25 °C 水中的亨利常數 k（mol/(L·atm)），教科書常用值 */
const HEN = { CO2: ['CO₂', 3.4e-2], O2: ['O₂', 1.3e-3], N2: ['N₂', 6.5e-4], CO: ['CO', 9.7e-4] };
W.henry = el => {
  const st = { g: 'CO2', p: 1 };
  el.innerHTML = `${seg('hnS', Object.entries(HEN).map(([k, v]) => [k, v[0]]), st.g)}<div class="w-row"><label class="rng">氣體分壓（atm）<input type="range" id="hnP" min="0" max="5" step="0.05"><output class="mono" id="hnO"></output></label></div><div id="hnG"></div><p class="eq" id="hnF"></p><p class="note" id="hnN"></p>`;
  function draw() {
    const [nm, k] = HEN[st.g], c = k * st.p, ymax = k * 5;
    const K = 1000, ym = ymax * K;
    $('#hnG', el).innerHTML = chart({ w: 560, h: 220, x: [0, 5], y: [0, ym], xt: [0, 1, 2, 3, 4, 5], yt: [0, ym / 2, ym].map(v => +v.toPrecision(2)), xlab: '分壓 P（atm）', ylab: '溶解度（10⁻³ mol/L）', label: '亨利定律' }, (X, Y) =>
      `<line class="tline" x1="${X(0)}" y1="${Y(0)}" x2="${X(5)}" y2="${Y(ym)}"/><line class="mk" x1="${X(st.p)}" x2="${X(st.p)}" y1="${Y(0)}" y2="${Y(c * K)}"/><circle class="dot" cx="${X(st.p)}" cy="${Y(c * K)}" r="7"/>`);
    $('#hnF', el).innerHTML = `C = k × P = ${sci(k, 2)} × ${fx(st.p, 2)} = <b>${sci(c, 2)} mol/L</b>${st.g === 'CO2' ? '' : `（${sci(c * (st.g === 'O2' ? 32 : 28), 2)} g/L）`}`;
    $('#hnN', el).innerHTML = `溫度固定時，氣體的溶解度和它<b>自己的分壓</b>成正比（斜率就是亨利常數 k）。空氣中 N₂ 的分壓約 0.78 atm，所以水中 N₂ 的濃度要用 0.78 atm 計算。碳酸飲料在高壓 CO₂ 下封裝，打開瓶蓋後 CO₂ 分壓驟降，溶解度變小，多出來的 CO₂ 變成氣泡。氣體溶解度也隨溫度升高而降低。`;
    $('#hnP', el).value = st.p; $('#hnO', el).textContent = fx(st.p, 2); pressSeg(el, 'hnS', st.g);
  }
  bindSeg(el, 'hnS', v => { st.g = v; draw(); });
  $('#hnP', el).oninput = e => { st.p = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};
