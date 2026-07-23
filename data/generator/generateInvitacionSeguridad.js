function generateInvitacionSeguridad(referencias, matchProbability, domains, rng) {
  const rollTestimonyValueFn = (typeof module !== 'undefined')
    ? require('./rollTestimonyValue.js').rollTestimonyValue
    : window.Engine.rollTestimonyValue;
  const codigoSello = rollTestimonyValueFn(referencias.sello, matchProbability, domains.codigoSello, rng);
  const codigoQR = rollTestimonyValueFn(referencias.qr, matchProbability, domains.codigoQR, rng);
  return { codigoSello, codigoQR };
}

if (typeof module !== 'undefined') {
  module.exports = { generateInvitacionSeguridad };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.generateInvitacionSeguridad = generateInvitacionSeguridad;
}
