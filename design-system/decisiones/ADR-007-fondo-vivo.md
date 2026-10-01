# ADR-007 — Fondo vivo: malla de gradiente que respira y red de nodos en canvas

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 1

---

## Contexto

La presentación debe sentirse como un mega evento de tecnología e "IA construyendo software", pero nunca sobrecargada ni distraer del texto. El fondo debe ser casi imperceptible, funcionar en un proyector y en un celular de gama media, y respetar `prefers-reduced-motion`. Las reglas del sistema de diseño: gradientes solo en bordes, titulares y atmósfera de fondo; atmósfera que respira lento (≥ 20 s); en claro no hay degradados de relleno ni resplandor.

## Opciones consideradas

**A — Solo malla de gradiente CSS.** Barato, pero no dice "IA" por sí solo.

**B — Red de nodos y conexiones (canvas 2D) sobre la malla.** Dice "red neuronal / agentes", reacciona levemente al cursor, y si se mantiene pequeña no pesa.

**C — WebGL / Three.js / shaders.** Más espectacular, mucho más pesado, y un riesgo real en celulares y en el wifi de un evento. No hace falta para el mensaje.

## Decisión

**Opción A + B.**

- Dos capas de `--gradiente-hero` desenfocadas que respiran en 24 s y 31 s (token `--mov-ambiente`). En oscuro el espectro al 22 %; en claro, el lavado de pasteles del sistema (los tokens de opacidad se redefinen en la capa semántica, junto a `--resplandor`).
- Una red de 14 a 64 nodos (≤ 30 en celular), a **30 cuadros por segundo**, resolución capada (DPR ≤ 1.5; 1 en celular), pausada cuando la pestaña no está visible y **estática con `prefers-reduced-motion`**. Los colores salen de los tokens (`--fase-actual`, `--tinta-suave`) y se releen al cambiar de tema o de fase: los nodos se tiñen del color de la fase en curso.
- Contraste: ni la malla ni la red llevan texto encima sin pasar por los pares de contraste verificados (el fondo es `--superficie` más una capa tenue).

## Consecuencias

**A favor.** Identidad visual clara con muy poco costo; la red cambia de color con las fases, reforzando el ancla visual.

**En contra.** Un canvas siempre dibujando consume batería; mitigado con 30 fps, pocos nodos y pausa. Si en un dispositivo de gama baja se nota, se apaga con `prefers-reduced-motion` o se baja la cantidad de nodos en `fondo.ts`.

## Cómo se revierte

Una hora: quitar `Fondo.astro` y `fondo.ts`; nada más depende de ellos.
