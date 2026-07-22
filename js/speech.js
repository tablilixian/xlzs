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
    '推入': 'phase1_push.mp3',
    '深入': 'phase1_push2.mp3',
    '停': 'phase1_stop.mp3',
    '匀速抽出': 'phase1_pull.mp3',
    '抽出': 'phase1_pull.mp3',
    '退出': 'phase1_pull2.mp3',
    '入口停': 'phase1_entry.mp3',
    '吸气': 'breath_inhale.mp3',
    '屏息': 'breath_hold.mp3',
    '呼气': 'breath_exhale.mp3',
    '呼出': 'breath_exhale.mp3',
    '空息': 'breath_hold.mp3',
  },
  phase2Beat: {
    '冲': 'phase2_sprint.mp3',
    '冲刺': 'phase2_sprint.mp3',
    '休息一下': 'phase2_rest.mp3',
    '休息': 'phase2_rest.mp3',
  },
  phase3Beat: {
    '插入并收紧': 'phase3_push.mp3',
    '推+收': 'phase3_push.mp3',
    '呼+收': 'phase3_push.mp3',
    '保持': 'phase3_hold.mp3',
    '抽出并放松': 'phase3_pull.mp3',
    '抽+放': 'phase3_pull.mp3',
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
    speak('语音已开启', 'coachOpen');
    showToast('语音教练已开启');
  } else {
    stopSpeaking();
    showToast('语音教练已关闭');
  }
}

function testVoice() {
  const wasEnabled = voiceCoachEnabled;
  voiceCoachEnabled = true;
  speak('测试语音，你好', 'testVoice');
  showToast('正在播放测试语音...');
  setTimeout(() => { voiceCoachEnabled = wasEnabled; }, 3000);
}

function startArousalVoice() {
  if (!voiceCoachEnabled) return;
  speak('放松身体，闭上眼睛。用手或道具轻柔揉搓龟头冠状沟，上下撸动阴茎，刺激自己尽快勃起。等阴茎完全硬起来后，戴好安全套。准备好了就可以开始热身训练。', 'arousal');
}

function stopArousalVoice() {
  if (arousalVoiceTimer) {
    clearTimeout(arousalVoiceTimer);
    arousalVoiceTimer = null;
  }
  stopSpeaking();
}