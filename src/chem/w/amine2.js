/* ---------- 後中化學：胺與含氮雜環的補充互動圖 ---------- */

/* ===== 1. 含氮雜環 ===== */
const HETN = {
  pyrrole: ['吡咯', 'N 的孤對電子在 p 軌域，屬於 6π 芳香系統', '幾乎沒有鹼性（pKaH 約 0；質子化會破壞芳香性）', '親電子取代很快，在 C2（正電荷可分到三個原子上）', '帕爾–克諾爾合成：2,5-己二酮 + NH₃ → 2,5-二甲基吡咯'],
  pyridine: ['吡啶', 'N 的孤對電子在環平面上的 sp² 軌域，不屬於 π 系統', '有鹼性（pKaH 5.2），比烷胺弱（sp² 的 s 性質較高）', '像硝基苯一樣鈍化，親電子取代很難，發生時在 C3', '奇奇巴賓反應：與 NaNH₂ 加熱，NH₂⁻ 做親核取代在 C2（喹啉亦同）'],
  imid: ['咪唑（組織胺的環）', '一個 N–H 的 N 提供孤對電子給 π 系統；另一個 =N– 的孤對電子在 sp² 軌域', '=N– 有鹼性（pKaH 約 7.0），質子化後兩個 N 共振分擔正電荷', '—', '組織胺三個 N 的鹼性：側鏈的一級胺（約 9.8）> 環上 =N–（約 6）> 環上 N–H（幾乎沒有）'],
  indole: ['吲哚', 'N 的孤對電子參與 10π 芳香系統', '幾乎沒有鹼性', '親電子取代（如 Br₂）在 C3，正電荷由 N 穩定又不破壞苯環', '費雪吲哚合成：苯肼 + 醛或酮，酸催化加熱 → 吲哚'],
  quin: ['喹啉', '和吡啶一樣，N 的孤對電子在 sp² 軌域', 'pKaH 約 4.9', '親電子取代發生在苯環那一側（C5、C8）', '與 NaNH₂ 在 C2 親核取代；尼古丁的吡啶環耐氧化，KMnO₄ 把側邊的環氧化成羧基，得到菸鹼酸（維生素 B₃）'],
};
W.hetero = el => {
  let cur = 'pyrrole';
  el.innerHTML = `${seg('htS', Object.entries(HETN).map(([k, v]) => [k, v[0]]), cur)}<div class="cards" id="htK"></div><p class="note">判斷雜環 N 的鹼性只要問一件事：<b>孤對電子是不是芳香 π 系統的一部分？</b>是的話它不能拿去接 H⁺（吡咯、吲哚、咪唑的 N–H）；不是的話（吡啶、咪唑的 =N–），就和一般 sp² 胺一樣有鹼性。</p>`;
  function draw() {
    const [, a, b, c, d] = HETN[cur];
    $('#htK', el).innerHTML = card('a', '孤對電子在哪裡', a) + card('b', '鹼性', b) + card('c', '親電子取代', c) + card('d', '常考反應', d);
    pressSeg(el, 'htS', cur);
  }
  bindSeg(el, 'htS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.h || cur; draw(); } };
};

/* ===== 2. 胺的檢驗與亞硝化 ===== */
const AMT = {
  p: ['一級胺 RNH₂', '生成 RNHSO₂Ar，N 上還有一個酸性 H，<b>溶於 NaOH</b>；加酸後沉澱', '放出 N₂（經不穩定的烷基重氮離子），生成醇、烯等混合物'],
  s: ['二級胺 R₂NH', '生成 R₂NSO₂Ar，N 上沒有 H，<b>不溶於 NaOH</b>，直接沉澱', '生成黃色油狀的 <b>N-亞硝胺</b> R₂N–N=O（如 NDMA，強致癌物）'],
  t: ['三級胺 R₃N', '<b>不反應</b>（N 上沒有 H），加酸後溶解', '烷基三級胺通常只形成鹽；芳香三級胺在環的對位亞硝化'],
  ar: ['芳香一級胺 ArNH₂', '同一級胺：溶於 NaOH', '0–5 °C 生成穩定的<b>重氮鹽</b> ArN₂⁺，可做桑德邁爾反應與偶氮偶合'],
};
W.amtest = el => {
  let cur = 'p';
  el.innerHTML = `${seg('amtS', Object.entries(AMT).map(([k, v]) => [k, v[0]]), cur)}<div class="cards" id="amtK"></div><p class="note">欣斯貝格試驗：胺 + 苯磺醯氯 ArSO₂Cl + NaOH。用來區分一、二、三級胺的關鍵是<b>產物的 N 上還有沒有 H</b>：磺醯胺的 N–H 被兩個 S=O 拉電子，酸性夠強，可以被 NaOH 拿走而溶解。亞硝酸（NaNO₂ + HCl）和胺的反應也依級數不同；藥品中的 NDMA 雜質就是二級胺遇到亞硝酸鹽產生的。</p>`;
  function draw() {
    const [, h, n] = AMT[cur];
    $('#amtK', el).innerHTML = card('h', '欣斯貝格試驗', h) + card('n', '與 HNO₂（NaNO₂／HCl）', n);
    pressSeg(el, 'amtS', cur);
  }
  bindSeg(el, 'amtS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.a || cur; draw(); } };
};
