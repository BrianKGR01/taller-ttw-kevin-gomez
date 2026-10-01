import { expect, test } from '@playwright/test';
import { abrir, esperarDiapo } from './ayudas';

test.describe('vista de presentador', () => {
  test.skip(({ isMobile }) => isMobile, 'la vista de presentador es de escritorio');
  test.use({ viewport: { width: 1280, height: 760 } });

  test('se sincroniza con la ventana principal en los dos sentidos', async ({ context }) => {
    test.setTimeout(90_000);
    const principal = await context.newPage();
    await abrir(principal, '#/3/2');
    const presentador = await context.newPage();
    await presentador.goto('/presentador/');

    // Refleja la posición de la principal, con su siguiente y las notas del bloque.
    await expect(presentador.locator('[data-id-actual]')).toHaveText('3.2', { timeout: 20_000 });
    await expect(presentador.locator('[data-bloque-nombre]')).toContainText('Bloque 3');
    await expect(presentador.locator('[data-notas-bloque]')).not.toBeEmpty();
    await expect(presentador.locator('[data-bloque-presupuesto]')).toHaveText('5′');

    // El presentador manda: sus botones mueven la principal.
    await presentador.keyboard.press('ArrowRight');
    await esperarDiapo(principal, '4.0');
    await expect(presentador.locator('[data-id-actual]')).toHaveText('4.0');
    await expect(presentador.locator('[data-bloque-presupuesto]')).toHaveText('4′');

    // La principal manda: lo que se hace allí se ve en el presentador.
    await principal.keyboard.press('ArrowDown');
    await esperarDiapo(principal, '4.1');
    await expect(presentador.locator('[data-id-actual]')).toHaveText('4.1');
    await expect(presentador.locator('[data-id-sig]')).toHaveText('4.2');
  });

  test('el cronómetro corre, se pausa y se reinicia; el guion de 60′ cambia el presupuesto', async ({ context }) => {
    test.setTimeout(90_000);
    const principal = await context.newPage();
    await abrir(principal, '#/3/2');
    const p = await context.newPage();
    await p.goto('/presentador/');
    await expect(p.locator('[data-id-actual]')).toHaveText('3.2', { timeout: 20_000 });

    await p.locator('[data-reloj-alternar]').click();
    await expect(p.locator('[data-reloj-alternar]')).toHaveText('Pausar');
    await expect.poll(async () => (await p.locator('[data-reloj]').textContent()) !== '00:00', { timeout: 5000 }).toBe(true);
    await p.locator('[data-reloj-alternar]').click();
    await expect(p.locator('[data-reloj-alternar]')).toHaveText('Reanudar');
    await p.locator('[data-reloj-reiniciar]').click();
    await expect(p.locator('[data-reloj]')).toHaveText('00:00');

    await p.locator('[data-version="60"]').click();
    await expect(p.locator('[data-bloque-presupuesto]')).toHaveText('9′');
    await p.locator('[data-version="30"]').click();
    await expect(p.locator('[data-bloque-presupuesto]')).toHaveText('5′');
  });

  test('S en la principal abre la ventana de presentador', async ({ context }) => {
    const principal = await context.newPage();
    await abrir(principal);
    const emergente = context.waitForEvent('page');
    await principal.keyboard.press('s');
    const ventana = await emergente;
    await ventana.waitForLoadState('domcontentloaded');
    expect(ventana.url()).toContain('/presentador/');
  });
});
