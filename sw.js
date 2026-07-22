const CACHE_VERSION = 'v9';
const CACHE_STATIC = 'pillow-trainer-static-' + CACHE_VERSION;
const CACHE_AUDIO = 'pillow-trainer-audio-' + CACHE_VERSION;

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/storage.js',
  './js/plans.js',
  './js/vibration.js',
  './js/audio.js',
  './js/speech.js',
  './js/storyplayer.js',
  './js/settings.js',
  './js/training.js',
  './js/ui.js',
  './js/arousal.js',
  './js/pages/dashboard.js',
  './js/pages/training.js',
  './js/pages/knowledge.js',
  './js/pages/analysis.js',
  './js/app.js',
];

const AUDIO_ASSETS = [
  './sounds/beep_01.ogg',
  './sounds/beep_02.ogg',
  './sounds/beep_03.ogg',
  './sounds/retro_beep_01.ogg',
  './sounds/retro_beep_02.ogg',
  './sounds/retro_beep_03.ogg',
  './sounds/bell_01.ogg',
  './sounds/bell_02.ogg',
  './sounds/bell_03.ogg',
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
  './sounds/voices/arousal_stories/story_v3_01.mp3',
  './sounds/voices/arousal_stories/story_v3_02.mp3',
  './sounds/voices/arousal_stories/story_v3_03.mp3',
  './sounds/voices/arousal_stories/story_v3_04.mp3',
  './sounds/voices/arousal_stories/story_v4_01.mp3',
  './sounds/voices/arousal_stories/story_v4_02.mp3',
  './sounds/voices/arousal_stories/story_v4_03.mp3',
  './sounds/voices/arousal_stories/story_v4_04.mp3',
  './sounds/voices/arousal_stories/story_v5_01.mp3',
  './sounds/voices/arousal_stories/story_v5_02.mp3',
  './sounds/voices/arousal_stories/story_v5_03.mp3',
  './sounds/voices/arousal_stories/story_v5_04.mp3',
  './sounds/voices/arousal_stories/story_v6_01.mp3',
  './sounds/voices/arousal_stories/story_v6_02.mp3',
  './sounds/voices/arousal_stories/story_v6_03.mp3',
  './sounds/voices/arousal_stories/story_v6_04.mp3',
  './sounds/voices/arousal_stories/story_v7_01.mp3',
  './sounds/voices/arousal_stories/story_v7_02.mp3',
  './sounds/voices/arousal_stories/story_v7_03.mp3',
  './sounds/voices/arousal_stories/story_v7_04.mp3',
  './sounds/voices/arousal_stories/story_v8_01.mp3',
  './sounds/voices/arousal_stories/story_v8_02.mp3',
  './sounds/voices/arousal_stories/story_v8_03.mp3',
  './sounds/voices/arousal_stories/story_v8_04.mp3',
  './sounds/voices/arousal_stories/story_v8_05.mp3',
  './sounds/voices/arousal_stories/story_v8_06.mp3',
  './sounds/voices/arousal_stories/story_v8_07.mp3',
  './sounds/voices/arousal_stories/story_v8_08.mp3',
  './sounds/voices/arousal_stories/story_v8_09.mp3',
  './sounds/voices/arousal_stories/story_v9_01.mp3',
  './sounds/voices/arousal_stories/story_v9_02.mp3',
  './sounds/voices/arousal_stories/story_v9_03.mp3',
  './sounds/voices/arousal_stories/story_v9_04.mp3',
  './sounds/voices/arousal_stories/story_v10_01.mp3',
  './sounds/voices/arousal_stories/story_v10_02.mp3',
  './sounds/voices/arousal_stories/story_v10_03.mp3',
  './sounds/voices/arousal_stories/story_v10_04.mp3',
  './sounds/voices/arousal_stories/story_v11_01.mp3',
  './sounds/voices/arousal_stories/story_v11_02.mp3',
  './sounds/voices/arousal_stories/story_v11_03.mp3',
  './sounds/voices/arousal_stories/story_v11_04.mp3',
  './sounds/voices/arousal_stories/story_v11_05.mp3',
  './sounds/voices/arousal_stories/story_v11_06.mp3',
  './sounds/voices/arousal_stories/story_v12_01.mp3',
  './sounds/voices/arousal_stories/story_v12_02.mp3',
  './sounds/voices/arousal_stories/story_v12_03.mp3',
  './sounds/voices/arousal_stories/story_v12_04.mp3',
  './sounds/voices/arousal_stories/story_v12_05.mp3',
  './sounds/voices/arousal_stories/story_v13_01.mp3',
  './sounds/voices/arousal_stories/story_v13_02.mp3',
  './sounds/voices/arousal_stories/story_v13_03.mp3',
  './sounds/voices/arousal_stories/story_v13_04.mp3',
  './sounds/voices/arousal_stories/story_v13_05.mp3',
  './sounds/voices/arousal_stories/story_v13_06.mp3',
  './sounds/voices/arousal_stories/story_v13_07.mp3',
  './sounds/voices/arousal_stories/story_v14_01.mp3',
  './sounds/voices/arousal_stories/story_v14_02.mp3',
  './sounds/voices/arousal_stories/story_v14_03.mp3',
  './sounds/voices/arousal_stories/story_v14_04.mp3',
  './sounds/voices/arousal_stories/story_v14_05.mp3',
  './sounds/voices/arousal_stories/story_v15_01.mp3',
  './sounds/voices/arousal_stories/story_v15_02.mp3',
  './sounds/voices/arousal_stories/story_v15_03.mp3',
  './sounds/voices/arousal_stories/story_v15_04.mp3',
  './sounds/voices/arousal_stories/story_v15_05.mp3',
  './sounds/voices/arousal_stories/story_v16_01.mp3',
  './sounds/voices/arousal_stories/story_v16_02.mp3',
  './sounds/voices/arousal_stories/story_v16_03.mp3',
  './sounds/voices/arousal_stories/story_v16_04.mp3',
  './sounds/voices/arousal_stories/story_v16_05.mp3',
];

function isAudioRequest(url) {
  return url.includes('/sounds/');
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    Promise.all([
      caches.open(CACHE_STATIC).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(CACHE_AUDIO).then((cache) => cache.addAll(AUDIO_ASSETS)),
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_STATIC && k !== CACHE_AUDIO).map((k) => caches.delete(k))
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
  if (isAudioRequest(e.request.url)) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        return cached || fetch(e.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_AUDIO).then((cache) => cache.put(e.request, clone));
          }
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const fetchPromise = fetch(e.request).then((response) => {
          if (response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_STATIC).then((cache) => cache.put(e.request, clone));
          }
          return response;
        }).catch(() => {
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
        return cached || fetchPromise;
      })
    );
  }
});