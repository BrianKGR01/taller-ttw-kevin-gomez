import { expect, test } from '@playwright/test';
import { abrir, deslizar, esperarDiapo } from './ayudas';

test.describe('celular (360 px)', () => {
  test.skip(({ isMobile }) => !isMobile, 'solo en el proyecto celular');

  test('abre en modo lectura por defecto y sin scroll horizontal', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-uso', 'lectura');
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBeLessThanOrEqual(cw);
    expect(cw).toBe(360);
  });

  test('la barra superior cabe en 360 px y los controles son tocables (≥ 44 px)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-listo', '');
    const cajas = await page
      .locator('.barra button, .barra a')
      .evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => e.getBoundingClientRect().toJSON()));
    expect(cajas.length).toBeGreaterThan(2);
    for (const c of cajas) {
      expect(c.right).toBeLessThanOrEqual(360.5);
      expect(c.left).toBeGreaterThanOrEqual(-0.5);
      expect(c.height).toBeGreaterThanOrEqual(43.5);
    }
  });

  test('en modo presentación, el swipe horizontal cambia de bloque y el vertical de diapositiva', async ({ page }) => {
    await abrir(page);
    await esperarDiapo(page, '0.1');
    await deslizar(page, [300, 400], [60, 400]);
    await expect(page.locator('.diap[data-activa]')).toHaveAttribute('data-bloque', '1');
    await deslizar(page, [60, 400], [300, 400]);
    await esperarDiapo(page, '0.1');
    await deslizar(page, [180, 560], [180, 140]);
    await esperarDiapo(page, '0.2');
    await deslizar(page, [180, 140], [180, 560]);
    await esperarDiapo(page, '0.1');
  });

  test('el botón copiar funciona con toque', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#/3/6');
    await expect(page.locator('html')).toHaveAttribute('data-listo', '');
    const boton = page.locator('#d-3-6 [data-copiar]');
    await boton.scrollIntoViewIfNeeded();
    await boton.tap();
    await expect(boton).toHaveAttribute('data-estado', 'copiado');
  });

  test('el cambio de tema funciona con toque', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-accion="tema"]').tap();
    await expect(page.locator('html')).toHaveAttribute('data-modo', 'claro');
  });
});
