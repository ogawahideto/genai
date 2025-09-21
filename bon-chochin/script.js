// Utility: clamp
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Audio system
class AmbientSound {
  constructor() {
    this.audioCtx = null;
    this.gainNode = null;
    this.oscillators = [];
    this.noiseBuffer = null;
    this.isPlaying = false;
  }

  async init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.connect(this.audioCtx.destination);
      this.gainNode.gain.value = 0.3;
      
      // Create noise buffer for ambient sounds
      this.noiseBuffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 4, this.audioCtx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.1;
      }
    }
  }

  async start() {
    if (this.isPlaying) return;
    await this.init();
    
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    // Wind sound (low frequency oscillator)
    const windOsc = this.audioCtx.createOscillator();
    const windGain = this.audioCtx.createGain();
    const windLFO = this.audioCtx.createOscillator();
    const windLFOGain = this.audioCtx.createGain();
    
    windOsc.type = 'sawtooth';
    windOsc.frequency.value = 60;
    windLFO.frequency.value = 0.1;
    windLFOGain.gain.value = 20;
    windGain.gain.value = 0.05;
    
    windLFO.connect(windLFOGain);
    windLFOGain.connect(windOsc.frequency);
    windOsc.connect(windGain);
    windGain.connect(this.gainNode);
    
    // Subtle white noise for atmosphere
    const noiseSource = this.audioCtx.createBufferSource();
    const noiseGain = this.audioCtx.createGain();
    const noiseFilter = this.audioCtx.createBiquadFilter();
    
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 800;
    noiseGain.gain.value = 0.02;
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.gainNode);
    
    windOsc.start();
    windLFO.start();
    noiseSource.start();
    
    this.oscillators = [windOsc, windLFO, noiseSource];
    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;
    
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch(_) {}
    });
    this.oscillators = [];
    this.isPlaying = false;
  }

  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.value = clamp(volume, 0, 1);
    }
  }
}

const ambientSound = new AmbientSound();

// Timer system
class PrayerTimer {
  constructor() {
    this.intervalId = null;
    this.remainingSeconds = 0;
    this.isRunning = false;
  }

  start(minutes) {
    if (this.isRunning) return;
    
    this.remainingSeconds = minutes * 60;
    this.isRunning = true;
    this.updateDisplay();
    
    // Start ambient sound automatically
    if (!els.soundToggle.checked) {
      els.soundToggle.checked = true;
      ambientSound.start();
    }
    
    els.startTimerBtn.disabled = true;
    els.stopTimerBtn.disabled = false;
    
    this.intervalId = setInterval(() => {
      this.remainingSeconds--;
      this.updateDisplay();
      
      if (this.remainingSeconds <= 0) {
        this.complete();
      }
    }, 1000);
  }

  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    this.remainingSeconds = 0;
    
    els.startTimerBtn.disabled = false;
    els.stopTimerBtn.disabled = true;
    this.updateDisplay();
  }

  complete() {
    this.stop();
    
    // Gentle notification
    if (this.notificationSound) {
      this.notificationSound();
    }
    
    // Flash the display
    els.timerDisplay.style.animation = 'none';
    els.timerDisplay.offsetHeight; // Trigger reflow
    els.timerDisplay.style.animation = 'timerComplete 2s ease-in-out';
    
    setTimeout(() => {
      els.timerDisplay.style.animation = '';
    }, 2000);
  }

  updateDisplay() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    els.timerDisplay.textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  notificationSound() {
    // Create a gentle bell sound
    if (ambientSound.audioCtx) {
      const osc = ambientSound.audioCtx.createOscillator();
      const gain = ambientSound.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ambientSound.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ambientSound.audioCtx.currentTime + 1);
      
      gain.gain.setValueAtTime(0.3, ambientSound.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ambientSound.audioCtx.currentTime + 1);
      
      osc.connect(gain);
      gain.connect(ambientSound.audioCtx.destination);
      
      osc.start();
      osc.stop(ambientSound.audioCtx.currentTime + 1);
    }
  }
}

const prayerTimer = new PrayerTimer();

// Touch handling for mobile
class TouchHandler {
  constructor() {
    this.setupTouchEvents();
  }

  setupTouchEvents() {
    // Prevent zoom on double tap for better UX
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Add haptic feedback for button touches (iOS Safari)
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('touchstart', () => {
        if (navigator.vibrate) {
          navigator.vibrate(10); // Very light vibration
        }
      });
    });

    // Improve range slider touch handling
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
      let isDragging = false;
      
      input.addEventListener('touchstart', () => {
        isDragging = true;
      });
      
      input.addEventListener('touchmove', (e) => {
        if (isDragging) {
          e.preventDefault();
        }
      });
      
      input.addEventListener('touchend', () => {
        isDragging = false;
      });
    });
  }
}

