let arousalPrepStart = null;
let arousalBreathTimer = null;

function showArousalPrep() {
  const block = document.getElementById('preArousalBlock');
  if (!block) return;
  if (block.style.display !== 'none' && !block.classList.contains('hidden')) return;

  block.classList.remove('hidden');
  block.style.display = '';

  document.getElementById('planSelector').style.display = 'none';
  document.getElementById('trainingControls').style.display = 'none';

  document.getElementById('arousalStartState').style.display = '';
  document.getElementById('arousalActiveState').style.display = 'none';

  stopBreathingCycle();
  stopArousalVoice();

  arousalPrepStart = null;
}

function startArousalSession() {
  document.getElementById('arousalStartState').style.display = 'none';
  document.getElementById('arousalActiveState').style.display = '';

  document.getElementById('btnReady').disabled = true;
  document.getElementById('btnReady').style.opacity = '0.4';
  document.getElementById('btnReady').style.pointerEvents = 'none';

  arousalPrepStart = Date.now();

  startArousalVoice();
  startBreathingCycle();
}

function hideArousalPrep() {
  const block = document.getElementById('preArousalBlock');
  if (!block) return;
  block.classList.add('hidden');
  block.style.display = 'none';

  document.getElementById('planSelector').style.display = '';
  document.getElementById('trainingControls').style.display = '';

  stopBreathingCycle();
  stopArousalVoice();
}

function onArousalReady() {
  const elapsed = Math.round((Date.now() - (arousalPrepStart || Date.now())) / 1000);
  if (elapsed > 0) {
    Storage.addPrepRecord(elapsed);
  }
  hideArousalPrep();

  trainingState.isRunning = true;
  trainingState.isPaused = false;
  
  const firstTrainingPhase = trainingState._planModules && trainingState._planModules.length > 1 
    ? trainingState._planModules[1] 
    : 1;
  
  startPhase(firstTrainingPhase);
}

function onArousalSkip() {
  hideArousalPrep();

  trainingState.isRunning = true;
  trainingState.isPaused = false;
  
  const firstTrainingPhase = trainingState._planModules && trainingState._planModules.length > 1 
    ? trainingState._planModules[1] 
    : 1;
  
  startPhase(firstTrainingPhase);
}

let secondsInPhase = 0;
let phase = 'inhale';
let phaseDuration = 4;

function resetBreathingState() {
  secondsInPhase = 0;
  phase = 'inhale';
  phaseDuration = 4;
}

function startBreathingCycle() {
  const ring = document.getElementById('breathRing');
  const phaseText = document.getElementById('breathPhaseText');
  if (!ring || !phaseText) return;

  resetBreathingState();

  const tick = () => {
    secondsInPhase++;

    if (secondsInPhase === 1) playBreathGuideSound(phase);

    if (phase === 'inhale') {
      const progress = secondsInPhase / 4;
      const scale = 0.8 + (0.4 * progress);
      ring.style.transition = 'transform 0.9s ease-out';
      ring.style.transform = 'scale(' + scale + ')';
      ring.className = 'breath-ring phase-inhale';
      phaseText.textContent = '😮 吸气 ' + (4 - secondsInPhase + 1) + 's';
      phaseText.style.color = 'var(--accent)';

      if (secondsInPhase >= 4) {
        secondsInPhase = 0;
        phase = 'hold';
        phaseDuration = 7;
        ring.style.transform = 'scale(1.2)';
      }
    } else if (phase === 'hold') {
      ring.className = 'breath-ring phase-hold';
      phaseText.textContent = '🤫 屏息 ' + (7 - secondsInPhase + 1) + 's';
      phaseText.style.color = '#4A9EFF';

      if (secondsInPhase >= 7) {
        secondsInPhase = 0;
        phase = 'exhale';
        phaseDuration = 8;
      }
    } else if (phase === 'exhale') {
      const progress = secondsInPhase / 8;
      const scale = 1.2 - (0.4 * progress);
      ring.style.transition = 'transform 0.9s ease-out';
      ring.style.transform = 'scale(' + scale + ')';
      ring.className = 'breath-ring phase-exhale';
      phaseText.textContent = '😌 呼气 ' + (8 - secondsInPhase + 1) + 's';
      phaseText.style.color = 'var(--success)';

      if (secondsInPhase >= 8) {
        secondsInPhase = 0;
        phase = 'inhale';
        phaseDuration = 4;
      }
    }

    arousalBreathTimer = setTimeout(tick, 1000);
  };

  ring.style.transition = 'none';
  ring.style.transform = 'scale(0.8)';
  tick();

  setTimeout(() => {
    document.getElementById('btnReady').disabled = false;
    document.getElementById('btnReady').style.opacity = '';
    document.getElementById('btnReady').style.pointerEvents = '';
  }, 3000);
}

function stopBreathingCycle() {
  if (arousalBreathTimer) {
    clearTimeout(arousalBreathTimer);
    arousalBreathTimer = null;
  }
  const ring = document.getElementById('breathRing');
  const phaseText = document.getElementById('breathPhaseText');
  if (ring) {
    ring.style.transition = 'none';
    ring.style.transform = 'scale(0.8)';
    ring.className = 'breath-ring';
  }
  if (phaseText) {
    phaseText.textContent = '🧘 准备';
  }
  resetBreathingState();
}
