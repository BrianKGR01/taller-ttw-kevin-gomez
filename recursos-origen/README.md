# recursos-origen

Carpeta de trabajo con recursos externos obtenidos el 2026-10-01. Los originales se conservan aquí; la web usa las versiones `.webp`.

## Tapas de libros (diapositiva 3.1)

| Archivo | Libro | Dimensiones |
|---|---|---|
| `libros/uml-guia-usuario.webp` | El Lenguaje Unificado de Modelado, 2.ª ed. (UML 2.0), Booch, Rumbaugh, Jacobson. Pearson / Addison-Wesley, español. ISBN 978-84-7829-076-5 (ISBN-10 8478290761) | 594 x 800 |
| `libros/uml-guia-usuario-original.jpg` | Original | 1900 x 2560 |
| `libros/proceso-unificado.webp` | El Proceso Unificado de Desarrollo de Software, Jacobson, Booch, Rumbaugh. Addison-Wesley / Pearson, español, 2000. ISBN 978-84-7829-036-9 (ISBN-10 8478290362) | 620 x 800 |
| `libros/proceso-unificado-original.jpg` | Original | 1236 x 1595 |

- Origen de las imágenes: imagen de producto de Amazon por ISBN-10 (`https://m.media-amazon.com/images/P/<ISBN10>.01._SCRM_.jpg`). Ambas verificadas visualmente: son las ediciones españolas correctas.
- Contrastadas con: Casa del Libro (`imagessl9.casadellibro.com/.../<ISBN13>.jpg`, mismas portadas en menor resolución) y Open Library (portada de UML, 371 x 500; no tiene la del Proceso Unificado en español).
- Nota: la portada de la 2.ª ed. española dice "El Lenguaje Unificado de Modelado" (sin el subtítulo "Guía del usuario"); es la edición de la Guía del usuario (ISBN 8478290761), distinta del "Manual de referencia" (ISBN 8478290877).
- Licencia: las portadas son material con copyright de Pearson Educación / Addison-Wesley. Se usan como ilustración de cita bibliográfica (uso de referencia en una presentación educativa, sin fines comerciales). No redistribuir fuera de ese contexto.
- Conversión: `sharp`, alto máx. 800 px, WebP calidad 82.

## Post de Uncle Bob (diapositiva 5.4)

- `post-unclebob.json`: **verificado: true**.
- Fuente real: https://x.com/unclebobmartin/status/2044114698451476492, consultado el 2026-10-01 en el navegador integrado, y contrastado con la API pública de syndication de X (`cdn.syndication.twimg.com/tweet-result`) y `api.fxtwitter.com` (texto completo).
- Autor: Uncle Bob Martin (@unclebobmartin). Fecha: 2026-04-14 18:04 UTC (14:04 hora de Bolivia). Es una respuesta a @wookash_podcast.
- El post es más largo que la frase de referencia "I don't review code written by agents."; el JSON incluye `texto` (completo) y `textoCorto` (la frase inicial).
- No hay captura PNG: la página de x.com sin sesión muestra un panel de inicio de sesión y el hilo, así que la captura no salía limpia. La diapositiva debe renderizarse con el texto del JSON.
- Licencia: contenido público de X (derechos del autor). Cita breve con atribución y enlace.

## Metadatos Open Graph de enlaces

Generados por `scripts/obtener-og.mjs` (fetch nativo + `sharp`), salida en `src/data/enlaces.json` e imágenes en `src/assets/enlaces/<slug>.webp` (1200 x 630, WebP calidad 78). Ejecución del 2026-10-01: 3 de 3 correctos.

| Sitio | Título | og:image original |
|---|---|---|
| https://www.drinksonchain.com | Drinks on Chain · Cada botella, con su lugar y su historia. | `https://drinks-on-chain-landing.vercel.app/opengraph-image` |
| https://bodegas.drinksonchain.com | Drinks on Chain · El mapa de las bodegas de altura de Bolivia. | `https://drinks-on-chain-bodegas.vercel.app/opengraph-image?...` |
| https://www.devbro.xyz | DevBro Solutions — Tu idea, funcionando, en tres semanas | `https://www.devbro.xyz/og.png` |

- Licencia: metadatos y vistas previas de sitios propios del autor/organizador del taller; uso como vista previa de enlace.
- El script siempre termina con exit 0; ante fallo conserva los datos previos o escribe `ok:false` con el nombre legible del dominio.
- Para ejecutarlo: `node scripts/obtener-og.mjs` (requiere `sharp` instalado en el proyecto; si no está, guarda solo los metadatos).
