# ADR-017 — La URL de producción sale de la variable de sistema de Vercel

**Estado:** aceptada (reemplaza la parte de URL fija de la ADR-012)
**Fecha:** 2026-10-01
**Fase del roadmap:** 3

---

## Contexto

La ADR-012 fijaba la URL de producción en `astro.config.mjs` (`https://taller-ia-agentica.vercel.app`). El proyecto se creó después, desde el panel de Vercel, con el nombre `taller-ttw-kevin-gomez`, de modo que esa URL no existe. El QR de la última diapositiva, el `canonical`, `og:url`, `og:image`, el sitemap y `robots.txt` dependen de `site`.

## Opciones consideradas

**A — Corregir la constante a mano.** Funciona hasta que se agregue un dominio propio o cambie el alias; vuelve a desfasarse en silencio.

**B — Usar `VERCEL_PROJECT_PRODUCTION_URL`**, la variable de sistema que Vercel define en cada build con el dominio de producción del proyecto (sin protocolo), y dejar `SITE_URL` como anulación explícita.

## Decisión

**Opción B.** `site = SITE_URL ?? https://${VERCEL_PROJECT_PRODUCTION_URL} ?? https://taller-ttw-kevin-gomez.vercel.app`. Un dominio propio asignado al proyecto se refleja solo en el siguiente build.

## Consecuencias

**A favor.** El QR no puede apuntar a un lugar que no existe; no hay que tocar código al cambiar de dominio.

**En contra.** Requiere que el proyecto exponga las variables de sistema (opción por defecto de Vercel). Fuera de Vercel (build local), el valor es el de respaldo. El QR proyectado habrá que revisarlo si cambia el dominio de producción después de imprimirlo.

## Cómo se revierte

Una línea en `astro.config.mjs`.