new TouchHandler();

// Settings management
class Settings {
  static save() {
    const settings = {
      name: els.nameInput.value,
      vertical: els.verticalToggle.checked,
      paperColor: els.paperColor.value,
      flameIntensity: parseFloat(els.flameIntensity.value),
      flameAnimation: els.flameAnimationSelect.value,
      background: els.backgroundSelect.value,
      sound: els.soundToggle.checked,
      soundVolume: parseFloat(els.soundVolume.value),
      crestSize: parseInt(els.crestSize.value)
    };
    localStorage.setItem('bon-chochin-settings', JSON.stringify(settings));
  }

  static load() {
    try {
      const saved = localStorage.getItem('bon-chochin-settings');
      if (!saved) return false;
      
      const settings = JSON.parse(saved);
      
      els.nameInput.value = settings.name || '';
      els.verticalToggle.checked = settings.vertical !== false;
      els.paperColor.value = settings.paperColor || '#fff3d6';
      els.flameIntensity.value = settings.flameIntensity || 0.75;
      els.flameAnimationSelect.value = settings.flameAnimation || 'flame-animation';
      els.backgroundSelect.value = settings.background || 'night';
      els.soundToggle.checked = settings.sound || false;
      els.soundVolume.value = settings.soundVolume || 0.3;
      els.crestSize.value = settings.crestSize || 100;
      
      // Apply loaded settings
      applyText(settings.name || '');
      applyVertical(settings.vertical !== false);
      applyPaperColor(settings.paperColor || '#fff3d6');
      applyLightIntensity(settings.flameIntensity || 0.75);
      applyFlameAnimation(settings.flameAnimation || 'flame-animation');
      applyBackground(settings.background || 'night');
      applyCrestSize(settings.crestSize || 100);
      ambientSound.setVolume(settings.soundVolume || 0.3);
      
      if (settings.sound) {
        ambientSound.start();
      }
      
      return true;
    } catch (e) {
      console.warn('Failed to load settings:', e);
      return false;
    }
  }

  static clear() {
    localStorage.removeItem('bon-chochin-settings');
  }
}

