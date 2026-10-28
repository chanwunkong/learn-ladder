#!/bin/bash
# 用法：pages.sh 學校-年 題號...  → 把含這些題號的頁面轉成圖檔，印出路徑
D=/Users/martini/learn-ladder/analysis/exam/papers
f=$1; shift; pdf=$D/$f.pdf; n=$(pdfinfo $pdf | awk '/^Pages/{print $2}'); mkdir -p $D/img
want=" $* "; out=""
for p in $(seq 1 $n); do
  t=$(pdftotext -f $p -l $p -layout $pdf - 2>/dev/null)
  for q in $*; do if echo "$t" | grep -qE "^\s*$q\s*[.、．]"; then out="$out $p"; break; fi; done
done
for p in $(echo $out | tr ' ' '\n' | sort -nu); do pdftoppm -f $p -l $p -r 75 -png $pdf $D/img/$f-p$p >/dev/null 2>&1; ls $D/img/$f-p$p*.png; done
