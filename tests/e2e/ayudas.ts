import { expect, type Page } from '@playwright/test';

export const PRES = '/?modo=presentacion';

/** Abre la presentación en modo presentación y espera a que el cliente esté listo. */
export async function abrir(page: Page, hash = '') {
  await page.goto(`${PRES}${hash}`);
  await expect(page.locator('html')).toHaveAttribute('data-listo', '');
}

export const activa = (page: Page) => page.locator('.diap[data-activa]');

export async function idActiva(page: Page) {
  return activa(page).getAttribute('data-id');
}

export async function esperarDiapo(page: Page, id: string) {
  await expect(activa(page)).toHaveAttribute('data-id', id);
}

/** Desliza con el dedo (eventos táctiles reales vía CDP; solo Chromium). */
export async function deslizar(page: Page, desde: [number, number], hasta: [number, number], pasos = 6) {
  const cdp = await page.context().newCDPSession(page);
  const punto = (x: number, y: number) => [{ x, y, id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: punto(...desde) });
  for (let i = 1; i <= pasos; i++) {
    const x = desde[0] + ((hasta[0] - desde[0]) * i) / pasos;
    const y = desde[1] + ((hasta[1] - desde[1]) * i) / pasos;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: punto(x, y) });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}
