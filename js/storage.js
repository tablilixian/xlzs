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
    return this.get('records', { dates: [], total: 0, streak: 0 });
  },
  addRecord() {
    const r = this.getRecords();
    const today = new Date().toISOString().split('T')[0];
    if (r.dates.includes(today)) return;
    r.dates.push(today);
    r.total++;
    let streak = 0;
    const d = new Date();
    while (true) {
      const ds = d.toISOString().split('T')[0];
      if (r.dates.includes(ds)) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    r.streak = streak;
    this.set('records', r);
  },
  resetRecords() {
    this.set('records', { dates: [], total: 0, streak: 0 });
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
  }
};
