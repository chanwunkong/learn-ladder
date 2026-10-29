/* ---------- 後中化學：醇與醚的補充互動圖 ---------- */

/* ===== 1. 醇的酸催化脫水 =====
   溫度範圍：OpenStax《Organic Chemistry》17.6 節（三級 25–80 °C、二級 100–140 °C、一級 170–180 °C 的約略條件） */
const DEHY = {
  t: ['2-甲基-2-丁醇（三級）', '三級', '(CH₃)₂C⁺–CH₂CH₃（三級，直接生成）', [['2-甲基-2-丁烯', '主', '三取代，查依采夫'], ['2-甲基-1-丁烯', '次', '二取代']], '25–80 °C', '三級碳陽離子最容易生成，反應最快、條件最溫和。'],
  r: ['3,3-二甲基-2-丁醇（二級）', '二級', '二級 → 甲基移位 → (CH₃)₂C⁺–CH(CH₃)₂（三級）', [['2,3-二甲基-2-丁烯', '主', '重排後，四取代'], ['2,3-二甲基-1-丁烯', '次', '重排後，二取代'], ['3,3-二甲基-1-丁烯', '少', '未重排']], '100–140 °C', '二級碳陽離子旁是四級碳，甲基帶著電子對移過來變成三級碳陽離子，所以主產物的骨架和起始物不同。'],
  c: ['2-甲基環己醇（二級）', '二級', '環上的二級碳陽離子', [['1-甲基環己烯', '主', '三取代'], ['3-甲基環己烯', '次', '二取代']], '100–140 °C', '失去不同 β-H 得到兩種烯，以取代較多的為主。'],
  p: ['1-丙醇（一級）', '一級', '一級碳陽離子太不穩定：質子化的醇直接被 HSO₄⁻ 拿走 β-H（類 E2）', [['丙烯', '主', '']], '170–180 °C', '一級醇需要高溫；較低溫且醇過量時，兩分子醇脫水生成醚（CH₃CH₂CH₂OCH₂CH₂CH₃）。'],
};
W.dehyd = el => {
  let cur = 'r';
  el.innerHTML = `${seg('dhS', Object.entries(DEHY).map(([k, v]) => [k, v[0]]), cur)}<div class="oxpath" id="dhP"></div><div class="bars pk" id="dhB"></div><div class="cards" id="dhK"></div><p class="note" id="dhN"></p>`;
  function draw() {
    const [nm, lv, cat, P, T, why] = DEHY[cur];
    $('#dhP', el).innerHTML = [nm, '質子化 –OH₂⁺', cat].map((s, i, a) => `<span class="oxs${i === a.length - 1 ? ' end' : ''}">${s}</span>`).join('<span class="oxa">→</span>');
    $('#dhB', el).innerHTML = P.map(([n, k, d]) => `<div><span>${n}</span><i class="ba" style="width:${{ 主: 90, 次: 35, 少: 10 }[k]}%"></i><b>${k}${d ? '：' + d : ''}</b></div>`).join('');
    $('#dhK', el).innerHTML = card('l', '醇的級數', lv) + card('t', '典型條件（濃 H₂SO₄）', T);
    $('#dhN', el).innerHTML = `${why} 脫水速率：三級 > 二級 > 一級，和碳陽離子的穩定度一致。要避免重排、在較溫和條件下脫水，可用 POCl₃／吡啶（E2）。`;
    pressSeg(el, 'dhS', cur);
  }
  bindSeg(el, 'dhS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.a || cur; draw(); } };
};

/* ===== 2. 威廉森醚合成：從哪一邊切 ===== */
const WILL = {
  tbme: ['第三丁基甲基醚 (CH₃)₃C–O–CH₃', [['(CH₃)₃CO⁻ + CH₃I', 1, '甲基鹵化物 SN2 最快，得到醚。'], ['CH₃O⁻ + (CH₃)₃CBr', 0, '三級鹵烷不能 SN2，CH₃O⁻ 當鹼做 E2，得到 2-甲基丙烯。']]],
  ipme: ['異丙基甲基醚 (CH₃)₂CH–O–CH₃', [['(CH₃)₂CHO⁻ + CH₃I', 1, '甲基鹵化物，SN2 順利。'], ['CH₃O⁻ + (CH₃)₂CHBr', 0, '二級鹵烷與強鹼：E2（丙烯）和 SN2 競爭，產率差。']]],
  pheth: ['乙基苯基醚 C₆H₅–O–CH₂CH₃', [['C₆H₅O⁻（酚 + NaOH）+ CH₃CH₂Br', 1, '酚（pKa 10）用 NaOH 就能變成酚氧離子，對一級鹵烷 SN2。'], ['CH₃CH₂O⁻ + C₆H₅Br', 0, '芳基鹵化物不能 SN2（背面被苯環擋住）。']]],
  thf: ['四氫呋喃（分子內）', [['⁻O–CH₂CH₂CH₂CH₂–Cl', 1, '同一分子的 O⁻ 從背面攻擊 C–Cl，生成五員環醚。五、六員環最容易形成；三員環（環氧化物）也很快。'], ['兩分子之間反應', 0, '稀溶液中分子內反應遠快於分子間反應。']]],
};
W.willi = el => {
  let cur = 'tbme';
  el.innerHTML = `${seg('wiS', Object.entries(WILL).map(([k, v]) => [k, v[0].split(' ')[0]]), cur)}<p class="eq" id="wiT"></p><div id="wiR"></div><p class="note">威廉森醚合成 = 烷氧離子（或酚氧離子）對鹵烷做 SN2。所以設計時讓<b>鹵烷那一側是甲基或一級</b>，體積大的一側當烷氧離子。烷氧離子用 Na 或 NaH 和醇製備；酚較酸，用 NaOH 就夠。</p>`;
  function draw() {
    const [t, R] = WILL[cur];
    $('#wiT', el).textContent = `目標：${t}`;
    $('#wiR', el).innerHTML = `<div class="cards">${R.map(([r, ok, w]) => card(ok ? 'ok' : 'no', ok ? '✓ 可行' : '✗ 不好', r, w)).join('')}</div>`;
    pressSeg(el, 'wiS', cur);
  }
  bindSeg(el, 'wiS', v => { cur = v; draw(); });
  draw();
  return { set(s) { cur = s.t || cur; draw(); } };
};
