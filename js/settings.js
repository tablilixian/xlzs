function loadSettings() {
  return Storage.get('settings', DEFAULT_SETTINGS);
}

function stepperVal(id, delta) {
  const input = document.getElementById(id);
  let val = parseInt(input.value) || 0;
  val = Math.max(parseInt(input.min), Math.min(parseInt(input.max), val + delta));
  input.value = val;
  input.dispatchEvent(new Event('change'));
}

function saveSettings() {
  const s = loadSettings();
  s.bpm = [
    parseInt(document.getElementById('setBpm1').value) || 30,
    parseInt(document.getElementById('setBpm2').value) || 80,
    parseInt(document.getElementById('setBpm3').value) || 25
  ];
  s.duration = [
    parseInt(document.getElementById('setDur1').value) || 5,
    parseInt(document.getElementById('setDur2').value) || 3,
    parseInt(document.getElementById('setDur3').value) || 4
  ];
  s.sprintSec = parseInt(document.getElementById('setSprint').value) || 10;
  s.restSec = parseInt(document.getElementById('setRest').value) || 20;
  s.textPush = document.getElementById('setTextPush').value || DEFAULT_SETTINGS.textPush;
  s.textPull = document.getElementById('setTextPull').value || DEFAULT_SETTINGS.textPull;
  s.textPause = document.getElementById('setTextPause').value || DEFAULT_SETTINGS.textPause;
  s.textKegel = document.getElementById('setTextKegel').value || DEFAULT_SETTINGS.textKegel;
  s.soundEnabled = document.getElementById('toggleSound').classList.contains('on');
  s.vibDefault = document.getElementById('toggleVibDefault').classList.contains('on');

  VOICE_PROMPTS.forEach(p => {
    const toggleEl = document.getElementById('vp_toggle_' + p.key);
    if (toggleEl) s.voiceOn[p.key] = toggleEl.classList.contains('on');
    const textEl = document.getElementById('vp_text_' + p.key);
    if (textEl) s.voiceText[p.key] = textEl.value;
  });

  Storage.set('settings', s);
  showToast('设置已保存');
}

function applyLevelPreset(level) {
  const preset = DIFFICULTY_PRESETS[level];
  if (!preset) return;
  const s = loadSettings();
  s.level = level;
  s.bpm = [preset.phase1.bpm, preset.phase2.bpm, preset.phase3.bpm];
  s.duration = [preset.phase1.duration, preset.phase2.duration, preset.phase3.duration];
  s.sprintSec = preset.phase2.sprintSec;
  s.restSec = preset.phase2.restSec;
  Storage.set('settings', s);
  populateSettings();
  showToast('已切换至' + preset.name + '模式');
}

function selectLevel(level) {
  document.querySelectorAll('.level-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.level === level);
  });
  applyLevelPreset(level);
}

function populateSettings() {
  const s = loadSettings();
  document.getElementById('setBpm1').value = s.bpm[0];
  document.getElementById('setBpm2').value = s.bpm[1];
  document.getElementById('setBpm3').value = s.bpm[2];
  document.getElementById('setDur1').value = s.duration[0];
  document.getElementById('setDur2').value = s.duration[1];
  document.getElementById('setDur3').value = s.duration[2];
  document.getElementById('setSprint').value = s.sprintSec;
  document.getElementById('setRest').value = s.restSec;
  document.getElementById('setTextPush').value = s.textPush;
  document.getElementById('setTextPull').value = s.textPull;
  document.getElementById('setTextPause').value = s.textPause;
  document.getElementById('setTextKegel').value = s.textKegel;
  document.getElementById('toggleSound').classList.toggle('on', s.soundEnabled);
  document.getElementById('toggleVibDefault').classList.toggle('on', s.vibDefault);

  document.querySelectorAll('.level-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.level === s.level);
  });

  renderVoicePrompts();
}

function toggleSettingSwitch(el) {
  el.classList.toggle('on');
  saveSettings();
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderVoicePrompts() {
  const container = document.getElementById('voicePromptsContainer');
  if (!container) return;
  const s = loadSettings();
  container.innerHTML = '';
  VOICE_PROMPTS.forEach(p => {
    const isOn = s.voiceOn && s.voiceOn[p.key] !== false;
    const overrideText = s.voiceText && s.voiceText[p.key] ? s.voiceText[p.key] : '';
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
      <input type="text" id="vp_text_${p.key}" value="${escapeHtml(overrideText)}" placeholder="默认: ${p.defaultText}" onchange="saveSettings()">
      <div style="font-size:0.7rem;color:var(--muted);margin-top:0.25rem;padding-left:0.25rem">留空使用默认值</div>
    `;
    container.appendChild(div);
  });
}

function loadCustomPlans() {
  const s = loadSettings();
  if (!s.customPlans) return;
  s.customPlans.forEach(p => {
    TRAINING_PLANS[p.id] = p;
  });
}
