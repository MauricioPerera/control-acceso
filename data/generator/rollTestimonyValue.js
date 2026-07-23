function rollTestimonyValue(trueValue, confidence, domain, rng) {
  const r1 = rng();
  if (r1 < confidence) {
    return trueValue;
  }
  const r2 = rng();
  const alternatives = domain.filter(v => v !== trueValue);
  return alternatives[Math.floor(r2 * alternatives.length)];
}

if (typeof module !== 'undefined') {
  module.exports = { rollTestimonyValue };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.rollTestimonyValue = rollTestimonyValue;
}
