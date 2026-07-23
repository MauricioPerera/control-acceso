function evaluateRule(regla, attendee) {
  const matchesFilterFn = (typeof module !== 'undefined')
    ? require('./matchesFilter.js').matchesFilter
    : window.Engine.matchesFilter;
  const matchesIdentityFn = (typeof module !== 'undefined')
    ? require('./matchesIdentity.js').matchesIdentity
    : window.Engine.matchesIdentity;

  if (regla.tipo === 'documento') {
    const doc = attendee[regla.fuente];
    const matches = matchesFilterFn(doc, regla.filtro);
    return matches === regla.esperado;
  }
  if (regla.tipo === 'identidad') {
    return matchesIdentityFn(attendee.dni, attendee.invitacion);
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
