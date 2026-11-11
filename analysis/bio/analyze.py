# 各主題題數與佔比（未加權、加權＝學年度−105、近三年 113–115、各校加權），輸出 result.tsv
import csv, collections
rows = [r for r in csv.reader(open('cls.tsv'), delimiter='\t') if len(r) == 4]
name = {'BC-mol': '生命的化學／巨分子', 'BC-enz': '能量、酵素與代謝調控', 'BC-resp': '細胞呼吸與醣脂胺基酸代謝', 'BC-photo': '光合作用',
  'CE-struct': '細胞構造、胞器與內膜運送', 'CE-memb': '細胞膜與膜運輸', 'CE-sig': '細胞訊息傳遞', 'CE-cycle': '細胞週期、分裂、凋亡與癌',
  'GE-mendel': '孟德爾、連鎖、性聯與人類遺傳', 'GE-mol': 'DNA 複製、轉錄、轉譯、突變與修復', 'GE-reg': '基因表現調控與表觀遺傳', 'GE-tech': '生物技術與實驗方法', 'GE-dev': '基因體與發育遺傳',
  'MI-virus': '病毒', 'MI-bact': '原核生物、細菌與病原',
  'EV-mech': '演化機制、族群遺傳、種化', 'EV-phylo': '系統分類與生命演化史',
  'DV-protist': '原生生物', 'DV-plant': '植物多樣性與生活史', 'DV-fungi': '真菌', 'DV-animal': '動物多樣性',
  'PL-form': '植物構造、運輸與營養', 'PL-horm': '植物激素、反應與生殖',
  'AN-dig': '消化與營養', 'AN-circ': '循環與氣體交換', 'AN-imm': '免疫', 'AN-osmo': '滲透調節、排泄與體溫', 'AN-endo': '內分泌', 'AN-repro': '動物生殖與胚胎發育', 'AN-nerv': '神經系統', 'AN-sense': '感覺與運動', 'AN-behav': '動物行為',
  'EC-pop': '族群生態', 'EC-comm': '群落與物種交互作用', 'EC-sys': '生態系、生物圈與保育', 'X-local': '台灣在地與地科常識'}
w = lambda y: int(y) - 105
U, W, R = collections.Counter(), collections.Counter(), collections.Counter()
S = {s: collections.Counter() for s in ('cmu', 'isu', 'tcu')}
for s, y, q, c in rows:
    U[c] += 1; W[c] += w(y); S[s][c] += w(y)
    if int(y) >= 113: R[c] += 1
tu, tw, tr = sum(U.values()), sum(W.values()), sum(R.values()); ts = {s: sum(v.values()) for s, v in S.items()}
pc = lambda a, b: f'{100 * a / b:4.1f}'
out = ['code\t名稱\t題數\t未加權%\t加權%\t近3年%\t中國\t義守\t慈濟\t每份約']
for c, _ in sorted(W.items(), key=lambda x: -x[1]):
    out.append(f"{c}\t{name[c]}\t{U[c]}\t{pc(U[c], tu)}\t{pc(W[c], tw)}\t{pc(R[c], tr)}\t" + '\t'.join(pc(S[s][c], ts[s]) for s in S) + f"\t{50 * W[c] / tw:.1f}")
grp = collections.Counter()
for c, v in W.items(): grp[c.split('-')[0]] += v
out.append('大類加權%\t' + '  '.join(f'{g} {pc(v, tw)}' for g, v in grp.most_common()))
for s in S:
    g = collections.Counter()
    for c, v in S[s].items(): g[c.split('-')[0]] += v
    out.append(f'{s}\t' + '  '.join(f'{k} {pc(v, ts[s])}' for k, v in g.most_common()))
open('result.tsv', 'w').write('\n'.join(out) + '\n'); print('\n'.join(out))
