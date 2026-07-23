const test = require('node:test');
const assert = require('node:assert/strict');
const { matchesBarcode } = require('./matchesBarcode.js');

test('numeroDni coincide con codigoBarras -> true', () => {
  const dni = { numeroDni: '30111222' };
  const invitacion = { codigoBarras: '30111222' };
  assert.strictEqual(matchesBarcode(dni, invitacion), true);
});

test('numeroDni distinto de codigoBarras -> false', () => {
  const dni = { numeroDni: '30111222' };
  const invitacion = { codigoBarras: '31222333' };
  assert.strictEqual(matchesBarcode(dni, invitacion), false);
});

test('comparacion es de string exacta (sin normalizar ceros a la izquierda ni espacios)', () => {
  const dni = { numeroDni: '030111222' };
  const invitacion = { codigoBarras: '30111222' };
  assert.strictEqual(matchesBarcode(dni, invitacion), false);
});

test('no modifica dni ni invitacion', () => {
  const dni = { numeroDni: '30111222' };
  const invitacion = { codigoBarras: '30111222' };
  const dniCopy = JSON.parse(JSON.stringify(dni));
  const invCopy = JSON.parse(JSON.stringify(invitacion));
  matchesBarcode(dni, invitacion);
  assert.deepStrictEqual(dni, dniCopy);
  assert.deepStrictEqual(invitacion, invCopy);
});
