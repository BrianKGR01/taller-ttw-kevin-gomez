# Sistema de diseño

> Este documento manda sobre cualquier decisión visual de la presentación. Si un componente lo contradice, el componente está mal.
>
> Es la identidad de la casa de **Google Developer Group Santa Cruz**, basada en el Community Kit de GDG y en los gradientes modernos de Google. Los archivos de `estilos/` son la implementación de referencia y se adoptan tal cual.

---

## 1. La regla que hace posible todo lo demás

**Tres capas de tokens. Los componentes solo tocan la capa 3.**

```
Capa 1 — PRIMITIVOS      Los colores que existen en el universo GDG/Google.
                         Nunca se usan directo en un componente.        → primitivos.css

Capa 2 — SEMÁNTICOS      Qué significa cada color en la interfaz.
                         --superficie, --tinta, --realce, --borde,
                         --gradiente-hero, --resplandor...              → semanticos.css

Capa 3 — COMPONENTE      Lo que consume el CSS de cada componente.
                         Siempre por referencia a la capa 2.            → utilidades.css
```

**Prohibido:** un valor de color o una longitud estructural escritos a mano dentro de un componente. Los únicos archivos con valores literales son `primitivos.css` (color) y `layout.css` (estructura). Se verifica automáticamente y hace fallar la construcción.

**Implementación:** la capa 2 son propiedades personalizadas en selectores con alcance (`:root`, `[data-modo='…']`), y la capa 3 las alcanza vía `@theme inline` de Tailwind v4. Sin `inline`, Tailwind hornea el valor de la raíz y un modo anidado se ve mal sin ningún error. Si el stack elegido no usa Tailwind, las capas 1 y 2 se usan igual y la capa 3 se escribe como CSS de componente que solo lee `var(--…)` de la capa 2.

**Las marcas propias van en línea.** El logo de GDG es un SVG en línea cuyos `fill` apuntan a los primitivos: sus cuatro colores ya están en la capa 1 y así se adapta al modo. Las marcas de terceros no usan tokens y viven en una carpeta propia, fuera del verificador de colores.

---

## 2. Primitivos

### GDG core (Community Kit)

| Nombre | Hex |
|---|---|
| Blue 500 | `#4285f4` |
| Green 500 | `#34a853` |
| Yellow 600 | `#f9ab00` |
| Red 500 | `#ea4335` |
| Halftone Blue | `#57caff` |
| Halftone Green | `#5cdb6d` |
| Halftone Yellow | `#ffd427` |
| Halftone Red | `#ff7daf` |
| Off White | `#f0f0f0` |
| Black 02 | `#1e1e1e` |

Además: negro y blanco puros, una escala de grises para el modo claro, los cuatro core en su **versión para fondo claro** (`blue-600 #1a73e8`, `red-600 #d93025`, `yellow-900 #b06000`, `green-700 #188038`), los pasteles del kit y un violeta (`#a142f4`) que cierra el recorrido del espectro.

Los pasteles (`#c3ecf6`, `#ccf6c5`, `#ffe7a5`, `#f8d8d8`) dependen de la polaridad: sobre oscuro se usan con cuentagotas; sobre claro funcionan bien.

### Gradientes con nombre

- `--g-espectro` — rojo → amarillo → verde → cian → azul → violeta. El de los bordes de las pills de AI Studio y de los artes de I/O.
- `--g-espectro-plano` — los cuatro colores en bandas planas, sin interpolación. Es el espectro del modo claro.
- `--g-frio` — cian → azul → violeta.
- `--g-calido` — amarillo → rosa → rojo.
- `--g-lavado-claro` — atmósfera de pasteles casi imperceptible para el modo claro.
- `--g-tinta-solida` — color sólido escrito como gradiente, para titulares en modo claro.

**Regla de uso:** los gradientes van en **bordes, texto de titular y atmósfera de fondo**. Nunca como relleno de una superficie grande de contenido ni detrás de texto corrido.

---

## 3. Modo claro y oscuro

La identidad de la casa vive en las **dos polaridades**, expresadas con `light-dark()`:

```css
--superficie: var(--gdg-negro);                                  /* respaldo */
--superficie: light-dark(var(--gdg-blanco), var(--gdg-negro));
```

La primera línea es lo que ve un navegador que no entiende `light-dark()`: degrada a oscuro, no a roto. Los dos valores quedan uno al lado del otro a propósito, para que ningún token esconda un segundo trabajo.

Los tokens que no son color (los tres gradientes y `--resplandor`) no pueden usar `light-dark()` y se redefinen en un bloque aparte para el modo claro.

### El control manual

Tres estados: **sistema · claro · oscuro**. No un interruptor de dos, porque con dos "volver a seguir al sistema" se pierde en cuanto alguien toca el control. Un script en línea en el `<head>` restaura la elección **antes del primer pintado**: sin eso hay parpadeo de tema en cada carga.

### Lo que el modo claro cambia de naturaleza (no solo de tono)

