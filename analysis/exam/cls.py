# 歸類紀錄：python3 cls.py 學校 年 "1 code,2 code,..."（或 "1-3 code"）→ 追加到 cls.tsv
import sys
s, y, spec = sys.argv[1], sys.argv[2], sys.argv[3]
rows = []
for part in spec.split(','):
    k, c = part.strip().split()
    a, b = (k.split('-') + [k])[:2] if '-' in k else (k, k)
    for q in range(int(a), int(b) + 1): rows.append(f'{s}\t{y}\t{q}\t{c}')
open(sys.argv[0].replace('cls.py', 'cls.tsv'), 'a').write('\n'.join(rows) + '\n')
print(len(rows), 'rows')
