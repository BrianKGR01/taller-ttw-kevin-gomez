#!/usr/bin/env node
/**
 * Reúne los archivos que los participantes pueden descargar en public/descargas/
 * (se regenera en cada build; no se versiona):
 *  - AGENTS.md                      plantilla mínima de la diapositiva 5.6
 *  - estructura-de-carpetas.txt     estructura recomendada
 *  - ejemplo-AGENTS-hotel.md        AGENTS.md completo del caso del hotel (anonimizado)
 *  - ejemplo-roadmap-hotel.md       roadmap por hitos del caso del hotel (anonimizado)
 */
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const raiz = process.env.TOKENS_RAIZ ?? process.cwd();
const destino = join(raiz, 'public', 'descargas');
mkdirSync(destino, { recursive: true });

const archivos = [
  ['contenido-descargas/AGENTS.md', 'AGENTS.md'],
  ['contenido-descargas/estructura-de-carpetas.txt', 'estructura-de-carpetas.txt'],
  ['ejemplos/AGENTS.md', 'ejemplo-AGENTS-hotel.md'],
  ['ejemplos/roadmap.md', 'ejemplo-roadmap-hotel.md'],
];

let faltan = 0;
for (const [origen, nombre] of archivos) {
  const ruta = join(raiz, origen);
  if (!existsSync(ruta)) {
    console.error(`✖ falta ${origen}`);
    faltan++;
    continue;
  }
  copyFileSync(ruta, join(destino, nombre));
}
if (faltan) process.exit(1);
console.log(`✔ preparar-descargas: ${archivos.length} archivos en public/descargas/`);
