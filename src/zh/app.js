/* ---------- 後中國文：每天早上（字音字形、字詞、常識）與晚上（閱讀題組）、錯題本 ----------
   版面與規則照後中英文（2026-11-08 使用者要求「仿照英文」）；題目難度照三校考卷。
   紀錄每一筆：{ t, c 段落（w1d3am）, k, h 題目識別碼, sk 能力, ok, n 第幾次作答, p 選了什麼, qt 題目摘要 }
   k：z 選擇題（進錯題本）；x 一步一步來的小步驟；fu 答對後的追問；reset 重新練習。 */
const LOG = store.get('log', []);
// 全部錯題的提前練習：在那一區點擊時不記錄（noLog 在捕獲階段先設好，點擊處理完就恢復）
let NOLOG = false;
const noLog = el => el.addEventListener('click', () => { NOLOG = true; setTimeout(() => { NOLOG = false; }); }, true);
function logAnswer(e) {
  if (NOLOG) return;
  LOG.push({ t: Date.now(), ...e }); if (LOG.length > 20000) LOG.splice(0, LOG.length - 20000);
  store.set('log', LOG); if (typeof CLOUD !== 'undefined' && CLOUD.pushLog) CLOUD.pushLog();
  setTimeout(() => { if (typeof refreshParts === 'function') refreshParts(); }, 0);
}
const qlog = () => REVIEW.live(LOG).filter(e => e.k === 'z' || e.k === 'fu');
const okSet = () => new Set(LOG.filter(e => e.ok && e.h).map(e => e.h));
const plain = h => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* ---- 題目索引：每題有固定識別碼 z:w週:id，錯題本靠它找回題目 ---- */
const wkKey = w => 'w' + w.n;
const SLOT = { am: '早上', pm: '晚上' };
const zq = (w, d, s, q) => ({ ...q, h: `z:${wkKey(w)}:${q.id}`, k: 'z', c: `${wkKey(w)}d${d + 1}${s}`, qt: plain(q.q).slice(0, 60) });
// 一段的內容：早上是題目；晚上是題組（有 qs）或單題
const parts = (w, d, s) => w.days[d][s].map(b => (b.qs ? b : { qs: [b] }));
const slotQs = (w, d, s) => parts(w, d, s).flatMap(b => b.qs.map(q => zq(w, d, s, q)));
let QIX = null;
function qindex() {
  if (QIX) return QIX; QIX = {};
  ZWEEKS.forEach(w => w.days.forEach((x, d) => ['am', 'pm'].forEach(s => parts(w, d, s).forEach(b => b.qs.forEach(q => { const z = zq(w, d, s, q); QIX[z.h] = { q: z, w, d, s, b: b.text ? b : null }; })))));
  return QIX;
}
const frac = (qs, ok) => (qs.length ? qs.filter(q => ok.has(q.h)).length / qs.length : 0);

