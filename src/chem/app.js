/* ---------- 後中化學：頁面框架（首頁、單元目錄、章節、練習題、進度） ---------- */
const state = { done: store.get('done', {}) };
const UORDER = UNITS.flatMap(p => p.items.map(i => i[0]));
CH.sort((a, b) => UORDER.indexOf(a.unit) - UORDER.indexOf(b.unit));
const chOf = id => CH.find(c => c.id === id), unitCh = u => CH.find(c => c.unit === u);
const unitName = u => UNITS.flatMap(p => p.items).find(i => i[0] === u)[1];

function updateProgress() {
  const n = CH.filter(c => state.done[c.id]).length;
  $('#progTxt').textContent = `${n} / ${CH.length} 章`;
  $('#progBar').style.width = `${100 * n / CH.length}%`;
}
function setDone(id, v) {
  if (v) state.done[id] = 1; else delete state.done[id];
  store.set('done', state.done); updateProgress(); renderTOC(id);
  if (typeof CLOUD !== 'undefined') { CLOUD.push(); CLOUD.render(); }
}
function renderTOC(cur) {
  $('#toc').innerHTML = UNITS.map(p => `<p class="toc-h">${p.part}</p><ol>${p.items.map(([u, t], i) => { const c = unitCh(u);
    return c ? `<li><a href="#${c.id}" class="${c.id === cur ? 'cur' : ''} ${state.done[c.id] ? 'done' : ''}"${c.id === cur ? ' aria-current="page"' : ''}><span class="num">${p.key === 'g' ? '普' : '有'}${i + 1}</span><span>${c.title}</span></a></li>`
      : `<li><span class="soon"><span class="num">${p.key === 'g' ? '普' : '有'}${i + 1}</span><span>${t}</span><small>製作中</small></span></li>`; }).join('')}</ol>`).join('');
}

function renderHome() {
  $('#article').innerHTML = `<div class="home">
<p class="eyebrow">學士後中醫入學考 · 化學</p>
<h1 class="hero">不背反應，<br>看懂原理就推得出來。</h1>
<p class="lede">普通化學和有機化學，每一章都從直覺和圖像開始：先動手看到現象，再推出公式與規則，最後用在題目上。普化學到的酸鹼、平衡、熱力學，會直接拿來解釋有機反應。</p>
${(() => { const nx = CH.find(c => !state.done[c.id]) || CH[0], any = CH.some(c => state.done[c.id]);
  return `<div class="cta"><a class="btn pri" href="#${nx.id}">${any ? '繼續：' : '從第一章開始：'}${nx.title}</a><a class="btn" href="#map">看課程地圖</a></div>`; })()}
<h2 id="map">課程地圖</h2>
<p class="mut tree-note">由下往上是先修順序：上面的章節用到下面的觀念。數字是三校歷屆試題中，<b>每份 50 題平均約考幾題</b>。點虛線框的是規劃中的章節。</p>
<div class="seg" id="wview">${WVIEW.map((v, i) => `<button aria-pressed="${i === state.wv}" data-i="${i}">${v}</button>`).join('')}</div>
<div class="trees">${UNITS.map(p => `<div class="tree" data-k="${p.key}"><h3>${p.part}</h3><div class="tree-in"><svg class="tree-ln" aria-hidden="true"></svg>${treeRows(p)}</div></div>`).join('')}</div>
<details class="tree-src"><summary>比重怎麼算的</summary><p>中國醫藥、義守、慈濟大學 106–115 學年度學士後中醫化學試題共 30 份、1498 題，逐題依主題分類。越近的年份越重要：106 年權重 1、107 年權重 2……115 年權重 10。「近三年」只看 113–115 年，不加權。106–110 年有 95 題只能看圖判斷產物、未細分主題，沒有算進來，所以各章加總略少於 50 題。一題常同時牽涉兩個主題，分類以主要考點為準。</p></details>
<h2>怎麼使用</h2>
<ul class="how"><li><b>每章是一堂課</b>：照小節順序讀，每節都有可以動手調整的圖。先玩圖、看說明，再往下讀。</li>
<li><b>章末小題只用來確認懂了沒</b>：答錯時按「在圖上看」，回到圖上找出哪裡想錯。</li>
<li><b>考試範圍</b>：中國醫藥、義守、慈濟大學學士後中醫的化學考科都包含普通化學與有機化學，命題以大學教科書為準；課程單元依教科書標準章節安排。</li></ul>
</div>`;
}

