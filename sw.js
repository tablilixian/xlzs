const CACHE_NAME = 'pillow-trainer-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/storage.js',
  './js/plans.js',
  './js/vibration.js',
  './js/audio.js',
  './js/speech.js',
  './js/settings.js',
  './js/training.js',
  './js/ui.js',
  './js/arousal.js',
  './js/pages/dashboard.js',
  './js/pages/training.js',
  './js/pages/knowledge.js',
  './js/pages/analysis.js',
  './js/app.js',
  './sounds/beep_01.ogg',
  './sounds/beep_02.ogg',
  './sounds/beep_03.ogg',
  './sounds/retro_beep_01.ogg',
  './sounds/retro_beep_02.ogg',
  './sounds/retro_beep_03.ogg',
  './sounds/bell_01.ogg',
  './sounds/bell_02.ogg',
  './sounds/bell_03.ogg',
];

const VOICE_FILES = [
  './sounds/voices/coachOpen.mp3',
  './sounds/voices/testVoice.mp3',
  './sounds/voices/pause.mp3',
  './sounds/voices/complete.mp3',
  './sounds/voices/start.mp3',
  './sounds/voices/emergency.mp3',
  './sounds/voices/restart.mp3',
  './sounds/voices/phaseChange1.mp3',
  './sounds/voices/phaseChange2.mp3',
  './sounds/voices/phaseChange3.mp3',
  './sounds/voices/phase1_push.mp3',
  './sounds/voices/phase1_push2.mp3',
  './sounds/voices/phase1_stop.mp3',
  './sounds/voices/phase1_pull.mp3',
  './sounds/voices/phase1_pull2.mp3',
  './sounds/voices/phase1_entry.mp3',
  './sounds/voices/phase2_sprint.mp3',
  './sounds/voices/phase2_rest.mp3',
  './sounds/voices/phase3_push.mp3',
  './sounds/voices/phase3_hold.mp3',
  './sounds/voices/phase3_pull.mp3',
  './sounds/voices/breath_inhale.mp3',
  './sounds/voices/breath_hold.mp3',
  './sounds/voices/breath_exhale.mp3',
  './sounds/voices/arousal_guide.mp3',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS.concat(VOICE_FILES));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  ).then(() => {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'SW_UPDATE' });
      });
    });
  });
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((response) => {
        if (response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});