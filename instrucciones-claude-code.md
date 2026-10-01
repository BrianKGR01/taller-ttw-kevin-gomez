# Presentación web: "IA aplicada al desarrollo de software"

## Objetivo

Construir una presentación web para el taller *"IA aplicada al desarrollo de software — El proceso de desarrollo en la era agéntica"*, de Kevin Brayan Gómez Rocha, en Tarija Tech Week 2026, en representación de **Google Developer Group Santa Cruz**.

La presentación tiene dos usos:
1. **Proyectarse** en la sala desde una computadora.
2. **Compartirse por enlace (QR)** con los participantes, que la abren en celular o tablet para revisar el contenido, copiar prompts y plantillas, y contactar al expositor.

Tiene que sentirse como la presentación de un **mega evento tecnológico**: moderna, innovadora, con animaciones cuidadas, y que transmita de inmediato que es un taller de **IA aplicada al desarrollo de software**. Impacto visual, pero nunca sobrecargada.

**Contenido:** todo sale de `taller-ia-desarrollo-software.md`. Respeta su estructura de bloques y diapositivas. No inventes contenido nuevo. Las secciones "Tiempos", "Nota del expositor" y "Si vas corto de tiempo" no van en las diapositivas: van a la vista de presentador.

Trabaja de forma autónoma: toma las decisiones técnicas y de diseño tú mismo y regístralas como ADR en `design-system/decisiones/`, con la plantilla `ADR-000-plantilla.md`. Escribe un `AGENTS.md` con las reglas del proyecto antes de empezar.

---

## Dirección de arte

### Sistema de diseño (obligatorio)
El sistema de diseño de **GDG Santa Cruz** está en `design-system/`, y manda sobre cualquier otra indicación visual de este archivo:
- `design-system/01-sistema-de-diseno.md` — las reglas.
- `design-system/estilos/` — la implementación de referencia: `primitivos.css`, `semanticos.css`, `layout.css`, `tipografia.css`, `utilidades.css`, `global.css`. Se adoptan tal cual; solo se extienden.
- `design-system/decisiones/` — las decisiones ya tomadas (ADR) y la plantilla para las nuevas.

Lo que hay que agregar, siguiendo sus propias reglas (valores literales solo en `primitivos.css` y `layout.css`):
- **Escala de proyección** en `layout.css` para diapositivas, medida contra la altura del viewport, que entre completa en 1366×768.
- **Colores por fase:** cada una de las 6 fases del ciclo tiene un token semántico de color (`--fase-1` … `--fase-6`) tomado del espectro (azul, rojo, amarillo, verde, cian, violeta), con su versión para modo claro de los primitivos para fondo claro. Se mantiene en todo el taller para que el público ubique siempre en qué fase está.
- **Tokens de movimiento:** duraciones y curvas de animación con nombre.

**Tipografía:** Google Sans y Google Sans Mono, autohospedadas desde `assets/fuentes/` según la ADR-002. Si los archivos no están, la pila de respaldo de los tokens entra sola.

**Logos:** el logo de GDG va como SVG en línea con `fill` a los primitivos, solo si su archivo oficial está en `assets/`. No se dibujan ni recrean logos de Google, GDG ni de ninguna empresa.

### Lenguaje visual de "IA construyendo software"
Elige y combina con criterio (no todo a la vez en la misma diapositiva):
- **Fondo vivo y sutil:** malla de gradiente animada con los colores de acento muy suavizados, o una red de nodos y conexiones (tipo red neuronal) que reacciona levemente al cursor. Debe ser casi imperceptible detrás del texto.
- **Efecto terminal / agente escribiendo:** los prompts y fragmentos de código aparecen tecleándose, con cursor parpadeante, como si un agente los estuviera generando.
- **Diagrama del ciclo** (Spec funcional → Spec técnica → Reglas del juego → Roadmap por hitos → Ejecución → Dónde vive) animado: se dibuja paso a paso, y reaparece en miniatura al inicio de cada fase con la fase actual iluminada.
- **Revelado por pasos:** listas y preguntas aparecen una por una al avanzar (por ejemplo, las "preguntas incómodas" del hotel).
- **Números y títulos grandes** con entrada escalonada (stagger), estilo keynote.
- **Tablas comparativas** (vibe coding vs. ingeniería, camino rápido vs. controlado) con las columnas entrando desde lados opuestos.
- **Microinteracciones:** brillo suave en hover, botones con respuesta táctil, confirmación animada al copiar.
- **Transiciones entre diapositivas** fluidas (fade + desplazamiento leve, o View Transitions API donde esté soportada).

Todo el movimiento sigue la sección "Movimiento" del sistema de diseño: elegante y rápido, un momento fuerte por diapositiva, nunca distrae del mensaje. Los gradientes solo en bordes, titulares y atmósfera de fondo. Con `prefers-reduced-motion` no hay animaciones decorativas.

