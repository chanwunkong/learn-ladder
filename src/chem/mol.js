/* ---------- 後中化學：分子與反應機構繪圖 ----------
   場景（scene）：
     atoms: { id: { x, y, t: 標籤（'' 為骨架頂點）, c: 電荷（'+' '−' 'δ+' 'δ−'）, lp: [孤對電子方向（度）], halo: 立體障礙半徑, hl: 強調色, hide } }
     bonds: [[a, b, 型別]]  型別：'s' 單鍵、'd' 雙鍵、't' 參鍵、'w' 楔形（朝向讀者）、'h' 虛楔（遠離讀者）、'p' 部分鍵（過渡狀態）、'sd' 實線＋虛線（共振混成）
     rings: [{ x, y, r }]  環內圈（苯的共振混成）
     arrows: [{ f: { lp: [原子, 角度] } | { b: [a, b] }, t: { a: 原子 } | { m: [a, b] }, bend }]  彎箭頭：電子從哪裡流到哪裡
     orbs: [{ a: 原子, ang }]  空的 p 軌域（兩瓣）；ts: true 畫過渡狀態的括號；notes: [{ x, y, t, cls }]
   座標以鍵長為 1，y 朝上；MOL.svg(scene, { w, h, s: 每單位像素, cx, cy }) 畫出 SVG。 */
