function refreshAnalysis() {
  const records = Storage.getRecords();
  const failures = Storage.getFailureRecords();
  const emergencyStops = Storage.getEmergencyStopRecords();
  const prepRecords = Storage.getPrepRecords();

  document.getElementById('analTotal').textContent = records.total || 0;
  document.getElementById('analStreak').textContent = records.streak || 0;
  document.getElementById('analFailures').textContent = failures.length || 0;

  const now = new Date();
  const thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const monthCount = (records.dates || []).filter(d => d.startsWith(thisMonth)).length;
  document.getElementById('analThisMonth').textContent = monthCount;

  // Heatmap
  const heatmap = document.getElementById('analHeatmap');
  heatmap.innerHTML = '';
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const day = document.createElement('div');
    day.className = 'analysis-heatmap-day';
    if ((records.dates || []).includes(ds)) day.classList.add('done');
    if (failures.some(f => f.date && f.date.startsWith(ds))) day.classList.add('fail');
    if (i === 0) day.classList.add('today');
    day.title = ds;
    heatmap.appendChild(day);
  }

  // Week chart
  const weekChart = document.getElementById('analWeekChart');
  weekChart.innerHTML = '';
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekData = [];
  const d = new Date(now);
  const dayOfWeek = d.getDay();
  d.setDate(d.getDate() - dayOfWeek);
  for (let i = 0; i < 7; i++) {
    const wd = new Date(d);
    wd.setDate(d.getDate() + i);
    const wds = wd.toISOString().split('T')[0];
    const count = (records.dates || []).filter(r => r === wds).length;
    weekData.push({ day: weekDays[i], count });
  }
  const maxCount = Math.max(1, ...weekData.map(w => w.count));
  weekData.forEach(w => {
    const bar = document.createElement('div');
    bar.className = 'analysis-week-bar';
    const pct = (w.count / maxCount) * 100;
    bar.style.height = Math.max(4, pct) + '%';
    if (w.count === 0) bar.style.background = 'var(--bg3)';
    bar.innerHTML = '<span class="analysis-week-bar-val">' + w.count + '</span><span class="analysis-week-bar-label">' + w.day + '</span>';
    weekChart.appendChild(bar);
  });

  // Failure list
  const failureList = document.getElementById('analFailureList');
  failureList.innerHTML = '';
  if (failures.length === 0) {
    failureList.innerHTML = '<div class="analysis-empty">暂无失败记录</div>';
  } else {
    [...failures].reverse().slice(0, 20).forEach(f => {
      const item = document.createElement('div');
      item.className = 'analysis-failure-item';
      const dateStr = f.date ? f.date.split('T')[0] : '未知';
      item.innerHTML = '<span class="analysis-failure-date">' + dateStr + '</span><span class="analysis-failure-reason">' + (f.reasonLabel || '未知') + '</span>';
      failureList.appendChild(item);
    });
  }

  // Record list
  const recordList = document.getElementById('analRecordList');
  recordList.innerHTML = '';
  if (!records.dates || records.dates.length === 0) {
    recordList.innerHTML = '<div class="analysis-empty">暂无训练记录</div>';
  } else {
    [...records.dates].reverse().slice(0, 30).forEach(d => {
      const item = document.createElement('div');
      item.className = 'analysis-record-item';
      const hasFailure = failures.some(f => f.date && f.date.startsWith(d));
      const dayPrep = prepRecords.filter(p => p.date && p.date.startsWith(d));
      let prepStr = '';
      if (dayPrep.length > 0) {
        const avgPrep = Math.round(dayPrep.reduce((a, b) => a + b.seconds, 0) / dayPrep.length);
        prepStr = ' · 唤醒' + avgPrep + 's';
      }
      item.innerHTML = '<span class="analysis-record-date">' + d + '</span><span class="analysis-record-status ' + (hasFailure ? 'fail' : 'success') + '">' + (hasFailure ? '失败' : '完成') + prepStr + '</span>';
      recordList.appendChild(item);
    });
  }
}
