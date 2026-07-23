const test = require('node:test');
const assert = require('node:assert/strict');
const { determineCorrectAction } = require('./determineCorrectAction.js');

const attendeeOk = {
  dni: { nombre: 'Ana', apellido: 'Gomez', nacionalidad: 'argentina' },
  invitacion: { nombre: 'Ana', apellido: 'Gomez', categoriaAcceso: 'vip', vigente: true },
};

const REGLA_CATEGORIA_VIP = {
  tipo: 'documento', fuente: 'invitacion',
  filtro: { type: 'exact', field: 'categoriaAcceso', value: 'vip' },
  esperado: true, accionSiViola: 'rechazar',
};

const REGLA_NACIONALIDAD_PROHIBIDA = {
  tipo: 'documento', fuente: 'dni',
  filtro: { type: 'exact', field: 'nacionalidad', value: 'chilena' },
  esperado: false, accionSiViola: 'detener',
};

const REGLA_IDENTIDAD = { tipo: 'identidad', accionSiViola: 'detener' };

test('sin reglas -> siempre aprobar', () => {
  assert.strictEqual(determineCorrectAction([], attendeeOk), 'aprobar');
});

test('todas las reglas se cumplen -> aprobar', () => {
  assert.strictEqual(determineCorrectAction([REGLA_CATEGORIA_VIP, REGLA_NACIONALIDAD_PROHIBIDA], attendeeOk), 'aprobar');
});

test('una regla violada con accionSiViola=rechazar -> rechazar', () => {
  const regla = { ...REGLA_CATEGORIA_VIP, filtro: { type: 'exact', field: 'categoriaAcceso', value: 'general' } };
  assert.strictEqual(determineCorrectAction([regla], attendeeOk), 'rechazar');
});

test('una regla violada con accionSiViola=detener -> detener', () => {
  const attendeeChileno = { dni: { ...attendeeOk.dni, nacionalidad: 'chilena' }, invitacion: attendeeOk.invitacion };
  assert.strictEqual(determineCorrectAction([REGLA_NACIONALIDAD_PROHIBIDA], attendeeChileno), 'detener');
});

test('detener tiene prioridad sobre rechazar cuando ambas violan a la vez', () => {
  const reglaRechazo = { ...REGLA_CATEGORIA_VIP, filtro: { type: 'exact', field: 'categoriaAcceso', value: 'general' } };
  const attendeeChileno = { dni: { ...attendeeOk.dni, nacionalidad: 'chilena' }, invitacion: attendeeOk.invitacion };
  assert.strictEqual(determineCorrectAction([reglaRechazo, REGLA_NACIONALIDAD_PROHIBIDA], attendeeChileno), 'detener');
});

test('regla de identidad violada (fraude) con accionSiViola=detener -> detener', () => {
  const fraud = { dni: { nombre: 'Ana', apellido: 'Gomez' }, invitacion: { nombre: 'Otro', apellido: 'Gomez' } };
  assert.strictEqual(determineCorrectAction([REGLA_IDENTIDAD], fraud), 'detener');
});
