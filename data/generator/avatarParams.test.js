const test = require('node:test');
const assert = require('node:assert/strict');
const { assignAvatarParams } = require('./avatarParams.js');

test('lentes y velloFacial en "none" -> probability 0 y arrays vacíos', () => {
  const character = {
    id: 'char-001',
    lentes: 'none',
    velloFacial: 'none',
    tonoPiel: 'edb98a',
    colorPelo: '2c1b18',
    peinado: 'bob',
  };
  const result = assignAvatarParams(character);
  assert.deepStrictEqual(result, {
    seed: 'char-001',
    accessoriesProbability: 0,
    accessories: [],
    facialHairProbability: 0,
    facialHair: [],
    skinColor: ['edb98a'],
    hairColor: ['2c1b18'],
    top: ['bob'],
  });
});

test('lentes y velloFacial con valor concreto -> probability 100 y array de 1 elemento', () => {
  const character = {
    id: 'char-002',
    lentes: 'sunglasses',
    velloFacial: 'beardMedium',
    tonoPiel: '614335',
    colorPelo: 'a55728',
    peinado: 'shortFlat',
  };
  const result = assignAvatarParams(character);
  assert.deepStrictEqual(result, {
    seed: 'char-002',
    accessoriesProbability: 100,
    accessories: ['sunglasses'],
    facialHairProbability: 100,
    facialHair: ['beardMedium'],
    skinColor: ['614335'],
    hairColor: ['a55728'],
    top: ['shortFlat'],
  });
});

test('solo lentes en none, velloFacial con valor -> cada atributo se evalúa independientemente', () => {
  const character = {
    id: 'char-003',
    lentes: 'none',
    velloFacial: 'moustacheFancy',
    tonoPiel: 'fd9841',
    colorPelo: 'e8e1e1',
    peinado: 'dreads',
  };
  const result = assignAvatarParams(character);
  assert.deepStrictEqual(result, {
    seed: 'char-003',
    accessoriesProbability: 0,
    accessories: [],
    facialHairProbability: 100,
    facialHair: ['moustacheFancy'],
    skinColor: ['fd9841'],
    hairColor: ['e8e1e1'],
    top: ['dreads'],
  });
});

test('el seed proviene exactamente del id del personaje', () => {
  const character = {
    id: 'char-999-XYZ',
    lentes: 'none',
    velloFacial: 'none',
    tonoPiel: 'ffdbb4',
    colorPelo: '4a312c',
    peinado: 'fro',
  };
  const result = assignAvatarParams(character);
  assert.strictEqual(result.seed, 'char-999-XYZ');
});
