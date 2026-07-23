const test = require('node:test');
const assert = require('node:assert/strict');
const { createSeededRng } = require('./rng.js');

test('determinism: same seed produces identical sequence', () => {
  const a = createSeededRng(42);
  const b = createSeededRng(42);
  const seqA = Array.from({ length: 50 }, () => a());
  const seqB = Array.from({ length: 50 }, () => b());
  assert.deepStrictEqual(seqA, seqB);
});

test('range: all values are in [0, 1)', () => {
  const next = createSeededRng(1);
  for (let i = 0; i < 1000; i++) {
    const v = next();
    assert.ok(v >= 0 && v < 1, `value ${v} out of range at iteration ${i}`);
  }
});

test('independence: interleaving another generator does not contaminate the sequence', () => {
  const rngA = createSeededRng(1);
  const rngB = createSeededRng(2);
  const interleaved = [];
  for (let i = 0; i < 10; i++) {
    interleaved.push(rngA());
    rngB();
  }
  const fresh = createSeededRng(1);
  const expected = Array.from({ length: 10 }, () => fresh());
  assert.deepStrictEqual(interleaved, expected);
});

test('distinct seeds produce distinct sequences', () => {
  const sequences = [];
  for (let seed = 0; seed < 20; seed++) {
    const next = createSeededRng(seed);
    sequences.push(Array.from({ length: 5 }, () => next()));
  }
  const seen = new Set();
  for (const seq of sequences) {
    const key = JSON.stringify(seq);
    assert.ok(!seen.has(key), `duplicate sequence found: ${key}`);
    seen.add(key);
  }
});
