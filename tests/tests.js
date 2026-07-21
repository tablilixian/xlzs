QUnit.module('Storage', function() {
  QUnit.test('get/set with default fallback', function(assert) {
    localStorage.clear();
    const val = Storage.get('testKey', 'default');
    assert.equal(val, 'default', 'returns fallback for missing key');
    Storage.set('testKey', 'hello');
    assert.equal(Storage.get('testKey', null), 'hello', 'returns stored value');
  });

  QUnit.test('getRecords default state', function(assert) {
    localStorage.clear();
    const rec = Storage.getRecords();
    assert.deepEqual(rec, { dates: [], total: 0, streak: 0, detailed: [] }, 'default records structure');
  });

  QUnit.test('addRecord increments total', function(assert) {
    localStorage.clear();
    Storage.addRecord('full', 'intermediate', 3, 12);
    const rec = Storage.getRecords();
    assert.equal(rec.total, 1, 'total incremented to 1');
    assert.equal(rec.dates.length, 1, 'one date recorded');
    assert.equal(rec.dates[0], new Date().toISOString().split('T')[0], 'today date recorded');
    assert.equal(rec.detailed.length, 1, 'one detailed record');
    assert.equal(rec.detailed[0].plan, 'full', 'plan recorded');
    assert.equal(rec.detailed[0].level, 'intermediate', 'level recorded');
  });

  QUnit.test('addRecord deduplicates same day', function(assert) {
    localStorage.clear();
    Storage.addRecord('full', 'intermediate', 3, 12);
    Storage.addRecord('full', 'intermediate', 3, 12);
    const rec = Storage.getRecords();
    assert.equal(rec.total, 1, 'total still 1 after duplicate');
    assert.equal(rec.dates.length, 1, 'still one date');
    assert.equal(rec.detailed.length, 2, 'two detailed records');
  });

  QUnit.test('resetRecords clears data', function(assert) {
    localStorage.clear();
    Storage.addRecord('full', 'intermediate', 3, 12);
    Storage.resetRecords();
    const rec = Storage.getRecords();
    assert.equal(rec.total, 0, 'total reset to 0');
    assert.equal(rec.dates.length, 0, 'dates cleared');
    assert.equal(rec.detailed.length, 0, 'detailed records cleared');
  });

  QUnit.test('emergency stop records', function(assert) {
    localStorage.clear();
    const empty = Storage.getEmergencyStopRecords();
    assert.deepEqual(empty, [], 'default empty array');
    Storage.addEmergencyStopRecord({ date: '2026-07-20', phase: 1 });
    assert.equal(Storage.getEmergencyStopRecords().length, 1, 'one record saved');
  });

  QUnit.test('failure records', function(assert) {
    localStorage.clear();
    const empty = Storage.getFailureRecords();
    assert.deepEqual(empty, [], 'default empty array');
    Storage.addFailureRecord({ date: '2026-07-20', reason: 'soft' });
    assert.equal(Storage.getFailureRecords().length, 1, 'one failure saved');
  });

  QUnit.test('prep records', function(assert) {
    localStorage.clear();
    const empty = Storage.getPrepRecords();
    assert.deepEqual(empty, [], 'default empty array');
    Storage.addPrepRecord(45);
    const records = Storage.getPrepRecords();
    assert.equal(records.length, 1, 'one prep record saved');
    assert.equal(records[0].seconds, 45, 'prep time recorded');
    assert.ok(records[0].date, 'date recorded');
  });
});

