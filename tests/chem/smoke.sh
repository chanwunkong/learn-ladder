#!/bin/bash
# 後中化學：無頭 Chrome 打開每一章，操作每個互動圖（按鈕、滑桿、選單、機構逐步播放）與每題練習題，回報錯誤。
# 用法：bash tests/chem/smoke.sh（需先 python3 build.py）
cd "$(dirname "$0")/../.." || exit 1
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP=$(mktemp -d)
cat > "$TMP/probe.js" <<'JS'
window.__errs = []; addEventListener('error', e => __errs.push(e.message)); const _ce = console.error; console.error = (...a) => { __errs.push(a.map(String).join(' ')); _ce(...a); };
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms)), fire = (e, t) => e.dispatchEvent(new Event(t, { bubbles: true }));
  await sleep(400);
  // 版面檢查：圖裡的文字是否互相重疊、是否超出圖框（每個選項、每一步動畫都檢查）
  const layout = [];
  const check = (w, tag) => { for (const svg of w.querySelectorAll('svg')) {
    const sb = svg.getBoundingClientRect(); if (!sb.width) continue;
    const T = [...svg.querySelectorAll('text')].filter(t => t.textContent.trim()).map(t => ({ t: t.textContent.trim(), r: t.getBoundingClientRect() })).filter(x => x.r.width > 0);
    for (const x of T) if (x.r.left < sb.left - 2 || x.r.right > sb.right + 2 || x.r.top < sb.top - 2 || x.r.bottom > sb.bottom + 2) layout.push(`${w.dataset.w}${tag} 超出：${x.t.slice(0, 16)}`);
    for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
      const a = T[i].r, b = T[j].r, ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 3 && oy > 3 && ox * oy > 0.3 * Math.min(a.width * a.height, b.width * b.height)) layout.push(`${w.dataset.w}${tag} 重疊：${T[i].t.slice(0, 12)} ／ ${T[j].t.slice(0, 12)}`);
    } } };
  for (const w of document.querySelectorAll('.widget')) check(w, '');
  const rep = { layout: [...new Set(layout)].slice(0, 15), widgets: 0, frames: 0, quiz: 0, shows: 0, failed: [...document.querySelectorAll('.widget .note.bad')].length };
  for (const w of document.querySelectorAll('.widget')) {
    rep.widgets++;
    for (const b of [...w.querySelectorAll('.seg button')]) {
      b.click(); await sleep(5); check(w, `［${b.textContent.trim().slice(0, 10)}］`);
      for (let k = 0; k < 6; k++) { const nx = w.querySelector('.mech-ctl [data-m="1"]'); if (!nx || nx.disabled) break; nx.click(); await sleep(950); rep.frames++; check(w, `［${b.textContent.trim().slice(0, 10)} 第${k + 2}步］`); }
    }
    for (const r of w.querySelectorAll('input[type=range]')) for (const v of [r.min, r.max, (+r.min + +r.max) / 2]) { r.value = v; fire(r, 'input'); }
    for (const s of w.querySelectorAll('select')) for (const o of [...s.options]) { s.value = o.value; fire(s, 'change'); }
    for (const c of w.querySelectorAll('input[type=checkbox]')) { c.click(); c.click(); }
    for (const b of [...w.querySelectorAll('button.btn')]) { if (!b.closest('.mech-ctl')) b.click(); }
    if (/\bNaN\b|\bundefined\b|\bInfinity\b/.test(w.textContent)) __errs.push(`${w.dataset.w}: 文字中出現 NaN/undefined`);
  }
  // 名詞：每個名詞都要能打開解釋框；有「在圖上看」就按一次；記下內文沒有連結到的名詞
  rep.terms = document.querySelectorAll('.tchip').length; rep.linked = new Set([...document.querySelectorAll('.tlink')].map(b => b.dataset.t)).size;
  rep.unlinked = [...document.querySelectorAll('.tchip')].filter(c => !document.querySelector(`.tlink[data-t="${c.dataset.t}"]`)).map(c => c.textContent);
  for (const c of document.querySelectorAll('.tchip')) { c.click(); const p = document.getElementById('tpop'); if (!p || p.hidden || !p.textContent.trim()) __errs.push('名詞解釋框沒有打開：' + c.textContent); const g = p && p.querySelector('[data-go]'); if (g) { g.click(); rep.shows++; } }
  for (const q of document.querySelectorAll('.q')) {
    rep.quiz++;
    for (const o of [...q.querySelectorAll('.opt')]) { if (!o.disabled) o.click(); const s = q.querySelector('[data-show]'); if (s) { s.click(); rep.shows++; } }
    if (!q.querySelector('.opt.right')) __errs.push('練習題沒有正解：' + q.querySelector('.qt').textContent.slice(0, 30));
  }
  rep.layout = [...new Set(layout)].slice(0, 25); const p = document.createElement('pre'); p.id = '__out'; p.textContent = JSON.stringify({ ...rep, errs: __errs }); document.body.appendChild(p);
})();
JS
sed 's#<script>#<script src="probe.js"></script><script>#' docs/chem/index.html | sed 's#src="probe.js"></script><script>#src="probe.js" defer></script><script>#' > "$TMP/p.html"
CHAPTERS=$(node -e "const fs=require('fs');console.log(new Function(['src/chem/content.js',...require('fs').readdirSync('src/chem/ch').map(f=>'src/chem/ch/'+f)].map(f=>fs.readFileSync(f,'utf8')).join('\n')+';return CH;')().map(c=>c.id).join(' '))")
fail=0
for c in home $CHAPTERS; do
  "$CHROME" --headless=new --disable-gpu --user-data-dir="$TMP/prof-$c" --window-size=1100,900 --virtual-time-budget=120000 --dump-dom "file://$TMP/p.html#$c" 2>/dev/null > "$TMP/out-$c" &
  pid=$!; ( sleep 240; kill -9 $pid ) >/dev/null 2>&1 & w=$!; disown $w; wait $pid 2>/dev/null; kill $w 2>/dev/null
  r=$(python3 -c "import re,sys,html;s=open(sys.argv[1]).read();m=re.search(r'<pre id=\"__out\">(.*?)</pre>',s,re.S);print(html.unescape(m.group(1)) if m else 'NO OUTPUT')" "$TMP/out-$c")
  if echo "$r" | grep -q '"errs":\[\]' && echo "$r" | grep -q '"failed":0' && echo "$r" | grep -q '"layout":\[\]' && { [ "$c" = home ] || ! echo "$r" | grep -q '"quiz":0,'; }; then echo "ok   $c  $r"; else echo "FAIL $c  $r"; fail=1; fi
done
rm -rf "$TMP"; exit $fail
