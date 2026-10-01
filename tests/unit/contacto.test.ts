import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import jsQR from 'jsqr';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { colorDeToken, contraste } from '../../scripts/contraste.mjs';
import { formatearTelefono, parsearContacto } from '../../src/lib/contacto';
import { matrizQR, svgQR } from '../../src/lib/qr';

const RAIZ = process.cwd();

describe('parsearContacto', () => {
  it('lee el archivo real assets/contacto.md', () => {
    const c = parsearContacto(readFileSync(join(RAIZ, 'assets', 'contacto.md'), 'utf8'));
    expect(c.nombre).toBeTruthy();
    expect(c.redes.instagram?.url).toMatch(/^https:\/\/www\.instagram\.com\/[\w.]+$/);
    expect(c.redes.instagram?.texto).toMatch(/^@[\w.]+$/);
    expect(c.redes.whatsapp?.url).toMatch(/^https:\/\/wa\.me\/\d{7,15}$/);
    expect(c.redes.linkedin?.url).toMatch(/^https:\/\/www\.linkedin\.com\/in\/[\w%-]+$/);
    expect(c.redes.linkedin?.texto).toMatch(/^in\//);
  });

  it('extrae nombre y las tres redes con el formato de la lista en negritas', () => {
    const c = parsearContacto(
      [
        '# Contacto',
        '',
        '- **Nombre:** Ana Pérez',
        '- **Instagram:** https://www.instagram.com/ana_perez',
        '- **WhatsApp:** https://wa.me/59170000000',
        '- **LinkedIn:** https://www.linkedin.com/in/anaperez',
      ].join('\n'),
    );
    expect(c).toEqual({
      nombre: 'Ana Pérez',
      redes: {
        instagram: { url: 'https://www.instagram.com/ana_perez', texto: '@ana_perez' },
        whatsapp: { url: 'https://wa.me/59170000000', texto: '+591 70000000' },
        linkedin: { url: 'https://www.linkedin.com/in/anaperez', texto: 'in/anaperez' },
      },
    });
  });

  it('tolera CRLF, mayúsculas, acentos, enlaces Markdown y barras finales', () => {
    const c = parsearContacto(
      '* NOMBRE: Luz\r\n* instagram: [mi perfil](https://instagram.com/luz.v/)\r\n* Whatsapp: <https://wa.me/5491155550000>\r\n* LINKEDIN: https://linkedin.com/in/luzv/\r\n',
    );
    expect(c.nombre).toBe('Luz');
    expect(c.redes.instagram?.url).toBe('https://www.instagram.com/luz.v');
    expect(c.redes.whatsapp?.texto).toBe('+5491155550000');
    expect(c.redes.linkedin?.url).toBe('https://www.linkedin.com/in/luzv');
  });

  it('acepta usuario o número sueltos', () => {
    const c = parsearContacto('- Instagram: @kevin\n- WhatsApp: +591 7502 0808\n- LinkedIn: in/kevinbgr');
    expect(c.redes.instagram?.url).toBe('https://www.instagram.com/kevin');
    expect(c.redes.whatsapp?.url).toBe('https://wa.me/59175020808');
    expect(c.redes.linkedin?.url).toBe('https://www.linkedin.com/in/kevinbgr');
  });

  it('si falta un dato, queda en null y los demás siguen', () => {
    const c = parsearContacto('- **Instagram:** https://www.instagram.com/x1\n- **LinkedIn:** https://www.linkedin.com/in/x1abc');
    expect(c.nombre).toBeNull();
    expect(c.redes.whatsapp).toBeNull();
    expect(c.redes.instagram).not.toBeNull();
    expect(c.redes.linkedin).not.toBeNull();
  });

  it('sin archivo, vacío o ilegible: todo null (la diapositiva muestra espacios marcados)', () => {
    const vacio = { nombre: null, redes: { instagram: null, whatsapp: null, linkedin: null } };
    expect(parsearContacto(null)).toEqual(vacio);
    expect(parsearContacto(undefined)).toEqual(vacio);
    expect(parsearContacto('')).toEqual(vacio);
    expect(parsearContacto('texto sin formato\notra línea')).toEqual(vacio);
  });

  it('descarta valores peligrosos o de otro dominio', () => {
    const c = parsearContacto(
      [
        '- Instagram: javascript:alert(1)',
        '- WhatsApp: https://evil.example/59170000000',
        '- LinkedIn: https://www.linkedin.com.evil.example/in/x1abc',
      ].join('\n'),
    );
    expect(c.redes).toEqual({ instagram: null, whatsapp: null, linkedin: null });
    expect(parsearContacto('- Instagram: https://instagram.com@evil.example/x').redes.instagram).toBeNull();
  });

  it('formatea teléfonos de Bolivia y de otros países', () => {
    expect(formatearTelefono('59175020808')).toBe('+591 75020808');
    expect(formatearTelefono('5491155550000')).toBe('+5491155550000');
  });
});

/** Colores de la placa y los módulos según cierre.css, resueltos con los tokens de cada modo. */
function coloresQR(modo: 'claro' | 'oscuro') {
  const css = readFileSync(join(RAIZ, 'src', 'styles', 'tipos', 'cierre.css'), 'utf8');
  const par = (nombre: string) => {
    const m = new RegExp(`${nombre}:\\s*light-dark\\(var\\((--[\\w-]+)\\),\\s*var\\((--[\\w-]+)\\)\\)`).exec(css);
    if (!m) throw new Error(`cierre.css no define ${nombre} con light-dark(var(--a), var(--b))`);
    return colorDeToken(modo === 'claro' ? m[1]! : m[2]!, modo) as number[];
  };
  const rgb = (c: number[]) => `rgb(${c.join(',')})`;
  const modulo = par('--qr-modulo');
  const placa = par('--qr-placa');
  return { modulo, placa, css: { fondo: rgb(placa), modulos: rgb(modulo) } };
}

async function decodificar(svg: string, lado: number) {
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 * 16 })
    .resize(lado, lado, { kernel: 'nearest', fit: 'fill' })
    .flatten({ background: '#808080' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // `dontInvert`: solo vale la polaridad normal (módulos oscuros sobre placa clara).
  return jsQR(new Uint8ClampedArray(data), info.width, info.height, { inversionAttempts: 'dontInvert' });
}

describe('QR de la última diapositiva', () => {
  const config = readFileSync(join(RAIZ, 'astro.config.mjs'), 'utf8');
  // El respaldo de `site` (ADR-017): la URL que se usa cuando no hay SITE_URL ni variable de Vercel.
  const sitio = /: '(https:\/\/[^']+)'\);/.exec(config)?.[1];
  const url = new URL('/', sitio).href;

  it('lee la URL de producción de astro.config.mjs', () => {
    expect(sitio).toMatch(/^https:\/\//);
  });

  it('la matriz tiene el tamaño de una versión de QR válida', () => {
    const { tam, modulos } = matrizQR(url);
    expect((tam - 21) % 4).toBe(0);
    expect(modulos).toHaveLength(tam);
    // Patrón de búsqueda: esquina superior izquierda 7×7 con anillo oscuro.
    expect(modulos[0]!.slice(0, 7).every(Boolean)).toBe(true);
    expect(modulos[3]![3]).toBe(true);
  });

  it('el SVG usa clases (los colores son tokens) y 4 módulos de margen de silencio', () => {
    const svg = svgQR(url, { etiqueta: 'QR de prueba' });
    const { tam } = matrizQR(url);
    expect(svg).toContain('class="qr__fondo"');
    expect(svg).toContain('class="qr__modulos"');
    expect(svg).toContain(`viewBox="0 0 ${tam + 8} ${tam + 8}"`);
    expect(svg).toContain('role="img"');
    expect(svg).not.toMatch(/fill="/);
    // Ningún módulo oscuro cae en el margen.
    const tramos = [...svg.matchAll(/M(\d+) (\d+)h(\d+)v1/g)].map((m) => [Number(m[1]), Number(m[2]), Number(m[3])] as const);
    expect(Math.min(...tramos.map(([x]) => x))).toBe(4);
    expect(Math.min(...tramos.map(([, y]) => y))).toBe(4);
    expect(Math.max(...tramos.map(([x, , w]) => x + w))).toBe(tam + 4);
    expect(Math.max(...tramos.map(([, y]) => y + 1))).toBe(tam + 4);
  });

  for (const modo of ['claro', 'oscuro'] as const) {
    it(`se decodifica a la URL de producción en modo ${modo} (colores reales de los tokens)`, async () => {
      const { modulo, placa, css } = coloresQR(modo);
      expect(contraste(modulo, placa), 'contraste módulos / placa').toBeGreaterThanOrEqual(7);
      // Los módulos son más oscuros que la placa, en los dos temas.
      expect(modulo[0]! + modulo[1]! + modulo[2]!).toBeLessThan(placa[0]! + placa[1]! + placa[2]!);
      const svg = svgQR(url, { colores: css });
      for (const lado of [740, 360, 240]) {
        const r = await decodificar(svg, lado);
        expect(r?.data, `decodificación a ${lado}px`).toBe(url);
      }
    });
  }

  it('el QR cambia con la URL (no hay nada fijo)', async () => {
    const { css } = coloresQR('claro');
    const r = await decodificar(svgQR('https://ejemplo.dev/otra-url', { colores: css }), 500);
    expect(r?.data).toBe('https://ejemplo.dev/otra-url');
  });
});
