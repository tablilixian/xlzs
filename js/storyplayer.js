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

var STORY_DESC = [
  // ── v3 基础唤醒 ──
  '温柔的指令引导你从放松到完全勃起，感受每一次呼吸和脉搏',
  '扮演办公室里的下级，被女上司用语言羞辱和命令控制你的高潮',
  '清晨被窝里的身体唤醒，从第一缕阳光开始慢慢点燃你的欲望',
  '浴室蒸汽中的触觉幻想，水声和温度编织出一场自慰的序曲',
  // ── v4 角色扮演 ──
  '年轻女老师课后把你留在教室，用教鞭和命令让你无法自拔',
  '夜店里陌生女人的手从桌下伸过来，在音乐和酒精中挑衅你的底线',
  '按摩床上你被蒙住眼睛，她的手指和精油让你完全失去控制',
  '商场更衣室里导购小姐拉上帘子，说这件衣服需要「试穿」一下',
  // ── v5 禁忌身份 ──
  '你的妻子就在门外排队，而诊室里的护士说你必须「勃起检查」',
  '你最信任的女闺蜜说「你女朋友让我来照顾你——在床上照顾」',
  '高中同学会上当年的文静女生问你「那年在天台你没做完的事还记得吗」',
  '大明星的私人化妆间里她说「你配不上我——但我允许你幻想」',
  // ── v6 综艺专题 ──
  '你被带上夫妻交换综艺，抽签选中了别人老婆，摄像机全程记录',
  '你参加了一个交换派对，门推开后看到你老婆正在对面房间的床上',
  '新婚旅行妻子在隔壁房间睡着了，你走错门进了她闺蜜的房间',
  '蜜月酒店的阳台连着隔壁房间，你听到的声音让你无法入睡',
  // ── v7 极限禁忌 ──
  '你和你妻子被选中参加一档夫妻交换综艺，主持人全程现场解说',
  '你被绑在调教椅上，女调教师命令你今晚无论如何都不许射',
  '你看着自己的妻子被别的男人调教，而她脸上的表情你从未见过',
  '女按摩师的手指探入你的禁忌地带，说「放松——你逃不掉的」',
  // ── v8 九大性癖 ──
  '你在咖啡馆开会，她坐在对面用手机控制着你体内的遥控玩具',
  '你被锁上了贞操锁，钥匙挂在她脖子上说「想射的时候求我」',
  '你被蒙着眼睛躺在床上，不知道今晚排队等着用你的到底有几个人',
  '你被同时进入前后两个洞，前后夹击的快感让你连求饶都说不完整',
  '他站在你面前脱下裤子，她让你比较「看清楚——谁才是男人」',
  '你被要求全身赤裸站在落地窗前，窗外是车水马龙的城市夜景',
  '你戴上了VR头盔，眼前的女人让你分不清是现实还是幻觉',
  '产后两个月她涨奶的时候最敏感，你说「别浪费——让我来吸」',
  '她穿着黑丝和高跟鞋用大腿夹着你，说「你今天只准碰这里」',
  // ── v9 场景系列上 ──
  '你在试衣间里刚脱了衣服，帘子被掀开——隔壁试衣间的少妇走了进来',
  '冰块在你胸口融化，她含了一口热水含住了你——冰与火的交替让你发疯',
  '姐姐刚走妹妹就进来了，她说「我姐说你很厉害——我不信」',
  '公司团建你被女同事灌了半瓶白酒，醒来的时候发现鸡吧上坐着人',
  // ── v10 场景系列下 ──
  '你在图书馆自习，对面的女生的脚从桌子下面伸了过来',
  '你老公举着手机说「拍清楚一点——我要让兄弟们看看你老婆有多骚」',
  '你老婆怀孕五个月了躺在她自己的床上，而你正在隔壁房间里肏她妹妹',
  '结婚三年的老婆第一次和别的男人做，事后她趴在你胸口说「他比你大」',
  // ── v11 绿帽系列上 ──
  '你最好的哥们出差让你「照顾」他老婆——你照顾到她床上去了',
  '老板今天在公司骂了你——你记住了他家的地址和他老婆的微信',
  '对门少妇穿着吊带睡裙来敲门说水管坏了——你修了水管也修了她',
  '十年同学聚会当年的班花喝多了，她说「老公从来不能满足我」',
  '健身房里那个穿瑜伽裤的少妇让你教她用器材——器材是你的鸡吧',
  '凌晨两点她上了你的网约车，老公在电话里骂她——她挂了说「你随便开」',
  // ── v12 绿帽系列中 ──
  '新娘在敬酒，伴娘在阳台蹲在你面前——「新郎不行，你看起来比他行」',
  '你老婆住院了，隔壁床少妇的老公从来没来过——她通宵陪你「聊天」',
  '你上门送快递也上门送精，开门的人妻穿着真丝睡袍说「进来吧老公不在」',
  '你最好的兄弟是刑警今晚抓逃犯去了，他老婆一个人在家「害怕」',
  '带客户看精装公寓她说「姐今天签了你的单——你先让姐签了你」',
  // ── v13 露出系列 ──
  '午夜场最后一排她在你腿上慢慢坐了下去——前面三排还坐着一个大叔',
  '你在泳池更衣室冲澡帘子没拉严——隔壁的女人进来了站定没走',
  '你说今晚不关窗也不拉帘——对面楼十几扇窗户后面都亮着灯',
  '季度总结会你在讲PPT，她在桌子下面解开了你西裤的拉链',
  '你把她拉进高铁卫生间没锁门——外面有人拧了两下门把手',
  '自驾游拐进服务区最远的角落停在一排大货车后面——车在晃',
  '八楼天台围栏齐腰，楼下夜市全是人——你让她趴着围栏从后面进入',
  // ── v14 女主动上 ──
  '你认识了十二年的短发女闺蜜喝多了把你按在沙发上「今晚你是女的」',
  '当年追了半年没追到的大学女同学开着保时捷来参加聚会',
  '新来的美女总监说「我看了你面试照片三秒就决定录用你了」',
  '你的私人女教练说「最近表现不错——做完这组我奖励你」',
  '你在直播间刷了好几个月礼物的女主播说「线下见面你要听我的」',
  // ── v15 女主动中 ──
  '分手五年的初恋发短信说明天我结婚——今晚你是我最后一次',
  '楼上的离婚女人说「弟弟你帮我那么多次——姐姐应该回报你一下」',
  '退伍回来的女朋友体能比你好，你把她的手腕按在头顶三秒被她反制',
  '你挂的男科——诊室里坐着一个女医生，她戴着手套托起了你的鸡吧',
  '酒吧里她直接把手放在你大腿上说「我十二点飞机——你行还是不行」',
  // ── v16 女主动下 ──
  '你是她瑜伽班里唯一的男学员，课后她让所有人走了留下你「补课」',
  '你骑电动车没戴头盔被一个女警拦了——她给了你微信号',
  '阿强带你参加富婆饭局，散场时他说「今晚你负责陪李姐」',
  '你姐出差了让你看家——她的大学室友来借吸尘器顺便借了你',
  '家里介绍相亲的姑娘第三次约会就来你家，关上门她说「装了一天累死我了」',
];

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

