const test = require('node:test');
const assert = require('node:assert/strict');
const { interpretSwipe } = require('./interpretSwipe.js');

test('deltaX mayor al umbral -> aprobar', () => {
  assert.strictEqual(interpretSwipe(150, 0, 100), 'aprobar');
});

test('deltaX menor a -umbral -> rechazar', () => {
  assert.strictEqual(interpretSwipe(-150, 0, 100), 'rechazar');
});

test('deltaX dentro del rango [-umbral, umbral] -> null (no comprometido)', () => {
  assert.strictEqual(interpretSwipe(50, 0, 100), null);
  assert.strictEqual(interpretSwipe(-50, 0, 100), null);
  assert.strictEqual(interpretSwipe(0, 0, 100), null);
});

test('deltaX exactamente igual al umbral (borde) -> null, no comprometido', () => {
  assert.strictEqual(interpretSwipe(100, 0, 100), null);
  assert.strictEqual(interpretSwipe(-100, 0, 100), null);
});

test('deltaY no afecta el resultado en ningun caso', () => {
  assert.strictEqual(interpretSwipe(150, 500, 100), 'aprobar');
  assert.strictEqual(interpretSwipe(-150, -500, 100), 'rechazar');
  assert.strictEqual(interpretSwipe(50, 9999, 100), null);
});
