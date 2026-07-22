let wakeLock = null;
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch {}
}
function releaseWakeLock() {
  if (wakeLock) { wakeLock.release(); wakeLock = null; }
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && trainingState.isRunning && !trainingState.isPaused) {
    requestWakeLock();
  }
});

const trainingState = {
  isRunning: false,
  isPaused: false,
  currentPhase: 0,
  phaseElapsed: 0,
  phaseTotal: 0,
  metronomeTimer: null,
  countdownTimer: null,
  bpm: 40,
  vibrationEnabled: false,
  beatCount: 0,
  isSprinting: false,
  intervalElapsed: 0,
  failureCount: 0,
  _emergencyPhase: 0,
  _planData: null,
  _planModules: null,
  _sprintSec: 15,
  _restSec: 15,
  _silentPhaseStart: false,
};

function getPlanLevelData(planId, level) {
  const plan = TRAINING_PLANS[planId];
  if (!plan) return null;
  return plan.levels[level] || plan.levels.intermediate || plan.levels.beginner;
}

function getPlanTotalDuration(planId, level) {
  const data = getPlanLevelData(planId, level);
  if (!data) return 0;
  let total = 0;
  Object.keys(data).forEach(k => {
    if (data[k].duration) total += data[k].duration;
  });
  return total;
}

function getPlanPhaseStates(phaseNum) {
  const p = (typeof currentPlan !== 'undefined' && currentPlan) || 'full';
  if (phaseNum === 1) {
    if (p === 'breathReset' || p === 'meditation') {
      return [
        null,
        { text: '吸气', sub: '腹部鼓起，缓慢吸气', color: 'var(--accent)' },
        { text: '屏息', sub: '保持气息，放松身体', color: '#4A9EFF' },
        { text: '屏息', sub: '继续屏息，感受充盈', color: '#4A9EFF' },
        { text: '呼气', sub: '腹部收回，深长呼气', color: 'var(--success)' },
        { text: '呼出', sub: '继续呼气，放松身心', color: 'var(--success)' },
        { text: '空息', sub: '保持空息，感受平静', color: '#4A9EFF' },
      ];
    }
    if (p === 'sleepRelax' || p === 'morningBoost') {
      return [
        null,
        { text: '匀速推入',   sub: '轻柔地推入，感受节奏', color: 'var(--accent)' },
        { text: '深入',   sub: '保持平稳，配合呼吸', color: 'var(--accent)' },
        { text: '停',     sub: '放松，感受身体反应', color: '#4A9EFF' },
        { text: '匀速抽出',   sub: '缓慢退出，深长呼气', color: 'var(--success)' },
        { text: '退出',   sub: '放松盆底，完全呼出', color: 'var(--success)' },
        { text: '入口停', sub: '保持不动，深呼吸',   color: '#4A9EFF' },
      ];
    }
    return [
      null,
      { text: '匀速推入',   sub: '缓慢到底，吸气配合', color: 'var(--accent)' },
      { text: '深入',   sub: '继续深入，保持节奏', color: 'var(--accent)' },
      { text: '停',     sub: '保持不动，深呼吸',   color: '#4A9EFF' },
      { text: '匀速抽出',   sub: '缓慢退至入口，呼气', color: 'var(--success)' },
      { text: '退出',   sub: '继续退出，放松身体', color: 'var(--success)' },
      { text: '入口停', sub: '保持不动，深呼吸',   color: '#4A9EFF' },
    ];
  }
  if (phaseNum === 2) {
    return {
      sprint: { text: '冲', sub: '加速运动，全力以赴', color: 'var(--accent2)' },
      rest:   { text: '休息一下', sub: '降低强度，恢复呼吸', color: 'var(--success)' },
    };
  }
  if (phaseNum === 3) {
    if (p === 'pcMuscle' || p === 'kegelPro') {
      return [
        { text: '吸气',     sub: '放松PC肌，深吸气', color: 'var(--success)' },
        { text: '插入并收紧', sub: '收紧PC肌，缓慢推入', color: 'var(--accent)' },
        { text: '保持',     sub: '持续收紧，感受控制', color: '#4A9EFF' },
        { text: '抽出并放松', sub: '放松PC肌，缓慢抽出', color: 'var(--success)' },
      ];
    }
    return [
      { text: '插入并收紧', sub: '收紧PC肌，缓慢推入', color: 'var(--accent)' },
      { text: '保持',     sub: '持续收紧，感受控制', color: '#4A9EFF' },
      { text: '抽出并放松', sub: '放松PC肌，缓慢抽出', color: 'var(--success)' },
    ];
  }
  return [];
}