// DOM refs
const els = {
  nameInput: document.getElementById('nameInput'),
  verticalToggle: document.getElementById('verticalToggle'),
  paperColor: document.getElementById('paperColor'),
  flameIntensity: document.getElementById('flameIntensity'),
  flameAnimationSelect: document.getElementById('flameAnimationSelect'),
  backgroundSelect: document.getElementById('backgroundSelect'),
  crestInput: document.getElementById('crestInput'),
  crestSize: document.getElementById('crestSize'),
  memorialText: document.getElementById('memorialText'),
  glowStop0: document.getElementById('glowStop0'),
  glowStop1: document.getElementById('glowStop1'),
  glowStop2: document.getElementById('glowStop2'),
  shadeTop: document.getElementById('shadeTop'),
  shadeMid: document.getElementById('shadeMid'),
  shadeBot: document.getElementById('shadeBot'),
  stage: document.getElementById('stage'),
  crest: document.getElementById('crest'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  resetBtn: document.getElementById('resetBtn'),
  soundToggle: document.getElementById('soundToggle'),
  soundVolume: document.getElementById('soundVolume'),
  timerMinutes: document.getElementById('timerMinutes'),
  startTimerBtn: document.getElementById('startTimerBtn'),
  stopTimerBtn: document.getElementById('stopTimerBtn'),
  timerDisplay: document.getElementById('timerDisplay')
};

// Color helpers
function hexToRgb(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function rgbToHex({ r, g, b }) {
  const toHex = v => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function mix(a, b, t) {
  return Math.round(a + (b - a) * t);
}
function shade(hex, t) {
  // t: -1..1 negative = darker, positive = lighter
  const { r, g, b } = hexToRgb(hex);
  const target = t >= 0 ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
  const f = Math.abs(clamp(t, -1, 1));
  return rgbToHex({ r: mix(r, target.r, f), g: mix(g, target.g, f), b: mix(b, target.b, f) });
}

// Apply paper color to gradient stops and subtle glow
function applyPaperColor(hex) {
  const top = shade(hex, 0.10);
  const mid = hex;
  const bot = shade(hex, -0.12);
  els.shadeTop.setAttribute('stop-color', top);
  els.shadeMid.setAttribute('stop-color', mid);
  els.shadeBot.setAttribute('stop-color', bot);

  // Glow tint slightly toward paper color
  const warm = shade(hex, 0.4);
  els.glowStop0.setAttribute('stop-color', warm);
  els.glowStop1.setAttribute('stop-color', warm);
  els.glowStop2.setAttribute('stop-color', warm);
}

function applyLightIntensity(v) {
  document.documentElement.style.setProperty('--light-intensity', String(clamp(v, 0, 1)));
}

function applyFlameAnimation(animationClass) {
  const flameEl = document.querySelector('.flame');
  if (flameEl) {
    flameEl.style.animationName = animationClass;
  }
}

function applyBackground(mode) {
  els.stage.classList.remove('bg-room', 'bg-night', 'bg-plain');
  if (mode === 'room') els.stage.classList.add('bg-room');
  else if (mode === 'plain') els.stage.classList.add('bg-plain');
  else els.stage.classList.add('bg-night');
}

function applyText(str) {
  els.memorialText.textContent = str || 'ご先祖さま';
}

function applyVertical(isVertical) {
  els.memorialText.classList.toggle('horizontal', !isVertical);
}

function handleCrestFile(file) {
  if (!file) { els.crest.src = ''; els.crest.style.display = 'none'; return; }
  const url = URL.createObjectURL(file);
  els.crest.src = url;
  els.crest.onload = () => URL.revokeObjectURL(url);
  els.crest.style.display = 'block';
}

function applyCrestSize(px) {
  const size = clamp(Number(px) || 100, 40, 180);
  els.crest.style.width = `${size}px`;
  els.crest.style.height = `${size}px`;
}

// Fullscreen helper
async function enterFullscreen(el) {
  try {
    if (el.requestFullscreen) await el.requestFullscreen();
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  } catch (_) { /* ignore */ }
}

// Event wiring
els.nameInput.addEventListener('input', e => { applyText(e.target.value); Settings.save(); });
els.verticalToggle.addEventListener('change', e => { applyVertical(e.target.checked); Settings.save(); });
els.paperColor.addEventListener('input', e => { applyPaperColor(e.target.value); Settings.save(); });
els.flameIntensity.addEventListener('input', e => { applyLightIntensity(parseFloat(e.target.value)); Settings.save(); });
els.flameAnimationSelect.addEventListener('change', e => { applyFlameAnimation(e.target.value); Settings.save(); });
els.backgroundSelect.addEventListener('change', e => { applyBackground(e.target.value); Settings.save(); });
els.crestInput.addEventListener('change', e => handleCrestFile(e.target.files?.[0]));
els.crestSize.addEventListener('input', e => { applyCrestSize(e.target.value); Settings.save(); });
els.soundToggle.addEventListener('change', async e => {
  if (e.target.checked) {
    await ambientSound.start();
  } else {
    ambientSound.stop();
  }
  Settings.save();
});
els.soundVolume.addEventListener('input', e => { ambientSound.setVolume(parseFloat(e.target.value)); Settings.save(); });
els.startTimerBtn.addEventListener('click', () => {
  const minutes = parseInt(els.timerMinutes.value) || 5;
  prayerTimer.start(minutes);
});
els.stopTimerBtn.addEventListener('click', () => prayerTimer.stop());
els.fullscreenBtn.addEventListener('click', () => enterFullscreen(els.stage));
els.resetBtn.addEventListener('click', () => {
  Settings.clear();
  
  els.nameInput.value = '';
  els.verticalToggle.checked = true;
  els.paperColor.value = '#fff3d6';
  els.flameIntensity.value = '0.75';
  els.backgroundSelect.value = 'night';
  els.crestInput.value = '';
  els.crestSize.value = '100';
  els.soundToggle.checked = false;
  els.soundVolume.value = '0.3';

  applyText('');
  applyVertical(true);
  applyPaperColor('#fff3d6');
  applyLightIntensity(0.75);
  els.flameAnimationSelect.value = 'flame-animation';
  applyFlameAnimation('flame-animation');
  applyBackground('night');
  handleCrestFile(null);
  applyCrestSize(100);
  ambientSound.stop();
  ambientSound.setVolume(0.3);
});

// Initial render - try to load saved settings first
if (!Settings.load()) {
  // If no saved settings, use defaults
  applyText('');
  applyVertical(true);
  applyPaperColor('#fff3d6');
  applyLightIntensity(0.75);
  applyFlameAnimation('flame-animation');
  applyBackground('night');
  applyCrestSize(100);
}

