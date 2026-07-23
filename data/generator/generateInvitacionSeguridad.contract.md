---
task: generate-invitacion-seguridad
intent: Declarar los codigos de seguridad de una invitacion comparados contra la referencia oficial.
target: data/generator/generateInvitacionSeguridad.js
signature: "function generateInvitacionSeguridad(referencias, matchProbability, domains, rng)"
language: javascript
budget:
  cyclomatic_max: 4
  nesting_max: 1
  params_max: 4
  lines_max: 12
tests: data/generator/generateInvitacionSeguridad.test.js
test_command: "node --test generateInvitacionSeguridad.test.js"
deps_allowed: ["./rollTestimonyValue.js"]
forbids: ["Math.random", "Date.now", "process.env"]
spec_version: "0.1"
require_test_approval: false
---

## Intent
Dadas las `referencias` oficiales (sello y QR vigentes hoy), una `matchProbability`, y `domains`,
retorna el `codigoSello` y `codigoQR` que la invitacion declara: cada uno coincide con la
referencia oficial con probabilidad `matchProbability`, o es un valor distinto (sello/QR
falsificado) en caso contrario.

## Interface
```js
function generateInvitacionSeguridad(referencias, matchProbability, domains, rng) {
  // referencias: { sello: string, qr: string }  -- el sello/QR oficial vigente
  // matchProbability: number en [0, 1]
  // domains: { codigoSello: string[], codigoQR: string[] }
  // rng: () => number
  // retorna: { codigoSello: string, codigoQR: string }
}
```

## Invariants
- `codigoSello` se obtiene PRIMERO con
  `require('./rollTestimonyValue.js').rollTestimonyValue(referencias.sello, matchProbability,
  domains.codigoSello, rng)`.
- `codigoQR` se obtiene DESPUES, de la misma forma con `referencias.qr` y `domains.codigoQR`.
- El orden de consumo de `rng()` es SIEMPRE: codigoSello, luego codigoQR (cada uno consume 1 o 2
  llamadas segun la logica interna de `rollTestimonyValue`).
- El resultado tiene EXACTAMENTE las keys `codigoSello`, `codigoQR` -- ninguna otra.

## Examples
1. Input: `generateInvitacionSeguridad({sello:'aguila-dorada', qr:'QR-2026-A7X'}, 1,
   {codigoSello:['aguila-dorada','leon-plateado','estrella-real'],
   codigoQR:['QR-2026-A7X','QR-2026-B3M','QR-2026-C9K']}, rng)` con `rng` devolviendo `[0.0, 0.0]`
   -> Output: `{codigoSello:'aguila-dorada', codigoQR:'QR-2026-A7X'}` (coincide todo, matchProbability=1).
2. Mismo input con `matchProbability=0` y `rng` devolviendo `[0.5,0.0, 0.5,0.0]` -> Output:
   `{codigoSello:'leon-plateado', codigoQR:'QR-2026-B3M'}` (ambos siempre distintos).

## Do / Don't
- DO: usar `require('./rollTestimonyValue.js').rollTestimonyValue` para ambos campos -- no
  reimplementar esa logica.
- DO: respetar el ORDEN exacto (codigoSello, luego codigoQR).
- DON'T: no agregues ninguna key extra al resultado.

## Tests
Property-tests congelados en `data/generator/generateInvitacionSeguridad.test.js` (no editables
por el implementador), usando el `rollTestimonyValue` REAL ya verificado como dependencia:
1. `matchProbability=1` -> ambos coinciden con la referencia.
2. `matchProbability=0` -> ambos siempre distintos.
3. Orden exacto de consumo de rng (codigoSello, luego codigoQR).
4. El resultado tiene EXACTAMENTE esas 2 keys, sin ninguna extra.

## Constraints
- Unica dependencia permitida: `./rollTestimonyValue.js` -- `deps_allowed`.
- El archivo `data/generator/generateInvitacionSeguridad.js` exporta
  `generateInvitacionSeguridad` como `module.exports`.
- PARAR y reportar si: el contrato no se puede cumplir dentro del budget sin violar la interfaz
  (no deberia ocurrir; son 2 llamadas delegadas).
