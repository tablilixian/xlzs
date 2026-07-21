// ==================== Toast ====================
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

// ==================== Router ====================
let currentPage = 'dashboard';

function navigateTo(page) {
  if (trainingState.isRunning && page !== 'training') {
    showToast('训练进行中，请先暂停或结束');
    return;
  }

  if (currentPage === 'training' && page !== 'training') {
    stopBreathingCycle();
    stopArousalVoice();
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
  if (page === 'settings') { populateSettings(); updateVoiceStatus(); }
  if (page === 'training') initTraining();
  if (page === 'dashboard') refreshDashboard();
  if (page === 'analysis') refreshAnalysis();
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
