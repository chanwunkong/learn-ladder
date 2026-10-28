# 列出某些主題代碼的全部歷屆題目（題幹前段），新到舊；用來逐題檢查章節是否教到
# 用法：python3 -I dump.py G-atom [G-bond ...]
import csv, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from split import split
codes = set(sys.argv[1:]); D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'papers')
rows = [r for r in csv.reader(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cls.tsv')), delimiter='\t') if len(r) == 4 and r[3] in codes]
cache = {}
for s, y, q, c in sorted(rows, key=lambda r: (-int(r[1]), r[0], int(r[2]))):
    k = f'{s}-{y}'
    if k not in cache:
        p = os.path.join(D, k + '.txt'); cache[k] = split(open(p, encoding='utf-8', errors='ignore').read()) if os.path.exists(p) else {}
    print(f'{k}-{q} [{c}] {cache[k].get(int(q), "（掃描檔，見圖）")[:230]}')
