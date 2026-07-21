function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function vibrateOff() {
  if (navigator.vibrate) navigator.vibrate(0);
}
