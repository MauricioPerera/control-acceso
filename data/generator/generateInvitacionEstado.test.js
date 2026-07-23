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
const CONFIG = { selloProbability: 0.8, qrProbability: 0.7 };

test('categoriaAcceso y fechaVigencia se eligen por indice, en ese orden', () => {
  // categoriaAcceso: r=0.5 -> floor(0.5*4)=2 -> 'staff'
  // fechaVigencia: r=0.0 -> floor(0*3)=0 -> '2026-06-01'
  // sello: r=0.1 < 0.8 -> true
  // qr: r=0.1 < 0.7 -> true
  const rng = fakeRng([0.5, 0.0, 0.1, 0.1]);
  const result = generateInvitacionEstado(CONFIG, DOMAINS, rng);
  assert.deepStrictEqual(result, {
    categoriaAcceso: 'staff', fechaVigencia: '2026-06-01', selloValido: true, qrValido: true,
  });
});

test('selloValido=false cuando el roll queda por encima de selloProbability', () => {
  const rng = fakeRng([0.0, 0.0, 0.9, 0.1]);
  const result = generateInvitacionEstado(CONFIG, DOMAINS, rng);
  assert.strictEqual(result.selloValido, false);
});

test('qrValido=false cuando el roll queda por encima de qrProbability', () => {
  const rng = fakeRng([0.0, 0.0, 0.1, 0.9]);
  const result = generateInvitacionEstado(CONFIG, DOMAINS, rng);
  assert.strictEqual(result.qrValido, false);
});

test('fechaVigencia con r cercano a 1 selecciona el ultimo elemento del dominio', () => {
  const rng = fakeRng([0.0, 0.999999, 0.1, 0.1]);
  const result = generateInvitacionEstado(CONFIG, DOMAINS, rng);
  assert.strictEqual(result.fechaVigencia, '2026-08-01');
});

test('retorna exactamente las 4 keys esperadas, sin ninguna extra', () => {
  const rng = fakeRng([0.0, 0.0, 0.1, 0.1]);
  const result = generateInvitacionEstado(CONFIG, DOMAINS, rng);
  assert.deepStrictEqual(
    Object.keys(result).sort(),
    ['categoriaAcceso', 'fechaVigencia', 'qrValido', 'selloValido']
  );
});
