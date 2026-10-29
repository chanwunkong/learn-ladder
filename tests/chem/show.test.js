// 檢查每題的 show 指向存在的互動圖；不存在的直接從題目移除（避免按鈕失效）
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '../../src/chem');
const W = new Set(); for (const f of ['widgets.js', ...fs.readdirSync(path.join(root, 'w')).map(f => 'w/' + f)]) for (const m of fs.readFileSync(path.join(root, f), 'utf8').matchAll(/^W\.([A-Za-z0-9_]+)\s*=/gm)) W.add(m[1]);
let bad = 0; const fix = process.argv.includes('--fix');
for (const f of fs.readdirSync(path.join(root, 'ch'))) { const p = path.join(root, 'ch', f); let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/, show: \{ w: '([A-Za-z0-9_]+)', set: \{[^}]*\} \}/g, (m, w) => { if (W.has(w)) return m; bad++; if (!fix) console.log(f, '找不到互動圖', w); return fix ? '' : m; });
  if (fix) fs.writeFileSync(p, s); }
if (bad && !fix) process.exit(1); console.log(fix ? `已移除 ${bad} 個失效的 show` : 'show 全部有效');
