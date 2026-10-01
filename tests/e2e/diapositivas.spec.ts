import { expect, test } from '@playwright/test';

/**
 * Cada defecto encontrado mirando la pantalla cierra con la verificación que lo
 * habría atrapado. Esta es la de "no entra": toda diapositiva debe verse
 * completa, con todos sus pasos revelados, en 1366×768 (el caso de diseño del
 * proyector) sin scroll interno ni scroll horizontal. Si algo no entra, se
 * divide la diapositiva; nunca se achica la letra.
 */
test.describe('legibilidad proyectada (1366×768)', () => {
  test.skip(({ isMobile }) => isMobile, 'el caso de proyección es de escritorio');
  test.use({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });

  test('ninguna diapositiva desborda con todos sus pasos revelados', async ({ page }) => {
    test.setTimeout(240_000);
    await page.goto('/?modo=presentacion');
    await expect(page.locator('html')).toHaveAttribute('data-listo', '');
    const diapos = await page.$$eval('.diap', (els) =>
      els.map((e) => ({ id: (e as HTMLElement).dataset.id!, b: (e as HTMLElement).dataset.bloque!, n: (e as HTMLElement).dataset.n!, pasos: Number((e as HTMLElement).dataset.pasos) })),
    );
    expect(diapos.length).toBeGreaterThan(40);

    const fallos: string[] = [];
    for (const d of diapos) {
      await page.evaluate((h) => (location.hash = h), `#/${d.b}/${d.n}`);
      await page.waitForSelector(`.diap[data-activa][data-id="${d.id}"]`);
      for (let i = 0; i < d.pasos; i++) await page.keyboard.press('Space');
      // Los documentos y diagramas recorren pasos propios: se esperan a que asienten.
      await page.waitForTimeout(250);
      const m = await page.evaluate((id) => {
        const el = document.querySelector<HTMLElement>(`.diap[data-id="${id}"]`)!;
        return {
          sobra: el.scrollHeight - el.clientHeight,
          horizontal: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      }, d.id);
      if (m.sobra > 2) fallos.push(`${d.id} sobra ${m.sobra}px en vertical`);
      if (m.horizontal > 0) fallos.push(`${d.id} tiene scroll horizontal`);
    }
    expect(fallos, fallos.join('\n')).toEqual([]);
  });
});
