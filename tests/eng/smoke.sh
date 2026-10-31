#!/bin/bash
# 後中英文：無頭 Chrome 打開每一段（7 天 × 早晚、錯題本、週報），點每一題的每個選項、長句的每一步、一步一步來，回報錯誤與手機寬度溢出。
cd "$(dirname "$0")/../.." || exit 1
dup=$(grep -ho "^\(const\|let\|function\) [A-Za-z0-9_]*" src/eng/*.js src/eng/wk/*.js | awk '{print $2}' | sort | uniq -d)
[ -n "$dup" ] && { echo "FAIL 重複的頂層名稱：$dup"; exit 1; }
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP=$(mktemp -d)
cat > "$TMP/probe.js" <<'JS'
window.__errs = []; addEventListener('error', e => __errs.push(e.message)); const _ce = console.error; console.error = (...a) => { __errs.push(a.map(String).join(' ')); _ce(...a); };
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms)); await sleep(300);
  const rep = { q: 0, sent: 0, guide: 0, wide: [] };
  const wide = () => { const W = document.documentElement.clientWidth; for (const e of document.querySelectorAll('#main *')) { const r = e.getBoundingClientRect(); if (r.width && r.right > W + 1 && !e.closest('textarea')) { rep.wide.push(e.tagName + '.' + e.className + ' ' + (e.textContent || '').trim().slice(0, 20)); break; } } };
  wide();
  for (const g of document.querySelectorAll('[data-g]')) { g.click(); rep.guide++; for (let k = 0; k < 4; k++) { const b = g.parentNode.querySelector('.gbody'); for (const o of [...b.querySelectorAll('.gopt')]) if (!o.disabled) o.click(); const n = b.querySelector('[data-n]'); if (!n) break; n.click(); } }
  for (const s of document.querySelectorAll('.sentc')) { rep.sent++; for (let k = 0; k < 6; k++) { const body = s.querySelector('.sbody'); for (const o of [...body.querySelectorAll('.opt')]) if (!o.disabled) o.click(); const n = body.querySelector('[data-n]'); if (!n) break; n.click(); } if (!s.querySelector('.core')) __errs.push('長句沒有走到最後：' + s.textContent.slice(0, 30)); }
  for (const q of document.querySelectorAll('.q')) { rep.q++; for (const o of [...q.querySelectorAll(':scope > .opts .opt')]) if (!o.disabled) o.click(); if (!q.querySelector(':scope > .opts .opt.right')) __errs.push('沒有正解：' + q.textContent.slice(0, 30)); }
  for (const u of document.querySelectorAll('[data-u]')) u.click();
  const ex = document.getElementById('exGo'); if (ex) { ex.click(); const t = document.getElementById('exTxt').value; rep.export = t.length; if (!/給 AI 的指示/.test(t) || /undefined|NaN/.test(t)) __errs.push('匯出內容異常'); }
  if (/\bNaN\b|\bundefined\b/.test(document.getElementById('main').textContent)) __errs.push('畫面出現 NaN/undefined');
  wide();
  const p = document.createElement('pre'); p.id = '__out'; p.textContent = JSON.stringify({ ...rep, errs: __errs }); document.body.appendChild(p);
})();
JS
sed 's#<script>#<script src="probe.js" defer></script><script>#' docs/eng/index.html > "$TMP/p.html"
fail=0
for r in home d1am d1pm d2am d2pm d3am d3pm d4am d4pm d5am d5pm d6am d6pm d7am d7pm review report; do
  for wd in 1000 390; do
    "$CHROME" --headless=new --disable-gpu --user-data-dir="$TMP/prof" --window-size=$wd,900 --virtual-time-budget=20000 --dump-dom "file://$TMP/p.html#$r" 2>/dev/null > "$TMP/out"
    o=$(python3 -c "import re,sys,html;s=open(sys.argv[1]).read();m=re.search(r'<pre id=\"__out\">(.*?)</pre>',s,re.S);print(html.unescape(m.group(1)) if m else 'NO OUTPUT')" "$TMP/out")
    if echo "$o" | grep -q '"errs":\[\]' && echo "$o" | grep -q '"wide":\[\]'; then echo "ok   $r@$wd  $o"; else echo "FAIL $r@$wd  $o"; fail=1; fi
  done
done
rm -rf "$TMP"; exit $fail
