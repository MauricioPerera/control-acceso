const test = require('node:test');
const assert = require('node:assert/strict');
const { mutateProfile } = require('./mutate.js');

// Oráculo independiente: rng falso que devuelve una secuencia fija predefinida en cada test,
// sin importar nada del target.
function fakeRng(sequence) {
  let i = 0;
  return () => {
    if (i >= sequence.length) throw new Error('fakeRng: se acabó la secuencia');
    return sequence[i++];
  };
}

test('mutationRate=0 nunca reemplaza: la decisión (r1=0.5) siempre falla contra un rate de 0', () => {
  const base = { color: 'red', size: 3 };
  const domains = { color: ['red', 'green', 'blue'], size: [1, 2, 3, 4] };
  const rng = fakeRng([0.5, 0.5]); // r1 por cada key; 0.5 < 0 es falso siempre
  const result = mutateProfile(base, 0, domains, rng);
  assert.deepStrictEqual(result, { color: 'red', size: 3 });
});

test('mutationRate=1 siempre reemplaza, usando 2 llamadas a rng por key (decide + selecciona)', () => {
  const base = { color: 'red', size: 3 };
  const domains = { color: ['red', 'green', 'blue'], size: [1, 2, 3, 4] };
  // key "color": r1=0.0 (< 1, muta), r2=0.5 -> index floor(0.5*3)=1 -> 'green'
  // key "size":  r1=0.0 (< 1, muta), r2=0.99 -> index floor(0.99*4)=3 -> 4
  const rng = fakeRng([0.0, 0.5, 0.0, 0.99]);
  const result = mutateProfile(base, 1, domains, rng);
  assert.deepStrictEqual(result, { color: 'green', size: 4 });
});

test('keys ausentes de domains se conservan siempre y no consumen rng', () => {
  const base = { color: 'red', id: 'char-001' };
  const domains = { color: ['red', 'green', 'blue'] }; // "id" no tiene domain
  // Solo "color" consume rng (2 llamadas si muta); "id" no consume ninguna.
  const rng = fakeRng([0.0, 0.0]); // color: r1=0.0<1 muta, r2=0.0 -> index 0 -> 'red'
  const result = mutateProfile(base, 1, domains, rng);
  assert.deepStrictEqual(result, { color: 'red', id: 'char-001' });
});

test('no muta el objeto base recibido (pureza)', () => {
  const base = { color: 'red' };
  const domains = { color: ['red', 'green', 'blue'] };
  const rng = fakeRng([0.0, 0.5]);
  const frozenCopy = JSON.parse(JSON.stringify(base));
  mutateProfile(base, 1, domains, rng);
  assert.deepStrictEqual(base, frozenCopy);
});

test('mutationRate intermedio: decisión por key vía r1 < mutationRate', () => {
  const base = { a: 'A0', b: 'B0' };
  const domains = { a: ['A0', 'A1'], b: ['B0', 'B1'] };
  // key "a": r1=0.1 (< 0.5, muta), r2=0.9 -> index floor(0.9*2)=1 -> 'A1'
  // key "b": r1=0.8 (>= 0.5, NO muta) -> conserva 'B0' (sin segunda llamada)
  const rng = fakeRng([0.1, 0.9, 0.8]);
  const result = mutateProfile(base, 0.5, domains, rng);
  assert.deepStrictEqual(result, { a: 'A1', b: 'B0' });
});
