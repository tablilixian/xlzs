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
  s.textPush = document.getElementById('setTextPush').value || DEFAULT_SETTINGS.textPush;
  s.textPull = document.getElementById('setTextPull').value || DEFAULT_SETTINGS.textPull;
  s.textPause = document.getElementById('setTextPause').value || DEFAULT_SETTINGS.textPause;
  s.textKegel = document.getElementById('setTextKegel').value || DEFAULT_SETTINGS.textKegel;
  s.soundEnabled = document.getElementById('toggleSound').classList.contains('on');
  s.vibDefault = document.getElementById('toggleVibDefault').classList.contains('on');
  s.voiceCoachEnabled = document.getElementById('toggleVoiceCoach').classList.contains('on');
  s.voiceSpeed = parseFloat(document.getElementById('setVoiceSpeed').value) || 1.0;
  s.vibIntensity = parseInt(document.getElementById('setVibIntensity').value) || 2;

  VOICE_PROMPTS.forEach(p => {
    const toggleEl = document.getElementById('vp_toggle_' + p.key);
    if (toggleEl) s.voiceOn[p.key] = toggleEl.classList.contains('on');
    const textEl = document.getElementById('vp_text_' + p.key);
    if (textEl) s.voiceText[p.key] = textEl.value;
  });

  Storage.set('settings', s);
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
  const pushEl = document.getElementById('setTextPush');
  if (pushEl) pushEl.value = s.textPush || DEFAULT_SETTINGS.textPush;
  const pullEl = document.getElementById('setTextPull');
  if (pullEl) pullEl.value = s.textPull || DEFAULT_SETTINGS.textPull;
  const pauseEl = document.getElementById('setTextPause');
  if (pauseEl) pauseEl.value = s.textPause || DEFAULT_SETTINGS.textPause;
  const kegelEl = document.getElementById('setTextKegel');
  if (kegelEl) kegelEl.value = s.textKegel || DEFAULT_SETTINGS.textKegel;
  const soundEl = document.getElementById('toggleSound');
  if (soundEl) soundEl.classList.toggle('on', s.soundEnabled !== false);
  const vibDefaultEl = document.getElementById('toggleVibDefault');
  if (vibDefaultEl) vibDefaultEl.classList.toggle('on', s.vibDefault);
  const voiceCoachEl = document.getElementById('toggleVoiceCoach');
  if (voiceCoachEl) voiceCoachEl.classList.toggle('on', s.voiceCoachEnabled !== false);
  const voiceSpeedEl = document.getElementById('setVoiceSpeed');
  if (voiceSpeedEl) voiceSpeedEl.value = s.voiceSpeed !== undefined ? s.voiceSpeed : 1.0;
  const vibIntensityEl = document.getElementById('setVibIntensity');
  if (vibIntensityEl) vibIntensityEl.value = s.vibIntensity || 2;

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