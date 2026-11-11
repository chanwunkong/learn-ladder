/* ---------- 後中生物：先測再學（2026-11-11 使用者決定） ----------
   1. 程度測驗：每章 6 題，依「部」分卷；每題四個選項外加「不確定」（算答錯，避免猜對被當成會）。
   2. 每章依第一次作答分三級：5–6 題對＝已掌握、3–4＝要補洞、0–2＝弱項，標在章節地圖上；弱項依中國醫比重排優先順序。
   3. 答錯或選不確定的題目進共用的錯題排程（src/shared/review.js）；答對的不排確認題（測驗題太多，只追蹤錯的）。
   紀錄每一筆：{ t, c 章, k:'dx', h 'dx:題目 id', ok, n, p 選了什麼, qt 題目摘要 } */
const LOG = store.get('log', []);
function logAnswer(e) {
  LOG.push({ t: Date.now(), ...e }); if (LOG.length > 20000) LOG.splice(0, LOG.length - 20000);
  store.set('log', LOG); if (typeof CLOUD !== 'undefined' && CLOUD.pushLog) CLOUD.pushLog();
}
const plain = h => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const qh = q => 'dx:' + q.id;
const QIX = Object.fromEntries(DIAG.map(q => [qh(q), q]));
const UNSURE = '不確定';
// 錯題本只追蹤曾經答錯或選不確定的題目
const qlog = () => { const bad = new Set(LOG.filter(e => e.k === 'dx' && !e.ok).map(e => e.h)); return REVIEW.live(LOG).filter(e => e.k === 'dx' && bad.has(e.h)); };
const firstAns = () => { const m = new Map(); LOG.forEach(e => { if (e.k === 'dx' && e.h && !m.has(e.h)) m.set(e.h, e); }); return m; };

/* ---- 章節名稱與狀態 ---- */
const ITEMS = UNITS.flatMap(p => p.items.map(([u, t], i) => ({ u, t, p, num: `${p.s}${i + 1}` })));
const IT = Object.fromEntries(ITEMS.map(x => [x.u, x]));
const unitName = u => IT[u].t;
const chQs = u => DIAG.filter(q => q.u === u);
const partQs = p => p.items.flatMap(([u]) => chQs(u));
const LV = { good: '已掌握', mid: '要補洞', weak: '弱項' };
function status(u, first = firstAns()) {
  const qs = chQs(u); if (!qs.length) return null;
  const ans = qs.filter(q => first.has(qh(q))), ok = ans.filter(q => first.get(qh(q)).ok).length;
  if (ans.length < qs.length) return { n: ans.length, of: qs.length, ok };
  const r = ok / qs.length;
  return { n: ans.length, of: qs.length, ok, lv: r >= 5 / 6 ? 'good' : r >= .5 ? 'mid' : 'weak' };
}

/* ---- 選擇題：四個選項打亂，「不確定」固定在最後；只作答一次，答完列出四個選項的說明 ---- */
const exHTML = q => `<ul class="exl">${q.o.map((o, j) => `<li class="${j ? 'no' : 'ok'}"><b>${j ? '✗' : '✓'} ${esc(o)}</b><br>${esc(q.ex[j])}</li>`).join('')}</ul>`;
function mcq(q, num) {
  const ord = shuffled(q.o.length, q.id + Math.random());   // 每次打開都重新打亂，複習時不能靠記位置
  return `<div class="q" data-h="${esc(qh(q))}">${num ? `<p class="qnum">${num}</p>` : ''}<p class="qt">${esc(q.q)}</p><div class="opts">${ord.map(j => `<button class="opt" type="button" data-o="${j}">${esc(q.o[j])}</button>`).join('')}<button class="opt unsure" type="button" data-o="u">${UNSURE}</button></div><div class="why" hidden></div></div>`;
}
const whyHTML = (q, e) => `<b>${e.ok ? '✓ 答對了。' : e.p === UNSURE ? '? 選了不確定，算答錯，已進錯題本。' : '✗ 答錯了，已進錯題本。'}</b><small class="qch">${IT[q.u].num} ${esc(unitName(q.u))}</small>${exHTML(q)}`;
function showAnswer(qe, q, e) {
  $$('.opt', qe).forEach(x => { x.disabled = true; const o = x.dataset.o; if (o === '0') x.classList.add('right'); else if ((o === 'u' ? UNSURE : q.o[+o]) === e.p && !e.ok) x.classList.add('wrong'); });
  const why = $('.why', qe); why.hidden = false; why.className = `why ${e.ok ? 'ok' : 'no'}`; why.innerHTML = whyHTML(q, e); qe.classList.add('done');
}
// done(q, e)：作答後呼叫；restore：已做過的題目直接顯示結果（測驗頁）
function bindMcq(root, list, { done, restore, rv } = {}) {
  const first = firstAns();
  list.forEach(q => {
    const qe = root.querySelector(`.q[data-h="${CSS.escape(qh(q))}"]`); if (!qe) return;
    if (restore && first.has(qh(q))) { showAnswer(qe, q, first.get(qh(q))); return; }
    $$('.opt', qe).forEach(b => { b.onclick = () => {
      const p = b.dataset.o === 'u' ? UNSURE : q.o[+b.dataset.o], e = { c: q.u, k: 'dx', h: qh(q), ok: b.dataset.o === '0' ? 1 : 0, n: 1, p, qt: plain(q.q).slice(0, 60) };
      logAnswer(e); showAnswer(qe, q, e);
      if (rv) $('.why', qe).insertAdjacentHTML('beforeend', `<p><small>${REVIEW.after(rv[qh(q)], e.ok)}</small></p>`);
      if (done) done(q, e);
    }; });
  });
}

