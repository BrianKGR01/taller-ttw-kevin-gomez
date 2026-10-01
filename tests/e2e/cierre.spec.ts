import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import jsQR from 'jsqr';
import sharp from 'sharp';
import { parsearContacto } from '../../src/lib/contacto';
import { abrir, esperarDiapo } from './ayudas';

const contacto = parsearContacto(readFileSync(join(process.cwd(), 'assets', 'contacto.md'), 'utf8'));
const config = readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf8');
const SITIO = new URL('/', /process\.env\.SITE_URL \?\? '([^']+)'/.exec(config)![1]).href;

/** Presentación en escritorio; lectura en celular (donde la presentación no es el modo natural). */
async function ir(page: Page, isMobile: boolean, id: string) {
  const [b, n] = id.split('.');
  if (isMobile) {
    await page.goto(`/?modo=lectura#/${b}/${n}`);
    await expect(page.locator('html')).toHaveAttribute('data-listo', '');
    await page.locator(`#d-${b}-${n}`).scrollIntoViewIfNeeded();
  } else {
    await abrir(page, `#/${b}/${n}`);
    await esperarDiapo(page, id);
  }
  return page.locator(`#d-${b}-${n}`);
}

async function decodificarQR(page: Page) {
  const png = await page.locator('.diap:visible .qr-placa').first().screenshot();
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return jsQR(new Uint8ClampedArray(data), info.width, info.height, { inversionAttempts: 'dontInvert' })?.data;
}

test.describe('diapositiva 11.2 · Llévatelo', () => {
  test('muestra el QR, la URL en texto y los enlaces de contacto con su href', async ({ page, isMobile }) => {
    const diap = await ir(page, isMobile, '11.2');

    const qr = diap.locator('svg.qr');
    await expect(qr).toBeVisible();
    await expect(qr).toHaveAttribute('role', 'img');
    await expect(qr).toHaveAttribute('aria-label', /presentación/i);

    const url = diap.locator('.qr__url');
    await expect(url).toBeVisible();
    await expect(url).toHaveAttribute('href', SITIO);
    await expect(url).toContainText(new URL(SITIO).host);

    for (const red of ['instagram', 'whatsapp', 'linkedin'] as const) {
      const dato = contacto.redes[red];
      expect(dato, `assets/contacto.md debe tener ${red}`).not.toBeNull();
      const enlace = diap.locator(`a[data-contacto="${red}"]`);
      await expect(enlace).toBeVisible();
      await expect(enlace).toHaveAttribute('href', dato!.url);
      await expect(enlace).toHaveAttribute('target', '_blank');
      await expect(enlace).toHaveAttribute('rel', /noopener/);
      await expect(enlace).toContainText(dato!.texto);
      const caja = await enlace.boundingBox();
      expect(caja!.height).toBeGreaterThanOrEqual(43.5);
    }
    await expect(diap.locator('[data-falta]')).toHaveCount(0);

    // GDG Santa Cruz: logo oficial del modo actual y el texto de invitación, sin enlace inventado.
    await expect(diap.locator('.cierre__comunidad .logo:visible')).toHaveCount(1);
    await expect(diap.locator('.cierre__comunidad')).toContainText(/GDG Santa Cruz/);
    await expect(diap.locator('.cierre__comunidad')).toContainText(/únete a la comunidad/);
    await expect(diap.locator('.cierre__comunidad a')).toHaveCount(0);
  });

  for (const esquema of ['dark', 'light'] as const) {
    test(`el QR que se ve en pantalla se decodifica a la URL de producción (${esquema})`, async ({ page, isMobile }) => {
      await page.emulateMedia({ colorScheme: esquema });
      await ir(page, isMobile, '11.2');
      await page.waitForTimeout(1200); // termina la entrada escalonada
      expect(await decodificarQR(page)).toBe(SITIO);
    });
  }

  test('entra completa en la pantalla, sin scroll interno ni horizontal', async ({ page, isMobile }) => {
    const diap = await ir(page, isMobile, '11.2');
    await page.waitForTimeout(1200);
    const m = await diap.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth, sh: el.scrollHeight, ch: el.clientHeight }));
    expect(m.sw).toBeLessThanOrEqual(m.cw);
    if (!isMobile) expect(m.sh).toBeLessThanOrEqual(m.ch);
    const doc = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(doc.sw).toBeLessThanOrEqual(doc.cw);
  });

  test('la foto del expositor es decorativa y no recibe el puntero', async ({ page, isMobile }) => {
    const diap = await ir(page, isMobile, '11.2');
    const foto = diap.locator('.cierre__foto');
    await expect(foto).toHaveAttribute('aria-hidden', 'true');
    await expect(foto.locator('img')).toHaveAttribute('alt', '');
    expect(await foto.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none');
  });

  test('con movimiento reducido no hay animación decorativa en la foto ni en el QR', async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const diap = await ir(page, isMobile, '11.2');
    for (const sel of ['.cierre__foto', '.cierre__foto img', '.qr-placa']) {
      const nombre = await diap.locator(sel).first().evaluate((el) => getComputedStyle(el).animationName);
      expect(nombre, sel).toBe('none');
    }
    const velo = await diap.locator('.cierre__foto').evaluate((el) => getComputedStyle(el, '::after').animationName);
    expect(velo).toBe('none');
  });
});

