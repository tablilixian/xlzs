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
        { text: '深吸气',   sub: '腹部鼓起，缓慢吸气', color: 'var(--accent)' },
        { text: '屏息',     sub: '保持气息，放松身体', color: '#4A9EFF' },
        { text: '屏息保持', sub: '继续屏息，感受充盈', color: '#4A9EFF' },
        { text: '缓慢呼气', sub: '腹部收回，深长呼气', color: 'var(--success)' },
        { text: '完全呼出', sub: '继续呼气，放松身心', color: 'var(--success)' },
        { text: '空息',     sub: '保持空息，感受平静', color: '#4A9EFF' },
      ];
    }
    if (p === 'sleepRelax' || p === 'morningBoost') {
      return [
        null,
        { text: '缓慢推入', sub: '轻柔地推入，感受节奏', color: 'var(--accent)' },
        { text: '继续深入', sub: '保持平稳，配合呼吸', color: 'var(--accent)' },
        { text: '深处停留', sub: '放松，感受身体反应', color: '#4A9EFF' },
        { text: '轻柔抽出', sub: '缓慢退出，深长呼气', color: 'var(--success)' },
        { text: '继续退出', sub: '放松盆底，完全呼出', color: 'var(--success)' },
        { text: '入口停留', sub: '保持不动，深呼吸',   color: '#4A9EFF' },
      ];
    }
    return [
      null,
      { text: '匀速推入',   sub: '缓慢到底，吸气配合', color: 'var(--accent)' },
      { text: '继续深入',   sub: '继续深入，保持节奏', color: 'var(--accent)' },
      { text: '深处停止',   sub: '保持不动，深呼吸',   color: '#4A9EFF' },
      { text: '匀速抽出',   sub: '缓慢退至入口，呼气', color: 'var(--success)' },
      { text: '继续退出',   sub: '继续退出，放松身体', color: 'var(--success)' },
      { text: '入口停止',   sub: '保持不动，深呼吸',   color: '#4A9EFF' },
    ];
  }
  if (phaseNum === 2) {
    return {
      sprint: { text: '全力冲刺', sub: '加速运动，全力以赴', color: 'var(--accent2)' },
      rest:   { text: '停止休息', sub: '降低强度，恢复呼吸', color: 'var(--success)' },
    };
  }
  if (phaseNum === 3) {
    if (p === 'pcMuscle' || p === 'kegelPro') {
      return [
        { text: '吸气放松',     sub: '放松PC肌，深吸气', color: 'var(--success)' },
        { text: '呼气收缩',     sub: '收紧PC肌，缓慢呼气', color: 'var(--accent)' },
        { text: '保持收缩',     sub: '持续收紧，感受控制', color: '#4A9EFF' },
      ];
    }
    if (p === 'breathReset' || p === 'meditation') {
      return [
        { text: '深吸气',       sub: '腹部鼓起，缓慢吸气', color: 'var(--accent)' },
        { text: '屏息保持',     sub: '保持气息，感受控制', color: '#4A9EFF' },
        { text: '深长呼气',     sub: '腹部收回，完全呼出', color: 'var(--success)' },
      ];
    }
    return [
      { text: '推入+凯格尔', sub: '收紧PC肌，缓慢推入', color: 'var(--accent)' },
      { text: '保持收缩',   sub: '持续收紧，感受控制', color: '#4A9EFF' },
      { text: '抽出+放松',  sub: '放松PC肌，缓慢抽出', color: 'var(--success)' },
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
  trainingState._planData = planData;
  trainingState._planModules = [0].concat(TRAINING_PLANS[currentPlan].modules);
  currentVoiceDensity = TRAINING_PLANS[currentPlan].defaultVoice || 'cycle';

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
  speak(getVoiceText('pause', '训练暂停'), 'pause');
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

  if (completed) {
    const totalDuration = trainingState._planModules.reduce((acc, phase) => {
      if (phase === 0) return acc;
      const phaseKey = 'phase' + phase;
      const phaseConfig = trainingState._planData && trainingState._planData[phaseKey];
      return acc + (phaseConfig ? phaseConfig.duration : 0);
    }, 0);
    Storage.addRecord(currentPlan, currentPlanLevel, trainingState.currentPhase, totalDuration);
    
    const mode = WEEK_MODES[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    if (mode && mode.isRewardDay) {
      Storage.addRewardDayRecord();
      showToast('🎉 奖励日训练完成！今天可以尽情释放');
    } else {
      showToast('训练完成！今日已打卡');
    }
    
    if (shouldSpeak('phase')) speak(getVoiceText('complete', '恭喜，训练完成'), 'complete');
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

  if (prevPhase > 0 && prevPhase !== phase) {
    playPhaseChange();
    if (shouldSpeak('phase')) speak(getVoiceText('phaseChange', '进入' + getPhaseName(phase) + '阶段'), 'phaseChange', phase);
  } else {
    if (shouldSpeak('phase')) speak(getVoiceText('start', '训练开始，' + getPhaseName(phase) + '阶段'), 'start');
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

  document.getElementById('trainingStatus').textContent = getPhaseName(phase) + '阶段';
  document.getElementById('ringSub').textContent = getPhaseName(phase);
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

      if (shouldSpeak('beat')) {
        speak(state.text, 'phase1Beat');
      } else if (mod === 1 && shouldSpeak('cycle')) {
        speak(state.text, 'phase1Beat');
      }
    }, interval);

  } else if (trainingState.currentPhase === 2) {
    const sprintDur = trainingState._sprintSec || 15;
    const restDur = trainingState._restSec || 15;
    const cycleDur = sprintDur + restDur;
    let subTickAcc = 0;
    const subInterval = 250;

    trainingState.metronomeTimer = setInterval(() => {
      if (trainingState.isPaused) return;
      subTickAcc += subInterval;
      const posInCycle = trainingState.phaseElapsed % cycleDur;
      const isSprintNow = posInCycle < sprintDur;

      if (isSprintNow) {
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
        
        if (shouldSpeak('beat') && posInCycle === 0) {
          speak(state.text, 'phase2Beat');
        }
      } else {
        const useHum = (currentSoundMode === 'hum');
        if (!useHum) {
          const restPos = posInCycle - sprintDur;
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
        
        if (shouldSpeak('beat') && restPos === 0) {
          speak(state.text, 'phase2Beat');
        }
      }
    }, subInterval);

  } else if (trainingState.currentPhase === 3) {
    const useHum = (currentSoundMode === 'hum');
    trainingState.metronomeTimer = setInterval(() => {
      if (trainingState.isPaused) return;
      trainingState.beatCount++;
      const idx = (trainingState.beatCount - 1) % getPlanPhaseStates(3).length;
      const state = getPlanPhaseStates(3)[idx];

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

function startCountdown() {
  clearInterval(trainingState.countdownTimer);
  trainingState.countdownTimer = setInterval(() => {
    if (trainingState.isPaused) return;
    trainingState.phaseElapsed++;
    updateRingProgress();
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
  speak(getVoiceText('emergency', '紧急刹车，开始冷却'), 'emergency');

  const cooldownTimer = setInterval(() => {
    cooldown--;
    document.getElementById('cooldownNumber').textContent = cooldown;
    if (cooldown <= 0) {
      clearInterval(cooldownTimer);
      exitCooldown();
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
    startPhase(targetPhase);
    if (targetPhase === trainingState._emergencyPhase && targetPhase > 1) {
      speak(getVoiceText('restart', '恢复训练，回到' + getPhaseName(targetPhase) + '阶段'), 'restart');
    } else {
      speak(getVoiceText('restart', '重新开始，回到' + getPhaseName(targetPhase) + '阶段'), 'restart');
    }
  }
}

function cooldownResumeFromPhase() {
  exitCooldown(trainingState._emergencyPhase || 1);
}

function cooldownRestartFromBegin() {
  const firstPhase = trainingState._planModules ? trainingState._planModules[0] : 1;
  exitCooldown(firstPhase);
}

// ==================== Exit Confirm Modal ====================
function showExitConfirm() {
  document.getElementById('exitConfirmModal').style.display = 'flex';
}
function closeExitConfirm(e) {
  if (e && e.target !== document.getElementById('exitConfirmModal')) return;
  document.getElementById('exitConfirmModal').style.display = 'none';
}
function confirmExitTraining() {
  document.getElementById('exitConfirmModal').style.display = 'none';
  stopTraining(false);
}

// ==================== Failure Reason Modal ====================
function closeFailureModal(e) {
  if (e && e.target !== document.getElementById('failureModal')) return;
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
