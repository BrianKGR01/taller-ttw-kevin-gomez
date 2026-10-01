# ADR-016 — Recorrido de cámara sobre documentos reales (AGENTS.md y roadmap)

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 2

---

## Contexto

Los ejemplos de `AGENTS.md` (diapositiva 5.11) y de roadmap (6.3) tienen valor didáctico por su estructura y su nivel de detalle, no por una captura. Las instrucciones piden mostrar **el documento completo renderizado como una hoja** dentro de la diapositiva, con una **cámara que recorre sección por sección** (zoom y desplazamiento lento hacia cada sección, título resaltado y una etiqueta breve que explica para qué sirve), que avanza con cada avance de la presentación, y sola si no hay interacción, y que **al terminar vuelve a la vista completa**. En modo lectura se muestran completos, con Copiar y Descargar.

## Decisión

- **Fuente única.** El documento se importa de `ejemplos/*.md`, se divide por `##` (`src/lib/documento.ts`) y la hoja es contenido real en el DOM (los lectores de pantalla lo leen completo). Las etiquetas de cada sección viven en el frontmatter de la diapositiva (`datos.secciones`) y **el build falla si no coinciden con los títulos reales y su orden**.
- **Pasos = secciones + 1.** El paso `p` del motor de navegación (ADR-004) es el estado del recorrido: 0 vista completa; 1…N una sección; N+1 vista completa otra vez. Retroceder funciona igual.
- **Cámara calculada en JS y animada por CSS.** `src/lib/camara.ts` (puro, con tests) calcula `translate3d + scale` con origen 0 0 a partir de la geometría de la sección; `transition` sobre `transform` lo ejecuta en la GPU. Una sección más alta que la vista tiene una **deriva lenta** hasta su final.
- **Hoja en columnas solo en presentación** (`datos.columnas`): una hoja de una columna con ~400 líneas es una cinta ilegible en la vista de pájaro; en 2 o 3 columnas, sin cortar secciones, se lee. La cámara también viaja en horizontal. En lectura es una sola columna.
- **Auto-avance** (`--mov-auto-avance`): solo con el recorrido iniciado, la diapositiva activa, sin panel abierto y con la pestaña visible; cualquier tecla, puntero o toque reinicia la espera. No arranca solo desde la vista inicial ni sale solo de la diapositiva desde la vista final.
- **Movimiento reducido:** la cámara salta sin transición, no hay auto-avance, y el contenedor se vuelve desplazable.
- **Hoja inerte:** los enlaces del documento se dibujan como texto (sus rutas relativas no existen en el sitio); los títulos bajan tres niveles para no romper la estructura de encabezados de la página; `overflow: clip` impide que un foco desplace la cámara.

## Consecuencias

**A favor.** Añadir un documento es sumar un `.md` y sus etiquetas; la lógica de la cámara se prueba sin navegador; los lectores de pantalla y la búsqueda ven el texto.

**En contra.** Los documentos deben mantener sus títulos `##` estables (el build avisa si cambian). Algunas etiquetas del roadmap ocupan dos líneas en el rótulo; se pueden acortar editando el `.md`.

## Cómo se revierte

Barato: `Documento.astro`, `documento.css`, `tour.ts`, `camara.ts` y `documento.ts` son los únicos que lo conocen.