const WVIEW = ['加權平均', '近三年', '中國醫藥', '義守', '慈濟'];
state.wv = store.get('wv', 0);
const isNew = u => !unitCh(u);
function treeRows(p) {
  const ids = p.items.map(i => i[0]), d = {};
  const depth = u => d[u] ?? (d[u] = Math.max(-1, ...TREE[u].pre.filter(x => ids.includes(x)).map(depth)) + 1);
  const rows = []; ids.forEach(u => (rows[depth(u)] = rows[depth(u)] || []).push(u));
  const pos = {};   // 每列依上一列父節點的平均位置排序，減少連線交叉
  rows.forEach(r => { r.forEach((u, i) => { const ps = TREE[u].pre.filter(x => pos[x] != null); r[i] = [u, ps.length ? ps.reduce((a, x) => a + pos[x], 0) / ps.length : i / r.length]; });
    r.sort((a, b) => a[1] - b[1]); r.forEach(([u], i) => { pos[u] = r.length > 1 ? i / (r.length - 1) : .5; r[i] = u; }); });
  return rows.reverse().map(r => `<div class="trow">${r.map(u => treeNode(u, p)).join('')}</div>`).join('');
}
function treeNode(u, p) {
  const c = unitCh(u), t = unitName(u), cross = TREE[u].pre.filter(x => !x.startsWith(p.key));
  return `<a class="tn${c ? '' : ' plan'}${c && state.done[c.id] ? ' done' : ''}" data-u="${u}" ${c ? `href="#${c.id}"` : 'tabindex="0"'}>
<span class="tn-t">${t}${c && state.done[c.id] ? ' <span class="okm">✓</span>' : ''}</span>
<span class="tn-w"><span class="tn-bar"><i></i></span><b></b></span>
${c ? '' : '<small class="tn-s">規劃中</small>'}${cross.length ? `<small class="tn-x">先修：${cross.map(unitName).join('、')}</small>` : ''}</a>`;
}
function treeWeights() {
  $$('.tn').forEach(n => { const w = TREE[n.dataset.u].w[state.wv], a = TREE[n.dataset.u].w[0];
    n.querySelector('b').textContent = `≈ ${w.toFixed(1)} 題`;
    n.querySelector('i').style.width = `${Math.min(100, w / 4 * 100)}%`;
    n.style.setProperty('--heat', Math.min(1, w / 3.5).toFixed(2));
    n.title = `${unitName(n.dataset.u)}：每份約 ${w.toFixed(1)} 題（${WVIEW[state.wv]}）` + (state.wv === 1 && w - a >= .4 ? '，比十年加權高' : ''); });
}
function treeLines() {
  $$('.tree-in').forEach(box => { const svg = box.querySelector('svg'), B = box.getBoundingClientRect(); let h = '';
    box.querySelectorAll('.tn').forEach(n => TREE[n.dataset.u].pre.forEach(pu => { const m = box.querySelector(`.tn[data-u="${pu}"]`); if (!m) return;
      const a = m.getBoundingClientRect(), b = n.getBoundingClientRect();
      const x1 = a.left + a.width / 2 - B.left, y1 = a.top - B.top, x2 = b.left + b.width / 2 - B.left, y2 = b.bottom - B.top, my = (y1 + y2) / 2;
      h += `<path data-a="${pu}" data-b="${n.dataset.u}" d="M${x1} ${y1}C${x1} ${my} ${x2} ${my} ${x2} ${y2}"/>`; }));
    svg.setAttribute('width', B.width); svg.setAttribute('height', B.height); svg.innerHTML = h; });
}
function treeFocus(u) {   // 標出這章的全部先修鏈
  const set = new Set(), walk = x => { if (set.has(x)) return; set.add(x); TREE[x].pre.forEach(walk); };
  if (u) walk(u);
  $$('.tn').forEach(n => n.classList.toggle('lit', set.has(n.dataset.u)));
  $$('.tree-ln path').forEach(p => p.classList.toggle('lit', set.has(p.dataset.a) && set.has(p.dataset.b)));
  $$('.trees').forEach(t => t.classList.toggle('focus', !!u));
}
function bindTree() {
  treeWeights(); treeLines();
  $$('#wview button').forEach(b => b.onclick = () => { state.wv = +b.dataset.i; store.set('wv', state.wv);
    $$('#wview button').forEach(x => x.setAttribute('aria-pressed', x === b)); treeWeights(); });
  $$('.tn').forEach(n => { n.onmouseenter = n.onfocus = () => treeFocus(n.dataset.u); n.onmouseleave = n.onblur = () => treeFocus(null); });
  if (!window.__treeRO) { window.__treeRO = new ResizeObserver(() => $('.trees') && treeLines()); window.__treeRO.observe($('#article')); }
}

