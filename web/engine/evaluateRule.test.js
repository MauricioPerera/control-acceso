const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateRule } = require('./evaluateRule.js');

const attendee = {
  dni: { nombre: 'Ana', apellido: 'Gomez', nacionalidad: 'argentina', fechaNacimiento: '2000-01-01' },
  invitacion: { nombre: 'Ana', apellido: 'Gomez', categoriaAcceso: 'vip', vigente: true },
};

test('tipo documento: filtro se cumple y esperado=true -> regla OK (true)', () => {
  const regla = { tipo: 'documento', fuente: 'invitacion', filtro: { type: 'exact', field: 'categoriaAcceso', value: 'vip' }, esperado: true };
  assert.strictEqual(evaluateRule(regla, attendee), true);
});

test('tipo documento: filtro NO se cumple y esperado=true -> regla violada (false)', () => {
  const regla = { tipo: 'documento', fuente: 'invitacion', filtro: { type: 'exact', field: 'categoriaAcceso', value: 'general' }, esperado: true };
  assert.strictEqual(evaluateRule(regla, attendee), false);
});

test('tipo documento: filtro se cumple pero esperado=false (prohibido) -> regla violada (false)', () => {
  const regla = { tipo: 'documento', fuente: 'dni', filtro: { type: 'exact', field: 'nacionalidad', value: 'argentina' }, esperado: false };
  assert.strictEqual(evaluateRule(regla, attendee), false);
});

test('tipo documento: filtro NO se cumple y esperado=false -> regla OK (true)', () => {
  const regla = { tipo: 'documento', fuente: 'dni', filtro: { type: 'exact', field: 'nacionalidad', value: 'chilena' }, esperado: false };
  assert.strictEqual(evaluateRule(regla, attendee), true);
});

test('tipo documento: usa fuente "dni" para evaluar sobre dni, no invitacion', () => {
  const regla = { tipo: 'documento', fuente: 'dni', filtro: { type: 'dateRange', field: 'fechaNacimiento', min: '1990-01-01', max: '2010-01-01' }, esperado: true };
  assert.strictEqual(evaluateRule(regla, attendee), true);
});

test('tipo identidad: nombre/apellido coinciden -> true', () => {
  const regla = { tipo: 'identidad' };
  assert.strictEqual(evaluateRule(regla, attendee), true);
});

test('tipo identidad: nombre no coincide -> false', () => {
  const regla = { tipo: 'identidad' };
  const fraud = { dni: { nombre: 'Ana', apellido: 'Gomez' }, invitacion: { nombre: 'Otro', apellido: 'Gomez' } };
  assert.strictEqual(evaluateRule(regla, fraud), false);
});

test('tipo desconocido -> lanza error', () => {
  assert.throws(() => evaluateRule({ tipo: 'nope' }, attendee));
});
