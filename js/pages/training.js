function initTraining() {
  trainingState.isRunning = false;
  trainingState.isPaused = false;
  trainingState.currentPhase = 0;
  trainingState.phaseElapsed = 0;
  trainingState.beatCount = 0;
  trainingState.failureCount = 0;
  loadCustomPlans();

  document.querySelectorAll('#levelSelector .config-btn[data-level]').forEach(b => {
    b.classList.toggle('active', b.dataset.level === currentPlanLevel);
  });
  renderPlanCards();
  syncPlanUI();
  updateTrainingUI();
  updatePlanDetailCard();
  showTrainingSetup();
}

// ===== Plan Selection =====
function selectPlan(planId) {
  if (trainingState.isRunning) return;
  currentPlan = planId;
  const plan = TRAINING_PLANS[planId];
  if (!plan) return;
  currentSoundMode = plan.defaultSound || 'mixed';
  currentVoiceDensity = plan.defaultVoice || 'cycle';
  renderPlanCards();
  syncPlanUI();
  updateTrainingUI();
  showToast('已选择：' + plan.name);
}

function selectPlanLevel(level) {
  if (trainingState.isRunning) return;
  currentPlanLevel = level;
  document.querySelectorAll('#levelSelector .config-btn[data-level]').forEach(b => {
    b.classList.toggle('active', b.dataset.level === level);
  });
  syncPlanUI();
  updateTrainingUI();
  const plan = TRAINING_PLANS[currentPlan];
  showToast('已切换至' + (level === 'beginner' ? '初级' : level === 'intermediate' ? '中级' : '高级') + '模式');
}

function selectPlanSound(mode) {
  if (trainingState.isRunning) return;
  currentSoundMode = mode;
  document.querySelectorAll('.config-btn[data-sound]').forEach(b => {
    b.classList.toggle('active', b.dataset.sound === mode);
  });
  showToast('声音已切换：' + (mode === 'hum' ? '嗡嗡声' : mode === 'tick' ? '节拍器' : '混合'));
}

function selectVoiceDensity(density) {
  if (trainingState.isRunning) return;
  currentVoiceDensity = density;
  document.querySelectorAll('.config-btn[data-density]').forEach(b => {
    b.classList.toggle('active', b.dataset.density === density);
  });
  showToast('语音密度：' + (density === 'beat' ? '逐拍引导' : density === 'cycle' ? '每周期引导' : '仅阶段切换'));
}

function selectLevelForTraining(level) {
  selectPlanLevel(level);
}

