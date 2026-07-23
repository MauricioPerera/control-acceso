const test = require('node:test');
const assert = require('node:assert/strict');
const { matchesFilter } = require('./matchesFilter.js');

test('text: substring case-insensitive -> true', () => {
  const character = { apellido: 'González' };
  assert.strictEqual(matchesFilter(character, { type: 'text', field: 'apellido', query: 'gonz' }), true);
});

test('text: substring ausente -> false', () => {
  const character = { apellido: 'González' };
  assert.strictEqual(matchesFilter(character, { type: 'text', field: 'apellido', query: 'martinez' }), false);
});

test('text: mayúsculas/minúsculas no importan en ninguno de los dos lados', () => {
  const character = { apellido: 'GONZÁLEZ' };
  assert.strictEqual(matchesFilter(character, { type: 'text', field: 'apellido', query: 'ÁLEZ' }), true);
});

test('exact: valor igual -> true', () => {
  const character = { genero: 'femenino' };
  assert.strictEqual(matchesFilter(character, { type: 'exact', field: 'genero', value: 'femenino' }), true);
});

test('exact: valor distinto -> false', () => {
  const character = { genero: 'femenino' };
  assert.strictEqual(matchesFilter(character, { type: 'exact', field: 'genero', value: 'masculino' }), false);
});

test('dateRange: dentro del rango (inclusive en ambos extremos) -> true', () => {
  const character = { fechaNacimiento: '1980-06-15' };
  const filter = { type: 'dateRange', field: 'fechaNacimiento', min: '1980-06-15', max: '1990-01-01' };
  assert.strictEqual(matchesFilter(character, filter), true);
});

test('dateRange: fuera del rango -> false', () => {
  const character = { fechaNacimiento: '1970-01-01' };
  const filter = { type: 'dateRange', field: 'fechaNacimiento', min: '1980-01-01', max: '1990-01-01' };
  assert.strictEqual(matchesFilter(character, filter), false);
});

test('boolean: expected=true y valor distinto de noneValue -> true', () => {
  const character = { lentes: 'sunglasses' };
  const filter = { type: 'boolean', field: 'lentes', noneValue: 'none', expected: true };
  assert.strictEqual(matchesFilter(character, filter), true);
});

test('boolean: expected=true pero valor ES noneValue -> false', () => {
  const character = { lentes: 'none' };
  const filter = { type: 'boolean', field: 'lentes', noneValue: 'none', expected: true };
  assert.strictEqual(matchesFilter(character, filter), false);
});

test('boolean: expected=false y valor ES noneValue -> true', () => {
  const character = { lentes: 'none' };
  const filter = { type: 'boolean', field: 'lentes', noneValue: 'none', expected: false };
  assert.strictEqual(matchesFilter(character, filter), true);
});

test('type desconocido -> lanza error', () => {
  const character = { genero: 'femenino' };
  assert.throws(() => matchesFilter(character, { type: 'nope', field: 'genero' }));
});
