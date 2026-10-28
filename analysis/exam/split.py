# 把試題文字切成一題一行（題幹前段＋選項開頭），供人工歸類主題；不保存完整題目
import re, sys, json
def split(txt):
    lines = [l for l in txt.splitlines() if not re.search(r'本試題|頁碼|學年度|考試科目|試題$|共計.*頁|考試日期', l)]
    t = '\n'.join(lines); qs = {}; nxt = 1
    for m in re.finditer(r'(?m)^\s*(\d{1,2})\s*[.、．]\s*', t):
        n = int(m.group(1))
        if n == nxt: qs[n] = m.end(); nxt += 1
    keys = sorted(qs); out = {}
    for i, k in enumerate(keys):
        end = [s for s in [m.start() for m in re.finditer(r'(?m)^\s*%d\s*[.、．]' % (k + 1), t)] if s > qs[k]]
        body = t[qs[k]: end[0] if end else qs[k] + 600]
        body = re.sub(r'\s+', ' ', body).strip()
        out[k] = body[:260]
    return out
if __name__ == '__main__':
    o = split(open(sys.argv[1], encoding='utf-8', errors='ignore').read())
    print(len(o), 'questions', file=sys.stderr)
    for k, v in o.items(): print(f'{k}. {v}')
