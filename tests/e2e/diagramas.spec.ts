import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { abrir, activa, esperarDiapo } from './ayudas';

/** El texto que se copia y se descarga es el mismo archivo que dibuja el árbol. */
const ESTRUCTURA = readFileSync('contenido-descargas/estructura-de-carpetas.txt', 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '');

/** Cuántos avances (pasos) tiene cada diapositiva con diagrama. */
const PASOS: Record<string, number> = { '6.2': 3, '6.4': 6, '8.3': 3 };

async function llenarPasos(page: import('@playwright/test').Page, id: string) {
  for (let i = 0; i < (PASOS[id] ?? 0); i++) await page.keyboard.press('ArrowDown');
  await esperarDiapo(page, id);
}

test.describe('diagramas en código: 5.10 carpetas, 6.2/6.4 hitos, 8.3 CI/CD', () => {
  test('5.10 dibuja el árbol completo, con la relación CLAUDE.md → AGENTS.md resaltada', async ({ page }) => {
    await abrir(page, '#/5/10');
    await esperarDiapo(page, '5.10');
    const filas = page.locator('.diap[data-activa] .arbol__fila');
    await expect(filas).toHaveCount(ESTRUCTURA.split('\n').length);
    await expect(filas.first()).toContainText('mi-proyecto/');
    await expect(page.locator('.diap[data-activa] .arbol__fila[data-par="destino"]')).toContainText('AGENTS.md');
    await expect(page.locator('.diap[data-activa] .arbol__fila[data-par="origen"]')).toContainText('CLAUDE.md');
    // Los comentarios del archivo salen como anotaciones.
    await expect(page.locator('.diap[data-activa] .arbol')).toContainText('reglas para todos los agentes');
    await expect(page.locator('.diap[data-activa] .arbol')).toContainText('un archivo por módulo (ADR)');
    await expect(page.locator('.diap[data-activa] .subtitulo')).toHaveText('Para mostrar o regalar');
  });

  test('5.10 «Copiar estructura» copia el archivo completo y «Descargar» lo sirve', async ({ page, context, request }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await abrir(page, '#/5/10');
    await esperarDiapo(page, '5.10');
    const boton = page.locator('.diap[data-activa] [data-copiar]');
    await expect(boton).toContainText('Copiar estructura');
    await boton.click();
    await expect(boton).toHaveAttribute('data-estado', 'copiado');
    expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n')).toBe(ESTRUCTURA);

    const descarga = page.locator('.diap[data-activa] a.descarga');
    await expect(descarga).toHaveAttribute('href', '/descargas/estructura-de-carpetas.txt');
    await expect(descarga).toHaveAttribute('download', 'estructura-de-carpetas.txt');
    const r = await request.get('/descargas/estructura-de-carpetas.txt');
    expect(r.ok()).toBe(true);
    expect((await r.text()).replace(/\r\n/g, '\n').trim()).toBe(ESTRUCTURA);
  });

  test('6.2 sincroniza el diagrama de la rebanada con los pasos de la lista', async ({ page }) => {
    await abrir(page, '#/6/2');
    await esperarDiapo(page, '6.2');
    const rejilla = page.locator('.diap[data-activa] .rebanada__rejilla');
    await expect(rejilla.locator('.rebanada__celda')).toHaveCount(20); // 4 capas × 5 hitos
    await expect(page.locator('.diap[data-activa] .rebanada__capa').first()).toHaveText('Pantalla');
    await expect(page.locator('.diap[data-activa] .rebanada__marco--hecho[data-visto]')).toHaveCount(0);
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.diap[data-activa] .rebanada__marco--hecho[data-visto]')).toHaveCount(1);
    await expect(page.locator('.diap[data-activa] .rebanada__criterio[data-visto]')).toContainText('Criterio de terminado');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.diap[data-activa] .rebanada__marco--siguiente[data-visto]')).toHaveCount(1);
  });

  test('6.4 revela un hito por avance, luego el ciclo; el hito 2 está en curso', async ({ page }) => {
    await abrir(page, '#/6/4');
    await esperarDiapo(page, '6.4');
    const vistos = page.locator('.diap[data-activa] .ruta__hito[data-visto]');
    await expect(page.locator('.diap[data-activa] .ruta__hito')).toHaveCount(5);
    await expect(vistos).toHaveCount(0);
    for (let i = 1; i <= 5; i++) {
      await page.keyboard.press('ArrowDown');
      await expect(vistos).toHaveCount(i);
    }
    await expect(page.locator('.diap[data-activa] .vuelta[data-visto]')).toHaveCount(0);
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.diap[data-activa] .vuelta[data-visto]')).toHaveCount(1);
    const hito2 = page.locator('.diap[data-activa] .ruta__hito').nth(1);
    await expect(hito2).toHaveAttribute('aria-current', 'step');
    await expect(hito2).toContainText('Alta de habitaciones y tarifas');
    await expect(hito2).toContainText('en curso');
    await expect(page.locator('.diap[data-activa] .ruta__hito').first()).toContainText('probado');
    await esperarDiapo(page, '6.4');
  });

  test('6.4 en lectura muestra el roadmap completo y la versión copiable (✅/🔄) con botón Copiar', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/?modo=lectura#/6/4');
    await expect(page.locator('html')).toHaveAttribute('data-listo', '');
    const diap = page.locator('#d-6-4');
    await diap.scrollIntoViewIfNeeded();
    await expect(diap.locator('.ruta__hito')).toHaveCount(5);
    await expect(diap.locator('.vuelta')).toBeVisible();
    const boton = diap.locator('[data-copiar]');
    await boton.click();
    await expect(boton).toHaveAttribute('data-estado', 'copiado');
    const texto = await page.evaluate(() => navigator.clipboard.readText());
    expect(texto).toContain('Hito 1 · Registro y login de recepcionistas');
    expect(texto).toContain('✅ probado');
    expect(texto).toContain('🔄 en curso');
    expect(texto).toContain('Hito 5 · Reportes de ocupación');
  });

  test('8.3 dibuja el pipeline y la notificación llega al celular en el paso 2', async ({ page }) => {
    await abrir(page, '#/8/3');
    await esperarDiapo(page, '8.3');
    const etapas = page.locator('.diap[data-activa] .pipeline__etapa');
    await expect(etapas).toHaveCount(4);
    await expect(etapas.nth(0)).toContainText('Hito terminado');
    await expect(etapas.nth(3)).toContainText('Notificación al celular con el enlace');
    const notif = page.locator('.diap[data-activa] .notif');
    await expect(notif).not.toHaveAttribute('data-visto', '');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(notif).toHaveAttribute('data-visto', '');
    await expect(notif).toContainText('Nueva versión lista para probar');
    await expect(notif).toContainText('v0.3.0');
    await expect(notif).toContainText('Reservas');
    await expect(notif).toContainText('prueba.hotel.example');
    // El contenido del celular también está como texto accesible, sin marcas de terceros.
    await expect(page.locator('.diap[data-activa] figure.celular')).toHaveAttribute('aria-label', /Nueva versión lista para probar/);
  });

  for (const id of ['5.10', '6.2', '6.4', '8.3']) {
    test(`${id} cabe en la pantalla sin scroll interno ni desborde horizontal`, async ({ page }, info) => {
      test.skip(info.project.name !== 'escritorio', 'la medida de referencia es 1366×768');
      const [b, n] = id.split('.');
      await abrir(page, `#/${b}/${n}`);
      await esperarDiapo(page, id);
      await llenarPasos(page, id);
      await page.waitForTimeout(1500);
      const m = await activa(page).evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight, sw: el.scrollWidth, cw: el.clientWidth }));
      expect(m.sh).toBeLessThanOrEqual(m.ch + 1);
      expect(m.sw).toBeLessThanOrEqual(m.cw + 1);
    });
  }

  for (const id of ['5.10', '6.2', '6.4', '8.3']) {
    test(`${id} en lectura no desborda horizontalmente`, async ({ page }) => {
      const [b, n] = id.split('.');
      await page.goto(`/?modo=lectura#/${b}/${n}`);
      await expect(page.locator('html')).toHaveAttribute('data-listo', '');
      const diap = page.locator(`#d-${b}-${n}`);
      await diap.scrollIntoViewIfNeeded();
      const m = await page.evaluate((sel) => {
        const el = document.querySelector<HTMLElement>(sel)!;
        const r = el.getBoundingClientRect();
        const mal = [...el.querySelectorAll<HTMLElement>('*')].filter((x) => x.getBoundingClientRect().right > r.right + 1 && getComputedStyle(x).position !== 'fixed' && x.getBoundingClientRect().width > 0);
        return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, mal: mal.slice(0, 3).map((x) => x.className) };
      }, `#d-${b}-${n}`);
      expect(m.sw, `elementos que sobresalen: ${m.mal.join(', ')}`).toBeLessThanOrEqual(m.cw);
    });
  }
});
