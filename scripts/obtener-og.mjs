// Obtiene metadatos Open Graph de los enlaces de la presentación.
// Uso: node scripts/obtener-og.mjs   (se puede enganchar en "prebuild")
// - Descarga og:image y la convierte a WebP (ancho 1200) en src/assets/enlaces/<slug>.webp
// - Escribe src/data/enlaces.json
// - NUNCA falla el build: siempre sale con código 0.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_IMG = path.join(RAIZ, 'src', 'assets', 'enlaces');
const ARCHIVO_JSON = path.join(RAIZ, 'src', 'data', 'enlaces.json');
const TIMEOUT_MS = 10_000;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const URLS = [
  'https://www.drinksonchain.com',
  'https://bodegas.drinksonchain.com',
  'https://www.devbro.xyz',
];

const log = (...a) => console.log('[og]', ...a);

// --- sharp (opcional: si no está, se conservan metadatos sin imagen nueva) ---
let sharp = null;
try {
  const require = createRequire(path.join(RAIZ, 'package.json'));
  sharp = require('sharp');
} catch {
  try {
    sharp = createRequire(path.join(process.cwd(), 'noop.js'))('sharp');
  } catch {
    log('AVISO: sharp no disponible; se omite la conversión de imágenes.');
  }
}

// --- utilidades ---
const decodificar = (s) =>
  String(s ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

function metaTags(html) {
  const mapa = {};
  for (const m of html.matchAll(/<meta\s+[^>]*>/gi)) {
    const tag = m[0];
    const clave = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    const valor = /content\s*=\s*"([^"]*)"|content\s*=\s*'([^']*)'/i.exec(tag);
    if (clave && valor && !(clave in mapa)) mapa[clave] = decodificar(valor[1] ?? valor[2]);
  }
  return mapa;
}

const slugDe = (u) =>
  new URL(u).hostname.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

function nombreLegible(u) {
  const host = new URL(u).hostname.replace(/^www\./, '');
  const partes = host.split('.');
  const base = partes.length > 2 ? partes.slice(0, -1).join('.') : partes[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

async function fetchConTimeout(url, opciones = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect: 'follow',
      ...opciones,
      signal: ctl.signal,
      headers: { 'user-agent': UA, 'accept-language': 'es,en;q=0.8', ...(opciones.headers ?? {}) },
    });
  } finally {
    clearTimeout(t);
  }
}

async function procesar(url, previo) {
  const slug = slugDe(url);
  const dominio = new URL(url).hostname.replace(/^www\./, '');
  const res = await fetchConTimeout(url, { headers: { accept: 'text/html,application/xhtml+xml' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = (await res.text()).slice(0, 2_000_000);
  const base = res.url || url;
  const m = metaTags(html);
  const tituloHtml = decodificar(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]);

  const titulo = m['og:title'] || m['twitter:title'] || tituloHtml || m['og:site_name'] || nombreLegible(url);
  const descripcion = m['og:description'] || m['twitter:description'] || m['description'] || '';
  const sitio = m['og:site_name'] || '';
  let imgUrl = m['og:image'] || m['og:image:url'] || m['twitter:image'] || m['twitter:image:src'] || '';
  if (imgUrl) {
    try {
      imgUrl = new URL(imgUrl, base).href;
    } catch {
      imgUrl = '';
    }
  }

  let imagen = null;
  if (imgUrl && sharp) {
    try {
      const r = await fetchConTimeout(imgUrl, { headers: { accept: 'image/*,*/*;q=0.8', referer: base } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      await fs.mkdir(DIR_IMG, { recursive: true });
      await sharp(buf)
        .resize({ width: 1200, withoutEnlargement: false })
        .webp({ quality: 78 })
        .toFile(path.join(DIR_IMG, `${slug}.webp`));
      imagen = `assets/enlaces/${slug}.webp`;
    } catch (e) {
      log(`  imagen fallida para ${url} (${imgUrl}): ${e.message}`);
      // conserva imagen previa si el archivo existe
      if (previo?.imagen) imagen = previo.imagen;
    }
  } else if (previo?.imagen) {
    imagen = previo.imagen;
  }

  return {
    url,
    dominio,
    slug,
    titulo,
    descripcion,
    sitio,
    imagen,
    ok: true,
  };
}

async function main() {
  let previos = [];
  try {
    previos = JSON.parse(await fs.readFile(ARCHIVO_JSON, 'utf8'));
    if (!Array.isArray(previos)) previos = [];
  } catch {
    /* sin datos previos */
  }

  const resultado = [];
  for (const url of URLS) {
    const previo = previos.find((p) => p.url === url);
    try {
      const r = await procesar(url, previo);
      log(`OK   ${url} -> "${r.titulo}" | imagen: ${r.imagen ?? 'ninguna'}`);
      resultado.push(r);
    } catch (e) {
      const causa = e?.name === 'AbortError' ? `timeout ${TIMEOUT_MS / 1000}s` : e?.message ?? String(e);
      if (previo) {
        log(`FALLO ${url} (${causa}); se conservan los datos previos.`);
        resultado.push(previo);
      } else {
        log(`FALLO ${url} (${causa}); respaldo ok:false.`);
        resultado.push({
          url,
          dominio: new URL(url).hostname.replace(/^www\./, ''),
          slug: slugDe(url),
          titulo: nombreLegible(url),
          descripcion: '',
          sitio: '',
          imagen: null,
          ok: false,
        });
      }
    }
  }

  await fs.mkdir(path.dirname(ARCHIVO_JSON), { recursive: true });
  await fs.writeFile(ARCHIVO_JSON, JSON.stringify(resultado, null, 2) + '\n', 'utf8');
  log(`Escrito ${path.relative(RAIZ, ARCHIVO_JSON)} (${resultado.filter((r) => r.ok).length}/${resultado.length} ok)`);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error('[og] Error inesperado (se ignora, el build continúa):', e);
    process.exit(0);
  },
);