const MOL = (() => {
  const vis = t => (t || '').replace(/[₀-₉⁰-⁹⁺⁻]/g, '').length;   // 標籤可見字數（下標不太佔寬）
  const rad = a => (a.t ? 7 + 4.2 * vis(a.t) : 0);
  function geom(sc, o) {
    const S = o.s || 46, cx = o.cx ?? o.w / 2, cy = o.cy ?? o.h / 2;
    const P = id => { const a = sc.atoms[id]; return [cx + a.x * S, cy - a.y * S]; };
    return { S, P };
  }
  function bond(sc, G, [a, b, k]) {
    const A = sc.atoms[a], B = sc.atoms[b]; if (!A || !B || A.hide || B.hide) return '';
    let [x1, y1] = G.P(a), [x2, y2] = G.P(b); const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const r1 = Math.min(rad(A), L * 0.4), r2 = Math.min(rad(B), L * 0.4);
    x1 += ux * r1; y1 += uy * r1; x2 -= ux * r2; y2 -= uy * r2;
    const nx = -uy, ny = ux;
    if (k === 'w') return `<path class="bw" d="M${x1} ${y1}L${x2 + nx * 5} ${y2 + ny * 5}L${x2 - nx * 5} ${y2 - ny * 5}Z"/>`;
    if (k === 'h') return Array.from({ length: 6 }, (_, i) => { const t = (i + 0.5) / 6, w = 0.8 + 4.5 * t, px = x1 + (x2 - x1) * t, py = y1 + (y2 - y1) * t; return `<line class="bh" x1="${px + nx * w}" y1="${py + ny * w}" x2="${px - nx * w}" y2="${py - ny * w}"/>`; }).join('');
    if (k === 'p') return `<line class="bp" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    if (k === 'sd') return `<line class="b" x1="${x1 + nx * 3}" y1="${y1 + ny * 3}" x2="${x2 + nx * 3}" y2="${y2 + ny * 3}"/><line class="bp" x1="${x1 - nx * 3}" y1="${y1 - ny * 3}" x2="${x2 - nx * 3}" y2="${y2 - ny * 3}"/>`;
    if (k === 't') return `<line class="b" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><line class="b" x1="${x1 + nx * 4}" y1="${y1 + ny * 4}" x2="${x2 + nx * 4}" y2="${y2 + ny * 4}"/><line class="b" x1="${x1 - nx * 4}" y1="${y1 - ny * 4}" x2="${x2 - nx * 4}" y2="${y2 - ny * 4}"/>`;
    if (k === 'd') return `<line class="b" x1="${x1 + nx * 3}" y1="${y1 + ny * 3}" x2="${x2 + nx * 3}" y2="${y2 + ny * 3}"/><line class="b" x1="${x1 - nx * 3}" y1="${y1 - ny * 3}" x2="${x2 - nx * 3}" y2="${y2 - ny * 3}"/>`;
    return `<line class="b" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }
  function atom(sc, G, id) {
    const a = sc.atoms[id]; if (a.hide) return '';
    const [x, y] = G.P(id), r = rad(a);
    let s = '';
    if (a.halo) s += `<circle class="halo" cx="${x}" cy="${y}" r="${a.halo * G.S}"/>`;
    if (a.t) s += `<text class="at${a.hl ? ' hl' : ''}" x="${x}" y="${y + 5.5}" text-anchor="middle">${a.t}</text>`;
    (a.lp || []).forEach(g => {
      const u = [Math.cos(g * Math.PI / 180), -Math.sin(g * Math.PI / 180)], d = Math.max(r, 6) + 5, px = x + u[0] * d, py = y + u[1] * d;
      s += `<circle class="lp" cx="${px - u[1] * 3}" cy="${py + u[0] * 3}" r="1.9"/><circle class="lp" cx="${px + u[1] * 3}" cy="${py - u[0] * 3}" r="1.9"/>`;
    });
    if (a.c) { const cxx = x + Math.max(r, 6) + 2, cyy = y - 10; s += a.c.startsWith('δ') ? `<text class="dl" x="${cxx}" y="${cyy}">${a.c}</text>` : `<circle class="chg" cx="${cxx + 4}" cy="${cyy - 3}" r="7"/><text class="chgt" x="${cxx + 4}" y="${cyy + 1}" text-anchor="middle">${a.c === '+' ? '+' : '−'}</text>`; }
    return s;
  }
  function arrow(sc, G, ar) {
    let s, e;
    if (ar.f.lp) { const [id, g] = ar.f.lp, [x, y] = G.P(id), r = Math.max(rad(sc.atoms[id]), 6) + 5; s = [x + Math.cos(g * Math.PI / 180) * r, y - Math.sin(g * Math.PI / 180) * r]; }
    else { const [p, q] = ar.f.b.map(G.P); s = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; }
    if (ar.t.a) { const [x, y] = G.P(ar.t.a), r = Math.max(rad(sc.atoms[ar.t.a]), 7) + 3, d = Math.hypot(x - s[0], y - s[1]) || 1; e = [x - (x - s[0]) / d * r, y - (y - s[1]) / d * r]; }
    else { const [p, q] = ar.t.m.map(G.P); e = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; }
    const mx = (s[0] + e[0]) / 2, my = (s[1] + e[1]) / 2, L = Math.hypot(e[0] - s[0], e[1] - s[1]), b = ar.bend ?? 0.45;
    const c = [mx - (e[1] - s[1]) / L * L * b, my + (e[0] - s[0]) / L * L * b];
    return `<path class="arr" d="M${s[0].toFixed(1)} ${s[1].toFixed(1)}Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${e[0].toFixed(1)} ${e[1].toFixed(1)}" marker-end="url(#ah)"/>`;
  }
  function orb(sc, G, o) {
    const [x, y] = G.P(o.a), g = (o.ang || 0), r = G.S * 0.62;
    return [0, 180].map(k => { const t = (g + k) * Math.PI / 180; return `<ellipse class="orb" cx="${x + Math.cos(t) * r}" cy="${y - Math.sin(t) * r}" rx="${r * 0.82}" ry="${r * 0.42}" transform="rotate(${-(g + k)} ${x + Math.cos(t) * r} ${y - Math.sin(t) * r})"/>`; }).join('');
  }
  function svg(sc, o) {
    const G = geom(sc, o), ids = Object.keys(sc.atoms);
    let body = (sc.orbs || []).map(x => orb(sc, G, x)).join('');
    body += ids.filter(i => sc.atoms[i].halo && !sc.atoms[i].hide).map(i => { const [x, y] = G.P(i); return `<circle class="halo" cx="${x}" cy="${y}" r="${sc.atoms[i].halo * G.S}"/>`; }).join('');
    body += (sc.bonds || []).map(b => bond(sc, G, b)).join('');
    body += (sc.rings || []).map(r => `<circle class="bp" fill="none" cx="${(o.cx ?? o.w / 2) + r.x * G.S}" cy="${(o.cy ?? o.h / 2) - r.y * G.S}" r="${r.r * G.S}"/>`).join('');
    body += ids.map(i => atom(sc, G, i).replace(/<circle class="halo"[^>]*\/>/, '')).join('');
    body += (sc.arrows || []).map(a => arrow(sc, G, a)).join('');
    if (sc.ts) body += `<text class="ts" x="${o.w / 2 - G.S * 3.1}" y="${o.h / 2 + 14}">[</text><text class="ts" x="${o.w / 2 + G.S * 2.85}" y="${o.h / 2 + 14}">]</text><text class="tsd" x="${o.w / 2 + G.S * 3.15}" y="${o.h / 2 - 26}">‡</text>`;
    body += (sc.notes || []).map(n => { const x = (o.cx ?? o.w / 2) + n.x * G.S, y = (o.cy ?? o.h / 2) - n.y * G.S; return `<text class="note ${n.cls || ''}" x="${x}" y="${y}" text-anchor="middle">${n.t}</text>`; }).join('');
    return `<svg class="mol" viewBox="0 0 ${o.w} ${o.h}" role="img"${o.label ? ` aria-label="${esc(o.label)}"` : ''}><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ahp"/></marker></defs>${body}</svg>`;
  }
  // 兩個場景之間的插值：位置線性內插；前半段用起點的鍵，後半段用終點的鍵；動畫中不畫箭頭
  function lerp(a, b, t) {
    const atoms = {};
    for (const id of new Set([...Object.keys(a.atoms), ...Object.keys(b.atoms)])) {
      const p = a.atoms[id], q = b.atoms[id];
      if (p && q) atoms[id] = { ...(t < 0.5 ? p : q), x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, hide: (t < 0.5 ? p : q).hide };
      else atoms[id] = { ...(p || q), hide: (p ? t > 0.5 : t < 0.5) || (p || q).hide };
    }
    const src = t < 0.5 ? a : b;
    return { atoms, bonds: src.bonds, orbs: src.orbs, notes: [] };
  }
  return { svg, lerp };
})();

