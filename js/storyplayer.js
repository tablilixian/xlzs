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
  // ── v3 基础唤醒 ──
  { title: '撸管引导 · 唤醒', file: 'arousal_stories/story_v3_01.mp3' },
  { title: '办公室 · 权力羞辱', file: 'arousal_stories/story_v3_02.mp3' },
  { title: '清晨 · 身体唤醒', file: 'arousal_stories/story_v3_03.mp3' },
  { title: '浴室 · 湿度与触觉', file: 'arousal_stories/story_v3_04.mp3' },
  // ── v4 角色扮演 ──
  { title: '办公室 · 老师独白', file: 'arousal_stories/story_v4_01.mp3' },
  { title: '夜店 · 陌生人', file: 'arousal_stories/story_v4_02.mp3' },
  { title: '按摩室 · 你逃不掉', file: 'arousal_stories/story_v4_03.mp3' },
  { title: '更衣室 · 从零开始', file: 'arousal_stories/story_v4_04.mp3' },
  // ── v5 禁忌身份 ──
  { title: '护士 · 你老婆在外面', file: 'arousal_stories/story_v5_01.mp3' },
  { title: '闺蜜 · 她让我照顾你', file: 'arousal_stories/story_v5_02.mp3' },
  { title: '女同学 · 那年', file: 'arousal_stories/story_v5_03.mp3' },
  { title: '明星 · 你配不上我', file: 'arousal_stories/story_v5_04.mp3' },
  // ── v6 综艺专题 ──
  { title: '魔镜号 · 忠诚考验', file: 'arousal_stories/story_v6_01.mp3' },
  { title: '交换派对', file: 'arousal_stories/story_v6_02.mp3' },
  { title: '温泉 · 嫁给了你', file: 'arousal_stories/story_v6_03.mp3' },
  { title: '蜜月 · 走错门', file: 'arousal_stories/story_v6_04.mp3' },
  // ── v7 极限禁忌 ──
  { title: '成人综艺 · 夫妻交换', file: 'arousal_stories/story_v7_01.mp3' },
  { title: '寸止调教室', file: 'arousal_stories/story_v7_02.mp3' },
  { title: '淫妻调教', file: 'arousal_stories/story_v7_03.mp3' },
  { title: '按摩侵犯', file: 'arousal_stories/story_v7_04.mp3' },
  // ── v8 九大性癖 ──
  { title: '远程遥控玩具', file: 'arousal_stories/story_v8_01.mp3' },
  { title: '贞操锁', file: 'arousal_stories/story_v8_02.mp3' },
  { title: '群交', file: 'arousal_stories/story_v8_03.mp3' },
  { title: '双插', file: 'arousal_stories/story_v8_04.mp3' },
  { title: '对比羞辱', file: 'arousal_stories/story_v8_05.mp3' },
  { title: '人前露出', file: 'arousal_stories/story_v8_06.mp3' },
  { title: 'VR幻觉', file: 'arousal_stories/story_v8_07.mp3' },
  { title: '产后人妻', file: 'arousal_stories/story_v8_08.mp3' },
  { title: '黑丝腿交', file: 'arousal_stories/story_v8_09.mp3' },
  // ── v9 场景系列上 ──
  { title: '试衣间', file: 'arousal_stories/story_v9_01.mp3' },
  { title: '冰火两重天', file: 'arousal_stories/story_v9_02.mp3' },
  { title: '姐妹花双收', file: 'arousal_stories/story_v9_03.mp3' },
  { title: '女同事团建灌酒', file: 'arousal_stories/story_v9_04.mp3' },
  // ── v10 场景系列下 ──
  { title: '图书馆', file: 'arousal_stories/story_v10_01.mp3' },
  { title: '老公举手机拍视频', file: 'arousal_stories/story_v10_02.mp3' },
  { title: '老婆怀孕期间', file: 'arousal_stories/story_v10_03.mp3' },
  { title: '婚后第一次和别人做', file: 'arousal_stories/story_v10_04.mp3' },
  // ── v11 绿帽系列上 ──
  { title: '兄弟的老婆', file: 'arousal_stories/story_v11_01.mp3' },
  { title: '上司的老婆', file: 'arousal_stories/story_v11_02.mp3' },
  { title: '邻居人妻', file: 'arousal_stories/story_v11_03.mp3' },
  { title: '班花 · 同学聚会', file: 'arousal_stories/story_v11_04.mp3' },
  { title: '健身房 · 人妻', file: 'arousal_stories/story_v11_05.mp3' },
  { title: '网约车', file: 'arousal_stories/story_v11_06.mp3' },
  // ── v12 绿帽系列中 ──
  { title: '伴娘 · 婚礼当天', file: 'arousal_stories/story_v12_01.mp3' },
  { title: '医院陪床', file: 'arousal_stories/story_v12_02.mp3' },
  { title: '快递员 · 上门', file: 'arousal_stories/story_v12_03.mp3' },
  { title: '警嫂', file: 'arousal_stories/story_v12_04.mp3' },
  { title: '中介 · 带你看房', file: 'arousal_stories/story_v12_05.mp3' },
  // ── v13 露出系列 ──
  { title: '电影院 · 最后一排', file: 'arousal_stories/story_v13_01.mp3' },
  { title: '泳池更衣室', file: 'arousal_stories/story_v13_02.mp3' },
  { title: '阳台 · 对面楼看着', file: 'arousal_stories/story_v13_03.mp3' },
  { title: '会议室 · 桌下', file: 'arousal_stories/story_v13_04.mp3' },
  { title: '高铁卫生间', file: 'arousal_stories/story_v13_05.mp3' },
  { title: '自驾游 · 服务区', file: 'arousal_stories/story_v13_06.mp3' },
  { title: '天台 · 楼下夜市', file: 'arousal_stories/story_v13_07.mp3' },
  // ── v14 女主动上 ──
  { title: '短发女闺蜜', file: 'arousal_stories/story_v14_01.mp3' },
  { title: '大学女同学', file: 'arousal_stories/story_v14_02.mp3' },
  { title: '女上司', file: 'arousal_stories/story_v14_03.mp3' },
  { title: '健身女教练', file: 'arousal_stories/story_v14_04.mp3' },
  { title: '女主播', file: 'arousal_stories/story_v14_05.mp3' },
  // ── v15 女主动中 ──
  { title: '初恋女友 · 结婚前夜', file: 'arousal_stories/story_v15_01.mp3' },
  { title: '女邻居 · 姐姐', file: 'arousal_stories/story_v15_02.mp3' },
  { title: '军人女友', file: 'arousal_stories/story_v15_03.mp3' },
  { title: '女医生', file: 'arousal_stories/story_v15_04.mp3' },
  { title: '酒吧一夜', file: 'arousal_stories/story_v15_05.mp3' },
  // ── v16 女主动下 ──
  { title: '瑜伽老师', file: 'arousal_stories/story_v16_01.mp3' },
  { title: '警察姐姐', file: 'arousal_stories/story_v16_02.mp3' },
  { title: '富婆', file: 'arousal_stories/story_v16_03.mp3' },
  { title: '姐姐的朋友', file: 'arousal_stories/story_v16_04.mp3' },
  { title: '相亲对象', file: 'arousal_stories/story_v16_05.mp3' },
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
