# 後中化學：歷屆考題主題分析

範圍：中國醫藥（cmu）、義守（isu）、慈濟（tcu）大學學士後中醫學系 106–115 學年度化學試題，共 30 份、1498 題（cmu-111 只有 48 題）。
試題來源：https://www.3dollars.com.tw/Images/Previous-questions/Hce/{China,Tzu-Chi,Yishou}/ 。試卷 PDF 只放在本機的 `papers/`（不進 git，有著作權）；本資料夾只保存逐題的主題分類。

## 檔案
- `cls.tsv`：逐題分類（學校、學年、題號、主題代碼）。
- `analyze.py`：各主題的題數與佔比（未加權、加權、近三年、各校），輸出存成 `result.tsv`。
- `perch.py`：換算成各章「每份 50 題約幾題」，就是 `src/chem/content.js` 裡 TREE 的 w 欄位。
- `split.py`、`cls.py`、`pages.sh`：分類時用的工具（切題目、寫入分類、把指定題號的頁面轉成圖）。

## 方法
- 加權：學年度 − 105（106 年 ×1 … 115 年 ×10）。「近三年」＝113–115 年、不加權。
- 一題只歸一個主要考點。106–110 年有 95 題只能看圖判斷產物，未細分，標為 `O-rxn`，不計入各章比重。
- 主題代碼：G-atom G-bond G-mo G-imf G-stoich G-gas G-sol G-thermo G-kin G-eq G-ab G-ksp G-redox G-coord G-nuc G-desc G-anal；
  O-struct O-acid O-name O-stereo O-sn O-rad O-alkene O-conj O-arom O-alc O-carb O-acyl O-alpha O-amine O-spec O-sugar O-prot O-bio O-poly O-other O-rxn。

## 結論（2026-10-28）
- 普化約 47%、有機約 53%；慈濟偏普化（53%），義守偏有機（58%）。
- 原本 23 章沒教或很薄的主題加權約 20%（每份約 10 題），因此新增 8 章，優先序：
  配位化學 → α-碳與羰基縮合 → 共軛二烯/周環 → 分子軌域理論 → 有機命名 → 有機金屬與人名反應 → 自由基與聚合物 → 元素/材料/分析。
- 已有章節中最常考：光譜、熱力學、立體化學、酸鹼、芳香族。
