---
task: determine-correct-action
intent: Decidir la accion correcta sobre un asistente segun el reglamento vigente.
target: web/engine/determineCorrectAction.js
signature: "function determineCorrectAction(reglas, attendee)"
language: javascript
budget:
  cyclomatic_max: 8
  nesting_max: 2
  params_max: 2
  lines_max: 20
tests: web/engine/determineCorrectAction.test.js
test_command: "node --test determineCorrectAction.test.js"
deps_allowed: ["./evaluateRule.js"]
forbids: ["Math.random", "Date.now", "process.env"]
spec_version: "0.1"
require_test_approval: false
---

## Intent
Dado un array `reglas` (el reglamento vigente, cada una con `accionSiViola: 'rechazar'|'detener'`)
y un `attendee`, retorna la accion CORRECTA: `'aprobar'` si cumple todas, `'rechazar'` si viola
alguna cuyo `accionSiViola` sea `'rechazar'` (y ninguna de `'detener'`), o `'detener'` si viola
alguna cuyo `accionSiViola` sea `'detener'` (maxima prioridad).

## Interface
```js
function determineCorrectAction(reglas, attendee) {
  // reglas: Array<regla>  -- ver contrato de evaluateRule, cada regla trae ademas
  //         accionSiViola: 'rechazar' | 'detener'
  // attendee: { dni: object, invitacion: object }
  // retorna: 'aprobar' | 'rechazar' | 'detener'
}
```

## Invariants
- Se evalua cada regla de `reglas` con
  `require('./evaluateRule.js').evaluateRule(regla, attendee)`; una regla esta VIOLADA si esa
  llamada retorna `false`.
- `reglas` vacio, o TODAS las reglas se cumplen: retorna `'aprobar'`.
- Si AL MENOS UNA regla violada tiene `accionSiViola === 'detener'`: retorna `'detener'`
  (prioridad maxima, sin importar cuantas otras reglas de `'rechazar'` tambien esten violadas).
- Si NINGUNA regla violada tiene `accionSiViola === 'detener'` pero AL MENOS UNA tiene
  `accionSiViola === 'rechazar'`: retorna `'rechazar'`.

## Examples
1. Input: `determineCorrectAction([], attendee)` -> Output: `'aprobar'`
2. Input: `determineCorrectAction([reglaViolada_accionRechazar], attendee)` -> Output: `'rechazar'`
3. Input: `determineCorrectAction([reglaViolada_accionRechazar, reglaViolada_accionDetener], attendee)`
   -> Output: `'detener'` (detener gana aunque tambien haya una violacion de rechazar)

## Do / Don't
- DO: usar `require('./evaluateRule.js').evaluateRule` para cada regla -- no reimplementar esa
  logica.
- DO: darle a `'detener'` prioridad absoluta sobre `'rechazar'`.
- DON'T: no te detengas en la primera regla violada si todavia no viste todas -- una regla de
  `'detener'` mas adelante en el array debe seguir ganando.

## Tests
Property-tests congelados en `web/engine/determineCorrectAction.test.js` (no editables por el
implementador), usando el `evaluateRule` REAL ya verificado como dependencia:
1. Sin reglas -> aprobar.
2. Todas cumplen -> aprobar.
3. Una violada con accionSiViola=rechazar -> rechazar.
4. Una violada con accionSiViola=detener -> detener.
5. Detener gana sobre rechazar cuando ambas violan a la vez.
6. Regla de identidad (fraude) violada con accionSiViola=detener -> detener.

## Constraints
- Unica dependencia permitida: `./evaluateRule.js` -- `deps_allowed`.
- El archivo `web/engine/determineCorrectAction.js` exporta `determineCorrectAction` como
  `module.exports`.
- PARAR y reportar si: el contrato no se puede cumplir dentro del budget sin violar la interfaz
  (no deberia ocurrir; es un filter + 2 chequeos de prioridad).
