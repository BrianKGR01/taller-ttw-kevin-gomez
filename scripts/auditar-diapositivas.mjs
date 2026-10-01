#!/usr/bin/env node
/**
 * Auditoría visual de todas las diapositivas: para cada una abre su URL, revela
 * todos sus pasos, mide si el contenido entra sin scroll interno y guarda una
 * captura. Después arma hojas de contacto para revisarlas de un vistazo.
 *
 * Uso: node scripts/auditar-diapositivas.mjs [url-base] [carpeta] [oscuro|claro] [ancho] [alto]
 * Ejemplo: node scripts/auditar-diapositivas.mjs http://localhost:4329 salida oscuro 1366 768
 *
 * Los verificadores impiden regresiones; no descubren nada (sistema de diseño §8):
 * las hojas de contacto son para MIRARLAS.
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [base = 'http://localhost:4329', salida = 'auditoria', esquema = 'oscuro', ancho = '1366', alto = '768'] = process.argv.slice(2);
const W = Number(ancho);
const H = Number(alto);
mkdirSync(salida, { recursive: true });

const navegador = await chromium.launch({ channel: process.env.PW_CANAL ?? (process.env.CI ? undefined : 'msedge') });
const ctx = await navegador.newContext({ viewport: { width: W, height: H }, colorScheme: esquema === 'claro' ? 'light' : 'dark', reducedMotion: 'reduce' });
const pagina = await ctx.newPage();
await pagina.goto(`${base}/?modo=presentacion`, { waitUntil: 'load' });
await pagina.waitForSelector('html[data-listo]');

const ids = await pagina.$$eval('.diap', (els) => els.map((e) => ({ id: e.dataset.id, b: e.dataset.bloque, n: e.dataset.n, pasos: Number(e.dataset.pasos), tipo: e.dataset.tipo })));
const informe = [];
const archivos = [];
for (const d of ids) {
  await pagina.evaluate((h) => (location.hash = h), `#/${d.b}/${d.n}`);
  await pagina.waitForSelector(`.diap[data-activa][data-id="${d.id}"]`);
  for (let i = 0; i < d.pasos; i++) {
    await pagina.keyboard.press('Space');
    await pagina.waitForTimeout(60);
  }
  await pagina.waitForTimeout(500);
  const m = await pagina.evaluate((id) => {
    const el = document.querySelector(`.diap[data-id="${id}"]`);
    const cuerpo = el.querySelector('.diap__cuerpo');
    const r = cuerpo.getBoundingClientRect();
    const barra = document.querySelector('.barra').getBoundingClientRect().bottom;
    return {
      desborda: el.scrollHeight > el.clientHeight + 2,
      sobra: el.scrollHeight - el.clientHeight,
      arriba: Math.round(r.top - barra),
      abajo: Math.round(window.innerHeight - r.bottom),
      horizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  }, d.id);
  informe.push({ ...d, ...m });
  const archivo = join(salida, `${d.id.replace('.', '-')}.png`);
  await pagina.screenshot({ path: archivo });
  archivos.push({ id: d.id, archivo });
}
await navegador.close();

// Hojas de contacto de 2×3.
const col = 2;
const filas = 3;
const miniW = Math.round(W / 2);
const miniH = Math.round(H / 2);
for (let k = 0; k < archivos.length; k += col * filas) {
  const lote = archivos.slice(k, k + col * filas);
  const composiciones = [];
  for (let i = 0; i < lote.length; i++) {
    const buf = await sharp(lote[i].archivo).resize(miniW, miniH).toBuffer();
    composiciones.push({ input: buf, left: (i % col) * miniW, top: Math.floor(i / col) * miniH });
  }
  await sharp({ create: { width: col * miniW, height: filas * miniH, channels: 3, background: '#808080' } })
    .composite(composiciones)
    .jpeg({ quality: 80 })
    .toFile(join(salida, `hoja-${String(k / (col * filas) + 1).padStart(2, '0')}.jpg`));
}

writeFileSync(join(salida, 'informe.json'), JSON.stringify(informe, null, 2));
const malas = informe.filter((d) => d.desborda || d.horizontal);
console.log(`${informe.length} diapositivas · ${malas.length} con desbordamiento`);
for (const d of informe) console.log(`${d.desborda || d.horizontal ? '✖' : '✔'} ${d.id.padEnd(5)} ${d.tipo.padEnd(10)} arriba ${String(d.arriba).padStart(4)} · abajo ${String(d.abajo).padStart(4)}${d.desborda ? ` · SOBRA ${d.sobra}px` : ''}${d.horizontal ? ' · SCROLL HORIZONTAL' : ''}`);
process.exit(malas.length ? 1 : 0);
