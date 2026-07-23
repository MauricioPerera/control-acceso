---
task: matches-barcode
intent: Comparar el codigo de barras de la invitacion contra el numero de DNI real.
target: web/engine/matchesBarcode.js
signature: "function matchesBarcode(dni, invitacion)"
language: javascript
budget:
  cyclomatic_max: 2
  nesting_max: 1
  params_max: 2
  lines_max: 6
tests: web/engine/matchesBarcode.test.js
test_command: "node --test matchesBarcode.test.js"
deps_allowed: []
forbids: ["Math.random", "Date.now", "process.env"]
spec_version: "0.1"
require_test_approval: false
---

## Intent
Dado el `dni` real de un asistente y su `invitacion` presentada, retorna `true` si
`invitacion.codigoBarras` coincide exactamente con `dni.numeroDni`, `false` si no.

## Interface
```js
function matchesBarcode(dni, invitacion) {
  // dni: { numeroDni: string, ... }
  // invitacion: { codigoBarras: string, ... }
  // retorna: boolean
}
```

## Invariants
- Retorna `dni.numeroDni === invitacion.codigoBarras` (igualdad estricta, sin normalizar).
- Funcion pura: no modifica `dni` ni `invitacion`.

## Examples
1. Input: `matchesBarcode({numeroDni:'30111222'}, {codigoBarras:'30111222'})` -> Output: `true`
2. Input: `matchesBarcode({numeroDni:'30111222'}, {codigoBarras:'31222333'})` -> Output: `false`

## Do / Don't
- DO: usar igualdad estricta (`===`).
- DON'T: no normalices ceros a la izquierda ni espacios -- la comparacion es literal.

## Tests
Property-tests congelados en `web/engine/matchesBarcode.test.js` (no editables por el
implementador):
1. Coincide -> true.
2. No coincide -> false.
3. Comparacion literal (ceros a la izquierda distintos -> false).
4. No modifica `dni` ni `invitacion`.

## Constraints
- Sin dependencias externas (Node puro) -- `deps_allowed: []`.
- El archivo `web/engine/matchesBarcode.js` exporta `matchesBarcode` como `module.exports`.
- PARAR y reportar si: el contrato no se puede cumplir dentro del budget sin violar la interfaz
  (no deberia ocurrir; es una comparacion de 1 campo).
