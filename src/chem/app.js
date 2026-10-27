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
<div class="cta">${CH.map(c => `<a class="btn pri" href="#${c.id}">${unitName(c.unit)}：${c.title}</a>`).join('')}</div>
<h2>課程地圖</h2>
<div class="map">${UNITS.map(p => `<div><h3>${p.part}</h3><ol>${p.items.map(([u, t]) => { const c = unitCh(u); return `<li class="${c ? 'ok' : ''}">${c ? `<a href="#${c.id}">${t}</a>` : t}${c ? (state.done[c.id] ? ' <span class="okm">✓</span>' : '') : ' <small class="mut">製作中</small>'}</li>`; }).join('')}</ol></div>`).join('')}</div>
<h2>怎麼使用</h2>
<ul class="how"><li><b>每章是一堂課</b>：照小節順序讀，每節都有可以動手調整的圖。先玩圖、看說明，再往下讀。</li>
<li><b>章末小題只用來確認懂了沒</b>：答錯時按「在圖上看」，回到圖上找出哪裡想錯。</li>
<li><b>考試範圍</b>：中國醫藥、義守、慈濟大學學士後中醫的化學考科都包含普通化學與有機化學，命題以大學教科書為準；課程單元依教科書標準章節安排。</li></ul>
</div>`;
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
  else { renderHome(); renderTOC(''); document.title = '後中化學｜學習階梯'; }
  $('#tocBox').classList.remove('open');
  const t = sec && document.getElementById(`sec-${sec}`);
  if (t) setTimeout(() => t.scrollIntoView({ block: 'start' }), 0); else window.scrollTo(0, 0);
}
function boot() {
  addEventListener('hashchange', () => route(location.hash.slice(1)));
  $('#tocBtn').onclick = () => $('#tocBox').classList.toggle('open');
  updateProgress(); route(location.hash.slice(1));
}