function toggleTraining() {
  if (!trainingState.isRunning) {
    startTraining();
  } else if (trainingState.isPaused) {
    resumeTraining();
  } else {
    pauseTraining();
  }
}

function startTraining() {
  const planData = getPlanLevelData(currentPlan, currentPlanLevel);
  if (!planData) { showToast('计划数据错误'); return; }
  const s = loadSettings();
  trainingState.vibrationEnabled = s.vibDefault;
  voiceCoachEnabled = s.voiceCoachEnabled !== false;
  currentVoiceDensity = s.voiceDensity || 'cycle';
  trainingState._planData = planData;
  trainingState._planModules = [0].concat(TRAINING_PLANS[currentPlan].modules);
  trainingState._startTime = null;

  showTrainingActive();

  document.getElementById('emergencyBtn').style.display = 'none';
  document.getElementById('extraControls').style.display = 'none';
  document.getElementById('trainingActiveControls').style.display = 'none';
  document.getElementById('voiceBtnText').textContent = voiceCoachEnabled ? '关闭语音' : '语音教练';
  document.getElementById('vibBtnText').textContent = trainingState.vibrationEnabled ? '关闭震动' : '震动模式';
  document.getElementById('intervalIndicator').style.display = 'none';

  requestWakeLock();
  ensureAudioCtx();

  trainingState.currentPhase = 0;
  updatePhaseBar(0);
  showArousalPrep();
}

function pauseTraining() {
  trainingState.isPaused = true;
  clearInterval(trainingState.metronomeTimer);
  clearInterval(trainingState.countdownTimer);
  stopPhase1Osc();
  updateStartButton();
  speak('训练暂停', 'pause');
  document.getElementById('trainingStatus').textContent = '已暂停';
}

function resumeTraining() {
  trainingState.isPaused = false;
  startMetronome();
  startCountdown();
  updateStartButton();
  document.getElementById('trainingStatus').textContent = getPhaseName(trainingState.currentPhase);
}

function stopTraining(completed) {
  trainingState.isRunning = false;
  trainingState.isPaused = false;
  trainingState.currentPhase = 0;
  trainingState.failureCount = 0;
  clearInterval(trainingState.metronomeTimer);
  clearInterval(trainingState.countdownTimer);
  stopPhase1Osc();
  vibrateOff();
  stopSpeaking();
  releaseWakeLock();

  document.getElementById('emergencyBtn').style.display = 'none';
  document.getElementById('extraControls').style.display = 'none';
  document.getElementById('trainingActiveControls').style.display = 'none';
  document.getElementById('intervalIndicator').style.display = 'none';
  document.getElementById('miniBeatDots').style.display = 'none';
  document.getElementById('instructionText').style.color = 'var(--accent)';

  showTrainingSetup();

  const prog = document.getElementById('overallProgress');
  if (prog) prog.style.display = 'none';

  if (completed) {
    const elapsedMs = trainingState._startTime ? Date.now() - trainingState._startTime : 0;
    const totalDuration = Math.max(1, Math.round(elapsedMs / 60000));
    Storage.addRecord(currentPlan, currentPlanLevel, trainingState.currentPhase, totalDuration);
    
    const mode = WEEK_MODES[getWeekModeIndex(new Date())];
    if (mode && mode.isRewardDay) {
      Storage.addRewardDayRecord();
      showToast('🎉 奖励日训练完成！今天可以尽情释放');
    } else {
      showToast('训练完成！今日已打卡');
    }
    
    if (shouldSpeak('phase')) speak('恭喜你完成训练', 'complete');
  } else {
    showToast('训练已结束');
  }

  initTraining();
  refreshDashboard();
}

