import { expect, test } from '@playwright/test';
import { abrir, esperarDiapo } from './ayudas';

test.describe('botón Copiar', () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  });

  test('copia el prompt completo y confirma con una animación', async ({ page }) => {
    await abrir(page, '#/3/6');
    await esperarDiapo(page, '3.6');
    const boton = page.locator('.diap[data-activa] [data-copiar]');
    await expect(boton).toBeVisible();
    await boton.click();
    await expect(boton).toHaveAttribute('data-estado', 'copiado');
    await expect(boton.locator('[data-copiar-texto]')).toHaveText('¡Copiado!');
    const portapapeles = await page.evaluate(() => navigator.clipboard.readText());
    // Copia el texto completo aunque en pantalla se esté "tecleando".
    expect(portapapeles).toContain('No escribas código.');
    expect(portapapeles).toContain('Una lista de lo que es transversal (auth, estados, roles, auditoría)');
    expect(portapapeles.split('\n').length).toBeGreaterThanOrEqual(8);
    await expect(boton).not.toHaveAttribute('data-estado', 'copiado', { timeout: 4000 });
    await expect(boton.locator('[data-copiar-texto]')).toHaveText('Copiar');
  });

  test('funciona también en modo lectura', async ({ page }) => {
    await page.goto('/?modo=lectura#/3/6');
    await expect(page.locator('html')).toHaveAttribute('data-listo', '');
    const boton = page.locator('#d-3-6 [data-copiar]');
    await boton.scrollIntoViewIfNeeded();
    await boton.click();
    await expect(boton).toHaveAttribute('data-estado', 'copiado');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Entrevístame una pregunta a la vez');
  });

  test('en lectura el texto del prompt está completo, sin efecto de tecleo', async ({ page }) => {
    await page.goto('/?modo=lectura#/3/6');
    await expect(page.locator('html')).toHaveAttribute('data-listo', '');
    await expect(page.locator('#d-3-6 code[data-texto]')).toContainText('Cuando esté completa, genérame:');
  });
});
