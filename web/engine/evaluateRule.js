const matchesFilter = (typeof module !== 'undefined')
  ? require('./matchesFilter.js').matchesFilter
  : window.Engine.matchesFilter;
const matchesIdentity = (typeof module !== 'undefined')
  ? require('./matchesIdentity.js').matchesIdentity
  : window.Engine.matchesIdentity;

function evaluateRule(regla, attendee) {
  if (regla.tipo === 'documento') {
    const doc = attendee[regla.fuente];
    const matches = matchesFilter(doc, regla.filtro);
    return matches === regla.esperado;
  }
  if (regla.tipo === 'identidad') {
    return matchesIdentity(attendee.dni, attendee.invitacion);
  }
  throw new Error('Unknown rule type');
}

if (typeof module !== 'undefined') {
  module.exports = { evaluateRule };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.evaluateRule = evaluateRule;
}
