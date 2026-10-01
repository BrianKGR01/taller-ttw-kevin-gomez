# ADR-002 — Google Sans autohospedada como tipografía del sitio

**Estado:** aceptada
**Fecha:** 2026-07-30
**Fase del roadmap:** 1

---

## Contexto

El Community Kit de Google Developer Groups define Google Sans como tipografía principal y
Google Sans Mono como secundaria, y ofrece descarga a los organizers. La duda era si esa
descarga habilita autohospedar los archivos en un sitio web público: Google Sans no es una
fuente de distribución libre y no está en Google Fonts.

El organizer del capítulo revisó los términos de la descarga del kit y confirmó que el uso
cubre este caso: un sitio oficial de un capítulo GDG, con material de GDG.

Sin la fuente de marca, el sitio pierde buena parte de lo que lo hace reconocible como GDG.
Con ella, la web queda alineada con los artes que ya circulan en redes.

## Opciones consideradas

**A — Google Sans autohospedada.** Fidelidad total a la marca. Requiere que la licencia lo permita.

**B — Sustituta libre (Figtree, Inter, Roboto Flex).** Cero riesgo de licencia, disponible en
cualquier CDN, buen carácter geométrico-humanista. Pero se nota: el sitio deja de verse
exactamente como el resto de la comunicación del capítulo.

**C — Híbrido.** Google Sans solo en titulares y una libre para texto corrido. Reduce el peso
servido y la exposición, pero mezcla dos personalidades tipográficas sin una razón de diseño real.

## Decisión

**Opción A.** Google Sans para display y body, Google Sans Mono para el rol de metadatos.
Autohospedadas desde el propio sitio, no desde un CDN externo.

Condiciones de implementación:

- Se sirven **solo los pesos y variantes que el diseño usa** — no la familia completa.
- Los archivos viven en el repo del sitio y se usan solo para este sitio. No se enlazan
  desde otros proyectos ni se expone la carpeta como si fuera un CDN de fuentes.
- La pila de respaldo debe ser una fuente real y parecida, no `sans-serif` genérico,
  para que un fallo de carga no cambie la métrica de la página.
- Se copia el texto de la licencia del kit junto a los archivos de fuente, para que el
  próximo organizer sepa bajo qué condición están ahí.

## Consecuencias

**A favor.** El sitio se ve como GDG. Coincide con los artes de Instagram, que es de donde
viene la mayoría del tráfico. No hay dependencia de un CDN de terceros.

**En contra.** Los archivos de fuente pesan y hay que gestionarlos bien para no penalizar la
carga. Y la decisión depende de una interpretación de términos hecha por el equipo: si Google
cambia las condiciones del kit, o si alguien del programa observa el uso, hay que revisarla.

**Señal de revisión.** Si en algún momento la licencia deja de cubrir esto, la opción B ya está
identificada y el cambio es barato: la tipografía se define en la capa de tokens, así que
sustituirla es editar tokens, no componentes.

## Cómo se revierte

Barato. Cambiar la familia en la capa de tokens y quitar los archivos. Una hora, más el ajuste
fino de escala si la sustituta tiene métricas distintas.
