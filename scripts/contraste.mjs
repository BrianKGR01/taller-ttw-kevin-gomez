/**
 * Contraste WCAG de los pares de tokens, en los dos modos.
 *
 * Lee primitivos.css y semanticos.css, resuelve `light-dark()`, `var()` y
 * `color-mix(in srgb …)` y calcula la razón de contraste. Impide regresiones;
 * no descubre nada (§8 del sistema de diseño): mirar la pantalla sigue siendo
 * obligatorio.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Se ejecuta siempre desde la raíz del proyecto (pnpm scripts, vitest).
const ESTILOS = join(process.env.TOKENS_RAIZ ?? process.cwd(), 'design-system', 'estilos');

const hexARgb = (h) => {
  const x = h.replace('#', '');
  const f = x.length === 3 ? x.split('').map((c) => c + c).join('') : x;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const luminancia = ([r, g, b]) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export function contraste(a, b) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

function leerPrimitivos() {
  const css = readFileSync(join(ESTILOS, 'primitivos.css'), 'utf8');
  const mapa = {};
  for (const m of css.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g)) mapa[m[1]] = hexARgb(m[2]);
  return mapa;
}

/** Evalúa una expresión de color para un modo ('claro' | 'oscuro'). */
function evaluar(expr, modo, prim, sem) {
  expr = expr.trim();
  let m;
  if ((m = /^var\((--[\w-]+)\)$/.exec(expr))) {
    const nombre = m[1];
    if (prim[nombre]) return prim[nombre];
    if (sem[nombre]) return evaluar(sem[nombre], modo, prim, sem);
    throw new Error(`token sin resolver: ${nombre}`);
  }
  if ((m = /^light-dark\((.*)\)$/s.exec(expr))) {
    const [claro, oscuro] = dividir(m[1]);
    return evaluar(modo === 'claro' ? claro : oscuro, modo, prim, sem);
  }
  if ((m = /^color-mix\(in srgb,\s*(.*)\)$/s.exec(expr))) {
    const partes = dividir(m[1]);
    const lee = (p) => {
      const mm = /^(.*?)(?:\s+([\d.]+)%)?$/s.exec(p.trim());
      return { color: evaluar(mm[1], modo, prim, sem), pct: mm[2] === undefined ? null : parseFloat(mm[2]) };
    };
    const [p1, p2] = partes.map(lee);
    const w1 = p1.pct ?? (p2.pct === null ? 50 : 100 - p2.pct);
    return p1.color.map((c, i) => Math.round((c * w1 + p2.color[i] * (100 - w1)) / 100));
  }
  throw new Error(`expresión no soportada: ${expr}`);
}

/** Divide por comas de primer nivel. */
function dividir(s) {
  const out = [];
  let nivel = 0;
  let acum = '';
  for (const ch of s) {
    if (ch === '(') nivel++;
    if (ch === ')') nivel--;
    if (ch === ',' && nivel === 0) {
      out.push(acum);
      acum = '';
    } else acum += ch;
  }
  out.push(acum);
  return out;
}

function leerSemanticos() {
  const css = readFileSync(join(ESTILOS, 'semanticos.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const bloque = css.slice(css.indexOf(':root'));
  const sem = {};
  // La última declaración de cada token gana (la línea con light-dark() va después del respaldo).
  for (const m of bloque.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    if (/^(--resplandor|--gradiente-|--atmosfera|--red-|--video-|--fuente-)/.test(m[1])) continue;
    if (m[1] === '--fase-actual' || m[1] === '--fase-suave' || m[1] === '--velo') continue;
    sem[m[1]] = m[2].replace(/\s+/g, ' ').trim();
  }
  return sem;
}

export function colorDeToken(token, modo) {
  return evaluar(`var(${token})`, modo, leerPrimitivos(), leerSemanticos());
}

/** [primer plano, fondo, mínimo, descripción] */
export const PARES = [
  ['--tinta', '--superficie', 4.5, 'texto corrido'],
  ['--tinta-fuerte', '--superficie', 7, 'titulares (AAA)'],
  ['--tinta-suave', '--superficie', 4.5, 'metadatos'],
  ['--tinta', '--superficie-elevada', 4.5, 'texto sobre tarjeta'],
  ['--tinta-suave', '--superficie-elevada', 4.5, 'metadatos sobre tarjeta'],
  ['--tinta', '--superficie-hundida', 4.5, 'texto de código'],
  ['--tinta-suave', '--superficie-hundida', 4.5, 'barra de código'],
  ['--enlace', '--superficie', 4.5, 'enlaces'],
  ['--realce-tinta', '--realce', 4.5, 'texto sobre el realce'],
  ['--tinta', '--realce-suave', 4.5, 'texto sobre el aviso'],
  ['--foco', '--superficie', 3, 'anillo de foco'],
  ['--borde-fuerte', '--superficie', 3, 'contorno que tiene que verse'],
  ...[1, 2, 3, 4, 5, 6].flatMap((n) => [
    [`--fase-${n}`, '--superficie', 3, `fase ${n}: gráficos y numerales`],
    ['--realce-tinta', `--fase-${n}`, 4.5, `texto sobre la fase ${n}`],
  ]),
  ['--exito', '--superficie', 3, 'confirmación'],
];

export function evaluarPares() {
  const prim = leerPrimitivos();
  const sem = leerSemanticos();
  const filas = [];
  for (const modo of ['oscuro', 'claro']) {
    for (const [fg, bg, min, desc] of PARES) {
      const r = contraste(evaluar(`var(${fg})`, modo, prim, sem), evaluar(`var(${bg})`, modo, prim, sem));
      filas.push({ modo, fg, bg, min, desc, razon: r, ok: r >= min });
    }
  }
  return filas;
}

if (process.argv[1] && /contraste\.mjs$/.test(process.argv[1])) {
  const filas = evaluarPares();
  for (const f of filas) console.log(`${f.ok ? '✔' : '✖'} ${f.modo.padEnd(6)} ${f.fg} / ${f.bg}  ${f.razon.toFixed(2)}:1 (mín ${f.min})  ${f.desc}`);
  process.exit(filas.every((f) => f.ok) ? 0 : 1);
}
