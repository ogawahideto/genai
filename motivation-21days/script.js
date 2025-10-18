(() => {
  const $ = (sel) => document.querySelector(sel);
  const pad2 = (n) => String(n).padStart(2, '0');

  const els = {
    startTimer: $('#start-timer'),
    markDone: $('#mark-done'),
    reset: $('#reset-streak'),
    todayStatus: $('#today-status'),
    streak: $('#streak'),
    lastDone: $('#last-done'),
    modal: $('#timer-modal'),
    countdown: $('#countdown'),
    cancelTimer: $('#cancel-timer'),
    finishEarly: $('#finish-early'),
    toast: $('#toast'),
  };

  const key = 'm21:progress';

  function todayStr(date = new Date()) {
    date.setHours(0,0,0,0);
    return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`;
  }

  function parseDate(s) {
    if (!s) return null;
    const [y,m,d] = s.split('-').map(Number);
    const dt = new Date(y, (m||1)-1, d||1);
    dt.setHours(0,0,0,0);
    return dt;
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
  }
  function save(data) { localStorage.setItem(key, JSON.stringify(data)); }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    setTimeout(() => els.toast.classList.remove('show'), 1800);
  }

  function humanDate(s) {
    if (!s) return '—';
    const dt = parseDate(s);
    return `${dt.getFullYear()}/${dt.getMonth()+1}/${dt.getDate()}`;
  }

  function refresh() {
    const data = load();
    const t = todayStr();

    if (data.lastDone === t) {
      els.todayStatus.textContent = '済';
      els.todayStatus.style.color = 'var(--accent-2)';
    } else {
      els.todayStatus.textContent = '未';
      els.todayStatus.style.color = '';
    }

    const s = Number(data.streak || 0);
    els.streak.textContent = `${s}日`;
    els.lastDone.textContent = humanDate(data.lastDone);
  }

  function markTodayDone() {
    const data = load();
    const t = todayStr();
    const last = data.lastDone;

    if (last === t) {
      refresh();
      showToast('今日はもう達成済み！');
      return;
    }

    let newStreak = 1;
    if (last) {
      const lastDt = parseDate(last);
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      const yestStr = todayStr(yest);
      if (last === yestStr) newStreak = Number(data.streak||0) + 1;
    }

    save({ lastDone: t, streak: newStreak });
    refresh();
    showToast('ナイス！ しっかり前進できた');
  }

  // 5分タイマー（キャンセル/早期完了可）
  let timerId = null;
  let endAt = 0;
  function openTimer(minutes = 5) {
    endAt = Date.now() + minutes * 60 * 1000;
    els.modal.setAttribute('aria-hidden', 'false');
    tick();
    timerId = setInterval(tick, 200);
  }
  function closeTimer() {
    els.modal.setAttribute('aria-hidden', 'true');
    if (timerId) { clearInterval(timerId); timerId = null; }
  }
  function tick() {
    const remain = Math.max(0, endAt - Date.now());
    const sec = Math.ceil(remain / 1000);
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    els.countdown.textContent = `${pad2(mm)}:${pad2(ss)}`;
    if (remain <= 0) {
      closeTimer();
      markTodayDone();
      showToast('5分クリア！よくやった！');
    }
  }

  // Wire events
  els.startTimer?.addEventListener('click', () => openTimer(5));
  els.cancelTimer?.addEventListener('click', () => closeTimer());
  els.finishEarly?.addEventListener('click', () => { closeTimer(); markTodayDone(); });
  els.markDone?.addEventListener('click', () => markTodayDone());
  els.reset?.addEventListener('click', () => {
    if (confirm('連続日数をリセットしますか？')) {
      localStorage.removeItem(key);
      refresh();
      showToast('リセットしました');
    }
  });

  // Init
  refresh();
})();

