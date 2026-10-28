/* ---------- 後中化學：配位化學 ---------- */
CH.push({
  id: 'coord', unit: 'g9b', title: '配位化學：錯合物的結構、顏色與磁性',
  lede: '血紅素裡的鐵、抗癌藥順鉑、硫酸銅溶液的藍色，都來自金屬離子被一群分子或離子包圍形成的「錯合物」。這一章先學會拆解和命名錯合物，再用晶體場理論解釋它們為什麼有顏色、為什麼有些會被磁鐵吸引。',
  sections: [
    { h: '錯合物的組成：路易斯酸鹼加合物', w: 'cname', body: `
<p>過渡金屬離子有空的 d、s、p 軌域，可以接受孤對電子（路易斯酸）；帶孤對電子的分子或離子（路易斯鹼）圍上來配位，形成<b>錯合物</b>。</p>
<ul><li><b>中心金屬</b>：通常是過渡金屬離子，例如 Co³⁺、Fe²⁺、Cu²⁺、Pt²⁺。</li>
<li><b>配位基</b>：提供孤對電子的分子或離子，例如 NH₃、H₂O、Cl⁻、CN⁻、CO。只用一個原子配位的叫單牙配位基；乙二胺（en，H₂NCH₂CH₂NH₂）用兩個 N 原子同時配位，是雙牙配位基；EDTA 用六個位置抓住金屬，是六牙配位基。</li>
<li><b>配位數</b>：中心金屬周圍直接相連的配位原子數，常見 2、4、6。雙牙配位基一個算兩個位置。</li>
<li><b>外界離子</b>：寫在方括號外，只負責平衡電荷，溶於水時會解離出來。</li></ul>
<p>判斷中心金屬氧化數：<b>錯離子電荷 = 金屬氧化數 + 各配位基電荷總和</b>。中性配位基（NH₃、H₂O、CO、en）不影響。</p>
<p>維爾納（Werner）當年用 AgNO₃ 確定錯合物結構：CoCl₃·6NH₃、CoCl₃·5NH₃、CoCl₃·4NH₃ 每莫耳分別生成 3、2、1 莫耳 AgCl，表示配位在 Co 上的 Cl⁻ 不會沉澱，三者應寫成 [Co(NH₃)₆]Cl₃、[Co(NH₃)₅Cl]Cl₂、[Co(NH₃)₄Cl₂]Cl。選不同的錯合物，看它的組成、氧化數和 AgNO₃ 沉澱量。</p>` },
    { h: '錯合物的命名', body: `
<p>IUPAC 命名的步驟：</p>
<ol><li><b>陽離子先、陰離子後</b>，和一般鹽類相同（potassium hexacyanoferrate(III)）。</li>
<li>錯離子內：<b>配位基先、金屬後</b>，配位基依英文字母順序排列，<b>倍數字首不算進排序</b>（tetraammine 依 a 排，dichloro 依 c 排）。</li>
<li>倍數字首用 di-、tri-、tetra-、penta-、hexa-；配位基名稱本身已含數字或較複雜時（例如 en）改用 bis-、tris-、tetrakis-，並加括號：dichlorobis(ethylenediamine)cobalt(III)。</li>
<li>金屬後面用羅馬數字寫氧化數；錯離子是<b>陰離子</b>時，金屬名稱改成 <b>-ate</b>：cobaltate、platinate，部分用拉丁字根：Fe → ferrate、Cu → cuprate、Ag → argentate、Au → aurate、Pb → plumbate、Sn → stannate。</li></ol>
<table class="tbl"><thead><tr><th>配位基</th><th>名稱</th><th>配位基</th><th>名稱</th></tr></thead><tbody>
<tr><td>H₂O</td><td>aqua</td><td>Cl⁻、Br⁻、F⁻</td><td>chloro、bromo、fluoro（新制 chlorido…）</td></tr>
<tr><td>NH₃</td><td>ammine（兩個 m）</td><td>CN⁻</td><td>cyano</td></tr>
<tr><td>CO</td><td>carbonyl</td><td>OH⁻</td><td>hydroxo</td></tr>
<tr><td>NO</td><td>nitrosyl</td><td>NO₂⁻</td><td>nitro（N 配位）、nitrito（O 配位）</td></tr>
<tr><td>en</td><td>ethylenediamine</td><td>C₂O₄²⁻</td><td>oxalato</td></tr></tbody></table>
<p>例：[Co(NH₃)₅Cl]Cl₂ = pentaamminechlorocobalt(III) chloride；K₄[Fe(CN)₆] = potassium hexacyanoferrate(II)；[Ni(CO)₄] = tetracarbonylnickel(0)。</p>` },
    { h: '形狀與異構物', w: 'ciso', body: `
<p>配位數決定常見的形狀：</p>
<ul><li><b>配位數 2</b>：直線形，例如 [Ag(NH₃)₂]⁺、[Ag(CN)₂]⁻。</li>
<li><b>配位數 4</b>：四面體（例如 [Zn(NH₃)₄]²⁺、[NiCl₄]²⁻）或<b>平面四方</b>（d⁸ 的 Pt²⁺、Pd²⁺，以及強場的 Ni²⁺，例如 [Ni(CN)₄]²⁻、[Pt(NH₃)₂Cl₂]）。</li>
<li><b>配位數 6</b>：八面體，最常見，例如 [Co(NH₃)₆]³⁺、[Fe(CN)₆]³⁻。</li></ul>
<p>組成相同、結構不同的錯合物稱為異構物，分兩大類：</p>
<ul><li><b>結構異構物</b>（連接方式不同）：<b>鍵結異構物</b>，同一個配位基用不同原子配位，例如 –NO₂（nitro）與 –ONO（nitrito）、–SCN 與 –NCS；<b>離子化異構物</b>，配位基和外界離子互換，例如 [Co(NH₃)₅Br]SO₄ 與 [Co(NH₃)₅SO₄]Br，前者加 BaCl₂ 產生沉澱、後者加 AgNO₃ 產生沉澱。</li>
<li><b>立體異構物</b>（連接相同、空間排列不同）：<b>幾何異構物</b>（cis/trans、fac/mer）與<b>光學異構物</b>（互為鏡像、無法重疊）。</li></ul>
<p>切換不同的組成，數一數有幾種幾何異構物，並找出哪些有鏡像異構物。</p>` },
    { h: '晶體場理論：d 軌域分裂與磁性', w: 'cfield', body: `
<p>把配位基看成帶負電的點，從八個方向中的六個（八面體的 ±x、±y、±z）靠近金屬。五個 d 軌域原本能量相同，但方向不同：</p>
<ul><li>dz² 和 dx²−y² 的電子雲<b>正對</b>配位基，被排斥得較厲害，能量升高，稱為 <b>e<sub>g</sub></b>。</li>
<li>dxy、dxz、dyz 指向配位基之間，能量較低，稱為 <b>t<sub>2g</sub></b>。</li></ul>
<p>兩組的能量差稱為<b>晶體場分裂能 Δo</b>。四面體的配位基剛好落在軸之間，分裂方向相反（e 低、t₂ 高），而且只有四個配位基、都沒有正對軌域，分裂能 Δt 約只有 Δo 的 4/9。</p>
<p>電子要放進這些軌域時，有兩股力量在競爭：往上跳到 e<sub>g</sub> 要花 Δo；在同一個軌域成對要花<b>成對能 P</b>。</p>
<ul><li>Δo &lt; P（弱場配位基）：電子先各佔一格再成對，未成對電子多，稱為<b>高自旋</b>。</li>
<li>Δo &gt; P（強場配位基）：電子先填滿 t<sub>2g</sub> 再往上，稱為<b>低自旋</b>。</li>
<li>只有八面體的 d⁴、d⁵、d⁶、d⁷ 需要判斷；四面體 Δt 太小，幾乎都是高自旋。</li></ul>
<p>有未成對電子的錯合物是<b>順磁性</b>，會被磁場吸引；全部成對則是<b>反磁性</b>。自旋磁矩 μ ≈ √(n(n+2)) BM（n 為未成對電子數），可用磁性測量反推 n。</p>
<p>Δ 的大小也和金屬有關：同一金屬氧化數越高，Δ 越大（Co³⁺ &gt; Co²⁺）；同族往下（3d → 4d → 5d）Δ 明顯變大，所以 Pd、Pt 的錯合物幾乎都是低自旋。</p>` },
    { h: '顏色與光譜化學序列', w: 'ccolor', body: `
<p>d 電子吸收能量等於 Δ 的光子，從低能階跳到高能階（d–d 躍遷）。Δ 通常落在可見光的能量範圍，所以過渡金屬錯合物大多有顏色。我們看到的是<b>被吸收光的互補色</b>：吸收黃綠光的 [Ti(H₂O)₆]³⁺（約 500 nm）看起來是紫色。</p>
<p>換算：Δ（kJ/mol）≈ 119,600 ÷ λ（nm）。</p>
<p>把配位基依照造成的 Δ 由小到大排列，就是<b>光譜化學序列</b>：</p>
<p class="eq">I⁻ &lt; Br⁻ &lt; Cl⁻ &lt; F⁻ &lt; OH⁻ &lt; H₂O &lt; NH₃ &lt; en &lt; NO₂⁻ &lt; CN⁻ &lt; CO</p>
<p>鹵素離子是<b>弱場配位基</b>，CN⁻、CO 是<b>強場配位基</b>。同一個金屬換上較強的配位基，Δ 變大，吸收的光往短波長（藍、紫）移動，看到的顏色就跟著改變。</p>
<p>沒有 d 電子（d⁰，如 Sc³⁺、Ti⁴⁺）或 d 軌域全滿（d¹⁰，如 Zn²⁺、Cu⁺、Ag⁺）的離子沒有 d–d 躍遷，化合物通常是白色，溶液無色。</p>` },
    { h: '錯合物在生物與醫學', body: `
<ul><li><b>血紅素</b>：Fe²⁺ 位於紫質（porphyrin）環中央，被四個 N 原子圍住，第五個位置接蛋白質的組胺酸，第六個位置結合 O₂。CO 是強場配位基，和血紅素的結合比 O₂ 強約 200 倍以上，所以一氧化碳中毒時 O₂ 被擠掉，組織缺氧。氰化物則是抓住細胞色素中的鐵，阻斷呼吸鏈。</li>
<li><b>順鉑</b>（cisplatin，cis-[Pt(NH₃)₂Cl₂]）：進入細胞後 Cl⁻ 被水取代，Pt 再和 DNA 上相鄰的兩個鳥嘌呤 N7 配位，使 DNA 彎折而無法複製，用於治療睪丸癌、卵巢癌等。只有 cis 異構物有效，因為兩個可取代的位置必須相鄰。</li>
<li><b>螯合效應</b>：多牙配位基形成的錯合物比相應的單牙配位基錯合物穩定得多。例如一個 en 取代兩個 NH₃ 時，溶液中的自由粒子數變多，熵增加（ΔS &gt; 0），使 ΔG 更負。EDTA 因此可以用來治療鉛中毒、在滴定中定量 Ca²⁺ 和 Mg²⁺。</li>
<li>其他：維生素 B₁₂ 的中心是 Co，葉綠素的中心是 Mg²⁺，許多酵素的活性中心含 Zn²⁺、Cu²⁺、Fe。</li></ul>
<p><b>金屬羰基錯合物與逆授鍵</b>：CO 用碳上的孤對電子配位給金屬（σ 鍵），金屬再把自己的 d 電子回送到 CO 的 π* 反鍵軌域（<b>π 逆授</b>）。逆授越多，C≡O 鍵越弱，IR 光譜的 C–O 伸縮頻率越低（自由 CO 約 2143 cm⁻¹）。金屬越富電子（錯合物帶越多負電），逆授越強：ν(CO) 的順序是 [Mn(CO)₆]⁺ &gt; Cr(CO)₆ &gt; [V(CO)₆]⁻。穩定的金屬羰基多半符合 <b>18 電子規則</b>：Ni(CO)₄ 中 Ni 的 10 個價電子加上 4 個 CO 各提供 2 個，共 18 個。</p>` },
  ],
  quiz: [
    { q: '1 mol 的 [Co(NH₃)₅Cl]Cl₂ 溶於水後加入過量 AgNO₃，可得到幾莫耳 AgCl？', o: ['2', '3', '1', '0'], a: 0,
      why: '只有方括號外的 2 個 Cl⁻ 會解離出來沉澱；配位在 Co 上的 Cl⁻ 不會。', show: { w: 'cname', set: { c: 'co5' } } },
    { q: 'K₃[Fe(CN)₆] 中鐵的氧化數與配位數分別為？', o: ['+3，6', '+2，6', '+3，3', '−3，6'], a: 0,
      why: '3 個 K⁺ 使錯離子帶 −3；6 個 CN⁻ 共 −6，所以 Fe = −3 − (−6) = +3。六個 CN⁻ 各佔一個位置，配位數 6。', show: { w: 'cname', set: { c: 'fe3' } } },
    { q: '下列何者的 IUPAC 名稱正確？', o: ['[Cr(NH₃)₄Br₂]Br：tetraamminedibromochromium(III) bromide', 'K₄[Fe(CN)₆]：potassium hexacyanoiron(II)', '[Co(NH₃)₆]Cl₃：hexaamminecobalt(II) chloride', 'Na[Ag(CN)₂]：sodium dicyanosilver(I)'], a: 0,
      why: '陰離子錯離子要用 -ate 與拉丁字根：hexacyanoferrate(II)、dicyanoargentate(I)；[Co(NH₃)₆]³⁺ 中 Co 是 +3。配位基依字母排序，ammine（a）在 bromo（b）前面。', show: { w: 'cname', set: { c: 'cr4' } } },
    { q: '八面體錯離子 [Co(NH₃)₄Cl₂]⁺ 有幾種幾何異構物？', o: ['2', '3', '4', '1'], a: 0,
      why: '兩個 Cl⁻ 可以相鄰（cis）或相對（trans），共 2 種。', show: { w: 'ciso', set: { t: 'ma4b2' } } },
    { q: '下列何者具有光學異構物（鏡像異構物）？', o: ['cis-[Co(en)₂Cl₂]⁺', 'trans-[Co(en)₂Cl₂]⁺', 'cis-[Pt(NH₃)₂Cl₂]', '[Co(NH₃)₆]³⁺'], a: 0,
      why: 'cis-[Co(en)₂Cl₂]⁺ 沒有對稱面，和鏡像無法重疊；trans 有對稱面。平面四方錯合物本身就在一個平面上，沒有鏡像異構物。', show: { w: 'ciso', set: { t: 'en2' } } },
    { q: '八面體錯合物 [MA₂B₂C₂]（A、B、C 皆為單牙配位基）有幾種幾何異構物？', o: ['5', '6', '4', '3'], a: 0,
      why: '三對都 trans 1 種、恰一對 trans 3 種、三對都 cis 1 種，共 5 種幾何異構物；全 cis 的那種有鏡像，所以立體異構物共 6 種。', show: { w: 'ciso', set: { t: 'ma2b2c2' } } },
    { q: '[Fe(CN)₆]⁴⁻ 有幾個未成對電子？', o: ['0', '4', '2', '1'], a: 0,
      why: 'Fe²⁺ 是 d⁶；CN⁻ 是強場配位基，低自旋，6 個電子全部成對填在 t<sub>2g</sub>，所以是反磁性。', show: { w: 'cfield', set: { ex: '[Fe(CN)₆]⁴⁻' } } },
    { q: '[CoF₆]³⁻ 有幾個未成對電子？', o: ['4', '0', '2', '6'], a: 0,
      why: 'Co³⁺ 是 d⁶；F⁻ 是弱場配位基，高自旋：t<sub>2g</sub>⁴e<sub>g</sub>²，4 個未成對電子。對照 [Co(NH₃)₆]³⁺ 是低自旋、反磁性。', show: { w: 'cfield', set: { ex: '[CoF₆]³⁻' } } },
    { q: '四面體錯合物幾乎都是高自旋，主要原因是？', o: ['四面體的分裂能 Δt 只有 Δo 的約 4/9，小於成對能', '四面體的 d 軌域不分裂', '四面體只能用弱場配位基', '四面體的電子數較少'], a: 0,
      why: '只有四個配位基，且都不正對 d 軌域，分裂能小，電子寧可往上放也不成對。', show: { w: 'cfield', set: { ex: '[NiCl₄]²⁻' } } },
    { q: '平面四方錯離子中，能量最高的 d 軌域是？', o: ['dx²−y²', 'dz²', 'dxy', 'dxz 與 dyz'], a: 0,
      why: '四個配位基落在 x、y 軸上，dx²−y² 的電子雲正對它們，被排斥最強。', show: { w: 'cfield', set: { ex: '[Ni(CN)₄]²⁻' } } },
    { q: '下列 Cr³⁺ 八面體錯合物中，何者吸收的光波長最長？', o: ['[CrCl₆]³⁻', '[Cr(H₂O)₆]³⁺', '[Cr(NH₃)₆]³⁺', '[Cr(CN)₆]³⁻'], a: 0,
      why: 'Cl⁻ 在光譜化學序列中最弱，Δo 最小，吸收光的能量最低、波長最長。', show: { w: 'ccolor', set: { l: 'Cl⁻' } } },
    { q: '[Cr(H₂O)₆]³⁺ 吸收約 575 nm 的黃綠光，溶液看起來是什麼顏色？', o: ['紫色', '黃綠色', '紅色', '無色'], a: 0,
      why: '看到的是被吸收光的互補色；黃綠光被扣掉，剩下的光看起來是紫色。', show: { w: 'ccolor', set: { l: 'H₂O' } } },
    { q: '下列水溶液何者無色？', o: ['[Zn(H₂O)₆]²⁺', '[Cu(H₂O)₆]²⁺', '[Ni(H₂O)₆]²⁺', '[Co(H₂O)₆]²⁺'], a: 0,
      why: 'Zn²⁺ 是 d¹⁰，d 軌域全滿，沒有 d–d 躍遷，所以不吸收可見光。' },
    { q: '乙二胺（en）取代兩個 NH₃ 形成的錯合物比較穩定，主要原因是？', o: ['反應後自由粒子數增加，熵增加', 'en 的 N 原子鹼性遠大於 NH₃', '反應強烈放熱', 'en 是強酸'], a: 0,
      why: '螯合效應主要來自熵：一個 en 換出兩個 NH₃，溶液中的分子數變多，ΔS > 0。' },
    { q: '下列金屬羰基錯合物中，何者的 C–O 伸縮振動頻率最高？', o: ['[Mn(CO)₆]⁺', 'Cr(CO)₆', '[V(CO)₆]⁻', '三者相同'], a: 0,
      why: '帶正電的 Mn 錯合物 d 電子較不願回送，π 逆授最少，C≡O 鍵最強，伸縮頻率最高。' },
  ],
});
