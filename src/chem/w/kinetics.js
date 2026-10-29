/* ---------- 後中化學：化學動力學的互動圖 ---------- */

/* ===== 1. 初速率法：自己做實驗找出反應級數 ===== */
W.ratelaw = el => {
  const RX = {
    no: { n: '2NO + O₂ → 2NO₂', A: 'NO', B: 'O₂', m: 2, n2: 1 },
    sn1: { n: '(CH₃)₃CBr + OH⁻ → (CH₃)₃COH + Br⁻', A: '(CH₃)₃CBr', B: 'OH⁻', m: 1, n2: 0 },
    sn2: { n: 'CH₃Br + OH⁻ → CH₃OH + Br⁻', A: 'CH₃Br', B: 'OH⁻', m: 1, n2: 1 },
  };
  let cur = 'no', A = 0.1, B = 0.1, rows = [], gm = null, gn = null;
  el.innerHTML = `${seg('rlS', Object.entries(RX).map(([k, v]) => [k, v.n]), cur)}<div class="w-row" id="rlC"></div><div class="w-row"><button class="btn sm pri" type="button" id="rlGo">做實驗：量初速率</button><button class="btn sm ghost" type="button" id="rlR">清除紀錄</button></div><div id="rlT"></div><div class="w-row" id="rlG"></div><p class="note" id="rlN"></p>`;
  const rate = (a, b) => { const r = RX[cur]; return a ** r.m * b ** r.n2; };
  function draw() {
    const r = RX[cur];
    $('#rlC', el).innerHTML = [['A', r.A, A], ['B', r.B, B]].map(([k, lab, v]) => `<span class="small">[${lab}] = <b class="mono">${fx(v, 2)}</b> M</span><button class="btn sm" type="button" data-c="${k}" data-f="0.5">÷2</button><button class="btn sm" type="button" data-c="${k}" data-f="2">×2</button><span class="sp"></span>`).join('');
    $$('[data-c]', el).forEach(b => { b.onclick = () => { const f = +b.dataset.f; if (b.dataset.c === 'A') A = clamp(A * f, 0.0125, 0.8); else B = clamp(B * f, 0.0125, 0.8); draw(); }; });
    const r0 = rows[0];
    $('#rlT', el).innerHTML = rows.length ? `<table class="tbl"><thead><tr><th>實驗</th><th>[${r.A}]（M）</th><th>[${r.B}]（M）</th><th>初速率（相對）</th></tr></thead><tbody>${rows.map((x, i) => `<tr><td>${i + 1}</td><td>${fx(x.a, 3)}</td><td>${fx(x.b, 3)}</td><td class="mono">${fx(x.r / r0.r, 2)}</td></tr>`).join('')}</tbody></table>` : '<p class="small mut">還沒有實驗紀錄。調整濃度後按「做實驗」。技巧：每次只改變一種反應物的濃度。</p>';
    $('#rlG', el).innerHTML = `<span class="small">你的猜測：rate = k[${r.A}]</span>${[0, 1, 2].map(v => `<button class="btn sm${gm === v ? ' pri' : ''}" type="button" data-gm="${v}">${v}</button>`).join('')}<span class="small">[${r.B}]</span>${[0, 1, 2].map(v => `<button class="btn sm${gn === v ? ' pri' : ''}" type="button" data-gn="${v}">${v}</button>`).join('')}`;
    $$('[data-gm]', el).forEach(b => { b.onclick = () => { gm = +b.dataset.gm; draw(); }; });
    $$('[data-gn]', el).forEach(b => { b.onclick = () => { gn = +b.dataset.gn; draw(); }; });
    let msg = '先做至少三次實驗：一次當基準，一次只把第一種反應物加倍，一次只把第二種加倍。';
    if (gm != null && gn != null) msg = gm === r.m && gn === r.n2 ? `<span class="ok">✓ 正確</span>：rate = k[${r.A}]${r.m > 1 ? `<sup>${r.m}</sup>` : r.m ? '' : '⁰'}[${r.B}]${r.n2 > 1 ? `<sup>${r.n2}</sup>` : r.n2 ? '' : '⁰'}，總級數 ${r.m + r.n2}。${cur === 'sn1' ? '速率和 OH⁻ 無關：這正是 SN1，最慢的一步只有鹵烷參與。' : cur === 'sn2' ? '兩者都是一級：SN2 的過渡狀態同時包含兩者。' : '注意級數不等於方程式的係數也可以；這裡剛好相同，但必須由實驗決定。'}`
      : `<span class="bad">還不對</span>。找兩次「只有 [${r.A}] 不同」的實驗：濃度變 2 倍時速率變幾倍？2¹ = 2 → 一級；2² = 4 → 二級；不變 → 零級。`;
    $('#rlN', el).innerHTML = msg; pressSeg(el, 'rlS', cur);
  }
  bindSeg(el, 'rlS', v => { cur = v; rows = []; gm = gn = null; A = B = 0.1; draw(); });
  $('#rlGo', el).onclick = () => { rows.push({ a: A, b: B, r: rate(A, B) }); if (rows.length > 8) rows.shift(); draw(); };
  $('#rlR', el).onclick = () => { rows = []; draw(); };
  draw();
  return { set(s) { if (s.rx) { cur = s.rx; rows = []; } (s.rows || []).forEach(([a, b]) => rows.push({ a, b, r: rate(a, b) })); gm = s.gm ?? gm; gn = s.gn ?? gn; draw(); } };
};

