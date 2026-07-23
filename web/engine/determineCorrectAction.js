function determineCorrectAction(reglas, attendee) {
  const evaluateRuleFn = (typeof module !== 'undefined')
    ? require('./evaluateRule.js').evaluateRule
    : window.Engine.evaluateRule;

  const violated = reglas.filter(regla => !evaluateRuleFn(regla, attendee));
  if (violated.some(r => r.accionSiViola === 'detener')) return 'detener';
  if (violated.some(r => r.accionSiViola === 'rechazar')) return 'rechazar';
  return 'aprobar';
}

if (typeof module !== 'undefined') {
  module.exports = { determineCorrectAction };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.determineCorrectAction = determineCorrectAction;
}
