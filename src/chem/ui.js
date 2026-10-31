/* ---------- 後中化學：介面小工具（選取、跳脫、儲存、數字格式、座標圖） ---------- */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const store = {
  get(k, d) { try { const v = localStorage.getItem('chem-ladder:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('chem-ladder:' + k, JSON.stringify(v)); } catch (e) { /* 無法儲存時忽略 */ } },
};
// 數字：固定小數位；科學記號用 ×10 上標
const fx = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function sci(v, d = 2) {
  if (!Number.isFinite(v) || v === 0) return String(v);
  const e = Math.floor(Math.log10(Math.abs(v))), m = v / 10 ** e;
  if (e >= -2 && e <= 3) return v.toFixed(Math.max(0, d - e));
  return `${m.toFixed(d)} × 10${String(e).split('').map(c => SUP[c]).join('')}`;
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* 座標圖：o = { w, h, x:[min,max], y:[min,max], xt:[刻度], yt:[刻度], xlab, ylab }；draw(X, Y) 回傳圖內 SVG */
function chart(o, draw) {
  const w = o.w || 560, h = o.h || 300, L = 46, R = 14, T = 12, B = 40;
  const X = v => L + (v - o.x[0]) / (o.x[1] - o.x[0]) * (w - L - R), Y = v => h - B - (v - o.y[0]) / (o.y[1] - o.y[0]) * (h - T - B);
  const xt = o.xt || [], yt = o.yt || [];
  return `<svg class="ch" viewBox="0 0 ${w} ${h}" role="img"${o.label ? ` aria-label="${esc(o.label)}"` : ''}>
<g class="grid">${yt.map(v => `<line x1="${L}" x2="${w - R}" y1="${Y(v)}" y2="${Y(v)}"/>`).join('')}</g>
<line class="ax" x1="${L}" x2="${w - R}" y1="${h - B}" y2="${h - B}"/><line class="ax" x1="${L}" x2="${L}" y1="${T}" y2="${h - B}"/>
${xt.map((v, i) => `<text class="tk" x="${X(v)}" y="${h - B + 16}" text-anchor="middle">${o.xtl ? o.xtl[i] : v}</text>`).join('')}
${yt.map(v => `<text class="tk" x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join('')}
${o.xlab ? `<text class="lab" x="${(L + w - R) / 2}" y="${h - 6}" text-anchor="middle">${o.xlab}</text>` : ''}
${o.ylab ? `<text class="lab" transform="translate(15 ${(T + h - B) / 2}) rotate(-90)" text-anchor="middle">${o.ylab}</text>` : ''}
${draw(X, Y)}</svg>`;
}
const path = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
