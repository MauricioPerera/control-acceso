function mutateProfile(base, mutationRate, domains, rng) {
  const result = {};

  for (const key of Object.keys(base)) {
    if (key in domains) {
      const r1 = rng();
      if (r1 < mutationRate) {
        const r2 = rng();
        const index = Math.floor(r2 * domains[key].length);
        result[key] = domains[key][index];
      } else {
        result[key] = base[key];
      }
    } else {
      result[key] = base[key];
    }
  }

  return result;
}

if (typeof module !== 'undefined') {
  module.exports = { mutateProfile };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.mutateProfile = mutateProfile;
}
