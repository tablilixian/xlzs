const DEFAULT_SETTINGS = {
  bpm: [30, 80, 25],
  duration: [5, 3, 4],
  sprintSec: 15,
  restSec: 20,
  textPush: '吸气，缓慢推入',
  textPull: '呼气，缓慢抽出',
  textPause: '保持不动，深呼吸',
  textKegel: '收紧PC肌，保持收缩',
  soundEnabled: true,
  vibDefault: false,
  voiceCoachEnabled: true,
  vibIntensity: 2,
  level: 'beginner',
  voiceOn: {
    coachOpen: true,
    testVoice: true,
    pause: true,
    complete: true,
    phaseChange: true,
    start: true,
    phase1Beat: true,
    phase3Beat: true,
    emergency: true,
    restart: true,
  },
  voiceText: {
    coachOpen: '',
    testVoice: '',
    pause: '',
    complete: '',
    start: '',
    emergency: '',
    restart: '',
  }
};

const DIFFICULTY_PRESETS = {
  beginner: {
    name: '初级',
    desc: '适合新手，侧重热身放松',
    phase1: { bpm: 30, duration: 5 },
    phase2: { bpm: 80, duration: 3, sprintSec: 10, restSec: 20 },
    phase3: { bpm: 25, duration: 4 },
  },
  intermediate: {
    name: '中级',
    desc: '标准训练，均衡发展',
    phase1: { bpm: 30, duration: 4 },
    phase2: { bpm: 90, duration: 5, sprintSec: 15, restSec: 15 },
    phase3: { bpm: 30, duration: 5 },
  },
  advanced: {
    name: '高级',
    desc: '挑战极限，强化爆发',
    phase1: { bpm: 30, duration: 3 },
    phase2: { bpm: 100, duration: 7, sprintSec: 20, restSec: 10 },
    phase3: { bpm: 35, duration: 5 },
  },
};

const TRAINING_PLANS = {
  full: {
    id: 'full', name: '完整训练', icon: '🏋️', desc: '三阶段全流程，全面能力提升',
    scene: '状态好，有完整时间',
    modules: [1, 2, 3],
    defaultSound: 'mixed', defaultVoice: 'cycle',
    levels: {
      beginner: { phase1: { bpm: 30, duration: 5 }, phase2: { bpm: 80, duration: 3, sprintSec: 10, restSec: 20 }, phase3: { bpm: 25, duration: 4 } },
      intermediate: { phase1: { bpm: 30, duration: 4 }, phase2: { bpm: 90, duration: 5, sprintSec: 15, restSec: 15 }, phase3: { bpm: 30, duration: 5 } },
      advanced: { phase1: { bpm: 30, duration: 3 }, phase2: { bpm: 100, duration: 7, sprintSec: 20, restSec: 10 }, phase3: { bpm: 35, duration: 5 } },
    }
  },
  pcMuscle: {
    id: 'pcMuscle', name: 'PC肌专项', icon: '🎯', desc: '纯凯格尔训练，闭眼即可完成',
    scene: '地铁、办公室、碎片时间',
    modules: [3],
    defaultSound: 'tick', defaultVoice: 'beat',
    levels: {
      beginner: { phase3: { bpm: 25, duration: 5 } },
      intermediate: { phase3: { bpm: 30, duration: 7 } },
      advanced: { phase3: { bpm: 35, duration: 9 } },
    }
  },
  breathReset: {
    id: 'breathReset', name: '呼吸恢复', icon: '🌊', desc: '共振呼吸训练，快速降 arousal',
    scene: '焦虑、工作间隙、睡前',
    modules: [1],
    defaultSound: 'hum', defaultVoice: 'cycle',
    levels: {
      beginner: { phase1: { bpm: 25, duration: 8 } },
      intermediate: { phase1: { bpm: 30, duration: 6 } },
      advanced: { phase1: { bpm: 30, duration: 4 } },
    }
  },
  burstBoost: {
    id: 'burstBoost', name: '爆发强化', icon: '⚡', desc: '纯 HIIT 冲刺训练',
    scene: '时间有限、想练爆发',
    modules: [2],
    defaultSound: 'tick', defaultVoice: 'minimal',
    levels: {
      beginner: { phase2: { bpm: 80, duration: 4, sprintSec: 10, restSec: 20 } },
      intermediate: { phase2: { bpm: 90, duration: 6, sprintSec: 15, restSec: 15 } },
      advanced: { phase2: { bpm: 100, duration: 8, sprintSec: 20, restSec: 10 } },
    }
  },
  quickCombo: {
    id: 'quickCombo', name: '快速组合', icon: '🔄', desc: '热身+控制的精简组合',
    scene: '中等时间，全面但又快',
    modules: [1, 3],
    defaultSound: 'mixed', defaultVoice: 'cycle',
    levels: {
      beginner: { phase1: { bpm: 30, duration: 2 }, phase3: { bpm: 25, duration: 4 } },
      intermediate: { phase1: { bpm: 30, duration: 2 }, phase3: { bpm: 30, duration: 5 } },
      advanced: { phase1: { bpm: 30, duration: 2 }, phase3: { bpm: 35, duration: 6 } },
    }
  },
  sleepRelax: {
    id: 'sleepRelax', name: '睡前放松', icon: '🌙', desc: '降 arousal，帮助入睡',
    scene: '睡前、需要放松',
    modules: [1, 3],
    defaultSound: 'hum', defaultVoice: 'cycle',
    levels: {
      beginner: { phase1: { bpm: 25, duration: 5 }, phase3: { bpm: 20, duration: 5, holdSec: 3, relaxOnly: true } },
      intermediate: { phase1: { bpm: 25, duration: 4 }, phase3: { bpm: 20, duration: 4, holdSec: 3, relaxOnly: true } },
      advanced: { phase1: { bpm: 25, duration: 3 }, phase3: { bpm: 20, duration: 3, holdSec: 3, relaxOnly: true } },
    }
  },
  morningBoost: {
    id: 'morningBoost', name: '晨间激活', icon: '☀️', desc: '快速唤醒身心',
    scene: '起床后、快速激活',
    modules: [1, 2],
    defaultSound: 'mixed', defaultVoice: 'cycle',
    levels: {
      beginner: { phase1: { bpm: 30, duration: 2 }, phase2: { bpm: 80, duration: 3, sprintSec: 10, restSec: 20 } },
      intermediate: { phase1: { bpm: 30, duration: 2 }, phase2: { bpm: 85, duration: 4, sprintSec: 15, restSec: 15 } },
      advanced: { phase1: { bpm: 30, duration: 2 }, phase2: { bpm: 90, duration: 5, sprintSec: 20, restSec: 10 } },
    }
  },
  endurance: {
    id: 'endurance', name: '耐力挑战', icon: '💪', desc: '延长版完整训练',
    scene: '状态极好、想挑战自己',
    modules: [1, 2, 3],
    defaultSound: 'mixed', defaultVoice: 'minimal',
    levels: {
      beginner: { phase1: { bpm: 30, duration: 5 }, phase2: { bpm: 85, duration: 6, sprintSec: 10, restSec: 20 }, phase3: { bpm: 25, duration: 5 } },
      intermediate: { phase1: { bpm: 30, duration: 4 }, phase2: { bpm: 95, duration: 8, sprintSec: 15, restSec: 15 }, phase3: { bpm: 30, duration: 6 } },
      advanced: { phase1: { bpm: 30, duration: 3 }, phase2: { bpm: 110, duration: 12, sprintSec: 25, restSec: 10 }, phase3: { bpm: 35, duration: 6 } },
    }
  },
  kegelPro: {
    id: 'kegelPro', name: '凯格尔进阶', icon: '📈', desc: 'PC肌控制力专项',
    scene: '专注训练技巧',
    modules: [1, 3],
    defaultSound: 'tick', defaultVoice: 'beat',
    levels: {
      beginner: { phase1: { bpm: 30, duration: 2 }, phase3: { bpm: 25, duration: 4, holdSec: 3 } },
      intermediate: { phase1: { bpm: 30, duration: 2 }, phase3: { bpm: 30, duration: 6, holdSec: 5 } },
      advanced: { phase1: { bpm: 30, duration: 2 }, phase3: { bpm: 35, duration: 8, holdSec: 8 } },
    }
  },
  meditation: {
    id: 'meditation', name: '冥想呼吸', icon: '🧘', desc: '深度身心整合',
    scene: '冥想、深度放松',
    modules: [1],
    defaultSound: 'hum', defaultVoice: 'cycle',
    levels: {
      beginner: { phase1: { bpm: 20, duration: 12 } },
      intermediate: { phase1: { bpm: 22, duration: 10 } },
      advanced: { phase1: { bpm: 25, duration: 8 } },
    }
  },
};

