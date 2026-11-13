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
// 國文不用「一步一步來」與答對後的追問（2026-11-10 使用者要求：國文多半靠記憶與語感，不像英文能用文法推理）
// 每題的 ex 依序說明四個選項（ex[0] 是正解）；閱讀題的 ref 是文中根據。選錯時只顯示那個選項錯在哪，答對後列出全部。
const exHTML = q => `${q.ref ? `<p class="exref">文中根據：${esc(q.ref)}</p>` : ''}<ul class="exl">${q.o.map((o, j) => `<li class="${j ? 'no' : 'ok'}"><b>${j ? '✗' : '✓'} ${esc(o)}</b><br>${esc(q.ex[j])}</li>`).join('')}</ul>`;
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
      why.hidden = false; why.className = 'why ok'; why.innerHTML = `<b>已完成。</b>${exHTML(q)}`; qe.classList.add('done');
      if (onDone) onDone(q); return;
    }
    $$('.opt', qe).forEach(b => { b.onclick = () => {
      const j = +b.dataset.o, ok = j === 0; n++;
      logAnswer({ c: q.c, k: q.k, h: q.h, sk: q.sk, ok, n, p: q.o[j], qt: q.qt });
      b.classList.add(ok ? 'right' : 'wrong'); b.disabled = true; why.hidden = false;
      if (ok) {
        $$('.opt', qe).forEach(x => { x.disabled = true; }); qe.classList.add('done');
        why.className = 'why ok'; why.innerHTML = `${REVIEW.okHead(n)}${exHTML(q)}${q.rv ? `<p><small>${REVIEW.after(q.rv, n === 1)}</small></p>` : ''}`;
        if (onDone) onDone(q);
      } else { why.className = 'why no'; why.innerHTML = `<b>✗ 這個不對：</b>${esc(q.ex[j])}<br>再選一次。`; }
    }; });
  });
}
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
<div class="row endrow"><a class="btn pri" href="#report">本週報告與匯出</a><a class="btn" href="#review">錯題本</a></div>
${ZWEEKS.length > 1 ? `<p class="small">其他週：${ZWEEKS.map((x, i) => `<button class="btn sm" type="button" data-wk="${i}">第 ${x.n} 週</button>`).join(' ')}</p>` : ''}`;
  $$('[data-wk]').forEach(b => { b.onclick = () => { store.set('week', +b.dataset.wk); renderHome(); }; });
}
// 頁首顯示這一頁完成幾題；在已作答的題目之前、還沒作答的標成「跳過」
const itemDone = e => e.classList.contains('done') || e.classList.contains('prev');
function refreshParts() {
  const all = $$('.q[data-h]', $('#main')).filter(e => !e.closest('.practice'));
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
<section class="part"><h2>2. 今天的題目<small>約 15 分鐘</small></h2><p class="note">逐字比對選項，不要只看印象。選錯會說明錯在哪裡，答對後列出每個選項的解析。</p><div id="zq">${qsHTML(w.days[d].am)}</div></section>`
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
  // 上方是日期格子（今天、明天……之後），點一格列出那天的題目；今天的作答會記錄，其他天是提前練習、不記錄（2026-11-09 使用者要求：拿掉規則說明）
  // 今天：之前沒做完的在前（book.due 已照到期日排）、最多 50 題；其他天照題庫順序，同一篇文章只放一次全文
  const ord = new Map(Object.keys(ix).map((h, i) => [h, i]));
  const cs = REVIEW.dayCards(book.open.concat(book.checks, book.due.filter(s => s.final)).filter(s => ix[s.h]), s => s.due, now)
    .map(g => ({ ...g, list: g.key === 'today' ? book.due.filter(s => ix[s.h]).slice(0, 50) : g.list.sort((a, b) => ord.get(a.h) - ord.get(b.h)) }));
  const back = store.get('rvBack', '');
  $('#main').innerHTML = `<p class="eyebrow">錯題本</p><h1>錯題複習</h1><div class="dcards" id="dcards"></div><div id="dlist"></div>`;
  const show = k => {
    const g = cs.find(x => x.key === k), today = k === 'today', shown = new Set();
    const qs = g.list.map(s => (today ? { ...ix[s.h].q, rv: s } : ix[s.h].q));   // 提前練習不帶 rv：不顯示「幾天後再考」
    $('#dcards').innerHTML = REVIEW.cardsHTML(cs, k);
    $$('#dcards .dcard').forEach(b => { b.onclick = () => show(b.dataset.k); });
    $('#dlist').innerHTML = `<div class="${today ? '' : 'practice'}">${today ? '' : `<p class="dnote">${g.label}到期的題目，可以提前練習：作答不記錄、不影響複習排程。</p>`}${g.list.length
      ? g.list.map((s, n) => { const f = ix[s.h]; if (today) return rvHTML(f, qs[n], REVIEW.label(s)); const first = !!f.b && !shown.has(f.b); if (f.b) shown.add(f.b); return rvHTML(f, qs[n], REVIEW.label(s), first); }).join('')
      : '<p class="note">今天沒有到期的錯題。</p>'}</div>
${today ? `<div class="row endrow">${back ? `<a class="btn pri" href="${back}">回到早上的練習 ›</a>` : ''}<a class="btn" href="#">回到本週</a></div>` : ''}`;
    const box = $('#dlist > div'); if (!today) noLog(box);
    bindMcq(box, qs, null, false); refreshParts();
  };
  show('today');
}

