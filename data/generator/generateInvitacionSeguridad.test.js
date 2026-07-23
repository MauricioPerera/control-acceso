const test = require('node:test');
const assert = require('node:assert/strict');
const { generateInvitacionSeguridad } = require('./generateInvitacionSeguridad.js');

function fakeRng(sequence) {
  let i = 0;
  return () => {
    if (i >= sequence.length) throw new Error('fakeRng: se acabo la secuencia');
    return sequence[i++];
  };
}

const REFERENCIAS = { sello: 'aguila-dorada', qr: 'QR-2026-A7X' };
const DOMAINS = {
  codigoSello: ['aguila-dorada', 'leon-plateado', 'estrella-real'],
  codigoQR: ['QR-2026-A7X', 'QR-2026-B3M', 'QR-2026-C9K'],
};

test('matchProbability=1 -> codigoSello y codigoQR coinciden con la referencia', () => {
  const rng = fakeRng([0.0, 0.0]);
  const result = generateInvitacionSeguridad(REFERENCIAS, 1, DOMAINS, rng);
  assert.deepStrictEqual(result, { codigoSello: 'aguila-dorada', codigoQR: 'QR-2026-A7X' });
});

test('matchProbability=0 -> ambos siempre distintos de la referencia', () => {
  const rng = fakeRng([0.5, 0.0, 0.5, 0.0]);
  const result = generateInvitacionSeguridad(REFERENCIAS, 0, DOMAINS, rng);
  assert.deepStrictEqual(result, { codigoSello: 'leon-plateado', codigoQR: 'QR-2026-B3M' });
});

test('el orden de consumo de rng es codigoSello, luego codigoQR', () => {
  // sello miente (2 llamadas), qr acierta (1 llamada)
  const rng = fakeRng([0.9, 0.0, 0.0]);
  const result = generateInvitacionSeguridad(REFERENCIAS, 0.5, DOMAINS, rng);
  assert.deepStrictEqual(result, { codigoSello: 'leon-plateado', codigoQR: 'QR-2026-A7X' });
});

test('retorna exactamente las keys codigoSello y codigoQR, sin ninguna extra', () => {
  const rng = fakeRng([0.0, 0.0]);
  const result = generateInvitacionSeguridad(REFERENCIAS, 1, DOMAINS, rng);
  assert.deepStrictEqual(Object.keys(result).sort(), ['codigoQR', 'codigoSello']);
});