### Legibilidad proyectada
- Texto grande, pensado para leerse desde el fondo de la sala. Si algo no entra, se divide la diapositiva; nunca se achica la letra.
- Pocas palabras por diapositiva. El detalle va en el modo lectura y en las notas.
- Contraste mínimo AA en ambos modos, idealmente AAA en los títulos.

---

## Modo claro y modo oscuro

- Ambos modos cuidados por igual: la sala puede tener cualquier condición de luz.
- Control de tres estados (sistema · claro · oscuro), como define el sistema de diseño, con un botón visible y la tecla `T` para alternar en vivo, con transición animada.
- La elección se restaura antes del primer pintado, sin parpadeo.

---

## Navegación

- **Teclado:** flechas izquierda/derecha entre bloques; arriba/abajo entre diapositivas de un mismo bloque. También `Espacio`, `PageUp`/`PageDown`, `Inicio`/`Fin`.
- **Rueda o trackpad:** avanza diapositiva por diapositiva, sin saltos dobles.
- **Táctil:** swipe horizontal y vertical en celular y tablet.
- **Clicker de presentación:** compatible (envía flechas o `PageUp`/`PageDown`).
- **URL por diapositiva** (por ejemplo `#/5/3`): se puede compartir una diapositiva puntual y recargar sin perder la posición.
- **Vista general:** tecla `Esc` u `O` y un botón visible que muestra todos los bloques para saltar directo.
- **Barra de progreso** discreta con el color de la fase actual, y número de diapositiva.
- **Pantalla completa** con la tecla `F`.

---

## Dos modos de uso

- **Modo presentación:** una diapositiva a la vez, para proyectar.
- **Modo lectura:** todo el contenido en scroll vertical continuo, cómodo en celular. Incluye el material completo (prompts, plantillas, tablas). Se activa con un botón; en pantallas chicas es el predeterminado. Forzable por URL (`?modo=presentacion`, `?modo=lectura`).

---

## Vista de presentador

Tecla `S` abre una ventana aparte con: diapositiva actual, siguiente, notas del expositor del bloque, tiempo sugerido del bloque (de la tabla "Tiempos") y cronómetro. Sincronizada con la ventana principal.

---

## Interactividad para los participantes

- **Botón "Copiar"** en cada prompt, plantilla y bloque de código, con confirmación animada.
- **Descarga directa** de la plantilla `AGENTS.md` y de la estructura de carpetas recomendada.
- **Diagramas** (ciclo completo, flujo de CI/CD, estructura de carpetas, roadmap por hitos) construidos en código (SVG o similar), nunca como imágenes, para que se vean nítidos en ambos temas.
- **Tarjetas de vista previa de enlace** para las empresas del expositor, en lugar de logos: como las que muestra WhatsApp al pegar un enlace (imagen, título, descripción y dominio). Obtén los metadatos Open Graph de cada sitio en tiempo de build, guarda la imagen localmente y, si algo falla, muestra una tarjeta de respaldo con nombre y enlace. Sitios:
  - https://www.drinksonchain.com
  - https://bodegas.drinksonchain.com
  - https://www.devbro.xyz
- **Última diapositiva:** QR grande hacia la URL de la propia presentación (generado a partir de la URL de producción), y enlaces de contacto. Los datos de contacto se leen del archivo de contacto que esté en `assets/`; si no existe, se muestran espacios marcados y discretos.

---

## Recursos visuales

**Archivos del expositor en `assets/`:**
- `perfil2026.png` — retrato del expositor para la diapositiva "Quién soy".
- `Foto-perfil.jpg` — el expositor dando una charla. Úsala como imagen de apoyo (por ejemplo, de fondo muy tratado en la portada o en el cierre), nunca compitiendo con el texto.
- `GDGLogo - Horizontal - Dark.svg` y `GDGLogo - Horizontal - Light.svg` — logo horizontal del capítulo; cada uno se muestra en el modo que le corresponde según su contraste con la superficie.
- `isotipo.svg`, `icono-claro.svg`, `icono-oscuro.svg` — isotipo e iconos de GDG; úsalos para favicon, pie y marcas pequeñas, también según el modo.
- `fuentes/` — Google Sans y Google Sans Mono. Ajusta las rutas de `tipografia.css` a la estructura final del proyecto.
- `agentes/` — un video corto en bucle (WebM). Va en el bloque 7 como fondo o protagonista de la diapositiva de ejecución: silenciado, en bucle, `playsinline`, con un póster estático, y pausado con `prefers-reduced-motion`.
- `ejemplo-AGENTS.md` y `ejemplo-roadmap.md` — ver la sección siguiente.
- Archivo de contacto con las redes sociales del expositor, para la última diapositiva.

### Documentos de ejemplo: AGENTS.md y roadmap

`ejemplo-AGENTS.md` y `ejemplo-roadmap.md` son documentos reales de otro proyecto. No se publican tal cual:

