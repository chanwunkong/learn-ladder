/* ---------- 答對後追問理由（化學、英文共用；2026-11-02 使用者要求，用來排除「猜對」） ----------
   第一次就答對、而且這題有拆解步驟時，從步驟中挑一步（不挑最後一步，那通常只是重述答案）來問。
   步驟格式：[問題, 正解, 誤1, 誤2, 說明, …]；選項每次重新打亂。
   ask(box, 步驟, 格式化函式, done(第一次就答對追問, 步驟))：追問答錯可以再選，直到選對才呼叫 done。 */
const FOLLOW = {
  ask(box, sts, fmt, done) {
    const n = sts.length, st = sts[n >= 3 ? Math.floor(Math.random() * (n - 1)) : 0];
    const ord = [1, 2, 3].map(j => [Math.random(), j]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    box.innerHTML = `<p class="fu-h"><b>答對了。</b>再確認一下理由（猜對的題目會在這裡被找出來）：</p><p class="gq">${fmt(st[0])}</p><div class="opts">${ord.map(j => `<button class="opt fu-o" type="button" data-j="${j}">${fmt(st[j])}</button>`).join('')}</div><p class="fu-no" hidden></p>`;
    let tries = 0;
    box.querySelectorAll('.fu-o').forEach(b => { b.onclick = () => {
      tries++; const ok = b.dataset.j === '1';
      b.classList.add(ok ? 'right' : 'wrong'); b.disabled = true;
      if (!ok) { const m = box.querySelector('.fu-no'); m.hidden = false; m.textContent = '理由不對，再選一次。這題會先當成猜對，排進錯題本。'; return; }
      box.querySelectorAll('.fu-o').forEach(x => { x.disabled = true; });
      done(tries === 1, st);
    }; });
  },
};
