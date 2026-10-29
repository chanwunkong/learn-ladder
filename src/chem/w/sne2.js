/* ---------- 後中化學：取代與脫去的補充互動圖 ---------- */

/* ===== 1. 親核性與溶劑 =====
   甲醇中的親核性常數 n（以 CH₃I 為基質，log 相對速率；Pearson, Sobel & Songstad, JACS 1968） */
const NUCN = [['PhS⁻', 9.92], ['I⁻', 7.42], ['CN⁻', 6.70], ['HO⁻', 6.5], ['CH₃O⁻', 6.29], ['Br⁻', 5.79], ['N₃⁻', 5.78], ['NH₃', 5.50], ['Cl⁻', 4.37], ['F⁻', 2.7], ['CH₃OH', 0]];
W.nucsolv = el => {
  let sv = 'p';
  el.innerHTML = `${seg('nvS', [['p', '極性質子性溶劑（甲醇、水）'], ['a', '極性非質子性溶劑（DMSO、DMF）']], sv)}<div id="nvG"></div><p class="note" id="nvN"></p>`;
  function draw() {
    if (sv === 'p') {
      $('#nvG', el).innerHTML = `<div class="bars pk">${NUCN.map(([n, v]) => `<div><span>${n}</span><i class="${/[⁻]/.test(n) && /I|Br|Cl|F/.test(n) ? 'ba' : 'bha'}" style="width:${2 + 98 * v / 10}%"></i><b class="mono">${v}</b></div>`).join('')}</div><p class="small mut">甲醇中與 CH₃I 反應的親核性常數 n = log(k ÷ k<sub>甲醇</sub>)，每差 1 速率差 10 倍（Pearson 等人，1968）。橘色為鹵素離子。</p>`;
      $('#nvN', el).innerHTML = '在水或醇中，小而電荷集中的離子（F⁻）被溶劑的 O–H 以<b>氫鍵</b>緊緊包住，要先脫掉溶劑才能進攻；大的 I⁻ 電荷分散、溶劑化弱，而且電子雲容易變形（可極化度大），所以親核性 <b>I⁻ > Br⁻ > Cl⁻ > F⁻</b>。同一週期中則和鹼性一致：HO⁻ > H₂O、CH₃O⁻ > CH₃OH，帶負電的總是比中性的好。';
    } else {
      const ord = ['F⁻', 'Cl⁻', 'Br⁻', 'I⁻'];
      $('#nvG', el).innerHTML = `<div class="bars pk">${ord.map((n, i) => `<div><span>${n}</span><i class="ba" style="width:${90 - i * 22}%"></i><b class="mono">${['最強', '', '', '最弱'][i]}</b></div>`).join('')}</div><p class="small mut">定性順序：非質子性溶劑中鹵素離子的親核性與鹼性一致。</p>`;
      $('#nvN', el).innerHTML = 'DMSO、DMF、丙酮沒有 O–H 或 N–H，不能和陰離子形成氫鍵，陰離子幾乎是「裸」的。這時決定親核性的是鹼性：電荷越集中越強，順序反過來成為 <b>F⁻ > Cl⁻ > Br⁻ > I⁻</b>，整體反應也快得多，所以 SN2 常在這類溶劑中進行。';
    }
    pressSeg(el, 'nvS', sv);
  }
  bindSeg(el, 'nvS', v => { sv = v; draw(); });
  draw();
  return { set(s) { sv = s.s || sv; draw(); } };
};

