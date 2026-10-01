import type { APIRoute } from 'astro';

/**
 * robots.txt mínimo. Es un endpoint (y no un archivo de public/) para que la
 * URL del sitemap salga del `site` de astro.config.mjs: un solo lugar para la
 * URL de producción (ADR-012). La vista de presentador no se indexa.
 */
export const GET: APIRoute = ({ site }) => {
  const mapa = new URL('/sitemap.xml', site ?? 'http://localhost:4321').href;
  return new Response(`User-agent: *\nAllow: /\nDisallow: /presentador\n\nSitemap: ${mapa}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
