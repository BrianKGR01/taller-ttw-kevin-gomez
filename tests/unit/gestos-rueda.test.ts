import { describe, expect, it } from 'vitest';
import { clasificarGesto } from '../../src/lib/gestos';
import { crearFiltroRueda } from '../../src/lib/rueda';

describe('gestos táctiles', () => {
  it('reconoce swipes horizontales y verticales', () => {
    expect(clasificarGesto(-120, 10, 200)).toBe('izquierda');
    expect(clasificarGesto(120, -10, 200)).toBe('derecha');
    expect(clasificarGesto(5, -150, 250)).toBe('arriba');
    expect(clasificarGesto(-5, 150, 250)).toBe('abajo');
  });

  it('descarta toques cortos, lentos y diagonales', () => {
    expect(clasificarGesto(20, 10, 100)).toBeNull();
    expect(clasificarGesto(-200, 0, 2000)).toBeNull();
    expect(clasificarGesto(100, 100, 200)).toBeNull();
  });

  it('un desplazamiento mayormente vertical con algo de deriva horizontal cuenta como vertical', () => {
    expect(clasificarGesto(30, -160, 300)).toBe('arriba');
  });
});

describe('filtro de rueda: sin saltos dobles', () => {
  it('dispara una vez al superar el umbral', () => {
    const f = crearFiltroRueda({ umbral: 40 });
    expect(f(20, 0)).toBe(0);
    expect(f(25, 16)).toBe(1);
  });

  it('una pasada de trackpad con inercia larga avanza una sola diapositiva', () => {
    const f = crearFiltroRueda();
    let disparos = 0;
    // Un gesto: eventos cada 16 ms durante ~1.2 s con delta decreciente.
    for (let t = 0; t < 1200; t += 16) {
      const delta = Math.max(2, 90 - t / 14);
      if (f(delta, t) !== 0) disparos++;
    }
    expect(disparos).toBe(1);
  });

  it('dos pasadas separadas por un silencio avanzan dos veces', () => {
    const f = crearFiltroRueda();
    expect(f(120, 0)).toBe(1);
    expect(f(3, 40)).toBe(0);
    expect(f(120, 1000)).toBe(1);
  });

  it('distingue la dirección', () => {
    const f = crearFiltroRueda();
    expect(f(-120, 0)).toBe(-1);
    expect(f(120, 2000)).toBe(1);
  });

  it('un cambio de dirección reinicia lo acumulado', () => {
    const f = crearFiltroRueda({ umbral: 60 });
    expect(f(40, 0)).toBe(0);
    expect(f(-40, 16)).toBe(0); // reinicia: el acumulado vale -40, no 0
    expect(f(-15, 32)).toBe(0);
    expect(f(-10, 48)).toBe(-1);
  });

  it('una rueda de mouse con una muesca cada 300 ms avanza una por muesca', () => {
    const f = crearFiltroRueda();
    const resultados = [0, 300, 600, 900].map((t) => f(100, t));
    expect(resultados).toEqual([1, 1, 1, 1]);
  });
});
