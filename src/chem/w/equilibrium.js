/* ---------- 後中化學：化學平衡的互動圖 ----------
   N₂O₄ ⇌ 2 NO₂：25 °C 時 Kc ≈ 4.6 × 10⁻³（濃度以 M 計），ΔH° ≈ +57.2 kJ/mol（正反應吸熱）。K 隨溫度依 van 't Hoff 式變化。 */
const N2O4 = { K298: 4.6e-3, dH: 57.2e3, R: 8.314 };
const Kat = T => N2O4.K298 * Math.exp(-N2O4.dH / N2O4.R * (1 / T - 1 / 298.15));
// 從 [N₂O₄] = a、[NO₂] = b 出發達到平衡：(b + 2x)² = K(a − x)，取物理上合理的根
function eqSolve(a, b, K) { const B = 4 * b + K, C = b * b - K * a, x = (-B + Math.sqrt(B * B - 16 * C)) / 8; return { a: a - x, b: b + 2 * x, x }; }

/* ===== 1. 動態平衡：A ⇌ B ===== */
W.eqdyn = el => {
  const st = { kf: 0.6, kr: 0.2, t: 2, fromB: false }, T = 12;
  el.innerHTML = `<div class="w-row">${seg('edS', [['A', '從純 A 開始'], ['B', '從純 B 開始']], 'A')}</div>
<div class="w-row"><label class="rng">正反應 k<sub>f</sub> <input type="range" id="edf" min="0.05" max="1.5" step="0.05"><output class="mono" id="edfo"></output></label><label class="rng">逆反應 k<sub>r</sub> <input type="range" id="edr" min="0.05" max="1.5" step="0.05"><output class="mono" id="edro"></output></label></div>
<div class="w-row"><label class="rng">時間 <input type="range" id="edt" min="0" max="${T}" step="0.1"><output class="mono" id="edto"></output></label></div>
<div class="bgrid"><div id="edc"></div><div id="edv"></div></div><div class="cards" id="edk"></div><p class="note" id="edn"></p>`;
  const conc = t => { const s = st.kf + st.kr, Aeq = st.kr / s, A0 = st.fromB ? 0 : 1, A = Aeq + (A0 - Aeq) * Math.exp(-s * t); return [A, 1 - A]; };
  function draw() {
    const ts = Array.from({ length: 121 }, (_, i) => i * T / 120), [A, B] = conc(st.t), K = st.kf / st.kr;
    $('#edc', el).innerHTML = chart({ x: [0, T], y: [0, 1], xt: [0, 3, 6, 9, 12], yt: [0, 0.5, 1], xlab: '時間', ylab: '濃度（M）', h: 220, label: '濃度隨時間' }, (X, Y) =>
      `<path class="sha" d="${path(ts.map(t => [X(t), Y(conc(t)[0])]))}"/><path class="sa" d="${path(ts.map(t => [X(t), Y(conc(t)[1])]))}"/><line class="cur" x1="${X(st.t)}" x2="${X(st.t)}" y1="${Y(0)}" y2="${Y(1)}"/><circle class="dot2" cx="${X(st.t)}" cy="${Y(A)}" r="5"/><circle class="dot" cx="${X(st.t)}" cy="${Y(B)}" r="5"/><text class="tk lha" x="${X(0.3)}" y="${Y(st.fromB ? 0.06 : 0.93)}">[A]</text><text class="tk la" x="${X(0.3)}" y="${Y(st.fromB ? 0.93 : 0.06)}">[B]</text>`);
    const rmax = Math.max(st.kf, st.kr);
    $('#edv', el).innerHTML = chart({ x: [0, T], y: [0, rmax], xt: [0, 3, 6, 9, 12], yt: [0, +(rmax / 2).toFixed(2), +rmax.toFixed(2)], xlab: '時間', ylab: '反應速率', h: 220, label: '正逆反應速率' }, (X, Y) =>
      `<path class="sha" d="${path(ts.map(t => [X(t), Y(st.kf * conc(t)[0])]))}"/><path class="sa" d="${path(ts.map(t => [X(t), Y(st.kr * conc(t)[1])]))}"/><line class="cur" x1="${X(st.t)}" x2="${X(st.t)}" y1="${Y(0)}" y2="${Y(rmax)}"/><text class="tk lha" x="${X(T) - 4}" y="${Y(rmax) + 12}" text-anchor="end">藍：正反應 k<tspan dy="3" font-size="9">f</tspan><tspan dy="-3">[A]</tspan></text><text class="tk la" x="${X(T) - 4}" y="${Y(rmax) + 26}" text-anchor="end">橘：逆反應 k<tspan dy="3" font-size="9">r</tspan><tspan dy="-3">[B]</tspan></text>`);
    const Q = A > 1e-9 ? B / A : Infinity, rf = st.kf * A, rr = st.kr * B, eq = Math.abs(rf - rr) < 0.005;
    $('#edk', el).innerHTML = card('q', 'Q = [B] ÷ [A]', Number.isFinite(Q) ? fx(Q) : '∞') + card('k', 'K = k<sub>f</sub> ÷ k<sub>r</sub>', fx(K)) + card('rf', '正反應速率', fx(rf, 3)) + card('rr', '逆反應速率', fx(rr, 3));
    $('#edn', el).innerHTML = eq ? `<b>已達平衡</b>：正逆反應速率相等（都是 ${fx(rf, 3)}），所以濃度不再改變；但兩個反應都還在進行，只是互相抵消。此時 Q = K = ${fx(K)}。`
      : `尚未平衡：${rf > rr ? '正反應比逆反應快，A 持續變成 B' : '逆反應比正反應快，B 持續變回 A'}，Q（${Number.isFinite(Q) ? fx(Q) : '∞'}）${Q < K ? '小於' : '大於'} K（${fx(K)}）。`;
    $('#edfo', el).textContent = fx(st.kf); $('#edro', el).textContent = fx(st.kr); $('#edto', el).textContent = fx(st.t, 1);
    $('#edf', el).value = st.kf; $('#edr', el).value = st.kr; $('#edt', el).value = st.t; pressSeg(el, 'edS', st.fromB ? 'B' : 'A');
  }
  $('#edf', el).oninput = e => { st.kf = +e.target.value; draw(); };
  $('#edr', el).oninput = e => { st.kr = +e.target.value; draw(); };
  $('#edt', el).oninput = e => { st.t = +e.target.value; draw(); };
  bindSeg(el, 'edS', v => { st.fromB = v === 'B'; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. Q 與 K、ICE 表 ===== */
W.qk = el => {
  const st = { a: 0.1, b: 0 }, K = N2O4.K298;
  el.innerHTML = `<p class="eq">N₂O₄(g) ⇌ 2 NO₂(g)　　K = [NO₂]² ÷ [N₂O₄] = 4.6 × 10⁻³（25 °C）</p>
<div class="w-row"><label class="rng">起始 [N₂O₄] <input type="range" id="qka" min="0" max="0.5" step="0.005"><output class="mono" id="qkao"></output></label><label class="rng">起始 [NO₂] <input type="range" id="qkb" min="0" max="0.1" step="0.001"><output class="mono" id="qkbo"></output></label></div>
<div class="bgrid"><div id="qkq"></div><div id="qkt"></div></div><div id="qkbar"></div><p class="note" id="qkn"></p>`;
  function draw() {
    const { a, b } = st, Q = a > 0 ? b * b / a : Infinity, r = eqSolve(a, b, K), dir = Math.abs(Math.log10((Q || 1e-12) / K)) < 0.01 ? 0 : Q < K ? 1 : -1;
    $('#qkao', el).textContent = `${fx(a, 3)} M`; $('#qkbo', el).textContent = `${fx(b, 3)} M`; $('#qka', el).value = a; $('#qkb', el).value = b;
    const lq = Number.isFinite(Q) && Q > 0 ? Math.log10(Q) : (Q === 0 ? -6 : 2), lk = Math.log10(K);
    $('#qkq', el).innerHTML = chart({ x: [-6, 2], y: [0, 1], xt: [-6, -4, -2, 0, 2], yt: [], xlab: 'log Q（左：幾乎都是反應物；右：產物多）', h: 120, label: 'Q 與 K 的比較' }, (X, Y) =>
      `<line class="mk" x1="${X(lk)}" x2="${X(lk)}" y1="${Y(0)}" y2="${Y(1)}"/><text class="tk hl" x="${X(lk)}" y="${Y(0.85)}" text-anchor="middle">K</text><circle class="dot" cx="${X(Math.max(-6, Math.min(2, lq)))}" cy="${Y(0.4)}" r="7"/><text class="tk" x="${X(Math.max(-6, Math.min(2, lq)))}" y="${Y(0.4) - 12}" text-anchor="middle">Q</text>${dir ? `<path class="arr" d="M${X(Math.max(-6, Math.min(2, lq))) + dir * 12} ${Y(0.4)}L${X(lk) - dir * 8} ${Y(0.4)}" marker-end="url(#ah2)"/>` : ''}<defs><marker id="ah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--arrow)"/></marker></defs>`);
    const f = v => fx(v, 4);
    $('#qkt', el).innerHTML = `<table class="tbl ice"><thead><tr><th></th><th>[N₂O₄]</th><th>[NO₂]</th></tr></thead><tbody>
<tr><td>I 起始</td><td>${f(a)}</td><td>${f(b)}</td></tr><tr><td>C 變化</td><td>${r.x >= 0 ? '−' : '+'}x = ${r.x >= 0 ? '−' : '+'}${f(Math.abs(r.x))}</td><td>${r.x >= 0 ? '+' : '−'}2x = ${r.x >= 0 ? '+' : '−'}${f(Math.abs(2 * r.x))}</td></tr>
<tr><td>E 平衡</td><td><b>${f(r.a)}</b></td><td><b>${f(r.b)}</b></td></tr></tbody></table><p class="small mut">驗算：[NO₂]² ÷ [N₂O₄] = ${r.a > 0 ? sci(r.b * r.b / r.a) : '—'}</p>`;
    const mx = Math.max(a, b, r.a, r.b, 0.01);
    $('#qkbar', el).innerHTML = `<div class="bars"><div><span>起始 N₂O₄</span><i class="bha" style="width:${100 * a / mx}%"></i><b class="mono">${fx(a, 3)}</b></div><div><span>平衡 N₂O₄</span><i class="bha" style="width:${100 * r.a / mx}%"></i><b class="mono">${fx(r.a, 3)}</b></div><div><span>起始 NO₂</span><i class="ba" style="width:${100 * b / mx}%"></i><b class="mono">${fx(b, 3)}</b></div><div><span>平衡 NO₂</span><i class="ba" style="width:${100 * r.b / mx}%"></i><b class="mono">${fx(r.b, 3)}</b></div></div>`;
    $('#qkn', el).innerHTML = a === 0 && b === 0 ? '容器是空的，沒有反應。' : dir === 0 ? '<b>Q = K</b>：已經在平衡，濃度不會改變。'
      : `Q = ${Number.isFinite(Q) ? sci(Q) : '∞'}，${dir > 0 ? `<b>Q &lt; K</b>：產物太少，反應<b>向右</b>進行（N₂O₄ 分解），直到 Q 增加到 K。` : `<b>Q &gt; K</b>：產物太多，反應<b>向左</b>進行（NO₂ 結合），直到 Q 降到 K。`}設變化量為 x，代入 K 的式子解出 x = ${fx(r.x, 4)} M。`;
  }
  $('#qka', el).oninput = e => { st.a = +e.target.value; draw(); };
  $('#qkb', el).oninput = e => { st.b = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. 勒沙特列原理：干擾後先看 Q，再看系統怎麼回到平衡 ===== */
W.lechat = el => {
  let st, hist;
  const reset = () => { const r = eqSolve(0.1, 0, Kat(298.15)); st = { T: 298.15, V: 1, nN: r.a, nB: r.b, phase: 'eq', msg: '' }; hist = [{ N: r.a, B: r.b, lab: '起始平衡' }]; };
  reset();
  const ACT = { addN: '加入 N₂O₄', addB: '加入 NO₂', comp: '體積減半（加壓）', exp: '體積加倍（減壓）', heat: '加熱 +30 °C', cool: '冷卻 −30 °C' };
  el.innerHTML = `<div class="w-row">${Object.entries(ACT).map(([k, t]) => `<button class="btn sm" type="button" data-a="${k}">${t}</button>`).join('')}<button class="btn sm ghost" type="button" data-a="reset">⟲ 重來</button></div>
<div class="bgrid"><div id="lcs"></div><div class="cards" id="lck"></div></div><div class="w-row"><button class="btn sm pri" type="button" id="lcgo" disabled>讓系統回到平衡 →</button></div><div id="lch"></div><p class="note" id="lcn" aria-live="polite"></p>`;
  const conc = () => ({ a: st.nN / st.V, b: st.nB / st.V });
  function draw() {
    const { a, b } = conc(), K = Kat(st.T), Q = b * b / a, eq = st.phase === 'eq';
    // 針筒：寬度 ∝ 體積，顏色深淺 ∝ [NO₂]（紅棕色）
    const w = 60 + 110 * st.V, op = Math.min(0.95, b / 0.06);
    $('#lcs', el).innerHTML = `<svg viewBox="0 0 280 120" class="bk" role="img" aria-label="裝氣體的針筒"><rect x="20" y="30" width="230" height="60" rx="6" fill="none" stroke="var(--muted)" stroke-width="2"/><rect x="22" y="32" width="${w}" height="56" fill="rgb(150,60,20)" fill-opacity="${op.toFixed(2)}"/><rect x="${22 + w}" y="26" width="8" height="68" fill="var(--muted)"/><rect x="${30 + w}" y="56" width="${230 - w}" height="8" fill="var(--muted)"/><text class="tk" x="24" y="110">顏色越深 = NO₂ 越濃；${fx(st.T - 273.15, 0)} °C、${fx(st.V, 2)} L</text></svg>`;
    $('#lck', el).innerHTML = card('a', '[N₂O₄]', fx(a, 4)) + card('b', '[NO₂]', fx(b, 4)) + card('q', 'Q', sci(Q)) + card('k', `K（${fx(st.T - 273.15, 0)} °C）`, sci(K));
    $('#lcgo', el).disabled = eq;
    const pts = hist, mx = Math.max(...pts.flatMap(p => [p.N, p.B])) * 1.1;
    $('#lch', el).innerHTML = chart({ x: [0, Math.max(4, pts.length - 1)], y: [0, mx], xt: [], yt: [0, +(mx / 2).toFixed(2), +mx.toFixed(2)], xlab: '事件順序（每次干擾 → 回到平衡）', ylab: '濃度（M）', h: 200, label: '濃度變化歷程' }, (X, Y) =>
      `<path class="sha" d="${path(pts.map((p, i) => [X(i), Y(p.N)]))}"/><path class="sa" d="${path(pts.map((p, i) => [X(i), Y(p.B)]))}"/>${pts.map((p, i) => `<circle class="dot3" cx="${X(i)}" cy="${Y(p.N)}" r="3"/><circle class="dot2" cx="${X(i)}" cy="${Y(p.B)}" r="3"/>`).join('')}<text class="tk lha" x="${X(0) + 4}" y="${Y(pts[0].N) - 6}">N₂O₄</text><text class="tk la" x="${X(0) + 4}" y="${Y(pts[0].B) + 14}">NO₂</text>`);
    $('#lcn', el).innerHTML = st.msg || '系統在平衡。選一種干擾，先看 Q 和 K 的關係，再按「讓系統回到平衡」。';
  }
  function act(k) {
    if (k === 'reset') { reset(); draw(); return; }
    if (st.phase !== 'eq') relax();
    const K0 = Kat(st.T);
    if (k === 'addN') st.nN += 0.05; if (k === 'addB') st.nB += 0.02;
    if (k === 'comp') st.V /= 2; if (k === 'exp') st.V *= 2;
    if (k === 'heat') st.T += 30; if (k === 'cool') st.T -= 30;
    st.V = clamp(st.V, 0.125, 2); st.T = clamp(st.T, 238.15, 388.15);
    const { a, b } = conc(), K = Kat(st.T), Q = b * b / a;
    hist.push({ N: a, B: b, lab: ACT[k] });
    const why = { addN: '加入反應物 N₂O₄，分母變大，Q 變小', addB: '加入產物 NO₂，分子變大，Q 變大', comp: '體積減半，兩者濃度都加倍；但 [NO₂] 是平方，所以 Q 變成原本的 2 倍', exp: '體積加倍，兩者濃度都減半；Q 變成原本的一半', heat: `Q 沒變，但正反應吸熱，升溫讓 K 從 ${sci(K0)} 變大到 ${sci(K)}`, cool: `Q 沒變，但降溫讓 K 從 ${sci(K0)} 變小到 ${sci(K)}` }[k];
    st.phase = 'pert';
    st.msg = `<b>${ACT[k]}</b>：${why}。現在 Q = ${sci(Q)}，K = ${sci(K)}，<b>Q ${Q < K ? '&lt;' : '&gt;'} K</b> → 系統會<b>${Q < K ? '向右（產生更多 NO₂）' : '向左（產生更多 N₂O₄）'}</b>移動。${k === 'comp' ? '向左可以減少氣體分子數（2 個 NO₂ → 1 個 N₂O₄），部分抵銷加壓。注意顏色：先因為變濃而加深，回到平衡時再稍微變淡。' : k === 'exp' ? '向右可以增加氣體分子數，部分抵銷減壓。' : ''}`;
    draw();
  }
  function relax() {
    const { a, b } = conc(), r = eqSolve(a, b, Kat(st.T));
    st.nN = r.a * st.V; st.nB = r.b * st.V; st.phase = 'eq';
    hist.push({ N: r.a, B: r.b, lab: '回到平衡' });
    st.msg = `回到平衡：[N₂O₄] = ${fx(r.a, 4)}、[NO₂] = ${fx(r.b, 4)} M，Q 又等於 K。系統只能<b>部分抵銷</b>干擾，不會完全回到原來的濃度。`;
  }
  $$('[data-a]', el).forEach(b => { b.onclick = () => act(b.dataset.a); });
  $('#lcgo', el).onclick = () => { relax(); draw(); };
  draw();
  return { set(s) { reset(); if (s.act) act(s.act); draw(); } };
};

/* ===== 4. ΔG° 與 K ===== */
W.kdg = el => {
  const st = { dG: -5.7, T: 298 };
  el.innerHTML = `<div class="w-row"><label class="rng">ΔG°（kJ/mol） <input type="range" id="kgd" min="-40" max="40" step="0.1"><output class="mono" id="kgdo"></output></label><label class="rng">溫度（K） <input type="range" id="kgt" min="250" max="500" step="1"><output class="mono" id="kgto"></output></label></div><div id="kgc"></div><div id="kgb"></div><div class="cards" id="kgk"></div><p class="note" id="kgn"></p>`;
  function draw() {
    const R = 8.314e-3, K = Math.exp(-st.dG / (R * st.T)), fB = K / (1 + K), xs = Array.from({ length: 161 }, (_, i) => -40 + i * 0.5);
    $('#kgdo', el).textContent = fx(st.dG, 1); $('#kgto', el).textContent = st.T; $('#kgd', el).value = st.dG; $('#kgt', el).value = st.T;
    $('#kgc', el).innerHTML = chart({ x: [-40, 40], y: [-8, 8], xt: [-40, -20, 0, 20, 40], yt: [-8, -4, 0, 4, 8], xlab: 'ΔG°（kJ/mol）', ylab: 'log K', h: 220, label: 'ΔG° 與 log K' }, (X, Y) =>
      `<line class="mk" x1="${X(-40)}" x2="${X(40)}" y1="${Y(0)}" y2="${Y(0)}"/><line class="mk" x1="${X(0)}" x2="${X(0)}" y1="${Y(-8)}" y2="${Y(8)}"/><path class="tline" d="${path(xs.map(x => [X(x), Y(clamp(-x / (R * st.T) / Math.LN10, -8, 8))]))}"/><circle class="dot" cx="${X(st.dG)}" cy="${Y(clamp(Math.log10(K), -8, 8))}" r="7"/>`);
    $('#kgb', el).innerHTML = `<div class="stack"><i class="bha" style="width:${100 - 100 * fB}%">${100 - 100 * fB >= 10 ? `A ${fx(100 - 100 * fB, 1)}%` : ''}</i><i class="ba" style="width:${100 * fB}%">${100 * fB >= 10 ? `B ${fx(100 * fB, 1)}%` : ''}</i></div><p class="small mut">A ⇌ B 達到平衡時的組成</p>`;
    $('#kgk', el).innerHTML = card('k', 'K = e<sup>−ΔG°/RT</sup>', sci(K)) + card('l', 'log K', fx(Math.log10(K)));
    $('#kgn', el).innerHTML = Math.abs(st.dG) < 0.3 ? 'ΔG° ≈ 0：K ≈ 1，平衡時 A 和 B 差不多一樣多。'
      : `ΔG° ${st.dG < 0 ? '為負' : '為正'}，K ${st.dG < 0 ? '大於' : '小於'} 1：平衡時${st.dG < 0 ? '產物 B' : '反應物 A'}較多。在 ${st.T} K，ΔG° 每改變 ${fx(R * st.T * Math.LN10, 1)} kJ/mol，K 就差 10 倍，所以幾十 kJ/mol 的差別就讓反應幾乎完全偏向一邊。`;
  }
  $('#kgd', el).oninput = e => { st.dG = +e.target.value; draw(); };
  $('#kgt', el).oninput = e => { st.T = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};