/* ===== 2. 速率式與能量圖：SN1 與 SN2 ===== */
W.ratelaw = el => {
  const st = { m: 'sn2', rx: 1, nu: 1 };
  el.innerHTML = `${seg('rlM', [['sn2', 'SN2'], ['sn1', 'SN1']], st.m)}<div class="w-row"><span class="small">[RX] ×</span>${seg('rlA', [['1', '1'], ['2', '2'], ['3', '3']], '1')}<span class="small">[Nu⁻] ×</span>${seg('rlB', [['1', '1'], ['2', '2'], ['3', '3']], '1')}</div><div id="rlG"></div><div class="cards" id="rlK"></div><p class="note" id="rlN"></p>`;
  function draw() {
    const sn2 = st.m === 'sn2', r = sn2 ? st.rx * st.nu : st.rx;
    const pts = sn2 ? [[0, 0.35], [0.5, 0.85], [1, 0.2]] : [[0, 0.3], [0.3, 0.9], [0.5, 0.55], [0.68, 0.7], [1, 0.15]];
    const labels = sn2 ? [[0, 'RX + Nu⁻', 8], [0.5, '過渡狀態（Nu、C、X 同時部分成鍵）', 8], [1, 'RNu + X⁻', 8]] : [[0, 'RX', 8], [0.3, '過渡狀態 1（速率決定）', 8], [0.5, 'R⁺ 中間體', -22], [0.68, '過渡狀態 2', 8], [1, 'RNu', 8]];
    $('#rlG', el).innerHTML = energySVG(pts, null, { labels, w: 460, h: 220 });
    $('#rlK', el).innerHTML = card('l', '速率式', sn2 ? 'rate = k[RX][Nu⁻]' : 'rate = k[RX]') + card('r', '速率變為', `${r} 倍`);
    $('#rlN', el).innerHTML = sn2 ? 'SN2 只有一個過渡狀態，它同時包含 RX 與 Nu⁻，所以速率和兩者的濃度都成正比（雙分子反應，SN2 的「2」）。兩者都加倍，速率變 4 倍。' : 'SN1 有兩個過渡狀態，中間是碳陽離子。第一個能障最高，是<b>速率決定步驟</b>，裡面只有 RX，所以 Nu⁻ 濃度不影響速率。例如 (CH₃)₃COH + HBr：OH 先質子化（快），再失去 H₂O 形成碳陽離子（慢，速率決定），最後 Br⁻ 加上去（快）。';
    pressSeg(el, 'rlM', st.m); pressSeg(el, 'rlA', String(st.rx)); pressSeg(el, 'rlB', String(st.nu));
  }
  bindSeg(el, 'rlM', v => { st.m = v; draw(); });
  bindSeg(el, 'rlA', v => { st.rx = +v; draw(); });
  bindSeg(el, 'rlB', v => { st.nu = +v; draw(); });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 3. 環己烷上的 E2：離去基必須直立 ===== */
W.chaire2 = el => {
  let cis = 1;
  el.innerHTML = `${seg('ceS', [['1', 'cis-1-溴-2-甲基環己烷'], ['0', 'trans-1-溴-2-甲基環己烷']], '1')}<div id="ceV"></div><div class="cards" id="ceK"></div><p class="note" id="ceN"></p>`;
  const r = 1.2, h = 0.3, S = 60, A = 42, DY = 0.32;
  function chair(cx, fl) {
    const P = Array.from({ length: 6 }, (_, k) => { const t = k * Math.PI / 3, z = fl * (k % 2 ? -1 : 1) * h; return { t, z, sx: cx + r * Math.cos(t) * S, sy: 115 - (DY * r * Math.sin(t) + z) * S }; });
    let s = P.map((p, i) => { const q = P[(i + 1) % 6]; return `<line class="b" x1="${p.sx}" y1="${p.sy}" x2="${q.sx}" y2="${q.sy}"/>`; }).join('');
    const put = (k, up, t, cls, L = 1, dx = 0) => { const p = P[k], ax = (up > 0) === (p.z > 0), sg = Math.sign(p.z);
      const e = ax ? [p.sx + dx, p.sy - sg * A * L] : [p.sx + Math.cos(p.t) * A * 0.95, p.sy - DY * Math.sin(p.t) * A + sg * A * 0.35];
      s += `<line class="b" x1="${p.sx}" y1="${p.sy}" x2="${e[0]}" y2="${e[1]}"/><text class="at ${cls}" style="font-size:13px" x="${e[0] + (ax ? 0 : Math.cos(p.t) * 18)}" y="${e[1] + (ax ? (sg > 0 ? -6 : 16) : 5)}" text-anchor="middle">${t}</text>`; return ax; };
    const brAx = put(0, 1, 'Br', 'hl'), meUp = cis ? 1 : -1, meAx = put(1, meUp, 'CH₃', 'br', 1, 0);
    let h2 = false, h6 = false;
    if (brAx) { h2 = put(1, -meUp, 'H', meAx ? '' : 'ok', 0.55, 14); h6 = put(5, -1, 'H', 'ok', 1.1, 0); h2 = h2 && !meAx; }
    return { s, brAx, meAx, h2, h6 };
  }
  function draw() {
    const a = chair(150, 1), b = chair(430, -1);
    const re = [a, b].find(c => c.brAx);
    $('#ceV', el).innerHTML = `<svg class="mol" viewBox="0 0 580 240" role="img" aria-label="環己烷 E2">${a.s}${b.s}<text class="tk" x="290" y="20" text-anchor="middle">⇄ 環翻轉 ⇄</text><text class="tk" x="150" y="232" text-anchor="middle">${a.brAx ? 'Br 直立：可以 E2' : 'Br 平伏：不能 E2'}</text><text class="tk" x="430" y="232" text-anchor="middle">${b.brAx ? 'Br 直立：可以 E2' : 'Br 平伏：不能 E2'}</text></svg>`;
    const fast = cis === 1;
    $('#ceK', el).innerHTML = card('c', 'Br 直立的那個椅式', fast ? '甲基在平伏鍵（穩定、常見）' : '甲基也被迫直立（不穩定、很少）') + card('h', '可拿的反式 β-H', fast ? 'C2 與 C6 都有' : '只有 C6') + card('p', '主產物', fast ? '1-甲基環己烯（查依采夫）' : '3-甲基環己烯') + card('r', '相對速率', fast ? '快' : '慢');
    $('#ceN', el).innerHTML = `環上的 E2 一樣要反式共平面，在椅式中只有<b>兩個都在直立鍵</b>的 H 與 Br（反式雙直立）才共平面。綠色的 H 是可以被拿走的。${fast ? '順式異構物中，Br 直立時甲基剛好平伏，這個構形穩定、比例高，C2 上的 H 也是直立的，所以生成取代較多的 1-甲基環己烯，反應快。' : '反式異構物要讓 Br 直立，甲基也得直立，這個構形能量高、比例很低，所以反應慢；而且 C2 上的 H 變成平伏，只能拿 C6 的 H，得到違反查依采夫規則的 3-甲基環己烯。'}`;
    void re; pressSeg(el, 'ceS', String(cis));
  }
  bindSeg(el, 'ceS', v => { cis = +v; draw(); });
  draw();
  return { set(s) { cis = s.cis ?? cis; draw(); } };
};
