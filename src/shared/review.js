/* ---------- 錯題排程（化學、英文與首頁共用） ----------
   只從練習紀錄推算，不另外存狀態，所以紀錄同步到哪裡，排程就跟到哪裡。
   紀錄每一筆：{ t 時間, c 章, k 題型, h 題目識別碼, ok, n 第幾次作答 }；n === 1 是「一次作答」的開頭。
   規則（2026-11-02 使用者要求加長）：每題每天只算第一次作答。
   - 第一次就答錯 → 進入錯題本，隔 1 天到期（第 1 格）。
   - 到期後（之後任何一天）第一次就答對 → 進到下一格，依序再隔 3、7、14、30 天；五格都過才算掌握，離開錯題本。
   - 在錯題本中又答錯 → 從第 1 格重新開始（隔 1 天）。
   - 考前總複習：FINAL 那天起，所有曾經答錯、已經掌握的題目再到期一次；答對就完成，答錯就重新進錯題本。
   防止「猜對」（2026-11-02 使用者要求，兩個方法一起用）：
   - 追問：第一次就答對時，接著追問這題的一個推理步驟（k: 'fu'，fk 為原題型）。追問第一次就答錯 → 這次作答當成答錯（猜對）。
   - 確認題：第一次就答對的新題目，CHECK 天後再出一次（chk 1），答對後再隔 CHECK2 天做長期確認（chk 2）；兩次都答對才算會，任何一次答錯就進五格複習。
     （2026-11-09 使用者要求加長期確認：3 天還在短期記憶，答對後可能一個月就忘了）
   作廢（2026-11-07 使用者要求）：「重新練習」選「之前的不算」時記一筆 k:'reset'、v 為那一段的題目識別碼；那些題目在這之前的作答全部不算（紀錄本身保留）。 */
