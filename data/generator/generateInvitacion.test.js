const test = require('node:test');
const assert = require('node:assert/strict');
const { generateInvitacion } = require('./generateInvitacion.js');

function fakeRng(sequence) {
  let i = 0;
  return () => {
    if (i >= sequence.length) throw new Error('fakeRng: se acabo la secuencia');
    return sequence[i++];
  };
}

const DOMAINS = {
  nombre: ['Ana', 'Beto'],
  apellido: ['Gomez', 'Diaz'],
  categoriaAcceso: ['general', 'vip', 'staff', 'prensa'],
};

test('matchProbability=1 -> nombre y apellido coinciden con el dni, 1 llamada cada uno', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez' };
  const config = { matchProbability: 1, vigenciaProbability: 0.8 };
  const rng = fakeRng([0.0, 0.0, 0.5, 0.9]);
  const result = generateInvitacion(dni, config, DOMAINS, rng);
  assert.deepStrictEqual(result, { nombre: 'Ana', apellido: 'Gomez', categoriaAcceso: 'staff', vigente: false });
});

test('matchProbability=0 -> nombre y apellido siempre distintos del dni', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez' };
  const config = { matchProbability: 0, vigenciaProbability: 0.8 };
  const rng = fakeRng([0.5, 0.0, 0.5, 0.0, 0.25, 0.9]);
  const result = generateInvitacion(dni, config, DOMAINS, rng);
  assert.deepStrictEqual(result, { nombre: 'Beto', apellido: 'Diaz', categoriaAcceso: 'vip', vigente: false });
});

test('vigente=true cuando el roll de vigencia queda por debajo de vigenciaProbability', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez' };
  const config = { matchProbability: 1, vigenciaProbability: 0.8 };
  const rng = fakeRng([0.0, 0.0, 0.0, 0.1]);
  const result = generateInvitacion(dni, config, DOMAINS, rng);
  assert.strictEqual(result.vigente, true);
});

test('categoriaAcceso r=0 exacto selecciona el primer elemento del dominio', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez' };
  const config = { matchProbability: 1, vigenciaProbability: 0.8 };
  const rng = fakeRng([0.0, 0.0, 0.0, 0.9]);
  const result = generateInvitacion(dni, config, DOMAINS, rng);
  assert.strictEqual(result.categoriaAcceso, 'general');
});

test('categoriaAcceso r cercano a 1 selecciona el ultimo elemento del dominio', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez' };
  const config = { matchProbability: 1, vigenciaProbability: 0.8 };
  const rng = fakeRng([0.0, 0.0, 0.999999, 0.9]);
  const result = generateInvitacion(dni, config, DOMAINS, rng);
  assert.strictEqual(result.categoriaAcceso, 'prensa');
});
