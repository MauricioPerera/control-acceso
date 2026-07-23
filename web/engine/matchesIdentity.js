function matchesIdentity(dni, invitacion) {
  return dni.nombre === invitacion.nombre && dni.apellido === invitacion.apellido;
}

if (typeof module !== 'undefined') {
  module.exports = { matchesIdentity };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.matchesIdentity = matchesIdentity;
}