/* ---- 首頁 ---- */
const WVIEW = ['加權平均', '近三年', '中國醫藥', '義守', '慈濟'];
let wv = store.get('wv', 0);
function partRow(p, first) {
  const qs = partQs(p), n = qs.filter(q => first.has(qh(q))).length, ready = p.items.every(([u]) => chQs(u).length);
  if (!ready) return `<li class="dx soon"><span class="dx-h">${p.part}</span><span class="dx-s">題目製作中</span></li>`;
  return `<li class="dx${n === qs.length ? ' fin' : ''}"><a href="#dx-${p.key}"><span class="dx-h">${p.part}</span><span class="dx-s">${p.items.length} 章 × 6 題・約 ${Math.round(qs.length * 0.75)} 分鐘</span><span class="pbar"><i style="width:${Math.round(100 * n / qs.length)}%"></i></span><span class="dx-st">${n === qs.length ? '✓ 完成，看結果' : n ? `${n} / ${qs.length} 題` : '開始測驗 →'}</span></a></li>`;
}
function priority(first) {
  const rows = ITEMS.map(x => ({ ...x, s: status(x.u, first) })).filter(x => x.s && x.s.lv);
  if (!rows.length) return '';
  const ord = { weak: 0, mid: 1, good: 2 }, list = rows.sort((a, b) => ord[a.s.lv] - ord[b.s.lv] || TREE[b.u].w[2] - TREE[a.u].w[2]);
  const li = x => `<li class="pr st-${x.s.lv}"><span class="pr-l">${LV[x.s.lv]}</span><span>${x.num} ${esc(x.t)}</span><b>答對 ${x.s.ok}/${x.s.of}・中國醫每份約 ${TREE[x.u].w[2].toFixed(1)} 題</b></li>`;
  const todo = list.filter(x => x.s.lv !== 'good'), ok = list.filter(x => x.s.lv === 'good');
  return `<h2>要先補強的章節</h2><p class="mut tree-note">已測完的章節中，弱項排最前面；同一級依中國醫的考試比重由高到低。</p>
${todo.length ? `<ol class="prs">${todo.map(li).join('')}</ol>` : '<p class="note">已測完的章節都已掌握。</p>'}
${ok.length ? `<details class="tree-src"><summary>已掌握 ${ok.length} 章（只留在之後的混合複習）</summary><ol class="prs">${ok.map(li).join('')}</ol></details>` : ''}`;
}
function renderHome() {
  const first = firstAns(), due = REVIEW.book(qlog()).due.length;
  $('#main').innerHTML = `<div class="home"><p class="eyebrow">學士後中醫入學考 · 生物</p>
<h1 class="hero">先測再學：<br>只把時間花在弱項。</h1>
<p class="lede">31 章依「部」分成 7 卷程度測驗，每章 6 題，難度照中國醫 113–115。每題除了四個選項，還有「不確定」：沒把握就選它，算答錯，不要猜。測完後每章標成已掌握、要補洞或弱項，再依考試比重決定先讀哪一章。</p>
${due ? `<p class="duebar"><a href="#review">錯題本有 <b>${due}</b> 題今天到期 →</a></p>` : ''}
<h2>程度測驗</h2><ol class="dxs">${UNITS.map(p => partRow(p, first)).join('')}</ol>
${priority(first)}
<h2 id="map">章節地圖：先修關係與考試比重</h2>
<p class="mut tree-note">由上往下是學習順序：最基礎的章節在最上面，下面的章節會用到上面的觀念。數字是三校歷屆試題中，<b>每份 50 題平均約考幾題</b>。框線顏色是程度測驗的結果：<span class="lg st-good">已掌握</span><span class="lg st-mid">要補洞</span><span class="lg st-weak">弱項</span>，虛線是還沒測。</p>
<div class="seg" id="wview">${WVIEW.map((v, i) => `<button aria-pressed="${i === wv}" data-i="${i}">${v}</button>`).join('')}</div>
<div class="trees">${UNITS.map(p => `<div class="tree" data-k="${p.key}"><h3>${p.part}</h3><div class="tree-in"><svg class="tree-ln" aria-hidden="true"></svg>${treeRows(p, first)}</div></div>`).join('')}</div>
<details class="tree-src"><summary>比重怎麼算的</summary><p>中國醫藥、義守、慈濟大學 106–115 學年度學士後中醫生物試題共 30 份、1500 題，逐題依主題分類。越近的年份越重要：106 年權重 1、107 年權重 2……115 年權重 10。「近三年」只看 113–115 年，不加權。一題只歸一個主要考點。</p></details>
<div class="row endrow"><a class="btn" href="#review">錯題本</a></div></div>`;
  bindTree();
}
// 章節地圖（照化學的畫法：每列依先修深度，連線是先修關係）
function treeRows(p, first) {
  const ids = p.items.map(i => i[0]), d = {};
  const depth = u => d[u] ?? (d[u] = Math.max(-1, ...TREE[u].pre.filter(x => ids.includes(x)).map(depth)) + 1);
  const rows = []; ids.forEach(u => (rows[depth(u)] = rows[depth(u)] || []).push(u));
  const pos = {};   // 每列依上一列父節點的平均位置排序，減少連線交叉
  rows.forEach(r => { r.forEach((u, i) => { const ps = TREE[u].pre.filter(x => pos[x] != null); r[i] = [u, ps.length ? ps.reduce((a, x) => a + pos[x], 0) / ps.length : i / r.length]; });
    r.sort((a, b) => a[1] - b[1]); r.forEach(([u], i) => { pos[u] = r.length > 1 ? i / (r.length - 1) : .5; r[i] = u; }); });
  return rows.map(r => `<div class="trow">${r.map(u => treeNode(u, p, first)).join('')}</div>`).join('');
}
function treeNode(u, p, first) {
  const s = status(u, first), cross = TREE[u].pre.filter(x => !x.startsWith(p.key));
  return `<a class="tn${s && s.lv ? ` st-${s.lv}` : ' plan'}" data-u="${u}" ${s ? `href="#dx-${p.key}"` : 'tabindex="0"'}>
<span class="tn-t"><small class="tn-n">${IT[u].num}</small> ${unitName(u)}</span>
<span class="tn-w"><span class="tn-bar"><i></i></span><b></b></span>
<small class="tn-s">${s && s.lv ? `${LV[s.lv]}・答對 ${s.ok}/${s.of}` : s && s.n ? `測驗中 ${s.n}/${s.of}` : s ? '還沒測' : '題目製作中'}</small>${cross.length ? `<small class="tn-x">先修：${cross.map(unitName).join('、')}</small>` : ''}</a>`;
}
function treeWeights() {
  $$('.tn').forEach(n => { const w = TREE[n.dataset.u].w[wv];
    n.querySelector('b').textContent = `≈ ${w.toFixed(1)} 題`;
    n.querySelector('i').style.width = `${Math.min(100, w / 5 * 100)}%`;
    n.title = `${unitName(n.dataset.u)}：每份約 ${w.toFixed(1)} 題（${WVIEW[wv]}）`; });
}
function treeLines() {
  $$('.tree-in').forEach(box => { const svg = box.querySelector('svg'), B = box.getBoundingClientRect(); let h = '';
    box.querySelectorAll('.tn').forEach(n => TREE[n.dataset.u].pre.forEach(pu => { const m = box.querySelector(`.tn[data-u="${pu}"]`); if (!m) return;
      const a = m.getBoundingClientRect(), b = n.getBoundingClientRect();
      const x1 = a.left + a.width / 2 - B.left, y1 = a.bottom - B.top, x2 = b.left + b.width / 2 - B.left, y2 = b.top - B.top, my = (y1 + y2) / 2;
      h += `<path data-a="${pu}" data-b="${n.dataset.u}" d="M${x1} ${y1}C${x1} ${my} ${x2} ${my} ${x2} ${y2}"/>`; }));
    svg.setAttribute('width', B.width); svg.setAttribute('height', B.height); svg.innerHTML = h; });
}
function treeFocus(u) {   // 標出這章的全部先修鏈（跨部的先修也一起亮）
  const set = new Set(), walk = x => { if (set.has(x)) return; set.add(x); TREE[x].pre.forEach(walk); };
  if (u) walk(u);
  $$('.tn').forEach(n => n.classList.toggle('lit', set.has(n.dataset.u)));
  $$('.tree-ln path').forEach(p => p.classList.toggle('lit', set.has(p.dataset.a) && set.has(p.dataset.b)));
  $$('.trees').forEach(t => t.classList.toggle('focus', !!u));
}
function bindTree() {
  treeWeights(); treeLines();
  $$('#wview button').forEach(b => { b.onclick = () => { wv = +b.dataset.i; store.set('wv', wv);
    $$('#wview button').forEach(x => x.setAttribute('aria-pressed', x === b)); treeWeights(); }; });
  $$('.tn').forEach(n => { n.onmouseenter = n.onfocus = () => treeFocus(n.dataset.u); n.onmouseleave = n.onblur = () => treeFocus(null); });
  if (!window.__treeRO) { window.__treeRO = new ResizeObserver(() => $('.trees') && treeLines()); window.__treeRO.observe($('#main')); }
}