/* ---- 選擇題：答錯可以再選；「一步一步來」把題目拆成小判斷 ---- */
function mcq(q, num) {
  const ord = shuffled(q.o.length, q.h + Math.random());   // 每次打開都重新打亂，複習時不能靠記位置
  return `<div class="q" data-h="${esc(q.h)}">${num ? `<p class="qnum">${num}・${esc(SKILLS[q.sk] || '')}</p>` : ''}<p class="qt">${q.q}</p><div class="opts">${ord.map(j => `<button class="opt" type="button" data-o="${j}">${esc(q.o[j])}</button>`).join('')}</div><div class="why" hidden></div></div>`;
}
const resetT = c => LOG.reduce((t, e) => (e.k === 'reset' && e.c === c ? Math.max(t, e.t) : t), 0);
function viewOf(c) {
  const t0 = resetT(c), ok = new Set(LOG.filter(e => e.ok && e.h && e.t > t0).map(e => e.h)), f1 = new Map();
  REVIEW.trials(qlog().filter(e => e.t > t0)).forEach(t => { if (!f1.has(t.h)) f1.set(t.h, t.ok); });
  return { ok, f1 };
}
// 已作答的題目收成一行；點一下展開／收起
function collapse(box, first, text) {
  box.classList.add('prev', 'collapsed'); if (first) box.classList.add('done');
  const b = document.createElement('button'); b.type = 'button'; b.className = 'qrow';
  b.innerHTML = `<b class="${first ? 'r-ok' : 'r-no'}">${first ? '✓ 第一次答對' : '✗ 第一次答錯（已進錯題本）・點開再做一次'}</b><span>${esc(text)}</span>`;
  b.onclick = () => box.classList.toggle('collapsed'); box.prepend(b);
}
function bindMcq(root, list, onDone, restore = true) {
  const views = {}, V = c => views[c] || (views[c] = viewOf(c));
  list.forEach(q => {
    const qe = root.querySelector(`.q[data-h="${CSS.escape(q.h)}"]`); if (!qe) return;
    let n = 0; const why = $('.why', qe);
    const v = restore ? V(q.c) : null;
    if (v && v.ok.has(q.h) && v.f1.get(q.h) === false) collapse(qe, false, plain(q.q).slice(0, 48));
    else if (v && v.ok.has(q.h)) {   // 第一次就答對：收成一行，點開看答案與解析
      collapse(qe, true, plain(q.q).slice(0, 48));
      $$('.opt', qe).forEach(x => { x.disabled = true; if (x.dataset.o === '0') x.classList.add('right'); });
      why.hidden = false; why.className = 'why ok'; why.innerHTML = `<b>已完成。</b>${q.why}`; qe.classList.add('done');
      if (onDone) onDone(q); return;
    }
    if (q.st && q.st.length) guide(qe, q);
    $$('.opt', qe).forEach(b => { b.onclick = () => {
      const ok = b.dataset.o === '0'; n++;
      logAnswer({ c: q.c, k: q.k, h: q.h, sk: q.sk, ok, n, p: q.o[+b.dataset.o], qt: q.qt });
      b.classList.add(ok ? 'right' : 'wrong'); b.disabled = true; why.hidden = false;
      if (ok) {
        $$('.opt', qe).forEach(x => { x.disabled = true; }); const g = $('.guide', qe); if (g) g.hidden = true;
        const fin = (fok, st) => { why.className = 'why ok'; why.innerHTML = `${st && !fok ? `<b>這次先當成猜對</b>：理由是「${esc(st[1])}」，${esc(st[4])} 已排進錯題本。<br>` : st ? '<b>理由也對，這題算會了。</b>' : REVIEW.okHead(n)}${q.why}${q.rv ? `<br><small>${REVIEW.after(q.rv, n === 1 && fok !== false, fok === false)}</small>` : ''}`; };
        qe.classList.add('done');
        // 第一次就答對、有拆解步驟 → 追問理由（排除猜對）
        if (n === 1 && q.st && q.st.length) { why.className = 'why fu'; FOLLOW.ask(why, q.st, esc, (fok, st) => { logAnswer({ c: q.c, k: 'fu', fk: q.k, h: q.h, ok: fok ? 1 : 0, n: 1, qt: q.qt }); fin(fok, st); }); }
        else fin();
        if (onDone) onDone(q);
      } else {
        why.className = 'why no'; why.innerHTML = `這個不對，再選一次。${q.st && q.st.length ? '<button class="btn sm" type="button" data-gopen>一步一步來</button>' : ''}`;
        const go = $('[data-gopen]', why); if (go) go.onclick = () => qe.openGuide();
      }
    }; });
  });
}
function guide(qe, q) {
  const sts = q.st, box = document.createElement('div'); box.className = 'guide';
  box.innerHTML = '<button class="btn sm ghost" type="button" data-g>一步一步來</button><div class="gbody" hidden></div>';
  $('.opts', qe).after(box);
  const body = $('.gbody', box), done = [];
  const draw = k => {
    const st = sts[k], ord = shuffled(3, q.h + k).map(j => j + 1);
    body.innerHTML = `${done.length ? `<ol class="gdone">${done.map(x => `<li>${x}</li>`).join('')}</ol>` : ''}<p class="stepn">第 ${k + 1} 步，共 ${sts.length} 步</p><p class="gq">${esc(st[0])}</p><div class="opts">${ord.map(j => `<button class="gopt opt" type="button" data-j="${j}">${esc(st[j])}</button>`).join('')}</div><div class="gwhy" hidden></div>`;
    let n = 0;
    $$('.gopt', body).forEach(b => { b.onclick = () => {
      const ok = b.dataset.j === '1', w = $('.gwhy', body); n++;
      logAnswer({ c: q.c, k: 'x', h: `x:${q.h}:${k}`, sk: q.sk, ok, n, p: st[+b.dataset.j], qt: st[0] });
      b.classList.add(ok ? 'right' : 'wrong'); b.disabled = true; w.hidden = false;
      if (!ok) { w.className = 'gwhy why no'; w.textContent = '這個不對，再想想。'; return; }
      $$('.gopt', body).forEach(x => { x.disabled = true; }); done.push(`${esc(st[0])} <b>${esc(st[1])}</b>`);
      const last = k === sts.length - 1;
      w.className = 'gwhy why ok'; w.innerHTML = `<b>對。</b>${esc(st[4])} <button class="btn sm" type="button" data-n>${last ? '回到原題再選一次 ↑' : '下一步'}</button>`;
      $('[data-n]', w).onclick = () => { if (last) { body.hidden = true; $('[data-g]', box).hidden = false; done.length = 0; qe.scrollIntoView({ behavior: 'smooth', block: 'start' }); } else draw(k + 1); };
    }; });
  };
  qe.openGuide = () => { if (!body.hidden) return; $('[data-g]', box).hidden = true; body.hidden = false; done.length = 0; draw(0); };
  $('[data-g]', box).onclick = qe.openGuide;
}
// 題組的標題已在段落標題（h2）或錯題本的「文章：」顯示，卡片內只放原文與出處
const passage = b => `<div class="passage card"><p class="ptext">${esc(b.text)}</p>${b.src ? `<p class="psrc">${esc(b.src)}</p>` : ''}</div>`;

