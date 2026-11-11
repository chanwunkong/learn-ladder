/* ---------- 後中化學：頁面框架（首頁、單元目錄、章節、練習題、進度） ---------- */
const state = { done: store.get('done', {}) };
const UORDER = UNITS.flatMap(p => p.items.map(i => i[0]));
CH.sort((a, b) => UORDER.indexOf(a.unit) - UORDER.indexOf(b.unit));
const chOf = id => CH.find(c => c.id === id), unitCh = u => CH.find(c => c.unit === u);
const unitName = u => UNITS.flatMap(p => p.items).find(i => i[0] === u)[1];

// 頁首只顯示「本頁幾題」（refreshPrac）；沒有題目的頁面不顯示進度（2026-11-07 使用者要求：進度只留本頁題數和首頁的 %）
function updateProgress() { $('#progTxt').textContent = ''; $('#progBar').style.width = '0'; $('.prog').hidden = true; }
// 頁首的返回：一律回上一層（小節 → 章 → 後中化學 → 學習階梯）
function setBack(href, text) { const a = $('.home-link'); if (a) { a.href = href; a.textContent = '‹ ' + text; } }
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
  return `<div class="cta">${go}</div>`; })()}
<h2 id="map">章節地圖：先修關係與考試比重</h2>
<p class="mut tree-note">由上往下是學習順序：最基礎的章節在最上面，下面的章節會用到上面的觀念。數字是三校歷屆試題中，<b>每份 50 題平均約考幾題</b>。點虛線框的是規劃中的章節。</p>
<div class="seg" id="wview">${WVIEW.map((v, i) => `<button aria-pressed="${i === state.wv}" data-i="${i}">${v}</button>`).join('')}</div>
<div class="trees">${UNITS.map(p => `<div class="tree" data-k="${p.key}"><h3>${p.part}</h3><div class="tree-in"><svg class="tree-ln" aria-hidden="true"></svg>${treeRows(p)}</div></div>`).join('')}</div>
<details class="tree-src"><summary>比重怎麼算的</summary><p>中國醫藥、義守、慈濟大學 106–115 學年度學士後中醫化學試題共 30 份、1498 題，逐題依主題分類。越近的年份越重要：106 年權重 1、107 年權重 2……115 年權重 10。「近三年」只看 113–115 年，不加權。106–110 年有 95 題只看圖判斷產物，也已逐題看圖歸到各章；因四捨五入，各章加總約 49.8 題。一題常同時牽涉兩個主題，分類以主要考點為準。</p></details>
<h2>怎麼使用</h2>
<ul class="how"><li><b>每章是一堂課</b>：照小節順序讀，每節都有可以動手調整的圖。先玩圖、看說明，再往下讀。</li>
<li><b>公式旁的標籤</b>：<span class="tg must">要背</span>考試不會給；<span class="tg derive">會推</span>可以從前面推出來；<span class="tg given">卷上會給</span>題目會提供。課文裡點一下標籤也會顯示意思。</li>
<li><b>章末小題只用來確認懂了沒</b>：答錯時按「在圖上看」，回到圖上找出哪裡想錯。</li>
<li><b>考試範圍</b>：中國醫藥、義守、慈濟大學學士後中醫的化學考科都包含普通化學與有機化學，命題以大學教科書為準；課程單元依教科書標準章節安排。</li></ul>
</div>`;
}

// 公式旁的標籤：點一下在標籤後面顯示意思（2026-11-12 使用者要求：各節不再放標籤說明，說明只在化學首頁「怎麼使用」）
const TGTIP = { must: '考試不會給', derive: '可以從前面推出來', given: '題目會提供' };
document.addEventListener('click', e => { const t = e.target.closest('.tg'); const k = t && Object.keys(TGTIP).find(c => t.classList.contains(c)); if (!k) return; t.dataset.tip = '：' + TGTIP[k]; t.toggleAttribute('data-open'); });
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
// 全部錯題的提前練習：在那一區點擊時不記錄（noLog 在捕獲階段先設好，點擊處理完就恢復）
let NOLOG = false;
const noLog = el => el.addEventListener('click', () => { NOLOG = true; setTimeout(() => { NOLOG = false; }); }, true);
function logAnswer(e) { if (NOLOG) return; LOG.push({ t: Date.now(), ...e }); if (LOG.length > 20000) LOG.splice(0, LOG.length - 20000); store.set('log', LOG); if (typeof CLOUD !== 'undefined' && CLOUD.pushLog) CLOUD.pushLog(); setTimeout(() => { if (typeof refreshPrac === 'function') refreshPrac(); }, 0); }
// 由識別碼找回目前的題目（題號可能已變）
// 題目搬到別章（識別碼不變）、或改寫後在新題目寫 was: ['舊識別碼']，舊紀錄都還找得到（'*|' 不分章）
let QIX = null;
function qfind(cid, h, k, i) {
  if (!QIX) { QIX = {}; CH.forEach(c => ['q', 'x'].forEach(kk => qbank(c, kk).forEach((q, j) => { const v = { c, k: kk, i: j, q }, id = qid(c.id, q, kk); QIX[c.id + '|' + id] = v; [id, ...(q.was || [])].forEach(x => { QIX['*|' + x] = QIX['*|' + x] || v; }); }))); }
  return (h && (QIX[cid + '|' + h] || QIX['*|' + h])) || (!h && chOf(cid) && qbank(chOf(cid), k)[i] ? { c: chOf(cid), k, i, q: qbank(chOf(cid), k)[i] } : null);
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
  log.filter(e => e.k !== 'r' && e.k !== 'fu' && e.k !== 'reset').forEach(e => { const key = e.h || e.k + e.i, last = out.length && [...out].reverse().find(s => s.c === e.c && s.key === key && !s.closed);
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
// 下面列出還沒到期的全部錯題，可以提前練習；提前練習不記錄、不影響排程（2026-11-08 使用者要求）
function renderReview() {
  const now = Date.now();
  let { open, checks, due } = REVIEW.book(LOG, now);
  // 題目已從題庫移除：記一筆作廢，離開錯題本，首頁和其他裝置的數字才會一致（2026-11-08：首頁多算 1 題、這頁卻找不到）
  const gone = [...new Set(open.concat(checks, due).filter(s => s.h && !qfind(s.c, s.h, s.k, s.i)).map(s => s.h))];
  // shortcut: 一次超過 10 題對不上多半是題庫沒載入完整，先不作廢；真的大量刪題時再放寬
  if (gone.length && gone.length <= 10) { logAnswer({ c: 'review', k: 'reset', h: 'reset:gone', qt: '題目已從題庫移除', v: gone }); ({ open, checks, due } = REVIEW.book(LOG, now)); }
  // 上方是日期格子（今天、明天……之後），點一格列出那天的題目；今天的作答會記錄，其他天是提前練習、不記錄（2026-11-09 使用者要求：拿掉規則說明與統計格）
  const ord = (a, b) => CH.indexOf(a.f.c) - CH.indexOf(b.f.c) || a.f.k.localeCompare(b.f.k) || a.f.i - b.f.i;
  const cs = REVIEW.dayCards(open.concat(checks).concat(due.filter(s => s.final)).map(s => ({ s, f: qfind(s.c, s.h, s.k, s.i) })).filter(x => x.f), x => x.s.due, now)
    .map(g => ({ ...g, list: g.list.sort((a, b) => (g.key === 'today' ? (a.s.due < REVIEW.dayStart(now)) - (b.s.due < REVIEW.dayStart(now)) : 0) * -1 || ord(a, b)) }));   // 今天：之前沒做完的排前面
  $('#article').innerHTML = `<p class="eyebrow">後中化學</p><h1>錯題複習</h1><div class="dcards" id="dcards"></div><div id="dlist"></div>`;
  const show = k => {
    const g = cs.find(x => x.key === k), today = k === 'today';
    $('#dcards').innerHTML = REVIEW.cardsHTML(cs, k);
    $$('#dcards .dcard').forEach(b => { b.onclick = () => show(b.dataset.k); });
    $('#dlist').innerHTML = `<div>${today ? '' : `<p class="dnote">${g.label}到期的題目，可以提前練習：作答不記錄、不影響複習排程。</p>`}${g.list.length ? g.list.map(({ s, f }, n) => rvQ(s, f, n + 1)).join('')
      : `<p class="note">${open.length ? '今天沒有到期的錯題。' : '錯題本是空的。到各章練習時第一次答錯的題目，會自動排進這裡。'}</p>`}</div>`;
    const box = $('#dlist > div'); if (!today) noLog(box);
    $$(':scope > .q', box).forEach((qe, n) => bindRvQ(qe, g.list[n].s, g.list[n].f, !today));
  };
  show('today');
}
function rvQ(s, f, n) {
  return `<div class="q"><p class="qsrc"><a href="#${f.c.id}">${f.c.title.split('：')[0]}</a>${f.k === 'x' ? '・相似題' : '・章末題'}・${REVIEW.label(s)}</p><p class="qt">${n ? n + '. ' : ''}${f.q.q}</p><div class="opts">${order(f.q, f.i).map(j => `<button class="opt" type="button" data-o="${j}">${f.q.o[j]}</button>`).join('')}</div><div class="why" hidden></div></div>`;
}
// practice：提前練習，不顯示「幾天後再考」（紀錄由 noLog 擋掉）
function bindRvQ(qe, s, f, practice) {
  const q = f.q, why = $('.why', qe);
  let tries = 0;
  const sts = (STEPS[f.c.id] || {})[f.k + ':' + qid(f.c.id, q, f.k)];
  if (sts) guide(qe, sts);
  // 記在紀錄原本的章與題型（s.c、s.k）：題目搬到別章後，才會接著原本的排程
  $$('.opt', qe).forEach(b => { b.onclick = () => {
    const ok = +b.dataset.o === q.a; b.classList.add(ok ? 'right' : 'wrong'); why.hidden = false; tries++;
    logAnswer({ c: s.c, k: s.k, i: f.i, h: s.h, qt: strip(q.q).slice(0, 60), p: +b.dataset.o, ok: ok ? 1 : 0, n: tries });
    if (ok) { $$('.opt', qe).forEach(x => { x.disabled = true; }); const gb = $('.guide', qe); if (gb) gb.hidden = true;
      const fin = (fok, st) => { why.className = 'why ok'; why.innerHTML = `${st && !fok ? `<b>這次先當成猜對</b>：理由是「${st[1]}」，${st[4]}<br>` : REVIEW.okHead(tries)}${q.why}${practice ? '' : `<br><small>${REVIEW.after(s, tries === 1 && fok !== false, fok === false)}</small>`}`; if (!practice) renderTOC('review'); };
      if (tries === 1 && sts) { why.className = 'why fu'; FOLLOW.ask(why, sts, x => x, (fok, st) => { logAnswer({ c: s.c, k: 'fu', fk: s.k, i: f.i, h: s.h, qt: strip(q.q).slice(0, 60), ok: fok ? 1 : 0, n: 1 }); fin(fok, st); }); }
      else fin(); }
    else { b.disabled = true; why.className = 'why no'; why.innerHTML = `<b>再想想。</b>${sts ? '下面拆成幾個小步驟，一步一步推回來。' : `可以回到<a href="#${f.c.id}">${f.c.title.split('：')[0]}</a>看看。`}`; if (sts) qe.openGuide(); }
  }; });
}

// 每節讀完的標記：記成練習紀錄中 k = 'r' 的事件（p：1 看懂了、0 還不太懂、−1 取消），以最後一筆為準；隨練習紀錄一起同步
const READ_ON = ['atom', 'vsepr'];   // 先在第一章試用
const readState = id => { const m = {}; LOG.forEach(e => { if (e.k === 'r' && e.c === id) m[e.i] = e; }); return m; };
function drawRead(id) {
  const c = chOf(id), m = readState(id), n = c.sections.length, ok = k => !!m[k] && m[k].p === 1, unsure = k => !!m[k] && m[k].p === 0;   // 要是布林值：classList.toggle(x, undefined) 會變成切換
  $$('.readbar', $('#article')).forEach(bar => {
    const k = +bar.dataset.s, e = m[k];
    bar.innerHTML = `<span class="small mut">${e && e.p >= 0 ? `${e.p ? '已看懂' : '標記為還不太懂'}（${dstr(e.t)}）` : '讀完這一節了嗎？'}</span><button class="btn sm${ok(k) ? ' done' : ''}" type="button" data-r="1">✓ 看懂了</button><button class="btn sm${unsure(k) ? ' unsure' : ''}" type="button" data-r="0">？還不太懂</button>`;
    $$('[data-r]', bar).forEach(b => { b.onclick = () => { const v = +b.dataset.r, cur = m[k] && m[k].p; logAnswer({ c: id, k: 'r', i: k, h: 'read-' + k, qt: c.sections[k - 1].h, p: cur === v ? -1 : v }); drawRead(id); }; });
  });
  for (let k = 1; k <= n; k++) { const a = $(`.secnav a[href="#${id}/${k}"], .seclist a[href="#${id}/${k}"]`); if (a) { a.classList.toggle('r-ok', ok(k)); a.classList.toggle('r-unsure', unsure(k)); } }
  const done = Array.from({ length: n }, (_, i) => i + 1).filter(ok).length, nx = Array.from({ length: n }, (_, i) => i + 1).find(k => !ok(k)), uns = Array.from({ length: n }, (_, i) => i + 1).filter(unsure);
  const box = $('#readProg');
  if (box) box.innerHTML = `${nx ? `<a class="btn sm pri" href="#${id}/${nx}">從第 ${nx} 節${done ? '繼續' : '開始'}：${c.sections[nx - 1].h}</a>` : '<span class="ok">這一章每一節都看懂了 ✓</span>'}${uns.length ? `<span>還不太懂：${uns.map(k => `<a href="#${id}/${k}">第 ${k} 節</a>`).join('、')}</span>` : ''}`;
}

const INST = {};   // 目前頁面上各互動圖的實例（練習題「在圖上看」用）
// 小節內文：內文裡的 [[w:名稱]] 換成那張圖，讓每張圖的說明緊貼在圖的上方；沒標的圖放在最後（2026-11-07 使用者要求）
const secBody = s => `<div class="prose">${s.body.replace(/\[\[w:(\w+)\]\]/g, (_, w) => `</div><div class="widget" data-w="${w}"></div><div class="prose">`)}</div>`.replace(/<div class="prose">\s*<\/div>/g, '')
  + [].concat(s.w || []).filter(w => !s.body.includes(`[[w:${w}]]`)).map(w => `<div class="widget" data-w="${w}"></div>`).join('');
function renderChapter(id) {
  const c = chOf(id), i = CH.indexOf(c), prev = CH[i - 1], next = CH[i + 1];
  $('#article').innerHTML = `<p class="eyebrow">${UNITS.find(p => p.items.some(x => x[0] === c.unit)).part} · ${unitName(c.unit)}</p><h1>${c.title}</h1><p class="lede">${c.lede}</p>${READ_ON.includes(id) ? '<div class="readprog" id="readProg"></div>' : ''}