function startPhase(phase) {
  const prevPhase = trainingState.currentPhase;
  trainingState.currentPhase = phase;
  trainingState.phaseElapsed = 0;
  trainingState.beatCount = 0;

  clearInterval(trainingState.metronomeTimer);
  clearInterval(trainingState.countdownTimer);
  stopPhase1Osc();

  if (phase === 0) {
    showArousalPrep();
    updatePhaseBar(prevPhase);
    document.getElementById('trainingStatus').textContent = '唤醒准备';
    return;
  }

  const planData = trainingState._planData;
  if (!planData) return;
  const phaseKey = 'phase' + phase;
  const phaseConfig = planData[phaseKey];
  if (!phaseConfig) { showToast('阶段配置错误'); return; }

  trainingState.phaseTotal = phaseConfig.duration * 60;
  trainingState.bpm = phaseConfig.bpm;
  if (!trainingState._startTime) trainingState._startTime = Date.now();

  if (prevPhase > 0 && prevPhase !== phase) {
    if (!trainingState._silentPhaseStart) {
      playPhaseChange();
      if (shouldSpeak('phase')) speak('进入' + getPhaseName(phase), 'phaseChange', phase);
    }
  } else {
    if (!trainingState._silentPhaseStart && shouldSpeak('phase')) speak(getPhaseName(phase) + '开始', 'start');
  }

  if (phaseConfig.sprintSec !== undefined) {
    trainingState.isSprinting = true;
    trainingState.intervalElapsed = 0;
    trainingState._sprintSec = phaseConfig.sprintSec || 15;
    trainingState._restSec = phaseConfig.restSec || 15;
  } else {
    trainingState.isSprinting = false;
  }

  document.getElementById('preArousalBlock').style.display = 'none';
  document.getElementById('trainingActiveControls').style.display = 'block';
  document.getElementById('extraControls').style.display = 'flex';
  document.getElementById('emergencyBtn').style.display = '';

  if (phase !== 2) {
    document.getElementById('intervalIndicator').style.display = 'none';
  }

  updatePhaseBar(prevPhase);
  updateTrainingUI();
  startMetronome();
  startCountdown();
  updateOverallProgress();

  document.getElementById('trainingStatus').textContent = getPhaseName(phase) + '阶段';
  document.getElementById('ringSub').textContent = getPhaseName(phase);

  const prog = document.getElementById('overallProgress');
  if (prog) prog.style.display = 'flex';
}

function shouldSpeak(trigger) {
  if (!voiceCoachEnabled) return false;
  const d = currentVoiceDensity;
  if (d === 'beat') return true;
  if (d === 'cycle') return trigger === 'cycle' || trigger === 'phase';
  if (d === 'minimal') return trigger === 'phase';
  return true;
}

