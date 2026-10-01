# ADR-012 — Despliegue en Vercel desde `main` y URL de producción

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 1

---

## Contexto

Las instrucciones piden desplegar en Vercel, crear el proyecto y conectarlo al repositorio para que cada push a `main` despliegue, sin tocar otros proyectos de la cuenta, y que el QR de la última diapositiva apunte a la URL de producción.

Dos cuentas conviven en esta máquina: el CLI de Vercel está autenticado como otra persona (`mirkocalzadilla4-8575`), mientras que la integración de Vercel de la sesión y GitHub pertenecen a `briankgr01` / `BrianKGR01`. Desplegar con el CLI habría ido a una cuenta ajena.

## Decisión

- El proyecto se crea en el equipo `briankgr01's projects` por la integración de Vercel autenticada como `briankgr01`, **conectado al repositorio `BrianKGR01/taller-ttw-kevin-gomez`** (framework Astro, `pnpm build`, salida `dist`). Cada push a `main` despliega a producción. No se usa el CLI de Vercel.
- La URL de producción se fija en `astro.config.mjs` (`site`) y en el QR (`scripts/generar-qr.mjs`). Si el alias asignado por Vercel difiere del previsto, se corrige en un solo lugar y se vuelve a generar el QR (`pnpm datos:qr`).
- El repositorio es **público**. Por eso los documentos reales de los que se derivan los ejemplos (`assets/ejemplo-*.md`) están en `.gitignore`: solo se versionan las versiones anonimizadas de `ejemplos/`. Los `.ttf` originales de las fuentes tampoco entran.
- Antes de cada despliegue: `pnpm test`, `pnpm test:e2e`, `pnpm typecheck` y `pnpm build` en verde.

## Consecuencias

**A favor.** Sin credenciales en el repositorio; despliegue continuo; ningún otro proyecto tocado.

**En contra.** La URL depende del nombre del proyecto en Vercel y puede cambiar si el nombre ya estaba tomado; un dominio propio queda fuera de alcance. El QR impreso o proyectado habría que regenerarlo si cambia la URL.

## Cómo se revierte

Una tarde: pausar o eliminar el proyecto en Vercel; el código es independiente.
