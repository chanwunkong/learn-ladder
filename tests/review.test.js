// 錯題排程（src/shared/review.js）：答錯 → 隔 1、3、7、14、30 天各答對一次才掌握；中途答錯從頭；考前總複習
const fs = require('fs'), path = require('path');
const REVIEW = new Function(fs.readFileSync(path.join(__dirname, '../src/shared/review.js'), 'utf8') + ';return REVIEW;')();
const D = REVIEW.DAY, t0 = new Date(2026, 10, 2, 9).getTime();
const ev = (day, ok) => ({ t: t0 + day * D, c: 'x', k: 'q', h: 'h1', ok, n: 1 });
const st = log => [...REVIEW.state(log).values()][0];
let fail = 0; const eq = (a, b, m) => { if (a !== b) { console.log('FAIL', m, a, '≠', b); fail = 1; } };
// 一路答對：第 1、4、11、25、55 天
let log = [ev(0, false)], day = 0;
for (const [g, k] of [[1, 1], [3, 2], [7, 3], [14, 4], [30, 5]]) { eq(st(log).open, true, `第 ${k} 格前仍在錯題本`); day += g; eq(st(log).due, REVIEW.dayStart(t0 + day * D), `第 ${k} 格到期日`); log.push(ev(day, true)); }
eq(st(log).open, false, '五格都過 → 掌握'); eq(day, 55, '第 55 天掌握');
// 還沒到期就答對：不前進
log = [ev(0, false), ev(1, true), ev(2, true)]; eq(st(log).stage, 1, '未到期答對不前進');
// 中途答錯：從第 1 格重新開始
log = [ev(0, false), ev(1, true), ev(4, false)]; eq(st(log).stage, 0, '答錯回第 1 格'); eq(st(log).due, REVIEW.dayStart(t0 + 5 * D), '隔 1 天');
// 同一天重做不影響
log = [ev(0, false), { ...ev(0, true), t: t0 + 3600e3 }]; eq(st(log).open, true, '同一天訂正不會離開錯題本');
// 考前總複習
log = [ev(0, false), ev(1, true), ev(4, true), ev(11, true), ev(25, true), ev(55, true)];
eq(REVIEW.book(log, REVIEW.FINAL - D).due.length, 0, '總複習前沒有到期'); eq(REVIEW.book(log, REVIEW.FINAL + D).due.length, 1, '總複習時到期一次');
log.push({ ...ev(0, true), t: REVIEW.FINAL + D }); eq(REVIEW.book(log, REVIEW.FINAL + 2 * D).due.length, 0, '總複習答對後完成');
// 新題目第一次就答對 → 3 天後確認題；確認答對 → 會了；確認答錯 → 進五格
log = [ev(0, true)]; eq(st(log).chk, true, '答對的新題變成確認題'); eq(REVIEW.book(log, t0 + 2 * D).due.length, 0, '確認題 3 天內不到期'); eq(REVIEW.book(log, t0 + 3 * D).due.length, 1, '第 3 天到期');
eq(REVIEW.book(log, t0).open.length, 0, '確認題不算在錯題本');
eq(st([ev(0, true), ev(3, true)]).open, false, '確認答對 → 會了');
eq(st([ev(0, true), ev(3, false)]).stage, 0, '確認答錯 → 第 1 格'); eq(st([ev(0, true), ev(3, false)]).chk, false, '確認答錯不再是確認題');
// 追問答錯 → 那次算猜對（答錯）
const fu = (day, ok) => ({ t: t0 + day * D + 1000, c: 'x', k: 'fu', fk: 'q', h: 'h1', ok, n: 1 });
log = [ev(0, true), fu(0, false)]; eq(st(log).open && !st(log).chk, true, '追問答錯 → 進錯題本'); eq(REVIEW.trials(log).length, 1, '追問不算一題'); eq(REVIEW.trials(log)[0].guess, true, '標記為猜對');
log = [ev(0, true), fu(0, true)]; eq(st(log).chk, true, '追問答對 → 確認題');
log = [ev(0, false), ev(1, true), fu(1, false)]; eq(st(log).stage, 0, '複習時理由答錯不前進');
// 重新練習：「之前的不算」（v）作廢之前的作答；照算（沒有 v）不影響；之後的作答照常
const rs = (day, v) => ({ t: t0 + day * D + 1, c: 'x', k: 'reset', h: 'reset:x', ...(v ? { v } : {}) });
eq(REVIEW.book([ev(0, false), rs(0, ['h1'])]).open.length, 0, '作廢後不在錯題本');
eq(REVIEW.book([ev(0, false), rs(0)]).open.length, 1, '照算 → 仍在錯題本');
eq(REVIEW.book([ev(0, false), rs(0, ['h2'])]).open.length, 1, '別的題目不受影響');
eq(st([ev(0, false), rs(0, ['h1']), ev(1, true)]).chk, true, '作廢後重做答對 → 當成新題');
if (fail) process.exit(1); console.log('錯題排程 OK');