function startMetronome() {
  clearInterval(trainingState.metronomeTimer);
  const interval = 60000 / trainingState.bpm;

  if (trainingState.currentPhase === 1) {
    const useHum = (currentSoundMode === 'hum' || currentSoundMode === 'mixed');
    trainingState.metronomeTimer = setInterval(() => {
      if (trainingState.isPaused) return;
      trainingState.beatCount++;
      const mod = trainingState.beatCount % 6;
      const state = getPlanPhaseStates(1)[mod === 0 ? 6 : mod];

      if (useHum) {
        if (mod === 1) {
          stopPhase1Osc();
          const ctx = ensureAudioCtx();
          phase1Osc = ctx.createOscillator();
          phase1Gain = ctx.createGain();
          phase1Osc.type = 'sine';
          phase1Osc.frequency.value = 180;
          phase1Gain.gain.setValueAtTime(0.01, ctx.currentTime);
          phase1Gain.gain.linearRampToValueAtTime(0.20, ctx.currentTime + 3.0);
          phase1Osc.connect(phase1Gain);
          phase1Gain.connect(ctx.destination);
          phase1Osc.start();
          if (trainingState.vibrationEnabled) vibrate(40);
        } else if (mod === 2) {
          if (trainingState.vibrationEnabled) vibrate(15);
        } else if (mod === 3) {
          stopPhase1Osc();
          playStopDing(700);
          if (trainingState.vibrationEnabled) vibrate(40);
        } else if (mod === 4) {
          stopPhase1Osc();
          const ctx = ensureAudioCtx();
          phase1Osc = ctx.createOscillator();
          phase1Gain = ctx.createGain();
          phase1Osc.type = 'sine';
          phase1Osc.frequency.value = 120;
          phase1Gain.gain.setValueAtTime(0.20, ctx.currentTime);
          phase1Gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 3.0);
          phase1Osc.connect(phase1Gain);
          phase1Gain.connect(ctx.destination);
          phase1Osc.start();
          if (trainingState.vibrationEnabled) vibrate(40);
        } else if (mod === 5) {
          if (trainingState.vibrationEnabled) vibrate(15);
        } else if (mod === 0) {
          stopPhase1Osc();
          playStopDing(500);
          if (trainingState.vibrationEnabled) vibrate(40);
        }
      } else {
        stopPhase1Osc();
        if (mod === 1) { playTick(600, 0.08); if (trainingState.vibrationEnabled) vibrate(40); }
        else if (mod === 2) { playTick(400, 0.05); if (trainingState.vibrationEnabled) vibrate(15); }
        else if (mod === 3) { playStopDing(700); if (trainingState.vibrationEnabled) vibrate(40); }
        else if (mod === 4) { playTick(500, 0.08); if (trainingState.vibrationEnabled) vibrate(40); }
        else if (mod === 5) { playTick(350, 0.05); if (trainingState.vibrationEnabled) vibrate(15); }
        else if (mod === 0) { playStopDing(500); if (trainingState.vibrationEnabled) vibrate(40); }
      }

      const instText = document.getElementById('instructionText');
      instText.textContent = state.text;
      instText.style.color = state.color;
      document.getElementById('instructionSub').textContent = state.sub;

      updateMiniBeatRing(mod === 0 ? 6 : mod);

      const spokenMods = [1, 3, 4, 0];
      if (spokenMods.includes(mod)) {
        if (shouldSpeak('beat')) {
          speak(state.text, 'phase1Beat');
        } else if (mod === 1 && shouldSpeak('cycle')) {
          speak(state.text, 'phase1Beat');
        }
      }
    }, interval);

  } else if (trainingState.currentPhase === 2) {
    const sprintDur = trainingState._sprintSec || 15;
    const restDur = trainingState._restSec || 15;
    const cycleDur = sprintDur + restDur;
    let subTickAcc = 0;
    const subInterval = 250;
    let sprintSpeakCount = 0;
    let restSpoken = false;

    trainingState.metronomeTimer = setInterval(() => {
      if (trainingState.isPaused) return;
      subTickAcc += subInterval;
      const posInCycle = trainingState.phaseElapsed % cycleDur;
      const isSprintNow = posInCycle < sprintDur;

      if (isSprintNow) {
        if (posInCycle === 0) sprintSpeakCount = 0;
        const useHum = (currentSoundMode === 'hum');
        if (useHum) {
          stopPhase1Osc();
          const ctx = ensureAudioCtx();
          phase1Osc = ctx.createOscillator();
          phase1Gain = ctx.createGain();
          phase1Osc.type = 'sine';
          phase1Osc.frequency.value = 180;
          phase1Gain.gain.setValueAtTime(0.06, ctx.currentTime);
          phase1Osc.connect(phase1Gain);
          phase1Gain.connect(ctx.destination);
          phase1Osc.start();
          if (trainingState.vibrationEnabled && subTickAcc >= 500) {
            vibrate(20);
            subTickAcc = 0;
          }
        } else {
          playTick(1000, 0.03);
          if (trainingState.vibrationEnabled && subTickAcc >= 500) {
            vibrate(20);
            subTickAcc = 0;
          }
        }
        const state = getPlanPhaseStates(2).sprint;
        document.getElementById('instructionText').textContent = state.text;
        document.getElementById('instructionText').style.color = state.color;
        document.getElementById('instructionSub').textContent = state.sub;
        updateIntervalIndicator(true, sprintDur - posInCycle);

        restSpoken = false;
        if (sprintSpeakCount < 3 && posInCycle === Math.floor(sprintSpeakCount * sprintDur / 3)) {
          sprintSpeakCount++;
          if (shouldSpeak('beat')) speak('冲', 'phase2Beat');
          else if (shouldSpeak('cycle')) speak('冲', 'phase2Beat');
        }
      } else {
        const restPos = posInCycle - sprintDur;
        const useHum = (currentSoundMode === 'hum');
        if (!useHum) {
          if (restPos % 3 === 0 && subTickAcc >= 990) {
            playTick(300, 0.1);
            subTickAcc = 0;
          }
        } else {
          stopPhase1Osc();
        }
        const state = getPlanPhaseStates(2).rest;
        document.getElementById('instructionText').textContent = state.text;
        document.getElementById('instructionText').style.color = state.color;
        document.getElementById('instructionSub').textContent = state.sub;
        updateIntervalIndicator(false, restDur - (posInCycle - sprintDur));

        if (restPos === 0 && !restSpoken) {
          restSpoken = true;
          if (shouldSpeak('beat')) speak('休息一下', 'phase2Beat');
          else if (shouldSpeak('cycle')) speak('休息一下', 'phase2Beat');
        }
      }
    }, subInterval);

  } else if (trainingState.currentPhase === 3) {
    const useHum = (currentSoundMode === 'hum');
    const phaseStates = getPlanPhaseStates(3);
    if (!phaseStates.length) { showToast('阶段配置错误'); stopTraining(false); return; }
    trainingState.metronomeTimer = setInterval(() => {
      if (trainingState.isPaused) return;
      trainingState.beatCount++;
      const idx = (trainingState.beatCount - 1) % phaseStates.length;
      const state = phaseStates[idx];

      if (useHum) {
        stopPhase1Osc();
        if (idx === 0) {
          const ctx = ensureAudioCtx();
          phase1Osc = ctx.createOscillator();
          phase1Gain = ctx.createGain();
          phase1Osc.type = 'sine';
          phase1Osc.frequency.value = 180;
          phase1Gain.gain.setValueAtTime(0.08, ctx.currentTime);
          phase1Gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.0);
          phase1Osc.connect(phase1Gain);
          phase1Gain.connect(ctx.destination);
          phase1Osc.start();
        } else if (idx === 1) {
          playStopDing(600);
        } else {
          const ctx = ensureAudioCtx();
          phase1Osc = ctx.createOscillator();
          phase1Gain = ctx.createGain();
          phase1Osc.type = 'sine';
          phase1Osc.frequency.value = 120;
          phase1Gain.gain.setValueAtTime(0.08, ctx.currentTime);
          phase1Gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.0);
          phase1Osc.connect(phase1Gain);
          phase1Gain.connect(ctx.destination);
          phase1Osc.start();
        }
      } else {
        playTick(idx === 0 ? 1000 : 800, 0.05);
      }
      if (trainingState.vibrationEnabled) vibrate(30);

      document.getElementById('instructionText').textContent = state.text;
      document.getElementById('instructionText').style.color = state.color;
      document.getElementById('instructionSub').textContent = state.sub;

      updateMiniBeatRing(idx + 1);

      if (shouldSpeak('beat')) {
        speak(state.text, 'phase3Beat');
      } else if (idx === 0 && shouldSpeak('cycle')) {
        speak(state.text, 'phase3Beat');
      }
    }, interval);
  }
}

