---
task: matches-identity
intent: Comparar la identidad declarada en la invitacion contra el dni real.
target: web/engine/matchesIdentity.js
signature: "function matchesIdentity(dni, invitacion)"
language: javascript
budget:
  cyclomatic_max: 4
  nesting_max: 1
  params_max: 2
  lines_max: 10
tests: web/engine/matchesIdentity.test.js
test_command: "node --test matchesIdentity.test.js"
deps_allowed: []
forbids: ["Math.random", "Date.now", "process.env"]
spec_version: "0.1"
require_test_approval: false
---

## Intent
Dado el `dni` real de un asistente y su `invitacion` presentada, retorna `true` si AMBOS
`nombre` y `apellido` coinciden exactamente entre los dos documentos, `false` si al menos uno
difiere.

## Interface
```js
function matchesIdentity(dni, invitacion) {
  // dni: { nombre: string, apellido: string, ... }
  // invitacion: { nombre: string, apellido: string, ... }
  // retorna: boolean
}
```

## Invariants
- Retorna `dni.nombre === invitacion.nombre && dni.apellido === invitacion.apellido` (igualdad
  estricta, case-sensitive, sin trimear ni normalizar).
- Funcion pura: no modifica `dni` ni `invitacion`.

## Examples
1. Input: `matchesIdentity({nombre:'Ana',apellido:'Gomez'}, {nombre:'Ana',apellido:'Gomez'})`
   -> Output: `true`
2. Input: `matchesIdentity({nombre:'Ana',apellido:'Gomez'}, {nombre:'Beto',apellido:'Gomez'})`
   -> Output: `false`

## Do / Don't
- DO: usar igualdad estricta (`===`) para ambos campos.
- DON'T: no normalices mayusculas/minusculas ni espacios -- la comparacion es literal.

## Tests
Property-tests congelados en `web/engine/matchesIdentity.test.js` (no editables por el
implementador):
1. Nombre y apellido coinciden -> true.
2. Nombre distinto -> false.
3. Apellido distinto -> false.
4. Ambos distintos -> false.
5. Distinta capitalizacion -> false (comparacion case-sensitive).

## Constraints
- Sin dependencias externas (Node puro) -- `deps_allowed: []`.
- El archivo `web/engine/matchesIdentity.js` exporta `matchesIdentity` como `module.exports`.
- PARAR y reportar si: el contrato no se puede cumplir dentro del budget sin violar la interfaz
  (no deberia ocurrir; es una comparacion de 2 campos).
