import type { APIRoute } from 'astro';

/** sitemap.xml mínimo: el sitio es una sola página (las diapositivas son anclas). */
export const GET: APIRoute = ({ site }) => {
  const raiz = new URL('/', site ?? 'http://localhost:4321').href;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${raiz}</loc></url>\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
