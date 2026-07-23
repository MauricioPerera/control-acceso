function generateInvitacionEstado(config, domains, rng) {
  const categoriaAcceso = domains.categoriaAcceso[Math.floor(rng() * domains.categoriaAcceso.length)];
  const fechaVigencia = domains.fechaVigencia[Math.floor(rng() * domains.fechaVigencia.length)];
  const selloValido = rng() < config.selloProbability;
  const qrValido = rng() < config.qrProbability;
  return { categoriaAcceso, fechaVigencia, selloValido, qrValido };
}

if (typeof module !== 'undefined') {
  module.exports = { generateInvitacionEstado };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.generateInvitacionEstado = generateInvitacionEstado;
}
