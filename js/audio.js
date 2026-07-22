let audioCtx = null;
let phase1Osc = null;
let phase1Gain = null;
const audioCache = {};

function getOrCreateAudio(filePath) {
  if (!audioCache[filePath]) {
    audioCache[filePath] = new Audio(`sounds/${filePath}`);
    audioCache[filePath].volume = 0.3;
  } else {
    audioCache[filePath].currentTime = 0;
  }
  return audioCache[filePath];
}

function ensureAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSound(filePath) {
  const settings = loadSettings();
  if (!settings.soundEnabled) return;
  try {
    const audio = getOrCreateAudio(filePath);
    audio.play().catch(() => {});
  } catch (e) {}
}

function playTick(freq, duration) {
  const settings = loadSettings();
  if (!settings.soundEnabled) return;
  try {
    const ctx = ensureAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq || 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (duration || 0.05));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (duration || 0.05) + 0.01);
  } catch (e) {}
}

function playPhaseChange() {
  playSound('retro_beep_01.ogg');
  setTimeout(() => playSound('retro_beep_02.ogg'), 120);
  setTimeout(() => playSound('retro_beep_03.ogg'), 240);
}

function playStopDing(freq) {
  const settings = loadSettings();
  if (!settings.soundEnabled) return;
  try {
    const ctx = ensureAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq || 600;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

function playBreathGuideSound(phase) {
  const settings = loadSettings();
  if (!settings.soundEnabled) return;
  try {
    const ctx = ensureAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    if (phase === 'inhale') {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.35);
    } else if (phase === 'hold') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    } else if (phase === 'exhale') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.35);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch(e) {}
}

function stopPhase1Osc() {
  if (phase1Osc && phase1Gain) {
    try {
      const ctx = ensureAudioCtx();
      phase1Gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
      const osc = phase1Osc;
      setTimeout(() => { try { osc.stop(); } catch(e) {} }, 60);
    } catch(e) {}
  }
  phase1Osc = null;
  phase1Gain = null;
}