const INST = {};   // 目前頁面上各互動圖的實例（練習題「在圖上看」用）
function renderChapter(id) {
  const c = chOf(id), i = CH.indexOf(c), prev = CH[i - 1], next = CH[i + 1];
  $('#article').innerHTML = `<p class="eyebrow">${UNITS.find(p => p.items.some(x => x[0] === c.unit)).part} · ${unitName(c.unit)}</p><h1>${c.title}</h1><p class="lede">${c.lede}</p>
<nav class="secnav" aria-label="本章小節">${c.sections.map((s, k) => `<a href="#${id}/${k + 1}">${k + 1}. ${s.h}</a>`).join('')}<a href="#${id}/quiz">確認理解</a></nav>${(TERMS[id] || []).length ? `<div class="tchips" aria-label="本章名詞"><span class="lbl">本章名詞</span>${TERMS[id].map((t, k) => `<button type="button" class="tchip" data-t="${k}">${t[0]}</button>`).join('')}</div>` : ''}
${c.sections.map((s, k) => `<section class="sec" id="sec-${k + 1}"><h2><span class="sn">${k + 1}</span>${s.h}</h2><div class="prose">${s.body}</div>${[].concat(s.w || []).map(w => `<div class="widget" data-w="${w}"></div>`).join('')}</section>`).join('')}
<section class="sec" id="sec-quiz"><h2><span class="sn">✓</span>確認理解</h2><p class="mut small">答錯了沒關係：按「在圖上看」回到對應的圖，找出哪裡想錯。</p>${c.quiz.map((q, k) => `<div class="q" data-q="${k}"><p class="qt">${k + 1}. ${q.q}</p><div class="opts">${order(q, k).map(j => `<button class="opt" type="button" data-o="${j}">${q.o[j]}</button>`).join('')}</div><div class="why" hidden></div></div>`).join('')}</section>
<div class="foot"><button class="btn ${state.done[id] ? 'done' : ''}" type="button" id="doneBtn">${state.done[id] ? '已完成 ✓' : '標記為完成'}</button><nav class="pn">${prev ? `<a href="#${prev.id}"><small>上一章</small>${prev.title}</a>` : '<span></span>'}${next ? `<a href="#${next.id}" class="nx"><small>下一章</small>${next.title}</a>` : ''}</nav></div>`;
  for (const k in INST) delete INST[k];
  $$('.widget', $('#article')).forEach(w => { const n = w.dataset.w; try { const inst = W[n](w); if (!INST[n]) INST[n] = { inst, el: w }; } catch (e) { w.innerHTML = `<p class="note bad">互動圖載入失敗：${esc(e.message)}</p>`; console.error(e); } });
  const right = new Set();
  $$('.q', $('#article')).forEach(qe => {
    const q = c.quiz[+qe.dataset.q], why = $('.why', qe);
    $$('.opt', qe).forEach(b => { b.onclick = () => {
      const ok = +b.dataset.o === q.a; b.classList.add(ok ? 'right' : 'wrong'); why.hidden = false;
      const demo = q.show && INST[q.show.w] ? '<button class="btn sm" type="button" data-show>在圖上看 ↑</button>' : '';
      if (ok) { $$('.opt', qe).forEach(x => { x.disabled = true; }); why.className = 'why ok'; why.innerHTML = `<b>答對了。</b>${q.why}${demo}`; right.add(qe.dataset.q);
        if (right.size === c.quiz.length && !state.done[id]) { setDone(id, true); markBtn(); } }
      else { b.disabled = true; why.className = 'why no'; why.innerHTML = `<b>再想想。</b>${demo ? '按下面的按鈕回到圖上看看。' : ''}${demo}`; }
      const sb = $('[data-show]', why); if (sb) sb.onclick = () => showOnChart(q.show);
    }; });
  });
  bindTerms(id);
  const markBtn = () => { const d = !!state.done[id]; $('#doneBtn').textContent = d ? '已完成 ✓' : '標記為完成'; $('#doneBtn').classList.toggle('done', d); };
  $('#doneBtn').onclick = () => { setDone(id, !state.done[id]); markBtn(); };
}
// 選項順序：依題號固定打散，避免正解永遠在第一個（不用亂數，重新整理後順序不變）
// 名詞：內文第一次出現時變成連結，點了跳出解釋框；有對應互動圖時可以「在圖上看」
function showOnChart(show) {
  const it = INST[show.w]; if (!it) return;
  if (show.set) it.inst.set(show.set);
  it.el.scrollIntoView({ behavior: 'smooth', block: 'center' }); it.el.classList.add('flash'); setTimeout(() => it.el.classList.remove('flash'), 1200);
}
function bindTerms(id) {
  const T = TERMS[id] || [], art = $('#article');
  T.forEach(([term], k) => {   // 每個名詞只連結內文中第一次出現的位置（略過公式框與表格標題）
    const w = document.createTreeWalker(art, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentElement.closest('.prose') && !n.parentElement.closest('.eq, th, .tlink, button') && n.nodeValue.includes(term) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
    const n = w.nextNode(); if (!n) return;
    const i = n.nodeValue.indexOf(term), after = n.splitText(i); after.nodeValue = after.nodeValue.slice(term.length);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tlink'; b.dataset.t = k; b.textContent = term; n.parentNode.insertBefore(b, after);
  });
  const pop = document.createElement('div'); pop.id = 'tpop'; pop.hidden = true; pop.setAttribute('role', 'dialog'); art.appendChild(pop);
  const open = (btn, k) => {
    const [term, def, show] = T[k], ab = art.getBoundingClientRect(), r = btn.getBoundingClientRect();
    pop.innerHTML = `<b>${term}</b><p>${def}</p>${show && INST[show.w] ? '<button type="button" class="btn sm pri" data-go>在圖上看 →</button>' : ''}`;
    pop.hidden = false; pop.style.top = `${r.bottom - ab.top + 6}px`; pop.style.left = `${Math.max(0, Math.min(r.left - ab.left, ab.width - pop.offsetWidth))}px`;
    const g = $('[data-go]', pop); if (g) g.onclick = () => { pop.hidden = true; showOnChart(show); };
  };
  $$('.tlink, .tchip', art).forEach(b => { b.onclick = e => { e.stopPropagation(); open(b, +b.dataset.t); }; });
  if (!window.__tpopBound) {   // 點外面或按 Esc 關閉（只綁一次）
    window.__tpopBound = true;
    document.addEventListener('click', e => { const p = $('#tpop'); if (p && !p.hidden && !p.contains(e.target)) p.hidden = true; });
    document.addEventListener('keydown', e => { const p = $('#tpop'); if (p && e.key === 'Escape') p.hidden = true; });
  }
}
function order(q, k) { const n = q.o.length, s = (k * 7 + q.q.length) % n; return Array.from({ length: n }, (_, i) => (i + s) % n); }

let shown = null;
function route(h) {
  const [id, sec] = (h || '').split('/');
  const c = chOf(id);
  if (c && shown === id && sec) { const t = document.getElementById(`sec-${sec}`); if (t) t.scrollIntoView({ block: 'start' }); return; }  // 同一章只捲動，保留互動圖狀態
  shown = c ? id : null;
  if (c) { renderChapter(id); renderTOC(id); document.title = `${c.title}｜後中化學`; }
  else { renderHome(); bindTree(); renderTOC(''); document.title = '後中化學｜學習階梯'; }
  $('#tocBox').classList.remove('open');
  const t = sec ? document.getElementById(`sec-${sec}`) : id === 'map' && document.getElementById('map');
  if (t) setTimeout(() => t.scrollIntoView({ block: 'start' }), 0); else window.scrollTo(0, 0);
}
function boot() {
  addEventListener('hashchange', () => route(location.hash.slice(1)));
  $('#tocBtn').onclick = () => $('#tocBox').classList.toggle('open');
  updateProgress(); route(location.hash.slice(1));
}