1. **Anonimízalos por completo.** Quita toda referencia al proyecto original: nombre, dominio, clientes, rutas internas, servicios, credenciales, URLs, personas y cualquier dato identificable. Reemplázalos por el caso del taller: el **sistema de gestión del hotel** (huéspedes, habitaciones, reservas, check-in/check-out, pagos, reportes).
2. **Conserva la estructura y el nivel de detalle**, que es lo que tiene valor didáctico.
3. **Completa el AGENTS.md:** está incompleto. Debe cubrir como mínimo contexto y fuentes de verdad, stack y versiones, estándares de código, Git y versionamiento, tests (unitarios, E2E y la regla de no modificar tests sin aprobación), seguridad, design system, flujo por hitos y definición de terminado. Usa la plantilla del bloque 5 del taller como piso, no como techo.
4. **Revisa el roadmap** con el mismo criterio: hitos como rebanadas verticales con criterio de terminado.
5. Guarda las versiones finales como `ejemplos/AGENTS.md` y `ejemplos/roadmap.md`, y verifica con una búsqueda que no quede ningún nombre del proyecto original.

**Cómo se muestran:** cada documento tiene una diapositiva propia (AGENTS.md en el bloque 5, roadmap en el bloque 6) donde se ve **el documento completo renderizado** como una hoja dentro de la diapositiva, y la cámara hace un **recorrido sección por sección**: zoom y desplazamiento lento y suave hacia cada sección (contexto, stack, tests, seguridad…), con el título de la sección resaltado y una etiqueta breve que explica para qué sirve. Cada avance de la presentación pasa a la sección siguiente; si no hay interacción durante unos segundos, el recorrido avanza solo. Al terminar, vuelve a la vista completa. En modo lectura se muestran completos, con botones de copiar y descargar.

**Recursos que generas tú:**
- **Tapas de los libros** de la diapositiva 3.1: búscalas en fuentes públicas (sitio de la editorial, Open Library o similares), descárgalas en buena resolución y optimízalas.
- **Post de Uncle Bob** (diapositiva 5.4): intenta una captura del post original (https://x.com/unclebobmartin/status/2044114698451476492). Si X no se puede renderizar sin sesión, construye una **tarjeta de cita** con el sistema de diseño: el texto del post en inglés, autor, cuenta, fecha y enlace al original. No imites la interfaz de X.
- **Notificación de CI/CD** (diapositiva 8.3): una ilustración de un celular recibiendo la notificación de un despliegue nuevo ("Nueva versión lista para probar" con versión, módulo y enlace), hecha en código con el sistema de diseño. Es ilustrativa: sin logos ni marcas de terceros.

Si un recurso no se puede obtener, muestra un marcador elegante y coherente con el diseño, con una etiqueta que indique qué va ahí.

---

## Contenido editable

Las diapositivas viven en archivos de contenido (Markdown, MDX o similar), separados de los componentes. Corregir un texto tiene que tomar segundos.

---

## Requisitos técnicos

- **Stack:** elige lo más robusto para este tipo de proyecto. Evalúa una librería madura de presentaciones (por ejemplo Reveal.js, que resuelve navegación 2D, swipe, vista general, vista de presentador y URLs por diapositiva) frente a una implementación propia, y regístrala como ADR.
- **Última versión estable** de cada dependencia, verificada en la documentación oficial antes de instalar. Versiones fijadas en el lockfile.
- **Sitio estático**, sin backend ni base de datos.
- **Rendimiento:** imágenes optimizadas y con dimensiones definidas, fuentes con `font-display: swap`, carga rápida en wifi de evento y datos móviles. Las animaciones de fondo no deben bajar el rendimiento en celulares de gama media.
- **Responsive:** 16:9 en proyector; tablet y celular sin scroll horizontal.
- **Accesibilidad:** navegable completamente con teclado, foco visible, textos alternativos, roles ARIA en controles.
- **Metadatos para compartir:** título, descripción e imagen Open Graph generada desde la portada, para que el propio enlace de la presentación también se vea bien al compartirse.
- **Tests:** unitarios de la lógica de navegación, temas y modos; E2E que recorra la presentación con teclado, cambie de tema, cambie de modo y pruebe el botón copiar, en celular y escritorio emulados. Todo en verde antes de cada despliegue.

---

## Despliegue

- Despliega en **Vercel** (tienes acceso a la cuenta). Crea el proyecto y conéctalo al repositorio para que cada push a `main` despliegue automáticamente.
- No modifiques otros proyectos de la cuenta.
- Al terminar, entrega la URL de producción y confirma que el QR apunta a ella.

---

## Orden de trabajo

1. Design system (tokens claro/oscuro), esqueleto y navegación completa con unas pocas diapositivas de prueba. Despliega.
2. Todo el contenido del taller, diagramas y animaciones por diapositiva. Despliega.
3. Modo lectura, botones copiar, descargas, tarjetas de enlace, QR y metadatos. Despliega.
4. Vista de presentador y pulido final de animaciones y transiciones. Despliega.

Después de cada paso: tests en verde, despliegue y un resumen breve de lo que cambió y la URL.
