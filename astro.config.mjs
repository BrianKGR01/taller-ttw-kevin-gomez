// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// URL de producción: se usa para el QR, las etiquetas Open Graph y el sitemap.
// Ver ADR-012. Se puede sobrescribir en el build con SITE_URL.
const SITE = process.env.SITE_URL ?? 'https://taller-ia-agentica.vercel.app';

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
