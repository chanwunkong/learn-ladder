#!/bin/bash
# 後中化學：無頭 Chrome 打開每一章，操作每個互動圖（按鈕、滑桿、選單、機構逐步播放）與每題練習題，回報錯誤。
# 用法：bash tests/chem/smoke.sh（需先 python3 build.py）
cd "$(dirname "$0")/../.." || exit 1
# 各檔案的頂層名稱共用同一個 script 範圍，重複宣告會讓整頁失效
dup=$(grep -ho "^\(const\|let\|function\) [A-Za-z0-9_]*" src/chem/*.js src/chem/w/*.js src/chem/ch/*.js | awk '{print $2}' | sort | uniq -d)
[ -n "$dup" ] && { echo "FAIL 重複的頂層名稱：$dup"; exit 1; }
# 互動圖以 W.名稱 登記，同名時後載入的會蓋掉先載入的（不會報錯，只會讓某章的圖默默換成別章的）
wdup=$(grep -ho "^W\.[A-Za-z0-9_]*" src/chem/widgets.js src/chem/w/*.js | sort | uniq -d)
[ -n "$wdup" ] && { echo "FAIL 重複的互動圖名稱：$wdup"; exit 1; }
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
  // 嚴格檢查（寫作標準 B、C、D）：只對已依新標準修過的章節（tests/chem/strict.txt）
  const STRICT = __STRICT__.includes(location.hash.slice(1).split('/')[0]);
  const lineOf = e => Math.round(e.getBoundingClientRect().top);
  const strict = (w, tag) => { if (!STRICT) return;
    for (const row of w.querySelectorAll('.w-row')) { const kids = [...row.children], labs = kids.filter(k => k.matches('span.small, span.lbl, span.mut'));
      if (labs.length >= 2 && kids.some(k => k.tagName === 'BUTTON')) layout.push(`${w.dataset.w}${tag} 好幾組按鈕擠在同一列，沒有用 ctl() 分組`);
      for (const L of labs) { const nx = L.nextElementSibling; if (nx && nx.tagName === 'BUTTON' && lineOf(L) !== lineOf(nx)) layout.push(`${w.dataset.w}${tag} 標籤「${L.textContent.trim()}」和它的按鈕被拆開`); } }
    for (const c of w.querySelectorAll('[data-cur]')) { const sv = c.closest('svg'); if (!sv) continue; const a = c.getBoundingClientRect(), b = sv.getBoundingClientRect();
      if (!a.width && !a.height || a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom) layout.push(`${w.dataset.w}${tag} 目前選取的「${c.dataset.cur}」不在圖上`); } };
  const counts = w => [...w.querySelectorAll('.seg, .w-row')].map(s => s.querySelectorAll('button').length).join(',');
  for (const w of document.querySelectorAll('.widget')) {
    rep.widgets++; strict(w, ''); const c0 = counts(w);
    for (const b of [...w.querySelectorAll('.seg button')]) {
      if (b.disabled) continue;
      b.click(); await sleep(5); check(w, `［${b.textContent.trim().slice(0, 10)}］`); strict(w, `［${b.textContent.trim().slice(0, 10)}］`);
      if (STRICT && counts(w) !== c0) layout.push(`${w.dataset.w} 按「${b.textContent.trim().slice(0, 10)}」後選項數量改變（整列重排）`);
      for (let k = 0; k < 6; k++) { const nx = w.querySelector('.mech-ctl [data-m="1"]'); if (!nx || nx.disabled) break; nx.click(); await sleep(1300); rep.frames++; check(w, `［${b.textContent.trim().slice(0, 10)} 第${k + 2}步］`); }
    }
    for (const b of [...w.querySelectorAll('button.btn:not([data-m])')]) { b.click(); await sleep(5); check(w, `［${b.textContent.trim().slice(0, 10)}］`); }
    if (!w.querySelector('.seg button')) { const z = w.querySelector('.mech-ctl [data-m="0"]'); if (z) z.click(); for (let k = 0; k < 6; k++) { const nx = w.querySelector('.mech-ctl [data-m="1"]'); if (!nx || nx.disabled) break; nx.click(); await sleep(1300); rep.frames++; check(w, `［第${k + 2}步］`); } }
    // 版面跳動：拖滑桿時，數值卡的位置與大小不可改變；卡片裡的文字不可被截斷（strict 章節）
    for (const r of STRICT ? w.querySelectorAll('input[type=range]') : []) {
      const sig = () => [...w.querySelectorAll('.cards > .card')].map(c => { const b = c.getBoundingClientRect(); return `${Math.round(b.left)},${Math.round(b.top - w.getBoundingClientRect().top)},${Math.round(b.width)},${Math.round(b.height)}`; }).join(' ');
      r.value = r.min; fire(r, 'input'); const s0 = sig();
      for (const v of [r.max, (+r.min + +r.max) / 2, +r.min + (r.max - r.min) * 0.27, +r.min + (r.max - r.min) * 0.81]) {
        r.value = v; fire(r, 'input'); check(w, `［${(r.closest('label') || r.parentNode).textContent.trim().slice(0, 6)}=${r.value}］`); if (sig() !== s0) layout.push(`${w.dataset.w} 拖動「${(r.closest('label') || r.parentNode).textContent.trim().slice(0, 8)}」時數值卡跳動`);
        for (const e of w.querySelectorAll('.card b, .card span')) if (e.scrollWidth > e.clientWidth + 1) layout.push(`${w.dataset.w} 數值卡文字被截斷：${e.textContent.slice(0, 16)}`);
      }
    }
    for (const s of w.querySelectorAll('select')) for (const o of [...s.options]) { s.value = o.value; fire(s, 'change'); if (STRICT) check(w, `［${o.textContent.trim()}］`); strict(w, `［${o.textContent.trim()}］`); }
    for (const c of w.querySelectorAll('input[type=checkbox]')) { c.click(); c.click(); }
    for (const b of [...w.querySelectorAll('button.btn')]) { if (!b.closest('.mech-ctl')) b.click(); }
    if (/\bNaN\b|\bundefined\b|\bInfinity\b/.test(w.textContent)) __errs.push(`${w.dataset.w}: 文字中出現 NaN/undefined`);
  }
  // 名詞：每個名詞都要能打開解釋框；有「在圖上看」就按一次；記下內文沒有連結到的名詞
  { const ids = {}; document.querySelectorAll('[id]').forEach(e => { if (!e.closest('svg')) ids[e.id] = (ids[e.id] || 0) + 1; }); const d = Object.keys(ids).filter(k => ids[k] > 1); if (d.length) __errs.push('重複的 id（會讓按鈕或文字互相覆蓋）：' + d.join(', ')); }
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
STRICT_JSON=$(grep -v '^#' tests/chem/strict.txt | grep . | python3 -c "import json,sys;print(json.dumps(sys.stdin.read().split()))")
sed -i '' "s#__STRICT__#$STRICT_JSON#" "$TMP/probe.js"
sed 's#<script>#<script src="probe.js"></script><script>#' docs/chem/index.html | sed 's#src="probe.js"></script><script>#src="probe.js" defer></script><script>#' > "$TMP/p.html"
CHAPTERS=$(node -e "const fs=require('fs');console.log(new Function(['src/chem/content.js',...require('fs').readdirSync('src/chem/ch').map(f=>'src/chem/ch/'+f)].map(f=>fs.readFileSync(f,'utf8')).join('\n')+';return CH;')().map(c=>c.id).join(' '))")
CHAPTERS=${ONLY:-$CHAPTERS}
# 一節一頁的章節（app.js 的 PAGED）：概覽頁、每一節、綜合練習都要各測一次
PAGED=$(grep -o "^const PAGED = \[[^]]*\]" src/chem/app.js | grep -o "'[a-z-]*'" | tr -d "'")
CHAPTERS=$(for c in $CHAPTERS; do if echo " $PAGED " | grep -q " $c "; then n=$(node -e "const fs=require('fs');const CH=new Function(['src/chem/content.js',...fs.readdirSync('src/chem/ch').map(f=>'src/chem/ch/'+f)].map(f=>fs.readFileSync(f,'utf8')).join('\\n')+';return CH;')();console.log(CH.find(x=>x.id==='$c').sections.length)"); echo "$c"; for k in $(seq 1 $n); do echo "$c/$k"; done; [ "$(node -e "const fs=require('fs');const CH=new Function(['src/chem/content.js',...fs.readdirSync('src/chem/ch').map(f=>'src/chem/ch/'+f)].map(f=>fs.readFileSync(f,'utf8')).join('\\n')+';return CH;')();const c=CH.find(x=>x.id==='$c'),W=s=>[].concat(s.w||[]);console.log([...c.quiz,...(c.exam||[])].some(q=>!q.s&&!(q.show&&c.sections.some(x=>W(x).includes(q.show.w))))?1:0)")" = 1 ] && echo "$c/mix"; else echo "$c"; fi; done)
fail=0
for c in home $CHAPTERS; do
  "$CHROME" --headless=new --disable-gpu --user-data-dir="$TMP/prof-${c//\//-}" --window-size=${SMOKE_W:-1100},900 --virtual-time-budget=120000 --dump-dom "file://$TMP/p.html#$c" 2>/dev/null > "$TMP/out-${c//\//-}" &
  pid=$!; ( sleep 240; kill -9 $pid ) >/dev/null 2>&1 & w=$!; disown $w; wait $pid 2>/dev/null; kill $w 2>/dev/null
  r=$(python3 -c "import re,sys,html;s=open(sys.argv[1]).read();m=re.search(r'<pre id=\"__out\">(.*?)</pre>',s,re.S);print(html.unescape(m.group(1)) if m else 'NO OUTPUT')" "$TMP/out-${c//\//-}")
  if echo "$r" | grep -q '"errs":\[\]' && echo "$r" | grep -q '"failed":0' && echo "$r" | grep -q '"layout":\[\]' && { [ "$c" = home ] || echo " $PAGED " | grep -q " $c " || ! echo "$r" | grep -q '"quiz":0,'; }; then echo "ok   $c  $r"; else echo "FAIL $c  $r"; fail=1; fi
done
rm -rf "$TMP"; exit $fail
