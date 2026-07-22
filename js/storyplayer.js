var storyPlayerEnabled = false;
var storyPlayerVolume = 0.5;
var storyPlayerMode = 'shuffle';
var storyPlayerStage = 'all';
var storyPlayerDuckAmount = 0.7;
var storyPlayerAudio = null;
var storyPlayerCurrentIndex = -1;
var storyPlayerOrder = [];
var storyPlayerStarted = false;
var storyPlayerDucked = false;
var storyPlayerNormalVolume = 0.5;
var storyPlayerDuckCheckTimer = null;
var storyPlayerTitleEl = null;

var STORY_LIST = [
  { title: '撸管引导 · 唤醒', file: 'arousal_stories/story_v3_01.mp3' },
  { title: '办公室 · 权力羞辱', file: 'arousal_stories/story_v3_02.mp3' },
  { title: '清晨 · 身体唤醒', file: 'arousal_stories/story_v3_03.mp3' },
  { title: '浴室 · 湿度与触觉', file: 'arousal_stories/story_v3_04.mp3' },
  { title: '办公室 · 老师独白', file: 'arousal_stories/story_v4_01.mp3' },
  { title: '夜店 · 陌生人', file: 'arousal_stories/story_v4_02.mp3' },
  { title: '按摩室 · 你逃不掉', file: 'arousal_stories/story_v4_03.mp3' },
  { title: '更衣室 · 从零开始', file: 'arousal_stories/story_v4_04.mp3' },
  { title: '护士 · 你老婆在外面', file: 'arousal_stories/story_v5_01.mp3' },
  { title: '闺蜜 · 她让我照顾你', file: 'arousal_stories/story_v5_02.mp3' },
  { title: '女同学 · 那年', file: 'arousal_stories/story_v5_03.mp3' },
  { title: '明星 · 你配不上我', file: 'arousal_stories/story_v5_04.mp3' },
  { title: '魔镜号 · 忠诚考验', file: 'arousal_stories/story_v6_01.mp3' },
  { title: '交换派对', file: 'arousal_stories/story_v6_02.mp3' },
  { title: '温泉 · 嫁给了你', file: 'arousal_stories/story_v6_03.mp3' },
  { title: '蜜月 · 走错门', file: 'arousal_stories/story_v6_04.mp3' },
];

function initStoryPlayer() {
  var s = loadSettings();
  storyPlayerEnabled = s.storyPlayerEnabled !== false;
  storyPlayerVolume = s.storyPlayerVolume !== undefined ? s.storyPlayerVolume : 0.5;
  storyPlayerMode = s.storyPlayerMode || 'shuffle';
  storyPlayerStage = s.storyPlayerStage || 'all';
  storyPlayerDuckAmount = s.storyPlayerDuckAmount !== undefined ? s.storyPlayerDuckAmount : 0.7;
  storyPlayerNormalVolume = storyPlayerVolume;
  storyPlayerTitleEl = document.getElementById('storyPlayerTitle');
  buildStoryOrder();
}

function buildStoryOrder() {
  storyPlayerOrder = [];
  for (var i = 0; i < STORY_LIST.length; i++) {
    storyPlayerOrder.push(i);
  }
  if (storyPlayerMode === 'shuffle') {
    for (var i = storyPlayerOrder.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = storyPlayerOrder[i];
      storyPlayerOrder[i] = storyPlayerOrder[j];
      storyPlayerOrder[j] = tmp;
    }
  }
  storyPlayerCurrentIndex = -1;
}

function toggleStoryPlayer() {
  storyPlayerEnabled = !storyPlayerEnabled;
  var btn = document.getElementById('storyBtnText');
  if (btn) btn.textContent = storyPlayerEnabled ? '关闭故事' : '背景故事';
  if (storyPlayerEnabled) {
    if (storyPlayerStarted) {
      startStoryPlayer();
    }
    showToast('背景故事已开启');
  } else {
    stopStoryPlayer();
    showToast('背景故事已关闭');
  }
  var s = loadSettings();
  s.storyPlayerEnabled = storyPlayerEnabled;
  Storage.set('settings', s);
}

