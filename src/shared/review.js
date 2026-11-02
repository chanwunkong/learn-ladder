/* ---------- 錯題排程（化學、英文與首頁共用） ----------
   只從練習紀錄推算，不另外存狀態，所以紀錄同步到哪裡，排程就跟到哪裡。
   紀錄每一筆：{ t 時間, c 章, k 題型, h 題目識別碼, ok, n 第幾次作答 }；n === 1 是「一次作答」的開頭。
   規則（2026-11-02 使用者要求加長）：每題每天只算第一次作答。
   - 第一次就答錯 → 進入錯題本，隔 1 天到期（第 1 格）。
   - 到期後（之後任何一天）第一次就答對 → 進到下一格，依序再隔 3、7、14、30 天；五格都過才算掌握，離開錯題本。
   - 在錯題本中又答錯 → 從第 1 格重新開始（隔 1 天）。
   - 考前總複習：FINAL 那天起，所有曾經答錯、已經掌握的題目再到期一次；答對就完成，答錯就重新進錯題本。 */
const REVIEW = (() => {
  const DAY = 864e5, GAPS = [1, 3, 7, 14, 30], FINAL = new Date(2027, 2, 1).getTime();   // 2027-03-01
  const dayStart = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const RULE = `第一次就答錯的題目會進錯題本，依序在隔 ${GAPS.join('、')} 天回來（共 ${GAPS.length} 格）。每次都要當天第一次就答對才往下一格；中途答錯就從第 1 格重新開始。五格都過才算掌握。2027 年 3 月 1 日起，所有曾經錯過的題目會再出現一次（考前總複習）。`;
  // 每題每天的第一次作答
  function trials(log) {
    const seen = new Set(), out = [];
    for (const e of log) {
      if (e.n !== 1 || !e.h) continue;
      const key = `${e.c}|${e.k}|${e.h}`, dk = dayKey(e.t);
      if (seen.has(key + '@' + dk)) continue;
      seen.add(key + '@' + dk); out.push({ key, t: e.t, ok: !!e.ok, c: e.c, k: e.k, h: e.h, i: e.i, qt: e.qt });
    }
    return out;
  }
  // 每題目前的狀態：{ key, c, k, h, i, qt, open, stage（0 起算的格數）, due, wrongs, last, first（第一次作答是否答對） }
  function state(log) {
    const m = new Map();
    for (const tr of trials(log)) {
      let s = m.get(tr.key);
      if (!s) { s = { key: tr.key, c: tr.c, k: tr.k, h: tr.h, i: tr.i, qt: tr.qt, open: false, stage: 0, due: 0, wrongs: 0, last: 0, first: tr.ok }; m.set(tr.key, s); }
      s.i = tr.i; s.qt = tr.qt || s.qt;
      if (!tr.ok) { s.open = true; s.stage = 0; s.wrongs++; s.due = dayStart(tr.t) + GAPS[0] * DAY; }
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
    const st = [...state(log).values()], all = st.filter(s => s.open);
    const fin = now >= FINAL ? st.filter(s => !s.open && s.wrongs > 0 && s.last < FINAL).map(s => ({ ...s, final: true, due: FINAL })) : [];
    return { open: all, due: all.filter(s => s.due <= now).concat(fin).sort((a, b) => a.due - b.due) };
  }
  // 答對之後的說明：下一次什麼時候回來
  function after(s, firstTry) {
    if (!firstTry) return '今天第一次沒答對，從第 1 格重新開始，明天再考一次。';
    if (s.final) return '考前總複習完成。';
    if (s.stage + 1 >= GAPS.length) return `五格都過了，這題已經掌握，離開錯題本（2027 年 3 月起的考前總複習還會再出現一次）。`;
    return `${GAPS[s.stage + 1]} 天後再考一次（進到第 ${s.stage + 2} / ${GAPS.length} 格）。`;
  }
  const label = s => (s.final ? '考前總複習' : `第 ${s.stage + 1} / ${GAPS.length} 格`);
  // 接下來 14 天每天到期幾題：[[dayKey, 題數]]
  function upcoming(open, now = Date.now(), days = 14) {
    const m = new Map();
    open.filter(s => s.due > now && s.due <= now + days * DAY).forEach(s => { const k = dayKey(s.due); m.set(k, (m.get(k) || 0) + 1); });
    return [...m.entries()].sort();
  }
  return { trials, state, book, after, label, upcoming, dayKey, dayStart, DAY, GAPS, RULE, FINAL };
})();
