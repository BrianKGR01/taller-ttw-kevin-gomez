// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// URL de producción: se usa para el QR, las etiquetas Open Graph y el sitemap.
// Ver ADR-012 y ADR-017. Se puede sobrescribir en el build con SITE_URL.
// En Vercel, VERCEL_PROJECT_PRODUCTION_URL trae el dominio de producción real (sin protocolo):
// así el QR, el canonical y la imagen para compartir apuntan siempre a donde está publicado.
const produccion = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const SITE = process.env.SITE_URL || (produccion ? `https://${produccion}` : 'https://taller-ttw-kevin-gomez.vercel.app');

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  // El contenido se renderiza con `marked` (src/lib/md.ts); Astro no necesita resaltar código.
  markdown: { syntaxHighlight: false },
  vite: {
    plugins: [tailwindcss()],
  },
});
