let audioCtx = null;

function ensureAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
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
    osc.stop(ctx.currentTime + (duration || 0.05));
  } catch (e) {}
}

function playPhaseChange() {
  playTick(600, 0.1);
  setTimeout(() => playTick(900, 0.1), 120);
  setTimeout(() => playTick(1200, 0.15), 240);
}

// Short bell-like "ding" for stop beats
function playStopDing(freq) {
  try {
    const ctx = ensureAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch(e) {}
}

// ===== Pre-Arousal breathing guide sound =====
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

// ===== Phase 1 continuous oscillator =====
let phase1Osc = null;
let phase1Gain = null;

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