/* 反應能量圖：pts 為 [x, y] 的控制點（x 0–1、y 0–1），以平滑曲線連起來；at 為目前位置 */
function energySVG(pts, at, o = {}) {
  const w = o.w || 300, h = o.h || 150, L = 26, B = 22, T = 10, R = 8;
  const X = v => L + v * (w - L - R), Y = v => h - B - v * (h - T - B);
  const mk = P => x => { // 分段餘弦內插：極大極小點都平滑
    for (let i = 0; i < P.length - 1; i++) { const [x0, y0] = P[i], [x1, y1] = P[i + 1]; if (x <= x1) { const t = (x - x0) / (x1 - x0); return y0 + (y1 - y0) * (1 - Math.cos(Math.PI * t)) / 2; } }
    return P[P.length - 1][1];
  };
  const f = mk(pts), alt = o.alt ? `<path class="catc" d="${path(Array.from({ length: 121 }, (_, i) => [X(i / 120), Y(mk(o.alt)(i / 120))]))}"/>` : '';
  const line = Array.from({ length: 121 }, (_, i) => [X(i / 120), Y(f(i / 120))]);
  const cur = at == null ? '' : `<circle class="edot" cx="${X(at)}" cy="${Y(f(at))}" r="6"/>`;
  const labs = (o.labels || []).map(([x, t, dy]) => `<text class="elab" x="${X(x) + (x < 0.1 ? 6 : 0)}" y="${Math.max(12, Y(f(x)) - (dy || 10))}" text-anchor="${x < 0.1 ? 'start' : x > 0.9 ? 'end' : 'middle'}">${t}</text>`).join('');
  return `<svg class="en" viewBox="0 0 ${w} ${h}" role="img" aria-label="反應能量圖"><line class="ax" x1="${L}" y1="${T}" x2="${L}" y2="${h - B}"/><line class="ax" x1="${L}" y1="${h - B}" x2="${w - R}" y2="${h - B}"/><text class="lab" transform="translate(15 ${(T + h - B) / 2}) rotate(-90)" text-anchor="middle">能量</text><text class="lab" x="${(L + w) / 2}" y="${h - 5}" text-anchor="middle">反應進行 →</text><path class="ecurve" d="${path(line)}"/>${alt}${labs}${cur}</svg>`;
}

