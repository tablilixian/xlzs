let arousalPrepStart = null;
let arousalStoryIndex = -1;
let arousalMetronomeTimer = null;
let arousalStoryTimer = null;

const AROUSAL_STORIES = [
  { title: '温柔爱抚', file: 'arousal_story_1.mp3' },
  { title: '隐秘欲望', file: 'arousal_story_2.mp3' },
  { title: '感官觉醒', file: 'arousal_story_3.mp3' },
  { title: '征服与臣服', file: 'arousal_story_4.mp3' },
  { title: '梦幻缠绵', file: 'arousal_story_5.mp3' },
];

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

  stopArousalMetronome();
  stopArousalVoice();

  arousalPrepStart = null;
}

function startArousalSession() {
  document.getElementById('arousalStartState').style.display = 'none';
  document.getElementById('arousalActiveState').style.display = '';

  arousalPrepStart = Date.now();

  startArousalMetronome();
  playNextArousalStory();
}

function startArousalMetronome() {
  stopArousalMetronome();
  const bpm = 60;
  const interval = 60000 / bpm;
  const beat = document.getElementById('arousalBeat');
  if (!beat) return;
  document.getElementById('arousalBpmText').textContent = bpm + ' BPM';

  beat.classList.remove('pulse');
  arousalMetronomeTimer = setInterval(() => {
    beat.classList.add('pulse');
    if (trainingState.vibrationEnabled) vibrate(15);
    setTimeout(() => beat.classList.remove('pulse'), interval * 0.3);
  }, interval);
}

function stopArousalMetronome() {
  if (arousalMetronomeTimer) {
    clearInterval(arousalMetronomeTimer);
    arousalMetronomeTimer = null;
  }
}

function playNextArousalStory() {
  if (!voiceCoachEnabled) return;
  stopArousalVoice();

  arousalStoryIndex = (arousalStoryIndex + 1) % AROUSAL_STORIES.length;
  const story = AROUSAL_STORIES[arousalStoryIndex];
  const titleEl = document.getElementById('arousalStoryTitle');
  if (titleEl) titleEl.textContent = '🔊 ' + story.title;

  playAudioFile(story.file).then(() => {
    if (document.getElementById('arousalActiveState').style.display === '') {
      arousalStoryTimer = setTimeout(playNextArousalStory, 3000);
    }
  });
}

function stopArousalVoice() {
  if (arousalStoryTimer) {
    clearTimeout(arousalStoryTimer);
    arousalStoryTimer = null;
  }
  stopSpeaking();
}

function hideArousalPrep() {
  const block = document.getElementById('preArousalBlock');
  if (!block) return;
  block.classList.add('hidden');
  block.style.display = 'none';

  document.getElementById('planSelector').style.display = '';
  document.getElementById('trainingControls').style.display = '';

  stopArousalMetronome();
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
