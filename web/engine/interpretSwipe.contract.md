---
task: interpret-swipe
intent: Traducir el desplazamiento horizontal de un arrastre a una decision o ninguna.
target: web/engine/interpretSwipe.js
signature: "function interpretSwipe(deltaX, deltaY, threshold)"
language: javascript
budget:
  cyclomatic_max: 4
  nesting_max: 1
  params_max: 3
  lines_max: 10
tests: web/engine/interpretSwipe.test.js
test_command: "node --test interpretSwipe.test.js"
deps_allowed: []
forbids: ["Math.random", "Date.now", "process.env"]
spec_version: "0.1"
require_test_approval: false
---

## Intent
Dado el desplazamiento horizontal (`deltaX`) y vertical (`deltaY`, ignorado) de un arrastre de
tarjeta, y un `threshold` en pixeles, retorna `'aprobar'` si el arrastre fue suficientemente hacia
la derecha, `'rechazar'` si fue suficientemente hacia la izquierda, o `null` si todavia no alcanzo
el umbral en ninguna direccion.

## Interface
```js
function interpretSwipe(deltaX, deltaY, threshold) {
  // deltaX: number (positivo = derecha, negativo = izquierda)
  // deltaY: number (no afecta el resultado, se ignora)
  // threshold: number positivo (pixeles minimos para comprometer la decision)
  // retorna: 'aprobar' | 'rechazar' | null
}
```

## Invariants
- `deltaX > threshold`: retorna `'aprobar'`.
- `deltaX < -threshold`: retorna `'rechazar'`.
- En cualquier otro caso (incluyendo `deltaX === threshold` o `deltaX === -threshold`, bordes
  exactos): retorna `null`.
- `deltaY` NUNCA afecta el resultado, sin importar su valor.

## Examples
1. Input: `interpretSwipe(150, 0, 100)` -> Output: `'aprobar'`
2. Input: `interpretSwipe(-150, 500, 100)` -> Output: `'rechazar'` (deltaY=500 se ignora)
3. Input: `interpretSwipe(100, 0, 100)` -> Output: `null` (borde exacto, no comprometido)

## Do / Don't
- DO: usar comparaciones estrictas `>` y `<` (no `>=`/`<=`) contra `threshold`/`-threshold`.
- DON'T: no uses `deltaY` en ninguna condicion del resultado.

## Tests
Property-tests congelados en `web/engine/interpretSwipe.test.js` (no editables por el
implementador):
1. `deltaX` mayor al umbral -> aprobar.
2. `deltaX` menor a `-umbral` -> rechazar.
3. `deltaX` dentro del rango -> null.
4. Bordes exactos (`deltaX === threshold` o `=== -threshold`) -> null.
5. `deltaY` no afecta el resultado en ningun caso.

## Constraints
- Sin dependencias externas (Node puro) -- `deps_allowed: []`.
- El archivo `web/engine/interpretSwipe.js` exporta `interpretSwipe` como `module.exports`.
- PARAR y reportar si: el contrato no se puede cumplir dentro del budget sin violar la interfaz
  (no deberia ocurrir; son 2 comparaciones).
