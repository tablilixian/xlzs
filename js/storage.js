function getLocalDateString(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

const Storage = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('pt_' + key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('pt_' + key, JSON.stringify(val)); } catch {}
  },
  getRecords() {
    return this.get('records', { dates: [], total: 0, streak: 0, detailed: [] });
  },
  addRecord(planId, level, lastPhase, totalDuration, status) {
    const r = this.getRecords();
    const now = new Date();
    const today = getLocalDateString(now);
    
    const plan = TRAINING_PLANS[planId];
    const planName = plan ? plan.name : '未知计划';
    const levelName = level === 'beginner' ? '初级' : level === 'intermediate' ? '中级' : '高级';
    
    r.detailed.push({
      date: now.toISOString(),
      plan: planId,
      planName,
      level,
      levelName,
      lastPhase,
      totalDuration,
      timestamp: now.getTime(),
      status: status || 'completed'
    });
    
    if (!r.dates.includes(today)) {
      r.dates.push(today);
      r.total++;
      let streak = 0;
      const d = new Date();
      while (true) {
        const ds = getLocalDateString(d);
        if (r.dates.includes(ds)) { streak++; d.setDate(d.getDate() - 1); }
        else break;
      }
      r.streak = streak;
    }
    this.set('records', r);
  },
  resetRecords() {
    this.set('records', { dates: [], total: 0, streak: 0, detailed: [] });
  },
  getEmergencyStopRecords() {
    return this.get('emergencyStops', []);
  },
  addEmergencyStopRecord(rec) {
    const list = this.getEmergencyStopRecords();
    list.push(rec);
    this.set('emergencyStops', list);
  },
  getFailureRecords() {
    return this.get('failures', []);
  },
  addFailureRecord(rec) {
    const list = this.getFailureRecords();
    list.push(rec);
    this.set('failures', list);
  },
  getPrepRecords() {
    return this.get('prepTimes', []);
  },
  addPrepRecord(sec) {
    const list = this.getPrepRecords();
    list.push({ date: new Date().toISOString(), seconds: sec });
    this.set('prepTimes', list);
  },
  getRewardDayRecords() {
    return this.get('rewardDays', []);
  },
  addRewardDayRecord() {
    const list = this.getRewardDayRecords();
    const now = new Date();
    const today = getLocalDateString(now);
    if (list.some(r => r.date === today)) return;
    list.push({
      date: today,
      timestamp: now.getTime()
    });
    this.set('rewardDays', list);
  },
  isRewardDayToday() {
    const now = new Date();
    const today = getLocalDateString(now);
    const list = this.getRewardDayRecords();
    return list.some(r => r.date === today);
  }
};
