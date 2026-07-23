---
task: generate-invitacion-identidad
intent: Generar los campos de identidad de una invitacion, con posible discrepancia frente al DNI.
target: data/generator/generateInvitacionIdentidad.js
signature: "function generateInvitacionIdentidad(dni, matchProbability, domains, rng)"
language: javascript
budget:
  cyclomatic_max: 4
  nesting_max: 1
  params_max: 4
  lines_max: 15
tests: data/generator/generateInvitacionIdentidad.test.js
test_command: "node --test generateInvitacionIdentidad.test.js"
deps_allowed: ["./rollTestimonyValue.js"]
forbids: ["Math.random", "Date.now", "process.env"]
spec_version: "0.1"
require_test_approval: false
---

## Intent
Dado el `dni` real de un asistente (`nombre`, `apellido`, `numeroDni`), una `matchProbability`, y
`domains`, retorna los 3 campos de identidad de la invitacion (`nombre`, `apellido`,
`codigoBarras`), cada uno coincidiendo con el dni con probabilidad `matchProbability` o siendo un
valor distinto en caso contrario.

## Interface
```js
function generateInvitacionIdentidad(dni, matchProbability, domains, rng) {
  // dni: { nombre: string, apellido: string, numeroDni: string }
  // matchProbability: number en [0, 1]
  // domains: { nombre: string[], apellido: string[], numeroDni: string[] }
  // rng: () => number
  // retorna: { nombre: string, apellido: string, codigoBarras: string }
}
```

## Invariants
- `nombre` se obtiene con `require('./rollTestimonyValue.js').rollTestimonyValue(dni.nombre,
  matchProbability, domains.nombre, rng)`.
- `apellido` se obtiene DESPUES, de la misma forma con `domains.apellido`.
- `codigoBarras` se obtiene AL FINAL, de la misma forma con `dni.numeroDni` y `domains.numeroDni`
  (representa el numero de DNI impreso en la invitacion, que deberia coincidir con el DNI real).
- El orden de consumo de `rng()` es SIEMPRE: nombre, luego apellido, luego codigoBarras.
- El resultado tiene EXACTAMENTE las keys `nombre`, `apellido`, `codigoBarras` -- ninguna otra.

## Examples
1. Input: `generateInvitacionIdentidad({nombre:'Ana',apellido:'Gomez',numeroDni:'30111222'}, 1,
   {nombre:['Ana','Beto'], apellido:['Gomez','Diaz'], numeroDni:['30111222','31222333']}, rng)`
   con `rng` devolviendo `[0.0, 0.0, 0.0]` -> Output:
   `{nombre:'Ana', apellido:'Gomez', codigoBarras:'30111222'}` (coincide todo, matchProbability=1).
2. Mismo dni/domains con `matchProbability=0` y `rng` devolviendo `[0.5,0.0, 0.5,0.0, 0.5,0.0]`
   -> Output: `{nombre:'Beto', apellido:'Diaz', codigoBarras:'31222333'}` (los 3 siempre distintos).

## Do / Don't
- DO: usar `require('./rollTestimonyValue.js').rollTestimonyValue` para los 3 campos -- no
  reimplementar esa logica.
- DO: respetar el ORDEN exacto (nombre, apellido, codigoBarras).
- DON'T: no agregues ninguna key extra al resultado.

## Tests
Property-tests congelados en `data/generator/generateInvitacionIdentidad.test.js` (no editables
por el implementador), usando el `rollTestimonyValue` REAL ya verificado como dependencia:
1. `matchProbability=1` -> los 3 campos coinciden con el dni.
2. `matchProbability=0` -> los 3 campos siempre distintos.
3. Orden exacto de consumo de rng (nombre, apellido, codigoBarras).
4. El resultado tiene EXACTAMENTE esas 3 keys, sin ninguna extra.

## Constraints
- Unica dependencia permitida: `./rollTestimonyValue.js` -- `deps_allowed`.
- El archivo `data/generator/generateInvitacionIdentidad.js` exporta `generateInvitacionIdentidad`
  como `module.exports`.
- PARAR y reportar si: el contrato no se puede cumplir dentro del budget sin violar la interfaz
  (no deberia ocurrir; son 3 llamadas delegadas).
