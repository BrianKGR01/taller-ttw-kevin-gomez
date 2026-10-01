/**
 * Código QR como SVG en línea, generado en el build (sin imagen, sin red).
 *
 * El SVG no lleva colores propios: el fondo y los módulos son clases
 * (`qr__fondo`, `qr__modulos`) que la hoja de estilos pinta con tokens, así el
 * QR sigue al tema. Para las pruebas se pueden pedir colores explícitos y
 * rasterizarlo (tests/unit/contacto.test.ts lo decodifica).
 *
 * El margen de silencio (4 módulos, el mínimo de la norma) va dentro del propio
 * SVG: es parte del código y sin él muchos lectores no lo encuentran.
 */
import QRCode from 'qrcode';

export type NivelQR = 'L' | 'M' | 'Q' | 'H';

export interface MatrizQR {
  /** Módulos por lado (sin margen). */
  tam: number;
  /** `modulos[fila][columna]` es true si el módulo es oscuro. */
  modulos: boolean[][];
}

export function matrizQR(texto: string, nivel: NivelQR = 'M'): MatrizQR {
  const qr = QRCode.create(texto, { errorCorrectionLevel: nivel });
  const tam = qr.modules.size;
  const modulos: boolean[][] = [];
  for (let f = 0; f < tam; f++) {
    const fila: boolean[] = [];
    for (let c = 0; c < tam; c++) fila.push(Boolean(qr.modules.get(f, c)));
    modulos.push(fila);
  }
  return { tam, modulos };
}

/** Un único `<path>`: cada tramo horizontal de módulos oscuros es un rectángulo. */
export function trazadoQR({ tam, modulos }: MatrizQR, margen: number): string {
  const partes: string[] = [];
  for (let f = 0; f < tam; f++) {
    let c = 0;
    while (c < tam) {
      if (!modulos[f]![c]) {
        c++;
        continue;
      }
      const ini = c;
      while (c < tam && modulos[f]![c]) c++;
      partes.push(`M${ini + margen} ${f + margen}h${c - ini}v1h-${c - ini}z`);
    }
  }
  return partes.join('');
}

export interface OpcionesSvgQR {
  nivel?: NivelQR;
  /** Módulos de margen de silencio. La norma pide 4. */
  margen?: number;
  /** Texto accesible del SVG. */
  etiqueta?: string;
  /** Colores explícitos (solo pruebas); por defecto el SVG usa clases. */
  colores?: { fondo: string; modulos: string };
}

export function svgQR(texto: string, opciones: OpcionesSvgQR = {}): string {
  const { nivel = 'M', margen = 4, etiqueta, colores } = opciones;
  const m = matrizQR(texto, nivel);
  const lado = m.tam + margen * 2;
  const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const atrFondo = colores ? `fill="${escapar(colores.fondo)}"` : 'class="qr__fondo"';
  const atrModulos = colores ? `fill="${escapar(colores.modulos)}"` : 'class="qr__modulos"';
  const aria = etiqueta ? ` role="img" aria-label="${escapar(etiqueta)}"` : ' aria-hidden="true"';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="qr" viewBox="0 0 ${lado} ${lado}" width="${lado}" height="${lado}" shape-rendering="crispEdges" focusable="false"${aria}>` +
    `<rect ${atrFondo} width="${lado}" height="${lado}"/>` +
    `<path ${atrModulos} d="${trazadoQR(m, margen)}"/>` +
    `</svg>`
  );
}