test.describe('tarjetas de enlace', () => {
  test('10.1 revela los cuatro puntos de a uno y lleva a los dos sitios de Drinks on Chain', async ({ page, isMobile }) => {
    const diap = await ir(page, isMobile, '10.1');
    const tarjetas = diap.locator('a.tarjeta');
    await expect(tarjetas).toHaveCount(2);
    await expect(tarjetas.nth(0)).toHaveAttribute('href', 'https://www.drinksonchain.com');
    await expect(tarjetas.nth(1)).toHaveAttribute('href', 'https://bodegas.drinksonchain.com');
    for (const t of await tarjetas.all()) {
      await expect(t).toHaveAttribute('target', '_blank');
      await expect(t).toHaveAttribute('rel', /noopener/);
      await expect(t.locator('.tarjeta__flecha')).toHaveText('→');
      await expect(t.locator('.tarjeta__titulo')).not.toBeEmpty();
      await expect(t.locator('.tarjeta__dominio')).not.toBeEmpty();
    }
    if (isMobile) return;
    // Revelado por pasos con el teclado (solo en presentación).
    const vistos = diap.locator('[data-paso][data-visto]');
    await expect(diap.locator('[data-paso]')).toHaveCount(4);
    await expect(vistos).toHaveCount(0);
    await page.keyboard.press('Space');
    await expect(vistos).toHaveCount(1);
    for (let i = 0; i < 3; i++) await page.keyboard.press('Space');
    await expect(vistos).toHaveCount(4);
    await esperarDiapo(page, '10.1');
  });

  test('las imágenes tienen dimensiones declaradas (cero saltos de layout) y cargan', async ({ page, isMobile }) => {
    const diap = await ir(page, isMobile, '10.1');
    const imgs = diap.locator('a.tarjeta img');
    await expect(imgs).toHaveCount(2);
    for (const img of await imgs.all()) {
      await expect(img).toHaveAttribute('width', '1200');
      await expect(img).toHaveAttribute('height', '630');
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
  });

  test('el hover cambia borde y resplandor, nunca el tamaño', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover solo con puntero');
    await ir(page, isMobile, '11.1');
    const tarjeta = page.locator('#d-11-1 a.tarjeta').first();
    await page.waitForTimeout(1200);
    const antes = await tarjeta.boundingBox();
    const bordeAntes = await tarjeta.evaluate((el) => getComputedStyle(el).borderColor);
    await tarjeta.hover();
    await page.waitForTimeout(400);
    const despues = await tarjeta.boundingBox();
    expect(despues!.width).toBeCloseTo(antes!.width, 1);
    expect(despues!.height).toBeCloseTo(antes!.height, 1);
    expect(await tarjeta.evaluate((el) => getComputedStyle(el).borderColor)).not.toBe(bordeAntes);
  });

  test('11.1 lleva a devbro.xyz y a drinksonchain.com', async ({ page, isMobile }) => {
    const diap = await ir(page, isMobile, '11.1');
    const hrefs = await diap.locator('a.tarjeta').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    expect(hrefs).toEqual(['https://www.devbro.xyz', 'https://www.drinksonchain.com']);
  });

  test('10.1 y 11.1 entran completas en la pantalla', async ({ page, isMobile }) => {
    test.skip(isMobile, 'en celular se lee en scroll continuo');
    for (const id of ['10.1', '11.1']) {
      const diap = await ir(page, isMobile, id);
      await page.waitForTimeout(1200);
      const m = await diap.evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight, sw: el.scrollWidth, cw: el.clientWidth }));
      expect(m.sh, `${id} alto`).toBeLessThanOrEqual(m.ch);
      expect(m.sw, `${id} ancho`).toBeLessThanOrEqual(m.cw);
    }
  });
});

test.describe('metadatos para compartir', () => {
  test('la portada declara Open Graph, Twitter, canónica y sitemap con la URL de producción', async ({ page }) => {
    await page.goto('/');
    const meta = (sel: string) => page.locator(sel).first().getAttribute('content');
    const imagen = new URL('/og.jpg', SITIO).href;
    expect(await meta('meta[property="og:image"]')).toBe(imagen);
    expect(await meta('meta[property="og:image:type"]')).toBe('image/jpeg');
    expect(await meta('meta[property="og:image:width"]')).toBe('1200');
    expect(await meta('meta[property="og:image:height"]')).toBe('630');
    expect(await meta('meta[property="og:url"]')).toBe(SITIO);
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(await meta('meta[name="twitter:image"]')).toBe(imagen);
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(SITIO);
    expect(await page.locator('link[rel="sitemap"]').getAttribute('href')).toBe('/sitemap.xml');
  });

  test('robots.txt, sitemap.xml y og.jpg se sirven', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain(`Sitemap: ${new URL('/sitemap.xml', SITIO).href}`);
    const mapa = await request.get('/sitemap.xml');
    expect(mapa.ok()).toBe(true);
    expect(await mapa.text()).toContain(`<loc>${SITIO}</loc>`);
    const og = await request.get('/og.jpg');
    expect(og.ok()).toBe(true);
    expect(og.headers()['content-type']).toMatch(/image\/jpeg/);
  });
});