/* 機構播放器：frames = [{ sc, cap, at }]；在 el 中畫出分子、說明、能量圖與控制鈕。回傳 { go(i), reset() } */
function mechPlayer(el, o) {
  let frames = o.frames(), i = 0, anim = 0;
  el.innerHTML = `<div class="mech"><div class="mech-view"></div><div class="mech-side">${o.energy ? '<div class="mech-en"></div>' : ''}<p class="mech-cap" aria-live="polite"></p></div></div>
<div class="w-row mech-ctl"><button class="btn sm" type="button" data-m="0">⟲ 重來</button><button class="btn sm" type="button" data-m="-1">‹ 上一步</button><button class="btn sm pri" type="button" data-m="1">下一步 ›</button><span class="mech-step mono small mut"></span></div>`;
  const view = $('.mech-view', el), cap = $('.mech-cap', el), en = $('.mech-en', el), step = $('.mech-step', el), W = o.w || 520, H = o.h || 260;
  // 能量圖設定可以是固定值，或依目前選項變化的函式 () => ({ pts, alt, labels })
  const EG = () => (typeof o.energy === 'function' ? o.energy() : { pts: o.energy, labels: o.elabels });
  const eDraw = at => { const g = EG(); return energySVG(g.pts, at, { labels: g.labels, alt: g.alt }); };
  const draw = (sc, f) => {
    view.innerHTML = MOL.svg(sc, { w: W, h: H, s: o.s || 56, cy: o.cy, label: o.label });
    if (f) { cap.innerHTML = f.cap; if (en) en.innerHTML = eDraw(f.at); step.textContent = `${i + 1} / ${frames.length}`; }
    $('[data-m="1"]', el).disabled = i >= frames.length - 1; $('[data-m="-1"]', el).disabled = i <= 0;
  };
  const show = () => draw(frames[i].sc, frames[i]);
  function go(n, animate = true) {
    n = clamp(n, 0, frames.length - 1); cancelAnimationFrame(anim);
    if (!animate || n !== i + 1 || matchMedia('(prefers-reduced-motion: reduce)').matches) { i = n; show(); return; }
    const a = frames[i].sc, b = frames[n].sc, t0 = performance.now(), D = 900;
    const tick = now => {
      const t = Math.min(1, (now - t0) / D), e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      view.innerHTML = MOL.svg(MOL.lerp(a, b, e), { w: W, h: H, s: o.s || 56, cy: o.cy });
      if (en) en.innerHTML = eDraw(frames[i].at + (frames[n].at - frames[i].at) * e);
      if (t < 1) anim = requestAnimationFrame(tick); else { i = n; show(); }
    };
    anim = requestAnimationFrame(tick);
  }
  $$('[data-m]', el).forEach(b => { b.onclick = () => { const m = +b.dataset.m; if (m === 0) go(0, false); else go(i + m, m > 0); }; });
  show();
  return { go, reset() { frames = o.frames(); i = Math.min(i, frames.length - 1); go(0, false); }, get i() { return i; } };
}
