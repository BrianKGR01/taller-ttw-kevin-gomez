import { defineConfig, devices } from '@playwright/test';

// En local se usa Microsoft Edge (ya instalado en Windows) para no depender de
// la descarga de Chromium; en CI se usa el Chromium de Playwright. ADR-013.
const canal = process.env.CI ? undefined : (process.env.PW_CANAL ?? 'msedge');
const puerto = 4329;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 2,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${puerto}`, trace: 'retain-on-failure', channel: canal },
  webServer: {
    command: `pnpm build && pnpm exec astro preview --port ${puerto} --host localhost`,
    url: `http://localhost:${puerto}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'escritorio', use: { viewport: { width: 1366, height: 768 } } },
    { name: 'celular', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 740 }, channel: canal } },
  ],
});
