# ADR-009 — Videos de atmósfera: GIF convertidos a WebM (VP9) con MP4 de respaldo

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 1

---

## Contexto

El expositor entregó dos animaciones en GIF (`assets/agentes/agentes1.gif`: líneas de luz convergiendo; `agentes2.gif`: código en cascada), de 480×270 px, 10 s, 16 fps. Pesan 8,4 MB y 7,9 MB: demasiado para el wifi de un evento y para datos móviles. Las instrucciones originales hablaban de un WebM; llegaron GIF.

## Opciones consideradas

**A — Publicar los GIF.** Descartado: 16 MB y sin control de pausa.

**B — WebM (VP9) + MP4 (H.264) sin audio, en bucle, con póster WebP.** Mismo contenido en 130–360 KB por archivo.

**C — Solo el póster estático.** Pierde el movimiento.

## Decisión

**Opción B.** `ffmpeg`: 12 fps, 640×360, `crf 46` (VP9) y `crf 36` (H.264), sin audio; póster WebP 960×540 del fotograma 40. Los GIF originales **se conservan en `assets/agentes/` pero no se publican**. Resultado: `agentes1.webm` 364 KB, `.mp4` 161 KB; `agentes2.webm` 301 KB, `.mp4` 133 KB.

Reglas de uso (`Video.astro` y `src/cliente/video.ts`): `muted loop playsinline preload="none"`, `aria-hidden`, póster estático, `disablepictureinpicture`. **Solo se reproduce cuando se ve** (IntersectionObserver), **nunca con `prefers-reduced-motion`** y **nunca con ahorro de datos o conexión 2G**: en esos casos queda el póster.

Reparto:

- **`agentes1` (líneas de luz convergiendo): portada (0.1).** Es la diapositiva que más tiempo está en pantalla antes de empezar y la que da la primera impresión; las líneas de colores GDG convergen hacia el título.
- **`agentes2` (código en cascada): diapositiva de ejecución (7.1).** Representa a los agentes trabajando.
- Cierre (11.1): se usa la foto del expositor, muy tratada, para no repetir el video de la portada.

En modo claro el video se invierte (`invert + hue-rotate + multiply`) para que las líneas de neón no queden como un parche negro sobre fondo blanco.

## Consecuencias

**A favor.** ~0,5 MB de video por diapositiva, solo si se visita; sin riesgo de 16 MB en el wifi del evento.

**En contra.** La resolución (640×360) se nota ampliada en un proyector grande; es aceptable para una atmósfera con máscara y opacidad baja.

## Cómo se revierte

Barato: regenerar con otros parámetros de `ffmpeg`.
