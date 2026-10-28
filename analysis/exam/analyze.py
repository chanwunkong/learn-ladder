import csv, collections, sys
rows=[r for r in csv.reader(open('cls.tsv'),delimiter='\t') if len(r)==4]
name={'G-atom':'原子結構/週期','G-bond':'鍵結/VSEPR/混成','G-mo':'分子軌域理論','G-imf':'分子間力/固液態','G-stoich':'計量','G-gas':'氣體','G-sol':'溶液/依數','G-thermo':'熱力學','G-kin':'動力學','G-eq':'化學平衡','G-ab':'酸鹼/pH','G-ksp':'Ksp','G-redox':'氧化還原/電化學','G-coord':'配位化學','G-nuc':'核化學','G-desc':'元素/材料/生活化學','G-anal':'分析化學/儀器',
'O-struct':'結構/構形/異構','O-acid':'有機酸鹼','O-name':'命名','O-stereo':'立體化學','O-sn':'SN/E','O-rad':'自由基鹵化','O-alkene':'烯炔','O-conj':'共軛/DA/周環','O-arom':'芳香族','O-alc':'醇醚環氧/酚','O-carb':'醛酮','O-acyl':'羧酸衍生物','O-alpha':'α-碳/縮合','O-amine':'胺/雜環','O-spec':'光譜','O-sugar':'醣','O-prot':'胺基酸/蛋白','O-bio':'核酸/脂質/其他生化','O-poly':'聚合物','O-other':'有機金屬/人名反應/綜合','O-rxn':'產物判斷(未細分)'}
ch={'G-atom':'atom','G-bond':'vsepr','G-mo':'— 缺','G-imf':'vsepr/phase','G-stoich':'stoich','G-gas':'gas','G-sol':'stoich','G-thermo':'thermo','G-kin':'kinetics','G-eq':'equilibrium','G-ab':'acid-base','G-ksp':'ksp','G-redox':'electro','G-coord':'△ ksp 一段','G-nuc':'phase','G-desc':'— 缺','G-anal':'— 缺',
'O-struct':'bonding/stereo','O-acid':'org-acid','O-name':'— 缺','O-stereo':'stereo','O-sn':'sn-e','O-rad':'△ 零星','O-alkene':'alkene','O-conj':'— 缺','O-arom':'aromatic','O-alc':'alcohol','O-carb':'carbonyl','O-acyl':'acyl','O-alpha':'△ carbonyl 一段','O-amine':'amine','O-spec':'spectro','O-sugar':'biomol','O-prot':'biomol','O-bio':'biomol','O-poly':'— 缺','O-other':'— 缺','O-rxn':''}
w=lambda y:int(y)-105
U=collections.Counter(); W=collections.Counter(); R=collections.Counter(); S={s:collections.Counter() for s in('cmu','isu','tcu')}
for s,y,q,c in rows:
  U[c]+=1; W[c]+=w(y); S[s][c]+=w(y)
  if int(y)>=113: R[c]+=1
tu,tw,tr=sum(U.values()),sum(W.values()),sum(R.values()); ts={s:sum(v.values()) for s,v in S.items()}
pc=lambda a,b:f'{100*a/b:4.1f}'
print('code\t名稱\t題數\t未加權%\t加權%\t近3年%\t中國\t義守\t慈濟\t現有章節')
for c,_ in sorted(W.items(),key=lambda x:-x[1]):
  print(f"{c}\t{name[c]}\t{U[c]}\t{pc(U[c],tu)}\t{pc(W[c],tw)}\t{pc(R[c],tr)}\t"+'\t'.join(pc(S[s][c],ts[s]) for s in S)+f"\t{ch[c]}")
g=sum(v for k,v in W.items() if k[0]=='G'); print('普化加權%',pc(g,tw),' 有機%',pc(tw-g,tw))
for s in S: print(s,'普化%',pc(sum(v for k,v in S[s].items() if k[0]=='G'),ts[s]))
