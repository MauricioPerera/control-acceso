---
task: generate-invitacion-estado
intent: Generar los campos de estado independientes de una invitacion.
target: data/generator/generateInvitacionEstado.js
signature: "function generateInvitacionEstado(config, domains, rng)"
language: javascript
budget:
  cyclomatic_max: 4
  nesting_max: 1
  params_max: 3
  lines_max: 15
tests: data/generator/generateInvitacionEstado.test.js
test_command: "node --test generateInvitacionEstado.test.js"
deps_allowed: []
forbids: ["Math.random", "Date.now", "process.env"]
spec_version: "0.1"
require_test_approval: false
---

## Intent
Dado un `config` con probabilidades, y `domains`, retorna los 4 campos de estado de una
invitacion que NO dependen de ningun valor "verdadero" a igualar: `categoriaAcceso` y
`fechaVigencia` (elegidos al azar del dominio) y `selloValido`/`qrValido` (booleanos
independientes segun sus propias probabilidades).

## Interface
```js
function generateInvitacionEstado(config, domains, rng) {
  // config: { selloProbability: number, qrProbability: number }  -- ambos en [0,1]
  // domains: { categoriaAcceso: string[], fechaVigencia: string[] }
  // rng: () => number
  // retorna: { categoriaAcceso: string, fechaVigencia: string, selloValido: boolean, qrValido: boolean }
}
```

## Invariants
- `categoriaAcceso` se obtiene PRIMERO: se consume una llamada a `rng()` (`r`) y se asigna
  `domains.categoriaAcceso[Math.floor(r * domains.categoriaAcceso.length)]`.
- `fechaVigencia` se obtiene DESPUES, de la misma forma con `domains.fechaVigencia`.
- `selloValido` se obtiene DESPUES: se consume una llamada a `rng()` (`r`) y
  `selloValido = r < config.selloProbability`.
- `qrValido` se obtiene AL FINAL, de la misma forma: `qrValido = r < config.qrProbability`.
- El orden de consumo de `rng()` es SIEMPRE: categoriaAcceso, fechaVigencia, selloValido, qrValido
  (uno cada uno, 4 llamadas totales).
- El resultado tiene EXACTAMENTE las keys `categoriaAcceso`, `fechaVigencia`, `selloValido`,
  `qrValido` -- ninguna otra.

## Examples
1. Input: `generateInvitacionEstado({selloProbability:0.8, qrProbability:0.7},
   {categoriaAcceso:['general','vip','staff','prensa'], fechaVigencia:['2026-06-01','2026-07-01','2026-08-01']}, rng)`
   con `rng` devolviendo `[0.5, 0.0, 0.1, 0.1]` -> Output:
   `{categoriaAcceso:'staff', fechaVigencia:'2026-06-01', selloValido:true, qrValido:true}`
   (floor(0.5*4)=2->'staff'; floor(0*3)=0->'2026-06-01'; 0.1<0.8 y 0.1<0.7 -> ambos true).
2. Mismo input con `rng` devolviendo `[0.0, 0.0, 0.9, 0.1]` -> `selloValido: false` (0.9 no es <0.8).

## Do / Don't
- DO: seguir el orden exacto categoriaAcceso -> fechaVigencia -> selloValido -> qrValido.
- DO: usar `Math.floor(r * array.length)` tal cual para las selecciones de indice.
- DON'T: no agregues ninguna key extra al resultado.

## Tests
Property-tests congelados en `data/generator/generateInvitacionEstado.test.js` (no editables por
el implementador):
1. Las 4 keys se calculan en el orden correcto con los indices/booleanos esperados.
2. `selloValido=false` cuando el roll supera `selloProbability`.
3. `qrValido=false` cuando el roll supera `qrProbability`.
4. `fechaVigencia` con `r` cercano a 1 selecciona el ultimo elemento del dominio.
5. El resultado tiene EXACTAMENTE esas 4 keys, sin ninguna extra.

## Constraints
- Sin dependencias externas (Node puro) -- `deps_allowed: []`.
- El archivo `data/generator/generateInvitacionEstado.js` exporta `generateInvitacionEstado` como
  `module.exports`.
- PARAR y reportar si: el contrato no se puede cumplir dentro del budget sin violar la interfaz
  (no deberia ocurrir; son 4 calculos independientes).
