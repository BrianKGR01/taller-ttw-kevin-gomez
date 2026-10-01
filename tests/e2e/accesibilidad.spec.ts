import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { abrir } from './ayudas';

/**
 * Accesibilidad automática (axe) en los dos modos de uso y los dos temas. Es
 * una red contra regresiones; no sustituye a mirar la pantalla ni a navegar con
 * teclado y lector de pantalla.
 */
const REGLAS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function auditar(page: Page, contexto: string) {
  const r = await new AxeBuilder({ page }).withTags(REGLAS).exclude('.fondo').analyze();
  const graves = r.violations.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(graves, `${contexto}\n${graves.join('\n')}`).toEqual([]);
}

for (const tema of ['light', 'dark'] as const) {
  test.describe(`accesibilidad · tema ${tema}`, () => {
    test.use({ colorScheme: tema, reducedMotion: 'reduce' });

    test('modo lectura completo', async ({ page }) => {
      test.setTimeout(120_000);
      await page.goto('/?modo=lectura');
      await expect(page.locator('html')).toHaveAttribute('data-listo', '');
      await auditar(page, 'lectura');
    });

    test('modo presentación: portada, lista, tabla, código, diagrama y documento', async ({ page, isMobile }) => {
      test.skip(isMobile, 'la presentación se audita en escritorio');
      test.setTimeout(180_000);
      for (const hash of ['#/0/1', '#/3/2', '#/2/1', '#/3/6', '#/10/2', '#/5/11', '#/6/4', '#/8/3', '#/11/2']) {
        await abrir(page, hash);
        await page.waitForTimeout(300);
        await auditar(page, `presentación ${hash}`);
      }
    });

    test('vista general y ayuda', async ({ page, isMobile }) => {
      test.skip(isMobile, 'se audita en escritorio');
      await abrir(page);
      await page.keyboard.press('o');
      await expect(page.locator('#vista-general')).toBeVisible();
      await auditar(page, 'vista general');
      await page.keyboard.press('Escape');
      await page.keyboard.press('?');
      await expect(page.locator('#ayuda')).toBeVisible();
      await auditar(page, 'ayuda');
    });
  });
}

test('vista de presentador', async ({ page, isMobile }) => {
  test.skip(isMobile, 'la vista de presentador es de escritorio');
  await page.goto('/presentador/');
  await auditar(page, 'presentador');
});

test.describe('teclado', () => {
  test.use({ reducedMotion: 'reduce' });
  test('todo control tiene nombre accesible y foco visible', async ({ page, isMobile }) => {
    test.skip(isMobile, 'el foco por teclado se prueba en escritorio');
    await abrir(page);
    const sinNombre = await page.$$eval('button, a[href]', (els) =>
      els
        .filter((e) => (e as HTMLElement).offsetParent !== null)
        .filter((e) => !(e.getAttribute('aria-label') || (e.textContent ?? '').trim() || e.getAttribute('title')))
        .map((e) => e.outerHTML.slice(0, 80)),
    );
    expect(sinNombre).toEqual([]);
    // Tab recorre la barra: cada parada debe tener un anillo de foco de contorno visible.
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      const contorno = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const s = getComputedStyle(el);
        return { ancho: parseFloat(s.outlineWidth), estilo: s.outlineStyle };
      });
      expect(contorno.estilo).not.toBe('none');
      expect(contorno.ancho).toBeGreaterThanOrEqual(2);
    }
  });
});
