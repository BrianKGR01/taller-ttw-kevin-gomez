# ADR-008 — Color por fase, escala de proyección y tokens de movimiento

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 1

---

## Contexto

El taller tiene un ciclo de seis fases que se repite como ancla visual. El público debe ubicar siempre en qué fase está. Además, el sistema de diseño pide una escala de proyección medida contra la altura del viewport (caso 1366×768) y tokens de movimiento con nombre, y exige que los valores literales vivan solo en `primitivos.css` (color) y `layout.css` (estructura).

## Decisión

1. **Color por fase** (`semanticos.css`): `--fase-1` … `--fase-6` = azul, rojo, amarillo, verde, cian, violeta, con `light-dark()` entre el juego para fondo oscuro y el de fondo claro. El kit solo da cuatro colores: se añaden tres primitivos (`--gdg-halftone-purple #b27cff`, `--gdg-cyan-700 #007b83`, `--gdg-purple-700 #8430ce`), elegidos midiendo el contraste (todos ≥ 3:1 como gráficos y ≥ 4.5:1 con texto de `--realce-tinta` encima, en ambos modos; ver `scripts/contraste.mjs`). Un elemento declara `data-fase="N"` y consume `--fase-actual` y `--fase-suave`. `--exito` confirma acciones (copiar).
2. **Escala de proyección** (`layout.css`): `--proy-gigante/titulo/subtitulo/cuerpo/codigo/etiqueta` con `clamp(…, min(Nvw, Nsvh), …)`: manda el menor de ancho y alto. Referencia: en 1366×768 el título mide 64 px y el cuerpo 27 px. **Nunca se achica la letra para que algo entre: se divide la diapositiva.** En modo lectura estos tokens se redefinen hacia la escala de lectura.
3. **Movimiento** (`layout.css`): duraciones (`--mov-instante/rapido/medio/lento/escena/ambiente/escalon/teclear/recorrido`) y curvas (`--curva-salida/entrada/estandar/suave`) con nombre. Un momento fuerte por diapositiva; titulares que entran en secuencia con desplazamiento corto y opacidad, sin rebote.
4. **Verificación automática** (`scripts/verificar-tokens.mjs`, parte del `prebuild`): falla el build si aparece un color literal fuera de `primitivos.css` o una longitud o duración literal fuera de `layout.css`.

## Consecuencias

**A favor.** Cambiar el color de una fase o un tiempo de animación es editar un token; el contraste y la regla de capas se verifican en cada build.

**En contra.** El espectro del tema claro no es idéntico al oscuro (el amarillo se va al ámbar, el cian a un verde azulado): costo ya documentado en el sistema de diseño §3. Las medidas de componentes que no son estructurales (anchos máximos, tamaños de icono) tuvieron que nombrarse en `layout.css`.

**Señal de revisión.** Si se agregan fases, ampliar el espectro exige nuevos primitivos medidos.

## Cómo se revierte

Una tarde: son tokens y un script.
