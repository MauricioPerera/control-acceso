function matchesFilter(character, filter) {
  switch (filter.type) {
    case 'text':
      return String(character[filter.field]).toLowerCase().includes(filter.query.toLowerCase());
    case 'exact':
      return character[filter.field] === filter.value;
    case 'dateRange':
      const val = character[filter.field];
      return val >= filter.min && val <= filter.max;
    case 'boolean':
      return (character[filter.field] !== filter.noneValue) === filter.expected;
    case 'paridad':
      return (parseInt(character[filter.field], 10) % 2 === 0) === filter.esPar;
    case 'todas':
      return filter.filtros.every((f) => matchesFilter(character, f));
    default:
      throw new Error(`Unknown filter type: ${filter.type}`);
  }
}

if (typeof module !== 'undefined') {
  module.exports = { matchesFilter };
}
if (typeof window !== 'undefined') {
  window.Engine = window.Engine || {};
  window.Engine.matchesFilter = matchesFilter;
}