const VOICE_PROMPTS = [
  { key: 'coachOpen',    name: '开启语音教练',     defaultText: '语音教练已开启',   trigger: '点击语音教练按钮' },
  { key: 'testVoice',    name: '语音测试',         defaultText: '测试语音，你好，欢迎使用训练助手', trigger: '设置页测试按钮' },
  { key: 'pause',        name: '训练暂停',         defaultText: '训练暂停',          trigger: '点击暂停按钮' },
  { key: 'complete',     name: '训练完成',         defaultText: '恭喜，训练完成',    trigger: '三阶段训练全部结束' },
  { key: 'start',        name: '训练开始',         defaultText: '训练开始，热身阶段', trigger: '点击开始训练' },
  { key: 'phaseChange',  name: '阶段切换',         defaultText: '进入{X}阶段',      trigger: '阶段一→二、二→三切换时' },
  { key: 'phase1Beat',   name: '热身阶段节拍引导', defaultText: '匀速推入',          trigger: '阶段一每循环第1拍' },
  { key: 'phase3Beat',   name: '控制阶段节拍引导', defaultText: '推入+凯格尔',      trigger: '阶段三每循环第1拍' },
  { key: 'emergency',    name: '紧急刹车',         defaultText: '紧急刹车，开始冷却', trigger: '点击一键控射暂停' },
  { key: 'restart',      name: '冷却后重启',       defaultText: '重新开始，回到热身阶段', trigger: '冷却倒计时结束' },
];

const WEEK_MODES = [
  { name: '爆发挑战', desc: '爆发延长，挑战极限', icon: '⚡' },
  { name: '恢复训练', desc: '轻度训练，注重恢复', icon: '🌿' },
  { name: '耐力训练', desc: '延长总时长至20分钟', icon: '💪' },
  { name: '休息日', desc: '完全休息或仅做凯格尔', icon: '😴' },
  { name: '节奏训练', desc: '专注节拍跟随精度', icon: '🎵' },
  { name: '综合训练', desc: '完整三阶段训练', icon: '🏋️' },
  { name: '自由训练', desc: '本周奖励日！可以尽情释放', icon: '🎉', isRewardDay: true }
];
const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

let currentPlan = 'full';
let currentPlanLevel = 'intermediate';
let currentSoundMode = 'mixed';
let currentVoiceDensity = 'cycle';
let customPlanDraft = null;
