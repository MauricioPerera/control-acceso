function generateInvitacion(dni, config, domains, rng) {
  const rollTestimonyValueFn = (typeof module !== 'undefined')
    ? require('./rollTestimonyValue.js').rollTestimonyValue
    : window.Engine.rollTestimonyValue;

  const nombre = rollTestimonyValueFn(dni.nombre, config.matchProbability, domains.nombre, rng);
  const apellido = rollTestimonyValueFn(dni.apellido, config.matchProbability, domains.apellido, rng);
  const r = rng();
  const categoriaAcceso = domains.categoriaAcceso[Math.floor(r * domains.categoriaAcceso.length)];
  const vigente = rng() < config.vigenciaProbability;
  return { nombre, apellido, categoriaAcceso, vigente };
}

if (typeof module !== 'undefined') {
  module.exports = { generateInvitacion };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.generateInvitacion = generateInvitacion;
}
