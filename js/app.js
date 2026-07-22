// ==================== Toast ====================
const toastQueue = [];
let toastTimer = null;
let isToastShowing = false;
function showToast(msg) {
  toastQueue.push(msg);
  processToastQueue();
}
function processToastQueue() {
  if (isToastShowing || toastQueue.length === 0) return;
  isToastShowing = true;
  const msg = toastQueue.shift();
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
    isToastShowing = false;
    processToastQueue();
  }, 2000);
}

// ==================== Router ====================
let currentPage = 'dashboard';

function navigateTo(page) {
  if (trainingState.isRunning && page !== 'training') {
    showToast('训练进行中，请先暂停或结束');
    return;
  }

  if (currentPage === 'training' && page !== 'training') {
    stopArousalMetronome();
    stopStoryPlayer();
  }

  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
  const nav = document.getElementById('bottomNav');
  if (page === 'training' && trainingState.isRunning) {
    nav.style.display = 'none';
  } else {
    nav.style.display = '';
  }
  if (page === 'settings') { populateSettings(); }
  if (page === 'training') initTraining();
  if (page === 'dashboard') refreshDashboard();
  if (page === 'analysis') refreshAnalysis();
}

function exportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('pt_')) data[key] = JSON.parse(localStorage.getItem(key));
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'xlzs-data-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('数据已导出');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!confirm('导入将覆盖当前所有训练数据，确定继续吗？')) { e.target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      Object.keys(data).forEach(key => {
        if (key.startsWith('pt_')) localStorage.setItem(key, JSON.stringify(data[key]));
      });
      showToast('数据已导入');
      refreshDashboard();
      populateSettings();
    } catch (err) { showToast('导入失败：文件格式错误'); }
    e.target.value = '';
  };
  reader.readAsText(file);
}

function resetAllData() {
  if (confirm('确定要重置所有训练数据吗？此操作不可撤销。')) {
    Storage.resetRecords();
    localStorage.removeItem('pt_emergencyStops');
    localStorage.removeItem('pt_failures');
    localStorage.removeItem('pt_settings');
    localStorage.removeItem('pt_prepTimes');
    showToast('所有数据已重置');
    refreshDashboard();
    populateSettings();
  }
}

// ==================== Wake Lock Toggle ====================
function toggleVibration() {
  trainingState.vibrationEnabled = !trainingState.vibrationEnabled;
  document.getElementById('vibBtnText').textContent = trainingState.vibrationEnabled ? '关闭震动' : '震动模式';
  if (!trainingState.vibrationEnabled) vibrateOff();
  showToast(trainingState.vibrationEnabled ? '震动已开启' : '震动已关闭');
}

// ==================== Service Worker ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated' && !navigator.serviceWorker.controller) {
            showToast('应用已更新，请刷新页面');
          }
        });
      });
    }).catch(() => {});
  });

  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'SW_UPDATE') {
      showToast('应用已更新，请刷新页面');
    }
  });
}

// ==================== Init ====================
document.addEventListener('DOMContentLoaded', () => {
  refreshDashboard();
  populateSettings();
  
  const bottomNav = document.getElementById('bottomNav');
  if (bottomNav) {
    bottomNav.addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item');
      if (navItem && navItem.dataset.page) {
        e.preventDefault();
        e.stopPropagation();
        navigateTo(navItem.dataset.page);
      }
    });
  }
});
