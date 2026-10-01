# ADR-004 — URL por diapositiva `#/bloque/diapositiva` y navegación 2D

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 1

---

## Contexto

Hay que poder compartir una diapositiva puntual (`#/5/3`) y recargar sin perder el sitio. La navegación es 2D: izquierda/derecha entre bloques, arriba/abajo entre diapositivas del bloque; además Espacio, PageUp/PageDown, Inicio/Fin, rueda, táctil y clicker. Las diapositivas tienen pasos de revelado (listas, preguntas del hotel).

## Opciones consideradas

**A — Índices de Reveal (base 0): `#/5/3` es el bloque 5, la cuarta diapositiva.** Es estándar, pero no coincide con lo que está impreso en la esquina de la diapositiva ("5.3"), lo que confunde a quien comparte un enlace.

**B — Etiquetas impresas: `#/B/N` con B el número de bloque y N el número dentro del bloque.** `#/5/3` abre la diapositiva 5.3. La apertura de fase es N = 0 (`#/3/0`). N ausente o inexistente abre la primera del bloque.

**C — Un solo número lineal (`#/21`).** Frágil: insertar una diapositiva rompe los enlaces ya compartidos.

## Decisión

**Opción B.** La URL dice lo que el público ve. Los números son los del contenido (frontmatter `n`), así que añadir diapositivas al final de un bloque no rompe enlaces anteriores.

Reglas de navegación (todas funciones puras en `src/lib/navegacion.ts`):

- `→` / `←`: primera diapositiva del bloque siguiente / anterior (ignora los pasos).
- `↓` / `↑`: pasos y luego diapositivas **sin salir del bloque**.
- `Espacio`, `PageDown`, rueda: pasos y luego la siguiente en orden lineal (cruza de bloque). `Shift+Espacio`, `PageUp`: inverso.
- `Inicio` / `Fin`: primera / última del taller.
- Rueda: un filtro con silencio y mínimo de tiempo impide los saltos dobles por inercia de trackpad.
- Táctil: swipe horizontal = bloque, vertical = avanzar/retroceder.
- `history.replaceState` (no `pushState`): el botón Atrás sale de la presentación, no recorre cien diapositivas.

## Consecuencias

**A favor.** URLs legibles y estables; la lógica entera se prueba sin navegador.

**En contra.** Un clicker que envía `→`/`←` salta de bloque en bloque y se "salta" las diapositivas intermedias (es lo que pide el diseño de navegación 2D). Los clickers configurados con `PageUp`/`PageDown` —el modo normal de los presentadores— avanzan en orden lineal. Los pasos no viajan en la URL: al recargar, la diapositiva vuelve a su estado inicial.

## Cómo se revierte

Una tarde: la función `aHash`/`desdeHash` es el único lugar que conoce el formato.
