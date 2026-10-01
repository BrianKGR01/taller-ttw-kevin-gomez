# ADR-003 — Astro (sitio estático) en lugar de Reveal.js, Slidev o una implementación mínima

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 1

---

## Contexto

La presentación se proyecta en sala y se comparte por QR para leer en celular. Pide: navegación 2D (bloques × diapositivas), URL por diapositiva, vista general, vista de presentador, **dos modos sobre el mismo contenido** (presentación y lectura), el sistema de diseño de GDG Santa Cruz (tokens de tres capas, escala medida contra la altura del viewport), contenido editable en archivos de texto y un sitio estático sin backend.

Se verificaron versiones en la documentación oficial el 2026-10-01: Astro 7.3 (Node ≥ 22.12), Tailwind CSS 4.3 con `@tailwindcss/vite`, Vitest 5, Playwright 1.63, `marked` 18.

## Opciones consideradas

**A — Reveal.js (6.x).** Madura y completa: navegación 2D, swipe, vista general, notas y URLs por diapositiva resueltas. Pero su modelo es un lienzo de tamaño fijo escalado con `transform`: choca con la escala de proyección en `svh` del sistema de diseño (el texto escalaría por transformación, no por tokens), la vista de lectura es una variante aparte de la misma maquinaria, y el diseño propio (tablas que entran por lados, recorrido de cámara sobre documentos, ciclo animado) acaba peleando contra sus estilos y su ciclo de vida. Cada ajuste visual se hace contra el framework.

**B — Slidev.** Markdown de primera clase y modo presentador, pero trae Vue y UnoCSS (el sistema de diseño exige Tailwind v4 con `@theme inline`), no tiene modo lectura, y es una SPA pensada para exportar, no para leerse en celular.

**C — Vite + TypeScript a mano, sin framework de sitio.** Máximo control, pero obliga a reinventar el contenido en Markdown, las imágenes optimizadas y la generación de HTML estático.

**D — Astro + TypeScript + Tailwind v4 (el puente del sistema de diseño) con lógica de navegación propia, pura y probada.**

## Decisión

**Opción D.** Astro entrega HTML estático con todas las diapositivas en el DOM (sirve igual para presentación, lectura, motores de búsqueda y vistas previas de enlace), colecciones de contenido tipadas para los archivos Markdown, y optimización de imágenes. El motor de navegación (`src/lib/`) son funciones puras sin DOM: es lo que se prueba con tests unitarios. Los dos modos son el mismo DOM con otra disposición (ADR-005).

No se adopta Reveal.js por la razón de fondo: la escala por transformación contradice la regla de que las diapositivas se miden contra el viewport con tokens, y la vista de presentador y el modo lectura habría que construirlos igual alrededor del framework.

## Consecuencias

**A favor.** Control total del diseño, cero JavaScript de framework en el cliente, lógica de navegación testeable, contenido y componentes separados, build rápido.

**En contra.** Hay que mantener el motor propio (navegación, rueda, gestos, hash) y la vista de presentador (ADR-013). Se asume más código que con Reveal, a cambio de que cada decisión visual obedezca al sistema de diseño sin excepciones. Si un autor externo quisiera editar con una interfaz tipo PowerPoint, esto no la ofrece.

**Señal de revisión.** Si el motor propio empieza a acumular casos de borde que Reveal ya resolvía (accesibilidad de la vista general, impresión a PDF), reconsiderar usar Reveal solo como motor de navegación.

## Cómo se revierte

Una semana. El contenido (Markdown) y los componentes de diapositiva son independientes del motor; lo que se reescribiría es `src/cliente/principal.ts` y `src/lib/`.
