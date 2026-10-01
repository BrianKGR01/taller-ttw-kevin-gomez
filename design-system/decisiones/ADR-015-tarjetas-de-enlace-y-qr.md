# ADR-015 — Tarjetas de enlace con metadatos Open Graph locales y QR generado en el build

**Estado:** aceptada
**Fecha:** 2026-10-01
**Fase del roadmap:** 3

---

## Contexto

Para las empresas del expositor se pidieron **tarjetas de vista previa de enlace** (imagen, título, descripción y dominio, como las de WhatsApp) en lugar de logos, con los metadatos Open Graph obtenidos en tiempo de build, la imagen guardada localmente y respaldo si algo falla. La última diapositiva lleva un **QR grande** hacia la URL de producción y los enlaces de contacto, leídos de `assets/contacto.md`.

## Decisión

1. **Metadatos de enlaces.** `scripts/obtener-og.mjs` (`pnpm datos:og`) descarga og:title, og:description, og:image y og:site_name de los tres sitios, convierte la imagen a WebP de 1200 px con `sharp` y escribe `src/data/enlaces.json` + `src/assets/enlaces/*.webp`. **Los resultados están versionados** y el build no depende de la red: si el script falla para un sitio, conserva el dato previo o deja `ok:false` y la tarjeta cae a un respaldo con nombre y enlace. El script nunca falla el build.
2. **QR en el build.** `src/lib/qr.ts` genera el QR como SVG en línea con el paquete `qrcode` a partir de `Astro.site` (la URL de producción, ADR-012), con 4 módulos de margen de silencio. Un test unitario lo **decodifica** con `jsqr` (dependencia de desarrollo) en claro y en oscuro, a 740, 360 y 240 px.
3. **Polaridad del QR: siempre módulos oscuros sobre placa clara, en los dos temas.** Un QR invertido (claro sobre oscuro) no lo leen varios lectores y aplicaciones; con `light-dark()` entre `--tinta-fuerte` y `--superficie` en el tema oscuro habría salido invertido. Si en el futuro se prefiere la versión invertida, bastan `--qr-modulo` y `--qr-placa` en `cierre.css`.
4. **Contacto.** `src/lib/contacto.ts` (puro) lee `assets/contacto.md` y solo acepta enlaces `https` del dominio esperado de cada red (Instagram, WhatsApp, LinkedIn); si falta un dato aparece un recuadro punteado «por completar». Los íconos son genéricos: no se usan logos de terceros.
5. **`robots.txt` y `sitemap.xml`** son endpoints de `src/pages/` (no archivos de `public/`) para que la URL salga de `site`. `/presentador` queda fuera de los buscadores.
6. **Foto del expositor** en la diapositiva de cierre: desaturada, bajo un velo de `--superficie` (86 % oscuro, 90 % claro) y la máscara `--m-halo`, estática; nunca compite con el texto.

## Consecuencias

**A favor.** Cero dependencia de red en el build; el QR se verifica por decodificación real; si cambia la URL de producción, basta `SITE_URL`/`site` y un build.

**En contra.** Los metadatos de los sitios pueden quedar viejos hasta correr `pnpm datos:og` otra vez. El cierre se divide en dos diapositivas (tarjetas y QR) porque QR, contacto, logo y dos tarjetas no cabían en 1366×768 sin achicar la letra; el orden deja el QR al final, como pide el guion.

## Cómo se revierte

Barato: son componentes y scripts aislados.