function renderPlanCards() {
  const container = document.getElementById('planCards');
  container.innerHTML = '';
  const planIds = Object.keys(TRAINING_PLANS);
  planIds.forEach(id => {
    const plan = TRAINING_PLANS[id];
    const total = getPlanTotalDuration(id, currentPlanLevel);
    const card = document.createElement('div');
    card.className = 'plan-card' + (id === currentPlan ? ' active' : '');
    card.dataset.plan = id;
    card.onclick = function() { selectPlan(id); };
    card.innerHTML = '<div class="pc-icon">' + plan.icon + '</div><div class="pc-name">' + plan.name + '</div><div class="pc-meta">' + total + 'min</div>';
    container.appendChild(card);
  });
  setTimeout(() => {
    const active = container.querySelector('.plan-card.active');
    if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, 100);
}

function syncPlanUI() {
  const plan = TRAINING_PLANS[currentPlan];
  if (!plan) return;
  document.querySelectorAll('#levelSelector .config-btn[data-level]').forEach(b => {
    b.classList.toggle('active', b.dataset.level === currentPlanLevel);
  });
  document.querySelectorAll('.config-btn[data-sound]').forEach(b => {
    b.classList.toggle('active', b.dataset.sound === currentSoundMode);
  });
  document.querySelectorAll('.config-btn[data-density]').forEach(b => {
    b.classList.toggle('active', b.dataset.density === currentVoiceDensity);
  });
  document.querySelectorAll('.phase-item').forEach(el => {
    const phase = parseInt(el.dataset.phase);
    el.style.display = phase === 0 || plan.modules.includes(phase) ? '' : 'none';
  });
  const badge = document.getElementById('dashLevelBadge');
  if (badge) {
    badge.textContent = plan.name + ' · ' + (currentPlanLevel === 'beginner' ? '初级' : currentPlanLevel === 'intermediate' ? '中级' : '高级');
  }
  updatePlanDetailCard();
}

function updatePlanDetailCard() {
  const plan = TRAINING_PLANS[currentPlan];
  if (!plan) return;
  
  const iconEl = document.getElementById('planDetailIcon');
  const nameEl = document.getElementById('planDetailName');
  const descEl = document.getElementById('planDetailDesc');
  const sceneEl = document.getElementById('planDetailScene');
  const phasesEl = document.getElementById('planDetailPhases');
  
  if (iconEl) iconEl.textContent = plan.icon;
  if (nameEl) nameEl.textContent = plan.name;
  if (descEl) descEl.textContent = plan.desc;
  if (sceneEl) sceneEl.textContent = '适用场景：' + plan.scene;
  
  if (phasesEl) {
    phasesEl.innerHTML = '';
    const phaseNames = { 1: '热身', 2: '爆发', 3: '控制' };
    plan.modules.forEach(p => {
      const tag = document.createElement('div');
      tag.className = 'plan-detail-phase-tag';
      tag.textContent = phaseNames[p] || '阶段' + p;
      phasesEl.appendChild(tag);
    });
  }
}

// ===== Custom Plan Panel =====
function openCustomPanel() {
  if (trainingState.isRunning) { showToast('训练进行中，请先结束训练'); return; }
  customPlanDraft = JSON.parse(JSON.stringify(getPlanLevelData(currentPlan, currentPlanLevel)));
  renderCustomPanel();
  document.getElementById('customPanel').style.display = 'flex';
}

function closeCustomPanel(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('customPanel').style.display = 'none';
  customPlanDraft = null;
}

function renderCustomPanel() {
  const body = document.getElementById('customPanelBody');
  const plan = TRAINING_PLANS[currentPlan];
  if (!plan || !customPlanDraft) return;
  let html = '<div class="custom-param-row"><span class="custom-param-label">计划名称</span></div>';
  html += '<input class="custom-panel-save-name" id="customPlanName" placeholder="例如：我的地铁训练" value="' + plan.name + '（自定义）">';
  html += '<div style="margin-top:0.75rem;font-size:0.85rem;font-weight:600;color:var(--muted)">包含模块：</div>';
  html += '<div class="phase-selector-row">';
  [1,2,3].forEach(p => {
    const active = customPlanDraft['phase' + p] ? ' active' : '';
    html += '<button class="phase-toggle-btn' + active + '" onclick="toggleCustomPhase(' + p + ')">' + (p === 1 ? '呼吸' : p === 2 ? '爆发' : 'PC肌') + '</button>';
  });
  html += '</div>';
  Object.keys(customPlanDraft).forEach(k => {
    const mod = customPlanDraft[k];
    if (!mod || !mod.bpm) return;
    const phaseName = k === 'phase1' ? '热身' : k === 'phase2' ? '爆发' : '控制';
    html += '<div style="margin-top:0.75rem;font-size:0.85rem;font-weight:700;color:var(--accent)">' + phaseName + '</div>';
    html += '<div class="custom-param-row"><span class="custom-param-label">BPM</span><input class="custom-param-input" type="number" id="cp_' + k + '_bpm" value="' + mod.bpm + '" min="15" max="200"></div>';
    html += '<div class="custom-param-row"><span class="custom-param-label">时长（分）</span><input class="custom-param-input" type="number" id="cp_' + k + '_dur" value="' + mod.duration + '" min="1" max="30"></div>';
    if (mod.sprintSec !== undefined) {
      html += '<div class="custom-param-row"><span class="custom-param-label">冲刺（秒）</span><input class="custom-param-input" type="number" id="cp_' + k + '_sprint" value="' + mod.sprintSec + '" min="5" max="60"></div>';
      html += '<div class="custom-param-row"><span class="custom-param-label">休息（秒）</span><input class="custom-param-input" type="number" id="cp_' + k + '_rest" value="' + mod.restSec + '" min="5" max="60"></div>';
    }
    if (mod.holdSec !== undefined) {
      html += '<div class="custom-param-row"><span class="custom-param-label">保持（秒）</span><input class="custom-param-input" type="number" id="cp_' + k + '_hold" value="' + mod.holdSec + '" min="1" max="15"></div>';
    }
  });
  body.innerHTML = html;
}

function toggleCustomPhase(phase) {
  const key = 'phase' + phase;
  if (customPlanDraft[key]) {
    delete customPlanDraft[key];
  } else {
    const defaults = { bpm: 30, duration: 3 };
    if (phase === 2) { defaults.bpm = 80; defaults['sprintSec'] = 15; defaults['restSec'] = 15; }
    if (phase === 3) { defaults.bpm = 25; defaults['holdSec'] = 3; }
    customPlanDraft[key] = defaults;
  }
  renderCustomPanel();
}

function saveCustomPlan() {
  const name = document.getElementById('customPlanName')?.value?.trim() || '自定义计划';
  if (!name) { showToast('请输入计划名称'); return; }
  Object.keys(customPlanDraft).forEach(k => {
    const mod = customPlanDraft[k];
    if (!mod) return;
    const bpmEl = document.getElementById('cp_' + k + '_bpm');
    const durEl = document.getElementById('cp_' + k + '_dur');
    if (bpmEl) mod.bpm = parseInt(bpmEl.value) || mod.bpm;
    if (durEl) mod.duration = parseInt(durEl.value) || mod.duration;
    const sprintEl = document.getElementById('cp_' + k + '_sprint');
    const restEl = document.getElementById('cp_' + k + '_rest');
    if (sprintEl) mod.sprintSec = parseInt(sprintEl.value) || mod.sprintSec;
    if (restEl) mod.restSec = parseInt(restEl.value) || mod.restSec;
    const holdEl = document.getElementById('cp_' + k + '_hold');
    if (holdEl) mod.holdSec = parseInt(holdEl.value) || mod.holdSec;
  });
  const s = loadSettings();
  if (!s.customPlans) s.customPlans = [];
  const modules = Object.keys(customPlanDraft).filter(k => customPlanDraft[k]).map(k => parseInt(k.replace('phase', '')));
  const newPlan = {
    id: 'custom_' + Date.now(),
    name: name,
    icon: '✏️',
    desc: '自定义计划',
    scene: '自定义',
    modules: modules,
    defaultSound: currentSoundMode,
    defaultVoice: currentVoiceDensity,
    levels: { custom: JSON.parse(JSON.stringify(customPlanDraft)) },
    isCustom: true
  };
  s.customPlans.push(newPlan);
  Storage.set('settings', s);
  TRAINING_PLANS[newPlan.id] = newPlan;
  currentPlan = newPlan.id;
  renderPlanCards();
  syncPlanUI();
  updateTrainingUI();
  closeCustomPanel();
  showToast('已保存自定义计划：' + name);
}
