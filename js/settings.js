function loadSettings() {
  return Storage.get('settings', DEFAULT_SETTINGS);
}

function stepperVal(id, delta) {
  const input = document.getElementById(id);
  if (!input) return;
  let val = parseInt(input.value) || 0;
  val = Math.max(parseInt(input.min), Math.min(parseInt(input.max), val + delta));
  input.value = val;
  input.dispatchEvent(new Event('change'));
}

function saveSettings() {
  const s = loadSettings();
  s.soundEnabled = document.getElementById('toggleSound').classList.contains('on');
  s.vibDefault = document.getElementById('toggleVibDefault').classList.contains('on');
  s.voiceCoachEnabled = document.getElementById('toggleVoiceCoach').classList.contains('on');
  s.voiceSpeed = parseFloat(document.getElementById('setVoiceSpeed').value) || 1.0;
  s.vibIntensity = parseInt(document.getElementById('setVibIntensity').value) || 2;
  s.voiceDensity = document.querySelector('.density-btn.active')?.dataset?.density || 'cycle';

  s.storyPlayerEnabled = document.getElementById('toggleStoryPlayer').classList.contains('on');
  s.storyPlayerVolume = parseFloat(document.getElementById('setStoryVolume').value) || 0.5;
  s.storyPlayerDuckAmount = parseFloat(document.getElementById('setStoryDuck').value) || 0.7;
  var modeBtn = document.querySelector('.story-mode-btn.active');
  s.storyPlayerMode = modeBtn ? modeBtn.dataset.mode : 'shuffle';
  var stageBtn = document.querySelector('.story-stage-btn.active');
  s.storyPlayerStage = stageBtn ? stageBtn.dataset.stage : 'all';

  VOICE_PROMPTS.forEach(p => {
    const toggleEl = document.getElementById('vp_toggle_' + p.key);
    if (toggleEl) s.voiceOn[p.key] = toggleEl.classList.contains('on');
  });

  Storage.set('settings', s);
  initStoryPlayer();
  showToast('设置已保存');
}

function toggleSettingGroup(header) {
  const content = header.nextElementSibling;
  const arrow = header.querySelector('.setting-group-arrow');
  if (content.classList.contains('collapsed')) {
    content.classList.remove('collapsed');
    arrow.textContent = '▼';
  } else {
    content.classList.add('collapsed');
    arrow.textContent = '▶';
  }
}

function resetSettings() {
  if (!confirm('确定要恢复所有设置为默认值吗？训练数据不会受到影响。')) return;
  Storage.set('settings', { ...DEFAULT_SETTINGS });
  populateSettings();
  showToast('设置已恢复默认值');
}

function populateSettings() {
  const s = loadSettings();
  document.getElementById('toggleSound').classList.toggle('on', s.soundEnabled !== false);
  document.getElementById('toggleVibDefault').classList.toggle('on', s.vibDefault);
  document.getElementById('toggleVoiceCoach').classList.toggle('on', s.voiceCoachEnabled !== false);
  document.getElementById('setVoiceSpeed').value = s.voiceSpeed !== undefined ? s.voiceSpeed : 1.0;
  document.getElementById('setVibIntensity').value = s.vibIntensity || 2;

  const density = s.voiceDensity || 'cycle';
  document.querySelectorAll('.density-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.density === density);
  });

  var storyToggle = document.getElementById('toggleStoryPlayer');
  if (storyToggle) storyToggle.classList.toggle('on', s.storyPlayerEnabled !== false);

  var volSlider = document.getElementById('setStoryVolume');
  if (volSlider) {
    volSlider.value = s.storyPlayerVolume !== undefined ? s.storyPlayerVolume : 0.5;
    var disp = document.getElementById('storyVolumeDisplay');
    if (disp) disp.textContent = Math.round(s.storyPlayerVolume * 100) + '%';
  }

  var duckSlider = document.getElementById('setStoryDuck');
  if (duckSlider) {
    duckSlider.value = s.storyPlayerDuckAmount !== undefined ? s.storyPlayerDuckAmount : 0.7;
    var ddisp = document.getElementById('storyDuckDisplay');
    if (ddisp) ddisp.textContent = Math.round(s.storyPlayerDuckAmount * 100) + '%';
  }

  var mode = s.storyPlayerMode || 'shuffle';
  document.querySelectorAll('.story-mode-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.mode === mode);
  });

  var stage = s.storyPlayerStage || 'all';
  document.querySelectorAll('.story-stage-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.stage === stage);
  });

  renderVoicePrompts();
}

function toggleSettingSwitch(el) {
  el.classList.toggle('on');
  saveSettings();
}

function selectVoiceDensity(density) {
  document.querySelectorAll('.density-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.density === density);
  });
  saveSettings();
}

function renderVoicePrompts() {
  const container = document.getElementById('voicePromptsContainer');
  if (!container) return;
  const s = loadSettings();
  container.innerHTML = '';
  VOICE_PROMPTS.forEach(p => {
    const isOn = s.voiceOn && s.voiceOn[p.key] !== false;
    const div = document.createElement('div');
    div.className = 'voice-prompt';
    div.innerHTML = `
      <div class="voice-prompt-header">
        <div>
          <span class="voice-prompt-name">${p.name}</span>
          <span class="voice-prompt-trigger">${p.trigger}</span>
        </div>
        <button class="voice-prompt-toggle ${isOn ? 'on' : ''}" id="vp_toggle_${p.key}" onclick="this.classList.toggle('on'); saveSettings();"></button>
      </div>
    `;
    container.appendChild(div);
  });
}

function selectStoryMode(mode) {
  document.querySelectorAll('.story-mode-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  setStoryPlayerMode(mode);
  saveSettings();
}

function selectStoryStage(stage) {
  document.querySelectorAll('.story-stage-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.stage === stage);
  });
  setStoryPlayerStage(stage);
  saveSettings();
}

function loadCustomPlans() {
  const s = loadSettings();
  if (!s.customPlans) return;
  s.customPlans.forEach(p => {
    TRAINING_PLANS[p.id] = p;
  });
}