/* ---- 畫面 ---- */
const curWeek = () => ZWEEKS[Math.min(store.get('week', ZWEEKS.length - 1), ZWEEKS.length - 1)];
function nextSlot(w, ok = okSet()) {
  for (let d = 0; d < w.days.length; d++) for (const s of ['am', 'pm']) if (frac(slotQs(w, d, s), ok) < 1) return { d, s };
  return null;
}
const bar = f => `<span class="pbar"><i style="width:${Math.round(100 * f)}%"></i></span>`;
function renderHome() {
  const w = curWeek(), ok = okSet(), nx = nextSlot(w, ok), due = REVIEW.book(qlog()).due.length;
  const slot = (d, s) => {
    const qs = slotQs(w, d, s), f = frac(qs, ok), cur = nx && nx.d === d && nx.s === s;
    const what = s === 'am' ? `錯題複習・字音字形、字詞、常識 ${qs.length} 題` : `閱讀 ${qs.length} 題：${parts(w, d, s).filter(b => b.text).map(b => b.title).join('、')}`;
    return `<a class="slot${f >= 1 ? ' fin' : ''}${cur ? ' cur' : ''}" href="#d${d + 1}${s}"><span class="sl-h">${SLOT[s]}<small>約 15 分鐘</small></span><span class="sl-w">${esc(what)}</span>${bar(f)}<span class="sl-st">${f >= 1 ? '✓ 完成' : f > 0 ? `${Math.round(100 * f)}%` : cur ? '從這裡開始 →' : ''}</span></a>`;
  };
  $('#main').innerHTML = `<p class="eyebrow">第 ${w.n} 週 · 每天約 30 分鐘</p><h1>${esc(w.theme)}</h1>
<p class="lede">每天分成早上與晚上兩段，各約 15 分鐘。早上先複習到期的錯題，再做字音字形、字詞、成語和國學常識；晚上做閱讀題組（古文、詩詞、白話文或醫古文）。題目照中國醫、慈濟、義守的考卷出，答錯的自動排進之後的複習。</p>
<p class="note">三校答錯都會倒扣（中國醫、慈濟每題 0.7 分，義守 0.5 分）：練習時就養成「沒把握先跳過、最後再回來」的習慣。</p>
${due ? `<p class="duebar"><a href="#review">錯題本有 <b>${due}</b> 題今天到期 →</a></p>` : ''}
<ol class="days">${w.days.map((x, d) => `<li class="day${nx && nx.d === d ? ' now' : ''}"><h2>第 ${d + 1} 天<small>${esc(x.t)}</small></h2><div class="slots">${slot(d, 'am')}${slot(d, 'pm')}</div></li>`).join('')}</ol>
<div class="row endrow"><a class="btn" href="#review">錯題本</a></div>
${ZWEEKS.length > 1 ? `<p class="small">其他週：${ZWEEKS.map((x, i) => `<button class="btn sm" type="button" data-wk="${i}">第 ${x.n} 週</button>`).join(' ')}</p>` : ''}`;
  $$('[data-wk]').forEach(b => { b.onclick = () => { store.set('week', +b.dataset.wk); renderHome(); }; });
}
// 頁首顯示這一頁完成幾題；在已作答的題目之前、還沒作答的標成「跳過」
const itemDone = e => e.classList.contains('done') || e.classList.contains('prev');
function refreshParts() {
  const all = $$('.q[data-h]', $('#main')).filter(e => !e.closest('#rvAll'));
  const last = all.map(itemDone).lastIndexOf(true), skip = all.filter((e, k) => k < last && !itemDone(e)), n = all.filter(itemDone).length;
  all.forEach(e => e.classList.toggle('skipped', skip.includes(e)));
  $('#pgTag').innerHTML = all.length ? `${n === all.length ? '✓ ' : ''}本頁 ${n} / ${all.length} 題${skip.length ? `<button type="button" class="linkb skipb" id="pgSkip">跳過 ${skip.length} 題 ↓</button>` : ''}` : '';
  const sb = $('#pgSkip'); if (sb) sb.onclick = () => skip[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function resetBox(c, qs) {
  const box = $('#rsBox'); if (!box) return;
  box.innerHTML = '<button class="btn sm ghost" type="button" data-rs>重新練習這一段</button>';
  $('[data-rs]', box).onclick = () => {
    box.innerHTML = REVIEW.resetAsk('這一段');
    const go = v => { logAnswer({ c, k: 'reset', h: `reset:${c}`, qt: '重新練習這一段', ...(v ? { v: qs.map(q => q.h) } : {}) }); route(); };
    $('[data-y]', box).onclick = () => go(false);
    $('[data-v]', box).onclick = () => go(true);
    $('[data-n]', box).onclick = () => resetBox(c, qs);
  };
}
function renderSlot(w, d, s) {
  const c = `${wkKey(w)}d${d + 1}${s}`, all = slotQs(w, d, s), due = REVIEW.book(qlog()).due.length;
  const prev = s === 'pm' ? `#d${d + 1}am` : d ? `#d${d}pm` : '', next = s === 'am' ? `#d${d + 1}pm` : d < w.days.length - 1 ? `#d${d + 2}am` : '';
  let k = 0;
  const qsHTML = qs => qs.map(q => mcq(zq(w, d, s, q), `${++k} / ${all.length}`)).join('');
  $('#main').innerHTML = `<p class="eyebrow">第 ${w.n} 週・第 ${d + 1} 天・${SLOT[s]}・${esc(w.days[d].t)}</p>
<nav class="pn">${prev ? `<a href="${prev}">‹ 上一段</a>` : ''}<a href="#">本週</a>${next ? `<a href="${next}">下一段 ›</a>` : ''}</nav>
<h1>${s === 'am' ? '早上：字音字形、字詞、常識' : '晚上：閱讀'}</h1><div class="resetbox" id="rsBox"></div>
${s === 'am' ? `<section class="part"><h2>1. 錯題複習</h2>${due ? `<a class="btn pri rvgo" href="#review" data-back="#d${d + 1}am">今天到期 ${due} 題，先去錯題本複習 →</a><p class="note">做完會有按鈕回到這裡。</p>` : '<p class="note">今天沒有到期的錯題。</p>'}</section>
<section class="part"><h2>2. 今天的題目<small>約 15 分鐘</small></h2><p class="note">逐字比對選項，不要只看印象。答錯時按「一步一步來」。</p><div id="zq">${qsHTML(w.days[d].am)}</div></section>`
  : `<p class="note">先看題目知道要找什麼，再讀文章；答案要能在文中找到根據。</p><div id="zq">${parts(w, d, s).map((b, i) => `<section class="part"><h2>${i + 1}. ${esc(b.title || '單題')}</h2>${b.text ? passage(b) : ''}${qsHTML(b.qs)}</section>`).join('')}</div>`}
<div class="row endrow">${next ? `<a class="btn pri" href="${next}">${s === 'am' ? '晚上的部分 ›' : '明天早上 ›'}</a>` : ''}<a class="btn" href="#">本週</a></div>`;
  $$('.rvgo').forEach(a => { a.onclick = () => store.set('rvBack', a.dataset.back); });
  bindMcq($('#zq'), all, () => refreshParts()); refreshParts(); resetBox(c, all);
}

/* ---- 錯題本：今天到期的重考；下面列出全部錯題可以提前練習（不記錄、不影響排程） ---- */
// full：「之後到期」同一天一組時，題組文章直接整篇顯示（只在第一題前放一次，由呼叫端決定）
const rvHTML = (f, q, pre, full) => `<div class="rv-q">${full ? `<p class="lbl">${esc(f.b.title)}</p>${passage(f.b)}` : ''}<p class="qsrc">第 ${f.w.n} 週第 ${f.d + 1} 天・${SLOT[f.s]}・${pre}</p>${f.b && full === undefined ? `<details class="ctx"><summary>文章：${esc(f.b.title || '')}</summary>${passage(f.b)}</details>` : ''}${mcq(q, '')}</div>`;
function renderReview() {
  const now = Date.now(), ix = qindex();
  let book = REVIEW.book(qlog(), now);
  // 題目已從題庫移除：記一筆作廢，離開錯題本，首頁和其他裝置的數字才會一致
  const gone = [...new Set(book.open.concat(book.checks, book.due).filter(s => s.h && !ix[s.h]).map(s => s.h))];
  // shortcut: 一次超過 10 題對不上多半是題庫沒載入完整，先不作廢；真的大量刪題時再放寬
  if (gone.length && gone.length <= 10) { logAnswer({ c: 'review', k: 'reset', h: 'reset:gone', qt: '題目已從題庫移除', v: gone }); book = REVIEW.book(qlog(), now); }
  const items = book.due.filter(s => ix[s.h]).slice(0, 50).map(s => ({ s, f: ix[s.h], q: { ...ix[s.h].q, rv: s } }));
  // 之後到期：依到期日分組，同一天照題庫順序排，同一篇文章的題目放在一起（2026-11-08 使用者要求）
  const ord = new Map(Object.keys(ix).map((h, i) => [h, i]));
  const days = REVIEW.byDay(book.open.concat(book.checks).filter(s => s.due > now && ix[s.h]), s => s.due, now).map(g => ({ ...g, list: g.list.sort((a, b) => ord.get(a.h) - ord.get(b.h)) }));
  const back = store.get('rvBack', '');
  $('#main').innerHTML = `<p class="eyebrow">錯題本</p><h1>今天到期的錯題</h1>
<p class="lede">${REVIEW.RULE}</p><p>錯題本目前共 <b>${book.open.length}</b> 題，待確認（答對過的新題）<b>${book.checks.length}</b> 題；今天到期 <b>${book.due.length}</b> 題。</p>
<div id="rv">${items.length ? items.map(it => rvHTML(it.f, it.q, REVIEW.label(it.s))).join('') : '<p class="note">今天沒有到期的錯題。</p>'}</div><div class="row endrow">${back ? `<a class="btn pri" href="${back}">回到早上的練習 ›</a>` : ''}<a class="btn" href="#">回到本週</a></div>
${days.length ? `<h2>之後到期</h2>
<p class="small mut">點開某一天，可以提前練習那天到期的題目。這裡作答不記錄、不影響複習排程，到期那天還是要在上面作答。</p>
<div id="rvAll">${days.map((g, n) => `<details class="rvday" data-p="${n}"><summary>${g.label}<b>${g.list.length} 題</b></summary></details>`).join('')}</div>` : ''}`;
  bindMcq($('#rv'), items.map(it => it.q), null, false);
  const all = $('#rvAll');
  if (all) { noLog(all); $$('.rvday', all).forEach(d => { d.ontoggle = () => {
    if (!d.open || d.dataset.on) return; d.dataset.on = 1;
    const g = days[+d.dataset.p], shown = new Set();
    d.insertAdjacentHTML('beforeend', g.list.map(s => { const f = ix[s.h], first = !!f.b && !shown.has(f.b); if (f.b) shown.add(f.b); return rvHTML(f, f.q, REVIEW.label(s), first); }).join(''));
    bindMcq(d, g.list.map(s => ix[s.h].q), null, false);   // 不帶 rv：不顯示「幾天後再考」
  }; }); }
}

// 給學習階梯首頁的摘要（首頁沒有國文的題目資料，只讀這份）
function saveSummary() {
  const w = curWeek(), ok = okSet();
  store.set('sum', { n: w.n, theme: w.theme, weeks: ZWEEKS.length, slots: w.days.map((x, d) => [frac(slotQs(w, d, 'am'), ok), frac(slotQs(w, d, 'pm'), ok)]),
    next: nextSlot(w, ok), due: REVIEW.book(qlog()).due.length, t: Date.now() });
}
/* ---- 路由 ---- */
function route() {
  const h = location.hash.slice(1), w = curWeek(), m = h.match(/^d([1-7])(am|pm)$/);
  if (m && w.days[+m[1] - 1]) renderSlot(w, +m[1] - 1, m[2]);
  else if (h === 'review') renderReview();
  else renderHome();
  $('#wkTag').textContent = `第 ${w.n} 週`; refreshParts();
  saveSummary();
  window.scrollTo(0, 0);
}
function boot() { addEventListener('hashchange', route); route(); }
