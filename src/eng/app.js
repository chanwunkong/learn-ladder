/* ---------- 後中英文：每天早上／晚上兩段、錯題複習、週報、匯出 ----------
   紀錄每一筆：{ t, c 第幾週第幾天哪一段（w1d3am）, k 種類, h 題目識別碼, sk 能力, ok, n 第幾次作答, p 選了什麼, qt 題目摘要 }
   k：w 單字、wr 單字回想、s 長句的一步、g 文法題、p 文章題（進錯題本）；x 一步一步來的小步驟；u 標記「不熟」（p 1 標記、-1 取消）。 */
const LOG = store.get('log', []);
const REVIEW_KINDS = new Set(['w', 'wr', 's', 'g', 'p']);
// 全部錯題的提前練習：在那一區點擊時不記錄（noLog 在捕獲階段先設好，點擊處理完就恢復）
let NOLOG = false;
const noLog = el => el.addEventListener('click', () => { NOLOG = true; setTimeout(() => { NOLOG = false; }); }, true);
function logAnswer(e) {
  if (NOLOG) return;
  LOG.push({ t: Date.now(), ...e }); if (LOG.length > 20000) LOG.splice(0, LOG.length - 20000);
  store.set('log', LOG); if (typeof CLOUD !== 'undefined' && CLOUD.pushLog) CLOUD.pushLog();
  setTimeout(() => { if (typeof refreshParts === 'function') refreshParts(); }, 0);
}
const qlog = () => REVIEW.live(LOG).filter(e => REVIEW_KINDS.has(e.k) || e.k === 'fu');   // fu：答對後的追問（追問答錯 → 那次算猜對）
const okSet = () => new Set(LOG.filter(e => e.ok && e.h).map(e => e.h));
// 每題「第一次作答」是否答對（只看最早的 n === 1）：回到頁面時決定顯示「已答對」還是「第一次答錯，再做一次」
// 用錯題排程的「每天第一次作答」（已把追問答錯的猜對算成答錯），取每題最早的一次
const firstOk = () => { const m = new Map(); REVIEW.trials(qlog()).forEach(t => { if (!m.has(t.h)) m.set(t.h, t.ok); }); return m; };
const unsure = () => { const m = {}; LOG.forEach(e => { if (e.k === 'u') m[e.h] = e.p === 1 ? e : null; }); return m; };
const DAYN = '一二三四五六日';

/* ---- 題目索引：每週的每一題都有固定識別碼，錯題本靠它找回題目 ---- */
const wkKey = w => 'w' + w.n;
const dayPass = (w, d) => [].concat(w.passages[d] || []);
// 字義題的誤答（2026-11-07 修正混淆）：從所有週的單字挑詞性相同、中文不重疊的字，先挑別天的（同一天主題相近，容易是近義字）
const zhBi = z => { const t = String(z).replace(/[的地]/g, '').split(/[、，；;,／/（）()\s]+/).filter(Boolean), b = new Set(); t.forEach(x => { for (let k = 0; k + 1 < x.length; k++) b.add(x.slice(k, k + 2)); if (x.length === 1) b.add(x); }); return b; };
const zhClash = (a, b) => { const A = zhBi(a); for (const x of zhBi(b)) if (A.has(x)) return true; return false; };
const posOf = p => String(p).split(/[\s/（]/)[0];
function wordFoils(w, d, x) {
  const seen = new Set([x[0]]), pool = [];
  WEEKS.forEach(W => W.words.forEach((day, dd) => day.forEach(y => { if (!seen.has(y[0])) { seen.add(y[0]); pool.push({ y, near: W === w && dd === d }); } })));
  const ok = pool.filter(p => posOf(p.y[1]) === posOf(x[1]) && !zhClash(p.y[2], x[2]));
  const many = z => /[、；]/.test(z);   // 一個意思還是好幾個：盡量和正解同一種，不能靠「只有它寫一個詞」猜答案
  const rank = p => (p.near ? 2 : 0) * 2 ** 32 + (many(p.y[2]) === many(x[2]) ? 0 : 1) * 2 ** 32 + hash(x[0] + '|' + p.y[0]);
  const pick = [];
  const fill = list => { for (const p of list.sort((a, b) => rank(a) - rank(b))) if (pick.length < 3 && !pick.includes(p.y) && !pick.some(q => zhClash(q[2], p.y[2]))) pick.push(p.y); };
  fill(ok); fill(pool.filter(p => !zhClash(p.y[2], x[2])));   // 同詞性的字不夠（例如連接詞）→ 用其他詞性補
  return pick;
}
function wordQ(w, d, i) {
  const x = w.words[d][i], others = wordFoils(w, d, x);
  return { h: `w:${wkKey(w)}:${x[0]}`, k: 'w', sk: 'v.mean', c: `${wkKey(w)}d${d + 1}am`, en: 1,
    q: `<span class="enw">${esc(x[0])}</span>${sayBtn(x[0])} <span class="pos">${esc(x[1])}</span> 的意思是？`, o: [x[2], ...others.map(y => y[2])], ow: [x[0], ...others.map(y => y[0])],
    why: `${esc(x[0])}：${esc(x[2])}。${x[3] ? `<br><span class="mut">${esc(x[3])}</span>` : ''}${x[4] ? `<br><span class="ens">${esc(x[4])}</span> ${sayBtn(x[4], '朗讀例句')}<br><span class="mut">${esc(x[5] || '')}</span>` : ''}`, qt: x[0] };
}
// 晚上的回想：把早上例句裡的單字挖空
function stemRe(word) { const s = word.length > 5 ? word.replace(/(e|y|ate|ize)$/, '') : word; return new RegExp(`\\b${s}\\w*`, 'i'); }
function recallQ(w, d, i) {
  const day = w.words[d], x = day[i], others = [2, 5, 7].map(k => day[(i + k) % day.length]);
  const examples = Array.isArray(x[6]) && x[6].length ? x[6] : [[x[4], x[5]]];
  const example = examples[Math.floor(Math.random() * examples.length)];
  const sent = esc(example[0]).replace(stemRe(x[0]), '<span class="gap">＿＿＿＿</span>');
  return { h: `wr:${wkKey(w)}:${x[0]}`, k: 'wr', sk: 'v.mean', c: `${wkKey(w)}d${d + 1}pm`, en: 1,
    q: `<span class="ens">${sent}</span><br><small class="mut">選項是原形，句中可能有變化。</small>`, o: [x[0], ...others.map(y => y[0])], hint: example[1],
    why: `${esc(example[0])} ${sayBtn(example[0], '朗讀例句')}<br><span class="mut">${esc(example[1])}</span><br><b>${esc(x[0])}</b> ${esc(x[1])}：${esc(x[2])}${x[3] ? `<br><span class="mut">${esc(x[3])}</span>` : ''}`, qt: x[0] };
}
const gramQ = (w, d, q) => ({ ...q, h: `g:${wkKey(w)}:${q.id}`, k: 'g', c: `${wkKey(w)}d${d + 1}pm`, en: 1, qt: q.q.replace(/<[^>]+>/g, '').slice(0, 60) });
const passQ = (w, d, q, P = dayPass(w, d).find(p => p.qs.includes(q))) => ({ ...q, h: `p:${wkKey(w)}:${q.id}`, k: 'p', c: `${wkKey(w)}d${d + 1}pm`, en: 1, qt: `${P.title}・${q.q}`.slice(0, 80) });
const sentH = (w, d, j, i) => `s:${wkKey(w)}:${d}:${j}:${i}`;
let QIX = null;
function qindex() {
  if (QIX) return QIX; QIX = {};
  WEEKS.forEach(w => w.words.forEach((day, d) => {
    day.forEach((x, i) => { const a = wordQ(w, d, i), b = recallQ(w, d, i); QIX[a.h] = { q: a, w, d }; QIX[b.h] = { q: b, w, d }; });
    (w.sents[d] || []).forEach((s, j) => s.steps.forEach((st, i) => { QIX[sentH(w, d, j, i)] = { sent: s, w, d, j, i, sk: st[5] }; }));
    if (w.gram[d]) w.gram[d].qs.forEach(q => { const g = gramQ(w, d, q); QIX[g.h] = { q: g, w, d }; });
    dayPass(w, d).forEach(P => P.qs.forEach(q => { const p = passQ(w, d, q, P); QIX[p.h] = { q: p, w, d }; }));
  }));
  return QIX;
}
// 每一段要完成的題目
const amIds = (w, d) => [...w.words[d].map((x, i) => wordQ(w, d, i).h), ...(w.sents[d] || []).flatMap((s, j) => s.steps.map((st, i) => sentH(w, d, j, i)))];
const pmIds = (w, d) => [...w.gram[d].qs.map(q => gramQ(w, d, q).h), ...dayPass(w, d).flatMap(P => P.qs.map(q => passQ(w, d, q, P).h)), ...w.words[d].map((x, i) => recallQ(w, d, i).h)];
const frac = (ids, ok) => ids.filter(h => ok.has(h)).length / ids.length;