// ── Story Playlist Browser ──
function openStoryPlaylist() {
  var existing = document.getElementById('storyPlaylistOverlay');
  if (existing) existing.style.display = '';
  else buildStoryPlaylist();
}

function closeStoryPlaylist() {
  var el = document.getElementById('storyPlaylistOverlay');
  if (el) el.style.display = 'none';
}

function buildStoryPlaylist() {
  var overlay = document.createElement('div');
  overlay.className = 'custom-panel-overlay';
  overlay.id = 'storyPlaylistOverlay';
  overlay.onclick = function(e) { if (e.target === overlay) closeStoryPlaylist(); };

  var panel = document.createElement('div');
  panel.className = 'custom-panel';
  panel.style.maxWidth = '500px';
  panel.style.maxHeight = '85vh';

  var header = document.createElement('div');
  header.className = 'custom-panel-header';
  header.innerHTML = '<h3>📖 故事列表</h3><button class="btn btn-ghost" onclick="closeStoryPlaylist()" style="padding:0.3rem 0.6rem;font-size:1.2rem">✕</button>';

  var body = document.createElement('div');
  body.style.padding = '0.75rem';
  body.style.overflowY = 'auto';
  body.style.maxHeight = 'calc(85vh - 60px)';

  for (var i = 0; i < STORY_LIST.length; i++) {
    var item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;padding:0.65rem 0.75rem;border-bottom:1px solid var(--bg3);gap:0.6rem;cursor:pointer;border-radius:var(--radius);transition:background 0.15s';
    item.onmouseenter = function() { this.style.background = 'var(--bg3)'; };
    item.onmouseleave = function() { this.style.background = 'transparent'; };

    var idx = i;
    var playBtn = document.createElement('button');
    playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="8 5 19 12 8 19 8 5"/></svg>';
    playBtn.style.cssText = 'flex-shrink:0;width:36px;height:36px;border-radius:50%;background:var(--accent);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#000';
    playBtn.onclick = function(i) { return function() { playStoryFromList(i); }; }(idx);
    playBtn.title = '播放此故事';

    var textWrap = document.createElement('div');
    textWrap.style.cssText = 'flex:1;min-width:0';

    var title = document.createElement('div');
    title.style.cssText = 'font-size:0.9rem;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
    title.textContent = STORY_LIST[i].title;

    var desc = document.createElement('div');
    desc.style.cssText = 'font-size:0.72rem;color:var(--muted);margin-top:0.15rem;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden';
    desc.textContent = STORY_DESC[i] || '';

    textWrap.appendChild(title);
    textWrap.appendChild(desc);
    item.appendChild(playBtn);
    item.appendChild(textWrap);

    // Click on item (not play button) also plays
    item.onclick = (function(i) { return function() { playStoryFromList(i); }; })(idx);

    body.appendChild(item);
  }

  panel.appendChild(header);
  panel.appendChild(body);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

function playStoryFromList(idx) {
  closeStoryPlaylist();
  var story = STORY_LIST[idx];
  if (!story) return;

  stopStoryPlayer();
  storyPlayerEnabled = true;
  storyPlayerStarted = true;

  var btn = document.getElementById('storyBtnText');
  if (btn) btn.textContent = '关闭故事';

  var ind = document.getElementById('storyPlayerIndicator');
  if (ind) ind.style.display = '';

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
  audio.play().catch(function() {});
  storyPlayerAudio = audio;
  if (storyPlayerTitleEl) {
    storyPlayerTitleEl.textContent = '▶ ' + story.title;
  }

  startDuckCheck();

  // Set current index for next/prev
  for (var i = 0; i < storyPlayerOrder.length; i++) {
    if (storyPlayerOrder[i] === idx) {
      storyPlayerCurrentIndex = i;
      break;
    }
  }

  var s = loadSettings();
  s.storyPlayerEnabled = true;
  Storage.set('settings', s);

  showToast('正在播放：' + story.title);
}

// Click on indicator title to open playlist
document.addEventListener('DOMContentLoaded', function() {
  var ind = document.getElementById('storyPlayerTitle');
  if (ind) {
    ind.style.cursor = 'pointer';
    ind.title = '点击浏览全部故事';
    ind.onclick = function() { openStoryPlaylist(); };
  }
});
