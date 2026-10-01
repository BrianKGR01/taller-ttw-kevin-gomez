import { expect, test, type Page } from '@playwright/test';
import { abrir, activa, esperarDiapo } from './ayudas';

/**
 * Tipo `documento`: recorrido de cámara sobre AGENTS.md (5.11) y el roadmap (6.3).
 * El paso llega por `taller:paso` desde el motor de navegación; aquí se prueba
 * de punta a punta con el teclado.
 */

const DOCS = [
  { id: '5.11', hash: '#/5/11', secciones: 13, texto: 'Mapa de documentación', descarga: 'ejemplo-AGENTS-hotel.md', copia: ['# AGENTS.md — Sistema de gestión del hotel', '## Definición de terminado'] },
  { id: '6.3', hash: '#/6/3', secciones: 12, texto: 'Anexo B', descarga: 'ejemplo-roadmap-hotel.md', copia: ['# Roadmap general — Sistema de gestión del hotel', '## Hito 7 — Hardening y despliegue'] },
];

const escala = (page: Page) => page.locator('.diap[data-activa] [data-camara]').evaluate((el) => parseFloat((el as HTMLElement).style.getPropertyValue('--cam-s')));
const actual = (page: Page) => page.locator('.diap[data-activa] .doc-sec[aria-current]');
const estado = (page: Page) => page.locator('.diap[data-activa] [data-documento]');

/** Tiempos cortos para probar el auto-avance sin esperar segundos de verdad. */
async function acelerar(page: Page, auto = 450, recorrido = 80) {
  await page.addStyleTag({ content: `:root{--mov-auto-avance:${auto}ms !important;--mov-recorrido:${recorrido}ms !important}` });
}

