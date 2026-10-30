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
  { id: 'eng', name: '英文', st: 'building', today: '單字・長句・一篇文章', note: '計畫：每天約 60 分鐘（錯題複習 → 新單字 → 長句拆解 → 一篇克漏字或閱讀），文章難度每週往上調，2027 年 2 月底前達到考試程度。先完成三校十年英文試題分析，再依考卷實際用字產生單字表。', big: '0<small> / 17 週</small>' },
  { id: 'bio', name: '生物', st: 'plan', note: '含生理學。之後會先做歷屆試題主題分析，再決定章節與比重，做法和化學相同。' },
  { id: 'zh', name: '國文', st: 'plan', note: '之後會先分析歷屆試題的題型（字音字形、文意、閱讀、作文等），再決定練習方式。' },
];
const SUBJ_ST = { live: '已上線', building: '製作中', plan: '規劃中' };
const ST_LABEL = { est: '推估', known: '已列出・待簡章', goal: '目標' };
const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
const daysTo = s => Math.round((pd(s) - REVIEW.dayStart(Date.now())) / REVIEW.DAY);
const md = s => { const d = new Date(pd(s)); return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${'日一二三四五六'[d.getDay()]}）`; };

const chemLog = () => local('chem-ladder', 'log', []);
const chemDone = () => local('chem-ladder', 'done', {});

// 各章狀態：未開始／練習中／待加強／已掌握
function chemChapters(log) {
  const tr = REVIEW.trials(log), book = REVIEW.book(log), done = chemDone();
  return CHEM_META.map(m => {
    const t = tr.filter(x => x.c === m.id), recent = t.slice(-20), acc = recent.length ? recent.filter(x => x.ok).length / recent.length : 0;
    const seen = new Set(t.map(x => x.key)).size, open = book.open.filter(s => s.c === m.id).length;
    let st = 'none';
    if (t.length) {
      if ((recent.length >= 3 && acc < 0.6) || open >= 3) st = 'weak';
      else if (done[m.id] && seen >= m.n * 0.4 && acc >= 0.8 && !open) st = 'master';
      else st = 'prac';
    }
    return { ...m, st, acc, seen, open };
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
  const perDay = {}; tr.forEach(x => { const k = REVIEW.dayKey(x.t); perDay[k] = (perDay[k] || 0) + 1; });
  let streak = 0; for (let d = REVIEW.dayStart(Date.now()) - (perDay[today] ? 0 : REVIEW.DAY); perDay[REVIEW.dayKey(d)]; d -= REVIEW.DAY) streak++;
  const days = Array.from({ length: 28 }, (_, i) => REVIEW.dayStart(Date.now()) - (27 - i) * REVIEW.DAY);
  const lv = n => (!n ? 0 : n < 10 ? 1 : n < 30 ? 2 : 3);
  // 倒數：最近一場還沒考的筆試，與下一個還沒到的日期
  const nextExam = EXAM_DATES.find(e => e.exam && daysTo(e.a) >= 0), nextDate = EXAM_DATES.find(e => daysTo(e.b || e.a) >= 0);
  // 化學總進度（依考試比重加權）
  const chs = chemChapters(log), W = chs.reduce((s, c) => s + c.w, 0), share = st => chs.filter(c => c.st === st).reduce((s, c) => s + c.w, 0) / W * 100;
  const pct = { master: share('master'), prac: share('prac'), weak: share('weak'), none: share('none') };
  const cnt = st => chs.filter(c => c.st === st).length;

  $('#exam').innerHTML = `
<div class="ex-head"><div><p class="eyebrow">學士後中醫 · 116 學年度</p><h2 class="ex-h">後中考試</h2></div>
${nextExam ? `<div class="count"><b>${daysTo(nextExam.a)}</b><span>天後${nextExam.s}筆試<br><small>${md(nextExam.a)}・${ST_LABEL[nextExam.st]}</small></span></div>` : ''}</div>
${nextDate ? `<p class="next">下一個日期：<b>${nextDate.s}${nextDate.what}</b>${daysTo(nextDate.a) > 0 ? `，${daysTo(nextDate.a)} 天後開始（${md(nextDate.a)}）` : `，進行中，${md(nextDate.b || nextDate.a)} 截止`}<span class="chip ${nextDate.st}">${ST_LABEL[nextDate.st]}</span></p>` : ''}

<div class="ex-grid">
  <section class="panel" aria-labelledby="todayH">
    <h3 id="todayH">今天</h3>
    <ul class="todo">
      <li class="${dueLeft ? '' : 'ok'}"><a href="./chem/#review"><span class="ck">${dueLeft ? '' : '✓'}</span><span>化學錯題複習</span><b>${dueLeft ? `還有 ${dueLeft} 題到期` : revToday ? `完成 ${revToday} 題` : '今天沒有到期'}</b></a></li>
      <li class="${tToday.length ? 'ok' : ''}"><a href="./chem/"><span class="ck">${tToday.length ? '✓' : ''}</span><span>化學練習</span><b>${tToday.length ? `${tToday.length} 題，第一次答對 ${Math.round(100 * okToday / tToday.length)}%` : '今天還沒練習'}</b></a></li>
      ${SUBJECTS.filter(x => x.st !== 'live').map(x => `<li class="soon"><span class="ck"></span><span>${x.name}${x.today ? `：${x.today}` : ''}</span><b>${SUBJ_ST[x.st]}</b></li>`).join('')}
    </ul>
    <div class="streak"><span><b>${streak}</b> 天連續練習</span><span class="mut">錯題本共 ${book.open.length} 題</span></div>
    <div class="heat" aria-label="最近 4 週每天的練習題數">${days.map(d => { const n = perDay[REVIEW.dayKey(d)] || 0; return `<i class="l${lv(n)}${REVIEW.dayKey(d) === today ? ' now' : ''}" title="${REVIEW.dayKey(d)}：${n} 題"></i>`; }).join('')}</div>
    <p class="heat-cap"><span>4 週前</span><span>每格一天，顏色越深練越多</span><span>今天</span></p>
  </section>

  <section class="panel" aria-labelledby="progH">
    <h3 id="progH">總進度</h3>
    <details class="subj" open>
      <summary><span class="sj">化學</span><span class="big">${Math.round(pct.master)}<small>%</small></span><span class="mut small">考試範圍已掌握</span></summary>
      <div class="stack" aria-hidden="true">${['master', 'prac', 'weak', 'none'].map(st => `<i class="s-${st}" style="width:${pct[st]}%"></i>`).join('')}</div>
      <p class="legend">${['master', 'prac', 'weak', 'none'].map(st => `<span class="k-${st}">${CH_ST[st]} ${cnt(st)} 章</span>`).join('')}</p>
      <div class="chmap">${chs.map(c => `<a class="tile t-${c.st}" href="./chem/#${c.id}" title="${c.t}：${CH_ST[c.st]}${c.seen ? `，做過 ${c.seen}/${c.n} 題，最近第一次答對 ${Math.round(100 * c.acc)}%` : ''}"><span>${c.t}</span><small>${CH_ST[c.st]}${c.open ? `・錯題 ${c.open}` : ''}</small></a>`).join('')}</div>
      <p class="mut small">百分比依各章在三校歷屆考題的比重加權。已掌握＝標記完成、做過至少四成的題目、最近第一次答對八成以上、而且沒有待複習的錯題；待加強＝最近第一次答對不到六成，或錯題本裡有 3 題以上。</p>
    </details>
    ${SUBJECTS.filter(x => x.st !== 'live').map(x => `<details class="subj"><summary><span class="sj">${x.name}</span><span class="big">${x.big || '—'}</span><span class="mut small">${SUBJ_ST[x.st]}</span></summary><p class="small">${x.note}</p></details>`).join('')}
  </section>
</div>

<section class="panel" aria-labelledby="dateH">
  <h3 id="dateH">重要日期</h3>
  <ol class="dates">${EXAM_DATES.map(e => { const past = daysTo(e.b || e.a) < 0, d = daysTo(e.a);
    return `<li class="${past ? 'past' : ''}${e.exam ? ' ex' : ''}"><span class="when">${md(e.a)}${e.b ? `<br><small>至 ${md(e.b)}</small>` : ''}</span><span class="what"><b>${e.s}</b> ${e.what}<span class="chip ${e.st}">${ST_LABEL[e.st]}</span></span><span class="left">${past ? '已過' : d > 0 ? `${d} 天` : '進行中'}</span></li>`; }).join('')}</ol>
  <p class="mut small">繳費依往年都在網路報名期間內完成。推估的日期照 115 學年度同一週次往後推一年；各校簡章通常在報名前約一個月公告，公告後會改成正式日期。日程以各校正式簡章為準。</p>
</section>`;
}