/* ===== 2. 積分速率式：哪一種圖是直線 ===== */
W.order = el => {
  const st = { n: 1, k: 0.2 }, A0 = 1, T = 20;
  el.innerHTML = `${seg('orS', [['0', '零級'], ['1', '一級'], ['2', '二級']], '1')}<div class="w-row"><label class="rng">速率常數 k <input type="range" id="ork" min="0.02" max="0.5" step="0.01"><output class="mono" id="oro"></output></label></div><div class="og" id="orG"></div><div class="cards" id="orK"></div><p class="note" id="orN"></p>`;
  const Af = t => st.n === 0 ? Math.max(1e-4, A0 - st.k * t * 0.1) : st.n === 1 ? A0 * Math.exp(-st.k * t) : 1 / (1 / A0 + st.k * t);
  function draw() {
    const ts = Array.from({ length: 101 }, (_, i) => i * T / 100), k = st.n === 0 ? st.k * 0.1 : st.k;
    const half = st.n === 0 ? A0 / (2 * k) : st.n === 1 ? Math.LN2 / k : 1 / (k * A0);
    const hs = []; let a = A0, t = 0; for (let i = 0; i < 4; i++) { const h = st.n === 0 ? a / (2 * k) : st.n === 1 ? Math.LN2 / k : 1 / (k * a); t += h; a /= 2; if (t > T) break; hs.push([t, h]); }
    const plots = [['[A]', v => v, [0, 1], '[A] 對時間'], ['ln[A]', v => Math.log(v), [-5, 0], 'ln[A] 對時間'], ['1/[A]', v => 1 / v, [0, 12], '1/[A] 對時間']];
    $('#orG', el).innerHTML = plots.map(([lab, f, yr, ttl], i) => {
      const straight = i === st.n;
      return `<div class="${straight ? 'og-on' : ''}"><p class="lbl">${ttl}${straight ? '　← 直線' : ''}</p>${chart({ x: [0, T], y: yr, xt: [0, 10, 20], yt: yr, xlab: '時間', ylab: lab, h: 190, w: 300 }, (X, Y) => `<path class="${straight ? 'tline' : 'tline2'}" d="${path(ts.map(t => [X(t), Y(clamp(f(Af(t)), yr[0], yr[1]))]))}"/>${i === 0 ? hs.map(([tt]) => `<line class="mk" x1="${X(tt)}" x2="${X(tt)}" y1="${Y(0)}" y2="${Y(1)}"/>`).join('') : ''}`)}</div>`;
    }).join('');
    $('#orK', el).innerHTML = card('h', '第一個半生期', fx(half, 2)) + card('h2', '連續半生期', hs.map(h => fx(h[1], 1)).join('、') || '—');
    $('#orN', el).innerHTML = [
      `<b>零級</b>：rate = k，速率和濃度無關，[A] 隨時間<b>直線</b>下降：[A] = [A]₀ − kt。半生期 t½ = [A]₀ ÷ 2k，濃度越低半生期越短。常見於酵素飽和、表面催化。`,
      `<b>一級</b>：rate = k[A]，<b>ln[A] 對時間是直線</b>，斜率 −k：ln[A] = ln[A]₀ − kt。半生期 <b>t½ = 0.693 ÷ k</b>，和起始濃度無關，所以連續的半生期都一樣長（左圖的虛線等間隔）。放射性衰變、多數藥物排除都是一級。`,
      `<b>二級</b>：rate = k[A]²，<b>1/[A] 對時間是直線</b>，斜率 k：1/[A] = 1/[A]₀ + kt。半生期 t½ = 1 ÷ (k[A]₀)，濃度越低半生期越長。`][st.n] + ' 判斷級數的方法：把數據畫成三種圖，哪一種是直線，就是幾級。';
    $('#oro', el).textContent = fx(st.k); $('#ork', el).value = st.k; pressSeg(el, 'orS', String(st.n));
  }
  bindSeg(el, 'orS', v => { st.n = +v; draw(); });
  $('#ork', el).oninput = e => { st.k = +e.target.value; draw(); };
  draw();
  return { set(s) { if (s.n != null) st.n = s.n; draw(); } };
};

