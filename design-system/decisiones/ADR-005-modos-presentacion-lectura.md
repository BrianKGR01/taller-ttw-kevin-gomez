# ADR-005 — Presentación y lectura son el mismo DOM con otra disposición

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 1

---

## Contexto

Dos usos: proyectar en la sala (una diapositiva a la vez, texto enorme) y leer en el celular (scroll vertical continuo, con el material completo: prompts, plantillas, tablas). En pantallas chicas el modo por defecto es lectura; se fuerza por `?modo=presentacion` o `?modo=lectura`.

## Opciones consideradas

**A — Dos páginas o dos árboles de componentes.** Cada modo optimizado, pero el contenido se duplica y se desincroniza.

**B — Un solo DOM; el modo se expresa en `html[data-uso]` y cambia la disposición por CSS.** Todas las diapositivas están siempre en el HTML estático. En presentación solo una es visible (`data-activa`); en lectura todas fluyen en una columna.

**C — Un modo solo, que se adapta.** No cubre el material de lectura (detalle que en la sala sobra).

## Decisión

**Opción B.** El modo se decide **antes del primer pintado** con el mismo script en línea que restaura el tema (prioridad: parámetro de URL > elección guardada con el botón > ancho ≤ 820 px ⇒ lectura). Sin JavaScript el HTML es la versión de lectura completa.

En lectura se redefinen los tokens `--proy-*` apuntando a la escala de lectura (`--escala-*`), de modo que los mismos componentes se ven bien sin duplicar CSS. Lo que viene después de `<!-- lectura -->` en un archivo de contenido solo se muestra en este modo. Las aperturas de fase se ocultan en lectura (la cabecera del bloque cumple su función).

## Consecuencias

**A favor.** Un solo contenido, cero divergencia; el HTML sirve a buscadores y a vistas previas de enlace; la tecla `L` alterna sin recargar.

**En contra.** ~45 diapositivas en el DOM siempre (peso de HTML ≈ decenas de KB, aceptable). Los componentes deben funcionar en ambas disposiciones y se prueban en las dos (E2E de escritorio y celular).

## Cómo se revierte

Barato mientras los componentes no dependan de `data-uso` para su lógica (hoy solo CSS y el cliente).
