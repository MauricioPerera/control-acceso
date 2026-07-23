function interpretSwipe(deltaX, deltaY, threshold) {
  if (deltaX > threshold) return 'aprobar';
  if (deltaX < -threshold) return 'rechazar';
  return null;
}

if (typeof module !== 'undefined') {
  module.exports = { interpretSwipe };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.interpretSwipe = interpretSwipe;
}