/* ---- 程度測驗：一卷＝一部；題目順序打散（固定種子），不依章節排，避免從前後題猜出考點 ---- */
function renderDx(p) {
  const qs = partQs(p), ord = shuffled(qs.length, 'dx-' + p.key).map(i => qs[i]);
  $('#main').innerHTML = `<p class="eyebrow">程度測驗・${p.part}</p><nav class="pn"><a href="#">‹ 回首頁</a></nav>
<h1>${p.part}：${qs.length} 題</h1>
<p class="lede">每題只作答一次。沒把握就選「不確定」，不要猜：猜對會讓弱項被當成已掌握。答完會列出四個選項各自對或錯在哪。</p>
<div id="dq">${ord.map((q, i) => mcq(q, `${i + 1} / ${qs.length}`)).join('')}</div><div id="dxRes"></div>`;
  const res = () => {
    const first = firstAns(), n = qs.filter(q => first.has(qh(q))).length;
    $('#pgTag').textContent = `本卷 ${n} / ${qs.length} 題`;
    if (n < qs.length) { $('#dxRes').innerHTML = ''; return; }
    $('#dxRes').innerHTML = `<section class="part"><h2>這一卷的結果</h2><ol class="prs">${p.items.map(([u]) => { const s = status(u, first);
      return `<li class="pr st-${s.lv}"><span class="pr-l">${LV[s.lv]}</span><span>${IT[u].num} ${esc(unitName(u))}</span><b>答對 ${s.ok}/${s.of}</b></li>`; }).join('')}</ol>
<div class="row endrow"><a class="btn pri" href="#map">回章節地圖看全部</a><a class="btn" href="#review">錯題本</a></div></section>`;
  };
  bindMcq($('#dq'), ord, { restore: true, done: res }); res();
}

