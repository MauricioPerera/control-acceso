function matchesBarcode(dni, invitacion) {
  return dni.numeroDni === invitacion.codigoBarras;
}

if (typeof module !== 'undefined') {
  module.exports = { matchesBarcode };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.matchesBarcode = matchesBarcode;
}
