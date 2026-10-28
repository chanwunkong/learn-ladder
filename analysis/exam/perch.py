import csv, collections
rows=[r for r in csv.reader(open('cls.tsv'),delimiter='\t') if len(r)==4]
M={'G-atom':'g1','G-bond':'g2','G-imf':'g2','G-mo':'g2b','G-stoich':'g3','G-sol':'g3','G-gas':'g4','G-thermo':'g5','G-kin':'g6','G-eq':'g7','G-ab':'g8','G-ksp':'g9','G-coord':'g9b','G-redox':'g10','G-nuc':'g11','G-desc':'g11b','G-anal':'g11b',
'O-struct':'o1','O-name':'o1b','O-acid':'o2','O-stereo':'o3','O-sn':'o4','O-alkene':'o5','O-rad':'o5b','O-poly':'o5b','O-conj':'o5c','O-arom':'o6','O-alc':'o7','O-carb':'o8','O-other':'o8b','O-acyl':'o9','O-alpha':'o9b','O-amine':'o10','O-spec':'o11','O-sugar':'o12','O-prot':'o12','O-bio':'o12'}
W=collections.Counter();R=collections.Counter();tw=tr=0;S={s:collections.Counter() for s in 'cmu isu tcu'.split()};ts=collections.Counter()
for s,y,q,c in rows:
  w=int(y)-105; tw+=w; ts[s]+=w
  if int(y)>=113: tr+=1
  if c=='O-rxn': continue
  u=M[c]; W[u]+=w; S[s][u]+=w
  if int(y)>=113: R[u]+=1
print('{'+', '.join(f"{u}: [{50*W[u]/tw:.1f}, {50*R[u]/tr:.1f}, {50*S['cmu'][u]/ts['cmu']:.1f}, {50*S['isu'][u]/ts['isu']:.1f}, {50*S['tcu'][u]/ts['tcu']:.1f}]" for u in sorted(W))+'}')
