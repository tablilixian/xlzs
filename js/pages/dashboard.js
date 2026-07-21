function refreshDashboard() {
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 6 ? '夜深了' : h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好';
  document.getElementById('greetingText').textContent = greeting;
  document.getElementById('dayName').textContent = '周' + WEEK_DAYS[now.getDay()];

  const mode = WEEK_MODES[now.getDay() === 0 ? 6 : now.getDay() - 1];
  document.getElementById('modeName').innerHTML = mode.name + ' - ' + mode.desc;

  const rec = Storage.getRecords();
  document.getElementById('statStreak').textContent = rec.streak || '—';
  document.getElementById('statWeek').textContent = rec.dates.filter(d => {
    const dt = new Date(d);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return dt >= weekStart;
  }).length || '—';
  document.getElementById('statTotal').textContent = rec.total || '—';

  const s = loadSettings();
  const preset = DIFFICULTY_PRESETS[s.level];
  if (preset) document.getElementById('dashLevelBadge').textContent = preset.name;

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
