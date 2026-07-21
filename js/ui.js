function getPhaseName(n) {
  return ['', '热身', '爆发', '控制'][n] || '';
}

function updateMiniBeatRing(currentBeat) {
  const dotsEl = document.getElementById('miniBeatDots');
  dotsEl.style.display = 'flex';
  const isPhase1 = trainingState.currentPhase === 1;
  const totalBeats = isPhase1 ? 6 : 3;
  const dots = dotsEl.querySelectorAll('.mini-beat-dot');
  dots.forEach((dot, i) => {
    const beatNum = i + 1;
    dot.classList.remove('active-push', 'active-stop', 'active-pull', 'completed');
    dot.style.display = beatNum <= totalBeats ? '' : 'none';
    if (isPhase1) {
      if (beatNum === currentBeat) {
        if (beatNum <= 2) dot.classList.add('active-push');
        else if (beatNum === 3 || beatNum === 6) dot.classList.add('active-stop');
        else dot.classList.add('active-pull');
      } else if (beatNum < currentBeat) {
        dot.classList.add('completed');
      }
    } else {
      if (beatNum === currentBeat) {
        if (beatNum === 1) dot.classList.add('active-push');
        else if (beatNum === 2) dot.classList.add('active-stop');
        else dot.classList.add('active-pull');
      } else if (beatNum < currentBeat) {
        dot.classList.add('completed');
      }
    }
  });
}

function updatePhaseBar(prevPhase) {
  const mods = trainingState._planModules || [1, 2, 3];
  const planData = trainingState._planData;
  const phaseBpmIds = { 1: 'phase1bpm', 2: 'phase2bpm', 3: 'phase3bpm' };
  for (let i = 1; i <= 3; i++) {
    const el = document.querySelector('[data-phase="' + i + '"]');
    if (!el) continue;
    const inPlan = mods.includes(i);
    el.style.display = inPlan ? '' : 'none';
    if (!inPlan) continue;
    el.classList.remove('active', 'completed');
    if (mods.indexOf(i) < mods.indexOf(trainingState.currentPhase)) el.classList.add('completed');
    else if (i === trainingState.currentPhase) el.classList.add('active');
    if (planData && planData['phase' + i]) {
      document.getElementById(phaseBpmIds[i]).textContent = planData['phase' + i].bpm + ' BPM';
    }
  }
}

function updateRingProgress() {
  const remaining = trainingState.phaseTotal - trainingState.phaseElapsed;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  document.getElementById('ringTime').textContent = mins + ':' + String(secs).padStart(2, '0');
  const progress = trainingState.phaseElapsed / trainingState.phaseTotal;
  const circumference = 553;
  const offset = circumference * (1 - progress);
  document.getElementById('ringProgress').style.strokeDashoffset = offset;
}

function updateStartButton() {
  const btn = document.getElementById('btnStartTraining');
  const stopBtn = document.getElementById('btnStopTraining');
  const exitBtn = document.getElementById('btnExitTraining');
  if (!trainingState.isRunning) {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> 开始训练';
    btn.className = 'btn btn-primary btn-full btn-large';
    stopBtn.style.display = 'none';
    if (exitBtn) exitBtn.style.display = 'none';
  } else if (trainingState.isPaused) {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> 继续训练';
    btn.className = 'btn btn-primary btn-full btn-large';
    stopBtn.style.display = '';
    if (exitBtn) exitBtn.style.display = '';
  } else {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> 暂停训练';
    btn.className = 'btn btn-ghost btn-full btn-large';
    stopBtn.style.display = 'none';
    if (exitBtn) exitBtn.style.display = 'none';
  }
}

function updateTrainingUI() {
  updateStartButton();
  updateRingProgress();
  if (!trainingState.isRunning) {
    document.getElementById('trainingStatus').textContent = '准备开始';
    document.getElementById('instructionText').textContent = '按下开始，进入训练';
    document.getElementById('instructionText').style.color = 'var(--accent)';
    document.getElementById('instructionSub').textContent = '跟随节拍器，配合呼吸';
    document.getElementById('ringSub').textContent = '准备就绪';
    document.getElementById('ringProgress').style.strokeDashoffset = 0;
    document.getElementById('miniBeatDots').style.display = 'none';
    document.getElementById('planSelector').style.display = '';
    document.getElementById('levelSelector').style.display = '';
    for (let i = 1; i <= 3; i++) {
      const el = document.querySelector('[data-phase="' + i + '"]');
      if (el) el.classList.remove('active', 'completed');
    }
    const planData = getPlanLevelData(currentPlan, currentPlanLevel);
    const plan = TRAINING_PLANS[currentPlan];
    const mods = plan ? plan.modules : [1, 2, 3];
    for (let i = 1; i <= 3; i++) {
      const el = document.querySelector('[data-phase="' + i + '"]');
      if (el) {
        const inPlan = mods.includes(i);
        el.style.display = inPlan ? '' : 'none';
        if (inPlan && planData && planData['phase' + i]) {
          document.getElementById('phase' + i + 'bpm').textContent = planData['phase' + i].bpm + ' BPM';
        }
      }
    }
  }
}
