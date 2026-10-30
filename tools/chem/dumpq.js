// node dumpq.js 章id [起 迄]：列出題目（* 為正解），已有步驟的標 [S]
const { CH, STEPS, strip, key } = require('./stlib.js');
const c = CH.find(x => x.id === process.argv[2]); const st = STEPS[c.id] || {};
for (const [k, arr] of [['q', c.quiz || []], ['x', c.exam || []]]) arr.forEach((q, i) => {
  console.log(`${k}${i}${st[key(c, q, k)] ? ' [S]' : ''} ${strip(q.q)} ｜ ${q.o.map((o, j) => (j === q.a ? '*' : '') + strip(o)).join(' / ')} ｜ ${strip(q.why || '').slice(0, 80)}`); });