function startStoryPlayer() {
  if (!storyPlayerEnabled) return;
  if (storyPlayerStage === 'training') {
    var inArousal = document.getElementById('arousalActiveState') &&
      document.getElementById('arousalActiveState').style.display !== 'none' &&
      document.getElementById('arousalActiveState').style.display !== '';
    if (inArousal) return;
  }
  stopStoryPlayer();
  storyPlayerStarted = true;
  var ind = document.getElementById('storyPlayerIndicator');
  if (ind) ind.style.display = '';
  playNextStory();
  startDuckCheck();
}

function stopStoryPlayer() {
  storyPlayerStarted = false;
  if (storyPlayerAudio) {
    storyPlayerAudio.pause();
    storyPlayerAudio = null;
  }
  stopDuckCheck();
  if (storyPlayerTitleEl) storyPlayerTitleEl.textContent = '';
  var ind = document.getElementById('storyPlayerIndicator');
  if (ind) ind.style.display = 'none';
}

function pauseStoryPlayer() {
  if (storyPlayerAudio) {
    storyPlayerAudio.pause();
  }
}

function resumeStoryPlayer() {
  if (storyPlayerStarted && storyPlayerAudio) {
    storyPlayerAudio.play().catch(function() {});
  }
}

function playNextStory() {
  if (!storyPlayerStarted || !storyPlayerEnabled) return;
  storyPlayerCurrentIndex++;
  if (storyPlayerCurrentIndex >= storyPlayerOrder.length) {
    if (storyPlayerMode === 'shuffle') {
      buildStoryOrder();
      storyPlayerCurrentIndex = 0;
    } else {
      storyPlayerCurrentIndex = 0;
    }
  }
  var idx = storyPlayerOrder[storyPlayerCurrentIndex];
  var story = STORY_LIST[idx];
  if (!story) { stopStoryPlayer(); return; }
  var audio = new Audio('sounds/voices/' + story.file);
  audio.volume = storyPlayerVolume;
  audio.onended = function() {
    if (storyPlayerStarted) {
      setTimeout(playNextStory, 2000);
    }
  };
  audio.onerror = function() {
    if (storyPlayerStarted) {
      setTimeout(playNextStory, 3000);
    }
  };
  audio.play().catch(function() {
    if (storyPlayerStarted) {
      setTimeout(playNextStory, 3000);
    }
  });
  storyPlayerAudio = audio;
  if (storyPlayerTitleEl) {
    storyPlayerTitleEl.textContent = '📖 ' + story.title;
  }
}

function setStoryPlayerVolume(vol) {
  storyPlayerVolume = vol;
  storyPlayerNormalVolume = vol;
  if (storyPlayerAudio && !storyPlayerDucked) {
    storyPlayerAudio.volume = vol;
  }
}

function setStoryPlayerMode(mode) {
  storyPlayerMode = mode;
  buildStoryOrder();
  if (storyPlayerStarted) {
    storyPlayerCurrentIndex = -1;
    playNextStory();
  }
}

function setStoryPlayerStage(stage) {
  storyPlayerStage = stage;
}

function setStoryPlayerDuckAmount(amount) {
  storyPlayerDuckAmount = amount;
}

function startDuckCheck() {
  stopDuckCheck();
  storyPlayerDuckCheckTimer = setInterval(function() {
    var speaking = window.__speechPlaying === true;
    if (speaking && !storyPlayerDucked && storyPlayerAudio) {
      storyPlayerDucked = true;
      storyPlayerAudio.volume = storyPlayerVolume * (1 - storyPlayerDuckAmount);
    } else if (!speaking && storyPlayerDucked && storyPlayerAudio) {
      storyPlayerDucked = false;
      storyPlayerAudio.volume = storyPlayerVolume;
    }
  }, 100);
}

function stopDuckCheck() {
  if (storyPlayerDuckCheckTimer) {
    clearInterval(storyPlayerDuckCheckTimer);
    storyPlayerDuckCheckTimer = null;
  }
  storyPlayerDucked = false;
}
