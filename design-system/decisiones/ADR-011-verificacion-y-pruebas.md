# ADR-011 — Qué se verifica automáticamente (y qué no)

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 1

---

## Contexto

El sistema de diseño §8 advierte: *los verificadores impiden regresiones, no descubren nada*. Un titular invisible pasó con todos los pares de contraste en verde; lo encontró una persona mirando la pantalla. Aun así, hay tres cosas que vale la pena automatizar, y las instrucciones piden unitarios de la lógica de navegación, temas y modos, y E2E con teclado, tema, modo y copiar en escritorio y celular.

## Decisión

1. **`scripts/verificar-tokens.mjs`** (en `prebuild`): regla de tres capas. Sus propias pruebas (en `tests/unit/`) comprueban que *detecta* un color, una longitud y una duración literales: un verificador que nunca falla no verifica nada.
2. **`scripts/contraste.mjs`**: resuelve `light-dark()`, `var()` y `color-mix()` desde los CSS reales y mide cada par de tokens en ambos modos. Exige 4.5:1 para texto, 3:1 para gráficos y bordes, y 7:1 (AAA) para titulares.
3. **Vitest** (entorno `happy-dom`): navegación, hash, tema, modo, gestos, filtro de rueda, restauración previa al pintado (se ejecuta el script en línea real) y renderizado de Markdown.
4. **Playwright**: E2E en dos proyectos —`escritorio` (1366×768) y `celular` (360×740, táctil)—: recorrido por teclado, pasos de revelado, URL, vista general, cambio de tema y de modo, botón copiar con el portapapeles real, swipe con eventos táctiles reales (CDP). En esta máquina se usa Microsoft Edge (`channel: 'msedge'`) porque la descarga del Chromium de Playwright agotaba el tiempo; en CI se usa el Chromium de Playwright.
5. **Lo que se hace a ojo y no se automatiza:** cada hito se mira en claro y oscuro, en 1366×768 y a 360 px, en presentación y lectura. **Cada defecto encontrado así cierra con la verificación que lo habría atrapado.**

## Consecuencias

**A favor.** Las regresiones de lógica, contraste y reglas de capas fallan el build o los tests antes del despliegue.

**En contra.** Los E2E con Edge son lentos (2 workers, ~45 s por prueba como tope); no hay pruebas en Firefox ni WebKit. La accesibilidad automática (axe) no está incluida: queda como mejora.

## Cómo se revierte

No aplica: son pruebas.
