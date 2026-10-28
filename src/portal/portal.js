/* ---------- 學習階梯首頁：課程總覽、各課程進度、登入同步（一次同步所有課程） ---------- */
// 語言跟著生統階梯的設定（目前只有生統有英文版）
const isZh = () => { let l = null; try { l = localStorage.getItem('biostat-ladder:lang'); } catch (e) { /* 私密模式 */ } return l ? l === 'zh-TW' : /^zh/i.test(navigator.language || 'zh'); };
const T = (zh, en) => (isZh() ? zh : en);
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const store = {
  get(k, d) { try { const v = localStorage.getItem('learn-ladder:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('learn-ladder:' + k, JSON.stringify(v)); } catch (e) { /* 無法儲存時忽略 */ } },
};
// 各課程的本機進度存在自己的前綴下（同網域，首頁讀得到）；total 由課程頁開啟時寫入
const local = (pre, k, d) => { try { const v = localStorage.getItem(pre + ':' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const COURSES = [
  { id: 'biostat', pre: 'biostat-ladder', doc: 'biostatLadder', total: 67, color: '#2F3B99', glyph: 'μ · p · HR',
    title: ['生統階梯', 'Biostat Ladder'], desc: ['從國中數學到可投稿論文的生物統計。', 'Biostatistics from middle-school math to a publishable paper.'],
    items: [['互動圖解每個統計概念', 'Every concept as an interactive chart'], ['一份模擬試驗資料貫穿全課程', 'One simulated trial used throughout'], ['不寫程式的分析實驗室', 'A no-code analysis lab']] },
  { id: 'chem', pre: 'chem-ladder', doc: 'chemLadder', total: 26, color: '#17705F', glyph: 'H⁺ ⇌ A⁻',
    title: ['後中化學', 'Post-bacc Chemistry'], desc: ['學士後中醫入學考的普通化學與有機化學，從原理學起。', 'General and organic chemistry for Taiwan’s post-baccalaureate TCM entrance exam.'],
    items: [['滴定、平衡、反應機構都能動手操作', 'Hands-on titrations, equilibria and mechanisms'], ['看懂電子怎麼流，不用死背反應', 'Understand electron flow instead of memorizing reactions'], ['普化原理直接串到有機反應', 'General chemistry linked straight to organic reactions']] },
];
const doneOf = c => local(c.pre, 'done', {}), totalOf = c => local(c.pre, 'total', c.total);
const countOf = c => Object.keys(doneOf(c)).length;
const L = a => a[isZh() ? 0 : 1];

function render() {
  document.documentElement.lang = isZh() ? 'zh-Hant' : 'en';
  document.title = T('學習階梯', 'Learn Ladder');
  $('#eb').textContent = T('互動圖解 · 從原理學起', 'Interactive · From first principles');
  $('#h1').textContent = T('一階一階，把難的東西學懂。', 'Learn hard things, one step at a time.');
  $('#lede').textContent = T('每門課都從直覺和圖像開始，再講原理與應用。不用安裝軟體，手機也能學；登入後進度在不同裝置同步。', 'Every course starts from intuition and pictures, then principles and applications. Nothing to install, works on your phone, and progress syncs across devices when you sign in.');
  $('#courses').innerHTML = COURSES.map(c => {
    const n = countOf(c), t = totalOf(c), body = `<span class="glyph">${c.glyph}</span><h2>${L(c.title)}</h2><p>${L(c.desc)}</p><ul>${c.items.map(i => `<li>${L(i)}</li>`).join('')}</ul>`;
    if (c.soon) return `<div class="course soon" style="--cc:${c.color}"><span class="badge">${T('製作中', 'Coming soon')}</span>${body}</div>`;
    return `<a class="course" href="./${c.id}/" style="--cc:${c.color}">${body}<span class="meter"><span>${n} / ${t}</span><span class="bar"><i style="width:${Math.round(100 * n / t)}%"></i></span><span class="go">${n ? T('繼續', 'Continue') : T('開始', 'Start')} →</span></span></a>`;
  }).join('');
  const all = COURSES.filter(c => !c.soon).reduce((s, c) => s + countOf(c), 0);
  $('#progAll').textContent = all ? T(`已完成 ${all} 章`, `${all} chapters done`) : '';
  $('#how').innerHTML = T('<b>課程內容</b>皆為原創教材，互動圖中的資料多為模擬資料，僅供學習。程式碼採 MIT 授權，課程內容採 CC BY 4.0。', '<b>All course material</b> is original; data in the charts are mostly simulated and for learning only. Code under MIT, content under CC BY 4.0.');
  $('#syncSlot').innerHTML = CLOUD.hint();
}
const $ = s => document.querySelector(s);

// 雲端同步設定：首頁一次同步所有已開放的課程（src/shared/cloud.js）
const COURSE = {
  tracks: COURSES.filter(c => !c.soon).map(c => ({ doc: c.doc, get: () => doneOf(c), set: m => { try { localStorage.setItem(c.pre + ':done', JSON.stringify(m)); } catch (e) { /* 忽略 */ } } })),
  count: () => COURSES.filter(c => !c.soon).reduce((s, c) => s + countOf(c), 0),
  total: () => COURSES.filter(c => !c.soon).reduce((s, c) => s + totalOf(c), 0),
  refresh: render,
};
render();
CLOUD.start();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('./sw.js').catch(() => {});
