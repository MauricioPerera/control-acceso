function generateInvitacionIdentidad(dni, matchProbability, domains, rng) {
  const rollTestimonyValueFn = (typeof module !== 'undefined')
    ? require('./rollTestimonyValue.js').rollTestimonyValue
    : window.Engine.rollTestimonyValue;

  const nombre = rollTestimonyValueFn(dni.nombre, matchProbability, domains.nombre, rng);
  const apellido = rollTestimonyValueFn(dni.apellido, matchProbability, domains.apellido, rng);
  const codigoBarras = rollTestimonyValueFn(dni.numeroDni, matchProbability, domains.numeroDni, rng);

  return { nombre, apellido, codigoBarras };
}

if (typeof module !== 'undefined') {
  module.exports = { generateInvitacionIdentidad };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.generateInvitacionIdentidad = generateInvitacionIdentidad;
}
