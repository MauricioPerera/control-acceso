const test = require('node:test');
const assert = require('node:assert/strict');
const { rollTestimonyValue } = require('./rollTestimonyValue.js');

function fakeRng(sequence) {
  let i = 0;
  return () => {
    if (i >= sequence.length) throw new Error('fakeRng: se acabo la secuencia');
    return sequence[i++];
  };
}

test('r1 < confidence -> retorna el valor verdadero, consume solo 1 llamada a rng', () => {
  const rng = fakeRng([0.3]); // 0.3 < 0.7
  const result = rollTestimonyValue('femenino', 0.7, ['femenino', 'masculino', 'no-binario'], rng);
  assert.strictEqual(result, 'femenino');
});

test('r1 >= confidence -> retorna un valor DISTINTO del verdadero, elegido con r2', () => {
  // r1=0.9 >= 0.7 (miente); alternatives = ['masculino','no-binario']; r2=0.9 -> floor(0.9*2)=1 -> 'no-binario'
  const rng = fakeRng([0.9, 0.9]);
  const result = rollTestimonyValue('femenino', 0.7, ['femenino', 'masculino', 'no-binario'], rng);
  assert.strictEqual(result, 'no-binario');
});

test('r1 === confidence exacto -> se trata como "no dice la verdad" (r1 < confidence es false)', () => {
  const rng = fakeRng([0.7, 0.0]); // r1=0.7 no es < 0.7; alternatives=['masculino','no-binario']; r2=0 -> indice 0
  const result = rollTestimonyValue('femenino', 0.7, ['femenino', 'masculino', 'no-binario'], rng);
  assert.strictEqual(result, 'masculino');
});

test('el valor mentiroso nunca es igual al valor verdadero, para cualquier r2', () => {
  const domain = ['a', 'b', 'c', 'd'];
  for (const r2 of [0, 0.4, 0.9]) {
    const rng = fakeRng([1.0, r2]); // r1=1.0 nunca es < confidence (max valido)
    const result = rollTestimonyValue('a', 0.5, domain, rng);
    assert.notStrictEqual(result, 'a');
  }
});

test('confidence=1 siempre dice la verdad (r1 nunca puede ser >= 1 si rng esta en [0,1))', () => {
  const rng = fakeRng([0.999999]);
  const result = rollTestimonyValue('rojo', 1, ['rojo', 'verde', 'azul'], rng);
  assert.strictEqual(result, 'rojo');
});
