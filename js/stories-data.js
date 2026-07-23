// 故事集 · 完整索引
const STORIES_CATEGORIES = [
  {
    name: '毕业旅行系列',
    desc: '五对情侣 · 七天两千公里 · 每晚一个故事',
    stories: [
      { id: '00', title: '出发 · 开篇', subtitle: '五对情侣，一辆车，七天两千公里', file: 'docs/graduation_trip/00_开篇.md', preview: '车是珍珍找她表哥借的一辆九座商务车——深灰色的，车漆有几道划痕，后排座椅拆了两排腾出空间放行李和睡袋。' },
      { id: '01', title: '第一晚 · 抽签换伴', subtitle: '车还没上高速，签已经抽好了', file: 'docs/graduation_trip/01_抽签换伴.md', preview: '车上了高速之后珍珍从包里掏出一把签——用红色的包装绳剪成十五段，每段长短不一，握在手里露出一截。她说——今晚的床位，抽签决定。' },
      { id: '02', title: '蒙古包 · 国王游戏', subtitle: '纱帐、电影、十轮游戏、十个人的投影', file: 'docs/graduation_trip/02_蒙古包国王游戏.md', preview: '蒙古包比想象中大。直径大概七八米，中间放了一张矮桌，周围铺了一圈厚厚的羊毛坐垫。窗户很大——窗边垂着几幅白色的纱帐。' },
      { id: '03', title: '温泉 · 水下暗战', subtitle: '水雾里摸到谁就是谁，水面平静，水下翻腾', file: 'docs/graduation_trip/03_温泉水下暗战.md', preview: '十个人下水。池子刚好能坐下十个人——肩膀挨着肩膀，大腿碰着大腿。水面到每个人的下巴，热水从脚底涌上来。' },
      { id: '04', title: '篝火 · 真心话大冒险', subtitle: '酒瓶在转，火光在晃，有人在暗处已经开始了', file: 'docs/graduation_trip/04_篝火真心话大冒险.md', preview: '从温泉出来的时候每个人都像一只刚煮熟的虾——全身皮肤泛着红，头发湿漉漉地贴在头皮上。草原夜晚的温度和温泉的水温差了将近三十度。' },
      { id: '05', title: '情侣按摩 · 隔帘做爱', subtitle: '一帘之隔，你看到我的脸，看不到帘子下面的事', file: 'docs/graduation_trip/05_隔帘按摩.md', preview: '车开了二十分钟停在路边一栋白色的三层小楼前面。门口挂着一块不显眼的木牌——没有店名，只写着"SPA"三个字母。红姐拿出了一本相册。' },
    ]
  },
  {
    name: '独立长篇',
    desc: '完整叙事 · 单篇成章',
    stories: [
      { id: 'v17', title: '绿帽篇：自驾游 · 相亲综艺', subtitle: '你的女友和别人出去露营，你在家看综艺——综艺上她正在相亲', file: 'docs/arousal_stories_v17.md', preview: '阿贤，你记不记得我们那次去露营？你兴奋了整整一个星期，买了新帐篷、新睡袋、还专门去迪卡侬买了一把户外椅子。你觉得终于可以跟我单独出去玩了。' },
      { id: 'v18', title: '女尊篇：摄影师 · 契约 · 3P · 调教', subtitle: '女摄影师按下快门的同时，也在按下你人生的开关', file: 'docs/arousal_stories_v18.md', preview: '阿贤，脱。全部脱光。别用手挡着，我让你来拍私房照，不是让你来害羞的。你的身体我早就看过了，现在我要用镜头再看一遍。' },
      { id: 'ssis001', title: 'SSIS-001 — 忠实还原', subtitle: '一个月禁欲之后，女友的室友们给了他另一种"照顾"', file: 'docs/ssis001_adaptation.md', preview: '番号：SSIS-001。标题：一ヶ月間の禁欲の果てに彼女のルームメイト2人と泥酔して…。阿贤的女友小羽出差一个月。临走前她捧着他的脸说——等我回来。' },
    ]
  },
  {
    name: '独立短篇',
    desc: '轻量故事 · 一读到底',
    stories: [
      { id: 'base', title: '唤醒故事四则', subtitle: '四篇女生第一人称 · 直白露骨 · 命令式引导', file: 'docs/arousal_stories.md', preview: '四篇短篇合集，每篇 ~600-800 字，语音时长约 3-4 分钟。用第一人称引导式语言，带你进入不同的场景——从简单的撸管引导到角色扮演，层层递进。' },
      { id: 'game_show', title: '夫妻挑战赛', subtitle: '地下成人综艺，三对夫妻用身体决出胜负', file: 'docs/game_show_couple_challenge.md', preview: '一档地下成人综艺节目。三对夫妻报名参加，通过游戏决出胜负。输的那一对，要在赢的一对面前做爱。观众在手机那头。' },
      { id: 'honeymoon', title: '新婚旅行Game', subtitle: '蜜月第三晚，一副扑克牌让两个人开始了一场漫长的游戏', file: 'docs/honeymoon_trip_game.md', preview: '新婚夫妻的蜜月旅行。第三晚，酒店房间里，两个人开始玩一个游戏。规则很简单：抽一张牌，按牌面上的数字决定今晚的进度。从接吻开始。' },
    ]
  },
  {
    name: '情欲合集 · 前篇',
    desc: '唤醒阶段激情小说 v3–v8，每篇内含多个场景',
    stories: [
      { id: 'v3', title: 'v3 · 新手入门系列', subtitle: '六篇从唤醒到完全勃起的引导文', file: 'docs/arousal_stories_v3.md', preview: '篇一 · 撸管引导｜从唤醒到完全勃起。篇二 · 抚摸引导｜全身敏感带探索。篇三 · 呼吸引导｜用呼吸控制兴奋度。' },
      { id: 'v4', title: 'v4 · 办公室 & 禁忌场景', subtitle: '你在会议室里开视频会议的时候，有人在桌子下面做的事', file: 'docs/arousal_stories_v4.md', preview: '门锁我已经锁好了。窗帘我也拉下来了。现在你可以放松一点了——这间办公室隔音很好，没有人会知道你在做什么。' },
      { id: 'v5', title: 'v5 · 禁忌角色扮演', subtitle: '护士与病人 · 家教与学生 · 姐姐与弟弟', file: 'docs/arousal_stories_v5.md', preview: '篇一 · 护士与病人｜你老婆就在外面。篇二 · 家教｜你妈妈付钱让我来教你。篇三 · 姐姐的朋友｜你姐不在家吧。' },
      { id: 'v6', title: 'v6 · 淫妻/交换/综艺', subtitle: '魔镜号 · 共享女友 · NTR 交换综艺', file: 'docs/arousal_stories_v6.md', preview: '篇一 · 魔镜号｜忠诚度考验综艺。篇二 · 共享女友｜你跟兄弟们合租。篇三 · 女友的闺蜜｜她说想试试。' },
      { id: 'v7', title: 'v7 · 极限禁忌', subtitle: '母女 · 绿帽疗愈 · 乱伦综艺 · 长期调教', file: 'docs/arousal_stories_v7.md', preview: '篇一 · 成人综艺｜夫妻交换挑战。篇二 · 母女｜你女朋友跟她妈。篇三 · 绿帽疗愈｜你老婆让我来帮你的。' },
      { id: 'v8', title: 'v8 · 九大新性癖', subtitle: '远程遥控 · 冰火两重天 · ABO · 国产凌凌漆', file: 'docs/arousal_stories_v8.md', preview: '篇一 · 远程遥控玩具｜你在哪我都让你硬。篇二 · 冰火两重天｜含冰块给我口。篇三 · ABO 世界观｜易感期。' },
    ]
  },
  {
    name: '情欲合集 · 中篇',
    desc: '唤醒阶段激情小说 v9–v14，场景 & 绿帽 & 露出',
    stories: [
      { id: 'v9', title: 'v9 · 场景系列（上）', subtitle: '试衣间 · 自习室 · 出租车 · 高铁 · 电影院', file: 'docs/arousal_stories_v9.md', preview: '篇一 · 试衣间｜帘子外面全是人。篇二 · 自习室｜图书馆的角落。篇三 · 出租车｜后座。篇四 · 高铁｜洗手间。' },
      { id: 'v10', title: 'v10 · 场景系列（下）', subtitle: '图书馆 · 漂流 · 阳台 · 教堂 · 楼梯间', file: 'docs/arousal_stories_v10.md', preview: '篇一 · 图书馆｜桌子底下你别出声。篇二 · 漂流｜水面上大家都在看风景。篇三 · 阳台｜楼下全是人。' },
      { id: 'v11', title: 'v11 · 绿帽系列（上）', subtitle: '兄弟的老婆 · 同事 · 健身教练 · 楼下保安', file: 'docs/arousal_stories_v11.md', preview: '篇一 · 兄弟的老婆｜你老公让我照顾你。篇二 · 同事｜公司团建那一夜。篇三 · 健身教练｜你女朋友说想加练。' },
      { id: 'v12', title: 'v12 · 绿帽系列（中）', subtitle: '婚礼当天 · 交换伴侣 · 岳母 · 大学室友', file: 'docs/arousal_stories_v12.md', preview: '篇七 · 婚礼当天——伴娘｜新娘在敬酒——她在阳台蹲着。篇八 · 交换俱乐部｜你老婆选了我的。' },
      { id: 'v13', title: 'v13 · 露出系列 + 绿帽收官', subtitle: '电影院 · 天台 · 地铁 · 海底捞 · 雨中', file: 'docs/arousal_stories_v13.md', preview: '篇十二 · 电影院｜最后一排。阿贤，你带珍珍看电影。午夜场——人很少——最后一排只有你们两个。' },
      { id: 'v14', title: 'v14 · 女主动·反客为主（上）', subtitle: '短发女闺蜜 · 醉酒姐姐 · 阿姨 · 弟媳', file: 'docs/arousal_stories_v14.md', preview: '篇一 · 短发女闺蜜｜今晚你是女的。阿贤，你有一个认识了十二年的女闺蜜——她从来没交过男朋友。' },
    ]
  },
  {
    name: '情欲合集 · 后篇',
    desc: '唤醒阶段激情小说 v15–v18，女主动 & 绿帽 & 女尊',
    stories: [
      { id: 'v15', title: 'v15 · 女主动·反客为主（中）', subtitle: '初恋女友 · 英语老师 · 按摩技师 · 侄女', file: 'docs/arousal_stories_v15.md', preview: '篇六 · 初恋女友｜明天我就嫁人了——今晚你是我最后一次。阿贤，你分手三年的初恋突然约你见面。' },
      { id: 'v16', title: 'v16 · 女主动·反客为主（下）', subtitle: '瑜伽老师 · 酒保 · 妇产科医生 · SM 女王', file: 'docs/arousal_stories_v16.md', preview: '篇十一 · 瑜伽老师｜你留下来——我给你单独补课。阿贤，你是珍珍那个瑜伽老师。珍珍说你柔韧性太差了。' },
    ]
  },
];

// flat index for backward compatibility
const STORIES_INDEX = [];
STORIES_CATEGORIES.forEach(function(cat) {
  cat.stories.forEach(function(s) { STORIES_INDEX.push(s); });
});
