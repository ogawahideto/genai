(() => {
  const yearEl = document.getElementById('year');
  const yearEl2 = document.getElementById('year2');
  const ratio = document.getElementById('ratio');
  const ratioValue = document.getElementById('ratioValue');
  const circle = document.querySelector('.equinox-circle');
  const resetBtn = document.getElementById('resetBtn');
  const tableBody = document.getElementById('equinoxTable');
  const quizForm = document.getElementById('quiz');
  const gradeBtn = document.getElementById('gradeBtn');
  const quizResult = document.getElementById('quizResult');

  const now = new Date();
  const year = now.getFullYear();
  if (yearEl) yearEl.textContent = String(year);
  if (yearEl2) yearEl2.textContent = String(year);

  const updateCircle = (percent) => {
    const safe = Math.max(0, Math.min(100, Number(percent)));
    const deg = `${safe * 3.6}deg`;
    circle?.style.setProperty('--day-deg', deg);
    ratioValue.textContent = `${safe}%`;
    ratio.setAttribute('aria-valuenow', String(safe));
  };

  ratio?.addEventListener('input', (e) => {
    const value = e.target.value;
    updateCircle(value);
  });

  resetBtn?.addEventListener('click', () => {
    ratio.value = '50';
    updateCircle(50);
  });

  // 初期化
  updateCircle(ratio?.value ?? 50);

  // --- 秋分日（簡易計算）テーブル ---
  // 1900-2099の近似式（日本の祝日計算で広く使われる簡易式）
  // 秋分日(9月) = floor(23.2488 + 0.242194*(Y-1980) - floor((Y-1980)/4))
  const autumnalEquinoxDay = (y) => {
    const day = Math.floor(23.2488 + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4));
    return day; // 9月(day)日
  };

  const wday = ['日','月','火','水','木','金','土'];

  const buildTable = (centerYear) => {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    for (let y = centerYear - 3; y <= centerYear + 3; y++) {
      const d = autumnalEquinoxDay(y);
      // ローカル（JST想定）で曜日を求める
      const date = new Date(Date.UTC(y, 8, d, 15, 0, 0)); // 9月はmonth=8
      // UTC→JSTでずれるのを避けるため、手軽にローカルへ
      const jsDate = new Date(y, 8, d);
      const tr = document.createElement('tr');
      if (y === centerYear) tr.classList.add('today');
      const ytd = document.createElement('td');
      ytd.textContent = String(y);
      const dtd = document.createElement('td');
      dtd.textContent = `${y}-09-${String(d).padStart(2,'0')}（${wday[jsDate.getDay()]}）`;
      const mtd = document.createElement('td');
      mtd.innerHTML = y === centerYear ? '<span class="badge">今年</span>' : '';
      tr.appendChild(ytd); tr.appendChild(dtd); tr.appendChild(mtd);
      tableBody.appendChild(tr);
    }
  };

  buildTable(year);

  // --- クイズ採点 ---
  const answers = { q1: 'a', q2: 'b', q3: 'a' };
  const clearMarks = () => {
    quizForm?.querySelectorAll('.is-correct, .is-wrong').forEach(el => {
      el.classList.remove('is-correct','is-wrong');
    });
  };

  gradeBtn?.addEventListener('click', () => {
    if (!quizForm) return;
    clearMarks();
    let score = 0, total = 0;
    Object.entries(answers).forEach(([key, ans]) => {
      total++;
      const checked = quizForm.querySelector(`input[name="${key}"]:checked`);
      const fieldset = checked?.closest('fieldset') || quizForm.querySelector(`input[name="${key}"]`)?.closest('fieldset');
      if (!checked) return; // 未回答はノーカウント表示
      if (checked.value === ans) {
        score++;
        fieldset?.classList.add('is-correct');
      } else {
        fieldset?.classList.add('is-wrong');
      }
    });
    if (quizResult) quizResult.textContent = `スコア: ${score} / ${total}`;
  });
})();
