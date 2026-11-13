"""後中英文 30 份考卷（三校 106–115）的單字頻率表與主題比例。
需要：python3 -m venv venv && venv/bin/pip install wordfreq simplemma
用法：venv/bin/python analysis/eng/vocab.py   （讀 papers/*.txt，寫 vocab.tsv，摘要印在畫面上）
排名用 wordfreq 的「原形」排名（先用 simplemma 把變化形還原成原形），比 analyze.py 的詞形排名接近「常用字第幾名」。"""
import re, glob, os, collections
from wordfreq import top_n_list
import simplemma

D = os.path.dirname(os.path.abspath(__file__))
RANK = {w: i + 1 for i, w in enumerate(top_n_list('en', 200000))}
BANDS = [(0, 3000, '前3000'), (3000, 6000, '3000-6000'), (6000, 12000, '6000-12000'), (12000, 10**9, '12000以後')]


def band_of(r):
    for lo, hi, name in BANDS:
        if lo < r <= hi:
            return name


# 醫學與生命科學段落的判斷字（一段出現 3 個以上，就算醫學段落）
MED = set('''patient disease health medical medicine cell gene genetic brain drug cancer virus viral infection treatment symptom
clinical hospital doctor physician protein blood body tissue organ immune vaccine therapy diet nutrition obesity diabetes
heart lung liver kidney bacteria bacterial antibiotic dose surgery nurse mental depression anxiety sleep pain injury
chronic diagnosis diagnose syndrome hormone enzyme dna molecule neuron muscle bone skin chemical toxic pandemic epidemic
microbe microbiome metabolism insulin glucose stroke dementia trial placebo'''.split())

docs, low, caps = {}, set(), set()
for f in sorted(glob.glob(os.path.join(D, 'papers', '*.txt'))):
    name = os.path.basename(f)[:-4]
    if not re.match(r'(cmu|tcu|isu)\d{3}$', name):
        continue
    docs[name] = open(f, errors='ignore').read()

tf, df, school = collections.Counter(), collections.Counter(), collections.defaultdict(set)
med_words = all_words = 0
for name, text in docs.items():
    text = re.sub(r'(\w)-\n\s*(\w)', r'\1\2', text)          # 換行斷字
    seen = set()
    for tok in re.findall(r"[A-Za-z]+(?:'[a-z]+)?", text):
        if len(tok) < 3:
            continue
        lw = tok.lower()
        (low if tok[0].islower() else caps).add(lw)
        lem = simplemma.lemmatize(lw, lang='en').lower()
        tf[lem] += 1
        seen.add(lem)
    for lem in seen:
        df[lem] += 1
        school[lem].add(name[:3])
    # 主題：以空行分段，30 字以上的段落才算
    for block in re.split(r'\n\s*\n', text):
        ws = [simplemma.lemmatize(w.lower(), lang='en') for w in re.findall(r'[A-Za-z]{3,}', block)]
        if len(ws) < 30:
            continue
        all_words += len(ws)
        if sum(w in MED for w in ws) >= 3:
            med_words += len(ws)

proper = {w for w in caps if w not in low}
rows = [(w, df[w], tf[w], RANK.get(w, 999999)) for w in tf if w not in proper and w.isalpha()]
total = sum(r[2] for r in rows)

learned = set()
for f in glob.glob(os.path.join(D, '..', '..', 'src', 'eng', 'wk', 'w*a.js')):
    learned |= set(re.findall(r"\['([a-z-]+)', '(?:n|v|adj|adv|conj|prep)", open(f).read()))

with open(os.path.join(D, 'vocab.tsv'), 'w') as o:
    o.write('word\tpapers\tcount\trank\tband\tschools\tlearned\n')
    for w, d, c, r in sorted(rows, key=lambda x: (-x[1], -x[2])):
        o.write(f"{w}\t{d}\t{c}\t{r}\t{band_of(r)}\t{','.join(sorted(school[w]))}\t{'Y' if w in learned else ''}\n")

print(f'{len(docs)} 份，{total} 字（不含專有名詞），醫學與生命科學段落約佔 {100 * med_words / all_words:.0f}%')
print('程度\t不同字\t佔全文\t出現在≥3份\t≥6份\t≥10份')
for lo, hi, name in BANDS:
    b = [r for r in rows if lo < r[3] <= hi]
    print(f"{name}\t{len(b)}\t{100 * sum(r[2] for r in b) / total:.1f}%\t{sum(r[1] >= 3 for r in b)}\t{sum(r[1] >= 6 for r in b)}\t{sum(r[1] >= 10 for r in b)}")
