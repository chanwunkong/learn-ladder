/* ---------- 後中化學：有機命名 ---------- */
CH.push({
  id: 'naming', unit: 'o1b', title: '有機命名',
  lede: '每一份考卷都有「這個結構叫什麼」或「這個名字是哪個結構」的題目。IUPAC 命名其實只有幾個步驟：選主鏈、編號、排序，再加上官能基的字尾與立體組態。這一章把步驟一個個拆開，用圖檢查每一步。',
  sections: [
    { h: '烷類的名字怎麼組成？', w: 'namealk', body: `
<p>名稱由三部分組成：<b>取代基</b>（字首）+ <b>主鏈</b>的字根 + 官能基字尾。碳數的字根是 meth-（1）、eth-（2）、prop-（3）、but-（4）、pent-（5）、hex-（6）、hept-（7）、oct-（8）、non-（9）、dec-（10），中文依序是甲、乙、丙、丁、戊、己、庚、辛、壬、癸。</p>
<p>下圖切換編號方向，比較兩個方向的位置數組。命名步驟：</p>
<ol><li><b>選主鏈</b>：最長的連續碳鏈。有兩條一樣長時，選取代基較多的那條。主鏈不一定畫成一直線，要沿著轉折去數。</li>
<li><b>編號</b>：從靠近取代基的一端開始。兩個方向逐一比較位置數字，第一個不同的數字較小的方向正確（2,2,4 勝過 2,4,4）。若兩個方向完全相同，讓英文字母排在前面的取代基拿較小的號碼（3-ethyl-4-methylhexane）。</li>
<li><b>排序</b>：取代基依英文字母順序寫，數字和名稱之間用連字號，數字之間用逗號。相同的取代基合併成 di-、tri-、tetra-，這些倍數字首<b>不算進字母排序</b>（ethyl 排在 dimethyl 前面）。</li></ol>
<p>鹵素和烷基一樣是字首（fluoro、chloro、bromo、iodo），一起參加編號與排序：2-chloro-3-methylpentane。</p>` },
    { h: '取代基的名字有哪些？', w: 'alkyl', body: `
<p>取代基是主鏈上的分支，把烷的字尾 -ane 換成 -yl：CH₃– 是 methyl，CH₃CH₂– 是 ethyl。三個碳以上的取代基，連接點不同就有不同的名字，切換下圖看連接碳的位置。</p>
<p>連接碳是幾級碳，決定了 sec-、tert- 字首：<b>二級碳</b>連接的丁基是 sec-butyl，<b>三級碳</b>連接的是 tert-butyl。iso- 指末端有 (CH₃)₂CH– 的分支。</p>
<p>如果分支本身還有分支，就把分支當成一條小鏈，從連接碳編為 1 號，整個名稱放進括號：–C(CH₃)₂CH₂CH(CH₃)₂ 的最長鏈是 4 個碳，1 號碳上有兩個甲基、3 號碳上有一個，名稱是 (1,1,3-trimethylbutyl)。</p>` },
    { h: '環狀化合物怎麼命名？', w: 'bicyclo', body: `
<p><b>單環</b>：在字根前加 cyclo-，例如 cyclohexane。環上只有一個取代基時不必編號（methylcyclohexane）；有兩個以上時，讓位置數組最小，若平手則字母較前的取代基為 1 號：1-ethyl-3-methylcyclohexane。環與鏈相連時，碳數較多的當主體：環己烷接辛基叫 cyclohexyloctane（1-cyclohexyloctane），接丁基則叫 butylcyclohexane。</p>
<p><b>環烯</b>：雙鍵的兩個碳一定是 1、2 號，再讓取代基拿最小的號碼：異丙基接在雙鍵旁的飽和碳上，名稱是 3-isopropylcyclopentene。兩個雙鍵隔一個單鍵的六員環是 1,3-cyclohexadiene，隔兩個的是 1,4-cyclohexadiene。</p>
<p><b>雙環</b>：兩個環共用的碳稱為<b>橋頭碳</b>，下圖切換幾個例子。名稱是 bicyclo[a.b.c]＋總碳數的字根，a、b、c 是三條橋上的碳數，由大到小排列。</p>
<p>要數一個分子有<b>幾個環</b>，看骨架上的鍵數與原子數：環數 = 鍵數 − 原子數 + 1（只算構成骨架的鍵和原子，不算 H）。降冰片烷有 7 個碳、8 個 C–C 鍵，所以是 2 個環；金剛烷 10 個碳、12 個 C–C 鍵，是 3 個環。</p>` },
    { h: '有好幾個官能基時，誰當字尾？', w: 'suffix', body: `
<p>點選下圖的官能基，看它當字尾與當字首時的寫法。規則是：</p>
<ol><li>優先順序最高的官能基當<b>字尾</b>，主鏈必須包含它，並且給它最小的編號。</li>
<li>其他官能基改成字首，和烷基一起排字母順序：HOCH₂CH₂CHO 是 3-hydroxypropanal。</li>
<li>字尾前要寫出位置：CH₃CH(OH)CH₃ 是 propan-2-ol（舊寫法 2-propanol）。(CH₃)₂CHCH₂CH₂OH 先讓 OH 拿 1 號，名稱是 3-methylbutan-1-ol（舊寫法 3-methyl-1-butanol），俗名 isopentyl alcohol。</li></ol>
<p><b>烯與炔</b>：雙鍵用 -ene、參鍵用 -yne，主鏈要盡量包含多重鍵。同時有兩者時，讓多重鍵整組拿最小的編號；若兩個方向一樣，雙鍵優先拿小號。所以 CH₃CH=CH–C≡CH 從參鍵端編號（1、3）勝過從另一端（2、4），名稱是 pent-3-en-1-yne；CH₂=CH–CH₂–C≡CH 兩端都是（1、4），雙鍵拿 1 號：pent-1-en-4-yne。</p>
<p><b>酯</b>的名稱分兩段：先寫接在 O 上的烷基，再寫酸的部分（-ic acid 改成 -ate）。CH₃COOCH(CH₃)₂ 是 isopropyl acetate（乙酸異丙酯），HCOOCH₂CH₃ 是 ethyl formate（甲酸乙酯），CH₃CH₂COOCH₂CH₃ 是 ethyl propanoate。中文剛好相反：先講酸，再講醇的部分。</p>` },
    { h: '雙鍵的 E 和 Z 怎麼判斷？', w: 'ez', body: `
<p>雙鍵不能旋轉，所以兩端的基團可以在同側或對側。選擇下圖四個位置的基團，看組態怎麼變。判斷步驟：</p>
<ol><li>在雙鍵的每一個碳上，用 <b>CIP 規則</b>比出兩個基團中優先的一個：先比直接相連原子的原子序（Br &gt; Cl &gt; O &gt; C &gt; H）；相同時，往外一層列出各自接的三個原子，由大到小逐一比較，第一個不同的就決定勝負（–CH₂OH 的 (O,H,H) 勝過 –CH(CH₃)₂ 的 (C,C,H)）。雙鍵視為接了兩個相同原子。</li>
<li>兩個優先基團在同側為 <b>Z</b>，在對側為 <b>E</b>。</li></ol>
<p>cis/trans 只適用於兩端各有一個相同基團（通常是 H）的情形；E/Z 適用於所有雙鍵。兩者不一定對應：(Z)-2-bromobut-2-ene 的兩個甲基是 trans。</p>
<p>分子有兩個雙鍵時，每一個都要標出組態和位置，寫在名稱最前面，例如 (3E,5Z)-octa-3,5-diene。立體中心的 R/S 也一樣寫在前面並加上位置：(4R)-2,2,4-trimethylhexane。R/S 的判斷在「構形與立體化學」一章。</p>` },
    { h: '苯的衍生物與常見俗名', body: `
<p>苯環上的取代基有許多保留的俗名，IUPAC 也接受，考題常直接使用：</p>
<ul><li><b>母體名稱</b>：toluene（甲苯，C₆H₅CH₃）、phenol（酚，C₆H₅OH）、aniline（苯胺，C₆H₅NH₂）、anisole（苯甲醚，C₆H₅OCH₃）、benzaldehyde（苯甲醛，C₆H₅CHO）、benzoic acid（苯甲酸）、acetophenone（苯乙酮，C₆H₅COCH₃）。</li>
<li>苯環當取代基時叫 <b>phenyl</b>（C₆H₅–），C₆H₅CH₂– 叫 benzyl。(C₆H₅)₂NH 是 diphenylamine，C₆H₅CH₂NH₂ 是 benzylamine。</li>
<li>二取代苯用 <b>ortho-（o-，1,2）、meta-（m-，1,3）、para-（p-，1,4）</b>。三個以上取代基時改用數字：以母體的官能基碳為 1 號，其他取代基拿最小號碼、依字母排序。例如 4-chloro-3-methylbenzaldehyde：CHO 所在的碳是 1 號。</li>
<li><b>戴奧辛</b>（2,3,7,8-tetrachlorodibenzo-p-dioxin）：中間的六員環含兩個互為對位（1,4）的 O，兩側各接一個苯環，四個 Cl 分別在兩側苯環上離 O 最遠的位置。</li></ul>
<p>常見俗名與結構：acetone（丙酮）、acetic acid（乙酸）、formic acid（甲酸）、formaldehyde（甲醛）、diethyl ether（乙醚，CH₃CH₂OCH₂CH₃）、methyl acetate（乙酸甲酯，CH₃COOCH₃）。</p>
<p>含氮官能基的名稱：R₂C=N–R 是亞胺（imine），R₂C=N–OH 是肟（oxime），R₂C=N–NH₂ 是腙（hydrazone），R₂C=N₂ 是重氮化合物（diazo），R–N=N–R 是偶氮化合物（azo）。</p>
<p>試劑常用縮寫：LiAlH₄（lithium aluminum hydride，LAH）、DIBAL-H（diisobutylaluminum hydride）、NaBH₄（sodium borohydride）、L-Selectride（lithium tri-sec-butylborohydride）、LDA（lithium diisopropylamide）、PCC（pyridinium chlorochromate）、mCPBA（meta-chloroperoxybenzoic acid）、NBS（N-bromosuccinimide），溶劑 THF（tetrahydrofuran）、DMSO（dimethyl sulfoxide）、DMF（N,N-dimethylformamide）。</p>` },
  ],
  quiz: [
    { q: '(CH₃)₃CCH₂CH(CH₃)₂ 的正確名稱？', o: ['2,2,4-trimethylpentane', '2,4,4-trimethylpentane', 'isooctane-2,2,4', '1,1,1,3-tetramethylbutane'], a: 0,
      why: '主鏈 5 個碳，兩個方向的位置是 2,2,4 與 2,4,4，第一個不同的數字 2 < 4。', show: { w: 'namealk', set: { i: 1, rev: 0 } } },
    { q: '兩個方向編號後位置數組相同（3,4）時，誰拿較小的號碼？', o: ['英文字母排在前面的取代基', '碳數較多的取代基', '先寫在結構左邊的', '任意都可以'], a: 0,
      why: '例如 3-ethyl-4-methylhexane，ethyl 的 e 在 methyl 的 m 前面。' },
    { q: '5-ethyl-3,5-dimethylheptane 這個名字錯在哪裡？', o: ['編號方向錯了，應為 3-ethyl-3,5-dimethylheptane', '取代基順序錯了', '主鏈選錯了', '沒有錯'], a: 0,
      why: '反向編號的位置是 3,3,5，比 3,5,5 小。', show: { w: 'namealk', set: { i: 3, rev: 1 } } },
    { q: '排字母順序時，sec-butyl 排在哪個字母？', o: ['b', 's', 'u', '最後'], a: 0,
      why: 'sec-、tert- 以及 di-、tri- 不參加排序；iso- 要參加。', show: { w: 'alkyl', set: { k: 'sbu' } } },
    { q: 'tert-butyl 的連接碳是？', o: ['三級碳', '一級碳', '二級碳', '四級碳'], a: 0,
      why: '連接碳上接了三個甲基（連同主鏈共四個碳）。', show: { w: 'alkyl', set: { k: 'tbu' } } },
    { q: 'bicyclo[3.2.1]octane 有幾個碳？', o: ['8', '6', '7', '9'], a: 0,
      why: '3 + 2 + 1 + 2 個橋頭碳 = 8。', show: { w: 'bicyclo', set: { c: 'nb' } } },
    { q: '分子同時有 –COOH 與 –OH，命名時？', o: ['字尾為 -oic acid，OH 寫成 hydroxy-', '字尾為 -ol，COOH 寫成 carboxy-', '兩個都當字尾', '依位置先後決定'], a: 0,
      why: '羧酸優先順序高於醇。', show: { w: 'suffix', set: { i: 0 } } },
    { q: 'CH₃COCH₂CH₂OH 的名稱？', o: ['4-hydroxybutan-2-one', '1-hydroxybutan-3-one', '3-oxobutan-1-ol', '4-hydroxy-2-butanal'], a: 0,
      why: '酮優先於醇，C=O 要拿最小號碼（2），OH 在 4 號。', show: { w: 'suffix', set: { i: 5 } } },
    { q: 'cis-2-butene 的 E/Z 組態？', o: ['Z', 'E', '沒有 E/Z', '要看溫度'], a: 0,
      why: '每端的優先基團都是 CH₃，兩個在同側。', show: { w: 'ez', set: { a: 1, b: 0, c: 1, d: 0 } } },
    { q: '–CH₂OH 和 –CH(CH₃)₂ 依 CIP 規則誰較優先？', o: ['–CH₂OH', '–CH(CH₃)₂', '兩者相同', '無法比較'], a: 0,
      why: '直接相連都是 C；下一層 (O,H,H) 與 (C,C,H) 比較，第一個 O > C。', show: { w: 'ez', set: { a: 4, b: 3, c: 1, d: 0 } } },
    { q: '對二氯苯的編號寫法？', o: ['1,4-dichlorobenzene', '1,2-dichlorobenzene', '1,3-dichlorobenzene', '1,6-dichlorobenzene'], a: 0,
      why: 'para = 1,4；ortho = 1,2；meta = 1,3。' },
    { q: 'CH₃CH₂COOCH₃ 的名稱？', o: ['methyl propanoate（丙酸甲酯）', 'propyl methanoate', 'ethyl acetate', 'methyl butanoate'], a: 0,
      why: 'O 上的烷基是甲基，酸的部分有 3 個碳（含羰基碳）。', show: { w: 'suffix', set: { i: 1 } } },
  ],
  exam: [
    { src: '仿 中國醫 110 第 7 題', q: '主鏈 7 個碳，2、3、5 號碳各有一個甲基、4 號碳有一個丙基。正確名稱？', o: ['2,3,5-trimethyl-4-propylheptane', '4-propyl-2,3,5-trimethylheptane', '4-sec-butyl-2,3-dimethylheptane', '3,5,6-trimethyl-4-propylheptane'], a: 0,
      why: '經過丙基的鏈也是 7 個碳，但只有 3 個取代基，所以選 4 個取代基的那條；字母 m 在 p 前面。' },
    { src: '仿 義守 110 第 2 題', q: '下列名稱何者正確？', o: ['4,4-diethyl-2-methylhexane', '3-ethyl-4,4-dimethylhexane', '2-ethylpentane', '5,5-dimethyl-3-ethylhexane'], a: 0,
      why: 'B 應為 4-ethyl-3,3-dimethylhexane；C 主鏈選錯，應為 3-methylhexane；D 編號與排序都錯，應為 4-ethyl-2,2-dimethylhexane。' },
    { src: '仿 中國醫 112 第 1 題', q: 'CH₃–CHCl–CH(CH₂CH₃)–CH₂CH₂CH₃ 的名稱？', o: ['2-chloro-3-ethylhexane', '3-ethyl-2-chlorohexane', '5-chloro-4-ethylhexane', '3-(1-chloroethyl)hexane'], a: 0,
      why: '最長鏈 6 個碳；Cl 也是字首，和烷基一起編號、排序，c 在 e 前面。' },
    { src: '仿 義守 108 第 39 題', q: 'CH₃CH₂–CH(CH₃)–CH(CH₂CH₃)–CH₂CH₃ 的名稱？', o: ['3-ethyl-4-methylhexane', '4-ethyl-3-methylhexane', '3-methyl-4-ethylhexane', '3-sec-butylpentane'], a: 0,
      why: '主鏈 6 個碳，兩個方向都是 3,4，由字母較前的 ethyl 拿 3 號。' },
    { src: '仿 慈濟 115 第 13 題', q: '取代基 –C(CH₃)₂CH₂CH(CH₃)₂ 的名稱？', o: ['1,1,3-trimethylbutyl', '1,3,3-trimethylbutyl', '1,1,3,3-tetramethylpropyl', '2,2,4-trimethylbutyl'], a: 0,
      why: '從連接碳編為 1 號，取最長的 4 碳鏈，甲基在 1、1、3。', show: { w: 'alkyl', set: { k: 'tbu' } } },
    { src: '仿 中國醫 114 第 17 題', q: 'CH₂=CH–CH₂–C≡CH 的名稱？', o: ['pent-1-en-4-yne', 'pent-4-en-1-yne', 'pent-1-yn-4-ene', 'pent-4-yn-1-ene'], a: 0,
      why: '兩個方向都是 1、4，平手時雙鍵拿較小的號碼；名稱中 -en- 寫在 -yne 前面。', show: { w: 'suffix', set: { i: 8 } } },
    { src: '仿 慈濟 115 第 28 題', q: '2-chlorobut-2-ene 中，Cl 與 C4 的甲基在雙鍵同側。組態為？', o: ['Z', 'E', '沒有幾何異構', '要看 C1 的位置'], a: 0,
      why: 'C2 上 Cl > CH₃；C3 上 CH₃ > H。兩個優先基團同側。', show: { w: 'ez', set: { a: 6, b: 1, c: 1, d: 0 } } },
    { src: '仿 慈濟 115 第 41 題', q: '左邊雙鍵碳上方接 Br、下方接 Cl；右邊雙鍵碳上方接 CH₃、下方接 OH。組態為？', o: ['E', 'Z', 'cis', '沒有幾何異構'], a: 0,
      why: '左邊 Br 優先（在上），右邊 OH 優先（在下），兩者在對側。', show: { w: 'ez', set: { a: 7, b: 6, c: 1, d: 5 } } },
    { src: '仿 義守 114 第 42 題', q: '環己烷上有一個乙基和一個甲基，彼此在 1,3 位置。名稱？', o: ['1-ethyl-3-methylcyclohexane', '3-ethyl-1-methylcyclohexane', '1-methyl-3-ethylcyclohexane', '1-ethyl-5-methylcyclohexane'], a: 0,
      why: '兩種編號都是 1,3，由字母較前的 ethyl 拿 1 號。' },
    { src: '仿 中國醫 106 第 37 題', q: '下列取代基接在環己烷上，何者應命名為「cyclohexyl＋烷」？', o: ['octyl', 'hexyl', 'tert-butyl', 'cyclopentyl'], a: 0,
      why: '鏈的碳數（8）多於環（6）時，鏈當主體。' },
    { src: '仿 慈濟 114 第 50 題', q: '環戊烯中，異丙基接在緊鄰雙鍵的飽和碳上。名稱？', o: ['3-isopropylcyclopentene', '2-isopropylcyclopentene', '4-isopropylcyclopentene', '5-isopropylcyclopentene'], a: 0,
      why: '雙鍵碳固定為 1、2 號，往取代基的方向編號，取代基在 3 號。' },
    { src: '仿 中國醫 106 第 8 題', q: '金剛烷（adamantane，C₁₀H₁₆）的骨架有 12 個 C–C 鍵，它是幾環分子？', o: ['三環', '二環', '四環', '單環'], a: 0,
      why: '環數 = 12 − 10 + 1 = 3；不飽和度 (22 − 16) ÷ 2 = 3 也相符。' },
    { src: '仿 慈濟 113 第 26 題', q: '苯甲酸的 2 號位有 Br、4 號位有 NO₂。名稱？', o: ['2-bromo-4-nitrobenzoic acid', '4-nitro-2-bromobenzoic acid', '1-bromo-3-nitro-6-carboxybenzene', '2-carboxy-5-nitrobromobenzene'], a: 0,
      why: 'COOH 所在碳為 1 號，母體是 benzoic acid；取代基依字母 b、n 排列。' },
    { src: '仿 義守 106 第 26 題', q: 'HCOOCH₂CH₂CH₃ 的名稱？', o: ['propyl formate（甲酸丙酯）', 'ethyl acetate（乙酸乙酯）', 'methyl propanoate', 'formyl propane'], a: 0,
      why: 'O 上接丙基，酸的部分只有一個碳（甲酸）。前三個選項互為異構物。', show: { w: 'suffix', set: { i: 1 } } },
    { src: '仿 義守 106 第 27 題', q: 'CH₃CH(OH)CH₂CH(CH₃)₂ 的 IUPAC 名稱？', o: ['4-methylpentan-2-ol', '2-methylpentan-4-ol', '1,3-dimethylbutan-1-ol', '4-methylhexan-2-ol'], a: 0,
      why: '主鏈 5 個碳，OH 當字尾要拿最小號碼（2），甲基在 4。', show: { w: 'suffix', set: { i: 6 } } },
    { src: '仿 義守 115 第 27 題', q: '2,2,4-trimethylhexane 的立體中心是幾號碳？', o: ['C4', 'C2', 'C3', 'C5'], a: 0,
      why: 'C4 接 H、CH₃、CH₂CH₃、CH₂C(CH₃)₃ 四個不同基團；名稱寫成 (4R)- 或 (4S)-。C2 接了三個甲基。' },
    { src: '仿 義守 112 第 25 題', q: '下列試劑名稱與縮寫的組合，何者錯誤？', o: ['tetrahydrofuran — DMF', 'N-bromosuccinimide — NBS', 'pyridinium chlorochromate — PCC', 'diisobutylaluminum hydride — DIBAL-H'], a: 0,
      why: 'tetrahydrofuran 是 THF；DMF 是 N,N-dimethylformamide。' },
    { src: '仿 義守 107 第 25 題', q: '下列名稱與化學式何者不相符？', o: ['ethyl formate，CH₃COOCH₃', 'anisole，C₆H₅OCH₃', 'acetone，CH₃COCH₃', 'aniline，C₆H₅NH₂'], a: 0,
      why: 'CH₃COOCH₃ 是 methyl acetate；ethyl formate 是 HCOOCH₂CH₃。' },
    { src: '仿 義守 114 第 45 題', q: 'diphenylamine 的結構是？', o: ['(C₆H₅)₂NH', 'C₆H₅CH₂NH₂', 'H₂N–C₆H₄–C₆H₄–NH₂', 'C₆H₅NHCH₃'], a: 0,
      why: '兩個 phenyl 接在同一個 N 上；B 是 benzylamine，C 是聯苯二胺。' },
    { src: '仿 中國醫 108 第 41 題', q: 'dibenzo-p-dioxin 名稱中的 p 指的是？', o: ['中間六員環的兩個 O 互為對位（1,4）', '兩個苯環互為對位', '四個 Cl 在對位', '分子是平面的'], a: 0,
      why: '1,4-dioxin 的兩個 O 在六員環的相對位置。' },
    { src: '仿 義守 112 第 16 題', q: 'R₂C=N–NH₂ 這類化合物稱為？', o: ['腙（hydrazone）', '肟（oxime）', '亞胺（imine）', '重氮化合物（diazo）'], a: 0,
      why: '肟是 C=N–OH，亞胺是 C=N–R，重氮是 C=N₂。' },
  ],
});
