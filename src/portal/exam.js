/* ---------- 首頁「後中考試」區：倒數、今天、總進度、重要日期 ----------
   化學資料來自化學課程頁存在本機的練習紀錄（chem-ladder:log）與完成表，登入後與雲端同步；
   錯題排程規則在 src/shared/review.js；各章名稱與考試比重在 chem-meta.js（建置時產生）。 */

// 116 學年度重要日期。st：known＝補習班網站已列出（仍以簡章為準）、est＝依 115 學年度同一週次推估。
// 115 學年度實際：義守 報名 114/12/23–115/1/2、筆試 3/22、放榜 4/29；中國醫 報名 1/20–1/26、筆試 4/19、一階放榜 4/23、口試 5/3、放榜 5/8；
// 慈濟 報名 2/2–2/6、筆試 4/11、放榜 5/11。來源：https://www.3dollars.com.tw/Hce/Brochure-hce.html（2026-10-31 查）。
const EXAM_DATES = [
  { s: '義守', what: '網路報名＋繳費', a: '2026-12-22', b: '2027-01-01', st: 'est' },
  { s: '中國醫', what: '網路報名＋繳費', a: '2027-01-19', b: '2027-01-25', st: 'est' },
  { s: '慈濟', what: '網路報名＋繳費', a: '2027-02-15', b: '2027-02-19', st: 'known' },
  { s: '自己', what: '英文達到考試程度（四個月目標）', a: '2027-02-28', st: 'goal' },
  { s: '義守', what: '筆試', a: '2027-03-21', st: 'est', exam: 1 },
  { s: '慈濟', what: '筆試', a: '2027-04-10', st: 'known', exam: 1 },
  { s: '中國醫', what: '筆試', a: '2027-04-18', st: 'est', exam: 1 },
  { s: '中國醫', what: '第一階段放榜', a: '2027-04-22', st: 'est' },
  { s: '義守', what: '放榜', a: '2027-04-28', st: 'est' },
  { s: '中國醫', what: '口試', a: '2027-05-02', st: 'est' },
  { s: '中國醫', what: '放榜', a: '2027-05-07', st: 'est' },
  { s: '慈濟', what: '放榜', a: '2027-05-10', st: 'known' },
];
// 後中考四科（三校都考國文、英文、生物、化學）。live＝已上線、building＝製作中、plan＝規劃中。新增科目時在這裡加一項。
const SUBJECTS = [
  { id: 'chem', name: '化學', st: 'live', href: './chem/' },
  { id: 'eng', name: '英文', st: 'live', href: './eng/' },
  { id: 'bio', name: '生物', st: 'plan', note: '含生理學。之後會先做歷屆試題主題分析，再決定章節與比重，做法和化學相同。' },
  { id: 'zh', name: '國文', st: 'live', href: './zh/' },
];
const SUBJ_ST = { live: '已上線', building: '製作中', plan: '規劃中' };
const TARGET = '中國醫';   // 志願校：倒數、下一個日期、化學比重都以它為準
const ST_LABEL = { est: '推估', known: '已列出・待簡章', goal: '目標' };
const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
const daysTo = s => Math.round((pd(s) - REVIEW.dayStart(Date.now())) / REVIEW.DAY);
const md = s => { const d = new Date(pd(s)); return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${'日一二三四五六'[d.getDay()]}）`; };

const chemLog = () => local('chem-ladder', 'log', []);
// 英文：紀錄給錯題與連續天數；每天哪一段做完由英文頁存的摘要（eng-ladder:sum）提供
// 要和英文頁的 qlog 一樣含 fu（追問）：追問答錯的題目算猜對、進錯題本，少了它首頁的錯題數和到期數會和錯題本頁對不上
const engLog = () => REVIEW.live(local('eng-ladder', 'log', [])).filter(e => ['w', 'wr', 's', 'g', 'p', 'fu'].includes(e.k));
const engSum = () => local('eng-ladder', 'sum', null);
const ENG_WEEKS = 17;
// 國文：和英文一樣，紀錄給錯題與連續天數，每段完成度由國文頁存的摘要（zh-ladder:sum）提供
const zhLog = () => REVIEW.live(local('zh-ladder', 'log', [])).filter(e => ['z', 'fu'].includes(e.k));
const zhSum = () => local('zh-ladder', 'sum', null);   // 2026-11 起到 2027-02 底
const chemDone = () => local('chem-ladder', 'done', {});

// 一題的進度（依錯題複習）：沒做 0；錯題本第 1 格 0.2、每過一格 +0.15；第一次就答對、等確認題 0.6；確認答對或五格都過 1
const qScore = s => (!s ? 0 : !s.open ? 1 : s.chk ? 0.6 : 0.2 + 0.15 * s.stage);
// 各章狀態：未開始／練習中／待加強／已掌握；got＝已拿到的考卷比重（%）：每章佔 w × 2 %（中國醫每份 50 題約 w 題），平分給有題目的各小節，各節再乘上題目進度的平均
function chemChapters(log) {
  const tr = REVIEW.trials(log), book = REVIEW.book(log), done = chemDone(), stM = REVIEW.state(log);
  return CHEM_META.map(m => {
    const t = tr.filter(x => x.c === m.id), recent = t.slice(-20), acc = recent.length ? recent.filter(x => x.ok).length / recent.length : 0;
    const seen = new Set(t.map(x => x.key)).size, open = book.open.filter(s => s.c === m.id).length;
    let st = 'none';
    if (t.length) {
      if ((recent.length >= 3 && acc < 0.6) || open >= 3) st = 'weak';
      else if (done[m.id] && seen >= m.n * 0.4 && acc >= 0.8 && !open) st = 'master';
      else st = 'prac';
    }
    const pct = m.w * 2, got = m.s.length ? m.s.reduce((a, qs) => a + qs.reduce((b, kh) => b + qScore(stM.get(`${m.id}|${kh}`)), 0) / qs.length, 0) / m.s.length * pct : 0;
    return { ...m, st, acc, seen, open, pct, got };
  });
}
const CH_ST = { master: '已掌握', prac: '練習中', weak: '待加強', none: '未開始' };

function renderExam() {
  const log = chemLog(), tr = REVIEW.trials(log), book = REVIEW.book(log), today = REVIEW.dayKey(Date.now());
  const tToday = tr.filter(x => REVIEW.dayKey(x.t) === today), okToday = tToday.filter(x => x.ok).length;
  // 今天複習了幾題：今天作答、而且在今天以前就在錯題本裡的題目
  const before = REVIEW.book(log.filter(e => REVIEW.dayKey(e.t) !== today));
  const openKeys = new Set(before.open.map(s => s.key)), revToday = new Set(tToday.filter(x => openKeys.has(x.key)).map(x => x.key)).size;
  const dueLeft = book.due.length;
  // 連續天數與最近 4 週
  const elog = engLog(), etr = REVIEW.trials(elog), ebook = REVIEW.book(elog), es = engSum();
  const eToday = etr.filter(x => REVIEW.dayKey(x.t) === today).length;
  const zlog = zhLog(), ztr = REVIEW.trials(zlog), zbook = REVIEW.book(zlog), zs = zhSum(), zToday = ztr.filter(x => REVIEW.dayKey(x.t) === today).length;
  const perDay = {}; tr.concat(etr, ztr).forEach(x => { const k = REVIEW.dayKey(x.t); perDay[k] = (perDay[k] || 0) + 1; });
  let streak = 0; for (let d = REVIEW.dayStart(Date.now()) - (perDay[today] ? 0 : REVIEW.DAY); perDay[REVIEW.dayKey(d)]; d -= REVIEW.DAY) streak++;
  const days = Array.from({ length: 28 }, (_, i) => REVIEW.dayStart(Date.now()) - (27 - i) * REVIEW.DAY);
  const lv = n => (!n ? 0 : n < 10 ? 1 : n < 30 ? 2 : 3);
  // 倒數：最近一場還沒考的筆試，與下一個還沒到的日期
  const mine = e => e.s === TARGET || e.st === 'goal';
  const nextExam = EXAM_DATES.find(e => e.exam && mine(e) && daysTo(e.a) >= 0), nextDate = EXAM_DATES.find(e => mine(e) && daysTo(e.b || e.a) >= 0);
  // 化學總進度：各章已拿到的考卷比重加總。各章合計約 94%（每份約 3 題無法歸章），所以全部掌握也到不了 100%
  const chs = chemChapters(log), got = chs.reduce((s, c) => s + c.got, 0);
  const cnt = st => chs.filter(c => c.st === st).length;

  $('#exam').innerHTML = `
<div class="ex-head"><div><p class="eyebrow">學士後中醫 · 116 學年度 · 志願 ${TARGET}</p><h2 class="ex-h">後中考試</h2></div>
${nextExam ? `<div class="count"><b>${daysTo(nextExam.a)}</b><span>天後${nextExam.s}筆試<br><small>${md(nextExam.a)}・${ST_LABEL[nextExam.st]}</small></span></div>` : ''}</div>
${nextDate ? `<p class="next">下一個日期：<b>${nextDate.s}${nextDate.what}</b>${daysTo(nextDate.a) > 0 ? `，${daysTo(nextDate.a)} 天後開始（${md(nextDate.a)}）` : `，進行中，${md(nextDate.b || nextDate.a)} 截止`}<span class="chip ${nextDate.st}">${ST_LABEL[nextDate.st]}</span></p>` : ''}

${enterHTML(es, zs)}
<div class="ex-grid">
  <section class="panel" aria-labelledby="todayH">
    <h3 id="todayH">今天</h3>
    <ul class="todo">
      <li class="${dueLeft ? '' : 'ok'}"><a href="./chem/#review"><span class="ck">${dueLeft ? '' : '✓'}</span><span>化學錯題複習</span><b>${dueLeft ? `還有 ${dueLeft} 題到期` : revToday ? `完成 ${revToday} 題` : '今天沒有到期'}</b></a></li>
      <li class="${tToday.length ? 'ok' : ''}"><a href="${chemResume().href}"><span class="ck">${tToday.length ? '✓' : ''}</span><span>化學練習</span><b>${tToday.length ? `${tToday.length} 題，第一次答對 ${Math.round(100 * okToday / tToday.length)}%` : '今天還沒練習'}</b></a></li>
      <li class="${ebook.due.length ? '' : 'ok'}"><a href="./eng/#review"><span class="ck">${ebook.due.length ? '' : '✓'}</span><span>英文錯題複習</span><b>${ebook.due.length ? `還有 ${ebook.due.length} 題到期` : '今天沒有到期'}</b></a></li>
      ${engToday(es, eToday)}
      <li class="${zbook.due.length ? '' : 'ok'}"><a href="./zh/#review"><span class="ck">${zbook.due.length ? '' : '✓'}</span><span>國文錯題複習</span><b>${zbook.due.length ? `還有 ${zbook.due.length} 題到期` : '今天沒有到期'}</b></a></li>
      ${zhToday(zs, zToday)}
      ${SUBJECTS.filter(x => x.st !== 'live').map(x => `<li class="soon"><span class="ck"></span><span>${x.name}${x.today ? `：${x.today}` : ''}</span><b>${SUBJ_ST[x.st]}</b></li>`).join('')}
    </ul>
    <div class="streak"><span><b>${streak}</b> 天連續練習</span><span class="mut">錯題本：化學 ${book.open.length}・英文 ${ebook.open.length}・國文 ${zbook.open.length} 題</span></div>
    <div class="heat" aria-label="最近 4 週每天的練習題數">${days.map(d => { const n = perDay[REVIEW.dayKey(d)] || 0; return `<i class="l${lv(n)}${REVIEW.dayKey(d) === today ? ' now' : ''}" title="${REVIEW.dayKey(d)}：${n} 題"></i>`; }).join('')}</div>
    <p class="heat-cap"><span>4 週前</span><span>每格一天，顏色越深練越多</span><span>今天</span></p>
  </section>

  <section class="panel" aria-labelledby="progH">
    <h3 id="progH">總進度</h3>
    <details class="subj" open>
      <summary><span class="sj">化學</span><span class="big">${got.toFixed(1)}<small>%</small></span><span class="mut small">考試範圍已掌握</span></summary>
      <div class="stack" aria-hidden="true"><i class="s-master" style="width:${got}%"></i></div>
      <p class="legend">${['master', 'prac', 'weak', 'none'].map(st => `<span class="k-${st}">${CH_ST[st]} ${cnt(st)} 章</span>`).join('')}</p>
      <div class="chmap">${chs.map(c => `<a class="tile t-${c.st}" href="./chem/#${c.id}" title="${c.t}：${CH_ST[c.st]}${c.seen ? `，做過 ${c.seen}/${c.n} 題，最近第一次答對 ${Math.round(100 * c.acc)}%` : ''}"><span>${c.t} <i aria-hidden="true">→</i></span><small>${c.got.toFixed(1)} / ${c.pct.toFixed(1)}%・${CH_ST[c.st]}${c.open ? `・錯題 ${c.open}` : ''}</small></a>`).join('')}</div>
    </details>
    ${engProgress(es)}
    ${zhProgress(zs)}
    ${SUBJECTS.filter(x => x.st !== 'live').map(x => `<details class="subj"><summary><span class="sj">${x.name}</span><span class="big">${x.big || '—'}</span><span class="mut small">${SUBJ_ST[x.st]}</span></summary><p class="small">${x.note}</p></details>`).join('')}
  </section>
</div>

<section class="panel" aria-labelledby="dateH">
  <h3 id="dateH">重要日期</h3>
  <ol class="dates">${EXAM_DATES.map(e => { const past = daysTo(e.b || e.a) < 0, d = daysTo(e.a);
    return `<li class="${past ? 'past' : ''}${e.exam ? ' ex' : ''}${mine(e) ? ' mine' : ' other'}"><span class="when">${md(e.a)}${e.b ? `<br><small>至 ${md(e.b)}</small>` : ''}</span><span class="what"><b>${e.s}</b> ${e.what}<span class="chip ${e.st}">${ST_LABEL[e.st]}</span></span><span class="left">${past ? '已過' : d > 0 ? `${d} 天` : '進行中'}</span></li>`; }).join('')}</ol>
</section>`;
}

// 英文「今天」：下一個還沒做完的段落
function engToday(es, n) {
  if (!es) return `<li><a href="./eng/"><span class="ck"></span><span>英文：早上單字與長句、晚上文法與文章</span><b>還沒開始</b></a></li>`;
  if (!es.next) return `<li class="ok"><a href="./eng/#report"><span class="ck">✓</span><span>英文第 ${es.n} 週全部完成</span><b>看週報、匯出給下一週</b></a></li>`;
  const { d, s } = es.next;
  return `<li class="${n ? 'ok' : ''}"><a href="./eng/#d${d + 1}${s}"><span class="ck">${n ? '✓' : ''}</span><span>英文：第 ${es.n} 週第 ${d + 1} 天${s === 'am' ? '早上' : '晚上'}</span><b>${n ? `今天做了 ${n} 題` : '今天還沒練習'}</b></a></li>`;
}
// 國文「今天」與總進度：照英文的寫法
function zhToday(zs, n) {
  if (!zs) return `<li><a href="./zh/"><span class="ck"></span><span>國文：早上字詞與常識、晚上閱讀</span><b>還沒開始</b></a></li>`;
  if (!zs.next) return `<li class="ok"><a href="./zh/"><span class="ck">✓</span><span>國文第 ${zs.n} 週全部完成</span><b>等下一週的題目</b></a></li>`;
  const { d, s } = zs.next;
  return `<li class="${n ? 'ok' : ''}"><a href="./zh/#d${d + 1}${s}"><span class="ck">${n ? '✓' : ''}</span><span>國文：第 ${zs.n} 週第 ${d + 1} 天${s === 'am' ? '早上' : '晚上'}</span><b>${n ? `今天做了 ${n} 題` : '今天還沒練習'}</b></a></li>`;
}
function zhProgress(zs) {
  const days = zs ? zs.slots.filter(x => x[0] >= 1 && x[1] >= 1).length : 0;
  return `<details class="subj"><summary><span class="sj">國文</span><span class="big">${days}<small> / 7 天</small></span><span class="mut small">${zs ? `第 ${zs.n} 週` : '還沒開始'}</span></summary>
${zs ? `<p class="small">本週：${esc(zs.theme)}</p><div class="eslots" aria-label="本週每天早晚的完成度">${zs.slots.map((x, d) => `<a href="./zh/#d${d + 1}am" title="第 ${d + 1} 天：早上 ${Math.round(100 * x[0])}%、晚上 ${Math.round(100 * x[1])}%"><small>${d + 1}</small><i style="--f:${x[0]}"></i><i style="--f:${x[1]}"></i></a>`).join('')}</div>` : ''}
<p class="mut small">每天早晚各約 15 分鐘：早上字音字形、字詞、國學常識，晚上閱讀題組。題型照中國醫、慈濟、義守 114、115 學年度考卷。</p></details>`;
}
function engProgress(es) {
  const days = es ? es.slots.filter(x => x[0] >= 1 && x[1] >= 1).length : 0;
  return `<details class="subj"><summary><span class="sj">英文</span><span class="big">${es ? es.n - 1 + (days === 7 ? 1 : 0) : 0}<small> / ${ENG_WEEKS} 週</small></span><span class="mut small">${es ? `第 ${es.n} 週完成 ${days} / 7 天` : '還沒開始'}</span></summary>
${es ? `<p class="small">本週：${esc(es.theme)}</p><div class="eslots" aria-label="本週每天早晚的完成度">${es.slots.map((x, d) => `<a href="./eng/#d${d + 1}am" title="第 ${d + 1} 天：早上 ${Math.round(100 * x[0])}%、晚上 ${Math.round(100 * x[1])}%"><small>${d + 1}</small><i style="--f:${x[0]}"></i><i style="--f:${x[1]}"></i></a>`).join('')}</div>
${es.weak.length ? `<p class="small">待加強：${es.weak.map(esc).join('、')}</p>` : ''}` : ''}
<p class="mut small">每週 7 天、每天早晚各約 30 分鐘。週末在英文頁的「本週報告」匯出錯題與弱項，交給 AI 產生下一週的內容。</p></details>`;
}

// 進入各科：回到上次的位置（化學：chem-ladder:last；英文：下一個沒做完的段落）
function chemResume() {
  const l = local('chem-ladder', 'last', null), m = l && CHEM_META.find(x => x.id === l.id);
  return m ? { href: `./chem/#${m.id}${l.sec ? '/' + l.sec : ''}`, t: `繼續：${m.t}${l.sh ? `・${l.sh}` : ''}` } : { href: './chem/', t: '從第一章開始' };
}
function engResume(es) {
  if (!es) return { href: './eng/', t: '從第 1 週第 1 天開始' };
  if (!es.next) return { href: './eng/#report', t: `第 ${es.n} 週完成：看週報` };
  const { d, s } = es.next; return { href: `./eng/#d${d + 1}${s}`, t: `繼續：第 ${es.n} 週第 ${d + 1} 天${s === 'am' ? '早上' : '晚上'}` };
}
function zhResume(zs) {
  if (!zs) return { href: './zh/', t: '從第 1 週第 1 天開始' };
  if (!zs.next) return { href: './zh/', t: `第 ${zs.n} 週完成` };
  const { d, s } = zs.next; return { href: `./zh/#d${d + 1}${s}`, t: `繼續：第 ${zs.n} 週第 ${d + 1} 天${s === 'am' ? '早上' : '晚上'}` };
}
function enterHTML(es, zs) {
  const c = chemResume(), e = engResume(es), z = zhResume(zs);
  return `<nav class="enter" aria-label="進入科目"><a class="ent" href="${c.href}" style="--sc:#17705F"><b>化學</b><span>${c.t}</span><i aria-hidden="true">→</i></a><a class="ent" href="${e.href}" style="--sc:#1F4E79"><b>英文</b><span>${e.t}</span><i aria-hidden="true">→</i></a><a class="ent" href="${z.href}" style="--sc:#8E2F2F"><b>國文</b><span>${z.t}</span><i aria-hidden="true">→</i></a></nav>`;
}