/* ---- 選擇題：答錯可以再選；「一步一步來」把題目拆成小判斷 ---- */
function mcq(q, num) {
  const ord = shuffled(q.o.length, q.h + Math.random());   // 每次打開都重新打亂，複習時不能靠記位置
  return `<div class="q" data-h="${esc(q.h)}">${num ? `<p class="qnum">${num}</p>` : ''}<p class="qt">${q.q}</p>${q.hint ? `<p class="hintrow"><button class="btn sm ghost" type="button" data-hint>看中文提示</button><span class="hintz" hidden>${esc(q.hint)}</span></p>` : ''}<div class="opts">${ord.map(j => `<button class="opt${q.en ? ' en-o' : ''}" type="button" data-o="${j}">${esc(q.o[j])}</button>`).join('')}</div><div class="why" hidden></div></div>`;
}
// 「重新練習這一段」：記一筆 k:'reset'（c 為這一段），畫面只看這之後的作答；選「之前的不算」時加上 v（這一段的題目），錯題本、週報就不算之前的作答
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
const plain = h => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 48);
// 晚上的回想題：打開早上的單字卡後作答，記成 pk（看過卡片）
let PEEKED = false;
function bindMcq(root, list, onDone, restore = true) {
  const views = {}, V = c => views[c] || (views[c] = viewOf(c));
  list.forEach(q => {
    const qe = root.querySelector(`.q[data-h="${CSS.escape(q.h)}"]`); if (!qe) return;
    let n = 0; const why = $('.why', qe);
    const hb = $('[data-hint]', qe);
    if (hb) hb.onclick = () => { hb.hidden = true; $('.hintz', qe).hidden = false; logAnswer({ c: q.c, k: 'hint', h: q.h, qt: q.qt }); };
    const v = restore ? V(q.c) : null;
    if (v && v.ok.has(q.h) && v.f1.get(q.h) === false) {   // 第一次答錯：收成一行，點開可以重新作答，不標出上次選的選項
      collapse(qe, false, plain(q.q));
    } else if (v && v.ok.has(q.h)) {   // 第一次就答對：收成一行，點開看答案與解析
      collapse(qe, true, plain(q.q));
      $$('.opt', qe).forEach(x => { x.disabled = true; if (x.dataset.o === '0') x.classList.add('right'); });
      if (hb) hb.parentNode.hidden = true;
      why.hidden = false; why.className = 'why ok'; why.innerHTML = `<b>已完成。</b>${q.why}`; qe.classList.add('done'); showOw(qe, q);
      if (onDone) onDone(q); return;
    }
    if (q.st && q.st.length) guide(qe, q);
    $$('.opt', qe).forEach(b => { b.onclick = () => {
      const ok = b.dataset.o === '0'; n++;
      logAnswer({ c: q.c, k: q.k, h: q.h, sk: q.sk, ok, n, p: q.o[+b.dataset.o], qt: q.qt, ...(q.k === 'wr' && PEEKED ? { pk: 1 } : {}) });
      b.classList.add(ok ? 'right' : 'wrong'); b.disabled = true; why.hidden = false;
      if (ok) {
        $$('.opt', qe).forEach(x => { x.disabled = true; }); const g = $('.guide', qe); if (g) g.hidden = true;
        const fin = (fok, st) => { why.className = 'why ok'; why.innerHTML = `${st && !fok ? `<b>這次先當成猜對</b>：理由是「${esc(st[1])}」，${esc(st[4])} 已排進錯題本。<br>` : st ? '<b>理由也對，這題算會了。</b>' : REVIEW.okHead(n)}${q.why}${q.rv ? `<br><small>${REVIEW.after(q.rv, n === 1 && fok !== false, fok === false)}</small>` : ''}`; showOw(qe, q); };
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
// 字義題選對後，每個選項旁標出它是哪個英文字：選錯的中文也順便認識對應的字
function showOw(qe, q) {
  if (!q.ow) return;
  $$('.opt', qe).forEach(b => { if (!$('.ow', b)) b.insertAdjacentHTML('beforeend', ` <span class="ow">${esc(q.ow[+b.dataset.o])}</span>`); });
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
  return `<div class="card sentc" data-sent="${key}"><div class="sent">${s.chunks.map((c, i) => `<span class="ch" data-i="${i}">${esc(c)}</span> `).join('')}${sayBtn(s.chunks.join(' '), '朗讀句子')}</div>
<p class="legend"><span class="ls">主詞</span><span class="lv">主要動詞</span><span class="lm">修飾（第一遍可以跳過）</span></p><div class="sbody"></div></div>`;
}
function bindSent(root, w, d, j, s, onDone, key = `${d}:${j}`, restore = true) {
  const card = root.querySelector(`[data-sent="${key}"]`), body = $('.sbody', card), c = `${wkKey(w)}d${d + 1}am`, done = [];
  const mark = m => Object.entries(m || {}).forEach(([i, v]) => { const e = card.querySelector(`.ch[data-i="${i}"]`); if (e) { e.classList.remove('s', 'v', 'm'); e.classList.add(v); } });
  const finish = () => {
    s.steps.forEach(st => mark(st[6]));
    body.innerHTML = `${done.length ? `<ol class="gdone">${done.join('')}</ol>` : ''}<p class="core"><span class="lbl">主幹</span>${esc(s.core)} ${sayBtn(s.core)}</p><p class="zh">${esc(s.zh)}</p><div class="row">${unsureBtn(`u:sent:${wkKey(w)}:${d}:${j}`, c, s.core)}</div>`;
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
  if (restore) {
    const v = viewOf(c), hs = s.steps.map((st, i) => sentH(w, d, j, i));
    if (hs.every(h => v.ok.has(h))) {
      const first = hs.every(h => v.f1.get(h) !== false);
      collapse(card, first, s.core);
      if (first) return finish();
    }
  }
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
    const n = w.words[d].length, ps = dayPass(w, d), kinds = [...new Set(ps.map(P => P.type === 'cloze' ? '克漏字' : '閱讀'))];
    const what = s === 'am' ? `錯題複習・${n} 個新單字・2 個長句` : `文法：${w.gram[d].title.split('：')[0]}・${kinds.join('＋')}・單字回想`;
    const mins = s === 'am' ? Math.round(15 + n * 1.5) : ps.length > 1 ? 45 : 30;
    return `<a class="slot${f >= 1 ? ' fin' : ''}${cur ? ' cur' : ''}" href="#d${d + 1}${s}"><span class="sl-h">${s === 'am' ? '早上' : '晚上'}<small>約 ${mins} 分鐘</small></span><span class="sl-w">${what}</span>${bar(f)}<span class="sl-st">${f >= 1 ? '✓ 完成' : f > 0 ? `${Math.round(100 * f)}%` : cur ? '從這裡開始 →' : ''}</span></a>`;
  };
  const n = w.words[0].length, pm = dayPass(w, 0).length > 1 ? 45 : 30, am = Math.round(15 + n * 1.5);
  $('#main').innerHTML = `<p class="eyebrow">第 ${w.n} 週 · 每天約 ${am + pm} 分鐘</p><h1>${esc(w.theme)}</h1>
<p class="lede">每天分成早上與晚上兩段。早上先複習到期的錯題，再學 ${n} 個新單字和 2 個長句；晚上學一個文法重點，完成當天的${[...new Set(dayPass(w, 0).map(P => P.type === 'cloze' ? '克漏字' : '閱讀'))].join('＋')}，最後回想早上的單字。答錯的題目會自動排進之後的複習。</p>
${due ? `<p class="duebar"><a href="#review">錯題本有 <b>${due}</b> 題今天到期 →</a></p>` : ''}
<ol class="days">${w.words.map((x, d) => `<li class="day${nx && nx.d === d ? ' now' : ''}"><h2>第 ${d + 1} 天<small>${esc(w.gram[d].title.split('：')[0])}</small></h2><div class="slots">${slot(d, 'am')}${slot(d, 'pm')}</div></li>`).join('')}</ol>
<div class="row endrow"><a class="btn pri" href="#report">本週報告與匯出</a><a class="btn" href="#review">錯題本</a>${(n => n ? `<a class="btn" href="#cards">單字卡複習（${n} 個字）</a>` : '')(reviewWords().look.length)}</div>
${WEEKS.length > 1 ? `<p class="small">其他週：${WEEKS.map((x, i) => `<button class="btn sm" type="button" data-wk="${i}">第 ${x.n} 週</button>`).join(' ')}</p>` : ''}`;
  $$('[data-wk]').forEach(b => { b.onclick = () => { store.set('week', +b.dataset.wk); renderHome(); }; });
}
function dayHead(w, d, s) {
  const prev = s === 'pm' ? `#d${d + 1}am` : d ? `#d${d}pm` : '', next = s === 'am' ? `#d${d + 1}pm` : d < 6 ? `#d${d + 2}am` : '#report';
  return `<p class="eyebrow">第 ${w.n} 週・第 ${d + 1} 天・${s === 'am' ? '早上' : '晚上'}</p>
<nav class="pn">${prev ? `<a href="${prev}">‹ 上一段</a>` : ''}<a href="#">本週</a><a href="${next}">${s === 'pm' && d === 6 ? '本週報告' : '下一段'} ›</a></nav>`;
}
// 頁首（捲動時固定在最上面）顯示這一頁完成幾題；在已作答的題目之前、還沒作答的標成「跳過」，頁首的按鈕跳到第一個（2026-11-07 使用者要求：只顯示在頁首）
const itemDone = e => e.classList.contains('done') || e.classList.contains('prev') || (e.classList.contains('sentc') && !!e.querySelector('.core'));
function refreshParts() {
  const all = $$('.q[data-h], .sentc', $('#main')).filter(e => !e.closest('.sheet, .practice'));   // 提前練習的題目不算本頁題數
  const last = all.map(itemDone).lastIndexOf(true), skip = all.filter((e, k) => k < last && !itemDone(e)), n = all.filter(itemDone).length;
  all.forEach(e => e.classList.toggle('skipped', skip.includes(e)));
  $('#pgTag').innerHTML = all.length ? `${n === all.length ? '✓ ' : ''}本頁 ${n} / ${all.length} 題${skip.length ? `<button type="button" class="linkb skipb" id="pgSkip">跳過 ${skip.length} 題 ↓</button>` : ''}` : '';
  const sb = $('#pgSkip'); if (sb) sb.onclick = () => skip[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function resetBox(c) {
  const box = $('#rsBox'); if (!box) return;
  box.innerHTML = '<button class="btn sm ghost" type="button" data-rs>重新練習這一段</button>';
  $('[data-rs]', box).onclick = () => {
    box.innerHTML = REVIEW.resetAsk('這一段');
    const go = v => { logAnswer({ c, k: 'reset', h: `reset:${c}`, qt: '重新練習這一段', ...(v ? { v: [...new Set(LOG.filter(e => e.c === c && e.h && e.k !== 'reset').map(e => e.h))] } : {}) }); route(); };
    $('[data-y]', box).onclick = () => go(false);
    $('[data-v]', box).onclick = () => go(true);
    $('[data-n]', box).onclick = () => resetBox(c);
  };
}
// 單字卡：早上的頁面（可標「不熟」）與晚上的面板共用
function wordCards(w, d, withUnsure) { return w.words[d].map(x => wordCard(w, d, x, withUnsure)).join(''); }
// head：卡片最上面的小標（單字卡複習頁標出第幾週第幾天、下次複習日）
function wordCard(w, d, x, withUnsure, head = '', foot = '') {
  const c = `${wkKey(w)}d${d + 1}am`;
  return `<article class="wcard">${head}<p class="wh"><span class="enw">${esc(x[0])}</span>${sayBtn(x[0])}<span class="pos">${esc(x[1])}</span><span class="wz">${esc(x[2])}</span></p>${x[3] ? `<p class="root">${esc(x[3])}</p>` : ''}<p class="ens">${esc(x[4])} ${sayBtn(x[4], '朗讀例句')}</p><p class="zh">${esc(x[5])}</p>${withUnsure ? unsureBtn(`u:word:${wkKey(w)}:${x[0]}`, c, `${x[0]}（${x[2]}）`) : ''}${foot}</article>`;
}

/* ---- 單字卡複習：錯題本裡還沒掌握的單字（字義題、回想題答錯）＋標記「還不太懂」的字；只看卡片，不考試（2026-11-09 使用者要求）
   「記住了」只影響這一頁（k:'known'，p 1 記住、-1 取消，以最後一筆為準），不影響錯題排程；之後又答錯或又標不熟，就自動回到「要看」。 */
const WHY = { w: '字義答錯', wr: '回想答錯', u: '標記不熟' };
function reviewWords() {
  const byKey = {}, out = new Map(), lastBad = {}, known = {};
  WEEKS.forEach(w => w.words.forEach((day, d) => day.forEach(x => { byKey[`${wkKey(w)}:${x[0]}`] = { w, d, x }; })));
  const add = (k, due, why) => { const e = byKey[k]; if (!e) return; const o = out.get(k) || out.set(k, { ...e, key: k, due, why: new Set() }).get(k); o.due = Math.min(o.due, due); o.why.add(why); };
  REVIEW.book(qlog()).open.forEach(s => { const m = /^(wr?):(w\d+:.+)$/.exec(s.h || ''); if (m) add(m[2], s.due, m[1]); });
  Object.entries(unsure()).forEach(([k, e]) => { const m = /^u:word:(w\d+:.+)$/.exec(k); if (e && m) { add(m[1], Infinity, 'u'); lastBad[m[1]] = Math.max(lastBad[m[1]] || 0, e.t); } });   // 只標了不熟、沒答錯的排最後
  REVIEW.trials(qlog()).forEach(t => { const m = /^wr?:(w\d+:.+)$/.exec(t.h || ''); if (m && !t.ok) lastBad[m[1]] = Math.max(lastBad[m[1]] || 0, t.t); });
  LOG.forEach(e => { if (e.k === 'known') known[e.h.slice(6)] = e.p === 1 ? e.t : 0; });
  Object.keys(known).forEach(k => { if (known[k] && !out.has(k)) add(k, Infinity, 'u'); });   // 只標了不熟、按記住了（不熟已取消）的字，留在「已記住」
  const all = [...out.values()].sort((a, b) => a.due - b.due || a.w.n - b.w.n || a.d - b.d);
  const isKnown = e => known[e.key] > (lastBad[e.key] || 0);
  return { look: all.filter(e => !isKnown(e)), known: all.filter(isKnown) };
}
function renderCards() {
  const { look, known } = reviewWords(), md = t => { const k = REVIEW.dayKey(t); return `${+k.slice(5, 7)}/${+k.slice(8)}`; }, today = REVIEW.dayStart(Date.now()), cover = store.get('cover', true);
  const when = e => (e.due === Infinity ? '' : e.due <= today ? '・今天要複習' : `・${md(e.due)} 複習`);
  $('#main').innerHTML = `<p class="eyebrow">錯題本</p><h1>單字卡複習</h1>
<p class="lede">要看 <b>${look.length}</b> 個字・已記住 <b>${known.length}</b> 個</p>
<p class="row"><button class="btn sm" type="button" id="cover" aria-pressed="${cover}">${cover ? '✓ 遮住中文（點卡片看答案）' : '遮住中文'}</button></p>
${look.length ? `<div class="words${cover ? ' hidezh' : ''}" id="cardsBox">${look.map(e => wordCard(e.w, e.d, e.x, false, `<p class="qsrc">第 ${e.w.n} 週第 ${e.d + 1} 天・${[...e.why].map(k => WHY[k]).join('、')}${when(e)}</p>`, `<button class="btn sm known" type="button" data-known="${esc(e.key)}">記住了 ✓</button>`)).join('')}</div>` : `<p class="note">${known.length ? '全部都記住了。之後又答錯的字會回到這裡。' : '目前沒有答錯或標記不熟的單字。'}</p>`}
${known.length ? `<details class="more knownl"><summary>已記住（${known.length} 個）</summary>${known.map(e => `<p class="krow"><span class="enw">${esc(e.x[0])}</span> <span class="mut">${esc(e.x[2])}</span><button class="linkb" type="button" data-unknown="${esc(e.key)}">取消記住</button></p>`).join('')}</details>` : ''}
<div class="row endrow"><a class="btn" href="#review">錯題本</a><a class="btn" href="#">回到本週</a></div>`;
  $('#cover').onclick = () => { store.set('cover', !cover); renderCards(); };
  $$('#cardsBox .wcard').forEach(c => { c.onclick = e => { if (!e.target.closest('button')) c.classList.add('show'); }; });   // 遮住中文時，點卡片顯示
  const mark = (key, p) => { logAnswer({ c: 'cards', k: 'known', h: `known:${key}`, p, qt: key.split(':')[1] }); renderCards(); };
  $$('[data-known]').forEach(b => { b.onclick = () => {
    const key = b.dataset.known, u = unsure()[`u:word:${key}`];
    if (u) logAnswer({ c: u.c, k: 'u', h: `u:word:${key}`, p: -1, qt: u.qt });   // 記住了＝取消「還不太懂」，不用回早上那頁再按
    mark(key, 1);
  }; });
  $$('[data-unknown]').forEach(b => { b.onclick = () => mark(b.dataset.unknown, -1); });
}
function renderAM(w, d) {
  const words = w.words[d], wq = words.map((x, i) => wordQ(w, d, i)), c = `${wkKey(w)}d${d + 1}am`, due = REVIEW.book(qlog()).due.length;
  $('#main').innerHTML = `${dayHead(w, d, 'am')}<h1>早上：單字與長句</h1><div class="resetbox" id="rsBox"></div>
<section class="part"><h2>1. 錯題複習<small>約 5–10 分鐘</small></h2>${due ? `<a class="btn pri rvgo" href="#review" data-back="#d${d + 1}am">今天到期 ${due} 題，先去錯題本複習 →</a><p class="note">做完會有按鈕回到這裡。</p>` : '<p class="note">今天沒有到期的錯題。</p>'}</section>
<section class="part" data-part="單字"><h2>2. 新單字<small>約 10 分鐘</small></h2><p class="note">先看字根拆解和例句，大聲唸一次例句。不熟的按「？還不太懂」，匯出時會列給下一週。</p>
<div class="words">${wordCards(w, d, true)}</div>

<h3>小測驗：選出意思</h3><div id="wq">${wq.map((q, i) => mcq(q, `${i + 1} / ${wq.length}`)).join('')}</div></section>
<section class="part" data-part="長句"><h2>3. 長句拆解<small>約 10 分鐘</small></h2><p class="note">先找主要動詞，再找主詞，其他部分都是修飾。每一步答對，句子上會標出來。</p>${w.sents[d].map((s, j) => sentHTML(w, d, j, s)).join('')}</section>
<div class="row endrow"><a class="btn pri" href="#d${d + 1}pm">晚上的部分 ›</a></div>`;
  const upd = () => refreshParts();
  $$('.rvgo').forEach(a => { a.onclick = () => store.set('rvBack', a.dataset.back); });
  bindUnsure($('#main')); bindMcq($('#wq'), wq, upd); w.sents[d].forEach((s, j) => bindSent($('#main'), w, d, j, s, upd)); upd(); resetBox(c);
}
function passageHTML(w, d, P, k = 0) {
  const blank = t => esc(t).replace(/\{(\d)\}/g, (m, n) => `<span class="blank" data-b="${n}">(${n}) ＿＿＿＿</span>`);
  const pq = P.qs.map(q => passQ(w, d, q, P)), pid = `pq${k}`;
  const text = `<div class="passage card"><p class="ptitle">${esc(P.title)}</p>${P.text.map(t => `<p class="ens">${blank(t)} ${sayEl('p')}</p>`).join('')}<details><summary>中文翻譯（做完再看）</summary><p class="zh">${esc(P.zh)}</p></details></div>`;
  if (P.type === 'cloze') return `<div class="passage-part" data-passage="${k}"><p class="note">克漏字：每格先看前後文是什麼關係（同方向、相反、因果），再看空格要什麼詞性。</p>${text}<div id="${pid}">${pq.map((q, i) => mcq(q, `第 ${i + 1} 格`)).join('')}</div></div>`;
  return `<p class="note">閱讀：先看題目知道要找什麼，再讀文章，最後回答。</p>
<div class="passage-part" data-passage="${k}"><div class="card pre"><p class="lbl">先看題目</p><ol>${P.qs.map(q => `<li><span class="ens">${esc(q.q)}</span>${sayBtn(q.q.replace(/_+/g, ' blank '), '朗讀題目')}</li>`).join('')}</ol></div>${text}<div id="${pid}">${pq.map((q, i) => mcq(q, `第 ${i + 1} 題`)).join('')}</div></div>`;
}
function renderPM(w, d) {
  const G = w.gram[d], Ps = dayPass(w, d), c = `${wkKey(w)}d${d + 1}pm`, n = w.words[d].length;
  const gq = G.qs.map(q => gramQ(w, d, q)), pqs = Ps.map((P, k) => P.qs.map(q => passQ(w, d, q, P))), rq = w.words[d].map((x, i) => recallQ(w, d, i));
  $('#main').innerHTML = `${dayHead(w, d, 'pm')}<h1>晚上：文法與文章</h1><div class="resetbox" id="rsBox"></div>
<section class="part" data-part="文法"><h2>1. 文法重點<small>約 10 分鐘</small></h2><div class="card lesson"><h3>${esc(G.title)}</h3>${G.body}<p class="lbl">這一課練的能力：${esc(SKILLS[G.id] || G.id)}</p><div class="row">${unsureBtn(`u:gram:${wkKey(w)}:${d}`, c, G.title)}</div></div>
<div id="gq">${gq.map((q, i) => mcq(q, `${i + 1} / ${gq.length}`)).join('')}</div></section>
${Ps.map((P, k) => `<section class="part" data-part="${P.type === 'cloze' ? '克漏字' : '閱讀'}"><h2>${k + 2}. ${P.type === 'cloze' ? '克漏字' : '閱讀測驗'}<small>約 ${Ps.length > 1 ? 15 : 12} 分鐘</small></h2>${passageHTML(w, d, P, k)}<div class="row">${unsureBtn(k === 0 ? `u:pass:${wkKey(w)}:${d}` : `u:pass:${wkKey(w)}:${d}:${k}`, c, P.title)}</div></section>`).join('')}
<section class="part" data-part="回想" id="rqPart"><h2>${Ps.length + 2}. 單字回想<small>約 5 分鐘</small></h2><p class="note">早上的 ${n} 個字放回例句裡。先自己想；真的想不起來，按畫面下方的「早上的 ${n} 個字」打開卡片（會記錄，週報會把這些字列為還不熟）。</p><div id="rq">${rq.map((q, i) => mcq(q, `${i + 1} / ${rq.length}`)).join('')}</div></section>
<button class="btn pri peekbtn" type="button" id="peekBtn" hidden>早上的 ${n} 個字</button>
<div class="sheet" id="peek" hidden role="dialog" aria-label="早上的 ${n} 個字"><div class="sheet-h"><b>早上的 ${n} 個字</b><button class="btn sm" type="button" id="peekX">關閉</button></div><div class="words">${wordCards(w, d, false)}</div></div>
<div class="row endrow"><a class="btn pri" href="${d < 6 ? `#d${d + 2}am` : '#report'}">${d < 6 ? '明天早上 ›' : '本週報告 ›'}</a><a class="btn" href="#">本週</a></div>`;
  const upd = q => {
    refreshParts();
    if (q) Ps.forEach((P, k) => { if (P.type !== 'cloze') return; const n0 = P.qs.findIndex(x => passQ(w, d, x, P).h === q.h) + 1, b = $(`.blank[data-b="${n0}"]`, $(`[data-passage="${k}"]`)); if (n0 && b) { b.textContent = `(${n0}) ${q.o[0]}`; b.classList.add('fill'); } });
  };
  PEEKED = false;
  $('#peekBtn').onclick = () => { $('#peek').hidden = false; $('#peekBtn').hidden = true; if (!PEEKED) { PEEKED = true; logAnswer({ c, k: 'peek', h: `peek:${c}`, qt: '回想時打開早上的單字卡' }); } };
  // 浮動按鈕只在「單字回想」這一段出現在畫面上時顯示
  let inRq = false;
  $('#peekX').onclick = () => { $('#peek').hidden = true; $('#peekBtn').hidden = !inRq; };
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { inRq = es[0].isIntersecting; if ($('#peek').hidden) $('#peekBtn').hidden = !inRq; }).observe($('#rqPart'));
  bindUnsure($('#main')); bindMcq($('#gq'), gq, upd); Ps.forEach((P, k) => bindMcq($(`#pq${k}`), pqs[k], upd)); bindMcq($('#rq'), rq, upd); upd(); resetBox(c);
}

/* ---- 錯題複習 ---- */
function reviewItems(max = 50) {
  const ix = qindex(), seen = new Set(), out = [];
  for (const s of REVIEW.book(qlog()).due) {
    const f = ix[s.h]; if (!f) continue;
    if (f.sent) { const key = `sent:${f.w.n}:${f.d}:${f.j}`; if (seen.has(key)) continue; seen.add(key); out.push({ sent: f, s }); }
    else out.push({ q: { ...f.q, rv: s }, f, s });
    if (out.length >= max) break;
  }
  return out;
}
// grouped：「之後到期」的同一天一組，同一篇文章只放一次全文（2026-11-08：只顯示「第 (3) 格」看不出是哪一篇）
// 長句的 key 帶週次與前綴，同一頁有不同週、或今天與之後的同一句時不會撞在一起
function reviewHTML(items, grouped = false, pre = 'r') {
  const shown = new Set();
  return items.map((it, n) => {
    if (it.sent) { const f = it.sent; return `<div class="rv-sent"><p class="qsrc">第 ${f.w.n} 週第 ${f.d + 1} 天・長句・${REVIEW.label(it.s)}</p>${sentHTML(f.w, f.d, f.j, f.w.sents[f.d][f.j], `${pre}${f.w.n}-${f.d}:${f.j}`)}</div>`; }
    const q = it.q, f = it.f; let ctx = '';
    if (q.k === 'p') {
      const P = dayPass(f.w, f.d).find(p => p.qs.some(x => passQ(f.w, f.d, x, p).h === q.h)), n0 = P.qs.findIndex(x => passQ(f.w, f.d, x, P).h === q.h) + 1, pk = `${f.w.n}:${f.d}:${P.title}`;
      if (grouped) {
        if (!shown.has(pk)) { shown.add(pk);
          ctx = `<div class="passage card"><p class="ptitle">${esc(P.title)}</p>${P.text.map(t => `<p class="ens">${esc(t).replace(/\{(\d)\}/g, (m, k) => `<span class="blank">(${k}) ＿＿＿＿</span>`)}</p>`).join('')}</div>`; }
      } else if (P.type === 'cloze') {
        const para = P.text.find(t => t.includes(`{${n0}}`)) || '';
        ctx = `<p class="ens ctx">${esc(para).replace(/\{(\d)\}/g, (m, k) => (+k === n0 ? `<span class="blank">(${k}) ＿＿＿＿</span>` : esc(P.qs[k - 1].o[0])))}</p>`;
      } else ctx = `<details class="ctx"><summary>文章：${esc(P.title)}</summary>${P.text.map(t => `<p class="ens">${esc(t)} ${sayBtn(t)}</p>`).join('')}</details>`;
    }
    const src = `<p class="qsrc">第 ${f.w.n} 週第 ${f.d + 1} 天・${{ w: '單字', wr: '單字回想', g: '文法', p: '文章' }[q.k]}・${esc(SKILLS[q.sk] || '')}・${REVIEW.label(it.s)}</p>`;
    return `<div class="rv-q">${grouped ? ctx + src : src + ctx}${mcq(q, '')}</div>`;
  }).join('');
}
function bindReview(items, root = $('#rv'), pre = 'r') {
  if (!root) return;
  bindMcq(root, items.filter(it => it.q).map(it => it.q), null, false);
  items.filter(it => it.sent).forEach(it => { const f = it.sent; bindSent(root, f.w, f.d, f.j, f.w.sents[f.d][f.j], null, `${pre}${f.w.n}-${f.d}:${f.j}`, false); });
}
// 上方是日期格子（今天、明天……之後）＋單字卡，點一格列出那天的題目；今天的作答會記錄，其他天是提前練習、不記錄（2026-11-09 使用者要求：拿掉規則說明）
function renderReview() {
  const now = Date.now(), ix = qindex();
  let book = REVIEW.book(qlog(), now);
  // 題目已從題庫移除：記一筆作廢，離開錯題本，首頁和其他裝置的數字才會一致
  const gone = [...new Set(book.open.concat(book.checks, book.due).filter(s => s.h && !ix[s.h]).map(s => s.h))];
  // shortcut: 一次超過 10 題對不上多半是題庫沒載入完整，先不作廢；真的大量刪題時再放寬
  if (gone.length && gone.length <= 10) { logAnswer({ c: 'review', k: 'reset', h: 'reset:gone', qt: '題目已從題庫移除', v: gone }); book = REVIEW.book(qlog(), now); }
  const ord = new Map(Object.keys(ix).map((h, i) => [h, i]));
  // 今天：reviewItems（之前沒做完的在前、最多 50 題）；其他天照題庫順序（週、天、單字→長句→文法→文章），同一個長句只列一次
  const cs = REVIEW.dayCards(book.open.concat(book.checks, book.due.filter(s => s.final)).filter(s => ix[s.h]), s => s.due, now).map(g => {
    if (g.key === 'today') return { ...g, n: g.list.length, list: reviewItems() };
    const seen = new Set(), list = [];
    g.list.sort((a, b) => ord.get(a.h) - ord.get(b.h)).forEach(s => {
      const f = ix[s.h];
      if (f.sent) { const key = `sent:${f.w.n}:${f.d}:${f.j}`; if (!seen.has(key)) { seen.add(key); list.push({ sent: f, s }); } }
      else list.push({ q: f.q, f, s });   // 不帶 rv：不顯示「幾天後再考」
    });
    return { ...g, n: g.list.length, list };
  });
  const nw = reviewWords().look.length, back = store.get('rvBack', '');
  $('#main').innerHTML = `<p class="eyebrow">錯題本</p><h1>錯題複習</h1><div class="dcards" id="dcards"></div><div id="dlist"></div>`;
  const show = k => {
    const g = cs.find(x => x.key === k), today = k === 'today';
    $('#dcards').innerHTML = REVIEW.cardsHTML(cs, k, x => x.n) + (nw ? `<a class="dcard" href="#cards"><b>單字卡 →</b><span>${nw} 個字</span></a>` : '');
    $$('#dcards button.dcard').forEach(b => { b.onclick = () => show(b.dataset.k); });
    $('#dlist').innerHTML = `<div class="${today ? '' : 'practice'}">${today ? '' : `<p class="dnote">${g.label}到期的題目，可以提前練習：作答不記錄、不影響複習排程。</p>`}${g.list.length ? reviewHTML(g.list, !today, today ? 'r' : 'p') : '<p class="note">今天沒有到期的錯題。</p>'}</div>
${today ? `<div class="row endrow">${back ? `<a class="btn pri" href="${back}">回到早上的練習 ›</a>` : ''}<a class="btn" href="#">回到本週</a></div>` : ''}`;
    const box = $('#dlist > div'); if (!today) noLog(box);
    bindReview(g.list, box, today ? 'r' : 'p'); refreshParts();
  };
  show('today');
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
${(hw => (hw.hint.length || hw.peek.length) ? `<p class="lbl">回想時需要幫忙的字</p><ul class="tags">${hw.hint.map(x => `<li>${esc(x)}（看了中文提示）</li>`).join('')}${hw.peek.map(x => `<li>${esc(x)}（看了早上的卡片）</li>`).join('')}</ul>` : '')(helpedWords(w))}
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

// 回想時需要幫忙的字：按了「看中文提示」，或打開早上的卡片後才答出來
function helpedWords(w) {
  const pre = wkKey(w) + 'd', word = h => h.split(':')[2];
  const hint = new Set(REVIEW.live(LOG).filter(e => e.k === 'hint' && e.c && e.c.startsWith(pre)).map(e => word(e.h)));
  const peek = new Set(REVIEW.live(LOG).filter(e => e.k === 'wr' && e.pk && e.c && e.c.startsWith(pre)).map(e => word(e.h)));
  return { hint: [...hint], peek: [...peek].filter(x => !hint.has(x)) };
}
/* ---- 匯出：本週紀錄＋給下一週 AI 的指示 ---- */
function exportMD(w) {
  const { tr, sk } = weekStats(w), ix = qindex(), u = unsure(), today = REVIEW.dayKey(Date.now());
  const st = REVIEW.state(qlog());
  const wrong = {}; tr.filter(x => !x.ok).forEach(x => { wrong[x.h] = (wrong[x.h] || 0) + 1; });
  const picks = {}; REVIEW.live(LOG).forEach(e => { if (e.h && !e.ok && e.p != null && REVIEW_KINDS.has(e.k)) (picks[e.h] = picks[e.h] || new Set()).add(e.p); });
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
  const steps = {}; REVIEW.live(LOG).filter(e => e.k === 'x' && e.c && e.c.startsWith(wkKey(w) + 'd') && !e.ok && e.n === 1).forEach(e => { steps[e.sk] = (steps[e.sk] || 0) + 1; });
  const skLines = Object.keys(SKILLS).map(k => `| ${k} | ${SKILLS[k]} | ${sk[k].n} | ${sk[k].ok} | ${sk[k].n ? Math.round(100 * sk[k].ok / sk[k].n) + '%' : '—'} | ${SK_ST[skillState(sk[k])]} |`);
  const allWords = WEEKS.flatMap(x => x.words.flat().map(y => y[0]));
  const avgWords = type => { const ps = w.passages.flatMap((_, d) => dayPass(w, d).filter(P => P.type === type)); return Math.round(ps.reduce((n, P) => n + (P.text.join(' ').match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || []).length, 0) / (ps.length || 1)); };
  return `# 後中英文 第 ${w.n} 週學習紀錄（匯出日 ${today}）

## 給 AI 的指示：請產生第 ${w.n + 1} 週的訓練內容

我在準備台灣學士後中醫入學考（目標：中國醫藥大學，116 學年度，2027 年 4 月筆試）的英文。英文基礎差，目標是 2027 年 2 月底前達到考試程度。考試題型：字彙、克漏字、閱讀（文章約一半是醫學與生命科學）。我不背罕見字，重點是克漏字、閱讀、文法和學術／醫學常用字。

請依照下面「本週紀錄」的弱項，產生第 ${w.n + 1} 週的兩個資料檔 \`w${String(w.n + 1).padStart(2, '0')}a.js\`、\`w${String(w.n + 1).padStart(2, '0')}b.js\`，格式必須和下面的規格完全一樣（網站會直接載入，格式錯了整頁會壞）。

### 內容要求
1. 每天兩段：早上（12 個新單字＋2 個長句拆解）、晚上（1 個文法重點＋3 題、1 篇克漏字＋5 題、1 篇閱讀＋5 題、單字回想自動產生）。共 7 天。
2. **新單字 84 個**：學術與醫學常用字（詞頻約 3000–12000 名），不可與「已學過的單字」重複。每天一個主題。每個字需有 3 個不同情境、不同句型的額外例句（8–22 字，晚上回想與錯題複習會使用）。
3. **弱項優先**：「需要加強」的能力，下週至少安排兩天的文法重點或長句練它；「本週沒練到」的能力至少練一次；「穩定」的能力仍要在文章中混著出現。
4. **錯題回收**：「答錯的單字」、「不熟的單字」與「回想時需要幫忙的字」要在下週的長句或文章裡再出現（當成已學過的字使用，不是新字）。
5. **難度逐週增加**：克漏字與閱讀的文章長度都比本週多約 20–30 字（上限：克漏字 400 字、閱讀 450 字，目標是 1 月底接近考試文章長度），句子變長、修飾更多。題目要有一個明確正解，三個誘答要合理但確定錯。
6. **選項不可提示答案**：同一組選項的長短、形式、詳細程度要相近；正解不可是唯一最長的選項；括號說明要嘛每個選項都有、要嘛都沒有，說明放在解析。
7. 每一題附 2–3 步的「一步一步來」：每一步是一個小判斷，引導學生自己推出答案，不要直接給答案。步驟選項也要遵守第 6 點。
8. 中文用台灣繁體，說明用語要白話；每個文法名詞第一次出現要解釋。
9. **單字的中文**：寫 1–2 個最常考的意思，用「、」分開（例：promote → 促進、晉升）；同一週不同單字的中文不可共用同一個詞（例：不要一個寫「促進」、另一個寫「培養、促進」），字義題的誤答是從其他單字的中文挑的。

### 資料格式
\`\`\`js
// wNNa.js
WEEKS.push({ n: ${w.n + 1}, theme: '本週主題', days: [] });
WEEKS[${w.n}].words = [   // 7 天 × 12 個
  [['英文', '詞性', '中文', '字根拆解（沒有就空字串）', '例句（必須包含這個字或它的變化形）', '例句中文', [['更多例句1', '中文'], ['更多例句2', '中文'], ['更多例句3', '中文']]], …],
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
WEEKS[${w.n}].passages = [  // 7 天，各 2 篇：[克漏字, 閱讀]；克漏字空格寫 {1}…{5}，題目 q 寫「第 (1) 格」
  [{ type: 'cloze', … }, { type: 'read', … }],
  // 每篇格式：{ type: 'cloze' | 'read', title: '標題', text: ['段落', …], zh: '全文中文',
    qs: [{ id: 'p1-1', sk: '能力代碼', pre: '（閱讀題才要）題型：要找什麼', q: '題目', o: ['正解', …3 個誤答], why: '解析', st: [[…同上…]] }, …] },
  …
];
\`\`\`
- o 的第一個一定是正解（網站會打亂順序）。題目 id 在同一週內不可重複。
- 能力代碼只能用下表的代碼。

本週文章字數：克漏字平均 ${avgWords('cloze')} 字、閱讀平均 ${avgWords('read')} 字

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

### 回想時需要幫忙的字（也要在下週重複出現）
${(hw => [...hw.hint.map(x => `- ${x}（看了中文提示）`), ...hw.peek.map(x => `- ${x}（看了早上的卡片才答出）`)].join('\n') || '- （沒有）')(helpedWords(w))}

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
  else if (h === 'cards') renderCards();
  else if (h === 'report') renderReport();
  else renderHome();
  $('#wkTag').textContent = `第 ${w.n} 週`; refreshParts();
  saveSummary();
  window.scrollTo(0, 0);
}
function boot() { $('#spkSlot').innerHTML = SPEECH.controls(); SPEECH.bind(); addEventListener('hashchange', route); route(); }
