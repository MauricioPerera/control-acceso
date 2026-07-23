# Control de Acceso

Juego de control de acceso a un evento, estilo *Papers, Please*: revisás gente en la puerta,
comparás su DNI contra su invitación y decidís **aprobar**, **rechazar** o **detener** según el
reglamento vigente — que va sumando reglas turno a turno y nunca las saca.

**Jugar:** https://mauricioperera.github.io/control-acceso/web/index.html

## Cómo se juega

- Al abrir el juego hay una pantalla de bienvenida para elegir idioma y leer "Cómo jugar" antes
  de arrancar el turno 1.
- Cada asistente llega con un **DNI** (dato real, siempre verdadero) y una **Invitación** (puede
  estar falsificada o no coincidir con el DNI).
- Deslizá la tarjeta (o usá los botones): derecha = aprobar, izquierda = rechazar. El botón
  **Detener** es aparte, para los casos que el reglamento marca como graves — detener
  correctamente paga un bono extra sobre el pago base.
- El reglamento nunca te dice si algo "es válido" — siempre te muestra el dato crudo (fecha,
  código, sello) para que **vos** lo compares contra la regla.
- Cada turno tiene un tiempo límite total (no por persona) y un requisito mínimo de dinero para
  no quedar despedido. Los errores tienen un límite aparte. Lo que ganás de más sobre el
  requisito se guarda como ahorro; entre turno y turno hay una tienda (mejoras permanentes o
  consumibles de un solo turno) o un evento narrativo aleatorio.
- Los primeros 14 turnos tienen reglamento fijo (con su propia narrativa: sellos, códigos QR,
  una invitación reportada como robada, etc). **A partir del turno 15 el reglamento se genera y
  se modifica solo** — reglas nuevas al azar (campo prohibido, categoría prohibida, código
  específico, paridad par/impar, reglas compuestas que combinan varios campos) o un
  endurecimiento de la regla de vigencia existente. El juego es infinito: no hay pantalla de
  Victoria, solo termina cuando perdés (por errores o por no cubrir el requisito).
- Disponible en español, inglés y portugués (selector en la pantalla de bienvenida o en el header).

## Estructura del proyecto

```
data/generator/     Generación de datos: dominios, mutación de perfiles, RNG con semilla,
                     generación de la invitación (identidad / estado / seguridad)
web/engine/          Motor de reglas: evaluar una regla, determinar la acción correcta,
                     interpretar el swipe, comparar identidad/código de barras
web/                 UI del juego: index.html, app.js (loop de juego), reglamento.js
                     (reglas por turno), i18n.js (traducciones), style.css
```

Cada función de `data/generator/` y `web/engine/` tiene su contrato (`*.contract.md`) y su
suite de tests congelada (`*.test.js`) al lado, con las invariantes y ejemplos resueltos que
describen su comportamiento — son la documentación de referencia de cada pieza del motor.

## Arquitectura

- **RNG determinista con semilla** (`rng.js`): toda la generación de asistentes es reproducible
  dado el mismo seed, compartida entre el generador y la lógica del juego en el navegador.
- **Archivos duales Node/navegador**: cada módulo de `data/generator/` y `web/engine/` funciona
  tanto bajo `node --test` (via `module.exports`) como `<script>` clásico en el navegador (via
  `window.Engine.fn`), sin bundler ni build step.
- **Reglamento como datos**: `web/reglamento.js` define los 14 turnos fijos como configuración
  declarativa (tipo de regla, filtro, acción si se viola); `web/engine/evaluateRule.js` y
  `determineCorrectAction.js` son el intérprete genérico que las evalúa. `matchesFilter.js`
  soporta los tipos `exact`, `dateRange`, `text`, `boolean`, `paridad` (par/impar de un campo
  numérico) y `todas` (AND de sub-filtros, para reglas compuestas) — todo bajo el mismo tipo de
  regla `'documento'`, sin lógica nueva en `evaluateRule.js`.
- **Reglamento infinito desde el turno 15**: `generarSiguienteTurno()` en `reglamento.js` usa el
  mismo RNG con semilla del juego para agregar una regla nueva (elegida de un pool de plantillas)
  o endurecer la regla de vigencia existente, cada vez que se agotan los turnos fijos. Las reglas
  generadas guardan su texto como datos estructurados (`descripcionGen`) en vez de una clave de
  traducción fija, y `app.js` las renderiza con `I18N.t()` en el momento de mostrarlas — así el
  cambio de idioma en vivo también actualiza las reglas generadas dinámicamente.
- **i18n simple sin build**: `web/i18n.js` expone un diccionario `es/en/pt` y un helper `t()`;
  los textos estáticos se marcan con `data-i18n` en el HTML y los dinámicos llaman a `I18N.t()`
  desde `app.js`. El idioma persiste en `localStorage`.

## Correr localmente

No requiere build ni dependencias — es HTML/JS estático servido tal cual:

```bash
python -m http.server 8124
```

y abrir `http://localhost:8124/web/index.html`.

## Tests

Cada función de generación y de motor tiene tests unitarios con Node nativo (sin dependencias
externas), 77 en total:

```bash
cd data/generator && node --test *.test.js   # 31 tests
cd web/engine && node --test *.test.js       # 46 tests
```

## Deploy

Se sirve desde GitHub Pages, rama `master`, raíz del repo (el `.nojekyll` evita que GitHub Pages
procese el sitio con Jekyll). Cualquier push a `master` se refleja automáticamente en la URL de
juego de arriba.
