/* ---------- 後中英文：每天早上／晚上兩段、錯題複習、週報、匯出 ----------
   紀錄每一筆：{ t, c 第幾週第幾天哪一段（w1d3am）, k 種類, h 題目識別碼, sk 能力, ok, n 第幾次作答, p 選了什麼, qt 題目摘要 }
   k：w 單字、wr 單字回想、s 長句的一步、g 文法題、p 文章題（進錯題本）；x 一步一步來的小步驟；u 標記「不熟」（p 1 標記、-1 取消）。 */
const LOG = store.get('log', []);
const REVIEW_KINDS = new Set(['w', 'wr', 's', 'g', 'p']);
function logAnswer(e) {
  LOG.push({ t: Date.now(), ...e }); if (LOG.length > 20000) LOG.splice(0, LOG.length - 20000);
  store.set('log', LOG); if (typeof CLOUD !== 'undefined' && CLOUD.pushLog) CLOUD.pushLog();
}
const qlog = () => LOG.filter(e => REVIEW_KINDS.has(e.k));
const okSet = () => new Set(LOG.filter(e => e.ok && e.h).map(e => e.h));
const unsure = () => { const m = {}; LOG.forEach(e => { if (e.k === 'u') m[e.h] = e.p === 1 ? e : null; }); return m; };
const DAYN = '一二三四五六日';

/* ---- 題目索引：每週的每一題都有固定識別碼，錯題本靠它找回題目 ---- */
const wkKey = w => 'w' + w.n;
function wordQ(w, d, i) {
  const day = w.words[d], x = day[i], others = [1, 3, 6].map(k => day[(i + k) % day.length]);
  return { h: `w:${wkKey(w)}:${x[0]}`, k: 'w', sk: 'v.mean', c: `${wkKey(w)}d${d + 1}am`, en: 1,
    q: `<span class="enw">${esc(x[0])}</span> <span class="pos">${esc(x[1])}</span> 的意思是？`, o: [x[2], ...others.map(y => y[2])],
    why: `${esc(x[0])}：${esc(x[2])}。${x[3] ? `<br><span class="mut">${esc(x[3])}</span>` : ''}`, qt: x[0] };
}
// 晚上的回想：把早上例句裡的單字挖空
function stemRe(word) { const s = word.length > 5 ? word.replace(/(e|y|ate|ize)$/, '') : word; return new RegExp(`\\b${s}\\w*`, 'i'); }
function recallQ(w, d, i) {
  const day = w.words[d], x = day[i], others = [2, 5, 7].map(k => day[(i + k) % day.length]);
  const sent = esc(x[4]).replace(stemRe(x[0]), '<span class="gap">＿＿＿＿</span>');
  return { h: `wr:${wkKey(w)}:${x[0]}`, k: 'wr', sk: 'v.mean', c: `${wkKey(w)}d${d + 1}pm`, en: 1,
    q: `<span class="ens">${sent}</span><br><small class="mut">${esc(x[5])}（選項是原形，句中可能有變化）</small>`, o: [x[0], ...others.map(y => y[0])],
    why: `${esc(x[4])}`, qt: x[0] };
}
const gramQ = (w, d, q) => ({ ...q, h: `g:${wkKey(w)}:${q.id}`, k: 'g', c: `${wkKey(w)}d${d + 1}pm`, en: 1, qt: q.q.replace(/<[^>]+>/g, '').slice(0, 60) });
const passQ = (w, d, q) => ({ ...q, h: `p:${wkKey(w)}:${q.id}`, k: 'p', c: `${wkKey(w)}d${d + 1}pm`, en: 1, qt: `${w.passages[d].title}・${q.q}`.slice(0, 80) });
const sentH = (w, d, j, i) => `s:${wkKey(w)}:${d}:${j}:${i}`;
let QIX = null;
function qindex() {
  if (QIX) return QIX; QIX = {};
  WEEKS.forEach(w => w.words.forEach((day, d) => {
    day.forEach((x, i) => { const a = wordQ(w, d, i), b = recallQ(w, d, i); QIX[a.h] = { q: a, w, d }; QIX[b.h] = { q: b, w, d }; });
    (w.sents[d] || []).forEach((s, j) => s.steps.forEach((st, i) => { QIX[sentH(w, d, j, i)] = { sent: s, w, d, j, i, sk: st[5] }; }));
    if (w.gram[d]) w.gram[d].qs.forEach(q => { const g = gramQ(w, d, q); QIX[g.h] = { q: g, w, d }; });
    if (w.passages[d]) w.passages[d].qs.forEach(q => { const p = passQ(w, d, q); QIX[p.h] = { q: p, w, d }; });
  }));
  return QIX;
}
// 每一段要完成的題目
const amIds = (w, d) => [...w.words[d].map((x, i) => wordQ(w, d, i).h), ...(w.sents[d] || []).flatMap((s, j) => s.steps.map((st, i) => sentH(w, d, j, i)))];
const pmIds = (w, d) => [...w.gram[d].qs.map(q => gramQ(w, d, q).h), ...w.passages[d].qs.map(q => passQ(w, d, q).h), ...w.words[d].map((x, i) => recallQ(w, d, i).h)];
const frac = (ids, ok) => ids.filter(h => ok.has(h)).length / ids.length;

