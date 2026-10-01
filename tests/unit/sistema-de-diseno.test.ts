import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { evaluarPares, contraste } from '../../scripts/contraste.mjs';

const VERIFICADOR = join(process.cwd(), 'scripts', 'verificar-tokens.mjs');

function correr(raiz?: string) {
  try {
    const salida = execFileSync('node', [VERIFICADOR], { encoding: 'utf8', env: { ...process.env, ...(raiz ? { TOKENS_RAIZ: raiz } : {}) } });
    return { codigo: 0, salida };
  } catch (e: any) {
    return { codigo: e.status as number, salida: String(e.stderr ?? '') };
  }
}

function proyectoFalso(archivos: Record<string, string>) {
  const raiz = mkdtempSync(join(tmpdir(), 'tokens-'));
  mkdirSync(join(raiz, 'src', 'styles'), { recursive: true });
  mkdirSync(join(raiz, 'design-system', 'estilos'), { recursive: true });
  for (const [ruta, contenido] of Object.entries(archivos)) writeFileSync(join(raiz, ruta), contenido);
  return raiz;
}

describe('regla de tres capas (verificar-tokens)', () => {
  it('el proyecto real cumple la regla', () => {
    const r = correr();
    expect(r.codigo, r.salida).toBe(0);
  });

  it('detecta un color literal en un componente', () => {
    const raiz = proyectoFalso({ 'src/styles/x.css': '.a { color: #ff0000; }\n' });
    const r = correr(raiz);
    expect(r.codigo).toBe(1);
    expect(r.salida).toMatch(/color literal/);
  });

  it('detecta rgb() y nombres de color', () => {
    expect(correr(proyectoFalso({ 'src/styles/x.css': '.a { background: rgb(0 0 0); }\n' })).codigo).toBe(1);
    expect(correr(proyectoFalso({ 'src/styles/x.css': '.a { color: red; }\n' })).codigo).toBe(1);
  });

  it('detecta una longitud y una duración literales', () => {
    const l = correr(proyectoFalso({ 'src/styles/x.css': '.a { padding: 24px; }\n' }));
    expect(l.codigo).toBe(1);
    expect(l.salida).toMatch(/longitud literal/);
    const t = correr(proyectoFalso({ 'src/styles/x.css': '.a { transition: opacity 300ms; }\n' }));
    expect(t.codigo).toBe(1);
    expect(t.salida).toMatch(/duración literal/);
  });

  it('permite tokens, filetes de 1 a 3 px y unidades relativas', () => {
    const r = correr(
      proyectoFalso({
        'src/styles/x.css': '.a { color: var(--tinta); padding: var(--esp-3); border: 2px solid var(--borde); width: 0.55ch; margin: 0; }\n@media (max-width: 820px) { .a { color: var(--tinta); } }\n',
      }),
    );
    expect(r.codigo, r.salida).toBe(0);
  });

  it('permite valores literales en primitivos.css y layout.css', () => {
    const r = correr(
      proyectoFalso({
        'design-system/estilos/primitivos.css': ':root { --gdg-x: #123456; }\n',
        'design-system/estilos/layout.css': ':root { --x: 3rem; --mov: 200ms; }\n',
      }),
    );
    expect(r.codigo, r.salida).toBe(0);
  });
});

describe('contraste de los tokens (AA, titulares AAA)', () => {
  const filas = evaluarPares();

  it('calcula bien un par conocido', () => {
    expect(contraste([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 1);
    // Del sistema de diseño §3: el amarillo core sobre blanco da 1.93:1.
    expect(contraste([249, 171, 0], [255, 255, 255])).toBeCloseTo(1.93, 1);
  });

  it('evalúa los dos modos', () => {
    expect(new Set(filas.map((f: any) => f.modo))).toEqual(new Set(['claro', 'oscuro']));
  });

  for (const f of filas) {
    it(`${f.modo}: ${f.fg} sobre ${f.bg} ≥ ${f.min}:1 (${f.desc})`, () => {
      expect(f.razon as number).toBeGreaterThanOrEqual(f.min as number);
    });
  }
});
