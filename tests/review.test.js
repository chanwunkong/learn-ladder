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
if (fail) process.exit(1); console.log('錯題排程 OK');