1. **Los cuatro core son el juego para fondo oscuro.** Contra blanco ninguno llega a 4.5:1, y el amarillo da 1.93:1. En claro se usan las versiones para fondo claro, y el amarillo se va al ámbar: se nota y es el costo correcto.

   | Color | sobre negro | sobre blanco |
   |---|---|---|
   | blue `#4285f4` | 5.89:1 | 3.56:1 |
   | red `#ea4335` | 5.35:1 | 3.92:1 |
   | green `#34a853` | 6.87:1 | 3.06:1 |
   | yellow `#f9ab00` | **10.85:1** | **1.93:1** |

2. **En claro no hay degradados.** Los cuatro colores van planos como marcadores estructurales, y el titular es un color sólido. Por eso existen dos tokens separados: `--gradiente-borde` (estructura) y `--gradiente-titular` (relleno de texto). Un token nunca hace dos trabajos.
3. **Umbrales distintos por uso:** texto a 4.5:1; un filete de 2px es estructura y se exige a 3:1.
4. **El foco cambia de color:** amarillo halftone en oscuro, azul de acción en claro.
5. **El resplandor se apaga en claro** (`--resplandor: none`): un halo de color sobre blanco ensucia.

---

## 4. Tipografía

**Google Sans** (display y texto) y **Google Sans Mono** (metadatos), autohospedadas desde los archivos del Community Kit. Condiciones en `decisiones/ADR-002-tipografia-google-sans.md`:

- Solo los pesos que el diseño usa: Google Sans 400 y 700, Google Sans Mono 400.
- No se generan subconjuntos ni derivados de los archivos.
- Pila de respaldo con fuentes reales y parecidas, no `sans-serif` a secas.
- `font-display: swap`.

Si los archivos no están disponibles, la pila de respaldo de los tokens entra sola; cambiar la familia es editar tokens, no componentes.

**Tres roles y no hay un cuarto:** display (títulos), texto (corrido), mono (etiquetas, metadatos, código).

---

## 5. Layout y escala

Los tokens estructurales viven en `layout.css`: anchos con nombre, canal lateral fluido, ritmo vertical, escala tipográfica de siete escalones con `clamp()`, radios, rejillas y área táctil mínima de 44px.

**Para la presentación se agrega una escala de proyección** en el mismo archivo, con el mismo rigor: tamaños de título y cuerpo de diapositiva medidos contra la **altura** del viewport (`svh`) además del ancho, porque una diapositiva tiene que entrar entera de una vez. El caso a resolver es 1366×768: lo que entra ahí, entra en todos lados.

Móvil primero, desde 360px. Sin scroll horizontal en ningún ancho.

---

## 6. Componentes con patrón fijo

### `Accion` — todo lo que se puede hacer clic

| Variante | Cómo se ve | Cuándo |
|---|---|---|
| `principal` | borde en gradiente + `--resplandor` | la acción del bloque. Una por pantalla. |
| `secundaria` | borde sólido tenue, sin resplandor | acompaña a una principal |
| `enlace` | solo texto con flecha | navegación lateral |

El borde en gradiente se dibuja con dos capas de `background` y `background-clip`, nunca con `border-image` (no respeta el radio).

### `Dato` — información, no acción

Icono más texto. Sin borde, sin fondo, sin forma de píldora, sin hover.

> **`Accion` es lo único con forma de píldora.** Si algo tiene esa forma y no se puede hacer clic, está mal.

### La flecha marca que una superficie lleva a algún lado

Una tarjeta con flecha "→" es un enlace; una sin flecha, no. Las no clicables no tienen `cursor: pointer` ni hover.

### Iconos

Dibujados en línea, `aria-hidden`, y nunca la única fuente de un dato.

### El lenguaje de formas

El Community Kit define un vocabulario de formas (globo, arcos, barras inclinadas, llaves, corchetes). Se usan **estructuralmente**, para marcar el rol de una sección o diapositiva, no como decoración suelta.

---

## 7. Movimiento

El movimiento se siente orquestado, no espolvoreado.

- **Un momento fuerte por diapositiva**, no varios. El resto es discreto.
- **Atmósfera de fondo** que respira lento (20 s o más, casi imperceptible).
- **Titulares que entran en secuencia**, desplazamiento corto y opacidad, sin rebote.
- **Transiciones entre diapositivas** con View Transitions donde haya soporte.
- **Hover:** cambio de borde o resplandor, nunca de tamaño en elementos de layout.
- **`prefers-reduced-motion` se respeta siempre:** sin animación de fondo ni revelados, transiciones instantáneas.

---

## 8. Qué NO significa que las verificaciones estén en verde

> **Los verificadores impiden regresiones. No descubren nada.**

Un titular invisible porque el gradiente arrancaba en el mismo color que el fondo pasó con todos los pares de contraste en verde. Lo encontró una persona mirando la pantalla.

1. **Mirá la pantalla**, en los dos modos, en 1366×768, en un proyector simulado y en un teléfono.
2. **Cada defecto encontrado cierra con la verificación que lo habría atrapado.**
3. **Sospechá de la herramienta de medición antes que de la página.**

---

## 9. Piso de calidad

- Responsive real desde 360px.
- Foco de teclado visible y con contraste propio.
- Contraste AA como mínimo en texto y elementos de interfaz, en los dos modos.
- Imágenes optimizadas y con dimensiones declaradas. Cero saltos de layout.
- Metadatos sociales con imagen de compartir.
