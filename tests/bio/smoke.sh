#!/bin/bash
# 後中生物：無頭 Chrome 打開首頁、每一卷程度測驗與錯題本，每句點對或錯，回報錯誤與手機寬度溢出。
cd "$(dirname "$0")/../.." || exit 1
dup=$(grep -ho "^\(const\|let\|function\) [A-Za-z0-9_]*" src/bio/*.js src/bio/dg/*.js | awk '{print $2}' | sort | uniq -d)
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
  let k = 0;
  for (const st of document.querySelectorAll('.st')) { rep.q++; const b = st.querySelector(`[data-v="${k++ % 3 ? 1 : 0}"]`); if (b && !b.disabled) b.click(); }
  for (const st of document.querySelectorAll('.st')) if (!st.querySelector('.opt.right') || st.querySelector('.why').hidden) __errs.push('4 句判斷完沒有顯示答案：' + st.textContent.slice(0, 30));
  if (document.querySelector('.wait')) __errs.push('做完還留著等待提示');
  if (location.hash === '#dx-c' && !document.querySelector('#dxRes .pr')) __errs.push('做完一卷沒有出現結果');
  location.hash = ''; await sleep(200); wide();
  if (/\bNaN\b|\bundefined\b/.test(document.getElementById('main').textContent)) __errs.push('畫面出現 NaN/undefined');
  wide();
  const p = document.createElement('pre'); p.id = '__out'; p.textContent = JSON.stringify({ ...rep, errs: __errs }); document.body.appendChild(p);
})();
JS
sed 's#<script>#<script src="probe.js" defer></script><script>#' docs/bio/index.html > "$TMP/p.html"
fail=0
for r in home dx-c review; do
  for wd in 1000 390; do
    "$CHROME" --headless=new --disable-gpu --user-data-dir="$TMP/prof" --window-size=$wd,900 --virtual-time-budget=20000 --dump-dom "file://$TMP/p.html#$r" 2>/dev/null > "$TMP/out"
    o=$(python3 -c "import re,sys,html;s=open(sys.argv[1]).read();m=re.search(r'<pre id=\"__out\">(.*?)</pre>',s,re.S);print(html.unescape(m.group(1)) if m else 'NO OUTPUT')" "$TMP/out")
    if echo "$o" | grep -q '"errs":\[\]' && echo "$o" | grep -q '"wide":\[\]'; then echo "ok   $r@$wd  $o"; else echo "FAIL $r@$wd  $o"; fail=1; fi
  done
done
rm -rf "$TMP"; exit $fail
