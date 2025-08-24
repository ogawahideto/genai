// Simple WebAudio-based piano lesson app (C3..B5 range)

// --- Audio setup ---
const audio = {
  ctx: null,
  master: null,
  active: new Map(), // noteId -> {osc, gain}
};

function ensureAudio() {
  if (!audio.ctx) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 0.2;
    master.connect(ctx.destination);
    audio.ctx = ctx;
    audio.master = master;
  }
  if (audio.ctx.state === 'suspended') audio.ctx.resume();
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function attackRelease(noteId, duration = 0.35) {
  ensureAudio();
  const ctx = audio.ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = midiToFreq(noteId);
  const now = ctx.currentTime;
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(0.9, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(audio.master);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function noteOn(midi) {
  ensureAudio();
  if (audio.active.has(midi)) return;
  const ctx = audio.ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = midiToFreq(midi);
  gain.gain.value = 0.001;
  gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
  osc.connect(gain).connect(audio.master);
  osc.start();
  audio.active.set(midi, { osc, gain });
}

function noteOff(midi) {
  const n = audio.active.get(midi);
  if (!n) return;
  const ctx = audio.ctx;
  n.gain.gain.cancelScheduledValues(ctx.currentTime);
  n.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
  n.osc.stop(ctx.currentTime + 0.06);
  audio.active.delete(midi);
}

// --- Piano layout (expanded C3..B5) ---
const RNG = { from: 48, to: 83 }; // C3..B5
const PITCHES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const BLACK_STEPS = new Set([1,3,6,8,10]);

function nameFromMidi(midi) {
  const pc = midi % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${PITCHES[pc]}${oct}`;
}
function isBlack(midi) { return BLACK_STEPS.has(midi % 12); }

const NOTES = (() => {
  const out = [];
  for (let m = RNG.from; m <= RNG.to; m++) {
    out.push({
      name: nameFromMidi(m),
      midi: m,
      type: isBlack(m) ? 'black' : 'white',
    });
  }
  return out;
})();

const keyByMidi = new Map(NOTES.map(n => [n.midi, n]));

// Keep keyboard mapping for middle octave (C4..B4)
const KEYBOARD_MAP = new Map([
  ['a',60], ['w',61], ['s',62], ['e',63], ['d',64],
  ['f',65], ['t',66], ['g',67], ['y',68], ['h',69], ['u',70], ['j',71],
]);

function buildPiano(container) {
  container.innerHTML = '';
  const blackQueue = [];
  const whiteKeyEls = [];
  let whiteIndex = 0;

  // First pass: append whites, remember where each black sits (prev white index)
  for (const n of NOTES) {
    if (n.type === 'white') {
      const key = document.createElement('div');
      key.className = 'key white';
      key.dataset.midi = String(n.midi);
      key.dataset.name = n.name;
      const label = document.createElement('div');
      label.className = 'label';
      const hint = keyboardHintForMidi(n.midi);
      label.textContent = hint ? `${n.name} (${hint})` : n.name;
      key.appendChild(label);
      container.appendChild(key);
      whiteKeyEls.push({ el: key, note: n, whiteIndex });
      whiteIndex++;
    } else {
      blackQueue.push({ note: n, prevWhiteIndex: whiteIndex - 1 });
    }
  }

  // Second pass: overlay blacks with absolute left
  const whiteWidth = whiteKeyEls[0]?.el.getBoundingClientRect().width || 56;
  const blackWidth = 36;
  for (const { note, prevWhiteIndex } of blackQueue) {
    const key = document.createElement('div');
    key.className = 'key black';
    key.dataset.midi = String(note.midi);
    key.dataset.name = note.name;
    const label = document.createElement('div');
    label.className = 'label';
    const hint = keyboardHintForMidi(note.midi);
    label.textContent = hint || '';
    key.appendChild(label);
    container.appendChild(key);
    key.style.left = `${(prevWhiteIndex + 1) * whiteWidth - blackWidth / 2}px`;
  }

  // Mouse / touch handlers
  container.addEventListener('mousedown', onMouseDown);
  container.addEventListener('mouseup', onMouseUp);
  container.addEventListener('mouseleave', onMouseLeave);
  container.addEventListener('touchstart', onTouchStart, { passive: false });
  container.addEventListener('touchend', onTouchEnd);
}

function keyboardHintForMidi(midi) {
  for (const [k, m] of KEYBOARD_MAP.entries()) {
    if (m === midi) return k.toUpperCase();
  }
  return '';
}

function getKeyElByMidi(midi) {
  return document.querySelector(`.key[data-midi="${midi}"]`);
}

// --- Interaction ---
function activateKeyEl(keyEl) {
  const midi = Number(keyEl.dataset.midi);
  keyEl.classList.add('active');
  noteOn(midi);
  onUserPlayed(midi);
}

function deactivateKeyEl(keyEl) {
  const midi = Number(keyEl.dataset.midi);
  keyEl.classList.remove('active');
  noteOff(midi);
}

function onMouseDown(e) {
  const keyEl = e.target.closest('.key');
  if (!keyEl) return;
  ensureAudio();
  activateKeyEl(keyEl);
}
function onMouseUp(e) {
  const keyEl = e.target.closest('.key');
  if (!keyEl) return;
  deactivateKeyEl(keyEl);
}
function onMouseLeave() {
  document.querySelectorAll('.key.active').forEach(deactivateKeyEl);
}
function onTouchStart(e) {
  e.preventDefault();
  ensureAudio();
  for (const touch of e.changedTouches) {
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const keyEl = el && el.closest && el.closest('.key');
    if (keyEl) activateKeyEl(keyEl);
  }
}
function onTouchEnd() {
  for (const keyEl of document.querySelectorAll('.key.active')) deactivateKeyEl(keyEl);
}

// Keyboard mapping only for middle octave
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const ch = e.key.toLowerCase();
  const midi = KEYBOARD_MAP.get(ch);
  if (!midi) return;
  ensureAudio();
  const keyEl = getKeyElByMidi(midi);
  if (keyEl) activateKeyEl(keyEl);
});
window.addEventListener('keyup', (e) => {
  const ch = e.key.toLowerCase();
  const midi = KEYBOARD_MAP.get(ch);
  if (!midi) return;
  const keyEl = getKeyElByMidi(midi);
  if (keyEl) deactivateKeyEl(keyEl);
});

// --- Lessons ---
const LESSONS = {
  twinkle: {
    name: 'きらきら星',
    notes: [
      'C4','C4','G4','G4','A4','A4','G4',
      'F4','F4','E4','E4','D4','D4','C4',
    ].map(name => ({ midi: keyByName(name).midi, name })),
    tempo: 90,
  },
  mary: {
    name: 'メリーさんのひつじ',
    notes: [
      'E4','D4','C4','D4','E4','E4','E4',
      'D4','D4','D4',
      'E4','G4','G4',
      'E4','D4','C4','D4','E4','E4','E4','E4',
      'D4','D4','E4','D4','C4',
    ].map(name => ({ midi: keyByName(name).midi, name })),
    tempo: 100,
  },
  ode: {
    name: 'よろこびのうた（Ode to Joy）',
    notes: [
      'E4','E4','F4','G4','G4','F4','E4','D4','C4','C4','D4','E4','E4','D4','D4',
      'E4','E4','F4','G4','G4','F4','E4','D4','C4','C4','D4','E4','D4','C4','C4',
    ].map(name => ({ midi: keyByName(name).midi, name })),
    tempo: 120,
  },
  london: {
    name: 'ロンドン橋',
    notes: [
      'G4','A4','G4','F4','E4','F4','G4',
      'D4','E4','F4','E4','F4','G4',
      'G4','A4','G4','F4','E4','F4','G4',
      'D4','G4','E4','C4',
    ].map(name => ({ midi: keyByName(name).midi, name })),
    tempo: 110,
  },
  hotcross: {
    name: 'ホット・クロス・バンズ',
    notes: [
      'E4','D4','C4', 'E4','D4','C4',
      'C4','C4','C4','C4',
      'D4','D4','D4','D4',
      'E4','D4','C4',
    ].map(name => ({ midi: keyByName(name).midi, name })),
    tempo: 90,
  },
};

function keyByName(name) {
  return NOTES.find(n => n.name === name);
}

let practiceMode = false;
let currentLessonKey = 'twinkle';
let lessonIndex = 0;
let score = 0;
let playingDemo = false;

const $ = (sel) => document.querySelector(sel);
const els = {
  piano: $('#piano'),
  nextNote: $('#nextNote'),
  score: $('#score'),
  status: $('#status'),
  btnDemo: $('#btnDemo'),
  btnPractice: $('#btnPractice'),
  lessonSelect: $('#lessonSelect'),
};

function setStatus(text, color) {
  els.status.textContent = text || '';
  els.status.style.color = color || 'var(--muted)';
}

function refreshUI() {
  const lesson = LESSONS[currentLessonKey];
  const next = lesson.notes[lessonIndex];
  els.nextNote.textContent = next ? next.name : '完了!';
  els.score.textContent = String(score);
  document.querySelectorAll('.key').forEach(k => k.classList.remove('expected'));
  if (practiceMode && next) {
    const keyEl = getKeyElByMidi(next.midi);
    if (keyEl) keyEl.classList.add('expected');
  }
}

function resetLesson() {
  lessonIndex = 0;
  score = 0;
  playingDemo = false;
  refreshUI();
  setStatus(practiceMode ? '練習モード' : 'デモ待機');
}

async function playDemo() {
  if (playingDemo) return;
  const lesson = LESSONS[currentLessonKey];
  if (!lesson) return;
  playingDemo = true;
  setStatus('デモ再生中…', 'var(--accent)');
  const quarter = 60 / lesson.tempo;
  for (let i = 0; i < lesson.notes.length; i++) {
    const n = lesson.notes[i];
    const keyEl = getKeyElByMidi(n.midi);
    if (keyEl) keyEl.classList.add('active');
    attackRelease(n.midi, quarter * 0.9);
    await sleep(quarter);
    if (keyEl) keyEl.classList.remove('active');
    if (!playingDemo) break;
  }
  playingDemo = false;
  setStatus('デモ終了');
}

function sleep(msOrSec) {
  const ms = msOrSec < 10 ? msOrSec * 1000 : msOrSec;
  return new Promise(r => setTimeout(r, ms));
}

function onUserPlayed(midi) {
  if (!practiceMode) return;
  const lesson = LESSONS[currentLessonKey];
  const expected = lesson.notes[lessonIndex];
  if (!expected) return;
  const keyEl = getKeyElByMidi(midi);
  if (midi === expected.midi) {
    score += 1;
    keyEl && flashClass(keyEl, 'correct');
    lessonIndex += 1;
    if (lessonIndex >= lesson.notes.length) {
      setStatus('クリア! おめでとう 🎉', 'var(--ok)');
    } else {
      setStatus('正解! 次へ →', 'var(--ok)');
    }
  } else {
    keyEl && flashClass(keyEl, 'wrong');
    setStatus('ちがう音…', 'var(--error)');
  }
  refreshUI();
}

function flashClass(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // reflow
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 250);
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// --- Wire up ---
window.addEventListener('DOMContentLoaded', () => {
  buildPiano(els.piano);
  resetLesson();

  // Populate lesson selector
  function populateLessons() {
    els.lessonSelect.innerHTML = '';
    for (const [key, lesson] of Object.entries(LESSONS)) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = lesson.name;
      if (key === currentLessonKey) opt.selected = true;
      els.lessonSelect.appendChild(opt);
    }
  }
  populateLessons();

  // Rebuild key positions on resize (responsive widths)
  const rebuild = debounce(() => {
    buildPiano(els.piano);
    refreshUI();
  }, 120);
  window.addEventListener('resize', rebuild);

  els.btnDemo.addEventListener('click', () => {
    if (practiceMode) return; // ignore in practice
    playDemo();
  });

  els.btnPractice.addEventListener('click', () => {
    practiceMode = !practiceMode;
    els.btnPractice.textContent = practiceMode ? '練習モード: ON' : '練習モード';
    resetLesson();
  });

  els.lessonSelect.addEventListener('change', (e) => {
    currentLessonKey = e.target.value;
    resetLesson();
  });
});

