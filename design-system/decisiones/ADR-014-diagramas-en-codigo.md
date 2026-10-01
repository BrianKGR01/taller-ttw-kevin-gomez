# ADR-014 — Diagramas en HTML + CSS (con SVG solo para iconos y trazos)

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 2

---

## Contexto

Los diagramas del taller —ciclo completo, estructura de carpetas, roadmap por hitos, flujo de CI/CD con la notificación al celular— deben construirse en código y no como imágenes, verse nítidos en los dos modos, escalar con la escala de proyección y reorganizarse en celular. Además, varios se animan con los pasos de revelado.

## Opciones consideradas

**A — Un SVG por diagrama.** Nítido, pero el texto dentro de un `viewBox` se escala como imagen: en un celular de 360 px queda ilegible (un `font-size` de SVG no obedece a `--proy-*`), y hay que duplicar el SVG para tener una versión vertical.

**B — HTML + CSS para estructura y texto, SVG para iconos, flechas y trazos que se dibujan.** El texto usa los mismos tokens de tipografía que el resto; el diagrama se reorganiza con CSS (rejillas, subcuadrículas) sin duplicar nada.

**C — Imágenes exportadas.** Prohibido por las instrucciones.

## Decisión

**Opción B**, con una excepción justificada: el **ciclo** (`Ciclo.astro`) es un SVG con dos variantes (horizontal y vertical) porque su gesto central es dibujar aristas y nodos en secuencia, y los nodos son enlaces a cada fase. Su texto sí usa tokens de color, y las etiquetas se miden en unidades del `viewBox`.

- Los diagramas con fuente única: el árbol de carpetas se lee del mismo `.txt` que se descarga (`contenido-descargas/estructura-de-carpetas.txt`); los textos de los hitos y de la notificación viven en el `datos` del frontmatter. Nada de texto del taller dentro de los componentes.
- Los pasos de revelado también mueven el diagrama (`.diap[data-p]` + `[data-paso]`). El estado base es el final, de modo que lectura y `prefers-reduced-motion` salen correctos sin animación.
- La ilustración del celular con la notificación de CI/CD es ilustrativa, sin logos ni marcas de terceros; usa un dominio ficticio (`prueba.hotel.example`).

## Consecuencias

**A favor.** Un solo código para proyección, lectura y celular; cambios de tema sin recalcular nada; accesibles (texto real en el DOM).

**En contra.** Más CSS que un SVG; las flechas y conectores entre cajas son pequeños SVG o pseudo-elementos que hay que mantener alineados.

## Cómo se revierte

Cada diagrama es un componente aislado (`src/components/tipos/` y `src/styles/tipos/`).
