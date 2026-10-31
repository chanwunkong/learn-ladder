/* ---------- 後中英文：第 1 週（單字與長句） ----------
   單字取自中國醫、慈濟、義守近兩年英文卷中「出現在兩份以上考卷、詞頻排名 2500–12000」的學術與醫學字（analysis/eng）。
   單字格式：[英文, 詞性, 中文, 字根拆解, 例句, 例句中文]
   長句格式：{ chunks: [片段…], steps: [[問題, 正解, 誤1, 誤2, 說明, 能力, {片段序號: 標記}]…], core, zh }
     標記：v 主要動詞、s 主詞、m 修飾 */
WEEKS.push({ n: 1, theme: '句子主幹與修飾', days: [] });
WEEKS[0].words = [
  // 第 1 天：臨床
  [['clinical', 'adj.', '臨床的', 'clinic 診所 + -al 形容詞', 'The drug passed several clinical trials before approval.', '這個藥在核准前通過了幾次臨床試驗。'],
   ['chronic', 'adj.', '慢性的、長期的', 'chron 時間 + -ic', 'Chronic pain lasts for more than three months.', '慢性疼痛持續三個月以上。'],
   ['symptom', 'n.', '症狀', 'sym 一起 + ptom 落下：一起出現的現象', 'Fever is a common symptom of infection.', '發燒是感染常見的症狀。'],
   ['diagnosis', 'n.', '診斷', 'dia 穿過 + gnosis 認識：看穿而認出', 'Early diagnosis makes treatment easier.', '早期診斷讓治療比較容易。'],
   ['therapy', 'n.', '治療、療法', '', 'Physical therapy helped her walk again.', '物理治療幫助她重新走路。'],
   ['infection', 'n.', '感染', 'in 進入 + fect 做、放 + -ion', 'Washing hands reduces the risk of infection.', '洗手能降低感染的風險。'],
   ['immune', 'adj.', '免疫的', 'im 不 + mune 負擔：不受侵害', 'The immune system protects the body from bacteria.', '免疫系統保護身體不受細菌侵害。'],
   ['prevalence', 'n.', '盛行率、普遍程度', 'pre 在前 + val 強 + -ence：佔上風', 'The prevalence of diabetes has doubled since 1980.', '糖尿病的盛行率自 1980 年以來加倍了。'],
   ['intervention', 'n.', '介入、處置', 'inter 之間 + vent 來 + -ion：來到中間', 'Early intervention can prevent serious complications.', '早期介入可以預防嚴重的併發症。'],
   ['outcome', 'n.', '結果', 'out 出 + come 來', 'Patients who exercised had better outcomes.', '有運動的病人結果比較好。']],
  // 第 2 天：身體與心理
  [['mechanism', 'n.', '機制、作用方式', 'mechan 機器 + -ism', 'Scientists still do not understand the mechanism of the disease.', '科學家仍不了解這個疾病的機制。'],
   ['genetic', 'adj.', '基因的、遺傳的', 'gen 產生 + -etic', 'Some cancers have a strong genetic factor.', '有些癌症有很強的遺傳因素。'],
   ['hormone', 'n.', '荷爾蒙、激素', '', 'Insulin is a hormone that lowers blood sugar.', '胰島素是一種降低血糖的激素。'],
   ['nutrient', 'n.', '營養素', 'nutri 餵養 + -ent', 'Vegetables provide important nutrients such as vitamin C.', '蔬菜提供維生素 C 等重要的營養素。'],
   ['obesity', 'n.', '肥胖', 'ob 加上 + esity 吃', 'Obesity increases the risk of heart disease.', '肥胖會增加心臟病的風險。'],
   ['syndrome', 'n.', '症候群', 'syn 一起 + drome 跑：一起出現的一群症狀', 'Down syndrome is caused by an extra chromosome.', '唐氏症是由多一條染色體造成的。'],
   ['cognitive', 'adj.', '認知的', 'co 一起 + gni 知道 + -tive', 'Sleep loss affects cognitive function.', '睡眠不足會影響認知功能。'],
   ['psychological', 'adj.', '心理的', 'psycho 心 + logy 學 + -ical', 'Stress can cause both physical and psychological problems.', '壓力會造成生理與心理的問題。'],
   ['elderly', 'adj.', '年長的', 'elder 年長的 + -ly', 'Elderly patients often take several medicines.', '年長的病人常常同時吃好幾種藥。'],
   ['vulnerable', 'adj.', '易受傷害的', 'vulner 傷口 + -able 可以', 'Children are more vulnerable to air pollution.', '兒童比較容易受到空氣污染的傷害。']],
  // 第 3 天：研究方法
  [['demonstrate', 'v.', '證明、顯示', 'de 完全 + monstr 展示 + -ate', 'The study demonstrated that the vaccine is safe.', '這項研究證明疫苗是安全的。'],
   ['conduct', 'v.', '進行、執行', 'con 一起 + duct 引導', 'The researchers conducted a survey of 500 nurses.', '研究人員對 500 位護理師進行調查。'],
   ['participant', 'n.', '參與者、受試者', 'parti 部分 + cip 拿 + -ant：拿一份的人', 'Each participant walked for 30 minutes a day.', '每位受試者每天走 30 分鐘。'],
   ['assessment', 'n.', '評估', 'assess 評估 + -ment', 'A full assessment takes about an hour.', '完整的評估大約需要一小時。'],
   ['comprehensive', 'adj.', '全面的、廣泛的', 'com 完全 + prehend 抓住 + -sive', 'The report gives a comprehensive review of the evidence.', '這份報告對證據做了全面的回顧。'],
   ['protocol', 'n.', '（實驗或治療的）標準流程', '', 'All nurses must follow the same protocol.', '所有護理師都必須遵守同一套流程。'],
   ['procedure', 'n.', '程序、手術', 'pro 往前 + ced 走 + -ure', 'The procedure takes less than ten minutes.', '這個手術不到十分鐘。'],
   ['limitation', 'n.', '限制', 'limit 界限 + -ation', 'One limitation of the study is its small sample.', '這項研究的一個限制是樣本小。'],
   ['robust', 'adj.', '強而有力的、可靠的', '', 'The results were robust across all age groups.', '結果在各年齡層都很穩定可靠。'],
   ['consistent', 'adj.', '一致的', 'con 一起 + sist 站 + -ent：站在一起', 'The findings are consistent with earlier studies.', '這些發現和早期的研究一致。']],
  // 第 4 天：轉折與強調（副詞、連接詞）
  [['primarily', 'adv.', '主要地', 'prim 第一 + -arily', 'The disease primarily affects older women.', '這個疾病主要影響年長女性。'],
   ['ultimately', 'adv.', '最終', 'ultim 最後的 + -ately', 'Ultimately, the patient made a full recovery.', '最終，病人完全康復。'],
   ['notably', 'adv.', '尤其、值得注意的是', 'note 注意 + -ably', 'Several countries, notably Japan, have aging populations.', '好幾個國家，尤其是日本，人口都在老化。'],
   ['exclusively', 'adv.', '唯一地、專門地', 'ex 出 + clus 關 + -ively：關在外面', 'The clinic treats children exclusively.', '這間診所只治療兒童。'],
   ['consequently', 'adv.', '因此', 'con 一起 + sequ 跟隨 + -ently', 'He smoked for years; consequently, his lungs were damaged.', '他抽菸多年，因此肺部受損。'],
   ['nevertheless', 'adv.', '儘管如此', 'never + the + less：一點也沒有減少', 'The drug has side effects. Nevertheless, it is widely used.', '這個藥有副作用。儘管如此，它仍被廣泛使用。'],
   ['whereas', 'conj.', '然而、而（對比兩件事）', '', 'Type 1 diabetes starts early, whereas type 2 usually starts later.', '第一型糖尿病很早發病，而第二型通常較晚。'],
   ['moreover', 'adv.', '此外、而且', 'more + over', 'The test is cheap; moreover, it is very accurate.', '這個檢測很便宜，而且非常準確。'],
   ['widespread', 'adj.', '廣泛的、普遍的', 'wide 寬 + spread 散開', 'The use of antibiotics is widespread in farming.', '抗生素在畜牧業中使用得很普遍。'],
   ['crucial', 'adj.', '關鍵的', 'cruc 十字：十字路口', 'Sleep is crucial for memory.', '睡眠對記憶很關鍵。']],
  // 第 5 天：改變與強化（動詞）
  [['promote', 'v.', '促進', 'pro 往前 + mote 移動', 'Regular exercise promotes good health.', '規律運動促進健康。'],
   ['enhance', 'v.', '增強、提升', 'en 使 + hance 高', 'Music may enhance memory in some patients.', '音樂可能提升某些病人的記憶。'],
   ['strengthen', 'v.', '加強', 'strength 力量 + -en 使', 'Weight training strengthens the bones.', '重量訓練能強化骨骼。'],
   ['foster', 'v.', '培養、促進', '', 'Good teachers foster curiosity in their students.', '好老師培養學生的好奇心。'],
   ['decline', 'v. / n.', '下降、衰退', 'de 向下 + cline 傾斜', 'Memory tends to decline with age.', '記憶力往往隨年齡衰退。'],
   ['preserve', 'v.', '保存、維持', 'pre 事先 + serve 保持', 'Cold temperatures preserve the samples.', '低溫能保存這些樣本。'],
   ['implement', 'v.', '實施、執行', 'im 進入 + ple 填滿 + -ment', 'The hospital implemented a new hand-washing policy.', '醫院實施了新的洗手政策。'],
   ['emphasize', 'v.', '強調', 'em 在內 + phas 顯示 + -ize', 'The doctor emphasized the importance of sleep.', '醫師強調睡眠的重要。'],
   ['highlight', 'v.', '凸顯、強調', 'high 高 + light 光：打上亮光', 'The study highlights the risks of smoking.', '這項研究凸顯了抽菸的風險。'],
   ['perceive', 'v.', '察覺、認為', 'per 完全 + ceive 拿取', 'Many patients perceive pain differently.', '很多病人對疼痛的感受不同。']],
  // 第 6 天：觀點與影響（名詞）
  [['framework', 'n.', '架構、框架', 'frame 框 + work', 'The theory provides a framework for new research.', '這個理論為新研究提供了架構。'],
   ['perspective', 'n.', '觀點、角度', 'per 穿過 + spect 看 + -ive', 'From a patient’s perspective, waiting is the hardest part.', '從病人的角度看，等待是最難熬的。'],
   ['implication', 'n.', '含意、可能的影響', 'im 進入 + plic 摺 + -ation：摺在裡面', 'The findings have important implications for treatment.', '這些發現對治療有重要的影響。'],
   ['consequence', 'n.', '後果', 'con 一起 + sequ 跟隨 + -ence', 'Lack of sleep has serious consequences.', '睡眠不足有嚴重的後果。'],
   ['threat', 'n.', '威脅', '', 'Drug-resistant bacteria are a growing threat.', '抗藥性細菌是日益嚴重的威脅。'],
   ['exposure', 'n.', '暴露、接觸', 'ex 出 + pos 放 + -ure：放在外面', 'Long exposure to the sun damages the skin.', '長時間曬太陽會傷害皮膚。'],
   ['effectiveness', 'n.', '有效性、效果', 'effect 效果 + -ive + -ness', 'They tested the effectiveness of the new drug.', '他們測試了新藥的效果。'],
   ['regulation', 'n.', '規範、調節', 'regul 規則 + -ation', 'New regulations limit sugar in school meals.', '新的規範限制學校餐點的含糖量。'],
   ['contemporary', 'adj.', '當代的', 'con 一起 + tempor 時間 + -ary：同一個時代', 'Contemporary medicine relies on large data sets.', '當代醫學仰賴大量的資料。'],
   ['diverse', 'adj.', '多樣的', 'di 分開 + verse 轉', 'The study included a diverse group of patients.', '這項研究納入了多樣的病人族群。']],
  // 第 7 天：描述程度與性質（形容詞）
  [['excessive', 'adj.', '過度的', 'ex 超出 + cess 走 + -ive', 'Excessive salt raises blood pressure.', '過量的鹽會讓血壓升高。'],
   ['persistent', 'adj.', '持續的', 'per 一直 + sist 站 + -ent', 'See a doctor if the cough is persistent.', '如果咳嗽一直不好，要去看醫生。'],
   ['temporary', 'adj.', '暫時的', 'tempor 時間 + -ary', 'The side effects are usually temporary.', '副作用通常是暫時的。'],
   ['profound', 'adj.', '深遠的、深刻的', 'pro 往前 + found 底部：深到底', 'The discovery had a profound effect on medicine.', '這個發現對醫學有深遠的影響。'],
   ['rigid', 'adj.', '僵硬的、嚴格的', 'rig 硬', 'Patients with the disease often have rigid muscles.', '這種病的病人肌肉常常很僵硬。'],
   ['superior', 'adj.', '較好的、優於', 'super 在上', 'The new drug was superior to the old one.', '新藥比舊藥好。'],
   ['artificial', 'adj.', '人工的', 'art 技術 + fic 做 + -ial', 'Artificial sweeteners contain almost no calories.', '人工甜味劑幾乎沒有熱量。'],
   ['synthetic', 'adj.', '合成的', 'syn 一起 + thet 放 + -ic', 'Aspirin is a synthetic drug.', '阿斯匹靈是合成藥物。'],
   ['specialized', 'adj.', '專門的', 'special 特別 + -ize + -ed', 'Burn patients need specialized care.', '燒燙傷病人需要專門的照護。'],
   ['characterize', 'v.', '以…為特徵、描述特性', 'character 特徵 + -ize', 'The disease is characterized by high fever.', '這個疾病的特徵是高燒。']],
];
WEEKS[0].sents = [
  // 第 1 天：主幹
  [{ chunks: ['Patients', 'with chronic pain', 'often', 'sleep', 'poorly.'], core: 'Patients sleep poorly.', zh: '慢性疼痛的病人常常睡不好。',
     steps: [['這句的主要動詞是？', 'sleep', 'pain', 'with', '動詞表示「做什麼」：病人「睡」。pain 在這裡是名詞。', 's.core', { 3: 'v' }], ['誰在睡？（主詞）', 'Patients', 'chronic pain', 'often', '主詞是動作的發出者。', 's.core', { 0: 's' }], ['with chronic pain 的作用是？', '修飾 Patients：哪一種病人', '主詞', '動詞', '介系詞片語跟在名詞後面，說明是哪一種人。', 's.core', { 1: 'm', 2: 'm' }]] },
   { chunks: ['The prevalence', 'of obesity', 'in children', 'has increased', 'rapidly', 'over the past twenty years.'], core: 'The prevalence has increased.', zh: '過去二十年來，兒童肥胖的盛行率快速上升。',
     steps: [['主要動詞是？', 'has increased', 'children', 'past', 'has + 過去分詞是現在完成式，整組算一個動詞。', 's.core', { 3: 'v' }], ['什麼增加了？（主詞）', 'The prevalence', 'obesity', 'children', 'of obesity in children 都是在說明 prevalence。主詞是第一個名詞。', 's.core', { 0: 's' }], ['of obesity、in children 是什麼？', '修飾主詞的介系詞片語', '另外兩個主詞', '動詞', '介系詞片語可以一個接一個，全部掛在前面的名詞上。', 's.core', { 1: 'm', 2: 'm', 5: 'm' }]] }],
  // 第 2 天：關係子句
  [{ chunks: ['People', 'who sleep less than six hours', 'are', 'more vulnerable', 'to infection.'], core: 'People are more vulnerable to infection.', zh: '睡不到六小時的人比較容易感染。',
     steps: [['句中有兩個動詞 sleep、are，哪一個是主要動詞？', 'are', 'sleep', '都是', 'sleep 在 who 開頭的子句裡；子句裡的動詞不是整句的動詞。', 's.rel', { 2: 'v' }], ['are 的主詞是？', 'People', 'six hours', 'infection', '去掉 who 子句，就剩 People are…。', 's.core', { 0: 's' }], ['who sleep less than six hours 修飾誰？', 'People', 'hours', 'infection', '關係代名詞 who 指人，緊接在它要修飾的名詞後面。', 's.rel', { 1: 'm' }]] },
   { chunks: ['The hormone', 'that controls blood sugar', 'is called', 'insulin.'], core: 'The hormone is called insulin.', zh: '控制血糖的激素叫作胰島素。',
     steps: [['主要動詞是？', 'is called', 'controls', 'blood', 'controls 在 that 子句裡。', 's.rel', { 2: 'v' }], ['主詞是？', 'The hormone', 'blood sugar', 'insulin', 'that 子句說明是哪一種激素。', 's.core', { 0: 's' }], ['that 在這裡可以換成哪一個字？', 'which（指物）', 'who', 'what', '指物用 which 或 that；指人用 who 或 that。', 's.rel', { 1: 'm' }]] }],
  // 第 3 天：分詞修飾
  [{ chunks: ['Participants', 'taking the new drug', 'reported', 'fewer symptoms.'], core: 'Participants reported fewer symptoms.', zh: '服用新藥的受試者回報的症狀較少。',
     steps: [['taking 和 reported，誰是主要動詞？', 'reported', 'taking', '兩個都是', '名詞後面的 V-ing 是在修飾名詞，不是主要動詞。', 's.part', { 2: 'v' }], ['taking the new drug 修飾誰？', 'Participants', 'drug', 'symptoms', '= Participants who were taking the new drug。', 's.part', { 1: 'm', 0: 's' }], ['主幹是？', 'Participants reported fewer symptoms.', 'Participants taking the drug.', 'The new drug reported symptoms.', '去掉分詞片語，主詞＋動詞＋受詞。', 's.core', {}]] },
   { chunks: ['The samples', 'collected from 200 patients', 'were tested', 'in a specialized laboratory.'], core: 'The samples were tested.', zh: '從 200 位病人採集的樣本在專門的實驗室中檢驗。',
     steps: [['collected 和 were tested，誰是主要動詞？', 'were tested', 'collected', '兩個都是', 'collected 前面沒有 be 動詞或 have，又緊跟在名詞後面，是過去分詞在修飾名詞。', 's.part', { 2: 'v' }], ['collected from 200 patients 的意思是？', '被採集的（被動）', '正在採集的（主動）', '將要採集的', 'V-ed 表示被動：樣本是「被採集」的；V-ing 表示主動。', 's.part', { 1: 'm', 0: 's' }], ['in a specialized laboratory 是？', '地點，修飾動詞', '主詞', '受詞', '介系詞片語說明在哪裡檢驗。', 's.core', { 3: 'm' }]] }],
  // 第 4 天：連接詞
  [{ chunks: ['Although the drug is effective,', 'it', 'causes', 'severe side effects', 'in some patients.'], core: 'It causes severe side effects.', zh: '雖然這個藥有效，它在某些病人身上會造成嚴重的副作用。',
     steps: [['Although 開頭的部分是什麼？', '附屬子句（讓步：雖然…）', '主要子句', '主詞', 'Although、because、when、if 引導的子句不能單獨成句，要接主要子句。', 'g.conj', { 0: 'm' }], ['主要子句的動詞是？', 'causes', 'is', 'effective', 'is 在 Although 子句裡。', 's.core', { 2: 'v', 1: 's' }], ['前後兩部分的關係？', '轉折：有效，但有副作用', '因果', '時間先後', 'although 表示「雖然」，後面講相反方向的事。', 'g.conj', {}]] },
   { chunks: ['Exercise', 'lowers', 'blood pressure;', 'moreover,', 'it', 'improves', 'mood.'], core: 'Exercise lowers blood pressure; it improves mood.', zh: '運動會降低血壓；而且，它會改善心情。',
     steps: [['分號前後各有幾個主要動詞？', '各一個：lowers、improves', '只有一個', '都沒有', '分號連接兩個完整的句子。', 's.core', { 1: 'v', 5: 'v' }], ['moreover 表示？', '補充（而且）', '轉折（但是）', '結果（因此）', 'moreover 和 in addition、furthermore 同類。', 'g.conj', { 3: 'm' }], ['it 指的是？', 'Exercise', 'blood pressure', 'mood', '代名詞通常指前面的主詞。', 'r.locate', { 0: 's', 4: 's' }]] }],
  // 第 5 天：被動語態
  [{ chunks: ['The vaccine', 'was developed', 'by a team of scientists', 'in less than a year.'], core: 'The vaccine was developed.', zh: '這個疫苗由一群科學家在不到一年內研發出來。',
     steps: [['主要動詞是？', 'was developed', 'scientists', 'year', 'be 動詞 + 過去分詞＝被動語態。', 's.pass', { 1: 'v' }], ['主詞 The vaccine 是動作的發出者還是承受者？', '承受者：疫苗被研發', '發出者', '都不是', '被動句中主詞承受動作。', 's.pass', { 0: 's' }], ['真正做研發的是誰？', 'a team of scientists（by 後面）', 'The vaccine', '沒有說', '被動句用 by 帶出動作的發出者。', 's.pass', { 2: 'm', 3: 'm' }]] },
   { chunks: ['More than 300 patients', 'were included', 'in the final analysis,', 'which', 'was conducted', 'in 2024.'], core: 'More than 300 patients were included.', zh: '超過 300 位病人被納入最後的分析，而這項分析在 2024 年進行。',
     steps: [['主要動詞是？', 'were included', 'was conducted', 'analysis', 'was conducted 在 which 子句裡。', 's.pass', { 1: 'v', 0: 's' }], ['which 指的是？', 'the final analysis', 'patients', '2024', '逗號加 which 補充說明前面那個名詞。', 's.rel', { 2: 'm', 3: 'm', 4: 'm', 5: 'm' }], ['was conducted 是哪一種語態？', '被動：分析被進行', '主動', '進行式', 'be + 過去分詞。', 's.pass', {}]] }],
  // 第 6 天：名詞子句
  [{ chunks: ['What surprised the doctors', 'was', 'how quickly the patient recovered.'], core: 'What surprised the doctors was how quickly the patient recovered.', zh: '讓醫生驚訝的是病人恢復得多快。',
     steps: [['主要動詞是？', 'was', 'surprised', 'recovered', '另外兩個動詞各在 What 子句與 how 子句裡。', 's.noun', { 1: 'v' }], ['主詞是？', '整段 What surprised the doctors（讓醫生驚訝的事）', 'the doctors', 'the patient', '一整個子句可以當主詞，What… ＝「…的事」。', 's.noun', { 0: 's' }], ['how quickly the patient recovered 在句中當什麼？', '補語（說明主詞是什麼）', '另一個主詞', '修飾 doctors', '名詞子句也能放在 be 動詞後面。', 's.noun', { 2: 'm' }]] },
   { chunks: ['Researchers', 'do not know', 'whether the effect', 'will last', 'for more than a year.'], core: 'Researchers do not know whether…', zh: '研究人員不知道這個效果是否會持續超過一年。',
     steps: [['主要動詞是？', 'do not know', 'will last', 'effect', 'will last 在 whether 子句裡。', 's.noun', { 1: 'v', 0: 's' }], ['whether 開頭的子句在句中當什麼？', 'know 的受詞（不知道「什麼」）', '主詞', '修飾 Researchers', '名詞子句可以當受詞。', 's.noun', { 2: 'm', 3: 'm', 4: 'm' }], ['whether 的意思？', '是否', '雖然', '當…時', 'whether = if（是否）。', 's.noun', {}]] }],
  // 第 7 天：平行結構
  [{ chunks: ['Regular exercise', 'lowers', 'blood pressure,', 'improves', 'sleep,', 'and', 'reduces', 'stress.'], core: 'Regular exercise lowers…, improves…, and reduces…', zh: '規律運動能降低血壓、改善睡眠，並減輕壓力。',
     steps: [['這句的主要動詞有幾個？', '三個：lowers、improves、reduces', '一個', '兩個', '同一個主詞做了三件事。', 's.para', { 1: 'v', 3: 'v', 6: 'v' }], ['三個動詞的形式？', '相同（都是第三人稱單數現在式）', '各不相同', '只有第一個加 s', 'and 連接的東西形式要一致，稱為平行結構。', 's.para', { 0: 's' }], ['and 放在哪裡？', '最後一項之前', '每一項之間', '最前面', 'A, B, and C 的寫法。', 's.para', {}]] },
   { chunks: ['The study', 'aimed', 'to measure the effect of sleep', 'and', 'to identify the patients', 'most at risk.'], core: 'The study aimed to measure… and to identify…', zh: '這項研究的目的是測量睡眠的影響，並找出風險最高的病人。',
     steps: [['主要動詞是？', 'aimed', 'measure', 'identify', 'to + 原形動詞是不定詞，不是主要動詞。', 's.core', { 1: 'v', 0: 's' }], ['and 連接的是哪兩個部分？', 'to measure… 和 to identify…', 'sleep 和 patients', 'study 和 effect', '找 and 前後形式相同的東西。', 's.para', { 2: 'm', 4: 'm' }], ['most at risk 修飾誰？', 'the patients', 'the study', 'sleep', '形容詞片語放在名詞後面。', 's.part', { 5: 'm' }]] }],
];
