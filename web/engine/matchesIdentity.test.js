const test = require('node:test');
const assert = require('node:assert/strict');
const { matchesIdentity } = require('./matchesIdentity.js');

test('nombre y apellido coinciden -> true', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez' };
  const invitacion = { nombre: 'Ana', apellido: 'Gomez' };
  assert.strictEqual(matchesIdentity(dni, invitacion), true);
});

test('nombre distinto -> false', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez' };
  const invitacion = { nombre: 'Beto', apellido: 'Gomez' };
  assert.strictEqual(matchesIdentity(dni, invitacion), false);
});

test('apellido distinto -> false', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez' };
  const invitacion = { nombre: 'Ana', apellido: 'Diaz' };
  assert.strictEqual(matchesIdentity(dni, invitacion), false);
});

test('ambos distintos -> false', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez' };
  const invitacion = { nombre: 'Beto', apellido: 'Diaz' };
  assert.strictEqual(matchesIdentity(dni, invitacion), false);
});

test('comparacion case-sensitive: distinta capitalizacion -> false', () => {
  const dni = { nombre: 'Ana', apellido: 'Gomez' };
  const invitacion = { nombre: 'ana', apellido: 'Gomez' };
  assert.strictEqual(matchesIdentity(dni, invitacion), false);
});
