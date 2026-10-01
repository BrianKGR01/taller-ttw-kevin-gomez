import { expect, test } from '@playwright/test';
import { abrir, activa, esperarDiapo } from './ayudas';

test.describe('navegación por teclado', () => {
  test('recorre bloques con ← → y diapositivas con ↑ ↓', async ({ page }) => {
    await abrir(page);
    await esperarDiapo(page, '0.1');
    await page.keyboard.press('ArrowDown');
    await esperarDiapo(page, '0.2');
    await page.keyboard.press('ArrowUp');
    await esperarDiapo(page, '0.1');
    await page.keyboard.press('ArrowRight');
    await expect(activa(page)).toHaveAttribute('data-bloque', '1');
    await page.keyboard.press('ArrowLeft');
    await esperarDiapo(page, '0.1');
  });

  test('Espacio, PageDown y PageUp recorren en orden lineal y cruzan de bloque', async ({ page }) => {
    await abrir(page);
    await page.keyboard.press('Space');
    await esperarDiapo(page, '0.2');
    await page.keyboard.press('PageDown');
    await expect(activa(page)).toHaveAttribute('data-bloque', '1');
    await page.keyboard.press('PageUp');
    await esperarDiapo(page, '0.2');
    await page.keyboard.press('Shift+Space');
    await esperarDiapo(page, '0.1');
  });

  test('Inicio y Fin saltan a la primera y a la última diapositiva', async ({ page }) => {
    await abrir(page, '#/3/2');
    const ultima = await page.locator('.diap').last().getAttribute('data-id');
    await page.keyboard.press('End');
    await esperarDiapo(page, ultima!);
    await page.keyboard.press('Home');
    await esperarDiapo(page, '0.1');
  });

  test('los pasos se revelan de a uno antes de pasar a la siguiente diapositiva', async ({ page }) => {
    await abrir(page, '#/3/2');
    await esperarDiapo(page, '3.2');
    const vistos = page.locator('.diap[data-activa] [data-paso][data-visto]');
    await expect(page.locator('.diap[data-activa] [data-paso]')).toHaveCount(5);
    await expect(vistos).toHaveCount(0);
    await page.keyboard.press('Space');
    await expect(vistos).toHaveCount(1);
    await page.keyboard.press('Space');
    await expect(vistos).toHaveCount(2);
    for (let i = 0; i < 3; i++) await page.keyboard.press('Space');
    await expect(vistos).toHaveCount(5);
    await esperarDiapo(page, '3.2');
    await page.keyboard.press('Space');
    await esperarDiapo(page, '3.6');
    // Al volver hacia atrás, la diapositiva con pasos llega completa.
    await page.keyboard.press('PageUp');
    await esperarDiapo(page, '3.2');
    await expect(vistos).toHaveCount(5);
  });

  test('la rueda avanza una diapositiva por pasada, sin saltos dobles', async ({ page, isMobile }) => {
    test.skip(isMobile, 'la rueda es de escritorio');
    await abrir(page);
    await page.mouse.move(600, 400);
    await page.mouse.wheel(0, 120);
    await esperarDiapo(page, '0.2');
    // Una ráfaga de inercia inmediata no debe saltar otra diapositiva.
    for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 30);
    await page.waitForTimeout(300);
    await esperarDiapo(page, '0.2');
    await page.waitForTimeout(600);
    await page.mouse.wheel(0, -120);
    await esperarDiapo(page, '0.1');
  });
});

test.describe('URL por diapositiva', () => {
  test('cada diapositiva tiene su URL y se puede recargar sin perder la posición', async ({ page }) => {
    await abrir(page, '#/3/6');
    await esperarDiapo(page, '3.6');
    expect(page.url()).toContain('#/3/6');
    await page.reload();
    await esperarDiapo(page, '3.6');
    await page.keyboard.press('ArrowUp');
    await esperarDiapo(page, '3.2');
    expect(page.url()).toMatch(/#\/3\/2$/);
  });

  test('un hash inválido abre la portada', async ({ page }) => {
    await abrir(page, '#/99/99');
    await esperarDiapo(page, '0.1');
  });

  test('cambiar el hash a mano navega', async ({ page }) => {
    await abrir(page);
    await page.evaluate(() => (location.hash = '#/2/1'));
    await esperarDiapo(page, '2.1');
  });
});

test.describe('vista general', () => {
  test('Esc y O la abren; un clic salta a la diapositiva', async ({ page }) => {
    await abrir(page);
    await page.keyboard.press('Escape');
    const panel = page.locator('#vista-general');
    await expect(panel).toBeVisible();
    await panel.locator('a[data-ir="3/2"]').click();
    await expect(panel).toBeHidden();
    await esperarDiapo(page, '3.2');
    await page.keyboard.press('o');
    await expect(panel).toBeVisible();
    await page.keyboard.press('o');
    await expect(panel).toBeHidden();
  });

  test('el botón visible abre la vista general y Esc la cierra', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Vista general/ }).click();
    await expect(page.locator('#vista-general')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#vista-general')).toBeHidden();
  });
});

test('el número y el color de fase reflejan la posición', async ({ page }) => {
  await abrir(page, '#/3/2');
  await expect(page.locator('[data-numero-id]')).toHaveText('3.2');
  await expect(page.locator('html')).toHaveAttribute('data-fase', '1');
  await expect(activa(page)).toHaveAttribute('data-fase', '1');
});

test('las flechas no navegan mientras el foco está en un campo de texto', async ({ page }) => {
  await abrir(page);
  await page.evaluate(() => {
    const i = document.createElement('input');
    i.id = 'campo-prueba';
    document.body.appendChild(i);
    i.focus();
  });
  await page.keyboard.press('ArrowDown');
  await esperarDiapo(page, '0.1');
});
