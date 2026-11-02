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
  const nDue = REVIEW.book(LOG).due.length;
  $('#toc').innerHTML = `<a href="#review" class="toc-log${cur === 'review' ? ' cur' : ''}">錯題複習${nDue ? `（今天 ${nDue} 題）` : ''}</a><a href="#log" class="toc-log${cur === 'log' ? ' cur' : ''}">練習紀錄</a>` + UNITS.map(p => `<p class="toc-h">${p.part}</p><ol>${p.items.map(([u, t], i) => { const c = unitCh(u);
    return c ? `<li><a href="#${c.id}" class="${c.id === cur ? 'cur' : ''} ${state.done[c.id] ? 'done' : ''}"${c.id === cur ? ' aria-current="page"' : ''}><span class="num">${p.key === 'g' ? '普' : '有'}${i + 1}</span><span>${c.title}</span></a></li>`
      : `<li><span class="soon"><span class="num">${p.key === 'g' ? '普' : '有'}${i + 1}</span><span>${t}</span><small>製作中</small></span></li>`; }).join('')}</ol>`).join('');
}

function renderHome() {
  $('#article').innerHTML = `<div class="home">
<p class="eyebrow">學士後中醫入學考 · 化學</p>
<h1 class="hero">不背反應，<br>看懂原理就推得出來。</h1>
<p class="lede">普通化學和有機化學，每一章都從直覺和圖像開始：先動手看到現象，再推出公式與規則，最後用在題目上。普化學到的酸鹼、平衡、熱力學，會直接拿來解釋有機反應。</p>
${(() => { const nx = CH.find(c => !state.done[c.id]) || CH[0], any = CH.some(c => state.done[c.id]), last = store.get('last', null), lc = last && chOf(last.id);
  const go = lc ? `<a class="btn pri" href="#${lc.id}${last.sec ? '/' + last.sec : ''}">繼續上次：${lc.title}${last.sh ? `・${last.sh}` : ''} →</a>` : `<a class="btn pri" href="#${nx.id}">${any ? '繼續：' : '從第一章開始：'}${nx.title} →</a>`;
  return `<div class="cta">${go}<a class="btn" href="#map">看課程地圖</a><a class="btn" href="#review">錯題複習${(n => n ? `（今天 ${n} 題）` : '')(REVIEW.book(LOG).due.length)}</a><a class="btn" href="#log">練習紀錄</a></div>`; })()}
<h2 id="map">課程地圖</h2>
<p class="mut tree-note">由上往下是學習順序：最基礎的章節在最上面，下面的章節會用到上面的觀念。數字是三校歷屆試題中，<b>每份 50 題平均約考幾題</b>。點虛線框的是規劃中的章節。</p>
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
  return rows.map(r => `<div class="trow">${r.map(u => treeNode(u, p)).join('')}</div>`).join('');
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
      const x1 = a.left + a.width / 2 - B.left, y1 = a.bottom - B.top, x2 = b.left + b.width / 2 - B.left, y2 = b.top - B.top, my = (y1 + y2) / 2;
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

/* ---------- 練習紀錄：每次作答存一筆（存在這台裝置的瀏覽器；登入後合併同步到雲端） ----------
   { t: 時間戳, c: 章 id, k: 'q' 章末題／'x' 相似題, i: 當時的題號, h: 題目識別碼, qt: 題目文字快照, p: 選的選項, ok: 1/0, n: 這次第幾次作答 }
   題庫更新（插入、刪除、重排題目）時紀錄不會錯位：一律用 h 找題目；找不到時顯示 qt 快照。
   題目文字若要改寫又想保留舊紀錄的對應，在題目上加 id: '舊的識別碼'。紀錄永不因題庫更新而刪除。 */
const strip = h => String(h).replace(/<[^>]+>/g, '');
const qhash = s => { let h = 5381; for (const ch of s) h = ((h << 5) + h + ch.codePointAt(0)) >>> 0; return h.toString(36); };
const qid = (cid, q, k) => q.id || qhash(cid + '|' + k + '|' + strip(q.q));
const LOG = store.get('log', []);
const qbank = (c, k) => (k === 'x' ? c.exam : c.quiz) || [];
// 舊版紀錄只有題號：第一次載入時依「當時的題庫」補上識別碼與快照，之後題庫怎麼改都對得上
(() => { let ch = 0; LOG.forEach(e => { if (e.h) return; const c = chOf(e.c), q = c && qbank(c, e.k)[e.i]; if (q) { e.h = qid(c.id, q, e.k); e.qt = strip(q.q).slice(0, 60); ch = 1; } }); if (ch) store.set('log', LOG); })();
function logAnswer(e) { LOG.push({ t: Date.now(), ...e }); if (LOG.length > 20000) LOG.splice(0, LOG.length - 20000); store.set('log', LOG); if (typeof CLOUD !== 'undefined' && CLOUD.pushLog) CLOUD.pushLog(); }
// 由識別碼找回目前的題目（題號可能已變）
let QIX = null;
function qfind(cid, h, k, i) {
  if (!QIX) { QIX = {}; CH.forEach(c => ['q', 'x'].forEach(kk => qbank(c, kk).forEach((q, j) => { QIX[c.id + '|' + qid(c.id, q, kk)] = { c, k: kk, i: j, q }; }))); }
  return (h && QIX[cid + '|' + h]) || (!h && chOf(cid) && qbank(chOf(cid), k)[i] ? { c: chOf(cid), k, i, q: qbank(chOf(cid), k)[i] } : null);
}
const dstr = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const tstr = t => { const d = new Date(t); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
// 一步一步來：把一題拆成幾個小判斷，每步答對才往下；答錯不給答案
function guide(qe, sts) {
  const box = document.createElement('div'); box.className = 'guide';
  box.innerHTML = '<button class="btn sm ghost" type="button" data-g>一步一步來</button><div class="gbody" hidden></div>';
  $('.opts', qe).after(box);
  const body = $('.gbody', box), done = [];
  const draw = k => {
    const st = sts[k], ord = [1, 2, 3].map(j => [Math.random(), j]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    body.innerHTML = `${done.length ? `<ol class="gdone">${done.map(d => `<li>${d}</li>`).join('')}</ol>` : ''}<p class="small mut">第 ${k + 1} 步，共 ${sts.length} 步</p><p class="gq">${st[0]}</p><div class="opts">${ord.map(j => `<button class="gopt opt" type="button" data-j="${j}">${st[j]}</button>`).join('')}</div><div class="gwhy" hidden></div>`;
    $$('.gopt', body).forEach(b => { b.onclick = () => {
      const ok = b.dataset.j === '1', w = $('.gwhy', body); b.classList.add(ok ? 'right' : 'wrong'); b.disabled = true; w.hidden = false;
      if (!ok) { w.className = 'gwhy why no'; w.innerHTML = '這個不對，再想想。'; return; }
      $$('.gopt', body).forEach(x => { x.disabled = true; }); done.push(`${st[0]}<b>${st[1]}</b>`);
      const last = k === sts.length - 1;
      w.className = 'gwhy why ok'; w.innerHTML = `<b>對。</b>${st[4]}<button class="btn sm" type="button" data-n>${last ? '回到原題再選一次 ↑' : '下一步'}</button>`;
      $('[data-n]', w).onclick = () => { if (last) { body.hidden = true; $('[data-g]', box).hidden = false; done.length = 0; qe.scrollIntoView({ behavior: 'smooth', block: 'start' }); } else draw(k + 1); };
    }; });
  };
  qe.openGuide = () => { if (!body.hidden) return; $('[data-g]', box).hidden = true; body.hidden = false; done.length = 0; draw(0); };
  $('[data-g]', box).onclick = qe.openGuide;
}
function qblock(list, kind) {
  return list.map((q, k) => `<div class="q" data-k="${kind}" data-q="${k}">${q.src ? `<p class="qsrc">仿 ${String(q.src).replace(/^仿\s*/, '')}</p>` : ''}<p class="qt">${k + 1}. ${q.q}</p><div class="opts">${order(q, k).map(j => `<button class="opt" type="button" data-o="${j}">${q.o[j]}</button>`).join('')}</div><div class="why" hidden></div></div>`).join('');
}
// 把連續的作答併成「一題一次」：同一章、同一題、同一頁面瀏覽中，從第 1 次作答到答對為止
function sessions(log = LOG) {
  const out = [];
  log.filter(e => e.k !== 'r' && e.k !== 'fu').forEach(e => { const key = e.h || e.k + e.i, last = out.length && [...out].reverse().find(s => s.c === e.c && s.key === key && !s.closed);
    if (e.n === 1 || !last) out.push({ t: e.t, c: e.c, k: e.k, i: e.i, h: e.h, qt: e.qt, key, tries: 1, ok: e.ok, first: e.ok, closed: !!e.ok, end: e.t });
    else { last.tries++; last.end = e.t; if (e.ok) { last.ok = 1; last.closed = true; } } });
  return out;
}
function lastSeen(id) {
  const ss = sessions().filter(s => s.c === id && s.k === 'q'); if (!ss.length) return '';
  const d = dstr(ss[ss.length - 1].t), day = ss.filter(s => dstr(s.t) === d);
  return `<br>上次練習 ${d}：${day.length} 題，第一次就答對 ${day.filter(s => s.first).length} 題。<a href="#log">看練習紀錄</a>`;
}
function renderLog() {
  const ss = sessions(), days = [...new Set(ss.map(s => dstr(s.t)))].sort().reverse(), pct = (a, b) => (b ? `${Math.round(100 * a / b)}%` : '—');
  const byCh = CH.map(c => { const x = ss.filter(s => s.c === c.id); return { c, n: x.length, f: x.filter(s => s.first).length, last: x.length ? dstr(x[x.length - 1].t) : '' }; }).filter(r => r.n);
  const res = s => (s.first ? '<span class="ok">✓ 第一次答對</span>' : s.ok ? `<span class="warn">第 ${s.tries} 次答對</span>` : `<span class="bad">✗ 未答對</span>`);
  $('#article').innerHTML = `<p class="eyebrow">後中化學</p><h1>練習紀錄</h1><p class="lede">每一次作答都會自動記錄：日期時間、章節、題目、作答次數與結果。紀錄存在這台裝置的瀏覽器中。</p>
${ss.length ? `<div class="cards">${card('n', '練習題次', ss.length)}${card('f', '第一次就答對', pct(ss.filter(s => s.first).length, ss.length))}${card('d', '練習天數', days.length)}${card('l', '最近一次', `${dstr(ss[ss.length - 1].t)} ${tstr(ss[ss.length - 1].t)}`)}</div>
<h2>各章</h2><table class="tbl"><thead><tr><th>章節</th><th>題次</th><th>第一次就答對</th><th>最近練習</th></tr></thead><tbody>${byCh.map(r => `<tr><td><a href="#${r.c.id}">${r.c.title}</a></td><td>${r.n}</td><td>${pct(r.f, r.n)}</td><td>${r.last}</td></tr>`).join('')}</tbody></table>
<h2>每日紀錄</h2>${days.map((d, k) => { const x = ss.filter(s => dstr(s.t) === d);
  return `<details class="logday"${k ? '' : ' open'}><summary><b>${d}</b>　${x.length} 題，第一次就答對 ${pct(x.filter(s => s.first).length, x.length)}</summary><table class="tbl"><thead><tr><th>時間</th><th>章節</th><th>題目</th><th>結果</th></tr></thead><tbody>${x.map(s => { const c = chOf(s.c), f = qfind(s.c, s.h, s.k, s.i), q = f && f.q;
    return `<tr><td class="mono">${tstr(s.t)}</td><td>${c ? `<a href="#${c.id}/${s.k === 'x' ? 'exam' : 'quiz'}">${c.title.split('：')[0]}</a>` : s.c}${s.k === 'x' ? '<small class="mut">（相似題）</small>' : s.k === 'd' ? '<small class="mut">（推產物）</small>' : ''}</td><td>${q ? strip(q.q).slice(0, 48) : s.k === 'd' ? esc(s.qt || '') : s.qt ? `${esc(s.qt.slice(0, 48))}<small class="mut">（此題已改版）</small>` : '（題目已更新）'}</td><td>${res(s)}</td></tr>`; }).join('')}</tbody></table></details>`; }).join('')}
<div class="w-row"><button class="btn sm" type="button" id="logCsv">下載 CSV</button><button class="btn sm ghost" type="button" id="logClr">清除全部紀錄</button></div>`
  : '<p class="note">還沒有紀錄。到任何一章的「確認理解」或「歷屆考題相似題」作答，就會自動記在這裡。</p>'}`;
  if (!ss.length) return;
  $('#logCsv').onclick = () => {
    const rows = [['日期', '時間', '章節', '類型', '題號', '題目', '作答次數', '第一次就答對', '最後答對']].concat(ss.map(s => { const c = chOf(s.c), f = qfind(s.c, s.h, s.k, s.i), q = f && f.q;
      return [dstr(s.t), tstr(s.t), c ? c.title : s.c, s.k === 'x' ? '相似題' : s.k === 'd' ? '推產物' : '章末題', f ? f.i + 1 : '', q ? strip(q.q) : s.qt || '', s.tries, s.first ? '是' : '否', s.ok ? '是' : '否']; }));
    const csv = '\ufeff' + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `化學練習紀錄-${dstr(Date.now())}.csv`; a.click();
  };
  $('#logClr').onclick = () => { if (confirm('確定要清除這台裝置上的全部練習紀錄？')) { LOG.length = 0; store.set('log', LOG); renderLog(); } };
}

// 錯題複習：依 REVIEW 的排程，把今天到期的錯題集中起來重考（規則見 src/shared/review.js）
function renderReview() {
  const { open, checks, due } = REVIEW.book(LOG), now = Date.now();
  const items = due.map(s => ({ s, f: qfind(s.c, s.h, s.k, s.i) })).filter(x => x.f);
  const soon = open.filter(s => s.due > now && s.due <= now + 7 * REVIEW.DAY).length;
  $('#article').innerHTML = `<p class="eyebrow">後中化學</p><h1>錯題複習</h1>
<p class="lede">${REVIEW.RULE}</p>
<div class="cards">${card('d', '今天到期', `${items.length} 題`)}${card('o', '錯題本共', `${open.length} 題`)}${card('s', '7 天內到期', `${soon} 題`)}${card('c', '待確認（答對過的新題）', `${checks.length} 題`)}</div>
${(up => up.length ? `<p class="small mut">接下來 14 天：${up.map(([d, n]) => `${+d.slice(5, 7)}/${+d.slice(8)} ${n} 題`).join('、')}</p>` : '')(REVIEW.upcoming(open.concat(checks)))}
${items.length ? items.map(({ s, f }, n) => `<div class="q" data-r="${n}"><p class="qsrc"><a href="#${f.c.id}">${f.c.title.split('：')[0]}</a>${f.k === 'x' ? '・相似題' : '・章末題'}・${REVIEW.label(s)}</p><p class="qt">${n + 1}. ${f.q.q}</p><div class="opts">${order(f.q, f.i).map(j => `<button class="opt" type="button" data-o="${j}">${f.q.o[j]}</button>`).join('')}</div><div class="why" hidden></div></div>`).join('')
  : `<p class="note">${open.length ? '今天沒有到期的錯題，到期的題目會在這裡出現。' : '錯題本是空的。到各章練習時第一次答錯的題目，會自動排進這裡。'}</p>`}`;
  items.forEach(({ s, f }, n) => {
    const qe = $(`.q[data-r="${n}"]`), q = f.q, why = $('.why', qe);
    let tries = 0;
    const sts = (STEPS[f.c.id] || {})[f.k + ':' + s.h];
    if (sts) guide(qe, sts);
    $$('.opt', qe).forEach(b => { b.onclick = () => {
      const ok = +b.dataset.o === q.a; b.classList.add(ok ? 'right' : 'wrong'); why.hidden = false; tries++;
      logAnswer({ c: f.c.id, k: f.k, i: f.i, h: s.h, qt: strip(q.q).slice(0, 60), p: +b.dataset.o, ok: ok ? 1 : 0, n: tries });
      if (ok) { $$('.opt', qe).forEach(x => { x.disabled = true; }); const gb = $('.guide', qe); if (gb) gb.hidden = true;
        const fin = (fok, st) => { why.className = 'why ok'; why.innerHTML = `${st && !fok ? `<b>這次先當成猜對</b>：理由是「${st[1]}」，${st[4]}<br>` : '<b>答對了。</b>'}${q.why}<br><small>${REVIEW.after(s, tries === 1 && fok !== false)}</small>`; renderTOC('review'); };
        if (tries === 1 && sts) { why.className = 'why fu'; FOLLOW.ask(why, sts, x => x, (fok, st) => { logAnswer({ c: f.c.id, k: 'fu', fk: f.k, i: f.i, h: s.h, qt: strip(q.q).slice(0, 60), ok: fok ? 1 : 0, n: 1 }); fin(fok, st); }); }
        else fin(); }
      else { b.disabled = true; why.className = 'why no'; why.innerHTML = `<b>再想想。</b>${sts ? '下面拆成幾個小步驟，一步一步推回來。' : `可以回到<a href="#${f.c.id}">${f.c.title.split('：')[0]}</a>看看。`}`; if (sts) qe.openGuide(); }
    }; });
  });
}

// 每段讀完的標記：記成練習紀錄中 k = 'r' 的事件（p：1 看懂了、0 還不太懂、−1 取消），以最後一筆為準；隨練習紀錄一起同步
const READ_ON = ['atom'];   // 先在第一章試用
const readState = id => { const m = {}; LOG.forEach(e => { if (e.k === 'r' && e.c === id) m[e.i] = e; }); return m; };
function drawRead(id) {
  const c = chOf(id), m = readState(id), n = c.sections.length, ok = k => m[k] && m[k].p === 1, unsure = k => m[k] && m[k].p === 0;
  $$('.readbar', $('#article')).forEach(bar => {
    const k = +bar.dataset.s, e = m[k];
    bar.innerHTML = `<span class="small mut">${e && e.p >= 0 ? `${e.p ? '已看懂' : '標記為還不太懂'}（${dstr(e.t)}）` : '讀完這一段了嗎？'}</span><button class="btn sm${ok(k) ? ' done' : ''}" type="button" data-r="1">✓ 看懂了</button><button class="btn sm${unsure(k) ? ' unsure' : ''}" type="button" data-r="0">？還不太懂</button>`;
    $$('[data-r]', bar).forEach(b => { b.onclick = () => { const v = +b.dataset.r, cur = m[k] && m[k].p; logAnswer({ c: id, k: 'r', i: k, h: 'read-' + k, qt: c.sections[k - 1].h, p: cur === v ? -1 : v }); drawRead(id); }; });
  });
  for (let k = 1; k <= n; k++) { const a = $(`.secnav a[href="#${id}/${k}"], .seclist a[href="#${id}/${k}"]`); if (a) { a.classList.toggle('r-ok', ok(k)); a.classList.toggle('r-unsure', unsure(k)); } }
  const done = Array.from({ length: n }, (_, i) => i + 1).filter(ok).length, nx = Array.from({ length: n }, (_, i) => i + 1).find(k => !ok(k)), uns = Array.from({ length: n }, (_, i) => i + 1).filter(unsure);
  const box = $('#readProg');
  if (box) box.innerHTML = `<div class="rp-bar"><i style="width:${100 * done / n}%"></i></div><span>已看懂 <b>${done} / ${n}</b> 段${uns.length ? `，還不太懂：${uns.map(k => `<a href="#${id}/${k}">第 ${k} 段</a>`).join('、')}` : ''}</span>${nx ? `<a class="btn sm pri" href="#${id}/${nx}">${done ? '從' : '從'}第 ${nx} 段${done ? '繼續' : '開始'}：${c.sections[nx - 1].h}</a>` : '<span class="ok">這一章每一段都看懂了 ✓</span>'}`;
}

const INST = {};   // 目前頁面上各互動圖的實例（練習題「在圖上看」用）
function renderChapter(id) {
  const c = chOf(id), i = CH.indexOf(c), prev = CH[i - 1], next = CH[i + 1];
  $('#article').innerHTML = `<p class="eyebrow">${UNITS.find(p => p.items.some(x => x[0] === c.unit)).part} · ${unitName(c.unit)}</p><h1>${c.title}</h1><p class="lede">${c.lede}</p>${READ_ON.includes(id) ? '<div class="readprog" id="readProg"></div>' : ''}
<nav class="secnav" aria-label="本章小節">${c.sections.map((s, k) => `<a href="#${id}/${k + 1}">${k + 1}. ${s.h}</a>`).join('')}<a href="#${id}/quiz">確認理解</a>${c.exam ? `<a href="#${id}/exam">歷屆考題相似題</a>` : ''}</nav>${(TERMS[id] || []).length ? `<div class="tchips" aria-label="本章名詞"><span class="lbl">本章名詞</span>${TERMS[id].map((t, k) => `<button type="button" class="tchip" data-t="${k}">${t[0]}</button>`).join('')}</div>` : ''}
${c.sections.map((s, k) => `<section class="sec" id="sec-${k + 1}"><h2><span class="sn">${k + 1}</span>${s.h}</h2><div class="prose">${s.body}</div>${[].concat(s.w || []).map(w => `<div class="widget" data-w="${w}"></div>`).join('')}${READ_ON.includes(id) ? `<div class="readbar" data-s="${k + 1}"></div>` : ''}</section>`).join('')}
<section class="sec" id="sec-quiz"><h2><span class="sn">✓</span>確認理解</h2><p class="mut small">答錯了沒關係：按「在圖上看」回到對應的圖，找出哪裡想錯。${lastSeen(id)}</p>${qblock(c.quiz, 'q')}</section>
${c.exam ? `<section class="sec" id="sec-exam"><h2><span class="sn">考</span>歷屆考題相似題</h2><p class="mut small">依照中國醫藥、義守、慈濟大學歷屆試題的考法另外出的題目（化合物與數字已更換），每題標出參考的原題。</p>${qblock(c.exam, 'x')}</section>` : ''}
<div class="foot"><button class="btn ${state.done[id] ? 'done' : ''}" type="button" id="doneBtn">${state.done[id] ? '已完成 ✓' : '標記為完成'}</button><nav class="pn">${prev ? `<a href="#${prev.id}"><small>上一章</small>${prev.title}</a>` : '<span></span>'}${next ? `<a href="#${next.id}" class="nx"><small>下一章</small>${next.title}</a>` : ''}</nav></div>`;
  mountWidgets(); bindQuiz(id);
  bindTerms(id);
  if (READ_ON.includes(id)) drawRead(id);
  bindDone(id);
}
function mountWidgets() {
  for (const k in INST) delete INST[k];
  $$('.widget', $('#article')).forEach(w => { const n = w.dataset.w; try { const inst = W[n](w); if (!INST[n]) INST[n] = { inst, el: w }; } catch (e) { w.innerHTML = `<p class="note bad">互動圖載入失敗：${esc(e.message)}</p>`; console.error(e); } });
}
// 章末小題全部答對過 → 自動標記本章完成（看紀錄，題目分散在不同頁也算得到）
const quizAllRight = id => { const c = chOf(id), ok = new Set(LOG.filter(e => e.ok && e.c === id && e.k === 'q').map(e => e.h)); return c.quiz.every(q => ok.has(qid(id, q, 'q'))); };
function bindDone(id) {
  const b = $('#doneBtn'); if (!b) return;
  const mark = () => { const d = !!state.done[id]; b.textContent = d ? '已完成 ✓' : '標記為完成'; b.classList.toggle('done', d); };
  b.onclick = () => { setDone(id, !state.done[id]); mark(); }; mark();
}
function bindQuiz(id) {
  const c = chOf(id);
  $$('.q[data-k]', $('#article')).forEach(qe => {
    const kind = qe.dataset.k, qi = +qe.dataset.q, q = (kind === 'x' ? c.exam : c.quiz)[qi], why = $('.why', qe);
    let tries = 0;
    const sts = (STEPS[id] || {})[kind + ':' + qid(id, q, kind)];
    if (sts) guide(qe, sts);
    $$('.opt', qe).forEach(b => { b.onclick = () => {
      const ok = +b.dataset.o === q.a; b.classList.add(ok ? 'right' : 'wrong'); why.hidden = false;
      logAnswer({ c: id, k: kind, i: qi, h: qid(id, q, kind), qt: strip(q.q).slice(0, 60), p: +b.dataset.o, ok: ok ? 1 : 0, n: ++tries });
      const demo = q.show && INST[q.show.w] ? '<button class="btn sm" type="button" data-show>在圖上看 ↑</button>' : '';
      if (ok) { $$('.opt', qe).forEach(x => { x.disabled = true; }); const gb = $('.guide', qe); if (gb) gb.hidden = true;
        const fin = (fok, st) => {
          why.className = 'why ok'; why.innerHTML = `${!st ? '<b>答對了。</b>' : fok ? '<b>理由也對，這題算會了。</b>' : `<b>這題先當成猜對</b>：理由是「${st[1]}」，${st[4]} 已排進錯題本，明天再考。<br>`}${q.why}${demo}`;
          const sb = $('[data-show]', why); if (sb) sb.onclick = () => showOnChart(q.show, qe);
          if (kind === 'q' && !state.done[id] && quizAllRight(id)) { setDone(id, true); bindDone(id); }
        };
        // 第一次就答對 → 追問理由（排除猜對）
        if (tries === 1 && sts) { why.className = 'why fu'; FOLLOW.ask(why, sts, x => x, (fok, st) => { logAnswer({ c: id, k: 'fu', fk: kind, i: qi, h: qid(id, q, kind), qt: strip(q.q).slice(0, 60), ok: fok ? 1 : 0, n: 1 }); fin(fok, st); }); }
        else fin(); }
      else { b.disabled = true; why.className = 'why no'; why.innerHTML = `<b>再想想。</b>${sts ? '下面拆成幾個小步驟，一步一步推回來。' : demo ? '按下面的按鈕回到圖上看看。' : ''}${demo}`; if (sts) qe.openGuide(); }
      const sb = $('[data-show]', why); if (sb) sb.onclick = () => showOnChart(q.show, qe);
    }; });
  });
}

/* ---- 一節一頁（2026-11-01 使用者要求，先在第一章）：概覽頁 → 每節一頁（說明、互動圖、看懂了、這一節的練習）→ 綜合練習 ----
   題目屬於哪一節：題目的 s（第幾節），沒有的話看「在圖上看」連到哪一節的互動圖；都沒有就放綜合練習。 */
const PAGED = ['atom'];
const secOf = (c, q) => { if (q.s) return q.s; const k = q.show ? c.sections.findIndex(s => [].concat(s.w || []).includes(q.show.w)) : -1; return k + 1; };
const practiceOf = (c, sec) => [...c.quiz.map((q, i) => ({ kind: 'q', i, q })), ...(c.exam || []).map((q, i) => ({ kind: 'x', i, q }))].filter(x => secOf(c, x.q) === sec);
const qitem = ({ kind, i, q }, num) => `<div class="q" data-k="${kind}" data-q="${i}">${q.src ? `<p class="qsrc">仿 ${String(q.src).replace(/^仿\s*/, '')}</p>` : ''}<p class="qt">${num}. ${q.q}</p><div class="opts">${order(q, i).map(j => `<button class="opt" type="button" data-o="${j}">${q.o[j]}</button>`).join('')}</div><div class="why" hidden></div></div>`;
function practiceHTML(items, head) {
  if (!items.length) return '';
  const first = items.slice(0, 3), more = items.slice(3);
  return `<section class="sec practice" id="sec-prac"><h2><span class="sn">練</span>${head}</h2><p class="mut small">讀完上面的說明就做。答錯了按「一步一步來」或「在圖上看」，錯題會排進錯題複習。</p>${first.map((x, k) => qitem(x, k + 1)).join('')}${more.length ? `<details class="more"><summary>這一節還有 ${more.length} 題歷屆考題相似題</summary>${more.map((x, k) => qitem(x, k + 4)).join('')}</details>` : ''}</section>`;
}
// 頁首的章內導覽：回概覽、第幾節、上一節／下一節、換章
function chbar(id, sec) {
  const c = chOf(id), n = c.sections.length, k = sec === 'mix' ? n + 1 : +sec;
  const href = j => (j < 1 ? `#${id}` : j <= n ? `#${id}/${j}` : `#${id}/mix`);
  return `<nav class="chbar" aria-label="章內導覽"><a class="chb-t" href="#${id}">‹ ${c.title}</a><span class="chb-n">${sec === 'mix' ? '綜合練習' : `第 ${k} / ${n} 節`}</span>
<span class="chb-pn"><a class="btn sm" href="${href(k - 1)}" aria-label="上一節">‹</a><a class="btn sm" href="${href(k + 1)}" aria-label="下一節"${k > n || (k === n && !practiceOf(c, 0).length) ? ' hidden' : ''}>›</a></span>
<label class="chb-j">換章 <select id="chJump">${CH.map(x => `<option value="${x.id}"${x.id === id ? ' selected' : ''}>${x.title}</option>`).join('')}</select></label></nav>`;
}
function renderPaged(id, sec) {
  const c = chOf(id), n = c.sections.length, i = CH.indexOf(c), prev = CH[i - 1], next = CH[i + 1];
  if (sec === 'quiz' || sec === 'exam') sec = 'mix';
  const mix = practiceOf(c, 0), okH = new Set(LOG.filter(e => e.ok && e.c === id).map(e => e.h));
  const cnt = items => `${items.filter(x => okH.has(qid(id, x.q, x.kind))).length} / ${items.length} 題`;
  const nextBtn = j => (j <= n ? `<a class="btn pri wide" href="#${id}/${j}">下一節：${c.sections[j - 1].h} →</a>` : mix.length && sec !== 'mix' ? `<a class="btn pri wide" href="#${id}/mix">綜合練習（${mix.length} 題）→</a>` : next ? `<a class="btn pri wide" href="#${next.id}">下一章：${next.title} →</a>` : '');
  let html;
  if (!sec) {
    html = `<p class="eyebrow">${UNITS.find(p => p.items.some(x => x[0] === c.unit)).part} · ${unitName(c.unit)}</p><h1>${c.title}</h1><p class="lede">${c.lede}</p>${READ_ON.includes(id) ? '<div class="readprog" id="readProg"></div>' : ''}
<ol class="seclist">${c.sections.map((s, k) => `<li><a href="#${id}/${k + 1}"><span class="sn">${k + 1}</span><span class="sl-h">${s.h}</span><small>練習 ${cnt(practiceOf(c, k + 1))}</small><span class="go" aria-hidden="true">→</span></a></li>`).join('')}${mix.length ? `<li><a href="#${id}/mix"><span class="sn">綜</span><span class="sl-h">綜合練習（跨好幾節的題目）</span><small>${cnt(mix)}</small><span class="go" aria-hidden="true">→</span></a></li>` : ''}</ol>
${(TERMS[id] || []).length ? `<div class="tchips" aria-label="本章名詞"><span class="lbl">本章名詞</span>${TERMS[id].map((t, k) => `<button type="button" class="tchip" data-t="${k}">${t[0]}</button>`).join('')}</div>` : ''}
<div class="foot"><button class="btn" type="button" id="doneBtn">標記為完成</button><nav class="pn">${prev ? `<a href="#${prev.id}"><small>上一章</small>${prev.title}</a>` : '<span></span>'}${next ? `<a href="#${next.id}" class="nx"><small>下一章</small>${next.title}</a>` : ''}</nav></div>`;
  } else if (sec === 'mix') {
    html = `${chbar(id, 'mix')}<h1>綜合練習</h1><p class="lede">這些題目同時用到好幾節的觀念。${lastSeen(id)}</p>${mix.map((x, k) => qitem(x, k + 1)).join('')}<div class="foot"><button class="btn" type="button" id="doneBtn">標記為完成</button>${nextBtn(n + 2)}</div>`;
  } else {
    const k = +sec, s = c.sections[k - 1];
    html = `${chbar(id, k)}<section class="sec" id="sec-${k}"><h2><span class="sn">${k}</span>${s.h}</h2><div class="prose">${s.body}</div>${[].concat(s.w || []).map(w => `<div class="widget" data-w="${w}"></div>`).join('')}${READ_ON.includes(id) ? `<div class="readbar" data-s="${k}"></div>` : ''}</section>
${practiceHTML(practiceOf(c, k), '這一節的練習')}<div class="nextsec">${nextBtn(k + 1)}</div>`;
  }
  $('#article').innerHTML = html;
  mountWidgets(); bindQuiz(id); bindTerms(id);
  if (READ_ON.includes(id)) drawRead(id);
  bindDone(id);
  const j = $('#chJump'); if (j) j.onchange = () => { location.hash = j.value; };
  store.set('last', { id, sec: sec || '', sh: sec === 'mix' ? '綜合練習' : sec ? `第 ${sec} 節` : '', t: Date.now() });
}
// 名詞：內文第一次出現時變成連結，點了跳出解釋框；有對應互動圖時可以「在圖上看」
function showOnChart(show, from) {
  const it = INST[show.w]; if (!it) return;
  if (show.set) it.inst.set(show.set);
  it.el.scrollIntoView({ behavior: 'smooth', block: 'center' }); it.el.classList.add('flash'); setTimeout(() => it.el.classList.remove('flash'), 1200);
  // 看完圖可以一鍵回到剛才的題目（避免找不到原來的位置）
  $$('.backq').forEach(b => b.remove());
  if (from) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn sm pri backq'; b.textContent = '↓ 回到剛才的題目'; b.onclick = () => { b.remove(); from.scrollIntoView({ behavior: 'smooth', block: 'center' }); }; document.body.appendChild(b); setTimeout(() => b.remove(), 20000); }
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
// 選項順序每次打開都重新打亂（2026-11-02：避免複習時記住「上次選第幾個」）
function order(q) { return q.o.map((x, i) => [Math.random(), i]).sort((a, b) => a[0] - b[0]).map(x => x[1]); }

let shown = null;
function route(h) {
  const [id, sec] = (h || '').split('/');
  const c = chOf(id);
  if (c && PAGED.includes(id)) {
    shown = id; renderPaged(id, sec); renderTOC(id); document.title = `${c.title}｜後中化學`;
    $('#tocBox').classList.remove('open'); $('#tocBtn').textContent = '☰ 單元'; window.scrollTo(0, 0); return;
  }
  if (c && shown === id && sec) { const t = document.getElementById(`sec-${sec}`); if (t) t.scrollIntoView({ block: 'start' }); return; }  // 同一章只捲動，保留互動圖狀態
  shown = c ? id : null;
  if (c) { renderChapter(id); renderTOC(id); document.title = `${c.title}｜後中化學`; }
  else if (id === 'log') { renderLog(); renderTOC('log'); document.title = '練習紀錄｜後中化學'; }
  else if (id === 'review') { renderReview(); renderTOC('review'); document.title = '錯題複習｜後中化學'; }
  else { renderHome(); bindTree(); renderTOC(''); document.title = '後中化學｜學習階梯'; }
  $('#tocBox').classList.remove('open'); $('#tocBtn').textContent = '☰ 單元';
  const t = sec ? document.getElementById(`sec-${sec}`) : id === 'map' && document.getElementById('map');
  if (t) setTimeout(() => t.scrollIntoView({ block: 'start' }), 0); else window.scrollTo(0, 0);
}
function boot() {
  addEventListener('hashchange', () => route(location.hash.slice(1)));
  $('#tocBtn').onclick = () => { const o = $('#tocBox').classList.toggle('open'); $('#tocBtn').textContent = o ? '✕ 關閉' : '☰ 單元'; window.scrollTo(0, 0); };
  updateProgress(); route(location.hash.slice(1));
}