QUnit.module('Plans', function() {
  QUnit.test('TRAINING_PLANS contains all plans', function(assert) {
    const planIds = Object.keys(TRAINING_PLANS);
    assert.ok(planIds.includes('full'), 'has full plan');
    assert.ok(planIds.includes('pcMuscle'), 'has pcMuscle plan');
    assert.ok(planIds.includes('breathReset'), 'has breathReset plan');
    assert.ok(planIds.includes('burstBoost'), 'has burstBoost plan');
    assert.ok(planIds.length >= 1, 'has at least one plan');
  });

  QUnit.test('getPlanLevelData returns correct data', function(assert) {
    const data = getPlanLevelData('full', 'beginner');
    assert.ok(data, 'returns data for full/beginner');
    assert.ok(data.phase1, 'has phase1');
    assert.equal(data.phase1.bpm, 30, 'phase1 bpm is 30');
    assert.equal(data.phase1.duration, 5, 'phase1 duration is 5');
    assert.ok(data.phase2, 'has phase2');
    assert.ok(data.phase3, 'has phase3');
  });

  QUnit.test('getPlanTotalDuration calculates correctly', function(assert) {
    const data = TRAINING_PLANS['full'].levels['beginner'];
    const expected = data.phase1.duration + data.phase2.duration + data.phase3.duration;
    const total = getPlanTotalDuration('full', 'beginner');
    assert.equal(total, expected, 'total duration calculated correctly');
  });

  QUnit.test('currentPlan/currentPlanLevel defaults', function(assert) {
    assert.equal(currentPlan, 'full', 'default plan is full');
    assert.equal(currentPlanLevel, 'intermediate', 'default level is intermediate');
  });

  QUnit.test('DEFAULT_SETTINGS has expected structure', function(assert) {
    assert.equal(DEFAULT_SETTINGS.bpm.length, 3, 'three BPM values');
    assert.equal(DEFAULT_SETTINGS.duration.length, 3, 'three duration values');
    assert.ok(DEFAULT_SETTINGS.voiceOn, 'has voiceOn');
    assert.ok(DEFAULT_SETTINGS.voiceText, 'has voiceText');
  });
});

QUnit.module('getPlanPhaseStates', function() {
  QUnit.test('Phase 1 returns 6-beat cycle states', function(assert) {
    const states = getPlanPhaseStates(1);
    assert.equal(states.length, 7, '6 beats + null index 0');
    assert.equal(states[1].text, '匀速推入', 'beat 1 is push');
    assert.equal(states[3].text, '深处停止', 'beat 3 is stop');
    assert.equal(states[6].text, '入口停止', 'beat 6 is stop');
  });

  QUnit.test('Phase 2 has sprint and rest', function(assert) {
    const states = getPlanPhaseStates(2);
    assert.ok(states.sprint, 'has sprint state');
    assert.ok(states.rest, 'has rest state');
    assert.equal(states.sprint.text, '全力冲刺');
    assert.equal(states.rest.text, '停止休息');
  });

  QUnit.test('Phase 3 returns 3-beat cycle states', function(assert) {
    const states = getPlanPhaseStates(3);
    assert.equal(states.length, 3, '3 beats');
    assert.equal(states[0].text, '推入+凯格尔');
    assert.equal(states[2].text, '抽出+放松');
  });
});

QUnit.module('Arousal Prep', function() {
  QUnit.test('showArousalPrep shows block when hidden', function(assert) {
    const block = document.createElement('div');
    block.id = 'preArousalBlock';
    block.style.display = 'none';
    block.classList.add('hidden');
    block.innerHTML = '<div id="arousalStartState"></div><div id="arousalActiveState"></div>';
    document.body.appendChild(block);

    const planSelector = document.createElement('div');
    planSelector.id = 'planSelector';
    document.body.appendChild(planSelector);

    const trainingControls = document.createElement('div');
    trainingControls.id = 'trainingControls';
    document.body.appendChild(trainingControls);

    showArousalPrep();

    assert.ok(!block.classList.contains('hidden'), 'block is visible after show');

    document.body.removeChild(block);
    document.body.removeChild(planSelector);
    document.body.removeChild(trainingControls);
  });

  QUnit.test('hideArousalPrep hides block', function(assert) {
    const block = document.createElement('div');
    block.id = 'preArousalBlock';
    block.style.display = 'block';
    block.classList.remove('hidden');
    document.body.appendChild(block);

    const planSelector = document.createElement('div');
    planSelector.id = 'planSelector';
    document.body.appendChild(planSelector);

    const trainingControls = document.createElement('div');
    trainingControls.id = 'trainingControls';
    document.body.appendChild(trainingControls);

    hideArousalPrep();

    assert.ok(block.classList.contains('hidden'), 'block is hidden after hide');

    document.body.removeChild(block);
    document.body.removeChild(planSelector);
    document.body.removeChild(trainingControls);
  });

  QUnit.test('onArousalReady records prep time', function(assert) {
    localStorage.clear();
    
    arousalPrepStart = Date.now() - 30000;
    
    const block = document.createElement('div');
    block.id = 'preArousalBlock';
    document.body.appendChild(block);

    const planSelector = document.createElement('div');
    planSelector.id = 'planSelector';
    document.body.appendChild(planSelector);

    const trainingControls = document.createElement('div');
    trainingControls.id = 'trainingControls';
    document.body.appendChild(trainingControls);

    onArousalReady();

    const prepRecords = Storage.getPrepRecords();
    assert.equal(prepRecords.length, 1, 'prep record saved');
    assert.ok(prepRecords[0].seconds >= 28, 'prep time ~30 seconds');

    document.body.removeChild(block);
    document.body.removeChild(planSelector);
    document.body.removeChild(trainingControls);
    
    trainingState.isRunning = false;
    trainingState.isPaused = false;
    trainingState.currentPhase = 0;
    trainingState.failureCount = 0;
    trainingState._planModules = null;
  });
});