/* ---- 選擇題：答錯可以再選；「一步一步來」把題目拆成小判斷 ---- */
function mcq(q, num) {
  const ord = shuffled(q.o.length, q.h);
  return `<div class="q" data-h="${esc(q.h)}">${num ? `<p class="qnum">${num}</p>` : ''}<p class="qt">${q.q}</p><div class="opts">${ord.map(j => `<button class="opt${q.en ? ' en-o' : ''}" type="button" data-o="${j}">${esc(q.o[j])}</button>`).join('')}</div><div class="why" hidden></div></div>`;
}
function bindMcq(root, list, onDone) {
  list.forEach(q => {
    const qe = root.querySelector(`.q[data-h="${CSS.escape(q.h)}"]`); if (!qe) return;
    let n = 0; const why = $('.why', qe);
    if (q.st && q.st.length) guide(qe, q);
    $$('.opt', qe).forEach(b => { b.onclick = () => {
      const ok = b.dataset.o === '0'; n++;
      logAnswer({ c: q.c, k: q.k, h: q.h, sk: q.sk, ok, n, p: q.o[+b.dataset.o], qt: q.qt });
      b.classList.add(ok ? 'right' : 'wrong'); b.disabled = true; why.hidden = false;
      if (ok) {
        $$('.opt', qe).forEach(x => { x.disabled = true; }); const g = $('.guide', qe); if (g) g.hidden = true;
        why.className = 'why ok'; why.innerHTML = `<b>答對了。</b>${q.why}`; qe.classList.add('done');
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
      logAnswer({ c: q.c, k: 'x', h: `x:${q.h}:${k}`, sk: st[5], ok, n, p: st[+b.dataset.j], qt: st[0] });
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
// 「？還不太懂」：單字、文法、長句、文章都可以標，匯出時列出來
function unsureBtn(key, c, label) {
  const on = !!unsure()[key];
  return `<button class="btn sm unsure${on ? ' on' : ''}" type="button" data-u="${esc(key)}" data-uc="${esc(c)}" data-ul="${esc(label)}" aria-pressed="${on}">${on ? '已標記：不熟' : '？還不太懂'}</button>`;
}
function bindUnsure(root) {
  $$('[data-u]', root).forEach(b => { b.onclick = () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    logAnswer({ c: b.dataset.uc, k: 'u', h: b.dataset.u, p: on ? 1 : -1, qt: b.dataset.ul });
    b.setAttribute('aria-pressed', on); b.classList.toggle('on', on); b.textContent = on ? '已標記：不熟' : '？還不太懂';
  }; });
}

/* ---- 長句拆解：一步一步標出主詞、動詞、修飾 ---- */
function sentHTML(w, d, j, s, key = `${d}:${j}`) {
  return `<div class="card sentc" data-sent="${key}"><div class="sent">${s.chunks.map((c, i) => `<span class="ch" data-i="${i}">${esc(c)}</span> `).join('')}</div>
<p class="legend"><span class="ls">主詞</span><span class="lv">主要動詞</span><span class="lm">修飾（第一遍可以跳過）</span></p><div class="sbody"></div></div>`;
}
function bindSent(root, w, d, j, s, onDone, key = `${d}:${j}`) {
  const card = root.querySelector(`[data-sent="${key}"]`), body = $('.sbody', card), c = `${wkKey(w)}d${d + 1}am`, done = [];
  const mark = m => Object.entries(m || {}).forEach(([i, v]) => { const e = card.querySelector(`.ch[data-i="${i}"]`); if (e) { e.classList.remove('s', 'v', 'm'); e.classList.add(v); } });
  const finish = () => {
    s.steps.forEach(st => mark(st[6]));
    body.innerHTML = `${done.length ? `<ol class="gdone">${done.join('')}</ol>` : ''}<p class="core"><span class="lbl">主幹</span>${esc(s.core)}</p><p class="zh">${esc(s.zh)}</p><div class="row">${unsureBtn(`u:sent:${wkKey(w)}:${d}:${j}`, c, s.core)}</div>`;
    bindUnsure(body); if (onDone) onDone();
  };
  const draw = k => {
    if (k >= s.steps.length) return finish();
    const st = s.steps[k], h = sentH(w, d, j, k), ord = shuffled(3, h).map(x => x + 1); let n = 0;
    body.innerHTML = `${done.length ? `<ol class="gdone">${done.join('')}</ol>` : ''}<p class="stepn">第 ${k + 1} 步，共 ${s.steps.length} 步</p><p class="gq">${esc(st[0])}</p><div class="opts">${ord.map(x => `<button class="opt en-o" type="button" data-j="${x}">${esc(st[x])}</button>`).join('')}</div><div class="why" hidden></div>`;
    $$('.opt', body).forEach(b => { b.onclick = () => {
      const ok = b.dataset.j === '1', why = $('.why', body); n++;
      logAnswer({ c, k: 's', h, sk: st[5], ok, n, p: st[+b.dataset.j], qt: `${s.core}｜${st[0]}` });
      b.classList.add(ok ? 'right' : 'wrong'); b.disabled = true; why.hidden = false;
      if (!ok) { why.className = 'why no'; why.textContent = '這個不對，再想想。'; return; }
      $$('.opt', body).forEach(x => { x.disabled = true; }); mark(st[6]);
      why.className = 'why ok'; why.innerHTML = `<b>對。</b>${esc(st[4])} <button class="btn sm" type="button" data-n>${k === s.steps.length - 1 ? '看主幹與翻譯' : '下一步'}</button>`;
      $('[data-n]', why).onclick = () => { done.push(`<li>${esc(st[0])} <b>${esc(st[1])}</b></li>`); draw(k + 1); };
    }; });
  };
  draw(0);
}

/* ---- 畫面 ---- */
const curWeek = () => WEEKS[Math.min(store.get('week', WEEKS.length - 1), WEEKS.length - 1)];
// 建議的今天：這週第一個還沒做完的段落
function nextSlot(w, ok = okSet()) {
  for (let d = 0; d < 7; d++) { if (frac(amIds(w, d), ok) < 1) return { d, s: 'am' }; if (frac(pmIds(w, d), ok) < 1) return { d, s: 'pm' }; }
  return null;
}
const bar = f => `<span class="pbar"><i style="width:${Math.round(100 * f)}%"></i></span>`;
function renderHome() {
  const w = curWeek(), ok = okSet(), nx = nextSlot(w, ok), due = REVIEW.book(qlog()).due.length;
  const slot = (d, s) => {
    const f = frac(s === 'am' ? amIds(w, d) : pmIds(w, d), ok), cur = nx && nx.d === d && nx.s === s;
    const what = s === 'am' ? '錯題複習・10 個新單字・2 個長句' : `文法：${w.gram[d].title.split('：')[0]}・${w.passages[d].type === 'cloze' ? '克漏字' : '閱讀'}・單字回想`;
    return `<a class="slot${f >= 1 ? ' fin' : ''}${cur ? ' cur' : ''}" href="#d${d + 1}${s}"><span class="sl-h">${s === 'am' ? '早上' : '晚上'}<small>約 30 分鐘</small></span><span class="sl-w">${what}</span>${bar(f)}<span class="sl-st">${f >= 1 ? '✓ 完成' : f > 0 ? `${Math.round(100 * f)}%` : cur ? '從這裡開始 →' : ''}</span></a>`;
  };
  $('#main').innerHTML = `<p class="eyebrow">第 ${w.n} 週 · 每天約 60 分鐘</p><h1>${esc(w.theme)}</h1>
<p class="lede">每天分成早上與晚上兩段。早上先複習到期的錯題，再學 10 個新單字和 2 個長句；晚上學一個文法重點，做一篇克漏字或閱讀，最後回想早上的單字。答錯的題目會自動排進之後的複習。</p>
${due ? `<p class="duebar"><a href="#review">錯題本有 <b>${due}</b> 題今天到期 →</a></p>` : ''}
<ol class="days">${w.words.map((x, d) => `<li class="day${nx && nx.d === d ? ' now' : ''}"><h2>第 ${d + 1} 天<small>${esc(w.gram[d].title.split('：')[0])}</small></h2><div class="slots">${slot(d, 'am')}${slot(d, 'pm')}</div></li>`).join('')}</ol>
<div class="row endrow"><a class="btn pri" href="#report">本週報告與匯出</a><a class="btn" href="#review">錯題本</a></div>
${WEEKS.length > 1 ? `<p class="small">其他週：${WEEKS.map((x, i) => `<button class="btn sm" type="button" data-wk="${i}">第 ${x.n} 週</button>`).join(' ')}</p>` : ''}`;
  $$('[data-wk]').forEach(b => { b.onclick = () => { store.set('week', +b.dataset.wk); renderHome(); }; });
}
function dayHead(w, d, s) {
  const prev = s === 'pm' ? `#d${d + 1}am` : d ? `#d${d}pm` : '', next = s === 'am' ? `#d${d + 1}pm` : d < 6 ? `#d${d + 2}am` : '#report';
  return `<p class="eyebrow">第 ${w.n} 週・第 ${d + 1} 天・${s === 'am' ? '早上' : '晚上'}</p>
<nav class="pn">${prev ? `<a href="${prev}">‹ 上一段</a>` : ''}<a href="#">本週</a><a href="${next}">${s === 'pm' && d === 6 ? '本週報告' : '下一段'} ›</a></nav>`;
}
function progressLine(ids) {
  const el = $('#segProg'); if (!el) return;
  const f = frac(ids, okSet()); el.innerHTML = `${bar(f)}<span>${f >= 1 ? '✓ 這一段完成了' : `完成 ${Math.round(100 * f)}%`}</span>`;
}
function renderAM(w, d) {
  const words = w.words[d], wq = words.map((x, i) => wordQ(w, d, i)), c = `${wkKey(w)}d${d + 1}am`, rv = reviewItems(12);
  $('#main').innerHTML = `${dayHead(w, d, 'am')}<h1>早上：單字與長句</h1><p class="segprog" id="segProg"></p>
<section class="part"><h2>1. 錯題複習<small>約 5–10 分鐘</small></h2>${rv.length ? `<p class="note">之前答錯、今天到期的題目。第一次就答對才算過關，答錯會再排一次。</p><div id="rv">${reviewHTML(rv)}</div>` : '<p class="note">今天沒有到期的錯題。</p>'}</section>
<section class="part"><h2>2. 新單字<small>約 10 分鐘</small></h2><p class="note">先看字根拆解和例句，大聲唸一次例句。不熟的按「？還不太懂」，匯出時會列給下一週。</p>
<div class="words">${words.map(x => `<article class="wcard"><p class="wh"><span class="enw">${esc(x[0])}</span><span class="pos">${esc(x[1])}</span><span class="wz">${esc(x[2])}</span></p>${x[3] ? `<p class="root">${esc(x[3])}</p>` : ''}<p class="ens">${esc(x[4])}</p><p class="zh">${esc(x[5])}</p>${unsureBtn(`u:word:${wkKey(w)}:${x[0]}`, c, `${x[0]}（${x[2]}）`)}</article>`).join('')}</div>
<h3>小測驗：選出意思</h3><div id="wq">${wq.map((q, i) => mcq(q, `${i + 1} / ${wq.length}`)).join('')}</div></section>
<section class="part"><h2>3. 長句拆解<small>約 10 分鐘</small></h2><p class="note">先找主要動詞，再找主詞，其他部分都是修飾。每一步答對，句子上會標出來。</p>${w.sents[d].map((s, j) => sentHTML(w, d, j, s)).join('')}</section>
<div class="row endrow"><a class="btn pri" href="#d${d + 1}pm">晚上的部分 ›</a></div>`;
  const ids = amIds(w, d), upd = () => progressLine(ids);
  bindReview(rv); bindUnsure($('#main')); bindMcq($('#wq'), wq, upd); w.sents[d].forEach((s, j) => bindSent($('#main'), w, d, j, s, upd)); upd();
}
function passageHTML(w, d, P) {
  const blank = t => esc(t).replace(/\{(\d)\}/g, (m, n) => `<span class="blank" data-b="${n}">(${n}) ＿＿＿＿</span>`);
  const pq = P.qs.map(q => passQ(w, d, q));
  const text = `<div class="passage card"><p class="ptitle">${esc(P.title)}</p>${P.text.map(t => `<p class="ens">${blank(t)}</p>`).join('')}<details><summary>中文翻譯（做完再看）</summary><p class="zh">${esc(P.zh)}</p></details></div>`;
  if (P.type === 'cloze') return `<p class="note">克漏字：每格先看前後文是什麼關係（同方向、相反、因果），再看空格要什麼詞性。</p>${text}<div id="pq">${pq.map((q, i) => mcq(q, `第 ${i + 1} 格`)).join('')}</div>`;
  return `<p class="note">閱讀：先看題目知道要找什麼，再讀文章，最後回答。</p>
<div class="card pre"><p class="lbl">先看題目</p><ol>${P.qs.map(q => `<li><span class="ens">${esc(q.q)}</span><br><small class="mut">${esc(q.pre || '')}</small></li>`).join('')}</ol></div>${text}<div id="pq">${pq.map((q, i) => mcq(q, `第 ${i + 1} 題`)).join('')}</div>`;
}
function renderPM(w, d) {
  const G = w.gram[d], P = w.passages[d], c = `${wkKey(w)}d${d + 1}pm`;
  const gq = G.qs.map(q => gramQ(w, d, q)), pq = P.qs.map(q => passQ(w, d, q)), rq = w.words[d].map((x, i) => recallQ(w, d, i));
  $('#main').innerHTML = `${dayHead(w, d, 'pm')}<h1>晚上：文法與文章</h1><p class="segprog" id="segProg"></p>
<section class="part"><h2>1. 文法重點<small>約 10 分鐘</small></h2><div class="card lesson"><h3>${esc(G.title)}</h3>${G.body}<p class="lbl">這一課練的能力：${esc(SKILLS[G.id] || G.id)}</p><div class="row">${unsureBtn(`u:gram:${wkKey(w)}:${d}`, c, G.title)}</div></div>
<div id="gq">${gq.map((q, i) => mcq(q, `${i + 1} / ${gq.length}`)).join('')}</div></section>
<section class="part"><h2>2. ${P.type === 'cloze' ? '克漏字' : '閱讀測驗'}<small>約 12 分鐘</small></h2>${passageHTML(w, d, P)}<div class="row">${unsureBtn(`u:pass:${wkKey(w)}:${d}`, c, P.title)}</div></section>
<section class="part"><h2>3. 單字回想<small>約 5 分鐘</small></h2><p class="note">早上的 10 個字放回例句裡。想不起來就回去看早上的卡片。</p><div id="rq">${rq.map((q, i) => mcq(q, `${i + 1} / ${rq.length}`)).join('')}</div></section>
<div class="row endrow"><a class="btn pri" href="${d < 6 ? `#d${d + 2}am` : '#report'}">${d < 6 ? '明天早上 ›' : '本週報告 ›'}</a><a class="btn" href="#">本週</a></div>`;
  const ids = pmIds(w, d), upd = q => {
    progressLine(ids);
    if (q && P.type === 'cloze') { const n = P.qs.findIndex(x => passQ(w, d, x).h === q.h) + 1, b = $(`.blank[data-b="${n}"]`); if (b) { b.textContent = `(${n}) ${q.o[0]}`; b.classList.add('fill'); } }
  };
  bindUnsure($('#main')); bindMcq($('#gq'), gq, upd); bindMcq($('#pq'), pq, upd); bindMcq($('#rq'), rq, upd); upd();
}

/* ---- 錯題複習 ---- */
function reviewItems(max = 50) {
  const ix = qindex(), seen = new Set(), out = [];
  for (const s of REVIEW.book(qlog()).due) {
    const f = ix[s.h]; if (!f) continue;
    if (f.sent) { const key = `sent:${f.w.n}:${f.d}:${f.j}`; if (seen.has(key)) continue; seen.add(key); out.push({ sent: f, s }); }
    else out.push({ q: f.q, f, s });
    if (out.length >= max) break;
  }
  return out;
}
function reviewHTML(items) {
  return items.map((it, n) => {
    if (it.sent) { const f = it.sent; return `<div class="rv-sent"><p class="qsrc">第 ${f.w.n} 週第 ${f.d + 1} 天・長句</p>${sentHTML(f.w, f.d, f.j, f.w.sents[f.d][f.j], `r${f.d}:${f.j}`)}</div>`; }
    const q = it.q, f = it.f; let ctx = '';
    if (q.k === 'p') {
      const P = f.w.passages[f.d], n0 = P.qs.findIndex(x => passQ(f.w, f.d, x).h === q.h) + 1;
      if (P.type === 'cloze') {
        const para = P.text.find(t => t.includes(`{${n0}}`)) || '';
        ctx = `<p class="ens ctx">${esc(para).replace(/\{(\d)\}/g, (m, k) => (+k === n0 ? `<span class="blank">(${k}) ＿＿＿＿</span>` : esc(P.qs[k - 1].o[0])))}</p>`;
      } else ctx = `<details class="ctx"><summary>文章：${esc(P.title)}</summary>${P.text.map(t => `<p class="ens">${esc(t)}</p>`).join('')}</details>`;
    }
    return `<div class="rv-q"><p class="qsrc">第 ${f.w.n} 週第 ${f.d + 1} 天・${{ w: '單字', wr: '單字回想', g: '文法', p: '文章' }[q.k]}・${esc(SKILLS[q.sk] || '')}・第 ${it.s.stage + 1} 輪</p>${ctx}${mcq(q, '')}</div>`;
  }).join('');
}
function bindReview(items) {
  const root = $('#rv'); if (!root) return;
  bindMcq(root, items.filter(it => it.q).map(it => it.q));
  items.filter(it => it.sent).forEach(it => { const f = it.sent; bindSent(root, f.w, f.d, f.j, f.w.sents[f.d][f.j], null, `r${f.d}:${f.j}`); });
}
function renderReview() {
  const items = reviewItems(), book = REVIEW.book(qlog());
  $('#main').innerHTML = `<p class="eyebrow">錯題本</p><h1>今天到期的錯題</h1>
<p class="lede">答錯的題目隔 1 天回來；到期後第一次就答對，再隔 3 天；再答對一次就算掌握，離開錯題本。錯題本目前共 ${book.open.length} 題，今天到期 ${book.due.length} 題。</p>
<div id="rv">${items.length ? reviewHTML(items) : '<p class="note">今天沒有到期的錯題。</p>'}</div><div class="row endrow"><a class="btn" href="#">回到本週</a></div>`;
  bindReview(items);
}

/* ---- 週報：依能力分類列出本週練了什麼、哪裡弱 ---- */
function weekStats(w) {
  const pre = wkKey(w) + 'd', tr = REVIEW.trials(qlog()).filter(x => x.c && x.c.startsWith(pre));
  const sk = {}; Object.keys(SKILLS).forEach(k => { sk[k] = { n: 0, ok: 0 }; });
  const skOf = {}; LOG.forEach(e => { if (e.h && e.sk) skOf[e.h] = e.sk; });
  tr.forEach(x => { const k = skOf[x.h]; if (!sk[k]) return; sk[k].n++; if (x.ok) sk[k].ok++; });
  return { tr, sk };
}
const skillState = s => (!s.n ? 'none' : s.n < 3 ? 'few' : s.ok / s.n < 0.6 ? 'weak' : s.ok / s.n < 0.8 ? 'mid' : 'good');
const SK_ST = { none: '本週沒練到', few: '題數太少', weak: '待加強', mid: '還不穩', good: '穩定' };
function renderReport() {
  const w = curWeek(), ok = okSet(), { tr, sk } = weekStats(w), u = unsure();
  const daysDone = w.words.map((x, d) => frac(amIds(w, d), ok) >= 1 && frac(pmIds(w, d), ok) >= 1).filter(Boolean).length;
  const weak = Object.keys(SKILLS).filter(k => ['weak', 'mid'].includes(skillState(sk[k]))).sort((a, b) => sk[a].ok / sk[a].n - sk[b].ok / sk[b].n);
  const lessons = w.gram.map((G, d) => { const ids = G.qs.map(q => gramQ(w, d, q).h), t = tr.filter(x => ids.includes(x.h)); return { G, d, n: t.length, ok: t.filter(x => x.ok).length, done: frac(ids, ok) >= 1, u: !!u[`u:gram:${wkKey(w)}:${d}`] }; });
  const unsureList = Object.values(u).filter(e => e && e.c && e.c.startsWith(wkKey(w) + 'd'));
  $('#main').innerHTML = `<p class="eyebrow">第 ${w.n} 週報告</p><h1>這週學了什麼、哪裡還弱？</h1>
<p class="lede">完成 ${daysDone} / 7 天，共作答 ${tr.length} 題（每題每天只算第一次），第一次就答對 ${tr.length ? Math.round(100 * tr.filter(x => x.ok).length / tr.length) : 0}%。</p>
<section class="part"><h2>本週的文法重點</h2><ol class="lessons">${lessons.map(l => `<li class="${l.done ? 'fin' : ''}"><a href="#d${l.d + 1}pm"><span class="ck">${l.done ? '✓' : ''}</span><span>第 ${l.d + 1} 天・${esc(l.G.title.split('：')[0])}</span><b>${l.n ? `${l.ok}/${l.n} 第一次答對` : '還沒做'}${l.u ? '・標記不熟' : ''}</b></a></li>`).join('')}</ol></section>
<section class="part"><h2>各項能力</h2><p class="note">題目雖然混在單字、長句、文章裡，每一題都對應下面的一項能力。穩定＝至少 3 題且第一次答對八成以上；待加強＝不到六成。</p>
${SKILL_GROUPS.map(([g, name]) => `<div class="skg"><h3>${name}</h3>${Object.keys(SKILLS).filter(k => k.startsWith(g + '.')).map(k => { const s = sk[k], st = skillState(s); return `<div class="skr st-${st}"><span class="skn">${SKILLS[k]}</span><span class="pbar"><i style="width:${s.n ? Math.round(100 * s.ok / s.n) : 0}%"></i></span><span class="skv">${s.n ? `${s.ok}/${s.n}` : '—'}</span><span class="sks">${SK_ST[st]}</span></div>`; }).join('')}</div>`).join('')}</section>
<section class="part"><h2>需要加強</h2>${weak.length ? `<ol>${weak.map(k => `<li><b>${SKILLS[k]}</b>：第一次答對 ${sk[k].ok}/${sk[k].n}</li>`).join('')}</ol>` : '<p class="note">目前沒有低於八成的能力（或題數還不夠）。</p>'}
${unsureList.length ? `<p class="lbl">你標記「不熟」的地方</p><ul class="tags">${unsureList.map(e => `<li>${esc(e.qt)}</li>`).join('')}</ul>` : ''}</section>
<section class="part"><h2>匯出給下一週</h2><p class="note">匯出本週的錯題、不熟的地方和各項能力的統計，最前面附一段指示。把整段貼給 AI，它就能依你的弱項產生第 ${w.n + 1} 週的內容。</p>
<div class="row"><button class="btn pri" type="button" id="exGo">產生匯出內容</button></div><div id="exBox" hidden><div class="row"><button class="btn" type="button" id="exCopy">複製</button><a class="btn" id="exDl" download="後中英文-第${w.n}週.md">下載 .md</a><span class="small mut" id="exMsg"></span></div><textarea id="exTxt" rows="16" readonly></textarea></div></section>`;
  $('#exGo').onclick = () => {
    const md = exportMD(w), ta = $('#exTxt'); ta.value = md; $('#exBox').hidden = false;
    try { $('#exDl').href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' })); } catch (e) { $('#exDl').hidden = true; }
  };
  $('#exCopy').onclick = () => {
    const ta = $('#exTxt'), msg = $('#exMsg');
    const sel = () => { ta.focus(); ta.select(); msg.textContent = '已選取全部，請按 Ctrl+C 複製'; };
    try { navigator.clipboard.writeText(ta.value).then(() => { msg.textContent = '已複製'; }, sel); } catch (e) { sel(); }
  };
}

/* ---- 匯出：本週紀錄＋給下一週 AI 的指示 ---- */
function exportMD(w) {
  const { tr, sk } = weekStats(w), ix = qindex(), u = unsure(), today = REVIEW.dayKey(Date.now());
  const st = REVIEW.state(qlog());
  const wrong = {}; tr.filter(x => !x.ok).forEach(x => { wrong[x.h] = (wrong[x.h] || 0) + 1; });
  const picks = {}; LOG.forEach(e => { if (e.h && !e.ok && e.p != null && REVIEW_KINDS.has(e.k)) (picks[e.h] = picks[e.h] || new Set()).add(e.p); });
  const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const line = h => {
    const f = ix[h], s = st.get([...st.keys()].find(k => k.endsWith('|' + h)) || '') || {}, mark = s.open ? '未掌握' : '已掌握';
    const pk = picks[h] ? `；我選過：${[...picks[h]].join('／')}` : '';
    if (!f) return `- ${h}（${mark}）`;
    if (f.sent) { const stp = f.sent.steps[f.i]; return `- [長句・${SKILLS[stp[5]]}] ${f.sent.chunks.join(' ')}\n  - 步驟：${stp[0]} → 正解：${stp[1]}${pk}（${mark}）`; }
    return `- [${SKILLS[f.q.sk] || f.q.sk}] ${strip(f.q.q)}\n  - 正解：${f.q.o[0]}${pk}（${mark}，錯 ${wrong[h]} 次）`;
  };
  const prevOpen = REVIEW.book(qlog()).open.filter(s => !(s.c || '').startsWith(wkKey(w) + 'd'));
  const wrongWords = Object.keys(wrong).filter(h => /^wr?:/.test(h)).map(h => h.split(':')[2]);
  const unsureL = Object.values(u).filter(Boolean);
  const steps = {}; LOG.filter(e => e.k === 'x' && e.c && e.c.startsWith(wkKey(w) + 'd') && !e.ok && e.n === 1).forEach(e => { steps[e.sk] = (steps[e.sk] || 0) + 1; });
  const skLines = Object.keys(SKILLS).map(k => `| ${k} | ${SKILLS[k]} | ${sk[k].n} | ${sk[k].ok} | ${sk[k].n ? Math.round(100 * sk[k].ok / sk[k].n) + '%' : '—'} | ${SK_ST[skillState(sk[k])]} |`);
  const allWords = WEEKS.flatMap(x => x.words.flat().map(y => y[0]));
  return `# 後中英文 第 ${w.n} 週學習紀錄（匯出日 ${today}）

## 給 AI 的指示：請產生第 ${w.n + 1} 週的訓練內容

我在準備台灣學士後中醫入學考（目標：中國醫藥大學，116 學年度，2027 年 4 月筆試）的英文。英文基礎差，目標是 2027 年 2 月底前達到考試程度。考試題型：字彙、克漏字、閱讀（文章約一半是醫學與生命科學）。我不背罕見字，重點是克漏字、閱讀、文法和學術／醫學常用字。

請依照下面「本週紀錄」的弱項，產生第 ${w.n + 1} 週的兩個資料檔 \`w${String(w.n + 1).padStart(2, '0')}a.js\`、\`w${String(w.n + 1).padStart(2, '0')}b.js\`，格式必須和下面的規格完全一樣（網站會直接載入，格式錯了整頁會壞）。

### 內容要求
1. 每天兩段：早上（10 個新單字＋2 個長句拆解）、晚上（1 個文法重點＋3 題、1 篇文章＋5 題、單字回想自動產生）。共 7 天。
2. **新單字 70 個**：學術與醫學常用字（詞頻約 3000–12000 名），不可與「已學過的單字」重複。每天一個主題。
3. **弱項優先**：「需要加強」的能力，下週至少安排兩天的文法重點或長句練它；「本週沒練到」的能力至少練一次；「穩定」的能力仍要在文章中混著出現。
4. **錯題回收**：「答錯的單字」與「不熟的單字」要在下週的長句或文章裡再出現（當成已學過的字使用，不是新字）。
5. **難度**：比本週稍難一點。文章 180–250 字，句子變長、修飾更多；克漏字與閱讀交替（第 1、3、5、7 天克漏字，第 2、4、6 天閱讀）。題目要有一個明確正解，三個誘答要合理但確定錯。
6. 每一題附 2–3 步的「一步一步來」：每一步是一個小判斷，引導學生自己推出答案，不要直接給答案。
7. 中文用台灣繁體，說明用語要白話；每個文法名詞第一次出現要解釋。

### 資料格式
\`\`\`js
// wNNa.js
WEEKS.push({ n: ${w.n + 1}, theme: '本週主題', days: [] });
WEEKS[${w.n}].words = [   // 7 天 × 10 個
  [['英文', '詞性', '中文', '字根拆解（沒有就空字串）', '例句（必須包含這個字或它的變化形）', '例句中文'], …],
  …
];
WEEKS[${w.n}].sents = [   // 7 天 × 2 句
  [{ chunks: ['片段', …], core: '主幹句', zh: '整句中文',
     steps: [['問題', '正解', '誤1', '誤2', '說明', '能力代碼', { 片段序號: 's' | 'v' | 'm' }], …] }, …],
  …
];
// wNNb.js
WEEKS[${w.n}].gram = [    // 7 天，各 1 個文法重點
  { id: '能力代碼', title: '標題：一句話說重點', body: \`<p>說明 HTML，可用 <span class="ch s|v|m"> 標主詞／動詞／修飾</span></p>\`,
    qs: [{ id: 'g1-1', sk: '能力代碼', q: '題目', o: ['正解', '誤1', '誤2', '誤3'], why: '解析', st: [['問題', '正解', '誤1', '誤2', '說明', '能力代碼'], …] }, …] },
  …
];
WEEKS[${w.n}].passages = [  // 7 天，各 1 篇；克漏字的空格寫 {1}…{5}，題目 q 寫「第 (1) 格」
  { type: 'cloze' | 'read', title: '標題', text: ['段落', …], zh: '全文中文',
    qs: [{ id: 'p1-1', sk: '能力代碼', pre: '（閱讀題才要）題型：要找什麼', q: '題目', o: ['正解', …3 個誤答], why: '解析', st: [[…同上…]] }, …] },
  …
];
\`\`\`
- o 的第一個一定是正解（網站會打亂順序）。題目 id 在同一週內不可重複。
- 能力代碼只能用下表的代碼。

## 本週紀錄

完成：${w.words.map((x, d) => `第${d + 1}天 早${Math.round(100 * frac(amIds(w, d), okSet()))}% 晚${Math.round(100 * frac(pmIds(w, d), okSet()))}%`).join('、')}
作答：${tr.length} 題（每題每天只算第一次），第一次就答對 ${tr.length ? Math.round(100 * tr.filter(x => x.ok).length / tr.length) : 0}%

### 本週的文法重點
${w.gram.map((G, d) => `- 第 ${d + 1} 天：${G.title}（${G.id}）`).join('\n')}

### 各項能力（第一次作答）
| 代碼 | 能力 | 題數 | 答對 | 正確率 | 狀態 |
|---|---|---|---|---|---|
${skLines.join('\n')}

### 需要加強
${Object.keys(SKILLS).filter(k => ['weak', 'mid'].includes(skillState(sk[k]))).map(k => `- ${k} ${SKILLS[k]}：${sk[k].ok}/${sk[k].n}`).join('\n') || '- （沒有低於八成的能力，或題數不足）'}
${Object.keys(steps).length ? `\n「一步一步來」中第一次就選錯的步驟：${Object.entries(steps).map(([k, n]) => `${SKILLS[k] || k} ${n} 次`).join('、')}\n` : ''}
### 答錯的題目
${Object.keys(wrong).map(line).join('\n') || '- （沒有）'}
${prevOpen.length ? `\n### 之前幾週還沒掌握的錯題\n${prevOpen.map(s => line(s.h)).join('\n')}\n` : ''}
### 答錯的單字
${[...new Set(wrongWords)].join(', ') || '（沒有）'}

### 我標記「不熟」的地方
${unsureL.map(e => `- ${e.qt}`).join('\n') || '- （沒有）'}

### 已學過的單字（下週不要再當新字）
${allWords.join(', ')}
`;
}

// 給學習階梯首頁的摘要（首頁沒有英文的題目資料，只讀這份）
function saveSummary() {
  const w = curWeek(), ok = okSet(), nx = nextSlot(w, ok), { sk } = weekStats(w);
  store.set('sum', { n: w.n, theme: w.theme, weeks: WEEKS.length, slots: w.words.map((x, d) => [frac(amIds(w, d), ok), frac(pmIds(w, d), ok)]),
    next: nx, due: REVIEW.book(qlog()).due.length, weak: Object.keys(SKILLS).filter(k => skillState(sk[k]) === 'weak').map(k => SKILLS[k]), t: Date.now() });
}
/* ---- 路由 ---- */
function route() {
  const h = location.hash.slice(1), w = curWeek(), m = h.match(/^d([1-7])(am|pm)$/);
  if (m) { const d = +m[1] - 1; if (m[2] === 'am') renderAM(w, d); else renderPM(w, d); }
  else if (h === 'review') renderReview();
  else if (h === 'report') renderReport();
  else renderHome();
  $('#wkTag').textContent = `第 ${w.n} 週`;
  saveSummary();
  window.scrollTo(0, 0);
}
function boot() { addEventListener('hashchange', route); route(); }