const REVIEW = (() => {
  const DAY = 864e5, GAPS = [1, 3, 7, 14, 30], CHECK = 3, CHECK2 = 30, FINAL = new Date(2027, 2, 1).getTime();   // 2027-03-01
  const dayStart = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  // 拿掉被「之前的不算」作廢的作答
  function live(log) {
    const rs = log.filter(e => e.k === 'reset' && e.v);
    if (!rs.length) return log;
    const cut = new Map(); rs.forEach(r => r.v.forEach(h => cut.set(h, Math.max(cut.get(h) || 0, r.t))));
    return log.filter(e => !(e.h && e.k !== 'reset' && e.t < (cut.get(e.h) || 0)));
  }
  // 每題每天的第一次作答
  function trials(log) {
    log = live(log);
    const seen = new Set(), out = [], guess = new Set();
    for (const e of log) if (e.k === 'fu' && e.n === 1 && !e.ok) guess.add(`${e.c}|${e.fk}|${e.h}@${dayKey(e.t)}`);   // 追問答錯 → 那天的作答算猜對
    for (const e of log) {
      if (e.n !== 1 || !e.h || e.k === 'fu') continue;
      const key = `${e.c}|${e.k}|${e.h}`, dk = dayKey(e.t);
      if (seen.has(key + '@' + dk)) continue;
      const g = !!e.ok && guess.has(key + '@' + dk);
      seen.add(key + '@' + dk); out.push({ key, t: e.t, ok: !!e.ok && !g, guess: g, c: e.c, k: e.k, h: e.h, i: e.i, qt: e.qt });
    }
    return out;
  }
  // 每題目前的狀態：{ key, c, k, h, i, qt, open, stage（0 起算的格數）, due, wrongs, last, first（第一次作答是否答對） }
  function state(log) {
    const m = new Map();
    for (const tr of trials(log)) {
      let s = m.get(tr.key);
      const fresh = !s;
      if (!s) { s = { key: tr.key, c: tr.c, k: tr.k, h: tr.h, i: tr.i, qt: tr.qt, open: false, chk: false, stage: 0, due: 0, wrongs: 0, guesses: 0, last: 0, first: tr.ok }; m.set(tr.key, s); }
      s.i = tr.i; s.qt = tr.qt || s.qt; if (tr.guess) s.guesses++;
      if (!tr.ok) { s.open = true; s.chk = false; s.stage = 0; s.wrongs++; s.due = dayStart(tr.t) + GAPS[0] * DAY; }
      else if (fresh) { s.open = true; s.chk = 1; s.due = dayStart(tr.t) + CHECK * DAY; }   // 新題目第一次就答對 → 3 天後確認
      else if (s.open && s.chk === 1 && tr.t >= s.due) { s.chk = 2; s.due = dayStart(tr.t) + CHECK2 * DAY; }   // 確認答對 → 30 天後長期確認
      else if (s.open && s.chk === 2 && tr.t >= s.due) { s.open = false; s.chk = false; }
      else if (s.open && tr.t >= s.due) {
        s.stage++;
        if (s.stage >= GAPS.length) s.open = false; else s.due = dayStart(tr.t) + GAPS[s.stage] * DAY;
      }
      s.last = tr.t;
    }
    return m;
  }
  // 錯題本：還沒掌握的題目；due 為「今天以前到期」，加上考前總複習（final: true）
  function book(log, now = Date.now()) {
    const st = [...state(log).values()], all = st.filter(s => s.open && !s.chk), checks = st.filter(s => s.open && s.chk);
    const fin = now >= FINAL ? st.filter(s => !s.open && s.wrongs > 0 && s.last < FINAL).map(s => ({ ...s, final: true, due: FINAL })) : [];
    return { open: all, checks, due: all.concat(checks).filter(s => s.due <= now).concat(fin).sort((a, b) => a.due - b.due) };
  }
  // 答對之後的說明：下一次什麼時候回來
  // 選對之後的開頭：第一次就選對才說「答對了」；前面選錯過就照實說（2026-11-07：選錯三次後仍顯示「答對了」很混淆）
  const okHead = tries => (tries > 1 ? `<b>選對了</b>，但前面選錯 ${tries - 1} 次，這次不算答對。` : '<b>答對了。</b>');
  // guess：第一次就選對、但追問理由答錯
  function after(s, firstTry, guess = false) {
    if (!firstTry) return `${guess ? '理由沒選對，算猜對' : '今天第一次沒選對'}，從第 1 格重新開始，明天再考一次。`;
    if (s.final) return '考前總複習完成。';
    if (s.chk === 1) return `確認答對，${CHECK2} 天後還會再確認一次（長期記憶）。`;
    if (s.chk) return '長期確認完成：這題真的會了。';
    if (s.stage + 1 >= GAPS.length) return `五格都過了，這題已經掌握，離開錯題本（2027 年 3 月起的考前總複習還會再出現一次）。`;
    return `${GAPS[s.stage + 1]} 天後再考一次（進到第 ${s.stage + 2} / ${GAPS.length} 格）。`;
  }
  // 「重新練習」的確認：之前的作答照算（隔很久重新複習），或不算（測試、亂按、跳過）
  const resetAsk = what => `<span class="small">讓${what}全部恢復成沒做過的樣子。之前的作答要算嗎？</span><button class="btn sm pri" type="button" data-y>照算（重新複習）</button><button class="btn sm" type="button" data-v>之前的不算（測試／亂按）</button><button class="btn sm" type="button" data-n>取消</button><span class="small">「之前的不算」：${what}的題目在這之前的作答，錯題本和週報都不算。</span>`;
  const label = s => (s.final ? '考前總複習' : s.chk === 2 ? `長期確認（${CHECK2} 天後）` : s.chk ? '確認題（之前第一次就答對）' : `第 ${s.stage + 1} / ${GAPS.length} 格`);
  // 依到期日分組（dayCards 用） [{ key, label, list }]，days 天以後併成一組（2026-11-08 使用者要求：每天到期的分開列）
  function byDay(list, due = x => x.due, now = Date.now(), days = 14) {
    const lim = dayStart(now) + (days + 1) * DAY, m = new Map();
    list.forEach(x => { const k = due(x) >= lim ? '~' : dayKey(due(x)); if (!m.has(k)) m.set(k, []); m.get(k).push(x); });
    const md = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()}（${'日一二三四五六'[d.getDay()]}）`; };
    return [...m.keys()].sort().map(k => {
      const t = k === '~' ? lim : due(m.get(k)[0]);
      return { key: k, label: k === '~' ? `${md(lim)} 及以後` : `${dayKey(t) === dayKey(dayStart(now) + DAY) ? '明天 ' : ''}${md(t)}`, list: m.get(k) };
    });
  }
  // 錯題本頁上方的日期格子：今天（含之前沒做完的，late 是幾題）一定有；之後 days − 1 天有題目的各一格，更晚的併成「之後」（2026-11-09 使用者要求）
  function dayCards(list, due = x => x.due, now = Date.now(), days = 5) {
    const today = list.filter(x => due(x) <= now);
    return [{ key: 'today', label: '今天', list: today, late: today.filter(x => due(x) < dayStart(now)).length }]
      .concat(byDay(list.filter(x => due(x) > now), due, now, days - 1).map(g => (g.key === '~' ? { ...g, label: '之後' } : g)));
  }
  const cardsHTML = (cs, sel, n = g => g.list.length) => cs.map(g => `<button type="button" class="dcard" data-k="${g.key}" aria-pressed="${g.key === sel}"><b>${g.label}</b><span>${n(g)} 題</span>${g.late ? `<small>其中 ${g.late} 題是之前沒做完的</small>` : ''}</button>`).join('');
  // 今天的作答分成「新題目」（今天以前沒做過）與「複習」（以前做過的題目：錯題、確認題、重做），首頁「今天」分開計算（2026-11-10 使用者要求）
  function todaySplit(log, now = Date.now()) {
    const t0 = dayStart(now), tr = trials(log), seen = new Set(tr.filter(x => x.t < t0).map(x => x.key)), td = tr.filter(x => x.t >= t0 && x.t < t0 + DAY);
    return { fresh: td.filter(x => !seen.has(x.key)), review: td.filter(x => seen.has(x.key)) };
  }
  // 題數：英文長句的每一步各算一筆紀錄，但頁面上一個長句是一張卡，所以同一句的步驟只算 1 題（h 為 s:w週:天:句:步；2026-11-10 格子 27 題、頁面 24 題對不上）
  const units = list => new Set(list.map(s => String(s.h).replace(/^(s:w\d+:\d+:\d+):\d+$/, '$1'))).size;
  return { units, todaySplit, live, resetAsk, trials, state, book, after, okHead, label, byDay, dayCards, cardsHTML, dayKey, dayStart, DAY, GAPS, CHECK, CHECK2, FINAL };
})();
