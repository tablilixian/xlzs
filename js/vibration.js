function vibrate(pattern) {
  if (!navigator.vibrate) return;
  const s = loadSettings();
  const intensity = s.vibIntensity || 2;
  const factors = { 1: 0.5, 2: 1, 3: 1.5 };
  const factor = factors[intensity] || 1;
  navigator.vibrate(Math.round(pattern * factor));
}

function vibrateOff() {
  if (navigator.vibrate) navigator.vibrate(0);
}