/* ===== 3. 活化能與溫度：能量分佈的尾巴 ===== */
W.arrh = el => {
  const st = { T: 298, Ea: 50, cat: false };
  el.innerHTML = `<div class="w-row"><label class="rng">溫度（K）<input type="range" id="arT" min="250" max="450" step="1"><output class="mono" id="arTo"></output></label><label class="rng">活化能 Ea（kJ/mol）<input type="range" id="arE" min="10" max="120" step="1"><output class="mono" id="arEo"></output></label></div><label class="chk"><input type="checkbox" id="arC"> 加入催化劑（活化能降低 30 kJ/mol）</label><div class="bgrid"><div id="arD"></div><div id="arP"></div></div><div class="cards" id="arK"></div><p class="note" id="arN"></p>`;
  const R = 8.314e-3, dens = (E, T) => 2 / Math.sqrt(Math.PI) * (R * T) ** -1.5 * Math.sqrt(E) * Math.exp(-E / (R * T));
  function draw() {
    const Ea = Math.max(5, st.Ea - (st.cat ? 30 : 0)), Emax = 140, es = Array.from({ length: 141 }, (_, i) => i * Emax / 140 + 0.01);
    const lg = v => Math.max(-14, Math.log10(v));
    $('#arD', el).innerHTML = chart({ x: [0, Emax], y: [-14, 0], xt: [0, 20, 40, 60, 80, 100, 120, 140], yt: [-12, -8, -4, 0], xlab: '分子的動能（kJ/mol）', ylab: '分子比例（對數刻度）', h: 230, label: '能量分佈' }, (X, Y) =>
      `<path class="area" d="${path([[X(Ea), Y(-14)], ...es.filter(e => e >= Ea).map(e => [X(e), Y(lg(dens(e, st.T)))]), [X(Emax), Y(-14)]])}Z"/><path class="tline2" d="${path(es.map(e => [X(e), Y(lg(dens(e, 298)))]))}"/><path class="tline" d="${path(es.map(e => [X(e), Y(lg(dens(e, st.T)))]))}"/><line class="cur" x1="${X(Ea)}" x2="${X(Ea)}" y1="${Y(-14)}" y2="${Y(0)}"/><text class="tk" x="${X(Ea) + 4}" y="${Y(-1)}">Ea</text><text class="tk" x="${X(Emax) - 4}" y="${Y(-0.6)}" text-anchor="end">藍：${st.T} K　灰虛線：298 K</text>`);
    $('#arP', el).innerHTML = energySVG([[0, 0.3], [0.5, Math.min(0.97, 0.3 + st.Ea / 180)], [1, 0.12]], null, { labels: [[0.5, `Ea = ${st.Ea}${st.cat ? '（綠：有催化劑）' : ''}`]], alt: st.cat ? [[0, 0.3], [0.5, Math.min(0.97, 0.3 + Ea / 180)], [1, 0.12]] : null }) + '<p class="small mut c">反應能量圖</p>';
    const f = Math.exp(-Ea / (R * st.T)), f0 = Math.exp(-st.Ea / (R * 298)), ratio = f / f0, r10 = Math.exp(Ea / R * (1 / st.T - 1 / (st.T + 10)));
    $('#arK', el).innerHTML = card('f', '能越過 Ea 的比例 ≈ e<sup>−Ea/RT</sup>', sci(f)) + card('r', '速率是 298 K 無催化劑的', `${ratio >= 100 ? sci(ratio, 1) : fx(ratio, 2)} 倍`) + card('r10', '再升溫 10 K，速率變為', `${fx(r10, 2)} 倍`);
    $('#arN', el).innerHTML = `阿瑞尼斯方程式 k = A e<sup>−Ea/RT</sup>：只有能量超過 Ea 的碰撞才能反應。這些分子在分佈的<b>尾巴</b>上，所以溫度稍微升高，尾巴就抬高很多（縱軸是對數刻度）。Ea = ${Ea} kJ/mol 時，在 ${st.T} K 每升溫 10 K，速率約變為 ${fx(r10, 1)} 倍。${st.cat ? '催化劑提供另一條活化能較低的路徑，速率大增；但它同時加快正逆反應，<b>不改變平衡常數</b>。' : ''}`;
    $('#arTo', el).textContent = st.T; $('#arEo', el).textContent = st.Ea; $('#arT', el).value = st.T; $('#arE', el).value = st.Ea; $('#arC', el).checked = st.cat;
  }
  $('#arT', el).oninput = e => { st.T = +e.target.value; draw(); };
  $('#arE', el).oninput = e => { st.Ea = +e.target.value; draw(); };
  $('#arC', el).onchange = e => { st.cat = e.target.checked; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 4. 多步驟反應：速率決定步驟 ===== */
W.rds = el => {
  const st = { h1: 0.85, h2: 0.65 };
  el.innerHTML = `<p class="eq">步驟 1：A ⇌ I（中間物）　　步驟 2：I + B → P</p><div class="w-row"><label class="rng">過渡狀態 1 的高度 <input type="range" id="rd1" min="0.62" max="0.95" step="0.01"></label><label class="rng">過渡狀態 2 的高度 <input type="range" id="rd2" min="0.62" max="0.95" step="0.01"></label></div><div class="bgrid"><div id="rdE"></div><div><div class="verdict" id="rdV"></div></div></div><p class="note" id="rdN"></p>`;
  function draw() {
    const one = st.h1 >= st.h2;
    $('#rdE', el).innerHTML = energySVG([[0, 0.3], [0.25, st.h1], [0.5, 0.55], [0.75, st.h2], [1, 0.1]], null, { labels: [[0.25, '過渡狀態 1'], [0.5, '中間物 I', 14], [0.75, '過渡狀態 2']], w: 320, h: 170 });
    $('#rdV', el).innerHTML = `<span class="lbl">速率決定步驟</span><b class="big">步驟 ${one ? 1 : 2}</b><span class="lbl">速率式</span><b>${one ? 'rate = k₁[A]' : 'rate = k₂K₁[A][B]'}</b>`;
    $('#rdN', el).innerHTML = one ? '過渡狀態 1 最高，第一步最慢：中間物一生成就被很快消耗，整體速率由第一步決定，<b>只和 A 有關</b>，B 的濃度不影響速率。SN1 就是這種情況（RX 先解離，親核基再快速加上）。'
      : '過渡狀態 2 最高，第二步最慢：第一步很快達到平衡（[I] = K₁[A]），整體速率 = k₂[I][B] = k₂K₁[A][B]，<b>A 和 B 都出現在速率式中</b>。快速平衡之後的慢步驟，速率式會包含它之前所有步驟的反應物。';
    $('#rd1', el).value = st.h1; $('#rd2', el).value = st.h2;
  }
  $('#rd1', el).oninput = e => { st.h1 = +e.target.value; draw(); };
  $('#rd2', el).oninput = e => { st.h2 = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 5. 各物種的速率：除以係數 ===== */
const RST = { o3: ['2O₃ → 3O₂', [['O₃', 2, -1], ['O₂', 3, 1]]], nh3: ['N₂ + 3H₂ → 2NH₃', [['N₂', 1, -1], ['H₂', 3, -1], ['NH₃', 2, 1]]], n2o5: ['2N₂O₅ → 4NO₂ + O₂', [['N₂O₅', 2, -1], ['NO₂', 4, 1], ['O₂', 1, 1]]] };
W.ratestoich = el => {
  const st = { r: 'o3', v: 0.009 };
  el.innerHTML = `${seg('rsS', Object.entries(RST).map(([k, v]) => [k, v[0]]), st.r)}<div class="w-row"><label class="rng">反應速率（每單位係數）<input type="range" id="rsV" min="0.001" max="0.02" step="0.0005"><output class="mono" id="rsO"></output></label></div><div class="bars pk flb" id="rsB"></div><p class="eq" id="rsF"></p><p class="note">同一個反應只有一個「反應速率」：各物種濃度變化的快慢除以自己的係數後都相等。反應物的濃度減少（藍），產物增加（紅）。題目給某一物種的速率時，先除以它的係數，再乘上另一物種的係數。</p>`;
  function draw() {
    const [, sp] = RST[st.r], mx = Math.max(...sp.map(s => s[1])) * st.v;
    $('#rsB', el).innerHTML = sp.map(([t, c, sg]) => `<div><span>Δ[${t}]/Δt</span><span class="zbar"><i class="${sg > 0 ? 'pos' : 'neg'}" style="width:${c * st.v / mx * 50}%;${sg > 0 ? 'left:50%' : 'right:50%'}"></i></span><b class="mono">${sg > 0 ? '+' : '−'}${sci(c * st.v, 2)}</b></div>`).join('');
    $('#rsF', el).innerHTML = `反應速率 = ${sp.map(([t, c, sg]) => `${sg < 0 ? '−' : ''}(1/${c}) Δ[${t}]/Δt`).join(' = ')} = ${sci(st.v, 2)}`;
    $('#rsV', el).value = st.v; $('#rsO', el).textContent = sci(st.v, 2); pressSeg(el, 'rsS', st.r);
  }
  bindSeg(el, 'rsS', v => { st.r = v; draw(); });
  $('#rsV', el).oninput = e => { st.v = +e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 6. 能量圖：正、逆反應的活化能與催化劑 ===== */
W.eadiag = el => {
  const st = { r: 40, p: 10, ts: 90, cat: 0 };
  el.innerHTML = `<div class="w-row"><label class="rng">反應物能量<input type="range" id="eaR" min="0" max="80" step="1"><output class="mono" id="eaRo"></output></label><label class="rng">產物能量<input type="range" id="eaP" min="0" max="80" step="1"><output class="mono" id="eaPo"></output></label></div>${seg('eaC', [['0', '無催化劑'], ['1', '加催化劑']], '0')}<div id="eaG"></div><p class="eq" id="eaF"></p><p class="note" id="eaN"></p>`;
  function draw() {
    const ts = Math.max(st.ts, st.r + 5, st.p + 5), tc = Math.max(st.r, st.p) + (ts - Math.max(st.r, st.p)) * 0.45, Y = v => 220 - v * 2, xs = Array.from({ length: 101 }, (_, i) => i / 100);
    const curve = top => xs.map(x => { const v = x < 0.5 ? st.r + (top - st.r) * (1 - Math.cos(Math.PI * x * 2)) / 2 : st.p + (top - st.p) * (1 + Math.cos(Math.PI * (x - 0.5) * 2)) / 2; return [40 + x * 480, Y(v)]; });
    let s = `<path class="tline" d="${path(curve(ts))}"/>${st.cat ? `<path class="tline cat" d="${path(curve(tc))}"/>` : ''}`;
    s += `<line class="dlt up" x1="150" x2="150" y1="${Y(st.r)}" y2="${Y(ts)}"/><text class="tk" x="144" y="${(Y(st.r) + Y(ts)) / 2}" text-anchor="end">Ea（正）${ts - st.r}</text>`;
    s += `<line class="dlt dn" x1="410" x2="410" y1="${Y(st.p)}" y2="${Y(ts)}"/><text class="tk" x="416" y="${(Y(st.p) + Y(ts)) / 2}">Ea（逆）${ts - st.p}</text>`;
    s += `<line class="conn" x1="40" x2="540" y1="${Y(st.r)}" y2="${Y(st.r)}"/><line class="dlt" x1="530" x2="530" y1="${Y(st.r)}" y2="${Y(st.p)}" style="stroke:var(--accent)"/><text class="tk hl" x="524" y="${Y(st.p) + (st.p < st.r ? 14 : -6)}" text-anchor="end">ΔH = ${st.p - st.r}</text>`;
    $('#eaG', el).innerHTML = `<svg class="en" style="max-width:620px" viewBox="0 0 560 230" role="img" aria-label="活化能">${s}</svg>`;
    $('#eaF', el).innerHTML = `ΔH = Ea（正）− Ea（逆）= ${ts - st.r} − ${ts - st.p} = <b>${st.p - st.r} kJ/mol</b>${st.cat ? `　；加催化劑後 Ea（正）= ${fx(tc - st.r, 0)}、Ea（逆）= ${fx(tc - st.p, 0)}，ΔH 不變` : ''}`;
    $('#eaN', el).innerHTML = `${st.p < st.r ? '產物比反應物低：放熱，逆反應的活化能較大。' : '產物比反應物高：吸熱，正反應的活化能較大。'} 催化劑提供另一條較低的路徑（虛線），<b>正、逆反應的活化能降低同樣多</b>，所以兩個方向都變快、較快達到平衡，但 ΔH 與平衡常數不變。`;
    [['R', 'r'], ['P', 'p']].forEach(([i, k]) => { $(`#ea${i}`, el).value = st[k]; $(`#ea${i}o`, el).textContent = st[k]; }); pressSeg(el, 'eaC', String(st.cat));
  }
  $('#eaR', el).oninput = e => { st.r = +e.target.value; draw(); };
  $('#eaP', el).oninput = e => { st.p = +e.target.value; draw(); };
  bindSeg(el, 'eaC', v => { st.cat = +v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 7. 反應機構：誰是催化劑、誰是中間物 ===== */
const MECH = {
  no: ['臭氧被 NO 破壞', [[['O₃', 'NO'], ['NO₂', 'O₂'], '慢'], [['NO₂', 'O'], ['NO', 'O₂'], '快']]],
  cl: ['氟氯碳化物的 Cl', [[['Cl', 'O₃'], ['ClO', 'O₂'], '慢'], [['ClO', 'O'], ['Cl', 'O₂'], '快']]],
  h2o2: ['I⁻ 催化 H₂O₂ 分解', [[['H₂O₂', 'I⁻'], ['H₂O', 'IO⁻'], '慢'], [['H₂O₂', 'IO⁻'], ['H₂O', 'O₂', 'I⁻'], '快']]],
  ab: ['2A + 2B → C', [[['A', 'B'], ['D'], '慢'], [['D', 'B'], ['E'], '快'], [['A', 'E'], ['C'], '快']]],
};
W.mechroles = el => {
  let cur = 'no';
  el.innerHTML = `${seg('mrS', Object.entries(MECH).map(([k, v]) => [k, v[0]]), cur)}<ol class="cs mrl" id="mrL"></ol><p class="eq" id="mrF"></p><div class="cards" id="mrK"></div><p class="note" id="mrN"></p>`;
  function draw() {
    const [, steps] = MECH[cur], first = {}, net = {};
    steps.forEach(([r, p]) => { r.forEach(x => { if (!first[x]) first[x] = 'r'; net[x] = (net[x] || 0) - 1; }); p.forEach(x => { if (!first[x]) first[x] = 'p'; net[x] = (net[x] || 0) + 1; }); });
    const both = Object.keys(net).filter(x => steps.some(s => s[0].includes(x)) && steps.some(s => s[1].includes(x)) && net[x] === 0);
    const role = x => (both.includes(x) ? (first[x] === 'r' ? 'cat' : 'int') : '');
    const chip = x => `<span class="mrc ${role(x)}">${x}</span>`;
    $('#mrL', el).innerHTML = steps.map(([r, p, sp]) => `<li>${r.map(chip).join(' + ')} → ${p.map(chip).join(' + ')}　<small>（${sp}）</small></li>`).join('');
    const fmt = side => Object.entries(net).filter(([, n]) => side * n > 0).map(([x, n]) => `${Math.abs(n) > 1 ? Math.abs(n) : ''}${x}`).join(' + ');
    $('#mrF', el).innerHTML = `相加、消去兩邊相同的物種：${fmt(-1)} → ${fmt(1)}`;
    const slow = steps.find(s => s[2] === '慢'), cats = both.filter(x => first[x] === 'r'), ints = both.filter(x => first[x] === 'p');
    $('#mrK', el).innerHTML = card('c', '催化劑（綠）', cats.join('、') || '無', '先消耗、後再生') + card('i', '中間物（紅）', ints.join('、') || '無', '先生成、後消耗') + card('r', '速率式', `rate = k[${slow[0].join('][')}]`, '由第一步慢步驟寫出');
    $('#mrN', el).innerHTML = `把各步驟相加得到總反應。兩邊都出現、最後被消去的物種有兩種：<b>先當反應物、最後又生成回來的是催化劑</b>；<b>先被生成、隨後被消耗的是中間物</b>。慢步驟是第一步時，速率式直接用它的反應物寫出${slow[0].includes('I⁻') ? '（催化劑也可以出現在速率式中）' : ''}。`;
    pressSeg(el, 'mrS', cur);
  }
  bindSeg(el, 'mrS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.m || cur; draw(); } };
};
