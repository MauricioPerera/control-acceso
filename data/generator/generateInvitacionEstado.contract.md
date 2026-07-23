---
task: generate-invitacion-estado
intent: Generar los campos de estado independientes de una invitacion.
target: data/generator/generateInvitacionEstado.js
signature: "function generateInvitacionEstado(domains, rng)"
language: javascript
budget:
  cyclomatic_max: 2
  nesting_max: 1
  params_max: 2
  lines_max: 8
tests: data/generator/generateInvitacionEstado.test.js
test_command: "node --test generateInvitacionEstado.test.js"
deps_allowed: []
forbids: ["Math.random", "Date.now", "process.env"]
spec_version: "0.2"
require_test_approval: false
---

## Intent
Dado `domains`, retorna los 2 campos de estado de una invitacion que se eligen al azar del
dominio, sin ningun valor "verdadero" que igualar: `categoriaAcceso` y `fechaVigencia`.

## Interface
```js
function generateInvitacionEstado(domains, rng) {
  // domains: { categoriaAcceso: string[], fechaVigencia: string[] }
  // rng: () => number
  // retorna: { categoriaAcceso: string, fechaVigencia: string }
}
```

## Invariants
- `categoriaAcceso` se obtiene PRIMERO: se consume una llamada a `rng()` (`r`) y se asigna
  `domains.categoriaAcceso[Math.floor(r * domains.categoriaAcceso.length)]`.
- `fechaVigencia` se obtiene DESPUES, de la misma forma con `domains.fechaVigencia`.
- El orden de consumo de `rng()` es SIEMPRE: categoriaAcceso, luego fechaVigencia (2 llamadas
  totales).
- El resultado tiene EXACTAMENTE las keys `categoriaAcceso`, `fechaVigencia` -- ninguna otra.

## Examples
1. Input: `generateInvitacionEstado({categoriaAcceso:['general','vip','staff','prensa'],
   fechaVigencia:['2026-06-01','2026-07-01','2026-08-01']}, rng)` con `rng` devolviendo
   `[0.5, 0.0]` -> Output: `{categoriaAcceso:'staff', fechaVigencia:'2026-06-01'}`
   (floor(0.5*4)=2->'staff'; floor(0*3)=0->'2026-06-01').
2. Mismo input con `rng` devolviendo `[0.0, 0.999999]` -> `fechaVigencia:'2026-08-01'` (ultimo
   elemento del dominio).

## Do / Don't
- DO: seguir el orden exacto categoriaAcceso -> fechaVigencia.
- DO: usar `Math.floor(r * array.length)` tal cual para las selecciones de indice.
- DON'T: no agregues ninguna key extra al resultado.

## Tests
Property-tests congelados en `data/generator/generateInvitacionEstado.test.js` (no editables por
el implementador):
1. Ambas keys en el orden correcto con los indices esperados.
2. `r=0` exacto -> primer elemento de cada dominio.
3. `fechaVigencia` con `r` cercano a 1 -> ultimo elemento del dominio.
4. Consume exactamente 2 llamadas a rng.
5. El resultado tiene EXACTAMENTE esas 2 keys, sin ninguna extra.

## Constraints
- Sin dependencias externas (Node puro) -- `deps_allowed: []`.
- El archivo `data/generator/generateInvitacionEstado.js` exporta `generateInvitacionEstado` como
  `module.exports`.
- PARAR y reportar si: el contrato no se puede cumplir dentro del budget sin violar la interfaz
  (no deberia ocurrir; son 2 calculos independientes).
