let voiceCoachEnabled = false;
let arousalVoiceTimer = null;

const voiceQueue = [];
let isPlaying = false;
let currentAudio = null;

const VOICE_FILE_MAP = {
  coachOpen: 'coachOpen.mp3',
  testVoice: 'testVoice.mp3',
  pause: 'pause.mp3',
  complete: 'complete.mp3',
  start: 'start.mp3',
  emergency: 'emergency.mp3',
  restart: 'restart.mp3',
  arousal: 'arousal_guide.mp3',
  phaseChange: {
    1: 'phaseChange1.mp3',
    2: 'phaseChange2.mp3',
    3: 'phaseChange3.mp3',
  },
  phase1Beat: {
    '匀速推入': 'phase1_push.mp3',
    '继续深入': 'phase1_push2.mp3',
    '深处停止': 'phase1_stop.mp3',
    '匀速抽出': 'phase1_pull.mp3',
    '继续退出': 'phase1_pull2.mp3',
    '入口停止': 'phase1_entry.mp3',
    '深吸气': 'breath_inhale.mp3',
    '屏息': 'breath_hold.mp3',
    '屏息保持': 'breath_hold.mp3',
    '缓慢呼气': 'breath_exhale.mp3',
    '完全呼出': 'breath_exhale.mp3',
    '空息': 'breath_hold.mp3',
    '缓慢推入': 'phase1_push.mp3',
    '轻柔抽出': 'phase1_pull.mp3',
    '入口停留': 'phase1_entry.mp3',
  },
  phase2Beat: {
    '全力冲刺': 'phase2_sprint.mp3',
    '停止休息': 'phase2_rest.mp3',
  },
  phase3Beat: {
    '推入+凯格尔': 'phase3_push.mp3',
    '保持收缩': 'phase3_hold.mp3',
    '抽出+放松': 'phase3_pull.mp3',
    '吸气放松': 'breath_exhale.mp3',
    '呼气收缩': 'phase3_push.mp3',
    '深长呼气': 'breath_exhale.mp3',
  },
};

function getVoiceSpeed() {
  const s = loadSettings();
  return s.voiceSpeed !== undefined ? s.voiceSpeed : 1.0;
}

function getVoiceFilePath(text, key, phase) {
  if (VOICE_FILE_MAP[key]) {
    if (typeof VOICE_FILE_MAP[key] === 'object') {
      if (phase !== undefined && VOICE_FILE_MAP[key][phase]) {
        return VOICE_FILE_MAP[key][phase];
      }
      return VOICE_FILE_MAP[key][text] || null;
    }
    return VOICE_FILE_MAP[key];
  }
  return null;
}

function playAudioFile(filePath) {
  return new Promise((resolve) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    
    const audio = new Audio(`sounds/voices/${filePath}`);
    audio.volume = 0.8;
    audio.playbackRate = getVoiceSpeed();
    
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    
    audio.onerror = () => {
      currentAudio = null;
      resolve();
    };
    
    audio.play().catch(() => {
      currentAudio = null;
      resolve();
    });
    
    currentAudio = audio;
  });
}

function speak(text, key, phase) {
  if (!voiceCoachEnabled) return;
  if (key) {
    const s = loadSettings();
    if (s.voiceOn && s.voiceOn[key] === false) return;
  }
  
  const filePath = getVoiceFilePath(text, key, phase);
  if (filePath) {
    voiceQueue.push({ text, key, filePath });
    processVoiceQueue();
  }
}

function processVoiceQueue() {
  if (isPlaying || voiceQueue.length === 0) return;
  
  isPlaying = true;
  const item = voiceQueue.shift();
  
  playAudioFile(item.filePath).then(() => {
    isPlaying = false;
    processVoiceQueue();
  });
}

function stopSpeaking() {
  voiceQueue.length = 0;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  isPlaying = false;
}

function toggleVoiceCoach() {
  voiceCoachEnabled = !voiceCoachEnabled;
  const btn = document.getElementById('voiceBtnText');
  btn.textContent = voiceCoachEnabled ? '关闭语音' : '语音教练';
  if (voiceCoachEnabled) {
    speak(getVoiceText('coachOpen', '语音教练已开启'), 'coachOpen');
    showToast('语音教练已开启');
  } else {
    stopSpeaking();
    showToast('语音教练已关闭');
  }
}

function testVoice() {
  const wasEnabled = voiceCoachEnabled;
  voiceCoachEnabled = true;
  speak('测试语音，你好，欢迎使用训练助手', 'testVoice');
  showToast('正在播放测试语音...');
  setTimeout(() => { voiceCoachEnabled = wasEnabled; }, 3000);
}

function updateVoiceStatus() {
  document.getElementById('voiceStatus').textContent = '✓ 使用Edge TTS预生成语音';
}

function getVoiceText(key, defaultText) {
  const s = loadSettings();
  if (s.voiceText && s.voiceText[key]) return s.voiceText[key];
  return defaultText;
}

function startArousalVoice() {
  if (!voiceCoachEnabled) return;
  const loop = () => {
    if (document.getElementById('preArousalBlock') && !document.getElementById('preArousalBlock').classList.contains('hidden')) {
      speak('闭上眼睛，深呼吸，专注于身体的感觉，不用着急，准备好了再继续。', 'arousal');
      arousalVoiceTimer = setTimeout(loop, 10000);
    }
  };
  loop();
}

function stopArousalVoice() {
  if (arousalVoiceTimer) {
    clearTimeout(arousalVoiceTimer);
    arousalVoiceTimer = null;
  }
  stopSpeaking();
}