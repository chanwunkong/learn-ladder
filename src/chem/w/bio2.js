/* ---------- 後中化學：生物分子的補充互動圖 ---------- */

/* ===== 1. 雙醣與多醣 ===== */
const DISAC = {
  mal: ['麥芽糖', '葡萄糖 + 葡萄糖', 'α(1→4)', 1, '澱粉的水解產物。'],
  cel: ['纖維二糖', '葡萄糖 + 葡萄糖', 'β(1→4)', 1, '纖維素的水解產物；和麥芽糖只差醣苷鍵是 β。'],
  lac: ['乳糖', '半乳糖 + 葡萄糖', 'β(1→4)', 1, '乳汁中的雙醣。兩個單醣各有 5 個 OH，形成醣苷鍵時兩個 OH 合成一個 O 橋並失去水，所以乳糖剩 8 個 OH。乳糖不耐症是缺乏分解這個 β 鍵的乳糖酶。'],
  suc: ['蔗糖', '葡萄糖 + 果糖', 'α1↔β2', 0, '兩個變旋碳都用在醣苷鍵上，沒有游離的半縮醛，是<b>非還原醣</b>。'],
  sta: ['澱粉（直鏈＋支鏈）', '許多葡萄糖', 'α(1→4)，支鏈處 α(1→6)', 0, 'α 鍵讓鏈捲成螺旋，人體的澱粉酶可以水解。肝醣結構類似、分支更多。'],
  cell: ['纖維素', '許多葡萄糖', 'β(1→4)', 0, 'β 鍵讓鏈伸直，鏈間大量氫鍵形成纖維；人體沒有水解 β(1→4) 的酶。和澱粉的單體相同。'],
  cyc: ['β-環糊精', '7 個葡萄糖', 'α(1→4)，頭尾相接成環', 0, '環的內部疏水、外部親水，可以包覆藥物分子。'],
};
W.disac = el => {
  let cur = 'lac';
  el.innerHTML = `${seg('dsaS', Object.entries(DISAC).map(([k, v]) => [k, v[0]]), cur)}<div class="cards" id="dsaK"></div><p class="note" id="dsaN"></p>`;
  function draw() {
    const [n, m, l, r, w] = DISAC[cur];
    $('#dsaK', el).innerHTML = card('m', '水解產物', m) + card('l', '醣苷鍵', l) + card('r', '還原醣？', r ? '是（有游離半縮醛）' : '否');
    $('#dsaN', el).innerHTML = `<b>${n}</b>：${w} 醣苷鍵是縮醛，在酸或專一的酶作用下水解。中藥中的<b>配醣體</b>（glycoside）也是醣的半縮醛 OH 與另一個分子（醣苷配基）的 OH 形成的縮醛。`;
    pressSeg(el, 'dsaS', cur);
  }
  bindSeg(el, 'dsaS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.d || cur; draw(); } };
};

/* ===== 2. 醣的異構關係 ===== */
// 費雪投影 C2–C5 的 OH 方向（R 右、L 左）
const SUGF = { glc: ['D-葡萄糖', 'RLRR'], man: ['D-甘露糖', 'LLRR'], gal: ['D-半乳糖', 'RLLR'], all: ['D-阿洛糖', 'RRRR'], lglc: ['L-葡萄糖', 'LRLL'], tal: ['D-塔羅糖', 'LLLR'] };
W.sugarrel = el => {
  const st = { a: 'glc', b: 'gal' };
  const sel = (id, v) => `<select id="${id}">${Object.entries(SUGF).map(([k, x]) => `<option value="${k}"${k === v ? ' selected' : ''}>${x[0]}</option>`).join('')}</select>`;
  el.innerHTML = `<div class="w-row"><label class="sel">醣 1 ${sel('srA', st.a)}</label><label class="sel">醣 2 ${sel('srB', st.b)}</label></div><div id="srG"></div><div class="cards" id="srK"></div><p class="note">比較 C2–C5 每個掌性碳的 OH 在右（R）或左（L）：全部相反是<b>鏡像異構物</b>（D 與 L）；只有一個不同是<b>差向異構物</b>（epimer，一種非鏡像異構物）；其他是一般的非鏡像異構物。環化後 C1 的 α／β 稱為<b>變旋異構物</b>（anomer），也是非鏡像異構物。</p>`;
  function draw() {
    const [na, fa] = SUGF[st.a], [nb, fb] = SUGF[st.b];
    const fis = (f, x, nm) => `<text x="${x}" y="22" text-anchor="middle" style="font-size:14px;fill:var(--ink)">CHO</text>${[...f].map((c, i) => { const y = 50 + i * 30; return `<line x1="${x - 30}" x2="${x + 30}" y1="${y}" y2="${y}" style="stroke:var(--ink)"/><text x="${x + (c === 'R' ? 44 : -44)}" y="${y + 5}" text-anchor="middle" style="font-size:13px;fill:#B5326C">OH</text><text class="tk" x="${x - 8}" y="${y - 4}">C${i + 2}</text>`; }).join('')}<line x1="${x}" x2="${x}" y1="28" y2="170" style="stroke:var(--ink)"/><text x="${x}" y="188" text-anchor="middle" style="font-size:13px;fill:var(--ink)">CH₂OH</text><text class="tk" x="${x}" y="208" text-anchor="middle">${nm}</text>`;
    $('#srG', el).innerHTML = `<svg class="en" viewBox="0 0 460 215" style="max-width:460px;margin:auto" role="img" aria-label="費雪投影">${fis(fa, 120, na)}${fis(fb, 340, nb)}</svg>`;
    const diff = [...fa].map((c, i) => c !== fb[i] ? i + 2 : 0).filter(Boolean);
    const rel = st.a === st.b ? '同一個化合物' : diff.length === 4 ? '鏡像異構物' : diff.length === 1 ? `C${diff[0]} 差向異構物（非鏡像異構物）` : '非鏡像異構物';
    $('#srK', el).innerHTML = card('d', '不同的掌性碳', diff.length ? diff.map(d => 'C' + d).join('、') : '無') + card('r', '關係', rel);
  }
  $('#srA', el).onchange = e => { st.a = e.target.value; draw(); };
  $('#srB', el).onchange = e => { st.b = e.target.value; draw(); };
  draw();
  return { set(s) { Object.assign(st, s); $('#srA', el).value = st.a; $('#srB', el).value = st.b; draw(); } };
};

/* ===== 3. 變旋：平衡時的旋光度 =====
   [α]D：α-D-葡萄哌喃糖 +112.2°、β +18.7°；平衡 +52.7°（OpenStax《Organic Chemistry》25.5 節） */
W.mutarot = el => {
  let b = 64;
  el.innerHTML = `<div class="w-row"><label class="rng">β 型佔 <input type="range" id="muR" min="0" max="100" step="1" value="64"><output class="mono" id="muO"></output></label></div><div class="cards" id="muK"></div><p class="note" id="muN"></p>`;
  function draw() {
    const r = 112.2 * (1 - b / 100) + 18.7 * b / 100;
    $('#muO', el).textContent = `${b}%`;
    $('#muK', el).innerHTML = card('a', '比旋光度', `+${fx(r, 1)}°`) + card('b', 'α : β', `${100 - b} : ${b}`);
    $('#muN', el).innerHTML = `純的 α-D-葡萄糖（+112.2°）或 β 型（+18.7°）溶於水後，都會經開鏈形式互相轉換，旋光度逐漸變成同一個值 +52.7°，稱為<b>變旋</b>。平衡時 β 約 64%，因為 β 型所有的 OH（包括 C1）都在平伏鍵。計算方法：觀測值 = 112.2 × (α 的分率) + 18.7 × (β 的分率)。`;
  }
  $('#muR', el).oninput = e => { b = +e.target.value; draw(); };
  draw();
  return { set(s) { b = s.b ?? b; $('#muR', el).value = b; draw(); } };
};

/* ===== 4. 核酸鹼基配對 ===== */
W.dnaseq = el => {
  let seq = 'AATCGGATCTAG';
  el.innerHTML = `<label class="sel">DNA 序列（5′→3′）<input id="dnI" value="${seq}" maxlength="24" style="font-family:var(--mono);border:1px solid var(--line);border-radius:6px;padding:5px 8px;background:var(--bg);color:var(--ink)"></label><div id="dnG"></div><div class="cards" id="dnK"></div><p class="note">A 與 T 之間 2 個氫鍵、G 與 C 之間 3 個氫鍵，所以 GC 比例越高，雙股越難分開。兩股方向相反（反平行），互補股從 5′ 端讀時要倒過來。RNA 用 U 取代 T，而且核糖的 2′-OH 可以攻擊相鄰的磷酸二酯鍵，所以 RNA 比 DNA 容易水解。</p>`;
  const P = { A: 'T', T: 'A', G: 'C', C: 'G' };
  function draw() {
    const s = seq.toUpperCase().replace(/[^ATGC]/g, ''), c = [...s].map(x => P[x]).join(''), rc = [...c].reverse().join('');
    const box = (ch, x, y) => `<rect x="${x - 11}" y="${y - 14}" width="22" height="22" rx="4" style="fill:${'AT'.includes(ch) ? '#2F3B99' : '#B5326C'};opacity:.85"/><text x="${x}" y="${y + 2}" text-anchor="middle" style="font-size:13px;fill:#fff;font-family:var(--mono)">${ch}</text>`;
    const W0 = Math.max(200, 30 + s.length * 28);
    $('#dnG', el).innerHTML = `<svg class="en" viewBox="0 0 ${W0} 110" style="max-width:${W0}px;margin:auto" role="img" aria-label="鹼基配對"><text class="tk" x="2" y="30">5′</text><text class="tk" x="2" y="92">3′</text>${[...s].map((ch, i) => { const x = 30 + i * 28; return box(ch, x, 30) + `<text class="tk" x="${x}" y="58" text-anchor="middle">${'GC'.includes(ch) ? '≡' : '='}</text>` + box(c[i], x, 92); }).join('')}</svg>`;
    const gc = [...s].filter(x => 'GC'.includes(x)).length;
    $('#dnK', el).innerHTML = card('c', '互補股（對齊寫，3′→5′）', c || '—') + card('r', '互補股（5′→3′）', rc || '—') + card('g', 'GC 比例', s.length ? `${fx(100 * gc / s.length, 0)}%` : '—') + card('h', '氫鍵總數', 2 * (s.length - gc) + 3 * gc);
  }
  $('#dnI', el).oninput = e => { seq = e.target.value; draw(); };
  draw();
  return { set(s) { seq = s.s || seq; $('#dnI', el).value = seq; draw(); } };
};
