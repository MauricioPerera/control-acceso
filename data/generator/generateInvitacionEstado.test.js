const test = require('node:test');
const assert = require('node:assert/strict');
const { generateInvitacionEstado } = require('./generateInvitacionEstado.js');

function fakeRng(sequence) {
  let i = 0;
  return () => {
    if (i >= sequence.length) throw new Error('fakeRng: se acabo la secuencia');
    return sequence[i++];
  };
}

const DOMAINS = {
  categoriaAcceso: ['general', 'vip', 'staff', 'prensa'],
  fechaVigencia: ['2026-06-01', '2026-07-01', '2026-08-01'],
};

test('categoriaAcceso y fechaVigencia se eligen por indice, en ese orden', () => {
  const rng = fakeRng([0.5, 0.0]);
  const result = generateInvitacionEstado(DOMAINS, rng);
  assert.deepStrictEqual(result, { categoriaAcceso: 'staff', fechaVigencia: '2026-06-01' });
});

test('r=0 exacto selecciona el primer elemento de cada dominio', () => {
  const rng = fakeRng([0.0, 0.0]);
  const result = generateInvitacionEstado(DOMAINS, rng);
  assert.deepStrictEqual(result, { categoriaAcceso: 'general', fechaVigencia: '2026-06-01' });
});

test('fechaVigencia con r cercano a 1 selecciona el ultimo elemento del dominio', () => {
  const rng = fakeRng([0.0, 0.999999]);
  const result = generateInvitacionEstado(DOMAINS, rng);
  assert.strictEqual(result.fechaVigencia, '2026-08-01');
});

test('consume exactamente 2 llamadas a rng (categoriaAcceso, luego fechaVigencia)', () => {
  const rng = fakeRng([0.1, 0.9]);
  assert.doesNotThrow(() => generateInvitacionEstado(DOMAINS, rng));
});

test('retorna exactamente 2 keys, sin ninguna extra', () => {
  const rng = fakeRng([0.0, 0.0]);
  const result = generateInvitacionEstado(DOMAINS, rng);
  assert.deepStrictEqual(Object.keys(result).sort(), ['categoriaAcceso', 'fechaVigencia']);
});
