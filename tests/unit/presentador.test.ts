import { describe, expect, it } from 'vitest';
import { Cronometro, estadoDeTiempo, formatear, presupuestoDe } from '../../src/lib/cronometro';
import { ACCIONES, validarMensaje } from '../../src/lib/sincronizacion';

describe('protocolo de sincronización', () => {
  it('acepta mensajes bien formados', () => {
    expect(validarMensaje({ tipo: 'estado', b: 3, d: 2, p: 1, id: '3.2' })).toEqual({ tipo: 'estado', b: 3, d: 2, p: 1, id: '3.2' });
    expect(validarMensaje({ tipo: 'hola' })).toEqual({ tipo: 'hola' });
    expect(validarMensaje({ tipo: 'ir', b: 1, d: 0, p: 0 })).toEqual({ tipo: 'ir', b: 1, d: 0, p: 0 });
    for (const accion of ACCIONES) expect(validarMensaje({ tipo: 'comando', accion })).toEqual({ tipo: 'comando', accion });
  });

  it('descarta lo que no tiene la forma esperada', () => {
    for (const malo of [null, undefined, 3, 'estado', {}, { tipo: 'otro' }, { tipo: 'estado', b: -1, d: 0, p: 0, id: 'x' }, { tipo: 'estado', b: 1.5, d: 0, p: 0, id: 'x' }, { tipo: 'estado', b: 1, d: 0, p: 0 }, { tipo: 'comando', accion: 'borrar-todo' }, { tipo: 'ir', b: '1', d: 0, p: 0 }]) {
      expect(validarMensaje(malo), JSON.stringify(malo)).toBeNull();
    }
  });

  it('ignora campos extra (no los propaga)', () => {
    const r = validarMensaje({ tipo: 'comando', accion: 'siguiente', ejecutar: 'alert(1)' });
    expect(r).toEqual({ tipo: 'comando', accion: 'siguiente' });
  });
});

describe('cronómetro', () => {
  it('formatea mm:ss y h:mm:ss', () => {
    expect(formatear(0)).toBe('00:00');
    expect(formatear(65_000)).toBe('01:05');
    expect(formatear(59 * 60_000 + 59_999)).toBe('59:59');
    expect(formatear(3_600_000 + 61_000)).toBe('1:01:01');
    expect(formatear(-5)).toBe('00:00');
  });

  it('acumula solo mientras corre y soporta pausa y reinicio', () => {
    let t = 0;
    const c = new Cronometro(() => t);
    expect(c.transcurrido()).toBe(0);
    c.iniciar();
    t = 5_000;
    expect(c.transcurrido()).toBe(5_000);
    c.pausar();
    t = 20_000;
    expect(c.transcurrido()).toBe(5_000);
    c.iniciar();
    t = 23_000;
    expect(c.transcurrido()).toBe(8_000);
    c.reiniciar();
    expect(c.transcurrido()).toBe(0);
    expect(c.corriendo).toBe(false);
  });

  it('avisa cuando un bloque se acerca o pasa su tiempo', () => {
    expect(estadoDeTiempo(60_000, 5)).toBe('holgado');
    expect(estadoDeTiempo(4.25 * 60_000, 5)).toBe('atencion');
    expect(estadoDeTiempo(5 * 60_000, 5)).toBe('atencion');
    expect(estadoDeTiempo(5 * 60_000 + 1, 5)).toBe('excedido');
    expect(estadoDeTiempo(10_000, 0)).toBe('holgado');
  });

  it('elige el presupuesto de la versión de 30 o de 60 minutos', () => {
    expect(presupuestoDe({ tiempo30: 5, tiempo60: 9 }, '30')).toBe(5);
    expect(presupuestoDe({ tiempo30: 5, tiempo60: 9 }, '60')).toBe(9);
  });
});
