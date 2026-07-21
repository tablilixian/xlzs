let voiceCoachEnabled = false;
let selectedVoice = null;
let voicesLoaded = false;
let arousalVoiceTimer = null;

function initVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return;
  voicesLoaded = true;
  selectedVoice = voices.find(v => v.lang === 'zh-CN')
    || voices.find(v => v.lang.startsWith('zh'))
    || voices.find(v => v.lang.startsWith('zh-TW'))
    || null;
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = initVoices;
  setTimeout(initVoices, 100);
}

function speak(text, key) {
  if (!voiceCoachEnabled) return;
  if (!('speechSynthesis' in window)) return;
  if (key) {
    const s = loadSettings();
    if (s.voiceOn && s.voiceOn[key] === false) return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.2;
  utterance.volume = 0.8;
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
    utterance.lang = 'zh-CN';
  }
  speechSynthesis.speak(utterance);
}

function toggleVoiceCoach() {
  voiceCoachEnabled = !voiceCoachEnabled;
  const btn = document.getElementById('voiceBtnText');
  btn.textContent = voiceCoachEnabled ? '关闭语音' : '语音教练';
  if (voiceCoachEnabled) {
    if (!voicesLoaded) initVoices();
    speak(getVoiceText('coachOpen', '语音教练已开启'), 'coachOpen');
    showToast('语音教练已开启');
  } else {
    speechSynthesis.cancel();
    showToast('语音教练已关闭');
  }
}

function testVoice() {
  if (!('speechSynthesis' in window)) {
    showToast('当前浏览器不支持语音合成');
    return;
  }
  if (!voicesLoaded) initVoices();
  const wasEnabled = voiceCoachEnabled;
  voiceCoachEnabled = true;
  speak('测试语音，你好，欢迎使用训练助手', 'testVoice');
  showToast('正在播放测试语音...');
  setTimeout(() => { voiceCoachEnabled = wasEnabled; }, 1000);
}

function updateVoiceStatus() {
  if (!('speechSynthesis' in window)) {
    document.getElementById('voiceStatus').textContent = '❌ 当前浏览器不支持语音合成';
    return;
  }
  if (!voicesLoaded) initVoices();
  setTimeout(() => {
    if (selectedVoice) {
      document.getElementById('voiceStatus').textContent = '✓ ' + selectedVoice.name + ' (' + selectedVoice.lang + ')';
    } else {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        document.getElementById('voiceStatus').textContent = '⚠ 未找到中文语音，可用语音数: ' + voices.length;
      } else {
        document.getElementById('voiceStatus').textContent = '⏳ 语音列表加载中，请刷新重试...';
      }
    }
  }, 300);
}

function getVoiceText(key, defaultText) {
  const s = loadSettings();
  if (s.voiceText && s.voiceText[key]) return s.voiceText[key];
  return defaultText;
}

// ===== Pre-Arousal voice loop =====
function startArousalVoice() {
  if (!voiceCoachEnabled) return;
  const msg = '闭上眼睛，深呼吸，专注于身体的感觉，不用着急，准备好了再继续。';
  const loop = () => {
    if (document.getElementById('preArousalBlock') && !document.getElementById('preArousalBlock').classList.contains('hidden')) {
      speak(msg);
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
  speechSynthesis.cancel();
}