for (const doc of DOCS) {
  test.describe(`documento ${doc.id}`, () => {
    test('empieza en la vista completa, con la hoja entera y el índice', async ({ page }) => {
      await abrir(page, doc.hash);
      await esperarDiapo(page, doc.id);
      await expect(estado(page)).toHaveAttribute('data-estado', 'general');
      await expect(estado(page)).toHaveAttribute('data-listo', '');
      await expect(page.locator('.diap[data-activa] .documento__indice li')).toHaveCount(doc.secciones);
      // La hoja cabe entera en la vista (escala menor que 1).
      expect(await escala(page)).toBeLessThan(1);
      const caja = await page.locator('.diap[data-activa] [data-vista]').boundingBox();
      const hoja = await page.locator('.diap[data-activa] [data-hoja]').boundingBox();
      expect(hoja!.y).toBeGreaterThanOrEqual(caja!.y - 1);
      expect(hoja!.y + hoja!.height).toBeLessThanOrEqual(caja!.y + caja!.height + 1);
      expect(hoja!.x + hoja!.width).toBeLessThanOrEqual(caja!.x + caja!.width + 1);
    });

    test('cada avance pasa a la sección siguiente, con zoom y resaltado; al final vuelve y sale', async ({ page }) => {
      await abrir(page, doc.hash);
      await esperarDiapo(page, doc.id);
      const vista = await escala(page);
      for (let k = 1; k <= doc.secciones; k++) {
        await page.keyboard.press('PageDown');
        await expect(estado(page)).toHaveAttribute('data-estado', 'seccion');
        await expect(actual(page)).toHaveAttribute('data-tour', String(k));
        await expect(page.locator(`.diap[data-activa] [data-rotulo="${k}"]`)).toHaveAttribute('data-actual', '');
        // Hay exactamente una sección resaltada y la cámara se acercó.
        await expect(page.locator('.diap[data-activa] .doc-sec[aria-current]')).toHaveCount(1);
        expect(await escala(page)).toBeGreaterThan(vista * 2);
      }
      // Un avance más: vista completa otra vez, todavía en la misma diapositiva.
      await page.keyboard.press('PageDown');
      await expect(estado(page)).toHaveAttribute('data-estado', 'general');
      await expect(page.locator('.diap[data-activa] .doc-sec[aria-current]')).toHaveCount(0);
      await esperarDiapo(page, doc.id);
      // Y otro más sale de la diapositiva.
      await page.keyboard.press('PageDown');
      await expect(activa(page)).not.toHaveAttribute('data-id', doc.id);
    });

    test('retroceder vuelve a la sección anterior', async ({ page }) => {
      await abrir(page, doc.hash);
      await esperarDiapo(page, doc.id);
      for (let i = 0; i < 3; i++) await page.keyboard.press('PageDown');
      await expect(actual(page)).toHaveAttribute('data-tour', '3');
      await page.keyboard.press('PageUp');
      await expect(actual(page)).toHaveAttribute('data-tour', '2');
      await page.keyboard.press('PageUp');
      await page.keyboard.press('PageUp');
      await expect(estado(page)).toHaveAttribute('data-estado', 'general');
      await esperarDiapo(page, doc.id);
    });

    test('en cada sección el texto se ve grande, de sala', async ({ page }) => {
      await abrir(page, doc.hash);
      await esperarDiapo(page, doc.id);
      await page.keyboard.press('PageDown');
      await expect(actual(page)).toHaveAttribute('data-tour', '1');
      const medidas = await page.evaluate(() => {
        const diap = document.querySelector('.diap[data-activa]')!;
        const cam = parseFloat((diap.querySelector('[data-camara]') as HTMLElement).style.getPropertyValue('--cam-s'));
        const p = diap.querySelector('.doc-sec[aria-current] p, .doc-sec[aria-current] li')!;
        const objetivo = parseFloat(getComputedStyle(diap.querySelector('.rotulo__etiqueta')!).fontSize);
        return { efectivo: parseFloat(getComputedStyle(p).fontSize) * cam, objetivo };
      });
      expect(medidas.efectivo).toBeGreaterThanOrEqual(medidas.objetivo * 0.8);
    });

    test('el auto-avance recorre solo y se detiene en la vista completa', async ({ page }) => {
      await abrir(page, doc.hash);
      await esperarDiapo(page, doc.id);
      await acelerar(page);
      // En la vista inicial no arranca solo.
      await page.waitForTimeout(1500);
      await expect(estado(page)).toHaveAttribute('data-estado', 'general');
      // Con el recorrido en marcha, sigue sin tocar nada.
      await page.keyboard.press('PageDown');
      // El auto-avance está acelerado: el primer paso es pasajero, se comprueba que el recorrido arrancó.
      await expect.poll(async () => Number(await actual(page).getAttribute('data-tour'))).toBeGreaterThanOrEqual(1);
      await expect(actual(page)).toHaveAttribute('data-tour', '3', { timeout: 20_000 });
      await expect(estado(page)).toHaveAttribute('data-estado', 'general', { timeout: 60_000 });
      // Al llegar al final no sale de la diapositiva por su cuenta.
      await page.waitForTimeout(1500);
      await esperarDiapo(page, doc.id);
      await expect(estado(page)).toHaveAttribute('data-estado', 'general');
    });

    test('cualquier tecla reinicia la espera del auto-avance', async ({ page }) => {
      await abrir(page, doc.hash);
      await esperarDiapo(page, doc.id);
      await acelerar(page, 2500);
      await page.keyboard.press('PageDown');
      await expect(actual(page)).toHaveAttribute('data-tour', '1');
      for (let i = 0; i < 8; i++) {
        // Una tecla que no navega (Mayús) basta para que el recorrido espere.
        await page.keyboard.press('Shift');
        await page.waitForTimeout(300);
      }
      await expect(actual(page)).toHaveAttribute('data-tour', '1');
      await expect(actual(page)).toHaveAttribute('data-tour', '2', { timeout: 20_000 });
    });

    test('con movimiento reducido salta sin animar y no avanza solo', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await abrir(page, doc.hash);
      await esperarDiapo(page, doc.id);
      await acelerar(page);
      await page.keyboard.press('PageDown');
      await expect(actual(page)).toHaveAttribute('data-tour', '1');
      const duracion = await page.locator('.diap[data-activa] [data-camara]').evaluate((el) => getComputedStyle(el).transitionDuration);
      // La hoja global de movimiento reducido deja la transición en una fracción de milisegundo.
      for (const d of duracion.split(',')) expect(parseFloat(d)).toBeLessThan(0.001);
      await page.waitForTimeout(1800);
      await expect(actual(page)).toHaveAttribute('data-tour', '1');
    });

    test('volver a la diapositiva coloca la cámara sin recorrer de nuevo', async ({ page }) => {
      await abrir(page, doc.hash);
      await esperarDiapo(page, doc.id);
      for (let i = 0; i < 4; i++) await page.keyboard.press('PageDown');
      await expect(actual(page)).toHaveAttribute('data-tour', '4');
      await page.evaluate(() => (location.hash = '#/0/1'));
      await expect(activa(page)).not.toHaveAttribute('data-id', doc.id);
      await page.evaluate((h) => (location.hash = h), doc.hash);
      await esperarDiapo(page, doc.id);
      await expect(estado(page)).toHaveAttribute('data-estado', 'general');
    });

    test('lectura: la hoja completa, sin cámara y sin scroll horizontal', async ({ page }) => {
      await page.goto(`/?modo=lectura${doc.hash}`);
      await expect(page.locator('html')).toHaveAttribute('data-listo', '');
      const id = `#d-${doc.id.replace('.', '-')}`;
      await page.locator(`${id} [data-hoja]`).scrollIntoViewIfNeeded();
      await expect(page.locator(`${id} [data-hoja]`)).toContainText(doc.texto);
      // Sin cámara: la hoja ocupa su sitio natural y no hay secciones atenuadas.
      expect(await page.locator(`${id} [data-camara]`).evaluate((el) => getComputedStyle(el).transform)).toBe('none');
      await expect(page.locator(`${id} .doc-sec[aria-current]`)).toHaveCount(0);
      const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(desborde).toBeLessThanOrEqual(0);
      // Todas las secciones del documento están en el DOM.
      expect(await page.locator(`${id} .doc-sec`).count()).toBeGreaterThanOrEqual(doc.secciones);
    });

    test('lectura: Copiar entrega el documento completo y Descargar apunta al archivo', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto(`/?modo=lectura${doc.hash}`);
      await expect(page.locator('html')).toHaveAttribute('data-listo', '');
      const id = `#d-${doc.id.replace('.', '-')}`;
      const copiar = page.locator(`${id} [data-copiar]`);
      await copiar.scrollIntoViewIfNeeded();
      await copiar.click();
      await expect(copiar).toHaveAttribute('data-estado', 'copiado');
      const texto = await page.evaluate(() => navigator.clipboard.readText());
      for (const fragmento of doc.copia) expect(texto).toContain(fragmento);
      expect(texto.split('\n').length).toBeGreaterThan(150);
      const enlace = page.locator(`${id} a[download]`);
      await expect(enlace).toHaveAttribute('href', `/descargas/${doc.descarga}`);
      const respuesta = await page.request.get(`/descargas/${doc.descarga}`);
      expect(respuesta.ok()).toBe(true);
      expect(await respuesta.text()).toContain(doc.copia[0]!.replace(/^# /, '# '));
    });

    test('presentación: el botón Copiar sigue a mano y no roba las teclas de avance', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await abrir(page, doc.hash);
      await esperarDiapo(page, doc.id);
      const copiar = page.locator('.diap[data-activa] [data-copiar]');
      await expect(copiar).toBeVisible();
      await copiar.click();
      await expect(copiar).toHaveAttribute('data-estado', 'copiado');
      expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(doc.copia[1]!);
      // Tras el clic el foco se suelta: Espacio sigue avanzando el recorrido.
      await page.keyboard.press('Space');
      await expect(actual(page)).toHaveAttribute('data-tour', '1');
    });
  });
}
