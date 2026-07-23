function createSeededRng(seed) {
  let state = (seed >>> 0);

  return function next() {
    state |= 0;
    let t = (state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

if (typeof module !== 'undefined') {
  module.exports = { createSeededRng };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.createSeededRng = createSeededRng;
}