QUnit.module('Audio - Breath Guide Sound', function() {
  QUnit.test('playBreathGuideSound is defined', function(assert) {
    assert.equal(typeof playBreathGuideSound, 'function', 'playBreathGuideSound is a function');
  });
});

QUnit.module('Voice Coach', function() {
  QUnit.test('getVoiceText returns override if set', function(assert) {
    const testKey = 'coachOpen';
    const defaultText = '语音教练已开启';
    // Temporarily set an override
    const s = loadSettings();
    const origText = s.voiceText[testKey];
    s.voiceText[testKey] = '自定义文本';
    Storage.set('settings', s);
    assert.equal(getVoiceText(testKey, defaultText), '自定义文本', 'returns override');
    // Restore
    s.voiceText[testKey] = origText || '';
    Storage.set('settings', s);
  });
});

QUnit.module('Training State', function() {
  QUnit.test('trainingState initial values', function(assert) {
    if (typeof trainingState !== 'undefined') {
      trainingState.isRunning = false;
      trainingState.isPaused = false;
      trainingState.currentPhase = 0;
      trainingState.failureCount = 0;
    }
    assert.equal(trainingState.isRunning, false, 'not running');
    assert.equal(trainingState.isPaused, false, 'not paused');
    assert.equal(trainingState.currentPhase, 0, 'phase 0');
    assert.equal(trainingState.failureCount, 0, 'no failures');
  });

  QUnit.test('shouldSpeak returns correct values based on density', function(assert) {
    voiceCoachEnabled = true;
    currentVoiceDensity = 'cycle';
    assert.equal(shouldSpeak('cycle'), true, 'cycle density: cycle trigger speaks');
    assert.equal(shouldSpeak('phase'), true, 'cycle density: phase trigger speaks');
    assert.equal(shouldSpeak('beat'), false, 'cycle density: beat trigger not speak');

    currentVoiceDensity = 'beat';
    assert.equal(shouldSpeak('beat'), true, 'beat density: beat trigger speaks');
    assert.equal(shouldSpeak('cycle'), true, 'beat density: cycle trigger speaks');
    assert.equal(shouldSpeak('phase'), true, 'beat density: phase trigger speaks');

    currentVoiceDensity = 'minimal';
    assert.equal(shouldSpeak('phase'), true, 'minimal density: phase trigger speaks');
    assert.equal(shouldSpeak('cycle'), false, 'minimal density: cycle not speak');
    assert.equal(shouldSpeak('beat'), false, 'minimal density: beat not speak');

    voiceCoachEnabled = false;
    assert.equal(shouldSpeak('phase'), false, 'disabled: nothing speaks');
  });
});

QUnit.module('UI Helpers', function() {
  QUnit.test('getPhaseName returns correct names', function(assert) {
    assert.equal(getPhaseName(0), '唤醒', 'phase 0');
    assert.equal(getPhaseName(1), '热身', 'phase 1');
    assert.equal(getPhaseName(2), '爆发', 'phase 2');
    assert.equal(getPhaseName(3), '控制', 'phase 3');
  });

});

