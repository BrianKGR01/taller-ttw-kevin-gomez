# ADR-013 — Vista de presentador propia, sincronizada por BroadcastChannel

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 4

---

## Contexto

La tecla `S` abre una ventana aparte con: diapositiva actual, siguiente, notas del expositor del bloque, tiempo sugerido del bloque (tabla "Tiempos" del taller) y cronómetro, sincronizada con la ventana principal. Las secciones "Tiempos", "Nota del expositor" y "Si vas corto de tiempo" del contenido solo se ven aquí.

## Opciones consideradas

**A — Plugin de notas de Reveal.js.** Descartado con el motor (ADR-003).

**B — Una página `/presentador/` que incrusta la propia presentación en dos `<iframe>` (actual y siguiente) y se comunica por `BroadcastChannel`.** Las miniaturas son la presentación real (mismos tokens, mismo tema, mismas animaciones), no una maqueta que se pueda desincronizar del diseño.

**C — Dibujar miniaturas con capturas o SVG.** Obliga a mantener dos renderizados.

## Decisión

**Opción B.**

- Protocolo mínimo y validado (`src/lib/sincronizacion.ts`): la ventana principal publica `estado {b,d,p,id}`; el presentador envía `comando` (siguiente, anterior, bloque…) y `hola` (pedir el estado, con reintentos hasta que alguien responda). Se descarta todo mensaje con otra forma y se ignoran los campos extra. Los iframes reciben `ir {b,d,p}` por `postMessage` del mismo origen.
- La página incrustada se reconoce por `?embebido`: sin barra, sin pie, sin fondo vivo, sin sincronización propia. La siguiente miniatura muestra el siguiente **paso** (si la diapositiva actual aún tiene pasos por revelar) o la siguiente diapositiva.
- Cronómetro con pausa que arranca solo con el primer avance (o a mano), tiempo acumulado por bloque contra el presupuesto de la versión elegida (30′ reales o guion de 60′, guardada en `localStorage`) y estados holgado / atención (85 %) / excedido.
- `S` o el botón abren `window.open('/presentador/', 'taller-presentador')`; si el navegador bloquea la ventana emergente se anuncia por la región `aria-live`.

## Consecuencias

**A favor.** Miniaturas fieles; el presentador puede mandar con teclado o botones; la lógica del protocolo y del cronómetro se prueba en unitarios, y la sincronización real entre dos ventanas, en E2E.

**En contra.** Dos iframes cargan la presentación completa (mitigado: la caché del navegador la sirve una sola vez y sin fondo vivo). Solo funciona en el mismo navegador y perfil (BroadcastChannel); si el presentador usa otro dispositivo, esta vista no sirve. Safari anterior a 15.4 no tiene BroadcastChannel: la presentación funciona, sin presentador.

## Cómo se revierte

Barato: `src/pages/presentador.astro`, `src/cliente/presentador.ts` y `src/cliente/sincronizacion.ts` son los únicos que lo conocen.
