/* ---------- 後中化學：胺類的互動圖 ---------- */

/* ===== 1. 胺類藥物在不同 pH 的離子化程度 ===== */
W.amineph = el => {
  const st = { pk: 9.5, pH: 7.4 };
  const PRE = [['胃（pH 1.5）', 1.5], ['小腸（pH 6.5）', 6.5], ['血液（pH 7.4）', 7.4]];
  el.innerHTML = `<p class="eq">R–NH₃⁺ ⇌ R–NH₂ + H⁺　　pH = pKaH + log([R–NH₂] ÷ [R–NH₃⁺])</p><div class="w-row"><label class="rng">胺的 pKaH <input type="range" id="amK" min="3" max="12" step="0.1"><output class="mono" id="amKo"></output></label><label class="rng">環境 pH <input type="range" id="amP" min="1" max="10" step="0.1"><output class="mono" id="amPo"></output></label></div><div class="w-row">${PRE.map(([t, v]) => `<button class="btn sm ghost" type="button" data-p="${v}">${t}</button>`).join('')}</div><div id="amB"></div><p class="note" id="amN"></p>`;
  function draw() {
    const fn = 1 / (1 + 10 ** (st.pk - st.pH)), pn = 100 * fn;
    $('#amB', el).innerHTML = `<div class="stack"><i class="ba" style="width:${100 - pn}%">${100 - pn >= 12 ? `R–NH₃⁺ ${fx(100 - pn, 1)}%` : ''}</i><i class="bha" style="width:${pn}%">${pn >= 12 ? `R–NH₂ ${fx(pn, 1)}%` : ''}</i></div><p class="small mut">橘：帶正電（易溶於水，難穿過細胞膜）　藍：中性（可穿過細胞膜）</p>`;
    $('#amN', el).innerHTML = `pH 比 pKaH ${st.pH < st.pk ? '低' : '高'} ${fx(Math.abs(st.pH - st.pk), 1)}，中性胺只佔 <b>${pn < 0.01 ? sci(pn, 1) : fx(pn, 2)}%</b>。這是酸鹼章 Henderson–Hasselbalch 的直接應用：<b>pH 低於 pKaH，胺大多質子化帶正電</b>。許多藥物（嗎啡、利多卡因、抗組織胺）是胺，做成鹽酸鹽（R–NH₃⁺Cl⁻）增加水溶性；但只有中性形式能穿過脂質細胞膜，所以吸收部位與作用都受 pH 影響。`;
    $('#amK', el).value = st.pk; $('#amP', el).value = st.pH; $('#amKo', el).textContent = fx(st.pk, 1); $('#amPo', el).textContent = fx(st.pH, 1);
  }
  $('#amK', el).oninput = e => { st.pk = +e.target.value; draw(); };
  $('#amP', el).oninput = e => { st.pH = +e.target.value; draw(); };
  $$('[data-p]', el).forEach(b => { b.onclick = () => { st.pH = +b.dataset.p; draw(); }; });
  draw();
  return { set(s) { Object.assign(st, s); draw(); } };
};

/* ===== 2. 胺的製備與反應 ===== */
W.aminetable = el => {
  const R = [
    ['製備', 'RX + NH₃（直接烷基化）', '混合物（一、二、三級胺與四級銨鹽）', '產物胺比 NH₃ 更親核，會繼續被烷基化，很難停在一級胺。'],
    ['製備', '加布瑞爾合成（鄰苯二甲醯亞胺鉀 + RX，再水解）', '純一級胺', '亞胺的 N 只有一個位置能被烷基化，避免多重烷基化。'],
    ['製備', '還原胺化（醛／酮 + 胺，NaBH₃CN）', '一、二、三級胺', '先形成亞胺（醛酮一章），再被選擇性還原。生物體內合成胺基酸也用類似方式（轉胺作用）。'],
    ['製備', '醯胺或腈以 LiAlH₄ 還原', '胺', 'C=O 被還原成 CH₂；腈的 C≡N 還原成 CH₂NH₂。'],
    ['製備', '硝基苯以 Fe／HCl 或 H₂／Pd 還原', '苯胺', '先硝化苯（芳香族一章），再還原，是製備苯胺的標準方法。'],
    ['反應', '胺 + 醯氯或酸酐', '醯胺', '胺當親核基做親核醯基取代（羧酸衍生物一章）。醯胺化後 N 的鹼性與活化能力大降，常用來「保護」胺。'],
    ['反應', '霍夫曼脫去（過量 CH₃I，再 Ag₂O、加熱）', '取代較少的烯', '先變成四級銨鹽（–NMe₃⁺ 是好離去基），再 E2。離去基大，鹼只能拿外側的 H，得到霍夫曼產物。'],
    ['反應', '芳香一級胺 + NaNO₂／HCl（0–5 °C）', '芳香重氮鹽 ArN₂⁺', 'N₂ 是極好的離去基：加 CuCl、CuBr、CuCN（桑德邁爾反應）換成 Cl、Br、CN；加水加熱成酚；加 H₃PO₂ 換成 H。也能和苯酚偶合成偶氮染料。'],
  ];
  let cur = 0;
  el.innerHTML = `<label class="sel">反應 <select id="atS">${R.map((r, i) => `<option value="${i}">${r[0]}：${r[1]}</option>`).join('')}</select></label><div class="cards" id="atK"></div><p class="note" id="atN"></p>`;
  function draw() { $('#atS', el).value = cur; $('#atK', el).innerHTML = card('r', '試劑', R[cur][1]) + card('p', '產物', R[cur][2]); $('#atN', el).innerHTML = R[cur][3]; }
  $('#atS', el).onchange = e => { cur = +e.target.value; draw(); };
  draw();
  return { set(s) { cur = s.i ?? cur; draw(); } };
};