/* ---- 本週報告與匯出：貼給 AI 產生下一週（照英文的做法） ---- */
// 每題每天只算第一次作答
function weekStats(w) {
  const pre = wkKey(w) + 'd', tr = REVIEW.trials(qlog().filter(e => e.k === 'z' && e.c && e.c.startsWith(pre)));
  const sk = {}; Object.keys(SKILLS).forEach(k => { sk[k] = { n: 0, ok: 0 }; });
  tr.forEach(t => { const q = qindex()[t.h]; if (q && sk[q.q.sk]) { sk[q.q.sk].n++; if (t.ok) sk[q.q.sk].ok++; } });
  return { tr, sk };
}
const skillState = s => (s.n < 3 ? 'few' : s.ok / s.n >= 0.85 ? 'ok' : s.ok / s.n >= 0.7 ? 'mid' : 'weak');
const SK_ST = { few: '題數太少', ok: '穩定', mid: '還不穩', weak: '待加強' };
function renderReport() {
  const w = curWeek(), ok = okSet(), { tr, sk } = weekStats(w);
  const rate = tr.length ? Math.round(100 * tr.filter(t => t.ok).length / tr.length) : 0;
  $('#main').innerHTML = `<p class="eyebrow">第 ${w.n} 週</p><h1>本週報告</h1>
<p class="lede">作答 <b>${tr.length}</b> 題（每題每天只算第一次），第一次就答對 <b>${rate}%</b>。</p>
<table class="sktab"><thead><tr><th>能力</th><th>題數</th><th>答對</th><th>狀態</th></tr></thead><tbody>
${Object.keys(SKILLS).map(k => `<tr class="st-${skillState(sk[k])}"><td>${esc(SKILLS[k])}</td><td>${sk[k].n}</td><td>${sk[k].n ? Math.round(100 * sk[k].ok / sk[k].n) + '%' : '—'}</td><td>${SK_ST[skillState(sk[k])]}</td></tr>`).join('')}</tbody></table>
<section class="part"><h2>匯出給 AI</h2><p class="note">按下產生，複製全部內容貼給 AI，就能照你的弱項產生下一週。</p>
<div class="row"><button class="btn pri" type="button" id="exGo">產生匯出內容</button></div><div id="exBox" hidden><div class="row"><button class="btn" type="button" id="exCopy">複製</button><a class="btn" id="exDl" download="後中國文-第${w.n}週.md">下載 .md</a><span class="small mut" id="exMsg"></span></div><textarea id="exTxt" rows="16" readonly></textarea></div></section>
<div class="row endrow"><a class="btn" href="#">回到本週</a></div>`;
  $('#exGo').onclick = () => {
    const md = exportMD(w), ta = $('#exTxt'); ta.value = md; $('#exBox').hidden = false;
    $('#exDl').href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
  };
  $('#exCopy').onclick = () => { const ta = $('#exTxt'); ta.select(); (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).then(() => { $('#exMsg').textContent = '已複製'; }, () => { document.execCommand('copy'); $('#exMsg').textContent = '已複製'; }); };
}
function exportMD(w) {
  const { tr, sk } = weekStats(w), ix = qindex(), pre = wkKey(w) + 'd', today = REVIEW.dayKey(Date.now());
  const evs = qlog().filter(e => e.k === 'z' && e.c && e.c.startsWith(pre)), wrong = {}, picks = {};
  evs.filter(e => !e.ok).forEach(e => { wrong[e.h] = (wrong[e.h] || 0) + 1; (picks[e.h] = picks[e.h] || new Set()).add(e.p); });
  const st = new Map(REVIEW.book(qlog()).open.map(s => [s.h, s]));
  const line = h => { const f = ix[h]; if (!f) return `- ${h}`; const q = f.q;
    return `- [${SKILLS[q.sk] || q.sk}] ${plain(q.q).replace(/\n/g, ' ')}\n  - 正解：${q.o[0]}；我選過：${[...(picks[h] || [])].join('／') || '—'}（${st.has(h) ? '未掌握' : '已掌握'}，錯 ${wrong[h] || 0} 次）`; };
  const prevOpen = REVIEW.book(qlog()).open.filter(s => s.h && ix[s.h] && !(s.c || '').startsWith(pre));
  const nn = w.n + 1, NN = String(nn).padStart(2, '0');
  return `# 後中國文 第 ${w.n} 週學習紀錄（匯出日 ${today}）

## 給 AI 的指示：請產生第 ${nn} 週的練習題

我在準備台灣學士後中醫入學考（目標：中國醫藥大學，2027 年 4 月筆試）的國文。考試每份 50 題四選一單選，答錯倒扣。請依照下面「本週紀錄」的弱項，產生第 ${nn} 週的資料檔 \`w${NN}.js\`，格式必須和下面的規格完全一樣（網站會直接載入，格式錯了整頁會壞）。

### 內容要求
1. 共 7 天，每天 15 題：早上 8 題（字音、字形、字詞、成語、國學常識、修辭），晚上 7 題（1–2 個閱讀題組，加排序／填空／修辭單題）。題目數量不要增加。
2. **難度照考卷**：題型與難度照中國醫、慈濟、義守近年考卷；字詞與成語用考卷程度的字（例：胼手胝足、痌瘝在抱、淪肌浹髓），國學常識考題辭、時辰、月份別稱、代稱、作家作品等考卷常見的點。
3. **弱項優先**：「待加強」「還不穩」的能力，下週題數要比本週多；「穩定」的能力仍要出現。
4. **錯題回收**：「答錯的題目」考的知識點，下週換一個題目再考一次（不要原題照抄）。
5. **正解唯一**：錯誤選項必須是公認的錯（褒貶用反、用錯對象、望文生義、錯別字、讀音），不靠和句中某個詞矛盾來製造錯誤；古今用法不同、辭典與一般用法不一致的詞不當錯誤選項。
6. **有依據**：成語、字音、字形依教育部《成語典》《重編國語辭典修訂本》；解析寫出釋義。
7. **反向檢查**：每個錯誤選項都要問「有沒有合理讀法讓它也對」，有就換。
8. **不能一眼排除**：錯誤選項不能靠表面記號（「像」「如」、明顯誇大）排除；修辭題用容易混淆的類型互相干擾（略喻、借喻與轉化，擬人與擬物，映襯與對比等）。每題至少兩個錯誤選項要真的懂才能排除。
9. **閱讀題**：正解在文中找得到根據（寫在 ref）；錯誤選項錯在與文意矛盾或文中沒有根據。引文只用公版古籍與古典詩詞，現代文章自擬。
10. 每題的 ex 依序說明四個選項為什麼對、為什麼錯（ex[0] 是正解）。不要「一步一步來」與追問。中文用台灣繁體。

### 資料格式
\`\`\`js
// w${NN}.js
ZWEEKS.push({ n: ${nn}, theme: '本週主題', days: [
  { t: '當天主題', am: [
      { id: 'd1a1', sk: '能力代碼', q: '題目（可用 \\n 換行）', o: ['正解', '誤1', '誤2', '誤3'], ex: ['正解說明', '誤1錯在哪', '誤2錯在哪', '誤3錯在哪'] }, …（8 題）
    ], pm: [
      { title: '題組標題', src: '出處', text: '引文', qs: [ { id: 'd1p1', sk: '能力代碼', q: '…', o: [...], ex: [...], ref: '文中根據' }, … ] },
      { id: 'd1p6', sk: '…', q: '…', o: [...], ex: [...] }, …（共 7 題）
    ] },
  …（7 天）
] });
\`\`\`
- o 的第一個一定是正解（網站會打亂順序）。id 在同一週內不可重複。能力代碼只能用下表的代碼。

## 本週紀錄

完成：${w.days.map((x, d) => `第${d + 1}天 早${Math.round(100 * frac(slotQs(w, d, 'am'), okSet()))}% 晚${Math.round(100 * frac(slotQs(w, d, 'pm'), okSet()))}%`).join('、')}
作答：${tr.length} 題（每題每天只算第一次），第一次就答對 ${tr.length ? Math.round(100 * tr.filter(t => t.ok).length / tr.length) : 0}%

### 各項能力（第一次作答）
| 代碼 | 能力 | 題數 | 答對 | 正確率 | 狀態 |
|---|---|---|---|---|---|
${Object.keys(SKILLS).map(k => `| ${k} | ${SKILLS[k]} | ${sk[k].n} | ${sk[k].ok} | ${sk[k].n ? Math.round(100 * sk[k].ok / sk[k].n) + '%' : '—'} | ${SK_ST[skillState(sk[k])]} |`).join('\n')}

### 答錯的題目
${Object.keys(wrong).map(line).join('\n') || '- （沒有）'}
${prevOpen.length ? `\n### 之前幾週還沒掌握的錯題\n${prevOpen.map(s => line(s.h)).join('\n')}\n` : ''}`;
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
  else if (h === 'report') renderReport();
  else renderHome();
  $('#wkTag').textContent = `第 ${w.n} 週`; refreshParts();
  saveSummary();
  window.scrollTo(0, 0);
}
function boot() { addEventListener('hashchange', route); route(); }
