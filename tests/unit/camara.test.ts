import { describe, expect, it } from 'vitest';
import { avanzaSolo, camaraGeneral, camaraSeccion, duracionDeriva, estadoDePaso } from '../../src/lib/camara';

const vista = { w: 1200, h: 600 };
const hoja = { w: 700, h: 3000 };
const m = { vista, hoja };
/** Dónde cae un punto de la hoja en la vista. */
const enVista = (c: { x: number; y: number; s: number }, px: number, py: number) => ({ x: c.x + c.s * px, y: c.y + c.s * py });

describe('camaraGeneral', () => {
  it('muestra la hoja entera dentro de la vista', () => {
    const c = camaraGeneral(m);
    const esq1 = enVista(c, 0, 0);
    const esq2 = enVista(c, hoja.w, hoja.h);
    expect(esq1.x).toBeGreaterThanOrEqual(0);
    expect(esq1.y).toBeGreaterThanOrEqual(0);
    expect(esq2.x).toBeLessThanOrEqual(vista.w);
    expect(esq2.y).toBeLessThanOrEqual(vista.h);
  });

  it('la centra en vertical y respeta el ancla horizontal', () => {
    const centrada = camaraGeneral(m);
    expect(enVista(centrada, hoja.w / 2, 0).x).toBeCloseTo(vista.w / 2);
    expect(enVista(centrada, 0, 0).y).toBeCloseTo(vista.h - enVista(centrada, 0, hoja.h).y);
    const aLaIzquierda = camaraGeneral(m, { ancla: 0.25 });
    expect(enVista(aLaIzquierda, hoja.w / 2, 0).x).toBeCloseTo(vista.w * 0.25);
  });

  it('una hoja ancha queda limitada por el ancho, no por la altura', () => {
    const ancha = camaraGeneral({ vista, hoja: { w: 4000, h: 500 } });
    expect(enVista(ancha, 4000, 0).x).toBeLessThanOrEqual(vista.w);
  });

  it('con medidas vacías devuelve la cámara neutra', () => {
    expect(camaraGeneral({ vista: { w: 0, h: 0 }, hoja })).toEqual({ x: 0, y: 0, s: 1 });
  });
});

describe('camaraSeccion', () => {
  const corta = { x: 0, y: 400, w: 700, h: 200 };
  const larga = { x: 0, y: 800, w: 700, h: 1500 };

  it('hace zoom hasta que la sección llene la vista, centrada', () => {
    const t = camaraSeccion(m, corta, { ocupacion: 0.9 });
    expect(t.inicio.s).toBeCloseTo((vista.w * 0.9) / corta.w);
    const centro = enVista(t.inicio, corta.x + corta.w / 2, 0).x;
    expect(centro).toBeCloseTo(vista.w / 2);
  });

  it('deja el título arriba, con un margen', () => {
    const t = camaraSeccion(m, corta, { margenSuperior: 0.05 });
    expect(enVista(t.inicio, 0, corta.y).y).toBeCloseTo(vista.h * 0.05);
  });

  it('una sección que entra no tiene deriva', () => {
    const t = camaraSeccion(m, { x: 0, y: 400, w: 700, h: 100 });
    expect(t.pantallas).toBe(0);
    expect(t.fin).toEqual(t.inicio);
  });

  it('una sección más alta que la vista deriva hasta mostrar su final', () => {
    const t = camaraSeccion(m, larga, { margenInferior: 0.05 });
    expect(t.pantallas).toBeGreaterThan(1);
    expect(t.fin.y).toBeLessThan(t.inicio.y);
    expect(t.fin.s).toBe(t.inicio.s);
    expect(enVista(t.fin, 0, larga.y + larga.h).y).toBeCloseTo(vista.h * 0.95);
  });

  it('nunca se sale de la hoja: la última sección no deja vacío bajo ella', () => {
    const ultima = { x: 0, y: hoja.h - 150, w: 700, h: 150 };
    const t = camaraSeccion(m, ultima, { margenInferior: 0.04 });
    expect(enVista(t.inicio, 0, hoja.h).y).toBeGreaterThanOrEqual(vista.h * 0.96 - 0.001);
  });

  it('en una hoja de columnas, la cámara viaja de una columna a la otra', () => {
    const col1 = camaraSeccion(m, { x: 0, y: 100, w: 700, h: 300 });
    const col2 = camaraSeccion(m, { x: 740, y: 100, w: 700, h: 300 });
    expect(col2.inicio.s).toBeCloseTo(col1.inicio.s);
    expect(col2.inicio.x).toBeCloseTo(col1.inicio.x - col1.inicio.s * 740);
  });
});

describe('estadoDePaso', () => {
  it('0 es la vista completa', () => {
    expect(estadoDePaso(0, 13)).toEqual({ tipo: 'general' });
  });
  it('1..N son las secciones', () => {
    expect(estadoDePaso(1, 13)).toEqual({ tipo: 'seccion', indice: 0 });
    expect(estadoDePaso(13, 13)).toEqual({ tipo: 'seccion', indice: 12 });
  });
  it('N+1 vuelve a la vista completa', () => {
    expect(estadoDePaso(14, 13)).toEqual({ tipo: 'general' });
  });
  it('un paso inválido cae en la vista completa', () => {
    expect(estadoDePaso(Number.NaN, 13)).toEqual({ tipo: 'general' });
    expect(estadoDePaso(-2, 13)).toEqual({ tipo: 'general' });
  });
});

describe('avanzaSolo', () => {
  it('solo con el recorrido en marcha: ni desde la vista inicial ni desde la final', () => {
    expect(avanzaSolo(0, 13)).toBe(false);
    expect(avanzaSolo(1, 13)).toBe(true);
    expect(avanzaSolo(13, 13)).toBe(true);
    expect(avanzaSolo(14, 13)).toBe(false);
  });
});

describe('duracionDeriva', () => {
  it('sin deriva no hay duración', () => {
    expect(duracionDeriva(0, 6500)).toBe(0);
  });
  it('crece con la distancia, con piso y techo', () => {
    expect(duracionDeriva(0.1, 6500)).toBe(3250);
    expect(duracionDeriva(2, 6500)).toBeGreaterThan(duracionDeriva(1, 6500));
    expect(duracionDeriva(50, 6500)).toBe(26000);
  });
});