function updateOverallProgress() {
  const mods = trainingState._planModules;
  if (!mods || mods.length <= 1) return;
  let totalSec = 0;
  let elapsedSec = 0;
  mods.forEach((m, i) => {
    if (i === 0) return;
    const planData = trainingState._planData;
    const phaseConfig = planData ? planData['phase' + m] : null;
    const dur = phaseConfig ? phaseConfig.duration * 60 : 0;
    totalSec += dur;
    if (m < trainingState.currentPhase) elapsedSec += dur;
  });
  if (trainingState.currentPhase > 0) {
    elapsedSec += trainingState.phaseElapsed;
  }
  const pct = totalSec > 0 ? Math.min(100, Math.round((elapsedSec / totalSec) * 100)) : 0;
  const fill = document.getElementById('overallProgressFill');
  const label = document.getElementById('overallProgressLabel');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = pct + '%';
}

function startCountdown() {
  clearInterval(trainingState.countdownTimer);
  trainingState.countdownTimer = setInterval(() => {
    if (trainingState.isPaused) return;
    trainingState.phaseElapsed++;
    updateRingProgress();
    updateOverallProgress();
    if (trainingState.phaseElapsed >= trainingState.phaseTotal) {
      const mods = trainingState._planModules;
      const curIdx = mods.indexOf(trainingState.currentPhase);
      if (curIdx >= 0 && curIdx < mods.length - 1) {
        startPhase(mods[curIdx + 1]);
      } else {
        stopTraining(true);
      }
    }
  }, 1000);
}

function updateIntervalIndicator(isSprint, remaining) {
  const el = document.getElementById('intervalIndicator');
  el.style.display = 'flex';
  if (isSprint) {
    el.className = 'interval-indicator interval-sprint';
    el.textContent = '冲刺中 ' + Math.round(remaining) + 's';
  } else {
    el.className = 'interval-indicator interval-rest';
    el.textContent = '休息中 ' + Math.round(remaining) + 's';
  }
}

