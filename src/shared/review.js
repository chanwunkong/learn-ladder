/* ---------- 錯題排程（化學、英文與首頁共用） ----------
   只從練習紀錄推算，不另外存狀態，所以紀錄同步到哪裡，排程就跟到哪裡。
   紀錄每一筆：{ t 時間, c 章, k 題型, h 題目識別碼, ok, n 第幾次作答 }；n === 1 是「一次作答」的開頭。
   規則：每題每天只算第一次作答。
   - 第一次就答錯 → 進入錯題本，隔 1 天到期。
   - 到期後（之後任何一天）第一次就答對 → 再隔 3 天；再答對一次 → 掌握，離開錯題本。
   - 在錯題本中又答錯 → 從頭開始（隔 1 天）。 */
const REVIEW = (() => {
  const DAY = 864e5, GAPS = [1, 3];
  const dayStart = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
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
  // 每題目前的狀態：{ key, c, k, h, i, qt, stage, due, wrongs, last }
  function state(log) {
    const m = new Map();
    for (const tr of trials(log)) {
      let s = m.get(tr.key);
      if (!s) { s = { key: tr.key, c: tr.c, k: tr.k, h: tr.h, i: tr.i, qt: tr.qt, open: false, stage: 0, due: 0, wrongs: 0, last: 0 }; m.set(tr.key, s); }
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
  // 錯題本：還沒掌握的題目；due 為「今天以前到期」
  function book(log, now = Date.now()) {
    const all = [...state(log).values()].filter(s => s.open);
    return { open: all, due: all.filter(s => s.due <= now).sort((a, b) => a.due - b.due) };
  }
  return { trials, state, book, dayKey, dayStart, DAY };
})();
