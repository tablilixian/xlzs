let arousalPrepStart = null;
let arousalMetronomeTimer = null;
let arousalStoryTimer = null;

function showArousalPrep() {
  var block = document.getElementById('preArousalBlock');
  if (!block) return;
  if (block.style.display !== 'none' && !block.classList.contains('hidden')) return;

  block.classList.remove('hidden');
  block.style.display = '';

  document.getElementById('planSelector').style.display = 'none';
  document.getElementById('trainingControls').style.display = 'none';

  document.getElementById('arousalStartState').style.display = '';
  document.getElementById('arousalActiveState').style.display = 'none';

  stopArousalMetronome();

  arousalPrepStart = null;
}

function startArousalSession() {
  document.getElementById('arousalStartState').style.display = 'none';
  document.getElementById('arousalActiveState').style.display = '';

  arousalPrepStart = Date.now();

  startArousalMetronome();

  var stage = storyPlayerStage;
  if (stage === 'prep' || stage === 'all') {
    startStoryPlayer();
  }
}

function startArousalMetronome() {
  stopArousalMetronome();
  var bpm = 60;
  var interval = 60000 / bpm;
  var beat = document.getElementById('arousalBeat');
  if (!beat) return;
  document.getElementById('arousalBpmText').textContent = bpm + ' BPM';

  beat.classList.remove('pulse');
  arousalMetronomeTimer = setInterval(function() {
    beat.classList.add('pulse');
    if (trainingState.vibrationEnabled) vibrate(15);
    setTimeout(function() { beat.classList.remove('pulse'); }, interval * 0.3);
  }, interval);
}

function stopArousalMetronome() {
  if (arousalMetronomeTimer) {
    clearInterval(arousalMetronomeTimer);
    arousalMetronomeTimer = null;
  }
}

function hideArousalPrep() {
  var block = document.getElementById('preArousalBlock');
  if (!block) return;
  block.classList.add('hidden');
  block.style.display = 'none';

  document.getElementById('planSelector').style.display = '';
  document.getElementById('trainingControls').style.display = '';

  stopArousalMetronome();

  if (storyPlayerStage === 'prep') {
    stopStoryPlayer();
  }
}

function onArousalReady() {
  var elapsed = Math.round((Date.now() - (arousalPrepStart || Date.now())) / 1000);
  if (elapsed > 0) {
    Storage.addPrepRecord(elapsed);
  }
  hideArousalPrep();

  trainingState.isRunning = true;
  trainingState.isPaused = false;
  
  var firstTrainingPhase = trainingState._planModules && trainingState._planModules.length > 1 
    ? trainingState._planModules[1] 
    : 1;
  
  startPhase(firstTrainingPhase);
}

function onArousalSkip() {
  hideArousalPrep();

  trainingState.isRunning = true;
  trainingState.isPaused = false;
  
  var firstTrainingPhase = trainingState._planModules && trainingState._planModules.length > 1 
    ? trainingState._planModules[1] 
    : 1;
  
  startPhase(firstTrainingPhase);
}