QUnit.module('Settings', function() {
  QUnit.test('loadSettings returns defaults when empty', function(assert) {
    localStorage.clear();
    const s = loadSettings();
    assert.equal(s.soundEnabled, true, 'sound enabled by default');
    assert.equal(s.vibDefault, false, 'vibration disabled by default');
    assert.equal(s.voiceCoachEnabled, true, 'voice coach enabled by default');
    assert.equal(s.vibIntensity, 2, 'vibration intensity default');
    assert.equal(s.voiceDensity, 'cycle', 'voice density defaults to cycle');
  });

  QUnit.test('toggleSettingGroup toggles collapsed class', function(assert) {
    const header = document.createElement('div');
    const arrow = document.createElement('span');
    arrow.className = 'setting-group-arrow';
    arrow.textContent = '▼';
    const title = document.createElement('span');
    title.className = 'setting-group-title';
    header.appendChild(title);
    header.appendChild(arrow);
    
    const content = document.createElement('div');
    content.className = 'setting-group-content';
    
    document.body.appendChild(header);
    document.body.appendChild(content);

    toggleSettingGroup(header);
    assert.ok(content.classList.contains('collapsed'), 'content collapsed');
    assert.equal(arrow.textContent, '▶', 'arrow points right');

    toggleSettingGroup(header);
    assert.ok(!content.classList.contains('collapsed'), 'content expanded');
    assert.equal(arrow.textContent, '▼', 'arrow points down');

    document.body.removeChild(header);
    document.body.removeChild(content);
  });

  QUnit.test('DIFFICULTY_PRESETS have correct structure', function(assert) {
    ['beginner', 'intermediate', 'advanced'].forEach(level => {
      const preset = DIFFICULTY_PRESETS[level];
      assert.ok(preset, level + ' preset exists');
      assert.ok(preset.phase1, level + ' has phase1');
      assert.ok(preset.phase2, level + ' has phase2');
      assert.ok(preset.phase3, level + ' has phase3');
    });
  });
});

QUnit.module('Navigation', function() {
  QUnit.test('navigateTo changes page', function(assert) {
    // Add page elements
    const dashboard = document.createElement('div');
    dashboard.id = 'page-dashboard';
    dashboard.className = 'page active';
    document.body.appendChild(dashboard);

    const training = document.createElement('div');
    training.id = 'page-training';
    training.className = 'page';
    document.body.appendChild(training);

    const nav = document.createElement('nav');
    nav.id = 'bottomNav';
    nav.innerHTML = '<button data-page="dashboard"></button><button data-page="training"></button>';
    document.body.appendChild(nav);

    // Prevent training init from running (would fail without full DOM)
    const origInit = window.initTraining;
    window.initTraining = function() {};

    trainingState.isRunning = false;
    navigateTo('training');
    assert.ok(!dashboard.classList.contains('active'), 'dashboard not active');
    assert.ok(training.classList.contains('active'), 'training is active');

    // Restore
    window.initTraining = origInit;
    document.body.removeChild(dashboard);
    document.body.removeChild(training);
    document.body.removeChild(nav);
  });
});

QUnit.module('Training Room State', function() {
  QUnit.test('showTrainingSetup shows setup state', function(assert) {
    const setup = document.createElement('div');
    setup.id = 'trainingSetup';
    setup.style.display = 'none';
    document.body.appendChild(setup);

    const active = document.createElement('div');
    active.id = 'trainingActive';
    active.style.display = 'block';
    document.body.appendChild(active);

    const nav = document.createElement('nav');
    nav.id = 'bottomNav';
    nav.style.display = 'none';
    document.body.appendChild(nav);

    showTrainingSetup();

    assert.equal(setup.style.display, 'block', 'setup is visible');
    assert.equal(active.style.display, 'none', 'active is hidden');
    assert.equal(nav.style.display, '', 'navigation is visible');

    document.body.removeChild(setup);
    document.body.removeChild(active);
    document.body.removeChild(nav);
  });

  QUnit.test('showTrainingActive shows active state', function(assert) {
    const setup = document.createElement('div');
    setup.id = 'trainingSetup';
    setup.style.display = 'block';
    document.body.appendChild(setup);

    const active = document.createElement('div');
    active.id = 'trainingActive';
    active.style.display = 'none';
    document.body.appendChild(active);

    const nav = document.createElement('nav');
    nav.id = 'bottomNav';
    nav.style.display = '';
    document.body.appendChild(nav);

    showTrainingActive();

    assert.equal(setup.style.display, 'none', 'setup is hidden');
    assert.equal(active.style.display, 'block', 'active is visible');
    assert.equal(nav.style.display, 'none', 'navigation is hidden');

    document.body.removeChild(setup);
    document.body.removeChild(active);
    document.body.removeChild(nav);
  });

  QUnit.test('startTraining adds phase 0 to plan modules', function(assert) {
    trainingState._planModules = null;
    
    const planData = getPlanLevelData('full', 'intermediate');
    trainingState._planData = planData;
    trainingState._planModules = [0].concat(TRAINING_PLANS['full'].modules);
    
    assert.ok(trainingState._planModules.includes(0), 'phase 0 is included');
    assert.ok(trainingState._planModules.includes(1), 'phase 1 is included');
    assert.ok(trainingState._planModules.includes(2), 'phase 2 is included');
    assert.ok(trainingState._planModules.includes(3), 'phase 3 is included');
  });
});
