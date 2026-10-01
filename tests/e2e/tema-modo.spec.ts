import { expect, test } from '@playwright/test';
import { abrir } from './ayudas';

const fondoDelDocumento = () => getComputedStyle(document.documentElement).backgroundColor;

test.describe('tema: sistema · claro · oscuro', () => {
  test('T alterna los tres estados y cambia los colores de verdad', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await abrir(page);
    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-tema-estado', 'sistema');
    expect(await page.evaluate(fondoDelDocumento)).toBe('rgb(0, 0, 0)');

    await page.keyboard.press('t');
    await expect(html).toHaveAttribute('data-modo', 'claro');
    await expect.poll(() => page.evaluate(fondoDelDocumento)).toBe('rgb(255, 255, 255)');

    await page.keyboard.press('t');
    await expect(html).toHaveAttribute('data-modo', 'oscuro');
    await expect.poll(() => page.evaluate(fondoDelDocumento)).toBe('rgb(0, 0, 0)');

    await page.keyboard.press('t');
    await expect(html).toHaveAttribute('data-tema-estado', 'sistema');
    await expect(html).not.toHaveAttribute('data-modo', /.+/);
  });

  test('el botón visible cambia el tema y anuncia el estado', async ({ page }) => {
    await abrir(page);
    const boton = page.locator('[data-accion="tema"]');
    await expect(boton).toBeVisible();
    await expect(boton).toHaveAttribute('aria-label', /sistema/);
    await boton.click();
    await expect(boton).toHaveAttribute('aria-label', /claro/);
    await expect(page.locator('html')).toHaveAttribute('data-modo', 'claro');
  });

  test('la elección se restaura al recargar, antes del primer pintado', async ({ page }) => {
    await abrir(page);
    await page.keyboard.press('t'); // claro
    await expect(page.locator('html')).toHaveAttribute('data-modo', 'claro');
    await page.reload();
    const alCargar = await page.evaluate(() => document.documentElement.dataset.modo);
    expect(alCargar).toBe('claro');
    // El script que lo fija va en línea en el <head>, no en el paquete del cliente.
    const scriptEnHead = await page.evaluate(() =>
      [...document.head.querySelectorAll('script:not([type="module"])')].some((s) => s.textContent?.includes('gdg-taller-tema')),
    );
    expect(scriptEnHead).toBe(true);
  });

  test('sigue al sistema cuando el estado es sistema', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await abrir(page);
    expect(await page.evaluate(fondoDelDocumento)).toBe('rgb(255, 255, 255)');
  });
});

test.describe('modos de uso', () => {
  test('L alterna entre presentación y lectura; en lectura se ve todo el contenido', async ({ page }) => {
    await abrir(page);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-uso', 'presentacion');
    await expect(page.locator('.diap[data-activa]')).toHaveCount(1);
    await page.keyboard.press('l');
    await expect(html).toHaveAttribute('data-uso', 'lectura');
    await expect(page.locator('.diap[data-activa]')).toHaveCount(0);
    const visibles = await page
      .locator('.diap:not(.diap--apertura)')
      .evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length);
    expect(visibles).toBeGreaterThan(5);
    await page.keyboard.press('l');
    await expect(html).toHaveAttribute('data-uso', 'presentacion');
    await expect(page.locator('.diap[data-activa]')).toHaveCount(1);
  });

  test('?modo= fuerza el modo, aun contra el tamaño de pantalla', async ({ page }) => {
    await page.goto('/?modo=lectura');
    await expect(page.locator('html')).toHaveAttribute('data-uso', 'lectura');
    await page.goto('/?modo=presentacion');
    await expect(page.locator('html')).toHaveAttribute('data-uso', 'presentacion');
  });

  test('en lectura, el hash lleva a la diapositiva', async ({ page }) => {
    await page.goto('/?modo=lectura#/3/6');
    await expect(page.locator('html')).toHaveAttribute('data-listo', '');
    await expect
      .poll(() => page.locator('#d-3-6').evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
      .toBeLessThan(220);
  });

  test('el modo elegido con el botón se recuerda', async ({ page }) => {
    await abrir(page);
    await page.locator('[data-accion="modo"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-uso', 'lectura');
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-uso', 'lectura');
  });
});
