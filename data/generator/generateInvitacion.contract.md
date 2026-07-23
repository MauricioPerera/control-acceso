---
task: generate-invitacion
intent: Generar el ticket de invitacion de un asistente, con posible discrepancia frente a su DNI real.
target: data/generator/generateInvitacion.js
signature: "function generateInvitacion(dni, config, domains, rng)"
language: javascript
budget:
  cyclomatic_max: 6
  nesting_max: 2
  params_max: 4
  lines_max: 20
tests: data/generator/generateInvitacion.test.js
test_command: "node --test generateInvitacion.test.js"
deps_allowed: ["./rollTestimonyValue.js"]
forbids: ["Math.random", "Date.now", "process.env"]
spec_version: "0.1"
require_test_approval: false
---

## Intent
Dado el `dni` real de un asistente (`nombre`, `apellido`), un `config` con probabilidades, un
`domains` con los dominios de nombre/apellido/categoriaAcceso, y un `rng`, retorna la invitacion
que el asistente presenta: puede o no coincidir con su dni real, y su categoria/vigencia son
independientes del dni.

## Interface
```js
function generateInvitacion(dni, config, domains, rng) {
  // dni: { nombre: string, apellido: string }
  // config: { matchProbability: number, vigenciaProbability: number }  -- ambos en [0,1]
  // domains: { nombre: string[], apellido: string[], categoriaAcceso: string[] }
  // rng: () => number
  // retorna: { nombre: string, apellido: string, categoriaAcceso: string, vigente: boolean }
}
```

## Invariants
- `nombre` se obtiene con `require('./rollTestimonyValue.js').rollTestimonyValue(dni.nombre,
  config.matchProbability, domains.nombre, rng)` (ya implementado y verificado).
- `apellido` se obtiene DESPUES, de la misma forma:
  `rollTestimonyValue(dni.apellido, config.matchProbability, domains.apellido, rng)`.
- `categoriaAcceso` se obtiene DESPUES de nombre y apellido: se consume una llamada a `rng()`
  (`r`) y se asigna `domains.categoriaAcceso[Math.floor(r * domains.categoriaAcceso.length)]`
  (independiente del dni, no hay "categoria verdadera" que igualar).
- `vigente` se obtiene AL FINAL: se consume una ultima llamada a `rng()` (`r`) y
  `vigente = r < config.vigenciaProbability`.
- El orden de consumo de `rng()` es SIEMPRE: nombre, luego apellido, luego categoriaAcceso, luego
  vigente (cada uno de los dos primeros consume 1 o 2 llamadas segun la logica interna de
  `rollTestimonyValue`; categoriaAcceso y vigente consumen exactamente 1 cada uno).

## Examples
1. Input: `generateInvitacion({nombre:'Ana',apellido:'Gomez'}, {matchProbability:1,
   vigenciaProbability:0.8}, {nombre:['Ana','Beto'], apellido:['Gomez','Diaz'],
   categoriaAcceso:['general','vip','staff','prensa']}, rng)` con `rng` devolviendo
   `[0.0, 0.0, 0.5, 0.9]` -> Output: `{nombre:'Ana', apellido:'Gomez', categoriaAcceso:'staff',
   vigente:false}` (match total: r1<1 en ambos nombres; categoria indice floor(0.5*4)=2='staff';
   vigente: 0.9<0.8 es false).
2. Input: mismos domains/config salvo `matchProbability:0`, con `rng` devolviendo
   `[0.5, 0.0, 0.5, 0.0, 0.25, 0.9]` -> Output: `{nombre:'Beto', apellido:'Diaz',
   categoriaAcceso:'vip', vigente:false}` (mismatch forzado en ambos nombres, cada uno consume 2
   llamadas).

## Do / Don't
- DO: usar `require('./rollTestimonyValue.js').rollTestimonyValue` para nombre y apellido -- no
  reimplementar esa logica.
- DO: respetar el ORDEN exacto de consumo de `rng()` (nombre, apellido, categoriaAcceso, vigente).
- DON'T: no uses `Math.random()`.
- DON'T: no valides que `categoriaAcceso` "coincida" con nada del dni -- es siempre independiente.

## Tests
Property-tests congelados en `data/generator/generateInvitacion.test.js` (no editables por el
implementador), con `fakeRng` de secuencia fija (oraculo independiente, usando el
`rollTestimonyValue` REAL ya verificado como dependencia):
1. `matchProbability=1` -> nombre/apellido coinciden con el dni.
2. `matchProbability=0` -> nombre/apellido siempre distintos.
3. `vigente=true` cuando el roll de vigencia cae debajo de `vigenciaProbability`.
4. `categoriaAcceso` con `r=0` -> primer elemento del dominio.
5. `categoriaAcceso` con `r` cercano a 1 -> ultimo elemento del dominio.

## Constraints
- Unica dependencia permitida: `./rollTestimonyValue.js` -- `deps_allowed`.
- El archivo `data/generator/generateInvitacion.js` exporta `generateInvitacion` como
  `module.exports`.
- PARAR y reportar si: el contrato no se puede cumplir dentro del budget sin violar la interfaz
  (no deberia ocurrir; son 2 llamadas delegadas + 2 rolls propios).