/* ---- 錯題本：今天到期的重考（記錄、影響排程）；之後到期的只列數量 ---- */
function renderReview() {
  const book = REVIEW.book(qlog()), list = book.due.filter(s => QIX[s.h]).slice(0, 50), rv = Object.fromEntries(list.map(s => [s.h, s]));
  const later = book.open.filter(s => QIX[s.h] && !list.includes(s)).length;
  $('#main').innerHTML = `<p class="eyebrow">錯題本</p><nav class="pn"><a href="#">‹ 回首頁</a></nav><h1>錯題複習</h1>
<p class="lede">程度測驗答錯或選「不確定」的題目，依 1、3、7、14、30 天的間隔再考，五格都答對才離開錯題本。</p>
${list.length ? `<div id="rq">${list.map(s => `<p class="qsrc">${IT[QIX[s.h].u].num} ${esc(unitName(QIX[s.h].u))}・${REVIEW.label(s)}</p>${mcq(QIX[s.h], '')}`).join('')}</div>` : '<p class="note">今天沒有到期的錯題。</p>'}
${later ? `<p class="note">另有 ${later} 題還沒到期。</p>` : ''}`;
  $('#pgTag').textContent = '';
  if (list.length) bindMcq($('#rq'), list.map(s => QIX[s.h]), { rv });
}

// 給學習階梯首頁的摘要：測了幾題、各級幾章、今天到期幾題
function saveSummary() {
  const first = firstAns(), c = { good: 0, mid: 0, weak: 0 };
  ITEMS.forEach(x => { const s = status(x.u, first); if (s && s.lv) c[s.lv]++; });
  store.set('sum', { n: DIAG.filter(q => first.has(qh(q))).length, of: DIAG.length, ...c, due: REVIEW.book(qlog()).due.length, t: Date.now() });
}
function route() {
  const h = location.hash.slice(1), p = UNITS.find(x => h === 'dx-' + x.key);
  $('#pgTag').textContent = '';
  if (p && partQs(p).length) renderDx(p);
  else if (h === 'review') renderReview();
  else { renderHome(); if (h === 'map') { $('#map').scrollIntoView(); saveSummary(); return; } }
  saveSummary(); window.scrollTo(0, 0);
}
function boot() { addEventListener('hashchange', route); route(); }