<nav class="secnav" aria-label="本章小節">${c.sections.map((s, k) => `<a href="#${id}/${k + 1}">${k + 1}. ${s.h}</a>`).join('')}<a href="#${id}/quiz">確認理解</a>${c.exam ? `<a href="#${id}/exam">歷屆考題相似題</a>` : ''}</nav>${(TERMS[id] || []).length ? `<div class="tchips" aria-label="本章名詞"><span class="lbl">本章名詞</span>${TERMS[id].map((t, k) => `<button type="button" class="tchip" data-t="${k}">${t[0]}</button>`).join('')}</div>` : ''}
${c.sections.map((s, k) => `<section class="sec" id="sec-${k + 1}"><h2><span class="sn">${k + 1}</span>${s.h}</h2>${secBody(s)}${READ_ON.includes(id) ? `<div class="readbar" data-s="${k + 1}"></div>` : ''}</section>`).join('')}
<section class="sec" id="sec-quiz"><h2><span class="sn">✓</span>確認理解</h2><p class="mut small">答錯了沒關係：按「在圖上看」回到對應的圖，找出哪裡想錯。${lastSeen(id)}</p>${qblock(c.quiz, 'q')}</section>
${c.exam ? `<section class="sec" id="sec-exam"><h2><span class="sn">考</span>歷屆考題相似題</h2><p class="mut small">依照中國醫藥、義守、慈濟大學歷屆試題的考法另外出的題目（化合物與數字已更換），每題標出參考的原題。</p>${qblock(c.exam, 'x')}</section>` : ''}
<div class="foot"><nav class="pn">${prev ? `<a href="#${prev.id}"><small>上一章</small>${prev.title}</a>` : '<span></span>'}${next ? `<a href="#${next.id}" class="nx"><small>下一章</small>${next.title}</a>` : ''}</nav></div>`;
  mountWidgets(); bindQuiz(id);
  bindTerms(id);
  if (READ_ON.includes(id)) drawRead(id);
}
function mountWidgets() {
  for (const k in INST) delete INST[k];
  $$('.widget', $('#article')).forEach(w => { const n = w.dataset.w; try { const inst = W[n](w); if (!INST[n]) INST[n] = { inst, el: w }; } catch (e) { w.innerHTML = `<p class="note bad">互動圖載入失敗：${esc(e.message)}</p>`; console.error(e); } });
}
// 章末小題全部答對過 → 自動標記本章完成（看紀錄，題目分散在不同頁也算得到）
const quizAllRight = id => { const c = chOf(id), ok = new Set(LOG.filter(e => e.ok && e.c === id && e.k === 'q').map(e => e.h)); return c.quiz.every(q => ok.has(qid(id, q, 'q'))); };
// 章的「完成」不再手按：章末小題全部答對過時自動記下（bindQuiz），首頁「已掌握」會用到
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
          why.className = 'why ok'; why.innerHTML = `${!st ? REVIEW.okHead(tries) : fok ? '<b>理由也對，這題算會了。</b>' : `<b>這題先當成猜對</b>：理由是「${st[1]}」，${st[4]} 已排進錯題本，明天再考。<br>`}${q.why}${demo}`;
          const sb = $('[data-show]', why); if (sb) sb.onclick = () => showOnChart(q.show, qe);
          if (kind === 'q' && !state.done[id] && quizAllRight(id)) setDone(id, true);
        };
        // 第一次就答對 → 追問理由（排除猜對）
        if (tries === 1 && sts) { why.className = 'why fu'; FOLLOW.ask(why, sts, x => x, (fok, st) => { logAnswer({ c: id, k: 'fu', fk: kind, i: qi, h: qid(id, q, kind), qt: strip(q.q).slice(0, 60), ok: fok ? 1 : 0, n: 1 }); fin(fok, st); }); }
        else fin(); }
      else { b.disabled = true; why.className = 'why no'; why.innerHTML = `<b>再想想。</b>${sts ? '下面拆成幾個小步驟，一步一步推回來。' : demo ? '按下面的按鈕回到圖上看看。' : ''}${demo}`; if (sts) qe.openGuide(); }
      const sb = $('[data-show]', why); if (sb) sb.onclick = () => showOnChart(q.show, qe);
    }; });
  });
}

/* ---- 回到做過的小節：已作答的收成一行（✓ 第一次答對／✗ 第一次答錯，點開可再做）；跳過的標出來；「重新練習這一節」清除畫面上的顯示，選「之前的不算」時錯題本也不算之前的作答 ---- */
const secKey = (id, sec) => `reset:${id}/${sec}`;
const resetAt = h => LOG.reduce((t, e) => (e.k === 'reset' && e.h === h ? Math.max(t, e.t) : t), 0);
function restorePrac(id, sec) {
  const c = chOf(id), t0 = resetAt(secKey(id, sec)), log = LOG.filter(e => e.c === id && e.t > t0);
  const ok = new Set(log.filter(e => e.ok && e.k !== 'fu').map(e => e.h)), f1 = new Map();
  REVIEW.trials(log).forEach(t => { if (!f1.has(t.h)) f1.set(t.h, t.ok); });
  $$('.q[data-k]', $('#article')).forEach(qe => {
    const kind = qe.dataset.k, q = (kind === 'x' ? c.exam : c.quiz)[+qe.dataset.q], h = qid(id, q, kind);
    if (!ok.has(h)) return;
    const first = f1.get(h) !== false;
    qe.classList.add('prev', 'collapsed');
    if (first) { qe.classList.add('done'); $$('.opt', qe).forEach(b => { b.disabled = true; if (+b.dataset.o === q.a) b.classList.add('right'); }); const w = $('.why', qe); w.hidden = false; w.className = 'why ok'; w.innerHTML = `<b>已完成。</b>${q.why}`; const g = $('.guide', qe); if (g) g.hidden = true; }
    const b = document.createElement('button'); b.type = 'button'; b.className = 'qrow';
    b.innerHTML = `<b class="${first ? 'r-ok' : 'r-no'}">${first ? '✓ 第一次答對' : '✗ 第一次答錯（已進錯題本）・點開再做一次'}</b><span>${esc(strip(q.q).slice(0, 44))}</span>`;
    b.onclick = () => qe.classList.toggle('collapsed'); qe.prepend(b);
  });
  refreshPrac();
}
function refreshPrac() {
  // 頁首（捲動時固定在最上面）：這一頁有題目就顯示完成幾題、跳過幾題（點一下跳到第一個）；沒有題目就顯示完成幾章（2026-11-07 使用者要求：只顯示在頁首）
  const items = $$('.q[data-k]', $('#article')), isDone = e => e.classList.contains('prev') || !!$('.opt.right', e);
  if (!items.length) return updateProgress();
  const last = items.map(isDone).lastIndexOf(true), skip = items.filter((e, k) => k < last && !isDone(e)), n = items.filter(isDone).length;
  items.forEach(e => e.classList.toggle('skipped', skip.includes(e)));
  $('.prog').hidden = false; $('#progTxt').innerHTML = `${n === items.length ? '✓ ' : ''}本頁 ${n} / ${items.length} 題${skip.length ? `<button type="button" class="linkb skipb" id="pgSkip">跳過 ${skip.length} 題 ↓</button>` : ''}`;
  $('#progBar').style.width = `${100 * n / items.length}%`;
  const sb = $('#pgSkip'); if (sb) sb.onclick = () => { const e = skip[0], d = e.closest('details'); if (d) d.open = true; e.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
}
function resetPrac(id, sec) {
  const box = $('#pracReset'); if (!box) return;
  box.innerHTML = '<button class="btn sm ghost" type="button" data-rs>重新練習這一節</button>';
  $('[data-rs]', box).onclick = () => {
    box.innerHTML = REVIEW.resetAsk('這一節');
    const go = v => { logAnswer({ c: id, k: 'reset', h: secKey(id, sec), qt: '重新練習這一節', ...(v ? { v: practiceOf(chOf(id), sec).map(x => qid(id, x.q, x.kind)) } : {}) }); renderPaged(id, sec); };
    $('[data-y]', box).onclick = () => go(false);
    $('[data-v]', box).onclick = () => go(true);
    $('[data-n]', box).onclick = () => resetPrac(id, sec);
  };
}

/* ---- 一節一頁（2026-11-01 使用者要求，先在第一章）：概覽頁 → 每節一頁（說明、互動圖、看懂了、這一節的練習）→ 綜合練習 ----
   題目屬於哪一節：題目的 s（第幾節），沒有的話看「在圖上看」連到哪一節的互動圖；都沒有就放綜合練習。 */
const PAGED = ['atom', 'vsepr'];
const secOf = (c, q) => { if (q.s) return q.s; const k = q.show ? c.sections.findIndex(s => [].concat(s.w || []).includes(q.show.w)) : -1; return k + 1; };
const practiceOf = (c, sec) => [...c.quiz.map((q, i) => ({ kind: 'q', i, q })), ...(c.exam || []).map((q, i) => ({ kind: 'x', i, q }))].filter(x => secOf(c, x.q) === sec);
const qitem = ({ kind, i, q }, num) => `<div class="q" data-k="${kind}" data-q="${i}">${q.src ? `<p class="qsrc">仿 ${String(q.src).replace(/^仿\s*/, '')}</p>` : ''}<p class="qt">${num}. ${q.q}</p><div class="opts">${order(q, i).map(j => `<button class="opt" type="button" data-o="${j}">${q.o[j]}</button>`).join('')}</div><div class="why" hidden></div></div>`;
function practiceHTML(items, head) {
  if (!items.length) return '';
  const first = items.slice(0, 3), more = items.slice(3);
  return `<section class="sec practice" id="sec-prac"><h2><span class="sn">練</span>${head}</h2><p class="mut small">讀完上面的說明就做。答錯了按「一步一步來」或「在圖上看」，錯題會排進錯題複習。</p><div class="resetbox" id="pracReset"></div>${first.map((x, k) => qitem(x, k + 1)).join('')}${more.length ? `<details class="more"><summary>展開另外 ${more.length} 題歷屆考題相似題（頁首的題數包含這些）</summary>${more.map((x, k) => qitem(x, k + 4)).join('')}</details>` : ''}</section>`;
}
// 頁首下方的位置標示：第幾節（返回在頁首、上一章下一章在單元目錄、下一節在頁尾）
function chbar(id, sec) {
  const c = chOf(id), n = c.sections.length;
  return `<p class="chbar">${c.title.split('：')[0]}・${sec === 'mix' ? '綜合練習' : `第 ${sec} / ${n} 節`}</p>`;
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
<div class="foot"><nav class="pn">${prev ? `<a href="#${prev.id}"><small>上一章</small>${prev.title}</a>` : '<span></span>'}${next ? `<a href="#${next.id}" class="nx"><small>下一章</small>${next.title}</a>` : ''}</nav></div>`;
  } else if (sec === 'mix') {
    html = `${chbar(id, 'mix')}<h1>綜合練習</h1><p class="lede">這些題目同時用到好幾節的觀念。${lastSeen(id)}</p>${mix.map((x, k) => qitem(x, k + 1)).join('')}<div class="foot">${nextBtn(n + 2)}</div>`;
  } else {
    const k = +sec, s = c.sections[k - 1];
    html = `${chbar(id, k)}<section class="sec" id="sec-${k}"><h2><span class="sn">${k}</span>${s.h}</h2>${secBody(s)}${READ_ON.includes(id) ? `<div class="readbar" data-s="${k}"></div>` : ''}</section>
${practiceHTML(practiceOf(c, k), '這一節的練習')}<div class="nextsec">${nextBtn(k + 1)}</div>`;
  }
  $('#article').innerHTML = html;
  mountWidgets(); bindQuiz(id); bindTerms(id);
  if (sec) { restorePrac(id, sec); resetPrac(id, sec); }
  if (READ_ON.includes(id)) drawRead(id);
  
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
    if (sec) setBack(`#${id}`, c.title.split('：')[0]); else setBack('#', '後中化學');
    $('#tocBox').classList.remove('open'); $('#tocBtn').textContent = '☰ 章節'; window.scrollTo(0, 0); refreshPrac(); return;
  }
  if (c && shown === id && sec) { const t = document.getElementById(`sec-${sec}`); if (t) t.scrollIntoView({ block: 'start' }); return; }  // 同一章只捲動，保留互動圖狀態
  shown = c ? id : null;
  if (c) { renderChapter(id); renderTOC(id); document.title = `${c.title}｜後中化學`; }
  else if (id === 'log') { renderLog(); renderTOC('log'); document.title = '練習紀錄｜後中化學'; }
  else if (id === 'review') { renderReview(); renderTOC('review'); document.title = '錯題複習｜後中化學'; }
  else { renderHome(); bindTree(); renderTOC(''); document.title = '後中化學｜學習階梯'; }
  if (c || id === 'log' || id === 'review') setBack('#', '後中化學'); else setBack('../', '學習階梯');
  $('#tocBox').classList.remove('open'); $('#tocBtn').textContent = '☰ 章節'; refreshPrac();
  const t = sec ? document.getElementById(`sec-${sec}`) : id === 'map' && document.getElementById('map');
  if (t) setTimeout(() => t.scrollIntoView({ block: 'start' }), 0); else window.scrollTo(0, 0);
}
function boot() {
  addEventListener('hashchange', () => route(location.hash.slice(1)));
  $('#tocBtn').onclick = () => { const o = $('#tocBox').classList.toggle('open'); $('#tocBtn').textContent = o ? '✕ 關閉' : '☰ 章節'; window.scrollTo(0, 0); };
  updateProgress(); route(location.hash.slice(1));
}
