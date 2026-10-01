#!/usr/bin/env node
/**
 * Genera la imagen Open Graph (1200×630) a partir de la portada real: abre la
 * presentación construida, espera a que se asiente la portada y captura la
 * pantalla. Uso: `pnpm build && pnpm exec astro preview` en otra terminal y
 * después `node scripts/generar-og.mjs [url]`. Resultado: public/og.jpg
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:4329/?modo=presentacion&og';
mkdirSync('public', { recursive: true });

const navegador = await chromium.launch({ channel: process.env.PW_CANAL ?? (process.env.CI ? undefined : 'msedge') });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await pagina.emulateMedia({ colorScheme: 'dark', reducedMotion: 'no-preference' });
await pagina.goto(url, { waitUntil: 'load' });
await pagina.waitForSelector('html[data-listo]');
// Deja que termine el tecleo, que el video avance y que el marco se esconda.
await pagina.waitForTimeout(4800);
await pagina.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 84 });
await navegador.close();
console.log('✔ public/og.jpg');
