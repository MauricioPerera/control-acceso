---
task: evaluate-rule
intent: Determinar si un asistente cumple una regla del reglamento.
target: web/engine/evaluateRule.js
signature: "function evaluateRule(regla, attendee)"
language: javascript
budget:
  cyclomatic_max: 10
  nesting_max: 2
  params_max: 2
  lines_max: 32
tests: web/engine/evaluateRule.test.js
test_command: "node --test evaluateRule.test.js"
deps_allowed: ["./matchesFilter.js", "./matchesIdentity.js", "./matchesBarcode.js"]
forbids: ["Math.random", "Date.now", "process.env", "eval"]
spec_version: "0.2"
require_test_approval: false
---

## Intent
Dada una `regla` (de tipo `'documento'`, `'identidad'` o `'codigoBarras'`) y un `attendee`
(`{dni, invitacion}`), retorna `true` si el asistente CUMPLE la regla, `false` si la viola.

## Interface
```js
function evaluateRule(regla, attendee) {
  // regla: { tipo: 'documento', fuente: 'dni'|'invitacion', filtro: <filterSpec>, esperado: boolean }
  //      | { tipo: 'identidad' }
  //      | { tipo: 'codigoBarras' }
  // attendee: { dni: object, invitacion: object }
  // retorna: boolean  -- true si CUMPLE la regla, false si la VIOLA
}
```

## Invariants
- `regla.tipo === 'documento'`: sea `doc = attendee[regla.fuente]`; retorna
  `require('./matchesFilter.js').matchesFilter(doc, regla.filtro) === regla.esperado`.
  - Si `regla.esperado === true`, la regla exige que el filtro se cumpla (ej. "categoria debe ser
    vip").
  - Si `regla.esperado === false`, la regla exige que el filtro NO se cumpla (ej. "nacionalidad NO
    debe ser X" -- prohibicion).
- `regla.tipo === 'identidad'`: retorna
  `require('./matchesIdentity.js').matchesIdentity(attendee.dni, attendee.invitacion)`.
- `regla.tipo === 'codigoBarras'`: retorna
  `require('./matchesBarcode.js').matchesBarcode(attendee.dni, attendee.invitacion)`.
- Cualquier `regla.tipo` distinto de los 3 anteriores: LANZA un `Error`.

## Examples
1. Input: `evaluateRule({tipo:'documento', fuente:'invitacion', filtro:{type:'exact',
   field:'categoriaAcceso', value:'vip'}, esperado:true}, {dni:{...}, invitacion:{categoriaAcceso:'vip'}})`
   -> Output: `true`
2. Input: `evaluateRule({tipo:'codigoBarras'}, {dni:{numeroDni:'30111222'},
   invitacion:{codigoBarras:'31222333'}})` -> Output: `false` (no coincide)

## Do / Don't
- DO: usar `require('./matchesFilter.js').matchesFilter`,
  `require('./matchesIdentity.js').matchesIdentity` y
  `require('./matchesBarcode.js').matchesBarcode` -- no reimplementar esa logica.
- DO: leer `attendee[regla.fuente]` dinamicamente segun el campo `fuente` de la regla.
- DON'T: no lances error para `tipo` valido -- solo para `tipo` desconocido.

## Tests
Property-tests congelados en `web/engine/evaluateRule.test.js` (no editables por el
implementador), con un `attendee` fijo y valores esperados calculados a mano (oraculo
independiente):
1. Documento: filtro cumple + esperado=true -> true.
2. Documento: filtro no cumple + esperado=true -> false.
3. Documento: filtro cumple + esperado=false (prohibido) -> false.
4. Documento: filtro no cumple + esperado=false -> true.
5. Documento: usa la `fuente` correcta (dni vs invitacion).
6. Identidad: coincide -> true.
7. Identidad: no coincide -> false.
8. Tipo desconocido -> lanza error.
9. codigoBarras: coincide -> true.
10. codigoBarras: no coincide -> false.

## Constraints
- Dependencias permitidas: `./matchesFilter.js`, `./matchesIdentity.js`, `./matchesBarcode.js` --
  `deps_allowed`.
- El archivo `web/engine/evaluateRule.js` exporta `evaluateRule` como `module.exports`.
- PARAR y reportar si: el contrato no se puede cumplir dentro del budget sin violar la interfaz
  (no deberia ocurrir; es un dispatch de 3 casos delegando a funciones ya verificadas).