// ==================== Emergency Stop ====================
function emergencyStop() {
  if (document.getElementById('cooldownOverlay').classList.contains('active')) return;

  clearInterval(trainingState.metronomeTimer);
  clearInterval(trainingState.countdownTimer);
  stopPhase1Osc();
  vibrateOff();
  stopSpeaking();
  trainingState.isPaused = true;
  trainingState.failureCount = (trainingState.failureCount || 0) + 1;
  trainingState._emergencyPhase = trainingState.currentPhase;
  trainingState._emergencyElapsed = trainingState.phaseElapsed;
  trainingState._emergencyBeatCount = trainingState.beatCount;

  Storage.addEmergencyStopRecord({
    date: new Date().toISOString(),
    plan: currentPlan,
    level: currentPlanLevel,
    phase: trainingState.currentPhase,
    count: trainingState.failureCount,
  });

  updateStartButton();

  if (trainingState.failureCount >= 3) {
    document.getElementById('failureModal').style.display = 'flex';
    return;
  }

  let cooldown = 10;
  const overlay = document.getElementById('cooldownOverlay');
  overlay.classList.add('active');
  document.getElementById('cooldownNumber').textContent = cooldown;
  document.getElementById('cooldownResumeOpt').style.display = 'flex';
  speak('紧急停止', 'emergency');

  const cooldownTimer = setInterval(() => {
    cooldown--;
    document.getElementById('cooldownNumber').textContent = cooldown;
    if (cooldown <= 0) {
      clearInterval(cooldownTimer);
      exitCooldown(trainingState._emergencyPhase);
    }
  }, 1000);
  overlay._timer = cooldownTimer;
}

function exitCooldown(resumeFromPhase) {
  const overlay = document.getElementById('cooldownOverlay');
  overlay.classList.remove('active');
  if (overlay._timer) clearInterval(overlay._timer);

  if (trainingState.isRunning) {
    trainingState.isPaused = false;
    const targetPhase = resumeFromPhase || trainingState._planModules[0] || 1;
    trainingState._silentPhaseStart = true;
    startPhase(targetPhase);
    trainingState._silentPhaseStart = false;
    if (targetPhase === trainingState._emergencyPhase && trainingState._emergencyElapsed > 0) {
      trainingState.phaseElapsed = trainingState._emergencyElapsed;
      trainingState.beatCount = trainingState._emergencyBeatCount || 0;
      updateRingProgress();
      updateOverallProgress();
      speak('继续，' + getPhaseName(targetPhase), 'restart');
    } else {
      speak('重开，' + getPhaseName(targetPhase), 'restart');
    }
  }
}

function cooldownResumeFromPhase() {
  exitCooldown(trainingState._emergencyPhase || 1);
}

function cooldownRestartFromBegin() {
  trainingState._emergencyElapsed = 0;
  const firstPhase = trainingState._planModules ? trainingState._planModules[1] || 1 : 1;
  exitCooldown(firstPhase);
}

// ==================== Exit Confirm Modal ====================
function showExitConfirm() {
  document.getElementById('exitConfirmModal').style.display = 'flex';
}
function closeExitConfirm(e) {
  if (e) return;
  document.getElementById('exitConfirmModal').style.display = 'none';
}
function confirmExitTraining() {
  document.getElementById('exitConfirmModal').style.display = 'none';
  stopTraining(false);
}

// ==================== Failure Reason Modal ====================
function closeFailureModal(e) {
  if (e) return;
  document.getElementById('failureModal').style.display = 'none';
}
function recordFailure(reason) {
  document.getElementById('failureModal').style.display = 'none';
  const reasonLabels = {
    soft: '软了',
    ejac: '射了',
    tired: '身体状态不好',
    other: '其他原因'
  };
  const elapsedMs = trainingState._startTime ? Date.now() - trainingState._startTime : 0;
  const totalDuration = Math.max(1, Math.round(elapsedMs / 60000));
  Storage.addRecord(currentPlan, currentPlanLevel, trainingState.currentPhase, totalDuration, 'failed');
  Storage.addFailureRecord({
    date: new Date().toISOString(),
    plan: currentPlan,
    level: currentPlanLevel,
    reason: reason,
    reasonLabel: reasonLabels[reason] || '其他',
    phase: trainingState.currentPhase,
    totalEmergencyStops: trainingState.failureCount,
  });
  stopTraining(false);
  showToast('训练已记为失败（' + (reasonLabels[reason] || '其他') + '）');
  refreshDashboard();
}
