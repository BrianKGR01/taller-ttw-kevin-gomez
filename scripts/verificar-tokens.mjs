#!/usr/bin/env node
/**
 * Verifica la regla del sistema de diseño (§1): valores literales de color solo
 * en primitivos.css y longitudes/tiempos estructurales solo en layout.css.
 * Hace fallar la construcción. Los verificadores impiden regresiones; no
 * descubren nada (§8): hay que mirar la pantalla.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// Se ejecuta siempre desde la raíz del proyecto (pnpm scripts, vitest).
const RAIZ = process.env.TOKENS_RAIZ ?? process.cwd();
const COLOR_OK = new Set(['design-system/estilos/primitivos.css']);
const LONGITUD_OK = new Set(['design-system/estilos/layout.css']);

const NOMBRES_COLOR = '(?:black|white|red|green|blue|yellow|orange|purple|gray|grey|pink|cyan|magenta|silver|navy|teal|lime|maroon|olive|aqua|fuchsia)';
const RE_COLOR_CSS = new RegExp(
  [
    '#[0-9a-fA-F]{3,8}\\b',
    '\\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\\(',
    `(?:color|background(?:-color)?|border(?:-[a-z-]+)?-color|fill|stroke|outline-color|box-shadow|text-shadow)\\s*:[^;{}]*\\b${NOMBRES_COLOR}\\b`,
  ].join('|'),
);
const RE_LONGITUD = /(?<![\w.#-])(-?\d*\.?\d+)(px|rem|vh|svh|lvh|dvh|vw|vmin|vmax)\b/g;
const RE_TIEMPO = /(?<![\w.#-])(\d*\.?\d+)(ms|s)\b/g;

function* archivos(dir) {
  for (const nombre of readdirSync(dir)) {
    if (['node_modules', 'dist', '.astro', '.git', '.vercel'].includes(nombre)) continue;
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) yield* archivos(ruta);
    else yield ruta;
  }
}

/** Devuelve [{texto, linea}] con el CSS de un archivo (bloques <style> en .astro). */
function cssDe(ruta, contenido) {
  if (ruta.endsWith('.css')) return [{ texto: contenido, desde: 0 }];
  if (ruta.endsWith('.astro')) {
    const bloques = [];
    for (const m of contenido.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) bloques.push({ texto: m[1], desde: contenido.slice(0, m.index).split('\n').length - 1 });
    for (const m of contenido.matchAll(/\sstyle=(?:"([^"]*)"|\{`([^`]*)`\})/g)) bloques.push({ texto: m[1] ?? m[2] ?? '', desde: contenido.slice(0, m.index).split('\n').length - 1 });
    return bloques;
  }
  return [];
}

const errores = [];
const base = RAIZ.replace(/[\\/]$/, '');
const objetivos = [...archivos(join(base, 'src')), ...archivos(join(base, 'design-system', 'estilos'))];

for (const ruta of objetivos) {
  const rel = relative(base, ruta).split(sep).join('/');
  if (!/\.(css|astro|ts|js)$/.test(rel) || rel.startsWith('src/data/')) continue;
  const contenido = readFileSync(ruta, 'utf8');

  for (const bloque of cssDe(rel, contenido)) {
    const sinComentarios = bloque.texto.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    sinComentarios.split('\n').forEach((linea, i) => {
      const n = bloque.desde + i + 1;
      // Los atributos de SVG (fill="…") y los preludios de @media no cuentan.
      const sinMedia = linea.replace(/@(media|container|supports)[^{]*/g, '');
      if (!COLOR_OK.has(rel) && RE_COLOR_CSS.test(sinMedia)) errores.push(`${rel}:${n}  color literal → usa un token semántico: ${linea.trim()}`);
      // `--resplandor` viene del sistema de diseño tal cual (2.5rem de halo): se adopta sin tocar.
      if (!LONGITUD_OK.has(rel) && !/--resplandor:/.test(linea)) {
        for (const m of sinMedia.matchAll(RE_LONGITUD)) {
          const v = Math.abs(parseFloat(m[1]));
          if (m[2] === 'px' && v <= 3) continue;
          if (v === 0) continue;
          errores.push(`${rel}:${n}  longitud literal ${m[0]} → usa un token de layout.css: ${linea.trim()}`);
          break;
        }
        const sinVar = sinMedia.replace(/var\([^)]*\)/g, '');
        if (/animation|transition|delay/.test(sinVar)) {
          for (const m of sinVar.matchAll(RE_TIEMPO)) {
            if (parseFloat(m[1]) === 0 || m[0] === '0.01ms') continue;
            errores.push(`${rel}:${n}  duración literal ${m[0]} → usa un token --mov-*: ${linea.trim()}`);
            break;
          }
        }
      }
    });
  }

  if (/\.(ts|js)$/.test(rel) && !rel.endsWith('.inline.js')) {
    contenido.split('\n').forEach((linea, i) => {
      if (/['"`]#[0-9a-fA-F]{3,8}['"`]/.test(linea)) errores.push(`${rel}:${i + 1}  color literal en script: ${linea.trim()}`);
    });
  }
  if (rel.endsWith('.astro')) {
    contenido.split('\n').forEach((linea, i) => {
      if (/\b(?:fill|stroke)="#[0-9a-fA-F]{3,8}"/.test(linea)) errores.push(`${rel}:${i + 1}  color literal en SVG: ${linea.trim()}`);
    });
  }
}

if (errores.length) {
  console.error(`\n✖ verificar-tokens: ${errores.length} incumplimiento(s) de la regla de tres capas\n`);
  for (const e of errores) console.error('  ' + e);
  console.error('\nValores literales solo en primitivos.css (color) y layout.css (longitud/tiempo). Ver design-system/01-sistema-de-diseno.md §1.\n');
  process.exit(1);
}
console.log('✔ verificar-tokens: sin valores literales fuera de primitivos.css y layout.css');
