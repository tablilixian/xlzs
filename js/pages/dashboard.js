function refreshDashboard() {
  const greetingEl = document.getElementById('greetingText');
  if (!greetingEl) return;
  
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 6 ? '夜深了' : h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好';
  greetingEl.textContent = greeting;
  
  const rec = Storage.getRecords();
  const emptyState = document.getElementById('dashboardEmptyState');
  if (emptyState) {
    emptyState.style.display = rec.total > 0 ? 'none' : '';
  }
  const resumeCard = document.getElementById('resumeCard');
  if (resumeCard) {
    resumeCard.style.display = trainingState.isPaused ? '' : 'none';
  }
  
  const dayNameEl = document.getElementById('dayName');
  if (dayNameEl) dayNameEl.textContent = '周' + WEEK_DAYS[now.getDay()];

  const mode = WEEK_MODES[getWeekModeIndex(now)];
  const modeNameEl = document.getElementById('modeName');
  if (modeNameEl) {
    const rewardBadge = mode.isRewardDay ? '<span style="display:inline-flex;align-items:center;gap:2px;margin-left:8px;padding:2px 6px;background:rgba(230,168,23,0.15);border-radius:10px;font-size:10px;color:var(--accent);font-weight:600">🎁 奖励日</span>' : '';
    modeNameEl.innerHTML = (mode.icon || '') + ' ' + mode.name + ' - ' + mode.desc + rewardBadge;
  }

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

  const modeIdx = getWeekModeIndex(now);
  const modePlan = WEEK_MODE_PLANS[modeIdx];
  let recommendPlan = TRAINING_PLANS[currentPlan];
  let recommendLevel = currentPlanLevel;
  if (modePlan && modePlan.plan && TRAINING_PLANS[modePlan.plan]) {
    recommendPlan = TRAINING_PLANS[modePlan.plan];
    recommendLevel = modePlan.level;
  }
  const planLevelData = recommendPlan ? recommendPlan.levels[recommendLevel] : null;
  let totalDuration = 0;
  if (planLevelData) {
    Object.keys(planLevelData).forEach(k => {
      if (planLevelData[k] && planLevelData[k].duration) {
        totalDuration += planLevelData[k].duration;
      }
    });
  }

  const levelName = recommendLevel === 'beginner' ? '初级' : recommendLevel === 'intermediate' ? '中级' : '高级';

  if (document.getElementById('dashStartIcon')) {
    document.getElementById('dashStartIcon').textContent = recommendPlan ? recommendPlan.icon : '🏋️';
  }
  if (document.getElementById('dashStartTitle')) {
    document.getElementById('dashStartTitle').textContent = '今日推荐：' + (recommendPlan ? recommendPlan.name : '完整训练');
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
  const dayOfWeek = getWeekModeIndex(now);
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - dayOfWeek + i);
    const ds = getLocalDateString(d);
    const isToday = ds === getLocalDateString(now);
    const done = rec.dates.includes(ds);
    const dot = document.createElement('div');
    dot.className = 'week-dot' + (done ? ' done' : '') + (isToday ? ' today' : '');
    dot.textContent = WEEK_DAYS[d.getDay()];
    dotsEl.appendChild(dot);
  }
}
