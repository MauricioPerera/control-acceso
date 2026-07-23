const test = require('node:test');
const assert = require('node:assert/strict');
const { generateInvitacionIdentidad } = require('./generateInvitacionIdentidad.js');

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
  numeroDni: ['30111222', '31222333'],
};

test('matchProbability=1 -> nombre, apellido y codigoBarras coinciden con el dni', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez', numeroDni: '30111222' };
  const rng = fakeRng([0.0, 0.0, 0.0]);
  const result = generateInvitacionIdentidad(dni, 1, DOMAINS, rng);
  assert.deepStrictEqual(result, { nombre: 'Ana', apellido: 'Gomez', codigoBarras: '30111222' });
});

test('matchProbability=0 -> los 3 campos siempre distintos del dni', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez', numeroDni: '30111222' };
  // cada rollTestimonyValue con matchProbability=0 consume r1 (siempre >=0, nunca <0) + r2 (indice 0 de alternatives)
  const rng = fakeRng([0.5, 0.0, 0.5, 0.0, 0.5, 0.0]);
  const result = generateInvitacionIdentidad(dni, 0, DOMAINS, rng);
  assert.deepStrictEqual(result, { nombre: 'Beto', apellido: 'Diaz', codigoBarras: '31222333' });
});

test('el orden de consumo de rng es nombre, luego apellido, luego codigoBarras', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez', numeroDni: '30111222' };
  // nombre miente (2 llamadas), apellido acierta (1 llamada), codigoBarras miente (2 llamadas)
  const rng = fakeRng([0.9, 0.0, 0.0, 0.9, 0.0]);
  const result = generateInvitacionIdentidad(dni, 0.5, DOMAINS, rng);
  assert.deepStrictEqual(result, { nombre: 'Beto', apellido: 'Gomez', codigoBarras: '31222333' });
});

test('retorna exactamente las 3 keys nombre/apellido/codigoBarras, sin ninguna extra', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez', numeroDni: '30111222' };
  const rng = fakeRng([0.0, 0.0, 0.0]);
  const result = generateInvitacionIdentidad(dni, 1, DOMAINS, rng);
  assert.deepStrictEqual(Object.keys(result).sort(), ['apellido', 'codigoBarras', 'nombre']);
});
