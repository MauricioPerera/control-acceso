function assignAvatarParams(character) {
  return {
    seed: character.id,
    accessoriesProbability: character.lentes === 'none' ? 0 : 100,
    accessories: character.lentes === 'none' ? [] : [character.lentes],
    facialHairProbability: character.velloFacial === 'none' ? 0 : 100,
    facialHair: character.velloFacial === 'none' ? [] : [character.velloFacial],
    skinColor: [character.tonoPiel],
    hairColor: [character.colorPelo],
    top: [character.peinado],
  };
}

if (typeof module !== 'undefined') {
  module.exports = { assignAvatarParams };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.assignAvatarParams = assignAvatarParams;
}
