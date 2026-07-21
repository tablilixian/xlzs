function refreshDashboard() {
  const greetingEl = document.getElementById('greetingText');
  if (!greetingEl) return;
  
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 6 ? '夜深了' : h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好';
  greetingEl.textContent = greeting;
  
  const dayNameEl = document.getElementById('dayName');
  if (dayNameEl) dayNameEl.textContent = '周' + WEEK_DAYS[now.getDay()];

  const mode = WEEK_MODES[now.getDay() === 0 ? 6 : now.getDay() - 1];
  const modeNameEl = document.getElementById('modeName');
  if (modeNameEl) modeNameEl.innerHTML = mode.name + ' - ' + mode.desc;

  const rec = Storage.getRecords();
  const statStreakEl = document.getElementById('statStreak');
  if (statStreakEl) statStreakEl.textContent = rec.streak || '—';
  
  const statWeekEl = document.getElementById('statWeek');
  if (statWeekEl) statWeekEl.textContent = rec.dates.filter(d => {
    const dt = new Date(d);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return dt >= weekStart;
  }).length || '—';
  
  const statTotalEl = document.getElementById('statTotal');
  if (statTotalEl) statTotalEl.textContent = rec.total || '—';

  const plan = TRAINING_PLANS[currentPlan];
  const planLevelData = plan ? plan.levels[currentPlanLevel] : null;
  let totalDuration = 0;
  if (planLevelData) {
    Object.keys(planLevelData).forEach(k => {
      if (planLevelData[k] && planLevelData[k].duration) {
        totalDuration += planLevelData[k].duration;
      }
    });
  }

  const levelName = currentPlanLevel === 'beginner' ? '初级' : currentPlanLevel === 'intermediate' ? '中级' : '高级';

  if (document.getElementById('dashStartIcon')) {
    document.getElementById('dashStartIcon').textContent = plan ? plan.icon : '🏋️';
  }
  if (document.getElementById('dashStartTitle')) {
    document.getElementById('dashStartTitle').textContent = '今日推荐：' + (plan ? plan.name : '完整训练');
  }
  if (document.getElementById('dashStartSub')) {
    document.getElementById('dashStartSub').textContent = levelName + ' · ' + totalDuration + '分钟';
  }

  let hintText = '专注呼吸，跟随节奏，享受训练';
  const streak = rec.streak || 0;
  if (streak >= 7) {
    hintText = '连续' + streak + '天打卡！保持这份坚持，继续挑战';
  } else if (streak >= 3) {
    hintText = '连续' + streak + '天打卡，状态不错，继续保持';
  } else if (streak === 0) {
    hintText = '今天是新的开始，迈出第一步吧';
  }
  if (document.getElementById('dashStartHint')) {
    document.getElementById('dashStartHint').textContent = hintText;
  }

  const dotsEl = document.getElementById('weekDots');
  dotsEl.innerHTML = '';
  const today = now.getDay();
  const dayOfWeek = today === 0 ? 6 : today - 1;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - dayOfWeek + i);
    const ds = d.toISOString().split('T')[0];
    const isToday = ds === now.toISOString().split('T')[0];
    const done = rec.dates.includes(ds);
    const dot = document.createElement('div');
    dot.className = 'week-dot' + (done ? ' done' : '') + (isToday ? ' today' : '');
    dot.textContent = WEEK_DAYS[d.getDay()];
    dotsEl.appendChild(dot);
  }
}
