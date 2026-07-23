function generateInvitacionEstado(domains, rng) {
  const categoriaAcceso = domains.categoriaAcceso[Math.floor(rng() * domains.categoriaAcceso.length)];
  const fechaVigencia = domains.fechaVigencia[Math.floor(rng() * domains.fechaVigencia.length)];
  return { categoriaAcceso, fechaVigencia };
}

if (typeof module !== 'undefined') {
  module.exports = { generateInvitacionEstado };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.generateInvitacionEstado = generateInvitacionEstado;
}
