# ADR-010 — Contenido en Markdown con frontmatter, separado de los componentes

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 1

---

## Contexto

"Corregir un texto tiene que tomar segundos." El contenido del taller vive en `taller-ia-desarrollo-software.md`; las notas del expositor, los tiempos y los "si no eres dev" no van en las diapositivas sino en la vista de presentador o como avisos.

## Decisión

Dos colecciones de Astro con esquema validado (Zod) en `src/content.config.ts`:

- `src/content/bloques/NN.md`: número, título, fase (0 a 6), tiempos de 60′ y 30′ y si abre con apertura de fase. **El cuerpo es la nota del expositor.**
- `src/content/diapositivas/B-N.md`: bloque, número `n`, `tipo` (portada, perfil, lista, tabla, prompt, remate…), título, etiquetas, `pasos`, `sinDev`, `notas` y un cuerpo Markdown.

El cuerpo se renderiza con `marked` en `src/lib/md.ts` (no con el Markdown de Astro, para controlar el marcado de los bloques de código con botón Copiar y de los pasos de revelado). Lo que va después de `<!-- lectura -->` solo se muestra en modo lectura. Los bloques de código usan ` ```prompt titulo="…" `.

Reglas: no se inventa contenido; si una diapositiva no entra, se divide (nuevo `n` al final del bloque, para no romper URLs ya compartidas). Los números duplicados dentro de un bloque hacen fallar el build.

## Consecuencias

**A favor.** Editar es abrir un `.md`; el build valida la estructura; los componentes no tienen texto del taller.

**En contra.** Los tipos de diapositiva son un vocabulario cerrado: una diapositiva con un diseño nuevo requiere un componente. El tipo `texto` queda como comodín.

## Cómo se revierte

Barato: el contenido es texto plano portable.
