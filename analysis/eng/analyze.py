"""後中英文試卷用字分析（試驗版）。
需要 wordfreq：python3 -m venv venv && venv/bin/pip install wordfreq
用法：venv/bin/python analysis/eng/analyze.py   （讀 analysis/eng/papers/*.txt，結果寫到 result.txt）
排名是 wordfreq 英文「詞形」排名（不是字族），所以只能看相對大小與趨勢。"""
import re, os, collections
from wordfreq import top_n_list

HERE = os.path.dirname(os.path.abspath(__file__))
PAPERS = ['cmu114', 'cmu115', 'tcu114', 'tcu115', 'isu113', 'isu114']
RANK = {w: i + 1 for i, w in enumerate(top_n_list('en', 60000))}
NONE = 99999


def rank1(w):
    cands = [w]
    for suf, rep in [('ies', 'y'), ('es', ''), ('s', ''), ('ied', 'y'), ('ed', ''), ('ed', 'e'), ('ing', ''), ('ing', 'e'), ('ly', '')]:
        if w.endswith(suf) and len(w) > len(suf) + 2:
            cands.append(w[:-len(suf)] + rep)
    rs = [RANK[c] for c in cands if c in RANK]
    return min(rs) if rs else NONE


def rank(w):
    w = w.lower().replace('’', "'").strip(".,;:!?\"'()‘“”")
    if w.endswith("'s"):
        w = w[:-2]
    if w.endswith("n't"):
        return 1
    parts = [x for x in w.split('-') if x]
    if len(parts) > 1:  # 複合字取最難的部分
        return max(rank1(x) for x in parts)
    return rank1(w) if w else NONE


def tokens(txt):
    toks = [t for t in re.findall(r"[A-Za-z][A-Za-z\-’']*", txt) if not t[0].isupper() or t.lower() in RANK]
    return [t for t in toks if len(t) > 1 or t.lower() in ('a', 'i')]


def vocab_options(txt):
    m = re.search(r'\n\s*I\.\s.*?\n(.*?)\n\s*(II|Ⅱ)\.', txt, re.S)
    sec = m.group(1) if m else ''
    opts = re.findall(r'\(([A-D])\)\s*([A-Za-z][A-Za-z\-’\' ]{1,30}?)(?=\s{2,}|\s*\([A-D]\)|\n|$)', sec)
    return [o[1].strip() for o in opts if len(o[1].split()) == 1]


BANDS = [(2000, '≤2k'), (5000, '2–5k'), (8000, '5–8k'), (12000, '8–12k'), (20000, '12–20k'), (NONE + 1, '>20k')]
band = lambda r: next(name for lim, name in BANDS if r <= lim)

out = []
out.append('一、字彙題選項的詞頻分布（單字選項數）')
for p in PAPERS:
    txt = open(os.path.join(HERE, 'papers', p + '.txt'), encoding='utf-8').read()
    ws = vocab_options(txt)
    c = collections.Counter(band(rank(w)) for w in ws)
    out.append(f'{p}  {len(ws):3d}  ' + '  '.join(f'{name} {c[name]}' for _, name in BANDS))

out.append('\n二、整卷英文用字：認得前 N 名詞形時的覆蓋率（%），與達 95%／98% 所需的詞形排名')
hard = {}
for p in PAPERS:
    txt = open(os.path.join(HERE, 'papers', p + '.txt'), encoding='utf-8').read()
    toks = tokens(txt)
    rs = sorted(rank(t) for t in toks)
    n = len(rs)
    cov = lambda k: sum(r <= k for r in rs) / n * 100
    need = lambda q: rs[int(q * n) - 1]
    out.append(f'{p}  字數 {n:5d}  2k {cov(2000):4.1f}  5k {cov(5000):4.1f}  8k {cov(8000):4.1f}  12k {cov(12000):4.1f}  20k {cov(20000):4.1f}  95%→{need(.95)}  98%→{need(.98)}')
    hard[p] = {t.lower().strip(".,;:’'") for t in toks if 8000 < rank(t) < NONE}

out.append('\n三、各卷 8000 名以後的字，也出現在其他任一卷的比例')
for p in PAPERS:
    others = set().union(*[hard[q] for q in PAPERS if q != p])
    out.append(f'{p}  難字 {len(hard[p])}  重複 {len(hard[p] & others) / len(hard[p]) * 100:.0f}%')

open(os.path.join(HERE, 'result.txt'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('\n'.join(out))
